const authToken = localStorage.getItem('authToken');

const upcomingContainer =
  document.getElementById('upcomingAppointments');

const pastContainer =
  document.getElementById('pastAppointments');


// -------------------------
// REQUIRE LOGIN
// -------------------------

if (!authToken) {
  window.location.href = 'login.html';
}


// -------------------------
// LOAD APPOINTMENTS
// -------------------------

function loadAppointments() {

  fetch(
    'https://beautyloft-backend.onrender.com/my-appointments',
    {
      headers: {
        'Authorization': 'Bearer ' + authToken
      },
      cache: 'no-store'
    }
  )

    .then(function(response) {

      if (!response.ok) {

        if (response.status === 401) {
          localStorage.removeItem('authToken');
          window.location.href = 'login.html';
          return null;
        }

        throw new Error('Could not load appointments.');
      }

      return response.json();

    })

    .then(function(data) {

      if (!data) return;

      const appointments = data.appointments || [];

      displayAppointments(appointments);

    })

    .catch(function(error) {

      console.error(
        'Appointments error:',
        error
      );

      upcomingContainer.innerHTML =
        '<p class="activity-empty">Unable to load your appointments.</p>';

      pastContainer.innerHTML = '';

    });

}


function displayAppointments(appointments) {

  const upcoming = [];
  const past = [];

  appointments.forEach(function(appt) {

    const status =
      (appt.status || '').toLowerCase();

    if (
      status === 'cancelled' ||
      status === 'completed'
    ) {
      past.push(appt);
    } else {
      upcoming.push(appt);
    }

  });


  // UPCOMING

  if (upcoming.length === 0) {

    upcomingContainer.innerHTML =
      '<p class="activity-empty">No upcoming appointments.</p>';

  } else {

    upcomingContainer.innerHTML =
      '<div class="appointment-list">' +
      upcoming.map(createAppointmentCard).join('') +
      '</div>';

  }


  // PAST / CANCELLED

  if (past.length === 0) {

    pastContainer.innerHTML =
      '<p class="activity-empty">No past appointments yet.</p>';

  } else {

    pastContainer.innerHTML =
      '<div class="appointment-list">' +
      past.map(createAppointmentCard).join('') +
      '</div>';

  }

}


// -------------------------
// CREATE APPOINTMENT CARD
// -------------------------

function createAppointmentCard(appt) {

  const status =
    (appt.status || 'pending').toLowerCase();

  return `
    <article class="appointment-card">

      <div class="appointment-date">

        <strong>
          ${formatAppointmentDate(appt.appointment_date)}
        </strong>

        <span>
          ${appt.appointment_time || ''}
        </span>

      </div>


      <div class="appointment-service">

        <h3>
          ${appt.service || 'BeautyLoft Appointment'}
        </h3>

        <p>
          ${appt.booking_ref
            ? 'Booking ' + appt.booking_ref
            : 'BeautyLoft booking'}
        </p>

      </div>


      <div>

        <span
          class="appointment-status status-${status}"
        >
          ${status}
        </span>

      </div>


      <div class="appointment-actions">

        ${
          status !== 'cancelled' &&
          status !== 'completed'

            ? `
              <button
                type="button"
                class="appointment-action-btn reschedule-btn"
                data-id="${appt.id}"
              >
                Reschedule
              </button>

              <button
                type="button"
                class="appointment-action-btn cancel-appt-btn"
                data-id="${appt.id}"
              >
                Cancel
              </button>
            `

            : ''
        }

      </div>

    </article>
  `;

}


// -------------------------
// FORMAT DATE
// -------------------------

function formatAppointmentDate(dateValue) {

  if (!dateValue) return '';

  const parts = dateValue.split('-');

  if (parts.length !== 3) {
    return dateValue;
  }

  const date = new Date(
    Number(parts[0]),
    Number(parts[1]) - 1,
    Number(parts[2])
  );

  return date.toLocaleDateString(
    'en-GB',
    {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }
  );

}

