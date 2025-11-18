
import React, { useState, useRef, useEffect } from 'react';
import { CalendarIcon, ChevronDownIcon } from './icons';

interface DateRangeFilterProps {
  currentRange: string | { start: Date; end: Date };
  onRangeChange: (range: string | { start: Date; end: Date }) => void;
}

const dateRanges = ['Last 30 Days', 'Last 90 Days', 'This Year', 'Last Year'];

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({ currentRange, onRangeChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const handleSelectPreset = (range: string) => {
    onRangeChange(range);
    setIsOpen(false);
  };

  const handleApplyCustom = () => {
    if (customStartDate && customEndDate) {
        // Construct date at start of day in local timezone to avoid UTC shifts
        const start = new Date(customStartDate + 'T00:00:00');
        const end = new Date(customEndDate + 'T23:59:59');
        
        if (start > end) {
            alert('Start date cannot be after end date.');
            return;
        }

        onRangeChange({ start, end });
        setIsOpen(false);
    }
  };
  
  const getButtonText = () => {
    if (typeof currentRange === 'string') {
        return currentRange;
    }
    if (currentRange?.start && currentRange?.end) {
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
        return `${currentRange.start.toLocaleDateString(undefined, options)} - ${currentRange.end.toLocaleDateString(undefined, options)}`;
    }
    return 'Select Date Range';
  };

  return (
    <div className="relative inline-block text-left w-full sm:w-auto" ref={wrapperRef}>
      <div>
        <button
          type="button"
          className="inline-flex justify-center w-full rounded-md border border-gray-700 shadow-sm px-4 py-2 bg-gray-900 text-base font-medium text-gray-300 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-[#d356f8]"
          onClick={() => setIsOpen(!isOpen)}
        >
          <CalendarIcon className="mr-2 -ml-1 h-5 w-5 text-gray-400" />
          {getButtonText()}
          <ChevronDownIcon className="ml-2 -mr-1 h-5 w-5" />
        </button>
      </div>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-72 rounded-md shadow-lg bg-gray-900 ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            {dateRanges.map((range) => (
              <button
                key={range}
                onClick={() => handleSelectPreset(range)}
                className={`${
                  currentRange === range ? 'bg-[#d356f8] text-white' : 'text-gray-300'
                } block w-full text-left px-4 py-2 text-base hover:bg-gray-700 hover:text-white`}
                role="menuitem"
              >
                {range}
              </button>
            ))}
            <div className="border-t border-gray-700 my-1"></div>
            <div className="px-4 py-2 space-y-2">
                <p className="text-base font-medium text-gray-200">Custom Range</p>
                <div>
                    <label htmlFor="start-date" className="text-sm text-gray-400">Start Date</label>
                    <input 
                        type="date" 
                        id="start-date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="mt-1 w-full bg-gray-700 border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#d356f8] text-base px-2 py-1"
                    />
                </div>
                <div>
                    <label htmlFor="end-date" className="text-sm text-gray-400">End Date</label>
                    <input 
                        type="date" 
                        id="end-date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="mt-1 w-full bg-gray-700 border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#d356f8] text-base px-2 py-1"
                    />
                </div>
                <button
                    onClick={handleApplyCustom}
                    className="w-full bg-[#d356f8] text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-[#b844d9] transition duration-300 disabled:bg-gray-600"
                    disabled={!customStartDate || !customEndDate}
                >
                    Apply
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangeFilter;
