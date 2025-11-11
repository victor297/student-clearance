import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { logout } from "../../store/slices/authSlice";
import {
  Bell,
  LogOut,
  Settings,
  User,
  Menu,
  X,
  Sparkles,
  Shield,
  Search,
} from "lucide-react";
import NotificationDropdown from "./NotificationDropdown";

const Navbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "from-red-500 to-pink-600 shadow-red-500/25";
      case "officer":
        return "from-blue-500 to-cyan-600 shadow-blue-500/25";
      case "student":
        return "from-green-500 to-emerald-600 shadow-green-500/25";
      default:
        return "from-gray-500 to-slate-600 shadow-gray-500/25";
    }
  };

  const getRoleGradient = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-gradient-to-r from-red-500/20 to-pink-600/20 border-red-400/30";
      case "officer":
        return "bg-gradient-to-r from-blue-500/20 to-cyan-600/20 border-blue-400/30";
      case "student":
        return "bg-gradient-to-r from-green-500/20 to-emerald-600/20 border-green-400/30";
      default:
        return "bg-gradient-to-r from-gray-500/20 to-slate-600/20 border-gray-400/30";
    }
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-2xl"
            : "bg-gradient-to-r from-slate-900/95 via-purple-900/95 to-slate-900/95 backdrop-blur-lg border-b border-white/10"
        }`}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-xl animate-pulse-slow" />
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-lg animate-pulse-slower" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300" />
                <div
                  className={`relative h-12 w-12 rounded-xl ${
                    isScrolled
                      ? "bg-gradient-to-br from-blue-600 to-purple-600"
                      : "bg-gradient-to-br from-blue-400/20 to-purple-400/20 border border-white/20"
                  } flex items-center justify-center shadow-2xl transform transition-transform duration-300 group-hover:scale-110`}
                >
                  <Shield
                    className={`h-6 w-6 ${
                      isScrolled ? "text-white" : "text-blue-300"
                    } transform group-hover:rotate-12 transition-transform duration-300`}
                  />
                  <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-yellow-300 animate-ping" />
                </div>
              </div>

              <div className="hidden md:block">
                <h1
                  className={`text-xl font-bold bg-gradient-to-r ${
                    isScrolled
                      ? "from-blue-600 to-purple-600"
                      : "from-white to-blue-100"
                  } bg-clip-text text-transparent transition-all duration-300`}
                >
                  Clearance Portal
                </h1>
                <p
                  className={`text-xs font-medium transition-all duration-300 ${
                    isScrolled ? "text-gray-600" : "text-blue-200/80"
                  }`}
                >
                  Secure Student Management System
                </p>
              </div>
            </div>

            {/* Search Bar - Desktop */}
            <div className="hidden lg:block flex-1 max-w-md mx-8">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300" />
                <input
                  type="text"
                  placeholder="Search clearance, documents..."
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border transition-all duration-300 ${
                    isScrolled
                      ? "bg-white/80 border-gray-200/80 focus:bg-white focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                      : "bg-white/10 border-white/20 focus:bg-white/20 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 text-white placeholder-blue-200/60"
                  } backdrop-blur-sm focus:outline-none`}
                />
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-3">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`p-2.5 rounded-xl transition-all duration-300 transform hover:scale-110 ${
                    isScrolled
                      ? "text-gray-600 hover:text-blue-600 hover:bg-blue-50/80"
                      : "text-blue-200 hover:text-white hover:bg-white/10"
                  } backdrop-blur-sm border ${
                    isScrolled ? "border-transparent" : "border-white/10"
                  } relative group`}
                >
                  <Bell className="h-5 w-5" />
                  {/* Notification Indicator */}
                  <div className="absolute -top-1 -right-1">
                    <div className="relative">
                      <div className="animate-ping absolute -inset-1 bg-red-400 rounded-full opacity-75" />
                      <div className="relative bg-gradient-to-r from-red-500 to-pink-600 rounded-full w-2 h-2" />
                    </div>
                  </div>
                </button>
                {showNotifications && (
                  <NotificationDropdown
                    onClose={() => setShowNotifications(false)}
                  />
                )}
              </div>

              {/* User Info */}
              <div
                className="flex items-center space-x-3 group cursor-pointer"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <div
                  className={`text-right transition-all duration-300 ${
                    isHovered ? "transform translate-x-2" : ""
                  }`}
                >
                  <p
                    className={`text-sm font-semibold transition-colors duration-300 ${
                      isScrolled ? "text-gray-900" : "text-white"
                    }`}
                  >
                    {user?.firstname} {user?.lastname}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${getRoleBadgeColor(
                        user?.role || ""
                      )} text-white shadow-lg transform transition-transform duration-300 group-hover:scale-105`}
                    >
                      {user?.role?.toUpperCase()}
                    </span>
                    {user?.officer_department && (
                      <span
                        className={`text-xs font-medium transition-colors duration-300 ${
                          isScrolled ? "text-gray-600" : "text-blue-200/90"
                        }`}
                      >
                        {user.officer_department.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>

                {/* User Avatar */}
                <div
                  className={`relative p-1 rounded-2xl transition-all duration-500 ${
                    isHovered ? "transform scale-110" : ""
                  } ${getRoleGradient(
                    user?.role || ""
                  )} border backdrop-blur-sm`}
                >
                  <div
                    className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                      isScrolled
                        ? "bg-gradient-to-br from-slate-100 to-gray-200 text-gray-700"
                        : "bg-white/10 text-white"
                    } transition-all duration-300 shadow-inner`}
                  >
                    <User className="h-5 w-5" />
                  </div>

                  {/* Active Status Indicator */}
                  <div className="absolute -bottom-1 -right-1">
                    <div className="relative">
                      <div className="absolute -inset-1 bg-green-400 rounded-full opacity-75 animate-ping" />
                      <div className="relative bg-gradient-to-r from-green-500 to-emerald-600 rounded-full w-3 h-3 border-2 border-white" />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-1">
                  <button
                    className={`p-2.5 rounded-xl transition-all duration-300 transform hover:scale-110 ${
                      isScrolled
                        ? "text-gray-600 hover:text-blue-600 hover:bg-blue-50/80"
                        : "text-blue-200 hover:text-white hover:bg-white/10"
                    } backdrop-blur-sm border ${
                      isScrolled ? "border-transparent" : "border-white/10"
                    }`}
                  >
                    <Settings className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleLogout}
                    className={`p-2.5 rounded-xl transition-all duration-300 transform hover:scale-110 ${
                      isScrolled
                        ? "text-gray-600 hover:text-red-600 hover:bg-red-50/80"
                        : "text-blue-200 hover:text-red-300 hover:bg-red-500/20"
                    } backdrop-blur-sm border ${
                      isScrolled ? "border-transparent" : "border-white/10"
                    } group`}
                  >
                    <LogOut className="h-5 w-5 transform group-hover:translate-x-0.5 transition-transform duration-300" />
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`p-2.5 rounded-xl transition-all duration-300 ${
                  isScrolled
                    ? "text-gray-600 hover:text-blue-600 hover:bg-blue-50/80"
                    : "text-blue-200 hover:text-white hover:bg-white/10"
                } backdrop-blur-sm border ${
                  isScrolled ? "border-transparent" : "border-white/10"
                }`}
              >
                {isMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div
            className={`md:hidden border-t transition-all duration-500 ${
              isScrolled
                ? "bg-white/95 border-gray-200/80"
                : "bg-slate-900/95 border-white/10"
            } backdrop-blur-xl`}
          >
            <div className="px-4 pt-4 pb-6 space-y-4">
              {/* User Info Mobile */}
              <div
                className={`flex items-center space-x-4 p-4 rounded-2xl ${
                  isScrolled ? "bg-gray-50/80" : "bg-white/5"
                } backdrop-blur-sm border ${
                  isScrolled ? "border-gray-200/50" : "border-white/10"
                }`}
              >
                <div
                  className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                    isScrolled
                      ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white"
                      : "bg-white/10 text-white"
                  } shadow-lg`}
                >
                  <User className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <p
                    className={`font-semibold ${
                      isScrolled ? "text-gray-900" : "text-white"
                    }`}
                  >
                    {user?.firstname} {user?.lastname}
                  </p>
                  <p
                    className={`text-sm ${
                      isScrolled ? "text-gray-600" : "text-blue-200"
                    }`}
                  >
                    {user?.email}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${getRoleBadgeColor(
                        user?.role || ""
                      )} text-white`}
                    >
                      {user?.role?.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Mobile Search */}
              <div className="relative">
                <Search
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                    isScrolled ? "text-gray-400" : "text-blue-200"
                  }`}
                />
                <input
                  type="text"
                  placeholder="Search..."
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all duration-300 ${
                    isScrolled
                      ? "bg-white border-gray-200 focus:border-blue-500"
                      : "bg-white/10 border-white/20 text-white placeholder-blue-200/60"
                  } backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                />
              </div>

              {/* Mobile Menu Items */}
              <div className="space-y-2">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`flex items-center w-full px-4 py-3 rounded-xl text-left transition-all duration-300 ${
                    isScrolled
                      ? "text-gray-700 hover:bg-blue-50/80 hover:text-blue-600"
                      : "text-blue-200 hover:bg-white/10 hover:text-white"
                  } backdrop-blur-sm border ${
                    isScrolled ? "border-transparent" : "border-white/10"
                  }`}
                >
                  <Bell className="h-5 w-5 mr-3" />
                  Notifications
                  <div className="ml-auto bg-red-500 rounded-full w-2 h-2" />
                </button>

                <button
                  className={`flex items-center w-full px-4 py-3 rounded-xl text-left transition-all duration-300 ${
                    isScrolled
                      ? "text-gray-700 hover:bg-blue-50/80 hover:text-blue-600"
                      : "text-blue-200 hover:bg-white/10 hover:text-white"
                  } backdrop-blur-sm border ${
                    isScrolled ? "border-transparent" : "border-white/10"
                  }`}
                >
                  <Settings className="h-5 w-5 mr-3" />
                  Settings
                </button>

                <button
                  onClick={handleLogout}
                  className={`flex items-center w-full px-4 py-3 rounded-xl text-left transition-all duration-300 ${
                    isScrolled
                      ? "text-red-600 hover:bg-red-50/80"
                      : "text-red-300 hover:bg-red-500/20"
                  } backdrop-blur-sm border ${
                    isScrolled ? "border-transparent" : "border-white/10"
                  }`}
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Spacer for fixed navbar */}
      <div className="h-16" />
    </>
  );
};

export default Navbar;
