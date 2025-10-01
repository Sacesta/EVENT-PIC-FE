import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { UserPlus, Building2, Store } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import apiService from "@/services/api";

const supplierCategories = [
  "Photography",
  "Videography", 
  "Catering",
  "Decorations",
  "Music & DJ",
  "Venue",
  "Flowers",
  "Transportation",
  "Wedding Planning",
  "Sound & Lighting",
  "Security",
  "Other"
];

interface RegistrationData {
  name: string;
  email: string;
  password: string;
  role: string;
  supplierDetails?: {
    companyName: string;
    categories: string[];
  };
  producerDetails?: {
    companyName: string;
  };
  [key: string]: unknown;
}

interface RegisterModalProps {
  children: React.ReactNode;
}

export default function RegisterModal({ children }: RegisterModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [userType, setUserType] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    company: ""
  });
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userType) {
      toast({
        title: "Error",
        description: "Please select a user type",
        variant: "destructive",
      });
      return;
    }

    if (userType === "supplier" && !category) {
      toast({
        title: "Error",
        description: "Please select a category",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.trim() !== formData.confirmPassword.trim()) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    const registrationData: RegistrationData = {
      name: formData.fullName,
      email: formData.email,
      password: formData.password,
      role: userType,
    };

    if (userType === 'supplier') {
      registrationData.supplierDetails = {
        companyName: formData.company,
        categories: [category],
      };
    } else if (userType === 'producer') {
      registrationData.producerDetails = {
        companyName: formData.company,
      };
    }

    try {
      // Use apiService instead of hardcoded fetch
      const data = await apiService.register(registrationData);

      toast({
        title: "Success!",
        description: "Registration successful. Please sign in.",
      });

      setIsOpen(false);
      // Reset form
      setUserType("");
      setCategory("");
      setFormData({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        company: "",
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed. Please try again.';
      toast({
        title: "Registration Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-conthrax text-gradient-primary">
            Create Account
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Type Selection */}
          <div className="space-y-4">
            <Label className="text-base font-semibold text-foreground">
              I am a:
            </Label>
            <RadioGroup value={userType} onValueChange={setUserType} className="grid grid-cols-2 gap-4">
              <div>
                <RadioGroupItem value="producer" id="producer" className="peer sr-only" />
                <Label
                  htmlFor="producer"
                  className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                >
                  <Building2 className="mb-3 h-6 w-6" />
                  <span className="font-semibold">Producer</span>
                  <span className="text-xs text-muted-foreground text-center mt-1">
                    I organize events
                  </span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="supplier" id="supplier" className="peer sr-only" />
                <Label
                  htmlFor="supplier"
                  className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                >
                  <Store className="mb-3 h-6 w-6" />
                  <span className="font-semibold">Supplier</span>
                  <span className="text-xs text-muted-foreground text-center mt-1">
                    I provide services
                  </span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Category Selection for Suppliers */}
          {userType === "supplier" && (
            <div className="space-y-2 animate-fade-in">
              <Label htmlFor="category" className="font-semibold text-foreground">
                Service Category
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your service category" />
                </SelectTrigger>
                <SelectContent>
                  {supplierCategories.map((cat) => (
                    <SelectItem key={cat} value={cat.toLowerCase()}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Form Fields */}
          {userType && (
            <Card className="animate-fade-in">
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="font-semibold text-foreground">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="font-semibold text-foreground">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                {(userType === "supplier" || userType === "producer") && (
                  <div className="space-y-2">
                    <Label htmlFor="company" className="font-semibold text-foreground">
                      Company Name (Optional)
                    </Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => handleInputChange("company", e.target.value)}
                      placeholder="Enter your company or organization name"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password" className="font-semibold text-foreground">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder="Create a password"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="font-semibold text-foreground">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    placeholder="Confirm your password"
                    required
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 space-y-2 space-y-reverse sm:space-y-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="btn-primary"
              disabled={!userType || (userType === "supplier" && !category)}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Create Account
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}