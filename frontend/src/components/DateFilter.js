// components/DateFilter.js
import React from "react";

const DateFilter = ({ range, setRange, customRange, setCustomRange }) => {
  const handleDateChange = (e) => {
    setCustomRange({
      ...customRange,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="flex flex-col gap-2 mb-4">
      <div className="flex items-center gap-4">
        <label className="font-semibold text-gray-700">Filter by:</label>
        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1"
        >
          <option value="7days">Last 7 Days</option>
          <option value="month">This Month</option>
          <option value="all">All Time</option>
          <option value="custom">Custom Range</option>
        </select>
      </div>

      {range === "custom" && (
        <div className="flex gap-4 items-center">
          <div className="flex flex-col">
            <label className="text-sm text-gray-600">Start Date</label>
            <input
              type="date"
              name="start"
              value={customRange.start}
              onChange={handleDateChange}
              className="border border-gray-300 rounded px-2 py-1"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm text-gray-600">End Date</label>
            <input
              type="date"
              name="end"
              value={customRange.end}
              onChange={handleDateChange}
              className="border border-gray-300 rounded px-2 py-1"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DateFilter;
