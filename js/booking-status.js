// Polls the booking API until the PayHere notify callback has confirmed the booking.
;(() => {
  const local = ["localhost", "127.0.0.1"].includes(location.hostname)
  const API = local ? "http://localhost:8092" : (document.querySelector('meta[name="emm-api-base"]')?.content.replace(/\/$/, "") ?? "")
  const id = new URLSearchParams(location.search).get("id")
  const h1 = document.querySelector("h1"), msg = document.getElementById("bk-msg")
  const show = (t, m) => { h1.textContent = t; msg.textContent = m }
  if (!id) return show("Booking not found", "We couldn't find a booking to check. Please contact us.")
  let tries = 0
  const poll = async () => {
    try {
      const r = await fetch(`${API}/api/bookings/${encodeURIComponent(id)}`)
      const b = await r.json()
      if (b.status === "paid") {
        const when = new Date(b.start).toLocaleString("en-GB", { timeZone: "Asia/Colombo", dateStyle: "full", timeStyle: "short" })
        return show("Booking confirmed", `Your session is booked for ${when} (Sri Lanka time). A confirmation email is on its way.`)
      }
      if (b.status === "conflict") return show("Time no longer available", "That time was taken while your payment was processing. We'll contact you to rebook or refund.")
      if (b.status === "failed") return show("Payment failed", "Your payment did not go through. Please try booking again.")
    } catch {}
    if (++tries < 20) setTimeout(poll, 3000)
    else show("Still confirming", "Payment confirmation is taking longer than usual. If you were charged, we'll email you shortly, or contact us.")
  }
  poll()
})()
