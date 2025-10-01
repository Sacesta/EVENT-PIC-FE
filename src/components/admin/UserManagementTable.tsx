import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  UserPlus,
  Shield,
  User
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import apiService from '@/services/api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  verificationStatus: string;
  createdAt: string;
  lastLogin: string;
}

interface UserManagementTableProps {
  users: User[];
  onUserUpdate: () => void;
  onCreateUser: () => void;
  onEditUser: (user: User) => void;
}

const UserManagementTable: React.FC<UserManagementTableProps> = ({
  users,
  onUserUpdate,
  onCreateUser,
  onEditUser
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(t('admin.users.confirmDelete', 'Are you sure you want to delete this user?') + ` (${userName})`)) {
      return;
    }

    setLoadingUserId(userId);
    try {
      await apiService.deleteUser(userId);
      toast({
        title: t('common.success', 'Success'),
        description: t('admin.users.userDeleted', 'User deleted successfully'),
      });
      onUserUpdate();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: t('common.error', 'Error'),
        description: t('admin.users.deleteError', 'Failed to delete user'),
        variant: "destructive"
      });
    } finally {
      setLoadingUserId(null);
    }
  };

  const handleApproveSupplier = async (userId: string, status: 'approved' | 'rejected') => {
    setLoadingUserId(userId);
    try {
      await apiService.updateUserVerification(userId, status);
      toast({
        title: t('common.success', 'Success'),
        description: t('admin.users.supplierStatusUpdated', `Supplier ${status} successfully`),
      });
      onUserUpdate();
    } catch (error) {
      console.error('Error updating supplier status:', error);
      toast({
        title: t('common.error', 'Error'),
        description: t('admin.users.statusUpdateError', 'Failed to update supplier status'),
        variant: "destructive"
      });
    } finally {
      setLoadingUserId(null);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'default';
      case 'supplier': return 'secondary';
      case 'producer': return 'outline';
      default: return 'secondary';
    }
  };

  const getVerificationBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">{t('admin.users.title', 'User Management')}</h3>
          <p className="text-sm text-muted-foreground">
            {t('admin.users.subtitle', 'Manage all platform users and their permissions')}
          </p>
        </div>
        <Button onClick={onCreateUser} className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          {t('admin.users.createUser', 'Create User')}
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('admin.users.name', 'Name')}</TableHead>
              <TableHead>{t('admin.users.email', 'Email')}</TableHead>
              <TableHead>{t('admin.users.role', 'Role')}</TableHead>
              <TableHead>{t('admin.users.status', 'Status')}</TableHead>
              <TableHead>{t('admin.users.verified', 'Verified')}</TableHead>
              <TableHead>{t('admin.users.created', 'Created')}</TableHead>
              <TableHead className="text-right">{t('common.actions', 'Actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <User className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      {t('admin.users.noUsers', 'No users found')}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      {user.name}
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {user.role === 'admin' && <Shield className="h-4 w-4" />}
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {user.role}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getVerificationBadgeVariant(user.verificationStatus)}>
                      {user.verificationStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isVerified ? 'default' : 'secondary'}>
                      {user.isVerified ? t('common.yes', 'Yes') : t('common.no', 'No')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          className="h-8 w-8 p-0"
                          disabled={loadingUserId === user._id}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEditUser(user)}>
                          <Edit className="mr-2 h-4 w-4" />
                          {t('common.edit', 'Edit')}
                        </DropdownMenuItem>
                        
                        {user.role === 'supplier' && user.verificationStatus === 'pending' && (
                          <>
                            <DropdownMenuItem 
                              onClick={() => handleApproveSupplier(user._id, 'approved')}
                              className="text-green-600"
                            >
                              <Check className="mr-2 h-4 w-4" />
                              {t('admin.users.approve', 'Approve Supplier')}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleApproveSupplier(user._id, 'rejected')}
                              className="text-red-600"
                            >
                              <X className="mr-2 h-4 w-4" />
                              {t('admin.users.reject', 'Reject Supplier')}
                            </DropdownMenuItem>
                          </>
                        )}
                        
                        <DropdownMenuItem 
                          onClick={() => handleDeleteUser(user._id, user.name)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t('common.delete', 'Delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default UserManagementTable;