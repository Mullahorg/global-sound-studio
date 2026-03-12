import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Headphones, Mail, User, ArrowRight, Music, CheckCircle2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { PageMeta } from "@/components/seo/PageMeta";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useReferral } from "@/hooks/useReferral";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"artist" | "producer">("artist");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [showVerification, setShowVerification] = useState(false);
  const [searchParams] = useSearchParams();
  
  const { signIn, signUp, user } = useAuth();
  const { validateReferralCode, recordReferral } = useReferral();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Get referral code from URL
  const refCode = searchParams.get("ref");

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  // If there's a ref code, default to signup mode
  useEffect(() => {
    if (refCode) {
      setIsLogin(false);
    }
  }, [refCode]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }
    
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: "Login failed",
            description: error.message === "Invalid login credentials" 
              ? "Invalid email or password. Please try again."
              : error.message === "Email not confirmed"
              ? "Please verify your email before signing in. Check your inbox."
              : error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Welcome back!",
            description: "You have successfully logged in.",
          });
        }
      } else {
        const result = await signUp(email, password, fullName, role);
        if (result.error) {
          toast({
            title: "Sign up failed",
            description: result.error.message.includes("already registered")
              ? "This email is already registered. Try logging in instead."
              : result.error.message,
            variant: "destructive",
          });
        } else {
          // Process referral code if present
          if (refCode) {
            const codeData = await validateReferralCode(refCode);
            if (codeData) {
              await recordReferral(codeData.id, codeData.user_id);
            }
          }

          if (result.needsVerification) {
            setShowVerification(true);
          } else {
            toast({
              title: "Account created!",
              description: "Welcome to WE Global Music Studio.",
            });
          }
        }
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Email verification success screen
  if (showVerification) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <PageMeta title="Verify Your Email" description="Check your email to verify your account." path="/auth" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30">
            <MailCheck className="w-10 h-10 text-white" />
          </div>
          <h2 className="font-display text-3xl font-bold text-foreground mb-3">
            Check Your Email
          </h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            We've sent a verification link to <strong className="text-foreground">{email}</strong>. 
            Click the link in the email to activate your account.
          </p>
          <div className="p-4 rounded-xl bg-secondary/50 border border-border/50 mb-6">
            <div className="flex items-start gap-3 text-left">
              <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Didn't receive it?</p>
                <p>Check your spam folder. The email may take a few minutes to arrive.</p>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setShowVerification(false);
              setIsLogin(true);
            }}
          >
            Back to Sign In
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <PageMeta
        title={isLogin ? "Sign In" : "Create Account"}
        description="Sign in or create an account to access your dashboard, purchase beats, and book sessions."
        path="/auth"
      />
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/10" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-8 shadow-lg shadow-primary/30">
                <Headphones className="w-10 h-10 text-primary-foreground" />
              </div>
              <h1 className="font-display text-5xl font-bold mb-4 text-foreground">
                WE Global
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Global sound. One studio.
              </p>
              <div className="flex justify-center gap-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ height: [20, 40, 20] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                    className="w-2 bg-gradient-to-t from-primary to-accent rounded-full"
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Headphones className="w-7 h-7 text-primary-foreground" />
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="font-display text-3xl font-bold text-foreground mb-2">
              {isLogin ? "Welcome Back" : "Join the Studio"}
            </h2>
            <p className="text-muted-foreground">
              {isLogin 
                ? "Sign in to access your dashboard" 
                : "Create your account to get started"}
            </p>
            {refCode && !isLogin && (
              <p className="text-sm text-primary mt-2 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Referred by code: {refCode}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10 h-12 bg-secondary border-border"
                    placeholder="Enter your full name"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`pl-10 h-12 bg-secondary border-border ${errors.email ? 'border-destructive' : ''}`}
                  placeholder="Enter your email"
                  required
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {isLogin && (
                  <Link 
                    to="/forgot-password" 
                    className="text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    Forgot password?
                  </Link>
                )}
              </div>
              <PasswordInput
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`bg-secondary border-border ${errors.password ? 'border-destructive' : ''}`}
                placeholder="Enter your password"
                required
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label>I am a...</Label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setRole("artist")}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      role === "artist"
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <User className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <span className="font-medium">Artist</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("producer")}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      role === "producer"
                        ? "border-accent bg-accent/10"
                        : "border-border hover:border-accent/50"
                    }`}
                  >
                    <Music className="w-6 h-6 mx-auto mb-2 text-accent" />
                    <span className="font-medium">Producer</span>
                  </button>
                </div>
              </div>
            )}

            <Button
              type="submit"
              variant="hero"
              size="xl"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                "Please wait..."
              ) : (
                <>
                  {isLogin ? "Sign In" : "Create Account"}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setErrors({});
                setShowVerification(false);
              }}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {isLogin ? (
                <>Don't have an account? <span className="text-primary font-medium">Sign up</span></>
              ) : (
                <>Already have an account? <span className="text-primary font-medium">Sign in</span></>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
