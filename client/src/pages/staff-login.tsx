import { useState } from "react";
import { useStaffLogin } from "@/hooks/useStaffAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, User, Lock } from "lucide-react";
import { motion } from "framer-motion";

interface StaffLoginProps {
  onSuccess: () => void;
}

export default function StaffLogin({ onSuccess }: StaffLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const staffLogin = useStaffLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      await staffLogin.mutateAsync({ email, password });
      onSuccess();
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 p-4">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full opacity-20 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-200 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-rose-200 rounded-full opacity-15 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center"
            >
              <User className="h-8 w-8 text-white" />
            </motion.div>
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Staff Portal
              </CardTitle>
              <CardDescription className="text-slate-600 mt-2">
                Sign in to access the management system
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                  Email Address
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="pl-10 h-11 border-slate-200 focus:border-purple-400 focus:ring-purple-400"
                    required
                    data-testid="input-staff-email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pl-10 h-11 border-slate-200 focus:border-purple-400 focus:ring-purple-400"
                    required
                    data-testid="input-staff-password"
                  />
                </div>
              </div>

              {staffLogin.error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">
                    Invalid email or password. Please try again.
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={staffLogin.isPending || !email || !password}
                className="w-full h-11 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium transition-all duration-200 transform hover:scale-[1.02]"
                data-testid="button-staff-login"
              >
                {staffLogin.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="text-center pt-4 border-t border-slate-100">
              <Button
                variant="ghost"
                onClick={() => window.location.href = '/'}
                className="text-slate-500 hover:text-slate-700"
                data-testid="button-back-to-landing"
              >
                ← Back to Landing Page
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}