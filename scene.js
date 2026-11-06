/* 银行智能体超市 · three.js 场景
 * stage(canvas)：首页的全息展台（银行图标、旋转光环、阶梯台座、粒子与城市天际线）
 * core(canvas, color)：智能体工作台中间的“智能核心”（会随运行状态加速、变色）
 */
import * as THREE from "three";

const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
const MOBILE = matchMedia("(max-width: 720px)").matches;

function base(canvas, fov = 42) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !MOBILE, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, MOBILE ? 1.5 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(fov, 1, 0.1, 400);
  let w = 0, h = 0;
  const resize = () => { const r = canvas.getBoundingClientRect(); if (!r.width || !r.height) return; if (r.width === w && r.height === h) return; w = r.width; h = r.height; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); };
  const ro = new ResizeObserver(resize); ro.observe(canvas); resize();
  let visible = true;
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }); io.observe(canvas);
  const loop = (fn) => {
    const clock = new THREE.Clock(); let raf = 0;
    const tick = () => { raf = requestAnimationFrame(tick); if (!visible || document.hidden) { clock.getDelta(); return; } resize(); fn(clock.getElapsedTime(), Math.min(clock.getDelta(), 0.05)); renderer.render(scene, camera); };
    if (REDUCED) { resize(); fn(1.2, 0); renderer.render(scene, camera); } else tick();
    return () => cancelAnimationFrame(raf);
  };
  const dispose = (stop) => { stop && stop(); ro.disconnect(); io.disconnect(); scene.traverse(o => { o.geometry && o.geometry.dispose(); const m = o.material; (Array.isArray(m) ? m : m ? [m] : []).forEach(x => { x.map && x.map.dispose(); x.dispose(); }); }); renderer.dispose(); };
  return { renderer, scene, camera, loop, dispose };
}

/* 径向渐变贴图，用于光晕与粒子 */
function glowTexture(inner = "rgba(255,255,255,1)", outer = "rgba(255,255,255,0)") {
  const c = document.createElement("canvas"); c.width = c.height = 128; const g = c.getContext("2d");
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64); grd.addColorStop(0, inner); grd.addColorStop(0.35, "rgba(255,255,255,.35)"); grd.addColorStop(1, outer);
  g.fillStyle = grd; g.fillRect(0, 0, 128, 128); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function beamTexture() {
  const c = document.createElement("canvas"); c.width = 4; c.height = 256; const g = c.getContext("2d");
  const grd = g.createLinearGradient(0, 0, 0, 256); grd.addColorStop(0, "rgba(255,255,255,0)"); grd.addColorStop(0.7, "rgba(255,255,255,.35)"); grd.addColorStop(1, "rgba(255,255,255,.9)");
  g.fillStyle = grd; g.fillRect(0, 0, 4, 256); const t = new THREE.CanvasTexture(c); return t;
}
const add = (o) => { o.material && (o.material.depthWrite = false); return o; };
const lineMat = (color, opacity = 1) => new THREE.LineBasicMaterial({ color, transparent: true, opacity, blending: THREE.AdditiveBlending });
function ring(r, tube, color, opacity) {
  return new THREE.Mesh(new THREE.TorusGeometry(r, tube, 8, 160), new THREE.MeshBasicMaterial({ color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false }));
}
function dashedCircle(r, color, opacity, segs = 120, gap = 3) {
  const pts = []; for (let i = 0; i <= segs; i++) { const a = i / segs * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r)); }
  const g = new THREE.BufferGeometry().setFromPoints(pts); const l = new THREE.Line(g, new THREE.LineDashedMaterial({ color, dashSize: gap, gapSize: gap * 0.8, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false })); l.computeLineDistances(); return l;
}

