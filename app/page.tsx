"use client";

import { useMemo, useRef, useState } from "react";
import {
  Activity, ArrowDownRight, ArrowUpRight, Bell, CalendarClock, Check,
  CheckCircle2, ChevronDown, CircleAlert, Clock3, Download, FileUp,
  Filter, LayoutDashboard, Mail, Menu, MoreHorizontal, Plus, Search,
  ShieldCheck, Sparkles, Wallet, X
} from "lucide-react";

type Invoice = {
  id: string; customer: string; email: string; amount: number;
  dueDate: string; status: "open" | "paid" | "disputed";
  invoice: string; notes?: string; lastFollowUp?: string;
};

const initialInvoices: Invoice[] = [
  { id: "1", customer: "Northstar Studio", email: "ap@northstar.studio", amount: 4850, dueDate: "2026-11-14", status: "open", invoice: "INV-1048", notes: "Monthly design retainer" },
  { id: "2", customer: "Vertex Labs", email: "finance@vertexlabs.io", amount: 12750, dueDate: "2026-11-19", status: "open", invoice: "INV-1047", notes: "Implementation milestone" },
  { id: "3", customer: "Oak & Ivy Co.", email: "accounts@oakivy.co", amount: 2180, dueDate: "2026-11-25", status: "open", invoice: "INV-1046" },
  { id: "4", customer: "Brightpath Media", email: "billing@brightpath.media", amount: 6900, dueDate: "2026-11-08", status: "disputed", invoice: "INV-1043", notes: "Client asked to review line items" },
  { id: "5", customer: "Meridian Works", email: "ap@meridianworks.com", amount: 3400, dueDate: "2026-11-29", status: "open", invoice: "INV-1045" },
  { id: "6", customer: "Atlas Commerce", email: "finance@atlascommerce.co", amount: 8250, dueDate: "2026-10-30", status: "open", invoice: "INV-1039", lastFollowUp: "Reminder sent Nov 10" },
  { id: "7", customer: "Pinecone Systems", email: "payables@pinecone.dev", amount: 1950, dueDate: "2026-10-21", status: "paid", invoice: "INV-1035" },
  { id: "8", customer: "Bluebird Health", email: "billing@bluebird.health", amount: 5600, dueDate: "2026-11-02", status: "open", invoice: "INV-1041" }
];

const money = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
const today = () => new Date().toISOString().slice(0, 10);
const daysLate = (date: string) => Math.max(0, Math.floor((new Date(today() + "T00:00:00").getTime() - new Date(date + "T00:00:00").getTime()) / 86400000));
const classify = (i: Invoice) => i.status === "paid" ? "Paid" : i.status === "disputed" ? "Needs review" : daysLate(i.dueDate) > 0 ? "Overdue" : "Due soon";
const priority = (i: Invoice) => i.status === "disputed" ? "Review" : i.status === "paid" ? "Closed" : daysLate(i.dueDate) >= 7 ? "High" : daysLate(i.dueDate) > 0 ? "Medium" : "Normal";

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"' && text[i + 1] === '"' && quoted) { cell += '"'; i++; }
    else if (c === '"') quoted = !quoted;
    else if (c === "," && !quoted) { row.push(cell.trim()); cell = ""; }
    else if ((c === "\n" || c === "\r") && !quoted) {
      if (cell.length || row.length) { row.push(cell.trim()); rows.push(row); }
      row = []; cell = "";
      if (c === "\r" && text[i + 1] === "\n") i++;
    } else cell += c;
  }
  if (cell.length || row.length) { row.push(cell.trim()); rows.push(row); }
  return rows;
}

