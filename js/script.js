// Enhanced JavaScript for Every Mind Matters Website

// Global Variables
let currentStep = 1
let currentService = ""
const totalSteps = 3

// DOM Elements
const mobileMenu = document.getElementById("mobile-menu")
const navMenu = document.getElementById("nav-menu")
const modal = document.getElementById("booking-modal")
const modalTitle = document.getElementById("modal-title")

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  initializeWebsite()
  setupEventListeners()
  setupFormValidation()
  setupAnimations()
  setupAccessibility()
  setupIntersectionObserver()
  setupAnalyticsTracking()
  handleAnchorScrolling()
})

// Website Initialization
function initializeWebsite() {
  // Set minimum date for booking to today
  const dateInput = document.getElementById("preferred-date")
  if (dateInput) {
    const today = new Date().toISOString().split("T")[0]
    dateInput.setAttribute("min", today)
  }

  // Initialize navbar scroll effect
  handleNavbarScroll()

  // Setup intersection observer for animations
  setupIntersectionObserver()
}

// Event Listeners Setup
function setupEventListeners() {
  // Mobile Navigation
  if (mobileMenu && navMenu) {
    mobileMenu.addEventListener("click", toggleMobileMenu)

    // Close mobile menu when clicking on regular nav links (not dropdown toggles)
    document.querySelectorAll(".nav-link").forEach((link) => {
      // Only close mobile menu if it's not a dropdown toggle
      if (!link.classList.contains("dropdown-toggle")) {
        link.addEventListener("click", closeMobileMenu)
      }
    })
  }

  // Navbar scroll effect
  window.addEventListener("scroll", handleNavbarScroll)

  // Modal events
  window.addEventListener("click", handleModalClick)
  document.addEventListener("keydown", handleKeyboardEvents)

  // Form submissions
  const contactForm = document.getElementById("contact-form")
  const bookingForm = document.getElementById("booking-form")

  if (contactForm) {
    contactForm.addEventListener("submit", handleContactFormSubmit)
  }

  if (bookingForm) {
    bookingForm.addEventListener("submit", handleBookingFormSubmit)

    // Update summary when form fields change
    const dateField = document.getElementById("preferred-date")
    const timeField = document.getElementById("preferred-time")

    if (dateField) dateField.addEventListener("change", updateBookingSummary)
    if (timeField) timeField.addEventListener("change", updateBookingSummary)
  }

  // Track analytics events
  setupAnalyticsTracking()
  
  // Setup dropdown navigation after other event listeners
  setupDropdownNavigation()
}

// Handle Anchor Scrolling
function handleAnchorScrolling() {
  // Handle hash in URL on page load
  if (window.location.hash) {
    setTimeout(() => {
      scrollToAnchor(window.location.hash.substring(1))
    }, 100)
  }

  // Handle anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault()
      const targetId = this.getAttribute("href").substring(1)
      scrollToAnchor(targetId)

      // Update URL without triggering scroll
      history.pushState(null, null, `#${targetId}`)
    })
  })

  // Handle dropdown anchor links
  document.querySelectorAll('.dropdown-item[href*="#"]').forEach((link) => {
    link.addEventListener("click", function (e) {
      const href = this.getAttribute("href")
      if (href.includes("#")) {
        const [page, anchor] = href.split("#")
        if (page === "services.html" && window.location.pathname.includes("services")) {
          e.preventDefault()
          scrollToAnchor(anchor)
          history.pushState(null, null, `#${anchor}`)
        }
      }
    })
  })
}

// Scroll to Anchor with Navbar Offset
function scrollToAnchor(targetId) {
  const targetElement = document.getElementById(targetId)
  if (targetElement) {
    const navbar = document.querySelector(".navbar")
    const navbarHeight = navbar ? navbar.offsetHeight : 80
    const elementPosition = targetElement.offsetTop - navbarHeight - 20

    window.scrollTo({
      top: elementPosition,
      behavior: "smooth",
    })

    // Add highlight effect
    targetElement.style.transition = "box-shadow 0.3s ease"
    targetElement.style.boxShadow = "0 0 20px rgba(14, 165, 233, 0.3)"

    setTimeout(() => {
      targetElement.style.boxShadow = ""
    }, 2000)

    // Track analytics
    trackEvent("Navigation", "Anchor Scroll", targetId)
  }
}

