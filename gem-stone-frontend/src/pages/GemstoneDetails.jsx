import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { gemstoneAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const STATIC_BASE = 'http://localhost:5000';

/* ─────────────────────────────────────────────────────────────
   GEM PALETTES
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
   LARGE 2D SVG GEM
───────────────────────────────────────────────────────────── */
const GemSVG = ({ palette }) => {
  const { c1, c2, c3, shine } = palette;
  const uid = c1.replace('#', '');
  return (
    <svg viewBox="0 0 300 270" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
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
          <feDropShadow dx="0" dy="14" stdDeviation="18" floodColor={c1} floodOpacity="0.28" />
        </filter>
      </defs>
      <g filter={`url(#gDrop-${uid})`}>
        <polygon points="150,20 237,66 237,204 150,250 63,204 63,66" fill={`url(#gM-${uid})`} />
        <polygon points="150,57 204,87 204,183 150,213 96,183 96,87" fill={c2} opacity="0.85" />
        <polygon points="150,102 183,120 183,150 150,168 117,150 117,120" fill={c1} opacity="0.9" />
        <polygon points="150,20 63,66 96,87 150,57"    fill={c3} opacity="0.7" />
        <polygon points="150,20 237,66 204,87 150,57"   fill={c2} opacity="0.55" />
        <polygon points="63,66 63,204 96,183 96,87"     fill={c3} opacity="0.5" />
        <polygon points="237,66 237,204 204,183 204,87" fill={c1} opacity="0.6" />
        <polygon points="63,204 150,250 150,213 96,183"  fill={c2} opacity="0.6" />
        <polygon points="237,204 150,250 150,213 204,183" fill={c3} opacity="0.45" />
        <polygon points="150,57 204,87 183,120 150,102 117,120 96,87"       fill={c2} opacity="0.4" />
        <polygon points="150,213 204,183 183,150 150,168 117,150 96,183"    fill={c1} opacity="0.5" />
        <polygon points="150,20 237,66 237,204 150,250 63,204 63,66"
          fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.2" />
      </g>
      <polygon points="150,20 63,66 96,87 150,57"   fill={`url(#gS-${uid})`} opacity="0.9" />
      <polygon points="150,20 150,57 96,87 63,66"   fill="#ffffff" opacity="0.16" />
      <ellipse cx="118" cy="62" rx="16" ry="9" fill="#ffffff" opacity="0.42" transform="rotate(-30 118 62)" />
      <ellipse cx="112" cy="59" rx="6"  ry="3" fill="#ffffff" opacity="0.68" transform="rotate(-30 112 59)" />
    </svg>
  );
};

/* ─────────────────────────────────────────────────────────────
   STATUS CONFIG
───────────────────────────────────────────────────────────── */
const STATUS_STYLE = {
  pending:    { color: '#8a6a20', bg: '#fdf4dc', border: '#e8d090' },
  verified:   { color: '#3a4a8a', bg: '#eaecf8', border: '#9aa0d8' },
  certified:  { color: '#2a6a3a', bg: '#e8f5ec', border: '#90d0a0' },
  listed:     { color: '#6a2a8a', bg: '#f0e8f8', border: '#c090d8' },
  transferred:{ color: '#3a4a8a', bg: '#eaecf8', border: '#9aa0d8' },
  sold:       { color: '#4a4a48', bg: '#f0ece4', border: '#c8c3ba' },
};

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

/* ─────────────────────────────────────────────────────────────
   SPEC ROW — reusable table row
───────────────────────────────────────────────────────────── */
const SpecRow = ({ label, value }) => value ? (
  <div className="gd-spec-row">
    <span className="gd-spec-key">{label}</span>
    <span className="gd-spec-val">{value}</span>
  </div>
) : null;

/* ─────────────────────────────────────────────────────────────
   SECTION CARD
───────────────────────────────────────────────────────────── */
const Section = ({ title, children, label }) => (
  <div className="gd-section">
    {label && <div className="gd-section__label">{label}</div>}
    <h3 className="gd-section__title">{title}</h3>
    {children}
  </div>
);

/* ─────────────────────────────────────────────────────────────
   MAIN
───────────────────────────────────────────────────────────── */
const GemstoneDetails = () => {
  const { id } = useParams();
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const [gemstone, setGemstone]     = useState(null);
  const [loading,  setLoading]      = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);
  const [uploading, setUploading]   = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => { fetchGemstone(); }, [id]);

  const fetchGemstone = async () => {
    try {
      setLoading(true);
      const response = await gemstoneAPI.getById(id);
      setGemstone(response.data.data.gemstone);
    } catch (error) {
      console.error('Failed to fetch gemstone:', error);
      navigate('/gemstones');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadPhotos = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    setUploadError('');
    try {
      const formData = new FormData();
      files.forEach(f => formData.append('images', f));
      const res = await gemstoneAPI.uploadPhotos(id, formData);
      setGemstone(prev => ({ ...prev, images: res.data.data.images }));
      setActivePhoto(0);
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeletePhoto = async (filename) => {
    if (!window.confirm('Delete this photo?')) return;
    try {
      const res = await gemstoneAPI.deletePhoto(id, filename);
      setGemstone(prev => ({ ...prev, images: res.data.data.images }));
      setActivePhoto(0);
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) {
    return (
      <div className="gd-loading-screen">
        <div className="gd-spinner" />
        <span className="gd-loading-text">Loading gemstone…</span>
      </div>
    );
  }
  if (!gemstone) return null;

  const palette  = getPalette(gemstone.type);
  const isOwner  = user?._id === gemstone.currentOwner;
  const statusSt = STATUS_STYLE[gemstone.status] || STATUS_STYLE.sold;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        .gd-root {
          font-family: 'DM Sans', sans-serif;
          background: #fafaf8;
          min-height: 100vh;
          padding: 48px 0 96px;
        }
        .gd-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 48px;
        }

        /* ── Breadcrumb ── */
        .gd-crumb {
          font-size: 12px;
          font-weight: 400;
          letter-spacing: 0.04em;
          color: #9a9490;
          margin-bottom: 36px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .gd-crumb a { color: #6a6560; text-decoration: none; transition: color 0.15s; }
        .gd-crumb a:hover { color: #1a1a1a; }
        .gd-crumb__sep { color: #c8c3ba; }
        .gd-crumb__current { color: #1a1a1a; }

        /* ── Layout ── */
        .gd-layout {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 24px;
          align-items: start;
        }
        .gd-main { display: flex; flex-direction: column; gap: 1px; background: #e4e0d8; border: 1px solid #e4e0d8; }

        /* ── Gem stage ── */
        .gd-stage {
          background: #ffffff;
          position: relative;
          overflow: hidden;
        }
        .gd-stage__bg {
          height: 420px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 40px;
        }
        .gd-stage__glow {
          position: absolute;
          inset: 0;
          opacity: 0.6;
        }
        .gd-stage__gem {
          width: 260px;
          height: 260px;
          position: relative;
          z-index: 1;
          filter: drop-shadow(0 20px 40px rgba(0,0,0,0.10));
        }
        .gd-stage__status {
          position: absolute;
          bottom: 20px;
          left: 24px;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          padding: 5px 12px;
        }
        .gd-stage__ngja {
          position: absolute;
          bottom: 20px;
          right: 24px;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #2a6a3a;
          background: rgba(232,245,236,0.92);
          border: 1px solid #90d0a0;
          padding: 5px 12px;
          backdrop-filter: blur(4px);
        }

        /* ── Section ── */
        .gd-section {
          background: #ffffff;
          padding: 36px 40px;
        }
        .gd-section__label {
          font-size: 10.5px;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #9a9490;
          margin-bottom: 8px;
        }
        .gd-section__title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.5rem;
          font-weight: 300;
          color: #1a1a1a;
          margin: 0 0 28px;
        }

        /* Gemstone name header */
        .gd-name-section {
          background: #ffffff;
          padding: 36px 40px 28px;
        }
        .gd-gem-type {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #9a9490;
          margin-bottom: 8px;
        }
        .gd-gem-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2rem, 4vw, 2.8rem);
          font-weight: 300;
          color: #1a1a1a;
          line-height: 1.1;
          margin-bottom: 14px;
        }
        .gd-gem-desc {
          font-size: 14px;
          font-weight: 300;
          color: #6a6560;
          line-height: 1.75;
        }

        /* ── Spec table ── */
        .gd-specs { display: flex; flex-direction: column; gap: 0; }
        .gd-spec-row {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          padding: 13px 0;
          border-bottom: 1px solid #f0ece4;
          gap: 16px;
        }
        .gd-spec-row:last-child { border-bottom: none; }
        .gd-spec-key {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #b8b3aa;
          white-space: nowrap;
        }
        .gd-spec-val {
          font-size: 13.5px;
          font-weight: 400;
          color: #1a1a1a;
          text-align: right;
        }
        .gd-spec-val--mono {
          font-family: 'Courier New', monospace;
          font-size: 11.5px;
          color: #4a4a48;
          word-break: break-all;
          text-align: right;
        }

        /* ── Spec grid (3-col) ── */
        .gd-specs-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px 32px;
        }
        .gd-sg-key {
          font-size: 10.5px;
          font-weight: 500;
          letter-spacing: 0.13em;
          text-transform: uppercase;
          color: #b8b3aa;
          margin-bottom: 5px;
        }
        .gd-sg-val {
          font-size: 13.5px;
          font-weight: 400;
          color: #1a1a1a;
        }
        .gd-sg-val--mono {
          font-family: 'Courier New', monospace;
          font-size: 11px;
          color: #5a6a8a;
        }

        /* ── NGJA cert panel ── */
        .gd-cert-panel {
          background: #f5faf6;
          border: 1px solid #c0dfc8;
          padding: 24px;
          margin-top: 4px;
        }
        .gd-cert-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 16px;
        }
        .gd-cert-key {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #5a8a68;
          margin-bottom: 4px;
        }
        .gd-cert-val {
          font-size: 13px;
          font-weight: 400;
          color: #1a3a22;
        }
        .gd-cert-link {
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.06em;
          color: #3a7a52;
          text-decoration: none;
          border-bottom: 1px solid #3a7a52;
          padding-bottom: 1px;
          transition: opacity 0.15s;
        }
        .gd-cert-link:hover { opacity: 0.6; }

        /* ── Blockchain hash blocks ── */
        .gd-hash-block {
          margin-bottom: 20px;
        }
        .gd-hash-label {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #9a9490;
          margin-bottom: 8px;
        }
        .gd-hash {
          font-family: 'Courier New', monospace;
          font-size: 11px;
          background: #111110;
          color: #7fd87f;
          padding: 14px 18px;
          word-break: break-all;
          line-height: 1.6;
          letter-spacing: 0.03em;
        }
        .gd-hash--prev { color: #7facd8; }

        .gd-sc-panel {
          background: #f8f5fc;
          border: 1px solid #d0b8e8;
          padding: 20px 24px;
          margin-top: 20px;
        }
        .gd-sc-title {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #6a4a8a;
          margin-bottom: 8px;
        }
        .gd-sc-desc {
          font-size: 12.5px;
          font-weight: 300;
          color: #5a4a6a;
          line-height: 1.65;
          margin-bottom: 12px;
        }
        .gd-sc-link {
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.06em;
          color: #6a4a8a;
          text-decoration: none;
          border-bottom: 1px solid #6a4a8a;
          padding-bottom: 1px;
          transition: opacity 0.15s;
        }
        .gd-sc-link:hover { opacity: 0.6; }

        /* ── Ownership history ── */
        .gd-history { display: flex; flex-direction: column; gap: 0; }
        .gd-history-item {
          display: flex;
          gap: 20px;
          padding: 16px 0;
          border-bottom: 1px solid #f0ece4;
          position: relative;
        }
        .gd-history-item:last-child { border-bottom: none; }
        .gd-history-num {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.1rem;
          font-weight: 300;
          color: #c8c3ba;
          width: 24px;
          flex-shrink: 0;
          padding-top: 2px;
        }
        .gd-history-label {
          font-size: 13px;
          font-weight: 500;
          color: #1a1a1a;
          margin-bottom: 4px;
        }
        .gd-history-date {
          font-size: 11.5px;
          font-weight: 300;
          color: #9a9490;
        }
        .gd-history-tx {
          font-family: 'Courier New', monospace;
          font-size: 10.5px;
          color: #8a9ab0;
          margin-top: 6px;
          word-break: break-all;
          line-height: 1.5;
        }

        /* ── Right sidebar ── */
        .gd-sidebar { display: flex; flex-direction: column; gap: 1px; background: #e4e0d8; border: 1px solid #e4e0d8; position: sticky; top: 24px; }
        .gd-sidebar-card { background: #ffffff; padding: 28px 24px; }
        .gd-sidebar-label {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #9a9490;
          margin-bottom: 20px;
        }

        .gd-owner-badge {
          background: #f5faf6;
          border: 1px solid #c0dfc8;
          padding: 14px 16px;
          margin-bottom: 20px;
        }
        .gd-owner-badge-text {
          font-size: 12.5px;
          font-weight: 500;
          color: #2a6a3a;
          letter-spacing: 0.02em;
        }
        .gd-owner-private {
          font-size: 13px;
          font-weight: 300;
          color: #8a8580;
          margin-bottom: 20px;
        }

        .gd-status-display {
          margin-bottom: 24px;
        }
        .gd-status-display-label {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #b8b3aa;
          margin-bottom: 8px;
        }
        .gd-status-pill {
          display: inline-block;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 4px 12px;
        }

        .gd-listed-panel {
          background: #f8f5fc;
          border: 1px solid #d0b8e8;
          padding: 14px 16px;
          margin-bottom: 20px;
        }
        .gd-listed-title {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #6a4a8a;
          margin-bottom: 6px;
        }
        .gd-listed-link {
          font-size: 12px;
          font-weight: 400;
          color: #6a4a8a;
          text-decoration: none;
          transition: opacity 0.15s;
        }
        .gd-listed-link:hover { opacity: 0.6; }

        /* Action buttons */
        .gd-actions { display: flex; flex-direction: column; gap: 8px; }
        .gd-action-btn {
          display: block;
          width: 100%;
          padding: 12px 20px;
          font-family: 'DM Sans', sans-serif;
          font-size: 11.5px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          text-align: center;
          text-decoration: none;
          transition: background 0.15s, border-color 0.15s;
          cursor: pointer;
          border: none;
        }
        .gd-action-btn--solid {
          background: #1a1a1a;
          color: #ffffff;
        }
        .gd-action-btn--solid:hover { background: #333330; }
        .gd-action-btn--outline {
          background: transparent;
          color: #1a1a1a;
          border: 1px solid #c8c3ba;
        }
        .gd-action-btn--outline:hover { border-color: #1a1a1a; background: #f5f2ec; }

        /* Registered line */
        .gd-registered {
          font-size: 11px;
          font-weight: 300;
          color: #b8b3aa;
          text-align: center;
          padding-top: 18px;
          border-top: 1px solid #f0ece4;
          letter-spacing: 0.04em;
        }

        /* ── Loading ── */
        .gd-loading-screen {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 20px;
          background: #fafaf8;
        }
        .gd-spinner {
          width: 36px; height: 36px;
          border: 2px solid #e4e0d8;
          border-top-color: #1a1a1a;
          border-radius: 50%;
          animation: gd-spin 0.75s linear infinite;
        }
        @keyframes gd-spin { to { transform: rotate(360deg); } }
        .gd-loading-text { font-size: 13px; font-weight: 300; color: #9a9490; letter-spacing: 0.06em; }

        /* ── Photo gallery ── */
        .gd-photo-main {
          width: 100%; height: 420px; object-fit: cover; display: block;
        }
        .gd-photo-strip {
          display: flex; gap: 4px; padding: 8px;
          background: #f0ece4; overflow-x: auto;
        }
        .gd-photo-thumb {
          width: 64px; height: 64px; object-fit: cover; flex-shrink: 0;
          cursor: pointer; opacity: 0.65; transition: opacity 0.15s;
          border: 2px solid transparent;
        }
        .gd-photo-thumb:hover { opacity: 1; }
        .gd-photo-thumb--active { opacity: 1; border-color: #1a1a1a; }
        .gd-photo-thumb-wrap { position: relative; flex-shrink: 0; }
        .gd-photo-delete {
          position: absolute; top: 2px; right: 2px;
          width: 18px; height: 18px; border-radius: 50%;
          background: rgba(200,60,60,0.85); color: #fff;
          border: none; font-size: 12px; line-height: 18px; text-align: center;
          cursor: pointer; display: none; padding: 0;
        }
        .gd-photo-thumb-wrap:hover .gd-photo-delete { display: block; }
        .gd-photo-upload-bar {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 16px; background: #fafaf8; border-top: 1px solid #e8e4dc;
        }
        .gd-photo-upload-btn {
          font-size: 11.5px; font-weight: 500; letter-spacing: 0.08em;
          text-transform: uppercase; color: #1a1a1a;
          background: transparent; border: 1px solid #c8c3ba;
          padding: 6px 16px; cursor: pointer; transition: border-color 0.15s;
        }
        .gd-photo-upload-btn:hover { border-color: #1a1a1a; }
        .gd-photo-upload-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .gd-photo-upload-error { font-size: 12px; color: #c03030; }

        /* ── Responsive ── */
        @media (max-width: 960px) {
          .gd-layout { grid-template-columns: 1fr; }
          .gd-sidebar { position: static; }
          .gd-inner { padding: 0 32px; }
          .gd-specs-grid { grid-template-columns: repeat(2, 1fr); }
          .gd-cert-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .gd-inner { padding: 0 20px; }
          .gd-specs-grid { grid-template-columns: 1fr; }
          .gd-cert-grid { grid-template-columns: 1fr; }
          .gd-stage__bg { height: 300px; }
          .gd-stage__gem { width: 180px; height: 180px; }
        }
      `}</style>

      <div className="gd-root">
        <div className="gd-inner">

          {/* Breadcrumb */}
          <nav className="gd-crumb">
            <Link to="/gemstones">Gemstones</Link>
            <span className="gd-crumb__sep">/</span>
            <span className="gd-crumb__current">{gemstone.name}</span>
          </nav>

          <div className="gd-layout">

            {/* ── Left column ── */}
            <div className="gd-main">

              {/* Gem stage */}
              <div className="gd-stage">
                {gemstone.images?.length > 0 ? (
                  <>
                    <div style={{ position: 'relative' }}>
                      <img
                        src={`${STATIC_BASE}${gemstone.images[activePhoto]?.url}`}
                        alt={gemstone.name}
                        className="gd-photo-main"
                      />
                      <div className="gd-stage__status" style={{
                        color: statusSt.color, background: statusSt.bg, border: `1px solid ${statusSt.border}`,
                      }}>
                        {gemstone.status}
                      </div>
                      {gemstone.ngja?.certified && (
                        <div className="gd-stage__ngja">NGJA Certified</div>
                      )}
                    </div>
                    {gemstone.images.length > 1 && (
                      <div className="gd-photo-strip">
                        {gemstone.images.map((img, idx) => (
                          <div key={img.filename} className="gd-photo-thumb-wrap">
                            <img
                              src={`${STATIC_BASE}${img.url}`}
                              alt={`thumb-${idx}`}
                              className={`gd-photo-thumb${idx === activePhoto ? ' gd-photo-thumb--active' : ''}`}
                              onClick={() => setActivePhoto(idx)}
                            />
                            {isOwner && (
                              <button className="gd-photo-delete" onClick={() => handleDeletePhoto(img.filename)}>×</button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {isOwner && gemstone.images.length === 1 && (
                      <div className="gd-photo-strip">
                        <div className="gd-photo-thumb-wrap">
                          <img
                            src={`${STATIC_BASE}${gemstone.images[0].url}`}
                            alt="thumb-0"
                            className="gd-photo-thumb gd-photo-thumb--active"
                          />
                          <button className="gd-photo-delete" onClick={() => handleDeletePhoto(gemstone.images[0].filename)}>×</button>
                        </div>
                      </div>
                    )}
                    {isOwner && (
                      <div className="gd-photo-upload-bar">
                        <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png" multiple className="hidden" style={{ display: 'none' }} onChange={handleUploadPhotos} />
                        <button className="gd-photo-upload-btn" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
                          {uploading ? 'Uploading…' : '+ Add More Photos'}
                        </button>
                        {uploadError && <span className="gd-photo-upload-error">{uploadError}</span>}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="gd-stage__bg" style={{ background: palette.bg }}>
                    <div className="gd-stage__glow" style={{
                      background: `radial-gradient(ellipse 65% 60% at 50% 48%, ${palette.c3}60 0%, transparent 70%)`,
                    }} />
                    <div className="gd-stage__gem">
                      <GemSVG palette={palette} />
                    </div>
                    <div className="gd-stage__status" style={{
                      color: statusSt.color, background: statusSt.bg, border: `1px solid ${statusSt.border}`,
                    }}>
                      {gemstone.status}
                    </div>
                    {gemstone.ngja?.certified && (
                      <div className="gd-stage__ngja">NGJA Certified</div>
                    )}
                    {isOwner && (
                      <div className="gd-photo-upload-bar" style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
                        <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png" multiple style={{ display: 'none' }} onChange={handleUploadPhotos} />
                        <button className="gd-photo-upload-btn" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
                          {uploading ? 'Uploading…' : '+ Upload Photos'}
                        </button>
                        {uploadError && <span className="gd-photo-upload-error">{uploadError}</span>}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Name & description */}
              <div className="gd-name-section" style={{ borderTop: '1px solid #e4e0d8' }}>
                <div className="gd-gem-type">{gemstone.type}</div>
                <h1 className="gd-gem-name">{gemstone.name}</h1>
                {gemstone.description && (
                  <p className="gd-gem-desc">{gemstone.description}</p>
                )}
              </div>

              {/* Specifications */}
              <Section label="Details" title="Specifications">
                <div className="gd-specs-grid">
                  {[
                    ['Type',      gemstone.type],
                    ['Variety',   gemstone.variety],
                    ['Weight',    gemstone.weight?.carats ? `${gemstone.weight.carats} carats` : null],
                    ['Color',     [gemstone.color?.primary, gemstone.color?.intensity].filter(Boolean).join(' — ') || null],
                    ['Clarity',   gemstone.clarity],
                    ['Cut',       gemstone.cut],
                    ['Origin',    [gemstone.origin?.region, gemstone.origin?.country].filter(Boolean).join(', ') || null],
                    ['Treatment', gemstone.treatment],
                    ['Gemstone ID', null],
                  ].map(([label, value]) => label === 'Gemstone ID' ? (
                    <div key={label} style={{ gridColumn: '1 / -1' }}>
                      <div className="gd-sg-key">Gemstone ID</div>
                      <div className="gd-sg-val gd-sg-val--mono">{gemstone.gemId}</div>
                    </div>
                  ) : value ? (
                    <div key={label}>
                      <div className="gd-sg-key">{label}</div>
                      <div className="gd-sg-val">{value}</div>
                    </div>
                  ) : null)}
                </div>
                {gemstone.dimensions && (
                  <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #f0ece4' }}>
                    <div className="gd-sg-key" style={{ marginBottom: '6px' }}>Dimensions</div>
                    <div className="gd-sg-val">
                      {gemstone.dimensions.length} × {gemstone.dimensions.width} × {gemstone.dimensions.depth} {gemstone.dimensions.unit}
                    </div>
                  </div>
                )}
              </Section>

              {/* NGJA Certification */}
              {gemstone.ngja?.certified && (
                <Section label="Official" title="NGJA Certification">
                  <div className="gd-cert-panel">
                    <div className="gd-cert-grid">
                      <div>
                        <div className="gd-cert-key">Certificate No.</div>
                        <div className="gd-cert-val" style={{ fontFamily: 'Courier New, monospace', fontSize: '12px' }}>
                          {gemstone.ngja.certificateNumber}
                        </div>
                      </div>
                      <div>
                        <div className="gd-cert-key">Certified By</div>
                        <div className="gd-cert-val">{gemstone.ngja.certifiedBy}</div>
                      </div>
                      <div>
                        <div className="gd-cert-key">Date</div>
                        <div className="gd-cert-val">{formatDate(gemstone.ngja.certificationDate)}</div>
                      </div>
                    </div>
                    <Link to={`/verify?cert=${gemstone.ngja.certificateNumber}`} className="gd-cert-link">
                      Verify certificate
                    </Link>
                  </div>
                </Section>
              )}

              {/* Blockchain */}
              <Section label="Immutable Record" title="Blockchain Verification">
                <div className="gd-hash-block">
                  <div className="gd-hash-label">Block Hash</div>
                  <div className="gd-hash">{gemstone.blockchainHash}</div>
                </div>
                <div className="gd-hash-block">
                  <div className="gd-hash-label">Previous Hash</div>
                  <div className="gd-hash gd-hash--prev">{gemstone.previousHash}</div>
                </div>
                <div className="gd-sc-panel">
                  <div className="gd-sc-title">Smart Contract Record</div>
                  <p className="gd-sc-desc">
                    This gemstone is recorded on the Ethereum smart contract (Ganache). 
                    Query with ID: <span style={{ fontFamily: 'Courier New, monospace', fontSize: '11px' }}>{gemstone.gemId}</span>
                  </p>
                  <Link to="/smart-contract" className="gd-sc-link">View on smart contract</Link>
                </div>
                <div style={{ marginTop: '20px' }}>
                  <div className="gd-sg-key" style={{ marginBottom: '6px' }}>Registered On</div>
                  <div className="gd-sg-val">{formatDate(gemstone.timestamp)}</div>
                </div>
              </Section>

              {/* Ownership History */}
              <Section label="Chain of Custody" title="Ownership History">
                <div className="gd-history">
                  {gemstone.ownershipHistory?.map((history, idx) => (
                    <div key={idx} className="gd-history-item">
                      <div className="gd-history-num">{idx + 1}</div>
                      <div style={{ flex: 1 }}>
                        <div className="gd-history-label">
                          {history.transactionHash === 'initial' ? 'Initial Registration' : 'Ownership Transfer'}
                        </div>
                        <div className="gd-history-date">{formatDate(history.transferDate)}</div>
                        {history.transactionHash !== 'initial' && (
                          <div className="gd-history-tx">Tx: {history.transactionHash}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Section>

            </div>

            {/* ── Sidebar ── */}
            <div className="gd-sidebar">

              {/* Ownership */}
              <div className="gd-sidebar-card">
                <div className="gd-sidebar-label">Ownership</div>

                {isOwner ? (
                  <div className="gd-owner-badge">
                    <div className="gd-owner-badge-text">You own this gemstone</div>
                  </div>
                ) : (
                  <p className="gd-owner-private">This gemstone is privately owned.</p>
                )}

                <div className="gd-status-display">
                  <div className="gd-status-display-label">Current Status</div>
                  <span className="gd-status-pill" style={{
                    color: statusSt.color, background: statusSt.bg, border: `1px solid ${statusSt.border}`,
                  }}>
                    {gemstone.status}
                  </span>
                </div>

                {gemstone.isListed && (
                  <div className="gd-listed-panel">
                    <div className="gd-listed-title">Listed on Marketplace</div>
                    <Link to="/marketplace" className="gd-listed-link">View in marketplace</Link>
                  </div>
                )}

                {isOwner && (
                  <div className="gd-actions">
                    <Link to="/blockchain" className="gd-action-btn gd-action-btn--solid">
                      View on Blockchain
                    </Link>
                    {gemstone.ngja?.certified && !gemstone.isListed && (
                      <Link to="/marketplace/create" className="gd-action-btn gd-action-btn--outline">
                        Create Listing
                      </Link>
                    )}
                  </div>
                )}

                <div className="gd-registered" style={{ marginTop: '20px' }}>
                  Registered {formatDate(gemstone.createdAt)}
                </div>
              </div>

              {/* Quick spec summary */}
              <div className="gd-sidebar-card">
                <div className="gd-sidebar-label">At a Glance</div>
                <div className="gd-specs">
                  <SpecRow label="Type"    value={gemstone.type} />
                  <SpecRow label="Weight"  value={gemstone.weight?.carats ? `${gemstone.weight.carats} ct` : null} />
                  <SpecRow label="Clarity" value={gemstone.clarity} />
                  <SpecRow label="Cut"     value={gemstone.cut} />
                  <SpecRow label="Origin"  value={gemstone.origin?.country} />
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default GemstoneDetails;