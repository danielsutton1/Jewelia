import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowUpRight, ArrowDownRight, CheckCircle, AlertTriangle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const communicationMetrics = {
  responseTime: {
    average: '2.3 hours',
    thisWeek: '1.8 hours',
    trend: 'improving'
  },
  projectsOnTrack: {
    percentage: 87,
    total: 23,
    onTime: 20,
    delayed: 3
  },
  clientSatisfaction: {
    score: 4.6,
    totalResponses: 15,
    trend: 'stable'
  },
  weeklyActivity: {
    messagesSent: 156,
    projectUpdates: 23,
    clientCheckIns: 8,
    partnerCollaborations: 12
  }
};

export default function CommunicationInsights() {
  return (
    <Card className="bg-white rounded-lg shadow p-4 h-full flex flex-col">
      <h2 className="text-lg font-semibold mb-3">Communication Insights</h2>
      {/* Response Time */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1">
          <div className="text-xs text-gray-500">Avg. Response Time</div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">{communicationMetrics.responseTime.average}</span>
            {communicationMetrics.responseTime.trend === "improving" ? (
              <ArrowDownRight className="h-5 w-5 text-emerald-600" />
            ) : (
              <ArrowUpRight className="h-5 w-5 text-red-600" />
            )}
            <span className="text-xs text-gray-400">(This week: {communicationMetrics.responseTime.thisWeek})</span>
          </div>
        </div>
      </div>
      {/* Project Delivery */}
      <div className="mb-3">
        <div className="text-xs text-gray-500 mb-1">Projects On Track</div>
        <div className="flex items-center gap-2">
          <Progress value={communicationMetrics.projectsOnTrack.percentage} className="h-2 flex-1" />
          <span className="text-sm font-semibold">{communicationMetrics.projectsOnTrack.percentage}%</span>
          <CheckCircle className="h-4 w-4 text-emerald-600" />
        </div>
        <div className="text-xs text-gray-400 mt-1">
          {communicationMetrics.projectsOnTrack.onTime} on time, {communicationMetrics.projectsOnTrack.delayed} delayed
        </div>
      </div>
      {/* Client Satisfaction */}
      <div className="mb-3">
        <div className="text-xs text-gray-500 mb-1">Client Satisfaction</div>
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold">{communicationMetrics.clientSatisfaction.score}</span>
          <Star className="h-5 w-5 text-yellow-400" />
          <span className="text-xs text-gray-400">({communicationMetrics.clientSatisfaction.totalResponses} responses)</span>
        </div>
        <div className="text-xs text-gray-400 mt-1">Trend: {communicationMetrics.clientSatisfaction.trend}</div>
      </div>
      {/* Communication Volume */}
      <div className="mb-3">
        <div className="text-xs text-gray-500 mb-1">This Week's Activity</div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-emerald-50 rounded p-2 flex flex-col items-center">
            <span className="font-bold text-lg">{communicationMetrics.weeklyActivity.messagesSent}</span>
            <span className="text-xs text-gray-500">Messages Sent</span>
          </div>
          <div className="bg-blue-50 rounded p-2 flex flex-col items-center">
            <span className="font-bold text-lg">{communicationMetrics.weeklyActivity.projectUpdates}</span>
            <span className="text-xs text-gray-500">Project Updates</span>
          </div>
          <div className="bg-yellow-50 rounded p-2 flex flex-col items-center">
            <span className="font-bold text-lg">{communicationMetrics.weeklyActivity.clientCheckIns}</span>
            <span className="text-xs text-gray-500">Client Check-ins</span>
          </div>
          <div className="bg-purple-50 rounded p-2 flex flex-col items-center">
            <span className="font-bold text-lg">{communicationMetrics.weeklyActivity.partnerCollaborations}</span>
            <span className="text-xs text-gray-500">Partner Collabs</span>
          </div>
        </div>
      </div>
      {/* Quick Actions */}
      <div className="flex gap-2 mt-auto">
        <Button className="flex-1" size="sm" variant="outline" onClick={() => alert("Sending weekly report")}>Send Weekly Report</Button>
        <Button className="flex-1" size="sm" variant="secondary" onClick={() => alert("Scheduling check-ins")}>Schedule Check-ins</Button>
      </div>
    </Card>
  );
}