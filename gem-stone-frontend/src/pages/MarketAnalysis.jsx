import { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { priceAPI, gemstoneAPI } from '../services/api';

/* ─────────────────────────────────────────────
   GEMINI SETUP
───────────────────────────────────────────── */
const GEMINI_API_KEY = 'AIzaSyCH5iBAfl7SNmtvyJO2HeBDUdO-_XvnyG4';
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const SYSTEM_CONTEXT = `You are an expert gemstone market analyst specializing in the Sri Lankan (Ceylon) gem industry.

Your expertise covers:
- Sri Lankan gemstone types: Blue Sapphire, Padparadscha Sapphire, Yellow Sapphire, Ruby, Emerald, Spinel, Cat's Eye Chrysoberyl, Alexandrite, Topaz, Garnet, Tourmaline, Moonstone, Zircon
- The National Gem & Jewellery Authority (NGJA) — Sri Lanka's official gem certification body
- Pricing: the 4Cs for colored stones (Color, Clarity, Cut, Carat), plus origin premium, treatment disclosure, and market demand
- The Ratnapura ("City of Gems") mining region — alluvial elam deposits, artisanal pit mining
- International gem markets: Middle East, USA, Japan, Europe — and how Ceylon gems perform globally
- Treatment impacts: unheated vs heat-treated premium (typically 30–300% premium for unheated top-quality stones)
- Origin premiums: Ceylon origin commands significant premiums, especially for blue sapphires and padparadscha
- Blockchain provenance: GemChain platform uses SHA-256 blockchain for immutable ownership and certification records

When responding:
- Provide specific price ranges in LKR (Sri Lankan Rupees) and USD where helpful
- Be data-driven and actionable — avoid vague generalities
- Structure responses with clear headings and bullet points for readability
- Mention relevant factors: treatment status, NGJA certification, origin, current demand trends
- Keep responses comprehensive but focused — aim for 300–600 words unless a broader analysis is requested`;

/* ─────────────────────────────────────────────
   PRESET QUERIES
───────────────────────────────────────────── */
const PRESETS = [
  {
    icon: '📊',
    title: 'Market Overview',
    tag: 'Sri Lanka 2026',
    prompt: 'Give a comprehensive overview of the Sri Lankan gemstone market in 2026. Cover: which gem types are most in demand, typical price ranges per carat in LKR and USD, key buyer demographics, and how the market has shifted in recent years.',
  },
  {
    icon: '💎',
    title: 'Sapphire Investment',
    tag: 'Investment',
    prompt: 'Analyze blue Ceylon sapphire as an investment vehicle. What quality benchmarks should an investor target? What price per carat represents good value vs overpriced? How liquid is this market? What risks should investors know?',
  },
  {
    icon: '🔥',
    title: 'Heat Treatment Impact',
    tag: 'Treatment',
    prompt: 'Explain the price premium for unheated vs heat-treated sapphires and rubies in the Sri Lankan market. Give specific LKR price examples for the same stone heated vs unheated. How is treatment detected and disclosed?',
  },
  {
    icon: '📜',
    title: 'NGJA Certification Value',
    tag: 'Certification',
    prompt: 'How does NGJA certification affect gemstone prices and marketability? What premium does a certified stone command over an uncertified one? Walk through what an NGJA certificate proves and why international buyers require it.',
  },
  {
    icon: '⚖️',
    title: 'Compare Gem Types',
    tag: 'Comparison',
    prompt: 'Compare the market dynamics of the four major Sri Lankan gemstones — Blue Sapphire, Ruby, Spinel, and Padparadscha. Which has the strongest price growth? Which is easiest to resell? Which offers the best value per carat for a buyer with LKR 500,000 to spend?',
  },
  {
    icon: '🛒',
    title: 'Buyer\'s Guide',
    tag: 'Buying',
    prompt: 'Create a practical buying guide for someone purchasing their first significant gemstone in Sri Lanka. What red flags indicate fraud? What documents to demand? How to verify NGJA certification? What price ranges indicate a scam? Where to buy safely?',
  },
  {
    icon: '🌍',
    title: 'Export & Global Demand',
    tag: 'Global Market',
    prompt: 'Analyze global demand for Sri Lankan gemstones. Which markets — Middle East, USA, Japan, Europe — are most active? What gem types do each market prefer? How does Ceylon origin affect pricing in international auctions vs local market?',
  },
  {
    icon: '🔮',
    title: 'Price Forecast',
    tag: 'Forecast',
    prompt: 'What are the price outlook and demand trends for Sri Lankan gemstones over the next 2–3 years? What macro factors — tourism, blockchain traceability, ethical sourcing demand, currency — will drive prices? Which gem types are poised to appreciate most?',
  },
];

/* ─────────────────────────────────────────────
   MARKDOWN RENDERER
───────────────────────────────────────────── */
const renderMarkdown = (text) => {
  if (!text) return null;

  const lines = text.split('\n');
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('## ')) {
      elements.push(<h2 key={i} className="ma-h2">{line.slice(3)}</h2>);
    } else if (line.startsWith('### ')) {
      elements.push(<h3 key={i} className="ma-h3">{line.slice(4)}</h3>);
    } else if (line.startsWith('# ')) {
      elements.push(<h1 key={i} className="ma-h1">{line.slice(2)}</h1>);
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      // Collect consecutive bullet lines
      const bullets = [];
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
        bullets.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="ma-ul">
          {bullets.map((b, bi) => (
            <li key={bi} className="ma-li">{inlineFormat(b)}</li>
          ))}
        </ul>
      );
      continue;
    } else if (/^\d+\.\s/.test(line)) {
      const bullets = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        bullets.push(lines[i].replace(/^\d+\.\s/, ''));
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} className="ma-ol">
          {bullets.map((b, bi) => (
            <li key={bi} className="ma-li">{inlineFormat(b)}</li>
          ))}
        </ol>
      );
      continue;
    } else if (line.trim() === '') {
      elements.push(<div key={i} className="ma-spacer" />);
    } else {
      elements.push(<p key={i} className="ma-p">{inlineFormat(line)}</p>);
    }

    i++;
  }

  return elements;
};

