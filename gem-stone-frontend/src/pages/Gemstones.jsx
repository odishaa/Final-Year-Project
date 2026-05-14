import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { gemstoneAPI } from '../services/api';

/* ─────────────────────────────────────────────────────────────
   GEM PALETTE — one colour identity per stone type
───────────────────────────────────────────────────────────── */
const GEM_PALETTES = {
  Sapphire:  { bg: '#e8eef8', c1: '#1a3a8f', c2: '#3b6fde', c3: '#7ba7f7', shine: '#c5d9ff', name: 'Sapphire'  },
  Ruby:      { bg: '#f8e8e8', c1: '#8f1a1a', c2: '#de3b3b', c3: '#f77b7b', shine: '#ffc5c5', name: 'Ruby'      },
  Emerald:   { bg: '#e8f8ec', c1: '#1a6b38', c2: '#2eb85c', c3: '#6fd98f', shine: '#c5f5d5', name: 'Emerald'   },
  Topaz:     { bg: '#fdf4e8', c1: '#7a4a10', c2: '#d4820a', c3: '#f5b84e', shine: '#fde4a8', name: 'Topaz'     },
  Garnet:    { bg: '#f5e8f2', c1: '#6b1a5a', c2: '#b83ba0', c3: '#e47fd0', shine: '#f5c5ee', name: 'Garnet'    },
  Amethyst:  { bg: '#eeebf8', c1: '#3a1a8f', c2: '#7b4fde', c3: '#b99af7', shine: '#ddd5ff', name: 'Amethyst'  },
  Diamond:   { bg: '#f0f4f8', c1: '#3a4a5a', c2: '#6a8aaa', c3: '#aaccee', shine: '#e8f2ff', name: 'Diamond'   },
  default:   { bg: '#eff0f2', c1: '#3a4050', c2: '#6a7090', c3: '#a8b0c8', shine: '#dde2f0', name: 'Gem'       },
};

const getPalette = (type = '') => GEM_PALETTES[type] || GEM_PALETTES.default;

/* ─────────────────────────────────────────────────────────────
   BEAUTIFUL 2D GEM SVG — classic brilliant-cut top view
   Uses the palette so every stone type has its own hue.
───────────────────────────────────────────────────────────── */
const GemSVG = ({ palette }) => {
  const { c1, c2, c3, shine } = palette;
  return (
    <svg viewBox="0 0 200 180" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <defs>
        {/* Main gradient — deep to mid */}
        <linearGradient id={`gMain-${c1}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor={c3} />
          <stop offset="50%"  stopColor={c2} />
          <stop offset="100%" stopColor={c1} />
        </linearGradient>
        {/* Shine gradient */}
        <linearGradient id={`gShine-${c1}`} x1="0%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%"   stopColor={shine} stopOpacity="1" />
          <stop offset="100%" stopColor={shine} stopOpacity="0" />
        </linearGradient>
        {/* Facet highlight */}
        <linearGradient id={`gFacet-${c1}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0"    />
        </linearGradient>
        <filter id="gShadow" x="-20%" y="-20%" width="140%" height="160%">
          <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor={c1} floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Drop shadow group */}
      <g filter="url(#gShadow)">

        {/* ── Crown (top hexagonal girdle) ── */}
        {/* Outer girdle */}
        <polygon
          points="100,14 158,44 158,136 100,166 42,136 42,44"
          fill={`url(#gMain-${c1})`}
        />

        {/* Table facets — inner star */}
        <polygon
          points="100,38 136,58 136,122 100,142 64,122 64,58"
          fill={c2}
          opacity="0.85"
        />

        {/* Culet centre */}
        <polygon
          points="100,68 122,80 122,100 100,112 78,100 78,80"
          fill={c1}
          opacity="0.9"
        />

        {/* Kite facets — upper left */}
        <polygon points="100,14 42,44 64,58 100,38"  fill={c3} opacity="0.7" />
        {/* Kite facets — upper right */}
        <polygon points="100,14 158,44 136,58 100,38" fill={c2} opacity="0.55" />
        {/* Kite facets — left */}
        <polygon points="42,44 42,136 64,122 64,58"   fill={c3} opacity="0.5"  />
        {/* Kite facets — right */}
        <polygon points="158,44 158,136 136,122 136,58" fill={c1} opacity="0.6" />
        {/* Kite facets — lower left */}
        <polygon points="42,136 100,166 100,142 64,122"  fill={c2} opacity="0.6" />
        {/* Kite facets — lower right */}
        <polygon points="158,136 100,166 100,142 136,122" fill={c3} opacity="0.45" />

        {/* Star facets — connecting table to kites */}
        <polygon points="100,38 136,58 122,80 100,68 78,80 64,58" fill={c2} opacity="0.4" />
        <polygon points="100,142 136,122 122,100 100,112 78,100 64,122" fill={c1} opacity="0.5" />

        {/* Girdle edge outline */}
        <polygon
          points="100,14 158,44 158,136 100,166 42,136 42,44"
          fill="none"
          stroke="#ffffff"
          strokeWidth="0.8"
          opacity="0.25"
        />
      </g>

      {/* ── Shine overlay — top-left highlight ── */}
      <polygon
        points="100,14 42,44 64,58 100,38"
        fill={`url(#gShine-${c1})`}
        opacity="0.9"
      />
      <polygon
        points="100,14 100,38 64,58 42,44"
        fill="#ffffff"
        opacity="0.18"
      />

      {/* ── Specular sparkle ── */}
      <ellipse cx="80" cy="42" rx="10" ry="6" fill="#ffffff" opacity="0.45" transform="rotate(-30 80 42)" />
      <ellipse cx="75" cy="40" rx="4"  ry="2" fill="#ffffff" opacity="0.7"  transform="rotate(-30 75 40)" />

      {/* ── Bottom reflected light ── */}
      <polygon points="100,142 78,100 100,112 122,100" fill="#ffffff" opacity="0.08" />
    </svg>
  );
};

