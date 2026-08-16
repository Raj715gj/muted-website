/* ============================================
   MUTED AERO ONE — Script
   Razorpay Integration + Animations
   ============================================ */

// ===== CONFIG =====
const COMPANY_NAME = "MUTED";
const COMPANY_LOGO = "images/logo.png";
const isLocalFileProtocol = window.location.protocol === 'file:';
const isLocalHostPreview = ['localhost', '127.0.0.1', '0.0.0.0', '::1'].includes(window.location.hostname) && window.location.port !== '3000';
const isLocalBackendPreview = isLocalFileProtocol || isLocalHostPreview;
const API_BASE = isLocalBackendPreview
  ? 'http://localhost:3000'
  : window.location.origin;

// ✅ GITHUB PAGES MODE - Static deployment without backend
const GITHUB_PAGES_MODE = false;
let RAZORPAY_KEY = null;
let configPromise = null;
let configLoaded = false;
let configLoadError = null;

if (isLocalBackendPreview) {
  console.warn('Using local backend at http://localhost:3000. Live Razorpay payments require the backend to be running and /config to return a valid key.');
}

function getConfigCandidateBases() {
  const candidates = [];
  const seen = new Set();

  const addBase = (base) => {
    if (!base) return;
    const normalized = base.replace(/\/$/, '');
    if (!seen.has(normalized)) {
      seen.add(normalized);
      candidates.push(normalized);
    }
  };

  const currentOrigin = window.location.origin;
  const shouldUseCurrentOrigin = !isLocalBackendPreview && currentOrigin;

  if (shouldUseCurrentOrigin) {
    addBase(currentOrigin);
  }
  addBase(API_BASE);

  const protocol = window.location.protocol || 'http:';
  const protocols = [protocol];
  if (protocol === 'https:') protocols.push('http:');
  if (protocol === 'http:') protocols.push('https:');

  protocols.forEach((p) => {
    addBase(`${p}//localhost:3000`);
    addBase(`${p}//127.0.0.1:3000`);
  });

  if (!seen.has('http://localhost:3000')) addBase('http://localhost:3000');
  if (!seen.has('http://127.0.0.1:3000')) addBase('http://127.0.0.1:3000');

  return candidates;
}

function shouldSuppressConfigError(base) {
  const suppressedHosts = ['127.0.0.1:5501', '127.0.0.1:5500', 'localhost:5501', 'localhost:5500'];
  return suppressedHosts.includes(base.replace(/^https?:\/\//, '').replace(/\/$/, ''));
}

async function loadConfig() {
  const candidateBases = getConfigCandidateBases();
  const maxAttempts = 3;

  for (const base of candidateBases) {
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        const url = new URL('/config', `${base}/`);
        const resp = await fetch(url.toString(), { cache: 'no-store' });
        if (!resp.ok) {
          const txt = await resp.text().catch(() => null);
          if (!shouldSuppressConfigError(base)) {
            debugLog('config.httpError', { base, status: resp.status, text: txt });
          }
          if (attempt < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, 400 * attempt));
          }
          continue;
        }

        const cfg = await resp.json().catch((e) => { throw new Error('Invalid JSON from /config: ' + e.message); });
        if (cfg && cfg.razorpayKeyId) {
          RAZORPAY_KEY = cfg.razorpayKeyId;
          configLoaded = true;
          configLoadError = null;
          if (!isLocalFileProtocol) debugLog('config.loaded', { base, ...cfg });
          return RAZORPAY_KEY;
        }

        debugLog('config.missing', { base, cfg });
      } catch (e) {
        debugLog('config.error', { base, message: String(e) });
        if (attempt < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 400 * attempt));
        }
      }
    }
  }

  configLoaded = false;
  configLoadError = 'Failed to fetch configuration from server. Please make sure the backend is running and reachable from this page.';
  if (!isLocalFileProtocol) {
    showFriendlyError(configLoadError);
  } else {
    console.warn('Failed to fetch configuration from local backend while previewing file://. Preview will not support live payments.');
  }

  RAZORPAY_KEY = null;
  return null;
}

async function ensureRazorpayConfig() {
  if (configLoaded && RAZORPAY_KEY) return RAZORPAY_KEY;
  if (!configPromise) {
    configPromise = loadConfig();
  }
  return configPromise;
}

configPromise = loadConfig();

// Current modal state
let currentTier = null;
let currentPrice = 0;
let currentColor = "gold";

// ===== MOBILE MENU =====
const menuToggle = document.getElementById("menuToggle");
const mobileMenu = document.getElementById("mobileMenu");

menuToggle.addEventListener("click", () => {
  mobileMenu.classList.toggle("open");
  // Toggle icon
  if (mobileMenu.classList.contains("open")) {
    menuToggle.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
  } else {
    menuToggle.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
  }
});

function closeMobile() {
  mobileMenu.classList.remove("open");
  menuToggle.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
}

function updateNavbar() {
  const navbar = document.getElementById("navbar");
  if (!navbar) return;

  const hero = document.getElementById("hero");
  const heroBottom = hero ? hero.offsetHeight - 120 : 220;
  const scrollProgress = Math.min(1, Math.max(0, (window.scrollY - 40) / Math.max(1, heroBottom - 40)));
  const shouldSolid = window.scrollY > heroBottom;

  navbar.classList.toggle("scrolled", shouldSolid);

  const alpha = 0.08 + scrollProgress * 0.86;
  const blur = 0 + scrollProgress * 20;
  navbar.style.background = `rgba(8, 8, 8, ${alpha})`;
  navbar.style.backdropFilter = `blur(${blur}px)`;
  navbar.style.webkitBackdropFilter = `blur(${blur}px)`;
}

