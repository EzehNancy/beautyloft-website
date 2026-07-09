const content = document.getElementById('confirmationContent');
const saved = sessionStorage.getItem('lastBooking');

if (saved) {
  const booking = JSON.parse(saved);

  content.innerHTML =
    '<h1>Your appointment is booked, ' + booking.name.split(' ')[0] + '.</h1>' +
    '<p>Your booking reference number is:</p>' +
    '<p id="bookingIdDisplay">' + booking.id + '</p>' +
    '<div id="bookingDetailsCard">' +
      '<p><b>Service:</b> ' + booking.service + '</p>' +
      '<p><b>Date:</b> ' + booking.date + '</p>' +
      '<p><b>Time:</b> ' + booking.time + '</p>' +
      '<p><b>Phone:</b> ' + booking.phone + '</p>' +
      '<p><b>Email:</b> ' + booking.email + '</p>' +
    '</div>' +
    '<p>One last step — click below to send your request through to us, then keep this number for your records.</p>' +
    '<a href="mailto:hello@thebeautyloft.com?subject=' + booking.subject + '&body=' + booking.body + '" class="btn-primary">Send request via email</a>' +
    '<a href="index.html" class="btn-secondary" style="margin-left:12px;">Back to home</a>';
} else {
  content.innerHTML =
    '<h1>No booking found.</h1>' +
    '<p>It looks like you reached this page directly. Head back to make a booking first.</p>' +
    '<a href="booking.html" class="btn-primary">Go to booking</a>';
}