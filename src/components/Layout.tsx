import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  CalendarPlus,
  Search,
  UserCircle,
  Zap,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Sun,
  Moon,
  Settings,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import RegisterModal from "@/components/RegisterModal";
import ProfileModal from "@/components/ProfileModal";
import SettingsModal from "@/components/SettingsModal";
import ForgotPasswordModal from "@/components/ForgotPasswordModal";
import Footer from "@/components/Footer";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { AuthProvider } from "@/hooks/use-auth";
import { getImageUrl } from '@/utils/imageUtils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import apiService from "@/services/api";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  profileImage?: string;
  supplierDetails?: {
    companyName: string;
    categories: string[];
  };
  producerDetails?: {
    companyName: string;
  };
}

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true); // Start with true to prevent flash
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [theme, setTheme] = useState(() =>
    typeof window !== "undefined"
      ? localStorage.getItem("theme") || "light"
      : "light"
  );
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Check if current page should hide navbar
  const hideNavbar = false; // Show navbar on all pages including auth pages

  const publicroute =
    location.pathname === "/signin" ||
    location.pathname === "/signup" ||
    location.pathname === "/supplier-register" ||
    location.pathname === "/supplier-login" ||
    location.pathname === "/producer-register" ||
    location.pathname === "/producer-login";

  // Check for existing JWT token on app load
  useEffect(() => {
    const checkExistingToken = async () => {
      const token = localStorage.getItem("token");
      console.log(
        "🔍 App load - Checking for existing token:",
        token ? "Token exists" : "No token"
      );

      if (!token) {
        // No token, user is definitely not logged in
        setIsLoadingUser(false);
        return;
      }

      // Token exists, verify it and get user data
      console.log("🔍 App load - Token found, attempting auto-login...");
      try {
        // Verify token and get user data
        const userData = await apiService.getProfile();
        const responseData = userData as { data: { user: User } };

        console.log("🔍 Auto-login successful - User:", responseData.data.user);
        setUser(responseData.data.user);
      } catch (error) {
        console.error("🔍 Auto-login failed:", error);

        // Only remove token on authentication errors (401, 403)
        // Don't remove on other errors like 404, 500, etc.
        if (error instanceof Error) {
          try {
            const errorData = JSON.parse(error.message);
            if (errorData.status === 401 || errorData.status === 403) {
              console.log(
                "🔍 Auto-login - Removing invalid token due to auth error"
              );
              localStorage.removeItem("token");
            } else {
              console.log(
                "🔍 Auto-login - Keeping token, error was not auth-related:",
                errorData.status
              );
            }
          } catch {
            // If we can't parse the error, keep the token
            console.log("🔍 Auto-login - Keeping token, could not parse error");
          }
        }
      } finally {
        setIsLoadingUser(false);
      }
    };

    checkExistingToken();
  }, []); // Empty dependency array - only run once on mount

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Protect dashboard route
  useEffect(() => {
    // Only redirect if we're not loading and user is not authenticated
    if (
      !isLoadingUser &&
      (location.pathname === "/producer-dashboard" ||
        location.pathname === "/supplier-dashboard" ||
        location.pathname === "/admin-dashboard") &&
      !user
    ) {
      toast({
        title: t("common.accessDenied"),
        description: t("common.pleaseSignInToAccessDashboard"),
        variant: "destructive",
      });
      navigate("/");
    }
  }, [location.pathname, user, isLoadingUser, toast, navigate]);

  const getDashboardUrl = () => {
    if (!user) return "/producer-dashboard";
    switch (user.role) {
      case "admin":
        return "/admin-dashboard";
      case "supplier":
        return "/supplier-dashboard";
      case "producer":
      default:
        return "/producer-dashboard";
    }
  };

  const navItems = [
    {
      title: t("nav.dashboard"),
      url: getDashboardUrl(),
      icon: UserCircle,
    },
    { title: t("nav.browseEvents"), url: "/browse-events", icon: Search },
    { title: t("nav.createEvent"), url: "/", icon: CalendarPlus },
     { title: t("nav.Suppliers "), url: "/browse-supplier", icon: Search },
  ];

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("token"); // Clear JWT token
    toast({
      title: t("common.signedOut"),
      description: t("common.signedOutSuccessfully"),
    });
    navigate("/");
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    const names = name.split(" ");
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