function openContact() {
  const contactSection = document.getElementById('contact');
  const contactForm = document.getElementById('contactForm');
  if (contactSection) {
    contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  setTimeout(() => {
    if (contactForm) {
      const nameInput = document.getElementById('contactName');
      if (nameInput) nameInput.focus({ preventScroll: true });
    }
  }, 450);
}

// ===== TAB SWITCHING =====
function switchTab(tabId) {
  const allTierCards = document.querySelectorAll(".tier-card");
  allTierCards.forEach(card => card.classList.remove("active-tab"));

  const allTabButtons = document.querySelectorAll(".tab-button");
  allTabButtons.forEach(btn => btn.classList.remove("active"));

  const selectedButton = document.querySelector(`.tab-button[data-tab="${tabId}"]`);
  if (!selectedButton) return;

  selectedButton.classList.add("active");
  const selectedCard = document.getElementById(tabId);
  if (selectedCard) {
    selectedCard.classList.add("active-tab");
    currentColor = selectedCard.getAttribute('data-color') || currentColor;
  }

  selectedPrice = parseInt(selectedButton.getAttribute('data-price') || '0');
  selectedName = selectedButton.getAttribute('data-name') || '';
  selectedQuantity = 1;
  selectedMethod = 'standard';
  updateSummary();

  const planDetail = document.getElementById('planDetail');
  if (planDetail) planDetail.classList.remove('hidden');
}

// ===== SCROLL REVEAL =====
function revealOnScroll() {
  const reveals = document.querySelectorAll(".reveal");
  const windowHeight = window.innerHeight;

  reveals.forEach((el) => {
    const top = el.getBoundingClientRect().top;
    if (top < windowHeight - 80) {
      el.classList.add("visible");
    }
  });
}

window.addEventListener("scroll", () => {
  revealOnScroll();
  updateNavbar();
}, { passive: true });
window.addEventListener("load", () => {
  revealOnScroll();
  updateNavbar();
  // Animate progress bars
  setTimeout(animateProgressBars, 600);
});

// ===== PROGRESS BARS =====
function animateProgressBars() {
  document.querySelectorAll(".progress-fill").forEach((bar) => {
    const targetWidth = bar.getAttribute("data-width");
    bar.style.width = targetWidth + "%";
  });
}

// ===== MODAL =====
const modalOverlay = document.getElementById("modalOverlay");
const modalForm = document.getElementById("modalForm");
const modalSuccess = document.getElementById("modalSuccess");
const modalBadge = document.getElementById("modalBadge");
const modalPrice = document.getElementById("modalPrice");
const modalPriceBtn = document.getElementById("modalPriceBtn");
const modalSubmit = document.getElementById("modalSubmit");

const colorMap = {
  green: { bg: "rgba(122,158,126,.08)", color: "#7a9e7e", border: "rgba(122,158,126,.4)", gradient: "linear-gradient(135deg,#5a7e5e,#7a9e7e)" },
  gold:  { bg: "rgba(200,169,110,.08)", color: "#c8a96e", border: "rgba(200,169,110,.4)", gradient: "linear-gradient(135deg,#a88948,#c8a96e)" },
  purple:{ bg: "rgba(155,142,196,.08)", color: "#9b8ec4", border: "rgba(155,142,196,.4)", gradient: "linear-gradient(135deg,#7a6ea0,#9b8ec4)" },
};

let selectedQuantity = 1;
let selectedPrice = 0;
let selectedName = '';
let selectedMethod = 'standard';

function openModal(tierId, tierName, price, color, method = 'standard', resetQuantity = true) {
  currentTier = tierId;
  selectedPrice = parseInt(price);
  selectedName = tierName;
  currentColor = color;
  selectedMethod = method;
  if (resetQuantity) selectedQuantity = 1;

  updateSummary();
  setModalPrice(selectedPrice);

  const c = colorMap[color];
  modalBadge.textContent = tierName + " — ₹" + price;
  modalBadge.style.background = c.bg;
  modalBadge.style.color = c.color;
  modalBadge.style.border = "1px solid " + c.border;
  modalSubmit.style.background = c.gradient;
  modalForm.classList.remove("hide");
  modalSuccess.classList.remove("show");
  document.getElementById("preorderForm").reset();
  document.getElementById('addressError').style.display = 'none';

  modalOverlay.classList.add("open");
  document.body.style.overflow = "hidden";

  // Quick-fix: ensure modal buttons receive pointer events even if an overlay
  // or decorative element is accidentally on top. This will detect overlapping
  // elements at the button positions and temporarily disable their pointer-events.
  try {
    setTimeout(() => {
      const modalEl = document.querySelector('.modal');
      if (!modalEl) return;
      // force modal and its controls to accept pointer events
      modalEl.style.pointerEvents = 'auto';
      Array.from(modalEl.querySelectorAll('button,input,textarea,a')).forEach(el => el.style.pointerEvents = 'auto');

      const targets = [];
      const submit = document.getElementById('modalSubmit'); if (submit) targets.push(submit);
      const upi = document.getElementById('modalUpi'); if (upi) targets.push(upi);

      targets.forEach((t) => {
        const rect = t.getBoundingClientRect();
        const cx = Math.round(rect.left + rect.width/2);
        const cy = Math.round(rect.top + rect.height/2);
        const topEl = document.elementFromPoint(cx, cy);
        if (topEl && !modalEl.contains(topEl) && topEl !== document.body && topEl !== document.documentElement) {
          // temporarily disable pointer events on the blocking element
          try {
            topEl.__oldPointerEvents = topEl.style.pointerEvents || '';
            topEl.style.pointerEvents = 'none';
            topEl.style.outline = '2px dashed rgba(255,0,0,0.6)';
            console.warn('Disabled pointer-events on overlapping element:', topEl);
            // restore after 8 seconds
            setTimeout(() => {
              try { topEl.style.pointerEvents = topEl.__oldPointerEvents || ''; topEl.style.outline = ''; } catch (e) {}
            }, 8000);
          } catch (e) { console.error('overlay fix error', e); }
        }
      });
    }, 80);
  } catch (e) { console.error('openModal overlay-fix failed', e); }
}

function openModalWithMethod(method) {
  if (!selectedPrice || !selectedName) {
    showFriendlyError('Please select a plan first.');
    return;
  }
  selectedMethod = method;
  openModal(currentTier, selectedName, selectedPrice, currentColor, method, false);
}

function closePlanDetail() {
  const planDetail = document.getElementById('planDetail');
  if (planDetail) planDetail.classList.add('hidden');
  document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tier-card').forEach(card => card.classList.remove('active-tab'));
  selectedPrice = 0;
  selectedName = '';
  selectedQuantity = 1;
  selectedMethod = 'standard';
}

function setModalPrice(price) {
  modalPrice.textContent = price;
  document.getElementById('modalPriceBtn').textContent = price;
}

function updateSummary() {
  const quantity = selectedQuantity;
  const total = selectedPrice * quantity;
  document.getElementById('summaryPlanName').textContent = selectedName || 'No plan selected';
  document.getElementById('summaryQuantity').textContent = quantity;
  document.getElementById('summaryUnitPrice').textContent = selectedPrice;
  document.getElementById('summaryTotal').textContent = total;
  setModalPrice(total);
}

function changeQuantity(delta) {
  selectedQuantity = Math.max(1, selectedQuantity + delta);
  updateSummary();
}

function closeModal() {
  modalOverlay.classList.remove("open");
  document.body.style.overflow = "";
}

function shouldUseMockCheckout() {
  const params = new URLSearchParams(window.location.search || '');
  return params.get('mockCheckout') === '1' || params.get('mockCheckout') === 'true';
}

async function finalizeCheckout(response, orderData, checkoutContext) {
  try {
    debugLog('verify-payment request', { order_id: response.razorpay_order_id, payment_id: response.razorpay_payment_id, mockMode: checkoutContext.mockMode });
    const verifyResponse = await fetch(`${API_BASE}/api/verify-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
        mock_mode: checkoutContext.mockMode || false,
        order_details: {
          name: checkoutContext.name,
          email: checkoutContext.email,
          phone: checkoutContext.phone,
          address: checkoutContext.address,
          tier: checkoutContext.selectedName,
          quantity: checkoutContext.quantity,
          amount: checkoutContext.totalAmount,
        },
      }),
    });

    if (!verifyResponse.ok) {
      let errBody = null;
      try { errBody = await verifyResponse.json(); } catch (e) { errBody = await verifyResponse.text().catch(() => null); }
      debugLog('verify-payment non-ok', { status: verifyResponse.status, body: errBody });
      throw new Error((errBody && errBody.error) || 'Payment verification failed');
    }

    const verifyData = await verifyResponse.json();
    console.log('✅ Payment verified:', verifyData.payment_id);
    debugLog('verify-payment success', verifyData);
    window.__muted_checkout_completed = true;
    if (window.__muted_checkout_timer) { clearTimeout(window.__muted_checkout_timer); window.__muted_checkout_timer = null; }

    modalForm.classList.add('hide');
    modalSuccess.classList.add('show');

    const order = {
      id: response.razorpay_payment_id,
      order_id: response.razorpay_order_id,
      name: checkoutContext.name,
      email: checkoutContext.email,
      phone: checkoutContext.phone,
      address: checkoutContext.address,
      tier: checkoutContext.selectedName,
      quantity: checkoutContext.quantity,
      amount: checkoutContext.totalAmount,
      status: 'PAID',
      timestamp: new Date().toISOString(),
    };

    const orders = JSON.parse(localStorage.getItem('muted_orders') || '[]');
    orders.push(order);
    localStorage.setItem('muted_orders', JSON.stringify(orders));
    console.log('📦 Order saved:', order);
    return verifyData;
  } catch (verifyError) {
    console.error('❌ Verification Error:', verifyError);
    showFriendlyError('Payment verification failed: ' + verifyError.message);
    closeModal();
    throw verifyError;
  }
}

// Close on backdrop click
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) closeModal();
});

// Close on Escape
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

// ===== PRE-ORDER FORM SUBMIT → RAZORPAY =====
async function handlePreorder(e, method = 'standard') {
  if (e && e.preventDefault) e.preventDefault();

  // ✅ GITHUB PAGES MODE: Show static success message
  if (GITHUB_PAGES_MODE) {
    const name = document.getElementById("preName").value.trim();
    const email = document.getElementById("preEmail").value.trim();
    const phone = document.getElementById("prePhone").value.trim();
    
    if (!name || !email || !phone) {
      showFriendlyError('Please fill in all required fields.');
      return;
    }
    
    // Save to browser storage
    const preorder = {
      name,
      email,
      phone,
      date: new Date().toLocaleString(),
      amount: selectedPrice * selectedQuantity
    };
    
    let preorders = JSON.parse(localStorage.getItem('muted_preorders') || '[]');
    preorders.push(preorder);
    localStorage.setItem('muted_preorders', JSON.stringify(preorders));
    
    // Show success
    showFriendlySuccess(`✅ Pre-order received! Your reservation for ₹${selectedPrice * selectedQuantity} is confirmed. We'll email you at ${email} soon!`);
    
    // Clear form
    document.getElementById("preName").value = '';
    document.getElementById("preEmail").value = '';
    document.getElementById("prePhone").value = '';
    document.getElementById("shippingAddress").value = '';
    closePreorderModal();
    return;
  }

  try {
    console.log('handlePreorder invoked', { method });
    if (modalSubmit) {
      modalSubmit.disabled = true;
      const prevText = modalSubmit.textContent;
      modalSubmit.textContent = 'Processing...';
      setTimeout(() => {
        try { modalSubmit.textContent = prevText; modalSubmit.disabled = false; } catch (e) {}
      }, 5000);
    }
  } catch (e) { console.error('handlePreorder init error', e); }

  const name = document.getElementById("preName").value.trim();
  const email = document.getElementById("preEmail").value.trim();
  const phone = document.getElementById("prePhone").value.trim();
  const address = document.getElementById("shippingAddress").value.trim();

  let valid = true;
  if (name.length < 2) {
    document.getElementById("nameError").style.display = "block";
    valid = false;
  } else {
    document.getElementById("nameError").style.display = "none";
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    document.getElementById("emailError").style.display = "block";
    valid = false;
  } else {
    document.getElementById("emailError").style.display = "none";
  }

  if (!address) {
    document.getElementById("addressError").style.display = "block";
    valid = false;
  } else {
    document.getElementById("addressError").style.display = "none";
  }

    if (!selectedPrice || !selectedName) {
    showFriendlyError('Please select a plan and quantity first.');
    return;
  }

  if (!valid) return;

  const useMockCheckout = shouldUseMockCheckout();

  if (!useMockCheckout) {
    const resolvedKey = await ensureRazorpayConfig();
    if (!resolvedKey) {
      showFriendlyError('Live Razorpay payments are unavailable. Make sure the backend at http://localhost:3000 is running and /config returns a valid Razorpay key.');
      return;
    }

    RAZORPAY_KEY = resolvedKey;
  }

  try {
    // Step 1: Create order via backend
    const quantity = selectedQuantity;
    const totalAmount = selectedPrice * quantity;
    const razorpayAmount = totalAmount * 100;

    console.log("📝 Creating order for ₹" + totalAmount);
    let orderData = null;

    try {
      const orderResponse = await fetch(`${API_BASE}/api/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: razorpayAmount,
          currency: 'INR',
          receipt: `order_${Date.now()}`,
          name,
          email,
          phone,
          address,
          quantity,
          plan_name: selectedName,
          mock_mode: useMockCheckout,
        }),
      });

      if (!orderResponse.ok) {
        let errBody = null;
        try { errBody = await orderResponse.json(); } catch (e) { errBody = await orderResponse.text().catch(()=>null); }
        debugLog('create-order non-ok', { status: orderResponse.status, body: errBody });
        throw new Error((errBody && errBody.error) || 'Failed to create order');
      }

      orderData = await orderResponse.json();
      console.log("✅ Order created:", orderData.order_id);
      debugLog('create-order success', orderData);
    } catch (err) {
      debugLog('create-order fetch error', err && err.message ? err.message : String(err));
      console.error('create-order fetch error', err);
      throw new Error(`Cannot connect to backend at ${API_BASE}. Make sure the server is running: npm start`);
    }

    if (useMockCheckout) {
      debugLog('mock-checkout-enabled', { order_id: orderData.order_id });
      await finalizeCheckout({
        razorpay_order_id: orderData.order_id,
        razorpay_payment_id: `pay_mock_${Date.now()}`,
        razorpay_signature: 'mock_signature',
      }, orderData, {
        name,
        email,
        phone,
        address,
        selectedName,
        quantity,
        totalAmount,
        mockMode: true,
      });
      return;
    }

    // Step 2: Open Razorpay checkout in a new window/tab when possible.
    const razorpayOptions = {
      key: RAZORPAY_KEY,
      amount: razorpayAmount,
      currency: 'INR',
      order_id: orderData.order_id,
      name: COMPANY_NAME,
      description: `${selectedName} Reservation x${quantity}`,
      image: COMPANY_LOGO,
      prefill: {
        name,
        email,
        contact: phone || '',
      },
      theme: {
        color: colorMap[currentColor].color,
      },
      handler: async function (response) {
        window.__muted_checkout_completed = true;
        if (window.__muted_checkout_timer) { clearTimeout(window.__muted_checkout_timer); window.__muted_checkout_timer = null; }
        console.log("💳 Payment response received");

        try {
          await finalizeCheckout(response, orderData, {
            name,
            email,
            phone,
            address,
            selectedName,
            quantity,
            totalAmount,
            mockMode: false,
          });
        } catch (verifyError) {
          console.error("❌ Verification Error:", verifyError);
        }
      },
      modal: {
        ondismiss: function () {
          console.log("❌ Razorpay checkout closed by user");
        },
      },
      redirect: true,
    };

    try {
      const scriptTag = Array.from(document.scripts).find(s => s.src && s.src.includes('checkout.razorpay.com'));
      debugLog('razorpay.script_tag', scriptTag ? { src: scriptTag.src } : null);
    } catch (e) { debugLog('razorpay.script_tag_error', String(e)); }

    if (typeof window.Razorpay !== 'function') {
      debugLog('razorpay.not_loaded', { typeofRazorpay: typeof window.Razorpay });
      showFriendlyError('Payment script failed to load. Check network or allow external scripts (checkout.razorpay.com). Try incognito or another browser.');
      return;
    }

    const rzp = new Razorpay(razorpayOptions);
    window.__muted_current_rzp = rzp;
    window.__muted_checkout_completed = false;
    window.__muted_checkout_redirecting = !!razorpayOptions.redirect;
    rzp.on("payment.failed", function (response) {
      console.error("❌ Payment failed:", response.error);
      debugLog('payment.failed', response.error || response);
      window.__muted_checkout_completed = true;
      if (window.__muted_checkout_timer) { clearTimeout(window.__muted_checkout_timer); window.__muted_checkout_timer = null; }
      showFriendlyError("Payment failed: " + (response.error && response.error.description ? response.error.description : JSON.stringify(response)) + "\nPlease try again.");
    });
    debugLog('⚙️ razorpayOptions', { orderData, razorpayOptions });
    console.log('⚙️ razorpayOptions', { orderData, razorpayOptions });

    try {
      debugLog('razorpay.open', { order_id: orderData.order_id });
      window.__muted_checkout_completed = false;
      if (window.__muted_checkout_timer) { clearTimeout(window.__muted_checkout_timer); window.__muted_checkout_timer = null; }
      rzp.open();
      if (!window.__muted_checkout_redirecting) {
        window.__muted_checkout_timer = setTimeout(() => {
          if (!window.__muted_checkout_completed) {
            debugLog('razorpay.no_response', 'No handler or failure after 10s');
            showFriendlyError('Payment popup did not complete. It may be blocked by your browser or closed. Please allow popups or try a different browser. Click Retry to try again.');
          }
          window.__muted_checkout_timer = null;
        }, 10000);
      }
      setTimeout(() => { debugLog('razorpay.checkout_alive_check', { timestamp: Date.now() }); }, 1000);
    } catch (openErr) {
      console.error('❌ Razorpay open() error', openErr);
      debugLog('razorpay.open_error', openErr && openErr.message ? openErr.message : String(openErr));
      showFriendlyError('Payment popup failed to open: ' + (openErr && openErr.message));
    }
  } catch (error) {
    console.error("❌ Checkout Error:", error);
    showFriendlyError("Error: " + error.message);
  }
}

// ===== CONTACT FORM =====
const contactForm = document.getElementById("contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const name = document.getElementById("contactName").value.trim();
    const email = document.getElementById("contactEmail").value.trim();
    const message = document.getElementById("contactMessage").value.trim();

    if (!name || !email || !message) {
      alert("Please fill in all fields before sending your message.");
      return;
    }

    // Save to localStorage for admin review
    const messages = JSON.parse(localStorage.getItem("muted_contacts") || "[]");
    messages.push({ name, email, message, timestamp: new Date().toISOString() });
    localStorage.setItem("muted_contacts", JSON.stringify(messages));

    const statusMessage = document.getElementById('contactFallbackMessage');
    const hintMessage = document.getElementById('contactHintMessage');
    if (statusMessage) {
      statusMessage.style.display = 'none';
      statusMessage.textContent = '';
    }
    if (hintMessage) {
      hintMessage.style.display = '';
    }

    fetch(`${API_BASE}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message }),
    })
      .then(async (response) => {
        const payload = await response.json().catch(() => null);
        if (!response.ok) {
          const errorText = payload && payload.error ? payload.error : 'Failed to send your message. Please make sure the backend server is running at http://localhost:3000.';
          throw new Error(errorText);
        }
        if (payload && payload.success) {
          if (statusMessage) {
            statusMessage.textContent = 'Thank you! Your message has been sent. We will contact you soon.';
            statusMessage.style.display = 'block';
            statusMessage.style.color = 'var(--text)';
          } else {
            alert('Thank you! Your message has been sent.');
          }
          if (hintMessage) {
            hintMessage.style.display = 'none';
          }
          contactForm.reset();
        } else {
          throw new Error((payload && payload.error) || 'Unexpected server response.');
        }
      })
      .catch((err) => {
        const msg = err && err.message ? err.message : 'Failed to send your message. Please make sure the backend server is running.';
        if (statusMessage) {
          statusMessage.textContent = msg;
          statusMessage.style.display = 'block';
          statusMessage.style.color = 'var(--accent-light)';
        }
        showFriendlyError(msg);
      });
  });
}