// Mobile Navigation Functions
function toggleMobileMenu() {
  mobileMenu.classList.toggle("active")
  navMenu.classList.toggle("active")

  // Prevent body scroll when menu is open
  if (navMenu.classList.contains("active")) {
    document.body.style.overflow = "hidden"
  } else {
    document.body.style.overflow = "auto"
  }
}

function closeMobileMenu() {
  mobileMenu.classList.remove("active")
  navMenu.classList.remove("active")
  document.body.style.overflow = "auto"
}

// Navbar Scroll Effect
function handleNavbarScroll() {
  const navbar = document.querySelector(".navbar")
  if (!navbar) return

  if (window.scrollY > 50) {
    navbar.style.background = "rgba(255, 255, 255, 0.95)"
    navbar.style.backdropFilter = "blur(20px)"
    navbar.style.borderBottom = "1px solid var(--primary-200)"
  } else {
    navbar.style.background = "rgba(255, 255, 255, 0.95)"
    navbar.style.backdropFilter = "blur(20px)"
    navbar.style.borderBottom = "1px solid var(--primary-100)"
  }
}

// Smooth Scrolling
function scrollToSection(sectionId) {
  scrollToAnchor(sectionId)
  closeMobileMenu()
}

// Dropdown Navigation Functions
function setupDropdownNavigation() {
  const dropdowns = document.querySelectorAll(".nav-dropdown")

  dropdowns.forEach((dropdown) => {
    const toggle = dropdown.querySelector(".dropdown-toggle")
    const menu = dropdown.querySelector(".dropdown-menu")

    // Remove any existing event listeners to prevent duplicates
    const newToggle = toggle.cloneNode(true)
    toggle.parentNode.replaceChild(newToggle, toggle)
    
    // Handle mobile dropdown toggle
    if (window.innerWidth <= 768) {
      // Use capture phase to prevent other event listeners from running
      newToggle.addEventListener("click", (e) => {
        e.preventDefault()
        e.stopPropagation()
        e.stopImmediatePropagation()
        
        // Close other dropdowns first
        dropdowns.forEach((otherDropdown) => {
          if (otherDropdown !== dropdown) {
            const otherMenu = otherDropdown.querySelector(".dropdown-menu")
            otherMenu.style.display = "none"
            otherDropdown.classList.remove("active")
          }
        })
        
        // Toggle current dropdown
        const isVisible = dropdown.classList.contains("active")
        if (isVisible) {
          dropdown.classList.remove("active")
          menu.style.display = "none"
        } else {
          dropdown.classList.add("active")
          menu.style.display = "block"
        }
      }, true) // Use capture phase
    } else {
      // Desktop behavior - allow normal navigation
      newToggle.addEventListener("click", (e) => {
        // Allow normal link behavior on desktop
        // The hover CSS will handle showing the dropdown
      })
    }

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (!dropdown.contains(e.target)) {
        if (window.innerWidth <= 768) {
          menu.style.display = "none"
          dropdown.classList.remove("active")
        }
      }
    })

    // Handle dropdown item clicks
    const dropdownItems = menu.querySelectorAll(".dropdown-item")
    dropdownItems.forEach((item) => {
      item.addEventListener("click", function () {
        // Close mobile menu if open
        closeMobileMenu()
        
        // Close dropdown menu
        menu.style.display = "none"
        dropdown.classList.remove("active")

        // Track analytics
        trackEvent("Navigation", "Dropdown Click", this.textContent.trim())
      })
    })
  })
}

