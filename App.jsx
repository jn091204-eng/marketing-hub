import { useState, useEffect, useCallback } from "react";

const ANTHROPIC_API = "https://api.anthropic.com/v1/messages";

const callClaude = async (systemPrompt, userPrompt) => {
  try {
    const response = await fetch(ANTHROPIC_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true"
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.error?.message || "API error " + response.status);
    }
    const data = await response.json();
    const text = data.content?.filter(b => b.type === "text").map(b => b.text).join("\n");
    if (!text) throw new Error("Empty response from API");
    return text;
  } catch (e) {
    throw new Error(e.message || "Failed to connect to API");
  }
};

const callClaudeMultiTurn = async (systemPrompt, messages) => {
  try {
    const response = await fetch(ANTHROPIC_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true"
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1500,
        system: systemPrompt,
        messages,
      }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.error?.message || "API error " + response.status);
    }
    const data = await response.json();
    const text = data.content?.filter(b => b.type === "text").map(b => b.text).join("\n");
    if (!text) throw new Error("Empty response from API");
    return text;
  } catch (e) {
    throw new Error(e.message || "Failed to connect to API");
  }
};

const callClaudeWithSearch = async (systemPrompt, userPrompt) => {
  try {
    const response = await fetch(ANTHROPIC_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true"
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
        tools: [{ type: "web_search_20250305", name: "web_search" }],
      }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.error?.message || "API error " + response.status);
    }
    const data = await response.json();
    const text = data.content?.filter((b) => b.type === "text").map((b) => b.text).join("\n");
    if (!text) throw new Error("Empty response from API");
    return text;
  } catch (e) {
    throw new Error(e.message || "Failed to connect to API");
  }
};

const TABS = ["Dashboard", "News", "LinkedIn", "Facebook", "Cold Email", "CRM", "Sequences", "Leads", "Submissions"];

const SYSTEM_INSURANCE = `You are writing on behalf of Joel, an experienced commercial property and casualty insurance broker.

JOEL'S VOICE — match this exactly:

WHO JOEL IS:
Joel earned his BS from Edinboro University and commissioned as an active duty Army officer. He served 10 years as an Army officer, reaching the rank of Major, leading soldiers — high-stakes decisions, difficult terrain, real consequences. Then he transitioned into commercial P&C insurance. This fall he becomes unit leader (office manager) of his office — same mission, different uniform.

He's a leader, a competitor, and a straight shooter. His LinkedIn spans insurance expertise AND leadership/life lessons — and the two worlds connect naturally because for Joel, they're the same world. Small school. Army commission. Rose to Major. A decade of service. Father of 3, soon to be 4. Now protecting businesses and building a team. He's not performing. He's lived it.

VOICE CHARACTERISTICS:
- Short sentences. No fluff. Say it and move on.
- Warm and genuinely human — not performed warmth, real warmth
- Zero corporate jargon. Sounds like a guy at a barbecue who happens to know everything about insurance and leadership
- Quietly confident — knows his stuff cold, doesn't need to prove it
- Competitive and proud of winning — but never cocky. Celebrates results matter-of-factly.
- Vulnerable when it serves the point — "We SUCKED" is a real Joel sentence
- Tells stories with scenes — real moments, real stakes, real outcomes
- Draws unexpected connections between worlds (sports, military, insurance, life)
- Uses lists with ❌/✅ when contrasting problems vs. solutions
- Uses real numbers and results casually — just proof, not a pitch
- Occasionally opens with a bold one-liner — "Just win baby." is the gold standard
- Repeats a word or phrase for rhythm when it lands — "Win. Win. Win."
- Credits people genuinely — coaches, commanders, colleagues, clients
- Calls out industry mediocrity directly but without bitterness — just facts
- Short declarative closers hit hardest — "I'm a believer." is peak Joel
- Short paragraphs. Sometimes one line. Sometimes one word. Let it breathe.
- Uses "..." for natural pauses and build-up
- NEVER uses: "In today's fast-paced world", "As a trusted advisor", "game-changer", "synergy", "leverage", "robust", or any marketing textbook phrase

TARGET NICHES:
- Non-profits and social services — mission-driven orgs with complex exposures and tight budgets who need a broker they can trust
- Small to medium manufacturers — workers comp, property, product liability, commercial auto. Meat and potatoes commercial.
- Both niches reward trust, education, and showing up in person

CONTENT THEMES (mix these naturally):
- Commercial insurance insights and wins
- Non-profit and social services risk education
- Manufacturing exposures — workers comp, product liability, property
- Why relationship beats price every time in these niches
- Leadership and accountability
- Coaching and being coached
- Military experience and lessons
- Competing and winning the right way
- Serving clients like you serve your team

LinkedIn/Facebook style: bold hook → story or insight → punchy landing. Real. Confident. Human.
Cold emails: direct, warm, no hard sell — like a helpful colleague, not a salesperson.
If it sounds like a template, it's wrong. Rewrite until it sounds like Joel wrote it at 6am before anyone else was up.`;

const SYSTEM_UNDERWRITING = `You are an experienced commercial P&C insurance broker writing underwriting submission narratives. Your job is to produce a clean, professional narrative that helps underwriters quickly understand the account.

Style rules:
- Lead with a BLUF (Bottom Line Up Front) — 2-3 sentences max
- Short paragraphs, no fluff, no jargon
- Plain language — say "no ACV if you have a claim" not "no ACV haircut"
- Quiet confidence, no hype
- Structure: BLUF → Operations Overview → Key Exposures → Risk Quality / Controls → Loss History → Coverage Request
- Use bold section headers
- Keep the whole narrative under 400 words unless complexity demands more
- Write like a broker who knows the account, not a form letter`;

const LINES_OF_BUSINESS = ["Commercial Package (BOP/CPP)", "General Liability", "Workers Comp", "Commercial Auto", "Umbrella / Excess"];

const industries = [
  "Manufacturing", "Hospitality", "Healthcare", "Construction",
  "Retail", "Technology", "Real Estate", "Transportation", "Restaurants", "Professional Services"
];

const painPoints = [
  "underinsured", "rising premiums", "coverage gaps", "claims experience",
  "business interruption", "cyber liability", "workers comp costs", "fleet risk"
];

const EMPTY_SUB_FORM = {
  accountName: "", industry: "", state: "", operations: "",
  employees: "", revenue: "", exposures: "", controls: "",
  lossHistory: "", priorCarrier: "", lines: [], notes: ""
};

