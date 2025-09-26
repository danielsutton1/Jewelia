"use client";

import { useState } from "react";
import { UserPlus, CheckCircle, XCircle, Briefcase, Bell, MessageSquare, File, AlertTriangle, Clock, Users, Tag, ArrowRight, Inbox, Circle, Check, X } from "lucide-react";

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
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Notifications</h1>
          <button className="text-xs px-3 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition" onClick={markAllRead} disabled={unreadCount === 0}>
            Mark all as read
          </button>
        </div>
        <div className="flex gap-2 mb-6 flex-wrap">
          {filterTabs.map(tab => (
            <button
              key={tab.value}
              className={`px-3 py-1 rounded text-xs font-semibold transition border ${filter === tab.value ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"}`}
              onClick={() => setFilter(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {Object.keys(grouped).length === 0 && (
          <div className="text-center text-gray-400 py-12">No notifications found.</div>
        )}
        <div className="space-y-8">
          {Object.entries(grouped).map(([date, notifs]) => (
            <div key={date}>
              <div className="text-xs text-gray-400 font-semibold mb-2">{date}</div>
              <div className="space-y-2">
                {notifs.map(n => (
                  <div
                    key={n.id}
                    className={`flex items-center gap-4 p-4 rounded-lg shadow-sm border transition cursor-pointer ${n.read ? "bg-white" : "bg-emerald-50 border-emerald-200"}`}
                    onClick={() => markRead(n.id)}
                  >
                    <div className="flex-shrink-0">{typeIcons[n.type]}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 text-sm mb-0.5">{n.title}</div>
                      <div className="text-xs text-gray-600 truncate">{n.message}</div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-xs text-gray-400">{new Date(n.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                      {n.actionLabel && n.actionHref && (
                        <a href={n.actionHref} className="px-3 py-1 bg-emerald-600 text-white rounded text-xs font-semibold hover:bg-emerald-700 transition" onClick={e => e.stopPropagation()}>{n.actionLabel}</a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 