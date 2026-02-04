import { useState, useEffect } from "react";
import { Search, Users, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { logDatabaseError, createLogger } from "@/lib/errorLogger";

const logger = createLogger("NewChatDialog");

interface User {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role?: string;
}

interface NewChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateChat: (participantIds: string[], title?: string) => Promise<any>;
}

export const NewChatDialog = ({
  open,
  onOpenChange,
  onCreateChat,
}: NewChatDialogProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch all profiles except current user
      const { data: profiles, error } = await supabase
        .from("public_profiles")
        .select("id, full_name, avatar_url")
        .neq("id", user?.id || "");

      if (error) {
        logDatabaseError(error, "public_profiles", "select");
        throw error;
      }

      // Fetch user roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) {
        logDatabaseError(rolesError, "user_roles", "select");
      }

      const usersWithRoles = profiles?.map((profile) => ({
        ...profile,
        role: roles?.find((r) => r.user_id === profile.id)?.role || "user",
      })) || [];

      setUsers(usersWithRoles);
    } catch (error) {
      logger.error(error, "fetchUsers");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const name = u.full_name?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    return name.includes(query);
  });

  const toggleUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreate = async () => {
    if (selectedUsers.length === 0) return;
    
    setCreating(true);
    try {
      await onCreateChat(selectedUsers);
      setSelectedUsers([]);
      setSearchQuery("");
      onOpenChange(false);
    } finally {
      setCreating(false);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "producer":
        return "default";
      case "artist":
        return "secondary";
      case "admin":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            New Conversation
          </DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Selected Users */}
        {selectedUsers.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedUsers.map((userId) => {
              const selectedUser = users.find((u) => u.id === userId);
              return (
                <Badge
                  key={userId}
                  variant="secondary"
                  className="pr-1 flex items-center gap-1"
                >
                  {selectedUser?.full_name || "Unknown"}
                  <button
                    onClick={() => toggleUser(userId)}
                    className="ml-1 hover:bg-muted rounded-full p-0.5"
                  >
                    ×
                  </button>
                </Badge>
              );
            })}
          </div>
        )}

        {/* User List */}
        <ScrollArea className="h-[300px] -mx-6 px-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No users found</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredUsers.map((u) => (
                <motion.button
                  key={u.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => toggleUser(u.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left",
                    selectedUsers.includes(u.id)
                      ? "bg-primary/10 border border-primary/20"
                      : "hover:bg-muted/50"
                  )}
                >
                  <Checkbox
                    checked={selectedUsers.includes(u.id)}
                    className="pointer-events-none"
                  />
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={u.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {u.full_name?.charAt(0).toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <span className="font-medium truncate block">
                      {u.full_name || "Unknown User"}
                    </span>
                    <Badge
                      variant={getRoleBadgeVariant(u.role || "user")}
                      className="text-xs capitalize mt-1"
                    >
                      {u.role || "User"}
                    </Badge>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={selectedUsers.length === 0 || creating}
          >
            {creating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>Start Chat ({selectedUsers.length})</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
