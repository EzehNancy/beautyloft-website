const welcomeHeading = document.getElementById('welcomeHeading');
const profileContent = document.getElementById('profileContent');

fetch('http://127.0.0.1:3000/me', {
  credentials: 'include'
})
  .then(function(response) {
    if (!response.ok) {
      window.location.href = 'login.html';
      return null;
    }
    return response.json();
  })
  .then(function(data) {
    if (!data) return;

    const user = data.user;
    welcomeHeading.textContent = 'Welcome back, ' + user.name.split(' ')[0] + '.';

    profileContent.innerHTML =
      '<div class="profile-card">' +
        '<h3>Account Info</h3>' +
        '<p><b>Name:</b> ' + user.name + '</p>' +
        '<p><b>Email:</b> ' + user.email + '</p>' +
      '</div>';
  });