// Modal Functions
function openBookingModal(service) {
  currentService = service
  currentStep = 1

  const titles = {
    "in-person": "Book In-Person Session",
    online: "Book Online Session",
    coaching: "Book Life Coaching Session",
    reiki: "Book Reiki Healing Session",
    assessment: "Schedule Psychological Assessment",
    therapy: "Book Therapy Session",
  }

  if (modalTitle) {
    modalTitle.textContent = titles[service] || "Book a Session"
  }

  // Reset form and show first step
  resetBookingForm()
  showStep(1)
  updateBookingSummary()

  if (modal) {
    modal.style.display = "block"
    document.body.style.overflow = "hidden"

    // Focus management for accessibility
    const firstInput = modal.querySelector("input, select, textarea")
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 100)
    }
  }

  trackEvent("Modal", "Open", service)
}

function closeModal() {
  if (modal) {
    modal.style.display = "none"
    document.body.style.overflow = "auto"
    resetBookingForm()
    trackEvent("Modal", "Close", currentService)
  }
}

function handleModalClick(e) {
  if (e.target === modal) {
    closeModal()
  }
}

// Booking Form Step Management
function nextStep() {
  if (validateCurrentStep()) {
    if (currentStep < totalSteps) {
      currentStep++
      showStep(currentStep)
      updateBookingSummary()
    }
  }
}

function prevStep() {
  if (currentStep > 1) {
    currentStep--
    showStep(currentStep)
  }
}

function showStep(step) {
  // Hide all steps
  document.querySelectorAll(".form-step").forEach((stepEl) => {
    stepEl.classList.remove("active")
  })

  // Show current step
  const currentStepEl = document.getElementById(`step-${step}`)
  if (currentStepEl) {
    currentStepEl.classList.add("active")
  }

  // Update progress indicator if exists
  updateProgressIndicator(step)
}

function validateCurrentStep() {
  const currentStepEl = document.getElementById(`step-${currentStep}`)
  if (!currentStepEl) return false

  const requiredFields = currentStepEl.querySelectorAll("[required]")
  let isValid = true

  requiredFields.forEach((field) => {
    if (!field.value.trim()) {
      showFieldError(field, "This field is required")
      isValid = false
    } else {
      clearFieldError(field)

      // Additional validation
      if (field.type === "email" && !validateEmail(field.value)) {
        showFieldError(field, "Please enter a valid email address")
        isValid = false
      }

      if (field.type === "tel" && !validatePhone(field.value)) {
        showFieldError(field, "Please enter a valid phone number")
        isValid = false
      }
    }
  })

  return isValid
}

function resetBookingForm() {
  const form = document.getElementById("booking-form")
  if (form) {
    form.reset()
    clearAllFieldErrors()
    currentStep = 1
    showStep(1)
  }
}

function updateBookingSummary() {
  const serviceNames = {
    "in-person": "In-Person Therapy",
    online: "Online Therapy",
    coaching: "Life Coaching",
    reiki: "Reiki Healing",
    assessment: "Psychological Assessment",
    therapy: "Individual Therapy",
  }

  const summaryService = document.getElementById("summary-service")
  const summaryDate = document.getElementById("summary-date")
  const summaryTime = document.getElementById("summary-time")

  if (summaryService) {
    summaryService.textContent = serviceNames[currentService] || "Selected Service"
  }

  const dateField = document.getElementById("preferred-date")
  const timeField = document.getElementById("preferred-time")

  if (summaryDate && dateField && dateField.value) {
    const date = new Date(dateField.value)
    summaryDate.textContent = date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  } else if (summaryDate) {
    summaryDate.textContent = "Not selected"
  }

  if (summaryTime && timeField && timeField.value) {
    const time = timeField.value
    const [hours, minutes] = time.split(":")
    const timeObj = new Date()
    timeObj.setHours(Number.parseInt(hours), Number.parseInt(minutes))
    summaryTime.textContent = timeObj.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  } else if (summaryTime) {
    summaryTime.textContent = "Not selected"
  }
}

function updateProgressIndicator(step) {
  // This function can be enhanced to show a visual progress indicator
}

