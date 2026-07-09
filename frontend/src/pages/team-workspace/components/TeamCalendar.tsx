import React, { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns';
import Icon from '../../../components/AppIcon';

const TeamCalendar = ({ events = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days: Date[] = [];
  let day = calendarStart;
  while (day <= calendarEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const getEventsForDay = (date: Date) =>
    events.filter((event: any) => isSameDay(new Date(event.date), date));

  return (
    <div className="bg-card border border-border rounded-xl shadow-soft-sm p-4 md:p-5 lg:p-6">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="font-heading font-semibold text-lg md:text-xl lg:text-2xl text-foreground">
          Team Calendar
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="p-1.5 rounded-lg hover:bg-muted transition-smooth text-muted-foreground hover:text-foreground"
          >
            <Icon name="ChevronLeft" size={18} color="currentColor" />
          </button>
          <span className="text-sm md:text-base font-medium text-foreground px-2 md:px-4 whitespace-nowrap">
            {format(currentDate, 'MMMM yyyy')}
          </span>
          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="p-1.5 rounded-lg hover:bg-muted transition-smooth text-muted-foreground hover:text-foreground"
          >
            <Icon name="ChevronRight" size={18} color="currentColor" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="text-center text-xs md:text-sm font-medium text-muted-foreground py-2">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 md:gap-2">
        {days.map((date, idx) => {
          const dayEvents = getEventsForDay(date);
          const today = isToday(date);
          const sameMonth = isSameMonth(date, currentDate);

          return (
            <div
              key={idx}
              className={`
                aspect-square rounded-lg transition-smooth cursor-pointer flex flex-col items-center justify-center
                ${today ? 'bg-primary text-primary-foreground shadow-soft-sm' : ''}
                ${!today && sameMonth ? 'bg-background hover:bg-muted border border-border/50 text-foreground' : ''}
                ${!sameMonth ? 'opacity-40' : 'text-foreground'}
              `}
            >
              <span className="text-xs md:text-sm font-medium leading-none">{format(date, 'd')}</span>
              {dayEvents.length > 0 && (
                <div className="space-y-0.5">
                  {dayEvents.slice(0, 2).map((event: any, idx: number) => (
                    <div
                      key={idx}
                      className={`w-full h-1.5 rounded-full ${
                        event.type === 'meeting' ? 'bg-accent' :
                        event.type === 'deadline' ? 'bg-error' : 'bg-success'
                      }`}
                    />
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-[10px] text-muted-foreground">+{dayEvents.length - 2}</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 md:mt-6 pt-4 border-t border-border">
        <div className="flex items-center gap-4 md:gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-accent rounded-full" />
            <span className="text-xs text-muted-foreground">Meetings</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-error rounded-full" />
            <span className="text-xs text-muted-foreground">Deadlines</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-success rounded-full" />
            <span className="text-xs text-muted-foreground">Events</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamCalendar;