const inlineFormat = (text) => {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="ma-strong">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} className="ma-code">{part.slice(1, -1)}</code>;
    }
    return part;
  });
};

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
const MarketAnalysis = () => {
  const [query, setQuery]             = useState('');
  const [output, setOutput]           = useState('');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [activePreset, setActivePreset] = useState(null);
  const [platformData, setPlatformData] = useState(null);
  const [gemCount, setGemCount]       = useState(null);
  const outputRef                     = useRef(null);

  // Fetch live platform data to enrich Gemini context
  useEffect(() => {
    Promise.allSettled([
      priceAPI.getMarketOverview(),
      gemstoneAPI.getAll({ limit: 1 }),
    ]).then(([priceRes, gemRes]) => {
      if (priceRes.status === 'fulfilled') {
        setPlatformData(priceRes.value.data?.data || null);
      }
      if (gemRes.status === 'fulfilled') {
        setGemCount(gemRes.value.data?.data?.total || null);
      }
    });
  }, []);

  // Auto-scroll output as it streams
  useEffect(() => {
    if (outputRef.current && output) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const buildPrompt = (userQuery) => {
    let prompt = SYSTEM_CONTEXT;

    if (platformData) {
      prompt += `\n\n--- LIVE PLATFORM DATA (GemChain, ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}) ---\n`;
      prompt += JSON.stringify(platformData, null, 2);
    }
    if (gemCount !== null) {
      prompt += `\n\nTotal gemstones registered on GemChain platform: ${gemCount}`;
    }

    prompt += `\n\n--- USER QUESTION ---\n${userQuery}`;
    return prompt;
  };

  const analyze = async (promptText) => {
    if (!promptText.trim() || loading) return;
    setLoading(true);
    setOutput('');
    setError('');

    try {
      const fullPrompt = buildPrompt(promptText);
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: fullPrompt,
      });

      setOutput(response.text);
    } catch (err) {
      setError(err.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePreset = (preset, idx) => {
    setActivePreset(idx);
    setQuery(preset.prompt);
    analyze(preset.prompt);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setActivePreset(null);
    analyze(query);
  };

  const handleClear = () => {
    setOutput('');
    setQuery('');
    setActivePreset(null);
    setError('');
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300&family=DM+Sans:wght@300;400;500&display=swap');

        .ma-root {
          font-family: 'DM Sans', sans-serif;
          background: #fafaf8;
          min-height: 100vh;
        }

        /* ── Hero ── */
        .ma-hero {
          background: #0d0d0c;
          padding: 64px 48px 56px;
          position: relative;
          overflow: hidden;
        }
        .ma-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 70% 60% at 20% 50%, rgba(180,140,60,0.08) 0%, transparent 70%),
                      radial-gradient(ellipse 50% 80% at 80% 30%, rgba(60,80,180,0.06) 0%, transparent 70%);
          pointer-events: none;
        }
        .ma-hero__inner {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 32px;
          flex-wrap: wrap;
          position: relative;
        }
        .ma-hero__eyebrow {
          font-size: 10.5px;
          font-weight: 500;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: #c8a84a;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .ma-hero__eyebrow::before {
          content: '';
          display: inline-block;
          width: 24px;
          height: 1px;
          background: #c8a84a;
        }
        .ma-hero__title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2rem, 4vw, 3.2rem);
          font-weight: 300;
          color: #f0ebe0;
          line-height: 1.15;
          margin-bottom: 12px;
          letter-spacing: -0.01em;
        }
        .ma-hero__title em { font-style: italic; color: #c8a84a; }
        .ma-hero__sub {
          font-size: 13.5px;
          font-weight: 300;
          color: #6a6560;
          max-width: 480px;
          line-height: 1.7;
        }
        .ma-hero__badge {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #4a4540;
          background: #1a1a18;
          border: 1px solid #2e2e2c;
          padding: 10px 18px;
          flex-shrink: 0;
        }
        .ma-hero__badge-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #c8a84a;
          animation: maPulse 2s ease-in-out infinite;
        }
        @keyframes maPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }

        /* ── Main Layout ── */
        .ma-main {
          max-width: 1200px;
          margin: 0 auto;
          padding: 48px 48px 96px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          align-items: start;
        }

        /* ── Left Panel ── */
        .ma-left { }
        .ma-section-label {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #b8b3aa;
          margin-bottom: 18px;
        }

        /* Presets */
        .ma-presets {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 32px;
        }
        .ma-preset {
          background: #ffffff;
          border: 1px solid #e8e4dc;
          padding: 16px 16px 14px;
          text-align: left;
          cursor: pointer;
          transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
          display: flex;
          flex-direction: column;
          gap: 6px;
          position: relative;
        }
        .ma-preset:hover {
          border-color: #c8a84a;
          background: #fdfcf8;
        }
        .ma-preset--active {
          border-color: #c8a84a;
          background: #fdfcf4;
          box-shadow: inset 0 0 0 1px #c8a84a20;
        }
        .ma-preset--active::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: #c8a84a;
        }
        .ma-preset__icon {
          font-size: 18px;
          line-height: 1;
          margin-bottom: 4px;
        }
        .ma-preset__title {
          font-family: 'DM Sans', sans-serif;
          font-size: 12.5px;
          font-weight: 500;
          color: #1a1a1a;
          line-height: 1.3;
        }
        .ma-preset__tag {
          font-size: 9.5px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #b8b3aa;
        }
        .ma-preset--active .ma-preset__tag { color: #9a8040; }

        /* Custom input */
        .ma-input-card {
          background: #ffffff;
          border: 1px solid #e8e4dc;
          padding: 24px;
        }
        .ma-input-label {
          font-size: 10.5px;
          font-weight: 500;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #9a9490;
          margin-bottom: 12px;
        }
        .ma-textarea {
          font-family: 'DM Sans', sans-serif;
          font-size: 13.5px;
          font-weight: 300;
          color: #1a1a1a;
          background: #fafaf8;
          border: 1px solid #e0dbd2;
          padding: 14px;
          width: 100%;
          resize: vertical;
          min-height: 110px;
          outline: none;
          line-height: 1.65;
          transition: border-color 0.15s;
          box-sizing: border-box;
        }
        .ma-textarea:focus { border-color: #1a1a1a; }
        .ma-textarea::placeholder { color: #c0bbb4; }
        .ma-input-actions {
          display: flex;
          gap: 10px;
          margin-top: 12px;
          align-items: center;
        }
        .ma-btn-analyze {
          font-family: 'DM Sans', sans-serif;
          font-size: 11.5px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #ffffff;
          background: #1a1a1a;
          border: none;
          padding: 13px 28px;
          cursor: pointer;
          transition: background 0.15s;
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
          justify-content: center;
        }
        .ma-btn-analyze:hover:not(:disabled) { background: #c8a84a; }
        .ma-btn-analyze:disabled { opacity: 0.5; cursor: not-allowed; }
        .ma-btn-clear {
          font-family: 'DM Sans', sans-serif;
          font-size: 11.5px;
          font-weight: 400;
          color: #9a9490;
          background: none;
          border: 1px solid #e0dbd2;
          padding: 12px 18px;
          cursor: pointer;
          transition: color 0.15s, border-color 0.15s;
          white-space: nowrap;
        }
        .ma-btn-clear:hover { color: #1a1a1a; border-color: #1a1a1a; }

        /* Data context indicator */
        .ma-data-status {
          margin-top: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 300;
          color: #b8b3aa;
        }
        .ma-data-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: ${`#aad8a0`};
          flex-shrink: 0;
        }
        .ma-data-dot--off { background: #d0ccc4; }

        /* ── Right Panel — Output ── */
        .ma-right { position: sticky; top: 104px; }

        .ma-output-card {
          background: #ffffff;
          border: 1px solid #e8e4dc;
          min-height: 480px;
          display: flex;
          flex-direction: column;
        }
        .ma-output-header {
          padding: 18px 24px;
          border-bottom: 1px solid #f0ece4;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
        }
        .ma-output-title {
          font-size: 10.5px;
          font-weight: 500;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #9a9490;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .ma-output-indicator {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #e0dbd2;
        }
        .ma-output-indicator--streaming {
          background: #c8a84a;
          animation: maPulse 0.8s ease-in-out infinite;
        }
        .ma-output-indicator--done { background: #7ab870; }
        .ma-output-chars {
          font-size: 11px;
          font-weight: 300;
          color: #c8c3ba;
        }

        .ma-output-body {
          padding: 28px 28px 32px;
          flex: 1;
          overflow-y: auto;
          max-height: 600px;
        }

        /* Empty state */
        .ma-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 380px;
          text-align: center;
          gap: 16px;
        }
        .ma-empty__gem {
          font-size: 40px;
          opacity: 0.3;
          user-select: none;
        }
        .ma-empty__title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.4rem;
          font-weight: 300;
          color: #9a9490;
          line-height: 1.3;
        }
        .ma-empty__sub {
          font-size: 12.5px;
          font-weight: 300;
          color: #c8c3ba;
          max-width: 260px;
          line-height: 1.65;
        }

        /* Loading state */
        .ma-thinking {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12.5px;
          font-weight: 300;
          color: #9a9490;
          padding: 12px 0;
        }
        .ma-dots span {
          display: inline-block;
          width: 4px; height: 4px;
          border-radius: 50%;
          background: #c8a84a;
          animation: maDot 1.2s infinite;
          margin: 0 1.5px;
        }
        .ma-dots span:nth-child(2) { animation-delay: 0.2s; }
        .ma-dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes maDot {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.3; }
          40% { transform: translateY(-5px); opacity: 1; }
        }

        /* Cursor blink */
        .ma-cursor {
          display: inline-block;
          width: 2px;
          height: 1em;
          background: #c8a84a;
          margin-left: 2px;
          vertical-align: text-bottom;
          animation: maBlink 0.75s step-end infinite;
        }
        @keyframes maBlink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }

        /* Error */
        .ma-error {
          background: #fdf0f0;
          border: 1px solid #e8b8b8;
          color: #8b2a2a;
          padding: 16px 20px;
          font-size: 13px;
          font-weight: 300;
          line-height: 1.6;
        }

        /* Output content typography */
        .ma-h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.7rem;
          font-weight: 400;
          color: #1a1a1a;
          line-height: 1.25;
          margin: 0 0 16px;
        }
        .ma-h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.3rem;
          font-weight: 600;
          color: #1a1a1a;
          line-height: 1.3;
          margin: 28px 0 10px;
          padding-top: 20px;
          border-top: 1px solid #f0ece4;
        }
        .ma-h2:first-child { margin-top: 0; border-top: none; padding-top: 0; }
        .ma-h3 {
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #9a9490;
          margin: 20px 0 8px;
        }
        .ma-p {
          font-family: 'DM Sans', sans-serif;
          font-size: 13.5px;
          font-weight: 300;
          color: #2a2a28;
          line-height: 1.8;
          margin: 0 0 14px;
        }
        .ma-ul, .ma-ol {
          margin: 0 0 16px;
          padding-left: 20px;
        }
        .ma-li {
          font-family: 'DM Sans', sans-serif;
          font-size: 13.5px;
          font-weight: 300;
          color: #2a2a28;
          line-height: 1.75;
          margin-bottom: 6px;
        }
        .ma-strong { font-weight: 500; color: #1a1a1a; }
        .ma-code {
          font-family: monospace;
          font-size: 12px;
          background: #f5f2ec;
          border: 1px solid #e8e4dc;
          padding: 1px 6px;
          color: #4a3a1a;
        }
        .ma-spacer { height: 6px; }

        /* ── Responsive ── */
        @media (max-width: 960px) {
          .ma-main {
            grid-template-columns: 1fr;
            padding: 32px 32px 64px;
          }
          .ma-hero { padding: 48px 32px 40px; }
          .ma-right { position: static; }
        }
        @media (max-width: 600px) {
          .ma-main { padding: 24px 20px 48px; }
          .ma-hero { padding: 40px 20px 32px; }
          .ma-presets { grid-template-columns: 1fr; }
          .ma-hero__inner { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      <div className="ma-root">

        {/* Hero */}
        <div className="ma-hero">
          <div className="ma-hero__inner">
            <div>
              <div className="ma-hero__eyebrow">GemChain Intelligence</div>
              <h1 className="ma-hero__title">
                Gemstone<br /><em>Market Analysis</em>
              </h1>
              <p className="ma-hero__sub">
                AI-powered market insights for Sri Lankan gemstones — powered by Google Gemini.
                Get real-time analysis on pricing, investment, certification, and trends.
              </p>
            </div>
            <div className="ma-hero__badge">
              <span className="ma-hero__badge-dot" />
              Gemini AI · Live Analysis
            </div>
          </div>
        </div>

        {/* Main */}
        <div className="ma-main">

          {/* ── Left: Presets + Input ── */}
          <div className="ma-left">

            <div className="ma-section-label">Quick Analysis Topics</div>
            <div className="ma-presets">
              {PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  className={`ma-preset${activePreset === idx ? ' ma-preset--active' : ''}`}
                  onClick={() => handlePreset(preset, idx)}
                  disabled={loading}
                >
                  <span className="ma-preset__icon">{preset.icon}</span>
                  <span className="ma-preset__title">{preset.title}</span>
                  <span className="ma-preset__tag">{preset.tag}</span>
                </button>
              ))}
            </div>

            <div className="ma-input-card">
              <div className="ma-input-label">Custom Question</div>
              <form onSubmit={handleSubmit}>
                <textarea
                  className="ma-textarea"
                  placeholder="Ask anything about the gemstone market… e.g. 'What is a fair price for a 3ct unheated Burma ruby in the Sri Lankan market?'"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmit(e);
                  }}
                />
                <div className="ma-input-actions">
                  <button
                    type="submit"
                    className="ma-btn-analyze"
                    disabled={loading || !query.trim()}
                  >
                    {loading ? (
                      <>
                        <span className="ma-dots">
                          <span /><span /><span />
                        </span>
                        Analysing…
                      </>
                    ) : '✦ Analyze Market'}
                  </button>
                  {(output || error) && (
                    <button type="button" className="ma-btn-clear" onClick={handleClear}>
                      Clear
                    </button>
                  )}
                </div>
              </form>
              <div className="ma-data-status">
                <span className={`ma-data-dot${platformData ? '' : ' ma-data-dot--off'}`} />
                {platformData
                  ? 'Live platform price data included in analysis'
                  : 'Analysis uses expert knowledge base'
                }
              </div>
            </div>

          </div>

          {/* ── Right: Output ── */}
          <div className="ma-right">
            <div className="ma-output-card">
              <div className="ma-output-header">
                <div className="ma-output-title">
                  <span className={`ma-output-indicator${loading ? ' ma-output-indicator--streaming' : output ? ' ma-output-indicator--done' : ''}`} />
                  Analysis Output
                </div>
                {output && (
                  <span className="ma-output-chars">
                    {output.length.toLocaleString()} chars
                  </span>
                )}
              </div>

              <div className="ma-output-body" ref={outputRef}>
                {error ? (
                  <div className="ma-error">{error}</div>
                ) : !output && !loading ? (
                  <div className="ma-empty">
                    <div className="ma-empty__gem">◆</div>
                    <div className="ma-empty__title">
                      Select a topic or ask<br />a custom question
                    </div>
                    <p className="ma-empty__sub">
                      Gemini will analyze the Sri Lankan gemstone market and give you expert insights.
                    </p>
                  </div>
                ) : (
                  <>
                    {loading && (
                      <div className="ma-thinking">
                        <span className="ma-dots">
                          <span /><span /><span />
                        </span>
                        Gemini is analysing…
                      </div>
                    )}
                    {output && <div>{renderMarkdown(output)}</div>}
                  </>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default MarketAnalysis;
