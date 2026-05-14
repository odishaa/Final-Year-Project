import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { gemstoneAPI } from '../services/api';
import GemIllustration from '../components/GemIllustration';

const STATUS_STYLES = {
  pending:     { color: '#b07d2a', bg: '#fef8ec', border: '#f0d9a0' },
  certified:   { color: '#2e6b3e', bg: '#edf7f1', border: '#a8d9b8' },
  transferred: { color: '#2a5a8b', bg: '#edf4fc', border: '#a8cbee' },
  rejected:    { color: '#8b2a2a', bg: '#fdf0f0', border: '#e8b8b8' },
};

const CARD_BG = {
  Sapphire: 'radial-gradient(ellipse at 40% 30%, #0d2060 0%, #060e2a 100%)',
  Ruby:     'radial-gradient(ellipse at 40% 30%, #3a0808 0%, #120202 100%)',
  Emerald:  'radial-gradient(ellipse at 40% 30%, #042a10 0%, #010e06 100%)',
  Topaz:    'radial-gradient(ellipse at 40% 30%, #2e1400 0%, #120700 100%)',
  Garnet:   'radial-gradient(ellipse at 40% 30%, #280010 0%, #0e0006 100%)',
  Amethyst: 'radial-gradient(ellipse at 40% 30%, #1e0040 0%, #0a0018 100%)',
  Diamond:  'radial-gradient(ellipse at 40% 30%, #0a1828 0%, #040a12 100%)',
  default:  'radial-gradient(ellipse at 40% 30%, #0d2060 0%, #060e2a 100%)',
};

const GemCard = ({ gem }) => {
  const statusStyle = STATUS_STYLES[gem.status] || STATUS_STYLES.pending;
  const bg = CARD_BG[gem.type] || CARD_BG.default;

  return (
    <Link to={`/gemstones/${gem._id}`} className="gc-gem-card">
      {/* Illustration */}
      <div className="gc-gem-card__canvas" style={{ background: bg }}>
        <GemIllustration gemType={gem.type} />
        {gem.ngja?.certified && (
          <div className="gc-gem-card__cert-badge">Certified</div>
        )}
      </div>

      {/* Info */}
      <div className="gc-gem-card__body">
        <div className="gc-gem-card__header">
          <h3 className="gc-gem-card__name">{gem.name}</h3>
          <span className="gc-gem-card__type">{gem.type}</span>
        </div>
        <div className="gc-gem-card__specs">
          <div className="gc-gem-card__spec">
            <span className="gc-gem-card__spec-label">Weight</span>
            <span className="gc-gem-card__spec-val">{gem.weight?.carats} ct</span>
          </div>
          <div className="gc-gem-card__spec">
            <span className="gc-gem-card__spec-label">Clarity</span>
            <span className="gc-gem-card__spec-val">{gem.clarity}</span>
          </div>
          <div className="gc-gem-card__spec">
            <span className="gc-gem-card__spec-label">Origin</span>
            <span className="gc-gem-card__spec-val">{gem.origin?.country}</span>
          </div>
        </div>
        <div className="gc-gem-card__footer">
          <span className="gc-gem-card__id">{gem.gemId}</span>
          <span className="gc-gem-card__status" style={{
            color: statusStyle.color,
            background: statusStyle.bg,
            border: `1px solid ${statusStyle.border}`,
          }}>
            {gem.status}
          </span>
        </div>
      </div>
    </Link>
  );
};

