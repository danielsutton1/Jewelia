'use client';

import React, { useState, useEffect } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  add,
  isWithinInterval,
  differenceInDays,
  differenceInCalendarDays,
  isFirstDayOfMonth,
} from 'date-fns';
import { getOrders } from '../lib/database';
import { ProjectTimeline } from './calendar/types';
import { Order, Customer, OrderItem } from '@/types/database';

// Helper to assign a color based on the project name or ID
const a = "a".charCodeAt(0);
const z = "z".charCodeAt(0);
const colorRange = z - a;

function generateColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 50%)`;
}

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [hoveredProject, setHoveredProject] = useState<ProjectTimeline | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [selectedProject, setSelectedProject] = useState<ProjectTimeline | null>(null);
  const [projectTimelines, setProjectTimelines] = useState<ProjectTimeline[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const orders: (Order & { customer: Customer | null; items: OrderItem[] })[] = await getOrders();
        
        const timelines = orders.map(order => {
          const startDate = new Date(order.created_at);
          // Assuming a 14-day production time for each order
          const endDate = add(startDate, { days: 14 });

          return {
            id: order.id,
            name: `Order #${order.id.substring(0, 5)}`,
            client: order.customer ? order.customer.full_name : 'Unknown Customer',
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            color: generateColor(order.id),
            currentStage: order.status,
            assignedPartner: 'N/A', // This info is not available in the Order object
          };
        });
        
        setProjectTimelines(timelines);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      }
    };

    fetchOrders();
  }, []);

  const firstDayOfMonth = startOfMonth(currentDate);
  const lastDayOfMonth = endOfMonth(currentDate);

  const days = eachDayOfInterval({
    start: firstDayOfMonth,
    end: lastDayOfMonth,
  });

  const handlePrevMonth = () => {
    setCurrentDate(add(currentDate, { months: -1 }));
  };

  const handleNextMonth = () => {
    setCurrentDate(add(currentDate, { months: 1 }));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Calculate project status
  const getProjectStatus = (project: ProjectTimeline) => {
    const today = new Date();
    const endDate = new Date(project.endDate);
    const daysRemaining = differenceInCalendarDays(endDate, today);
    
    if (daysRemaining < 0) return 'overdue';
    if (daysRemaining <= 3) return 'at-risk';
    return 'on-track';
  };

  // Calculate project value
  const getProjectValue = (project: ProjectTimeline) => {
    const values: { [key: string]: number } = {
      '1': 8500, '2': 3200, '3': 12000, '4': 6800, '5': 9500, '6': 7800,
    };
    return values[project.id] || 5000;
  };

  const getDayProjects = (day: Date) => {
    return projectTimelines.filter((p: ProjectTimeline) => 
      isWithinInterval(day, { start: new Date(p.startDate), end: new Date(p.endDate) })
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-4 gap-2 sm:gap-3 lg:gap-4">
        <h2 className="text-base sm:text-lg lg:text-xl font-bold">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <div className="flex space-x-1 sm:space-x-2">
          <button onClick={handlePrevMonth} className="px-2 sm:px-3 py-1 bg-gray-200 rounded text-xs sm:text-sm min-h-[44px] min-w-[44px]">&lt;</button>
          <button onClick={handleToday} className="px-2 sm:px-3 py-1 bg-gray-200 rounded text-xs sm:text-sm min-h-[44px] min-w-[44px]">
            <span className="hidden sm:inline">Today</span>
            <span className="sm:hidden">Today</span>
          </button>
          <button onClick={handleNextMonth} className="px-2 sm:px-3 py-1 bg-gray-200 rounded text-xs sm:text-sm min-h-[44px] min-w-[44px]">&gt;</button>
        </div>
      </div>

      <div className="grid grid-cols-7 text-center text-xs sm:text-sm font-semibold text-gray-600 border-b pb-1 sm:pb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day}>{day}</div>)}
      </div>

      <div className="grid grid-cols-7 grid-rows-5 gap-px">
        {days.map(day => {
          const dayProjects = getDayProjects(day);
          const isToday = isSameDay(day, new Date());
          const isWeekend = day.getDay() === 0 || day.getDay() === 6;

          return (
            <div
              key={day.toString()}
              className={`relative border-r border-b p-1 h-20 sm:h-24 lg:h-28 xl:h-36 ${isWeekend ? 'bg-gray-50' : ''}`}
            >
              <span className={`text-xs ${isToday ? 'font-bold text-blue-600' : 'text-gray-500'}`}>
                {format(day, 'd')}
              </span>
              <div className="mt-1 space-y-0.5 sm:space-y-1">
                {dayProjects.map(project => {
                  const isStartDate = isSameDay(day, new Date(project.startDate));
                  return (
                    <div
                      key={project.id}
                      className="text-white text-xs rounded px-1 cursor-pointer min-h-[14px] sm:min-h-[16px] lg:min-h-[18px]"
                      style={{ backgroundColor: project.color }}
                      onMouseEnter={(e) => {
                        setHoveredProject(project);
                        setTooltipPosition({ x: e.clientX, y: e.clientY });
                      }}
                      onMouseLeave={() => setHoveredProject(null)}
                      onClick={() => setSelectedProject(project)}
                    >
                      {isStartDate && (
                        <>
                          <span className="hidden sm:inline">{project.name}</span>
                          <span className="sm:hidden">{project.name.split('#')[1]?.substring(0, 3) || 'P'}</span>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {hoveredProject && (
        <div
          className="fixed z-50 bg-gray-900 text-white p-2 sm:p-3 rounded-lg shadow-lg text-xs sm:text-sm max-w-[240px] sm:max-w-[280px] lg:max-w-xs"
          style={{ left: tooltipPosition.x + 10, top: tooltipPosition.y + 10 }}
        >
          <div className="font-bold mb-1">{hoveredProject.name}</div>
          <div className="text-gray-300 mb-1">Client: {hoveredProject.client}</div>
          <div className="text-gray-300 mb-1">Stage: {hoveredProject.currentStage}</div>
          <div className="text-gray-300 mb-1">
            Value: ${getProjectValue(hoveredProject).toLocaleString()}
          </div>
          <div className={`font-semibold ${
            getProjectStatus(hoveredProject) === 'overdue' ? 'text-red-400' :
            getProjectStatus(hoveredProject) === 'at-risk' ? 'text-yellow-400' :
            'text-green-400'
          }`}>
            {getProjectStatus(hoveredProject) === 'overdue' ?
              `${Math.abs(differenceInCalendarDays(new Date(hoveredProject.endDate), new Date()))} days overdue` :
              `${differenceInCalendarDays(new Date(hoveredProject.endDate), new Date())} days remaining`
            }
          </div>
        </div>
      )}

      {selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm sm:max-w-md lg:max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-3 sm:p-4 lg:p-6">
              <div className="flex justify-between items-start mb-3 sm:mb-4">
                <div>
                  <h3 className="text-base sm:text-lg lg:text-xl font-bold">{selectedProject.name}</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Client: {selectedProject.client}</p>
                </div>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="text-gray-400 hover:text-gray-600 text-lg sm:text-xl lg:text-2xl min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  &times;
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 lg:gap-4 text-xs sm:text-sm">
                 <div>
                   <h4 className="font-semibold mb-1 sm:mb-2">Details</h4>
                   <p>Status: {selectedProject.currentStage}</p>
                   <p>Partner: {selectedProject.assignedPartner}</p>
                   <p>Value: ${getProjectValue(selectedProject).toLocaleString()}</p>
                 </div>
                 <div>
                   <h4 className="font-semibold mb-1 sm:mb-2">Timeline</h4>
                   <p>Start: {format(new Date(selectedProject.startDate), 'MMM d, yyyy')}</p>
                   <p>End: {format(new Date(selectedProject.endDate), 'MMM d, yyyy')}</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar; 