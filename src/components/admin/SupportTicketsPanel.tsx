import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Ticket, 
  RefreshCw, 
  Search, 
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  User,
  Mail,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { logDatabaseError } from "@/lib/errorLogger";

interface SupportTicket {
  id: string;
  name: string;
  email: string;
  category: string;
  order_id: string | null;
  subject: string | null;
  message: string;
  status: string;
  priority: string;
  admin_notes: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export const SupportTicketsPanel = () => {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        logDatabaseError(error, "support_tickets", "select");
        throw error;
      }
      setTickets(data || []);
    } catch (error) {
      toast({ title: "Error loading tickets", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTicket = async (ticketId: string, updates: Partial<SupportTicket>) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("support_tickets")
        .update(updates)
        .eq("id", ticketId);

      if (error) {
        logDatabaseError(error, "support_tickets", "update");
        throw error;
      }

      toast({ title: "Ticket updated" });
      setSelectedTicket(null);
      fetchTickets();
    } catch (error) {
      toast({ title: "Failed to update ticket", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge className="bg-blue-500/10 text-blue-500"><AlertCircle className="w-3 h-3 mr-1" />Open</Badge>;
      case "in_progress":
        return <Badge className="bg-amber-500/10 text-amber-500"><Clock className="w-3 h-3 mr-1" />In Progress</Badge>;
      case "resolved":
        return <Badge className="bg-green-500/10 text-green-500"><CheckCircle className="w-3 h-3 mr-1" />Resolved</Badge>;
      case "closed":
        return <Badge className="bg-muted text-muted-foreground"><XCircle className="w-3 h-3 mr-1" />Closed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">High</Badge>;
      case "urgent":
        return <Badge className="bg-red-600 text-white">Urgent</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      beats: "Beat Purchases",
      payments: "Payments & Billing",
      bookings: "Studio Bookings",
      account: "Account Issues",
      downloads: "Downloads & Files",
      licensing: "Licensing Questions",
    };
    return labels[category] || category;
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ticket.order_id?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold">Support Tickets</h2>
          <p className="text-muted-foreground">Manage customer support requests</p>
        </div>
        <Button onClick={fetchTickets} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Open", count: tickets.filter(t => t.status === "open").length, color: "text-blue-500" },
          { label: "In Progress", count: tickets.filter(t => t.status === "in_progress").length, color: "text-amber-500" },
          { label: "Resolved", count: tickets.filter(t => t.status === "resolved").length, color: "text-green-500" },
          { label: "Total", count: tickets.length, color: "text-primary" },
        ].map((stat) => (
          <div key={stat.label} className="p-4 rounded-xl bg-card border border-border/50">
            <p className={`font-display text-2xl font-bold ${stat.color}`}>{stat.count}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or order ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {filteredTickets.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Ticket className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No tickets found</p>
          </div>
        ) : (
          filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => {
                setSelectedTicket(ticket);
                setAdminNotes(ticket.admin_notes || "");
              }}
              className="p-4 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {getStatusBadge(ticket.status)}
                    {getPriorityBadge(ticket.priority)}
                    <Badge variant="outline">{getCategoryLabel(ticket.category)}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm mb-1">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{ticket.name}</span>
                    <span className="text-muted-foreground">•</span>
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{ticket.email}</span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{ticket.message}</p>
                </div>
                <div className="text-right text-xs text-muted-foreground whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(ticket.created_at), "MMM d, yyyy")}
                  </div>
                  <div className="mt-1">
                    {format(new Date(ticket.created_at), "h:mm a")}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Ticket Detail Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Support Ticket
            </DialogTitle>
          </DialogHeader>
          
          {selectedTicket && (
            <div className="space-y-6 mt-4">
              {/* Customer Info */}
              <div className="p-4 rounded-lg bg-secondary/50">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{selectedTicket.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedTicket.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <p className="font-medium">{getCategoryLabel(selectedTicket.category)}</p>
                  </div>
                  {selectedTicket.order_id && (
                    <div>
                      <p className="text-sm text-muted-foreground">Order/Booking ID</p>
                      <p className="font-medium">{selectedTicket.order_id}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Message */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Message</p>
                <p className="p-4 rounded-lg bg-card border border-border/50 whitespace-pre-wrap">
                  {selectedTicket.message}
                </p>
              </div>

              {/* Status & Priority */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Status</p>
                  <Select
                    value={selectedTicket.status}
                    onValueChange={(value) => handleUpdateTicket(selectedTicket.id, { status: value })}
                  >
                    <SelectTrigger>
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
                  <p className="text-sm text-muted-foreground mb-2">Priority</p>
                  <Select
                    value={selectedTicket.priority}
                    onValueChange={(value) => handleUpdateTicket(selectedTicket.id, { priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Admin Notes</p>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add internal notes about this ticket..."
                  rows={4}
                />
                <Button
                  onClick={() => handleUpdateTicket(selectedTicket.id, { admin_notes: adminNotes })}
                  disabled={saving}
                  className="mt-2"
                  size="sm"
                >
                  {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Save Notes
                </Button>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-border/50">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => window.open(`mailto:${selectedTicket.email}`, '_blank')}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Reply via Email
                </Button>
                {selectedTicket.status !== "resolved" && (
                  <Button
                    className="flex-1"
                    onClick={() => handleUpdateTicket(selectedTicket.id, { 
                      status: "resolved",
                      resolved_at: new Date().toISOString()
                    })}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark Resolved
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};