// ===== ADMIN VIEW (Console) =====
// Type viewOrders() in browser console to see all orders
window.viewOrders = function () {
  const orders = JSON.parse(localStorage.getItem("muted_orders") || "[]");
  if (orders.length === 0) {
    console.log("No orders yet.");
    return;
  }
  console.table(orders);
  const revenue = orders.reduce((sum, o) => sum + o.amount, 0);
  console.log("Total Revenue: ₹" + revenue);
  console.log("Total Orders: " + orders.length);
  return orders;
};

window.viewContacts = function () {
  const contacts = JSON.parse(localStorage.getItem("muted_contacts") || "[]");
  console.table(contacts);
  return contacts;
};

// Ensure handlers are bound even if inline attributes fail.
(function attachPreorderHandlers() {
  try {
    if (typeof window.handlePreorder === 'function') {
      window.handlePreorder = window.handlePreorder; // keep existing
    }
  } catch (e) {}

  try {
    const upiBtn = document.getElementById('modalUpi');
    if (upiBtn) {
      upiBtn.removeEventListener('click', handlePreorder);
      upiBtn.addEventListener('click', (e) => handlePreorder(e, 'upi'));
    }
  } catch (e) { console.error('attachPreorderHandlers buttons', e); }

  // Expose for consoles that rely on global
  try { window.handlePreorder = handlePreorder; } catch (e) {}
})();

