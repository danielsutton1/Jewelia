import React, { useState } from "react";

const COMM_METHODS = [
  "Inbound Call",
  "Outbound Call",
  "Email",
  "Walk-in",
  "Referral",
  "Other"
];

export default function LogCommunicationModal({ onClose }: { onClose: () => void }) {
  const [method, setMethod] = useState(COMM_METHODS[0]);
  const [notes, setNotes] = useState("");
  const [followUp, setFollowUp] = useState("");

  const handleSave = () => {
    // TODO: Save logic (API call or state update)
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Log Communication</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Communication Method</label>
          <select className="w-full border rounded px-2 py-1" value={method} onChange={e => setMethod(e.target.value)}>
            {COMM_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea className="w-full border rounded px-2 py-1" rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add any notes..." />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Follow-up Date/Time</label>
          <input type="datetime-local" className="w-full border rounded px-2 py-1" value={followUp} onChange={e => setFollowUp(e.target.value)} />
        </div>
        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={onClose}>Cancel</button>
          <button className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
} 