const Gemstones = () => {
  const [gemstones, setGemstones] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filters, setFilters]     = useState({ type: '', certified: '', page: 1, limit: 12 });

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

  const gemstoneTypes = ['Sapphire', 'Ruby', 'Emerald', 'Topaz', 'Garnet', 'Amethyst'];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300&family=DM+Sans:wght@300;400;500&display=swap');

        .gc-gems-root {
          font-family: 'DM Sans', sans-serif;
          background: #fafaf8;
          min-height: 100vh;
          padding: 56px 0 96px;
        }
        .gc-gems-wrap {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 48px;
        }

        /* Header */
        .gc-gems-hdr {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 48px;
          padding-bottom: 32px;
          border-bottom: 1px solid #e8e4dc;
        }
        .gc-gems-hdr__eyebrow {
          font-size: 11px; font-weight: 500; letter-spacing: 0.2em;
          text-transform: uppercase; color: #9c8f7e; margin-bottom: 10px;
        }
        .gc-gems-hdr__title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.8rem; font-weight: 300; color: #1a1a1a;
          line-height: 1.05; margin: 0 0 6px;
        }
        .gc-gems-hdr__sub { font-size: 13.5px; font-weight: 300; color: #8a8680; }
        .gc-gems-hdr__btn {
          font-family: 'DM Sans', sans-serif;
          font-size: 11.5px; font-weight: 500; letter-spacing: 0.1em;
          text-transform: uppercase; color: #fff; background: #1a1a1a;
          padding: 12px 28px; text-decoration: none; transition: background 0.15s; white-space: nowrap;
        }
        .gc-gems-hdr__btn:hover { background: #333330; }

        /* Filters */
        .gc-filters {
          display: grid; grid-template-columns: 1fr 1fr auto;
          background: #fff; border: 1px solid #e8e4dc; margin-bottom: 40px;
        }
        .gc-filter-group { padding: 18px 24px 16px; border-right: 1px solid #e8e4dc; }
        .gc-filter-group:last-child { border-right: none; }
        .gc-filter-label {
          font-size: 10px; font-weight: 500; letter-spacing: 0.18em;
          text-transform: uppercase; color: #9a9490; display: block; margin-bottom: 6px;
        }
        .gc-filter-select {
          font-family: 'DM Sans', sans-serif; font-size: 13.5px; font-weight: 400;
          color: #1a1a1a; background: transparent; border: none; outline: none;
          width: 100%; cursor: pointer; appearance: none; -webkit-appearance: none;
          padding-right: 16px;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%239a9490'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 0 center;
        }
        .gc-filter-clear {
          font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 400;
          letter-spacing: 0.06em; color: #8a8680; background: #f5f3ef;
          border: none; padding: 18px 32px 16px; cursor: pointer;
          transition: color 0.15s, background 0.15s; white-space: nowrap; align-self: stretch;
        }
        .gc-filter-clear:hover { color: #1a1a1a; background: #edeae3; }

        /* Grid */
        .gc-gems-grid {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 1px; background: #e4e0d8; border: 1px solid #e4e0d8;
        }

        /* Card */
        .gc-gem-card {
          display: block; text-decoration: none; background: #fff;
          transition: background 0.18s; overflow: hidden;
        }
        .gc-gem-card:hover { background: #fdfcfa; }
        .gc-gem-card:hover .gc-gem-card__canvas svg {
          transform: scale(1.04);
        }

        .gc-gem-card__canvas {
          position: relative; height: 210px; overflow: hidden;
        }
        .gc-gem-card__canvas svg {
          transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .gc-gem-card__cert-badge {
          position: absolute; top: 14px; right: 14px;
          font-family: 'DM Sans', sans-serif; font-size: 9.5px; font-weight: 500;
          letter-spacing: 0.14em; text-transform: uppercase;
          color: #2e6b3e; background: rgba(237,247,241,0.92);
          border: 1px solid #a8d9b8; padding: 4px 10px;
          backdrop-filter: blur(4px);
        }

        .gc-gem-card__body { padding: 24px 28px 22px; }

        .gc-gem-card__header {
          display: flex; align-items: baseline;
          justify-content: space-between; gap: 12px; margin-bottom: 18px;
        }
        .gc-gem-card__name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.25rem; font-weight: 400; color: #1a1a1a; margin: 0; line-height: 1.2;
        }
        .gc-gem-card__type {
          font-size: 11px; font-weight: 500; letter-spacing: 0.12em;
          text-transform: uppercase; color: #9a9490; white-space: nowrap;
        }

        .gc-gem-card__specs { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
        .gc-gem-card__spec { display: flex; justify-content: space-between; align-items: center; }
        .gc-gem-card__spec-label { font-size: 12px; font-weight: 300; color: #8a8680; }
        .gc-gem-card__spec-val   { font-size: 12.5px; font-weight: 500; color: #2a2a28; }

        .gc-gem-card__footer {
          display: flex; align-items: center; justify-content: space-between;
          padding-top: 16px; border-top: 1px solid #f0ece4;
        }
        .gc-gem-card__id {
          font-size: 10.5px; font-weight: 300; color: #b8b3aa; letter-spacing: 0.04em;
        }
        .gc-gem-card__status {
          font-size: 10px; font-weight: 500; letter-spacing: 0.12em;
          text-transform: uppercase; padding: 3px 10px;
        }

        /* Loading */
        .gc-loading {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; padding: 96px 0; gap: 20px;
        }
        .gc-loading__ring {
          width: 40px; height: 40px; border: 1px solid #e8e4dc;
          border-top-color: #1a1a1a; border-radius: 50%;
          animation: gc-spin 0.9s linear infinite;
        }
        @keyframes gc-spin { to { transform: rotate(360deg); } }
        .gc-loading__text {
          font-size: 12px; font-weight: 300; letter-spacing: 0.12em;
          text-transform: uppercase; color: #9a9490;
        }

        /* Empty */
        .gc-empty {
          background: #fff; border: 1px solid #e8e4dc;
          padding: 72px 40px; text-align: center;
        }
        .gc-empty__title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.6rem; font-weight: 300; color: #1a1a1a; margin-bottom: 10px;
        }
        .gc-empty__sub { font-size: 13px; font-weight: 300; color: #8a8680; margin-bottom: 28px; }
        .gc-empty__link {
          font-size: 12px; font-weight: 500; letter-spacing: 0.1em;
          text-transform: uppercase; color: #1a1a1a; text-decoration: none;
          border-bottom: 1px solid #1a1a1a; padding-bottom: 1px; transition: opacity 0.15s;
        }
        .gc-empty__link:hover { opacity: 0.55; }

        /* Responsive */
        @media (max-width: 960px) {
          .gc-gems-wrap { padding: 0 28px; }
          .gc-gems-grid { grid-template-columns: repeat(2, 1fr); }
          .gc-filters { grid-template-columns: 1fr 1fr; }
          .gc-filter-clear { grid-column: 1 / -1; border-top: 1px solid #e8e4dc; }
        }
        @media (max-width: 600px) {
          .gc-gems-grid { grid-template-columns: 1fr; }
          .gc-gems-hdr { flex-direction: column; align-items: flex-start; gap: 20px; }
          .gc-filters { grid-template-columns: 1fr; }
          .gc-filter-group { border-right: none; border-bottom: 1px solid #e8e4dc; }
        }
      `}</style>

      <div className="gc-gems-root">
        <div className="gc-gems-wrap">

          {/* Header */}
          <div className="gc-gems-hdr">
            <div>
              <p className="gc-gems-hdr__eyebrow">Blockchain Registry</p>
              <h1 className="gc-gems-hdr__title">Registered Gemstones</h1>
              <p className="gc-gems-hdr__sub">Browse verified gemstones on the blockchain</p>
            </div>
            <Link to="/register-gemstone" className="gc-gems-hdr__btn">+ Register Gemstone</Link>
          </div>

          {/* Filters */}
          <div className="gc-filters">
            <div className="gc-filter-group">
              <label className="gc-filter-label">Gemstone Type</label>
              <select className="gc-filter-select" value={filters.type}
                onChange={e => setFilters({ ...filters, type: e.target.value, page: 1 })}>
                <option value="">All Types</option>
                {gemstoneTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="gc-filter-group">
              <label className="gc-filter-label">Certification Status</label>
              <select className="gc-filter-select" value={filters.certified}
                onChange={e => setFilters({ ...filters, certified: e.target.value, page: 1 })}>
                <option value="">All Gemstones</option>
                <option value="true">NGJA Certified</option>
                <option value="false">Not Certified</option>
              </select>
            </div>
            <button className="gc-filter-clear"
              onClick={() => setFilters({ type: '', certified: '', page: 1, limit: 12 })}>
              Clear Filters
            </button>
          </div>

          {/* Content */}
          {loading ? (
            <div className="gc-loading">
              <div className="gc-loading__ring" />
              <span className="gc-loading__text">Loading gemstones</span>
            </div>
          ) : gemstones.length === 0 ? (
            <div className="gc-empty">
              <div className="gc-empty__title">No gemstones found</div>
              <p className="gc-empty__sub">Be the first to register a gemstone on the blockchain</p>
              <Link to="/register-gemstone" className="gc-empty__link">Register a gemstone</Link>
            </div>
          ) : (
            <div className="gc-gems-grid">
              {gemstones.map(gem => <GemCard key={gem._id} gem={gem} />)}
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default Gemstones;