import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode, Html5QrcodeCameraScanConfig } from 'html5-qrcode';
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
  tickets?: Array<{
    ticketId: string;
    checkedIn: boolean;
    checkedInAt?: string;
  }>;
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
  const isModal = !eventId;
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [scanMode, setScanMode] = useState<'camera' | 'upload'>('camera');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mountedRef = useRef(true);

  const startCamera = async () => {
    // Verify DOM element exists first
    const qrReaderElement = document.getElementById('qr-reader');
    if (!qrReaderElement) {
      console.error('QR reader element not found in DOM');
      setCameraError('Scanner interface not ready. Please try again.');
      return;
    }

    // Clear any previous errors
    setCameraError(null);
    setPermissionDenied(false);
    setScanning(false);
    setLoading(true);

    try {
      console.log('Starting camera initialization...');

      // Stop existing scanner if any
      if (scannerRef.current) {
        try {
          const state = await scannerRef.current.getState();
          if (state === 2) { // SCANNING state
            console.log('Stopping existing scanner...');
            await scannerRef.current.stop();
          }
          await scannerRef.current.clear();
        } catch (e) {
          console.log('No active scanner to stop');
        }
        scannerRef.current = null;
      }

      // Small delay to ensure cleanup is complete
      await new Promise(resolve => setTimeout(resolve, 100));

      // Initialize the QR scanner
      console.log('Creating new Html5Qrcode instance...');
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;

      // Configuration for camera scanning
      const config: Html5QrcodeCameraScanConfig = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      };

      // Try back camera first
      console.log('Attempting to start scanner with back camera...');
      try {
        await scanner.start(
          { facingMode: 'environment' },
          config,
          onScanSuccess,
          onScanError
        );
        console.log('✅ Scanner started successfully with back camera!');
        if (mountedRef.current) {
          setScanning(true);
          setLoading(false);
          setCameraError(null);
        }
        return;
      } catch (backCameraError: any) {
        console.log('Back camera failed, trying front camera...', backCameraError.message);

        // Try front camera fallback
        try {
          await scanner.start(
            { facingMode: 'user' },
            config,
            onScanSuccess,
            onScanError
          );
          console.log('✅ Scanner started successfully with front camera!');
          if (mountedRef.current) {
            setScanning(true);
            setLoading(false);
            setCameraError(null);
          }
          return;
        } catch (frontCameraError: any) {
          console.log('Front camera also failed, trying manual camera selection...', frontCameraError.message);
        }
      }

      // Manual camera selection fallback
      console.log('Manual camera selection fallback...');
      const cameras = await Html5Qrcode.getCameras();
      console.log('Cameras retrieved:', cameras);

      if (!cameras || cameras.length === 0) {
        throw new Error('No cameras found on this device');
      }

      // Prefer back camera
      const backCamera = cameras.find(camera =>
        camera.label.toLowerCase().includes('back') ||
        camera.label.toLowerCase().includes('environment') ||
        camera.label.toLowerCase().includes('rear')
      );

      const selectedCamera = backCamera || cameras[0];
      const cameraId = selectedCamera.id;

      console.log('Selected camera:', selectedCamera);
      console.log('Starting scanner with camera ID:', cameraId);
      
      await scanner.start(
        cameraId,
        config,
        onScanSuccess,
        onScanError
      );

      console.log('✅ Scanner started successfully!');
      if (mountedRef.current) {
        setScanning(true);
        setLoading(false);
        setCameraError(null);
      }
    } catch (error: any) {
      console.error('❌ Failed to start camera:', error);
      if (!mountedRef.current) return;
      
      setLoading(false);

      let errorMessage = '';
      let isDenied = false;

      const errorStr = (error.message || '').toLowerCase();

      if (error.name === 'NotAllowedError' ||
          error.name === 'PermissionDeniedError' ||
          errorStr.includes('permission') ||
          errorStr.includes('denied') ||
          errorStr.includes('not allowed')) {
        isDenied = true;
        errorMessage = 'Camera access was denied. Please allow camera access in your browser settings and click "Try Again".';
      } else if (error.name === 'NotFoundError' ||
                 errorStr.includes('no camera') ||
                 errorStr.includes('not found')) {
        errorMessage = 'No camera found on this device.';
      } else if (error.name === 'NotReadableError' ||
                 error.name === 'AbortError' ||
                 errorStr.includes('in use') ||
                 errorStr.includes('already')) {
        errorMessage = 'Camera is already in use. Please close other apps using the camera and try again.';
      } else if (errorStr.includes('insecure')) {
        errorMessage = 'Camera access requires a secure connection (HTTPS). Please use HTTPS.';
      } else if (error.message) {
        errorMessage = `Camera error: ${error.message}`;
      } else {
        errorMessage = 'Failed to access camera. Please check your browser permissions and try again.';
      }

      setPermissionDenied(isDenied);
      setCameraError(errorMessage);
      setScanning(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    
    return () => {
      mountedRef.current = false;
      const cleanup = async () => {
        if (scannerRef.current) {
          try {
            const state = await scannerRef.current.getState();
            if (state === 2) {
              await scannerRef.current.stop();
            }
            await scannerRef.current.clear();
            scannerRef.current = null;
            console.log('Scanner cleaned up successfully');
          } catch (error) {
            console.log('Cleanup error (safe to ignore):', error);
            scannerRef.current = null;
          }
        }
      };
      cleanup();
    };
  }, []);

  // Start camera when switching to camera mode
  useEffect(() => {
    if (scanMode === 'camera' && !scanning && !result && !loading && !cameraError) {
      // Wait for DOM to be ready
      const timer = setTimeout(() => {
        const qrReaderElement = document.getElementById('qr-reader');
        if (qrReaderElement) {
          startCamera();
        } else {
          console.log('QR reader element not found, retrying...');
          // Retry after delay
          setTimeout(() => {
            if (document.getElementById('qr-reader')) {
              startCamera();
            } else {
              setCameraError('Scanner interface failed to load. Please refresh the page.');
            }
          }, 300);
        }
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [scanMode, scanning, result, loading, cameraError]);

  const onScanSuccess = async (decodedText: string, decodedResult: any) => {
    if (!mountedRef.current) return;
    
    console.log('QR Code scanned:', decodedText);

    // Stop scanning while we verify
    setScanning(false);
    setLoading(true);

    // Stop the scanner
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
        scannerRef.current = null;
      } catch (error) {
        console.error('Error stopping scanner:', error);
      }
    }

    await verifyQRCode(decodedText);
  };

  const onScanError = (errorMessage: string) => {
    // Fires continuously while scanning, ignore
  };

  const verifyQRCode = async (qrCode: string) => {
    try {
      const response = await apiService.verifyQR(qrCode.trim());

      if (!mountedRef.current) return;

      if (response.success) {
        setResult({
          valid: true,
          attendee: response.data.attendee,
          alreadyCheckedIn: response.data.alreadyCheckedIn
        });

        if (response.data.alreadyCheckedIn) {
          toast.warning('This ticket has already been checked in');
          playSound('error');
        } else {
          toast.success('Valid ticket found!');
          playSound('success');
        }
      } else {
        setResult({
          valid: false,
          error: response.message || 'Invalid ticket'
        });
        toast.error(response.message || 'Invalid ticket');
        playSound('error');
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      if (!mountedRef.current) return;
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to verify ticket. Please try again.';
      setResult({
        valid: false,
        error: errorMessage
      });
      toast.error(errorMessage);
      playSound('error');
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  const checkInAttendee = async (attendeeId: string) => {
    setLoading(true);
    try {
      const response = await apiService.checkInAllTickets(attendeeId);

      if (response.success) {
        setResult(prev => prev ? {
          ...prev,
          alreadyCheckedIn: true,
          attendee: prev.attendee ? {
            ...prev.attendee,
            checkedIn: true,
            checkedInAt: new Date().toISOString()
          } : undefined
        } : null);

        toast.success('Attendee checked in successfully!');
        playSound('success');

        setTimeout(() => {
          resetScanner();
        }, 3000);
      } else {
        toast.error('Failed to check in: ' + response.message);
      }
    } catch (error: any) {
      console.error('Check-in error:', error);
      toast.error('Failed to check in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const playSound = (type: 'success' | 'error') => {
    const audio = new Audio(type === 'success'
      ? '/sounds/success.mp3'
      : '/sounds/error.mp3'
    );
    audio.play().catch(() => {});
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setResult(null);
    setCameraError(null);

    try {
      // Stop existing scanner if any
      if (scannerRef.current) {
        try {
          const state = await scannerRef.current.getState();
          if (state === 2) {
            await scannerRef.current.stop();
          }
          await scannerRef.current.clear();
          scannerRef.current = null;
        } catch (e) {
          console.log('No active scanner to stop');
        }
      }

      // Initialize scanner for file reading
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;

      const result = await scanner.scanFile(file, true);
      console.log('QR Code from file:', result);

      await verifyQRCode(result);
    } catch (error: any) {
      console.error('File scan error:', error);
      setResult({
        valid: false,
        error: 'Failed to read QR code from image. Please ensure the image contains a clear QR code.'
      });
      toast.error('Failed to read QR code from image');
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = async () => {
    console.log('Resetting scanner...');
    setResult(null);
    setCameraError(null);
    setPermissionDenied(false);
    setScanning(false);
    setLoading(true);

    // Stop and clear the existing scanner
    if (scannerRef.current) {
      try {
        const state = await scannerRef.current.getState();
        if (state === 2) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
        scannerRef.current = null;
      } catch (error) {
        console.log('Scanner already stopped:', error);
        scannerRef.current = null;
      }
    }

    // Wait for cleanup
    await new Promise(resolve => setTimeout(resolve, 150));

    // Restart camera
    if (scanMode === 'camera') {
      await startCamera();
    } else {
      setLoading(false);
    }
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

        {/* Mode Toggle */}
        {!result && !loading && (
          <div className="bg-gray-50 px-6 py-3 border-b">
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setScanMode('camera')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  scanMode === 'camera'
                    ? 'bg-[#031760] text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                📷 Scan with Camera
              </button>
              <button
                onClick={() => setScanMode('upload')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  scanMode === 'upload'
                    ? 'bg-[#031760] text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                📎 Upload Photo
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {/* Upload Mode */}
          {scanMode === 'upload' && !result && !loading && (
            <div className="text-center py-8">
              <div className="mb-6">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Upload QR Code Photo</h3>
                <p className="text-gray-600 mb-4">
                  Select a photo containing a QR code to scan and verify the ticket
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-[#031760] hover:bg-[#031760]/90 text-white font-bold py-3 px-8 rounded-lg transition shadow-lg"
              >
                📎 Choose Photo
              </button>
              <p className="text-sm text-gray-500 mt-3">
                Supported formats: JPG, PNG, GIF, WebP
              </p>
            </div>
          )}

          {/* Camera Error */}
          {cameraError && !loading && scanMode === 'camera' && (
            <div className="space-y-4">
              <div className="bg-red-50 border-2 border-red-400 rounded-lg p-6 text-center">
                <svg className="w-16 h-16 text-red-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                </svg>
                <h3 className="text-xl font-bold text-red-800 mb-2">Camera Access Required</h3>
                <p className="text-red-700 mb-4">{cameraError}</p>
              </div>

              {permissionDenied && (
                <div className="bg-blue-50 border-l-4 border-blue-400 rounded-lg p-4">
                  <div className="flex items-start">
                    <svg className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1">
                      <h4 className="font-bold text-blue-900 mb-2">How to enable camera access:</h4>
                      <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                        <li>Click the camera icon in your browser's address bar</li>
                        <li>Select "Allow" or "Always allow" for camera access</li>
                        <li>Click "Try Again" below to restart the scanner</li>
                      </ol>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={startCamera}
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Try Again
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3 border-2 border-gray-300 hover:border-gray-400 rounded-lg font-semibold transition"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Scanner View - MUST BE RENDERED EVEN WHEN NOT SCANNING */}
          {scanMode === 'camera' && !result && !cameraError && (
            <div>
              {scanning && (
                <div className="mb-4 text-center">
                  <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg mb-2">
                    <svg className="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                    </svg>
                    <span className="font-semibold">Camera Active</span>
                  </div>
                  <p className="text-gray-700 font-medium text-lg">
                    Position the QR code within the frame
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    The scanner will detect the code automatically
                  </p>
                </div>
              )}
              
              {/* THIS ELEMENT MUST ALWAYS BE PRESENT */}
              <div id="qr-reader" className="w-full rounded-lg overflow-hidden shadow-lg" style={{ minHeight: '300px' }}></div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#031760]"></div>
              <p className="mt-4 text-gray-600">
                {scanning ? 'Starting camera...' : 'Verifying ticket...'}
              </p>
            </div>
          )}

          {/* Result Display */}
          {result && !loading && (
            <div className="space-y-4">
              {/* Valid Ticket */}
              {result.valid && result.attendee && (
                <div>
                  {/* Status Banner */}
                  <div className={`rounded-lg p-5 mb-4 ${
                    result.alreadyCheckedIn
                      ? 'bg-yellow-50 border-2 border-yellow-400'
                      : 'bg-green-50 border-2 border-green-500'
                  }`}>
                    <div className="flex items-start">
                      {result.alreadyCheckedIn ? (
                        <>
                          <svg className="w-8 h-8 text-yellow-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <div className="flex-1">
                            <p className="font-bold text-lg text-yellow-800">Already Checked In</p>
                            <p className="text-sm text-yellow-700 mt-1">
                              Checked in at: {new Date(result.attendee.checkedInAt!).toLocaleString()}
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <svg className="w-8 h-8 text-green-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div className="flex-1">
                            <p className="font-bold text-lg text-green-800">Valid Ticket!</p>
                            <p className="text-sm text-green-700 mt-1">Ready to check in</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Event Information */}
                  <div className="bg-gradient-to-r from-[#031760] to-[#31A7FF] text-white rounded-lg p-4 mb-4">
                    <p className="text-sm opacity-90 mb-1">Event</p>
                    <p className="font-bold text-xl">{result.attendee.eventName}</p>
                    {result.attendee.eventDate && (
                      <p className="text-sm opacity-90 mt-2">
                        {new Date(result.attendee.eventDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    )}
                  </div>

                  {/* Attendee Details */}
                  <div className="bg-gray-50 rounded-lg p-5 space-y-4">
                    <h3 className="font-bold text-xl text-[#031760] border-b-2 border-[#31A7FF] pb-2">
                      Attendee Information
                    </h3>

                    {/* Primary Info */}
                    <div className="bg-white rounded-lg p-4 shadow-sm space-y-3">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Full Name</p>
                        <p className="font-bold text-2xl text-[#031760]">{result.attendee.fullName}</p>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Email Address</p>
                          <p className="font-medium text-base break-all">{result.attendee.email}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Phone Number</p>
                          <p className="font-medium text-base">{result.attendee.phone}</p>
                        </div>
                      </div>
                    </div>

                    {/* Booking Details */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Booking Ref</p>
                        <p className="font-mono font-bold text-lg text-[#31A7FF]">
                          {result.attendee.bookingReference}
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Ticket Type</p>
                        <p className="font-semibold text-base">{result.attendee.ticketType}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Quantity</p>
                        <p className="font-bold text-lg">{result.attendee.ticketQuantity} ticket(s)</p>
                      </div>
                      {result.attendee.totalAmount > 0 && (
                        <div className="bg-white rounded-lg p-3 shadow-sm">
                          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Amount Paid</p>
                          <p className="font-bold text-lg text-green-600">${result.attendee.totalAmount.toFixed(2)}</p>
                        </div>
                      )}
                    </div>

                    {/* Additional Info */}
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Personal Details</p>
                      <p className="font-medium">{result.attendee.age} years old • {result.attendee.gender}</p>
                    </div>

                    {result.attendee.specialRequirements && (
                      <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4">
                        <p className="text-xs text-yellow-700 uppercase tracking-wide font-semibold mb-2">
                          ⚠️ Special Requirements
                        </p>
                        <p className="text-sm text-yellow-900 font-medium">
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
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg text-lg"
                        >
                          ✓ Check In Now
                        </button>
                        <button
                          onClick={resetScanner}
                          className="px-6 py-4 border-2 border-gray-300 hover:border-gray-400 rounded-lg font-semibold transition"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={resetScanner}
                        className="flex-1 bg-[#031760] hover:bg-[#031760]/90 text-white font-bold py-4 px-6 rounded-lg transition shadow-lg text-lg"
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

        {/* Instructions */}
        {scanning && !result && !cameraError && (
          <div className="bg-gray-50 px-6 py-4 rounded-b-lg border-t">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>
                <strong>Tip:</strong> Ensure good lighting and hold steady for best results
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRScannerModal;