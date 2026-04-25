import { LifeBuoy, MessageSquare, Mail, Phone } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";

const Support = () => (
  <div>
    <PageHeader title="Support" subtitle="Get help from our team or find answers in the knowledge base." />
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {[
        { icon: MessageSquare, title: "Live Chat", desc: "Avg response 2 min" },
        { icon: Mail, title: "Email Support", desc: "support@zzlogistics.com" },
        { icon: Phone, title: "Phone Support", desc: "+234 800 000 0000" },
      ].map((c) => (
        <div key={c.title} className="bg-surface rounded-xl p-5 border border-border">
          <div className="h-10 w-10 rounded-lg bg-accent/15 text-accent flex items-center justify-center mb-3">
            <c.icon className="h-5 w-5" />
          </div>
          <h3 className="font-semibold">{c.title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{c.desc}</p>
          <Button variant="outline" size="sm" className="mt-3">Contact</Button>
        </div>
      ))}
    </div>
    <div className="bg-surface rounded-xl p-5 border border-border">
      <div className="flex items-center gap-2 mb-4">
        <LifeBuoy className="h-5 w-5 text-accent" />
        <h3 className="font-semibold">Frequently Asked Questions</h3>
      </div>
      <div className="space-y-3 text-sm">
        {["How do I add a new driver?", "How do I export a payment report?", "How do I track a trip in real time?"].map((q) => (
          <details key={q} className="border border-border rounded-lg p-3">
            <summary className="cursor-pointer font-medium">{q}</summary>
            <p className="text-muted-foreground mt-2">Find detailed instructions in the corresponding section of your admin panel.</p>
          </details>
        ))}
      </div>
    </div>
  </div>
);

export default Support;