// ===== Debug panel (on-page) =====
function ensureDebugPanel() {
  try {
    // Only enable the on-page debug panel for local development or when explicitly requested.
    const params = new URLSearchParams(window.location.search);
    const enabled = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || params.get('debug') === '1');
    if (!enabled) return null;
    if (document.getElementById('mutedDebugPanel')) return document.getElementById('mutedDebugPanel');
    const panel = document.createElement('div');
    panel.id = 'mutedDebugPanel';
    panel.style.position = 'fixed';
    panel.style.right = '12px';
    panel.style.bottom = '12px';
    panel.style.width = '320px';
    panel.style.maxHeight = '50vh';
    panel.style.overflow = 'auto';
    panel.style.background = 'rgba(0,0,0,0.8)';
    panel.style.color = '#fff';
    panel.style.fontSize = '12px';
    panel.style.padding = '8px';
    panel.style.borderRadius = '8px';
    panel.style.zIndex = 99999;
    panel.style.boxShadow = '0 6px 20px rgba(0,0,0,0.6)';

    const title = document.createElement('div');
    title.textContent = 'Debug Log';
    title.style.fontWeight = '700';
    title.style.marginBottom = '6px';
    panel.appendChild(title);

    const clearBtn = document.createElement('button');
    clearBtn.textContent = 'Clear';
    clearBtn.style.float = 'right';
    clearBtn.style.marginTop = '-22px';
    clearBtn.style.marginRight = '-4px';
    clearBtn.onclick = () => { logContainer.innerHTML = ''; };
    panel.appendChild(clearBtn);

    const logContainer = document.createElement('div');
    logContainer.id = 'mutedDebugLog';
    panel.appendChild(logContainer);

    document.body.appendChild(panel);
    return panel;
  } catch (e) {
    return null;
  }
}

