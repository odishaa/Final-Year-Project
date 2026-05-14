import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const GEM_PALETTES = {
  Sapphire: { base: 0x1050d0, emissive: 0x061040, specular: 0xaaccff, light: 0x5588ee },
  Ruby:     { base: 0xcc1515, emissive: 0x3a0000, specular: 0xffaaaa, light: 0xee4444 },
  Emerald:  { base: 0x0a7a30, emissive: 0x012a10, specular: 0x88ffbb, light: 0x22cc66 },
  Topaz:    { base: 0xd47800, emissive: 0x3a1a00, specular: 0xffe090, light: 0xffaa22 },
  Garnet:   { base: 0x900030, emissive: 0x280010, specular: 0xffaacc, light: 0xcc2255 },
  Amethyst: { base: 0x7010b0, emissive: 0x1a0030, specular: 0xddaaff, light: 0xaa44ee },
  Diamond:  { base: 0x88bbdd, emissive: 0x112233, specular: 0xffffff, light: 0xbbddff },
  default:  { base: 0x1050d0, emissive: 0x061040, specular: 0xaaccff, light: 0x5588ee },
};

/*
  Build a brilliant-cut gem using LatheGeometry.
  LatheGeometry revolves a 2D profile (x, y points) around the Y axis.
  Profile (x = radius, y = height):
    - Start at culet (tip, bottom)
    - Widen out through pavilion
    - Hit girdle (widest point)
    - Narrow to crown
    - Hit table edge
  Then a flat table cap is added separately.
*/
function buildGem(segments = 32) {
  // Profile points [radius, y] — bottom tip → girdle → table edge
  const profile = [
    [0.000,  -0.620],   // culet (pointed bottom)
    [0.200,  -0.500],   // pavilion lower
    [0.480,  -0.260],   // pavilion mid
    [0.640,  -0.060],   // pavilion upper
    [0.720,   0.000],   // girdle (widest)
    [0.680,   0.080],   // crown lower
    [0.580,   0.240],   // crown mid
    [0.440,   0.380],   // crown upper / bezel
    [0.320,   0.500],   // table edge
  ];

  const points = profile.map(([r, y]) => new THREE.Vector2(r, y));
  const geo = new THREE.LatheGeometry(points, segments);
  geo.computeVertexNormals();

  // Table cap — simple circle at the top
  const tableGeo = new THREE.CircleGeometry(0.320, segments);
  tableGeo.translate(0, 0.500, 0);
  tableGeo.rotateX(-Math.PI / 2);
  tableGeo.computeVertexNormals();

  // Merge both into one BufferGeometry
  const merged = mergeGeos([geo, tableGeo]);
  return merged;
}

function mergeGeos(geos) {
  // Simple merge: concatenate positions + indices
  let totalVerts = 0;
  const posArrays = [];
  const idxArrays = [];

  for (const g of geos) {
    posArrays.push(g.attributes.position.array);
    if (g.index) {
      idxArrays.push({ arr: g.index.array, offset: totalVerts });
    } else {
      // non-indexed: generate sequential indices
      const count = g.attributes.position.count;
      const seq = new Uint32Array(count);
      for (let i = 0; i < count; i++) seq[i] = i;
      idxArrays.push({ arr: seq, offset: totalVerts });
    }
    totalVerts += g.attributes.position.count;
  }

  const totalPos = posArrays.reduce((s, a) => s + a.length, 0);
  const mergedPos = new Float32Array(totalPos);
  let posOffset = 0;
  for (const arr of posArrays) {
    mergedPos.set(arr, posOffset);
    posOffset += arr.length;
  }

  const totalIdx = idxArrays.reduce((s, { arr }) => s + arr.length, 0);
  const mergedIdx = new Uint32Array(totalIdx);
  let idxOffset = 0;
  for (const { arr, offset } of idxArrays) {
    for (let i = 0; i < arr.length; i++) {
      mergedIdx[idxOffset++] = arr[i] + offset;
    }
  }

  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(mergedPos, 3));
  out.setIndex(new THREE.BufferAttribute(mergedIdx, 1));
  out.computeVertexNormals();
  return out;
}

