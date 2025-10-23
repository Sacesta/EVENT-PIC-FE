import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Shield, 
  ShieldCheck, 
  ShieldX,
  Building,
  Star,
  MapPin
} from 'lucide-react';
import { format } from 'date-fns';

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
    isVerified: boolean;
    verificationStatus: string;
    createdAt: string;
    lastLogin: string;
    isActive: boolean;
    language: string;
    profileImage?: string;
    producerDetails?: {
      companyName?: string;
      specializations: string[];
    };
    supplierDetails?: {
      companyName?: string;
      categories: string[];
      rating: {
        average: number;
        count: number;
      };
    };
  } | null;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  isOpen,
  onClose,
  user
}) => {
  if (!user) return null;

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'default';
      case 'supplier':
        return 'secondary';
      case 'producer':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800"><ShieldCheck className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Shield className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="bg-red-100 text-red-800"><ShieldX className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-lg font-medium">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold">{user.name}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </DialogTitle>
          <DialogDescription>
            Complete user information and account details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Role</label>
                  <div className="mt-1">
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {user.role}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">
                    <Badge variant={user.isActive ? 'default' : 'secondary'}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Verification Status</label>
                <div className="mt-1">
                  {getVerificationBadge(user.verificationStatus)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Language</label>
                  <p className="mt-1 text-sm">{user.language || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">User ID</label>
                  <p className="mt-1 text-xs font-mono">{user._id}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created At</label>
                <p className="mt-1 text-sm">{formatDate(user.createdAt)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Last Login</label>
                <p className="mt-1 text-sm">{formatDate(user.lastLogin)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Role-specific Information */}
          {user.producerDetails && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Producer Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {user.producerDetails.companyName && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Company Name</label>
                    <p className="mt-1 text-sm">{user.producerDetails.companyName}</p>
                  </div>
                )}
                {user.producerDetails.specializations && user.producerDetails.specializations.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Specializations</label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {user.producerDetails.specializations.map((spec, index) => (
                        <Badge key={index} variant="outline">{spec}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {user.supplierDetails && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Supplier Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {user.supplierDetails.companyName && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Company Name</label>
                    <p className="mt-1 text-sm">{user.supplierDetails.companyName}</p>
                  </div>
                )}
                {user.supplierDetails.categories && user.supplierDetails.categories.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Categories</label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {user.supplierDetails.categories.map((category, index) => (
                        <Badge key={index} variant="outline">{category}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {user.supplierDetails.rating && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Rating</label>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="ml-1 text-sm font-medium">
                          {user.supplierDetails.rating.average.toFixed(1)}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        ({user.supplierDetails.rating.count} reviews)
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsModal;
