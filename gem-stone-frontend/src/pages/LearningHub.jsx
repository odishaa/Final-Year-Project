import { useState, useEffect } from 'react';
import { knowledgeAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

/* ─────────────────────────────────────────────
   STATIC ARTICLES — shown when DB is empty
───────────────────────────────────────────── */
const STATIC_ARTICLES = [
  {
    _id: 's1', slug: 'identify-genuine-gemstone',
    category: 'Identification', readTime: 5,
    title: 'How to Identify a Genuine Gemstone',
    summary: 'Learn the key tests and visual cues professionals use to spot authentic gemstones from imitations and synthetics.',
    tags: ['authentication', 'testing', 'buying guide'],
    relatedGemstones: ['Sapphire', 'Ruby', 'Emerald'],
    views: 1240, likes: 87,
    author: { name: 'Dr. K. Perera' },
    publishedAt: '2026-04-10',
    content: `Identifying a genuine gemstone requires a combination of visual inspection, physical tests, and professional tools. Here is what to look for:

Visual Inclusions
Natural gemstones almost always contain inclusions — tiny internal features formed during growth. Under a 10× loupe, sapphires often show silk-like rutile needles, rubies show fingerprint inclusions, and emeralds have a characteristic mossy "jardin." Perfectly clean stones should raise suspicion, as flawless gems are extremely rare in nature.

Refractive Index
Each gemstone species bends light at a unique angle called the refractive index (RI). A refractometer measures this precisely. Blue sapphire reads 1.762–1.770, ruby 1.762–1.778, and emerald 1.565–1.602. Glass imitations and synthetics may fall outside these ranges.

Hardness Test
Gemstone hardness is measured on the Mohs scale. Sapphire and ruby (corundum) rate 9/10, while quartz is only 7/10. A synthetic or glass imitation will scratch more easily. Never perform scratch tests on mounted stones or gem tables — consult a gemologist.

Thermal Conductivity
Genuine diamonds and moissanites conduct heat differently from glass. A thermal probe can distinguish real stones from fakes in seconds. This test is non-destructive and widely used in trade.

UV Fluorescence
Many rubies glow strong red under long-wave UV light due to chromium. Sapphires from different origins show varying fluorescence — Burma rubies glow intensely, while Thai rubies often show little reaction. This is a useful clue to origin, not proof of authenticity alone.

NGJA Certification
The safest way to verify a gemstone is through a certified gemological laboratory report. The National Gem & Jewellery Authority (NGJA) of Sri Lanka provides internationally accepted certificates that confirm species, weight, origin, and treatment status. Always request a current certificate from a reputable lab before any significant purchase.`,
  },
  {
    _id: 's2', slug: 'heat-treatment-explained',
    category: 'Treatment', readTime: 4,
    title: 'Heat Treatment in Gemstones Explained',
    summary: 'Most sapphires and rubies sold today are heat-treated. Understand what it means, how it affects value, and what to ask before buying.',
    tags: ['treatment', 'sapphire', 'ruby', 'value'],
    relatedGemstones: ['Sapphire', 'Ruby'],
    views: 980, likes: 63,
    author: { name: 'Dr. S. Jayawardena' },
    publishedAt: '2026-03-22',
    content: `Heat treatment is the most common enhancement applied to colored gemstones. Understanding it is essential for both buyers and sellers.

What Is Heat Treatment?
Heating gemstones to temperatures between 1,000°C and 1,800°C can dissolve silk inclusions that cause cloudiness, improve color saturation, and remove undesirable tones. For sapphires, heating in a reducing atmosphere can intensify blue color. For rubies, heat removes brownish or purplish secondary hues.

How Common Is It?
Industry estimates suggest that over 90% of sapphires and rubies on the market are heat-treated. This is widely accepted in the trade and does not make a stone "fake." However, full disclosure is required by ethical standards and most laboratory reports.

Effect on Value
A natural, untreated sapphire or ruby of the same quality as a heated one commands a significant premium — often 30% to 300% more depending on size and quality. The NGJA and other labs use advanced spectroscopy and microscopy to determine treatment status and must be noted on any reputable certificate.

What About Diffusion Treatment?
Beryllium diffusion is a more controversial enhancement that adds color deep into the stone's lattice, sometimes creating colors that do not exist naturally. This is considered a more significant treatment and must be disclosed separately. Laboratory testing is the only reliable detection method.

Other Treatments to Know
• Fracture filling: Filling surface-reaching fractures with glass or resin in emeralds ("oiling") and rubies. Reduces visibility of breaks.
• Irradiation: Used on yellow and blue topaz, some diamonds. May fade over time.
• Coating: A thin film applied to the surface — detectable by a gemologist.

Asking the Right Questions
Before purchasing any significant gemstone, always ask: "Does this stone have a current laboratory certificate?" and "Does the certificate disclose any treatments?" A reputable seller will always provide this information willingly.`,
  },
  {
    _id: 's3', slug: 'understanding-ngja-certification',
    category: 'Certification', readTime: 4,
    title: 'Understanding NGJA Certification',
    summary: 'A complete guide to what the National Gem & Jewellery Authority certificate tells you, and why it is the gold standard for Sri Lankan gems.',
    tags: ['NGJA', 'certification', 'certificate', 'Sri Lanka'],
    relatedGemstones: ['Sapphire', 'Ruby', 'Emerald'],
    views: 1560, likes: 114,
    author: { name: 'NGJA Editorial' },
    publishedAt: '2026-04-01',
    content: `The National Gem & Jewellery Authority (NGJA) is the government body of Sri Lanka responsible for certifying, grading, and regulating the gem and jewellery industry.

What the Certificate Confirms
An NGJA certificate verifies: the gemstone species and variety (e.g., "Natural Blue Sapphire, variety corundum"), carat weight measured to two decimal places, geographic origin where determinable (e.g., "Sri Lanka"), treatment status (e.g., "Indications of heating" or "No indications of heating"), and key quality characteristics such as color, clarity, and cut style.

How the Process Works
1. The gem owner submits the stone to an NGJA laboratory counter.
2. A qualified gemologist examines it under magnification, conducts spectroscopic tests, and measures optical properties.
3. A report is issued, typically within 2–5 working days.
4. The certificate carries a unique number, the examining officer's stamp, and a QR code for online verification.

Reading the Certificate
The most important fields to check are: species ("Natural" vs "Synthetic"), treatment ("No indications" commands the highest value), origin (Ceylon origin carries a premium), and weight (verify against the stone you receive).

Why It Matters for Trade
Many international buyers, especially in the Middle East, Europe, and the USA, require NGJA or major lab (GIA, GRS, Gübelin) certificates before purchasing. Certificates protect both buyers and sellers by providing a neutral, authoritative record.

GemChain and Certification
On the GemChain platform, NGJA certification data is recorded on the blockchain at the time of approval, creating an immutable audit trail. The certificate number, certifying officer, and date are hashed into the chain, making any subsequent tampering detectable.`,
  },
  {
    _id: 's4', slug: 'caring-for-precious-gemstones',
    category: 'Care', readTime: 3,
    title: 'How to Care for Your Precious Gemstones',
    summary: 'Practical advice on cleaning, storing, and protecting your gemstone collection to preserve its beauty and value for generations.',
    tags: ['care', 'cleaning', 'storage', 'maintenance'],
    relatedGemstones: ['Sapphire', 'Ruby', 'Emerald', 'Topaz'],
    views: 720, likes: 55,
    author: { name: 'Dr. K. Perera' },
    publishedAt: '2026-03-15',
    content: `Proper care extends the life, brilliance, and value of your gemstones. The care required varies significantly by stone type.

Cleaning at Home
For hard stones (sapphire, ruby, spinel — Mohs 8 or above): warm water, a drop of mild dish soap, and a soft toothbrush are safe and effective. Rinse thoroughly and pat dry with a lint-free cloth. Avoid ultrasonic cleaners for stones with surface-reaching fractures or significant inclusions.

For emeralds: emeralds are frequently oil-treated and should only be wiped with a damp cloth. Ultrasonic cleaners, steam, and solvents can dissolve the filling and damage the stone irreparably.

For opals and pearls: use only a damp cloth. These are porous and very sensitive to chemicals, heat, and even sweat.

Safe Storage
Never store gemstones loose together — harder stones will scratch softer ones. Use individual fabric pouches, a compartmented jewellery box, or wrap each piece in tissue. Keep away from direct sunlight (can fade amethyst, kunzite, and some topaz) and extreme temperature changes.

Chemicals to Avoid
Chlorine (swimming pools, bleach) can damage both gemstones and metal settings. Remove jewellery before swimming, cleaning, or using beauty products. Hairspray, perfume, and sunscreen can leave films that dull brilliance over time. Put jewellery on last and take it off first.

When to See a Professional
Have a jeweller inspect prong settings annually — a lost prong can mean a lost stone. Professional ultrasonic cleaning is safe for most hard, untreated stones and restores brilliance better than home cleaning. Reputable jewellers can also re-oil emeralds and re-polish minor surface scratches.`,
  },
  {
    _id: 's5', slug: 'sri-lanka-gem-mining-heritage',
    category: 'Mining', readTime: 5,
    title: "Sri Lanka's Gem Mining Heritage",
    summary: 'From ancient trade routes to modern artisanal mining, Sri Lanka has been the world\'s premier source of fine sapphires for over 2,500 years.',
    tags: ['Sri Lanka', 'mining', 'history', 'Ratnapura'],
    relatedGemstones: ['Sapphire', 'Ruby', 'Spinel'],
    views: 890, likes: 71,
    author: { name: 'Prof. A. Bandara' },
    publishedAt: '2026-02-28',
    content: `Sri Lanka — historically known as "Ratna Dweepa" (Island of Gems) — has been a primary source of the world's finest sapphires, rubies, and cat's eyes for millennia.

The Ratnapura Region
The word "Ratnapura" translates literally to "City of Gems." Located in Sabaragamuwa Province, this district sits on ancient riverbed deposits called elam — gem-bearing gravel layers formed by alluvial deposition over millions of years. Miners sink pits through overlying clay and soil to reach the elam layer, typically 2–10 metres below the surface.

Traditional Mining Methods
Most Sri Lankan gem mining remains small-scale and artisanal. A typical operation involves 4–10 workers who share a pit, haul gravel in wicker baskets, and wash it through a circular sieve (nambura) in running water. The entire process is remarkably low-tech, unchanged in its fundamentals for centuries.

What Is Found
Sri Lanka produces an extraordinary variety: blue, yellow, pink, and padparadscha sapphires; cat's eye chrysoberyls; spinels; garnets; tourmalines; moonstones; and zircons. The famous "Blue Belle of Asia" (392 carats) and the sapphire in Lady Diana's engagement ring (now Kate Middleton's) originated from Sri Lankan deposits.

Environmental and Social Considerations
Traditional pit mining has a relatively limited environmental footprint compared to open-cast operations elsewhere. Reclaiming pits is required under NGJA regulations. The industry provides livelihoods for tens of thousands of families across Sabaragamuwa Province.

Modern Developments
GPS mapping of gem-bearing zones, hydraulic pumping of groundwater, and spectroscopic sorting are gradually entering the industry. The NGJA's digitisation program — of which GemChain is a part — aims to create traceable, verifiable records from mine pit to consumer.`,
  },
  {
    _id: 's6', slug: 'what-determines-gemstone-value',
    category: 'Pricing', readTime: 4,
    title: 'What Determines a Gemstone\'s Value?',
    summary: 'Color, clarity, cut, carat weight, origin, and treatment status all interact to set price. Here is how professionals assess colored stone value.',
    tags: ['pricing', 'value', 'grading', '4Cs'],
    relatedGemstones: ['Sapphire', 'Ruby', 'Emerald'],
    views: 1100, likes: 92,
    author: { name: 'Dr. S. Jayawardena' },
    publishedAt: '2026-04-05',
    content: `Unlike diamonds, colored gemstone pricing does not follow a single standardised grading scale. Value is determined by the interaction of several factors, each carrying different weight depending on the gem type.

Color — The Most Important Factor
For colored gemstones, color accounts for roughly 50–70% of value. The most prized hues are: "Royal Blue" or "cornflower blue" for sapphires, "pigeon blood" red for rubies, and "vivid green" for emeralds. Gemologists assess hue (dominant color), saturation (intensity), and tone (lightness/darkness). Stones with strong saturation and medium-dark tone command the highest prices.

Clarity
Unlike diamonds, where flawless clarity is the ideal, colored gemstone clarity is evaluated more liberally because inclusions are universal. An eye-clean ruby (no inclusions visible to the naked eye) is exceptionally rare and commands a significant premium. Emeralds are routinely included — "jardin" (garden) inclusions are accepted as part of the stone's character.

Carat Weight
Larger fine-quality colored stones are exponentially rarer than smaller ones. A single 5-carat fine sapphire may be worth five to ten times the price of five 1-carat sapphires of similar quality. "Per-carat price" rises steeply at size thresholds: around 1 ct, 3 ct, 5 ct, and 10 ct.

Origin Premium
Certain geographic origins command a significant market premium regardless of appearance. Burma (Myanmar) rubies, Kashmir sapphires, and Colombian emeralds from specific deposits achieve auction records that comparable stones from other origins cannot match. Sri Lanka (Ceylon) origin adds 20–50% for blue sapphires over generic "heated, origin not determined" stones.

Treatment Status
An unheated blue sapphire with a laboratory certificate stating "no indications of heating" can command 2–5× the price of a heated stone of identical appearance. Treatment-free stones are rarer, and collector and investor demand for them has grown strongly in recent years.`,
  },
  {
    _id: 's7', slug: 'ceylon-sapphires-royal-history',
    category: 'History', readTime: 5,
    title: 'Ceylon Sapphires: A Royal History',
    summary: 'From ancient Persian trade to Princess Diana\'s ring, Ceylon sapphires have adorned the world\'s most famous jewel collections for centuries.',
    tags: ['history', 'sapphire', 'Ceylon', 'royalty'],
    relatedGemstones: ['Sapphire'],
    views: 1380, likes: 108,
    author: { name: 'Prof. A. Bandara' },
    publishedAt: '2026-01-20',
    content: `Sri Lanka has supplied the world with sapphires for at least 2,500 years. Ancient Greek and Roman texts mention "gems from Taprobane" — their name for the island — and traders from Persia, Arabia, and China sought Ceylon stones along the Silk Road.

Ancient Trade
The Periplus of the Erythraean Sea (1st century AD) describes gem merchants from Sri Lanka trading with Rome. Medieval Arab geographer Al-Idrisi wrote that the finest rubies and sapphires came from "Serendib" (the Arab name for Sri Lanka, from which we derive the English word "serendipity"). Marco Polo visited in 1293 and described rubies and sapphires large enough to be "a span in length."

The Mogul Courts
Indian Mogul emperors were among the greatest collectors of Ceylon gems. Aurangzeb's treasury contained sapphires from Sri Lanka described in weight by the "seer." Many historic Mogul pieces now in museum collections contain stones traceable to Sri Lankan origins by their spectroscopic signatures.

The British Colonial Period
British colonial administrators and merchants exported vast quantities of Ceylon sapphires to Europe during the 19th century. The 466-carat "Blue Belle of Asia" — auctioned by Christie's Geneva in 2014 for USD 17.3 million (a per-carat record at the time) — was mined in Sri Lanka in 1926.

Princess Diana's Ring
The most recognised Ceylon sapphire in modern history is the 12-carat oval blue sapphire at the centre of the engagement ring chosen by Prince Charles for Diana Spencer in 1981. Now worn by Catherine, Princess of Wales, this ring has done more to publicise Sri Lankan sapphires globally than any marketing campaign. Following the announcement of Prince William's engagement in 2010, demand for blue sapphires from Sri Lanka increased by an estimated 40% in the following year.

GemChain and Heritage Preservation
By recording origin, ownership history, and certification data on an immutable blockchain, GemChain aims to preserve the provenance story of each Sri Lankan gemstone — connecting future owners to the island's extraordinary geological and cultural heritage.`,
  },
  {
    _id: 's8', slug: 'ethical-sourcing-gemstone-trade',
    category: 'Market Trends', readTime: 4,
    title: 'Ethical Sourcing and Blockchain Traceability',
    summary: 'Consumer demand for transparent, ethical supply chains is reshaping the gem industry. Discover how blockchain technology is meeting this challenge.',
    tags: ['ethics', 'blockchain', 'traceability', 'sustainability'],
    relatedGemstones: ['Sapphire', 'Ruby', 'Emerald'],
    views: 940, likes: 76,
    author: { name: 'NGJA Editorial' },
    publishedAt: '2026-04-20',
    content: `The gemstone industry — long characterised by opacity — is undergoing a transparency revolution driven by consumer demand and new technology.

Why Ethical Sourcing Matters
Conflict gemstones (historically "blood diamonds," but also coloured stones financing armed groups) remain a concern in some regions. Beyond conflict, issues include child labour in artisanal mining, unsafe working conditions, and environmental destruction. Increasing numbers of consumers — particularly millennial and Gen Z buyers — actively seek assurances about the social and environmental footprint of the gems they purchase.

The Traceability Challenge
The traditional gem supply chain passes through many hands: miner → local dealer → cutter → exporter → wholesaler → retailer. At each step, documentation can be lost, altered, or fabricated. Paper-based certificates can be counterfeited or transferred to different stones. The result is that even well-intentioned retailers often cannot verify claims made by their suppliers.

How Blockchain Changes This
A blockchain creates an append-only, cryptographically secured ledger. Each transaction — registration, certification, ownership transfer, listing, sale — is hashed into a block linked to all previous blocks. Any retroactive alteration would break the chain's cryptographic integrity and be immediately detectable.

GemChain's Approach
GemChain records each Sri Lankan gemstone's complete journey: from initial registration (including origin data from the miner), through NGJA certification (confirming authenticity and treatment status), to marketplace listing and ownership transfer. Every step is time-stamped and signed. Future owners can trace a stone's entire history in seconds using the public blockchain explorer.

Market Impact
Several major auction houses now explicitly promote blockchain-provenance lots. Brands including Chopard and Tracr (De Beers) have deployed blockchain solutions for diamonds. The coloured stone segment is following. Analysts project that provenance-verified gemstones will command an increasing premium — estimated at 10–25% — as consumer awareness grows through the late 2020s.`,
  },
];

/* ─────────────────────────────────────────────
   CATEGORY CONFIG
───────────────────────────────────────────── */
const CATEGORIES = ['All', 'Identification', 'Treatment', 'Certification', 'Care', 'Mining', 'Pricing', 'History', 'Market Trends', 'Other'];

const CAT_COLORS = {
  Identification: { dot: '#2e6fb5', bg: '#eaf1fb', border: '#b8d2f5', text: '#1a4a85' },
  Treatment:      { dot: '#b07820', bg: '#fef8ec', border: '#f0d080', text: '#7a5010' },
  Certification:  { dot: '#5a4a9a', bg: '#f2f0fb', border: '#c8c0f0', text: '#3a2a7a' },
  Care:           { dot: '#2a8a6a', bg: '#eaf6f2', border: '#a0d8c8', text: '#1a6a4a' },
  Mining:         { dot: '#4a7a30', bg: '#eef5e8', border: '#b0d898', text: '#2a5a18' },
  Pricing:        { dot: '#9a6a10', bg: '#fdf5e4', border: '#e8c878', text: '#7a4a00' },
  History:        { dot: '#8a3a8a', bg: '#f8eef8', border: '#d8b0d8', text: '#6a1a6a' },
  'Market Trends':{ dot: '#c04050', bg: '#fdeef0', border: '#f0b0b8', text: '#8a1a28' },
  Other:          { dot: '#6a6a6a', bg: '#f2f2f2', border: '#d0d0d0', text: '#3a3a3a' },
};

const catStyle = (cat) => CAT_COLORS[cat] || CAT_COLORS.Other;

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
const fmtDate = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

const estimateRead = (content = '') => {
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
};

/* ─────────────────────────────────────────────
   ARTICLE MODAL
───────────────────────────────────────────── */
const ArticleModal = ({ article, onClose, onLike, liked }) => {
  const cs = catStyle(article.category);

  const paragraphs = (article.content || article.summary || '')
    .split('\n\n')
    .filter(p => p.trim());

  return (
    <>
      <style>{`
        .lh-overlay {
          position: fixed; inset: 0;
          background: rgba(10,10,8,0.6);
          backdrop-filter: blur(6px);
          z-index: 200;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 40px 24px;
          overflow-y: auto;
        }
        .lh-modal {
          background: #fafaf8;
          max-width: 740px;
          width: 100%;
          border: 1px solid #e4e0d8;
          animation: lhSlideUp 0.25s cubic-bezier(0.22,1,0.36,1);
        }
        @keyframes lhSlideUp {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .lh-modal__header {
          padding: 40px 48px 0;
        }
        .lh-modal__close {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 20px;
        }
        .lh-modal__close-btn {
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #9a9490;
          background: none;
          border: 1px solid #e0dbd2;
          padding: 7px 18px;
          cursor: pointer;
          transition: color 0.15s, border-color 0.15s;
        }
        .lh-modal__close-btn:hover { color: #1a1a1a; border-color: #1a1a1a; }
        .lh-modal__cat {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: 'DM Sans', sans-serif;
          font-size: 10.5px;
          font-weight: 500;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          padding: 5px 12px;
          margin-bottom: 18px;
          border: 1px solid;
        }
        .lh-modal__cat-dot {
          width: 6px; height: 6px; border-radius: 50%;
        }
        .lh-modal__title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(1.8rem, 3vw, 2.4rem);
          font-weight: 300;
          color: #1a1a1a;
          line-height: 1.2;
          margin-bottom: 16px;
        }
        .lh-modal__meta {
          display: flex;
          gap: 20px;
          align-items: center;
          font-family: 'DM Sans', sans-serif;
          font-size: 12.5px;
          font-weight: 300;
          color: #9a9490;
          padding-bottom: 24px;
          border-bottom: 1px solid #e8e4dc;
          flex-wrap: wrap;
        }
        .lh-modal__divider { width: 3px; height: 3px; border-radius: 50%; background: #d0ccc4; }
        .lh-modal__body { padding: 32px 48px 48px; }
        .lh-modal__summary {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.2rem;
          font-weight: 300;
          font-style: italic;
          color: #5a5650;
          line-height: 1.7;
          margin-bottom: 32px;
          padding-bottom: 28px;
          border-bottom: 1px solid #ede9e0;
        }
        .lh-modal__content { }
        .lh-modal__section-title {
          font-family: 'DM Sans', sans-serif;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #b8b3aa;
          margin-top: 32px;
          margin-bottom: 10px;
          padding-top: 8px;
          border-top: 1px solid #ede9e0;
        }
        .lh-modal__paragraph {
          font-family: 'DM Sans', sans-serif;
          font-size: 14.5px;
          font-weight: 300;
          color: #2a2a28;
          line-height: 1.85;
          margin-bottom: 20px;
        }
        .lh-modal__footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 48px 28px;
          border-top: 1px solid #e8e4dc;
          gap: 16px;
          flex-wrap: wrap;
        }
        .lh-modal__tags {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .lh-modal__tag {
          font-family: 'DM Sans', sans-serif;
          font-size: 10.5px;
          font-weight: 400;
          color: #6a6560;
          background: #f0ece4;
          border: 1px solid #ddd8d0;
          padding: 4px 12px;
        }
        .lh-modal__like-btn {
          display: flex; align-items: center; gap: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 12.5px;
          font-weight: 400;
          color: #6a6560;
          background: none;
          border: 1px solid #e0dbd2;
          padding: 9px 20px;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .lh-modal__like-btn:hover { border-color: #c04050; color: #c04050; }
        .lh-modal__like-btn--liked { border-color: #c04050; color: #c04050; background: #fdeef0; }
        .lh-modal__like-heart { font-size: 15px; }
        @media (max-width: 640px) {
          .lh-modal__header, .lh-modal__body { padding-left: 24px; padding-right: 24px; }
          .lh-modal__footer { padding-left: 24px; padding-right: 24px; }
        }
      `}</style>
      <div className="lh-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="lh-modal">
          <div className="lh-modal__header">
            <div className="lh-modal__close">
              <button className="lh-modal__close-btn" onClick={onClose}>✕ Close</button>
            </div>
            <div className="lh-modal__cat"
              style={{ color: cs.text, background: cs.bg, borderColor: cs.border }}>
              <span className="lh-modal__cat-dot" style={{ background: cs.dot }} />
              {article.category}
            </div>
            <div className="lh-modal__title">{article.title}</div>
            <div className="lh-modal__meta">
              <span>By {article.author?.name || 'NGJA Expert'}</span>
              <span className="lh-modal__divider" />
              <span>{fmtDate(article.publishedAt)}</span>
              <span className="lh-modal__divider" />
              <span>{article.readTime || estimateRead(article.content)} min read</span>
              <span className="lh-modal__divider" />
              <span>{article.views || 0} views</span>
            </div>
          </div>

          <div className="lh-modal__body">
            {article.summary && (
              <div className="lh-modal__summary">{article.summary}</div>
            )}
            <div className="lh-modal__content">
              {paragraphs.map((p, i) => {
                const isHeading = !p.startsWith('•') && p.length < 60 && !p.includes('.') && i > 0;
                if (isHeading) {
                  return <div key={i} className="lh-modal__section-title">{p}</div>;
                }
                return <p key={i} className="lh-modal__paragraph">{p}</p>;
              })}
            </div>
          </div>

          <div className="lh-modal__footer">
            <div className="lh-modal__tags">
              {(article.tags || []).map(t => (
                <span key={t} className="lh-modal__tag">#{t}</span>
              ))}
            </div>
            <button
              className={`lh-modal__like-btn${liked ? ' lh-modal__like-btn--liked' : ''}`}
              onClick={onLike}
            >
              <span className="lh-modal__like-heart">{liked ? '♥' : '♡'}</span>
              {(article.likes || 0) + (liked ? 1 : 0)} helpful
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

/* ─────────────────────────────────────────────
   ARTICLE CARD
───────────────────────────────────────────── */
const ArticleCard = ({ article, onClick }) => {
  const cs = catStyle(article.category);
  const readTime = article.readTime || estimateRead(article.content);

  return (
    <button className="lh-card" onClick={onClick}>
      <div className="lh-card__top">
        <span className="lh-card__cat"
          style={{ color: cs.text, background: cs.bg, borderColor: cs.border }}>
          <span className="lh-card__cat-dot" style={{ background: cs.dot }} />
          {article.category}
        </span>
        <span className="lh-card__read">{readTime} min</span>
      </div>
      <div className="lh-card__title">{article.title}</div>
      <p className="lh-card__summary">{article.summary}</p>
      <div className="lh-card__gems">
        {(article.relatedGemstones || []).slice(0, 3).map(g => (
          <span key={g} className="lh-card__gem-tag">{g}</span>
        ))}
      </div>
      <div className="lh-card__footer">
        <span className="lh-card__author">{article.author?.name || 'NGJA Expert'}</span>
        <div className="lh-card__stats">
          <span>{article.views || 0} views</span>
          <span className="lh-card__stat-dot" />
          <span>♥ {article.likes || 0}</span>
        </div>
      </div>
    </button>
  );
};

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
const LearningHub = () => {
  const { isAuthenticated } = useAuth();
  const [apiArticles, setApiArticles]     = useState([]);
  const [loading, setLoading]             = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch]               = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [likedIds, setLikedIds]           = useState(new Set());

  useEffect(() => {
    (async () => {
      try {
        const res = await knowledgeAPI.getAll({ limit: 50 });
        setApiArticles(res.data.data.articles || []);
      } catch {
        setApiArticles([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const articles = apiArticles.length > 0 ? apiArticles : STATIC_ARTICLES;

  const filtered = articles.filter(a => {
    const matchCat = activeCategory === 'All' || a.category === activeCategory;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      a.title.toLowerCase().includes(q) ||
      (a.summary || '').toLowerCase().includes(q) ||
      (a.tags || []).some(t => t.toLowerCase().includes(q));
    return matchCat && matchSearch;
  });

  const handleLike = async () => {
    if (!selectedArticle) return;
    const id = selectedArticle._id;
    if (likedIds.has(id)) return;
    setLikedIds(prev => new Set([...prev, id]));
    if (isAuthenticated && !id.startsWith('s')) {
      try { await knowledgeAPI.like(id); } catch { /* silent */ }
    }
  };

  const totalByCategory = (cat) =>
    articles.filter(a => cat === 'All' || a.category === cat).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300&family=DM+Sans:wght@300;400;500&display=swap');

        .lh-root {
          font-family: 'DM Sans', sans-serif;
          background: #fafaf8;
          min-height: 100vh;
        }

        /* ── Hero ── */
        .lh-hero {
          background: #111110;
          padding: 72px 48px 64px;
          text-align: center;
        }
        .lh-hero__eyebrow {
          font-size: 10.5px;
          font-weight: 500;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: #6a6560;
          margin-bottom: 20px;
        }
        .lh-hero__title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2.4rem, 5vw, 3.8rem);
          font-weight: 300;
          color: #f5f0e8;
          line-height: 1.1;
          margin-bottom: 18px;
          letter-spacing: -0.01em;
        }
        .lh-hero__title em {
          font-style: italic;
          color: #c8b890;
        }
        .lh-hero__sub {
          font-size: 14.5px;
          font-weight: 300;
          color: #6a6560;
          max-width: 520px;
          margin: 0 auto 36px;
          line-height: 1.7;
        }
        .lh-hero__stats {
          display: flex;
          justify-content: center;
          gap: 48px;
          flex-wrap: wrap;
        }
        .lh-hero__stat-val {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2rem;
          font-weight: 400;
          color: #c8b890;
          display: block;
          line-height: 1;
          margin-bottom: 4px;
        }
        .lh-hero__stat-label {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #4a4a48;
        }

        /* ── Controls ── */
        .lh-controls {
          background: #ffffff;
          border-bottom: 1px solid #e8e4dc;
          position: sticky;
          top: 64px;
          z-index: 40;
        }
        .lh-controls__inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 48px;
        }
        .lh-search-row {
          padding: 20px 0 0;
        }
        .lh-search-wrap {
          position: relative;
          max-width: 440px;
        }
        .lh-search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #b8b3aa;
          font-size: 14px;
          pointer-events: none;
        }
        .lh-search {
          font-family: 'DM Sans', sans-serif;
          font-size: 13.5px;
          font-weight: 300;
          color: #1a1a1a;
          background: #fafaf8;
          border: 1px solid #e0dbd2;
          padding: 11px 14px 11px 38px;
          width: 100%;
          outline: none;
          transition: border-color 0.15s;
        }
        .lh-search:focus { border-color: #1a1a1a; }
        .lh-search::placeholder { color: #c0bbb4; }

        .lh-cats {
          display: flex;
          gap: 0;
          overflow-x: auto;
          padding: 16px 0;
          scrollbar-width: none;
        }
        .lh-cats::-webkit-scrollbar { display: none; }
        .lh-cat-btn {
          font-family: 'DM Sans', sans-serif;
          font-size: 11.5px;
          font-weight: 400;
          letter-spacing: 0.06em;
          color: #8a8580;
          background: none;
          border: none;
          padding: 8px 16px;
          cursor: pointer;
          white-space: nowrap;
          border-bottom: 2px solid transparent;
          transition: color 0.15s, border-color 0.15s;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .lh-cat-btn:hover { color: #1a1a1a; }
        .lh-cat-btn--active { color: #1a1a1a; border-bottom-color: #1a1a1a; font-weight: 500; }
        .lh-cat-count {
          font-size: 10px;
          color: #c8c3ba;
          font-weight: 300;
        }
        .lh-cat-btn--active .lh-cat-count { color: #8a8580; }

        /* ── Grid ── */
        .lh-body {
          max-width: 1200px;
          margin: 0 auto;
          padding: 48px 48px 96px;
        }
        .lh-results-label {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #b8b3aa;
          margin-bottom: 28px;
        }
        .lh-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: #e4e0d8;
          border: 1px solid #e4e0d8;
        }

        /* ── Card ── */
        .lh-card {
          background: #ffffff;
          padding: 32px 28px 24px;
          text-align: left;
          border: none;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 0;
          transition: background 0.18s;
          width: 100%;
        }
        .lh-card:hover { background: #fdfcfa; }
        .lh-card__top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        .lh-card__cat {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          padding: 4px 10px;
          border: 1px solid;
        }
        .lh-card__cat-dot {
          width: 5px; height: 5px; border-radius: 50%;
        }
        .lh-card__read {
          font-size: 11px;
          font-weight: 300;
          color: #b8b3aa;
        }
        .lh-card__title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.3rem;
          font-weight: 400;
          color: #1a1a1a;
          line-height: 1.3;
          margin-bottom: 12px;
        }
        .lh-card__summary {
          font-size: 13px;
          font-weight: 300;
          color: #7a7570;
          line-height: 1.65;
          margin-bottom: 18px;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          flex: 1;
        }
        .lh-card__gems {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          margin-bottom: 20px;
        }
        .lh-card__gem-tag {
          font-size: 10px;
          font-weight: 400;
          color: #8a8580;
          background: #f5f2ec;
          border: 1px solid #e8e4dc;
          padding: 3px 9px;
        }
        .lh-card__footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 16px;
          border-top: 1px solid #f0ece4;
        }
        .lh-card__author {
          font-size: 12px;
          font-weight: 400;
          color: #9a9490;
        }
        .lh-card__stats {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11.5px;
          font-weight: 300;
          color: #b8b3aa;
        }
        .lh-card__stat-dot {
          width: 2px; height: 2px;
          border-radius: 50%; background: #d0ccc4;
        }

        /* ── Empty / Loading ── */
        .lh-empty {
          grid-column: 1/-1;
          background: #ffffff;
          padding: 80px 40px;
          text-align: center;
        }
        .lh-empty__title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.6rem;
          font-weight: 300;
          color: #1a1a1a;
          margin-bottom: 8px;
        }
        .lh-empty__sub {
          font-size: 13px;
          font-weight: 300;
          color: #8a8580;
        }
        .lh-loading {
          grid-column: 1/-1;
          padding: 80px 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        .lh-spinner {
          width: 32px; height: 32px;
          border: 2px solid #e4e0d8;
          border-top-color: #1a1a1a;
          border-radius: 50%;
          animation: lhSpin 0.7s linear infinite;
        }
        @keyframes lhSpin { to { transform: rotate(360deg); } }
        .lh-loading-text {
          font-size: 13px; font-weight: 300; color: #9a9490; letter-spacing: 0.06em;
        }

        /* ── Responsive ── */
        @media (max-width: 960px) {
          .lh-grid { grid-template-columns: repeat(2, 1fr); }
          .lh-hero, .lh-controls__inner, .lh-body { padding-left: 32px; padding-right: 32px; }
        }
        @media (max-width: 600px) {
          .lh-grid { grid-template-columns: 1fr; }
          .lh-hero { padding: 48px 20px 40px; }
          .lh-controls__inner, .lh-body { padding-left: 20px; padding-right: 20px; }
          .lh-hero__stats { gap: 28px; }
        }
      `}</style>

      <div className="lh-root">

        {/* Hero */}
        <div className="lh-hero">
          <div className="lh-hero__eyebrow">GemChain Knowledge</div>
          <h1 className="lh-hero__title">The <em>Learning Hub</em></h1>
          <p className="lh-hero__sub">
            Expert guides on gemstone identification, treatment, certification,
            care, and the rich heritage of Sri Lankan gems.
          </p>
          <div className="lh-hero__stats">
            <div>
              <span className="lh-hero__stat-val">{articles.length}</span>
              <span className="lh-hero__stat-label">Articles</span>
            </div>
            <div>
              <span className="lh-hero__stat-val">{CATEGORIES.length - 1}</span>
              <span className="lh-hero__stat-label">Topics</span>
            </div>
            <div>
              <span className="lh-hero__stat-val">
                {articles.reduce((s, a) => s + (a.readTime || estimateRead(a.content)), 0)}
              </span>
              <span className="lh-hero__stat-label">Min of reading</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="lh-controls">
          <div className="lh-controls__inner">
            <div className="lh-search-row">
              <div className="lh-search-wrap">
                <span className="lh-search-icon">⌕</span>
                <input
                  className="lh-search"
                  type="text"
                  placeholder="Search articles, topics, gemstones…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="lh-cats">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  className={`lh-cat-btn${activeCategory === cat ? ' lh-cat-btn--active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                  <span className="lh-cat-count">{totalByCategory(cat)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="lh-body">
          <div className="lh-results-label">
            {filtered.length} {filtered.length === 1 ? 'article' : 'articles'}
            {activeCategory !== 'All' && ` in ${activeCategory}`}
            {search && ` matching "${search}"`}
          </div>

          <div className="lh-grid">
            {loading ? (
              <div className="lh-loading">
                <div className="lh-spinner" />
                <span className="lh-loading-text">Loading articles…</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="lh-empty">
                <div className="lh-empty__title">No articles found</div>
                <p className="lh-empty__sub">Try a different search term or category.</p>
              </div>
            ) : (
              filtered.map(article => (
                <ArticleCard
                  key={article._id}
                  article={article}
                  onClick={() => setSelectedArticle(article)}
                />
              ))
            )}
          </div>
        </div>

      </div>

      {/* Article modal */}
      {selectedArticle && (
        <ArticleModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
          onLike={handleLike}
          liked={likedIds.has(selectedArticle._id)}
        />
      )}
    </>
  );
};

export default LearningHub;