function cleanupRazorpayOverlay() {
  const overlayElements = document.querySelectorAll('.razorpay-container, .razorpay-backdrop, .razorpay-checkout-frame');
  overlayElements.forEach((el) => {
    el.style.display = 'none';
    el.style.visibility = 'hidden';
    el.style.pointerEvents = 'none';
    el.style.opacity = '0';
  });
}

function debugLog(msg, data) {
  try {
    const panel = ensureDebugPanel();
    const time = new Date().toLocaleTimeString();
    if (panel) {
      try {
        const container = panel.querySelector('#mutedDebugLog');
        const entry = document.createElement('div');
        entry.style.marginBottom = '6px';
        entry.style.padding = '6px';
        entry.style.borderRadius = '6px';
        entry.style.background = 'rgba(255,255,255,0.03)';
        entry.innerHTML = `<div style="font-weight:600;color:#ffd8a8">[${time}]</div><div style="opacity:.95">${escapeHtml(msg)}</div>`;
        if (data !== undefined) {
          const pre = document.createElement('pre');
          pre.style.whiteSpace = 'pre-wrap';
          pre.style.fontSize = '11px';
          pre.style.margin = '6px 0 0';
          try { pre.textContent = JSON.stringify(data, null, 2); } catch (e) { pre.textContent = String(data); }
          entry.appendChild(pre);
        }
        container.insertBefore(entry, container.firstChild);
        return;
      } catch (e) { /* fallthrough to console */ }
    }

    // Fallback: write to console only
    if (data !== undefined) console.log(`[${time}] DEBUG: ${msg}`, data); else console.log(`[${time}] DEBUG: ${msg}`);
  } catch (e) { try { console.error('debugLog error', e); } catch (__) {} }
}

