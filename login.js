const loginForm = document.getElementById('loginForm');
const loginMessage = document.getElementById('loginMessage');

loginForm.addEventListener('submit', async function(e) {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('https://beautyloft-backend.onrender.com/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      loginMessage.textContent = data.error;
      loginMessage.classList.add('show');
      return;
    }

    window.location.href = 'index.html';

  } catch (err) {
    loginMessage.textContent = 'Something went wrong. Please make sure the server is running.';
    loginMessage.classList.add('show');
  }
});