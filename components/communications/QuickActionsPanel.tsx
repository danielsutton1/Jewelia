import { useState } from 'react';

const mockActivity = [
  { id: 1, type: 'project', text: "Started new project: Sarah's Engagement Ring", time: '2m ago' },
  { id: 2, type: 'invite', text: 'Invited partner: Goldsmiths Inc.', time: '10m ago' },
  { id: 3, type: 'update', text: 'Sent update to client: John D.', time: '30m ago' },
  { id: 4, type: 'project', text: 'Started new project: Custom Wedding Set', time: '1h ago' },
];

export default function QuickActionsPanel() {
  const [activity, setActivity] = useState(mockActivity);

  // Placeholder handlers
  const handleNewProject = () => alert('Start New Project Conversation (modal coming soon)');
  const handleInvitePartner = () => alert('Invite Partner (modal coming soon)');
  const handleSendUpdate = () => alert('Send Client Update (modal coming soon)');

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 h-full flex flex-col">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Quick Actions</h2>
      <div className="flex flex-col gap-2 mb-6">
        <button
          onClick={handleNewProject}
          className="w-full px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm transition"
        >
          Start New Project Conversation
        </button>
        <button
          onClick={handleInvitePartner}
          className="w-full px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold shadow-sm transition"
        >
          Invite Partner
        </button>
        <button
          onClick={handleSendUpdate}
          className="w-full px-4 py-2 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-white font-semibold shadow-sm transition"
        >
          Send Client Update
        </button>
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Recent Network Activity</h3>
        <ul className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {activity.length === 0 && (
            <li className="text-xs text-gray-400">No recent activity.</li>
          )}
          {activity.map(item => (
            <li key={item.id} className="flex items-center gap-2 text-xs bg-gray-50 rounded-lg px-2 py-2 shadow-sm">
              <span className={`inline-block w-2 h-2 rounded-full ${item.type === 'project' ? 'bg-emerald-400' : item.type === 'invite' ? 'bg-blue-400' : 'bg-yellow-400'}`}></span>
              <span className="flex-1 text-gray-700">{item.text}</span>
              <span className="text-gray-400 ml-2 whitespace-nowrap">{item.time}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 