// Friendly on-page error modal (replaces alert)
function ensureErrorModal() {
  let m = document.getElementById('mutedErrorModal');
  if (m) return m;
  m = document.createElement('div');
  m.id = 'mutedErrorModal';
  m.style.position = 'fixed';
  m.style.left = 0;
  m.style.top = 0;
  m.style.right = 0;
  m.style.bottom = 0;
  m.style.display = 'flex';
  m.style.alignItems = 'center';
  m.style.justifyContent = 'center';
  m.style.background = 'rgba(0,0,0,0.6)';
  m.style.zIndex = 999999;

  const box = document.createElement('div');
  box.style.width = '720px';
  box.style.maxWidth = '92%';
  box.style.background = '#fff';
  box.style.borderRadius = '10px';
  box.style.padding = '28px';
  box.style.textAlign = 'center';
  box.style.boxShadow = '0 20px 40px rgba(0,0,0,0.4)';

  const title = document.createElement('h2');
  title.textContent = 'Uh! oh!';
  title.style.margin = '6px 0';
  const subtitle = document.createElement('p');
  subtitle.textContent = 'Something went wrong';
  subtitle.style.fontWeight = '600';
  subtitle.style.margin = '6px 0 18px';

  const message = document.createElement('div');
  message.id = 'mutedErrorMessage';
  message.style.margin = '8px 0 18px';
  message.style.color = '#333';
  message.style.fontSize = '14px';

  const btnRow = document.createElement('div');
  btnRow.style.display = 'flex';
  btnRow.style.gap = '12px';
  btnRow.style.justifyContent = 'center';

  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'Close';
  closeBtn.style.padding = '10px 22px';
  closeBtn.onclick = () => { m.style.display = 'none'; };

  const retryBtn = document.createElement('button');
  retryBtn.textContent = 'Retry';
  retryBtn.style.padding = '10px 22px';
  retryBtn.style.background = '#0b8f4a';
  retryBtn.style.color = '#fff';
  retryBtn.onclick = () => {
    m.style.display = 'none';
    try {
      if (window.__muted_current_rzp && typeof window.__muted_current_rzp.open === 'function') {
        window.__muted_checkout_completed = false;
        if (window.__muted_checkout_timer) { clearTimeout(window.__muted_checkout_timer); window.__muted_checkout_timer = null; }
        window.__muted_current_rzp.open();
        window.__muted_checkout_timer = setTimeout(() => {
          if (!window.__muted_checkout_completed) {
            debugLog('razorpay.no_response_retry', 'No response after retry');
            showFriendlyError('Retry failed. Please check popups or try another browser.');
          }
          window.__muted_checkout_timer = null;
        }, 10000);
        return;
      }
    } catch (e) { console.error('retry open failed', e); }
    window.location.reload();
  };

  btnRow.appendChild(retryBtn);
  btnRow.appendChild(closeBtn);

  box.appendChild(title);
  box.appendChild(subtitle);
  box.appendChild(message);
  box.appendChild(btnRow);
  m.appendChild(box);
  document.body.appendChild(m);
  return m;
}

