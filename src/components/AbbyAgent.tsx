import { useState, useRef, useEffect } from "react";

// ============================================================
// DATA — BIP, Reinforcers, Rules
// ============================================================

const BIP: Record<string, Record<string, string[]>> = {
	"Ethan R.": {
		"Repetitive stereotypical behavior": ["Environmental manipulation","Antecedent manipulation","DRA","DRI","DRO","Redirection","Incidental teaching"],
		"Self-injurious behavior (SIB)": ["Environmental manipulation","Antecedent manipulation","DRI","DRA","DRO","Redirection","LTM prompting","Fading"],
		"Tantrum": ["Antecedent manipulation","Priming","Behavior momentum","DRA","DRO","Redirection","LTM prompting","Pivot praise"],
		"Physical aggression": ["Environmental manipulation","Antecedent manipulation","DRI","DRA","DRO","Redirection","LTM prompting"],
		"Excessive motor behavior": ["Environmental manipulation","Antecedent manipulation","DRI","DRA","DRO","Redirection","Incidental teaching"],
		"Climbing": ["Environmental manipulation","Antecedent manipulation","DRI","DRA","Redirection","LTM prompting"],
		"Throwing objects": ["Environmental manipulation","Antecedent manipulation","DRI","DRA","DRO","Redirection","LTM prompting"],
		"Noncompliance": ["Antecedent manipulation","Priming","Behavior momentum","DRA","LTM prompting","Fading","DTT"],
		"Self-stimulatory behavior": ["Antecedent manipulation","Environmental manipulation","DRI","DRA","DRO","Redirection","Incidental teaching"],
		"PICA": ["Environmental manipulation","Antecedent manipulation","DRI","DRA","DRO","Redirection","LTM prompting","Shaping"],
	},
	"Antoni H.": {
		"Tantrums": ["Antecedent manipulation","Priming","Provide choices","Behavior momentum","NCA","DRA","DRO","Escape extinction","Token economy","Redirection to alternative response"],
		"Task refusal": ["Antecedent manipulation","Visual cues","Premack principle","Behavior momentum","Priming","Errorless teaching","DTT","DRA","Escape extinction","Token economy"],
		"Elopement": ["Environmental manipulation","Antecedent manipulation","Visual cue","NCR","DRI","Redirection to alternative behavior","DRA","Protective physical guidance"],
		"Off task": ["Antecedent manipulation","Visual cues","Priming","Behavior momentum","NCR","DRA","Incidental teaching"],
		"Physical aggression": ["Environmental manipulation","Antecedent manipulation","DRA","DRI","DRO","NCA","Escape extinction","Protective physical guidance"],
		"Excessive eating": ["Antecedent manipulation","Visual cues","NCR","DRA","DRO","RIRD","Token economy","Redirection to alternative response"],
		"Self-injurious behavior (SIB)": ["Environmental manipulation","Antecedent manipulation","RIRD","DRI","DRA","DRO","NCA","Protective physical guidance"],
		"Disruptive behavior": ["Antecedent manipulation","Visual cues","Priming","NCR","NCA","DRO","DRA","Token economy","Redirection to alternative response"],
		"Inappropriate sexual behavior": ["Environmental manipulation","Antecedent manipulation","Visual cues","RIRD","DRA","DRO","Redirection to alternative response","NCR","Protective physical guidance"],
	},
};

const REINFORCERS = {
	Social: ["Behavior-specific praise","High five","Fist bump","Thumbs up","Clapping","Tickles","Dance celebration","Chasing game","Silly faces"],
	Tangible: ["Bubbles","Play-Doh","Stickers","Fidget spinner","Toy car","Balloon","Light-up toy","Slinky","Free play (2-5 min)","Trampoline (brief)","Token board","Bouncy ball","Pop-it"],
	Edible: ["Goldfish","Pretzels","Cheerios","Raisins","Grapes","Apple slices","M&M (single)","Juice (sip)","Skittles (1-2)"],
};

const SCHEDULES = ["CRF","FR-2","FR-3","FR-5","VR-2","VR-3","VR-5"];
const TEACHING = ["DTT","NET","Both"];
const ARRIVAL = [
	"Running around the room","Jumping on furniture","Vocalizing / scripting",
	"Refusing to come to table","Seated with a book / toy","Screaming and crying",
	"Smiling and approaching RBT","Lying on the floor","Pacing back and forth","Engaging with caregiver",
];
const PROMPTS = ["Independent","Verbal prompt","Gestural prompt","Model prompt","Partial physical","Full physical (H-O-H)"];
const P_PROMPTS: [string, string][] = [
	["P1","Intervention source (BSP)"],["P2","Schedule labeling (CRF/FR/VR)"],["P3","Independent vs. prompted"],
	["P4","Satiation management"],["P5","DTT vs NET match"],["P6","Vague language audit"],
	["P7","Session continuity"],["P8","Data-to-narrative alignment"],["P9","Trend summary"],
	["P10","Forward bridge statement"],["P11","Reinforcer continuity"],["P12","Cross-note coherence"],
];

const MANDATORY_DATA_STATEMENT = "Frequency data were collected on all maladaptive behaviors identified in the client's assessment across the session. Percentage of correct responses was recorded for all skill acquisition programs implemented during the session.";

const SYSTEM = `You are Abby, an ABA documentation assistant for RBT Yasiel Perez at D&D Behavior Solutions / Miami Behavior Center. Write notes as ONE continuous paragraph, professional clinical English, varied phrasing (under 70% similar to prior week). Rules: use "per the BSP" when naming interventions; never write "Response blocking" (use "protective physical guidance was briefly implemented to ensure client and environmental safety"); no electronic reinforcers; describe specific observable arrival behaviors (never "calm/dysregulated"); label every reinforcer with its schedule (CRF/FR/VR); differentiate independent vs prompted responses; never invent percentages — use only what the RBT provides. End every note with this exact sentence: "${MANDATORY_DATA_STATEMENT}" followed by the forward bridge. When given structured session data, produce the finished clinical paragraph directly.`;

