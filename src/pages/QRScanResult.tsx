import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  CreditCard,
  Check,
  X,
  AlertCircle,
  QrCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiService } from "@/services/api";
import { toast } from "sonner";

interface Ticket {
  _id: string;
  ticketId: string;
  ticketType: string;
  ticketName: string;
  price: number;
  currency: string;
  quantity: number;
  checkedIn: boolean;
  checkedInAt?: string;
  checkedInBy?: string;
}

interface AttendeeInfo {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  age?: number;
  gender?: string;
  bookingReference: string;
  ticketType: string;
  ticketQuantity: number;
  totalAmount: number;
  currency?: string;
  checkedIn: boolean;
  specialRequirements?: string;
  eventName: string;
  eventDate?: string;
  eventLocation?: {
    coordinates?: any;
    address?: string;
    city?: string;
  };
  individualTickets?: Array<{
    ticketId: string;
    ticketNumber: number;
    checkedIn: boolean;
    _id: string;
    id: string;
  }>;
}

const QRScanResult = () => {
  const { qrCode } = useParams<{ qrCode: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const location = useLocation();

  const [attendeeInfo, setAttendeeInfo] = useState<AttendeeInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkingIn, setCheckingIn] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [alreadyCheckedIn, setAlreadyCheckedIn] = useState(false);

  useEffect(() => {
    // Get QR code from URL params or location state
    const qrCodeFromParams = qrCode;
    const qrCodeFromState = location.state?.qrCode;

    const finalQrCode = qrCodeFromParams || qrCodeFromState;

    if (!finalQrCode) {
      setError("No QR code provided");
      setIsLoading(false);
      return;
    }

    fetchAttendeeInfo(finalQrCode);
  }, [qrCode, location.state]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const fetchAttendeeInfo = async (finalQrCode: string) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("🔍 QRScanResult - Final QR code:", finalQrCode);

      if (!finalQrCode || finalQrCode.trim() === "") {
        throw new Error("QR code is required");
      }

      // Use the verify-qr endpoint to get attendee info by QR code
      const response = await apiService.verifyQR(finalQrCode.trim());

      console.log("✅ QRScanResult - API response:", response);

      if (response.success && response.data) {
        setAttendeeInfo(response.data.attendee);
        // Check if already checked in based on the response
        if (response.alreadyCheckedIn) {
          setAlreadyCheckedIn(true);
        }
      } else {
        setError(response.message || "Failed to fetch attendee information");
      }
    } catch (err: any) {
      console.error("❌ QRScanResult - Error fetching attendee info:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load attendee information"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleIndividualCheckIn = async (ticketId: string) => {
    if (!attendeeInfo) return;

    // Find the ticket object to get the correct ticketId (not MongoDB _id)
    const ticket = attendeeInfo.individualTickets.find(
      (t) => t._id === ticketId
    );
    if (!ticket) return;

    setCheckingIn(ticketId);
    try {
      // Use the check-in ticket endpoint for individual tickets
      // Use ticket.ticketId (e.g., "BK-MH39QRAL-SPRBD1-T1") instead of ticket._id
      const response = await apiService.checkInTicket(
        attendeeInfo._id,
        ticket.ticketId
      );

      if (response.success) {
        // Update the local state for individual tickets
        setAttendeeInfo((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            individualTickets: prev.individualTickets.map((ticket) =>
              ticket._id === ticketId
                ? {
                    ...ticket,
                    checkedIn: true,
                  }
                : ticket
            ),
          };
        });

        toast.success("Individual ticket has been checked in successfully");
      } else {
        toast.error(response.message || "Failed to check in individual ticket");
      }
    } catch (error: any) {
      console.error("Individual check-in error:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to check in individual ticket"
      );
    } finally {
      setCheckingIn(null);
    }
  };

  const handleCheckInAll = async () => {
    if (!attendeeInfo) return;

    const uncheckedTickets = attendeeInfo.individualTickets.filter(
      (ticket) => !ticket.checkedIn
    );
    if (uncheckedTickets.length === 0) return;

    setCheckingIn("all");
    try {
      // This would be a new API endpoint to check in all tickets for a booking
      const response = await apiService.checkInAllTickets(attendeeInfo._id);

      if (response.success) {
        // Update the local state
        setAttendeeInfo((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            individualTickets: prev.individualTickets.map((ticket) => ({
              ...ticket,
              checkedIn: true,
            })),
          };
        });

        toast.success("All tickets have been checked in successfully");
      } else {
        toast.error(response.message || "Failed to check in all tickets");
      }
    } catch (error: any) {
      console.error("Bulk check-in error:", error);
      toast.error(
        error.response?.data?.message || "Failed to check in tickets"
      );
    } finally {
      setCheckingIn(null);
    }
  };

  const getCheckedInCount = () => {
    if (!attendeeInfo || !attendeeInfo.individualTickets) return 0;
    return attendeeInfo.individualTickets.filter((ticket) => ticket.checkedIn)
      .length;
  };

  const getTotalTickets = () => {
    if (!attendeeInfo || !attendeeInfo.individualTickets) return 0;
    return attendeeInfo.individualTickets.length;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">
            Loading attendee information...
          </p>
        </div>
      </div>
    );
  }

  if (error || !attendeeInfo) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="p-8 text-center">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-red-600 mb-4">
                  Scan Failed
                </h2>
                <p className="text-muted-foreground mb-6">
                  {error ||
                    "Unable to load attendee information. The QR code may be invalid or expired."}
                </p>
                <div className="flex gap-4 justify-center">
                  <Button onClick={() => navigate("/producer-dashboard")}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                  </Button>
                  <Button variant="outline" onClick={() => navigate(-1)}>
                    Scan Again
                  </Button>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    );
  }

  const checkedInCount = getCheckedInCount();
  const totalTickets = getTotalTickets();
  const allCheckedIn = checkedInCount === totalTickets;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate("/producer-dashboard")}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Ticket Check-in</h1>
                <p className="text-muted-foreground mt-1">
                  {attendeeInfo.eventName} -{" "}
                  {attendeeInfo.eventDate
                    ? format(new Date(attendeeInfo.eventDate), "PPP")
                    : "Date not available"}
                </p>
                {alreadyCheckedIn && (
                  <div className="mt-4 p-6 bg-red-50 border-2 border-red-300 rounded-lg">
                    <div className="flex items-center justify-center gap-3 text-red-800">
                      <XCircle className="w-8 h-8" />
                      <div className="text-center">
                        <h3 className="text-lg font-bold">
                          Ticket Already Used
                        </h3>
                        <p className="text-sm">
                          This ticket has already been checked in and cannot be
                          used again.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {!alreadyCheckedIn && (
                <Badge
                  variant={allCheckedIn ? "default" : "secondary"}
                  className="text-lg px-4 py-2"
                >
                  {checkedInCount}/{totalTickets} Checked In
                </Badge>
              )}
            </div>
          </div>

          {/* Attendee Information */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Attendee Information
                </CardTitle>
                {!alreadyCheckedIn && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowModal(true)}
                  >
                    View Details
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-semibold">{attendeeInfo.fullName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-semibold">{attendeeInfo.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-semibold">{attendeeInfo.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Booking Reference
                    </p>
                    <p className="font-semibold font-mono">
                      {attendeeInfo.bookingReference}
                    </p>
                  </div>
                </div>

                {attendeeInfo.age && (
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Age</p>
                      <p className="font-semibold">{attendeeInfo.age}</p>
                    </div>
                  </div>
                )}

                {attendeeInfo.gender && (
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Gender</p>
                      <p className="font-semibold">{attendeeInfo.gender}</p>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Event Date</p>
                    <p className="font-semibold">
                      {attendeeInfo.eventDate
                        ? format(new Date(attendeeInfo.eventDate), "PPP")
                        : "Date not available"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Event Location
                    </p>
                    <p className="font-semibold">
                      {attendeeInfo.eventLocation?.address &&
                      attendeeInfo.eventLocation?.city
                        ? `${attendeeInfo.eventLocation.address}, ${attendeeInfo.eventLocation.city}`
                        : "Location not available"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tickets Section */}
          {!allCheckedIn && (
            <>
              {" "}
              <Card className="mb-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Ticket Details</CardTitle>

                    <Button
                      onClick={handleCheckInAll}
                      disabled={checkingIn === "all"}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {checkingIn === "all" ? "Checking In..." : "Check In All"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {attendeeInfo.individualTickets &&
                    attendeeInfo.individualTickets.length > 0 ? (
                      attendeeInfo.individualTickets.map((ticket, index) => (
                        <div key={ticket._id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-semibold">
                                Ticket #{ticket.ticketNumber}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {attendeeInfo.ticketType}
                              </p>
                            </div>

                            <div className="flex items-center gap-3">
                              {ticket.checkedIn ? (
                                <div className="flex items-center gap-2 text-green-600">
                                  <CheckCircle className="w-5 h-5" />
                                  <span className="text-sm font-medium">
                                    Checked In
                                  </span>
                                </div>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    handleIndividualCheckIn(ticket._id)
                                  }
                                  disabled={checkingIn === ticket._id}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  {checkingIn === ticket._id ? (
                                    <>
                                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                      Checking In...
                                    </>
                                  ) : (
                                    <>
                                      <Check className="w-4 h-4 mr-2" />
                                      Check In
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No tickets found for this booking.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">
                        Total Amount Paid
                      </h3>
                      <p className="text-2xl font-bold text-green-600">
                        {attendeeInfo.currency}{" "}
                        {attendeeInfo.totalAmount
                          ? attendeeInfo.totalAmount.toFixed(2)
                          : "0.00"}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        Check-in Status
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {allCheckedIn ? (
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        ) : (
                          <AlertCircle className="w-6 h-6 text-orange-600" />
                        )}
                        <span
                          className={`font-semibold ${
                            allCheckedIn ? "text-green-600" : "text-orange-600"
                          }`}
                        >
                          {checkedInCount}/{totalTickets} Checked In
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )} 

          {/* Action Buttons */}
          <div className="flex gap-4 mt-6">
            <Button
              onClick={() => navigate("/producer-dashboard")}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="flex-1"
            >
              Scan Another Ticket
            </Button>
          </div>
        </div>
      </div>

      {/* Modal for attendee details */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              Attendee Details
            </DialogTitle>
          </DialogHeader>
          {attendeeInfo && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-semibold">{attendeeInfo.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-semibold">{attendeeInfo.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-semibold">{attendeeInfo.phone}</p>
                </div>
                {attendeeInfo.age && (
                  <div>
                    <p className="text-sm text-muted-foreground">Age</p>
                    <p className="font-semibold">{attendeeInfo.age}</p>
                  </div>
                )}
                {attendeeInfo.gender && (
                  <div>
                    <p className="text-sm text-muted-foreground">Gender</p>
                    <p className="font-semibold">{attendeeInfo.gender}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Ticket Type</p>
                  <p className="font-semibold">{attendeeInfo.ticketType}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Quantity</p>
                  <p className="font-semibold">{attendeeInfo.ticketQuantity}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="font-semibold">{attendeeInfo.totalAmount}</p>
                </div>
              </div>

              {attendeeInfo.specialRequirements && (
                <div>
                  <p className="text-sm text-muted-foreground">
                    Special Requirements
                  </p>
                  <p className="font-semibold">
                    {attendeeInfo.specialRequirements}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Individual Tickets
                </p>
                <div className="space-y-2">
                  {attendeeInfo.individualTickets &&
                  attendeeInfo.individualTickets.length > 0 ? (
                    attendeeInfo.individualTickets.map((ticket, index) => (
                      <div
                        key={ticket._id}
                        className="flex items-center justify-between p-2 border rounded"
                      >
                        <span>Ticket #{ticket.ticketNumber}</span>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={ticket.checkedIn ? "default" : "secondary"}
                          >
                            {ticket.checkedIn ? "Checked In" : "Not Checked In"}
                          </Badge>
                          {!ticket.checkedIn && (
                            <Button
                              size="sm"
                              onClick={() =>
                                handleIndividualCheckIn(ticket._id)
                              }
                              disabled={checkingIn === ticket._id}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {checkingIn === ticket._id ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                  Checking In...
                                </>
                              ) : (
                                <>
                                  <Check className="w-4 h-4 mr-2" />
                                  Check In
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No tickets found for this booking.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QRScanResult;