const GemCanvas = ({ gemType = 'default' }) => {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const W = mount.clientWidth  || 280;
    const H = mount.clientHeight || 200;

    /* ── Renderer ── */
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.setClearColor(0x080808, 1);
    mount.appendChild(renderer.domElement);

    /* ── Scene & Camera ── */
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x080808);

    // Add a very subtle radial gradient feeling via a large sphere backdrop
    const bgSphere = new THREE.Mesh(
      new THREE.SphereGeometry(12, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0x0d0d0d, side: THREE.BackSide })
    );
    scene.add(bgSphere);

    const camera = new THREE.PerspectiveCamera(36, W / H, 0.1, 100);
    camera.position.set(0, 0.15, 3.2);
    camera.lookAt(0, -0.05, 0);

    /* ── Palette ── */
    const pal = GEM_PALETTES[gemType] || GEM_PALETTES.default;

    /* ── Lights ── */
    scene.add(new THREE.AmbientLight(0xffffff, 0.12));

    // Main key — top-right, white, strong
    const key = new THREE.DirectionalLight(0xffffff, 3.5);
    key.position.set(2.5, 5, 3);
    scene.add(key);

    // Fill — soft gem colour
    const fill = new THREE.DirectionalLight(pal.light, 1.2);
    fill.position.set(-3, 0, 2);
    scene.add(fill);

    // Back rim
    const back = new THREE.DirectionalLight(pal.light, 0.8);
    back.position.set(0, -2, -3);
    scene.add(back);

    // Orbiting under-point (creates fire / scintillation)
    const fire = new THREE.PointLight(pal.light, 3.5, 6);
    fire.position.set(0, -2, 1);
    scene.add(fire);

    // Top flash (table facet catch)
    const flash = new THREE.PointLight(0xffffff, 2.0, 5);
    flash.position.set(0.5, 3, 0.5);
    scene.add(flash);

    /* ── Gem ── */
    const gemGeo = buildGem(48);

    // Primary gem material — MeshPhongMaterial with high shininess
    const gemMat = new THREE.MeshPhongMaterial({
      color:    new THREE.Color(pal.base),
      emissive: new THREE.Color(pal.emissive),
      emissiveIntensity: 0.4,
      specular: new THREE.Color(pal.specular),
      shininess: 280,
      transparent: true,
      opacity: 0.92,
      side: THREE.DoubleSide,
    });
    const gem = new THREE.Mesh(gemGeo, gemMat);
    scene.add(gem);

    // Glass sheen overlay
    const sheenMat = new THREE.MeshPhongMaterial({
      color:    new THREE.Color(pal.specular),
      specular: new THREE.Color(0xffffff),
      shininess: 500,
      transparent: true,
      opacity: 0.10,
      side: THREE.FrontSide,
      depthWrite: false,
    });
    const sheen = new THREE.Mesh(gemGeo, sheenMat);
    sheen.scale.setScalar(1.004);
    scene.add(sheen);

    /* ── Girdle glow line ── */
    const girdleGeo = new THREE.TorusGeometry(0.724, 0.009, 6, 80);
    const girdleMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(pal.specular),
      transparent: true,
      opacity: 0.45,
    });
    const girdle = new THREE.Mesh(girdleGeo, girdleMat);
    girdle.rotation.x = Math.PI / 2;
    scene.add(girdle);

    /* ── Sparkle stars ── */
    const starCount = 50;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      const r     = 1.3 + Math.random() * 0.9;
      starPos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.7;
      starPos[i * 3 + 2] = r * Math.cos(phi);
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: new THREE.Color(pal.specular),
      size: 0.025, transparent: true, opacity: 0.5, sizeAttenuation: true,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    /* ── Animate ── */
    let frameId;
    let t = 0;
    const group = new THREE.Group();
    group.add(gem, sheen, girdle, stars);
    scene.add(group);
    // Remove individually added meshes — they're in group now
    scene.remove(gem, sheen, girdle, stars);

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      t += 0.012;

      group.rotation.y += 0.007;
      group.rotation.x  = Math.sin(t * 0.38) * 0.08;
      group.position.y  = Math.sin(t * 0.55) * 0.05;

      gemMat.emissiveIntensity = 0.35 + Math.sin(t * 1.2) * 0.12;

      // Orbit fire light under gem
      fire.position.x = Math.sin(t * 0.9) * 1.8;
      fire.position.z = Math.cos(t * 0.9) * 1.8;
      fire.position.y = -1.5 + Math.sin(t * 1.3) * 0.4;

      renderer.render(scene, camera);
    };
    animate();

    /* ── Cleanup ── */
    return () => {
      cancelAnimationFrame(frameId);
      renderer.dispose();
      gemGeo.dispose(); gemMat.dispose();
      sheenMat.dispose();
      girdleGeo.dispose(); girdleMat.dispose();
      starGeo.dispose(); starMat.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, [gemType]);

  return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />;
};

export default GemCanvas;