function showFriendlyError(msg) {
  debugLog('friendly.error', msg);
  try {
    const m = ensureErrorModal();
    const message = document.getElementById('mutedErrorMessage');
    message.textContent = msg && (typeof msg === 'string') ? msg : (JSON.stringify(msg) || String(msg));
    m.style.display = 'flex';
  } catch (e) { console.error('showFriendlyError failed', e); alert(msg); }
}

function showFriendlySuccess(msg) {
  debugLog('friendly.success', msg);
  try {
    const m = ensureErrorModal();
    const message = document.getElementById('mutedErrorMessage');
    message.textContent = msg && (typeof msg === 'string') ? msg : (JSON.stringify(msg) || String(msg));
    message.style.color = '#22c55e';
    m.style.display = 'flex';
    setTimeout(() => { message.style.color = '#ff0000'; }, 3000);
  } catch (e) { console.error('showFriendlySuccess failed', e); alert(msg); }
}

// Global error capture so checkout/internal errors appear in the debug panel
window.addEventListener('error', function (e) {
  try {
    // Ignore opaque cross-origin script errors that provide no details
    if ((e.message === 'Script error.' || !e.filename) && e.lineno === 0 && e.colno === 0) {
      console.debug('Ignored opaque script error');
      return;
    }
    debugLog('window.error', { message: e.message, filename: e.filename, lineno: e.lineno, colno: e.colno });
  } catch (err) { console.error(err); }
});

window.addEventListener('unhandledrejection', function (e) {
  try { debugLog('unhandledrejection', e.reason); } catch (err) { console.error(err); }
});

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, function (m) { return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[m]; });
}

window.exportOrdersCSV = function () {
  const orders = JSON.parse(localStorage.getItem("muted_orders") || "[]");
  if (orders.length === 0) { console.log("No orders."); return; }
  const header = "PaymentID,Name,Email,Phone,Tier,Amount,Status,Date\n";
  const rows = orders.map(o =>
    `${o.id},${o.name},${o.email},${o.phone || ""},${o.tier},₹${o.amount},${o.status},${o.timestamp}`
  ).join("\n");
  const blob = new Blob([header + rows], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "muted-orders-" + Date.now() + ".csv";
  a.click();
  console.log("CSV downloaded!");
};

console.log("%c MUTED AERO ONE ", "background:#c8a96e;color:#080808;font-size:16px;font-weight:800;padding:8px 16px;border-radius:8px");
console.log("%c Admin Commands:", "color:#8a8a8a;font-weight:600");
console.log("  viewOrders()      — See all pre-orders");
console.log("  viewContacts()    — See all contact messages");
console.log("  exportOrdersCSV() — Download orders as CSV");

// ===== PRODUCT LAUNCH ANIMATION =====
function initProductLaunch() {
  const el = document.getElementById('productLaunch');
  if (!el) return;

  function reveal() {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 80) {
      el.classList.add('show');
      window.removeEventListener('scroll', reveal);
    }
  }

  window.addEventListener('scroll', reveal, { passive: true });
  // try immediately
  setTimeout(reveal, 300);
}

// ===== ISSUES / TAGS =====
const issues = {
  mold: { title: 'Mold', text: 'Mold spores thrive in humid Indian homes during monsoon and poorly ventilated spaces. Muted Aero One captures spores and ultrafine particles before they spread.', img: 'images/issues/mold.svg' },
  allergies: { title: 'Allergies', text: 'Neutralise pollen, dust mite allergens and seasonal irritants common across Indian cities so daily breathing becomes easier and clearer.', img: 'images/issues/allergies.svg' },
  smoke: { title: 'Smoke', text: 'Filters indoor smoke from cooking, candles, incense and nearby pollution, reducing PM2.5 spikes inside apartments and kitchens.', img: 'images/issues/smoke.svg' },
  dust: { title: 'Dust', text: 'Captures fine household dust, construction dust and road PM10 so surfaces stay cleaner and breathing air feels fresher.', img: 'images/issues/dust.svg' },
  baby: { title: 'Baby', text: 'Whisper-silent operation and continuous purification for nurseries, providing gentle, low-noise air quality for infants.', img: 'images/issues/baby.svg' },
  wildfire: { title: 'Wildfire', text: 'Reduces smoke and haze during wildfire events across the region, keeping indoor air safer when outdoor AQI spikes.', img: 'images/issues/wildfire.svg' },
  pets: { title: 'Pets', text: 'Cuts pet dander, fur and odour particles for homes with dogs, cats and indoor animals, improving comfort for everyone.', img: 'images/issues/pets.svg' },
  asthma: { title: 'Asthma', text: 'Maintains low particulate levels to help manage asthma triggers from smoke, dust and pollen in busy urban environments.', img: 'images/issues/asthma.svg' },
  bacteria: { title: 'Bacteria', text: 'Reduces airborne biological particles and microbes. For medical sterilisation, consult certified solutions for your use case.', img: 'images/issues/bacteria.svg' },
};

