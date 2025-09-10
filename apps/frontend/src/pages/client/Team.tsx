import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Mail, 
  MoreHorizontal, 
  UserCheck,
  UserX,
  Crown,
  User,
  Shield,
  Trash2,
  Send
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member' | 'viewer';
  status: 'active' | 'pending' | 'suspended';
  joinedAt: string;
  lastActive: string;
}

interface PendingInvitation {
  id: string;
  email: string;
  role: 'admin' | 'member' | 'viewer';
  invitedAt: string;
  invitedBy: string;
}

const ClientTeam: React.FC = () => {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'member' as 'admin' | 'member' | 'viewer'
  });

  // Mock data for team members
  const teamMembers: TeamMember[] = [
    {
      id: '1',
      name: 'John Smith',
      email: 'john@acmecorp.com',
      role: 'admin',
      status: 'active',
      joinedAt: '2024-01-15',
      lastActive: '2 hours ago'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah@acmecorp.com',
      role: 'member',
      status: 'active',
      joinedAt: '2024-02-01',
      lastActive: '1 day ago'
    },
    {
      id: '3',
      name: 'Mike Chen',
      email: 'mike@acmecorp.com',
      role: 'viewer',
      status: 'active',
      joinedAt: '2024-02-15',
      lastActive: '3 days ago'
    }
  ];

  const pendingInvitations: PendingInvitation[] = [
    {
      id: '4',
      email: 'alex@acmecorp.com',
      role: 'member',
      invitedAt: '2024-03-01',
      invitedBy: 'john@acmecorp.com'
    }
  ];

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-4 h-4 text-amber-500" />;
      case 'member':
        return <User className="w-4 h-4 text-blue-500" />;
      case 'viewer':
        return <Shield className="w-4 h-4 text-gray-500" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <UserCheck className="w-3 h-3 mr-1" />
            Active
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Mail className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
      case 'suspended':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <UserX className="w-3 h-3 mr-1" />
            Suspended
          </span>
        );
      default:
        return null;
    }
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Call the POST /invitations endpoint
    console.log('Inviting user:', inviteForm);
    
    // Reset form and close modal
    setInviteForm({ email: '', role: 'member' });
    setShowInviteModal(false);
    
    // In real implementation, show success/error message
  };

  const handleRevokePendingInvitation = (invitationId: string) => {
    // TODO: Call API to revoke invitation
    console.log('Revoking invitation:', invitationId);
  };

  const handleRemoveMember = (memberId: string) => {
    // TODO: Call API to remove team member
    console.log('Removing member:', memberId);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Team Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage your team members and their access permissions
          </p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Invite Member</span>
        </button>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-content p-6">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Total Members</span>
            </div>
            <p className="text-2xl font-bold text-foreground mt-2">
              {teamMembers.length}
            </p>
          </div>
        </div>
        <div className="card">
          <div className="card-content p-6">
            <div className="flex items-center space-x-2">
              <Crown className="w-5 h-5 text-amber-500" />
              <span className="text-sm font-medium text-muted-foreground">Admins</span>
            </div>
            <p className="text-2xl font-bold text-foreground mt-2">
              {teamMembers.filter(m => m.role === 'admin').length}
            </p>
          </div>
        </div>
        <div className="card">
          <div className="card-content p-6">
            <div className="flex items-center space-x-2">
              <Mail className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium text-muted-foreground">Pending</span>
            </div>
            <p className="text-2xl font-bold text-foreground mt-2">
              {pendingInvitations.length}
            </p>
          </div>
        </div>
        <div className="card">
          <div className="card-content p-6">
            <div className="flex items-center space-x-2">
              <UserCheck className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-muted-foreground">Active</span>
            </div>
            <p className="text-2xl font-bold text-foreground mt-2">
              {teamMembers.filter(m => m.status === 'active').length}
            </p>
          </div>
        </div>
      </div>

      {/* Team Members Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Team Members</h2>
          <p className="card-description">Current active team members</p>
        </div>
        <div className="card-content">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-medium text-muted-foreground">Member</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Role</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Last Active</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {teamMembers.map((member) => (
                  <tr key={member.id} className="border-b border-border hover:bg-accent/50">
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-foreground">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        {getRoleIcon(member.role)}
                        <span className="capitalize text-sm">{member.role}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(member.status)}
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-muted-foreground">{member.lastActive}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <button className="btn-ghost btn-sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        {member.role !== 'admin' && (
                          <button 
                            onClick={() => handleRemoveMember(member.id)}
                            className="btn-ghost btn-sm text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pending Invitations */}
      {pendingInvitations.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Pending Invitations</h2>
            <p className="card-description">Invitations waiting for acceptance</p>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              {pendingInvitations.map((invitation) => (
                <div key={invitation.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">{invitation.email}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        {getRoleIcon(invitation.role)}
                        <span className="text-sm text-muted-foreground capitalize">{invitation.role}</span>
                        <span className="text-sm text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">
                          Invited {new Date(invitation.invitedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="btn-outline btn-sm">
                      <Send className="w-4 h-4 mr-2" />
                      Resend
                    </button>
                    <button 
                      onClick={() => handleRevokePendingInvitation(invitation.id)}
                      className="btn-ghost btn-sm text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Revoke
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold text-foreground mb-4">Invite Team Member</h2>
            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})}
                  className="input-field w-full"
                  placeholder="colleague@company.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Role
                </label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({...inviteForm, role: e.target.value as any})}
                  className="input-field w-full"
                >
                  <option value="viewer">Viewer - Read-only access</option>
                  <option value="member">Member - Standard access</option>
                  <option value="admin">Admin - Full access</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="btn-ghost"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientTeam; 