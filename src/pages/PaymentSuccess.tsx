import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import apiService from '@/services/api';

export const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const bookingReference = searchParams.get('booking');
  const transactionId = searchParams.get('transaction');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!transactionId) {
        setError('No transaction ID provided');
        setVerifying(false);
        return;
      }

      try {
        console.log('Verifying payment:', transactionId);
        const response = await apiService.verifyPayment(transactionId);

        if (response.success && response.verification?.isVerified) {
          setPaymentDetails(response.verification);
          console.log('Payment verified successfully:', response.verification);
        } else {
          setError('Payment verification failed. Please contact support.');
        }
      } catch (err: any) {
        console.error('Payment verification error:', err);
        setError(err.message || 'Failed to verify payment');
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [transactionId]);

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
              <h3 className="text-lg font-semibold">Verifying Payment</h3>
              <p className="text-muted-foreground">
                Please wait while we confirm your payment...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-destructive">
              Verification Failed
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">{error}</p>
            <p className="text-sm">
              Booking Reference: <strong>{bookingReference || 'N/A'}</strong>
            </p>
            <Button onClick={() => navigate('/')} className="w-full">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription>
            Your payment has been processed and your tickets have been confirmed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Booking Reference:</span>
              <span className="font-mono font-semibold">{bookingReference}</span>
            </div>
            {paymentDetails?.transactionId && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Transaction ID:</span>
                <span className="font-mono text-sm">{paymentDetails.transactionId}</span>
              </div>
            )}
            {paymentDetails?.amount && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Amount Paid:</span>
                <span className="font-semibold">
                  ₪{paymentDetails.amount} {paymentDetails.currency || ''}
                </span>
              </div>
            )}
            {paymentDetails?.paidAt && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Payment Date:</span>
                <span className="text-sm">
                  {new Date(paymentDetails.paidAt).toLocaleString()}
                </span>
              </div>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              📧 Your tickets have been sent to your email address. Please check your inbox
              (and spam folder) for your ticket details and QR code.
            </p>
          </div>

          <div className="space-y-2">
            <Button onClick={() => navigate('/browse-events')} className="w-full">
              Browse More Events
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="w-full"
            >
              Return to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
