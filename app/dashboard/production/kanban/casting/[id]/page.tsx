"use client";
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Droplets, Calendar, Users, Download, Paperclip, AlertTriangle, ArrowLeft, XCircle, CheckCircle, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { format, parseISO, differenceInDays, isAfter } from "date-fns";
import { cn } from "@/lib/utils";

// Mock data (should match the kanban table)
const mockCastingOrders = [
  {
    castingId: 'CAST-2024-0001',
    customerName: 'Sophia Chen',
    customerId: '1',
    status: 'In Progress',
    priority: 'High',
    assignedTo: 'Sarah Johnson',
    dueDate: '2024-07-22T20:00:00Z',
    notes: 'Casting for custom engagement ring with emerald center stone.',
    revisions: 1,
    files: [{ name: "casting-mold.pdf" }, { name: "metal-alloy-specs.pdf" }],
    orderNumber: 'ORD-1001',
    cadId: 'CAD-2024-0001',
  },
  {
    castingId: 'CAST-2024-0002',
    customerName: 'Ethan Davis',
    customerId: '2',
    status: 'Review',
    priority: 'Medium',
    assignedTo: 'David Chen',
    dueDate: '2024-07-28T20:00:00Z',
    notes: 'Sapphire pendant casting with diamond accents.',
    revisions: 2,
    files: [{ name: "casting-model.stl" }],
    orderNumber: 'ORD-1002',
    cadId: 'CAD-2024-0002',
  },
  {
    castingId: 'CAST-2024-0003',
    customerName: 'Ava Martinez',
    customerId: '3',
    status: 'Approved',
    priority: 'Low',
    assignedTo: 'Emily Rodriguez',
    dueDate: '2024-07-19T20:00:00Z',
    notes: 'Custom bracelet casting with mixed metals design.',
    revisions: 0,
    files: [{ name: "final-casting.stl" }, { name: "casting-report.pdf" }],
    orderNumber: 'ORD-1003',
    cadId: 'CAD-2024-0003',
  },
  {
    castingId: 'CAST-2024-0004',
    customerName: 'Liam Smith',
    customerId: '4',
    status: 'Revise',
    priority: 'High',
    assignedTo: 'Michael Kim',
    dueDate: '2024-08-01T20:00:00Z',
    notes: 'Wedding band casting needs revision for comfort fit.',
    revisions: 3,
    files: [{ name: "revision-notes.pdf" }, { name: "updated-casting.stl" }],
    orderNumber: 'ORD-1004',
    cadId: 'CAD-2024-0004',
  },
];

const statusColors: { [key: string]: string } = {
  'In Progress': 'bg-blue-100 text-blue-800',
  'Review': 'bg-yellow-100 text-yellow-800',
  'Approved': 'bg-green-100 text-green-800',
  'Revise': 'bg-red-100 text-red-800',
};
const priorityColors: { [key: string]: string } = {
  'High': 'bg-red-100 text-red-800 border-red-200',
  'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Low': 'bg-green-100 text-green-800 border-green-200',
};