// -------------------------
// CANCEL APPOINTMENT
// -------------------------

document.addEventListener('click', function(event) {

  const cancelButton =
    event.target.closest('.cancel-appt-btn');

  if (!cancelButton) return;

  const appointmentId =
    cancelButton.dataset.id;

  const confirmed = confirm(
    'Are you sure you want to cancel this appointment?'
  );

  if (!confirmed) return;


  cancelButton.disabled = true;
  cancelButton.textContent = 'Cancelling...';


  fetch(
    'https://beautyloft-backend.onrender.com/appointments/' +
    appointmentId +
    '/cancel',
    {
      method: 'PATCH',

      headers: {
        'Authorization': 'Bearer ' + authToken
      }
    }
  )

    .then(function(response) {

      if (!response.ok) {
        throw new Error(
          'Could not cancel appointment.'
        );
      }

      return response.json();

    })

    .then(function() {

      // Reload appointments after cancellation
      loadAppointments();

    })

    .catch(function(error) {

      console.error(
        'Cancel appointment error:',
        error
      );

      alert(
        'We could not cancel your appointment. Please try again.'
      );

      cancelButton.disabled = false;
      cancelButton.textContent = 'Cancel';

    });

});

// -------------------------
// RESCHEDULE APPOINTMENT
// -------------------------

const rescheduleModal =
  document.getElementById('rescheduleModal');

const closeRescheduleModal =
  document.getElementById('closeRescheduleModal');

const rescheduleCalGrid =
  document.getElementById('rescheduleCalGrid');

const rescheduleCalMonthLabel =
  document.getElementById('rescheduleCalMonthLabel');

const rescheduleSlotSection =
  document.getElementById('rescheduleSlotSection');

const rescheduleSlotGrid =
  document.getElementById('rescheduleSlotGrid');

const rescheduleSlotDateLabel =
  document.getElementById('rescheduleSlotDateLabel');

const confirmRescheduleBtn =
  document.getElementById('confirmRescheduleBtn');


let rescheduleApptId = null;

let rescheduleViewDate = new Date();
rescheduleViewDate.setDate(1);

let rescheduleSelectedDate = null;
let rescheduleSelectedTime = null;


const RESCHEDULE_MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

const RESCHEDULE_DOW = [
  'Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat'
];

// -------------------------
// UPDATE RESCHEDULE BUTTON
// -------------------------

function updateRescheduleConfirmState() {

  if (
    rescheduleSelectedDate &&
    rescheduleSelectedTime
  ) {

    confirmRescheduleBtn.disabled = false;

    confirmRescheduleBtn.textContent =
      'Confirm: ' +
      rescheduleSelectedDate.toDateString() +
      ' at ' +
      rescheduleSelectedTime;

  } else {

    confirmRescheduleBtn.disabled = true;

    confirmRescheduleBtn.textContent =
      'Select a new date and time';

  }

}

// -------------------------
// FORMAT DATE AS YYYY-MM-DD
// -------------------------

function toISODateReschedule(date) {

  const year = date.getFullYear();

  const month =
    String(date.getMonth() + 1).padStart(2, '0');

  const day =
    String(date.getDate()).padStart(2, '0');

  return year + '-' + month + '-' + day;

}


// -------------------------
// RENDER RESCHEDULE CALENDAR
// -------------------------

