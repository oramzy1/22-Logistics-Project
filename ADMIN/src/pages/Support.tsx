// admin/src/pages/Support.tsx
import { useEffect, useState, useRef } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Ticket, MessageSquare, CheckCircle, Clock, Search, Send, X, Hourglass } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api"; // your axios instance
import { socket } from "@/lib/socket"; // your socket instance
import { format } from "date-fns";

const PRIORITY_COLORS = {
  HIGH: "bg-red-100 text-red-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  LOW: "bg-green-100 text-green-700",
};

const STATUS_COLORS = {
  OPEN: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-orange-100 text-orange-700",
  RESOLVED: "bg-green-100 text-green-700",
  CLOSED: "bg-gray-100 text-gray-600",
};

const CATEGORY_ICONS: Record<string, string> = {
  PAYMENT: "💳", DRIVER: "🚗", TRIP: "📍", ACCOUNT: "👤", OTHER: "📋",
};

export default function Support() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [stats, setStats] = useState({ open: 0, inProgress: 0, resolvedToday: 0, avgResponseTime: "—" });
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [reply, setReply] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
  socket.on("support:new_message", (message: any) => {
    // message comes directly (not wrapped in { ticketId, message })
    // guard against both shapes from backend
    const msg = message?.message ?? message;
    const ticketId = message?.ticketId ?? msg?.ticketId;

    setMessages((prev) => {
      // Avoid duplicates if both REST and socket deliver it
      if (prev.find((m) => m.id === msg.id)) return prev;
      return [...prev, msg];
    });

    // Update ticket list preview
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? { ...t, messages: [msg], updatedAt: new Date().toISOString() }
          : t
      )
    );
  });

  socket.on("support:ticket_updated", (updated: any) => {
    setTickets((prev) => prev.map((t) => t.id === updated.id ? { ...t, ...updated } : t));
    setSelectedTicket((prev: any) => prev?.id === updated.id ? { ...prev, ...updated } : prev);
  });

  socket.on("support:new_ticket", (ticket: any) => {
    setTickets((prev) => [ticket, ...prev]);
  });

  return () => {
    socket.off("support:new_message");
    socket.off("support:ticket_updated");
    socket.off("support:new_ticket");
  };
}, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
  fetchStats();
  fetchTickets();
}, []);
  
const fetchStats = async () => {
  try {
    const data = await api.get<typeof stats>("/support/stats");
    setStats(data ?? { open: 0, inProgress: 0, resolvedToday: 0, avgResponseTime: "—" });
  } catch (err) {
    console.error("fetchStats failed:", err);
  }
};

const fetchTickets = async () => {
  const params: Record<string, string> = {};
  if (statusFilter !== "ALL") params.status = statusFilter;
  if (categoryFilter !== "ALL") params.category = categoryFilter;
  if (search) params.search = search;
  const data = await api.get<any[]>("/support/tickets", params);
  setTickets(data ?? []);
};

  useEffect(() => { fetchTickets(); }, [statusFilter, categoryFilter, search]);


const openTicket = async (ticket: any) => {
  if (selectedTicket) socket.emit("support:leave_ticket", selectedTicket.id);
  const data = await api.get<any>(`/support/tickets/${ticket.id}`);
  setSelectedTicket(data);
  setMessages(data.messages ?? []);
  socket.emit("support:join_ticket", data.id);
};