/* 银行建筑图标：台基、立柱、三角山花，放在玻璃方块里 */
function bankIcon() {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0xbfe6ff, emissive: 0x3a8dff, emissiveIntensity: 0.9, metalness: 0.2, roughness: 0.25 });
  const slab = (w, h, d, y) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.y = y; g.add(m); };
  slab(5.2, 0.35, 1.6, -2.2); slab(4.6, 0.3, 1.4, -1.85);
  for (let i = 0; i < 4; i++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 2.7, 20), mat); c.position.set(-1.65 + i * 1.1, -0.35, 0); g.add(c); }
  slab(4.8, 0.3, 1.4, 1.15);
  const sh = new THREE.Shape(); sh.moveTo(-2.6, 0); sh.lineTo(2.6, 0); sh.lineTo(0, 1.45); sh.lineTo(-2.6, 0);
  const roof = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 1.2, bevelEnabled: false }), mat); roof.position.set(0, 1.32, -0.6); g.add(roof);
  const box = new THREE.Mesh(new THREE.BoxGeometry(7.2, 7.2, 2.6), new THREE.MeshStandardMaterial({ color: 0x1d6dff, transparent: true, opacity: 0.18, emissive: 0x0b3a99, emissiveIntensity: 0.6, roughness: 0.1, metalness: 0.3, depthWrite: false }));
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(7.2, 7.2, 2.6)), lineMat(0x7fd6ff, 0.9));
  g.add(box, edges);
  return g;
}

