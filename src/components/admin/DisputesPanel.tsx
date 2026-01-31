import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  AlertTriangle,
  MessageSquare,
  CheckCircle2,
  Clock,
  XCircle,
  Filter,
  Search,
  Eye,
  ChevronDown,
  FileText,
  User,
  Calendar,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Dispute {
  id: string;
  conversation_id: string | null;
  order_id: string | null;
  booking_id: string | null;
  reporter_id: string;
  reported_user_id: string | null;
  dispute_type: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  resolution: string | null;
  admin_notes: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  reporter?: { full_name: string | null; email: string | null };
  reported_user?: { full_name: string | null; email: string | null };
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<any> }> = {
  open: { label: "Open", color: "bg-amber-500/10 text-amber-500 border-amber-500/20", icon: AlertTriangle },
  in_progress: { label: "In Progress", color: "bg-primary/10 text-primary border-primary/20", icon: Clock },
  resolved: { label: "Resolved", color: "bg-green-500/10 text-green-500 border-green-500/20", icon: CheckCircle2 },
  closed: { label: "Closed", color: "bg-muted text-muted-foreground border-border", icon: XCircle },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: "Low", color: "bg-muted text-muted-foreground" },
  medium: { label: "Medium", color: "bg-amber-500/10 text-amber-500" },
  high: { label: "High", color: "bg-orange-500/10 text-orange-500" },
  urgent: { label: "Urgent", color: "bg-destructive/10 text-destructive" },
};

export const DisputesPanel = () => {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [resolution, setResolution] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [updating, setUpdating] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchDisputes();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel("disputes-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "disputes" },
        () => fetchDisputes()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchDisputes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("disputes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error fetching disputes", description: error.message, variant: "destructive" });
    } else {
      // Fetch reporter and reported user profiles
      const enrichedDisputes = await Promise.all(
        (data || []).map(async (dispute) => {
          const [reporterRes, reportedRes] = await Promise.all([
            supabase.from("profiles").select("full_name, email").eq("id", dispute.reporter_id).single(),
            dispute.reported_user_id
              ? supabase.from("profiles").select("full_name, email").eq("id", dispute.reported_user_id).single()
              : Promise.resolve({ data: null }),
          ]);
          return {
            ...dispute,
            reporter: reporterRes.data,
            reported_user: reportedRes.data,
          };
        })
      );
      setDisputes(enrichedDisputes);
    }
    setLoading(false);
  };

  const handleUpdateDispute = async (disputeId: string, updates: Partial<Dispute>) => {
    setUpdating(true);
    const { error } = await supabase
      .from("disputes")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
        ...(updates.status === "resolved" && {
          resolved_by: user?.id,
          resolved_at: new Date().toISOString(),
        }),
      })
      .eq("id", disputeId);

    if (error) {
      toast({ title: "Error updating dispute", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Dispute updated successfully" });
      fetchDisputes();
      if (selectedDispute?.id === disputeId) {
        setSelectedDispute(null);
      }
    }
    setUpdating(false);
  };

  const filteredDisputes = disputes.filter((dispute) => {
    const matchesSearch =
      dispute.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dispute.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dispute.reporter?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dispute.reporter?.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || dispute.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || dispute.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const stats = {
    total: disputes.length,
    open: disputes.filter((d) => d.status === "open").length,
    inProgress: disputes.filter((d) => d.status === "in_progress").length,
    resolved: disputes.filter((d) => d.status === "resolved").length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-card border border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.open}</p>
              <p className="text-sm text-muted-foreground">Open</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.inProgress}</p>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.resolved}</p>
              <p className="text-sm text-muted-foreground">Resolved</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search disputes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Disputes List */}
      <div className="rounded-xl border border-border/50 overflow-hidden">
        <ScrollArea className="h-[500px]">
          {loading ? (
            <div className="p-4 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-lg" />
              ))}
            </div>
          ) : filteredDisputes.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No disputes found</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              <AnimatePresence mode="popLayout">
                {filteredDisputes.map((dispute) => {
                  const StatusIcon = statusConfig[dispute.status]?.icon || AlertTriangle;
                  return (
                    <motion.div
                      key={dispute.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="p-4 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={priorityConfig[dispute.priority]?.color}>
                              {priorityConfig[dispute.priority]?.label}
                            </Badge>
                            <Badge variant="outline" className={statusConfig[dispute.status]?.color}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusConfig[dispute.status]?.label}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                              {dispute.dispute_type.replace("_", " ")}
                            </Badge>
                          </div>
                          <h4 className="font-medium text-foreground truncate">{dispute.subject}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {dispute.description}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {dispute.reporter?.full_name || dispute.reporter?.email || "Unknown"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(dispute.created_at), "MMM d, yyyy h:mm a")}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedDispute(dispute);
                              setResolution(dispute.resolution || "");
                              setAdminNotes(dispute.admin_notes || "");
                            }}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                Status
                                <ChevronDown className="w-4 h-4 ml-1" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleUpdateDispute(dispute.id, { status: "open" })}>
                                Open
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateDispute(dispute.id, { status: "in_progress" })}>
                                In Progress
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateDispute(dispute.id, { status: "resolved" })}>
                                Resolved
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateDispute(dispute.id, { status: "closed" })}>
                                Closed
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Dispute Detail Dialog */}
      <Dialog open={!!selectedDispute} onOpenChange={(open) => !open && setSelectedDispute(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Dispute Details</DialogTitle>
          </DialogHeader>
          {selectedDispute && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Reporter</p>
                  <p className="font-medium">
                    {selectedDispute.reporter?.full_name || selectedDispute.reporter?.email || "Unknown"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Reported User</p>
                  <p className="font-medium">
                    {selectedDispute.reported_user?.full_name || selectedDispute.reported_user?.email || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-medium capitalize">{selectedDispute.dispute_type.replace("_", " ")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-medium">
                    {format(new Date(selectedDispute.created_at), "MMM d, yyyy h:mm a")}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Subject</p>
                <p className="font-medium">{selectedDispute.subject}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Description</p>
                <p className="text-foreground whitespace-pre-wrap">{selectedDispute.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Status</label>
                  <Select
                    value={selectedDispute.status}
                    onValueChange={(value) =>
                      setSelectedDispute({ ...selectedDispute, status: value })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Priority</label>
                  <Select
                    value={selectedDispute.priority}
                    onValueChange={(value) =>
                      setSelectedDispute({ ...selectedDispute, priority: value })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Resolution</label>
                <Textarea
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="Enter resolution details..."
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Admin Notes</label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Internal notes (not visible to users)..."
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setSelectedDispute(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={() =>
                    handleUpdateDispute(selectedDispute.id, {
                      status: selectedDispute.status,
                      priority: selectedDispute.priority,
                      resolution,
                      admin_notes: adminNotes,
                    })
                  }
                  disabled={updating}
                >
                  {updating ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