export default function CastingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const castingId = params.id as string;
  const [castingData, setCastingData] = useState(() => mockCastingOrders.find(c => c.castingId === castingId));
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState<typeof castingData>(castingData);

  if (!castingData) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <h1 className="text-3xl font-bold text-red-700 mb-4">Casting Not Found</h1>
        <p className="text-lg text-gray-600 mb-6">The requested casting record (ID: {castingId}) does not exist. Please check the link or return to the Casting Kanban board.</p>
        <Link href="/dashboard/production/kanban/casting">
          <Button variant="outline">Back to Casting Kanban</Button>
        </Link>
      </div>
    );
  }

  const daysUntilDue = differenceInDays(parseISO(castingData.dueDate), new Date());
  const isOverdue = isAfter(new Date(), parseISO(castingData.dueDate));
  const isDueSoon = daysUntilDue <= 3 && daysUntilDue >= 0;

  const handleEdit = () => {
    setEditForm(castingData);
    setEditMode(true);
  };
  const handleCancel = () => {
    setEditMode(false);
  };
  const handleSave = () => {
    setCastingData(editForm);
    setEditMode(false);
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/production/kanban/casting">
          <Button variant="outline" size="sm" className="text-gray-600 hover:text-gray-800">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Casting Kanban
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-emerald-900 flex items-center gap-2">
          <Droplets className="h-8 w-8 text-emerald-600" />
          {castingData.castingId}
        </h1>
        <Badge className={cn("text-sm font-semibold", statusColors[castingData.status])}>{castingData.status}</Badge>
        <Badge className={cn("text-sm font-semibold", priorityColors[castingData.priority])}>{castingData.priority} Priority</Badge>
        {!editMode && (
          <Button variant="outline" size="sm" onClick={handleEdit} className="ml-4">Edit</Button>
        )}
      </div>
      {editMode ? (
        <form className="space-y-6">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-600" /> Assigned To
              </CardTitle>
            </CardHeader>
            <CardContent>
              <input
                className="border rounded px-2 py-1 text-lg font-semibold text-emerald-900"
                value={editForm!.assignedTo}
                onChange={e => setEditForm(f => ({ ...f!, assignedTo: e.target.value }))}
              />
              <div className="flex flex-wrap gap-4 mt-2 items-center">
                <label className="font-semibold">Due Date:</label>
                <input
                  type="datetime-local"
                  className="border rounded px-2 py-1"
                  value={editForm!.dueDate.slice(0, 16)}
                  onChange={e => setEditForm(f => ({ ...f!, dueDate: e.target.value }))}
                />
                <label className="font-semibold">Order #:</label>
                <span>{editForm!.orderNumber}</span>
                <label className="font-semibold">CAD #:</label>
                <span>{editForm!.cadId}</span>
              </div>
            </CardContent>
          </Card>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-emerald-600" /> Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 items-center">
                <label className="font-semibold">Status:</label>
                <select
                  className="border rounded px-2 py-1"
                  value={editForm!.status}
                  onChange={e => setEditForm(f => ({ ...f!, status: e.target.value }))}
                >
                  <option value="In Progress">In Progress</option>
                  <option value="Review">Review</option>
                  <option value="Approved">Approved</option>
                  <option value="Revise">Revise</option>
                </select>
                <label className="font-semibold">Priority:</label>
                <select
                  className="border rounded px-2 py-1"
                  value={editForm!.priority}
                  onChange={e => setEditForm(f => ({ ...f!, priority: e.target.value }))}
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
                <label className="font-semibold">Revisions:</label>
                <input
                  type="number"
                  className="border rounded px-2 py-1 w-20"
                  value={editForm!.revisions}
                  onChange={e => setEditForm(f => ({ ...f!, revisions: Number(e.target.value) }))}
                />
              </div>
            </CardContent>
          </Card>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-emerald-600" /> Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                className="border rounded px-2 py-1 w-full min-h-[80px]"
                value={editForm!.notes}
                onChange={e => setEditForm(f => ({ ...f!, notes: e.target.value }))}
              />
            </CardContent>
          </Card>
          <div className="flex gap-4">
            <Button type="button" onClick={handleSave} className="bg-emerald-600 text-white">Save</Button>
            <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>
          </div>
        </form>
      ) : (
        <>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-600" /> Assigned To
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <span className="font-semibold text-lg text-emerald-900">{castingData.assignedTo}</span>
                <span className="text-gray-500">| Due: <span className={cn(isOverdue ? "text-red-600" : isDueSoon ? "text-yellow-600" : "text-emerald-600")}>{format(parseISO(castingData.dueDate), "MMM dd, yyyy")}</span></span>
                <span className="text-gray-500">| Order #: <Link href={`/dashboard/orders/${castingData.orderNumber}`} className="text-emerald-700 hover:underline">{castingData.orderNumber}</Link></span>
                <span className="text-gray-500">| CAD #: <Link href={`/dashboard/production/kanban/cad/${castingData.cadId}`} className="text-emerald-700 hover:underline">{castingData.cadId}</Link></span>
              </div>
            </CardContent>
          </Card>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-emerald-600" /> Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <div><span className="font-semibold">Due Date:</span> {format(parseISO(castingData.dueDate), "PPpp")}</div>
                <div><span className="font-semibold">Status:</span> {castingData.status}</div>
                <div><span className="font-semibold">Priority:</span> {castingData.priority}</div>
                <div><span className="font-semibold">Revisions:</span> {castingData.revisions}</div>
              </div>
            </CardContent>
          </Card>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-emerald-600" /> Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-800 whitespace-pre-line">{castingData.notes}</div>
            </CardContent>
          </Card>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Paperclip className="h-5 w-5 text-emerald-600" /> Files
              </CardTitle>
            </CardHeader>
            <CardContent>
              {castingData.files && castingData.files.length > 0 ? (
                <ul className="list-disc pl-6">
                  {castingData.files.map((file, idx) => (
                    <li key={idx} className="mb-1 flex items-center gap-2">
                      <Download className="h-4 w-4 text-emerald-600" />
                      <span>{file.name}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-gray-400">No files attached.</span>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
} 