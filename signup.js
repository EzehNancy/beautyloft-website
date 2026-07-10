const signupForm = document.getElementById('signupForm');
const signupMessage = document.getElementById('signupMessage');

signupForm.addEventListener('submit', async function(e) {
  e.preventDefault();

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('http://127.0.0.1:3000/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      signupMessage.textContent = data.error;
      signupMessage.classList.add('show');
      return;
    }

    window.location.href = 'login.html';

  } catch (err) {
    signupMessage.textContent = 'Something went wrong. Please make sure the server is running.';
    signupMessage.classList.add('show');
  }
});