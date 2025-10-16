import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, Building2, MapPin, CreditCard, User, CheckCircle } from 'lucide-react';
import { Step_BankDetailsProps , Ticket , EventData } from "./types";

const Step_ProducerDetails: React.FC<Step_BankDetailsProps> = ({     
  eventData,
  onUpdate,
  onBack,
  onNext
}) => {
  const { t } = useTranslation();

  // Local state for form validation
  const [formData, setFormData] = useState({
    bankName: eventData.bankDetails?.bankName || '',
    branch: eventData.bankDetails?.branch || '',
    accountNumber: eventData.bankDetails?.accountNumber || '',
    accountHolderName: eventData.bankDetails?.accountHolderName || ''
  });

  // Update local state when eventData changes
  useEffect(() => {
    setFormData({
      bankName: eventData.bankDetails?.bankName || '',
      branch: eventData.bankDetails?.branch || '',
      accountNumber: eventData.bankDetails?.accountNumber || '',
      accountHolderName: eventData.bankDetails?.accountHolderName || ''
    });
  }, [eventData.bankDetails]);

  const handleInputChange = (field: string, value: string) => {
    const updatedFormData = {
      ...formData,
      [field]: value
    };
    setFormData(updatedFormData);

    // Update parent component
    const updatedbankDetails = {
      ...eventData.bankDetails,
      [field]: value
    };
    onUpdate('bankDetails', updatedbankDetails);
  };

  // Form validation function
  const validateForm = () => {
    const { bankName, branch, accountNumber, accountHolderName } = formData;
    return (
      bankName.trim().length > 0 &&
      branch.trim().length > 0 &&
      accountNumber.trim().length > 0 &&
      accountHolderName.trim().length > 0
    );
  };

  const isFormValid = validateForm();

  const handleNext = useCallback(() => {
      if (validateForm()) {
        onNext();
      }
    }, [validateForm, onNext]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {t('createEvent.steps.bankDetails')}
        </h2>
        <p className="text-muted-foreground">
          Please provide your banking details for event payments
        </p>
      </div>

      {/* Producer Details Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Banking Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Bank Name */}
          <div className="space-y-2">
            <Label htmlFor="bankName" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Bank Name *
            </Label>
            <Input
              id="bankName"
              placeholder="Enter your bank name"
              value={formData.bankName}
              onChange={(e) => handleInputChange('bankName', e.target.value)}
              required
            />
          </div>

          {/* Branch */}
          <div className="space-y-2">
            <Label htmlFor="branch" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Branch *
            </Label>
            <Input
              id="branch"
              placeholder="Enter branch name or number"
              value={formData.branch}
              onChange={(e) => handleInputChange('branch', e.target.value)}
              required
            />
          </div>

          {/* Account Number */}
          <div className="space-y-2">
            <Label htmlFor="accountNumber" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Account Number *
            </Label>
            <Input
              id="accountNumber"
              placeholder="Enter your account number"
              value={formData.accountNumber}
              onChange={(e) => handleInputChange('accountNumber', e.target.value)}
              required
            />
          </div>

          {/* Account Holder Name */}
          <div className="space-y-2">
            <Label htmlFor="accountHolderName" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Account Holder Name *
            </Label>
            <Input
              id="accountHolderName"
              placeholder="Enter the account holder name"
              value={formData.accountHolderName}
              onChange={(e) => handleInputChange('accountHolderName', e.target.value)}
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!isFormValid}
          className="flex items-center gap-2"
        >
          Continue
          {isFormValid && <CheckCircle className="w-4 h-4 ml-2" />}
        </Button>
      </div>
    </div>
  );
};

export default Step_ProducerDetails;
