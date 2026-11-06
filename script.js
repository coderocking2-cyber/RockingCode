document.addEventListener('DOMContentLoaded', () => {
  // ---------- Mobile nav toggle ----------
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ============================================================
  // CALENDLY CONFIG — Public scheduling URL
  // ============================================================
  const YOUR_CALENDLY_URL = "https://calendly.com/ritamagdy99";

  // ---------- Booking form validation + step switch ----------
  const form = document.getElementById('bookingForm');
  const step1 = document.querySelector('.step1');
  const step2 = document.getElementById('step2');
  const stepDot1 = document.getElementById('stepDot1');
  const stepDot2 = document.getElementById('stepDot2');
  const summaryText = document.getElementById('summaryText');
  const editDetails = document.getElementById('editDetails');
  const calendlyContainer = document.getElementById('calendlyContainer');

  function setError(fieldId, message) {
    const input = document.getElementById(fieldId);
    const err = document.getElementById('err-' + fieldId);
    if (!input) return;

    if (message) {
      input.classList.add('invalid');
      if (err) err.textContent = message;
    } else {
      input.classList.remove('invalid');
      if (err) err.textContent = '';
    }
  }

  function validateForm(data) {
    let valid = true;

    if (!data.studentName.trim()) {
      setError('studentName', "Please enter the student's name.");
      valid = false;
    } else setError('studentName', '');

    if (!data.parentName.trim()) {
      setError('parentName', "Please enter the parent's name.");
      valid = false;
    } else setError('parentName', '');

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(data.parentEmail.trim())) {
      setError('parentEmail', 'Please enter a valid email address.');
      valid = false;
    } else setError('parentEmail', '');

    const phoneDigits = data.parentPhone.replace(/\D/g, '');
    if (phoneDigits.length < 7) {
      setError('parentPhone', 'Please enter a valid phone number.');
      valid = false;
    } else setError('parentPhone', '');

    if (!data.studentAge) {
      setError('studentAge', "Please select the student's age.");
      valid = false;
    } else setError('studentAge', '');

    return valid;
  }

  function loadCalendlyWidget(prefill) {
    // Force height so Calendly renders properly without collapsing to 0px
    calendlyContainer.innerHTML = '<div class="calendly-inline-widget" id="calendlyWidget" style="min-width:320px;height:700px;"></div>';

    let retries = 0;
    const maxRetries = 25; // Try for up to 5 seconds

    const initWidget = () => {
      const widgetElem = document.getElementById('calendlyWidget');
      if (window.Calendly && widgetElem) {
        window.Calendly.initInlineWidget({
          url: YOUR_CALENDLY_URL,
          parentElement: widgetElem,
          prefill: {
            name: prefill.name,
            email: prefill.email,
            customAnswers: {
              a1: prefill.phone,
              a2: prefill.studentName,
              a3: prefill.studentAge
            }
          },
          utm: {}
        });
      } else if (retries < maxRetries) {
        retries++;
        setTimeout(initWidget, 200);
      } else {
        calendlyContainer.innerHTML = '<p style="color:red; text-align:center;">Failed to load calendar. Please refresh the page.</p>';
      }
    };

    initWidget();
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const data = {
        studentName: document.getElementById('studentName')?.value || '',
        parentName: document.getElementById('parentName')?.value || '',
        parentEmail: document.getElementById('parentEmail')?.value || '',
        parentPhone: document.getElementById('parentPhone')?.value || '',
        studentAge: document.getElementById('studentAge')?.value || ''
      };

      if (!validateForm(data)) return;

      // Reveal step 2
      if (step1) step1.classList.add('hidden');
      if (step2) step2.classList.add('visible');
      if (stepDot1) stepDot1.classList.remove('active');
      if (stepDot2) stepDot2.classList.add('active');

      if (summaryText) {
        summaryText.textContent = `Booking for ${data.studentName} (age ${data.studentAge}) · Reminders to ${data.parentEmail}`;
      }

      loadCalendlyWidget({
        name: data.parentName,
        email: data.parentEmail,
        phone: data.parentPhone,
        studentName: data.studentName,
        studentAge: data.studentAge
      });

      if (step2) {
        step2.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  if (editDetails) {
    editDetails.addEventListener('click', function (e) {
      e.preventDefault();
      if (step2) step2.classList.remove('visible');
      if (step1) step1.classList.remove('hidden');
      if (stepDot2) stepDot2.classList.remove('active');
      if (stepDot1) stepDot1.classList.add('active');

      if (calendlyContainer) {
        calendlyContainer.innerHTML = '<div class="calendly-loading">Loading available time slots…</div>';
      }

      if (step1) {
        step1.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }
});