function renderRescheduleCalendar() {

  const year =
    rescheduleViewDate.getFullYear();

  const month =
    rescheduleViewDate.getMonth();


  // Month heading
  rescheduleCalMonthLabel.textContent =
    RESCHEDULE_MONTH_NAMES[month] +
    ' ' +
    year;


  // Clear old calendar
  rescheduleCalGrid.innerHTML = '';


  // -------------------------
  // WEEKDAY HEADINGS
  // -------------------------

  RESCHEDULE_DOW.forEach(function(dayName) {

    const dayHeading =
      document.createElement('div');

    dayHeading.className = 'cal-dow';

    dayHeading.textContent = dayName;

    rescheduleCalGrid.appendChild(
      dayHeading
    );

  });


  // -------------------------
  // FIND FIRST DAY OF MONTH
  // -------------------------

  const firstDay =
    new Date(year, month, 1);

  const startOffset =
    firstDay.getDay();


  // Empty spaces before day 1

  for (
    let i = 0;
    i < startOffset;
    i++
  ) {

    const emptyDay =
      document.createElement('div');

    emptyDay.className =
      'cal-day empty';

    rescheduleCalGrid.appendChild(
      emptyDay
    );

  }


  // -------------------------
  // DAYS IN MONTH
  // -------------------------

  const daysInMonth =
    new Date(
      year,
      month + 1,
      0
    ).getDate();


  const today = new Date();

  today.setHours(0, 0, 0, 0);


  // -------------------------
  // CREATE EACH DAY
  // -------------------------

  for (
    let day = 1;
    day <= daysInMonth;
    day++
  ) {

    const date =
      new Date(year, month, day);

    const dayElement =
      document.createElement('div');

    dayElement.className = 'cal-day';

    dayElement.textContent = day;


    // Past date

    if (date < today) {

      dayElement.classList.add(
        'disabled'
      );

    }

    // Available date

    else {

      dayElement.classList.add(
        'available'
      );


      dayElement.addEventListener(
        'click',
        function() {

          // Remove previous selection

          document
            .querySelectorAll(
              '#rescheduleCalGrid .cal-day.selected'
            )
            .forEach(function(selectedDay) {

              selectedDay.classList.remove(
                'selected'
              );

            });


          // Select this date

          dayElement.classList.add(
            'selected'
          );


          rescheduleSelectedDate =
            date;

          rescheduleSelectedTime =
            null;


          // We'll build this next
          renderRescheduleSlots(date);


          updateRescheduleConfirmState();

        }
      );

    }


    rescheduleCalGrid.appendChild(
      dayElement
    );

  }

}

// -------------------------
// FORMAT APPOINTMENT TIME
// -------------------------

function formatHourReschedule(hour) {

  const period =
    hour >= 12 ? 'PM' : 'AM';

  let hour12 =
    hour % 12;

  if (hour12 === 0) {
    hour12 = 12;
  }

  return hour12 + ':00 ' + period;

}


// -------------------------
// LOAD AVAILABLE TIME SLOTS
// -------------------------

function renderRescheduleSlots(date) {

  rescheduleSlotSection.style.display =
    'block';

  rescheduleSlotDateLabel.textContent =
    date.toDateString();

  rescheduleSlotGrid.innerHTML =
    '<p>Checking availability...</p>';


  const isoDate =
    toISODateReschedule(date);


  fetch(
    'https://beautyloft-backend.onrender.com/availability?date=' +
    isoDate +
    '&bookingType=customer'
  )

    .then(function(response) {

      if (!response.ok) {
        throw new Error(
          'Could not check availability.'
        );
      }

      return response.json();

    })

    .then(function(data) {

      rescheduleSlotGrid.innerHTML = '';


      // -------------------------
      // CLOSED DAY
      // -------------------------

      if (data.closed) {

        rescheduleSlotGrid.innerHTML =
          '<p class="activity-empty">This day is not available.</p>';

        return;
      }


      // -------------------------
      // NO SLOTS
      // -------------------------

      if (
        !data.slots ||
        data.slots.length === 0
      ) {

        rescheduleSlotGrid.innerHTML =
          '<p class="activity-empty">No time slots are available for this date.</p>';

        return;
      }


      // -------------------------
      // CREATE TIME BUTTONS
      // -------------------------

      data.slots.forEach(function(slot) {

        const timeButton =
          document.createElement('button');

        timeButton.type = 'button';

        timeButton.className =
          'slot-pill' +
          (slot.available ? '' : ' booked');

        timeButton.textContent =
          formatHourReschedule(slot.hour);

        timeButton.disabled =
          !slot.available;


        // AVAILABLE SLOT

        if (slot.available) {

          timeButton.addEventListener(
            'click',
            function() {

              // Remove old selected time

              document
                .querySelectorAll(
                  '#rescheduleSlotGrid .slot-pill.selected'
                )
                .forEach(function(selected) {

                  selected.classList.remove(
                    'selected'
                  );

                });


              // Select new time

              timeButton.classList.add(
                'selected'
              );


              rescheduleSelectedTime =
                formatHourReschedule(
                  slot.hour
                );


              updateRescheduleConfirmState();

            }
          );

        }


        rescheduleSlotGrid.appendChild(
          timeButton
        );

      });

    })

    .catch(function(error) {

      console.error(
        'Availability error:',
        error
      );

      rescheduleSlotGrid.innerHTML =
        '<p class="activity-empty">Unable to check availability. Please try again.</p>';

    });

}

