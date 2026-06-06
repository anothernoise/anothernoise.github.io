/**
 * background.js — Three.js animated data-network background.
 *
 * Renders a living data ecosystem graph:
 *   OLTP Sources (blue) → Data Lake (teal) → Analytics DW (amber) → AI/ML (violet)
 *
 * Design:
 *   - 4 node clusters matching data pipeline stages
 *   - Animated data packets flow along edges
 *   - Hub nodes have pulsing aura rings
 *   - Slow Y-axis auto-rotation + mouse-follow tilt
 *   - Tab-visibility pause for battery life
 *   - Only visible in dark mode (CSS controls display)
 */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.163.0/build/three.module.min.js';

function lerp(a, b, t) { return a + (b - a) * t; }

(function init() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  // Graceful WebGL fallback
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true });
  } catch (_) { return; }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);  // fully transparent clear — body/html provides the bg

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    55, window.innerWidth / window.innerHeight, 0.1, 500
  );
  camera.position.set(0, 4, 62);

  // ── Color Palette ────────────────────────────────────────────────────────────
  const COL = {
    oltp:      0x0ea5e9,  // sky-blue  — source systems / operational DBs
    lake:      0x14b8a6,  // teal      — data lake / raw storage
    analytics: 0xd4a540,  // amber     — analytics warehouse / BI
    ai:        0x8b5cf6,  // violet    — AI / ML models
    packet:    0x38bdf8,  // cyan      — flowing data packets
    edge:      0x1e3f6a,  // dark navy — graph edges
    scatter:   0x0d1f35,  // near-black— background star field
  };

  // ── Node Cluster Definitions ──────────────────────────────────────────────────
  const CLUSTERS = [
    { cx: -22, cy:  13, cz:  -8, type: 'oltp',      n: 9 },
    { cx:   0, cy:   1, cz: -14, type: 'lake',      n: 8 },
    { cx:  20, cy:  12, cz:  -6, type: 'analytics', n: 8 },
    { cx:   0, cy: -15, cz:  -4, type: 'ai',        n: 7 },
  ];

  const nodes  = [];
  const hubIdx = [];  // index of hub node per cluster

  CLUSTERS.forEach(({ cx, cy, cz, type, n }) => {
    hubIdx.push(nodes.length);
    // Hub node — larger, at cluster center
    nodes.push({ pos: new THREE.Vector3(cx, cy, cz), size: 1.15, type, phi: Math.random() * 6.28 });

    // Satellite nodes — arranged in a rough ring around the hub
    for (let i = 1; i < n; i++) {
      const angle = (i / (n - 1)) * 6.28;
      const r     = 4.5 + Math.random() * 4;
      nodes.push({
        pos: new THREE.Vector3(
          cx + Math.cos(angle) * r        + (Math.random() - 0.5) * 1.5,
          cy + Math.sin(angle) * r * 0.5  + (Math.random() - 0.5) * 1.5,
          cz + (Math.random() - 0.5) * 5
        ),
        size: 0.24 + Math.random() * 0.26,
        type,
        phi: Math.random() * 6.28,
      });
    }
  });

  // ── Node Meshes ───────────────────────────────────────────────────────────────
  const sphereGeo = new THREE.SphereGeometry(1, 7, 5);
  const nodeMeshes = nodes.map(nd => {
    const m = new THREE.Mesh(
      sphereGeo,
      new THREE.MeshBasicMaterial({ color: COL[nd.type], transparent: true, opacity: 0.38 })
    );
    m.position.copy(nd.pos);
    m.scale.setScalar(nd.size);
    return m;
  });

  // Aura rings on hub nodes — billboard rings that pulse
  const ringGeo = new THREE.RingGeometry(1.5, 2.15, 48);
  const auraRings = hubIdx.map(hi => {
    const nd = nodes[hi];
    const m  = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({
      color: COL[nd.type], transparent: true, opacity: 0.06, side: THREE.DoubleSide,
    }));
    m.position.copy(nd.pos);
    return m;
  });

  // ── Edges ─────────────────────────────────────────────────────────────────────
  const edges = [];
  const edgeSet = new Set();

  function addEdge(a, b) {
    const key = a < b ? `${a}:${b}` : `${b}:${a}`;
    if (!edgeSet.has(key)) { edgeSet.add(key); edges.push([a, b]); }
  }

  // Intra-cluster: satellites to hub + short chains
  let base = 0;
  CLUSTERS.forEach(({ n }, ci) => {
    const hub = hubIdx[ci];
    for (let i = 0; i < n; i++) {
      const cur = base + i;
      if (cur !== hub) addEdge(hub, cur);
      if (i > 1 && cur - 1 !== hub) addEdge(cur - 1, cur);
    }
    base += n;
  });

  // Inter-cluster pipeline: OLTP → Lake → Analytics/AI
  addEdge(hubIdx[0], hubIdx[1]);  // OLTP    → Data Lake
  addEdge(hubIdx[1], hubIdx[2]);  // Lake    → Analytics DW
  addEdge(hubIdx[1], hubIdx[3]);  // Lake    → AI / ML
  addEdge(hubIdx[2], hubIdx[3]);  // Analytics → AI

  // Build LineSegments geometry from edges
  const edgePts = [];
  edges.forEach(([a, b]) => {
    const pa = nodes[a].pos, pb = nodes[b].pos;
    edgePts.push(pa.x, pa.y, pa.z, pb.x, pb.y, pb.z);
  });
  const edgeGeo = new THREE.BufferGeometry();
  edgeGeo.setAttribute('position', new THREE.Float32BufferAttribute(edgePts, 3));
  const edgeMesh = new THREE.LineSegments(edgeGeo, new THREE.LineBasicMaterial({
    color: COL.edge, transparent: true, opacity: 0.18,
  }));

  // ── Data Packets ──────────────────────────────────────────────────────────────
  const PKT_N  = 130;
  const packets = Array.from({ length: PKT_N }, () => ({
    ei:  Math.floor(Math.random() * edges.length),
    t:   Math.random(),
    spd: 0.0022 + Math.random() * 0.0045,
  }));

  const pktBuf = new Float32Array(PKT_N * 3);
  const pktGeo = new THREE.BufferGeometry();
  pktGeo.setAttribute('position', new THREE.BufferAttribute(pktBuf, 3));
  const pktMesh = new THREE.Points(pktGeo, new THREE.PointsMaterial({
    color: COL.packet, size: 0.75, transparent: true, opacity: 0.45, sizeAttenuation: true,
  }));

  // ── Background Star Field ─────────────────────────────────────────────────────
  const SC_N   = 750;
  const scBuf  = new Float32Array(SC_N * 3);
  for (let i = 0; i < SC_N; i++) {
    scBuf[i * 3]     = (Math.random() - 0.5) * 170;
    scBuf[i * 3 + 1] = (Math.random() - 0.5) * 110;
    scBuf[i * 3 + 2] = (Math.random() - 0.5) * 80 - 20;
  }
  const scGeo  = new THREE.BufferGeometry();
  scGeo.setAttribute('position', new THREE.BufferAttribute(scBuf, 3));
  const scMesh = new THREE.Points(scGeo, new THREE.PointsMaterial({
    color: COL.scatter, size: 0.36, transparent: true, opacity: 0.28,
  }));

  // ── Scene Graph ───────────────────────────────────────────────────────────────
  const group = new THREE.Group();
  nodeMeshes.forEach(m => group.add(m));
  auraRings.forEach(m => group.add(m));
  group.add(edgeMesh);
  group.add(pktMesh);
  scene.add(group);
  scene.add(scMesh);  // star field doesn't rotate with group

  // ── Interaction ───────────────────────────────────────────────────────────────
  let mx = 0, my = 0;
  window.addEventListener('mousemove', e => {
    mx = (e.clientX / window.innerWidth  - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
  });
  
  let targetScrollY = window.scrollY;
  let currentScrollY = window.scrollY;
  window.addEventListener('scroll', () => {
    targetScrollY = window.scrollY;
  }, { passive: true });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // ── Animation Loop ────────────────────────────────────────────────────────────
  let raf = null;

  function tick() {
    raf = requestAnimationFrame(tick);
    const t = performance.now() * 0.001;

    // Smooth scroll interpolation
    currentScrollY = lerp(currentScrollY, targetScrollY, 0.06);
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = maxScroll > 0 ? currentScrollY / maxScroll : 0;

    // Pan camera down & rotate group based on scroll position
    camera.position.y = 4 - scrollPercent * 34;
    camera.position.z = 62 + scrollPercent * 10;

    // Slow auto-rotation + mouse tilt + scroll rotation parallax
    group.rotation.y  = t * 0.032 + scrollPercent * 0.6;
    group.rotation.x += (my * 0.09 - group.rotation.x) * 0.03;

    // Node pulse
    nodeMeshes.forEach((m, i) => {
      const nd = nodes[i];
      m.scale.setScalar(nd.size * (1 + Math.sin(t * 1.6 + nd.phi) * 0.06));
    });

    // Aura rings: billboard to camera + slow scale pulse
    auraRings.forEach((ring, i) => {
      ring.scale.setScalar(1 + Math.sin(t * 0.85 + i * 1.4) * 0.13);
      ring.quaternion.copy(camera.quaternion);
    });

    // Move packets along edges
    packets.forEach((p, i) => {
      p.t += p.spd;
      if (p.t >= 1) {
        p.t  = 0;
        p.ei = Math.floor(Math.random() * edges.length);
      }
      const [a, b]  = edges[p.ei];
      const pa = nodes[a].pos, pb = nodes[b].pos;
      pktBuf[i * 3]     = lerp(pa.x, pb.x, p.t);
      pktBuf[i * 3 + 1] = lerp(pa.y, pb.y, p.t);
      pktBuf[i * 3 + 2] = lerp(pa.z, pb.z, p.t);
    });
    pktGeo.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
  }

  // Pause rendering when tab is not visible (saves CPU/battery)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
      raf = null;
    } else if (!raf) {
      tick();
    }
  });

  tick();
})();
