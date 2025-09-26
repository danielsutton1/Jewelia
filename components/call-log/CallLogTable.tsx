import React, { useState } from "react";
import { Table, TableHead, TableRow, TableCell, TableBody } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Phone, User, Paperclip } from "lucide-react";
import { format } from "date-fns";

export type CallLogData = {
  id?: string;
  customer: string;
  design: string;
  callType: string;
  callDateTime: Date;
  duration: string | number;
  outcome: string;
  notes: string;
  assignee: string;
  revisions: CallLogRevision[];
  files?: any[];
};

type CallLogRevision = { notes: string; editedAt: Date; editedBy: string };

export function CallLogTable({ calls }: { calls: CallLogData[] }) {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [outcomeFilter, setOutcomeFilter] = useState("all");

  const filteredCalls = calls.filter(call =>
    (search === "" ||
      call.customer?.toLowerCase().includes(search.toLowerCase()) ||
      (call.design && call.design.toLowerCase().includes(search.toLowerCase())) ||
      (call.notes && call.notes.toLowerCase().includes(search.toLowerCase()))
    ) &&
    (outcomeFilter === "all" || call.outcome === outcomeFilter)
  );

  return (
    <div>
      <div className="flex gap-4 mb-4">
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by customer, design, or notes..."
          className="w-72"
        />
        <select
          value={outcomeFilter}
          onChange={e => setOutcomeFilter(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="all">All Outcomes</option>
          <option value="completed">Completed</option>
          <option value="no_answer">No Answer</option>
          <option value="voicemail">Voicemail</option>
        </select>
      </div>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Date/Time</TableCell>
            <TableCell>Files</TableCell>
            <TableCell>Customer</TableCell>
            <TableCell>Design</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Outcome</TableCell>
            <TableCell>Assignee</TableCell>
            <TableCell>Notes</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredCalls.map((call, idx) => (
            <React.Fragment key={call.id || idx}>
              <TableRow>
                <TableCell>{format(new Date(call.callDateTime), "PPpp")}</TableCell>
                <TableCell className="text-center">
                  {Array.isArray(call.files) && call.files.length > 0 ? (
                    <div className="flex flex-col items-center gap-1">
                      <Paperclip className="h-4 w-4 text-emerald-600" />
                      <div className="text-xs text-gray-600">
                        {call.files.map((file: any, index: number) => (
                          <div key={index} className="flex items-center gap-1">
                            <span className="truncate max-w-20" title={file.name}>
                              {file.name}
                            </span>
                            {(file.data || file.url) && (
                              <button
                                onClick={() => {
                                  // Handle both base64 data and Supabase storage URLs
                                  if (file.url) {
                                    // For Supabase storage URLs, open in new tab
                                    window.open(file.url, '_blank');
                                  } else if (file.data) {
                                    // For base64 data, create download link
                                    const link = document.createElement('a');
                                    link.href = file.data;
                                    link.download = file.name;
                                    link.click();
                                  }
                                }}
                                className="text-blue-600 hover:text-blue-800 text-xs"
                                title={file.url ? "View file" : "Download file"}
                              >
                                {file.url ? "👁" : "↓"}
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-400 text-xs">No file</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span className="font-medium">{call.customer}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {call.design ? (
                    <span className="underline cursor-pointer">{call.design}</span>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>
                  <Phone className="w-4 h-4 inline" /> {call.callType.charAt(0).toUpperCase() + call.callType.slice(1)}
                </TableCell>
                <TableCell>
                  <Badge variant={
                    call.outcome === "completed"
                      ? "success"
                      : call.outcome === "no_answer"
                      ? "warning"
                      : "destructive"
                  }>
                    {call.outcome.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell>{call.assignee || "-"}</TableCell>
                <TableCell>
                  <span className="truncate max-w-[120px] block">
                    {call.notes.length > 40 ? call.notes.slice(0, 40) + "..." : call.notes}
                  </span>
                  {call.revisions && call.revisions.length > 0 && (
                    <Badge variant="outline" className="ml-2 text-xs">Revised</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <button
                    className="text-blue-600 hover:underline flex items-center gap-1"
                    onClick={() => setExpanded(expanded === idx ? null : idx)}
                  >
                    {expanded === idx ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    Details
                  </button>
                </TableCell>
              </TableRow>
              {expanded === idx && (
                <TableRow>
                  <TableCell colSpan={8} className="bg-gray-50">
                    <div>
                      <div className="font-semibold mb-1">Full Notes:</div>
                      <div className="mb-2 whitespace-pre-line">{call.notes}</div>
                      {call.revisions && call.revisions.length > 0 && (
                        <div>
                          <div className="font-semibold mb-1">Revision History:</div>
                          {call.revisions.map((rev, rIdx) => (
                            <div key={rIdx} className="border rounded p-2 mb-2 bg-white">
                              <div className="text-xs text-gray-500 mb-1">
                                Edited by {rev.editedBy} on {format(new Date(rev.editedAt), "PPpp")}
                              </div>
                              <div className="whitespace-pre-line">{rev.notes}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 