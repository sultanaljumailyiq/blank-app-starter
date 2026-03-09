import React, { useRef } from 'react';
import { addDays, format, isSameDay, startOfWeek, subDays } from 'date-fns';
import { arMA } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HorizontalCalendarProps {
    selectedDate: Date;
    onDateSelect: (date: Date) => void;
    appointments?: { date: string }[];
}

export const HorizontalCalendar: React.FC<HorizontalCalendarProps> = ({
    selectedDate,
    onDateSelect,
    appointments = []
}) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Create an array of 30 days starting from 2 days ago
    const days = Array.from({ length: 30 }, (_, i) => addDays(subDays(new Date(), 2), i));

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 200;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                    {format(selectedDate, 'MMMM yyyy', { locale: arMA })}
                </h3>
                <div className="flex gap-2">
                    <button
                        onClick={() => scroll('right')}
                        className="p-1 hover:bg-gray-100 rounded-full text-gray-600"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => scroll('left')}
                        className="p-1 hover:bg-gray-100 rounded-full text-gray-600"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div
                ref={scrollContainerRef}
                className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {days.map((date) => {
                    const isSelected = isSameDay(date, selectedDate);
                    const dateStr = format(date, 'yyyy-MM-dd');
                    const hasAppointments = appointments.some(apt => apt.date === dateStr);
                    const isToday = isSameDay(date, new Date());

                    return (
                        <button
                            key={date.toISOString()}
                            onClick={() => onDateSelect(date)}
                            className={`
                flex-shrink-0 flex flex-col items-center justify-center
                w-16 h-20 rounded-2xl transition-all duration-200 border
                ${isSelected
                                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200 scale-105'
                                    : 'bg-white border-gray-100 hover:border-blue-200 hover:bg-blue-50'
                                }
              `}
                        >
                            <span className={`text-xs font-medium mb-1 ${isSelected ? 'text-blue-100' : 'text-gray-500'}`}>
                                {format(date, 'EEE', { locale: arMA })}
                            </span>
                            <span className={`text-xl font-bold ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                                {format(date, 'd')}
                            </span>

                            <div className="flex gap-1 mt-1">
                                {isToday && !isSelected && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                )}
                                {hasAppointments && (
                                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-green-500'}`}></span>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