// Form Validation
function setupFormValidation() {
  // Real-time email validation
  document.querySelectorAll('input[type="email"]').forEach((input) => {
    input.addEventListener("blur", function () {
      if (this.value && !validateEmail(this.value)) {
        showFieldError(this, "Please enter a valid email address")
      } else {
        clearFieldError(this)
      }
    })
  })

  // Real-time phone validation
  document.querySelectorAll('input[type="tel"]').forEach((input) => {
    input.addEventListener("blur", function () {
      if (this.value && !validatePhone(this.value)) {
        showFieldError(this, "Please enter a valid phone number")
      } else {
        clearFieldError(this)
      }
    })
  })

  // Clear errors on input
  document.querySelectorAll("input, select, textarea").forEach((field) => {
    field.addEventListener("input", function () {
      clearFieldError(this)
    })
  })
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

function validatePhone(phone) {
  const re = /^[+]?[1-9][\d\s\-$$$$]{7,15}$/
  return re.test(phone.replace(/\s/g, ""))
}

function showFieldError(field, message) {
  clearFieldError(field)

  field.style.borderColor = "var(--error)"
  field.setAttribute("aria-invalid", "true")

  const errorEl = document.createElement("div")
  errorEl.className = "field-error"
  errorEl.textContent = message
  errorEl.style.color = "var(--error)"
  errorEl.style.fontSize = "0.875rem"
  errorEl.style.marginTop = "var(--space-xs)"

  field.parentNode.appendChild(errorEl)
}

function clearFieldError(field) {
  field.style.borderColor = "var(--primary-200)"
  field.removeAttribute("aria-invalid")

  const errorEl = field.parentNode.querySelector(".field-error")
  if (errorEl) {
    errorEl.remove()
  }
}

function clearAllFieldErrors() {
  document.querySelectorAll(".field-error").forEach((error) => error.remove())
  document.querySelectorAll("input, select, textarea").forEach((field) => {
    field.style.borderColor = "var(--primary-200)"
    field.removeAttribute("aria-invalid")
  })
}

// Form Submission Handlers
function handleContactFormSubmit(e) {
  e.preventDefault()

  const formData = new FormData(e.target)
  const data = Object.fromEntries(formData)

  // Show loading state
  const submitBtn = e.target.querySelector('button[type="submit"]')
  const originalText = submitBtn.innerHTML
  submitBtn.innerHTML = '<span class="loading"></span> Sending Message...'
  submitBtn.disabled = true

  // Simulate form submission
  setTimeout(() => {
    // Reset button
    submitBtn.innerHTML = originalText
    submitBtn.disabled = false

    // Show success message
    showSuccessMessage(e.target, "Thank you for your message! We'll get back to you within 24 hours.")

    // Reset form
    e.target.reset()

    // Track analytics
    trackEvent("Form", "Submit", "Contact Form")
  }, 2000)
}

function handleBookingFormSubmit(e) {
  e.preventDefault()

  if (!validateCurrentStep()) {
    return
  }

  const formData = new FormData(e.target)
  const data = Object.fromEntries(formData)
  data.service = currentService
  data.step = currentStep

  // Show loading state
  const submitBtn = e.target.querySelector('button[type="submit"]')
  const originalText = submitBtn.innerHTML
  submitBtn.innerHTML = '<span class="loading"></span> Confirming Booking...'
  submitBtn.disabled = true

  // Simulate booking submission
  setTimeout(() => {
    // Reset button
    submitBtn.innerHTML = originalText
    submitBtn.disabled = false

    // Show success message and close modal
    showSuccessMessage(
      document.body,
      "Booking request submitted successfully! We'll contact you within 2 hours to confirm your appointment.",
    )
    closeModal()

    // Track analytics
    trackEvent("Form", "Submit", "Booking Form")
    trackEvent("Booking", "Complete", currentService)
  }, 2000)
}

function showSuccessMessage(container, message) {
  const successEl = document.createElement("div")
  successEl.className = "success-message"
  successEl.textContent = message

  if (container === document.body) {
    successEl.style.position = "fixed"
    successEl.style.top = "100px"
    successEl.style.left = "50%"
    successEl.style.transform = "translateX(-50%)"
    successEl.style.zIndex = "3000"
    successEl.style.maxWidth = "500px"
  }

  container.insertBefore(successEl, container.firstChild)

  // Remove message after 5 seconds
  setTimeout(() => {
    successEl.remove()
  }, 5000)
}

// Service Details Functions
function showServiceDetails(service) {
  const details = {
    corporate: {
      title: "Corporate Training & Workshops",
      content: `
                🏢 Workplace Mental Health Solutions
                
                Our comprehensive corporate programs include:
                • Stress management workshops
                • Team building activities focused on mental wellness
                • Mental health awareness training for managers
                • Leadership development with emotional intelligence
                • Work-life balance seminars
                • Crisis intervention training
                • Employee assistance program setup
                
                📞 Contact us for customized corporate packages tailored to your organization's needs.
                
                💼 We work with companies of all sizes, from startups to Fortune 500 companies.
            `,
    },
    mindfulness: {
      title: "Mindfulness & Meditation Programs",
      content: `
                🧘‍♀️ Cultivate Present-Moment Awareness
                
                Our mindfulness programs offer:
                • Beginner-friendly meditation classes
                • Advanced mindfulness techniques
                • Mindfulness-Based Stress Reduction (MBSR)
                • Workplace mindfulness programs
                • Online guided meditation sessions
                • Walking meditation groups
                • Mindful eating workshops
                
                🌱 Learn to cultivate inner peace, reduce anxiety, and improve focus through evidence-based mindfulness practices.
                
                ⏰ Classes available both in-person and online with flexible scheduling.
            `,
    },
    yoga: {
      title: "Therapeutic Yoga Classes",
      content: `
                🧘‍♂️ Yoga for Mind, Body & Soul
                
                Our yoga offerings include:
                • Hatha yoga for beginners
                • Vinyasa flow classes
                • Therapeutic yoga for trauma recovery
                • Yoga for anxiety and depression
                • Private yoga instruction
                • Chair yoga for accessibility
                • Prenatal yoga classes
                
                🏥 Classes held at our wellness center and partner medical facilities.
                
                💚 All levels welcome - our certified instructors provide modifications for every body and ability.
            `,
    },
    fitness: {
      title: "Holistic Fitness & Nutrition Planning",
      content: `
                💪 Integrated Wellness Approach
                
                Our comprehensive wellness plans include:
                • Personalized fitness assessments
                • Mental health-focused exercise programs
                • Nutritional counseling and meal planning
                • Custom workout plans for depression/anxiety
                • Group fitness classes with mental health focus
                • Ongoing support and progress monitoring
                • Integration with therapy sessions
                
                🎯 We believe physical wellness and mental health are deeply connected.
                
                📊 Regular check-ins and plan adjustments ensure optimal results for your unique needs.
            `,
    },
  }

  if (details[service]) {
    // Create a more sophisticated modal or alert
    const content = details[service].content.replace(/•/g, "\n•").trim()
    alert(`${details[service].title}\n\n${content}`)

    // Track analytics
    trackEvent("Service", "View Details", service)
  }
}

// Consent Form Function
function showConsentForm() {
  const consentContent = `
        📋 CLIENT CONSENT FORM - Every Mind Matters
        
        By proceeding with booking, I understand and agree to the following:
        
        🔒 CONFIDENTIALITY
        All information shared during sessions will be kept strictly confidential except as required by law or when there is imminent danger to self or others.
        
        🎯 TREATMENT APPROACH
        I understand the nature of the therapeutic services being provided and that therapy involves discussing difficult topics and emotions.
        
        ⚖️ RISKS AND BENEFITS
        I understand that while therapy can be highly beneficial, there are no guarantees of specific outcomes. Some sessions may temporarily increase emotional discomfort.
        
        📅 CANCELLATION POLICY
        I agree to provide 24-hour notice for cancellations. Late cancellations may incur fees.
        
        💳 PAYMENT TERMS
        I understand the fee structure, payment policies, and insurance coverage details.
        
        🚨 EMERGENCY PROCEDURES
        I understand the procedures for mental health emergencies and after-hours crisis support.
        
        📱 COMMUNICATION
        I consent to communication via phone/email for appointment reminders and treatment-related matters.
        
        ✅ By checking the consent box, I acknowledge that I have read, understood, and agree to these terms.
        
        For full terms and conditions, please visit our website or request a printed copy.
    `

  alert(consentContent)
  trackEvent("Legal", "View Consent Form", "Booking Modal")
}

// Additional Page Functions
function showPage(page) {
  const pages = {
    products:
      "🛍️ Wellness Products & Resources\n\nOur curated products and resources are designed to support your mental and physical well-being. From books to apps, we have a wide range of tools to help you on your journey.",
    services:
      "🏥 Available Services\n\nExplore our range of services including therapy, coaching, workshops, and more. Each service is tailored to meet your specific needs.",
    about:
      "🌟 About Us\n\nLearn more about the team behind Every Mind Matters. Our mission is to provide accessible and effective mental health solutions.",
    contact: "📞 Contact Us\n\nGet in touch with us through our contact form or visit our office. We're here to help!",
  }

  if (pages[page]) {
    alert(pages[page])
    trackEvent("Page", "View", page)
  }
}

// Dummy functions to resolve the "no-undef" errors
function setupAnimations() {
  // Add scroll-triggered animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1"
        entry.target.style.transform = "translateY(0)"
      }
    })
  }, observerOptions)

  // Observe elements for animation
  document.querySelectorAll(".service-card, .feature-card, .about-card").forEach((el) => {
    el.style.opacity = "0"
    el.style.transform = "translateY(20px)"
    el.style.transition = "opacity 0.6s ease, transform 0.6s ease"
    observer.observe(el)
  })
}

