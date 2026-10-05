// Online booking: slots from Google Calendar, payment via PayHere (see booking-api/).
;(() => {
  const API = "" // site and API share an origin (same container)
  const $ = (id) => document.getElementById(id)
  const form = $("booking-form-v2")
  if (!form) return

  let catalog = [], pro = null, slot = null

  const money = (n) => `LKR ${Number(n).toLocaleString("en-US")}`
  const setError = (m) => { $("bk-error").textContent = m || "" }

  async function api(path, opts) {
    const r = await fetch(API + path, opts)
    const body = await r.json().catch(() => ({}))
    if (!r.ok) throw Object.assign(new Error(body.error || "Something went wrong"), { status: r.status })
    return body
  }

  function currentType() {
    return pro?.sessions.find((s) => s.id === $("bk-type").value)
  }

  function showPrice() {
    const t = currentType()
    $("bk-price").textContent = t ? `${money(t.priceLKR)} · ${t.minutes} minutes` : ""
  }

  async function loadSlots() {
    slot = null
    const box = $("bk-slots"), date = $("bk-date").value
    if (!date || !currentType()) return
    box.innerHTML = '<p class="bk-hint">Checking availability…</p>'
    try {
      const { slots } = await api(`/api/slots?pro=${pro.id}&type=${$("bk-type").value}&date=${date}`)
      if (!slots.length) { box.innerHTML = '<p class="bk-hint">No times available that day. Try another date.</p>'; return }
      box.innerHTML = ""
      for (const iso of slots) {
        const b = document.createElement("button")
        b.type = "button"; b.setAttribute("role", "radio"); b.setAttribute("aria-checked", "false")
        b.textContent = new Date(iso).toLocaleTimeString("en-GB", { timeZone: "Asia/Colombo", hour: "2-digit", minute: "2-digit" })
        b.addEventListener("click", () => {
          box.querySelectorAll("button").forEach((x) => x.setAttribute("aria-checked", "false"))
          b.setAttribute("aria-checked", "true"); slot = iso
        })
        box.appendChild(b)
      }
    } catch {
      box.innerHTML = '<p class="bk-hint">Could not load times. Please try again shortly.</p>'
    }
  }

  window.openBookingModal = async function (proId) {
    setError("")
    try { if (!catalog.length) catalog = await api("/api/catalog") }
    catch { alert("Online booking is temporarily unavailable. Please contact us."); return }
    pro = catalog.find((p) => p.id === proId)
    if (!pro) return
    $("modal-title").textContent = `Book a session with ${pro.name}`
    $("bk-type").innerHTML = pro.sessions.map((s) => `<option value="${s.id}">${s.label}</option>`).join("")
    form.reset(); $("bk-slots").innerHTML = '<p class="bk-hint">Choose a date to see available times.</p>'
    const tomorrow = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Colombo" })
    $("bk-date").min = tomorrow
    slot = null; showPrice()
    const m = $("booking-modal"); m.style.display = "block"; document.body.style.overflow = "hidden"
    $("bk-type").focus()
  }

  // Returning from PayHere via Back restores the page from cache with the button still disabled
  window.addEventListener("pageshow", (e) => { if (e.persisted) $("bk-submit").disabled = false })

  $("bk-type").addEventListener("change", () => { showPrice(); loadSlots() })
  $("bk-date").addEventListener("change", loadSlots)

  form.addEventListener("submit", async (e) => {
    e.preventDefault(); setError("")
    if (!slot) return setError("Please choose a date and time.")
    if (!form.checkValidity()) return form.reportValidity()
    const btn = $("bk-submit"); btn.disabled = true
    try {
      const r = await api("/api/bookings", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pro: pro.id, type: $("bk-type").value, start: slot,
          name: $("client-name").value.trim(), email: $("client-email").value.trim(),
          phone: $("client-phone").value.trim(), notes: $("session-notes").value.trim(),
        }),
      })
      const pay = $("bk-payhere"); pay.action = r.action; pay.innerHTML = ""
      for (const [k, v] of Object.entries(r.fields)) {
        const i = document.createElement("input"); i.type = "hidden"; i.name = k; i.value = v; pay.appendChild(i)
      }
      pay.submit()
    } catch (err) {
      btn.disabled = false
      setError(err.message)
      if (err.status === 409) loadSlots()
    }
  })
})()
