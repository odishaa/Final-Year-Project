/*
  GemIllustration — pure SVG, per-type colour, animated shimmer.
  Drop-in replacement for GemCanvas. No Three.js dependency.
*/

const GEMS = {
  Sapphire: {
    bg:      ['#0a1a4a', '#0d2a7a'],
    facets: {
      table:   '#2255cc',
      crownL:  '#1a44bb',
      crownR:  '#1038a0',
      bezelTL: '#2a66dd',
      bezelTR: '#0e2e8a',
      bezelBL: '#1848cc',
      bezelBR: '#0c2880',
      pavL:    '#0d2a7a',
      pavR:    '#071850',
      pavM:    '#0a2060',
      girdle:  '#3366ee',
      shine:   'rgba(180,210,255,0.55)',
      sparkle: '#aaccff',
    },
  },
  Ruby: {
    bg:      ['#3a0808', '#1a0202'],
    facets: {
      table:   '#cc2020',
      crownL:  '#bb1818',
      crownR:  '#991010',
      bezelTL: '#dd2828',
      bezelTR: '#880c0c',
      bezelBL: '#bb1818',
      bezelBR: '#771010',
      pavL:    '#881010',
      pavR:    '#550808',
      pavM:    '#660c0c',
      girdle:  '#ee3333',
      shine:   'rgba(255,180,180,0.55)',
      sparkle: '#ffaaaa',
    },
  },
  Emerald: {
    bg:      ['#031a0a', '#021208'],
    facets: {
      table:   '#0d8c3a',
      crownL:  '#0a7030',
      crownR:  '#085a26',
      bezelTL: '#12a044',
      bezelTR: '#07501e',
      bezelBL: '#0a7030',
      bezelBR: '#064018',
      pavL:    '#065520',
      pavR:    '#043010',
      pavM:    '#054a1a',
      girdle:  '#18c055',
      shine:   'rgba(140,255,180,0.5)',
      sparkle: '#88ffbb',
    },
  },
  Topaz: {
    bg:      ['#2a1400', '#1a0c00'],
    facets: {
      table:   '#e08000',
      crownL:  '#c87000',
      crownR:  '#a85800',
      bezelTL: '#f09010',
      bezelTR: '#944c00',
      bezelBL: '#c06800',
      bezelBR: '#804000',
      pavL:    '#a05800',
      pavR:    '#603200',
      pavM:    '#804800',
      girdle:  '#ffaa20',
      shine:   'rgba(255,220,130,0.55)',
      sparkle: '#ffe090',
    },
  },
  Garnet: {
    bg:      ['#1e0010', '#120008'],
    facets: {
      table:   '#aa1040',
      crownL:  '#960d38',
      crownR:  '#780828',
      bezelTL: '#c01448',
      bezelTR: '#6a0620',
      bezelBL: '#900c35',
      bezelBR: '#580418',
      pavL:    '#780828',
      pavR:    '#440410',
      pavM:    '#5e0620',
      girdle:  '#dd2060',
      shine:   'rgba(255,160,200,0.5)',
      sparkle: '#ffaacc',
    },
  },
  Amethyst: {
    bg:      ['#18003a', '#0e0025'],
    facets: {
      table:   '#8020cc',
      crownL:  '#6e18b0',
      crownR:  '#560e90',
      bezelTL: '#9430dd',
      bezelTR: '#4c0a7a',
      bezelBL: '#6c16aa',
      bezelBR: '#400870',
      pavL:    '#540e90',
      pavR:    '#320660',
      pavM:    '#440a78',
      girdle:  '#aa44ee',
      shine:   'rgba(210,160,255,0.55)',
      sparkle: '#ddaaff',
    },
  },
  Diamond: {
    bg:      ['#0a1a2a', '#060e18'],
    facets: {
      table:   '#aaccee',
      crownL:  '#88aad4',
      crownR:  '#6688b8',
      bezelTL: '#cce0f8',
      bezelTR: '#5577aa',
      bezelBL: '#88aad0',
      bezelBR: '#446699',
      pavL:    '#668ab8',
      pavR:    '#3a5880',
      pavM:    '#4d6e99',
      girdle:  '#ddeeff',
      shine:   'rgba(220,240,255,0.7)',
      sparkle: '#eef8ff',
    },
  },
  default: {
    bg:      ['#0a1a4a', '#0d2a7a'],
    facets: {
      table:   '#2255cc',
      crownL:  '#1a44bb',
      crownR:  '#1038a0',
      bezelTL: '#2a66dd',
      bezelTR: '#0e2e8a',
      bezelBL: '#1848cc',
      bezelBR: '#0c2880',
      pavL:    '#0d2a7a',
      pavR:    '#071850',
      pavM:    '#0a2060',
      girdle:  '#3366ee',
      shine:   'rgba(180,210,255,0.55)',
      sparkle: '#aaccff',
    },
  },
};

// Unique animation id per instance
let _uid = 0;

