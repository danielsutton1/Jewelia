"use client";

import { useState } from "react";
import { UserPlus, CheckCircle, XCircle, Briefcase, Bell, MessageSquare, File, AlertTriangle, Clock, Users, Tag, ArrowRight, Inbox, Circle, Check, X, Sparkles, Zap, TrendingUp, Activity, Filter } from "lucide-react";

// --- Notification Types ---
type NotificationType = "connection" | "order" | "assignment" | "task" | "message" | "file" | "stage" | "mention" | "system";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  date: string; // ISO string
  read: boolean;
  actionLabel?: string;
  actionHref?: string;
  actionHandler?: () => void;
  icon?: React.ReactNode;
  meta?: any;
}

// --- Mock Data ---
const mockNotifications: Notification[] = [
  {
    id: "n1",
    type: "connection",
    title: "New Connection Request",
    message: "Ava Thompson sent you a connection request.",
    date: "2024-06-24T10:30:00Z",
    read: false,
    actionLabel: "View Request",
    actionHref: "/dashboard/my-network",
    icon: <UserPlus className="h-5 w-5 text-emerald-600" />,
  },
  {
    id: "n2",
    type: "order",
    title: "New Order Needs Assignment",
    message: "Order ORD-1007 (Ruby Necklace) needs to be assigned.",
    date: "2024-06-24T09:00:00Z",
    read: false,
    actionLabel: "Assign Now",
    actionHref: "/dashboard/tasks",
    icon: <Briefcase className="h-5 w-5 text-blue-600" />,
  },
  {
    id: "n3",
    type: "assignment",
    title: "You Were Assigned to a Task",
    message: "You have been assigned to ORD-1006 (Platinum Band).",
    date: "2024-06-23T16:00:00Z",
    read: false,
    actionLabel: "View Task",
    actionHref: "/dashboard/tasks",
    icon: <CheckCircle className="h-5 w-5 text-green-600" />,
  },
  {
    id: "n4",
    type: "task",
    title: "Task Marked as Urgent",
    message: "ORD-1005 (Gold Pendant) was marked as urgent.",
    date: "2024-06-23T12:00:00Z",
    read: true,
    actionLabel: "View Task",
    actionHref: "/dashboard/tasks",
    icon: <AlertTriangle className="h-5 w-5 text-yellow-600" />,
  },
  {
    id: "n5",
    type: "message",
    title: "New Message",
    message: "You received a new message from Emma Wilson.",
    date: "2024-06-22T18:30:00Z",
    read: false,
    actionLabel: "Open Messages",
    actionHref: "/dashboard/internal-messages",
    icon: <MessageSquare className="h-5 w-5 text-emerald-500" />,
  },
  {
    id: "n6",
    type: "file",
    title: "File Uploaded",
    message: "A new CAD file was uploaded to ORD-1004.",
    date: "2024-06-22T15:00:00Z",
    read: true,
    actionLabel: "View File",
    actionHref: "/dashboard/production/cad",
    icon: <File className="h-5 w-5 text-indigo-500" />,
  },
  {
    id: "n7",
    type: "stage",
    title: "Project Stage Changed",
    message: "ORD-1003 moved to Polishing stage.",
    date: "2024-06-22T10:00:00Z",
    read: true,
    actionLabel: "View Pipeline",
    actionHref: "/dashboard/production/kanban",
    icon: <ArrowRight className="h-5 w-5 text-blue-400" />,
  },
  {
    id: "n8",
    type: "mention",
    title: "You Were Mentioned",
    message: "You were mentioned in a note on ORD-1002.",
    date: "2024-06-21T17:00:00Z",
    read: true,
    actionLabel: "View Note",
    actionHref: "/dashboard/tasks",
    icon: <Tag className="h-5 w-5 text-pink-500" />,
  },
  {
    id: "n9",
    type: "connection",
    title: "Connection Request Accepted",
    message: "Miguel Santos accepted your connection request.",
    date: "2024-06-21T12:00:00Z",
    read: true,
    actionLabel: "View Network",
    actionHref: "/dashboard/my-network",
    icon: <Check className="h-5 w-5 text-green-600" />,
  },
  {
    id: "n10",
    type: "system",
    title: "System Update",
    message: "Your password was changed successfully.",
    date: "2024-06-20T08:00:00Z",
    read: true,
    icon: <Bell className="h-5 w-5 text-gray-400" />,
  },
];

