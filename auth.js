// Simple demo auth using localStorage (for development/demo only)
function getUsers() {
  try {
    return JSON.parse(localStorage.getItem('users') || '{}');
  } catch (e) {
    return {};
  }
}

function saveUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
}

function showError(el, msg) {
  el.textContent = msg;
  el.classList.remove('form-success');
  setTimeout(() => { el.textContent = ''; }, 4000);
}

function showSuccess(el, msg) {
  el.textContent = msg;
  el.classList.add('form-success');
  setTimeout(() => { el.textContent = ''; el.classList.remove('form-success'); }, 3000);
}

function showLogoutNav() {
  const logoutNav = document.getElementById('logout-nav');
  const logoutLink = document.getElementById('logout-link');
  if (logoutNav) logoutNav.style.display = 'block';
  if (logoutLink) {
    logoutLink.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('loggedInUser');
      if (logoutNav) logoutNav.style.display = 'none';
      window.location.href = 'index.html';
    }, { once: true });
  }
}

function createPasswordToggle(input) {
  const wrapper = document.createElement('div');
  wrapper.className = 'input-with-toggle';
  input.parentNode.replaceChild(wrapper, input);
  wrapper.appendChild(input);

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'password-toggle';
  btn.setAttribute('aria-label', 'Show password');
  btn.innerHTML = 'Show';
  btn.addEventListener('click', () => {
    const isPwd = input.type === 'password';
    input.type = isPwd ? 'text' : 'password';
    btn.innerHTML = isPwd ? 'Hide' : 'Show';
    btn.classList.toggle('active', isPwd);
  });

  wrapper.appendChild(btn);
  return { wrapper, btn };
}

function scorePassword(pw) {
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw) || /[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}

function applyStrengthMeter(pw, barEl, textEl, tipsEl) {
  const score = scorePassword(pw);
  const pct = (score / 4) * 100;
  barEl.style.width = pct + '%';
  let color = '#ff6b6b';
  let txt = 'Very weak';
  if (score >= 1) { color = '#ffb74d'; txt = 'Weak'; }
  if (score >= 2) { color = '#ffd54f'; txt = 'Fair'; }
  if (score >= 3) { color = '#9ccc65'; txt = 'Good'; }
  if (score >= 4) { color = '#4caf50'; txt = 'Strong'; }
  barEl.style.backgroundColor = color;
  textEl.textContent = txt;

  if (tipsEl) {
    const rules = {
      len8: pw => pw.length >= 8,
      len10: pw => pw.length >= 10,
      case: pw => /[a-z]/.test(pw) && /[A-Z]/.test(pw),
      number: pw => /[0-9]/.test(pw),
      symbol: pw => /[^A-Za-z0-9]/.test(pw)
    };
    Array.from(tipsEl.children).forEach(li => {
      const key = li.dataset.key;
      const ok = rules[key] ? rules[key](pw) : false;
      li.classList.toggle('met', ok);
    });
  }
}

// Attach toggles & strength meter to signup password fields
const signupForm = document.getElementById('signup-form');
if (signupForm) {
  const pwInput = document.getElementById('signup-password');
  const confirmInput = document.getElementById('signup-password-confirm');
  const err = document.getElementById('signup-error');
  const nameInput = document.getElementById('signup-name');
  const emailInput = document.getElementById('signup-email');
  const submitBtn = signupForm.querySelector('button[type="submit"]');

  // Create toggles
  createPasswordToggle(pwInput);
  createPasswordToggle(confirmInput);

  // Create strength meter + tips
  const meter = document.createElement('div');
  meter.className = 'strength-meter';
  const bar = document.createElement('div');
  bar.className = 'bar';
  meter.appendChild(bar);
  const strengthText = document.createElement('div');
  strengthText.className = 'strength-text';
  strengthText.textContent = '';
  const tips = document.createElement('ul');
  tips.className = 'strength-tips';
  const tipDefs = [
    { key: 'len8', text: 'At least 8 characters' },
    { key: 'len10', text: '10+ characters for extra strength' },
    { key: 'case', text: 'Upper and lowercase letters' },
    { key: 'number', text: 'Contains a number' },
    { key: 'symbol', text: 'Contains a symbol (e.g. !@#)' }
  ];
  tipDefs.forEach(t => {
    const li = document.createElement('li');
    li.dataset.key = t.key;
    li.innerHTML = `<span class="dot" aria-hidden></span>${t.text}`;
    tips.appendChild(li);
  });
  pwInput.parentNode.appendChild(meter);
  pwInput.parentNode.appendChild(strengthText);
  pwInput.parentNode.appendChild(tips);

  function updateFormState() {
    const pw = pwInput.value;
    const confirm = confirmInput.value;
    const valid = nameInput.value.trim() && emailInput.checkValidity() && pw.length >= 6 && pw === confirm;
    submitBtn.disabled = !valid;
  }

  pwInput.addEventListener('input', (e) => {
    applyStrengthMeter(e.target.value, bar, strengthText, tips);
    updateFormState();
  });
  confirmInput.addEventListener('input', updateFormState);
  nameInput.addEventListener('input', updateFormState);
  emailInput.addEventListener('input', updateFormState);

  // Initialize disabled state
  updateFormState();

  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();
    const pw = pwInput.value;
    const confirm = confirmInput.value;

    if (!name || !email || !pw) return showError(err, 'Please fill out all fields.');
    if (pw.length < 6) return showError(err, 'Password must be at least 6 characters.');
    if (pw !== confirm) return showError(err, 'Passwords do not match.');

    const users = getUsers();
    if (users[email]) return showError(err, 'An account with that email already exists.');

    users[email] = { name, email, password: pw };
    saveUsers(users);

    // auto-login
    localStorage.setItem('loggedInUser', email);
    showLogoutNav();
    showSuccess(err, 'Account created! Redirecting…');
    setTimeout(() => { window.location.href = 'index.html'; }, 900);
  });
}

// Attach toggle to login password and better messaging
const loginForm = document.getElementById('login-form');
if (loginForm) {
  const emailInput = document.getElementById('login-email');
  const pwInput = document.getElementById('login-password');
  const err = document.getElementById('login-error');
  createPasswordToggle(pwInput);

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = emailInput.value.trim().toLowerCase();
    const pw = pwInput.value;

    if (!email || !pw) return showError(err, 'Please enter email and password.');

    const users = getUsers();
    const u = users[email];
    if (!u || u.password !== pw) return showError(err, 'Invalid email or password.');

    localStorage.setItem('loggedInUser', email);
    showLogoutNav();
    showSuccess(err, 'Logged in — redirecting…');
    setTimeout(() => { window.location.href = 'index.html'; }, 700);
  });
}

// Optional: show logged-in user's name in the UI if present
(function annotateHeader() {
  const email = localStorage.getItem('loggedInUser');
  if (!email) return;
  const users = getUsers();
  const u = users[email];
  if (!u) return;
  // Add a small user badge to header if header exists
  const header = document.querySelector('header');
  if (!header) return;

  const badge = document.createElement('div');
  badge.className = 'user-badge';
  badge.innerHTML = `${u.name} • <button id="logout-btn" class="back-btn">Logout</button>`;
  badge.style.marginLeft = '1rem';
  badge.style.fontWeight = '600';
  header.appendChild(badge);

  const logoutBtn = badge.querySelector('#logout-btn');
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('loggedInUser');
    window.location.href = 'index.html';
  });

  // ensure the sidebar logout link is visible too
  showLogoutNav();
})();
