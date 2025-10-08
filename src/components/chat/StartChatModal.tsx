import React, { useState, useEffect } from 'react';
import { Search, User, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import apiService from '@/services/api';
import { useAuth } from '@/hooks/use-auth';
import { Chat } from '@/hooks/use-chat';

interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  profileImage?: string;
  producerDetails?: {
    companyName?: string;
  };
  supplierDetails?: {
    companyName?: string;
  };
}

interface StartChatModalProps {
  eventId?: string;
  onChatCreated: (chat: Chat) => void;
  trigger?: React.ReactNode;
}

export const StartChatModal: React.FC<StartChatModalProps> = ({
  eventId,
  onChatCreated,
  trigger
}) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [creating, setCreating] = useState(false);
  const [chatTitle, setChatTitle] = useState('');

  // Fetch initial users list when modal opens
  useEffect(() => {
    const fetchInitialUsers = async () => {
      try {
        setInitialLoading(true);
        const response = await apiService.getInitialUsers(25) as ApiResponse<User[]>;
        console.log('Initial users response:', response);
        // Filter out current user
        const filteredUsers = response.data.filter(
          (u: User) => u._id !== user?._id
        );
        setAllUsers(filteredUsers);
      } catch (error) {
        console.error('Error fetching initial users:', error);
        setAllUsers([]);
      } finally {
        setInitialLoading(false);
      }
    };

    if (open) {
      fetchInitialUsers();
    } else {
      // Reset state when modal closes
      setSearchTerm('');
      setUsers([]);
      setSelectedUsers([]);
      setChatTitle('');
    }
  }, [open, user?._id]);

  // Display initial users when they're loaded and no search term
  useEffect(() => {
    if (!searchTerm.trim() && allUsers.length > 0) {
      const filteredInitialUsers = allUsers.filter(
        (u: User) => !selectedUsers.find(su => su._id === u._id)
      );
      setUsers(filteredInitialUsers);
    }
  }, [allUsers, selectedUsers, searchTerm]);

  // Search users with local filtering first, then API fallback
  useEffect(() => {
    const searchUsers = async () => {
      if (!searchTerm.trim()) {
        return; // Initial users are handled by the separate effect
      }

      try {
        setLoading(true);
        
        // First, try local filtering on the initial users list
        const localMatches = allUsers.filter((u: User) => {
          const name = u.name?.toLowerCase() || '';
          const producerCompanyName = u.producerDetails?.companyName?.toLowerCase() || '';
          const supplierCompanyName = u.supplierDetails?.companyName?.toLowerCase() || '';
          const search = searchTerm.toLowerCase();
          
          return name.includes(search) || producerCompanyName.includes(search) || supplierCompanyName.includes(search);
        });

        // Filter out already selected users
        const filteredLocalMatches = localMatches.filter(
          (u: User) => !selectedUsers.find(su => su._id === u._id)
        );

        // If we have local matches, use them
        if (filteredLocalMatches.length > 0) {
          setUsers(filteredLocalMatches);
          setLoading(false);
          return;
        }

        // If no local matches, fallback to API search
        const response = await apiService.searchUsers(searchTerm, 20) as ApiResponse<User[]>;
        const apiMatches = response.data.filter(
          (u: User) => u._id !== user?._id && !selectedUsers.find(su => su._id === u._id)
        );
        setUsers(apiMatches);
      } catch (error) {
        console.error('Error searching users:', error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, user?._id, selectedUsers, allUsers]);

  const handleUserSelect = (user: User) => {
    if (!selectedUsers.find(u => u._id === user._id)) {
      setSelectedUsers(prev => [...prev, user]);
    }
    setSearchTerm('');
  };

  const handleUserRemove = (userId: string) => {
    setSelectedUsers(prev => prev.filter(u => u._id !== userId));
  };

  const handleCreateChat = async () => {
    if (selectedUsers.length === 0) {
      alert('Please select at least one user to start a chat');
      return;
    }

    try {
      setCreating(true);
      console.log('=== Creating Chat ===');
      console.log('Selected users:', selectedUsers);
      console.log('Current user:', user);
      
      // Include current user in participants
      const participants = [
        // Add current user first
        {
          userId: user?._id,
          role: user?.role || 'producer'
        },
        // Add selected users
        ...selectedUsers.map(u => ({
          userId: u._id,
          role: u.role
        }))
      ];

      // CRITICAL: Sort participants by userId to ensure consistent chat lookup
      // This ensures that [UserA, UserB] and [UserB, UserA] create the same chat
      const sortedParticipants = participants.sort((a, b) => 
        (a.userId || '').localeCompare(b.userId || '')
      );

      console.log('Original participants:', participants);
      console.log('Sorted participants:', sortedParticipants);
      console.log('Event ID:', eventId);
      console.log('Chat title:', chatTitle.trim() || undefined);

      const response = await apiService.createChat(
        sortedParticipants, 
        eventId, 
        chatTitle.trim() || undefined
      );

      console.log('Create chat response:', response);

      // Handle different response structures
      let chatData: Chat;
      const resp = response as any;
      
      if (resp.data?.data) {
        // Response structure: { data: { data: Chat } }
        chatData = resp.data.data as Chat;
      } else if (resp.data) {
        // Response structure: { data: Chat }
        chatData = resp.data as Chat;
      } else {
        // Response is the chat directly
        chatData = resp as Chat;
      }

      console.log('Chat created successfully:', chatData);
      
      if (chatData && chatData._id) {
        onChatCreated(chatData);
      } else {
        throw new Error('Invalid chat data received from server');
      }
      setOpen(false);
      setSelectedUsers([]);
      setSearchTerm('');
      setChatTitle('');
    } catch (error: unknown) {
      console.error('Error creating chat:', error);
      // Show error to user
      alert('Failed to create chat. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'producer':
        return 'bg-blue-100 text-blue-800';
      case 'supplier':
        return 'bg-green-100 text-green-800';
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Start Chat
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Start New Chat</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Chat Title Input (optional, for group chats) */}
          {selectedUsers.length > 1 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Chat Title (Optional)</label>
              <Input
                placeholder="Enter a title for this group chat..."
                value={chatTitle}
                onChange={(e) => setChatTitle(e.target.value)}
              />
            </div>
          )}

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Selected Users */}
          {selectedUsers.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Selected Users:</h4>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2"
                  >
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-xs">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{user.name}</span>
                    <Badge className={`text-xs ${getRoleColor(user.role)}`}>
                      {user.role}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUserRemove(user._id)}
                      className="h-6 w-6 p-0"
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Users List */}
          {(searchTerm || users.length > 0 || (!initialLoading && allUsers.length > 0)) && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">
                {searchTerm ? 'Search Results:' : 'Available Users:'}
              </h4>
              <ScrollArea className="h-48">
                {(loading || initialLoading) ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3 p-2 animate-pulse">
                        <div className="w-8 h-8 bg-muted rounded-full" />
                        <div className="flex-1 space-y-1">
                          <div className="h-4 bg-muted rounded w-3/4" />
                          <div className="h-3 bg-muted rounded w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : users.length > 0 ? (
                  <div className="space-y-1">
                    {users.map((user) => (
                      <div
                        key={user._id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
                        onClick={() => handleUserSelect(user)}
                      >
                        <Avatar className="w-8 h-8">
                          <AvatarFallback>
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{user.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                        <Badge className={`text-xs ${getRoleColor(user.role)}`}>
                          {user.role}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <User className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No users found</p>
                  </div>
                )}
              </ScrollArea>
            </div>
          )}

          {/* Create Chat Button */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateChat}
              disabled={selectedUsers.length === 0 || creating}
            >
              {creating ? 'Creating...' : `Create Chat (${selectedUsers.length})`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