// ============================================================
// THEMES
// ============================================================

const ACCENTS: Record<string, [string, string]> = {
	Violet: ["#6366f1","#8b5cf6"], Ocean: ["#0ea5e9","#06b6d4"],
	Sunset: ["#f97316","#ec4899"], Forest: ["#10b981","#84cc16"],
	Rose: ["#f43f5e","#fb7185"], Gold: ["#f59e0b","#eab308"],
};
const FONTS: Record<string, string> = {
	Modern: "'DM Sans','Segoe UI',system-ui,sans-serif",
	Classic: "Georgia,'Times New Roman',serif",
	Mono: "'Courier New',ui-monospace,monospace",
};
const SIZES: Record<string, number> = { Compact: 12.5, Normal: 14, Large: 16 };
const THEMES: Record<string, Record<string, string>> = {
	Dark: { bg:"#0e1016", panel:"#11131b", surface:"rgba(255,255,255,0.04)", border:"rgba(255,255,255,0.1)", text:"#e2e8f0", heading:"#f1f5f9", muted:"#64748b", botBg:"rgba(255,255,255,0.05)" },
	Midnight: { bg:"#020617", panel:"#0b1220", surface:"rgba(255,255,255,0.03)", border:"rgba(255,255,255,0.08)", text:"#cbd5e1", heading:"#e2e8f0", muted:"#475569", botBg:"rgba(255,255,255,0.04)" },
	Light: { bg:"#f8fafc", panel:"#ffffff", surface:"rgba(0,0,0,0.03)", border:"rgba(0,0,0,0.1)", text:"#1e293b", heading:"#0f172a", muted:"#94a3b8", botBg:"#f1f5f9" },
};

// ============================================================
// TYPES
// ============================================================

interface Message { role: "user" | "assistant"; content: string; }
interface BehaviorEntry { name: string; interventions: string[]; freq: string; }
interface ProgramEntry { name: string; teaching: string; prompt: string; accuracy: string; reinforcer: string; schedule: string; }
interface DraftState { arrival: string; teaching: string; behaviors: BehaviorEntry[]; programs: ProgramEntry[]; reinforcer: string | null; schedule: string; }
interface AuditResult { number: string; title: string; pass: boolean; desc: string; fix: string | null; }
interface ClientProfile { id: string; fullName: string; firstName: string; pastNote: string; }

// ============================================================
// COMPLIANCE ENGINE (ported from antigravity app.js)
// ============================================================

function jaccard(a: string, b: string): number {
	if (!a || !b) return 0;
	const stop = new Set(["the","and","was","for","with","this","that","were","had","been","has","but","are","not","from","into","upon","across","about","using"]);
	const clean = (t: string) => t.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()[\]]/g," ").split(/\s+/).filter(w => w.length > 2 && !stop.has(w));
	const wA = clean(a), wB = clean(b);
	if (!wA.length || !wB.length) return 0;
	const sA = new Set(wA), sB = new Set(wB);
	let inter = 0; for (const w of sA) if (sB.has(w)) inter++;
	return Math.round((inter / new Set([...sA,...sB]).size) * 100);
}

