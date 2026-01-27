import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  Search, 
  Filter, 
  Shield,
  Star,
  UserCheck,
  Crown,
  RefreshCw,
  MoreHorizontal,
  BadgeCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  client_type: string | null;
  badge: string | null;
  country: string | null;
  region: string | null;
  created_at: string;
}

interface UserRole {
  user_id: string;
  role: string;
}

export const UsersPanel = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [roles, setRoles] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [badgeFilter, setBadgeFilter] = useState<string>("all");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    // Fetch profiles
    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (profilesError) {
      toast({ title: "Error", description: profilesError.message, variant: "destructive" });
    } else {
      setUsers(profilesData || []);
    }

    // Fetch roles
    const { data: rolesData } = await supabase
      .from("user_roles")
      .select("user_id, role");

    if (rolesData) {
      const rolesMap: Record<string, string> = {};
      rolesData.forEach((r: UserRole) => {
        rolesMap[r.user_id] = r.role;
      });
      setRoles(rolesMap);
    }

    setLoading(false);
  };

  const handleUpdateRole = async (userId: string, newRole: "admin" | "producer" | "artist") => {
    const existingRole = roles[userId];

    if (existingRole) {
      // Update existing role
      const { error } = await supabase
        .from("user_roles")
        .update({ role: newRole })
        .eq("user_id", userId);

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        return;
      }
    } else {
      // Insert new role
      const { error } = await supabase
        .from("user_roles")
        .insert([{ user_id: userId, role: newRole }]);

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        return;
      }
    }

    setRoles((prev) => ({ ...prev, [userId]: newRole }));
    toast({ title: "Success", description: "User role updated" });
  };

  const handleUpdateBadge = async (userId: string, badge: string | null) => {
    const { error } = await supabase
      .from("profiles")
      .update({ badge })
      .eq("id", userId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, badge } : u))
      );
      toast({ title: "Success", description: "Badge updated" });
    }
  };

  const handleUpdateClientType = async (userId: string, clientType: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ client_type: clientType })
      .eq("id", userId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, client_type: clientType } : u))
      );
      toast({ title: "Success", description: "Client type updated" });
    }
  };

  const getRoleBadge = (role: string | undefined) => {
    switch (role) {
      case "admin":
        return (
          <Badge className="bg-destructive/10 text-destructive border-destructive/20">
            <Shield className="w-3 h-3 mr-1" />
            Admin
          </Badge>
        );
      case "producer":
        return (
          <Badge className="bg-primary/10 text-primary border-primary/20">
            <Star className="w-3 h-3 mr-1" />
            Producer
          </Badge>
        );
      case "artist":
        return (
          <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20">
            <UserCheck className="w-3 h-3 mr-1" />
            Artist
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <Users className="w-3 h-3 mr-1" />
            User
          </Badge>
        );
    }
  };

  const getUserBadge = (badge: string | null) => {
    switch (badge) {
      case "staff":
        return (
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
            <Crown className="w-3 h-3 mr-1" />
            WE Global Staff
          </Badge>
        );
      case "partner":
        return (
          <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
            <BadgeCheck className="w-3 h-3 mr-1" />
            Partner
          </Badge>
        );
      default:
        return null;
    }
  };

  const getCountryFlag = (country: string | null) => {
    const flags: Record<string, string> = {
      kenya: "🇰🇪",
      tanzania: "🇹🇿",
      uganda: "🇺🇬",
      nigeria: "🇳🇬",
      "south africa": "🇿🇦",
      ghana: "🇬🇭",
      ethiopia: "🇪🇹",
      rwanda: "🇷🇼",
    };
    return flags[country?.toLowerCase() || ""] || "🌍";
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || roles[u.id] === roleFilter;
    const matchesBadge = badgeFilter === "all" || u.badge === badgeFilter;
    return matchesSearch && matchesRole && matchesBadge;
  });

  const statsCount = {
    total: users.length,
    staff: users.filter((u) => u.badge === "staff").length,
    partners: users.filter((u) => u.badge === "partner").length,
    clients: users.filter((u) => !u.badge || u.badge === "client").length,
  };

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
          <h2 className="font-display text-2xl font-semibold">User Management</h2>
          <p className="text-muted-foreground">Manage users, roles, and badges</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-card border border-border/50">
          <p className="text-sm text-muted-foreground">Total Users</p>
          <p className="text-2xl font-bold">{statsCount.total}</p>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border/50">
          <p className="text-sm text-muted-foreground">Staff</p>
          <p className="text-2xl font-bold text-amber-500">{statsCount.staff}</p>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border/50">
          <p className="text-sm text-muted-foreground">Partners</p>
          <p className="text-2xl font-bold text-blue-500">{statsCount.partners}</p>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border/50">
          <p className="text-sm text-muted-foreground">Full Clients</p>
          <p className="text-2xl font-bold text-green-500">{statsCount.clients}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-36">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="producer">Producer</SelectItem>
            <SelectItem value="artist">Artist</SelectItem>
          </SelectContent>
        </Select>
        <Select value={badgeFilter} onValueChange={setBadgeFilter}>
          <SelectTrigger className="w-36">
            <BadgeCheck className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Badge" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Badges</SelectItem>
            <SelectItem value="staff">Staff</SelectItem>
            <SelectItem value="partner">Partner</SelectItem>
            <SelectItem value="client">Client</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border/50 overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50">
              <TableHead>User</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Badge</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{user.full_name || "Unnamed"}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-lg mr-1">{getCountryFlag(user.country)}</span>
                    <span className="capitalize text-sm">{user.country || "Unknown"}</span>
                  </TableCell>
                  <TableCell>{getRoleBadge(roles[user.id])}</TableCell>
                  <TableCell>{getUserBadge(user.badge) || <span className="text-muted-foreground">-</span>}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(user.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Manage User</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="text-xs text-muted-foreground">Set Role</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleUpdateRole(user.id, "admin")}>
                          <Shield className="w-4 h-4 mr-2 text-destructive" />
                          Make Admin
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateRole(user.id, "producer")}>
                          <Star className="w-4 h-4 mr-2 text-primary" />
                          Make Producer
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateRole(user.id, "artist")}>
                          <UserCheck className="w-4 h-4 mr-2 text-purple-500" />
                          Make Artist
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="text-xs text-muted-foreground">Set Badge</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleUpdateBadge(user.id, "staff")}>
                          <Crown className="w-4 h-4 mr-2 text-amber-500" />
                          WE Global Staff
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateBadge(user.id, "partner")}>
                          <BadgeCheck className="w-4 h-4 mr-2 text-blue-500" />
                          Partner
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateBadge(user.id, null)}>
                          <Users className="w-4 h-4 mr-2" />
                          Full Client (No Badge)
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
};
