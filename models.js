const modelForm = document.getElementById('modelForm');

modelForm.addEventListener('submit', function(e) {
  e.preventDefault();

  const data = {
  name: document.getElementById('mName').value,
  age: document.getElementById('mAge').value,
  email: document.getElementById('mEmail').value,
  phone: document.getElementById('mPhone').value,
  social: document.getElementById('mSocial').value,
  interest: document.getElementById('mInterest').value,
  availability: document.getElementById('mAvailability').value,
  about: document.getElementById('mAbout').value
};

const confirmPanel = document.getElementById('confirmPanel');
const BUSINESS_EMAIL = 'hello@thebeautyloft.com';

const subject = encodeURIComponent('New model application');
const body = encodeURIComponent(
  'New model application:\n\n' +
  'Name: ' + data.name + '\n' +
  'Age: ' + data.age + '\n' +
  'Email: ' + data.email + '\n' +
  'Phone: ' + data.phone + '\n' +
  'Social: ' + data.social + '\n' +
  'Availability: ' + data.availability + '\n' +
  'Interested in: ' + data.interest + '\n' +
  'About: ' + data.about
);

window.location.href =
        `mailto:${BUSINESS_EMAIL}?subject=${subject}&body=${body}`;
        
modelForm.reset();
});