/* ─────────────────────────────────────────────────────────────
   STATUS PILL
───────────────────────────────────────────────────────────── */
const statusStyle = {
  pending:     { color: '#8a6a20', bg: '#fdf4dc', border: '#e8d090' },
  certified:   { color: '#2a6a3a', bg: '#e8f5ec', border: '#90d0a0' },
  transferred: { color: '#3a4a8a', bg: '#eaecf8', border: '#9aa0d8' },
  rejected:    { color: '#8a2a2a', bg: '#f8eaea', border: '#d09090' },
};
const StatusPill = ({ status }) => {
  const s = statusStyle[status] || { color: '#555', bg: '#f0f0f0', border: '#ccc' };
  return (
    <span style={{
      fontSize: '10px', fontWeight: 500, letterSpacing: '0.1em',
      textTransform: 'uppercase', color: s.color, background: s.bg,
      border: `1px solid ${s.border}`, padding: '3px 9px',
    }}>
      {status}
    </span>
  );
};

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────── */
const Gemstones = () => {
  const [gemstones, setGemstones]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filters, setFilters]       = useState({ type: '', certified: '', page: 1, limit: 12 });

  useEffect(() => { fetchGemstones(); }, [filters]);

  const fetchGemstones = async () => {
    try {
      setLoading(true);
      const response = await gemstoneAPI.getAll(filters);
      setGemstones(response.data.data.gemstones);
    } catch (error) {
      console.error('Failed to fetch gemstones:', error);
    } finally {
      setLoading(false);
    }
  };

  const gemstoneTypes = ['Sapphire', 'Ruby', 'Emerald', 'Topaz', 'Garnet', 'Amethyst', 'Diamond'];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300&family=DM+Sans:wght@300;400;500&display=swap');

        .gs-root {
          font-family: 'DM Sans', sans-serif;
          background: #fafaf8;
          min-height: 100vh;
          padding: 56px 0 96px;
        }

        .gs-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 48px;
        }

        /* ── Header ── */
        .gs-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 48px;
          gap: 24px;
        }
        .gs-header__eyebrow {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #9c8f7e;
          margin-bottom: 10px;
        }
        .gs-header__title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2rem, 3.5vw, 2.8rem);
          font-weight: 300;
          color: #1a1a1a;
          line-height: 1.1;
          margin: 0;
        }
        .gs-header__sub {
          font-size: 13.5px;
          font-weight: 300;
          color: #8a8580;
          margin-top: 8px;
        }
        .gs-btn-register {
          font-family: 'DM Sans', sans-serif;
          font-size: 11.5px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #ffffff;
          background: #1a1a1a;
          padding: 12px 28px;
          text-decoration: none;
          transition: background 0.15s;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .gs-btn-register:hover { background: #333330; }

        /* ── Filters ── */
        .gs-filters {
          background: #ffffff;
          border: 1px solid #e8e4dc;
          padding: 24px 28px;
          margin-bottom: 40px;
          display: flex;
          gap: 20px;
          align-items: flex-end;
          flex-wrap: wrap;
        }
        .gs-filter-group { display: flex; flex-direction: column; gap: 8px; flex: 1; min-width: 160px; }
        .gs-filter-label {
          font-size: 10.5px;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #9a9490;
        }
        .gs-select {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 300;
          color: #1a1a1a;
          background: #fafaf8;
          border: 1px solid #e0dbd2;
          padding: 10px 14px;
          outline: none;
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%239a9490' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          padding-right: 36px;
          transition: border-color 0.15s;
        }
        .gs-select:focus { border-color: #1a1a1a; }
        .gs-btn-clear {
          font-family: 'DM Sans', sans-serif;
          font-size: 11.5px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #6a6560;
          background: transparent;
          border: 1px solid #e0dbd2;
          padding: 10px 24px;
          cursor: pointer;
          transition: border-color 0.15s, color 0.15s;
          white-space: nowrap;
          align-self: flex-end;
        }
        .gs-btn-clear:hover { border-color: #1a1a1a; color: #1a1a1a; }

        /* ── Grid ── */
        .gs-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: #e4e0d8;
          border: 1px solid #e4e0d8;
        }

        /* ── Card ── */
        .gs-card {
          background: #ffffff;
          text-decoration: none;
          display: flex;
          flex-direction: column;
          transition: background 0.18s;
          position: relative;
          overflow: hidden;
        }
        .gs-card:hover { background: #fdfcfa; }
        .gs-card:hover .gs-card__gem { transform: scale(1.04) translateY(-3px); }

        .gs-card__gem-wrap {
          height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          padding: 20px;
          transition: background 0.3s;
        }

        .gs-card__gem {
          width: 140px;
          height: 140px;
          transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
          filter: drop-shadow(0 12px 24px rgba(0,0,0,0.12));
          position: relative;
          z-index: 1;
        }

        /* Radial glow behind the gem */
        .gs-card__glow {
          position: absolute;
          inset: 0;
          opacity: 0.55;
          transition: opacity 0.3s;
        }
        .gs-card:hover .gs-card__glow { opacity: 0.8; }

        /* Certified ribbon */
        .gs-card__certified {
          position: absolute;
          top: 14px;
          right: 14px;
          font-size: 9.5px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #2a6a3a;
          background: rgba(232,245,236,0.92);
          border: 1px solid #90d0a0;
          padding: 4px 10px;
          backdrop-filter: blur(4px);
          z-index: 2;
        }

        /* Card body */
        .gs-card__body { padding: 24px 24px 20px; flex: 1; display: flex; flex-direction: column; }

        .gs-card__type-label {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #9a9490;
          margin-bottom: 6px;
        }
        .gs-card__name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.35rem;
          font-weight: 400;
          color: #1a1a1a;
          line-height: 1.2;
          margin-bottom: 20px;
        }

        .gs-card__specs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px 8px;
          margin-bottom: 20px;
          flex: 1;
        }
        .gs-card__spec {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .gs-card__spec-key {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #b8b3aa;
        }
        .gs-card__spec-val {
          font-size: 13px;
          font-weight: 400;
          color: #2a2a28;
        }

        .gs-card__footer {
          padding-top: 16px;
          border-top: 1px solid #f0ece4;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }
        .gs-card__id {
          font-size: 10px;
          font-weight: 400;
          letter-spacing: 0.06em;
          color: #b0ab a2;
          color: #aaa8a2;
          font-variant-numeric: tabular-nums;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          flex: 1;
          min-width: 0;
        }

        /* ── States ── */
        .gs-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 96px 0;
          gap: 20px;
        }
        .gs-spinner {
          width: 36px;
          height: 36px;
          border: 2px solid #e4e0d8;
          border-top-color: #1a1a1a;
          border-radius: 50%;
          animation: gs-spin 0.75s linear infinite;
        }
        @keyframes gs-spin { to { transform: rotate(360deg); } }
        .gs-loading-text {
          font-size: 13px;
          font-weight: 300;
          color: #9a9490;
          letter-spacing: 0.06em;
        }

        .gs-empty {
          background: #ffffff;
          border: 1px solid #e8e4dc;
          padding: 80px 40px;
          text-align: center;
        }
        .gs-empty__title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.8rem;
          font-weight: 300;
          color: #1a1a1a;
          margin-bottom: 12px;
        }
        .gs-empty__sub {
          font-size: 13px;
          font-weight: 300;
          color: #8a8580;
          margin-bottom: 28px;
        }
        .gs-empty__link {
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #1a1a1a;
          text-decoration: none;
          border-bottom: 1px solid #1a1a1a;
          padding-bottom: 2px;
          transition: opacity 0.15s;
        }
        .gs-empty__link:hover { opacity: 0.55; }

        /* ── Responsive ── */
        @media (max-width: 960px) {
          .gs-grid { grid-template-columns: repeat(2, 1fr); }
          .gs-inner { padding: 0 32px; }
        }
        @media (max-width: 600px) {
          .gs-grid { grid-template-columns: 1fr; }
          .gs-inner { padding: 0 20px; }
          .gs-header { flex-direction: column; align-items: flex-start; }
          .gs-btn-register { width: 100%; text-align: center; }
        }
      `}</style>

      <div className="gs-root">
        <div className="gs-inner">

          {/* Header */}
          <div className="gs-header">
            <div>
              <div className="gs-header__eyebrow">GemChain Registry</div>
              <h1 className="gs-header__title">Registered Gemstones</h1>
              <p className="gs-header__sub">Browse verified stones on the blockchain</p>
            </div>
            <Link to="/register-gemstone" className="gs-btn-register">+ Register Gemstone</Link>
          </div>

          {/* Filters */}
          <div className="gs-filters">
            <div className="gs-filter-group">
              <label className="gs-filter-label">Stone Type</label>
              <select
                className="gs-select"
                value={filters.type}
                onChange={e => setFilters({ ...filters, type: e.target.value, page: 1 })}
              >
                <option value="">All Types</option>
                {gemstoneTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="gs-filter-group">
              <label className="gs-filter-label">Certification</label>
              <select
                className="gs-select"
                value={filters.certified}
                onChange={e => setFilters({ ...filters, certified: e.target.value, page: 1 })}
              >
                <option value="">All Gemstones</option>
                <option value="true">NGJA Certified</option>
                <option value="false">Not Certified</option>
              </select>
            </div>
            <button
              className="gs-btn-clear"
              onClick={() => setFilters({ type: '', certified: '', page: 1, limit: 12 })}
            >
              Clear Filters
            </button>
          </div>

          {/* Content */}
          {loading ? (
            <div className="gs-loading">
              <div className="gs-spinner" />
              <span className="gs-loading-text">Loading gemstones…</span>
            </div>
          ) : gemstones.length === 0 ? (
            <div className="gs-empty">
              <div className="gs-empty__title">No gemstones found</div>
              <p className="gs-empty__sub">Be the first to register a stone on the blockchain.</p>
              <Link to="/register-gemstone" className="gs-empty__link">Register a Gemstone</Link>
            </div>
          ) : (
            <div className="gs-grid">
              {gemstones.map((gem) => {
                const palette = getPalette(gem.type);
                return (
                  <Link key={gem._id} to={`/gemstones/${gem._id}`} className="gs-card">

                    {/* Gem illustration area */}
                    <div
                      className="gs-card__gem-wrap"
                      style={{ background: palette.bg }}
                    >
                      {/* Soft radial glow */}
                      <div
                        className="gs-card__glow"
                        style={{
                          background: `radial-gradient(ellipse 60% 55% at 50% 50%, ${palette.c3}55 0%, transparent 70%)`,
                        }}
                      />
                      <div className="gs-card__gem">
                        <GemSVG palette={palette} />
                      </div>
                      {gem.ngja?.certified && (
                        <div className="gs-card__certified">Certified</div>
                      )}
                    </div>

                    {/* Card body */}
                    <div className="gs-card__body">
                      <div className="gs-card__type-label">{gem.type || 'Gemstone'}</div>
                      <div className="gs-card__name">{gem.name}</div>

                      <div className="gs-card__specs">
                        <div className="gs-card__spec">
                          <span className="gs-card__spec-key">Weight</span>
                          <span className="gs-card__spec-val">{gem.weight?.carats} ct</span>
                        </div>
                        <div className="gs-card__spec">
                          <span className="gs-card__spec-key">Clarity</span>
                          <span className="gs-card__spec-val">{gem.clarity}</span>
                        </div>
                        <div className="gs-card__spec">
                          <span className="gs-card__spec-key">Origin</span>
                          <span className="gs-card__spec-val">{gem.origin?.country}</span>
                        </div>
                        <div className="gs-card__spec">
                          <span className="gs-card__spec-key">Status</span>
                          <span className="gs-card__spec-val" style={{ textTransform: 'capitalize' }}>{gem.status}</span>
                        </div>
                      </div>

                      <div className="gs-card__footer">
                        <span className="gs-card__id">{gem.gemId}</span>
                        <StatusPill status={gem.status} />
                      </div>
                    </div>

                  </Link>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default Gemstones;