const typeLabels: Record<NotificationType, string> = {
  connection: "Requests",
  order: "Orders",
  assignment: "Assignments",
  task: "Tasks",
  message: "Messages",
  file: "Files",
  stage: "Stages",
  mention: "Mentions",
  system: "System",
};

const typeIcons: Record<NotificationType, React.ReactNode> = {
  connection: <UserPlus className="h-4 w-4 text-emerald-600" />,
  order: <Briefcase className="h-4 w-4 text-blue-600" />,
  assignment: <CheckCircle className="h-4 w-4 text-green-600" />,
  task: <AlertTriangle className="h-4 w-4 text-yellow-600" />,
  message: <MessageSquare className="h-4 w-4 text-emerald-500" />,
  file: <File className="h-4 w-4 text-indigo-500" />,
  stage: <ArrowRight className="h-4 w-4 text-blue-400" />,
  mention: <Tag className="h-4 w-4 text-pink-500" />,
  system: <Bell className="h-4 w-4 text-gray-400" />,
};

const filterTabs: { label: string; value: NotificationType | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Requests", value: "connection" },
  { label: "Orders", value: "order" },
  { label: "Assignments", value: "assignment" },
  { label: "Tasks", value: "task" },
  { label: "Messages", value: "message" },
  { label: "Files", value: "file" },
  { label: "Stages", value: "stage" },
  { label: "Mentions", value: "mention" },
  { label: "System", value: "system" },
];