export default function InsuranceMarketing() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [loading, setLoading] = useState({});
  const [content, setContent] = useState({});
  const [emails, setEmails] = useState([]);
  const [emailForm, setEmailForm] = useState({ company: "", industry: industries[0], contact: "", pain: painPoints[0], notes: "" });
  const [crmContacts, setCrmContacts] = useState([]);
  const [newContact, setNewContact] = useState({ company: "", contact: "", industry: industries[0], status: "New", notes: "", phone: "", email: "" });
  const [crmFilter, setCrmFilter] = useState("All");
  const [toast, setToast] = useState(null);
  const [storageReady, setStorageReady] = useState(false);
  const [sequences, setSequences] = useState({});
  const [selectedContact, setSelectedContact] = useState(null);
  const [generatingSeq, setGeneratingSeq] = useState(null);
  const [leads, setLeads] = useState([]);

  const [subStep, setSubStep] = useState(0);
  const [subForm, setSubForm] = useState(EMPTY_SUB_FORM);
  const [subNarrative, setSubNarrative] = useState("");
  const [subFeedback, setSubFeedback] = useState("");
  const [subRefining, setSubRefining] = useState(false);
  const [subCopied, setSubCopied] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try { const r = await window.storage.get("crm_contacts"); if (r?.value) setCrmContacts(JSON.parse(r.value)); } catch (e) {}
      try { const r = await window.storage.get("saved_emails"); if (r?.value) setEmails(JSON.parse(r.value)); } catch (e) {}
      try { const r = await window.storage.get("sequences"); if (r?.value) setSequences(JSON.parse(r.value)); } catch (e) {}
      try {
        const r = await window.storage.get("crm_contacts", true);
        if (r?.value) { const all = JSON.parse(r.value); const fl = all.filter(c => c.source === "Lead Form"); if (fl.length > 0) setLeads(l => [...l, ...fl]); }
      } catch (e) {}
      setStorageReady(true);
    };
    loadData();
  }, []);

  useEffect(() => { if (!storageReady) return; window.storage.set("crm_contacts", JSON.stringify(crmContacts)).catch(() => {}); }, [crmContacts, storageReady]);
  useEffect(() => { if (!storageReady) return; window.storage.set("saved_emails", JSON.stringify(emails)).catch(() => {}); }, [emails, storageReady]);
  useEffect(() => { if (!storageReady) return; window.storage.set("sequences", JSON.stringify(sequences)).catch(() => {}); }, [sequences, storageReady]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const generate = useCallback(async (key, systemPrompt, userPrompt, useSearch = false) => {
    setLoading(l => ({ ...l, [key]: true }));
    try {
      const fn = useSearch ? callClaudeWithSearch : callClaude;
      const result = await fn(systemPrompt, userPrompt);
      setContent(c => ({ ...c, [key]: result }));
    } catch (e) {
      setContent(c => ({ ...c, [key]: "Error: " + e.message }));
    }
    setLoading(l => ({ ...l, [key]: false }));
  }, []);

  const generateEmail = async () => {
    const { company, industry, contact, pain, notes } = emailForm;
    if (!company || !contact) { showToast("Please fill in Company and Contact Name"); return; }
    const key = `email_${Date.now()}`;
    setLoading(l => ({ ...l, [key]: true }));
    const prompt = `Write a cold email to ${contact} at ${company}, a ${industry} business. Pain point to address: ${pain}. ${notes ? "Additional context: " + notes : ""} Subject line + email body. Professional but personable. Under 200 words. End with a clear CTA.`;
    const result = await callClaude(SYSTEM_INSURANCE, prompt);
    setEmails(e => [{ id: key, ...emailForm, content: result, date: new Date().toLocaleDateString(), status: "Draft" }, ...e]);
    setLoading(l => ({ ...l, [key]: false }));
    showToast("Email generated!");
  };

  const addContact = () => {
    if (!newContact.company) { showToast("Company name required"); return; }
    setCrmContacts(c => [...c, { ...newContact, id: Date.now(), lastAction: "Added to pipeline", date: new Date().toLocaleDateString() }]);
    setNewContact({ company: "", contact: "", industry: industries[0], status: "New", notes: "", phone: "", email: "" });
    showToast("Contact added! Go to Sequences tab to generate their outreach plan.");
  };

  const SEQUENCE_TEMPLATE = [
    { day: 1,  type: "email",       icon: "✉️",  label: "Cold Intro Email" },
    { day: 3,  type: "linkedin",    icon: "💼",  label: "LinkedIn Connection Request" },
    { day: 5,  type: "call",        icon: "📞",  label: "Intro Phone Call" },
    { day: 8,  type: "email",       icon: "✉️",  label: "Value-Add Follow-Up Email" },
    { day: 12, type: "sms",         icon: "💬",  label: "Quick Check-In Text" },
    { day: 16, type: "call",        icon: "📞",  label: "Follow-Up Call" },
    { day: 21, type: "email",       icon: "✉️",  label: "Industry Insight Email" },
    { day: 25, type: "handwritten", icon: "✍️",  label: "Handwritten Note" },
    { day: 30, type: "inperson",    icon: "🤝",  label: "In-Person Drop-In" },
    { day: 35, type: "email",       icon: "✉️",  label: "Final Touch Email" },
  ];

  const typeColor = (t) => ({ email: "#C8A96E", linkedin: "#0A66C2", call: "#81C784", sms: "#CE93D8", handwritten: "#FFB74D", inperson: "#4FC3F7" }[t] || "#aaa");

  const generateSequence = async (contact) => {
    setGeneratingSeq(contact.id);
    const steps = [];
    for (const step of SEQUENCE_TEMPLATE) {
      const prompts = {
        email: `Write a ${step.label} for ${contact.contact} at ${contact.company} (${contact.industry}). Day ${step.day} of outreach sequence. ${contact.notes ? "Context: " + contact.notes : ""} Subject line + short email body under 150 words. Sound like Joel — direct, warm, real.`,
        linkedin: `Write a LinkedIn connection request note to ${contact.contact} at ${contact.company} (${contact.industry}). Day ${step.day}. Max 300 characters. Sound like Joel — genuine, not salesy.`,
        call: `Write a phone call script/talking points for Joel calling ${contact.contact} at ${contact.company} (${contact.industry}). Day ${step.day}. Include: opening line, 2-3 key points, how to handle voicemail, close. Conversational — sound like Joel, not a telemarketer.`,
        sms: `Write a short SMS text from Joel to ${contact.contact} at ${contact.company}. Day ${step.day}. Max 160 characters. Casual, warm, genuine. Not a pitch.`,
        handwritten: `Write what Joel should say in a handwritten note to ${contact.contact} at ${contact.company} (${contact.industry}). Day ${step.day}. 3-4 sentences max. Personal, genuine, memorable.`,
        inperson: `Write a brief script/guide for Joel dropping in on ${contact.contact} at ${contact.company} (${contact.industry}) in person on day ${step.day}. Include: what to bring, opening line, goal of visit, how to leave the door open. Joel style — boots on the ground, no pressure.`,
      };
      const stepContent = await callClaude(SYSTEM_INSURANCE, prompts[step.type] || "");
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + step.day - 1);
      steps.push({ ...step, content: stepContent, dueDate: dueDate.toLocaleDateString(), completed: false });
    }
    setSequences(s => ({ ...s, [contact.id]: { contactId: contact.id, company: contact.company, contact: contact.contact, steps, createdDate: new Date().toLocaleDateString() } }));
    setGeneratingSeq(null);
    setSelectedContact(contact.id);
    showToast("Sequence generated for " + contact.company + "!");
  };

  const importFromCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target.result;
        const newline = text.indexOf("\r\n") !== -1 ? "\r\n" : "\n";
        const lines = text.split(newline).filter(l => l.trim());
        if (lines.length < 2) { showToast("CSV appears empty"); return; }
        const parseRow = (row) => {
          const result = []; let cur = "", inQuote = false;
          for (let i = 0; i < row.length; i++) {
            const ch = row[i];
            if (ch === '"') { inQuote = !inQuote; }
            else if (ch === ',' && !inQuote) { result.push(cur.trim()); cur = ""; }
            else { cur += ch; }
          }
          result.push(cur.trim()); return result;
        };
        const headers = parseRow(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ""));
        const col = (names) => { for (const n of names) { const idx = headers.findIndex(h => h.includes(n)); if (idx !== -1) return idx; } return -1; };
        const fnIdx = col(["firstname","first"]), lnIdx = col(["lastname","last"]), coIdx = col(["company","companyname","organization"]);
        const emIdx = col(["email"]), phIdx = col(["phone","phonenumber","mobilephone"]);
        const inIdx = col(["industry"]), stIdx = col(["leadstatus","lifecyclestage","status"]), noIdx = col(["notes","description","comments"]);
        const newContacts = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = parseRow(lines[i]);
          if (cols.every(c => !c)) continue;
          const fn = fnIdx >= 0 ? cols[fnIdx] || "" : "", ln = lnIdx >= 0 ? cols[lnIdx] || "" : "";
          const contactName = [fn, ln].filter(Boolean).join(" ") || "Unknown";
          const company = coIdx >= 0 ? cols[coIdx] || "" : "";
          const email = emIdx >= 0 ? cols[emIdx] || "" : "";
          const phone = phIdx >= 0 ? cols[phIdx] || "" : "";
          const industry = inIdx >= 0 ? cols[inIdx] || industries[0] : industries[0];
          const rawStatus = stIdx >= 0 ? cols[stIdx] || "New" : "New";
          const notes = noIdx >= 0 ? cols[noIdx] || "" : "";
          const statusMap = { lead:"New",subscriber:"New",marketingqualifiedlead:"New",salesqualifiedlead:"New",opportunity:"Replied",customer:"Closed",evangelist:"Closed",other:"New",open:"New",inprogress:"Replied",opendeals:"Replied",unqualified:"Lost",connected:"Replied" };
          const mappedStatus = statusMap[rawStatus.toLowerCase().split(" ").join("")] || "New";
          if (!company && contactName === "Unknown") continue;
          newContacts.push({ id: Date.now() + i, company: company || contactName, contact: contactName, email, phone, industry, status: mappedStatus, notes, lastAction: "Imported from HubSpot", date: new Date().toLocaleDateString() });
        }
        if (newContacts.length === 0) { showToast("No valid contacts found in CSV"); return; }
        setCrmContacts(c => [...c, ...newContacts]);
        showToast("Imported " + newContacts.length + " contacts from HubSpot");
      } catch (err) { showToast("Import failed: " + err.message); }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const toggleStepComplete = (contactId, stepIdx) => {
    setSequences(s => { const seq = { ...s[contactId] }; seq.steps = seq.steps.map((step, i) => i === stepIdx ? { ...step, completed: !step.completed } : step); return { ...s, [contactId]: seq }; });
  };

  const updateStatus = (id, status) => {
    setCrmContacts(c => c.map(x => x.id === id ? { ...x, status, lastAction: `Status → ${status}` } : x));
  };

  const statusColor = (s) => ({ New: "#64B5F6", Sent: "#FFB74D", Replied: "#81C784", Meeting: "#CE93D8", Closed: "#4CAF50", Lost: "#EF5350" }[s] || "#aaa");
  const filteredContacts = crmFilter === "All" ? crmContacts : crmContacts.filter(c => c.status === crmFilter);
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const setSubField = (k, v) => setSubForm(f => ({ ...f, [k]: v }));
  const toggleLine = (l) => setSubField("lines", subForm.lines.includes(l) ? subForm.lines.filter(x => x !== l) : [...subForm.lines, l]);
  const subCanSubmit = subForm.accountName && subForm.industry && subForm.operations && subForm.exposures && subForm.lines.length > 0;
  const buildSubPrompt = () => `Account Name: ${subForm.accountName}\nIndustry / Class: ${subForm.industry}\nState: ${subForm.state || "not provided"}\nOperations: ${subForm.operations}\nEmployees: ${subForm.employees || "not provided"}\nRevenue: ${subForm.revenue || "not provided"}\nKey Exposures: ${subForm.exposures}\nRisk Controls: ${subForm.controls || "not provided"}\nLoss History: ${subForm.lossHistory || "none provided"}\nPrior Carrier: ${subForm.priorCarrier || "not provided"}\nLines Requested: ${subForm.lines.join(", ")}\nAdditional Notes: ${subForm.notes || "none"}\n\nWrite a complete underwriting submission narrative for this account.`;

  const generateSubmission = async () => {
    setSubStep(1);
    try {
      const result = await callClaudeMultiTurn(SYSTEM_UNDERWRITING, [{ role: "user", content: buildSubPrompt() }]);
      setSubNarrative(result);
      setSubStep(2);
    } catch (e) {
      setSubNarrative("Error: " + e.message);
      setSubStep(2);
    }
  };

  const refineSubmission = async () => {
    if (!subFeedback.trim()) return;
    setSubRefining(true);
    try {
      const result = await callClaudeMultiTurn(SYSTEM_UNDERWRITING, [
        { role: "user", content: buildSubPrompt() },
        { role: "assistant", content: subNarrative },
        { role: "user", content: `Revise the narrative with this feedback: ${subFeedback}` }
      ]);
      setSubNarrative(result);
      setSubFeedback("");
    } catch (e) {}
    setSubRefining(false);
  };

  const copySubmission = () => {
    navigator.clipboard.writeText(subNarrative);
    setSubCopied(true);
    showToast("Copied to clipboard!");
    setTimeout(() => setSubCopied(false), 2000);
  };

  const exportSubmission = () => {
    const blob = new Blob([subNarrative], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${subForm.accountName || "Submission"}_Narrative.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetSubmission = () => {
    setSubStep(0); setSubForm(EMPTY_SUB_FORM); setSubNarrative(""); setSubFeedback(""); setSubCopied(false);
  };

  const inputStyle = { width: "100%", padding: "10px 14px", background: "#0A0F1E", border: "1px solid #1E3A5F", borderRadius: 4, color: "#E8EDF5", fontSize: 13, boxSizing: "border-box", fontFamily: "Georgia, serif" };
  const taStyle = { ...inputStyle, resize: "vertical", minHeight: 80 };
  const btnGold = { padding: "7px 14px", background: "transparent", border: "1px solid #C8A96E", color: "#C8A96E", borderRadius: 4, cursor: "pointer", fontSize: 11, fontFamily: "'Courier New', monospace" };

  return (
    <div style={{ minHeight: "100vh", background: "#0A0F1E", color: "#E8EDF5", fontFamily: "'Georgia', serif" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ background: "linear-gradient(135deg, #0D1B3E 0%, #162447 50%, #1A3A5C 100%)", borderBottom: "1px solid #1E3A5F", padding: "20px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#C8A96E", letterSpacing: "0.05em" }}>⚡ COMMERCIAL P&C</div>
          <div style={{ fontSize: 13, color: "#7B9EC0", marginTop: 2, fontFamily: "'Courier New', monospace", letterSpacing: "0.1em" }}>MARKETING COMMAND CENTER</div>
        </div>
        <div style={{ textAlign: "right", fontSize: 12, color: "#7B9EC0", fontFamily: "'Courier New', monospace" }}>
          <div>{today}</div>
          <div style={{ color: "#C8A96E", marginTop: 2 }}>AI-POWERED ● ALWAYS ON</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 4, padding: "12px 32px", background: "#0D1525", borderBottom: "1px solid #1A2E4A", overflowX: "auto" }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: "8px 20px", borderRadius: 4, border: "none", cursor: "pointer", fontFamily: "'Courier New', monospace", fontSize: 12, letterSpacing: "0.08em", fontWeight: 600, whiteSpace: "nowrap", background: activeTab === tab ? "#C8A96E" : "transparent", color: activeTab === tab ? "#0A0F1E" : "#7B9EC0", transition: "all 0.2s" }}>{tab.toUpperCase()}</button>
        ))}
      </div>

      {toast && (
        <div style={{ position: "fixed", top: 20, right: 20, background: "#C8A96E", color: "#0A0F1E", padding: "12px 20px", borderRadius: 6, fontWeight: 700, fontSize: 13, zIndex: 9999, fontFamily: "'Courier New', monospace" }}>{toast}</div>
      )}

      <div style={{ padding: "28px 32px", maxWidth: 1100, margin: "0 auto" }}>

        {activeTab === "Dashboard" && (
          <div>
            <h2 style={{ color: "#C8A96E", fontSize: 20, marginBottom: 6 }}>Marketing Dashboard</h2>
            <p style={{ color: "#7B9EC0", fontSize: 13, marginBottom: 28 }}>Your daily AI-powered commercial insurance marketing engine.</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 28 }}>
              {[
                { label: "Contacts in Pipeline", value: crmContacts.length, icon: "👥" },
                { label: "Emails Generated", value: emails.length, icon: "✉️" },
                { label: "Active Prospects", value: crmContacts.filter(c => ["Sent","Replied","Meeting"].includes(c.status)).length, icon: "🎯" },
                { label: "Closed Deals", value: crmContacts.filter(c => c.status === "Closed").length, icon: "✅" },
              ].map(stat => (
                <div key={stat.label} style={{ background: "#0D1B3E", border: "1px solid #1E3A5F", borderRadius: 8, padding: "20px 24px" }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{stat.icon}</div>
                  <div style={{ fontSize: 32, fontWeight: 700, color: "#C8A96E" }}>{stat.value}</div>
                  <div style={{ fontSize: 12, color: "#7B9EC0", fontFamily: "'Courier New', monospace", marginTop: 4 }}>{stat.label}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[
                { key: "dashboard_tip", label: "🔥 Today's Marketing Focus", prompt: "Give me ONE specific, actionable commercial P&C insurance marketing tip for today. Be specific, bold, and practical. 3-4 sentences max." },
                { key: "dashboard_trend", label: "📊 Market Pulse", prompt: "What is the single most important commercial insurance market trend right now that I should use in my outreach today? Be specific with a brief rationale. 3-4 sentences." },
              ].map(item => (
                <div key={item.key} style={{ background: "#0D1B3E", border: "1px solid #1E3A5F", borderRadius: 8, padding: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#C8A96E", marginBottom: 12, fontFamily: "'Courier New', monospace" }}>{item.label}</div>
                  {content[item.key] ? (
                    <p style={{ color: "#B8CCE0", fontSize: 14, lineHeight: 1.7, margin: 0 }}>{content[item.key]}</p>
                  ) : (
                    <button onClick={() => generate(item.key, SYSTEM_INSURANCE, item.prompt)} disabled={loading[item.key]} style={{ padding: "10px 18px", background: loading[item.key] ? "#1E3A5F" : "#C8A96E", color: loading[item.key] ? "#7B9EC0" : "#0A0F1E", border: "none", borderRadius: 4, cursor: "pointer", fontWeight: 700, fontSize: 12, fontFamily: "'Courier New', monospace" }}>
                      {loading[item.key] ? "GENERATING..." : "GENERATE"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "News" && (
          <div>
            <h2 style={{ color: "#C8A96E", fontSize: 20, marginBottom: 6 }}>Insurance News Brief</h2>
            <p style={{ color: "#7B9EC0", fontSize: 13, marginBottom: 24 }}>Daily commercial P&C intelligence for your outreach and conversations.</p>
            <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
              {[
                { key: "news_daily", label: "📰 Daily Brief", prompt: "Summarize today's top 5 commercial property and casualty insurance news items. Include: market hardening, major claims, regulatory changes, emerging risks (cyber, climate, etc.), and carrier updates. Format as a scannable brief with a headline and 1-2 sentence summary for each." },
                { key: "news_rates", label: "📈 Rate Trends", prompt: "What are the current commercial P&C insurance rate trends across key lines: commercial property, general liability, workers comp, commercial auto, umbrella, and cyber? Provide a brief update on each with direction (hardening/softening) and key drivers." },
                { key: "news_talk", label: "💬 Client Talking Points", prompt: "Give me 5 compelling talking points I can use TODAY when calling on commercial insurance prospects. These should reference current market conditions, emerging risks, or news events that make the conversation timely and urgent." },
              ].map(item => (
                <button key={item.key} onClick={() => generate(item.key, SYSTEM_INSURANCE, item.prompt, true)} disabled={loading[item.key]} style={{ padding: "10px 18px", background: loading[item.key] ? "#1E3A5F" : content[item.key] ? "#1A3A1A" : "#162447", border: `1px solid ${content[item.key] ? "#4CAF50" : "#1E3A5F"}`, borderRadius: 4, cursor: "pointer", color: content[item.key] ? "#81C784" : "#B8CCE0", fontSize: 12, fontFamily: "'Courier New', monospace", fontWeight: 600 }}>
                  {loading[item.key] ? "LOADING..." : item.label}
                </button>
              ))}
            </div>
            {["news_daily","news_rates","news_talk"].map(key => content[key] && (
              <div key={key} style={{ background: "#0D1B3E", border: "1px solid #1E3A5F", borderRadius: 8, padding: 24, marginBottom: 16 }}>
                <pre style={{ color: "#B8CCE0", fontSize: 14, lineHeight: 1.8, margin: 0, whiteSpace: "pre-wrap", fontFamily: "Georgia, serif" }}>{content[key]}</pre>
                <button onClick={() => { navigator.clipboard.writeText(content[key]); showToast("Copied!"); }} style={{ ...btnGold, marginTop: 12 }}>COPY</button>
              </div>
            ))}
          </div>
        )}

        {activeTab === "LinkedIn" && (
          <div>
            <h2 style={{ color: "#C8A96E", fontSize: 20, marginBottom: 6 }}>LinkedIn Content</h2>
            <p style={{ color: "#7B9EC0", fontSize: 13, marginBottom: 24 }}>Daily LinkedIn posts that position you as a commercial insurance authority.</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
              {[
                { key: "li_insight", label: "💡 Market Insight", prompt: "Write a LinkedIn post about a current commercial insurance market trend or insight. Hook opening line, specific insight, brief personal perspective, question to drive engagement. 150-200 words. Max 3 hashtags." },
                { key: "li_tip", label: "🛡️ Risk Tip", prompt: "Write a LinkedIn post sharing a valuable risk management tip for business owners. Educational and practical. Coverage gap or emerging risk they may not be thinking about. Hook + insight + CTA. 150-200 words. Max 3 hashtags." },
                { key: "li_story", label: "📖 Client Story", prompt: "Write a LinkedIn post using a fictional but realistic client story about how proper commercial insurance coverage saved a business. Compelling — situation, risk, outcome. Protect 'client's' identity. Lesson and soft CTA. 150-200 words." },
                { key: "li_stat", label: "📊 Industry Stat", prompt: "Write a LinkedIn post built around a compelling commercial insurance statistic that would grab a business owner's attention. Hook + stat + insight + what they should do. 150-200 words. Max 3 hashtags." },
              ].map(item => (
                <button key={item.key} onClick={() => generate(item.key, SYSTEM_INSURANCE, item.prompt)} disabled={loading[item.key]} style={{ padding: "10px 16px", background: loading[item.key] ? "#1E3A5F" : "#162447", border: "1px solid #0A66C2", borderRadius: 4, cursor: "pointer", color: "#B8CCE0", fontSize: 12, fontFamily: "'Courier New', monospace", fontWeight: 600 }}>
                  {loading[item.key] ? "GENERATING..." : item.label}
                </button>
              ))}
            </div>
            {["li_insight","li_tip","li_story","li_stat"].map(key => content[key] && (
              <div key={key} style={{ background: "#0D1B3E", border: "1px solid #0A66C2", borderRadius: 8, padding: 24, marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: "#0A66C2", fontFamily: "'Courier New', monospace", marginBottom: 12, fontWeight: 700 }}>LINKEDIN POST</div>
                <p style={{ color: "#B8CCE0", fontSize: 14, lineHeight: 1.8, margin: 0, whiteSpace: "pre-wrap" }}>{content[key]}</p>
                <button onClick={() => { navigator.clipboard.writeText(content[key]); showToast("Copied to clipboard!"); }} style={{ marginTop: 12, padding: "6px 14px", background: "transparent", border: "1px solid #0A66C2", color: "#0A66C2", borderRadius: 4, cursor: "pointer", fontSize: 11, fontFamily: "'Courier New', monospace" }}>COPY POST</button>
              </div>
            ))}
          </div>
        )}

        {activeTab === "Facebook" && (
          <div>
            <h2 style={{ color: "#C8A96E", fontSize: 20, marginBottom: 6 }}>Facebook Content</h2>
            <p style={{ color: "#7B9EC0", fontSize: 13, marginBottom: 24 }}>Engaging Facebook posts for local business owners and community presence.</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
              {[
                { key: "fb_awareness", label: "⚠️ Risk Awareness", prompt: "Write a Facebook post about a risk that local business owners may be overlooking. Conversational, warm, community-focused. Not overly salesy. Feels like advice from a trusted local expert. 100-150 words. Question at the end." },
                { key: "fb_seasonal", label: "🗓️ Seasonal Post", prompt: "Write a Facebook post about a seasonal or timely commercial insurance topic relevant to small business owners right now. Conversational and helpful. 100-150 words." },
                { key: "fb_myth", label: "🚫 Myth Buster", prompt: "Write a Facebook post busting a common myth about commercial business insurance. Start with the myth, debunk it with the truth. Punchy and educational. Friendly tone. 100-130 words. CTA to reach out for a free review." },
                { key: "fb_promo", label: "📣 Free Review Promo", prompt: "Write a Facebook post promoting a free commercial insurance review for local businesses. Valuable and low-pressure. Focus on what they'll learn. 100-130 words. Soft CTA." },
              ].map(item => (
                <button key={item.key} onClick={() => generate(item.key, SYSTEM_INSURANCE, item.prompt)} disabled={loading[item.key]} style={{ padding: "10px 16px", background: loading[item.key] ? "#1E3A5F" : "#162447", border: "1px solid #1877F2", borderRadius: 4, cursor: "pointer", color: "#B8CCE0", fontSize: 12, fontFamily: "'Courier New', monospace", fontWeight: 600 }}>
                  {loading[item.key] ? "GENERATING..." : item.label}
                </button>
              ))}
            </div>
            {["fb_awareness","fb_seasonal","fb_myth","fb_promo"].map(key => content[key] && (
              <div key={key} style={{ background: "#0D1B3E", border: "1px solid #1877F2", borderRadius: 8, padding: 24, marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: "#1877F2", fontFamily: "'Courier New', monospace", marginBottom: 12, fontWeight: 700 }}>FACEBOOK POST</div>
                <p style={{ color: "#B8CCE0", fontSize: 14, lineHeight: 1.8, margin: 0, whiteSpace: "pre-wrap" }}>{content[key]}</p>
                <button onClick={() => { navigator.clipboard.writeText(content[key]); showToast("Copied to clipboard!"); }} style={{ marginTop: 12, padding: "6px 14px", background: "transparent", border: "1px solid #1877F2", color: "#1877F2", borderRadius: 4, cursor: "pointer", fontSize: 11, fontFamily: "'Courier New', monospace" }}>COPY POST</button>
              </div>
            ))}
          </div>
        )}

        {activeTab === "Cold Email" && (
          <div>
            <h2 style={{ color: "#C8A96E", fontSize: 20, marginBottom: 6 }}>Cold Email Generator</h2>
            <p style={{ color: "#7B9EC0", fontSize: 13, marginBottom: 24 }}>Craft personalized cold outreach emails for commercial prospects.</p>
            <div style={{ background: "#0D1B3E", border: "1px solid #1E3A5F", borderRadius: 8, padding: 24, marginBottom: 24 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                {[{ field: "company", label: "Company Name *", placeholder: "Apex Manufacturing Inc." }, { field: "contact", label: "Contact Name *", placeholder: "John Smith" }].map(f => (
                  <div key={f.field}>
                    <label style={{ fontSize: 11, color: "#7B9EC0", fontFamily: "'Courier New', monospace", display: "block", marginBottom: 6 }}>{f.label}</label>
                    <input value={emailForm[f.field]} onChange={e => setEmailForm(ef => ({ ...ef, [f.field]: e.target.value }))} placeholder={f.placeholder} style={inputStyle} />
                  </div>
                ))}
                <div>
                  <label style={{ fontSize: 11, color: "#7B9EC0", fontFamily: "'Courier New', monospace", display: "block", marginBottom: 6 }}>INDUSTRY</label>
                  <select value={emailForm.industry} onChange={e => setEmailForm(ef => ({ ...ef, industry: e.target.value }))} style={inputStyle}>{industries.map(i => <option key={i}>{i}</option>)}</select>
                </div>
                <div>
                  <label style={{ fontSize: 11, color: "#7B9EC0", fontFamily: "'Courier New', monospace", display: "block", marginBottom: 6 }}>PAIN POINT TO ADDRESS</label>
                  <select value={emailForm.pain} onChange={e => setEmailForm(ef => ({ ...ef, pain: e.target.value }))} style={inputStyle}>{painPoints.map(p => <option key={p}>{p}</option>)}</select>
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 11, color: "#7B9EC0", fontFamily: "'Courier New', monospace", display: "block", marginBottom: 6 }}>ADDITIONAL CONTEXT (optional)</label>
                <input value={emailForm.notes} onChange={e => setEmailForm(ef => ({ ...ef, notes: e.target.value }))} placeholder="e.g. Recently expanded, had a claim last year, referral from..." style={inputStyle} />
              </div>
              <button onClick={generateEmail} style={{ padding: "12px 28px", background: "#C8A96E", border: "none", borderRadius: 4, cursor: "pointer", fontWeight: 700, fontSize: 13, color: "#0A0F1E", fontFamily: "'Courier New', monospace" }}>✉️ GENERATE EMAIL</button>
            </div>
            {emails.map(email => (
              <div key={email.id} style={{ background: "#0D1B3E", border: "1px solid #1E3A5F", borderRadius: 8, padding: 24, marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                  <div><span style={{ fontSize: 13, fontWeight: 700, color: "#C8A96E" }}>{email.company}</span><span style={{ fontSize: 12, color: "#7B9EC0", marginLeft: 12 }}>{email.contact} · {email.industry}</span></div>
                  <span style={{ fontSize: 11, color: "#7B9EC0", fontFamily: "'Courier New', monospace" }}>{email.date}</span>
                </div>
                <pre style={{ color: "#B8CCE0", fontSize: 13, lineHeight: 1.8, margin: 0, whiteSpace: "pre-wrap", fontFamily: "Georgia, serif" }}>{email.content}</pre>
                <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                  <button onClick={() => { navigator.clipboard.writeText(email.content); showToast("Email copied!"); }} style={btnGold}>COPY</button>
                  <button onClick={() => setEmails(e => e.filter(x => x.id !== email.id))} style={{ ...btnGold, borderColor: "#EF5350", color: "#EF5350" }}>DELETE</button>
                </div>
              </div>
            ))}
            {emails.length === 0 && <div style={{ color: "#7B9EC0", fontSize: 13, textAlign: "center", padding: 40 }}>No emails generated yet. Fill in the form above to create your first cold email.</div>}
          </div>
        )}

        {activeTab === "CRM" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
              <h2 style={{ color: "#C8A96E", fontSize: 20, margin: 0 }}>Prospect CRM</h2>
              <label style={{ padding: "10px 18px", background: "#162447", border: "1px solid #C8A96E", borderRadius: 4, cursor: "pointer", fontSize: 12, color: "#C8A96E", fontFamily: "'Courier New', monospace", fontWeight: 700, whiteSpace: "nowrap" }}>
                📥 IMPORT HUBSPOT CSV<input type="file" accept=".csv" onChange={importFromCSV} style={{ display: "none" }} />
              </label>
            </div>
            <p style={{ color: "#7B9EC0", fontSize: 13, marginBottom: 24 }}>Export contacts from HubSpot as CSV and import directly. All fields mapped automatically.</p>
            <div style={{ background: "#0D1B3E", border: "1px solid #1E3A5F", borderRadius: 8, padding: 20, marginBottom: 24 }}>
              <div style={{ fontSize: 12, color: "#C8A96E", fontFamily: "'Courier New', monospace", fontWeight: 700, marginBottom: 14 }}>+ ADD PROSPECT</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 12 }}>
                {[["company","Company *"],["contact","Contact Name"],["email","Email"],["phone","Phone"],["notes","Notes / Context"]].map(([field, ph]) => (
                  <input key={field} value={newContact[field]} onChange={e => setNewContact(n => ({ ...n, [field]: e.target.value }))} placeholder={ph} style={{ padding: "8px 12px", background: "#0A0F1E", border: "1px solid #1E3A5F", borderRadius: 4, color: "#E8EDF5", fontSize: 12 }} />
                ))}
                <select value={newContact.industry} onChange={e => setNewContact(n => ({ ...n, industry: e.target.value }))} style={{ padding: "8px 12px", background: "#0A0F1E", border: "1px solid #1E3A5F", borderRadius: 4, color: "#E8EDF5", fontSize: 12 }}>{industries.map(i => <option key={i}>{i}</option>)}</select>
                <button onClick={addContact} style={{ padding: "8px 16px", background: "#C8A96E", border: "none", borderRadius: 4, cursor: "pointer", fontWeight: 700, fontSize: 12, color: "#0A0F1E", fontFamily: "'Courier New', monospace" }}>ADD</button>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
              {["All","New","Sent","Replied","Meeting","Closed","Lost"].map(s => (
                <button key={s} onClick={() => setCrmFilter(s)} style={{ padding: "6px 14px", borderRadius: 4, border: `1px solid ${s === "All" ? "#C8A96E" : statusColor(s)}`, background: crmFilter === s ? (s === "All" ? "#C8A96E" : statusColor(s)) : "transparent", color: crmFilter === s ? "#0A0F1E" : "#B8CCE0", cursor: "pointer", fontSize: 11, fontFamily: "'Courier New', monospace", fontWeight: 600 }}>{s}</button>
              ))}
            </div>
            <div style={{ background: "#0D1B3E", border: "1px solid #1E3A5F", borderRadius: 8, overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 0.8fr 1.2fr 0.8fr 0.8fr", padding: "12px 16px", borderBottom: "1px solid #1E3A5F", fontSize: 10, color: "#7B9EC0", fontFamily: "'Courier New', monospace", fontWeight: 700, letterSpacing: "0.08em" }}>
                <span>COMPANY</span><span>CONTACT</span><span>INDUSTRY</span><span>STATUS</span><span>LAST ACTION</span><span>UPDATE</span><span>SEQUENCE</span>
              </div>
              {filteredContacts.map(c => (
                <div key={c.id} style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 0.8fr 1.2fr 0.8fr 0.8fr", padding: "14px 16px", borderBottom: "1px solid #0F2035", alignItems: "center", fontSize: 13 }}>
                  <span style={{ color: "#E8EDF5", fontWeight: 600 }}>{c.company}</span>
                  <span style={{ color: "#B8CCE0" }}>{c.contact}</span>
                  <span style={{ color: "#7B9EC0", fontSize: 12 }}>{c.industry}</span>
                  <span style={{ color: statusColor(c.status), fontSize: 11, fontFamily: "'Courier New', monospace", fontWeight: 700 }}>{c.status}</span>
                  <span style={{ color: "#7B9EC0", fontSize: 12 }}>{c.lastAction}</span>
                  <select value={c.status} onChange={e => updateStatus(c.id, e.target.value)} style={{ padding: "4px 8px", background: "#0A0F1E", border: "1px solid #1E3A5F", borderRadius: 4, color: "#E8EDF5", fontSize: 11 }}>{["New","Sent","Replied","Meeting","Closed","Lost"].map(s => <option key={s}>{s}</option>)}</select>
                  <button onClick={() => { setActiveTab("Sequences"); setSelectedContact(c.id); }} style={{ padding: "4px 10px", background: sequences[c.id] ? "#1A3A1A" : "transparent", border: `1px solid ${sequences[c.id] ? "#4CAF50" : "#C8A96E"}`, color: sequences[c.id] ? "#81C784" : "#C8A96E", borderRadius: 4, cursor: "pointer", fontSize: 10, fontFamily: "'Courier New', monospace" }}>{sequences[c.id] ? "VIEW SEQ" : "SEQUENCE"}</button>
                </div>
              ))}
              {filteredContacts.length === 0 && <div style={{ padding: 32, textAlign: "center", color: "#7B9EC0", fontSize: 13 }}>No contacts found.</div>}
            </div>
          </div>
        )}

        {activeTab === "Sequences" && (
          <div>
            <h2 style={{ color: "#C8A96E", fontSize: 20, marginBottom: 6 }}>Outreach Sequences</h2>
            <p style={{ color: "#7B9EC0", fontSize: 13, marginBottom: 24 }}>AI-generated 35-day multi-touch outreach plans. Every touchpoint written in your voice.</p>
            <div style={{ background: "#0D1B3E", border: "1px solid #1E3A5F", borderRadius: 8, padding: 20, marginBottom: 24 }}>
              <div style={{ fontSize: 12, color: "#C8A96E", fontFamily: "'Courier New', monospace", fontWeight: 700, marginBottom: 14 }}>SELECT PROSPECT</div>
              {crmContacts.length === 0 ? <p style={{ color: "#7B9EC0", fontSize: 13 }}>No contacts yet. Add prospects in the CRM tab first.</p> : (
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {crmContacts.map(c => (
                    <button key={c.id} onClick={() => setSelectedContact(c.id)} style={{ padding: "8px 16px", borderRadius: 4, border: `1px solid ${selectedContact === c.id ? "#C8A96E" : "#1E3A5F"}`, background: selectedContact === c.id ? "#1A2E4A" : "transparent", color: selectedContact === c.id ? "#C8A96E" : "#B8CCE0", cursor: "pointer", fontSize: 12, fontFamily: "'Courier New', monospace" }}>
                      {c.company} {sequences[c.id] ? "✅" : ""}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {selectedContact && (() => {
              const contact = crmContacts.find(c => c.id === selectedContact);
              const seq = sequences[selectedContact];
              if (!contact) return null;
              return (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: "#E8EDF5" }}>{contact.company}</div>
                      <div style={{ fontSize: 13, color: "#7B9EC0" }}>{contact.contact} · {contact.industry}</div>
                    </div>
                    {!seq ? (
                      <button onClick={() => generateSequence(contact)} disabled={generatingSeq === contact.id} style={{ padding: "12px 24px", background: generatingSeq === contact.id ? "#1E3A5F" : "#C8A96E", border: "none", borderRadius: 4, cursor: "pointer", fontWeight: 700, fontSize: 13, color: generatingSeq === contact.id ? "#7B9EC0" : "#0A0F1E", fontFamily: "'Courier New', monospace" }}>
                        {generatingSeq === contact.id ? "⚡ GENERATING 10-STEP SEQUENCE..." : "⚡ GENERATE SEQUENCE"}
                      </button>
                    ) : (
                      <div style={{ display: "flex", gap: 10 }}>
                        <span style={{ fontSize: 12, color: "#81C784", fontFamily: "'Courier New', monospace", alignSelf: "center" }}>✅ {seq.steps.filter(s => s.completed).length}/{seq.steps.length} COMPLETE</span>
                        <button onClick={() => { if(window.confirm("Regenerate sequence for " + contact.company + "?")) { setSequences(s => { const n = {...s}; delete n[contact.id]; return n; }); }}} style={{ padding: "8px 16px", background: "transparent", border: "1px solid #EF5350", color: "#EF5350", borderRadius: 4, cursor: "pointer", fontSize: 11, fontFamily: "'Courier New', monospace" }}>REGENERATE</button>
                      </div>
                    )}
                  </div>
                  {generatingSeq === contact.id && (
                    <div style={{ background: "#0D1B3E", border: "1px solid #C8A96E", borderRadius: 8, padding: 32, textAlign: "center", marginBottom: 20 }}>
                      <div style={{ fontSize: 14, color: "#C8A96E", fontFamily: "'Courier New', monospace" }}>Writing 10 personalized touchpoints in Joel's voice...</div>
                      <div style={{ fontSize: 12, color: "#7B9EC0", marginTop: 8 }}>Emails · Calls · LinkedIn · SMS · Handwritten note · In-person visit</div>
                    </div>
                  )}
                  {seq && seq.steps.map((step, idx) => (
                    <div key={idx} style={{ background: step.completed ? "#0A1A0A" : "#0D1B3E", border: `1px solid ${step.completed ? "#2A4A2A" : typeColor(step.type)}`, borderRadius: 8, padding: 20, marginBottom: 12, opacity: step.completed ? 0.7 : 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <span style={{ fontSize: 20 }}>{step.icon}</span>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: typeColor(step.type), fontFamily: "'Courier New', monospace" }}>DAY {step.day} — {step.label.toUpperCase()}</div>
                            <div style={{ fontSize: 11, color: "#7B9EC0", marginTop: 2 }}>Due: {step.dueDate}</div>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => { navigator.clipboard.writeText(step.content); showToast("Copied!"); }} style={{ padding: "5px 12px", background: "transparent", border: `1px solid ${typeColor(step.type)}`, color: typeColor(step.type), borderRadius: 4, cursor: "pointer", fontSize: 10, fontFamily: "'Courier New', monospace" }}>COPY</button>
                          <button onClick={() => toggleStepComplete(contact.id, idx)} style={{ padding: "5px 12px", background: step.completed ? "#2A4A2A" : "transparent", border: "1px solid #4CAF50", color: "#4CAF50", borderRadius: 4, cursor: "pointer", fontSize: 10, fontFamily: "'Courier New', monospace" }}>{step.completed ? "✅ DONE" : "MARK DONE"}</button>
                        </div>
                      </div>
                      <pre style={{ color: "#B8CCE0", fontSize: 13, lineHeight: 1.8, margin: 0, whiteSpace: "pre-wrap", fontFamily: "Georgia, serif" }}>{step.content}</pre>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {activeTab === "Leads" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
              <h2 style={{ color: "#C8A96E", fontSize: 20, margin: 0 }}>Inbound Leads</h2>
              <button onClick={async () => {
                try { const r = await window.storage.get("crm_contacts", true); if (r?.value) { const all = JSON.parse(r.value); setLeads(all.filter(c => c.source === "Lead Form")); showToast("Leads refreshed"); } }
                catch(e) { showToast("No leads found yet"); }
              }} style={{ ...btnGold, fontWeight: 700 }}>🔄 REFRESH</button>
            </div>
            <p style={{ color: "#7B9EC0", fontSize: 13, marginBottom: 24 }}>Leads submitted from your social media form. AI response generated automatically on submission.</p>
            {leads.length === 0 ? (
              <div style={{ background: "#0D1B3E", border: "1px solid #1E3A5F", borderRadius: 8, padding: 48, textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>📭</div>
                <div style={{ color: "#7B9EC0", fontSize: 14 }}>No leads yet. Share your lead form on LinkedIn and Facebook to start filling this up.</div>
              </div>
            ) : leads.map((lead, idx) => (
              <div key={lead.id || idx} style={{ background: "#0D1B3E", border: "1px solid #1E3A5F", borderRadius: 8, padding: 24, marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#E8EDF5" }}>{lead.company}</div>
                    <div style={{ fontSize: 13, color: "#7B9EC0", marginTop: 4 }}>{lead.contact} {lead.email && <span>· {lead.email}</span>} {lead.phone && <span>· {lead.phone}</span>}</div>
                    {lead.employees && <div style={{ fontSize: 12, color: "#7B9EC0", marginTop: 2 }}>Employees: {lead.employees}</div>}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 11, color: "#C8A96E", fontFamily: "'Courier New', monospace" }}>{lead.date}</div>
                    <div style={{ fontSize: 10, color: "#4CAF50", fontFamily: "'Courier New', monospace", marginTop: 4 }}>✅ AUTO-RESPONDED</div>
                  </div>
                </div>
                {lead.concern && (
                  <div style={{ background: "rgba(200,169,110,0.06)", border: "1px solid rgba(200,169,110,0.15)", borderRadius: 6, padding: "10px 14px", marginBottom: 16 }}>
                    <span style={{ fontSize: 11, color: "#C8A96E", fontFamily: "'Courier New', monospace" }}>CONCERN: </span>
                    <span style={{ fontSize: 13, color: "#B8CCE0" }}>{lead.concern}</span>
                  </div>
                )}
                {lead.aiResponse && (
                  <div>
                    <div style={{ fontSize: 11, color: "#7B9EC0", fontFamily: "'Courier New', monospace", marginBottom: 8 }}>AI RESPONSE SENT —</div>
                    <pre style={{ color: "#B8CCE0", fontSize: 13, lineHeight: 1.8, margin: 0, whiteSpace: "pre-wrap", fontFamily: "Georgia, serif" }}>{lead.aiResponse}</pre>
                  </div>
                )}
                <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                  <button onClick={() => { navigator.clipboard.writeText(lead.aiResponse || ""); showToast("Copied!"); }} style={btnGold}>COPY RESPONSE</button>
                  <button onClick={() => { setCrmContacts(c => [...c, { ...lead, status: "New", lastAction: "Moved from leads", source: "Lead Form" }]); setLeads(l => l.filter((_, i) => i !== idx)); showToast("Added to CRM!"); }} style={{ ...btnGold, borderColor: "#81C784", color: "#81C784" }}>ADD TO CRM</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── SUBMISSIONS TAB ── */}
        {activeTab === "Submissions" && (
          <div>
            <h2 style={{ color: "#C8A96E", fontSize: 20, marginBottom: 6 }}>Underwriting Submissions</h2>
            <p style={{ color: "#7B9EC0", fontSize: 13, marginBottom: 24 }}>Intake → Draft → Review. Narratives built for your underwriters, in plain English.</p>

            {/* Step indicator */}
            <div style={{ display: "flex", alignItems: "center", marginBottom: 28 }}>
              {["Intake", "Draft", "Review"].map((s, i) => (
                <div key={s} style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{ width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, background: i < subStep ? "#C8A96E" : i === subStep ? "#162447" : "#0D1525", border: i === subStep ? "2px solid #C8A96E" : i < subStep ? "2px solid #C8A96E" : "2px solid #1E3A5F", color: i <= subStep ? "#E8EDF5" : "#3a5570" }}>
                      {i < subStep ? "✓" : i + 1}
                    </div>
                    <span style={{ fontSize: 10, fontFamily: "'Courier New', monospace", color: i === subStep ? "#C8A96E" : i < subStep ? "#C8A96E" : "#3a5570", letterSpacing: "0.08em", textTransform: "uppercase" }}>{s}</span>
                  </div>
                  {i < 2 && <div style={{ width: 60, height: 1, marginBottom: 18, background: i < subStep ? "#C8A96E" : "#1E3A5F" }} />}
                </div>
              ))}
            </div>

            {subStep === 0 && (
              <div style={{ background: "#0D1B3E", border: "1px solid #1E3A5F", borderRadius: 8, padding: 28 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={{ fontSize: 11, color: "#7B9EC0", fontFamily: "'Courier New', monospace", display: "block", marginBottom: 6 }}>ACCOUNT NAME *</label>
                    <input style={inputStyle} value={subForm.accountName} onChange={e => setSubField("accountName", e.target.value)} placeholder="Acme Manufacturing LLC" />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: "#7B9EC0", fontFamily: "'Courier New', monospace", display: "block", marginBottom: 6 }}>INDUSTRY / CLASS *</label>
                    <input style={inputStyle} value={subForm.industry} onChange={e => setSubField("industry", e.target.value)} placeholder="Metal fabrication, non-profit, etc." />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: "#7B9EC0", fontFamily: "'Courier New', monospace", display: "block", marginBottom: 6 }}>STATE</label>
                    <input style={inputStyle} value={subForm.state} onChange={e => setSubField("state", e.target.value)} placeholder="PA" />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: "#7B9EC0", fontFamily: "'Courier New', monospace", display: "block", marginBottom: 6 }}>EMPLOYEES</label>
                    <input style={inputStyle} value={subForm.employees} onChange={e => setSubField("employees", e.target.value)} placeholder="42" />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: "#7B9EC0", fontFamily: "'Courier New', monospace", display: "block", marginBottom: 6 }}>ANNUAL REVENUE</label>
                    <input style={inputStyle} value={subForm.revenue} onChange={e => setSubField("revenue", e.target.value)} placeholder="$3.2M" />
                  </div>
                </div>
                {[
                  { field: "operations", label: "OPERATIONS DESCRIPTION *", hint: "What does this business actually do?", ph: "Manufactures custom steel components for the automotive and construction industries. 60% contract work, 40% proprietary product. One facility in western PA, ~18,000 sq ft.", h: 80 },
                  { field: "exposures", label: "KEY EXPOSURES *", hint: "Don't sanitize it.", ph: "Heavy machinery, hot work, 3 company vehicles for sales/delivery, subcontracts 10% of work out.", h: 80 },
                  { field: "controls", label: "RISK CONTROLS / QUALITY INDICATORS", hint: "", ph: "ISO 9001 certified, safety committee meets monthly, sprinklered facility, clean loss history.", h: 60 },
                  { field: "lossHistory", label: "LOSS HISTORY (5 YEARS)", hint: "", ph: "2 claims, both GL, $8,400 total incurred. No open claims.", h: 60 },
                ].map(f => (
                  <div key={f.field} style={{ marginTop: 16 }}>
                    <label style={{ fontSize: 11, color: "#7B9EC0", fontFamily: "'Courier New', monospace", display: "block", marginBottom: 6 }}>{f.label}{f.hint && <span style={{ color: "#3a5570", fontWeight: 400 }}> — {f.hint}</span>}</label>
                    <textarea style={{ ...taStyle, minHeight: f.h }} value={subForm[f.field]} onChange={e => setSubField(f.field, e.target.value)} placeholder={f.ph} />
                  </div>
                ))}
                <div style={{ marginTop: 16 }}>
                  <label style={{ fontSize: 11, color: "#7B9EC0", fontFamily: "'Courier New', monospace", display: "block", marginBottom: 6 }}>PRIOR / CURRENT CARRIER</label>
                  <input style={inputStyle} value={subForm.priorCarrier} onChange={e => setSubField("priorCarrier", e.target.value)} placeholder="Erie Insurance, 6 years" />
                </div>
                <div style={{ marginTop: 16 }}>
                  <label style={{ fontSize: 11, color: "#7B9EC0", fontFamily: "'Courier New', monospace", display: "block", marginBottom: 8 }}>LINES REQUESTED *</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {LINES_OF_BUSINESS.map(l => (
                      <button key={l} onClick={() => toggleLine(l)} style={{ padding: "7px 14px", borderRadius: 20, border: `1px solid ${subForm.lines.includes(l) ? "#C8A96E" : "#1E3A5F"}`, background: subForm.lines.includes(l) ? "rgba(200,169,110,0.12)" : "transparent", color: subForm.lines.includes(l) ? "#C8A96E" : "#7B9EC0", cursor: "pointer", fontSize: 12, fontFamily: "'Courier New', monospace" }}>{l}</button>
                    ))}
                  </div>
                </div>
                <div style={{ marginTop: 16 }}>
                  <label style={{ fontSize: 11, color: "#7B9EC0", fontFamily: "'Courier New', monospace", display: "block", marginBottom: 6 }}>ADDITIONAL NOTES</label>
                  <textarea style={{ ...taStyle, minHeight: 60 }} value={subForm.notes} onChange={e => setSubField("notes", e.target.value)} placeholder="Reason for marketing, relationship context, anything underwriter should know upfront." />
                </div>
                <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
                  <button onClick={generateSubmission} disabled={!subCanSubmit} style={{ padding: "12px 28px", background: subCanSubmit ? "#C8A96E" : "#1E3A5F", color: subCanSubmit ? "#0A0F1E" : "#3a5570", border: "none", borderRadius: 4, cursor: subCanSubmit ? "pointer" : "not-allowed", fontWeight: 700, fontSize: 13, fontFamily: "'Courier New', monospace" }}>
                    GENERATE NARRATIVE →
                  </button>
                </div>
              </div>
            )}

            {subStep === 1 && (
              <div style={{ background: "#0D1B3E", border: "1px solid #1E3A5F", borderRadius: 8, padding: 60, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                <div style={{ width: 24, height: 24, border: "2px solid #1E3A5F", borderTop: "2px solid #C8A96E", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                <div style={{ fontSize: 13, color: "#7B9EC0", fontFamily: "'Courier New', monospace" }}>Building narrative for {subForm.accountName}...</div>
              </div>
            )}

            {subStep === 2 && (
              <div>
                <div style={{ background: "#0D1B3E", border: "1px solid #1E3A5F", borderRadius: 8, padding: 28, marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <span style={{ fontSize: 11, color: "#7B9EC0", fontFamily: "'Courier New', monospace", textTransform: "uppercase", letterSpacing: "0.08em" }}>{subForm.accountName} — Draft</span>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={copySubmission} style={btnGold}>{subCopied ? "✓ COPIED" : "COPY"}</button>
                      <button onClick={exportSubmission} style={btnGold}>EXPORT .TXT</button>
                    </div>
                  </div>
                  <textarea value={subNarrative} onChange={e => setSubNarrative(e.target.value)} style={{ ...taStyle, minHeight: 360, lineHeight: 1.8, fontSize: 14 }} />
                </div>
                <div style={{ background: "#0D1B3E", border: "1px solid #1E3A5F", borderRadius: 8, padding: 20, marginBottom: 16 }}>
                  <label style={{ fontSize: 11, color: "#C8A96E", fontFamily: "'Courier New', monospace", display: "block", marginBottom: 8, letterSpacing: "0.08em" }}>REFINE</label>
                  <div style={{ display: "flex", gap: 10 }}>
                    <input style={{ ...inputStyle, flex: 1 }} value={subFeedback} onChange={e => setSubFeedback(e.target.value)} onKeyDown={e => e.key === "Enter" && refineSubmission()} placeholder="Shorten the operations section. Add more on their safety program." />
                    <button onClick={refineSubmission} disabled={subRefining || !subFeedback.trim()} style={{ padding: "10px 20px", background: (!subRefining && subFeedback.trim()) ? "#C8A96E" : "#1E3A5F", color: (!subRefining && subFeedback.trim()) ? "#0A0F1E" : "#3a5570", border: "none", borderRadius: 4, cursor: "pointer", fontWeight: 700, fontSize: 12, fontFamily: "'Courier New', monospace", whiteSpace: "nowrap" }}>
                      {subRefining ? "..." : "REVISE"}
                    </button>
                  </div>
                </div>
                <button onClick={resetSubmission} style={{ ...btnGold, borderColor: "#1E3A5F", color: "#7B9EC0" }}>← NEW SUBMISSION</button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