export function stage(canvas) {
  const S = base(canvas, MOBILE ? 52 : 40);
  const { scene, camera } = S;
  scene.fog = new THREE.FogExp2(0x040b1c, 0.012);
  scene.add(new THREE.AmbientLight(0x6aa8ff, 0.7));
  const key = new THREE.PointLight(0x5ab8ff, 260, 120); key.position.set(0, 26, 22); scene.add(key);
  const rim = new THREE.PointLight(0xa78bfa, 120, 90); rim.position.set(-30, 10, -10); scene.add(rim);

  const root = new THREE.Group(); scene.add(root);
  /* 阶梯台座 */
  const podium = new THREE.Group(); root.add(podium);
  const tiers = [[19, 1.1, -8.8], [15.5, 1.0, -7.75], [12, 0.9, -6.8], [8.6, 0.8, -5.95]];
  tiers.forEach(([r, h, y], i) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r + 0.4, h, 96, 1, true), new THREE.MeshStandardMaterial({ color: 0x0b2a66, emissive: 0x0a2c7a, emissiveIntensity: 0.5, metalness: 0.6, roughness: 0.35, transparent: true, opacity: 0.85, side: THREE.DoubleSide }));
    m.position.y = y; podium.add(m);
    const top = new THREE.Mesh(new THREE.CircleGeometry(r, 96), new THREE.MeshStandardMaterial({ color: 0x0c2f73, emissive: 0x0b347f, emissiveIntensity: 0.45, metalness: 0.5, roughness: 0.4, transparent: true, opacity: 0.9 }));
    top.rotation.x = -Math.PI / 2; top.position.y = y + h / 2 + 0.001; podium.add(top);
    const edge = ring(r, 0.07, i === 3 ? 0x7fe3ff : 0x3d8bff, i === 3 ? 1 : 0.7); edge.rotation.x = Math.PI / 2; edge.position.y = y + h / 2; podium.add(edge);
  });
  /* 地面光环 */
  const floorRings = [];
  [[24, 0.06, 0x2f7bff, 0.55], [30, 0.05, 0x38d6ff, 0.35], [37, 0.04, 0x2f7bff, 0.25]].forEach(([r, t, c, o]) => { const m = ring(r, t, c, o); m.rotation.x = Math.PI / 2; m.position.y = -9.4; root.add(m); floorRings.push(m); });
  const dashes = [dashedCircle(21.5, 0x7fe3ff, 0.8, 160, 1.6), dashedCircle(27, 0x38d6ff, 0.5, 200, 2.4)];
  dashes.forEach(d => { d.position.y = -9.3; root.add(d); });
  const floorGlow = add(new THREE.Mesh(new THREE.PlaneGeometry(90, 90), new THREE.MeshBasicMaterial({ map: glowTexture("rgba(47,123,255,.9)"), transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending })));
  floorGlow.rotation.x = -Math.PI / 2; floorGlow.position.y = -9.5; root.add(floorGlow);
  /* 中心光柱 */
  const beam = add(new THREE.Mesh(new THREE.CylinderGeometry(4.2, 7.5, 22, 48, 1, true), new THREE.MeshBasicMaterial({ map: beamTexture(), color: 0x55c8ff, transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, side: THREE.DoubleSide })));
  beam.position.y = 2.5; beam.scale.y = 0.9; root.add(beam);
  /* 银行图标与环绕光轨 */
  const IY = MOBILE ? 12.5 : 12; const icon = bankIcon(); icon.position.y = IY; icon.scale.setScalar(MOBILE ? 1 : 1.15); root.add(icon);
  const halo = add(new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture("rgba(80,170,255,1)"), color: 0x3a8dff, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending })));
  halo.scale.set(24, 24, 1); halo.position.y = IY; root.add(halo);
  const orbit = new THREE.Group(); orbit.position.y = IY - 0.2; orbit.rotation.set(1.25, 0, 0.32); root.add(orbit);
  const o1 = ring(9.5, 0.09, 0x7fe3ff, 0.95), o2 = ring(10.6, 0.04, 0x3d8bff, 0.6); orbit.add(o1, o2);
  const comet = add(new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color: 0xbff4ff, transparent: true, blending: THREE.AdditiveBlending }))); comet.scale.set(2.4, 2.4, 1); orbit.add(comet);

  /* 上升粒子 */
  const N = MOBILE ? 260 : 650; const pos = new Float32Array(N * 3); const spd = new Float32Array(N);
  for (let i = 0; i < N; i++) { const a = Math.random() * Math.PI * 2, r = 3 + Math.random() * 38; pos[i * 3] = Math.cos(a) * r; pos[i * 3 + 1] = -9 + Math.random() * 34; pos[i * 3 + 2] = Math.sin(a) * r; spd[i] = 0.6 + Math.random() * 2.2; }
  const pg = new THREE.BufferGeometry(); pg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const particles = add(new THREE.Points(pg, new THREE.PointsMaterial({ size: 0.42, map: glowTexture(), color: 0x7fd6ff, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, sizeAttenuation: true })));
  root.add(particles);

  /* 远处城市天际线（实例化方块） */
  const city = new THREE.Group(); scene.add(city);
  const B = MOBILE ? 50 : 110; const geo = new THREE.BoxGeometry(1, 1, 1);
  const inst = new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({ color: 0x0b2357, emissive: 0x0d2f7a, emissiveIntensity: 0.55, metalness: 0.5, roughness: 0.6, transparent: true, opacity: 0.85 }), B);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), sc = new THREE.Vector3();
  for (let i = 0; i < B; i++) {
    const side = i % 2 ? 1 : -1, x = side * (30 + Math.random() * 70), z = -40 - Math.random() * 60, h = 8 + Math.random() * (Math.abs(x) > 60 ? 50 : 34);
    v.set(x, -9.5 + h / 2, z); sc.set(3 + Math.random() * 5, h, 3 + Math.random() * 5); m4.compose(v, q, sc); inst.setMatrixAt(i, m4);
  }
  city.add(inst);
  const cityEdges = new THREE.InstancedMesh(new THREE.BoxGeometry(1.02, 1.002, 1.02), new THREE.MeshBasicMaterial({ color: 0x2f7bff, wireframe: true, transparent: true, opacity: 0.12, depthWrite: false }), B);
  for (let i = 0; i < B; i++) { inst.getMatrixAt(i, m4); cityEdges.setMatrixAt(i, m4); } city.add(cityEdges);
  /* 斜向流光 */
  const streaks = [];
  for (let i = 0; i < (MOBILE ? 4 : 8); i++) {
    const s = add(new THREE.Mesh(new THREE.PlaneGeometry(60, 0.18), new THREE.MeshBasicMaterial({ color: i % 2 ? 0x38d6ff : 0x2f7bff, transparent: true, opacity: 0.0, blending: THREE.AdditiveBlending })));
    s.position.set((i % 2 ? 1 : -1) * 55, -6 + i * 1.6, -20 - i * 3); s.rotation.z = (i % 2 ? 1 : -1) * 0.12; s.userData = { off: Math.random() * 10 }; scene.add(s); streaks.push(s);
  }

  /* 鼠标视差 */
  const target = { x: 0, y: 0 };
  const onMove = (e) => { const r = canvas.getBoundingClientRect(); target.x = ((e.clientX - r.left) / r.width - 0.5) * 2; target.y = ((e.clientY - r.top) / r.height - 0.5) * 2; };
  addEventListener("pointermove", onMove, { passive: true });
  const accent = new THREE.Color(0x7fe3ff), tmp = new THREE.Color();
  let pulse = 0;

  camera.position.set(0, MOBILE ? 9 : 7, MOBILE ? 66 : 54); camera.lookAt(0, 5.5, 0);
  const stop = S.loop((t, dt) => {
    camera.position.x += (target.x * 5 - camera.position.x) * 0.03;
    camera.position.y += ((MOBILE ? 9 : 7) - target.y * 2.5 - camera.position.y) * 0.03;
    camera.lookAt(0, 5.5, 0);
    icon.position.y = IY + Math.sin(t * 1.2) * 0.5; halo.position.y = icon.position.y; icon.rotation.y = Math.sin(t * 0.5) * 0.35;
    halo.material.opacity = 0.6 + Math.sin(t * 2) * 0.12 + pulse * 0.5;
    orbit.rotation.z = 0.32 + t * 0.25; o1.material.color.lerp(accent, 0.05);
    comet.position.set(Math.cos(t * 1.4) * 9.5, Math.sin(t * 1.4) * 9.5, 0);
    floorRings.forEach((r, i) => { r.rotation.z = t * (i % 2 ? -0.05 : 0.04); r.material.opacity = (0.55 - i * 0.12) * (0.8 + 0.2 * Math.sin(t * 1.5 + i)); });
    dashes[0].rotation.y = t * 0.12; dashes[1].rotation.y = -t * 0.07;
    podium.children.forEach(o => { if (o.geometry.type === "TorusGeometry") o.material.color.lerp(tmp.copy(accent).lerp(new THREE.Color(0x3d8bff), 0.4), 0.02); });
    beam.material.opacity = 0.35 + Math.sin(t * 1.7) * 0.08 + pulse * 0.4;
    const p = pg.attributes.position.array;
    for (let i = 0; i < N; i++) { p[i * 3 + 1] += spd[i] * dt * (1 + pulse * 3); if (p[i * 3 + 1] > 25) p[i * 3 + 1] = -9; }
    pg.attributes.position.needsUpdate = true;
    streaks.forEach(s => { const k = ((t * 0.25 + s.userData.off) % 4) / 4; s.material.opacity = Math.sin(k * Math.PI) * 0.55; s.position.x = (s.rotation.z > 0 ? 1 : -1) * (75 - k * 40); });
    pulse *= 0.94;
  });
  return {
    setAccent(hex) { accent.set(hex); pulse = 1; },
    dispose() { removeEventListener("pointermove", onMove); S.dispose(stop); }
  };
}

