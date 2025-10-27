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
  Edit,
  X,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import config from '@/config/environment';
import { useAuth } from '@/hooks/use-auth';
import ProfileModal from '@/components/ProfileModal';
import { getImageUrl } from '@/utils/imageUtils';
import { ReviewDialog } from '@/components/ReviewDialog';

const SupplierDetails = () => {
  const { supplierId } = useParams<{ supplierId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();

  const [supplier, setSupplier] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isEventSelectionModalOpen, setIsEventSelectionModalOpen] = useState(false);
  const [packageToOrder, setPackageToOrder] = useState<any>(null);
  const [myEvents, setMyEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

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

        // Use the suppliers endpoint which includes packages
        const response = await apiService.getSupplierById(supplierId);

        console.log('📊 Supplier Details Response:', response);

        if (response.success && response.data) {
          setSupplier(response.data);
          // Set first package as selected if packages exist
          const data = response.data as any;
          if (data.packages && data.packages.length > 0) {
            setSelectedPackage(data.packages[0]);
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

  // Fetch reviews for the supplier
  useEffect(() => {
    if (!supplierId) return;

    const fetchReviews = async () => {
      try {
        setReviewsLoading(true);
        const response = await apiService.getSupplierReviews(supplierId, {
          page: 1,
          limit: 20
        });

        if (response.success) {
          setReviews(response.data || []);

          // Check if current user has already reviewed this supplier
          if (user && response.data) {
            const userReview = response.data.find((review: any) =>
              review.reviewerId._id === user._id
            );
            setHasReviewed(!!userReview);
          }
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [supplierId, user]);

  const handleSubmitReview = async (rating: number, feedback: string) => {
    if (!supplierId) return;

    try {
      const response = await apiService.submitSupplierReview(supplierId, {
        rating,
        feedback
      });

      if (response.success) {
        toast({
          title: 'Success!',
          description: 'Your review has been submitted successfully',
        });

        // Refresh reviews
        const reviewsResponse = await apiService.getSupplierReviews(supplierId);
        if (reviewsResponse.success) {
          setReviews(reviewsResponse.data || []);
          setHasReviewed(true);
        }

        // Update supplier rating in state
        if (response.data?.supplierRating) {
          setSupplier((prev: any) => ({
            ...prev,
            rating: response.data.supplierRating
          }));
        }
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit review. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

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

  const handleUpdateUser = async (updatedUser: any) => {
    try {
      setSupplier(updatedUser);
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully',
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    }
  };

  // Fetch producer's events
  const fetchMyEvents = async () => {
    if (!user || user.role !== 'producer') {
      return;
    }

    setLoadingEvents(true);
    try {
      const response = await apiService.getMyEvents();
      if (response.success && response.data) {
        const eventsArray = Array.isArray(response.data) ? response.data : response.data.events || [];
        // Filter for active/draft events only
        const activeEvents = eventsArray.filter((event: any) =>
          event.status === 'draft' || event.status === 'approved'
        );
        setMyEvents(activeEvents);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your events',
        variant: 'destructive',
      });
    } finally {
      setLoadingEvents(false);
    }
  };

  // Handle package selection - open event selection modal
  const handleSelectPackage = (pkg: any) => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please login to select packages',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    if (user.role !== 'producer') {
      toast({
        title: 'Producer Only',
        description: 'Only event producers can select packages',
        variant: 'destructive',
      });
      return;
    }

    setPackageToOrder(pkg);
    setIsEventSelectionModalOpen(true);
    fetchMyEvents();
  };

  // Handle adding supplier/package to event
  const handleAddToEvent = async (eventId: string) => {
    if (!packageToOrder || !supplier) return;

    try {
      // Add supplier and package to the event
      const response = await apiService.addSupplierToEvent(eventId, {
        supplierId: supplier._id,
        serviceId: packageToOrder._id,
        packageId: packageToOrder._id,
        packageDetails: {
          name: packageToOrder.name,
          description: packageToOrder.description,
          price: packageToOrder.price?.amount || 0,
          category: packageToOrder.category,
        }
      });

      if (response.success) {
        toast({
          title: 'Success',
          description: `${packageToOrder.name} added to your event!`,
        });
        setIsEventSelectionModalOpen(false);
        setPackageToOrder(null);
      } else {
        throw new Error(response.message || 'Failed to add package');
      }
    } catch (error: any) {
      console.error('Error adding package to event:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add package to event',
        variant: 'destructive',
      });
    }
  };

  // Check if viewing own profile
  const isOwnProfile = user && supplier && user._id === supplier._id;

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
      <div className="bg-background border-b">
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

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-5xl">
        <div className="space-y-4 sm:space-y-6">
          {/* Instagram-like Header */}
          <div className="bg-background">
            <div className="flex items-start gap-4 sm:gap-6 mb-6">
              {/* Profile Image */}
              <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex-shrink-0 overflow-hidden flex items-center justify-center border-2 border-border">
                {supplier.profileImage ? (
                  <img
                    src={supplier.profileImage}
                    alt={supplier.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Users className="w-10 h-10 sm:w-14 sm:h-14 text-primary" />
                )}
              </div>

              {/* Info & Stats */}
              <div className="flex-1 pt-2">
                <div className="flex items-center gap-3 mb-4">
                  <h1 className="text-xl sm:text-2xl font-semibold">
                    {supplier.companyName || supplier.name}
                  </h1>
                  {supplier.isVerified && (
                    <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  )}
                  {isOwnProfile && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsProfileModalOpen(true)}
                      className="ml-auto"
                    >
                      <Edit className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Edit</span>
                    </Button>
                  )}
                </div>

                {/* Stats Row - Instagram Style */}
                <div className="flex gap-6 sm:gap-8 mb-4">
                  <div className="text-center">
                    <div className="font-semibold text-base sm:text-lg">
                      {supplier.packages?.length || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">packages</div>
                  </div>
                  {supplier.rating && (
                    <div className="text-center">
                      <div className="font-semibold text-base sm:text-lg flex items-center gap-1">
                        {supplier.rating.average.toFixed(1)}
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {supplier.rating.count} reviews
                      </div>
                    </div>
                  )}
                  {supplier.location?.city && (
                    <div className="text-center">
                      <div className="font-semibold text-base sm:text-lg">
                        {supplier.location.city}
                      </div>
                      <div className="text-xs text-muted-foreground">location</div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 flex-wrap">
                  <Button className="flex-1" size="sm">
                    <Mail className="w-4 h-4 mr-2" />
                    Contact
                  </Button>
                  {!isOwnProfile && user && (
                    <Button
                      variant={hasReviewed ? "secondary" : "default"}
                      size="sm"
                      onClick={() => setIsReviewDialogOpen(true)}
                      disabled={hasReviewed}
                      className="flex-1"
                    >
                      <Star className="w-4 h-4 mr-2" />
                      {hasReviewed ? 'Already Reviewed' : 'Add Review'}
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleSave}>
                    <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              </div>
            </div>

            {/* Bio Section */}
            <div className="space-y-3">
              {supplier.companyName && (
                <p className="font-medium">{supplier.name}</p>
              )}
              {supplier.description && (
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {supplier.description}
                </p>
              )}

              {/* Contact Info - Minimal */}
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
                {supplier.phone && (
                  <a
                    href={`tel:${supplier.phone}`}
                    className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    <span>{supplier.phone}</span>
                  </a>
                )}
                {supplier.email && (
                  <a
                    href={`mailto:${supplier.email}`}
                    className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    <span className="truncate max-w-[200px]">{supplier.email}</span>
                  </a>
                )}
                {supplier.supplierDetails?.instagramLink && (
                  <button
                    onClick={() => window.open(supplier.supplierDetails.instagramLink, '_blank')}
                    className="flex items-center gap-1.5 text-muted-foreground hover:text-pink-500 transition-colors"
                  >
                    <Instagram className="w-4 h-4" />
                    <span>Instagram</span>
                  </button>
                )}
                {supplier.supplierDetails?.website && (
                  <button
                    onClick={() => window.open(supplier.supplierDetails.website, '_blank')}
                    className="flex items-center gap-1.5 text-muted-foreground hover:text-blue-500 transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    <span>Website</span>
                  </button>
                )}
              </div>

              {/* Categories */}
              {supplier.categories && supplier.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {supplier.categories.map((cat: string, idx: number) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {cat}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t mt-6"></div>
          </div>
            {/* Packages */}
            <Card>
              <CardContent className="p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">{t("suppliers.pack")}</h2>

                {supplier.packages && supplier.packages.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {supplier.packages.map((pkg: any, pkgIdx: number) => (
                      <Card
                        key={pkgIdx}
                        className={`overflow-hidden transition-all hover:shadow-lg cursor-pointer group ${
                          selectedPackage?._id === pkg._id
                            ? 'ring-2 ring-primary'
                            : 'hover:border-primary/50'
                        }`}
                        onClick={() => setSelectedPackage(pkg)}
                      >
                        {/* Package Image */}
                        <div className="relative h-40 bg-gradient-to-br from-primary/10 to-primary/5 overflow-hidden">
                          {(pkg.imageUrl || pkg.image) ? (
                            <img
                              src={getImageUrl(pkg.imageUrl || pkg.image) || '/placeholder.svg'}
                              alt={pkg.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <PackageIcon className="w-12 h-12 text-primary/30" />
                            </div>
                          )}
                          {/* Status Badges */}
                          <div className="absolute top-2 right-2 flex flex-col gap-1">
                            {pkg.isPopular && (
                              <Badge className="bg-blue-500 text-white text-xs shadow-lg">
                                Popular
                              </Badge>
                            )}
                            {pkg.featured && (
                              <Badge className="bg-purple-500 text-white text-xs shadow-lg">
                                Featured
                              </Badge>
                            )}
                            {pkg.available === false && (
                              <Badge variant="secondary" className="bg-red-500 text-white text-xs shadow-lg">
                                Unavailable
                              </Badge>
                            )}
                          </div>
                        </div>

                        <CardContent className="p-4 space-y-3">
                          {/* Title & Category */}
                          <div>
                            <h3 className="font-bold text-lg line-clamp-1 mb-1 group-hover:text-primary transition-colors">
                              {pkg.name}
                            </h3>
                            {pkg.category && (
                              <Badge variant="secondary" className="text-xs">
                                {pkg.category}
                              </Badge>
                            )}
                          </div>

                          {/* Description */}
                          {pkg.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                              {pkg.description}
                            </p>
                          )}

                          {/* Price */}
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-primary">
                              {pkg.price?.currency || '$'}{pkg.price?.amount || 0}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              / {pkg.price?.pricingType || 'fixed'}
                            </span>
                          </div>

                          {/* Availability Info */}
                          {pkg.available !== false && (
                            <div className="flex items-center gap-2 text-sm">
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                              <span className="text-green-600 font-medium">Available</span>
                              {pkg.availability?.leadTime && (
                                <span className="text-muted-foreground text-xs">
                                  • {pkg.availability.leadTime}d lead time
                                </span>
                              )}
                            </div>
                          )}

                          {/* Rating */}
                          {pkg.rating && pkg.rating.average > 0 && (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-semibold">
                                {pkg.rating.average.toFixed(1)}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                ({pkg.rating.count})
                              </span>
                            </div>
                          )}

                          {/* Action Button */}
                          <Button
                            className="w-full mt-2"
                            variant={selectedPackage?._id === pkg._id ? "default" : "outline"}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectPackage(pkg);
                            }}
                          >
                            {selectedPackage?._id === pkg._id ? 'Selected' : 'Select Package'}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No packages available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reviews Section */}
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold">Reviews</h2>
                  {!isOwnProfile && user && !hasReviewed && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsReviewDialogOpen(true)}
                    >
                      <Star className="w-4 h-4 mr-2" />
                      Write a Review
                    </Button>
                  )}
                </div>

                {/* Rating Summary */}
                {supplier.rating && supplier.rating.count > 0 && (
                  <div className="flex items-center gap-4 p-4 bg-muted rounded-lg mb-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-primary">
                        {supplier.rating.average.toFixed(1)}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(supplier.rating.average)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        Based on {supplier.rating.count} {supplier.rating.count === 1 ? 'review' : 'reviews'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Reviews List */}
                {reviewsLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                    <p className="mt-2 text-sm text-muted-foreground">Loading reviews...</p>
                  </div>
                ) : reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review: any) => (
                      <Card key={review._id} className="p-4">
                        <div className="flex items-start gap-3">
                          {/* Reviewer Avatar */}
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex-shrink-0 overflow-hidden flex items-center justify-center">
                            {review.reviewerId.profileImage ? (
                              <img
                                src={review.reviewerId.profileImage}
                                alt={review.reviewerId.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Users className="w-5 h-5 text-primary" />
                            )}
                          </div>

                          {/* Review Content */}
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <div>
                                <p className="font-medium">{review.reviewerId.name}</p>
                                {review.reviewerId.role && (
                                  <Badge variant="secondary" className="text-xs mt-1">
                                    {review.reviewerId.role}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < review.rating
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            {review.feedback && (
                              <p className="text-sm text-muted-foreground mt-2">
                                {review.feedback}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(review.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Star className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="mb-2">No reviews yet</p>
                    {!isOwnProfile && user && (
                      <p className="text-sm">Be the first to review this supplier!</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Portfolio */}
            {supplier.portfolio && supplier.portfolio.length > 0 && (
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <h2 className="text-2xl font-bold mb-4">Portfolio</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {supplier.portfolio.map((item: any, idx: number) => (
                      <div key={idx} className="rounded-lg overflow-hidden bg-muted">
                        {item.image ? (
                          <img
                            src={getImageUrl(item.image) || '/placeholder.svg'}
                            alt={item.title}
                            className="w-full h-48 sm:h-40 object-cover"
                          />
                        ) : (
                          <div className="w-full h-48 sm:h-40 flex items-center justify-center bg-muted-foreground/10">
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
      </div>

      {/* Profile Modal - Only render if viewing own profile */}
      {isOwnProfile && supplier && (
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          user={supplier}
          onUpdateUser={handleUpdateUser}
        />
      )}

      {/* Event Selection Modal */}
      <Dialog open={isEventSelectionModalOpen} onOpenChange={setIsEventSelectionModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          {/* Header */}
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Add to Event
            </DialogTitle>
            <DialogDescription>
              {packageToOrder && `Select an event to add "${packageToOrder.name}"`}
            </DialogDescription>
          </DialogHeader>

          {/* Events List */}
          <div className="flex-1 overflow-y-auto py-4">
            {loadingEvents ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : myEvents.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Events Found</h3>
                <p className="text-muted-foreground mb-4">
                  You don't have any active events. Create an event first.
                </p>
                <Button onClick={() => navigate('/create-event')}>
                  Create Event
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {myEvents.map((event) => (
                  <Card
                    key={event._id}
                    className="cursor-pointer hover:border-primary transition-all"
                    onClick={() => handleAddToEvent(event._id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{event.name}</h3>
                          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mb-2">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{new Date(event.startDate).toLocaleDateString()}</span>
                            </div>
                            {event.location?.city && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                <span>{event.location.city}</span>
                              </div>
                            )}
                            {event.category && (
                              <Badge variant="secondary" className="text-xs">
                                {event.category}
                              </Badge>
                            )}
                          </div>
                          {event.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {event.description}
                            </p>
                          )}
                        </div>
                        <Badge variant={event.status === 'approved' ? 'default' : 'secondary'}>
                          {event.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 pt-4 border-t flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEventSelectionModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <ReviewDialog
        open={isReviewDialogOpen}
        onOpenChange={setIsReviewDialogOpen}
        supplierName={supplier.companyName || supplier.name}
        onSubmit={handleSubmitReview}
      />
    </div>
  );
};

export default SupplierDetails;