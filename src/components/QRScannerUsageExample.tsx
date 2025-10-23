import { useState } from 'react';
import QRScannerModal from './QRScannerModal';

/**
 * EXAMPLE: How to use the QR Scanner Modal in your Producer Dashboard
 *
 * This shows how to integrate the QR scanner into your event management page
 */

interface Event {
  _id: string;
  name: string;
  startDate: string;
  location: {
    city: string;
    address: string;
  };
}

const EventCheckInPage = () => {
  const [showScanner, setShowScanner] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Example: Your event data (you probably already have this)
  const myEvent: Event = {
    _id: '673a1b2c3d4e5f6g7h8i9j0k',
    name: 'Summer Music Festival 2024',
    startDate: '2024-08-15T18:00:00.000Z',
    location: {
      city: 'Tel Aviv',
      address: 'Hayarkon Park'
    }
  };

  const handleOpenScanner = () => {
    setSelectedEvent(myEvent);
    setShowScanner(true);
  };

  const handleCloseScanner = () => {
    setShowScanner(false);
    setSelectedEvent(null);
    // Optional: Refresh attendee list or statistics
    // refreshEventData();
  };

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-[#031760] mb-4">
          {myEvent.name}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Event Stats */}
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Total Attendees</p>
            <p className="text-2xl font-bold text-[#031760]">150</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Checked In</p>
            <p className="text-2xl font-bold text-green-600">87</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Remaining</p>
            <p className="text-2xl font-bold text-yellow-600">63</p>
          </div>
        </div>

        {/* Scan QR Code Button */}
        <button
          onClick={handleOpenScanner}
          className="w-full bg-gradient-to-r from-[#031760] to-[#31A7FF] hover:from-[#031760]/90 hover:to-[#31A7FF]/90 text-white font-bold py-4 px-6 rounded-lg transition flex items-center justify-center gap-3 shadow-lg"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
          Scan QR Code to Check In Attendees
        </button>

        {/* Attendee List */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-[#031760] mb-4">Recent Check-ins</h2>
          <div className="space-y-2">
            {/* Example attendee cards */}
            <div className="border rounded-lg p-4 flex justify-between items-center">
              <div>
                <p className="font-semibold">John Doe</p>
                <p className="text-sm text-gray-600">VIP Ticket • Checked in 5 mins ago</p>
              </div>
              <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                Checked In
              </span>
            </div>
            <div className="border rounded-lg p-4 flex justify-between items-center">
              <div>
                <p className="font-semibold">Jane Smith</p>
                <p className="text-sm text-gray-600">General Admission • Checked in 12 mins ago</p>
              </div>
              <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                Checked In
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* QR Scanner Modal */}
      {showScanner && selectedEvent && (
        <QRScannerModal
          eventId={selectedEvent._id}
          eventName={selectedEvent.name}
          onClose={handleCloseScanner}
        />
      )}
    </div>
  );
};

export default EventCheckInPage;

/**
 * INTEGRATION STEPS:
 *
 * 1. Import the QRScannerModal component:
 *    import QRScannerModal from './QRScannerModal';
 *
 * 2. Add state to control the modal:
 *    const [showScanner, setShowScanner] = useState(false);
 *
 * 3. Add a button to open the scanner:
 *    <button onClick={() => setShowScanner(true)}>
 *      Scan QR Code
 *    </button>
 *
 * 4. Render the modal:
 *    {showScanner && (
 *      <QRScannerModal
 *        eventId={yourEvent._id}
 *        eventName={yourEvent.name}
 *        onClose={() => setShowScanner(false)}
 *      />
 *    )}
 *
 * That's it! The modal handles everything else:
 * - Camera access
 * - QR code scanning
 * - Verification via API
 * - Check-in process
 * - Error handling
 * - Success/failure feedback
 */
