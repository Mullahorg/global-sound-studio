import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  RefreshCw,
  Music
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Order {
  id: string;
  order_number: string;
  user_id: string;
  beat_id: string | null;
  license_type: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string | null;
  download_url: string | null;
  created_at: string;
  beat?: {
    title: string;
    genre: string;
  } | null;
  profile?: {
    full_name: string | null;
    email: string | null;
  } | null;
}

export const OrdersPanel = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel("orders-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => fetchOrders()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOrders = async () => {
    // Fetch orders with beat info
    const { data: ordersData, error } = await supabase
      .from("orders")
      .select(`
        *,
        beat:beats(title, genre)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      // Fallback without joins if relationship doesn't exist
      const { data: ordersOnly } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      setOrders((ordersOnly as Order[]) || []);
    } else {
      setOrders((ordersData as Order[]) || []);
    }
    setLoading(false);
  };

  const handleUpdateStatus = async (orderId: string, status: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Order status updated" });
      fetchOrders();
      setSelectedOrder(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      completed: "bg-green-500/10 text-green-500 border-green-500/20",
      pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      processing: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      failed: "bg-destructive/10 text-destructive border-destructive/20",
      cancelled: "bg-muted text-muted-foreground",
      refunded: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    };
    
    const icons: Record<string, React.ReactNode> = {
      completed: <CheckCircle className="w-3 h-3 mr-1" />,
      pending: <Clock className="w-3 h-3 mr-1" />,
      processing: <RefreshCw className="w-3 h-3 mr-1 animate-spin" />,
      failed: <XCircle className="w-3 h-3 mr-1" />,
    };

    return (
      <Badge className={styles[status] || "bg-secondary"}>
        {icons[status]}
        {status}
      </Badge>
    );
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.beat?.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = orders
    .filter((o) => o.status === "completed")
    .reduce((acc, o) => acc + o.amount, 0);

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
          <h2 className="font-display text-2xl font-semibold">Order Management</h2>
          <p className="text-muted-foreground">Track beat purchases and license orders</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-card border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <p className="text-xl font-bold">{orders.length}</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-xl font-bold text-green-500">
                {orders.filter(o => o.status === "completed").length}
              </p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-xl font-bold text-amber-500">
                {orders.filter(o => o.status === "pending").length}
              </p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Music className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Revenue</p>
              <p className="text-xl font-bold">KES {totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by order number or beat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border/50 overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50">
              <TableHead>Order</TableHead>
              <TableHead>Beat</TableHead>
              <TableHead>License</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No orders found
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-sm">{order.order_number}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{order.beat?.title || "Unknown"}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {order.beat?.genre?.replace("_", " ") || "-"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">{order.license_type}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {order.currency} {order.amount.toLocaleString()}
                  </TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(order.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(order)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Order Number</p>
                  <p className="font-mono">{selectedOrder.order_number}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-bold">{selectedOrder.currency} {selectedOrder.amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">License</p>
                  <p className="capitalize">{selectedOrder.license_type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Method</p>
                  <p className="capitalize">{selectedOrder.payment_method || "M-Pesa"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p>{format(new Date(selectedOrder.created_at), "PPpp")}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-2">Update Status</p>
                <div className="flex gap-2 flex-wrap">
                  {["pending", "processing", "completed", "failed", "refunded"].map((status) => (
                    <Button
                      key={status}
                      variant={selectedOrder.status === status ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleUpdateStatus(selectedOrder.id, status)}
                      className="capitalize"
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};
