'use client';

import React from 'react';

export const WorldCalendar: React.FC = () => {
  const today = new Date();
  const days = [];

  for (let i = -2; i <= 4; i++) {
    const d = new Date();
    d.setDate(today.getDate() + i);
    days.push({
      date: d,
      dayNum: d.getDate(),
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      isToday: i === 0,
      isPast: i < 0,
      isFuture: i > 0,
      label: i === 0 ? 'Today' : i < 0 ? 'Past Context' : i === 1 ? 'Focus Execution' : i === 2 ? 'Reflection' : i === 3 ? 'Experiment' : 'Weekly Reset',
      detail: i === 0 ? 'Execute active step' : i < 0 ? 'Captured reflection' : 'Planned execution step'
    });
  }

  return (
    <div className="panel" style={{ marginTop: '2rem' }}>
      <div className="section-title compact-title">
        <div>
          <span className="kicker">TIMELINE / 7-DAY HORIZON</span>
          <h2>Where your week connects</h2>
        </div>
        <span>A rolling 7-day strip so past context and future steps remain visible.</span>
      </div>

      <div className="calendar-grid">
        {days.map((day, idx) => (
          <div
            key={idx}
            className={`day-cell ${day.isToday ? 'now' : day.isFuture ? 'future' : 'past'}`}
          >
            <div>
              <small>{day.dayName} {day.dayNum}</small>
              <strong>{day.label}</strong>
            </div>
            <p>{day.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
