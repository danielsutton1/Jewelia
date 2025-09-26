"use client"

import React from "react";
import Calendar from "../../../components/Calendar";
import FilterPanel from "../../../components/calendar/FilterPanel";

const CalendarPage: React.FC = () => {
  return (
    <div className="container mx-auto py-3 sm:py-4 lg:py-6 px-3 sm:px-4 lg:px-6 space-y-3 sm:space-y-4 lg:space-y-6">
      <div>
        <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold tracking-tight calendar-heading">Production Calendar</h1>
        <p className="text-xs sm:text-sm lg:text-base text-muted-foreground mt-1 sm:mt-2 calendar-subtext">
          View and manage production timelines
        </p>
      </div>
      
      <FilterPanel />

      <div className="h-[calc(100vh-240px)] sm:h-[calc(100vh-280px)] lg:h-[calc(100vh-320px)] xl:h-[calc(100vh-340px)]"> 
        <Calendar />
      </div>
    </div>
  );
};

export default CalendarPage;