function setupAccessibility() {
  // Add keyboard navigation support
  document.querySelectorAll(".btn, .nav-link, .dropdown-item").forEach((element) => {
    element.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault()
        element.click()
      }
    })
  })

  // Add ARIA labels where needed
  const mobileMenuBtn = document.getElementById("mobile-menu")
  if (mobileMenuBtn) {
    mobileMenuBtn.setAttribute("aria-label", "Toggle mobile menu")
    mobileMenuBtn.setAttribute("aria-expanded", "false")
  }
}

function setupIntersectionObserver() {
  // Observe sections for navigation highlighting
  const sections = document.querySelectorAll("section[id]")
  const navLinks = document.querySelectorAll('.nav-link[href^="#"]')

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute("id")
          navLinks.forEach((link) => {
            link.classList.remove("active")
            if (link.getAttribute("href") === `#${id}`) {
              link.classList.add("active")
            }
          })
        }
      })
    },
    {
      threshold: 0.3,
      rootMargin: "-80px 0px -80px 0px",
    },
  )

  sections.forEach((section) => {
    sectionObserver.observe(section)
  })
}

function handleKeyboardEvents(e) {
  // Handle Escape key to close modal
  if (e.key === "Escape" && modal && modal.style.display === "block") {
    closeModal()
  }

  // Handle Enter key on mobile menu toggle
  if (e.key === "Enter" && e.target === mobileMenu) {
    toggleMobileMenu()
  }
}

function setupAnalyticsTracking() {
  // Track page views
  trackEvent("Page", "View", document.title)

  // Track button clicks
  document.querySelectorAll(".btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      trackEvent("Button", "Click", btn.textContent.trim())
    })
  })

  // Track form interactions
  document.querySelectorAll("form").forEach((form) => {
    form.addEventListener("submit", () => {
      trackEvent("Form", "Submit", form.id || "Unknown Form")
    })
  })
}

// Dummy function for trackEvent
function trackEvent(category, action, label) {
  // In a real implementation, this would send data to your analytics service
  // Example: gtag('event', action, { event_category: category, event_label: label })
}

// Handle window resize for dropdown behavior
window.addEventListener("resize", () => {
  setupDropdownNavigation()
})

// Handle browser back/forward buttons for anchor navigation
window.addEventListener("popstate", () => {
  if (window.location.hash) {
    scrollToAnchor(window.location.hash.substring(1))
  }
})