export default function Home() {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [filter, setFilter] = useState("All invoices");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Invoice | null>(null);
  const [approved, setApproved] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const active = invoices.filter(i => i.status !== "paid");
  const overdue = active.filter(i => i.status === "open" && daysLate(i.dueDate) > 0);
  const outstanding = active.reduce((s, i) => s + i.amount, 0);
  const overdueValue = overdue.reduce((s, i) => s + i.amount, 0);
  const filtered = useMemo(() => invoices.filter(i => {
    const q = query.toLowerCase();
    const matches = !q || [i.customer, i.invoice, i.email].some(v => v.toLowerCase().includes(q));
    const f = filter === "All invoices" || (filter === "Overdue" && classify(i) === "Overdue") || (filter === "Due soon" && classify(i) === "Due soon") || (filter === "Needs review" && classify(i) === "Needs review") || (filter === "Paid" && classify(i) === "Paid");
    return matches && f;
  }).sort((a,b) => (b.status === "open" ? daysLate(b.dueDate) : -1) - (a.status === "open" ? daysLate(a.dueDate) : -1)), [invoices, filter, query]);

  const draftFor = (i: Invoice) => {
    const late = daysLate(i.dueDate);
    const greeting = i.customer.split(" ")[0];
    return late > 0
      ? `Subject: Friendly follow-up: ${i.invoice}\n\nHi ${greeting} team,\n\nI hope you're doing well. I'm following up on invoice ${i.invoice} for ${money(i.amount)}, which was due on ${new Date(i.dueDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}. Our records show it is still outstanding.\n\nCould you let us know when we can expect payment, or if you need another copy of the invoice?\n\nThank you,\nAccounts Receivable Team`
      : `Subject: Upcoming payment: ${i.invoice}\n\nHi ${greeting} team,\n\nA quick reminder that invoice ${i.invoice} for ${money(i.amount)} is due on ${new Date(i.dueDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}. Please let us know if you need anything from our side.\n\nThank you,\nAccounts Receivable Team`;
  };

  const importFile = async (file?: File) => {
    if (!file) return;
    const rows = parseCSV(await file.text());
    if (rows.length < 2) { setNotice("The CSV appears to be empty."); return; }
    const headers = rows[0].map(h => h.toLowerCase().replace(/[^a-z]/g, ""));
    const index = (...names: string[]) => headers.findIndex(h => names.includes(h));
    const customer = index("customer", "customername", "client");
    const invoice = index("invoice", "invoicenumber", "invoiceno", "number");
    const amount = index("amount", "total", "balance");
    const due = index("duedate", "due");
    const status = index("status", "paymentstatus");
    const email = index("email", "customeremail");
    if ([customer, invoice, amount, due, status].some(n => n < 0)) {
      setNotice("CSV needs customer, invoice, amount, dueDate and status columns."); return;
    }
    const imported: Invoice[] = rows.slice(1).filter(r => r.length > 1).map((r, n) => ({
      id: `csv-${Date.now()}-${n}`, customer: r[customer] || "Unknown customer",
      invoice: r[invoice] || `CSV-${n + 1}`, amount: Number(String(r[amount]).replace(/[$,]/g, "")) || 0,
      dueDate: r[due], status: /paid|settled|closed/i.test(r[status]) ? "paid" : /disput/i.test(r[status]) ? "disputed" : "open",
      email: email >= 0 ? r[email] : "", notes: "Imported from CSV"
    })).filter(i => /^\d{4}-\d{2}-\d{2}$/.test(i.dueDate));
    if (!imported.length) { setNotice("No valid invoice rows found. Use due dates in YYYY-MM-DD format."); return; }
    setInvoices(prev => [...imported, ...prev]);
    setNotice(`Imported ${imported.length} invoices successfully.`);
  };

  const approveDraft = (i: Invoice) => {
    setApproved(prev => prev.includes(i.id) ? prev : [...prev, i.id]);
    setInvoices(prev => prev.map(item => item.id === i.id ? { ...item, lastFollowUp: "Draft approved · ready to send" } : item));
    setSelected(null);
    setNotice("Reminder draft approved. It has not been sent.");
  };

  const exportCSV = () => {
    const lines = [["customer","invoice","amount","dueDate","status","email"], ...invoices.map(i => [i.customer,i.invoice,String(i.amount),i.dueDate,i.status,i.email])];
    const csv = lines.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a"); a.href = url; a.download = "finagent-invoices.csv"; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-[#080d18] text-slate-100">
      <div className="flex min-h-screen">
        <aside className={`fixed inset-y-0 left-0 z-40 flex w-[250px] flex-col border-r border-white/[0.07] bg-[#0b1220] px-5 py-6 transition-transform lg:static lg:translate-x-0 ${mobileNav ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="flex items-center gap-3 px-2">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-400 text-[#06251e]"><Activity size={22} strokeWidth={2.7}/></div>
            <div><div className="text-[17px] font-bold tracking-tight">finagent<span className="text-emerald-400">.ai</span></div><div className="text-[10px] font-semibold uppercase tracking-[.2em] text-slate-500">Finance operations</div></div>
            <button className="ml-auto text-slate-500 lg:hidden" onClick={() => setMobileNav(false)}><X size={19}/></button>
          </div>
          <div className="mt-10 px-3 text-[10px] font-bold uppercase tracking-[.19em] text-slate-600">Workspace</div>
          <nav className="mt-3 space-y-1">
            <a className="flex items-center gap-3 rounded-xl bg-emerald-400/10 px-3 py-3 text-sm font-semibold text-emerald-300"><LayoutDashboard size={17}/> Overview</a>
            <a href="#invoices" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 hover:bg-white/[0.04] hover:text-white"><Wallet size={17}/> Invoices <span className="ml-auto rounded-md bg-white/[0.07] px-2 py-0.5 text-[10px]">{active.length}</span></a>
            <a href="#follow-ups" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 hover:bg-white/[0.04] hover:text-white"><Mail size={17}/> Follow-ups</a>
            <a href="#insights" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 hover:bg-white/[0.04] hover:text-white"><Activity size={17}/> Insights</a>
          </nav>
          <div className="mt-9 px-3 text-[10px] font-bold uppercase tracking-[.19em] text-slate-600">Manage</div>
          <div className="mt-3 flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-500"><ShieldCheck size={17}/> Review & controls</div>
          <div className="mt-auto rounded-2xl border border-emerald-300/15 bg-gradient-to-br from-emerald-400/10 to-cyan-400/[0.03] p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300"><Sparkles size={14}/> Your AR copilot</div>
            <p className="mt-2 text-xs leading-5 text-slate-400">Turn your invoice list into a prioritized, human-reviewed collection plan.</p>
            <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-500"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400"/> Rules engine active</div>
          </div>
          <div className="mt-5 flex items-center gap-3 border-t border-white/[0.07] pt-5">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-slate-700 text-xs font-bold">YO</div>
            <div className="min-w-0"><div className="text-xs font-semibold">Your workspace</div><div className="text-[10px] text-slate-500">Local demo environment</div></div>
            <MoreHorizontal size={17} className="ml-auto text-slate-500"/>
          </div>
        </aside>
        {mobileNav && <button aria-label="Close navigation" onClick={() => setMobileNav(false)} className="fixed inset-0 z-30 bg-black/60 lg:hidden"/>}
        <section className="min-w-0 flex-1">
          <header className="flex h-[76px] items-center justify-between border-b border-white/[0.07] px-5 sm:px-8">
            <div className="flex items-center gap-3"><button onClick={() => setMobileNav(true)} className="text-slate-400 lg:hidden"><Menu size={20}/></button><div><div className="text-sm font-semibold">Receivables overview</div><div className="mt-0.5 text-[11px] text-slate-500">Thursday, November 26, 2026 <span className="mx-1.5 text-slate-700">/</span> All accounts</div></div></div>
            <div className="flex items-center gap-2 sm:gap-4"><span className="hidden items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] px-3 py-1.5 text-[10px] font-semibold text-emerald-300 sm:flex"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400"/> Demo workspace</span><button className="relative rounded-lg p-2 text-slate-400 hover:bg-white/[0.05]"><Bell size={18}/><span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-amber-400"/></button><div className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-slate-800 text-[10px] font-bold">YO</div></div>
          </header>
          <div className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div><div className="text-xs font-medium text-emerald-300">FINANCIAL OPERATIONS / ACCOUNTS RECEIVABLE</div><h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-[30px]">Good morning. Here's your cash picture.</h1><p className="mt-2 text-sm text-slate-500">A focused view of what is owed, what needs attention, and what to do next.</p></div>
              <div className="flex flex-wrap gap-2"><button onClick={exportCSV} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3.5 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/[0.05]"><Download size={15}/> Export</button><button onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-4 py-2.5 text-xs font-bold text-[#06251e] shadow-lg shadow-emerald-950/30 hover:bg-emerald-300"><FileUp size={15}/> Import invoices</button><input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={e => { importFile(e.target.files?.[0]); e.currentTarget.value = ""; }}/></div>
            </div>
            {notice && <div className="mt-5 flex items-center justify-between rounded-xl border border-emerald-400/20 bg-emerald-400/[0.08] px-4 py-3 text-xs text-emerald-200"><span>{notice}</span><button onClick={() => setNotice("")}><X size={15}/></button></div>}
            <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Metric label="Total outstanding" value={money(outstanding)} detail={`${active.length} unpaid invoices`} icon={<Wallet size={17}/>} trend="Open balance" />
              <Metric label="Overdue receivables" value={money(overdueValue)} detail={`${overdue.length} invoices past due`} icon={<CalendarClock size={17}/>} tone="amber" trend={overdue.length ? "Action needed" : "On track"}/>
              <Metric label="Awaiting review" value={String(invoices.filter(i => i.status === "disputed").length)} detail="Disputed or unclear items" icon={<CircleAlert size={17}/>} tone="purple" trend="Human review"/>
              <Metric label="Paid invoices" value={String(invoices.filter(i => i.status === "paid").length)} detail="Recorded in this workspace" icon={<CheckCircle2 size={17}/>} tone="blue" trend="Completed"/>
            </div>
            <div className="mt-7 grid gap-5 xl:grid-cols-[1.55fr_1fr]">
              <div id="invoices" className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d1524]">
                <div className="flex flex-col justify-between gap-4 border-b border-white/[0.07] p-5 sm:flex-row sm:items-center"><div><h2 className="text-sm font-bold">Invoice portfolio</h2><p className="mt-1 text-[11px] text-slate-500">Monitor balances and identify the next best action.</p></div><div className="flex flex-wrap items-center gap-2"><div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search invoices..." className="h-9 w-full rounded-lg border border-white/10 bg-[#080e19] pl-9 pr-3 text-xs outline-none placeholder:text-slate-600 focus:border-emerald-400/40 sm:w-48"/></div><select value={filter} onChange={e => setFilter(e.target.value)} className="h-9 rounded-lg border border-white/10 bg-[#080e19] px-3 text-xs text-slate-300 outline-none"><option>All invoices</option><option>Overdue</option><option>Due soon</option><option>Needs review</option><option>Paid</option></select></div></div>
                <div className="overflow-x-auto"><table className="w-full min-w-[690px] text-left"><thead><tr className="border-b border-white/[0.06] text-[10px] font-semibold uppercase tracking-wider text-slate-600"><th className="px-5 py-3">Customer / invoice</th><th className="px-4 py-3">Due date</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Status</th><th className="px-5 py-3 text-right">Action</th></tr></thead><tbody>{filtered.map(i => <tr key={i.id} className="border-b border-white/[0.045] last:border-0 hover:bg-white/[0.02]"><td className="px-5 py-4"><div className="text-xs font-semibold text-slate-200">{i.customer}</div><div className="mt-1 text-[10px] text-slate-500">{i.invoice} <span className="mx-1 text-slate-700">·</span> {i.email || "No email provided"}</div></td><td className="px-4 py-4"><div className="text-xs text-slate-300">{new Date(i.dueDate + "T00:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric"})}</div><div className="mt-1 text-[10px] text-slate-600">{i.status === "paid" ? "Settled" : daysLate(i.dueDate) > 0 ? `${daysLate(i.dueDate)} days late` : "Not overdue"}</div></td><td className="px-4 py-4 text-xs font-semibold tabular-nums">{money(i.amount)}</td><td className="px-4 py-4"><Status value={classify(i)}/></td><td className="px-5 py-4 text-right">{i.status === "paid" ? <span className="text-[10px] text-slate-600">No action</span> : <button onClick={() => setSelected(i)} className="rounded-lg border border-emerald-400/20 px-3 py-1.5 text-[10px] font-semibold text-emerald-300 hover:bg-emerald-400/10">{i.status === "disputed" ? "Review" : "View action"}</button>}</td></tr>)}</tbody></table>{filtered.length === 0 && <div className="p-10 text-center text-xs text-slate-500">No invoices match your search.</div>}</div>
                <div className="flex items-center justify-between border-t border-white/[0.06] px-5 py-3 text-[10px] text-slate-600"><span>Showing {filtered.length} of {invoices.length} invoices</span><span>Amounts in USD</span></div>
              </div>
              <div className="space-y-5">
                <div id="follow-ups" className="rounded-2xl border border-white/[0.08] bg-[#0d1524] p-5">
                  <div className="flex items-center justify-between"><div><h2 className="text-sm font-bold">Agent action queue</h2><p className="mt-1 text-[11px] text-slate-500">Suggested next steps, prioritized.</p></div><span className="rounded-full bg-amber-400/10 px-2.5 py-1 text-[10px] font-semibold text-amber-300">{overdue.length + invoices.filter(i => i.status === "disputed").length} items</span></div>
                  <div className="mt-4 space-y-3">{[...invoices.filter(i => i.status === "disputed"), ...overdue.slice().sort((a,b) => daysLate(b.dueDate)-daysLate(a.dueDate)).slice(0,3)].slice(0,4).map(i => <div key={i.id} className="rounded-xl border border-white/[0.06] bg-[#0a111e] p-3.5"><div className="flex items-start justify-between gap-2"><div><div className="text-xs font-semibold">{i.customer}</div><div className="mt-1 text-[10px] text-slate-500">{i.invoice} · {money(i.amount)}</div></div><Priority value={priority(i)}/></div><p className="mt-2 text-[11px] leading-5 text-slate-400">{i.status === "disputed" ? "Review the disputed line items before any collection reminder." : `Send a polite payment follow-up · ${daysLate(i.dueDate)} days overdue.`}</p><button onClick={() => setSelected(i)} className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-300 hover:text-emerald-200">{i.status === "disputed" ? "Open review" : "Prepare reminder"} <ArrowUpRight size={12}/></button></div>)}
                    {overdue.length === 0 && invoices.every(i => i.status !== "disputed") && <div className="rounded-xl border border-emerald-400/15 bg-emerald-400/[0.05] p-4 text-xs text-emerald-200">You're all caught up. No invoices currently need collection attention.</div>}
                  </div>
                  <div className="mt-4 flex items-center gap-2 rounded-lg bg-white/[0.03] px-3 py-2.5 text-[10px] text-slate-500"><ShieldCheck size={14} className="text-emerald-400"/> Every action requires human approval.</div>
                </div>
                <div id="insights" className="rounded-2xl border border-white/[0.08] bg-[#0d1524] p-5">
                  <div className="flex items-center justify-between"><div><h2 className="text-sm font-bold">Receivables health</h2><p className="mt-1 text-[11px] text-slate-500">Snapshot of current invoice status.</p></div><Activity size={17} className="text-emerald-300"/></div>
                  <div className="mt-5 flex h-3 overflow-hidden rounded-full bg-white/[0.06]"><div style={{width:`${invoices.length ? invoices.filter(i=>i.status==="paid").length/invoices.length*100 : 0}%`}} className="bg-emerald-400"/><div style={{width:`${invoices.length ? overdue.length/invoices.length*100 : 0}%`}} className="bg-amber-400"/><div style={{width:`${invoices.length ? invoices.filter(i=>i.status==="disputed").length/invoices.length*100 : 0}%`}} className="bg-violet-400"/></div>
                  <div className="mt-4 grid grid-cols-3 gap-2"><Legend color="bg-emerald-400" label="Paid" value={invoices.filter(i=>i.status==="paid").length}/><Legend color="bg-amber-400" label="Overdue" value={overdue.length}/><Legend color="bg-violet-400" label="Review" value={invoices.filter(i=>i.status==="disputed").length}/></div>
                  <div className="mt-5 border-t border-white/[0.06] pt-4"><div className="flex items-center justify-between text-xs"><span className="text-slate-400">Approved reminder drafts</span><span className="font-semibold text-slate-200">{approved.length}</span></div><p className="mt-2 text-[10px] leading-4 text-slate-600">Approval records are held in this browser session only. No email has been sent.</p></div>
                </div>
              </div>
            </div>
            <footer className="mt-8 flex flex-col justify-between gap-2 border-t border-white/[0.06] pt-5 text-[10px] text-slate-600 sm:flex-row"><span>FinAgent AI · Receivables Command Center · MVP preview</span><span>Demo data · Local browser session · Not connected to accounting systems</span></footer>
          </div>
        </section>
      </div>
      {selected && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setSelected(null)}><div className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#101a2b] p-5 shadow-2xl sm:p-6" onClick={e => e.stopPropagation()}><div className="flex items-start justify-between"><div><div className="text-[10px] font-bold uppercase tracking-[.17em] text-emerald-300">Human review required</div><h3 className="mt-2 text-lg font-bold">{selected.status === "disputed" ? "Invoice review" : "Payment reminder draft"}</h3><p className="mt-1 text-xs text-slate-500">{selected.customer} · {selected.invoice} · {money(selected.amount)}</p></div><button onClick={() => setSelected(null)} className="rounded-lg p-2 text-slate-500 hover:bg-white/5"><X size={18}/></button></div>
        {selected.status === "disputed" ? <div className="mt-5 rounded-xl border border-violet-400/20 bg-violet-400/[0.06] p-4"><div className="flex items-center gap-2 text-sm font-semibold text-violet-200"><CircleAlert size={16}/> Collection paused</div><p className="mt-2 text-xs leading-5 text-slate-400">This invoice is marked as disputed. Review the customer's concern and resolve it before sending a payment reminder.</p><p className="mt-3 text-xs text-slate-300">Note: {selected.notes || "No dispute notes supplied."}</p></div> : <><div className="mt-5 flex items-center justify-between rounded-lg bg-white/[0.04] px-3 py-2.5 text-[11px]"><span className="text-slate-400">Suggested priority</span><Priority value={priority(selected)}/></div><pre className="mt-4 max-h-[310px] overflow-auto whitespace-pre-wrap rounded-xl border border-white/[0.07] bg-[#080e19] p-4 text-[11px] leading-5 text-slate-300">{draftFor(selected)}</pre></>}
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button onClick={() => setSelected(null)} className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-semibold text-slate-300">Close</button>{selected.status !== "disputed" && <button onClick={() => approveDraft(selected)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 py-2.5 text-xs font-bold text-[#06251e]"><Check size={15}/> Approve draft (not sent)</button>}</div>
      </div></div>}
    </main>
  );
}

function Metric({label,value,detail,icon,tone="green",trend}:{label:string;value:string;detail:string;icon:React.ReactNode;tone?:string;trend:string}) {
  const tones:Record<string,string>={green:"text-emerald-300 bg-emerald-400/10",amber:"text-amber-300 bg-amber-400/10",purple:"text-violet-300 bg-violet-400/10",blue:"text-sky-300 bg-sky-400/10"};
  return <div className="rounded-2xl border border-white/[0.08] bg-[#0d1524] p-5"><div className="flex items-center justify-between"><span className="text-xs text-slate-500">{label}</span><span className={`grid h-9 w-9 place-items-center rounded-xl ${tones[tone]}`}>{icon}</span></div><div className="mt-4 text-[27px] font-bold tracking-tight tabular-nums">{value}</div><div className="mt-1 flex items-center justify-between gap-2"><span className="text-[10px] text-slate-500">{detail}</span><span className={`text-[9px] font-semibold ${tones[tone].split(" ")[0]}`}>{trend}</span></div></div>;
}
function Status({value}:{value:string}) {
 const cls:Record<string,string>={"Overdue":"bg-amber-400/10 text-amber-300 border-amber-400/15","Due soon":"bg-sky-400/10 text-sky-300 border-sky-400/15","Needs review":"bg-violet-400/10 text-violet-300 border-violet-400/15","Paid":"bg-emerald-400/10 text-emerald-300 border-emerald-400/15"};
 return <span className={`inline-flex rounded-full border px-2.5 py-1 text-[9px] font-semibold ${cls[value] || ""}`}>{value}</span>;
}
function Priority({value}:{value:string}) {
 const cls:Record<string,string>={High:"text-rose-300 bg-rose-400/10",Medium:"text-amber-300 bg-amber-400/10",Normal:"text-slate-400 bg-white/[0.06]",Review:"text-violet-300 bg-violet-400/10",Closed:"text-emerald-300 bg-emerald-400/10"};
 return <span className={`rounded-md px-2 py-1 text-[9px] font-bold ${cls[value] || cls.Normal}`}>{value}</span>;
}
function Legend({color,label,value}:{color:string;label:string;value:number}) {
 return <div><div className="flex items-center gap-1.5 text-[10px] text-slate-500"><span className={`h-1.5 w-1.5 rounded-full ${color}`}/>{label}</div><div className="mt-1 pl-3 text-sm font-semibold">{value}</div></div>;
}
