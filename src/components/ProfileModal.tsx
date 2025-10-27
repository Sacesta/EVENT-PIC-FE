// Changes to ProfileModal component

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Upload, User, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import apiService from '@/services/api'; // Import your API service
import { getImageUrl } from '@/utils/imageUtils';

interface UserDetails {
  name: string;
  email: string;
  phone?: string;
  role: 'producer' | 'supplier';
  language?: string;
  profileImage?: string | null;
  supplierDetails?: {
    description?: string;
    companyName?: string;
    instagramLink?: string;
    website?: string;
  };
  producerDetails?: {
    description?: string;
    companyName?: string;
    instagramLink?: string;
    website?: string;
  };
}

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserDetails;
  onUpdateUser: (updatedUser: UserDetails) => void;
}

const placeholderAvatars = [
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
];

export default function ProfileModal({ isOpen, onClose, user, onUpdateUser }: ProfileModalProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
const [formData, setFormData] = useState({
  name: user?.name || '',
  email: user?.email || '',
  phone: user?.phone || '',
  description: user?.role === 'supplier'
    ? user?.supplierDetails?.description || ''
    : user?.producerDetails?.description || '',
  companyName: user?.role === 'supplier'
    ? user?.supplierDetails?.companyName || ''
    : user?.producerDetails?.companyName || '',
  language: user?.language || 'he',
  instagramLink: user?.role === 'supplier'
    ? user?.supplierDetails?.instagramLink || ''
    : user?.producerDetails?.instagramLink || '',
  websiteLink: user?.role === 'supplier'
    ? user?.supplierDetails?.website || ''
    : user?.producerDetails?.website || '',
  profileImage: user?.profileImage || null
});

  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file',
          description: 'Please upload an image file',
          variant: 'destructive',
        });
        return;
      }

      // Validate file size (max 3MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Image must be less than 5MB',
          variant: 'destructive',
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, profileImage: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
      setUploadedFile(file);
    }
  };

  const handlePlaceholderSelect = (avatarUrl: string) => {
    setFormData(prev => ({ ...prev, profileImage: avatarUrl }));
    setUploadedFile(null);
    setShowAvatarPicker(false);
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsUploading(true);

  try {
    let profileImagePath = formData.profileImage;

    // Upload profile image if a new file was selected
    if (uploadedFile) {
      const uploadResponse = await apiService.uploadProfileImage(uploadedFile);
      if (uploadResponse.success && uploadResponse.data) {
        const data = uploadResponse.data as { profileImage?: string };
        if (data.profileImage) {
          profileImagePath = data.profileImage;
        } else {
          throw new Error('Failed to upload image');
        }
      } else {
        throw new Error('Failed to upload image');
      }
    }

    // Update user profile with API call
    const updatePayload = {
      name: formData.name,
      phone: formData.phone || '',
      language: formData.language,
      profileImage: profileImagePath,
      ...(user.role === 'producer' && {
        producerDetails: {
          description: formData.description,
          companyName: formData.companyName,
          instagramLink: formData.instagramLink,
          website: formData.websiteLink
        }
      }),
      ...(user.role === 'supplier' && {
        supplierDetails: {
          description: formData.description,
          companyName: formData.companyName,
          instagramLink: formData.instagramLink,
          website: formData.websiteLink
        }
      })
    };

    const apiResponse = await apiService.updateProfile(updatePayload);

    if (!apiResponse.success) {
      throw new Error('Failed to update profile');
    }

    // Update user state with response data
    const data = apiResponse.data as { user?: UserDetails };
    const updatedUser = {
      ...data.user,
      profileImage: profileImagePath
    };

    onUpdateUser(updatedUser);

    toast({
      title: t('profile.profileUpdated'),
      description: t('profile.profileUpdatedSuccessfully'),
    });

    setUploadedFile(null);
    onClose();
  } catch (error) {
    console.error('Profile update error:', error);
    toast({
      title: 'Error',
      description: error instanceof Error ? error.message : 'Failed to update profile',
      variant: 'destructive',
    });
  } finally {
    setIsUploading(false);
  }
};

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">{t('profile.editProfile')}</DialogTitle>
          <DialogDescription>
            {t('profile.updateProfileInfo')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Image Section */}
          <div className="space-y-4">
            <Label className="text-base font-medium">{t('profile.profilePicture')}</Label>
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={getImageUrl(formData.profileImage)} alt="Profile" />
                <AvatarFallback className="text-lg">
                  {getInitials(formData.name)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('profile-upload')?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4 mr-2" />
                    )}
                    {t('profile.upload')}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                    disabled={isUploading}
                  >
                    <User className="w-4 h-4 mr-2" />
                    {t('profile.chooseAvatar')}
                  </Button>
                </div>
                <input
                  id="profile-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              </div>
            </div>

            {/* Avatar Picker */}
            {showAvatarPicker && (
              <div className="grid grid-cols-4 gap-3 p-4 border rounded-lg bg-muted/30">
                {placeholderAvatars.map((avatar, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handlePlaceholderSelect(avatar)}
                    disabled={isUploading}
                    className="relative group disabled:opacity-50"
                  >
                    <Avatar className="w-16 h-16 transition-transform group-hover:scale-105">
                      <AvatarImage src={avatar} />
                    </Avatar>
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center">
                      <Camera className="w-4 h-4 text-white" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Personal Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('profile.fullName')}</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder={t('profile.enterFullName')}
                  disabled={isUploading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t('profile.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder={t('profile.enterEmail')}
                  disabled
                  className="opacity-60"
                />
                <p className="text-xs text-muted-foreground">{t('profile.emailCannotBeChanged')}</p>
              </div>



              <div className="space-y-2">
  <Label htmlFor="phone">{t('profile.phone')}</Label>
  <Input
    id="phone"
    type="tel"
    value={formData.phone}
    onChange={(e) => handleInputChange('phone', e.target.value)}
    placeholder={t('profile.enterPhone')}
    disabled={isUploading}
  />
</div>

              <div className="space-y-2">
                <Label htmlFor="companyName">{t('profile.companyName')}</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  placeholder={t('profile.enterCompanyName')}
                  disabled={isUploading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t('profile.bio')}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder={t('profile.tellUsAboutYourself')}
                  rows={3}
                  disabled={isUploading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagramLink">Instagram Link</Label>
                <Input
                  id="instagramLink"
                  value={formData.instagramLink}
                  onChange={(e) => handleInputChange('instagramLink', e.target.value)}
                  placeholder="https://instagram.com/yourusername"
                  disabled={isUploading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="websiteLink">Website Link</Label>
                <Input
                  id="websiteLink"
                  value={formData.websiteLink}
                  onChange={(e) => handleInputChange('websiteLink', e.target.value)}
                  placeholder="https://yourwebsite.com"
                  disabled={isUploading}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isUploading}
            >
              {t('profile.cancel')}
            </Button>
            <Button 
              type="submit"
              className="bg-primary hover:bg-primary/90"
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('profile.saving')}
                </>
              ) : (
                t('profile.saveChanges')
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}