function groupByDate(notifications: Notification[]) {
  const groups: Record<string, Notification[]> = {};
  for (const n of notifications) {
    const date = new Date(n.date).toLocaleDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(n);
  }
  return groups;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<NotificationType | "all">("all");

  const filtered = filter === "all" ? notifications : notifications.filter(n => n.type === filter);
  const grouped = groupByDate(filtered);
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(ns => ns.map(n => ({ ...n, read: true })));
  };
  const markRead = (id: string) => {
    setNotifications(ns => ns.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100 relative overflow-hidden">
      {/* Luxury Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-green-300/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-green-400/20 to-emerald-300/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-emerald-300/10 to-green-300/10 rounded-full blur-3xl"></div>
      </div>

      {/* Premium Header */}
      <div className="relative z-10 bg-white/80 backdrop-blur-xl border-b border-emerald-200/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg">
                  <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-emerald-700 to-green-700 bg-clip-text text-transparent notifications-heading">
                    Notifications
                  </h1>
                  <p className="text-xs sm:text-sm text-emerald-600 font-medium notifications-subtext">Stay updated with your activity feed</p>
                </div>
              </div>
            </div>
            
            {/* Analytics Summary Cards */}
            <div className="flex items-center space-x-2 sm:space-x-4 overflow-x-auto">
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-2 sm:p-3 border border-emerald-200/50 shadow-lg min-w-[140px] sm:min-w-0">
                <div className="flex items-center space-x-2">
                  <div className="p-1 sm:p-1.5 bg-emerald-100 rounded-lg">
                    <Inbox className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-emerald-600 font-medium">Total</p>
                    <p className="text-sm sm:text-lg font-bold text-emerald-800">{notifications.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-2 sm:p-3 border border-emerald-200/50 shadow-lg min-w-[140px] sm:min-w-0">
                <div className="flex items-center space-x-2">
                  <div className="p-1 sm:p-1.5 bg-red-100 rounded-lg">
                    <Circle className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
                  </div>
                  <div>
                    <p className="text-xs text-red-600 font-medium">Unread</p>
                    <p className="text-sm sm:text-lg font-bold text-red-800">{unreadCount}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-2 sm:p-3 border border-emerald-200/50 shadow-lg min-w-[140px] sm:min-w-0">
                <div className="flex items-center space-x-2">
                  <div className="p-1 sm:p-1.5 bg-green-100 rounded-lg">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-green-600 font-medium">Read</p>
                    <p className="text-sm sm:text-lg font-bold text-green-800">{notifications.length - unreadCount}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-emerald-200/50 shadow-xl p-4 sm:p-6">
          {/* Enhanced Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3 sm:gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-emerald-900">Activity Feed</h2>
              <p className="text-xs sm:text-sm text-emerald-600">Manage your notifications and stay updated</p>
            </div>
            <button 
              className="px-3 sm:px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 min-h-[44px] justify-center" 
              onClick={markAllRead} 
              disabled={unreadCount === 0}
            >
              <Check className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Mark all as read</span>
              <span className="sm:hidden">Mark all read</span>
            </button>
          </div>

          {/* Enhanced Filter Tabs */}
          <div className="flex gap-2 mb-4 sm:mb-6 flex-wrap overflow-x-auto pb-2">
            {filterTabs.map(tab => (
              <button
                key={tab.value}
                className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 border-2 flex items-center gap-1 sm:gap-2 whitespace-nowrap min-h-[44px] min-w-[44px] flex-shrink-0 ${
                  filter === tab.value 
                    ? "bg-gradient-to-r from-emerald-600 to-green-600 text-white border-emerald-600 shadow-lg" 
                    : "bg-white/70 text-emerald-700 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 hover:shadow-md"
                }`}
                onClick={() => setFilter(tab.value)}
              >
                {tab.value !== "all" && typeIcons[tab.value as NotificationType]}
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.length > 8 ? tab.label.substring(0, 8) + '...' : tab.label}</span>
              </button>
            ))}
          </div>

          {/* Enhanced Notifications List */}
          {Object.keys(grouped).length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="p-4 sm:p-6 bg-gradient-to-br from-emerald-100 to-green-100 rounded-full mb-4 sm:mb-6 mx-auto w-16 h-16 sm:w-24 sm:h-24 flex items-center justify-center">
                <Bell className="h-8 w-8 sm:h-12 sm:w-12 text-emerald-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-emerald-900 mb-2">No notifications found</h3>
              <p className="text-sm sm:text-base text-emerald-600">You're all caught up! Check back later for new updates.</p>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {Object.entries(grouped).map(([date, notifs]) => (
                <div key={date}>
                  <div className="text-xs sm:text-sm text-emerald-600 font-semibold mb-2 sm:mb-3 px-2">{date}</div>
                  <div className="space-y-2 sm:space-y-3">
                    {notifs.map(n => (
                      <div
                        key={n.id}
                        className={`flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl shadow-sm border-2 transition-all duration-300 cursor-pointer hover:shadow-md min-h-[44px] ${
                          n.read 
                            ? "bg-white/70 border-emerald-200/50" 
                            : "bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-300 shadow-lg"
                        }`}
                        onClick={() => markRead(n.id)}
                      >
                        <div className="flex-shrink-0">
                          <div className={`p-1.5 sm:p-2 rounded-lg ${n.read ? 'bg-emerald-100' : 'bg-emerald-200'}`}>
                            {typeIcons[n.type]}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`font-semibold text-xs sm:text-sm mb-1 ${n.read ? 'text-emerald-900' : 'text-emerald-800'}`}>
                            {n.title}
                          </div>
                          <div className="text-xs text-emerald-600 truncate">{n.message}</div>
                        </div>
                        <div className="flex flex-col items-end gap-1 sm:gap-2">
                          <div className="text-xs text-emerald-500 font-medium">
                            {new Date(n.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>
                          {n.actionLabel && n.actionHref && (
                            <a 
                              href={n.actionHref} 
                              className="px-2 sm:px-3 py-1 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg text-xs font-semibold hover:from-emerald-700 hover:to-green-700 transition-all duration-300 shadow-sm hover:shadow-md min-h-[44px] flex items-center justify-center" 
                              onClick={e => e.stopPropagation()}
                            >
                              {n.actionLabel}
                            </a>
                          )}
                        </div>
                        {!n.read && (
                          <div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0"></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 