import { useState, useRef, useEffect } from "react";

const ABBY_SYSTEM_PROMPT = `You are Abby, a gentle and warm ABA documentation assistant for RBTs at D&D Behavior Solutions / Miami Behavior Center. You assist Yasiel Perez, RBT, with drafting and reviewing ABA session notes.

## Abby's voice and style:
- Speak with warmth, grace, and quiet confidence — like a knowledgeable colleague who is always kind
- Keep every response short and elegant. Never be verbose. One or two sentences of guidance, then clickable options
- Use OPTIONS blocks generously — offer choices rather than asking open-ended questions whenever possible
- Never lecture or over-explain. Trust the RBT's experience
- When something needs attention, flag it gently but clearly

You have three modes:
- DRAFT mode: write a note from scratch based on session details the RBT provides
- REVIEW mode: review/improve an existing note for compliance and quality
- P-PROMPT mode: run specific review prompts P1–P12 on an existing note

## Non-negotiable rules (apply to every note):
1. One continuous paragraph. No headers, lists, or line breaks. Exception: two paragraphs only if service location changed mid-session.
2. Under 70% similarity to prior week — vary phrasing actively.
3. BIP-only documentation — behaviors and programs only if defined in the client's BIP.
4. Correct client name throughout.
5. Never write "Response blocking" — use: "protective physical guidance was briefly implemented to ensure client and environmental safety."
6. No electronic devices as reinforcers (TV, video games, tablets, phones prohibited).
7. Minimum 3 maladaptive behaviors for 4–6 hr sessions; minimum 3 skill programs in full detail.
8. Data must cover every behavior and every program.
9. Skill acquisition accuracy percentages must come from Office Puzzle's current STOs — never estimate.
10. Session opening must describe specific observable behaviors — not vague labels like "dysregulated," "alert," or "calm."

## DRAFT mode — gather these details:
- Client name, session date, location, participants
- What was the client physically doing when the RBT arrived (specific observable behaviors)
- Environmental/medical context reported by caregiver
- Teaching approaches (DTT, NET, or both)
- For each maladaptive behavior (min 3): name, antecedent, duration/frequency, interventions (per the BSP), outcome, reinforcer + schedule
- For each skill program (min 3): program name, goal, teaching context, prompting level, response type (independent vs prompted), % accuracy from Office Puzzle, reinforcer + schedule
- Closing activity and transition behavior
- Next session date/location

## REVIEW mode — check for:
- All 15 items on the quality checklist
- Vague language, missing antecedents, unlabeled schedules
- Interventions not matching the BIP

## P-PROMPT mode — available prompts:
P1: Intervention source check (BSP attribution)
P2: Reinforcement schedule labeling (CRF/FR/VR)
P3: Independent vs. prompted response differential
P4: Satiation and deprivation management
P5: Teaching-context DTT vs NET delivery match
P6: Replicability / vague-language audit
P7: Session-to-session continuity check
P8: Data-to-narrative alignment
P9: Trend summary generator
P10: Forward bridge statement
P11: Reinforcer continuity tracker
P12: Cross-note coherence audit

## ETHAN R. approved interventions (BIP):
- Repetitive stereotypical behavior: Environmental manipulation, Antecedent manipulation, DRA, DRI, DRO, Redirection, Incidental teaching
- Self-injurious behavior: Environmental manipulation, Antecedent manipulation, DRI, DRA, DRO, Redirection, Least to most prompting, Fading
- Tantrum: Antecedent manipulation, Priming, Behavior momentum, DRA, DRO, Redirection, Least to most prompting, Pivot praise
- Physical aggression: Environmental manipulation, Antecedent manipulation, DRI, DRA, DRO, Redirection, Least to most prompting
- Climbing: Environmental manipulation, Antecedent manipulation, DRI, DRA, Redirection, Least to most prompting
- Throwing objects: Environmental manipulation, Antecedent manipulation, DRI, DRA, DRO, Redirection, Least to most prompting
- Noncompliance: Antecedent manipulation, Priming, Behavior momentum, DRA, Least to most prompting, Fading, DTT
- Self-Stimulatory Behavior: Antecedent manipulation, Environmental manipulation, DRI, DRA, DRO, Redirection, Incidental teaching
- PICA: Environmental manipulation, Antecedent manipulation, DRI, DRA, DRO, Redirection, Least to most prompting, Shaping

## ANTONI H. approved interventions (BIP):
- Tantrums: Antecedent manipulation, Priming, Provide choices, Behavior momentum, Non-contingent attention, DRA, DRO, Escape extinction, Token economy, Redirection to alternative response
- Task refusal: Antecedent manipulation, Visual cues, Premack principle, Behavior momentum, Priming, Errorless teaching, DTT, DRA, Escape extinction, Token economy
- Elopement: Environmental manipulation, Antecedent manipulation, Visual cue, Non-contingent reinforcement, DRI, Response blocking less than 15 seconds, Redirection to alternative behavior, DRA
- Off task: Antecedent manipulation, Visual cues, Priming, Behavior momentum, Non-contingent reinforcement, DRA, Incidental teaching
- Physical aggression: Environmental manipulation, Antecedent manipulation, Response blocking less than 15 seconds, DRA, DRI, DRO, Non-contingent attention, Escape extinction
- Excessive eating: Antecedent manipulation, Visual cues, Non-contingent reinforcement, DRA, DRO, Response interruption and redirection, Token economy, Redirection to alternative response
- Self-injurious behavior: Environmental manipulation, Antecedent manipulation, Response blocking less than 15 seconds, Response interruption and redirection, DRI, DRA, DRO, Non-contingent attention
- Disruptive behavior: Antecedent manipulation, Visual cues, Priming, Non-contingent reinforcement, Non-contingent attention, DRO, DRA, Token economy, Redirection to alternative response
- Inappropriate sexual behavior: Environmental manipulation, Antecedent manipulation, Visual cues, Response blocking less than 15 seconds, Response interruption and redirection, DRA, DRO, Redirection to alternative response, Non-contingent reinforcement

Flag any undocumented intervention as: [INTERVENTION NOT APPROVED FOR THIS BEHAVIOR — BCBA REVIEW REQUIRED]
Flag any unsupported narrative claim as: [UNSUPPORTED — verify against data sheet]

## Language principles:
- Write in professional clinical English
- Vary terminology week to week
- Always use "per the BSP" when naming interventions
- Schedule labels: CRF, FR-n, VR-n
- Abbreviations: FCT, DRA, DRI, DRO, LTM, NCR, NCA, RIRD, DTT, NET, BIP, BSP, BCaBA, BCBA, RBT, CRF, FR, VR, STO
- Opening: describe specific actions (running, vocalizing, refusing to sit) — never just label a mood

IMPORTANT — CLICKABLE OPTIONS FORMAT:
When you want to present the user with choices, format them using this exact pattern:
OPTIONS:
- Option one
- Option two
- Option three
END_OPTIONS

Use this for: mode selection, client selection, yes/no decisions, behavior lists, skill program lists, antecedent choices, intervention choices, outcome choices, reinforcer choices, etc. Always use OPTIONS blocks instead of asking the user to type their answers when choices are finite.

Respond conversationally and helpfully. When drafting, ask clarifying questions one group at a time. When you have enough information, produce the complete note.`;

