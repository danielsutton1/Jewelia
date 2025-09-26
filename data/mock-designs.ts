export interface CompletedDesign {
  designId: string;
  client: string;
  designer: string;
  completedDate: string;
  approvalStatus: 'pending' | 'approved' | 'revision-requested';
  designStatus: 'not-started' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  budget: number;
  materials: string[];
  complexity: 'simple' | 'moderate' | 'complex' | 'expert';
  clientFeedback?: string;
  revisionNotes?: string;
  nextAction: string;
  assignedTo?: string;
  dueDate?: string;
  files?: Array<string | {
    name: string;
    type: string;
    size?: number;
    data?: string;
    url?: string;
    uploaded_at?: string;
    storage_path?: string;
    storage_type?: 'base64' | 'supabase';
  }>;
  notes?: string;
}

export const mockCompletedDesigns: CompletedDesign[] = [
  {
    designId: "DS-2024-0001",
    client: "Sophia Chen",
    designer: "Sarah Johnson",
    completedDate: "2024-07-10",
    approvalStatus: "approved",
    designStatus: "in-progress",
    priority: "high",
    budget: 8500,
    materials: ["18K White Gold", "Diamond", "Sapphire"],
    complexity: "complex",
    clientFeedback: "Love the vintage-inspired setting!",
    nextAction: "Generate quote",
    assignedTo: "Michael Chen",
    dueDate: "2024-07-15",
    files: ["final-design.pdf", "renderings.zip", "specifications.pdf"],
    notes: "Design approved by client. Vintage-inspired setting with emerald accents completed successfully.",
  },
  {
    designId: "DS-2024-0002",
    client: "Ethan Davis",
    designer: "David Chen",
    completedDate: "2024-07-08",
    approvalStatus: "pending",
    designStatus: "not-started",
    priority: "medium",
    budget: 3200,
    materials: ["14K Yellow Gold", "Emerald"],
    complexity: "moderate",
    revisionNotes: "Client wants larger emerald stone",
    nextAction: "Design revision",
    assignedTo: "David Chen",
    dueDate: "2024-07-12",
    files: ["design-draft.pdf"],
    notes: "Modern minimalist design completed. Client requested larger emerald stone - revision needed.",
  },

  {
    designId: "DS-2024-0005",
    client: "Isabella Wilson",
    designer: "Sarah Johnson",
    completedDate: "2024-12-28",
    approvalStatus: "revision-requested",
    designStatus: "completed",
    priority: "high",
    budget: 6500,
    materials: ["14K Rose Gold", "Diamond", "Morganite"],
    complexity: "moderate",
    revisionNotes: "Client wants more pink tones in the design",
    nextAction: "Design revision",
    assignedTo: "Sarah Johnson",
    dueDate: "2024-07-13",
    files: ["design-draft.pdf"],
    notes: "Rose gold engagement ring with morganite. Client requested more pink tones in the design.",
  }
]; 

export function addCompletedDesign(design: CompletedDesign) {
  mockCompletedDesigns.push(design);
  
  // Also add to the global mutable array if it exists
  if (typeof global !== 'undefined' && (global as any).mutableMockDesigns) {
    (global as any).mutableMockDesigns.push(design);
  }
}