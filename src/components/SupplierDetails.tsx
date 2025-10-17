import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Star,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Award,
  Users,
  Share2,
  Bookmark,
  CheckCircle2,
  Calendar,
  DollarSign,
  Package as PackageIcon,
  AlertCircle,
  Copy,
  CheckCircle,
  Instagram,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import config from '@/config/environment';

const SupplierDetails = () => {
  const { supplierId } = useParams<{ supplierId: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { toast } = useToast();

  const [supplier, setSupplier] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);

  useEffect(() => {
    if (!supplierId) {
      setError('Supplier ID not provided');
      setIsLoading(false);
      return;
    }

    const fetchSupplier = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await apiService.request(`/suppliers/${supplierId}`);

        console.log('📊 Supplier Details Response:', response);

        if (response.success && response.data) {
          setSupplier(response.data);
          if (response.data.services && response.data.services.length > 0) {
            setSelectedService(response.data.services[0]);
          }
        } else {
          setError('Supplier not found');
        }
      } catch (err) {
        console.error('❌ Error fetching supplier:', err);
        setError('Failed to load supplier details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSupplier();
  }, [supplierId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading supplier details...</p>
        </div>
      </div>
    );
  }

  if (error || !supplier) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Supplier Not Found</h1>
          <p className="text-muted-foreground mb-6">{error || 'The supplier you are looking for does not exist.'}</p>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const handleShare = () => {
    const shareUrl = window.location.href;

    // Try native share first
    if (navigator.share) {
      navigator.share({
        title: supplier.companyName || supplier.name,
        text: supplier.description,
        url: shareUrl,
      }).catch(err => console.log('Share cancelled:', err));
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareUrl).then(() => {
        setIsCopied(true);
        toast({
          title: 'Copied!',
          description: 'Link copied to clipboard',
        });
        setTimeout(() => setIsCopied(false), 2000);
      }).catch(() => {
        toast({
          title: 'Error',
          description: 'Failed to copy link',
          variant: 'destructive',
        });
      });
    }
  };

  const handleCopyLink = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setIsCopied(true);
      toast({
        title: 'Copied!',
        description: 'Supplier link copied to clipboard',
      });
      setTimeout(() => setIsCopied(false), 2000);
    }).catch(() => {
      toast({
        title: 'Error',
        description: 'Failed to copy link',
        variant: 'destructive',
      });
    });
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    toast({
      title: isSaved ? 'Removed' : 'Saved',
      description: isSaved ? 'Supplier removed from saved' : 'Supplier saved successfully',
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
        <span className="text-sm text-muted-foreground ml-2">
          {rating.toFixed(1)} ({supplier.rating?.count || 0} reviews)
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Supplier Header Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex gap-6 mb-6">
                  {/* Profile Image */}
                  <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex-shrink-0 overflow-hidden flex items-center justify-center">
                    {supplier.profileImage ? (
                      <img
                        src={supplier.profileImage}
                        alt={supplier.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Users className="w-12 h-12 text-primary" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h1 className="text-3xl font-bold text-foreground">
                          {supplier.companyName || supplier.name}
                        </h1>
                        {supplier.companyName && (
                          <p className="text-muted-foreground">{supplier.name}</p>
                        )}
                      </div>
                      {supplier.isVerified && (
                        <Badge className="bg-green-500 text-white">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>

                    {/* Rating */}
                    {supplier.rating && (
                      <div className="mb-3">
                        {renderStars(supplier.rating.average)}
                      </div>
                    )}

                    {/* Description */}
                    {supplier.description && (
                      <p className="text-muted-foreground mb-4 line-clamp-2">
                        {supplier.description}
                      </p>
                    )}

                    {/* Categories */}
                    {supplier.categories && supplier.categories.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {supplier.categories.map((cat: string, idx: number) => (
                          <Badge key={idx} variant="secondary">
                            {cat}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact & Action Buttons */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSave}
                  >
                    <Bookmark className={`w-4 h-4 mr-2 ${isSaved ? 'fill-current' : ''}`} />
                    {isSaved ? 'Saved' : 'Save'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyLink}
                  >
                    {isCopied ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Link
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* About Supplier */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">About</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {supplier.description || 'No description available'}
                </p>
              </CardContent>
            </Card>

            {/* Services & Packages */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-6">Services & Packages</h2>

                {supplier.services && supplier.services.length > 0 ? (
                  <Tabs defaultValue="0" className="space-y-6">
                    <TabsList className="w-full justify-start">
                      {supplier.services.map((service: any, idx: number) => (
                        <TabsTrigger
                          key={idx}
                          value={idx.toString()}
                          onClick={() => setSelectedService(service)}
                          className="text-sm"
                        >
                          {service.title}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {supplier.services.map((service: any, idx: number) => (
                      <TabsContent key={idx} value={idx.toString()} className="space-y-4">
                        {/* Service Details */}
                        <div>
                          <h3 className="text-lg font-semibold mb-2">{service.title}</h3>
                          <p className="text-muted-foreground mb-4">{service.description}</p>

                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">Price</p>
                              <p className="font-semibold text-lg">
                                ${service.price?.amount || 0}{' '}
                                <span className="text-sm text-muted-foreground">
                                  {service.price?.pricingType}
                                </span>
                              </p>
                            </div>
                            {service.rating && (
                              <div>
                                <p className="text-sm text-muted-foreground mb-1">Rating</p>
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                  <span className="font-semibold">
                                    {service.rating.average.toFixed(1)}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Tags */}
                          {service.tags && service.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {service.tags.map((tag: string, tagIdx: number) => (
                                <Badge key={tagIdx} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Packages */}
                        {service.packages && service.packages.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-4 flex items-center gap-2">
                              <PackageIcon className="w-5 h-5 text-primary" />
                              Available Packages
                            </h4>
                            <div className="grid gap-4">
                              {service.packages.map((pkg: any, pkgIdx: number) => (
                                <div
                                  key={pkgIdx}
                                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                                    selectedPackage?.name === pkg.name
                                      ? 'border-primary bg-primary/5'
                                      : 'border-border hover:border-primary/50'
                                  }`}
                                  onClick={() => setSelectedPackage(pkg)}
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <h5 className="font-semibold">{pkg.name}</h5>
                                        {pkg.isPopular && (
                                          <Badge className="bg-blue-500 text-white text-xs">
                                            Popular
                                          </Badge>
                                        )}
                                      </div>
                                      {pkg.description && (
                                        <p className="text-sm text-muted-foreground mt-1">
                                          {pkg.description}
                                        </p>
                                      )}
                                    </div>
                                    <div className="text-right">
                                      <p className="font-bold text-lg">${pkg.price}</p>
                                      {pkg.duration && (
                                        <p className="text-xs text-muted-foreground">
                                          {pkg.duration} hours
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  {/* Features */}
                                  {pkg.features && pkg.features.length > 0 && (
                                    <div className="mt-3 pt-3 border-t space-y-2">
                                      {pkg.features.map((feature: string, fIdx: number) => (
                                        <div key={fIdx} className="flex items-start gap-2 text-sm">
                                          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                          <span>{feature}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  <Button
                                    size="sm"
                                    className="w-full mt-3"
                                    onClick={() =>
                                      toast({
                                        title: 'Contact Supplier',
                                        description: `You can now contact the supplier about ${pkg.name}`,
                                      })
                                    }
                                  >
                                    Select Package
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Availability */}
                        {service.availability && (
                          <div className="bg-muted/50 rounded-lg p-4">
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-primary" />
                              Availability
                            </h4>
                            <div className="space-y-2 text-sm">
                              {service.availability.startDate && (
                                <p>
                                  <span className="text-muted-foreground">Available from:</span>{' '}
                                  {new Date(service.availability.startDate).toLocaleDateString()}
                                </p>
                              )}
                              {service.availability.endDate && (
                                <p>
                                  <span className="text-muted-foreground">Until:</span>{' '}
                                  {new Date(service.availability.endDate).toLocaleDateString()}
                                </p>
                              )}
                              {service.availability.leadTime && (
                                <p>
                                  <span className="text-muted-foreground">Lead time:</span>{' '}
                                  {service.availability.leadTime} days
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </TabsContent>
                    ))}
                  </Tabs>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No services available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Portfolio */}
            {supplier.portfolio && supplier.portfolio.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-4">Portfolio</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {supplier.portfolio.map((item: any, idx: number) => (
                      <div key={idx} className="rounded-lg overflow-hidden bg-muted">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-40 object-cover"
                          />
                        ) : (
                          <div className="w-full h-40 flex items-center justify-center bg-muted-foreground/10">
                            <PackageIcon className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                        {item.title && (
                          <p className="p-2 font-medium text-sm">{item.title}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contact Card */}
            <Card className="sticky top-4">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-bold text-lg">Contact Information</h3>

                {supplier.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <a href={`tel:${supplier.phone}`} className="text-sm font-medium hover:text-primary">
                        {supplier.phone}
                      </a>
                    </div>
                  </div>
                )}

                {supplier.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <a href={`mailto:${supplier.email}`} className="text-sm font-medium hover:text-primary truncate">
                        {supplier.email}
                      </a>
                    </div>
                  </div>
                )}

                {supplier.location?.city && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Location</p>
                      <p className="text-sm font-medium">{supplier.location.city}</p>
                    </div>
                  </div>
                )}

                {/* Social Links */}
                {(supplier.supplierDetails?.instagramLink || supplier.supplierDetails?.website) && (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground font-medium">Social Links</p>
                    {supplier.supplierDetails?.instagramLink && (
                      <div className="flex items-center gap-3">
                        <Instagram className="w-5 h-5 text-pink-500 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Instagram</p>
                          <Button
                            variant="link"
                            className="p-0 h-auto text-sm font-medium hover:text-pink-500"
                            onClick={() => window.open(supplier.supplierDetails.instagramLink, '_blank')}
                          >
                            View Profile
                          </Button>
                        </div>
                      </div>
                    )}
                    {supplier.supplierDetails?.website && (
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-blue-500 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Website</p>
                          <Button
                            variant="link"
                            className="p-0 h-auto text-sm font-medium hover:text-blue-500"
                            onClick={() => window.open(supplier.supplierDetails.website, '_blank')}
                          >
                            Visit Website
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <Button className="w-full" size="lg">
                  Contact Supplier
                </Button>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-bold">Additional Info</h3>

                {supplier.experience && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                      <Award className="w-4 h-4" />
                      Experience
                    </p>
                    <Badge variant="secondary">{supplier.experience}</Badge>
                  </div>
                )}

                {supplier.languages && supplier.languages.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Languages</p>
                    <div className="flex flex-wrap gap-2">
                      {supplier.languages.map((lang: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {supplier.paymentMethods && supplier.paymentMethods.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Payment Methods</p>
                    <div className="flex flex-wrap gap-2">
                      {supplier.paymentMethods.map((method: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {method}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Certifications */}
            {supplier.certifications && supplier.certifications.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary" />
                    Certifications
                  </h3>
                  <div className="space-y-3">
                    {supplier.certifications.map((cert: any, idx: number) => (
                      <div key={idx} className="border rounded p-3">
                        <p className="font-medium text-sm">{cert.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {cert.issuer} • {new Date(cert.date).getFullYear()}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierDetails;