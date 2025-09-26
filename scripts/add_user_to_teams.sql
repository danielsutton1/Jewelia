-- 🔧 ADD USER TO EXISTING TEAMS
-- This script adds the user as a team member to all existing teams

-- First, let's see what teams exist
SELECT id, name, owner_id FROM teams;

-- Add the user as a team member to all teams they own
INSERT INTO team_members (
    team_id,
    user_id,
    role,
    status,
    can_invite_members,
    can_remove_members,
    can_edit_team,
    can_manage_projects,
    can_view_analytics,
    can_manage_finances,
    joined_at,
    invited_at,
    accepted_at
)
SELECT 
    t.id as team_id,
    t.owner_id as user_id,
    'team_owner' as role,
    'active' as status,
    true as can_invite_members,
    true as can_remove_members,
    true as can_edit_team,
    true as can_manage_projects,
    true as can_view_analytics,
    true as can_manage_finances,
    NOW() as joined_at,
    NOW() as invited_at,
    NOW() as accepted_at
FROM teams t
WHERE t.owner_id = '9648ec2f-7b6c-4f57-9fc4-8d4c92302964'
AND NOT EXISTS (
    SELECT 1 FROM team_members tm 
    WHERE tm.team_id = t.id 
    AND tm.user_id = t.owner_id
);

-- Verify the team members were added
SELECT 
    tm.team_id,
    t.name as team_name,
    tm.user_id,
    tm.role,
    tm.status,
    tm.can_manage_projects
FROM team_members tm
JOIN teams t ON tm.team_id = t.id
WHERE tm.user_id = '9648ec2f-7b6c-4f57-9fc4-8d4c92302964';
