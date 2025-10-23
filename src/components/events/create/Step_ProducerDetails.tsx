import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, Building2, MapPin, CreditCard, User, CheckCircle } from 'lucide-react';
import { Step_BankDetailsProps } from "./types";

interface BankDetails {
  bankName: string;
  branch: string;
  accountNumber: string;
  accountHolderName: string;
}

interface EventData {
  bankDetails?: BankDetails;
  [key: string]: any;
}

const Step_ProducerDetails: React.FC<Step_BankDetailsProps> = ({     
  eventData,
  onUpdate,
  onBack,
  onNext,
  isEditMode
}) => {
  const { t } = useTranslation();

  // Local state for form validation - initialize with eventData.bankDetails
  const [formData, setFormData] = useState<BankDetails>({
    bankName: eventData.bankDetails?.bankName || '',
    branch: eventData.bankDetails?.branch || '',
    accountNumber: eventData.bankDetails?.accountNumber || '',
    accountHolderName: eventData.bankDetails?.accountHolderName || ''
  });

  // Update local state when eventData.bankDetails changes
  useEffect(() => {
    if (eventData.bankDetails) {
      setFormData({
        bankName: eventData.bankDetails.bankName || '',
        branch: eventData.bankDetails.branch || '',
        accountNumber: eventData.bankDetails.accountNumber || '',
        accountHolderName: eventData.bankDetails.accountHolderName || ''
      });
    }
  }, [eventData.bankDetails]);

  const handleInputChange = (field: keyof BankDetails, value: string) => {
    const updatedFormData = {
      ...formData,
      [field]: value
    };
    setFormData(updatedFormData);

    // Update parent component with complete bankDetails object
    onUpdate('bankDetails', updatedFormData);
  };

  // Form validation function
  const validateForm = useCallback(() => {
    const { bankName, branch, accountNumber, accountHolderName } = formData;
    return (
      bankName.trim().length > 0 &&
      branch.trim().length > 0 &&
      accountNumber.trim().length > 0 &&
      accountHolderName.trim().length > 0
    );
  }, [formData]);

  const isFormValid = validateForm();

  const handleNext = useCallback(() => {
    if (validateForm()) {
      onNext();
    }
  }, [validateForm, onNext]);

  return (
    <div className="space-y-6">
      {/* Header */}
      { !isEditMode && <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {t('createEvent.bankDetailsStep.title') || 'Bank Details'}
        </h2>
        <p className="text-muted-foreground">
          {t('createEvent.bankDetailsStep.provide')}
        </p>
      </div> }

      {/* Bank Details Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            {t("createEvent.bankDetailsStep.info")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Bank Name */}
          <div className="space-y-2">
            <Label htmlFor="bankName" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              {t("createEvent.bankDetailsStep.form.bankName.label")} *
            </Label>
            <Input
              id="bankName"
              placeholder= {t("createEvent.bankDetailsStep.form.bankName.placeholder")}
              value={formData.bankName}
              onChange={(e) => handleInputChange('bankName', e.target.value)}
              required
            />
          </div>

          {/* Branch */}
          <div className="space-y-2">
            <Label htmlFor="branch" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
               {t("createEvent.bankDetailsStep.form.branch.label")} *
            </Label>
            <Input
              id="branch"
              placeholder={t("createEvent.bankDetailsStep.form.branch.placeholder")}
              value={formData.branch}
              onChange={(e) => handleInputChange('branch', e.target.value)}
              required
            />
          </div>

          {/* Account Number */}
          <div className="space-y-2">
            <Label htmlFor="accountNumber" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              {t("createEvent.bankDetailsStep.form.accountNumber.label")} *
            </Label>
            <Input
              id="accountNumber"
              placeholder={t("createEvent.bankDetailsStep.form.accountNumber.placeholder")}
              value={formData.accountNumber}
              onChange={(e) => handleInputChange('accountNumber', e.target.value)}
              required
              type="text"
            />
          </div>

          {/* Account Holder Name */}
          <div className="space-y-2">
            <Label htmlFor="accountHolderName" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              {t("createEvent.bankDetailsStep.form.accountHolderName.label")} *
            </Label>
            <Input
              id="accountHolderName"
              placeholder={t("createEvent.bankDetailsStep.form.accountHolderName.placeholder")}
              value={formData.accountHolderName}
              onChange={(e) => handleInputChange('accountHolderName', e.target.value)}
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
       {!isEditMode && <div className="flex justify-between pt-4 border-t nav-wrapper-dark">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("createEvent.bankDetailsStep.buttons.back")}
        </Button>
        <Button
          onClick={handleNext}
          disabled={!isFormValid}
          className="flex items-center gap-2"
        >
         {t("createEvent.bankDetailsStep.buttons.continue")}
          {isFormValid && <CheckCircle className="w-4 h-4 ml-2" />}
        </Button>
      </div> }
    </div> 
  );
};

export default Step_ProducerDetails;