function auditNote(text: string, fullName: string, pastNote: string): AuditResult[] {
	const R: AuditResult[] = [];
	const norm = text.replace(/\s+/g," ").toLowerCase();

	// R1: One paragraph
	const breaks = (text.match(/\n/g)||[]).length;
	R.push({ number:"1", title:"One Continuous Paragraph", pass: breaks===0,
		desc: breaks===0 ? "Single paragraph confirmed." : `${breaks} line break(s) found.`,
		fix: breaks===0 ? null : "Remove all line breaks and merge into one block." });

	// R3: Similarity
	const sim = jaccard(text, pastNote);
	const r3 = !pastNote.trim() || sim < 70;
	R.push({ number:"3", title:"Under 70% Similarity", pass: r3,
		desc: !pastNote.trim() ? "No prior note stored (save one after approval)." : r3 ? `Similarity: ${sim}% — within limit.` : `Similarity: ${sim}% — exceeds 70% threshold.`,
		fix: r3 ? null : "Vary arrival description, antecedent phrasing, and closing sentences." });

	// R5: Client name
	const sents = text.split(/[.!?]+/).map(s=>s.trim()).filter(Boolean);
	const legal = fullName.toLowerCase();
	let r5=false, r5d="", r5f: string|null=null;
	if (sents.length) {
		const first = sents[0].toLowerCase().includes(legal);
		const rep = sents.slice(1).some(s=>s.toLowerCase().includes(legal));
		if (!first) { r5d=`"${fullName}" not found in first sentence.`; r5f=`Begin with: "${fullName} was..."`; }
		else if (rep) { r5d="Full name repeated in body."; r5f="Replace subsequent uses with 'the client', initials, or first name."; }
		else { r5=true; r5d="Name used once in first sentence only ✓"; }
	}
	R.push({ number:"5", title:"Legal Client Name Usage", pass:r5, desc:r5d, fix:r5f });

	// R7: No "response blocking"
	const r7 = !norm.includes("response blocking");
	R.push({ number:"7", title:"No 'Response Blocking'", pass:r7,
		desc: r7 ? "Prohibited term absent ✓" : "CRITICAL: 'response blocking' found.",
		fix: r7 ? null : "Replace with: 'protective physical guidance was briefly implemented to ensure client and environmental safety.'" });

	// R8: No electronics
	const screens = ["tv","television","tablet","ipad","phone","video game","youtube"];
	const found8 = screens.filter(s=>new RegExp(`\\b${s}\\b`,"i").test(text));
	R.push({ number:"8", title:"No Electronic Reinforcers", pass:found8.length===0,
		desc: found8.length===0 ? "No screen devices referenced ✓" : `Electronic items found: [${found8.join(", ")}]`,
		fix: found8.length===0 ? null : "Replace with sensory, social, or tangible reinforcers." });

	// R9: Minimum coverage
	const bC = (norm.match(/(exhibited maladaptive|behavior consisted of)/g)||[]).length;
	const sC = (norm.match(/(trials were conducted|skill acquisition program)/g)||[]).length;
	const r9 = bC>=2 && sC>=2;
	R.push({ number:"9", title:"Minimum Coverage", pass:r9,
		desc: `${bC} behavior event(s), ${sC} skill program(s) detected.`,
		fix: r9 ? null : "Sessions ≥4 hrs require ≥3 behaviors and ≥3 skill programs." });

	// R10: Mandatory closing statement
	const r10 = norm.includes(MANDATORY_DATA_STATEMENT.toLowerCase());
	R.push({ number:"10", title:"AHCA Closing Statement", pass:r10,
		desc: r10 ? "Mandatory data statement present ✓" : "Mandatory closing statement missing or altered.",
		fix: r10 ? null : `Add verbatim: "${MANDATORY_DATA_STATEMENT}"` });

	// R12: Observable arrival (no subjective labels)
	const subj = ["appeared calm","was alert","was calm","appeared happy","seemed upset","was dysregulated","appeared alert"];
	const found12 = subj.filter(s=>text.substring(0,300).toLowerCase().includes(s));
	R.push({ number:"12", title:"Observable Arrival Behavior", pass:found12.length===0,
		desc: found12.length===0 ? "Opening uses specific observable actions ✓" : `Subjective term(s): "${found12.join(", ")}"`,
		fix: found12.length===0 ? null : "Replace with physical actions (e.g. 'seated coloring', 'running around room')." });

	// R13: "Per the BSP" attribution
	const ivTerms = ["extinction","differential reinforcement","task modification","redirection","prompting","physical guidance","antecedent manipulation"];
	const miss13: string[] = [];
	ivTerms.forEach(iv => {
		let pos = norm.indexOf(iv);
		while (pos !== -1) {
			const scope = norm.substring(pos, pos+100);
			if (!scope.includes("per the bsp") && !scope.includes("behavior support plan")) {
				if (!miss13.includes(iv)) miss13.push(iv);
			}
			pos = norm.indexOf(iv, pos+1);
		}
	});
	R.push({ number:"13", title:"'Per the BSP' Attribution", pass:miss13.length===0,
		desc: miss13.length===0 ? "All interventions attributed to BSP ✓" : `Missing BSP attribution: [${[...new Set(miss13)].join(", ")}]`,
		fix: miss13.length===0 ? null : "Append 'per the BSP' after each named intervention." });

	return R;
}

// ============================================================
// STYLE FACTORY
// ============================================================

