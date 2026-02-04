import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Gift,
  Users,
  Copy,
  Check,
  Share2,
  TrendingUp,
  Award,
  Sparkles,
  Wallet,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { PageMeta } from "@/components/seo/PageMeta";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCurrency } from "@/hooks/useCurrency";
import { useNavigate } from "react-router-dom";
import { logDatabaseError, createLogger } from "@/lib/errorLogger";

const logger = createLogger("Referrals");

interface ReferralStats {
  totalReferrals: number;
  qualifiedReferrals: number;
  pendingRewards: number;
  claimedRewards: number;
  totalEarnings: number;
}

interface Referral {
  id: string;
  referred_id: string;
  status: string;
  qualification_type: string;
  reward_amount: number;
  created_at: string;
}

interface Reward {
  id: string;
  reward_type: string;
  amount: number;
  description: string | null;
  status: string;
  expires_at: string | null;
  created_at: string;
}

const rewardTiers = [
  {
    level: 1,
    referrals: 5,
    reward: "KES 500 Cash Reward",
    icon: Gift,
    color: "from-green-500 to-emerald-500",
  },
  {
    level: 2,
    referrals: 15,
    reward: "Free Beat Download",
    icon: Award,
    color: "from-blue-500 to-cyan-500",
  },
  {
    level: 3,
    referrals: 30,
    reward: "Premium Access (1 Month)",
    icon: Sparkles,
    color: "from-primary to-accent",
  },
  {
    level: 4,
    referrals: 50,
    reward: "KES 2,500 + Exclusive Beat",
    icon: TrendingUp,
    color: "from-amber-500 to-orange-500",
  },
];

