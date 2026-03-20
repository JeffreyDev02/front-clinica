import React from 'react';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, Plus } from 'lucide-react';

const Appointments = () => {
  const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const dates = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <h1>Calendario de Citas</h1>
          <p>Organiza y supervisa la agenda médica mensual.</p>
        </div>
        <button className="btn-primary">
          <Plus size={18} />
          <span>Agendar Cita</span>
        </button>
      </header>

      <section className="calendar-container glass">
        <header className="calendar-header">
          <div className="current-month">
            <CalendarIcon size={20} />
            <h2>Marzo 2025</h2>
          </div>
          <div className="calendar-nav">
            <button className="btn-icon"><ChevronLeft size={20} /></button>
            <button className="btn-secondary">Hoy</button>
            <button className="btn-icon"><ChevronRight size={20} /></button>
          </div>
        </header>

        <div className="calendar-grid">
          {days.map(day => <div key={day} className="day-name">{day}</div>)}
          {/* Empty slots for starting offset if needed */}
          <div className="day-slot empty"></div>
          <div className="day-slot empty"></div>
          <div className="day-slot empty"></div>
          <div className="day-slot empty"></div>
          {dates.map(date => (
            <div key={date} className={`day-slot ${date === 20 ? 'today' : ''}`}>
              <span className="date-number">{date}</span>
              {date === 20 && (
                <div className="event blue">8 Citas</div>
              )}
              {date === 22 && (
                <div className="event green">4 Citas</div>
              )}
            </div>
          ))}
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        .calendar-container {
          padding: 2rem;
          border-radius: var(--radius);
        }

        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .current-month {
          display: flex;
          align-items: center;
          gap: 1rem;
          color: var(--text-main);
        }

        .current-month h2 {
          font-size: 1.5rem;
          font-weight: 700;
        }

        .calendar-nav {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 1px;
          background: var(--border);
          border: 1px solid var(--border);
        }

        .day-name {
          background: var(--surface);
          padding: 1rem;
          text-align: center;
          font-weight: 700;
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        .day-slot {
          background: var(--surface);
          min-height: 120px;
          padding: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          transition: var(--transition);
        }

        .day-slot:hover {
          background: var(--background);
        }

        .day-slot.empty {
          background: var(--background);
        }

        .day-slot.today {
          background: rgba(14, 165, 233, 0.03);
        }

        .date-number {
          font-weight: 600;
          font-size: 0.875rem;
        }

        .today .date-number {
          color: var(--primary);
          background: rgba(14, 165, 233, 0.1);
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
        }

        .event {
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
        }

        .event.blue {
          background: rgba(14, 165, 233, 0.1);
          color: var(--primary);
          border-left: 3px solid var(--primary);
        }

        .event.green {
          background: rgba(45, 212, 191, 0.1);
          color: var(--accent);
          border-left: 3px solid var(--accent);
        }
      `}} />
    </div>
  );
};

export default Appointments;
