import React, { useState } from 'react';

import Button from '../../../components/ui/Button';

const TeamCalendar = ({ events }) => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 11, 31));

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)?.getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)?.getDay();

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getEventsForDay = (day) => {
    return events?.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate?.getDate() === day &&
             eventDate?.getMonth() === currentDate?.getMonth() &&
             eventDate?.getFullYear() === currentDate?.getFullYear();
    });
  };

  const isToday = (day) => {
    const today = new Date(2025, 11, 31);
    return day === today?.getDate() &&
           currentDate?.getMonth() === today?.getMonth() &&
           currentDate?.getFullYear() === today?.getFullYear();
  };

  return (
    <div className="bg-card rounded-xl shadow-warm p-4 md:p-5 lg:p-6">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="font-heading font-semibold text-lg md:text-xl lg:text-2xl text-foreground">
          Team Calendar
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            iconName="ChevronLeft"
            iconSize={18}
            onClick={handlePrevMonth}
          />
          <span className="text-sm md:text-base font-medium text-foreground px-2 md:px-4 whitespace-nowrap">
            {monthNames?.[currentDate?.getMonth()]} {currentDate?.getFullYear()}
          </span>
          <Button
            variant="outline"
            size="icon"
            iconName="ChevronRight"
            iconSize={18}
            onClick={handleNextMonth}
          />
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']?.map((day) => (
          <div key={day} className="text-center text-xs md:text-sm font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 md:gap-2">
        {Array.from({ length: firstDayOfMonth })?.map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square" />
        ))}

        {Array.from({ length: daysInMonth })?.map((_, index) => {
          const day = index + 1;
          const dayEvents = getEventsForDay(day);
          const today = isToday(day);

          return (
            <div
              key={day}
              className={`
                aspect-square p-1 md:p-2 rounded-lg transition-smooth cursor-pointer
                ${today ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'}
              `}
            >
              <div className="text-xs md:text-sm font-medium mb-1">{day}</div>
              {dayEvents?.length > 0 && (
                <div className="space-y-0.5">
                  {dayEvents?.slice(0, 2)?.map((event, idx) => (
                    <div
                      key={idx}
                      className={`w-full h-1 rounded-full ${
                        event?.type === 'meeting' ? 'bg-accent' :
                        event?.type === 'deadline'? 'bg-error' : 'bg-success'
                      }`}
                    />
                  ))}
                  {dayEvents?.length > 2 && (
                    <div className="text-[10px] text-muted-foreground">+{dayEvents?.length - 2}</div>
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