import { useState, useEffect } from 'react';
import { blockchainAPI, smartContractAPI } from '../services/api';
import { Link } from 'react-router-dom';

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
const formatHash = (hash) => {
  if (!hash) return '—';
  return `${hash.substring(0, 10)}…${hash.substring(hash.length - 10)}`;
};
const formatDate = (date) =>
  new Date(date).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

/* ─────────────────────────────────────────────────────────────
   MAIN
───────────────────────────────────────────────────────────── */
const Blockchain = () => {
  const [blocks,        setBlocks]        = useState([]);
  const [stats,         setStats]         = useState(null);
  const [verification,  setVerification]  = useState(null);
  const [smartContract, setSmartContract] = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [expanded,      setExpanded]      = useState({});

  useEffect(() => { fetchBlockchainData(); }, []);

  const fetchBlockchainData = async () => {
    try {
      setLoading(true);
      const [statsRes, blocksRes, verifyRes, scRes] = await Promise.all([
        blockchainAPI.getInfo(),
        blockchainAPI.getAllBlocks({ limit: 20 }),
        blockchainAPI.verify(),
        smartContractAPI.getInfo(),
      ]);
      setStats(statsRes.data.data);
      setBlocks(blocksRes.data.data.blocks);
      setVerification(verifyRes.data.data);
      setSmartContract(scRes.data.data);
    } catch (error) {
      console.error('Failed to fetch blockchain data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (id) =>
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300&family=DM+Sans:wght@300;400;500&display=swap');

        .bc-root {
          font-family: 'DM Sans', sans-serif;
          background: #fafaf8;
          min-height: 100vh;
          padding: 56px 0 96px;
        }
        .bc-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 48px;
        }

        /* ── Header ── */
        .bc-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 48px;
          gap: 24px;
          flex-wrap: wrap;
        }
        .bc-header__eyebrow {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #9c8f7e;
          margin-bottom: 10px;
        }
        .bc-header__title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2rem, 3.5vw, 2.8rem);
          font-weight: 300;
          color: #1a1a1a;
          margin: 0;
          line-height: 1.1;
        }
        .bc-header__sub {
          font-size: 13.5px;
          font-weight: 300;
          color: #8a8580;
          margin-top: 8px;
        }
        .bc-btn-sc {
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
          flex-shrink: 0;
        }
        .bc-btn-sc:hover { background: #333330; }

        /* ── Stats row ── */
        .bc-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1px;
          background: #e4e0d8;
          border: 1px solid #e4e0d8;
          margin-bottom: 24px;
        }
        .bc-stat {
          background: #ffffff;
          padding: 32px 28px;
        }
        .bc-stat__label {
          font-size: 10.5px;
          font-weight: 500;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #9a9490;
          margin-bottom: 12px;
        }
        .bc-stat__value {
          font-family: 'Cormorant Garamond', serif;
          font-size: 3rem;
          font-weight: 300;
          line-height: 1;
          color: #1a1a1a;
        }
        .bc-stat__sub {
          font-size: 11px;
          font-weight: 300;
          color: #b8b3aa;
          margin-top: 6px;
          letter-spacing: 0.04em;
        }
        .bc-stat__value--valid   { color: #3a6b4a; }
        .bc-stat__value--invalid { color: #8b3a3a; }

        /* ── Smart contract banner ── */
        .bc-sc-banner {
          background: #ffffff;
          border: 1px solid #e8e4dc;
          padding: 24px 28px;
          margin-bottom: 48px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          flex-wrap: wrap;
        }
        .bc-sc-banner__label {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #9a9490;
          margin-bottom: 6px;
        }
        .bc-sc-banner__line {
          font-size: 13px;
          font-weight: 300;
          color: #4a4a48;
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }
        .bc-sc-banner__pill {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #6a4a8a;
          background: #f0e8f8;
          border: 1px solid #d0b8e8;
          padding: 3px 10px;
        }
        .bc-sc-banner__addr {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          color: #6a6560;
        }
        .bc-sc-explore {
          font-family: 'DM Sans', sans-serif;
          font-size: 11.5px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #1a1a1a;
          text-decoration: none;
          border: 1px solid #c8c3ba;
          padding: 10px 22px;
          transition: border-color 0.15s, background 0.15s;
          flex-shrink: 0;
        }
        .bc-sc-explore:hover { border-color: #1a1a1a; background: #f5f2ec; }

        /* ── Latest hash panel ── */
        .bc-latest {
          background: #111110;
          padding: 28px 32px;
          margin-bottom: 48px;
          border: 1px solid #2a2a28;
        }
        .bc-latest__label {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #5a5650;
          margin-bottom: 12px;
        }
        .bc-latest__hash {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          color: #7fd87f;
          word-break: break-all;
          line-height: 1.6;
          margin-bottom: 12px;
        }
        .bc-latest__meta {
          font-size: 11.5px;
          font-weight: 300;
          color: #4a4a48;
          letter-spacing: 0.04em;
        }

        /* ── Section heading ── */
        .bc-section-head {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 20px;
          gap: 16px;
        }
        .bc-section-eyebrow {
          font-size: 10.5px;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #9a9490;
          margin-bottom: 6px;
        }
        .bc-section-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.8rem;
          font-weight: 300;
          color: #1a1a1a;
          margin: 0;
        }
        .bc-refresh-btn {
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #6a6560;
          background: transparent;
          border: 1px solid #e0dbd2;
          padding: 8px 18px;
          cursor: pointer;
          transition: border-color 0.15s, color 0.15s;
          flex-shrink: 0;
        }
        .bc-refresh-btn:hover { border-color: #1a1a1a; color: #1a1a1a; }

        /* ── Block list ── */
        .bc-blocks {
          display: flex;
          flex-direction: column;
          gap: 1px;
          background: #e4e0d8;
          border: 1px solid #e4e0d8;
        }

        /* ── Single block card ── */
        .bc-block {
          background: #ffffff;
          overflow: hidden;
        }
        .bc-block__header {
          padding: 24px 28px 20px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
        }
        .bc-block__index {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2rem;
          font-weight: 300;
          color: #1a1a1a;
          line-height: 1;
          margin-bottom: 6px;
        }
        .bc-block__meta {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .bc-block__time {
          font-size: 11.5px;
          font-weight: 300;
          color: #9a9490;
          margin-top: 6px;
          letter-spacing: 0.03em;
        }
        .bc-pill {
          font-size: 9.5px;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 3px 9px;
        }
        .bc-pill--verified { color: #2a6a3a; background: #e8f5ec; border: 1px solid #90d0a0; }
        .bc-pill--pending  { color: #8a6a20; background: #fdf4dc; border: 1px solid #e8d090; }
        .bc-pill--type     { color: #4a3a7a; background: #f0ebf8; border: 1px solid #c8b8e8; }

        .bc-block__nonce-wrap { text-align: right; flex-shrink: 0; }
        .bc-block__nonce-label {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #b8b3aa;
          margin-bottom: 4px;
        }
        .bc-block__nonce-val {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.4rem;
          font-weight: 300;
          color: #1a1a1a;
        }

        /* Hash rows */
        .bc-block__body { padding: 0 28px 20px; display: flex; flex-direction: column; gap: 12px; }
        .bc-hash-row {}
        .bc-hash-label {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #b8b3aa;
          margin-bottom: 6px;
        }
        .bc-hash-val {
          font-family: 'Courier New', monospace;
          font-size: 11px;
          background: #111110;
          color: #7fd87f;
          padding: 10px 14px;
          word-break: break-all;
          line-height: 1.55;
        }
        .bc-hash-val--prev { color: #7facd8; }

        /* Meta fields */
        .bc-block__fields {
          display: flex;
          gap: 32px;
          flex-wrap: wrap;
          padding: 16px 28px;
          border-top: 1px solid #f0ece4;
        }
        .bc-field-key {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.13em;
          text-transform: uppercase;
          color: #b8b3aa;
          margin-bottom: 4px;
        }
        .bc-field-val {
          font-size: 13px;
          font-weight: 400;
          color: #2a2a28;
        }

        /* Data toggle */
        .bc-data-toggle {
          padding: 0 28px 20px;
        }
        .bc-data-btn {
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #6a6560;
          background: none;
          border: 1px solid #e4e0d8;
          padding: 7px 16px;
          cursor: pointer;
          transition: border-color 0.15s, color 0.15s;
        }
        .bc-data-btn:hover { border-color: #1a1a1a; color: #1a1a1a; }
        .bc-data-pre {
          font-family: 'Courier New', monospace;
          font-size: 11px;
          background: #111110;
          color: #c8c3ba;
          padding: 16px 18px;
          overflow-x: auto;
          line-height: 1.65;
          margin-top: 10px;
          white-space: pre;
        }

        /* Chain link footer */
        .bc-chain-link {
          padding: 10px 28px;
          background: #fafaf8;
          border-top: 1px solid #f0ece4;
          font-size: 11px;
          font-weight: 300;
          color: #9a9490;
          letter-spacing: 0.04em;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .bc-chain-link__dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #c8c3ba;
          flex-shrink: 0;
        }
        .bc-chain-link__hash {
          font-family: 'Courier New', monospace;
          font-size: 10.5px;
          color: #7facd8;
        }

        /* Loading */
        .bc-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 96px 0;
          gap: 20px;
        }
        .bc-spinner {
          width: 36px; height: 36px;
          border: 2px solid #e4e0d8;
          border-top-color: #1a1a1a;
          border-radius: 50%;
          animation: bc-spin 0.75s linear infinite;
        }
        @keyframes bc-spin { to { transform: rotate(360deg); } }
        .bc-loading-text { font-size: 13px; font-weight: 300; color: #9a9490; }

        /* Responsive */
        @media (max-width: 960px) {
          .bc-stats { grid-template-columns: repeat(2, 1fr); }
          .bc-inner { padding: 0 32px; }
        }
        @media (max-width: 600px) {
          .bc-stats { grid-template-columns: 1fr; }
          .bc-inner { padding: 0 20px; }
          .bc-header { flex-direction: column; align-items: flex-start; }
          .bc-btn-sc { width: 100%; text-align: center; }
        }
      `}</style>

      <div className="bc-root">
        <div className="bc-inner">

          {/* Header */}
          <div className="bc-header">
            <div>
              <div className="bc-header__eyebrow">GemChain</div>
              <h1 className="bc-header__title">Blockchain Explorer</h1>
              <p className="bc-header__sub">MongoDB blockchain and smart contract on Ganache</p>
            </div>
            <Link to="/smart-contract" className="bc-btn-sc">View Smart Contract</Link>
          </div>

          {loading ? (
            <div className="bc-loading">
              <div className="bc-spinner" />
              <span className="bc-loading-text">Loading blockchain…</span>
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="bc-stats">
                <div className="bc-stat">
                  <div className="bc-stat__label">MongoDB Blocks</div>
                  <div className="bc-stat__value">{stats?.totalBlocks || 0}</div>
                </div>
                <div className="bc-stat">
                  <div className="bc-stat__label">Latest Block</div>
                  <div className="bc-stat__value">#{stats?.latestBlockIndex || 0}</div>
                </div>
                <div className="bc-stat">
                  <div className="bc-stat__label">On-Chain Gemstones</div>
                  <div className="bc-stat__value">{smartContract?.totalGemstones || 0}</div>
                  <div className="bc-stat__sub">Smart contract</div>
                </div>
                <div className="bc-stat">
                  <div className="bc-stat__label">Chain Status</div>
                  <div className={`bc-stat__value ${verification?.valid ? 'bc-stat__value--valid' : 'bc-stat__value--invalid'}`}
                    style={{ fontSize: '2rem', paddingTop: '6px' }}>
                    {verification?.valid ? 'Valid' : 'Invalid'}
                  </div>
                </div>
              </div>

              {/* Smart contract banner */}
              {smartContract && (
                <div className="bc-sc-banner">
                  <div>
                    <div className="bc-sc-banner__label">Smart Contract</div>
                    <div className="bc-sc-banner__line">
                      <span className="bc-sc-banner__pill">{smartContract.network}</span>
                      <span className="bc-sc-banner__addr">{formatHash(smartContract.address)}</span>
                    </div>
                  </div>
                  <Link to="/smart-contract" className="bc-sc-explore">Explore</Link>
                </div>
              )}

              {/* Latest hash */}
              {stats && (
                <div className="bc-latest">
                  <div className="bc-latest__label">Latest Block Hash</div>
                  <div className="bc-latest__hash">{stats.latestBlockHash}</div>
                  <div className="bc-latest__meta">Last updated — {formatDate(stats.lastBlockTime)}</div>
                </div>
              )}

              {/* Blocks */}
              <div className="bc-section-head">
                <div>
                  <div className="bc-section-eyebrow">Ledger</div>
                  <h2 className="bc-section-title">Recent Blocks</h2>
                </div>
                <button className="bc-refresh-btn" onClick={fetchBlockchainData}>
                  Refresh
                </button>
              </div>

              <div className="bc-blocks">
                {blocks.map((block) => (
                  <div key={block._id} className="bc-block">

                    {/* Block header */}
                    <div className="bc-block__header">
                      <div>
                        <div className="bc-block__index">Block #{block.index}</div>
                        <div className="bc-block__meta">
                          <span className={`bc-pill ${block.verified ? 'bc-pill--verified' : 'bc-pill--pending'}`}>
                            {block.verified ? 'Verified' : 'Pending'}
                          </span>
                          {block.transactionType && (
                            <span className="bc-pill bc-pill--type">{block.transactionType}</span>
                          )}
                        </div>
                        <div className="bc-block__time">{formatDate(block.timestamp)}</div>
                      </div>
                      <div className="bc-block__nonce-wrap">
                        <div className="bc-block__nonce-label">Nonce</div>
                        <div className="bc-block__nonce-val">{block.nonce}</div>
                      </div>
                    </div>

                    {/* Hashes */}
                    <div className="bc-block__body">
                      <div className="bc-hash-row">
                        <div className="bc-hash-label">Current Hash</div>
                        <div className="bc-hash-val">{block.hash}</div>
                      </div>
                      <div className="bc-hash-row">
                        <div className="bc-hash-label">Previous Hash</div>
                        <div className="bc-hash-val bc-hash-val--prev">{block.previousHash}</div>
                      </div>
                    </div>

                    {/* Meta fields */}
                    {(block.userId || block.gemstoneId) && (
                      <div className="bc-block__fields">
                        {block.userId && (
                          <div>
                            <div className="bc-field-key">User</div>
                            <div className="bc-field-val">
                              {block.userId.name}
                              <span style={{ color: '#9a9490', marginLeft: '8px', fontSize: '12px' }}>
                                {block.userId.email}
                              </span>
                            </div>
                          </div>
                        )}
                        {block.gemstoneId && (
                          <div>
                            <div className="bc-field-key">Gemstone ID</div>
                            <div className="bc-field-val" style={{ fontFamily: 'Courier New, monospace', fontSize: '12px', color: '#5a6a8a' }}>
                              {block.gemstoneId.gemId || '—'}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Data toggle */}
                    <div className="bc-data-toggle">
                      <button className="bc-data-btn" onClick={() => toggleExpanded(block._id)}>
                        {expanded[block._id] ? 'Hide' : 'View'} Transaction Data
                      </button>
                      {expanded[block._id] && (
                        <pre className="bc-data-pre">
                          {JSON.stringify(block.data, null, 2)}
                        </pre>
                      )}
                    </div>

                    {/* Chain link */}
                    {block.index > 0 && (
                      <div className="bc-chain-link">
                        <div className="bc-chain-link__dot" />
                        <span>Linked to Block #{block.index - 1} via</span>
                        <span className="bc-chain-link__hash">{formatHash(block.previousHash)}</span>
                      </div>
                    )}

                  </div>
                ))}
              </div>

            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Blockchain;