function showIssue(id) {
  const data = issues[id] || issues['mold'];
  const titleEl = document.getElementById('issueTitle');
  const textEl = document.getElementById('issueText');
  const imgEl = document.getElementById('issueImage');
  if (titleEl) titleEl.textContent = data.title;
  if (textEl) textEl.textContent = data.text;
  if (imgEl) {
    // Try to set background image if file exists — fallback to text
    imgEl.style.backgroundImage = `url(${data.img})`;
    imgEl.style.backgroundSize = 'cover';
    imgEl.style.backgroundPosition = 'center';
    imgEl.textContent = '';
  }
  // update active tag
  document.querySelectorAll('.issue-tag').forEach(btn => btn.classList.toggle('active', btn.getAttribute('data-issue') === id));
}

function initIssueTags() {
  document.querySelectorAll('.issue-tag').forEach(btn => {
    btn.addEventListener('click', () => showIssue(btn.getAttribute('data-issue')));
  });
  // show default
  showIssue('mold');
}

// ===== LIFE IN INDIA SECTION =====
const lifeIndiaContent = {
  home: {
    title: 'Home',
    description: 'Local homes face dust, smoke and seasonal haze from both city roads and nearby fields. Our purifier makes a strong impression by turning that indoor burden into fresher, more comfortable air for everyone — from urban families to farming households.',
    image: 'images/home.jpeg'
  },
  kitchen: {
    title: 'Kitchen',
    description: 'Cooking and local biomass smoke add fine particles to the air every day. This purifier impresses with continuous capture of cooking aerosols and village smoke, helping families breathe easier while they prepare meals.',
    image: 'images/kitchen.jpeg'
  },
  traffic: {
    title: 'Traffic',
    description: 'Roadside emissions, construction dust and field burning haze all reach indoor spaces. The purifier delivers a noticeable improvement by reducing those outdoor pollutants, so commuters and local residents feel the fresh air difference instantly.',
    image: 'images/traffic.jpeg'
  },
  office: {
    title: 'Office',
    description: 'Workplaces and local shops need clean air to stay productive during pollution spikes. Our purifier creates a reassuring atmosphere that leaves people impressed with how well it handles both city smog and nearby agricultural smoke.',
    image: 'images/office.jpeg'
  },
  school: {
    title: 'School',
    description: 'Children in classrooms are especially vulnerable to pollution from roads and field burning. This purifier creates a safer indoor space and leaves teachers and parents confident that the next generation is breathing cleaner air.',
    image: 'images/school.jpeg'
  },
  winter: {
    title: 'Winter Smog',
    description: 'Cold-season smoke, stubble burning and foggy pollution can make indoor air feel heavy. The purifier stands out by keeping winter haze at bay and giving families, farmers and local communities a cleaner, healthier indoor environment.',
    image: 'images/winter-smog.jpeg'
  }
};

function renderLifeIndiaContent(location) {
  const data = lifeIndiaContent[location] || lifeIndiaContent['home'];
  const wrapper = document.getElementById('lifeIndiaContent');
  if (!wrapper) return;

  // Get all existing content items
  const existingItems = wrapper.querySelectorAll('.content-item');

  // If there are no items, create them all once
  if (existingItems.length === 0) {
    Object.keys(lifeIndiaContent).forEach(key => {
      const itemData = lifeIndiaContent[key];
      const contentItem = document.createElement('div');
      contentItem.className = 'content-item';
      contentItem.setAttribute('data-location', key);
      contentItem.innerHTML = `
        <div class="content-illustration">
          <div class="particle"></div>
          <div class="particle"></div>
          <div class="particle"></div>
          <div class="particle"></div>
          <div class="particle"></div>
          <img class="illustration-image" src="${itemData.image}" alt="${itemData.title}" />
          <div class="airflow"></div>
          <div class="clean-air"></div>
        </div>
        <div class="content-text">
          <h3>${itemData.title}</h3>
          <p>${itemData.description}</p>
        </div>
      `;
      wrapper.appendChild(contentItem);
    });
  }

  // Hide all items and show the one for the active location
  wrapper.querySelectorAll('.content-item').forEach(item => {
    item.classList.toggle('active', item.getAttribute('data-location') === location);
  });
}

function switchLocation(location) {
  renderLifeIndiaContent(location);

  document.querySelectorAll('.life-india-dot').forEach(dot => {
    dot.classList.toggle('active', dot.getAttribute('data-location') === location);
  });
}

function initLifeIndiaSection() {
  // Initialize with default location
  renderLifeIndiaContent('home');
  document.querySelectorAll('.life-india-dot').forEach(dot => {
    const location = dot.getAttribute('data-location');
    dot.addEventListener('click', () => switchLocation(location));
  });

  // Auto-rotate every 10 seconds
  const locations = Object.keys(lifeIndiaContent);
  let autoIndex = 0;

  setInterval(() => {
    autoIndex = (autoIndex + 1) % locations.length;
    const nextLocation = locations[autoIndex];
    switchLocation(nextLocation);
  }, 10000);
}

// Initialize app features as soon as the DOM is ready
function initApp() {
  initProductLaunch();
  initIssueTags();
  initLifeIndiaSection();
}

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  initApp();
} else {
  window.addEventListener('DOMContentLoaded', initApp);
}