// -------------------------
// CONFIRM RESCHEDULE
// -------------------------

confirmRescheduleBtn.addEventListener(
  'click',
  function() {

    if (
      !rescheduleSelectedDate ||
      !rescheduleSelectedTime ||
      !rescheduleApptId
    ) {
      return;
    }


    const isoDate =
      toISODateReschedule(
        rescheduleSelectedDate
      );


    const reasonField =
      document.getElementById(
        'rescheduleReason'
      );

    const reason =
      reasonField
        ? reasonField.value.trim()
        : '';


    // Prevent double clicking

    confirmRescheduleBtn.disabled = true;

    confirmRescheduleBtn.textContent =
      'Rescheduling...';


    fetch(
      'https://beautyloft-backend.onrender.com/appointments/' +
      rescheduleApptId +
      '/reschedule',
      {
        method: 'PATCH',

        headers: {
          'Content-Type': 'application/json',
          'Authorization':
            'Bearer ' + authToken
        },

        body: JSON.stringify({
          date: isoDate,
          time: rescheduleSelectedTime,
          reason: reason
        })
      }
    )

      .then(function(response) {

        if (!response.ok) {

          return response
            .json()
            .catch(function() {
              return {};
            })
            .then(function(data) {

              throw new Error(
                data.error ||
                data.message ||
                'Could not reschedule appointment.'
              );

            });

        }

        return response.json();

      })

      .then(function() {

        // Close modal

        rescheduleModal.style.display =
          'none';


        // Reset selections

        rescheduleApptId = null;
        rescheduleSelectedDate = null;
        rescheduleSelectedTime = null;


        // Reload appointments

        loadAppointments();

      })

      .catch(function(error) {

        console.error(
          'Reschedule error:',
          error
        );

        alert(
          error.message ||
          'We could not reschedule your appointment. Please try again.'
        );


        // Re-enable button

        confirmRescheduleBtn.disabled =
          false;

        updateRescheduleConfirmState();

      });

  }
);

// -------------------------
// OPEN RESCHEDULE MODAL
// -------------------------

document.addEventListener('click', function(event) {

  const rescheduleButton =
    event.target.closest('.reschedule-btn');

  if (!rescheduleButton) return;

  rescheduleApptId =
    rescheduleButton.dataset.id;

  rescheduleSelectedDate = null;
  rescheduleSelectedTime = null;

  rescheduleViewDate = new Date();
  rescheduleViewDate.setDate(1);


  const reason =
    document.getElementById('rescheduleReason');

  if (reason) {
    reason.value = '';
  }


  rescheduleSlotSection.style.display = 'none';

  updateRescheduleConfirmState();

  rescheduleModal.style.display = 'flex';

  renderRescheduleCalendar();

});


// -------------------------
// CLOSE MODAL
// -------------------------

closeRescheduleModal.addEventListener(
  'click',
  function() {

    rescheduleModal.style.display = 'none';

  }
);

// -------------------------
// START
// -------------------------

loadAppointments();