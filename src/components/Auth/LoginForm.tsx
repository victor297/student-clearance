import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { login, clearError } from "../../store/slices/authSlice";
import {
  GraduationCap,
  Mail,
  Lock,
  LogIn,
  Sparkles,
  Shield,
  School,
} from "lucide-react";

const schema = yup.object({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().required("Password is required"),
});

type LoginFormData = yup.InferType<typeof schema>;

const LoginForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);
  const [isHovered, setIsHovered] = useState(false);
  const [particles, setParticles] = useState<
    Array<{ id: number; x: number; y: number; size: number }>
  >([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data: LoginFormData) => {
    dispatch(clearError());
    dispatch(login(data));
  };

  // Create floating particles effect
  useEffect(() => {
    const newParticles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Particles */}
      <div className="absolute inset-0">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full bg-white/10 animate-float"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animationDelay: `${particle.id * 0.5}s`,
              animationDuration: `${15 + particle.id * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Animated Gradients */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slow" />
      <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slower" />
      <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-cyan-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slow" />

      <div className="max-w-md w-full space-y-8 z-10 px-4">
        {/* Header Section */}
        <div className="text-center transform transition-all duration-500 hover:scale-105">
          <div className="relative inline-block">
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-lg opacity-75 animate-pulse" />
            <div className="relative bg-gradient-to-br from-blue-600 to-purple-700 p-4 rounded-2xl shadow-2xl">
              <div className="flex items-center justify-center space-x-3">
                <div className="relative">
                  <GraduationCap className="h-8 w-8 text-white" />
                  <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-yellow-300 animate-ping" />
                </div>
                <h2 className="text-2xl font-bold text-white bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  Clearance Portal
                </h2>
              </div>
            </div>
          </div>

          <p className="mt-6 text-lg font-light text-blue-100/90 tracking-wide">
            Welcome back to your digital clearance journey
          </p>
          <div className="mt-2 flex items-center justify-center space-x-2 text-blue-200/70">
            <Shield className="h-4 w-4" />
            <span className="text-sm">Secure Student Authentication</span>
          </div>
        </div>

        {/* Login Form */}
        <form
          className="mt-8 space-y-6 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-8 transform transition-all duration-500 hover:shadow-3xl"
          onSubmit={handleSubmit(onSubmit)}
        >
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 backdrop-blur-sm animate-shake">
              <p className="text-red-100 text-sm font-medium text-center">
                {error}
              </p>
            </div>
          )}

          <div className="space-y-6">
            {/* Email Field */}
            <div className="group">
              <label className="block text-sm font-medium text-blue-100/90 mb-3">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-blue-300/80 group-focus-within:text-blue-400 transition-colors duration-300" />
                </div>
                <input
                  {...register("email")}
                  type="email"
                  className="block w-full pl-10 pr-4 py-3 bg-white/5 border border-blue-300/30 rounded-xl text-white placeholder-blue-200/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                  placeholder="student@university.edu"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-300 animate-pulse">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="group">
              <label className="block text-sm font-medium text-blue-100/90 mb-3">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-blue-300/80 group-focus-within:text-blue-400 transition-colors duration-300" />
                </div>
                <input
                  {...register("password")}
                  type="password"
                  className="block w-full pl-10 pr-4 py-3 bg-white/5 border border-blue-300/30 rounded-xl text-white placeholder-blue-200/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                  placeholder="Enter your password"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-300 animate-pulse">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="transform transition-transform duration-300 hover:scale-[1.02]">
            <button
              type="submit"
              disabled={loading}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="group relative w-full py-4 px-6 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-2xl transition-all duration-500 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {/* Animated background shine */}
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

              <div className="relative flex items-center justify-center space-x-2">
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <LogIn
                      className={`h-5 w-5 transition-transform duration-300 ${
                        isHovered ? "translate-x-1" : ""
                      }`}
                    />
                    <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                      ACCESS PORTAL
                    </span>
                  </>
                )}
              </div>
            </button>
          </div>

          {/* Help Text */}
          <div className="text-center">
            <p className="text-xs text-blue-200/70 font-medium">
              Default password: your lastname in lowercase
            </p>
          </div>
          <div className="bg-white/5 text-center backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-center mb-3">
              <School className="h-5 w-5 text-blue-300 mr-2" />
              <span className="text-sm font-semibold text-blue-200">
                Academic Project
              </span>
            </div>

            <div className="space-y-1">
              <p className="text-lg font-bold bg-gradient-to-r from-amber-300 to-yellow-400 bg-clip-text text-transparent">
                Olalekan Abass
              </p>
              <div className="flex items-center justify-center space-x-2 text-blue-200/80">
                <span className="text-sm">Supervised by</span>
                <span className="text-sm font-semibold text-white">
                  Dr. Raji-Lawal Hamat
                </span>
              </div>
            </div>

            <div className="mt-1 pt-1 border-t border-white/10">
              <p className="text-xs text-blue-200/60 font-medium">
                Student Clearance Management System
              </p>
            </div>
          </div>
        </form>

        {/* Project Credits - Enhanced Placement */}
        <div className="text-center transform transition-all duration-500 hover:scale-105"></div>
      </div>
    </div>
  );
};

export default LoginForm;