const handleSend = async () => {
  if (!reply.trim() || !selectedTicket) return;
  setSending(true);
  const body = reply;
  try {
    const data = await api.post<any>(`/support/tickets/${selectedTicket.id}/messages`, { body });
     if (!socket.connected) {
      const msg = data.message ?? data;
      setMessages((prev) =>
        prev.find((m) => m.id === msg.id) ? prev : [...prev, msg]
      );
      setReply("");
    }
  } catch{
    // setReply(body);
  } finally {
    setSending(false);
  }
};

  const handleStatusChange = async (status: string) => {
    await api.patch(`/support/tickets/${selectedTicket.id}`, { status });
    setSelectedTicket((prev: any) => ({ ...prev, status }));
  };

  const handlePriorityChange = async (priority: string) => {
    await api.patch(`/support/tickets/${selectedTicket.id}`, { priority });
    setSelectedTicket((prev: any) => ({ ...prev, priority }));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <div className="px-6 pt-6 pb-4 shrink-0">
        <PageHeader title="Support" subtitle="Track and respond to user support tickets." />

        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Open Tickets", value: stats.open, icon: Ticket, color: "text-blue-500" },
            { label: "In Progress", value: stats.inProgress, icon: Hourglass, color: "text-orange-500" },
            { label: "Resolved Today", value: stats.resolvedToday, icon: CheckCircle, color: "text-green-500" },
            { label: "Avg Response Time", value: stats.avgResponseTime, icon: Clock, color: "text-yellow-500" },
          ].map((s) => (
            <div key={s.label} className="bg-surface border border-border rounded-xl p-4">
              <s.icon className={cn("h-5 w-5 mb-2", s.color)} />
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Panel */}
      <div className="flex flex-1 gap-0 min-h-0 px-6 pb-6">
        {/* Ticket List */}
        <div className={cn(
          "flex flex-col border border-border rounded-l-xl bg-surface overflow-hidden",
          selectedTicket ? "w-[340px] shrink-0" : "flex-1"
        )}>
          {/* Search & Filters */}
          <div className="p-3 border-b border-border space-y-2 shrink-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-8 h-9 text-sm"
                placeholder="Search user or ticket ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 text-xs flex-1">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {["ALL", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-8 text-xs flex-1">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {["ALL", "PAYMENT", "DRIVER", "TRIP", "ACCOUNT", "OTHER"].map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Ticket Rows */}
          <div className="overflow-y-auto flex-1">
            {tickets.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm gap-2">
                <Ticket className="h-8 w-8 opacity-30" />
                <p>No tickets found</p>
              </div>
            )}
            {tickets.map((ticket) => (
              <button
                key={ticket.id}
                onClick={() => openTicket(ticket)}
                className={cn(
                  "w-full text-left px-4 py-3 border-b border-border hover:bg-muted/50 transition-colors",
                  selectedTicket?.id === ticket.id && "bg-accent/10 border-l-2 border-l-accent"
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar className="h-7 w-7 shrink-0">
                      <AvatarImage src={ticket.user?.avatarUrl} />
                      <AvatarFallback className="text-xs">{ticket.user?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium truncate">{ticket.user?.name}</span>
                  </div>
                  <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium shrink-0", STATUS_COLORS[ticket.status as keyof typeof STATUS_COLORS])}>
                    {ticket.status.replace("_", " ")}
                  </span>
                </div>
                <p className="text-xs font-semibold text-foreground truncate mb-0.5">{ticket.ticketId} · {ticket.subject}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground truncate">
                    {ticket.messages?.[0]?.body?.slice(0, 50)}...
                  </span>
                  <span className={cn("text-xs px-1.5 py-0.5 rounded font-medium ml-2 shrink-0", PRIORITY_COLORS[ticket.priority as keyof typeof PRIORITY_COLORS])}>
                    {CATEGORY_ICONS[ticket.category]} {ticket.priority}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Panel */}
        {selectedTicket && (
          <div className="flex-1 flex flex-col border border-l-0 border-border rounded-r-xl bg-surface overflow-hidden">
            {/* Chat Header */}
            <div className="flex items-start justify-between px-5 py-3 border-b border-border shrink-0">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={selectedTicket.user?.avatarUrl} />
                  <AvatarFallback>{selectedTicket.user?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{selectedTicket.ticketId}</span>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", STATUS_COLORS[selectedTicket.status as keyof typeof STATUS_COLORS])}>
                      {selectedTicket.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedTicket.subject}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right text-xs text-muted-foreground mr-2">
                  <p>User: <span className="font-medium text-foreground">{selectedTicket.user?.name}</span></p>
                  <p>Category: <span className="font-medium">{CATEGORY_ICONS[selectedTicket.category]} {selectedTicket.category}</span></p>
                  <p>Priority: <span className={cn("font-medium", selectedTicket.priority === "HIGH" ? "text-red-600" : "")}>{selectedTicket.priority}</span></p>
                </div>
                {/* Status & Priority Controls */}
                <Select value={selectedTicket.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="h-8 w-32 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].map((s) => (
                      <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedTicket.priority} onValueChange={handlePriorityChange}>
                  <SelectTrigger className="h-8 w-24 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["LOW", "MEDIUM", "HIGH"].map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                  socket.emit("support:leave_ticket", selectedTicket.id);
                  setSelectedTicket(null);
                }}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className={cn("flex gap-2", msg.isAdmin ? "flex-row-reverse" : "flex-row")}>
                  <Avatar className="h-7 w-7 shrink-0 mt-1">
                    <AvatarImage src={msg.sender?.avatarUrl} />
                    <AvatarFallback className="text-xs">{msg.sender?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className={cn(
                    "max-w-[70%] rounded-2xl px-4 py-2.5 text-sm",
                    msg.isAdmin
                      ? "bg-accent text-accent-foreground rounded-tr-sm"
                      : "bg-muted text-foreground rounded-tl-sm"
                  )}>
                    <p>{msg.body}</p>
                    <p className={cn("text-xs mt-1 opacity-60", msg.isAdmin ? "text-right" : "text-left")}>
                      {format(new Date(msg.createdAt), "MMM d, h:mm a")}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply Box */}
            {selectedTicket.status !== "CLOSED" && (
              <div className="px-4 py-3 border-t border-border shrink-0">
                <div className="flex gap-2 items-end">
                  <textarea
                  key={sending ? "sending" : "idle"}
                    className="flex-1 resize-none text-sm border border-border rounded-xl px-3 py-2 min-h-[40px] max-h-[120px] bg-background focus:outline-none focus:ring-1 focus:ring-accent"
                    placeholder="Type a reply..."
                    rows={1}
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
                    }}
                  />
                  <Button size="sm" onClick={handleSend} disabled={sending || !reply.trim()} className="h-9 px-4">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}