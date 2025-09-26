import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Progress } from "@/components/ui/progress";
import { User } from "lucide-react";

interface Partner {
  name: string;
  avatar: string;
  role: string;
}
interface Project {
  id: string;
  name: string;
  client: string;
  image: string;
  currentStage: string;
  progress: number;
  daysUntilDeadline: number;
  isUrgent: boolean;
  assignedPartners: Partner[];
  lastCommunication: string;
  value: string;
}

const mockProjects: Project[] = [
  {
    id: '1',
    name: "Sarah's Engagement Ring",
    client: "Sarah Johnson",
    image: "/projects/engagement-ring.jpg",
    currentStage: "Setting",
    progress: 75,
    daysUntilDeadline: 3,
    isUrgent: false,
    assignedPartners: [
      { name: "Mike Rodriguez", avatar: "/avatars/mike.jpg", role: "Setter" },
      { name: "Lisa Chen", avatar: "/avatars/lisa.jpg", role: "QC" }
    ],
    lastCommunication: "2 hours ago",
    value: "$8,500"
  },
  {
    id: '2',
    name: "Diamond Tennis Bracelet",
    client: "Robert Wilson",
    image: "/projects/tennis-bracelet.jpg",
    currentStage: "Polishing",
    progress: 90,
    daysUntilDeadline: 1,
    isUrgent: true,
    assignedPartners: [
      { name: "David Kim", avatar: "/avatars/david.jpg", role: "Polisher" }
    ],
    lastCommunication: "30 minutes ago",
    value: "$12,000"
  },
  {
    id: '3',
    name: "Custom Wedding Set",
    client: "Jennifer Brown",
    image: "/projects/wedding-set.jpg",
    currentStage: "CAD",
    progress: 40,
    daysUntilDeadline: 12,
    isUrgent: false,
    assignedPartners: [
      { name: "Alex Thompson", avatar: "/avatars/alex.jpg", role: "CAD Designer" }
    ],
    lastCommunication: "1 day ago",
    value: "$15,200"
  },
  {
    id: '4',
    name: "Emerald Pendant",
    client: "Olivia Lee",
    image: "/projects/emerald-pendant.jpg",
    currentStage: "Casting",
    progress: 55,
    daysUntilDeadline: 7,
    isUrgent: false,
    assignedPartners: [
      { name: "Sophie Tran", avatar: "/avatars/sophie.jpg", role: "Caster" }
    ],
    lastCommunication: "3 hours ago",
    value: "$4,800"
  },
  {
    id: '5',
    name: "Ruby Stud Earrings",
    client: "Emma Wilson",
    image: "/projects/ruby-earrings.jpg",
    currentStage: "QC",
    progress: 98,
    daysUntilDeadline: 0,
    isUrgent: true,
    assignedPartners: [
      { name: "Alex Brown", avatar: "/avatars/alex.jpg", role: "QC" }
    ],
    lastCommunication: "10 minutes ago",
    value: "$2,300"
  }
];

const stageColors: Record<string, string> = {
  "Design": "#8B5CF6",
  "CAD": "#3B82F6",
  "Casting": "#F59E0B",
  "Setting": "#10B981",
  "Polishing": "#F97316",
  "QC": "#6366F1",
  "Ready": "#059669"
};

function deadlineColor(days: number, isUrgent: boolean) {
  if (isUrgent || days < 1) return "bg-red-100 text-red-700";
  if (days <= 3) return "bg-red-100 text-red-700";
  if (days <= 7) return "bg-yellow-100 text-yellow-700";
  return "bg-green-100 text-green-700";
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <Card
      className={`flex flex-col shadow-md rounded-lg overflow-hidden transition-transform hover:shadow-xl hover:-translate-y-1 cursor-pointer`}
      style={{ width: 300, minHeight: 320 }}
      onClick={() => alert(`Opening project details for ${project.name}`)}
    >
      {/* Image */}
      <div className="relative h-[140px] w-full">
        <Image
          src={project.image}
          alt={project.name}
          fill
          className="object-cover w-full h-full"
        />
        {project.isUrgent && (
          <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded shadow">
            Urgent
          </div>
        )}
      </div>
      {/* Content */}
      <div className="flex-1 flex flex-col p-4">
        <div className="flex items-center justify-between mb-1">
          <span className="font-semibold text-lg truncate">{project.name}</span>
          <Badge style={{ background: stageColors[project.currentStage] || "#e5e7eb", color: "#fff" }}>
            {project.currentStage}
          </Badge>
        </div>
        <div className="text-sm text-gray-500 mb-2 truncate">Client: {project.client}</div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-gray-400">Progress</span>
          <Progress value={project.progress} className="flex-1 h-2" style={{ background: "#f3f4f6" }} />
          <span className="text-xs text-gray-500">{project.progress}%</span>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${deadlineColor(project.daysUntilDeadline, project.isUrgent)}`}>
            {project.daysUntilDeadline < 0
              ? "Overdue"
              : project.daysUntilDeadline === 0
              ? "Due Today"
              : `${project.daysUntilDeadline} day${project.daysUntilDeadline > 1 ? "s" : ""} left`}
          </span>
          <span className="ml-auto text-xs text-gray-400">{project.value}</span>
        </div>
        <div className="flex items-center gap-2 mb-2">
          {/* Partner Avatars */}
          <div className="flex -space-x-2">
            {project.assignedPartners.slice(0, 3).map((p, i) => (
              <Image
                key={p.name}
                src={p.avatar}
                alt={p.name}
                width={28}
                height={28}
                className="rounded-full border-2 border-white shadow"
                title={`${p.name} (${p.role})`}
              />
            ))}
            {project.assignedPartners.length > 3 && (
              <span className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold border-2 border-white">
                +{project.assignedPartners.length - 3}
              </span>
            )}
          </div>
          <span className="text-xs text-gray-400 ml-2">Partners</span>
        </div>
        <div className="flex items-center justify-between mt-auto">
          <span className="text-xs text-gray-500">Last comm: {project.lastCommunication}</span>
          <Button
            size="sm"
            className="ml-2"
            onClick={e => {
              e.stopPropagation();
              alert(`Opening update composer for ${project.name}`);
            }}
          >
            Send Update
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default function ProjectStatusCards() {
  const [projects] = useState<Project[]>(mockProjects);

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Image src="/empty-state.svg" alt="No projects" width={120} height={120} />
        <div className="text-lg font-semibold mt-4 mb-2">No active projects</div>
        <div className="text-gray-500 mb-4">Start your first project conversation to see it here.</div>
        <Button onClick={() => alert("Start your first project conversation")}>Start Project</Button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Project Status Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {projects.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}