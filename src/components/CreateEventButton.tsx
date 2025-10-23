import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

export const CreateEventButton: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleCreateEvent = useCallback(() => {
    // Navigate directly to create event page - no payment restrictions
    navigate('/create-event/step/1');
  }, [navigate]);

  const TriggerButton = children || (
    <Button
      onClick={handleCreateEvent}
      className="w-full h-14 mb-6 gradient-primary text-white font-bold text-lg rounded-2xl shadow-lg hover:opacity-90 transition-all duration-300 transform hover:-translate-y-0.5"
      size="lg"
    >
      <svg
        className="w-5 h-5 mr-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4v16m8-8H4"
        />
      </svg>
      {t('homepage.createEvent')}
    </Button>
  );

  return (
    <>
      {children ? (
        <div onClick={handleCreateEvent} className="cursor-pointer">
          {TriggerButton}
        </div>
      ) : (
        TriggerButton
      )}
    </>
  );
};






