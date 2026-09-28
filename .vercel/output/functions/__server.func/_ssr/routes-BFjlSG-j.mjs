import { i as __toESM } from "../_runtime.mjs";
import { b as require_jsx_runtime, q as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { n as matchClause, t as getLibrary } from "./matcher-BuQWFhkh.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BFjlSG-j.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var classifyWithAi = createServerFn({ method: "POST" }).validator((input) => {
	const clause = (input?.clause ?? "").trim();
	if (clause.length < 12) throw new Error("Clause is too short.");
	return {
		clause: clause.slice(0, 8e3),
		geminiKey: (input.geminiKey ?? "").trim().slice(0, 200)
	};
}).handler(createSsrRpc("f8be139d2f1d11753afcfa0d6c267a1518311c5e2f4d53e1f5fba78118e3f68a"));
var samples_default = [
	{
		"id": "dscr",
		"title": "DSCR",
		"expected": "DSCR",
		"text": "Debt Service Coverage Ratio or DSCR shall mean, on any date, in respect of a Financial Year, the ratio of (a) is to (b) below, calculated based on the last audited annual financial statement of the Borrower: the aggregate of net profit after tax for that period, non cash adjustments including depreciation and amortization, finance costs including interest payments, to the aggregate amount of the Repayment Instalments together with interest. The Borrower shall maintain DSCR of not less than 1.10."
	},
	{
		"id": "dsra",
		"title": "DSRA",
		"expected": "DSRA Maintenance",
		"text": "Debt Service Reserve or DSR shall mean the reserve to be created and maintained at all times during the currency of the Facility by the Borrower in the Debt Service Reserve Account, in the manner as specified in Clause 13.35, of an amount equivalent to the aggregate of the Repayment Installments and interest amounts payable by the Borrower to the Lenders for the ensuing 2 (two) Fiscal Quarters in terms of the Finance Documents. DSRA shortfall shall be funded promptly."
	},
	{
		"id": "restricted",
		"title": "Restricted payments",
		"expected": "Restricted Payment Testing",
		"text": "Restricted Payments shall mean all distributions of the Borrower (either in cash, property or obligations) on, or other payments by way of investment or loans or advances or distributions, on account of purchase, retirement or other acquisition of any partnership interest of the Borrower or any payment of interest, principal or other sum in relation to any unsecured loan, partner loans, or any management fee. No dividends or restricted payments unless Restricted Payment Conditions are met, there is no default, and reserves are funded."
	},
	{
		"id": "put",
		"title": "Put option",
		"expected": "Put Option",
		"text": "The Lenders shall have a Put Option to require the Borrower to mandatorily prepay the outstanding Facility upon occurrence of a Put Option Event, by issuing a notice of not less than 90 (ninety) days. Upon exercise of the Put Option the Borrower shall prepay the Prepayment Amount together with accrued interest."
	},
	{
		"id": "debt",
		"title": "Additional indebtedness",
		"expected": "Additional Indebtedness",
		"text": "The Borrower shall not incur any additional indebtedness except Permitted Indebtedness. Permitted Indebtedness shall mean the Existing Facilities, subordinated facilities provided by the Sponsor, the Facility, and any other Indebtedness availed with the prior written approval of the Lenders. No further borrowings or additional financial debt without lender consent."
	},
	{
		"id": "shareholding",
		"title": "Shareholding / control",
		"expected": "Shareholding",
		"text": "The Sponsor shall maintain Management Control of the Borrower, including legal and beneficial ownership of minimum 51% (fifty one percent) of the partnership interest of the Borrower directly. No dilution of shareholding or change in ownership structure without the prior written approval of the Lenders."
	},
	{
		"id": "tra",
		"title": "TRA / escrow",
		"expected": "TRA/Escrow/Designated account opening",
		"text": "Account(s) or TRA Account shall mean the Existing TRA created with the TRA Agent and each of its sub accounts set up under the TRA Agreement or any other account agreed acceptable to the Lenders in which Project cash flows or Receivables are deposited. All project proceeds shall be deposited in the Trust and Retention Account and utilised strictly in accordance with the cash flow waterfall."
	},
	{
		"id": "irr",
		"title": "Inverter reserve",
		"expected": "Inverter replacement reserve/IRR",
		"text": "Inverter Replacement Reserve or IRR shall mean the reserve created/to be created by the Borrower in accordance with the terms of the TRA Agreement and Clause 13.45 set forth in this Agreement. The Borrower shall maintain the inverter replacement reserve fund in a separate account."
	},
	{
		"id": "spread",
		"title": "Spread reset",
		"expected": "Spread reset",
		"text": "Spread Reset - The Lenders have the right to reset the Spread applicable to the Lending Rate, as per the terms of Schedule 3 till the Final Settlement Date with a prior notice of 15 (fifteen) days to the Borrower. Each date on which the Spread can be reset is a Spread Reset Date. The applicable margin may be revised upon credit spread revision."
	},
	{
		"id": "security",
		"title": "Security creation",
		"expected": "Security Creation & Perfection",
		"text": "The Borrower shall create and perfect security over all Project Assets in favour of the Security Trustee acting for the benefit of the Secured Parties, including Deed of Hypothecation of movable assets, mortgage of Immovable Property, charge creation, ROC filing and CERSAI registration, within the prescribed timelines for perfection of security."
	},
	{
		"id": "insurance",
		"title": "Insurance",
		"expected": "Insurance",
		"text": "The Borrower shall obtain and maintain insurance contracts and policies required in terms of this Agreement in relation to the Project. Lenders shall be named as beneficiary or loss payee. Insurance policies shall be renewed in a timely manner and copies of insurance certificates submitted to the Lenders' Agent."
	},
	{
		"id": "prepay",
		"title": "Prepayment premium",
		"expected": "Prepayment premium",
		"text": "Prepayment Premium shall mean the rate of interest which may be prescribed by the Lenders from time to time at which the Borrower may prepay the Secured Obligations in terms of the provisions of this Agreement. Any voluntary prepayment shall attract make whole premium and prepayment charges as notified by the Lenders."
	},
	{
		"id": "ppa",
		"title": "PPA validity",
		"expected": "PPA Validity",
		"text": "The Borrower shall maintain in full force a valid Power Purchase Agreement with the Offtaker. Project Documents include the Power Purchase Agreement(s) and offtake agreement. Any termination or non-renewal of the PPA shall be notified to the Lenders and may require mandatory prepayment based on Annual Revenue contribution."
	},
	{
		"id": "default_interest",
		"title": "Default interest",
		"expected": "Default Interest",
		"text": "Upon any delay in payment of any Secured Obligations on the Due Date, the Borrower shall pay Additional Interest and Modified Interest as specified in Clause 3.4.2. Such default interest, penal interest and delayed payment interest shall accrue until the overdue amount is paid in full."
	},
	{
		"id": "esg",
		"title": "ESG / E&S",
		"expected": "ESG KPI monitoring",
		"text": "The Borrower shall submit a bird mortality/injury report every 6 (six) months during the currency of the Facility, conduct noise monitoring once in 6 months near the receptors within 500m radius of WTGs, and ensure environmental compliance, labour and safety reporting including ESG and E&S performance data."
	},
	{
		"id": "rating",
		"title": "Credit rating",
		"expected": "External rating report",
		"text": "The Borrower must obtain a credit rating from an approved Credit Rating Agency such as CARE, CRISIL, India Ratings or ICRA Limited. Initial rating within the stipulated period of first disbursement and annual rating surveillance and renewal thereafter. Any downgrade in the existing credit rating of the Borrower is a Deterioration in Creditworthiness."
	},
	{
		"id": "om",
		"title": "O&M contract",
		"expected": "O&M contract Validity",
		"text": "O&M Contract(s) shall mean the contract(s) entered into by the O&M Contractor in relation to the Project, including the full service agreement for operations and maintenance dated December 16, 2021 and the comprehensive operation and maintenance agreement. The Borrower shall keep a valid O&M contract in force and renew or extend the O&M agreement as required."
	},
	{
		"id": "sponsor",
		"title": "Sponsor support",
		"expected": "Sponsor Support Undertaking",
		"text": "Sponsor Support Undertaking shall mean the undertaking to be executed by the Sponsor and the Borrower in favour of the Security Trustee and the Lenders' Agent, in a form and manner satisfactory to the Lenders. The Sponsor shall provide equity support and infuse promoter contribution as required under the support agreement."
	},
	{
		"id": "disposal",
		"title": "Asset disposal",
		"expected": "Asset Disposal",
		"text": "Permitted Disposal shall mean any disposal, sale, lease or conveyance of assets of the Borrower that are not exceeding 5% (five percent) of the Project Cost. The Borrower shall not transfer, sell or divest Project Assets other than a Permitted Disposal without prior written consent of the Lenders."
	},
	{
		"id": "audited",
		"title": "Audited financials",
		"expected": "Audited Financials/Annual report",
		"text": "The Borrower shall submit audited financial statements including profit and loss account, balance sheet and annual report, together with the statutory auditor certification confirming a true and fair view, and comparative financials to the prior year, within the prescribed timeline after the end of each Financial Year."
	},
	{
		"id": "unmatched",
		"title": "Unmatched (construction progress)",
		"expected": null,
		"text": "The Borrower shall paint all wind turbine towers with aviation obstruction markings in alternating bands of orange and white in accordance with DGCA circulars, and shall install aviation warning lights on each nacelle prior to first generation."
	}
];
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function pct(n) {
	if (n == null || Number.isNaN(n)) return "—";
	return `${Math.round(n * 100)}`;
}
function Badge({ className, tone = "default", children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium tracking-wide", tone === "default" && "border-border text-muted-foreground", tone === "accent" && "border-primary/30 bg-primary/8 text-primary", tone === "critical" && "border-danger/30 bg-danger/8 text-danger", tone === "quiet" && "border-transparent bg-muted text-muted-foreground", className),
		children
	});
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-[opacity,transform,background-color] duration-[var(--motion-quick)] ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98]", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground hover:opacity-90",
			secondary: "bg-secondary text-secondary-foreground hover:bg-muted",
			outline: "border border-border bg-transparent text-foreground hover:bg-muted/60",
			ghost: "text-foreground hover:bg-muted/70"
		},
		size: {
			default: "h-11 rounded-[var(--radius-sm)] px-4 text-sm",
			sm: "h-9 rounded-[var(--radius-xs)] px-3 text-xs",
			lg: "h-12 rounded-[var(--radius-md)] px-5 text-sm"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function Button({ className, variant, size, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		...props
	});
}
function Input({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		className: cn("h-11 w-full rounded-[var(--radius-sm)] border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", className),
		...props
	});
}
function Separator({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("h-px w-full bg-border", className),
		role: "separator"
	});
}
function Textarea({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn("min-h-[220px] w-full resize-y rounded-[var(--radius-md)] border border-border bg-card px-4 py-3 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", className),
		...props
	});
}
var samples = samples_default;
var DEFAULT_THRESHOLD = .38;
function CovenantWorkbench() {
	const library = (0, import_react.useMemo)(() => getLibrary(), []);
	const [tab, setTab] = (0, import_react.useState)("match");
	const [clause, setClause] = (0, import_react.useState)(samples[0]?.text ?? "");
	const [activeSample, setActiveSample] = (0, import_react.useState)(samples[0]?.id ?? "");
	const [topK, setTopK] = (0, import_react.useState)(8);
	const [threshold, setThreshold] = (0, import_react.useState)(DEFAULT_THRESHOLD);
	const [forceAi, setForceAi] = (0, import_react.useState)(false);
	const [geminiKey, setGeminiKey] = (0, import_react.useState)("");
	const [libraryFilter, setLibraryFilter] = (0, import_react.useState)("");
	const [libraryResult, setLibraryResult] = (0, import_react.useState)(null);
	const [aiResult, setAiResult] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const expected = samples.find((s) => s.id === activeSample)?.expected;
	function loadSample(sample) {
		setActiveSample(sample.id);
		setClause(sample.text);
		setLibraryResult(null);
		setAiResult(null);
		setError(null);
	}
	async function runMatch() {
		setError(null);
		setAiResult(null);
		const local = matchClause(clause, topK, threshold);
		setLibraryResult(local);
		if (!local.ok) {
			setError(local.error ?? "Could not match.");
			return;
		}
		if (!forceAi && !local.needsAi) return;
		setBusy(true);
		try {
			const ai = await classifyWithAi({ data: {
				clause,
				geminiKey: geminiKey || void 0
			} });
			setAiResult(ai);
			if (!ai.ok) setError(ai.error ?? "AI fallback failed.");
		} catch (err) {
			setError(err instanceof Error ? err.message : "AI fallback failed.");
		} finally {
			setBusy(false);
		}
	}
	const filteredLibrary = library.filter((c) => {
		if (!libraryFilter.trim()) return true;
		const q = libraryFilter.toLowerCase();
		return c.subtype.toLowerCase().includes(q) || c.covenantType.toLowerCase().includes(q) || c.keywordsRaw.toLowerCase().includes(q);
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
			className: "border-b border-border",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-end sm:justify-between sm:px-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] font-semibold tracking-[0.22em] text-muted-foreground uppercase",
						children: "Facility agreement screening"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-1 font-display text-4xl font-medium tracking-[-0.04em] text-foreground sm:text-5xl",
						children: "Covenant Scout"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground",
						children: [
							"Paste a clause. Keyword, semantic, and hybrid search rank the",
							" ",
							library.length,
							" subtypes from the Covenant Matrix. Weak hits fall through to Gemini or Grok."
						]
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabButton, {
						active: tab === "match",
						onClick: () => setTab("match"),
						children: "Matcher"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabButton, {
						active: tab === "library",
						onClick: () => setTab("library"),
						children: "Library"
					})]
				})]
			})
		}), tab === "match" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			className: "mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] sm:px-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-[var(--radius-xl)] border border-border bg-card p-4 sm:p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-3 flex items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-sm font-semibold",
							children: "Clause text"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-mono text-[11px] text-muted-foreground tabular-nums",
							children: [clause.trim().length, " chars"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						value: clause,
						onChange: (e) => {
							setClause(e.target.value);
							setActiveSample("");
						},
						placeholder: "Paste a covenant clause or definition from the Facility Agreement…",
						"aria-label": "Clause text"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 mb-2 text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase",
						children: "Samples from the wind facility agreement"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-1.5",
						children: samples.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => loadSample(s),
							className: cn("h-9 rounded-full border px-3 text-xs", activeSample === s.id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground hover:bg-muted"),
							children: s.title
						}, s.id))
					}),
					expected ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-xs text-muted-foreground",
						children: [
							"Expected library hit:",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-foreground",
								children: expected
							})
						]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, { className: "my-5" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-4 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "mb-1.5 block font-medium text-muted-foreground",
								children: ["Top matches · ", topK]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "range",
								min: 3,
								max: 12,
								value: topK,
								onChange: (e) => setTopK(Number(e.target.value)),
								className: "w-full accent-primary"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mb-1.5 block font-medium text-muted-foreground",
								children: `AI fallback if hybrid < ${pct(threshold)}`
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "range",
								min: 20,
								max: 70,
								value: Math.round(threshold * 100),
								onChange: (e) => setThreshold(Number(e.target.value) / 100),
								className: "w-full accent-primary"
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "mt-4 flex items-start gap-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							className: "mt-1 size-4 accent-primary",
							checked: forceAi,
							onChange: (e) => setForceAi(e.target.checked)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Always run meaning-based AI, even when the library is confident." })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "mt-3 block text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mb-1.5 block font-medium text-muted-foreground",
							children: "Gemini API key (optional)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "password",
							autoComplete: "off",
							placeholder: "Leave blank to use Grok when available",
							value: geminiKey,
							onChange: (e) => setGeminiKey(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "mt-5 w-full",
						size: "lg",
						onClick: () => void runMatch(),
						disabled: busy,
						children: busy ? "Reading clause…" : "Match subtypes"
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-4 rounded-[var(--radius-md)] border border-danger/30 bg-danger/8 px-4 py-3 text-sm text-danger",
				children: error
			}) : null, !libraryResult ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultHeader, { result: libraryResult }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
						className: "space-y-3",
						children: libraryResult.matches.map((hit, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MatchCard, {
							hit,
							rank: i + 1,
							source: "library"
						}) }, hit.id))
					}),
					busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Asking Gemini / Grok to read the clause…"
					}) : null,
					aiResult?.ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-[var(--radius-xl)] border border-border bg-card p-4 sm:p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase",
								children: ["Meaning-based · ", aiResult.provider ?? "AI"]
							}),
							aiResult.unmatched ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 text-sm",
								children: ["No library subtype is a clean fit.", aiResult.suggestedSubtype ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
									" ",
									"Suggested new subtype:",
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: aiResult.suggestedSubtype })
								] }) : null]
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3 space-y-3",
								children: aiResult.matches.map((hit, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MatchCard, {
									hit,
									rank: i + 1,
									source: "ai"
								}, `ai-${hit.id}`))
							})
						]
					}) : null
				]
			})] })]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			className: "mx-auto max-w-6xl px-4 py-8 sm:px-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl font-medium tracking-[-0.03em]",
					children: "Covenant Matrix"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted-foreground",
					children: [
						filteredLibrary.length,
						" of ",
						library.length,
						" subtypes"
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					className: "max-w-sm",
					placeholder: "Filter subtype, type, or keyword",
					value: libraryFilter,
					onChange: (e) => setLibraryFilter(e.target.value)
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "overflow-hidden rounded-[var(--radius-xl)] border border-border bg-card",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "hidden grid-cols-[minmax(0,1.4fr)_120px_140px_90px_90px] gap-3 border-b border-border px-4 py-3 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase sm:grid",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Subtype" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Category" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Type" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Nature" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Severity" })
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { children: filteredLibrary.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "border-b border-border px-4 py-3 last:border-b-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-1 sm:grid-cols-[minmax(0,1.4fr)_120px_140px_90px_90px] sm:items-start sm:gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium",
								children: c.subtype
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs leading-relaxed text-muted-foreground",
								children: c.keywords.slice(0, 5).join(" · ")
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: c.category
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: c.covenantType
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: c.nature
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								tone: c.criticality.toLowerCase().includes("non") ? "quiet" : "critical",
								children: c.criticality || "—"
							})
						]
					})
				}, c.id)) })]
			})]
		})]
	});
}
function TabButton({ active, onClick, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		className: cn("h-11 min-w-[7.5rem] rounded-[var(--radius-sm)] border px-4 text-sm font-medium", active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:bg-muted"),
		children
	});
}
function EmptyState() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-[420px] flex-col justify-between rounded-[var(--radius-xl)] border border-dashed border-border bg-card/60 p-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase",
				children: "Ranked subtypes"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-2 font-display text-3xl font-medium tracking-[-0.03em]",
				children: "Load a sample, or paste your own chunk."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 max-w-md text-sm leading-relaxed text-muted-foreground",
				children: "Hybrid score blends keyword hits on the Smart AI list, TF-IDF semantic similarity, and fuzzy title overlap. If the best hybrid score is below the threshold, meaning-based AI ranks the same library."
			})
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-muted-foreground",
			children: "Source sheet: Covenant Matrix · POC template"
		})]
	});
}
function ResultHeader({ result }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-wrap items-end justify-between gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase",
			children: "Library ranking"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-1 font-display text-3xl font-medium tracking-[-0.03em] tabular-nums",
			children: [pct(result.bestScore), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "ml-1 text-lg text-muted-foreground",
				children: "hybrid"
			})]
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
			tone: result.confident ? "accent" : "quiet",
			children: result.confident ? "Confident — AI not required" : "Below threshold — AI recommended"
		})]
	});
}
function MatchCard({ hit, rank, source }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "rounded-[var(--radius-lg)] border border-border bg-card p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-mono text-[11px] text-muted-foreground tabular-nums",
							children: [
								String(rank).padStart(2, "0"),
								" · ",
								hit.id
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mt-0.5 text-base font-semibold leading-snug",
							children: hit.subtype
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-xs text-muted-foreground",
							children: [
								hit.category,
								" · ",
								hit.covenantType,
								" · ",
								hit.nature
							]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-right",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-2xl font-medium tabular-nums tracking-[-0.03em]",
						children: pct(hit.scores.hybrid)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] text-muted-foreground",
						children: source === "ai" ? "AI" : "hybrid"
					})]
				})]
			}),
			source === "library" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 grid grid-cols-3 gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScoreMeter, {
						label: "Keyword",
						value: hit.scores.keyword
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScoreMeter, {
						label: "Semantic",
						value: hit.scores.semantic
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScoreMeter, {
						label: "Fuzzy",
						value: hit.scores.fuzzy
					})
				]
			}) : null,
			hit.reason ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm leading-relaxed text-muted-foreground",
				children: hit.reason
			}) : null,
			hit.matchedKeywords.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 flex flex-wrap gap-1.5",
				children: hit.matchedKeywords.map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: "accent",
					children: k
				}, k))
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap gap-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: hit.criticality.toLowerCase().includes("non") ? "quiet" : "critical",
					children: hit.criticality || "severity n/a"
				}), hit.checker ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: hit.checker }) : null]
			})
		]
	});
}
function ScoreMeter({ label, value }) {
	const v = value ?? 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-1 flex justify-between text-[11px] text-muted-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-mono tabular-nums",
			children: pct(value)
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "score-bar",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { width: `${Math.max(2, Math.round(v * 100))}%` } })
	})] });
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CovenantWorkbench, {});
}
//#endregion
export { Home as component };
