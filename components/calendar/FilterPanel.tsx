import React from 'react';

const FilterPanel: React.FC = () => {
  return (
    <div className="bg-gray-50 rounded-lg shadow-md p-3 sm:p-4 mb-3 sm:mb-4 lg:mb-6 border border-gray-200">
      <div className="flex flex-col md:flex-row md:space-x-4">
        {/* Row 1 */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-2 sm:gap-3 lg:gap-4 mb-3 sm:mb-4 md:mb-0">
          {/* Search Input */}
          <div className="md:col-span-4">
            <label htmlFor="search" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              id="search"
              placeholder="Search project or client"
              className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-xs sm:text-sm min-h-[44px]"
            />
          </div>

          {/* Status Dropdown */}
          <div className="md:col-span-2">
            <label htmlFor="status" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Status</label>
            <select id="status" className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-xs sm:text-sm min-h-[44px]">
              <option>All</option>
              <option>In Progress</option>
              <option>Completed</option>
              <option>Delayed</option>
              <option>On Hold</option>
            </select>
          </div>

          {/* Stage Dropdown */}
          <div className="md:col-span-3">
            <label htmlFor="stage" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Stage</label>
            <select id="stage" className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-xs sm:text-sm min-h-[44px]">
              <option>All</option>
              <option>Design</option>
              <option>CAD</option>
              <option>Casting</option>
              <option>Setting</option>
              <option>Polishing</option>
              <option>Quality Check</option>
            </select>
          </div>

          {/* Partner Dropdown */}
          <div className="md:col-span-3">
            <label htmlFor="partner" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Partner</label>
            <select id="partner" className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-xs sm:text-sm min-h-[44px]">
              <option>All</option>
              <option>Lisa Rodriguez</option>
              <option>Robert Lee</option>
              <option>Mike Chen</option>
              <option>Sarah Johnson</option>
            </select>
          </div>
        </div>
      </div>

      {/* Row 2 */}
      <div className="mt-2 sm:mt-3 lg:mt-4 flex flex-wrap gap-1 sm:gap-2">
        <button className="flex-grow px-2 sm:px-3 lg:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 min-h-[44px]">
          <span className="hidden sm:inline">Due This Week</span>
          <span className="sm:hidden">Due Week</span>
        </button>
        <button className="flex-grow px-2 sm:px-3 lg:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 min-h-[44px]">
          <span className="hidden sm:inline">Overdue Projects</span>
          <span className="sm:hidden">Overdue</span>
        </button>
        <button className="flex-grow px-2 sm:px-3 lg:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 min-h-[44px]">
          <span className="hidden sm:inline">Rush Orders</span>
          <span className="sm:hidden">Rush</span>
        </button>
        <button className="flex-grow px-2 sm:px-3 lg:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 min-h-[44px]">
          <span className="hidden sm:inline">Show Bottlenecks</span>
          <span className="sm:hidden">Bottlenecks</span>
        </button>
      </div>
    </div>
  );
};

export default FilterPanel; 