import { useState, useEffect } from "react";

const API_URL = "https://api.anthropic.com/v1/messages";

const callClaude = async (systemPrompt, userPrompt) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1200,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });
  const data = await response.json();
  return data.content?.[0]?.text || "Error generating response.";
};

const TABS = ["Dashboard", "Lead Finder", "Outreach", "Email Sequences", "Follow-Up Tracker", "Content Engine", "Pricing Builder", "Onboarding"];

const INIT_LEADS = [
  { id: 1, name: "Nova Digital Agency", location: "Austin, TX", size: "4 employees", status: "New", lastContact: null, notes: "" },
  { id: 2, name: "Spark Media Co.", location: "Miami, FL", size: "7 employees", status: "Contacted", lastContact: "Mar 1", notes: "Interested, wants demo" },
  { id: 3, name: "Pixel Push Marketing", location: "Chicago, IL", size: "3 employees", status: "Followed Up", lastContact: "Mar 4", notes: "No reply yet" },
  { id: 4, name: "Blaze Creative Studio", location: "NYC, NY", size: "6 employees", status: "New", lastContact: null, notes: "" },
  { id: 5, name: "Summit Growth Labs", location: "Denver, CO", size: "9 employees", status: "Replied", lastContact: "Mar 6", notes: "Ready to pilot" },
  { id: 6, name: "Anchor Digital", location: "Portland, OR", size: "5 employees", status: "New", lastContact: null, notes: "" },
];

const MOCK_AGENCIES = [
  { name: "Nova Digital", status: "Pilot", mrr: 0, since: "Feb 2025" },
  { name: "Spark Media", status: "Active", mrr: 250, since: "Jan 2025" },
  { name: "Summit Growth", status: "Active", mrr: 300, since: "Dec 2024" },
];

const STATUS_COLORS = {
  New: "#00f5c4", Contacted: "#f5c400", "Followed Up": "#fb923c",
  Replied: "#a78bfa", Closed: "#22c55e", Lost: "#ef4444",
  Pilot: "#f5c400", Active: "#00f5c4",
};
const sc = (s) => STATUS_COLORS[s] || "#667";

const Btn = ({ onClick, disabled, children, variant = "primary", style = {} }) => (
  <button onClick={onClick} disabled={disabled} style={{
    background: variant === "primary" ? "#00f5c4" : "transparent",
    color: variant === "primary" ? "#080c14" : variant === "purple" ? "#a78bfa" : "#667",
    border: variant === "primary" ? "none" : variant === "purple" ? "1px solid #a78bfa44" : "1px solid #1a2235",
    borderRadius: 5, padding: "7px 16px", fontSize: 11, fontWeight: variant === "primary" ? 700 : 400,
    cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.07em",
    opacity: disabled ? 0.5 : 1, transition: "all 0.15s", ...style
  }}>{children}</button>
);

const Card = ({ children, style = {} }) => (
  <div style={{ background: "#0d1420", border: "1px solid #1a2235", borderRadius: 8, padding: 24, ...style }}>
    {children}
  </div>
);

const Label = ({ children }) => (
  <div style={{ fontSize: 10, color: "#445", letterSpacing: "0.12em", marginBottom: 12 }}>{children}</div>
);

const Input = ({ value, onChange, placeholder, style = {} }) => (
  <input value={value} onChange={onChange} placeholder={placeholder} style={{
    background: "#0d1420", border: "1px solid #1a2235", borderRadius: 6,
    padding: "10px 14px", color: "#e8eaf0", fontSize: 13, fontFamily: "inherit",
    outline: "none", width: "100%", boxSizing: "border-box", ...style
  }} />
);

const Select = ({ value, onChange, options, style = {} }) => (
  <select value={value} onChange={e => onChange(e.target.value)} style={{
    background: "#0d1420", border: "1px solid #1a2235", borderRadius: 6,
    padding: "10px 14px", color: "#e8eaf0", fontSize: 13, fontFamily: "inherit",
    outline: "none", ...style
  }}>
    {options.map(o => <option key={o}>{o}</option>)}
  </select>
);

