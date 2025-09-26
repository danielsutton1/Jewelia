import React, { FC } from 'react';
import { ProductionProject } from '../types';

interface HistoricalAnalyticsPanelProps {
  projects: ProductionProject[];
}

// Helper: Calculate average stage durations by project type
function getAverageStageDurations(projects: ProductionProject[]) {
  const durations: Record<string, number[]> = {};
  projects.forEach((project) => {
    project.stages.forEach((stage) => {
      if (!durations[stage.name]) durations[stage.name] = [];
      const startDate = new Date(stage.start);
      const endDate = new Date(stage.end);
      const duration = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
      durations[stage.name].push(duration);
    });
  });
  return Object.entries(durations).map(([name, arr]) => ({
    name,
    avg: arr.reduce((a, b) => a + b, 0) / arr.length,
  }));
}

// Helper: Partner performance (on-time %, quality, cost)
function getPartnerPerformance(projects: ProductionProject[]) {
  const perf: Record<string, { onTime: number; total: number; quality: number[]; cost: number[] }> = {};
  projects.forEach((project) => {
    project.stages.forEach((stage) => {
      if (!perf[stage.partner]) perf[stage.partner] = { onTime: 0, total: 0, quality: [], cost: [] };
      perf[stage.partner].total++;
      const stageEnd = new Date(stage.end);
      const actualEnd = stage.actualEnd ? new Date(stage.actualEnd) : stageEnd;
      if (stage.status === 'completed' && actualEnd <= stageEnd) perf[stage.partner].onTime++;
      if (stage.quality) perf[stage.partner].quality.push(stage.quality);
      if (stage.cost) perf[stage.partner].cost.push(stage.cost);
    });
  });
  return Object.entries(perf).map(([partner, data]) => ({
    partner,
    onTimePct: data.total ? (data.onTime / data.total) * 100 : 0,
    avgQuality: data.quality.length ? data.quality.reduce((a, b) => a + b, 0) / data.quality.length : 0,
    avgCost: data.cost.length ? data.cost.reduce((a, b) => a + b, 0) / data.cost.length : 0,
  }));
}

// Helper: Seasonal demand (projects per month)
function getSeasonalDemand(projects: ProductionProject[]) {
  const months: Record<string, number> = {};
  projects.forEach((project) => {
    const startDate = new Date(project.start);
    const month = startDate.getFullYear() + '-' + String(startDate.getMonth() + 1).padStart(2, '0');
    months[month] = (months[month] || 0) + 1;
  });
  return Object.entries(months).map(([month, count]) => ({ month, count }));
}

// Helper: Delivery accuracy (planned vs actual)
function getDeliveryAccuracy(projects: ProductionProject[]) {
  return projects.map((project) => {
    const startDate = new Date(project.start);
    const endDate = new Date(project.end);
    const planned = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const actual = Math.max(...project.stages.map(s => {
      const stageStart = new Date(s.start);
      const stageEnd = s.actualEnd ? new Date(s.actualEnd) : new Date(s.end);
      return (stageEnd.getTime() - stageStart.getTime()) / (1000 * 60 * 60 * 24);
    }));
    return {
      project: project.title || project.name,
      planned,
      actual,
      accuracy: planned > 0 ? (planned / actual) * 100 : 0,
    };
  });
}

export const HistoricalAnalyticsPanel: FC<HistoricalAnalyticsPanelProps> = ({ projects }) => {
  const avgDurations = getAverageStageDurations(projects);
  const partnerPerf = getPartnerPerformance(projects);
  const seasonal = getSeasonalDemand(projects);
  const accuracy = getDeliveryAccuracy(projects);

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-lg font-semibold mb-4">Historical Analytics</h2>
      <div className="mb-6">
        <div className="font-medium mb-2">Average Stage Durations (days)</div>
        <table className="min-w-full border text-xs mb-4">
          <thead><tr><th className="p-1 border-b bg-gray-50">Stage</th><th className="p-1 border-b bg-gray-50">Avg Duration</th></tr></thead>
          <tbody>
            {avgDurations.map((row) => (
              <tr key={row.name}><td className="p-1 border-r">{row.name}</td><td className="p-1">{row.avg.toFixed(1)}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mb-6">
        <div className="font-medium mb-2">Partner Performance</div>
        <table className="min-w-full border text-xs mb-4">
          <thead><tr><th className="p-1 border-b bg-gray-50">Partner</th><th className="p-1 border-b bg-gray-50">On-Time %</th><th className="p-1 border-b bg-gray-50">Avg Quality</th><th className="p-1 border-b bg-gray-50">Avg Cost</th></tr></thead>
          <tbody>
            {partnerPerf.map((row) => (
              <tr key={row.partner}><td className="p-1 border-r">{row.partner}</td><td className="p-1">{row.onTimePct.toFixed(1)}%</td><td className="p-1">{row.avgQuality.toFixed(1)}</td><td className="p-1">${row.avgCost.toFixed(0)}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mb-6">
        <div className="font-medium mb-2">Seasonal Demand</div>
        <div className="flex gap-2">
          {seasonal.map((row) => (
            <div key={row.month} className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-xs">{row.month}: {row.count}</div>
          ))}
        </div>
      </div>
      <div className="mb-6">
        <div className="font-medium mb-2">Delivery Accuracy</div>
        <table className="min-w-full border text-xs mb-4">
          <thead><tr><th className="p-1 border-b bg-gray-50">Project</th><th className="p-1 border-b bg-gray-50">Planned (days)</th><th className="p-1 border-b bg-gray-50">Actual (days)</th><th className="p-1 border-b bg-gray-50">Accuracy %</th></tr></thead>
          <tbody>
            {accuracy.map((row) => (
              <tr key={row.project}><td className="p-1 border-r">{row.project}</td><td className="p-1">{row.planned.toFixed(1)}</td><td className="p-1">{row.actual.toFixed(1)}</td><td className="p-1">{row.accuracy.toFixed(1)}%</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}; 
 
 
 
 