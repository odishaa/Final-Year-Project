import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { blockchainAPI, gemstoneAPI } from '../services/api';

const S3 = 'https://skul7candy-project-stuff.s3.us-east-1.amazonaws.com';
const HERO_IMG = `${S3}/image.png`;
const GEM_IMG  = `${S3}/Gemini_Generated_Image_2u1w3h2u1w3h2u1w.jpg`;

const LEARNING_ARTICLES = [
  {
    category: 'Foundations',
    title: 'Gemology 101: Understanding Precious Stones',
    desc: 'A beginner guide to the physical and optical properties that define a gemstone value.',
    time: '8 min read',
    href: '/learn/gemology-101',
  },
{
  category: 'Grading',
  title: 'The 4 Cs and Beyond: Grading Standards Explained',
  desc: 'How cut, clarity, colour, and carat interact — and what NGJA certification adds on top.',
  time: '10 min read',
  href: '/learn/grading-standards',
},
{
  category: 'Market',
  title: 'Reading Gemstone Market Trends',
  desc: 'Price drivers, seasonal cycles, and how blockchain provenance is reshaping buyer confidence.',
  time: '6 min read',
  href: '/learn/market-trends',
},
{
  category: 'Investment',
  title: 'Gemstones as an Alternative Asset',
  desc: 'Portfolio diversification, liquidity considerations, and how to evaluate stones for long-term holding.',
  time: '12 min read',
  href: '/learn/investment-guide',
},
{
  category: 'Authentication',
  title: 'How Blockchain Authentication Works',
  desc: 'SHA-256 hashing, immutable ledgers, and why on-chain records beat paper certificates.',
  time: '7 min read',
  href: '/learn/blockchain-auth',
},
{
  category: 'Sri Lanka',
  title: 'Sri Lankan Gems: A Heritage of Colour',
  desc: 'From Ratnapura to global markets — the origin story of Ceylon sapphires, cats-eyes, and alexandrite.',
  time: '9 min read',
  href: '/learn/sri-lankan-gems',
},
];