function makeStyles(T: Record<string,string>, grad: string, c1: string, c2: string, fontFam: string, fontSize: number, uR: string, bR: string) {
	return {
		T, accentColor: c2, dimColor: T.border,
		app:{ minHeight:"100vh", background:T.bg, display:"flex", flexDirection:"column" as const, fontFamily:fontFam, maxWidth:600, margin:"0 auto", position:"relative" as const },
		header:{ display:"flex", alignItems:"center", gap:12, padding:"16px 18px", borderBottom:`1px solid ${T.border}`, position:"sticky" as const, top:0, background:T.bg, zIndex:5 },
		avatar:{ width:40, height:40, borderRadius:"50%", background:grad, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, fontWeight:700, color:"#fff", boxShadow:`0 0 0 3px ${c2}33` },
		miniAvatar:{ width:26, height:26, borderRadius:"50%", background:grad, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:"#fff", flexShrink:0 },
		name:{ color:T.heading, fontWeight:700, fontSize:fontSize+3 },
		sub:{ color:T.muted, fontSize:fontSize-2.5, letterSpacing:"0.02em" },
		statusWrap:{ marginLeft:"auto", display:"flex", alignItems:"center", gap:8 },
		dot:{ width:7, height:7, borderRadius:"50%" },
		statusTxt:{ color:T.muted, fontSize:10, fontWeight:600, letterSpacing:"0.08em" },
		gear:{ background:"none", border:"none", cursor:"pointer", padding:4, display:"flex", alignItems:"center" },
		feed:{ flex:1, overflowY:"auto" as const, padding:"16px", display:"flex", flexDirection:"column" as const, gap:12, minHeight:120 },
		userBubble:{ maxWidth:"82%", padding:"10px 14px", borderRadius:uR, background:grad, color:"#fff", fontSize, lineHeight:1.5 },
		botBubble:{ maxWidth:"86%", padding:"10px 14px", borderRadius:bR, background:T.botBg, border:`1px solid ${T.border}`, color:T.text, fontSize, lineHeight:1.6 },
		typeDot:{ width:6, height:6, borderRadius:"50%", background:c2, animation:"ab 1.2s infinite" },
		deck:{ borderTop:`1px solid ${T.border}`, padding:"14px", background:T.panel, maxHeight:"58vh", overflowY:"auto" as const },
		deckLabel:{ color:T.muted, fontSize:11, fontWeight:700, letterSpacing:"0.1em", marginBottom:10 },
		row:{ display:"flex", gap:8, marginTop:8, flexWrap:"wrap" as const },
		bigBtn:{ flex:1, minWidth:140, padding:"14px", borderRadius:12, border:"none", background:grad, color:"#fff", fontSize, fontWeight:600, cursor:"pointer" },
		altBtn:{ flex:1, minWidth:120, padding:"13px", borderRadius:12, border:`1px solid ${c2}66`, background:`${c2}14`, color:c2, fontSize:fontSize-0.5, fontWeight:600, cursor:"pointer" },
		card:{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:14, padding:14, marginBottom:4 },
		cardTitle:{ color:T.heading, fontSize:fontSize+0.5, fontWeight:700, marginBottom:12 },
		subCard:{ background:`${c2}10`, border:`1px solid ${c2}30`, borderRadius:10, padding:10, marginBottom:10 },
		subTitle:{ color:c2, fontSize:fontSize-1, fontWeight:600, marginBottom:8 },
		wrap:{ display:"flex", flexWrap:"wrap" as const, gap:7, marginBottom:6 },
		chip:{ padding:"8px 13px", borderRadius:20, border:`1px solid ${T.border}`, background:T.surface, color:T.text, fontSize:fontSize-1, cursor:"pointer", transition:"all 0.15s", fontFamily:"inherit" },
		chipOn:{ background:grad, borderColor:"transparent", color:"#fff", fontWeight:600 },
		input:{ width:"100%", padding:"10px 12px", borderRadius:9, border:`1px solid ${T.border}`, background:T.bg, color:T.text, fontSize:fontSize-0.5, marginBottom:8, boxSizing:"border-box" as const, fontFamily:"inherit" },
		bigInput:{ width:"100%", padding:"12px", borderRadius:10, border:`1px solid ${c2}4d`, background:T.bg, color:T.text, fontSize:fontSize-0.5, boxSizing:"border-box" as const, resize:"vertical" as const, fontFamily:"inherit", marginBottom:10 },
		miniLabel:{ color:T.muted, fontSize:fontSize-2.5, fontWeight:600, margin:"8px 0 6px" },
		hint:{ color:T.muted, fontSize:fontSize-1, fontStyle:"italic" as const },
		addBtn:{ width:"100%", padding:"11px", borderRadius:10, border:`1px dashed ${c2}80`, background:"transparent", color:c2, fontSize:fontSize-0.5, fontWeight:600, cursor:"pointer" },
		progress:{ display:"flex", gap:5, marginBottom:12, justifyContent:"center" },
		pDot:{ width:24, height:4, borderRadius:2, transition:"background 0.2s" },
		navBtn:{ padding:"11px 16px", borderRadius:10, border:`1px solid ${T.border}`, background:T.surface, color:T.text, fontSize:fontSize-0.5, fontWeight:600, cursor:"pointer" },
		navBtnGhost:{ padding:"11px 16px", borderRadius:10, border:"none", background:"transparent", color:T.muted, fontSize:fontSize-0.5, cursor:"pointer" },
		navBtnPrimary:{ flex:1, padding:"11px 16px", borderRadius:10, border:"none", background:grad, color:"#fff", fontSize, fontWeight:700, cursor:"pointer" },
		overlay:{ position:"fixed" as const, inset:0, background:"rgba(0,0,0,0.55)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:50, backdropFilter:"blur(2px)" },
		sheet:{ width:"100%", maxWidth:600, background:T.panel, borderRadius:"22px 22px 0 0", padding:"14px 20px 28px", border:`1px solid ${T.border}`, maxHeight:"82vh", overflowY:"auto" as const, animation:"slideUp 0.25s ease" },
		sheetHandle:{ width:40, height:4, borderRadius:2, background:T.muted, margin:"0 auto 16px", opacity:0.5 },
		sheetTitle:{ color:T.heading, fontSize:fontSize+4, fontWeight:700, marginBottom:20, textAlign:"center" as const },
		groupLabel:{ color:T.muted, fontSize:11, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase" as const, marginBottom:9 },
		swatch:{ width:38, height:38, borderRadius:"50%", border:"none", cursor:"pointer" },
		doneBtn:{ width:"100%", padding:"14px", borderRadius:12, border:"none", background:grad, color:"#fff", fontSize:fontSize+1, fontWeight:700, cursor:"pointer", marginTop:6 },
		// audit-specific
		auditBar:{ height:6, borderRadius:3, background:"rgba(255,255,255,0.1)", overflow:"hidden" as const, marginTop:6 },
		auditRow:{ padding:"10px 12px", borderRadius:10, marginBottom:6 },
	};
}

type Styles = ReturnType<typeof makeStyles>;

// ============================================================
// SUB-COMPONENTS
// ============================================================

function Chip({ S, active, onClick, children }: { S: Styles; active: boolean; onClick: () => void; children: React.ReactNode }) {
	return <button onClick={onClick} style={{ ...S.chip, ...(active ? S.chipOn : {}) }}>{children}</button>;
}
function Card({ S, title, children }: { S: Styles; title: string; children: React.ReactNode }) {
	return <div style={S.card}><div style={S.cardTitle}>{title}</div>{children}</div>;
}
function Wrap({ S, children }: { S: Styles; children: React.ReactNode }) {
	return <div style={S.wrap}>{children}</div>;
}
function SettingsOpt({ S, on, onClick, children, style = {} }: { S: Styles; on: boolean; onClick: () => void; children: React.ReactNode; style?: React.CSSProperties }) {
	return <button onClick={onClick} style={{ ...S.chip, ...(on ? S.chipOn : {}), ...style }}>{children}</button>;
}
function SettingsGroup({ S, label, children }: { S: Styles; label: string; children: React.ReactNode }) {
	return <div style={{ marginBottom: 18 }}><div style={S.groupLabel}>{label}</div><div style={S.wrap}>{children}</div></div>;
}

function HomeDeck({ S, clients, onDraft, onReview, onP, onAudit }: {
	S: Styles; clients: string[];
	onDraft: (c: string) => void; onReview: () => void; onP: () => void; onAudit?: () => void;
}) {
	return (
		<>
			<div style={S.deckLabel}>START A NOTE</div>
			<div style={S.row}>
				{clients.map(c => <button key={c} style={S.bigBtn} onClick={() => onDraft(c)}>Draft — {c}</button>)}
			</div>
			<div style={S.row}>
				<button style={S.altBtn} onClick={onReview}>Review a note</button>
				<button style={S.altBtn} onClick={onP}>Run P1–P12</button>
				{onAudit && <button style={{ ...S.altBtn, flex:"0 0 auto" }} onClick={onAudit}>Last audit</button>}
			</div>
		</>
	);
}

function DraftDeck({ S, client, draft, setDraft, onSubmit, onCancel }: {
	S: Styles; client: string; draft: DraftState;
	setDraft: React.Dispatch<React.SetStateAction<DraftState | null>>;
	onSubmit: () => void; onCancel: () => void;
}) {
	const [step, setStep] = useState(0);
	const behaviors = Object.keys(BIP[client] || {});
	const upd = (patch: Partial<DraftState>) => setDraft(d => d ? { ...d, ...patch } : d);

	const steps = [
		<Card key="a" S={S} title="Step 1 — How did the client arrive?">
			<Wrap S={S}>{ARRIVAL.map(a => <Chip key={a} S={S} active={draft.arrival===a} onClick={() => upd({ arrival:a })}>{a}</Chip>)}</Wrap>
		</Card>,

		<Card key="t" S={S} title="Step 2 — Teaching approach today">
			<Wrap S={S}>{TEACHING.map(t => <Chip key={t} S={S} active={draft.teaching===t} onClick={() => upd({ teaching:t })}>{t}</Chip>)}</Wrap>
		</Card>,

		<Card key="b" S={S} title="Step 3 — Which behaviors occurred? (tap 3+)">
			<Wrap S={S}>{behaviors.map(b => {
				const on = draft.behaviors.some(x => x.name===b);
				return <Chip key={b} S={S} active={on} onClick={() =>
					setDraft(d => d ? { ...d, behaviors: on ? d.behaviors.filter(x=>x.name!==b) : [...d.behaviors, { name:b, interventions:[], freq:"" }] } : d)
				}>{b}</Chip>;
			})}</Wrap>
		</Card>,

		<Card key="i" S={S} title="Step 4 — Interventions used (per BSP)">
			{draft.behaviors.length === 0 && <div style={S.hint}>Go back and pick behaviors first.</div>}
			{draft.behaviors.map((b, bi) => (
				<div key={b.name} style={S.subCard}>
					<div style={S.subTitle}>{b.name}</div>
					<Wrap S={S}>{(BIP[client]?.[b.name] || []).map(iv => {
						const on = b.interventions.includes(iv);
						return <Chip key={iv} S={S} active={on} onClick={() =>
							setDraft(d => {
								if (!d) return d;
								const bs = [...d.behaviors];
								bs[bi] = { ...bs[bi], interventions: on ? bs[bi].interventions.filter(x=>x!==iv) : [...bs[bi].interventions, iv] };
								return { ...d, behaviors: bs };
							})
						}>{iv}</Chip>;
					})}</Wrap>
					<input style={S.input} placeholder="Frequency / duration (e.g. 3 instances, ~2 min total)"
						value={b.freq}
						onChange={e => setDraft(d => {
							if (!d) return d;
							const bs = [...d.behaviors]; bs[bi] = { ...bs[bi], freq: e.target.value }; return { ...d, behaviors: bs };
						})} />
				</div>
			))}
		</Card>,

		<Card key="p" S={S} title="Step 5 — Skill programs (add 3+)">
			{draft.programs.map((p, pi) => (
				<div key={pi} style={S.subCard}>
					<input style={S.input} placeholder="Program name (e.g. Receptive ID, Expressive Labels)"
						value={p.name}
						onChange={e => { const ps=[...draft.programs]; ps[pi]={...ps[pi],name:e.target.value}; upd({programs:ps}); }} />
					<Wrap S={S}>{TEACHING.slice(0,2).map(t => <Chip key={t} S={S} active={p.teaching===t} onClick={() => { const ps=[...draft.programs]; ps[pi]={...ps[pi],teaching:t}; upd({programs:ps}); }}>{t}</Chip>)}</Wrap>
					<Wrap S={S}>{PROMPTS.map(pr => <Chip key={pr} S={S} active={p.prompt===pr} onClick={() => { const ps=[...draft.programs]; ps[pi]={...ps[pi],prompt:pr}; upd({programs:ps}); }}>{pr}</Chip>)}</Wrap>
					<input style={S.input} placeholder="Accuracy from Office Puzzle (e.g. 8/10 trials)"
						value={p.accuracy}
						onChange={e => { const ps=[...draft.programs]; ps[pi]={...ps[pi],accuracy:e.target.value}; upd({programs:ps}); }} />
					<div style={S.miniLabel}>Reinforcer</div>
					<Wrap S={S}>{["Behavior-specific praise","Token board","Bubbles","Goldfish","Free play (2-5 min)","High five"].map(r =>
						<Chip key={r} S={S} active={p.reinforcer===r} onClick={() => { const ps=[...draft.programs]; ps[pi]={...ps[pi],reinforcer:r}; upd({programs:ps}); }}>{r}</Chip>)}</Wrap>
					<div style={S.miniLabel}>Schedule</div>
					<Wrap S={S}>{SCHEDULES.map(sc => <Chip key={sc} S={S} active={p.schedule===sc} onClick={() => { const ps=[...draft.programs]; ps[pi]={...ps[pi],schedule:sc}; upd({programs:ps}); }}>{sc}</Chip>)}</Wrap>
				</div>
			))}
			<button style={S.addBtn} onClick={() => upd({ programs:[...draft.programs, { name:"", teaching:"DTT", prompt:"Independent", accuracy:"", reinforcer:"Behavior-specific praise", schedule:"CRF" }] })}>+ Add program</button>
		</Card>,

		<Card key="c" S={S} title="Step 6 — Closing reinforcer">
			<Wrap S={S}>{[...REINFORCERS.Social.slice(0,5),...REINFORCERS.Tangible.slice(0,4)].map(r =>
				<Chip key={r} S={S} active={draft.reinforcer===r} onClick={() => upd({ reinforcer:r })}>{r}</Chip>)}</Wrap>
			<div style={S.miniLabel}>Schedule</div>
			<Wrap S={S}>{SCHEDULES.map(sc => <Chip key={sc} S={S} active={draft.schedule===sc} onClick={() => upd({ schedule:sc })}>{sc}</Chip>)}</Wrap>
		</Card>,
	];

	const last = step === steps.length - 1;
	return (
		<div>
			<div style={S.progress}>{steps.map((_,i) => <div key={i} style={{ ...S.pDot, background: i<=step ? S.accentColor : S.dimColor }} />)}</div>
			{steps[step]}
			<div style={S.row}>
				{step > 0 && <button style={S.navBtn} onClick={() => setStep(step-1)}>Back</button>}
				<button style={S.navBtnGhost} onClick={onCancel}>Cancel</button>
				{!last && <button style={S.navBtnPrimary} onClick={() => setStep(step+1)}>Next</button>}
				{last && <button style={S.navBtnPrimary} onClick={onSubmit}>Generate note</button>}
			</div>
		</div>
	);
}

function ReviewDeck({ S, text, setText, onSubmit, onCancel }: { S: Styles; text: string; setText: (t:string)=>void; onSubmit: ()=>void; onCancel: ()=>void; }) {
	return (
		<Card S={S} title="Paste the note to review">
			<textarea style={S.bigInput} value={text} onChange={e=>setText(e.target.value)} placeholder="Paste your session note here..." rows={5} />
			<div style={S.row}>
				<button style={S.navBtnGhost} onClick={onCancel}>Cancel</button>
				<button style={S.navBtnPrimary} disabled={!text.trim()} onClick={onSubmit}>Review</button>
			</div>
		</Card>
	);
}

function PromptDeck({ S, text, setText, onRun, onCancel }: { S: Styles; text: string; setText: (t:string)=>void; onRun: (p:string,l:string)=>void; onCancel: ()=>void; }) {
	return (
		<Card S={S} title="Run a review prompt">
			<textarea style={S.bigInput} value={text} onChange={e=>setText(e.target.value)} placeholder="Paste note (optional)..." rows={3} />
			<Wrap S={S}>{P_PROMPTS.map(([p,label]) => <Chip key={p} S={S} active={false} onClick={() => onRun(p,label)}>{p} — {label}</Chip>)}</Wrap>
			<button style={S.navBtnGhost} onClick={onCancel}>Done</button>
		</Card>
	);
}

function AuditDeck({ S, results, score, onSaveAsPrior, onClose }: {
	S: Styles; results: AuditResult[]; score: number; onSaveAsPrior: ()=>void; onClose: ()=>void;
}) {
	const [saved, setSaved] = useState(false);
	const color = score===100 ? "#22c55e" : score>=70 ? "#f59e0b" : "#ef4444";
	return (
		<Card S={S} title={`Compliance Audit — ${score}%`}>
			<div style={{ marginBottom:12 }}>
				<div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
					<span style={{ color, fontWeight:700, fontSize:20 }}>{score}%</span>
					<span style={{ color:S.T.muted, fontSize:11 }}>{results.filter(r=>r.pass).length} / {results.length} rules passed</span>
				</div>
				<div style={S.auditBar}>
					<div style={{ width:`${score}%`, height:"100%", background:color, borderRadius:3, transition:"width 0.4s ease" }} />
				</div>
			</div>
			<div style={{ display:"flex", flexDirection:"column", gap:6, maxHeight:260, overflowY:"auto" }}>
				{results.map(r => (
					<div key={r.number} style={{ ...S.auditRow, background: r.pass ? "rgba(34,197,94,0.06)" : "rgba(239,68,68,0.06)", borderLeft:`3px solid ${r.pass?"#22c55e":"#ef4444"}` }}>
						<div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:2 }}>
							<span style={{ fontSize:13, color:r.pass?"#22c55e":"#ef4444" }}>{r.pass?"✓":"✗"}</span>
							<span style={{ fontSize:12, fontWeight:700, color:S.T.heading }}>R{r.number}: {r.title}</span>
						</div>
						<div style={{ fontSize:11, color:S.T.muted, lineHeight:1.4 }}>{r.desc}</div>
						{r.fix && <div style={{ fontSize:11, color:"#f59e0b", marginTop:4, background:"rgba(245,158,11,0.08)", padding:"4px 8px", borderRadius:6 }}>→ {r.fix}</div>}
					</div>
				))}
			</div>
			<div style={S.row}>
				<button style={S.navBtnGhost} onClick={onClose}>Close</button>
				<button style={{ ...S.altBtn, opacity:saved?0.5:1 }} disabled={saved} onClick={() => { onSaveAsPrior(); setSaved(true); }}>
					{saved ? "Saved as prior ✓" : "Save as prior week"}
				</button>
			</div>
		</Card>
	);
}