export function core(canvas, color = "#38d6ff") {
  const S = base(canvas, 40); const { scene, camera } = S;
  const col = new THREE.Color(color);
  scene.add(new THREE.AmbientLight(0x88bbff, 0.8));
  const pl = new THREE.PointLight(col, 120, 60); pl.position.set(0, 4, 10); scene.add(pl);
  const g = new THREE.Group(); scene.add(g);
  const shell = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(4.2, 1)), lineMat(col, 0.85)); g.add(shell);
  const shell2 = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(5.4, 0)), lineMat(0x7fd6ff, 0.35)); g.add(shell2);
  const heart = new THREE.Mesh(new THREE.IcosahedronGeometry(2.3, 3), new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 1.2, metalness: 0.2, roughness: 0.15, flatShading: true }));
  g.add(heart);
  const glow = add(new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color: col, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending }))); glow.scale.set(16, 16, 1); g.add(glow);
  const rings = [ring(6.6, 0.06, col, 0.9), ring(7.4, 0.035, 0x7fd6ff, 0.5), ring(8.3, 0.05, col, 0.6)];
  rings[0].rotation.x = 1.2; rings[1].rotation.set(0.3, 0.9, 0); rings[2].rotation.set(1.9, 0.4, 0.3); rings.forEach(r => g.add(r));
  /* 环绕的小数据块 */
  const sats = [];
  for (let i = 0; i < 6; i++) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.1, 0.25), new THREE.MeshStandardMaterial({ color: 0x1d4ed8, emissive: i % 2 ? col : 0x2f7bff, emissiveIntensity: 0.7, transparent: true, opacity: 0.85 }));
    const e = new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry), lineMat(0xbfe9ff, 0.9)); m.add(e); m.userData = { a: i / 6 * Math.PI * 2, r: 9.5 + (i % 2) * 1.2, y: (i % 3 - 1) * 1.6 }; g.add(m); sats.push(m);
  }
  /* 地面波纹 */
  const ripples = [];
  for (let i = 0; i < 4; i++) { const r = ring(3, 0.05, col, 0.6); r.rotation.x = Math.PI / 2; r.position.y = -7; r.userData.k = i / 4; scene.add(r); ripples.push(r); }
  const disc = add(new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.MeshBasicMaterial({ map: glowTexture(), color: col, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending })));
  disc.rotation.x = -Math.PI / 2; disc.position.y = -7.05; scene.add(disc);
  const N = MOBILE ? 120 : 260, pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) { const a = Math.random() * Math.PI * 2, r = 6 + Math.random() * 12; pos[i * 3] = Math.cos(a) * r; pos[i * 3 + 1] = -7 + Math.random() * 16; pos[i * 3 + 2] = Math.sin(a) * r; }
  const pg = new THREE.BufferGeometry(); pg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const pts = add(new THREE.Points(pg, new THREE.PointsMaterial({ size: 0.3, map: glowTexture(), color: 0xbfe9ff, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending }))); scene.add(pts);

  camera.position.set(0, 2.5, 25); camera.lookAt(0, -0.5, 0);
  let state = "idle", speed = 1, burst = 0; const done = new THREE.Color(0x22d3a0), base0 = col.clone(), cur = col.clone();
  const stop = S.loop((t, dt) => {
    const want = state === "run" ? 3.2 : 1; speed += (want - speed) * 0.05;
    const targetCol = state === "done" ? done : base0; cur.lerp(targetCol, 0.04);
    heart.material.color.copy(cur); heart.material.emissive.copy(cur); glow.material.color.copy(cur); shell.material.color.copy(cur); rings[0].material.color.copy(cur); rings[2].material.color.copy(cur); pl.color.copy(cur);
    g.rotation.y += dt * 0.35 * speed; shell.rotation.x += dt * 0.2 * speed; shell2.rotation.y -= dt * 0.15 * speed;
    rings[0].rotation.z += dt * 0.6 * speed; rings[1].rotation.z -= dt * 0.4 * speed; rings[2].rotation.z += dt * 0.3 * speed;
    const s = 1 + Math.sin(t * (state === "run" ? 7 : 2)) * (state === "run" ? 0.08 : 0.03) + burst * 0.3; heart.scale.setScalar(s);
    glow.material.opacity = 0.65 + Math.sin(t * 2.5) * 0.1 + (state === "run" ? 0.2 : 0) + burst * 0.4;
    g.position.y = Math.sin(t * 1.1) * 0.35;
    sats.forEach(m => { const u = m.userData; u.a += dt * 0.4 * speed; m.position.set(Math.cos(u.a) * u.r, u.y + Math.sin(t + u.a) * 0.4, Math.sin(u.a) * u.r); m.rotation.y = -u.a; });
    ripples.forEach(r => { r.userData.k = (r.userData.k + dt * 0.18 * speed) % 1; const k = r.userData.k; r.scale.setScalar(1 + k * 3.2); r.material.opacity = (1 - k) * 0.7; r.material.color.copy(cur); });
    disc.material.color.copy(cur);
    const p = pg.attributes.position.array; for (let i = 0; i < N; i++) { p[i * 3 + 1] += dt * (0.6 + speed * 0.5); if (p[i * 3 + 1] > 9) p[i * 3 + 1] = -7; } pg.attributes.position.needsUpdate = true;
    pts.rotation.y += dt * 0.05 * speed;
    burst *= 0.92;
  });
  return { setState(s) { if (s !== state) { state = s; burst = 1; } }, dispose() { S.dispose(stop); } };
}

window.AIScene = { stage, core };
window.dispatchEvent(new Event("aiscene"));