const OutputBox = ({ output, loading, label, onCopy, onRegen }) => (
  <>
    {loading && <div style={{ color: "#445", fontSize: 13, padding: "16px 0" }}>Generating...</div>}
    {output && (
      <Card style={{ border: "1px solid #1a3a2a", marginTop: 16 }}>
        <Label>{label}</Label>
        <div style={{ fontSize: 13, color: "#b0c4b8", lineHeight: 1.9, whiteSpace: "pre-wrap" }}>{output}</div>
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #1a2235", display: "flex", gap: 10 }}>
          <Btn variant="ghost" onClick={onCopy}>COPY</Btn>
          {onRegen && <Btn variant="purple" onClick={onRegen}>REGENERATE</Btn>}
        </div>
      </Card>
    )}
  </>
);

export default function App() {
  const [tab, setTab] = useState("Dashboard");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");
  const [pulse, setPulse] = useState(false);

  const [niche, setNiche] = useState("marketing agencies");
  const [agencyName, setAgencyName] = useState("");
  const [seqAgency, setSeqAgency] = useState("");
  const [seqGoal, setSeqGoal] = useState("book a discovery call");
  const [seqCount, setSeqCount] = useState("5");
  const [leads, setLeads] = useState(INIT_LEADS);
  const [editingNote, setEditingNote] = useState(null);
  const [noteVal, setNoteVal] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [contentType, setContentType] = useState("LinkedIn post");
  const [clientIndustry, setClientIndustry] = useState("real estate");
  const [pricingNiche, setPricingNiche] = useState("marketing agencies");
  const [pricingTier, setPricingTier] = useState("3 tiers");
  const [pricingStyle, setPricingStyle] = useState("value-based");
  const [onboardName, setOnboardName] = useState("");
  const [onboardNotes, setOnboardNotes] = useState("");

  useEffect(() => { const t = setInterval(() => setPulse(p => !p), 2000); return () => clearInterval(t); }, []);

  const totalMRR = MOCK_AGENCIES.reduce((a, ag) => a + ag.mrr, 0);

  const run = async (system, user) => {
    setLoading(true); setOutput("");
    const res = await callClaude(system, user);
    setOutput(res); setLoading(false);
  };

  const updateLeadStatus = (id, status) =>
    setLeads(leads.map(l => l.id === id ? { ...l, status, lastContact: status !== "New" ? "Today" : null } : l));

  const saveNote = (id) => {
    setLeads(leads.map(l => l.id === id ? { ...l, notes: noteVal } : l));
    setEditingNote(null);
  };

  const filteredLeads = filterStatus === "All" ? leads : leads.filter(l => l.status === filterStatus);
  const overdueLeads = leads.filter(l => l.status === "Contacted" || l.status === "Followed Up");

  const navStyle = (t) => ({
    background: tab === t ? "#00f5c4" : "transparent",
    color: tab === t ? "#080c14" : "#556",
    border: tab === t ? "none" : "1px solid #151d2e",
    borderRadius: 4, padding: "5px 11px", fontSize: 10,
    letterSpacing: "0.07em", cursor: "pointer", fontFamily: "inherit",
    fontWeight: tab === t ? 700 : 400, transition: "all 0.2s", whiteSpace: "nowrap",
  });

  return (
    <div style={{ minHeight: "100vh", background: "#080c14", color: "#e8eaf0", fontFamily: "'DM Mono','Courier New',monospace" }}>

      {/* Nav */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap",
        gap: 10, padding: "16px 28px", borderBottom: "1px solid #111827",
        background: "rgba(8,12,20,0.97)", position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#00f5c4", boxShadow: `0 0 ${pulse ? 16 : 5}px #00f5c4`, transition: "box-shadow 0.8s ease" }} />
          <span style={{ fontSize: 14, letterSpacing: "0.15em", color: "#00f5c4", fontWeight: 700 }}>AGENCY OS</span>
          <span style={{ fontSize: 10, color: "#334", letterSpacing: "0.1em" }}>v2.0</span>
        </div>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {TABS.map(t => <button key={t} onClick={() => { setTab(t); setOutput(""); }} style={navStyle(t)}>{t.toUpperCase()}</button>)}
        </div>
      </div>

      <div style={{ maxWidth: 980, margin: "0 auto", padding: "32px 20px" }}>

        {/* DASHBOARD */}
        {tab === "Dashboard" && (
          <div>
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 10, color: "#334", letterSpacing: "0.14em", marginBottom: 4 }}>OVERVIEW</div>
              <div style={{ fontSize: 26, fontWeight: 700 }}>Your Agency Empire</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 28 }}>
              {[
                { label: "TOTAL MRR", value: `$${totalMRR}`, sub: "+$300 this month", color: "#00f5c4" },
                { label: "ACTIVE AGENCIES", value: 2, sub: "1 in pilot", color: "#e8eaf0" },
                { label: "PIPELINE LEADS", value: leads.length, sub: `${leads.filter(l => l.status === "New").length} new`, color: "#e8eaf0" },
                { label: "FOLLOW-UPS DUE", value: overdueLeads.length, sub: "need action", color: "#fb923c" },
              ].map(s => (
                <Card key={s.label} style={{ padding: "18px 18px 14px" }}>
                  <div style={{ fontSize: 9, color: "#445", letterSpacing: "0.12em", marginBottom: 8 }}>{s.label}</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: "#556", marginTop: 6 }}>{s.sub}</div>
                </Card>
              ))}
            </div>
            <Card style={{ marginBottom: 16 }}>
              <Label>AGENCY CLIENTS</Label>
              {MOCK_AGENCIES.map((ag, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 0", borderBottom: i < MOCK_AGENCIES.length - 1 ? "1px solid #111827" : "none" }}>
                  <div>
                    <div style={{ fontSize: 13, marginBottom: 2 }}>{ag.name}</div>
                    <div style={{ fontSize: 11, color: "#445" }}>Since {ag.since}</div>
                  </div>
                  <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
                    <div style={{ fontSize: 14, color: "#00f5c4", fontWeight: 700 }}>{ag.mrr > 0 ? `$${ag.mrr}/mo` : "Free Pilot"}</div>
                    <div style={{ fontSize: 10, padding: "3px 10px", borderRadius: 20, border: `1px solid ${sc(ag.status)}`, color: sc(ag.status) }}>{ag.status.toUpperCase()}</div>
                  </div>
                </div>
              ))}
            </Card>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Card style={{ padding: 18 }}>
                <Label>QUICK ACTIONS</Label>
                {[["Lead Finder","Find New Leads"],["Email Sequences","Write a Sequence"],["Pricing Builder","Build Pricing Page"],["Follow-Up Tracker","Check Pipeline"]].map(([t, label]) => (
                  <div key={t} onClick={() => { setTab(t); setOutput(""); }} style={{ padding: "9px 0", borderBottom: "1px solid #111827", cursor: "pointer", fontSize: 12, color: "#667", display: "flex", justifyContent: "space-between" }}
                    onMouseEnter={e => e.currentTarget.style.color = "#00f5c4"}
                    onMouseLeave={e => e.currentTarget.style.color = "#667"}>
                    <span>{label}</span><span>→</span>
                  </div>
                ))}
              </Card>
              <Card style={{ padding: 18 }}>
                <Label>PIPELINE HEALTH</Label>
                {["New","Contacted","Followed Up","Replied"].map(s => {
                  const count = leads.filter(l => l.status === s).length;
                  return (
                    <div key={s} style={{ marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#556", marginBottom: 4 }}>
                        <span>{s}</span><span style={{ color: sc(s) }}>{count}</span>
                      </div>
                      <div style={{ background: "#111827", borderRadius: 2, height: 3 }}>
                        <div style={{ width: `${Math.round((count / leads.length) * 100)}%`, height: "100%", background: sc(s), borderRadius: 2 }} />
                      </div>
                    </div>
                  );
                })}
              </Card>
            </div>
          </div>
        )}

        {/* LEAD FINDER */}
        {tab === "Lead Finder" && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 10, color: "#334", letterSpacing: "0.14em", marginBottom: 4 }}>AUTOMATION</div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>Lead Finder</div>
              <div style={{ fontSize: 12, color: "#556", marginTop: 4 }}>AI surfaces targeted agency leads for outreach</div>
            </div>
            <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
              <Input value={niche} onChange={e => setNiche(e.target.value)} placeholder="Target niche (e.g. marketing agencies)" style={{ flex: 1 }} />
              <Btn onClick={() => run(
                "You are a B2B lead research specialist. Return exactly 5 realistic small agency leads. Each: name, city, team size, #1 pain point. Clean numbered list.",
                `Find 5 small ${niche} (1–10 employees) who need AI automation. Make them feel specific and real.`
              )} disabled={loading}>{loading ? "FINDING..." : "FIND LEADS →"}</Btn>
            </div>
            <Card style={{ marginBottom: 16 }}>
              <Label>PIPELINE ({leads.length} leads)</Label>
              {leads.map((l, i) => (
                <div key={l.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 0", borderBottom: i < leads.length - 1 ? "1px solid #111827" : "none" }}>
                  <div>
                    <div style={{ fontSize: 13 }}>{l.name}</div>
                    <div style={{ fontSize: 10, color: "#445" }}>{l.location} · {l.size}</div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <div style={{ fontSize: 10, padding: "3px 9px", borderRadius: 20, border: `1px solid ${sc(l.status)}`, color: sc(l.status) }}>{l.status.toUpperCase()}</div>
                    <Btn variant="purple" onClick={() => { setAgencyName(l.name); setTab("Outreach"); setOutput(""); }} style={{ padding: "4px 10px", fontSize: 10 }}>OUTREACH →</Btn>
                  </div>
                </div>
              ))}
            </Card>
            <OutputBox output={output} loading={loading} label="AI GENERATED LEADS"
              onCopy={() => navigator.clipboard.writeText(output)}
              onRegen={() => run("Find 5 realistic B2B leads. Numbered list with name, city, size, pain point.", `Small ${niche} who need AI automation.`)} />
          </div>
        )}

        {/* OUTREACH */}
        {tab === "Outreach" && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 10, color: "#334", letterSpacing: "0.14em", marginBottom: 4 }}>AUTOMATION</div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>Outreach Engine</div>
              <div style={{ fontSize: 12, color: "#556", marginTop: 4 }}>AI writes personalized cold DMs — human, punchy, effective</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
              <Input value={agencyName} onChange={e => setAgencyName(e.target.value)} placeholder="Agency name (e.g. Spark Media Co.)" />
              <Btn style={{ padding: 11 }} onClick={() => run(
                "You are a world-class B2B sales copywriter. Write short, punchy, genuinely human LinkedIn DMs. Max 4 sentences. No buzzwords. Create curiosity without being salesy.",
                `Cold LinkedIn DM to ${agencyName || "a small marketing agency"}. Pitch: AI automation that handles client follow-ups and content, saving 10+ hrs/week.`
              )} disabled={loading}>{loading ? "WRITING..." : "GENERATE DM →"}</Btn>
            </div>
            <OutputBox output={output} loading={loading} label="OUTREACH MESSAGE"
              onCopy={() => navigator.clipboard.writeText(output)}
              onRegen={() => run("Write a punchy, human LinkedIn DM. Max 4 sentences. No fluff.", `Cold DM to ${agencyName || "a marketing agency"} about AI automation saving 10+ hrs/week.`)} />
          </div>
        )}

        {/* EMAIL SEQUENCES */}
        {tab === "Email Sequences" && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 10, color: "#00f5c4", letterSpacing: "0.14em", marginBottom: 4 }}>NEW · AUTOMATION</div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>Email Sequences</div>
              <div style={{ fontSize: 12, color: "#556", marginTop: 4 }}>AI builds full multi-step email sequences for any goal</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
              <Input value={seqAgency} onChange={e => setSeqAgency(e.target.value)} placeholder="Target (e.g. marketing agencies)" />
              <Select value={seqGoal} onChange={setSeqGoal} options={["book a discovery call","start a free pilot","reply to this email","schedule a demo","sign up for a trial"]} style={{ width: "100%" }} />
              <Select value={seqCount} onChange={setSeqCount} options={["3","5","7"]} style={{ width: "100%" }} />
            </div>
            <Btn style={{ width: "100%", marginBottom: 16, padding: 11 }} onClick={() => run(
              `You are an expert B2B email copywriter. Write a ${seqCount}-email cold outreach sequence. Each email needs: Subject line, body (max 120 words), clear CTA. Vary tone: curious → value → social proof → urgency → breakup. No fluff. Sound human.`,
              `${seqCount}-email sequence targeting ${seqAgency || "small marketing agencies"}. Goal: get them to ${seqGoal}. Offer: AI automation for client follow-ups + content at $200-300/month, saves 10+ hrs/week.`
            )} disabled={loading}>{loading ? "WRITING SEQUENCE..." : `GENERATE ${seqCount}-EMAIL SEQUENCE →`}</Btn>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
              {[{ label: "AVG OPEN RATE", value: "42%", sub: "industry avg: 21%" }, { label: "REPLY RATE", value: "8%", sub: "with personalization" }, { label: "CLOSE RATE", value: "15%", sub: "from replied leads" }].map(s => (
                <Card key={s.label} style={{ padding: "16px 18px" }}>
                  <div style={{ fontSize: 9, color: "#445", letterSpacing: "0.12em", marginBottom: 6 }}>{s.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: "#00f5c4" }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: "#556", marginTop: 4 }}>{s.sub}</div>
                </Card>
              ))}
            </div>
            <OutputBox output={output} loading={loading} label={`${seqCount}-EMAIL SEQUENCE · ${(seqAgency || "AGENCIES").toUpperCase()}`}
              onCopy={() => navigator.clipboard.writeText(output)}
              onRegen={() => run(`Write a ${seqCount}-email B2B sequence. Subject + body + CTA each. Human tone. Vary: curious → value → proof → urgency → breakup.`, `For ${seqAgency || "marketing agencies"} to ${seqGoal}.`)} />
          </div>
        )}

        {/* FOLLOW-UP TRACKER */}
        {tab === "Follow-Up Tracker" && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 10, color: "#00f5c4", letterSpacing: "0.14em", marginBottom: 4 }}>NEW · PIPELINE</div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>Follow-Up Tracker</div>
              <div style={{ fontSize: 12, color: "#556", marginTop: 4 }}>Never let a hot lead go cold</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10, marginBottom: 20 }}>
              {["All","New","Contacted","Followed Up","Replied"].map(s => (
                <div key={s} onClick={() => setFilterStatus(s)} style={{
                  background: filterStatus === s ? (s === "All" ? "#1a2235" : sc(s) + "22") : "#0d1420",
                  border: `1px solid ${filterStatus === s ? (s === "All" ? "#334" : sc(s)) : "#1a2235"}`,
                  borderRadius: 6, padding: "12px 14px", cursor: "pointer", transition: "all 0.2s"
                }}>
                  <div style={{ fontSize: 9, color: s === "All" ? "#556" : sc(s), letterSpacing: "0.1em", marginBottom: 4 }}>{s.toUpperCase()}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: s === "All" ? "#e8eaf0" : sc(s) }}>
                    {s === "All" ? leads.length : leads.filter(l => l.status === s).length}
                  </div>
                </div>
              ))}
            </div>
            <Card>
              <Label>LEADS ({filteredLeads.length})</Label>
              {filteredLeads.map((l, i) => (
                <div key={l.id} style={{ padding: "14px 0", borderBottom: i < filteredLeads.length - 1 ? "1px solid #111827" : "none" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, marginBottom: 3 }}>{l.name}</div>
                      <div style={{ fontSize: 10, color: "#445", marginBottom: 6 }}>{l.location} · {l.size}{l.lastContact ? ` · Last: ${l.lastContact}` : ""}</div>
                      {editingNote === l.id ? (
                        <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                          <input value={noteVal} onChange={e => setNoteVal(e.target.value)} placeholder="Add note..."
                            style={{ flex: 1, background: "#111827", border: "1px solid #1a2235", borderRadius: 4, padding: "6px 10px", color: "#e8eaf0", fontSize: 12, fontFamily: "inherit", outline: "none" }} />
                          <Btn onClick={() => saveNote(l.id)} style={{ padding: "5px 12px", fontSize: 10 }}>SAVE</Btn>
                          <Btn variant="ghost" onClick={() => setEditingNote(null)} style={{ padding: "5px 10px", fontSize: 10 }}>✕</Btn>
                        </div>
                      ) : (
                        <div onClick={() => { setEditingNote(l.id); setNoteVal(l.notes); }} style={{ fontSize: 11, color: l.notes ? "#778" : "#334", cursor: "pointer", fontStyle: l.notes ? "normal" : "italic" }}>
                          {l.notes || "+ add note"}
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                      <div style={{ fontSize: 10, padding: "3px 10px", borderRadius: 20, border: `1px solid ${sc(l.status)}`, color: sc(l.status), whiteSpace: "nowrap" }}>{l.status.toUpperCase()}</div>
                      <Select value={l.status} onChange={v => updateLeadStatus(l.id, v)} options={["New","Contacted","Followed Up","Replied","Closed","Lost"]} style={{ fontSize: 10, padding: "4px 8px", color: "#667" }} />
                    </div>
                  </div>
                </div>
              ))}
            </Card>
            {overdueLeads.length > 0 && (
              <div style={{ marginTop: 16, background: "#1a1208", border: "1px solid #fb923c44", borderRadius: 8, padding: 16, fontSize: 12, color: "#fb923c" }}>
                ⚡ {overdueLeads.length} lead{overdueLeads.length > 1 ? "s" : ""} need a follow-up.{" "}
                <span style={{ textDecoration: "underline", cursor: "pointer" }} onClick={() => setTab("Email Sequences")}>Write a sequence →</span>
              </div>
            )}
          </div>
        )}

        {/* CONTENT ENGINE */}
        {tab === "Content Engine" && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 10, color: "#334", letterSpacing: "0.14em", marginBottom: 4 }}>AUTOMATION</div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>Content Engine</div>
              <div style={{ fontSize: 12, color: "#556", marginTop: 4 }}>Generate ready-to-publish client content in seconds</div>
            </div>
            <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
              <Select value={contentType} onChange={setContentType} options={["LinkedIn post","Facebook ad","Email newsletter","Instagram caption","Cold email","Google ad copy","Twitter/X thread"]} style={{ flex: 1 }} />
              <Input value={clientIndustry} onChange={e => setClientIndustry(e.target.value)} placeholder="Client industry" style={{ flex: 1 }} />
            </div>
            <Btn style={{ width: "100%", marginBottom: 16, padding: 11 }} onClick={() => run(
              "You are an expert content marketer. Generate platform-native, ready-to-publish content. Be specific, punchy, and authentic. No corporate fluff.",
              `Generate a ${contentType} for a ${clientIndustry} business. Goal: generate leads and build trust. Make it feel real, not AI-written.`
            )} disabled={loading}>{loading ? "GENERATING..." : "GENERATE CONTENT →"}</Btn>
            <OutputBox output={output} loading={loading} label={`${contentType.toUpperCase()} · ${clientIndustry.toUpperCase()}`}
              onCopy={() => navigator.clipboard.writeText(output)}
              onRegen={() => run("Generate punchy, authentic marketing content. Platform-native.", `${contentType} for ${clientIndustry} business. Goal: leads + trust.`)} />
          </div>
        )}

        {/* PRICING BUILDER */}
        {tab === "Pricing Builder" && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 10, color: "#00f5c4", letterSpacing: "0.14em", marginBottom: 4 }}>NEW · SALES</div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>Pricing Page Builder</div>
              <div style={{ fontSize: 12, color: "#556", marginTop: 4 }}>AI builds your complete pricing strategy + page copy</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
              <Input value={pricingNiche} onChange={e => setPricingNiche(e.target.value)} placeholder="Target customer" />
              <Select value={pricingTier} onChange={setPricingTier} options={["2 tiers","3 tiers","4 tiers"]} style={{ width: "100%" }} />
              <Select value={pricingStyle} onChange={setPricingStyle} options={["value-based","competitive","penetration","premium"]} style={{ width: "100%" }} />
            </div>
            <Btn style={{ width: "100%", marginBottom: 16, padding: 11 }} onClick={() => run(
              `You are a SaaS pricing strategist and conversion copywriter. Build a complete ${pricingTier} pricing structure with: tier names, monthly prices, what's included, who it's for, and a page headline + subheadline. Use ${pricingStyle} pricing. Make it punchy and conversion-focused.`,
              `Pricing page for AI automation service sold to ${pricingNiche}. Includes: AI chatbot, automated email sequences, monthly AI content. Strategy: ${pricingStyle}.`
            )} disabled={loading}>{loading ? "BUILDING..." : "BUILD PRICING PAGE →"}</Btn>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
              <Card style={{ padding: 18 }}>
                <Label>PROVEN PRICE POINTS</Label>
                {[{ tier: "Starter", range: "$97–$197/mo", note: "1–2 deliverables" }, { tier: "Growth", range: "$247–$397/mo", note: "3–5 deliverables" }, { tier: "Scale", range: "$497–$797/mo", note: "Unlimited + white-label" }].map(p => (
                  <div key={p.tier} style={{ padding: "9px 0", borderBottom: "1px solid #111827", display: "flex", justifyContent: "space-between" }}>
                    <div><div style={{ fontSize: 12 }}>{p.tier}</div><div style={{ fontSize: 10, color: "#445" }}>{p.note}</div></div>
                    <div style={{ fontSize: 13, color: "#00f5c4", fontWeight: 700 }}>{p.range}</div>
                  </div>
                ))}
              </Card>
              <Card style={{ padding: 18 }}>
                <Label>CONVERSION TIPS</Label>
                {["Highlight middle tier as 'Most Popular'","Add annual discount (2 months free)","Include a money-back guarantee","Show # of agencies on each tier"].map((tip, i) => (
                  <div key={i} style={{ padding: "8px 0", borderBottom: i < 3 ? "1px solid #111827" : "none", fontSize: 12, color: "#667" }}>
                    <span style={{ color: "#00f5c4", marginRight: 8 }}>→</span>{tip}
                  </div>
                ))}
              </Card>
            </div>
            <OutputBox output={output} loading={loading} label={`PRICING PAGE · ${pricingNiche.toUpperCase()}`}
              onCopy={() => navigator.clipboard.writeText(output)}
              onRegen={() => run(`Build ${pricingTier} SaaS pricing. Names, prices, inclusions, headlines. Strategy: ${pricingStyle}.`, `AI automation service for ${pricingNiche}.`)} />
          </div>
        )}

        {/* ONBOARDING */}
        {tab === "Onboarding" && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 10, color: "#334", letterSpacing: "0.14em", marginBottom: 4 }}>AUTOMATION</div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>Agency Onboarding</div>
              <div style={{ fontSize: 12, color: "#556", marginTop: 4 }}>Full onboarding plan + welcome email for every new client</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
              <Input value={onboardName} onChange={e => setOnboardName(e.target.value)} placeholder="Agency name" />
              <textarea value={onboardNotes} onChange={e => setOnboardNotes(e.target.value)}
                placeholder="Notes about this agency (size, tech stack, goals, concerns...)" rows={3}
                style={{ background: "#0d1420", border: "1px solid #1a2235", borderRadius: 6, padding: "10px 14px", color: "#e8eaf0", fontSize: 13, fontFamily: "inherit", outline: "none", resize: "vertical", width: "100%", boxSizing: "border-box" }} />
              <Btn style={{ padding: 11 }} onClick={() => run(
                "You are an agency partnership specialist. Create a warm, clear, actionable onboarding plan: welcome email + 5-step week 1 checklist + 30-day success metrics.",
                `Onboarding for ${onboardName || "new agency partner"}. Notes: ${onboardNotes || "small team, new to AI tools"}.`
              )} disabled={loading}>{loading ? "GENERATING..." : "GENERATE ONBOARDING PLAN →"}</Btn>
            </div>
            <OutputBox output={output} loading={loading} label={`ONBOARDING · ${(onboardName || "NEW AGENCY").toUpperCase()}`}
              onCopy={() => navigator.clipboard.writeText(output)} />
          </div>
        )}

      </div>
    </div>
  );
}
