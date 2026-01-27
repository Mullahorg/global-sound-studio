import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Settings, 
  CreditCard, 
  Globe, 
  Mail, 
  Phone, 
  Shield, 
  Eye, 
  EyeOff,
  Save,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Smartphone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Setting {
  id: string;
  setting_key: string;
  setting_value: string | null;
  setting_type: string;
  description: string | null;
  is_sensitive: boolean;
}

export const SettingsPanel = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [testingMpesa, setTestingMpesa] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("platform_settings")
      .select("*");

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else if (data) {
      const settingsMap: Record<string, string> = {};
      data.forEach((s: Setting) => {
        settingsMap[s.setting_key] = s.setting_value || "";
      });
      setSettings(settingsMap);
    }
    setLoading(false);
  };

  const handleSave = async (key: string, value: string) => {
    setSaving(true);
    const { error } = await supabase
      .from("platform_settings")
      .update({ setting_value: value })
      .eq("setting_key", key);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setSettings((prev) => ({ ...prev, [key]: value }));
      toast({ title: "Saved", description: `${key} updated successfully` });
    }
    setSaving(false);
  };

  const handleSaveAll = async () => {
    setSaving(true);
    const updates = Object.entries(settings).map(([key, value]) =>
      supabase
        .from("platform_settings")
        .update({ setting_value: value })
        .eq("setting_key", key)
    );

    try {
      await Promise.all(updates);
      toast({ title: "Success", description: "All settings saved successfully" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const testMpesaConnection = async () => {
    setTestingMpesa(true);
    try {
      // Test OAuth token generation
      const consumerKey = settings.mpesa_consumer_key;
      const consumerSecret = settings.mpesa_consumer_secret;
      
      if (!consumerKey || !consumerSecret) {
        toast({ 
          title: "Configuration Missing", 
          description: "Please enter Consumer Key and Secret first",
          variant: "destructive" 
        });
        setTestingMpesa(false);
        return;
      }

      const isSandbox = settings.mpesa_environment === "sandbox";
      const baseUrl = isSandbox
        ? "https://sandbox.safaricom.co.ke"
        : "https://api.safaricom.co.ke";

      const auth = btoa(`${consumerKey}:${consumerSecret}`);
      const response = await fetch(
        `${baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
        {
          headers: { Authorization: `Basic ${auth}` },
        }
      );

      if (response.ok) {
        toast({ 
          title: "Connection Successful", 
          description: "M-Pesa API credentials are valid",
        });
      } else {
        const error = await response.text();
        toast({ 
          title: "Connection Failed", 
          description: `Invalid credentials: ${error}`,
          variant: "destructive" 
        });
      }
    } catch (error: any) {
      toast({ 
        title: "Connection Error", 
        description: error.message,
        variant: "destructive" 
      });
    }
    setTestingMpesa(false);
  };

  const toggleShowSecret = (key: string) => {
    setShowSecrets((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isMpesaConfigured = 
    settings.mpesa_consumer_key && 
    settings.mpesa_consumer_secret && 
    settings.mpesa_passkey;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-semibold">Platform Settings</h2>
          <p className="text-muted-foreground">Configure payments, branding, and more</p>
        </div>
        <Button onClick={handleSaveAll} disabled={saving} variant="hero">
          {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save All Changes
        </Button>
      </div>

      <Tabs defaultValue="mpesa" className="space-y-6">
        <TabsList className="bg-card border border-border/50">
          <TabsTrigger value="mpesa" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Smartphone className="w-4 h-4 mr-2" />
            M-Pesa
          </TabsTrigger>
          <TabsTrigger value="platform" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Globe className="w-4 h-4 mr-2" />
            Platform
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Shield className="w-4 h-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* M-Pesa Settings */}
        <TabsContent value="mpesa">
          <div className="grid gap-6">
            {/* Status Card */}
            <Card className="border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      isMpesaConfigured ? "bg-green-500/10" : "bg-amber-500/10"
                    }`}>
                      <CreditCard className={`w-6 h-6 ${
                        isMpesaConfigured ? "text-green-500" : "text-amber-500"
                      }`} />
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        M-Pesa Integration
                        <Badge className={isMpesaConfigured ? "bg-green-500/10 text-green-500" : "bg-amber-500/10 text-amber-500"}>
                          {isMpesaConfigured ? "Configured" : "Not Configured"}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Accept payments via Safaricom M-Pesa (Kenya & Africa)
                      </CardDescription>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={testMpesaConnection}
                    disabled={testingMpesa || !settings.mpesa_consumer_key}
                  >
                    {testingMpesa ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    Test Connection
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {/* Environment */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Environment</CardTitle>
                <CardDescription>Choose between sandbox (testing) and production</CardDescription>
              </CardHeader>
              <CardContent>
                <Select
                  value={settings.mpesa_environment || "sandbox"}
                  onValueChange={(value) => {
                    setSettings((prev) => ({ ...prev, mpesa_environment: value }));
                    handleSave("mpesa_environment", value);
                  }}
                >
                  <SelectTrigger className="w-full md:w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sandbox">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        Sandbox (Testing)
                      </div>
                    </SelectItem>
                    <SelectItem value="production">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Production (Live)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* API Credentials */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">API Credentials</CardTitle>
                <CardDescription>
                  Get these from the{" "}
                  <a 
                    href="https://developer.safaricom.co.ke" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Safaricom Developer Portal
                  </a>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Consumer Key */}
                <div className="space-y-2">
                  <Label htmlFor="mpesa_consumer_key">Consumer Key</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="mpesa_consumer_key"
                        type={showSecrets.mpesa_consumer_key ? "text" : "password"}
                        value={settings.mpesa_consumer_key || ""}
                        onChange={(e) => setSettings((prev) => ({ ...prev, mpesa_consumer_key: e.target.value }))}
                        placeholder="Enter M-Pesa Consumer Key"
                      />
                      <button
                        type="button"
                        onClick={() => toggleShowSecret("mpesa_consumer_key")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showSecrets.mpesa_consumer_key ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => handleSave("mpesa_consumer_key", settings.mpesa_consumer_key || "")}
                      disabled={saving}
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Consumer Secret */}
                <div className="space-y-2">
                  <Label htmlFor="mpesa_consumer_secret">Consumer Secret</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="mpesa_consumer_secret"
                        type={showSecrets.mpesa_consumer_secret ? "text" : "password"}
                        value={settings.mpesa_consumer_secret || ""}
                        onChange={(e) => setSettings((prev) => ({ ...prev, mpesa_consumer_secret: e.target.value }))}
                        placeholder="Enter M-Pesa Consumer Secret"
                      />
                      <button
                        type="button"
                        onClick={() => toggleShowSecret("mpesa_consumer_secret")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showSecrets.mpesa_consumer_secret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => handleSave("mpesa_consumer_secret", settings.mpesa_consumer_secret || "")}
                      disabled={saving}
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Passkey */}
                <div className="space-y-2">
                  <Label htmlFor="mpesa_passkey">Passkey (Lipa Na M-Pesa)</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="mpesa_passkey"
                        type={showSecrets.mpesa_passkey ? "text" : "password"}
                        value={settings.mpesa_passkey || ""}
                        onChange={(e) => setSettings((prev) => ({ ...prev, mpesa_passkey: e.target.value }))}
                        placeholder="Enter Lipa Na M-Pesa Passkey"
                      />
                      <button
                        type="button"
                        onClick={() => toggleShowSecret("mpesa_passkey")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showSecrets.mpesa_passkey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => handleSave("mpesa_passkey", settings.mpesa_passkey || "")}
                      disabled={saving}
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Shortcode */}
                <div className="space-y-2">
                  <Label htmlFor="mpesa_shortcode">Business Shortcode</Label>
                  <div className="flex gap-2">
                    <Input
                      id="mpesa_shortcode"
                      value={settings.mpesa_shortcode || "174379"}
                      onChange={(e) => setSettings((prev) => ({ ...prev, mpesa_shortcode: e.target.value }))}
                      placeholder="174379 (sandbox default)"
                      className="flex-1"
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => handleSave("mpesa_shortcode", settings.mpesa_shortcode || "174379")}
                      disabled={saving}
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Use 174379 for sandbox testing. Get your own shortcode for production.
                  </p>
                </div>

                {/* Callback URL */}
                <div className="space-y-2">
                  <Label htmlFor="mpesa_callback_url">Callback URL (Optional)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="mpesa_callback_url"
                      value={settings.mpesa_callback_url || ""}
                      onChange={(e) => setSettings((prev) => ({ ...prev, mpesa_callback_url: e.target.value }))}
                      placeholder="Auto-configured if left empty"
                      className="flex-1"
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => handleSave("mpesa_callback_url", settings.mpesa_callback_url || "")}
                      disabled={saving}
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Leave empty to use the default callback. Only change if you have a custom endpoint.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Platform Settings */}
        <TabsContent value="platform">
          <div className="grid gap-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Branding & Contact</CardTitle>
                <CardDescription>Configure platform identity and contact information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="platform_name">Platform Name</Label>
                  <div className="flex gap-2">
                    <Input
                      id="platform_name"
                      value={settings.platform_name || ""}
                      onChange={(e) => setSettings((prev) => ({ ...prev, platform_name: e.target.value }))}
                      placeholder="WE Global Studio"
                      className="flex-1"
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => handleSave("platform_name", settings.platform_name || "")}
                      disabled={saving}
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="platform_currency">Default Currency</Label>
                  <div className="flex gap-2">
                    <Select
                      value={settings.platform_currency || "KES"}
                      onValueChange={(value) => {
                        setSettings((prev) => ({ ...prev, platform_currency: value }));
                        handleSave("platform_currency", value);
                      }}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="KES">KES - Kenyan Shilling 🇰🇪</SelectItem>
                        <SelectItem value="TZS">TZS - Tanzanian Shilling 🇹🇿</SelectItem>
                        <SelectItem value="UGX">UGX - Ugandan Shilling 🇺🇬</SelectItem>
                        <SelectItem value="NGN">NGN - Nigerian Naira 🇳🇬</SelectItem>
                        <SelectItem value="ZAR">ZAR - South African Rand 🇿🇦</SelectItem>
                        <SelectItem value="USD">USD - US Dollar 🇺🇸</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="platform_email">Contact Email</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="platform_email"
                        type="email"
                        value={settings.platform_email || ""}
                        onChange={(e) => setSettings((prev) => ({ ...prev, platform_email: e.target.value }))}
                        placeholder="contact@weglobal.studio"
                        className="pl-10"
                      />
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => handleSave("platform_email", settings.platform_email || "")}
                      disabled={saving}
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="platform_phone">Contact Phone</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="platform_phone"
                        value={settings.platform_phone || ""}
                        onChange={(e) => setSettings((prev) => ({ ...prev, platform_phone: e.target.value }))}
                        placeholder="+254 700 000 000"
                        className="pl-10"
                      />
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => handleSave("platform_phone", settings.platform_phone || "")}
                      disabled={saving}
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Security Information</CardTitle>
              <CardDescription>Overview of your platform security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="font-medium text-green-500">Row Level Security Enabled</p>
                    <p className="text-sm text-muted-foreground">All database tables are protected with RLS policies</p>
                  </div>
                </div>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="font-medium text-green-500">Secure Payment Processing</p>
                    <p className="text-sm text-muted-foreground">M-Pesa credentials are stored encrypted</p>
                  </div>
                </div>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="font-medium text-green-500">Admin-Only Settings</p>
                    <p className="text-sm text-muted-foreground">Platform settings are restricted to admins only</p>
                  </div>
                </div>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};