const Home = () => {
  const [stats, setStats] = useState({
    totalBlocks: 0,
    totalGemstones: 0,
    blockchainValid: false,
  });

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const [blockchainRes, gemstonesRes] = await Promise.all([
        blockchainAPI.getInfo(),
                                                              gemstoneAPI.getAll({ limit: 1 }),
      ]);
      const verification = await blockchainAPI.verify();
      setStats({
        totalBlocks: blockchainRes.data.data.totalBlocks,
        totalGemstones: gemstonesRes.data.data.total,
        blockchainValid: verification.data.data.valid,
      });
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  return (
    <>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400;1,500&family=Outfit:wght@300;400;500;600&display=swap');

      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

      :root {
        --cream:   #f5f2ec;
        --stone:   #e8e2d6;
        --mink:    #b8a99a;
        --ink:     #1c1917;
        --ink-60:  rgba(28,25,23,0.60);
        --ink-30:  rgba(28,25,23,0.30);
        --gold:    #c9a84c;
        --gold-lt: #e8d5a3;
        --white:   #ffffff;
        --valid:   #3d6b4e;
        --invalid: #8b3535;
        --serif:   'Playfair Display', Georgia, serif;
        --sans:    'Outfit', sans-serif;
        --radius:  2px;
      }

      .gc { font-family: var(--sans); color: var(--ink); background: var(--cream); overflow-x: hidden; }

      /* ── HERO ───────────────────────────────────────────── */
      .gc-hero {
        position: relative;
        height: 100svh;
        min-height: 680px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        overflow: hidden;
      }

      .gc-hero__panel {
        position: relative;
        z-index: 2;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        padding: 0 64px 72px;
        background: var(--ink);
      }

      .gc-hero__tag {
        font-family: var(--sans);
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.22em;
        text-transform: uppercase;
        color: var(--gold);
        margin-bottom: 28px;
      }

      .gc-hero__title {
        font-family: var(--serif);
        font-size: clamp(3.2rem, 4.8vw, 5.4rem);
        font-weight: 400;
        line-height: 1.08;
        color: var(--white);
        margin-bottom: 6px;
      }
      .gc-hero__title em {
        font-style: italic;
        color: var(--gold-lt);
      }

      .gc-hero__rule {
        width: 48px;
        height: 1px;
        background: var(--gold);
        margin: 28px 0;
        opacity: 0.7;
      }

      .gc-hero__sub {
        font-size: 17px;
        font-weight: 300;
        color: rgba(255,255,255,0.55);
        line-height: 1.85;
        max-width: 380px;
        margin-bottom: 48px;
      }

      .gc-hero__ctas { display: flex; gap: 14px; flex-wrap: wrap; }

      .gc-btn-primary {
        display: inline-block;
        background: var(--gold);
        color: var(--ink);
        padding: 14px 36px;
        font-family: var(--sans);
        font-size: 13px;
        font-weight: 600;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        text-decoration: none;
        border-radius: var(--radius);
        transition: background 0.2s, transform 0.15s;
      }
      .gc-btn-primary:hover { background: var(--gold-lt); transform: translateY(-1px); }

      .gc-btn-ghost {
        display: inline-block;
        background: transparent;
        color: rgba(255,255,255,0.75);
        padding: 13px 36px;
        border: 1px solid rgba(255,255,255,0.22);
        font-family: var(--sans);
        font-size: 13px;
        font-weight: 500;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        text-decoration: none;
        border-radius: var(--radius);
        transition: background 0.2s, border-color 0.2s;
      }
      .gc-btn-ghost:hover { background: rgba(255,255,255,0.07); border-color: rgba(255,255,255,0.45); }

      .gc-hero__img-wrap {
        position: relative;
        overflow: hidden;
      }
      .gc-hero__img-wrap::after {
        content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to right, rgba(28,25,23,0.45) 0%, transparent 50%);
      }
      .gc-hero__img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
      }

      .gc-hero__badge {
        position: absolute;
        bottom: 48px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 10;
        background: rgba(28,25,23,0.82);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(201,168,76,0.35);
        border-radius: var(--radius);
        padding: 18px 32px;
        text-align: center;
        white-space: nowrap;
      }
      .gc-hero__badge-label {
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        color: var(--gold);
        display: block;
        margin-bottom: 4px;
      }
      .gc-hero__badge-val {
        font-family: var(--serif);
        font-size: 1.2rem;
        font-weight: 400;
        color: var(--white);
      }

      /* ── STATS ──────────────────────────────────────────── */
      .gc-stats {
        background: var(--white);
        border-bottom: 1px solid var(--stone);
      }
      .gc-stats__inner {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 56px;
        display: grid;
        grid-template-columns: repeat(3,1fr);
      }
      .gc-stat {
        padding: 56px 40px;
        border-right: 1px solid var(--stone);
        position: relative;
      }
      .gc-stat:last-child { border-right: none; }
      .gc-stat::before {
        content: '';
  position: absolute;
  top: 0; left: 40px;
  width: 32px; height: 2px;
  background: var(--gold);
      }
      .gc-stat__number {
        font-family: var(--serif);
        font-size: 4.2rem;
        font-weight: 400;
        color: var(--ink);
        line-height: 1;
        margin-bottom: 14px;
      }
      .gc-stat__number--valid   { color: var(--valid); }
      .gc-stat__number--invalid { color: var(--invalid); }
      .gc-stat__label {
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: var(--mink);
      }

      /* ── SPLIT SHOWCASE ─────────────────────────────────── */
      .gc-showcase {
        display: grid;
        grid-template-columns: 1fr 1fr;
        min-height: 560px;
        border-top: 1px solid var(--stone);
      }
      .gc-showcase__img-wrap {
        position: relative;
        overflow: hidden;
      }
      .gc-showcase__img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
        display: block;
      }
      .gc-showcase__img-wrap::after {
        content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(201,168,76,0.12) 0%, transparent 60%);
      }
      .gc-showcase__content {
        background: var(--ink);
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 72px 64px;
      }
      .gc-showcase__eyebrow {
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.22em;
        text-transform: uppercase;
        color: var(--gold);
        margin-bottom: 20px;
      }
      .gc-showcase__title {
        font-family: var(--serif);
        font-size: clamp(2rem, 3vw, 2.9rem);
        font-weight: 400;
        line-height: 1.2;
        color: var(--white);
        margin-bottom: 24px;
      }
      .gc-showcase__title em { font-style: italic; color: var(--gold-lt); }
      .gc-showcase__body {
        font-size: 16px;
        font-weight: 300;
        color: rgba(255,255,255,0.52);
        line-height: 1.85;
        max-width: 400px;
      }
      .gc-showcase__divider {
        width: 40px; height: 1px;
        background: var(--gold);
        opacity: 0.5;
        margin: 28px 0;
      }

      /* ── FEATURES ───────────────────────────────────────── */
      .gc-features-wrap {
        background: var(--cream);
        padding: 96px 56px;
      }
      .gc-features-inner { max-width: 1200px; margin: 0 auto; }
      .gc-section-tag {
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.22em;
        text-transform: uppercase;
        color: var(--gold);
        margin-bottom: 16px;
      }
      .gc-section-heading {
        font-family: var(--serif);
        font-size: clamp(2.1rem, 3.2vw, 3rem);
        font-weight: 400;
        line-height: 1.15;
        color: var(--ink);
        margin-bottom: 64px;
        max-width: 520px;
      }
      .gc-features-grid {
        display: grid;
        grid-template-columns: repeat(4,1fr);
        gap: 1px;
        background: var(--stone);
        border: 1px solid var(--stone);
        border-radius: var(--radius);
        overflow: hidden;
      }
      .gc-feature {
        background: var(--white);
        padding: 40px 30px 44px;
        position: relative;
        transition: background 0.18s;
      }
      .gc-feature:hover { background: #fdfcf9; }
      .gc-feature::after {
        content: '';
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 2px;
  background: var(--gold);
  opacity: 0;
  transition: opacity 0.2s;
      }
      .gc-feature:hover::after { opacity: 1; }
      .gc-feature__num {
        font-family: var(--serif);
        font-size: 2.6rem;
        font-weight: 400;
        color: var(--stone);
        line-height: 1;
        margin-bottom: 20px;
      }
      .gc-feature__title {
        font-size: 15px;
        font-weight: 600;
        letter-spacing: 0.03em;
        color: var(--ink);
        margin-bottom: 12px;
      }
      .gc-feature__desc {
        font-size: 15px;
        font-weight: 300;
        color: var(--ink-60);
        line-height: 1.78;
      }

      /* ── LEARNING HUB ───────────────────────────────────── */
      .gc-learn-wrap {
        background: var(--white);
        border-top: 1px solid var(--stone);
        border-bottom: 1px solid var(--stone);
        padding: 96px 56px;
      }
      .gc-learn-inner { max-width: 1200px; margin: 0 auto; }
      .gc-learn-header {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        margin-bottom: 56px;
        gap: 24px;
        flex-wrap: wrap;
      }
      .gc-learn-header-text {}
      .gc-learn-all {
        display: inline-block;
        font-size: 13px;
        font-weight: 500;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--gold);
        text-decoration: none;
        border-bottom: 1px solid rgba(201,168,76,0.4);
        padding-bottom: 2px;
        white-space: nowrap;
        transition: border-color 0.2s, color 0.2s;
      }
      .gc-learn-all:hover { border-color: var(--gold); color: #a8872e; }
      .gc-learn-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1px;
        background: var(--stone);
        border: 1px solid var(--stone);
        border-radius: var(--radius);
        overflow: hidden;
      }
      .gc-learn-card {
        background: var(--cream);
        padding: 36px 32px 40px;
        display: flex;
        flex-direction: column;
        text-decoration: none;
        color: inherit;
        position: relative;
        transition: background 0.18s;
      }
      .gc-learn-card:hover { background: #f9f6f0; }
      .gc-learn-card::after {
        content: '';
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 2px;
  background: var(--gold);
  opacity: 0;
  transition: opacity 0.2s;
      }
      .gc-learn-card:hover::after { opacity: 1; }
      .gc-learn-card__pill {
        display: inline-block;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: #a8872e;
        background: rgba(201,168,76,0.14);
        padding: 4px 10px;
        border-radius: 2px;
        margin-bottom: 20px;
        align-self: flex-start;
      }
      .gc-learn-card__title {
        font-family: var(--serif);
        font-size: 1.25rem;
        font-weight: 400;
        line-height: 1.3;
        color: var(--ink);
        margin-bottom: 14px;
      }
      .gc-learn-card__desc {
        font-size: 15px;
        font-weight: 300;
        color: var(--ink-60);
        line-height: 1.78;
        flex: 1;
        margin-bottom: 24px;
      }
      .gc-learn-card__meta {
        font-size: 12px;
        font-weight: 500;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--mink);
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .gc-learn-card__meta::before {
        content: '';
  display: inline-block;
  width: 16px;
  height: 1px;
  background: var(--mink);
      }

      /* ── HOW IT WORKS ───────────────────────────────────── */
      .gc-process-wrap {
        background: var(--cream);
        border-top: 1px solid var(--stone);
        border-bottom: 1px solid var(--stone);
        padding: 96px 56px;
      }
      .gc-process-inner { max-width: 1200px; margin: 0 auto; }
      .gc-steps {
        display: grid;
        grid-template-columns: repeat(4,1fr);
        gap: 40px;
        position: relative;
        margin-top: 64px;
      }
      .gc-steps::before {
        content: '';
  position: absolute;
  top: 20px;
  left: calc(12.5% + 20px);
  right: calc(12.5% + 20px);
  height: 1px;
  background: var(--stone);
      }
      .gc-step { text-align: center; }
      .gc-step__dot {
        width: 40px; height: 40px;
        border: 1px solid var(--stone);
        border-radius: 50%;
        background: var(--white);
        display: flex; align-items: center; justify-content: center;
        margin: 0 auto 28px;
        position: relative; z-index: 1;
        transition: border-color 0.2s, background 0.2s;
      }
      .gc-step:hover .gc-step__dot {
        border-color: var(--gold);
        background: rgba(201,168,76,0.06);
      }
      .gc-step__dot-inner {
        width: 10px; height: 10px;
        border-radius: 50%;
        background: var(--mink);
        transition: background 0.2s;
      }
      .gc-step:hover .gc-step__dot-inner { background: var(--gold); }
      .gc-step__title {
        font-size: 13px;
        font-weight: 600;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--ink);
        margin-bottom: 14px;
      }
      .gc-step__desc {
        font-size: 15px;
        font-weight: 300;
        color: var(--ink-60);
        line-height: 1.78;
      }

      /* ── CTA BANNER ─────────────────────────────────────── */
      .gc-cta {
        background: var(--ink);
        padding: 112px 56px;
        text-align: center;
        position: relative;
        overflow: hidden;
      }
      .gc-cta::before {
        content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 60% 80% at 50% 110%, rgba(201,168,76,0.10) 0%, transparent 70%);
  pointer-events: none;
      }
      .gc-cta__eyebrow {
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.22em;
        text-transform: uppercase;
        color: var(--gold);
        margin-bottom: 20px;
      }
      .gc-cta__title {
        font-family: var(--serif);
        font-size: clamp(2.2rem, 4vw, 3.6rem);
        font-weight: 400;
        color: var(--white);
        line-height: 1.1;
        margin-bottom: 18px;
      }
      .gc-cta__title em { font-style: italic; color: var(--gold-lt); }
      .gc-cta__sub {
        font-size: 16px;
        font-weight: 300;
        color: rgba(255,255,255,0.38);
        margin-bottom: 48px;
      }
      .gc-btn-cta {
        display: inline-block;
        background: transparent;
        color: rgba(255,255,255,0.85);
        padding: 15px 54px;
        border: 1px solid rgba(201,168,76,0.45);
        font-family: var(--sans);
        font-size: 13px;
        font-weight: 600;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        text-decoration: none;
        border-radius: var(--radius);
        transition: background 0.2s, border-color 0.2s, transform 0.15s;
      }
      .gc-btn-cta:hover {
        background: rgba(201,168,76,0.08);
        border-color: var(--gold);
        transform: translateY(-1px);
      }

      /* ── RESPONSIVE ─────────────────────────────────────── */
      @media (max-width: 980px) {
        .gc-hero { grid-template-columns: 1fr; height: auto; min-height: auto; }
        .gc-hero__img-wrap { height: 55vw; min-height: 300px; }
        .gc-hero__panel { padding: 56px 32px 64px; }
        .gc-stats__inner { grid-template-columns: 1fr; }
        .gc-stat { border-right: none; border-bottom: 1px solid var(--stone); padding: 40px 32px; }
        .gc-stat::before { left: 32px; }
        .gc-showcase { grid-template-columns: 1fr; }
        .gc-showcase__img-wrap { height: 50vw; min-height: 260px; }
        .gc-showcase__content { padding: 56px 32px; }
        .gc-features-grid { grid-template-columns: repeat(2,1fr); }
        .gc-learn-grid { grid-template-columns: repeat(2,1fr); }
        .gc-steps { grid-template-columns: repeat(2,1fr); }
        .gc-steps::before { display: none; }
        .gc-features-wrap, .gc-process-wrap, .gc-learn-wrap { padding: 64px 32px; }
        .gc-cta { padding: 80px 32px; }
      }
      @media (max-width: 560px) {
        .gc-features-grid { grid-template-columns: 1fr; }
        .gc-learn-grid { grid-template-columns: 1fr; }
        .gc-steps { grid-template-columns: 1fr; }
        .gc-hero__ctas { flex-direction: column; }
        .gc-btn-primary, .gc-btn-ghost { text-align: center; }
        .gc-hero__badge { display: none; }
        .gc-learn-header { flex-direction: column; align-items: flex-start; }
      }
      `}</style>

      <div className="gc">

      {/* ── HERO ── */}
      <section className="gc-hero">
      <div className="gc-hero__panel">
      <p className="gc-hero__tag">GemChain — Blockchain Authentication</p>
      <h1 className="gc-hero__title">
      Provenance<br />You Can <em>Trust</em>
      </h1>
      <div className="gc-hero__rule" />
      <p className="gc-hero__sub">
      Secure, transparent gemstone authentication powered by blockchain
      technology and official NGJA certification.
      </p>
      <div className="gc-hero__ctas">
      <Link to="/register" className="gc-btn-primary">Get Started</Link>
      <Link to="/gemstones" className="gc-btn-ghost">Explore Gemstones</Link>
      </div>
      </div>

      <div className="gc-hero__img-wrap">
      <img className="gc-hero__img" src={HERO_IMG} alt="Gemstone collection" />
      </div>

      <div className="gc-hero__badge">
      <span className="gc-hero__badge-label">Blockchain Status</span>
      <span className="gc-hero__badge-val">
      {stats.blockchainValid ? '✓ Verified & Valid' : '✗ Needs Review'}
      </span>
      </div>
      </section>

      {/* ── STATS ── */}
      <section className="gc-stats">
      <div className="gc-stats__inner">
      <div className="gc-stat">
      <div className="gc-stat__number">{stats.totalBlocks}</div>
      <div className="gc-stat__label">Blockchain Blocks</div>
      </div>
      <div className="gc-stat">
      <div className="gc-stat__number">{stats.totalGemstones}</div>
      <div className="gc-stat__label">Registered Gemstones</div>
      </div>
      <div className="gc-stat">
      <div className={`gc-stat__number ${stats.blockchainValid ? 'gc-stat__number--valid' : 'gc-stat__number--invalid'}`}>
      {stats.blockchainValid ? 'Valid' : 'Invalid'}
      </div>
      <div className="gc-stat__label">Chain Integrity</div>
      </div>
      </div>
      </section>

      {/* ── SPLIT SHOWCASE ── */}
      <section className="gc-showcase">
      <div className="gc-showcase__img-wrap">
      <img className="gc-showcase__img" src={GEM_IMG} alt="Certified gemstone" />
      </div>
      <div className="gc-showcase__content">
      <p className="gc-showcase__eyebrow">Certified Authenticity</p>
      <h2 className="gc-showcase__title">
      Every stone tells<br />a <em>verified</em> story
      </h2>
      <div className="gc-showcase__divider" />
      <p className="gc-showcase__body">
      GemChain creates an immutable, cryptographically secured record for
      every gemstone — from mine to market. Each block in the chain captures
      origin, grading, ownership transfer, and NGJA certification status,
      giving buyers and sellers unshakeable confidence in every transaction.
      </p>
      </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="gc-features-wrap">
      <div className="gc-features-inner">
      <p className="gc-section-tag">Capabilities</p>
      <h2 className="gc-section-heading">Built for trust at every step of the chain</h2>
      <div className="gc-features-grid">
      <div className="gc-feature">
      <div className="gc-feature__num">01</div>
      <div className="gc-feature__title">Blockchain Security</div>
      <p className="gc-feature__desc">
      Immutable records secured with SHA-256 cryptographic hashing,
      ensuring tamper-proof provenance for every stone.
      </p>
      </div>
      <div className="gc-feature">
      <div className="gc-feature__num">02</div>
      <div className="gc-feature__title">NGJA Integration</div>
      <p className="gc-feature__desc">
      Official certification pipeline with the National Gem &amp;
      Jewellery Authority, adding regulatory validity to each record.
      </p>
      </div>
      <div className="gc-feature">
      <div className="gc-feature__num">03</div>
      <div className="gc-feature__title">Price Analysis</div>
      <p className="gc-feature__desc">
      Real-time market trends and data-driven price estimation to
      support informed trading decisions.
      </p>
      </div>
      <div className="gc-feature">
      <div className="gc-feature__num">04</div>
      <div className="gc-feature__title">Knowledge Hub</div>
      <p className="gc-feature__desc">
      Curated educational content covering gemstone identification,
      grading standards, and market fundamentals.
      </p>
      </div>
      </div>
      </div>
      </section>

      {/* ── LEARNING HUB ── */}
      <section className="gc-learn-wrap">
      <div className="gc-learn-inner">
      <div className="gc-learn-header">
      <div className="gc-learn-header-text">
      <p className="gc-section-tag">Learning Hub</p>
      <h2 className="gc-section-heading" style={{ marginBottom: 0 }}>
      Know your stones,<br />know their worth
      </h2>
      </div>
      <Link to="/learn" className="gc-learn-all">View all articles →</Link>
      </div>
      <div className="gc-learn-grid">
      {LEARNING_ARTICLES.map((a) => (
        <Link to={a.href} className="gc-learn-card" key={a.href}>
        <span className="gc-learn-card__pill">{a.category}</span>
        <h3 className="gc-learn-card__title">{a.title}</h3>
        <p className="gc-learn-card__desc">{a.desc}</p>
        <span className="gc-learn-card__meta">{a.time}</span>
        </Link>
      ))}
      </div>
      </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="gc-process-wrap">
      <div className="gc-process-inner">
      <p className="gc-section-tag">Process</p>
      <h2 className="gc-section-heading">From registration to verified ownership</h2>
      <div className="gc-steps">
      <div className="gc-step">
      <div className="gc-step__dot"><div className="gc-step__dot-inner" /></div>
      <div className="gc-step__title">Register</div>
      <p className="gc-step__desc">Create your account and submit your gemstone details to the platform.</p>
      </div>
      <div className="gc-step">
      <div className="gc-step__dot"><div className="gc-step__dot-inner" /></div>
      <div className="gc-step__title">Record</div>
      <p className="gc-step__desc">Each gemstone is hashed and written as an immutable block on-chain.</p>
      </div>
      <div className="gc-step">
      <div className="gc-step__dot"><div className="gc-step__dot-inner" /></div>
      <div className="gc-step__title">Certify</div>
      <p className="gc-step__desc">Submit to NGJA for official certification and regulatory approval.</p>
      </div>
      <div className="gc-step">
      <div className="gc-step__dot"><div className="gc-step__dot-inner" /></div>
      <div className="gc-step__title">Track &amp; Transfer</div>
      <p className="gc-step__desc">Full ownership history recorded transparently at every transfer.</p>
      </div>
      </div>
      </div>
      </section>

      {/* ── CTA ── */}
      <section className="gc-cta">
      <p className="gc-cta__eyebrow">Get Started</p>
      <h2 className="gc-cta__title">
      The future of gemstone<br /><em>authentication</em> starts here
      </h2>
      <p className="gc-cta__sub">Join a transparent, immutable record of provenance and trust</p>
      <Link to="/register" className="gc-btn-cta">Create Free Account</Link>
      </section>

      </div>
      </>
  );
};

export default Home;
