"use client";

import { FormEvent, useCallback, useMemo, useState } from "react";
import { Download, RefreshCw } from "lucide-react";

type Lead = {
  id: string; created_at: string; status: string; score: number; kind: string; name: string; phone: string; email: string | null;
  project_name: string | null; answers: string; note: string; source_path: string;
  utm_source: string | null; utm_campaign: string | null; gclid: string | null; fbclid: string | null;
};

const STATUSES = ["new", "qualified", "visit-booked", "visit-done", "booked", "not-now", "junk"];
const LABEL: Record<string, string> = { new: "New", qualified: "Qualified", "visit-booked": "Visit booked", "visit-done": "Visit done", booked: "Booked", "not-now": "Not now", junk: "Junk" };

function source(lead: Lead) {
  if (lead.gclid) return "Google Ads";
  if (lead.fbclid) return "Meta Ads";
  if (lead.utm_source) return lead.utm_source;
  return "Direct / organic";
}

/** The team's private lead page. The key lives in memory only and is asked for again on reload. */
export function DeskClient() {
  const [key, setKey] = useState("");
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState("all");

  const load = useCallback(async (k: string) => {
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/desk", { headers: { "x-desk-key": k } });
      const data = (await response.json()) as { leads?: Lead[]; message?: string };
      if (!response.ok) throw new Error(data.message || "Could not open the desk.");
      setLeads(data.leads ?? []);
    } catch (e) {
      setLeads(null); setError(e instanceof Error ? e.message : "Could not open the desk.");
    } finally { setBusy(false); }
  }, []);

  const open = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); void load(key); };

  async function update(id: string, patch: { status?: string; note?: string }) {
    setLeads((list) => list?.map((l) => (l.id === id ? { ...l, ...patch } : l)) ?? null);
    const response = await fetch("/api/desk", { method: "POST", headers: { "Content-Type": "application/json", "x-desk-key": key }, body: JSON.stringify({ id, ...patch }) });
    if (!response.ok) setError("A change could not be saved. Refresh and try again.");
  }

  async function download() {
    const response = await fetch("/api/desk?format=csv", { headers: { "x-desk-key": key } });
    if (!response.ok) { setError("The download failed."); return; }
    const url = URL.createObjectURL(await response.blob());
    const link = document.createElement("a");
    link.href = url; link.download = `100yards-leads-${new Date().toISOString().slice(0, 10)}.csv`; link.click();
    URL.revokeObjectURL(url);
  }

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    (leads ?? []).forEach((l) => { map[l.status] = (map[l.status] ?? 0) + 1; });
    return map;
  }, [leads]);
  const shown = (leads ?? []).filter((l) => filter === "all" || l.status === filter);

  if (!leads) {
    return (
      <form className="form desk__gate" onSubmit={open}>
        <div className="form__heading">
          <p className="eyebrow">Team only</p>
          <h2>Lead desk</h2>
          <p>Enter the team key to see enquiries from the website.</p>
        </div>
        <div className="field field--full">
          <label htmlFor="desk-key">Team key</label>
          <input id="desk-key" type="password" autoComplete="current-password" value={key} onChange={(e) => setKey(e.target.value)} required />
        </div>
        <div className="form__submit"><button className="button button--gold" type="submit" disabled={busy}>{busy ? "Opening…" : "Open the desk"}</button></div>
        {error && <p className="form__message form__message--error" role="alert">{error}</p>}
      </form>
    );
  }

  return (
    <div className="desk">
      <div className="desk__bar">
        <div className="desk__filters" role="tablist" aria-label="Filter by status">
          <button type="button" className={filter === "all" ? "is-on" : ""} onClick={() => setFilter("all")}>All <b>{leads.length}</b></button>
          {STATUSES.map((s) => (
            <button type="button" key={s} className={filter === s ? "is-on" : ""} onClick={() => setFilter(s)}>{LABEL[s]} <b>{counts[s] ?? 0}</b></button>
          ))}
        </div>
        <div className="desk__actions">
          <button type="button" className="button button--outline button--sm" onClick={() => void load(key)} disabled={busy}><RefreshCw size={14} aria-hidden="true" /> Refresh</button>
          <button type="button" className="button button--gold button--sm" onClick={() => void download()}><Download size={14} aria-hidden="true" /> Download spreadsheet</button>
        </div>
      </div>
      {error && <p className="form__message form__message--error" role="alert">{error}</p>}
      {shown.length === 0 ? <p className="desk__empty">No leads here yet.</p> : (
        <div className="desk__wrap">
          <table className="desk__table">
            <thead><tr><th>When</th><th>Lead</th><th>Asked for</th><th>Answers</th><th>Came from</th><th>Score</th><th>Status</th><th>Note</th></tr></thead>
            <tbody>
              {shown.map((lead) => {
                let answers: Record<string, string> = {};
                try { answers = JSON.parse(lead.answers); } catch { /* keep empty */ }
                return (
                  <tr key={lead.id} className={`is-${lead.status}`}>
                    <td>{new Date(lead.created_at).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</td>
                    <td><strong>{lead.name}</strong><a href={`tel:${lead.phone}`}>{lead.phone}</a>{lead.email && <span>{lead.email}</span>}</td>
                    <td><strong>{lead.kind}</strong>{lead.project_name && <span>{lead.project_name}</span>}</td>
                    <td>{Object.entries(answers).map(([k, v]) => <span key={k}>{k}: {v}</span>)}</td>
                    <td><strong>{source(lead)}</strong>{lead.utm_campaign && <span>{lead.utm_campaign}</span>}<span>{lead.source_path}</span></td>
                    <td className="desk__score">{lead.score}</td>
                    <td>
                      <select value={lead.status} onChange={(e) => void update(lead.id, { status: e.target.value })} aria-label={`Status for ${lead.name}`}>
                        {STATUSES.map((s) => <option key={s} value={s}>{LABEL[s]}</option>)}
                      </select>
                    </td>
                    <td><input type="text" defaultValue={lead.note} placeholder="Add a note" maxLength={1000} onBlur={(e) => { if (e.target.value !== lead.note) void update(lead.id, { note: e.target.value }); }} aria-label={`Note for ${lead.name}`} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
