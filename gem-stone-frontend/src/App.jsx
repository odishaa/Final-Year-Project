import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Gemstones from './pages/Gemstones';
import RegisterGemstone from './pages/RegisterGemstone';
import Blockchain from './pages/Blockchain';
import VerifyCertificate from './pages/VerifyCertificate';
import NGJADashboard from './pages/NGJADashboard';
import MyGemstones from './pages/MyGemstones';
import SmartContractExplorer from './pages/SmartContractExplorer';
import LearningHub from './pages/LearningHub';
import MarketAnalysis from './pages/MarketAnalysis';
import Marketplace from './pages/Marketplace';
import ListingDetails from './pages/ListingDetails';
import CreateListing from './pages/CreateListing';
import MyListings from './pages/MyListings';
import MyOffers from './pages/MyOffers';
import MyPurchases from './pages/MyPurchases';
import MySales from './pages/MySales';
import GemstoneDetails from './pages/GemstoneDetails';

const Footer = () => (
  <>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&family=DM+Sans:wght@300;400;500&display=swap');

      .gc-footer { background: #111110; border-top: 1px solid #2a2a28; }

      .gc-footer__inner {
        max-width: 1200px;
        margin: 0 auto;
        padding: 64px 48px 48px;
      }

      .gc-footer__top {
        display: grid;
        grid-template-columns: 1.6fr 1fr 1fr 1fr;
        gap: 48px;
        padding-bottom: 48px;
        border-bottom: 1px solid #2a2a28;
      }

      .gc-footer__brand-logo {
        display: flex;
        align-items: baseline;
        gap: 1px;
        margin-bottom: 16px;
        text-decoration: none;
      }
      .gc-footer__brand-main {
        font-family: 'Cormorant Garamond', serif;
        font-size: 1.4rem;
        font-weight: 600;
        color: #ffffff;
      }
      .gc-footer__brand-sub {
        font-family: 'DM Sans', sans-serif;
        font-size: 10px;
        font-weight: 500;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        color: #5a5650;
        padding-left: 1px;
      }
      .gc-footer__brand-desc {
        font-family: 'DM Sans', sans-serif;
        font-size: 13px;
        font-weight: 300;
        color: #5a5650;
        line-height: 1.75;
        max-width: 260px;
      }

      .gc-footer__col-title {
        font-family: 'DM Sans', sans-serif;
        font-size: 10.5px;
        font-weight: 500;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: #6a6560;
        margin-bottom: 20px;
      }

      .gc-footer__links {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 11px;
      }
      .gc-footer__link {
        font-family: 'DM Sans', sans-serif;
        font-size: 13px;
        font-weight: 300;
        color: #5a5650;
        text-decoration: none;
        transition: color 0.15s;
      }
      .gc-footer__link:hover { color: #b8b3aa; }

      .gc-footer__bottom {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-top: 32px;
        flex-wrap: wrap;
        gap: 16px;
      }
      .gc-footer__copy {
        font-family: 'DM Sans', sans-serif;
        font-size: 12px;
        font-weight: 300;
        color: #3a3a38;
      }
      .gc-footer__stack {
        font-family: 'DM Sans', sans-serif;
        font-size: 11px;
        font-weight: 300;
        color: #2e2e2c;
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .gc-footer__stack-dot {
        width: 3px;
        height: 3px;
        border-radius: 50%;
        background: #3a3a38;
      }

      @media (max-width: 960px) {
        .gc-footer__top { grid-template-columns: 1fr 1fr; gap: 40px; }
        .gc-footer__inner { padding: 48px 32px 36px; }
      }
      @media (max-width: 580px) {
        .gc-footer__top { grid-template-columns: 1fr; }
        .gc-footer__bottom { flex-direction: column; align-items: flex-start; }
      }
    `}</style>

    <footer className="gc-footer">
      <div className="gc-footer__inner">
        <div className="gc-footer__top">
          <div>
            <a href="/" className="gc-footer__brand-logo">
              <span className="gc-footer__brand-main">Gem</span>
              <span className="gc-footer__brand-sub">Chain</span>
            </a>
            <p className="gc-footer__brand-desc">
              Blockchain-based gemstone authentication with SHA-256 security
              and official NGJA certification integration.
            </p>
          </div>
          <div>
            <div className="gc-footer__col-title">Platform</div>
            <ul className="gc-footer__links">
              <li><a href="/gemstones"       className="gc-footer__link">Gemstones</a></li>
              <li><a href="/marketplace"     className="gc-footer__link">Marketplace</a></li>
              <li><a href="/learn"            className="gc-footer__link">Learning Hub</a></li>
              <li><a href="/market-analysis" className="gc-footer__link">Market Analysis</a></li>
              <li><a href="/blockchain"      className="gc-footer__link">Blockchain</a></li>
              <li><a href="/smart-contract"  className="gc-footer__link">Smart Contract</a></li>
            </ul>
          </div>
          <div>
            <div className="gc-footer__col-title">Account</div>
            <ul className="gc-footer__links">
              <li><a href="/register"                  className="gc-footer__link">Create Account</a></li>
              <li><a href="/login"                     className="gc-footer__link">Sign In</a></li>
              <li><a href="/my-gemstones"              className="gc-footer__link">My Collection</a></li>
              <li><a href="/marketplace/my-listings"   className="gc-footer__link">My Listings</a></li>
            </ul>
          </div>
          <div>
            <div className="gc-footer__col-title">Tools</div>
            <ul className="gc-footer__links">
              <li><a href="/verify"                     className="gc-footer__link">Verify Certificate</a></li>
              <li><a href="/register-gemstone"          className="gc-footer__link">Register Gemstone</a></li>
              <li><a href="/marketplace/my-offers"      className="gc-footer__link">My Offers</a></li>
              <li><a href="/marketplace/my-purchases"   className="gc-footer__link">My Purchases</a></li>
            </ul>
          </div>
        </div>
        <div className="gc-footer__bottom">
          <span className="gc-footer__copy">© 2024 GemChain. All rights reserved.</span>
          <div className="gc-footer__stack">
            <span>React + Vite</span>
            <div className="gc-footer__stack-dot" />
            <span>Node.js + MongoDB</span>
            <div className="gc-footer__stack-dot" />
            <span>SHA-256 Blockchain</span>
          </div>
        </div>
      </div>
    </footer>
  </>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <div style={{ minHeight: '100vh', background: '#fafaf8', display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          <main style={{ flex: 1 }}>
            <Routes>
              <Route path="/"                           element={<Home />} />
              <Route path="/login"                      element={<Login />} />
              <Route path="/register"                   element={<Register />} />
              <Route path="/gemstones"                  element={<Gemstones />} />
              <Route path="/gemstones/:id"              element={<GemstoneDetails />} />
              <Route path="/register-gemstone"          element={<RegisterGemstone />} />
              <Route path="/my-gemstones"               element={<MyGemstones />} />
              <Route path="/marketplace"                element={<Marketplace />} />
              <Route path="/marketplace/listings/:id"   element={<ListingDetails />} />
              <Route path="/marketplace/create"         element={<CreateListing />} />
              <Route path="/marketplace/my-listings"    element={<MyListings />} />
              <Route path="/marketplace/my-offers"      element={<MyOffers />} />
              <Route path="/marketplace/my-purchases"   element={<MyPurchases />} />
              <Route path="/marketplace/my-sales"       element={<MySales />} />
              <Route path="/learn"                      element={<LearningHub />} />
              <Route path="/market-analysis"            element={<MarketAnalysis />} />
              <Route path="/blockchain"                 element={<Blockchain />} />
              <Route path="/smart-contract"             element={<SmartContractExplorer />} />
              <Route path="/verify"                     element={<VerifyCertificate />} />
              <Route path="/ngja-dashboard"             element={<NGJADashboard />} />
              <Route path="*"                           element={<Home />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;