const WELCOME_MESSAGE = {
	role: "assistant",
	content: `Hello! I'm **Abby** — here to help with your session notes.

What shall we work on?

OPTIONS:
- Draft a new session note
- Review an existing note
- Run P1–P12 review prompts
END_OPTIONS`,
};

function parseOptions(content: string) {
	const regex = /OPTIONS:\n([\s\S]*?)\nEND_OPTIONS/g;
	const segments: Array<{ type: string; content?: string; options?: string[] }> = [];
	let lastIndex = 0;
	let match: RegExpExecArray | null;

	while ((match = regex.exec(content)) !== null) {
		if (match.index > lastIndex) {
			segments.push({
				type: "text",
				content: content.slice(lastIndex, match.index).trim(),
			});
		}
		const options = match[1]
			.split("\n")
			.map((l) => l.replace(/^-\s*/, "").trim())
			.filter(Boolean);
		segments.push({ type: "options", options });
		lastIndex = match.index + match[0].length;
	}

	if (lastIndex < content.length) {
		const remaining = content.slice(lastIndex).trim();
		if (remaining) segments.push({ type: "text", content: remaining });
	}

	return segments;
}

function renderText(text: string) {
	return text.split("\n").map((line, i, arr) => {
		const parts = line.split(/(\*\*[^*]+\*\*|\[.*?REQUIRED\]|\[UNSUPPORTED.*?\])/g);
		return (
			<span key={i}>
				{parts.map((part, j) => {
					if (part.startsWith("**") && part.endsWith("**")) {
						return <strong key={j}>{part.slice(2, -2)}</strong>;
					}
					if (part.includes("REQUIRED")) {
						return (
							<span key={j} style={{ color: "#dc2626", fontWeight: 600, fontSize: 12 }}>
								{part}
							</span>
						);
					}
					if (part.startsWith("[UNSUPPORTED")) {
						return (
							<span key={j} style={{ color: "#d97706", fontWeight: 600, fontSize: 12 }}>
								{part}
							</span>
						);
					}
					return part;
				})}
				{i < arr.length - 1 && <br />}
			</span>
		);
	});
}

