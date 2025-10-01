import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ResetPasswordModal from '@/components/ResetPasswordModal';
import { useToast } from '@/hooks/use-toast';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    
    if (!tokenParam) {
      toast({
        title: "Invalid Link",
        description: "No reset token found in the URL. Please request a new password reset.",
        variant: "destructive"
      });
      navigate('/');
      return;
    }

    setToken(tokenParam);
    setIsModalOpen(true);
  }, [searchParams, navigate, toast]);

  const handleModalClose = () => {
    setIsModalOpen(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <ResetPasswordModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          token={token || undefined}
        />
      </div>
    </div>
  );
};

export default ResetPassword;
