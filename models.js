const authToken = localStorage.getItem('authToken');

if (!authToken) {
  window.location.href = 'login.html';
}

fetch('https://beautyloft-backend.onrender.com/me', {
  headers: { 'Authorization': 'Bearer ' + authToken }
})
  .then(function(response) {
    return response.json();
  })
  .then(function(data) {
    if (data && data.user) {
      document.getElementById('mName').value = data.user.name;
      document.getElementById('mEmail').value = data.user.email;
    }
  });

const modelForm = document.getElementById('modelForm');
const modelMessage = document.getElementById('modelMessage');

modelForm.addEventListener('submit', async function(e) {
  e.preventDefault();

  const data = {
    age: document.getElementById('mAge').value,
    phone: document.getElementById('mPhone').value,
    socialHandle: document.getElementById('mSocial').value,
    interest: document.getElementById('mInterest').value,
    availability: document.getElementById('mAvailability').value,
    about: document.getElementById('mAbout').value,
    portfolioLink: document.getElementById('mPortfolio').value
  };

  try {
    const response = await fetch('https://beautyloft-backend.onrender.com/model-applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + authToken
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!response.ok) {
      modelMessage.textContent = result.error;
      modelMessage.classList.add('show');
      return;
    }

    modelMessage.classList.add('show');
    modelMessage.innerHTML = '<p>Your application has been submitted! You can check its status anytime on your <a href="profile.html" style="color:var(--plum); font-weight:600;">profile page</a>.</p>';
    modelForm.reset();

  } catch (err) {
    modelMessage.textContent = 'Something went wrong. Please try again.';
    modelMessage.classList.add('show');
  }
});

fetch('https://beautyloft-backend.onrender.com/me', {
  headers: { 'Authorization': 'Bearer ' + authToken }
})
  .then(function(response) {
    if (!response.ok) {
      window.location.href = 'login.html';
      return null;
    }
    return response.json();
  })
  .then(function(data) {
    if (data) {
      currentUser = data.user;
      document.getElementById('name').value = data.user.name;
      document.getElementById('email').value = data.user.email;
    }
  });