interface Message {
	role: "user" | "assistant";
	content: string;
}

export default function AbbyAgent() {
	const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE as Message]);
	const [input, setInput] = useState("");
	const [loading, setLoading] = useState(false);
	const [usedOptions, setUsedOptions] = useState<Set<string>>(new Set());
	const bottomRef = useRef<HTMLDivElement>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages, loading]);

	const adjustTextarea = () => {
		const el = textareaRef.current;
		if (el) {
			el.style.height = "auto";
			el.style.height = Math.min(el.scrollHeight, 160) + "px";
		}
	};

	const sendMessage = async (text?: string) => {
		const msg = (text || input).trim();
		if (!msg || loading) return;

		const newMessages: Message[] = [...messages, { role: "user", content: msg }];
		setMessages(newMessages);
		setInput("");
		setLoading(true);
		if (textareaRef.current) textareaRef.current.style.height = "auto";

		try {
			const apiMessages = newMessages.map((m) => ({
				role: m.role,
				content: m.content.replace(/\*\*/g, ""),
			}));

			const fullHistory = [
				{ role: "user", content: "Hello Abby" },
				{
					role: "assistant",
					content:
						"Hi! I'm Abby, your ABA documentation buddy. I can draft notes, review notes, or run P1–P12 prompts. Which client and mode today?",
				},
				...apiMessages,
			];

			const response = await fetch("https://api.anthropic.com/v1/messages", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					model: "claude-sonnet-4-20250514",
					max_tokens: 1000,
					system: ABBY_SYSTEM_PROMPT,
					messages: fullHistory,
				}),
			});

			const data = await response.json();
			const reply =
				data.content?.map((b: { text?: string }) => b.text || "").join("\n") ||
				"Sorry, I didn't get a response.";
			setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
		} catch {
			setMessages((prev) => [
				...prev,
				{ role: "assistant", content: "Something went wrong. Please try again." },
			]);
		} finally {
			setLoading(false);
		}
	};

	const handleOptionClick = (msgIndex: number, option: string) => {
		const key = `${msgIndex}`;
		if (usedOptions.has(key)) return;
		setUsedOptions((prev) => new Set([...prev, key]));
		sendMessage(option);
	};

	const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	};

	return (
		<div
			style={{
				minHeight: "100vh",
				background: "linear-gradient(160deg, #f8f9fc 0%, #f0f4f9 100%)",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				fontFamily: "'Crimson Pro', 'Georgia', serif",
			}}
		>
			<style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,300;0,400;0,500;0,600;1,400&family=DM+Mono:wght@300;400;500&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.3; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .msg-enter { animation: fadeUp 0.25s ease forwards; }
        .option-btn {
          background: white;
          border: 1px solid #dde3ed;
          color: #1e3a5f;
          padding: 10px 18px;
          border-radius: 10px;
          font-family: 'Crimson Pro', Georgia, serif;
          font-size: 15px;
          font-weight: 400;
          cursor: pointer;
          text-align: left;
          transition: all 0.18s ease;
          line-height: 1.5;
          box-shadow: 0 1px 3px rgba(30,58,95,0.06);
        }
        .option-btn:hover {
          background: #1e3a5f;
          color: white;
          border-color: #1e3a5f;
          box-shadow: 0 3px 10px rgba(30,58,95,0.18);
          transform: translateY(-1px);
        }
        .option-btn:disabled {
          opacity: 0.38;
          cursor: default;
          transform: none;
          box-shadow: none;
        }
        .send-btn:hover:not(:disabled) {
          background: #1e3a5f !important;
          box-shadow: 0 2px 8px rgba(30,58,95,0.3) !important;
        }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #d1d9e6; border-radius: 2px; }
      `}</style>

			{/* Header */}
			<div
				style={{
					width: "100%",
					maxWidth: 680,
					padding: "32px 28px 0",
					boxSizing: "border-box",
				}}
			>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: 14,
						paddingBottom: 18,
						borderBottom: "1px solid #d1d9e6",
					}}
				>
					{/* Avatar */}
					<div
						style={{
							width: 44,
							height: 44,
							borderRadius: "50%",
							background: "linear-gradient(135deg, #1e3a5f 0%, #2d5a8e 100%)",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							flexShrink: 0,
							boxShadow: "0 2px 8px rgba(30,58,95,0.25)",
						}}
					>
						{/* Leaf / gentle mark */}
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
							<path
								d="M12 22C12 22 4 16 4 9a8 8 0 0116 0c0 7-8 13-8 13z"
								stroke="white"
								strokeWidth="1.6"
								strokeLinejoin="round"
								fill="rgba(255,255,255,0.15)"
							/>
							<path
								d="M12 22V12"
								stroke="white"
								strokeWidth="1.6"
								strokeLinecap="round"
							/>
							<path
								d="M12 15c-2-1-4-3-4-6"
								stroke="white"
								strokeWidth="1.4"
								strokeLinecap="round"
								opacity="0.7"
							/>
						</svg>
					</div>
					<div>
						<div
							style={{
								color: "#1e3a5f",
								fontSize: 20,
								fontWeight: 600,
								letterSpacing: "-0.3px",
								lineHeight: 1,
								fontStyle: "italic",
							}}
						>
							Abby
						</div>
						<div
							style={{
								color: "#8494a7",
								fontSize: 10,
								fontFamily: "'DM Mono', monospace",
								letterSpacing: "0.11em",
								marginTop: 4,
								textTransform: "uppercase",
							}}
						>
							ABA Documentation Assistant
						</div>
					</div>

					<div style={{ marginLeft: "auto", textAlign: "right" }}>
						<div
							style={{
								fontSize: 10,
								fontFamily: "'DM Mono', monospace",
								color: "#b0bac8",
								letterSpacing: "0.07em",
								textTransform: "uppercase",
							}}
						>
							D&D Behavior Solutions
						</div>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								gap: 5,
								justifyContent: "flex-end",
								marginTop: 5,
							}}
						>
							<div
								style={{
									width: 6,
									height: 6,
									borderRadius: "50%",
									background: loading ? "#f59e0b" : "#22c55e",
									animation: loading ? "pulse 1s infinite" : "none",
									transition: "background 0.3s",
								}}
							/>
							<span
								style={{
									color: loading ? "#f59e0b" : "#22c55e",
									fontSize: 9,
									fontFamily: "'DM Mono', monospace",
									letterSpacing: "0.12em",
									transition: "color 0.3s",
								}}
							>
								{loading ? "THINKING" : "READY"}
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* Messages */}
			<div
				style={{
					flex: 1,
					width: "100%",
					maxWidth: 680,
					padding: "24px 28px",
					boxSizing: "border-box",
					display: "flex",
					flexDirection: "column",
					gap: 20,
				}}
			>
				{messages.map((msg, i) => {
					const isUser = msg.role === "user";
					const segments = isUser ? null : parseOptions(msg.content);

					return (
						<div
							key={i}
							className="msg-enter"
							style={{
								display: "flex",
								flexDirection: "column",
								alignItems: isUser ? "flex-end" : "flex-start",
								gap: 8,
							}}
						>
							{isUser ? (
								<div
									style={{
										background: "#1e3a5f",
										color: "white",
										padding: "11px 18px",
										borderRadius: "18px 18px 4px 18px",
										fontSize: 15,
										lineHeight: 1.6,
										maxWidth: "78%",
										fontWeight: 400,
									}}
								>
									{msg.content}
								</div>
							) : (
								<div
									style={{ maxWidth: "88%", display: "flex", flexDirection: "column", gap: 10 }}
								>
									{/* Abby label */}
									<div
										style={{
											fontSize: 10,
											fontFamily: "'DM Mono', monospace",
											color: "#94a3b8",
											letterSpacing: "0.1em",
											textTransform: "uppercase",
											paddingLeft: 2,
										}}
									>
										Abby
									</div>

									{segments &&
										segments.map((seg, si) => {
											if (seg.type === "text" && seg.content) {
												return (
													<div
														key={si}
														style={{
															background: "white",
															border: "1px solid #e4eaf3",
															borderLeft: "3px solid #2d5a8e",
															padding: "14px 18px",
															borderRadius: "0 14px 14px 0",
															fontSize: 15,
															lineHeight: 1.8,
															color: "#1e293b",
															boxShadow: "0 1px 6px rgba(30,58,95,0.06)",
														}}
													>
														{renderText(seg.content)}
													</div>
												);
											}
											if (seg.type === "options") {
												const isUsed = usedOptions.has(`${i}`);
												return (
													<div
														key={si}
														style={{
															display: "flex",
															flexDirection: "column",
															gap: 6,
															paddingLeft: 2,
														}}
													>
														<div
															style={{
																fontSize: 10,
																fontFamily: "'DM Mono', monospace",
																color: "#94a3b8",
																letterSpacing: "0.08em",
																textTransform: "uppercase",
																marginBottom: 2,
															}}
														>
															Select an option
														</div>
														{seg.options?.map((opt, oi) => (
															<button
																key={oi}
																className="option-btn"
																disabled={isUsed}
																onClick={() => handleOptionClick(i, opt)}
																style={{ opacity: isUsed ? 0.4 : 1 }}
															>
																<span
																	style={{
																		display: "inline-block",
																		width: 18,
																		height: 18,
																		borderRadius: "50%",
																		border: "1.5px solid currentColor",
																		fontSize: 10,
																		lineHeight: "16px",
																		textAlign: "center",
																		marginRight: 10,
																		flexShrink: 0,
																		fontFamily: "'DM Mono', monospace",
																		verticalAlign: "middle",
																	}}
																>
																	{String.fromCharCode(65 + oi)}
																</span>
																{opt}
															</button>
														))}
													</div>
												);
											}
											return null;
										})}
								</div>
							)}
						</div>
					);
				})}

				{/* Loading */}
				{loading && (
					<div
						className="msg-enter"
						style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start" }}
					>
						<div
							style={{
								fontSize: 10,
								fontFamily: "'DM Mono', monospace",
								color: "#94a3b8",
								letterSpacing: "0.1em",
								textTransform: "uppercase",
							}}
						>
							Abby
						</div>
						<div
							style={{
								background: "white",
								border: "1px solid #e4eaf3",
								borderLeft: "3px solid #2d5a8e",
								padding: "14px 20px",
								borderRadius: "0 14px 14px 0",
								display: "flex",
								gap: 6,
								alignItems: "center",
								boxShadow: "0 1px 6px rgba(30,58,95,0.06)",
							}}
						>
							{[0, 1, 2].map((n) => (
								<div
									key={n}
									style={{
										width: 6,
										height: 6,
										borderRadius: "50%",
										background: "#1e3a5f",
										animation: `bounce 1.2s ${n * 0.2}s infinite`,
									}}
								/>
							))}
						</div>
					</div>
				)}
				<div ref={bottomRef} />
			</div>

			{/* Input area */}
			<div
				style={{
					width: "100%",
					maxWidth: 680,
					padding: "0 28px 32px",
					boxSizing: "border-box",
				}}
			>
				<div
					style={{
						background: "white",
						border: "1.5px solid #cbd5e1",
						borderRadius: 14,
						padding: "10px 12px 10px 16px",
						display: "flex",
						gap: 10,
						alignItems: "flex-end",
						boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
						transition: "border-color 0.2s",
					}}
				>
					<textarea
						ref={textareaRef}
						value={input}
						onChange={(e) => {
							setInput(e.target.value);
							adjustTextarea();
						}}
						onKeyDown={handleKey}
						placeholder="Type your message or paste a note..."
						rows={1}
						style={{
							flex: 1,
							background: "transparent",
							border: "none",
							outline: "none",
							color: "#1e293b",
							fontSize: 15,
							fontFamily: "'Crimson Pro', Georgia, serif",
							lineHeight: 1.65,
							resize: "none",
							overflowY: "auto",
							maxHeight: 160,
						}}
					/>
					<button
						className="send-btn"
						onClick={() => sendMessage()}
						disabled={loading || !input.trim()}
						style={{
							width: 36,
							height: 36,
							borderRadius: "50%",
							background: loading || !input.trim() ? "#e2e8f0" : "#1e3a5f",
							border: "none",
							cursor: loading || !input.trim() ? "default" : "pointer",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							flexShrink: 0,
							transition: "background 0.2s",
						}}
					>
						<svg width="15" height="15" viewBox="0 0 24 24" fill="none">
							<path
								d="M22 2L11 13"
								stroke={loading || !input.trim() ? "#94a3b8" : "white"}
								strokeWidth="2"
								strokeLinecap="round"
							/>
							<path
								d="M22 2L15 22L11 13L2 9L22 2Z"
								stroke={loading || !input.trim() ? "#94a3b8" : "white"}
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</button>
				</div>
				<div
					style={{
						textAlign: "center",
						color: "#94a3b8",
						fontSize: 10,
						marginTop: 8,
						fontFamily: "'DM Mono', monospace",
						letterSpacing: "0.06em",
						textTransform: "uppercase",
					}}
				>
					Shift + Enter for new line · Enter to send
				</div>
			</div>
		</div>
	);
}