export default function Referrals() {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ReferralStats>({
    totalReferrals: 0,
    qualifiedReferrals: 0,
    pendingRewards: 0,
    claimedRewards: 0,
    totalEarnings: 0,
  });
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);

  useEffect(() => {
    if (user) {
      fetchReferralData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchReferralData = async () => {
    if (!user) return;

    try {
      // Fetch or create referral code
      let { data: codeData } = await supabase
        .from("referral_codes")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!codeData) {
        // Create a new referral code
        const code = `WGME-${user.id.slice(0, 6).toUpperCase()}`;
        const { data: newCode, error } = await supabase
          .from("referral_codes")
          .insert({ user_id: user.id, code })
          .select()
          .single();
        
        if (!error && newCode) {
          codeData = newCode;
        }
      }

      if (codeData) {
        setReferralCode(codeData.code);
      }

      // Fetch referrals
      const { data: referralsData } = await supabase
        .from("referrals")
        .select("*")
        .eq("referrer_id", user.id)
        .order("created_at", { ascending: false });

      if (referralsData) {
        setReferrals(referralsData);
        setStats((prev) => ({
          ...prev,
          totalReferrals: referralsData.length,
          qualifiedReferrals: referralsData.filter((r) => r.status === "qualified" || r.status === "rewarded").length,
          totalEarnings: referralsData
            .filter((r) => r.status === "rewarded")
            .reduce((sum, r) => sum + Number(r.reward_amount), 0),
        }));
      }

      // Fetch rewards
      const { data: rewardsData } = await supabase
        .from("referral_rewards")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (rewardsData) {
        setRewards(rewardsData);
        setStats((prev) => ({
          ...prev,
          pendingRewards: rewardsData.filter((r) => r.status === "pending").length,
          claimedRewards: rewardsData.filter((r) => r.status === "claimed").length,
        }));
      }
    } catch (error) {
      logger.error(error, "fetchReferralData");
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    if (referralCode) {
      const link = `${window.location.origin}/auth?ref=${referralCode}`;
      navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success("Referral link copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareReferralLink = () => {
    if (referralCode && navigator.share) {
      navigator.share({
        title: "Join WE Global Music Empire",
        text: "Sign up using my referral link and we both earn rewards!",
        url: `${window.location.origin}/auth?ref=${referralCode}`,
      });
    } else {
      copyReferralLink();
    }
  };

  const currentTier = rewardTiers.findIndex(
    (tier) => stats.qualifiedReferrals < tier.referrals
  );
  const nextTier = rewardTiers[currentTier] || rewardTiers[rewardTiers.length - 1];
  const progress =
    currentTier > 0
      ? ((stats.qualifiedReferrals - rewardTiers[currentTier - 1].referrals) /
          (nextTier.referrals - rewardTiers[currentTier - 1].referrals)) *
        100
      : (stats.qualifiedReferrals / nextTier.referrals) * 100;

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <Gift className="w-16 h-16 text-primary mx-auto mb-4" />
              <h1 className="font-display text-3xl font-bold mb-4">
                Join Our Referral Program
              </h1>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Sign up to get your unique referral code and start earning rewards
                for every friend you bring to WE Global Music Empire.
              </p>
              <Button variant="hero" onClick={() => navigate("/auth")}>
                Sign Up Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PageMeta
        title="Referral Program"
        description="Earn rewards by inviting friends to WE Global Music Empire. Get cash bonuses, free beats, and premium access."
        path="/referrals"
      />
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Gift className="w-3 h-3 mr-1" />
              Earn While You Share
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Referral <span className="gradient-text">Program</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Invite friends to join WE Global Music Empire and earn rewards for every
              successful referral. The more you share, the more you earn!
            </p>
          </motion.div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Referral Code Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="max-w-2xl mx-auto mb-12"
              >
                <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
                  <CardHeader className="text-center">
                    <CardTitle className="font-display text-xl">
                      Your Referral Link
                    </CardTitle>
                    <CardDescription>
                      Share this link with friends to earn rewards
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Input
                        readOnly
                        value={`${window.location.origin}/auth?ref=${referralCode || ""}`}
                        className="font-mono text-sm bg-background"
                      />
                      <Button
                        variant="outline"
                        onClick={copyReferralLink}
                        className="shrink-0"
                      >
                        {copied ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                      <Button variant="hero" onClick={shareReferralLink}>
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
                      <Badge variant="outline">Code: {referralCode}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Stats Grid */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
              >
                {[
                  {
                    label: "Total Referrals",
                    value: stats.totalReferrals,
                    icon: Users,
                    color: "text-blue-500",
                  },
                  {
                    label: "Qualified",
                    value: stats.qualifiedReferrals,
                    icon: Check,
                    color: "text-green-500",
                  },
                  {
                    label: "Pending Rewards",
                    value: stats.pendingRewards,
                    icon: Gift,
                    color: "text-amber-500",
                  },
                  {
                    label: "Total Earned",
                    value: formatPrice(stats.totalEarnings),
                    icon: Wallet,
                    color: "text-primary",
                  },
                ].map((stat, index) => (
                  <Card key={stat.label}>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-xl bg-secondary flex items-center justify-center ${stat.color}`}
                        >
                          <stat.icon className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {stat.label}
                          </p>
                          <p className="font-display font-bold text-2xl">
                            {stat.value}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </motion.div>

              {/* Reward Tiers */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-12"
              >
                <h2 className="font-display text-2xl font-bold mb-6 text-center">
                  Reward Milestones
                </h2>

                {/* Progress Bar */}
                <div className="max-w-2xl mx-auto mb-8">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">
                      {stats.qualifiedReferrals} referrals
                    </span>
                    <span className="font-medium">
                      Next: {nextTier.referrals} referrals
                    </span>
                  </div>
                  <Progress value={Math.min(progress, 100)} className="h-3" />
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {rewardTiers.map((tier, index) => {
                    const Icon = tier.icon;
                    const isUnlocked = stats.qualifiedReferrals >= tier.referrals;
                    const isCurrent =
                      index === currentTier ||
                      (currentTier === -1 && index === rewardTiers.length - 1);

                    return (
                      <Card
                        key={tier.level}
                        className={`relative overflow-hidden transition-all ${
                          isUnlocked
                            ? "border-primary/50 bg-primary/5"
                            : isCurrent
                            ? "border-primary/30"
                            : "opacity-60"
                        }`}
                      >
                        {isUnlocked && (
                          <div className="absolute top-2 right-2">
                            <Badge className="bg-green-500 text-white">
                              <Check className="w-3 h-3 mr-1" />
                              Unlocked
                            </Badge>
                          </div>
                        )}
                        <CardContent className="pt-6">
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br ${tier.color}`}
                          >
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <h3 className="font-display font-semibold mb-1">
                            Level {tier.level}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {tier.referrals} Referrals
                          </p>
                          <p className="font-medium text-primary">
                            {tier.reward}
                          </p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </motion.div>

              {/* Recent Referrals */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="font-display text-2xl font-bold mb-6">
                  Recent Referrals
                </h2>

                {referrals.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">No referrals yet</h3>
                      <p className="text-muted-foreground text-sm mb-4">
                        Share your referral link to start earning rewards!
                      </p>
                      <Button variant="hero" onClick={shareReferralLink}>
                        <Share2 className="w-4 h-4 mr-2" />
                        Share Now
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {referrals.slice(0, 10).map((referral) => (
                      <Card key={referral.id}>
                        <CardContent className="py-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                              <Users className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-medium">New Referral</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(referral.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge
                              variant={
                                referral.status === "rewarded"
                                  ? "default"
                                  : referral.status === "qualified"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {referral.status}
                            </Badge>
                            {referral.reward_amount > 0 && (
                              <p className="text-sm font-medium text-primary mt-1">
                                +{formatPrice(referral.reward_amount)}
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </motion.div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
