import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { marketplaceAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

/* ─────────────────────────────────────────────────────────────
   GEM PALETTES (same system as Gemstones.jsx)
───────────────────────────────────────────────────────────── */
const GEM_PALETTES = {
  Sapphire: { bg: '#e8eef8', c1: '#1a3a8f', c2: '#3b6fde', c3: '#7ba7f7', shine: '#c5d9ff' },
  Ruby:     { bg: '#f8e8e8', c1: '#8f1a1a', c2: '#de3b3b', c3: '#f77b7b', shine: '#ffc5c5' },
  Emerald:  { bg: '#e8f8ec', c1: '#1a6b38', c2: '#2eb85c', c3: '#6fd98f', shine: '#c5f5d5' },
  Topaz:    { bg: '#fdf4e8', c1: '#7a4a10', c2: '#d4820a', c3: '#f5b84e', shine: '#fde4a8' },
  Garnet:   { bg: '#f5e8f2', c1: '#6b1a5a', c2: '#b83ba0', c3: '#e47fd0', shine: '#f5c5ee' },
  Amethyst: { bg: '#eeebf8', c1: '#3a1a8f', c2: '#7b4fde', c3: '#b99af7', shine: '#ddd5ff' },
  Diamond:  { bg: '#f0f4f8', c1: '#3a4a5a', c2: '#6a8aaa', c3: '#aaccee', shine: '#e8f2ff' },
  default:  { bg: '#eff0f2', c1: '#3a4050', c2: '#6a7090', c3: '#a8b0c8', shine: '#dde2f0' },
};
const getPalette = (type = '') => GEM_PALETTES[type] || GEM_PALETTES.default;

/* ─────────────────────────────────────────────────────────────
   2D SVG GEM — brilliant-cut top view
───────────────────────────────────────────────────────────── */
const GemSVG = ({ palette }) => {
  const { c1, c2, c3, shine } = palette;
  const uid = c1.replace('#', '');
  return (
    <svg viewBox="0 0 200 180" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id={`gM-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor={c3} />
          <stop offset="50%"  stopColor={c2} />
          <stop offset="100%" stopColor={c1} />
        </linearGradient>
        <linearGradient id={`gS-${uid}`} x1="0%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%"   stopColor={shine} stopOpacity="1" />
          <stop offset="100%" stopColor={shine} stopOpacity="0" />
        </linearGradient>
        <filter id={`gDrop-${uid}`} x="-20%" y="-20%" width="140%" height="160%">
          <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor={c1} floodOpacity="0.22" />
        </filter>
      </defs>
      <g filter={`url(#gDrop-${uid})`}>
        <polygon points="100,14 158,44 158,136 100,166 42,136 42,44" fill={`url(#gM-${uid})`} />
        <polygon points="100,38 136,58 136,122 100,142 64,122 64,58" fill={c2} opacity="0.85" />
        <polygon points="100,68 122,80 122,100 100,112 78,100 78,80" fill={c1} opacity="0.9" />
        <polygon points="100,14 42,44 64,58 100,38"   fill={c3} opacity="0.7" />
        <polygon points="100,14 158,44 136,58 100,38"  fill={c2} opacity="0.55" />
        <polygon points="42,44 42,136 64,122 64,58"    fill={c3} opacity="0.5" />
        <polygon points="158,44 158,136 136,122 136,58" fill={c1} opacity="0.6" />
        <polygon points="42,136 100,166 100,142 64,122"  fill={c2} opacity="0.6" />
        <polygon points="158,136 100,166 100,142 136,122" fill={c3} opacity="0.45" />
        <polygon points="100,38 136,58 122,80 100,68 78,80 64,58"     fill={c2} opacity="0.4" />
        <polygon points="100,142 136,122 122,100 100,112 78,100 64,122" fill={c1} opacity="0.5" />
        <polygon points="100,14 158,44 158,136 100,166 42,136 42,44"
          fill="none" stroke="#ffffff" strokeWidth="0.8" opacity="0.2" />
      </g>
      <polygon points="100,14 42,44 64,58 100,38" fill={`url(#gS-${uid})`} opacity="0.9" />
      <polygon points="100,14 100,38 64,58 42,44"  fill="#ffffff" opacity="0.16" />
      <ellipse cx="80" cy="42" rx="10" ry="6" fill="#ffffff" opacity="0.42" transform="rotate(-30 80 42)" />
      <ellipse cx="75" cy="40" rx="4"  ry="2" fill="#ffffff" opacity="0.68" transform="rotate(-30 75 40)" />
    </svg>
  );
};

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
const formatPrice = (amount, currency = 'LKR') =>
  new Intl.NumberFormat('en-US').format(amount) + ' ' + currency;

const listingStatusStyle = {
  active:   { color: '#2a6a3a', bg: '#e8f5ec', border: '#90d0a0' },
  reserved: { color: '#8a6a20', bg: '#fdf4dc', border: '#e8d090' },
  sold:     { color: '#4a4a48', bg: '#f0ece4', border: '#c8c3ba' },
};

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
const Marketplace = () => {
  const { isAuthenticated, isSeller } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filters, setFilters]   = useState({
    type: '', minPrice: '', maxPrice: '', certified: '', negotiable: '', page: 1, limit: 12,
  });

  useEffect(() => { fetchListings(); }, [filters]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const response = await marketplaceAPI.getAllListings(filters);
      setListings(response.data.data.listings);
    } catch (error) {
      console.error('Failed to fetch listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const gemstoneTypes = ['Sapphire', 'Ruby', 'Emerald', 'Topaz', 'Garnet', 'Amethyst', 'Diamond'];
  const clearFilters  = () => setFilters({ type: '', minPrice: '', maxPrice: '', certified: '', negotiable: '', page: 1, limit: 12 });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300&family=DM+Sans:wght@300;400;500&display=swap');

        .mp-root {
          font-family: 'DM Sans', sans-serif;
          background: #fafaf8;
          min-height: 100vh;
          padding: 56px 0 96px;
        }
        .mp-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 48px;
        }

        /* ── Header ── */
        .mp-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 40px;
          gap: 24px;
          flex-wrap: wrap;
        }
        .mp-header__eyebrow {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #9c8f7e;
          margin-bottom: 10px;
        }
        .mp-header__title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2rem, 3.5vw, 2.8rem);
          font-weight: 300;
          color: #1a1a1a;
          line-height: 1.1;
          margin: 0;
        }
        .mp-header__sub {
          font-size: 13.5px;
          font-weight: 300;
          color: #8a8580;
          margin-top: 8px;
        }
        .mp-header__actions {
          display: flex;
          gap: 10px;
          flex-shrink: 0;
          align-items: center;
        }
        .mp-btn-ghost {
          font-family: 'DM Sans', sans-serif;
          font-size: 11.5px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #1a1a1a;
          background: transparent;
          border: 1px solid #c8c3ba;
          padding: 11px 24px;
          text-decoration: none;
          transition: border-color 0.15s, background 0.15s;
        }
        .mp-btn-ghost:hover { border-color: #1a1a1a; background: #f5f2ec; }
        .mp-btn-solid {
          font-family: 'DM Sans', sans-serif;
          font-size: 11.5px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #ffffff;
          background: #1a1a1a;
          padding: 12px 24px;
          text-decoration: none;
          transition: background 0.15s;
        }
        .mp-btn-solid:hover { background: #333330; }

        /* ── Dashboard Banner ── */
        .mp-dashboard {
          background: #ffffff;
          border: 1px solid #e8e4dc;
          padding: 24px 28px;
          margin-bottom: 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          flex-wrap: wrap;
        }
        .mp-dashboard__label {
          font-size: 10.5px;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #9a9490;
          margin-bottom: 4px;
        }
        .mp-dashboard__title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.2rem;
          font-weight: 400;
          color: #1a1a1a;
        }
        .mp-dashboard__links {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .mp-dash-link {
          font-family: 'DM Sans', sans-serif;
          font-size: 11.5px;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #5a5650;
          border: 1px solid #e0dbd2;
          padding: 8px 18px;
          text-decoration: none;
          transition: border-color 0.15s, color 0.15s;
        }
        .mp-dash-link:hover { border-color: #1a1a1a; color: #1a1a1a; }

        /* ── Filters ── */
        .mp-filters {
          background: #ffffff;
          border: 1px solid #e8e4dc;
          padding: 24px 28px;
          margin-bottom: 40px;
        }
        .mp-filters__title {
          font-size: 10.5px;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #9a9490;
          margin-bottom: 18px;
        }
        .mp-filters__grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          align-items: end;
        }
        .mp-filter-group { display: flex; flex-direction: column; gap: 8px; }
        .mp-filter-label {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #b8b3aa;
        }
        .mp-select, .mp-input {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 300;
          color: #1a1a1a;
          background: #fafaf8;
          border: 1px solid #e0dbd2;
          padding: 10px 14px;
          outline: none;
          transition: border-color 0.15s;
          width: 100%;
        }
        .mp-select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%239a9490' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          padding-right: 36px;
          cursor: pointer;
        }
        .mp-select:focus, .mp-input:focus { border-color: #1a1a1a; }
        .mp-input::placeholder { color: #c8c3ba; }
        .mp-filters__footer {
          margin-top: 16px;
          display: flex;
          justify-content: flex-end;
        }
        .mp-btn-clear {
          font-family: 'DM Sans', sans-serif;
          font-size: 11.5px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #6a6560;
          background: transparent;
          border: 1px solid #e0dbd2;
          padding: 9px 22px;
          cursor: pointer;
          transition: border-color 0.15s, color 0.15s;
        }
        .mp-btn-clear:hover { border-color: #1a1a1a; color: #1a1a1a; }

        /* ── Grid ── */
        .mp-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: #e4e0d8;
          border: 1px solid #e4e0d8;
        }

        /* ── Card ── */
        .mp-card {
          background: #ffffff;
          text-decoration: none;
          display: flex;
          flex-direction: column;
          transition: background 0.18s;
          position: relative;
        }
        .mp-card:hover { background: #fdfcfa; }
        .mp-card:hover .mp-card__gem { transform: scale(1.04) translateY(-3px); }

        .mp-card__gem-wrap {
          height: 196px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          padding: 20px;
        }
        .mp-card__glow {
          position: absolute;
          inset: 0;
          opacity: 0.5;
          transition: opacity 0.3s;
        }
        .mp-card:hover .mp-card__glow { opacity: 0.75; }
        .mp-card__gem {
          width: 130px;
          height: 130px;
          transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
          filter: drop-shadow(0 10px 20px rgba(0,0,0,0.12));
          position: relative;
          z-index: 1;
        }

        /* Badges */
        .mp-card__ngja {
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
        .mp-card__negotiable {
          position: absolute;
          top: 14px;
          left: 14px;
          font-size: 9.5px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #3a4a8a;
          background: rgba(234,236,248,0.92);
          border: 1px solid #9aa0d8;
          padding: 4px 10px;
          backdrop-filter: blur(4px);
          z-index: 2;
        }

        /* Body */
        .mp-card__body { padding: 22px 24px 20px; flex: 1; display: flex; flex-direction: column; }
        .mp-card__type-label {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #9a9490;
          margin-bottom: 5px;
        }
        .mp-card__title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.25rem;
          font-weight: 400;
          color: #1a1a1a;
          line-height: 1.25;
          margin-bottom: 8px;
        }
        .mp-card__desc {
          font-size: 12.5px;
          font-weight: 300;
          color: #8a8580;
          line-height: 1.65;
          margin-bottom: 18px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .mp-card__specs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 18px;
          flex: 1;
        }
        .mp-card__spec-key {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #b8b3aa;
          display: block;
        }
        .mp-card__spec-val {
          font-size: 13px;
          font-weight: 400;
          color: #2a2a28;
          display: block;
        }

        /* Price row */
        .mp-card__footer {
          padding-top: 16px;
          border-top: 1px solid #f0ece4;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 8px;
        }
        .mp-card__price-label {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #b8b3aa;
          margin-bottom: 3px;
        }
        .mp-card__price {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.5rem;
          font-weight: 400;
          color: #1a1a1a;
          line-height: 1;
        }
        .mp-card__seller {
          text-align: right;
        }
        .mp-card__seller-label {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #b8b3aa;
          margin-bottom: 3px;
        }
        .mp-card__seller-name {
          font-size: 13px;
          font-weight: 400;
          color: #2a2a28;
        }
        .mp-card__rating {
          font-size: 11px;
          font-weight: 300;
          color: #9a8a60;
          margin-top: 2px;
        }

        .mp-card__status-row {
          margin-top: 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .mp-card__status {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 3px 9px;
        }
        .mp-card__views {
          font-size: 11px;
          font-weight: 300;
          color: #b8b3aa;
        }

        /* ── Loading / Empty ── */
        .mp-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 96px 0;
          gap: 20px;
        }
        .mp-spinner {
          width: 36px;
          height: 36px;
          border: 2px solid #e4e0d8;
          border-top-color: #1a1a1a;
          border-radius: 50%;
          animation: mp-spin 0.75s linear infinite;
        }
        @keyframes mp-spin { to { transform: rotate(360deg); } }
        .mp-loading-text {
          font-size: 13px;
          font-weight: 300;
          color: #9a9490;
          letter-spacing: 0.06em;
        }

        .mp-empty {
          background: #ffffff;
          border: 1px solid #e8e4dc;
          padding: 80px 40px;
          text-align: center;
        }
        .mp-empty__title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.8rem;
          font-weight: 300;
          color: #1a1a1a;
          margin-bottom: 10px;
        }
        .mp-empty__sub {
          font-size: 13px;
          font-weight: 300;
          color: #8a8580;
          margin-bottom: 28px;
        }

        /* ── Responsive ── */
        @media (max-width: 960px) {
          .mp-grid { grid-template-columns: repeat(2, 1fr); }
          .mp-inner { padding: 0 32px; }
          .mp-filters__grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .mp-grid { grid-template-columns: 1fr; }
          .mp-inner { padding: 0 20px; }
          .mp-filters__grid { grid-template-columns: 1fr; }
          .mp-header { flex-direction: column; align-items: flex-start; }
          .mp-header__actions { width: 100%; }
          .mp-btn-ghost, .mp-btn-solid { flex: 1; text-align: center; }
        }
      `}</style>

      <div className="mp-root">
        <div className="mp-inner">

          {/* Header */}
          <div className="mp-header">
            <div>
              <div className="mp-header__eyebrow">GemChain</div>
              <h1 className="mp-header__title">Gemstone Marketplace</h1>
              <p className="mp-header__sub">Buy and sell NGJA certified gemstones</p>
            </div>
            {isSeller() && (
              <div className="mp-header__actions">
                <Link to="/marketplace/my-listings" className="mp-btn-ghost">My Listings</Link>
                <Link to="/marketplace/create"      className="mp-btn-solid">+ Create Listing</Link>
              </div>
            )}
          </div>

          {/* Dashboard banner */}
          {isAuthenticated && (
            <div className="mp-dashboard">
              <div>
                <div className="mp-dashboard__label">Your Activity</div>
                <div className="mp-dashboard__title">Marketplace Dashboard</div>
              </div>
              <div className="mp-dashboard__links">
                <Link to="/marketplace/my-offers"    className="mp-dash-link">My Offers</Link>
                <Link to="/marketplace/my-purchases" className="mp-dash-link">My Purchases</Link>
                {isSeller() && (
                  <Link to="/marketplace/my-sales"   className="mp-dash-link">My Sales</Link>
                )}
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="mp-filters">
            <div className="mp-filters__title">Filter Listings</div>
            <div className="mp-filters__grid">
              <div className="mp-filter-group">
                <label className="mp-filter-label">Stone Type</label>
                <select className="mp-select" value={filters.type}
                  onChange={e => setFilters({ ...filters, type: e.target.value, page: 1 })}>
                  <option value="">All Types</option>
                  {gemstoneTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="mp-filter-group">
                <label className="mp-filter-label">Min Price (LKR)</label>
                <input className="mp-input" type="number" placeholder="0"
                  value={filters.minPrice}
                  onChange={e => setFilters({ ...filters, minPrice: e.target.value, page: 1 })} />
              </div>
              <div className="mp-filter-group">
                <label className="mp-filter-label">Max Price (LKR)</label>
                <input className="mp-input" type="number" placeholder="1,000,000"
                  value={filters.maxPrice}
                  onChange={e => setFilters({ ...filters, maxPrice: e.target.value, page: 1 })} />
              </div>
              <div className="mp-filter-group">
                <label className="mp-filter-label">Status</label>
                <select className="mp-select" value={filters.certified}
                  onChange={e => setFilters({ ...filters, certified: e.target.value, page: 1 })}>
                  <option value="">All Listings</option>
                  <option value="true">NGJA Certified Only</option>
                  <option value="negotiable">Negotiable Price</option>
                </select>
              </div>
            </div>
            <div className="mp-filters__footer">
              <button className="mp-btn-clear" onClick={clearFilters}>Clear Filters</button>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="mp-loading">
              <div className="mp-spinner" />
              <span className="mp-loading-text">Loading marketplace…</span>
            </div>
          ) : listings.length === 0 ? (
            <div className="mp-empty">
              <div className="mp-empty__title">No listings found</div>
              <p className="mp-empty__sub">Try adjusting your filters or check back later.</p>
              {isSeller() && (
                <Link to="/marketplace/create" className="mp-btn-solid" style={{ display: 'inline-block' }}>
                  Create First Listing
                </Link>
              )}
            </div>
          ) : (
            <div className="mp-grid">
              {listings.map((listing) => {
                const palette = getPalette(listing.gemstone?.type);
                const statusStyle = {
                  active:   { color: '#2a6a3a', bg: '#e8f5ec', border: '#90d0a0' },
                  reserved: { color: '#8a6a20', bg: '#fdf4dc', border: '#e8d090' },
                  sold:     { color: '#4a4a48', bg: '#f0ece4', border: '#c8c3ba' },
                }[listing.status] || { color: '#555', bg: '#f0f0f0', border: '#ccc' };

                return (
                  <Link key={listing._id} to={`/marketplace/listings/${listing._id}`} className="mp-card">

                    {/* Gem illustration */}
                    <div className="mp-card__gem-wrap" style={{ background: palette.bg }}>
                      <div className="mp-card__glow" style={{
                        background: `radial-gradient(ellipse 60% 55% at 50% 50%, ${palette.c3}55 0%, transparent 70%)`,
                      }} />
                      <div className="mp-card__gem">
                        <GemSVG palette={palette} />
                      </div>
                      {listing.ngjaVerified?.verified && (
                        <div className="mp-card__ngja">NGJA Verified</div>
                      )}
                      {listing.price?.negotiable && (
                        <div className="mp-card__negotiable">Negotiable</div>
                      )}
                    </div>

                    {/* Body */}
                    <div className="mp-card__body">
                      <div className="mp-card__type-label">{listing.gemstone?.type || 'Gemstone'}</div>
                      <div className="mp-card__title">{listing.title}</div>
                      {listing.description && (
                        <p className="mp-card__desc">{listing.description}</p>
                      )}

                      <div className="mp-card__specs">
                        <div>
                          <span className="mp-card__spec-key">Weight</span>
                          <span className="mp-card__spec-val">{listing.gemstone?.weight?.carats} ct</span>
                        </div>
                        <div>
                          <span className="mp-card__spec-key">Clarity</span>
                          <span className="mp-card__spec-val">{listing.gemstone?.clarity}</span>
                        </div>
                      </div>

                      <div className="mp-card__footer">
                        <div>
                          <div className="mp-card__price-label">Asking Price</div>
                          <div className="mp-card__price">
                            {formatPrice(listing.price?.amount, listing.price?.currency)}
                          </div>
                        </div>
                        <div className="mp-card__seller">
                          <div className="mp-card__seller-label">Seller</div>
                          <div className="mp-card__seller-name">{listing.seller?.name}</div>
                          {listing.seller?.sellerInfo?.rating > 0 && (
                            <div className="mp-card__rating">
                              {listing.seller.sellerInfo.rating.toFixed(1)} / 5.0
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mp-card__status-row">
                        <span className="mp-card__status" style={{
                          color: statusStyle.color,
                          background: statusStyle.bg,
                          border: `1px solid ${statusStyle.border}`,
                        }}>
                          {listing.status}
                        </span>
                        <span className="mp-card__views">{listing.views || 0} views</span>
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

export default Marketplace;