const handleUpdateUser = async (updatedUser: User) => {
  try {
    setUser(updatedUser);
    
    // Optional: Refresh user data from backend to ensure sync
    // const refreshedData = await apiService.getProfile();
    // const responseData = refreshedData as { data: { user: User } };
    // setUser(responseData.data.user);
  } catch (error) {
    console.error('Error updating user profile:', error);
    toast({
      title: 'Error',
      description: 'Failed to sync profile',
      variant: 'destructive',
    });
  }
};
  return (
    <AuthProvider value={{ user, isLoadingUser, setUser, setIsLoadingUser }}>
      <div
        className={`min-h-screen w-full overflow-x-hidden ${
          theme === "dark" ? "dark" : ""
        }`}
      >
        {/* Header - Hide on auth pages */}
        {!hideNavbar && (
          <>
            <header className="fixed top-0 left-1/2 -translate-x-1/2 w-[95%] max-w-6xl z-50">
              <nav className="flex items-center justify-between p-3 rounded-2xl border shadow-sm header-dark">
                <div className="flex items-center gap-6">
                  <Link to="/" className="flex items-center gap-2">
                    <img
                      src="/Icons_1.png"
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      alt="Pic Logo"
                    ></img>
                    <h1 className="text-2xl font-bold tracking-wider text-gradient-primary">
                      PIC
                    </h1>
                  </Link>

                  {/* Desktop Navigation */}
                  <div className="hidden md:flex items-center gap-2">
                    {!publicroute &&
                      navItems.map((item) => (
                        <Link key={item.title} to={item.url}>
                          <button
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                              location.pathname === item.url
                                ? "bg-muted text-foreground"
                                : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {item.title}
                          </button>
                        </Link>
                      ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Language switcher */}
                  <LanguageSwitcher />

                  {/* Theme toggle */}
                  <button
                    aria-label="Toggle theme"
                    onClick={() =>
                      setTheme((prev) => (prev === "dark" ? "light" : "dark"))
                    }
                    className="p-2 rounded-lg transition-colors bg-muted hover:bg-muted/80"
                  >
                    {theme === "dark" ? (
                      <Sun className="w-4 h-4" />
                    ) : (
                      <Moon className="w-4 h-4" />
                    )}
                  </button>

                  {/* Desktop User Menu */}
                  <div className="hidden md:block">
                    {isLoadingUser ? (
                      <Skeleton className="h-10 w-28 rounded-lg" />
                    ) : user ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="flex items-center gap-2 p-2 rounded-lg transition-colors hover:bg-muted">
                            <Avatar className="w-8 h-8">
                              <AvatarImage
                                src={getImageUrl(user.profileImage)}
                                alt={user.name}
                              />
                              <AvatarFallback>
                                {getInitials(user.name || user.email)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="hidden sm:inline font-medium text-sm">
                              {user.name || user.email}
                            </span>
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          className="min-w-[12rem]"
                          align="end"
                        >
                          <DropdownMenuLabel>
                            <div className="text-sm font-medium">
                              {user.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {t(`roles.${user.role}`)}
                            </div>
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onSelect={() => setIsProfileModalOpen(true)}
                          >
                            <UserCircle className="w-4 h-4 mr-2" />
                            {t("nav.profile")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onSelect={() => setIsSettingsModalOpen(true)}
                          >
                            <Settings className="w-4 h-4 mr-2" />
                            {t("common.settings")}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onSelect={handleLogout}
                            className="cursor-pointer text-destructive focus:text-destructive"
                          >
                            <LogOut className="w-4 h-4 mr-2" />
                            {t("nav.logout")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <Link to="/signin">
                        <button className="px-4 py-2 rounded-lg text-sm font-bold text-white hover:opacity-90 transition-all duration-200" style={{ background: 'linear-gradient(to right, hsl(225 96% 19%), hsl(203 100% 59%))' }}>
                          {t("nav.signIn")}
                        </button>
                      </Link>
                    )}
                  </div>

                  {/* Mobile Menu Button */}
                  <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="md:hidden p-2 rounded-lg transition-colors bg-muted hover:bg-muted/80"
                  >
                    {isMobileMenuOpen ? (
                      <X className="w-6 h-6" />
                    ) : (
                      <Menu className="w-6 h-6" />
                    )}
                  </button>
                </div>
              </nav>
            </header>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
              {isMobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/30 z-40 md:hidden"
                  onClick={() => setIsMobileMenuOpen(false)}
                />
              )}
            </AnimatePresence>

            {/* Mobile Menu */}
            <AnimatePresence>
              {isMobileMenuOpen && (
                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: "0%" }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="fixed top-0 right-0 w-80 h-full bg-background border-l border-border z-50 md:hidden"
                >
                  <div className="p-6 ">
                    <div className="space-y-3">
                      {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = location.pathname === item.url;
                        return (
                          <Link key={item.title} to={item.url}>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className={`w-full flex items-center gap-3 p-4 rounded-xl text-left font-medium transition-all duration-200 ${
                                active
                                  ? "bg-muted text-foreground border border-border"
                                  : "hover:bg-muted/50 text-muted-foreground border border-transparent"
                              }`}
                            >
                              <Icon className="w-5 h-5" />
                              {item.title}
                            </motion.button>
                          </Link>
                        );
                      })}
                    </div>

                    {/* Mobile User Section */}
                    <div className="mt-8 pt-6 border-t border-border">
                      {isLoadingUser ? (
                        <Skeleton className="h-16 w-full rounded-xl" />
                      ) : user ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 p-4 rounded-xl bg-muted">
                            <Avatar className="w-10 h-10">
                              <AvatarImage
                                src={getImageUrl(user.profileImage)}
                                alt={user.name}
                              />
                              <AvatarFallback>
                                {getInitials(user.name || user.email)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 text-left">
                              <div className="font-medium text-sm">
                                {user.name || user.email}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {t(`roles.${user.role}`)}
                              </div>
                            </div>
                          </div>
                          <button
                            className="w-full flex items-center gap-3 p-3 rounded-lg text-left font-medium transition-colors bg-muted hover:bg-muted/80"
                            onClick={() => {
                              setIsProfileModalOpen(true);
                              setIsMobileMenuOpen(false);
                            }}
                          >
                            <UserCircle className="w-5 h-5" />
                            {t("nav.profile")}
                          </button>
                          <button
                            className="w-full flex items-center gap-3 p-3 rounded-lg text-left font-medium transition-colors hover:bg-muted/50"
                            onClick={() => {
                              setIsSettingsModalOpen(true);
                              setIsMobileMenuOpen(false);
                            }}
                          >
                            <Settings className="w-5 h-5" />
                            {t("common.settings")}
                          </button>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 p-3 rounded-lg text-left font-medium transition-colors text-destructive border border-border hover:bg-destructive/10"
                          >
                            <LogOut className="w-5 h-5" />
                            {t("nav.logout")}
                          </button>
                        </div>
                      ) : (
                        <Link to="/signin">
                          <button className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all duration-200">
                            {t("nav.signIn")}
                          </button>
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        <main className={`relative z-10 ${hideNavbar ? 'pt-0' : 'pt-24'} pb-10 px-4`}>
          {children}
        </main>

        {/* Profile Modal */}
        {user && (
          <ProfileModal
            isOpen={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
            user={user}
            onUpdateUser={handleUpdateUser}
          />
        )}

        {/* Settings Modal */}
        {user && (
          <SettingsModal
            isOpen={isSettingsModalOpen}
            onClose={() => setIsSettingsModalOpen(false)}
            user={user}
          />
        )}
      </div>
      <Footer />
    </AuthProvider>
  );
}
