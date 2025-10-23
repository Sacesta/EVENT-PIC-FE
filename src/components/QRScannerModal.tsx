import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner, Html5QrcodeScannerState } from 'html5-qrcode';
import { apiService } from '@/services/api';
import { toast } from 'sonner';

interface AttendeeInfo {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  age: number;
  gender: string;
  bookingReference: string;
  ticketType: string;
  ticketQuantity: number;
  totalAmount: number;
  checkedIn: boolean;
  checkedInAt?: string;
  specialRequirements?: string;
  eventName: string;
  eventDate: string;
  eventLocation: any;
}

interface ScanResult {
  valid: boolean;
  attendee?: AttendeeInfo;
  alreadyCheckedIn?: boolean;
  error?: string;
}

interface QRScannerModalProps {
  eventId?: string;
  eventName?: string;
  onClose: () => void;
}

const QRScannerModal = ({ eventId, eventName, onClose }: QRScannerModalProps) => {
  const isModal = !eventId; // If no eventId, it's used as a modal
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(true);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Initialize scanner
    if (!scannerRef.current && scanning) {
      const scanner = new Html5QrcodeScanner(
        'qr-reader',
        {
          fps: 10, // Frames per second for scanning
          qrbox: { width: 250, height: 250 }, // Size of scanning box
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true, // Show flashlight toggle if available
          showZoomSliderIfSupported: true, // Show zoom if available
        },
        false // verbose logging
      );

      scanner.render(onScanSuccess, onScanError);
      scannerRef.current = scanner;
    }

    // Cleanup on unmount
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((error) => {
          console.error('Failed to clear scanner:', error);
        });
        scannerRef.current = null;
      }
    };
  }, [scanning]);

  const onScanSuccess = async (decodedText: string, decodedResult: any) => {
    console.log('QR Code scanned:', decodedText);

    // Stop scanning while we verify
    setScanning(false);
    setLoading(true);

    // Stop the scanner
    if (scannerRef.current) {
      scannerRef.current.clear().catch(console.error);
      scannerRef.current = null;
    }

    await verifyQRCode(decodedText);
  };

  const onScanError = (errorMessage: string) => {
    // This fires continuously while scanning, so we don't log it
    // Only actual scan failures are logged
  };

  const verifyQRCode = async (qrCode: string) => {
    try {
      // Use the apiService instead of direct fetch to avoid duplicate calls
      const response = await apiService.verifyQR(qrCode.trim());

      if (response.success) {
        // Redirect to the detailed check-in page instead of showing modal result
        navigate(`/qr-result/${encodeURIComponent(qrCode)}`);
        return;
      } else {
        setResult({
          valid: false,
          error: response.message || 'Invalid ticket'
        });

        // Show toast with error message
        toast.error(response.message || 'Invalid ticket');

        // Play error sound (optional)
        playSound('error');
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to verify ticket. Please try again.';
      setResult({
        valid: false,
        error: errorMessage
      });

      // Show toast with error message
      toast.error(errorMessage);

      playSound('error');
    } finally {
      setLoading(false);
    }
  };

  const checkInAttendee = async (attendeeId: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/attendees/${attendeeId}/check-in`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        // Update result to show checked in
        setResult(prev => prev ? {
          ...prev,
          alreadyCheckedIn: true,
          attendee: prev.attendee ? {
            ...prev.attendee,
            checkedIn: true,
            checkedInAt: new Date().toISOString()
          } : undefined
        } : null);

        playSound('success');

        // Auto close after 2 seconds
        setTimeout(() => {
          resetScanner();
        }, 2000);
      } else {
        alert('Failed to check in: ' + data.message);
      }
    } catch (error: any) {
      console.error('Check-in error:', error);
      alert('Failed to check in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const playSound = (type: 'success' | 'error') => {
    // Optional: Play audio feedback
    const audio = new Audio(type === 'success'
      ? '/sounds/success.mp3'
      : '/sounds/error.mp3'
    );
    audio.play().catch(() => {
      // Ignore errors if sounds don't exist
    });
  };

  const resetScanner = () => {
    setResult(null);
    setScanning(true);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#031760] to-[#31A7FF] text-white p-6 rounded-t-lg">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">QR Code Scanner</h2>
              <p className="text-sm opacity-90 mt-1">{eventName || 'Ticket Check-in'}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Scanner View */}
          {scanning && !result && (
            <div>
              <div className="mb-4 text-center">
                <p className="text-gray-600">
                  Position the QR code within the frame to scan
                </p>
              </div>
              <div id="qr-reader" className="w-full"></div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#031760]"></div>
              <p className="mt-4 text-gray-600">Verifying ticket...</p>
            </div>
          )}

          {/* Result Display */}
          {result && !loading && (
            <div className="space-y-4">
              {/* Valid Ticket */}
              {result.valid && result.attendee && (
                <div>
                  {/* Status Banner */}
                  <div className={`rounded-lg p-4 mb-4 ${
                    result.alreadyCheckedIn
                      ? 'bg-yellow-50 border-2 border-yellow-400'
                      : 'bg-green-50 border-2 border-green-400'
                  }`}>
                    <div className="flex items-center">
                      {result.alreadyCheckedIn ? (
                        <>
                          <svg className="w-6 h-6 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <div>
                            <p className="font-bold text-yellow-800">Already Checked In</p>
                            <p className="text-sm text-yellow-700">
                              {new Date(result.attendee.checkedInAt!).toLocaleString()}
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div>
                            <p className="font-bold text-green-800">Valid Ticket</p>
                            <p className="text-sm text-green-700">Ready to check in</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Attendee Details */}
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <h3 className="font-bold text-lg text-[#031760] border-b pb-2">
                      Attendee Information
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Name</p>
                        <p className="font-semibold text-lg">{result.attendee.fullName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Booking Reference</p>
                        <p className="font-mono font-semibold text-[#31A7FF]">
                          {result.attendee.bookingReference}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="text-sm">{result.attendee.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="text-sm">{result.attendee.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Ticket Type</p>
                        <p className="font-semibold">{result.attendee.ticketType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Quantity</p>
                        <p className="font-semibold">{result.attendee.ticketQuantity} ticket(s)</p>
                      </div>
                      {result.attendee.totalAmount > 0 && (
                        <div>
                          <p className="text-sm text-gray-500">Amount Paid</p>
                          <p className="font-semibold">${result.attendee.totalAmount.toFixed(2)}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-gray-500">Age / Gender</p>
                        <p className="text-sm">{result.attendee.age} / {result.attendee.gender}</p>
                      </div>
                    </div>

                    {result.attendee.specialRequirements && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm text-gray-500">Special Requirements</p>
                        <p className="text-sm bg-yellow-50 p-2 rounded mt-1">
                          {result.attendee.specialRequirements}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 flex gap-3">
                    {!result.alreadyCheckedIn ? (
                      <>
                        <button
                          onClick={() => checkInAttendee(result.attendee!._id)}
                          disabled={loading}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          ✓ Check In Now
                        </button>
                        <button
                          onClick={resetScanner}
                          className="px-6 py-3 border-2 border-gray-300 hover:border-gray-400 rounded-lg font-semibold transition"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={resetScanner}
                        className="flex-1 bg-[#031760] hover:bg-[#031760]/90 text-white font-semibold py-3 px-6 rounded-lg transition"
                      >
                        Scan Next Ticket
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Invalid Ticket */}
              {!result.valid && (
                <div>
                  <div className="bg-red-50 border-2 border-red-400 rounded-lg p-6 text-center">
                    <svg className="w-16 h-16 text-red-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-xl font-bold text-red-800 mb-2">Invalid Ticket</h3>
                    <p className="text-red-700">{result.error}</p>
                  </div>

                  <button
                    onClick={resetScanner}
                    className="w-full mt-4 bg-[#031760] hover:bg-[#031760]/90 text-white font-semibold py-3 px-6 rounded-lg transition"
                  >
                    Scan Again
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Instructions (shown only when scanning) */}
        {scanning && !result && (
          <div className="bg-gray-50 px-6 py-4 rounded-b-lg border-t">
            <p className="text-sm text-gray-600 text-center">
              💡 <strong>Tip:</strong> Make sure the QR code is well-lit and centered in the frame
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRScannerModal;
