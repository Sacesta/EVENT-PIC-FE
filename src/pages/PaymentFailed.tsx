import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const PaymentFailed: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const bookingReference = searchParams.get('booking');
  const errorMessage = searchParams.get('error');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-red-100 p-3">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-2xl text-destructive">Payment Failed</CardTitle>
          <CardDescription>
            We were unable to process your payment. Please try again.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-900">Error Details:</p>
                <p className="text-sm text-red-800">{errorMessage}</p>
              </div>
            </div>
          )}

          {bookingReference && (
            <div className="bg-muted rounded-lg p-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Booking Reference:</span>
                <span className="font-mono font-semibold">{bookingReference}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Your booking is on hold. Please complete the payment to confirm your tickets.
              </p>
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-900">
              💡 <strong>Common issues:</strong>
            </p>
            <ul className="text-sm text-yellow-800 mt-2 space-y-1 list-disc list-inside">
              <li>Insufficient funds in your account</li>
              <li>Incorrect card details</li>
              <li>Payment declined by your bank</li>
              <li>Network connection issue</li>
            </ul>
          </div>

          <div className="space-y-2">
            <Button
              onClick={() => window.history.back()}
              className="w-full"
            >
              Try Again
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/browse-events')}
              className="w-full"
            >
              Browse Other Events
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="w-full"
            >
              Return to Home
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Need help? Contact our support team with your booking reference.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentFailed;
