'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

export const WorldCalendar: React.FC = () => {
  const router = useRouter();
  const dateInputRef = React.useRef<HTMLInputElement>(null);
  
  // Base date for the horizon, defaulting to today
  const [baseDate, setBaseDate] = useState(new Date());

  const navigateDays = (direction: number) => {
    const newDate = new Date(baseDate);
    newDate.setDate(baseDate.getDate() + direction * 7);
    setBaseDate(newDate);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      router.push(`/day/${e.target.value}`);
    }
  };

  const days = [];
  // -2 to +4 from baseDate
  for (let i = -2; i <= 4; i++) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + i);
    
    // Check if it's the actual "today" in real time for styling
    const actualToday = new Date();
    const isActualToday = d.toDateString() === actualToday.toDateString();
    
    const dateStr = [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, '0'),
      String(d.getDate()).padStart(2, '0')
    ].join('-');
    
    days.push({
      dateObj: d,
      dateStr: dateStr,
      dayNum: d.getDate(),
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      isToday: isActualToday,
      isPast: d < new Date(new Date().setHours(0,0,0,0)),
      isFuture: d > new Date(new Date().setHours(23,59,59,999)),
      label: isActualToday ? 'Today' : (i < 0 ? 'Past Context' : (i === 1 ? 'Focus Execution' : 'Planned step')),
    });
  }

  const handleDayClick = (dateStr: string) => {
    router.push(`/day/${dateStr}`);
  };

  return (
    <div className="panel" style={{ marginTop: '2rem' }}>
      <div className="section-title compact-title flex justify-between items-end">
        <div>
          <span className="kicker">TIMELINE / 7-DAY HORIZON</span>
          <h2>Where your week connects</h2>
          <span className="text-[#b89b6a] text-xs mt-1 block">A rolling 7-day strip. Click any day to view your journal and GenZ tasks board.</span>
        </div>
        <div className="relative flex items-center">
           <CalendarIcon 
             className="w-5 h-5 text-[#e63946] hover:text-[#f0a500] transition-colors cursor-pointer" 
             onClick={() => {
               if (dateInputRef.current) {
                 try { dateInputRef.current.showPicker(); } catch (e) { dateInputRef.current.focus(); }
               }
             }}
           />
           <div style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
             <input 
               ref={dateInputRef}
               type="date" 
               onChange={handleDateChange}
             />
           </div>
        </div>
      </div>

      <div className="calendar-grid">
        {days.map((day, idx) => (
          <div
            key={day.dateStr}
            onClick={() => handleDayClick(day.dateStr)}
            className={`day-cell cursor-pointer hover:border-[#f0a500]/50 transition-colors ${day.isToday ? 'now' : day.isFuture ? 'future' : 'past'}`}
          >
            <div className="pointer-events-none">
              <small>{day.dayName} {day.dayNum}</small>
              <strong>{day.label}</strong>
            </div>
            <p className="text-xs mt-2 text-[#b89b6a] pointer-events-none">View day overview →</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: '1rem' }}>
        {/* Left Arrow */}
        <button onClick={() => navigateDays(-1)} className="p-2 hover:bg-[#3d2e1e] rounded-full text-[#b89b6a] hover:text-white transition-colors" title="Previous Week">
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Right Arrow */}
        <button onClick={() => navigateDays(1)} className="p-2 hover:bg-[#3d2e1e] rounded-full text-[#b89b6a] hover:text-white transition-colors" title="Next Week">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