// ============================================================
// MAIN COMPONENT
// ============================================================

const safeStorage = {
	get: (key: string) => { try { return localStorage.getItem(key); } catch { return null; } },
	set: (key: string, val: string) => { try { localStorage.setItem(key, val); } catch { /* noop */ } },
};

const DEFAULT_PROFILES: ClientProfile[] = [
	{ id:"ethan-r", fullName:"Ethan R.", firstName:"Ethan", pastNote:"" },
	{ id:"antoni-h", fullName:"Antoni H.", firstName:"Antoni", pastNote:"" },
];

export default function AbbyAgent() {
	const [messages, setMessages] = useState<Message[]>([{
		role: "assistant",
		content: "Hi! I'm Abby. Tap a client to start a note — almost no typing needed. Tap ⚙ to personalize.",
	}]);
	const [loading, setLoading] = useState(false);
	const [mode, setMode] = useState<"home"|"draft"|"review"|"pprompt"|"audit">("home");
	const [client, setClient] = useState<string|null>(null);
	const [draft, setDraft] = useState<DraftState|null>(null);
	const [reviewText, setReviewText] = useState("");
	const [auditResults, setAuditResults] = useState<AuditResult[]>([]);
	const [lastNote, setLastNote] = useState("");
	const [showSettings, setShowSettings] = useState(false);
	const [profiles, setProfiles] = useState<ClientProfile[]>(() => {
		const stored = safeStorage.get("abby_profiles");
		return stored ? JSON.parse(stored) : DEFAULT_PROFILES;
	});

	const [theme, setTheme] = useState("Dark");
	const [accent, setAccent] = useState("Violet");
	const [font, setFont] = useState("Modern");
	const [size, setSize] = useState("Normal");
	const [bubble, setBubble] = useState("Rounded");

	const T = THEMES[theme];
	const [c1,c2] = ACCENTS[accent];
	const grad = `linear-gradient(135deg,${c1},${c2})`;
	const uR = bubble==="Square"?"8px":bubble==="Sharp"?"14px 14px 2px 14px":"16px 16px 4px 16px";
	const bR = bubble==="Square"?"8px":bubble==="Sharp"?"2px 14px 14px 14px":"4px 16px 16px 16px";
	const S = makeStyles(T, grad, c1, c2, FONTS[font], SIZES[size], uR, bR);

	const bottomRef = useRef<HTMLDivElement>(null);
	useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages, loading, mode, draft]);
	useEffect(() => { safeStorage.set("abby_profiles", JSON.stringify(profiles)); }, [profiles]);

	async function callAbby(userContent: string, label: string): Promise<string> {
		setMessages(p => [...p, { role:"user", content:label }]);
		setLoading(true);
		try {
			const res = await fetch("/api/abby", {
				method:"POST", headers:{ "Content-Type":"application/json" },
				body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1500, system:SYSTEM, messages:[{ role:"user", content:userContent }] }),
			});
			const data = await res.json();
			const reply = data.content?.map((b: {text?:string}) => b.text||"").join("\n") || "Sorry, try again.";
			setMessages(p => [...p, { role:"assistant", content:reply }]);
			return reply;
		} catch {
			setMessages(p => [...p, { role:"assistant", content:"Something went wrong — please try again." }]);
			return "";
		} finally { setLoading(false); }
	}

	function startDraft(c: string) {
		setClient(c); setMode("draft");
		setDraft({ arrival:"", teaching:"", behaviors:[], programs:[], reinforcer:null, schedule:"" });
		setMessages(p => [...p,
			{ role:"user", content:`Draft a note for ${c}` },
			{ role:"assistant", content:`Got it — drafting for ${c}. Tap through the 6 cards below.` },
		]);
	}

	async function submitDraft() {
		if (!draft || !client) return;
		const profile = profiles.find(p => p.fullName===client);
		const bLines = draft.behaviors.map(b =>
			`- Behavior: ${b.name}; frequency: ${b.freq||"[confirm]"}; interventions (per BSP): ${b.interventions.join(", ") || "[select interventions]"}.`
		).join("\n");
		const pLines = draft.programs.map(p =>
			`- Program: ${p.name}; teaching: ${p.teaching}; response: ${p.prompt}; accuracy: ${p.accuracy||"[X/Y trials — confirm in Office Puzzle]"}; reinforcer: ${p.reinforcer} on ${p.schedule}.`
		).join("\n");
		const content = `Write a complete ABA session note (one continuous paragraph, ending with the AHCA mandatory data statement then a forward bridge) for ${client}.
Arrival behavior (observable): ${draft.arrival||"[specify]"}.
Teaching approach: ${draft.teaching||"DTT and NET"}.
Maladaptive behaviors:\n${bLines||"- (none provided)"}
Skill programs:\n${pLines||"- (none provided)"}
Closing reinforcer: ${draft.reinforcer||"behavior-specific praise"} on ${draft.schedule||"a CRF schedule"}.
Generate the complete clinical paragraph now.`;

		const note = await callAbby(content, "Generate my note");
		setMode("home"); setDraft(null);

		if (note && profile) {
			const results = auditNote(note, profile.fullName, profile.pastNote);
			setAuditResults(results); setLastNote(note);
			setTimeout(() => setMode("audit"), 350);
		}
	}

	function saveAsPrior() {
		if (!client || !lastNote) return;
		setProfiles(prev => prev.map(p => p.fullName===client ? { ...p, pastNote:lastNote } : p));
	}

	const renderText = (t: string) => t.split("\n").map((l,i,arr) => (
		<span key={i}>{l.split(/(\[[^\]]*\])/g).map((p,j) => p.startsWith("[") ? <span key={j} style={{ color:"#f59e0b", fontWeight:600 }}>{p}</span> : p)}{i<arr.length-1&&<br/>}</span>
	));

	return (
		<div style={S.app}>
			{/* Header */}
			<div style={S.header}>
				<div style={S.avatar}>A</div>
				<div>
					<div style={S.name}>Abby</div>
					<div style={S.sub}>{client ? `Working on ${client}` : "Tap, don't type"}</div>
				</div>
				<div style={S.statusWrap}>
					<div style={{ ...S.dot, background: loading?"#f59e0b":"#22c55e" }} />
					<span style={S.statusTxt}>{loading?"WORKING":"READY"}</span>
					<button style={S.gear} onClick={() => setShowSettings(true)} aria-label="Settings">
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="2">
							<circle cx="12" cy="12" r="3"/>
							<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
						</svg>
					</button>
				</div>
			</div>

			{/* Message feed */}
			<div style={S.feed}>
				{messages.map((m,i) => (
					<div key={i} style={{ display:"flex", justifyContent:m.role==="user"?"flex-end":"flex-start", gap:8, alignItems:"flex-end" }}>
						{m.role==="assistant" && <div style={S.miniAvatar}>A</div>}
						<div style={m.role==="user"?S.userBubble:S.botBubble}>{renderText(m.content)}</div>
					</div>
				))}
				{loading && (
					<div style={{ display:"flex", gap:8, alignItems:"flex-end" }}>
						<div style={S.miniAvatar}>A</div>
						<div style={{ ...S.botBubble, display:"flex", gap:5 }}>
							{[0,1,2].map(n => <div key={n} style={{ ...S.typeDot, animationDelay:`${n*0.2}s` }} />)}
						</div>
					</div>
				)}
				<div ref={bottomRef} />
			</div>

			{/* Action deck */}
			<div style={S.deck}>
				{mode==="home" && (
					<HomeDeck S={S}
						clients={profiles.map(p=>p.fullName).filter(n=>BIP[n])}
						onDraft={startDraft} onReview={() => setMode("review")} onP={() => setMode("pprompt")}
						onAudit={auditResults.length>0 ? () => setMode("audit") : undefined} />
				)}
				{mode==="draft" && draft && client && (
					<DraftDeck S={S} client={client} draft={draft} setDraft={setDraft} onSubmit={submitDraft} onCancel={() => { setMode("home"); setDraft(null); }} />
				)}
				{mode==="review" && (
					<ReviewDeck S={S} text={reviewText} setText={setReviewText}
						onSubmit={async () => {
							await callAbby(`Review this ABA note for all agency compliance rules. List every issue and provide a corrected one-paragraph version:\n\n${reviewText}`, "Review my note");
							setMode("home"); setReviewText("");
						}}
						onCancel={() => setMode("home")} />
				)}
				{mode==="pprompt" && (
					<PromptDeck S={S} text={reviewText} setText={setReviewText}
						onRun={(p,label) => callAbby(`Run review prompt ${p} (${label}) on this ABA note:\n\n${reviewText||"(no note pasted — explain what this prompt checks and what you need)"}`, `Run ${p}`)}
						onCancel={() => setMode("home")} />
				)}
				{mode==="audit" && auditResults.length>0 && (
					<AuditDeck S={S} results={auditResults}
						score={Math.round((auditResults.filter(r=>r.pass).length/auditResults.length)*100)}
						onSaveAsPrior={saveAsPrior} onClose={() => setMode("home")} />
				)}
			</div>

			{/* Settings sheet */}
			{showSettings && (
				<div style={S.overlay} onClick={() => setShowSettings(false)}>
					<div style={S.sheet} onClick={e => e.stopPropagation()}>
						<div style={S.sheetHandle} />
						<div style={S.sheetTitle}>Personalize Abby</div>
						<SettingsGroup S={S} label="Theme">
							{Object.keys(THEMES).map(k => <SettingsOpt key={k} S={S} on={theme===k} onClick={() => setTheme(k)}>{k}</SettingsOpt>)}
						</SettingsGroup>
						<SettingsGroup S={S} label="Accent color">
							{Object.entries(ACCENTS).map(([k,[a,b]]) => (
								<button key={k} onClick={() => setAccent(k)}
									style={{ ...S.swatch, background:`linear-gradient(135deg,${a},${b})`, outline:accent===k?`2px solid ${T.heading}`:"none", outlineOffset:2 }} />
							))}
						</SettingsGroup>
						<SettingsGroup S={S} label="Font">
							{Object.keys(FONTS).map(k => <SettingsOpt key={k} S={S} on={font===k} onClick={() => setFont(k)} style={{ fontFamily:FONTS[k] }}>{k}</SettingsOpt>)}
						</SettingsGroup>
						<SettingsGroup S={S} label="Text size">
							{Object.keys(SIZES).map(k => <SettingsOpt key={k} S={S} on={size===k} onClick={() => setSize(k)}>{k}</SettingsOpt>)}
						</SettingsGroup>
						<SettingsGroup S={S} label="Bubble style">
							{["Rounded","Sharp","Square"].map(k => <SettingsOpt key={k} S={S} on={bubble===k} onClick={() => setBubble(k)}>{k}</SettingsOpt>)}
						</SettingsGroup>
						<button style={S.doneBtn} onClick={() => setShowSettings(false)}>Done</button>
					</div>
				</div>
			)}
		</div>
	);
}

// Inject keyframe animations once
if (typeof document !== "undefined" && !document.getElementById("abby-kf")) {
	const tag = document.createElement("style");
	tag.id = "abby-kf";
	tag.textContent = `
		@keyframes ab{0%,60%,100%{transform:translateY(0);opacity:0.4}30%{transform:translateY(-5px);opacity:1}}
		@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
		::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:rgba(139,92,246,0.3);border-radius:2px}
		button:active{transform:scale(0.97)}
	`;
	document.head.appendChild(tag);
}
