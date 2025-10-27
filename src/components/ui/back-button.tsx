import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface BackButtonProps {
  onClick: () => void;
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'destructive' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children?: React.ReactNode;
  showText?: boolean;
}

export const BackButton: React.FC<BackButtonProps> = ({
  onClick,
  variant = 'outline',
  size = 'sm',
  className,
  children,
  showText = true
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'he';

  // Use ArrowRight for RTL (Hebrew), ArrowLeft for LTR (English)
  const ArrowIcon = isRTL ? ArrowRight : ArrowLeft;

  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      className={cn('flex items-center gap-2', className)}
    >
      {isRTL ? (
        <>
          {showText && (children || t('common.back', 'חזרה'))}
          <ArrowIcon className="w-4 h-4" />
        </>
      ) : (
        <>
          <ArrowIcon className="w-4 h-4" />
          {showText && (children || t('common.back', 'Back'))}
        </>
      )}
    </Button>
  );
};
