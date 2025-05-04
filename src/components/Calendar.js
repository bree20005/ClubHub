// src/components/Calendar.js
import React from 'react';

function Calendar() {
  return (
    <div className="calendar-page">
      <h1>Upcoming Events</h1>
      <iframe
        src="https://calendar.google.com/calendar/u/0/embed?src=17aef904dacc1ed5d39370a557f5e89860611b4120b95917be618289d55a28bc@group.calendar.google.com&ctz=America/Los_Angeles"
        style={{ border: 0 }}
        width="800"
        height="600"
        frameBorder="0"
        scrolling="no"
        title="Club Google Calendar"
      ></iframe>
    </div>
  );
}

export default Calendar;
