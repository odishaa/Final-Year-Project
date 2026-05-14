import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isNGJAOfficer = user?.role === 'ngja_officer' || user?.role === 'admin';
  const isActive = (path) => location.pathname === path;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&family=DM+Sans:wght@300;400;500&display=swap');

        .gc-nav {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(250, 250, 248, 0.94);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border-bottom: 1px solid #e8e4dc;
        }

        .gc-nav__inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 48px;
          display: flex;
          align-items: center;
          height: 64px;
          gap: 0;
        }

        .gc-nav__logo {
          text-decoration: none;
          display: flex;
          align-items: baseline;
          gap: 1px;
          flex-shrink: 0;
          margin-right: 48px;
        }
        .gc-nav__logo-main {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.4rem;
          font-weight: 600;
          color: #1a1a1a;
          letter-spacing: 0.01em;
        }
        .gc-nav__logo-sub {
          font-family: 'DM Sans', sans-serif;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #9a9490;
          padding-left: 1px;
        }

        .gc-nav__links {
          display: flex;
          align-items: center;
          flex: 1;
        }

        .gc-nav__link {
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 400;
          letter-spacing: 0.05em;
          color: #6a6560;
          text-decoration: none;
          padding: 6px 14px;
          position: relative;
          transition: color 0.15s;
          white-space: nowrap;
        }
        .gc-nav__link::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 14px;
          right: 14px;
          height: 1px;
          background: #1a1a1a;
          transform: scaleX(0);
          transition: transform 0.2s ease;
        }
        .gc-nav__link:hover { color: #1a1a1a; }
        .gc-nav__link:hover::after,
        .gc-nav__link--active::after { transform: scaleX(1); }
        .gc-nav__link--active { color: #1a1a1a; }

        .gc-nav__link--ngja { color: #6a5a8a; }
        .gc-nav__link--ngja:hover { color: #3a2a5a; }
        .gc-nav__link--ngja::after { background: #6a5a8a; }

        .gc-nav__divider {
          width: 1px;
          height: 18px;
          background: #e0dbd2;
          margin: 0 10px;
          flex-shrink: 0;
        }

        .gc-nav__right {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-left: auto;
          flex-shrink: 0;
        }

        .gc-nav__username {
          font-family: 'DM Sans', sans-serif;
          font-size: 12.5px;
          font-weight: 400;
          color: #5a5650;
          white-space: nowrap;
        }
        .gc-nav__role-badge {
          font-size: 9.5px;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #7a6a9a;
          background: #f0ecf8;
          padding: 3px 8px;
          border: 1px solid #ddd8ee;
          white-space: nowrap;
        }

        .gc-nav__btn-primary {
          font-family: 'DM Sans', sans-serif;
          font-size: 11.5px;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #ffffff;
          background: #1a1a1a;
          padding: 9px 22px;
          text-decoration: none;
          transition: background 0.15s;
          white-space: nowrap;
        }
        .gc-nav__btn-primary:hover { background: #333330; }

        .gc-nav__btn-text {
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 400;
          letter-spacing: 0.04em;
          color: #6a6560;
          text-decoration: none;
          padding: 8px 12px;
          transition: color 0.15s;
        }
        .gc-nav__btn-text:hover { color: #1a1a1a; }

        .gc-nav__btn-logout {
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 400;
          color: #9a9490;
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px 10px;
          transition: color 0.15s;
        }
        .gc-nav__btn-logout:hover { color: #8b3a3a; }

        @media (max-width: 1024px) {
          .gc-nav__inner { padding: 0 28px; }
          .gc-nav__logo { margin-right: 28px; }
          .gc-nav__link { padding: 6px 10px; font-size: 11.5px; }
          .gc-nav__link::after { left: 10px; right: 10px; }
        }
        @media (max-width: 768px) {
          .gc-nav__links { display: none; }
          .gc-nav__inner { padding: 0 20px; }
        }
      `}</style>

      <nav className="gc-nav">
        <div className="gc-nav__inner">

          <Link to="/" className="gc-nav__logo">
            <span className="gc-nav__logo-main">Gem</span>
            <span className="gc-nav__logo-sub">Chain</span>
          </Link>

          <div className="gc-nav__links">
            <Link to="/gemstones"     className={`gc-nav__link${isActive('/gemstones')      ? ' gc-nav__link--active' : ''}`}>Gemstones</Link>
            <Link to="/marketplace"   className={`gc-nav__link${isActive('/marketplace')    ? ' gc-nav__link--active' : ''}`}>Marketplace</Link>
            <Link to="/learn"            className={`gc-nav__link${isActive('/learn')             ? ' gc-nav__link--active' : ''}`}>Learning Hub</Link>
            <Link to="/market-analysis" className={`gc-nav__link${isActive('/market-analysis') ? ' gc-nav__link--active' : ''}`}>Market Analysis</Link>
            <Link to="/blockchain"    className={`gc-nav__link${isActive('/blockchain')     ? ' gc-nav__link--active' : ''}`}>Blockchain</Link>
            <Link to="/smart-contract"className={`gc-nav__link${isActive('/smart-contract') ? ' gc-nav__link--active' : ''}`}>Smart Contract</Link>
            <Link to="/verify"        className={`gc-nav__link${isActive('/verify')         ? ' gc-nav__link--active' : ''}`}>Verify Certificate</Link>
            {isNGJAOfficer && (
              <>
                <div className="gc-nav__divider" />
                <Link to="/ngja-dashboard" className={`gc-nav__link gc-nav__link--ngja${isActive('/ngja-dashboard') ? ' gc-nav__link--active' : ''}`}>
                  NGJA Dashboard
                </Link>
              </>
            )}
          </div>

          <div className="gc-nav__right">
            {isAuthenticated ? (
              <>
                <span className="gc-nav__username">{user?.name}</span>
                {user?.role !== 'user' && (
                  <span className="gc-nav__role-badge">{user?.role.replace('_', ' ')}</span>
                )}
                <div className="gc-nav__divider" />
                <Link to="/my-gemstones" className="gc-nav__btn-primary">My Collection</Link>
                <button onClick={handleLogout} className="gc-nav__btn-logout">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login"    className="gc-nav__btn-text">Login</Link>
                <Link to="/register" className="gc-nav__btn-primary">Register</Link>
              </>
            )}
          </div>

        </div>
      </nav>
    </>
  );
};

export default Navbar;