const GemIllustration = ({ gemType = 'default' }) => {
  const uid = `gem-${++_uid}`;
  const g = GEMS[gemType] || GEMS.default;
  const f = g.facets;

  /*
    Brilliant-cut gem drawn as a flat SVG in a 260×200 viewBox.
    Centre: (130, 102)

    Layout (top → bottom):
      Table (flat top hexagon)     y ≈ 42
      Crown facets                 y ≈ 42 → 85
      Girdle line                  y ≈ 85
      Pavilion facets              y ≈ 85 → 168
      Culet point                  y ≈ 168

    All coordinates hand-tuned for a classic round-brilliant silhouette.
  */

  // Key points
  const cx = 130, tableY = 44, girdleY = 88, culetY = 168;
  const tableW = 46;   // half-width of table
  const girdleW = 82;  // half-width at girdle

  // Table octagon (8 pts)
  const tbl = [
    [cx - tableW,     tableY + 12],
    [cx - tableW + 12, tableY],
    [cx + tableW - 12, tableY],
    [cx + tableW,     tableY + 12],
    [cx + tableW,     tableY + 28],
    [cx + tableW - 12, tableY + 40],
    [cx - tableW + 12, tableY + 40],
    [cx - tableW,     tableY + 28],
  ];
  const tblPoly = tbl.map(p => p.join(',')).join(' ');

  // Girdle — ellipse-ish, represented as a wide octagon
  const grd = [
    [cx - girdleW,      girdleY + 8],
    [cx - girdleW + 12, girdleY],
    [cx + girdleW - 12, girdleY],
    [cx + girdleW,      girdleY + 8],
    [cx + girdleW,      girdleY + 18],
    [cx + girdleW - 12, girdleY + 26],
    [cx - girdleW + 12, girdleY + 26],
    [cx - girdleW,      girdleY + 18],
  ];
  const grdPoly = grd.map(p => p.join(',')).join(' ');

  // Crown left bezel (table left edge → girdle left)
  const crownL = `${tbl[0][0]},${tbl[0][1]} ${tbl[7][0]},${tbl[7][1]} ${grd[7][0]},${grd[7][1]} ${grd[0][0]},${grd[0][1]}`;
  const crownR = `${tbl[3][0]},${tbl[3][1]} ${tbl[4][0]},${tbl[4][1]} ${grd[4][0]},${grd[4][1]} ${grd[3][0]},${grd[3][1]}`;
  const crownTL = `${tbl[1][0]},${tbl[1][1]} ${tbl[0][0]},${tbl[0][1]} ${grd[0][0]},${grd[0][1]} ${grd[1][0]},${grd[1][1]}`;
  const crownTR = `${tbl[2][0]},${tbl[2][1]} ${tbl[3][0]},${tbl[3][1]} ${grd[3][0]},${grd[3][1]} ${grd[2][0]},${grd[2][1]}`;
  const crownBL = `${tbl[7][0]},${tbl[7][1]} ${tbl[6][0]},${tbl[6][1]} ${grd[6][0]},${grd[6][1]} ${grd[7][0]},${grd[7][1]}`;
  const crownBR = `${tbl[4][0]},${tbl[4][1]} ${tbl[5][0]},${tbl[5][1]} ${grd[5][0]},${grd[5][1]} ${grd[4][0]},${grd[4][1]}`;

  // Pavilion (girdle → culet point)
  const pavL  = `${grd[7][0]},${grd[7][1]} ${grd[0][0]},${grd[0][1]} ${cx},${culetY}`;
  const pavR  = `${grd[3][0]},${grd[3][1]} ${grd[4][0]},${grd[4][1]} ${cx},${culetY}`;
  const pavTL = `${grd[6][0]},${grd[6][1]} ${grd[7][0]},${grd[7][1]} ${cx},${culetY}`;
  const pavTR = `${grd[4][0]},${grd[4][1]} ${grd[5][0]},${grd[5][1]} ${cx},${culetY}`;
  const pavML = `${grd[0][0]},${grd[0][1]} ${grd[1][0]},${grd[1][1]} ${cx},${culetY}`;
  const pavMR = `${grd[2][0]},${grd[2][1]} ${grd[3][0]},${grd[3][1]} ${cx},${culetY}`;
  const pavBot = `${grd[1][0]},${grd[1][1]} ${grd[2][0]},${grd[2][1]} ${cx},${culetY}`;
  const pavTop = `${grd[5][0]},${grd[5][1]} ${grd[6][0]},${grd[6][1]} ${cx},${culetY}`;

  // Shine highlight (top-left of table)
  const shineX = cx - tableW + 6;
  const shineY2 = tableY + 4;

  const bgId   = `bg-${uid}`;
  const shimId = `shim-${uid}`;

  return (
    <svg
      viewBox="0 0 260 200"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <defs>
        {/* Background radial */}
        <radialGradient id={bgId} cx="50%" cy="40%" r="60%">
          <stop offset="0%"   stopColor={g.bg[0]} />
          <stop offset="100%" stopColor={g.bg[1]} />
        </radialGradient>

        {/* Shimmer sweep animation */}
        <linearGradient id={shimId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="white" stopOpacity="0" />
          <stop offset="45%"  stopColor="white" stopOpacity="0" />
          <stop offset="50%"  stopColor="white" stopOpacity="0.18" />
          <stop offset="55%"  stopColor="white" stopOpacity="0" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
          <animateTransform
            attributeName="gradientTransform"
            type="translate"
            from="-1 0" to="2 0"
            dur="3.2s"
            repeatCount="indefinite"
          />
        </linearGradient>

        {/* Clip to gem silhouette */}
        <clipPath id={`clip-${uid}`}>
          <polygon points={grdPoly} />
          <polygon points={`${grd[0][0]},${grd[0][1]} ${grd[3][0]},${grd[3][1]} ${grd[4][0]},${grd[4][1]} ${grd[7][0]},${grd[7][1]}`} />
        </clipPath>
      </defs>

      {/* Background */}
      <rect width="260" height="200" fill={`url(#${bgId})`} />

      {/* Subtle scattered sparkles */}
      {[
        [28, 30], [220, 25], [15, 120], [240, 110],
        [50, 170], [200, 175], [130, 18], [70, 60], [190, 55],
      ].map(([sx, sy], i) => (
        <circle key={i} cx={sx} cy={sy} r="1.2" fill={f.sparkle} opacity="0.5">
          <animate attributeName="opacity" values="0.5;0.05;0.5" dur={`${2.5 + i * 0.4}s`} repeatCount="indefinite" />
        </circle>
      ))}

      {/* ── Pavilion (bottom half, drawn first / behind) ── */}
      <polygon points={pavTop} fill={f.pavL}    opacity="0.88" />
      <polygon points={pavTL}  fill={f.pavM}    opacity="0.88" />
      <polygon points={pavL}   fill={f.pavL}    opacity="0.92" />
      <polygon points={pavML}  fill={f.pavM}    opacity="0.88" />
      <polygon points={pavBot} fill={f.pavR}    opacity="0.80" />
      <polygon points={pavMR}  fill={f.pavM}    opacity="0.88" />
      <polygon points={pavR}   fill={f.pavR}    opacity="0.92" />
      <polygon points={pavTR}  fill={f.pavR}    opacity="0.88" />

      {/* Culet dot */}
      <circle cx={cx} cy={culetY} r="2.5" fill={f.sparkle} opacity="0.7" />

      {/* ── Girdle stroke ── */}
      <polygon points={grdPoly} fill="none" stroke={f.girdle} strokeWidth="1.2" opacity="0.7" />

      {/* ── Crown facets ── */}
      <polygon points={crownTL} fill={f.bezelTL} opacity="0.92" />
      <polygon points={crownL}  fill={f.crownL}  opacity="0.95" />
      <polygon points={crownBL} fill={f.bezelBL} opacity="0.88" />
      <polygon points={crownBR} fill={f.bezelBR} opacity="0.88" />
      <polygon points={crownR}  fill={f.crownR}  opacity="0.95" />
      <polygon points={crownTR} fill={f.bezelTR} opacity="0.92" />

      {/* Crown facet edges */}
      {[crownTL, crownL, crownBL, crownBR, crownR, crownTR].map((pts, i) => (
        <polygon key={i} points={pts} fill="none"
          stroke="rgba(255,255,255,0.08)" strokeWidth="0.6" />
      ))}

      {/* ── Table ── */}
      <polygon points={tblPoly} fill={f.table} />
      <polygon points={tblPoly} fill="none"
        stroke="rgba(255,255,255,0.18)" strokeWidth="0.8" />

      {/* Table inner lines (facet detail) */}
      <line x1={tbl[0][0]} y1={tbl[0][1]} x2={cx} y2={tableY + 20}
        stroke="rgba(255,255,255,0.10)" strokeWidth="0.7" />
      <line x1={tbl[3][0]} y1={tbl[3][1]} x2={cx} y2={tableY + 20}
        stroke="rgba(255,255,255,0.10)" strokeWidth="0.7" />
      <line x1={tbl[5][0]} y1={tbl[5][1]} x2={cx} y2={tableY + 20}
        stroke="rgba(255,255,255,0.10)" strokeWidth="0.7" />
      <line x1={tbl[7][0]} y1={tbl[7][1]} x2={cx} y2={tableY + 20}
        stroke="rgba(255,255,255,0.10)" strokeWidth="0.7" />

      {/* ── Shine highlight (top-left) ── */}
      <ellipse
        cx={shineX + 18} cy={shineY2 + 12}
        rx="20" ry="12"
        fill={f.shine}
        transform={`rotate(-30, ${shineX + 18}, ${shineY2 + 12})`}
      >
        <animate attributeName="opacity" values="0.9;0.5;0.9" dur="4s" repeatCount="indefinite" />
      </ellipse>

      {/* ── Shimmer sweep overlay ── */}
      <polygon points={tblPoly}  fill={`url(#${shimId})`} opacity="0.8" />
      {[crownTL, crownL, crownBL, crownR, crownTR].map((pts, i) => (
        <polygon key={i} points={pts} fill={`url(#${shimId})`} opacity="0.6" />
      ))}

      {/* ── Outer silhouette stroke ── */}
      <polygon
        points={grdPoly}
        fill="none"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="1"
      />
    </svg>
  );
};

export default GemIllustration;