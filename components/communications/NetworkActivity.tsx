import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { UserPlus, Award, Mail, Users, BarChart3, Star, ArrowUpRight, ArrowDownRight } from "lucide-react";

const networkActivity = [
  {
    id: '1',
    type: 'new_partner',
    partner: {
      name: 'Maria Santos',
      role: 'Stone Setter',
      avatar: '/avatars/maria.jpg',
      joinedDate: '2 days ago'
    },
    projects: 3,
    rating: 4.9
  },
  {
    id: '2',
    type: 'partner_milestone',
    partner: {
      name: 'David Kim',
      role: 'Polisher',
      avatar: '/avatars/david.jpg'
    },
    achievement: 'Completed 50th project',
    date: '1 week ago'
  },
  {
    id: '3',
    type: 'invitation_pending',
    email: 'sarah@eliteCAD.com',
    role: 'CAD Designer',
    invitedDate: '3 days ago',
    status: 'pending'
  }
];

const networkStats = {
  totalPartners: 24,
  newThisMonth: 3,
  averageRating: 4.7,
  activeProjects: 12
};

export default function NetworkActivity() {
  return (
    <Card className="bg-white rounded-lg shadow p-4 h-full flex flex-col">
      <h2 className="text-lg font-semibold mb-3">Network Overview</h2>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-emerald-600" />
          <span className="font-bold text-lg">{networkStats.totalPartners}</span>
          <span className="text-xs text-gray-500">Partners</span>
        </div>
        <div className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-blue-600" />
          <span className="font-bold text-lg">{networkStats.newThisMonth}</span>
          <span className="text-xs text-gray-500">New this month</span>
        </div>
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          <span className="font-bold text-lg">{networkStats.averageRating}</span>
          <span className="text-xs text-gray-500">Avg. Rating</span>
        </div>
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-purple-600" />
          <span className="font-bold text-lg">{networkStats.activeProjects}</span>
          <span className="text-xs text-gray-500">Active Projects</span>
        </div>
      </div>
      <h3 className="text-md font-semibold mb-2 mt-2">Recent Partner Activity</h3>
      <div className="divide-y border rounded-lg max-h-[180px] overflow-y-auto bg-gray-50 mb-4">
        {networkActivity.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">No recent activity.</div>
        ) : (
          networkActivity.map((item) => (
            <div key={item.id} className="flex items-center gap-3 px-3 py-3 hover:bg-emerald-50 transition-colors">
              {item.type === "new_partner" && item.partner && (
                <>
                  <Image src={item.partner.avatar} alt={item.partner.name} width={32} height={32} className="rounded-full border" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{item.partner.name} <span className="text-xs text-gray-400">({item.partner.role})</span></div>
                    <div className="text-xs text-gray-500">Joined {item.partner.joinedDate} · {item.projects} projects · <Star className="inline h-3 w-3 text-yellow-400" /> {item.rating}</div>
                  </div>
                  <UserPlus className="h-4 w-4 text-emerald-600" />
                </>
              )}
              {item.type === "partner_milestone" && item.partner && (
                <>
                  <Image src={item.partner.avatar} alt={item.partner.name} width={32} height={32} className="rounded-full border" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{item.partner.name} <span className="text-xs text-gray-400">({item.partner.role})</span></div>
                    <div className="text-xs text-gray-500">{item.achievement} · {item.date}</div>
                  </div>
                  <Award className="h-4 w-4 text-purple-600" />
                </>
              )}
              {item.type === "invitation_pending" && (
                <>
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <Mail className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{item.email}</div>
                    <div className="text-xs text-gray-500">{item.role} · Invited {item.invitedDate}</div>
                  </div>
                  <span className="text-xs text-yellow-600 font-semibold">Pending</span>
                </>
              )}
            </div>
          ))
        )}
      </div>
      <div className="flex gap-2 mt-auto">
        <Button className="flex-1" size="sm" variant="outline" onClick={() => alert("Viewing all partners")}>View All Partners</Button>
        <Button className="flex-1" size="sm" variant="secondary" onClick={() => alert("Sending invitations")}>Send Invitations</Button>
        <Button className="flex-1" size="sm" variant="ghost" onClick={() => alert("Viewing partner performance report")}>Performance Report</Button>
      </div>
    </Card>
  );
}