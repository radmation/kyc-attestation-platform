import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Mail, 
  MoreHorizontal, 
  UserCheck,
  UserX,
  Crown,
  User,
  Trash2,
  Send,
  Loader2,
  AlertCircle
} from 'lucide-react';
import apiClient, { type InvitationResponse, type User as ApiUser } from '../../lib/api';

// Removed unused interfaces - using API types directly

const ClientTeam: React.FC = () => {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'CLIENT_USER' as 'CLIENT_ADMIN' | 'CLIENT_USER'
  });
  
  // State for API data
  const [teamMembers, setTeamMembers] = useState<ApiUser[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<InvitationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data on component mount
  useEffect(() => {
    loadTeamData();
  }, []);

  const loadTeamData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [usersResponse, invitationsResponse] = await Promise.all([
        apiClient.getUsers(),
        apiClient.getInvitations({ status: 'PENDING' })
      ]);

      if (usersResponse.success) {
        setTeamMembers(usersResponse.data || []);
      } else {
        console.error('Failed to load users:', usersResponse.error);
      }

      if (invitationsResponse.success) {
        setPendingInvitations(invitationsResponse.data?.invitations || []);
      } else {
        console.error('Failed to load invitations:', invitationsResponse.error);
      }
    } catch (err) {
      setError('Failed to load team data');
      console.error('Error loading team data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'CLIENT_ADMIN':
      case 'SUPER_ADMIN':
        return <Crown className="w-4 h-4 text-amber-500" />;
      case 'CLIENT_USER':
        return <User className="w-4 h-4 text-blue-500" />;
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

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    try {
      const response = await apiClient.createInvitation({
        email: inviteForm.email,
        role: inviteForm.role,
      });

      if (response.success) {
        // Reset form and close modal
        setInviteForm({ email: '', role: 'CLIENT_USER' });
        setShowInviteModal(false);
        
        // Reload data to show new invitation
        await loadTeamData();
      } else {
        setError(response.error || 'Failed to send invitation');
      }
    } catch (err) {
      setError('Failed to send invitation');
      console.error('Error sending invitation:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevokePendingInvitation = async (invitationId: string) => {
    try {
      const response = await apiClient.revokeInvitation(invitationId);
      if (response.success) {
        await loadTeamData(); // Reload to update the list
      } else {
        setError(response.error || 'Failed to revoke invitation');
      }
    } catch (err) {
      setError('Failed to revoke invitation');
      console.error('Error revoking invitation:', err);
    }
  };

  const handleResendInvitation = async (invitationId: string) => {
    try {
      const response = await apiClient.resendInvitation(invitationId);
      if (response.success) {
        // Show success message or update UI
        console.log('Invitation resent successfully');
      } else {
        setError(response.error || 'Failed to resend invitation');
      }
    } catch (err) {
      setError('Failed to resend invitation');
      console.error('Error resending invitation:', err);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      const response = await apiClient.removeUser(memberId);
      if (response.success) {
        await loadTeamData(); // Reload to update the list
      } else {
        setError(response.error || 'Failed to remove team member');
      }
    } catch (err) {
      setError('Failed to remove team member');
      console.error('Error removing member:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading team data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

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
              {teamMembers.filter(m => m.role === 'CLIENT_ADMIN' || m.role === 'SUPER_ADMIN').length}
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
              {teamMembers.filter(m => m.isActive).length}
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
                        <p className="font-medium text-foreground">
                          {member.firstName && member.lastName 
                            ? `${member.firstName} ${member.lastName}` 
                            : member.email}
                        </p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        {getRoleIcon(member.role)}
                        <span className="capitalize text-sm">{member.role.replace('CLIENT_', '').toLowerCase()}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(member.isActive ? 'active' : 'suspended')}
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-muted-foreground">
                        {new Date(member.updatedAt).toLocaleDateString()}
                      </span>
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
                          Invited {new Date(invitation.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => handleResendInvitation(invitation.id)}
                      className="btn-outline btn-sm"
                    >
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
                  onChange={(e) => setInviteForm({...inviteForm, role: e.target.value as 'CLIENT_ADMIN' | 'CLIENT_USER'})}
                  className="input-field w-full"
                >
                  <option value="CLIENT_USER">User - Standard access</option>
                  <option value="CLIENT_ADMIN">Admin - Full access</option>
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
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Invitation'
                  )}
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