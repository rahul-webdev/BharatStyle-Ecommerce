"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux";
import { sendOtp, verifyOtp } from "@/lib/features/auth/authSlice";
import { Button } from "@/components/ui/button";
import InputGroup from "@/components/ui/input-group";
import { cn } from "@/lib/utils";
import { integralCF } from "@/styles/fonts";
import Image from "next/image";
import { apiRequest } from "@/lib/api";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { CompleteProfileModal } from "@/components/auth/CompleteProfileModal";

const AuthPage = () => {
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [showCompleteProfile, setShowCompleteProfile] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { otpSent, isLoggedIn, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  useEffect(() => {
    if (isLoggedIn && user) {
      if (user.firstName && user.lastName) {
        router.push("/");
      } else {
        setShowCompleteProfile(true);
      }
    }
  }, [isLoggedIn, user, router]);

  const handleSendOtp = async () => {
    if (mobile.length < 10) {
      setError("Please enter a valid mobile number");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const response = await apiRequest('/api/auth/send-otp', {
        method: 'POST',
        body: { mobile }
      });
      if (response.success) {
        dispatch(sendOtp(mobile));
        setResendTimer(60); // Start 1 minute timer
      }
    } catch (err: any) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 4) {
      setError("Please enter a valid 4-digit OTP");
      return;
    }
    setError("");
    setLoading(true);
    try {
      // Sign in directly with NextAuth using OTP as password
      const result = await signIn('credentials', {
        identifier: mobile,
        password: otp, // Use OTP as password for phone-otp login type
        loginType: 'phone-otp',
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        dispatch(verifyOtp());
        // Fetch full user profile to populate Redux
        const profileRes = await apiRequest('/api/user/profile');
        dispatch({ type: 'auth/updateUser', payload: profileRes });
        
        // Check if profile is complete
        if (profileRes.firstName && profileRes.lastName) {
          router.push("/");
        } else {
          setShowCompleteProfile(true);
        }
      }
    } catch (err: any) {
      setError(err.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-[75vh] px-4 bg-[#FBFBFB]">
      <CompleteProfileModal 
        isOpen={showCompleteProfile} 
        onClose={() => setShowCompleteProfile(false)}
        onSuccess={() => {
          setShowCompleteProfile(false);
          router.push("/");
        }}
      />
      <div className="w-full max-w-[440px] p-10 bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)]">
        <div className="flex justify-center mb-8">
          <div className="bg-black text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.3em]">
            Official
          </div>
        </div>

        <h1 className={cn(integralCF.className, "text-2xl text-center mb-10 uppercase tracking-[0.15em] text-black")}>
          {otpSent ? "Authorize" : "Join the Club"}
        </h1>

        <div className="space-y-6">
          {!otpSent ? (
            <>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 ml-1">
                  Mobile Number
                </label>
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                    <span className="text-gray-300 font-bold text-sm">+91</span>
                    <div className="w-[1px] h-4 bg-gray-100" />
                  </div>
                  <input
                    type="tel"
                    placeholder="75738 31283"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                    maxLength={10}
                    className="w-full bg-gray-50/50 border border-gray-100 rounded-[1.25rem] h-16 pl-20 pr-6 text-sm font-bold tracking-[0.1em] placeholder:text-gray-200 focus:outline-none focus:border-black/10 focus:bg-white focus:ring-4 focus:ring-black/[0.02] transition-all"
                  />
                </div>
              </div>
              <Button
                onClick={handleSendOtp}
                className="w-full rounded-full text-[11px] font-black uppercase tracking-[0.25em] h-16 bg-black hover:bg-black/90 text-white shadow-2xl shadow-black/10 transition-all active:scale-[0.98] disabled:opacity-50"
                disabled={loading}
              >
                {loading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : "Request Access"}
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 ml-1 block text-center">
                    Verification Code
                  </label>
                  
                  <div className="relative flex justify-center gap-3 py-2">
                    {[...Array(4)].map((_, i) => (
                      <div 
                        key={i}
                        className={cn(
                          "w-14 h-16 rounded-2xl border-2 flex items-center justify-center text-xl font-black transition-all",
                          otp.length === i ? "border-black bg-white shadow-lg shadow-black/5" : 
                          otp.length > i ? "border-gray-100 bg-gray-50/50 text-black" : 
                          "border-gray-50 bg-gray-50/30 text-gray-200"
                        )}
                      >
                        {otp[i] || "•"}
                      </div>
                    ))}
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      maxLength={4}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      autoFocus
                      disabled={loading}
                    />
                  </div>

                  <p className="text-[10px] text-gray-400 font-bold text-center uppercase tracking-widest mt-4">
                    Sent to <span className="text-black">+91 {mobile}</span>
                  </p>
                </div>

                <div className="flex justify-center">
                  {resendTimer > 0 ? (
                    <div className="flex items-center gap-3 bg-gray-50/80 backdrop-blur-sm px-5 py-2 rounded-full border border-gray-100">
                      <div className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                        Resend in <span className="text-black">{resendTimer}s</span>
                      </p>
                    </div>
                  ) : (
                    <button 
                      onClick={handleSendOtp} 
                      disabled={loading}
                      className="text-[10px] font-black uppercase tracking-[0.2em] text-black hover:bg-black hover:text-white px-6 py-2 rounded-full border border-black/5 transition-all disabled:opacity-30"
                    >
                      Resend Code
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <Button
                  onClick={handleVerifyOtp}
                  className="w-full rounded-full text-[11px] font-black uppercase tracking-[0.25em] h-16 bg-black hover:bg-black/90 text-white shadow-2xl shadow-black/10 transition-all active:scale-[0.98] disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : "Verify Identity"}
                </Button>
                
                <button
                  onClick={() => {
                    dispatch({ type: "auth/logout" });
                    setResendTimer(0);
                    setOtp("");
                  }}
                  className="w-full text-[9px] font-black uppercase tracking-[0.3em] text-gray-300 hover:text-black transition-colors"
                >
                  Change Mobile
                </button>
              </div>
            </>
          )}

          {error && (
            <div className="bg-red-50/50 border border-red-100/50 p-4 rounded-[1.25rem] animate-in fade-in zoom-in-95 duration-300">
              <p className="text-red-500 text-[10px] font-black text-center uppercase tracking-widest leading-relaxed">
                {error}
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default AuthPage;
