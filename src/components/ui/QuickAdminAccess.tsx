import { useState } from "react";
import { Settings, X, Users, MessageSquare, BarChart3, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export const QuickAdminAccess = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const checkAdmin = async () => {
    if (!user) return false;
    
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    
    return profile?.role === 'admin';
  };

  // Check admin status on mount
  useState(() => {
    checkAdmin().then(setIsAdmin);
  });

  if (!isAdmin) return null;

  const quickActions = [
    { label: "Dashboard", icon: Settings, path: "/admin" },
    { label: "Users", icon: Users, path: "/admin?tab=users" },
    { label: "Chat Monitor", icon: MessageSquare, path: "/admin?tab=chat-monitor" },
    { label: "Analytics", icon: BarChart3, path: "/admin?tab=analytics" },
    { label: "Disputes", icon: Shield, path: "/admin?tab=disputes" },
  ];

  return (
    <>
      {/* Floating Admin Button */}
      <Button
        size="icon"
        className="fixed bottom-6 right-6 z-50 rounded-full w-12 h-12 shadow-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        onClick={() => setIsOpen(true)}
        title="Quick Admin Access"
      >
        <Settings className="w-5 h-5" />
      </Button>

      {/* Quick Admin Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-600" />
                Quick Admin Access
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="rounded-full"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-3">
              {quickActions.map((action) => (
                <Button
                  key={action.label}
                  variant="outline"
                  className="w-full justify-start h-12"
                  onClick={() => {
                    navigate(action.path);
                    setIsOpen(false);
                  }}
                >
                  <action.icon className="w-4 h-4 mr-3" />
                  {action.label}
                </Button>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Admin: {user?.email}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
