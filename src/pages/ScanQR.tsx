import React from 'react';
import { useParams } from 'react-router-dom';
import QRScannerModal from '@/components/QRScannerModal';

const ScanQR = () => {
  const { eventId } = useParams<{ eventId: string }>();

  if (!eventId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Event Not Found</h1>
          <p className="text-muted-foreground">No event ID provided.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <QRScannerModal
        eventId={eventId}
        eventName="Event Check-in"
        onClose={() => window.history.back()}
      />
    </div>
  );
};

export default ScanQR;
