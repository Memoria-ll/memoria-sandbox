import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js';

const canvas = document.getElementById('map-canvas');
const hudEl = document.getElementById('hud');
const sheetToggle = document.getElementById('sheet-toggle');
const sheetTitleEl = document.getElementById('sheet-title');
const sheetStateEl = document.getElementById('sheet-state');
const titleEl = document.getElementById('node-title');
const descEl = document.getElementById('node-desc');
const stateEl = document.getElementById('node-state');
const depthEl = document.getElementById('node-depth');
const echoEl = document.getElementById('node-echo');
const resetBtn = document.getElementById('reset-btn');
const deployBtn = document.getElementById('deploy-btn');

const regions = [
  { title: '響森圏', position: [-5.4, -0.08, 3.0], radius: 2.35, color: 0x315f58, phase: .2 },
  { title: '石窟帯', position: [-1.8, -0.1, 1.0], radius: 2.05, color: 0x4b4476, phase: 1.4 },
  { title: '空洞律域', position: [2.25, -0.1, 1.65], radius: 2.25, color: 0x6a3449, phase: 2.2 },
  { title: '沈黙海', position: [4.9, -0.12, -2.3], radius: 2.75, color: 0x29314d, phase: 3.1 },
  { title: '無響核周辺', position: [-1.15, -0.14, -3.35], radius: 2.35, color: 0x3d425d, phase: 4.4 }
];

const stages = [
  { id: 'forest-gate', title: '森の入口', desc: 'もっとも浅い還響域。残響の流れがまだ穏やかに揺れている。', state: '攻略済み', depth: '深度1 / 階層10', echo: '+4', position: [-6.4, 0.18, 3.65], color: 0x69d7bd, scale: .82 },
  { id: 'forest-core', title: '森の共鳴', desc: '深度1の終端。微かな残響がまだ地表に残っている。', state: '攻略済み', depth: '深度1 / 階層30', echo: '+12', position: [-4.75, 0.2, 2.6], color: 0x69d7bd, scale: 1.0 },
  { id: 'moss-choir', title: '苔むす合唱路', desc: '湿った壁面に声が滲む。余響を集めやすい小径。', state: '攻略中', depth: '深度2 / 階層8', echo: '+0', position: [-5.95, 0.16, 1.45], color: 0x84d9b9, scale: .9 },
  { id: 'stone-throat', title: '石喉の入口', desc: '硬い反響が短く返る。装備更新の起点になる。', state: '攻略済み', depth: '深度2 / 階層12', echo: '+7', position: [-2.65, 0.16, 1.7], color: 0x9b8cff, scale: .9 },
  { id: 'cave', title: '石窟の反響', desc: '反響が岩肌を伝って遅れて戻る。装備の質が少し上がる。', state: '攻略中', depth: '深度2 / 階層18', echo: '+0', position: [-1.2, 0.22, .45], color: 0x9080d8, scale: 1.08 },
  { id: 'broken-bridge', title: '断響橋', desc: '響きの橋が途中で途切れている。次の領域への分岐点。', state: '未攻略', depth: '深度2 / 階層25', echo: '+0', position: [.15, 0.18, 2.35], color: 0xb1a2ff, scale: .85 },
  { id: 'hollow', title: '空洞律', desc: '静寂の霧が濃い。沈点の気配が進行路を歪ませている。', state: '沈点未討伐', depth: '深度3 / 階層0', echo: '+0', position: [2.2, 0.28, 2.0], color: 0xc45d7a, scale: 1.2 },
  { id: 'red-lattice', title: '赤い格子庭', desc: '格子状に残響が閉じ込められている。分岐先を見失いやすい。', state: '未攻略', depth: '深度3 / 階層12', echo: '+0', position: [3.55, 0.18, .8], color: 0xd8748e, scale: .88 },
  { id: 'silent-coast', title: '沈黙の岸', desc: '音が水面に吸われる沿岸部。未踏域の入口。', state: '未解放', depth: '深度4 / 階層0', echo: '+0', position: [3.75, 0.12, -1.3], color: 0x58627f, scale: .84 },
  { id: 'silent-sea', title: '沈黙海', desc: '未踏域。到達するまで地形の輪郭しか見えない。', state: '未解放', depth: '深度4 / 階層0', echo: '+0', position: [5.65, 0.14, -2.75], color: 0x48516f, scale: 1.0 },
  { id: 'echo-reef', title: '残響礁', desc: '沈黙海に浮かぶ小さな礁。薄い声だけが周囲を巡っている。', state: '未解放', depth: '深度4 / 階層18', echo: '+0', position: [3.65, 0.12, -3.65], color: 0x596b8f, scale: .78 },
  { id: 'core-rim', title: '核縁部', desc: '無響核へ続く境界。周囲の音が低く沈んでいる。', state: '未解放', depth: '深度5 / 階層0', echo: '+0', position: [-.15, 0.12, -2.45], color: 0x626986, scale: .86 },
  { id: 'core', title: '無響核', desc: '最深部に沈む核。現在は静寂に覆われている。', state: '未解放', depth: '深度5 / 階層0', echo: '+0', position: [-2.0, 0.2, -4.2], color: 0x34384c, scale: 1.12 }
];

const links = [
  ['forest-gate', 'forest-core'], ['forest-core', 'moss-choir'], ['forest-core', 'stone-throat'],
  ['stone-throat', 'cave'], ['cave', 'broken-bridge'], ['broken-bridge', 'hollow'],
  ['hollow', 'red-lattice'], ['red-lattice', 'silent-coast'], ['silent-coast', 'silent-sea'],
  ['silent-sea', 'echo-reef'], ['broken-bridge', 'core-rim'], ['core-rim', 'core']
];

let selected = stages[1];
const pickables = [];
const stageMeshes = new Map();
const routeFlow = [];
const clock = new THREE.Clock();
const pointer = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
const target = new THREE.Vector3(0, 0, 0);
const drag = { active: false, moved: false, x: 0, y: 0, yaw: 0, pitch: 1.16, radius: 12.5 };

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x040408, 1);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x040408, 0.052);

const camera = new THREE.PerspectiveCamera(44, window.innerWidth / window.innerHeight, 0.1, 120);

scene.add(new THREE.AmbientLight(0x8c879c, 1.55));
const keyLight = new THREE.DirectionalLight(0xfff1d0, 1.9);
keyLight.position.set(-3, 8, 5);
scene.add(keyLight);
const lowLight = new THREE.PointLight(0x69d7bd, 2.2, 11);
lowLight.position.set(-4.2, 2.6, 3.4);
scene.add(lowLight);

const board = new THREE.Mesh(
  new THREE.PlaneGeometry(17.6, 12.6, 1, 1),
  new THREE.MeshBasicMaterial({ map: makePaperTexture(), transparent: true, opacity: .72, depthWrite: false })
);
board.rotation.x = -Math.PI * 0.5;
board.position.y = -0.22;
scene.add(board);

const grid = new THREE.GridHelper(18, 36, 0x5f5237, 0x201d1b);
grid.position.y = -0.17;
grid.material.transparent = true;
grid.material.opacity = .28;
scene.add(grid);

const compass = makeCompassRose();
compass.position.set(6.8, 0.02, 4.25);
scene.add(compass);

for (const region of regions) {
  const color = new THREE.Color(region.color);
  const blob = new THREE.Mesh(
    makeBlobGeometry(region.radius, region.phase),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .2, depthWrite: false })
  );
  blob.rotation.x = -Math.PI * 0.5;
  blob.position.set(...region.position);
  scene.add(blob);

  for (let i = 0; i < 3; i++) {
    const ring = new THREE.Mesh(
      makeBlobRingGeometry(region.radius * (1.02 + i * .17), region.phase + i * .7),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .24 - i * .055, depthWrite: false })
    );
    ring.rotation.x = -Math.PI * 0.5;
    ring.position.set(region.position[0], region.position[1] + .016 + i * .006, region.position[2]);
    scene.add(ring);
  }

  const label = makeLabel(region.title, 0xd6b86b, .82, 32, .9);
  label.position.set(region.position[0], .42, region.position[2] - region.radius * .86);
  scene.add(label);
}

const stageById = new Map(stages.map((stage) => [stage.id, stage]));
for (const [fromId, toId] of links) {
  const fromStage = stageById.get(fromId);
  const toStage = stageById.get(toId);
  const from = new THREE.Vector3(...fromStage.position);
  const to = new THREE.Vector3(...toStage.position);
  const mid = from.clone().lerp(to, .5);
  mid.y += .16 + Math.min(from.distanceTo(to) * .035, .16);
  const curve = new THREE.CatmullRomCurve3([from, mid, to]);
  const base = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 48, .014, 8, false),
    new THREE.MeshBasicMaterial({ color: 0x9f8753, transparent: true, opacity: .43 })
  );
  scene.add(base);

  const glow = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 48, .042, 8, false),
    new THREE.MeshBasicMaterial({ color: 0x69d7bd, transparent: true, opacity: .055, depthWrite: false })
  );
  scene.add(glow);

  const bead = new THREE.Mesh(
    new THREE.SphereGeometry(.045, 12, 8),
    new THREE.MeshBasicMaterial({ color: 0xd6b86b, transparent: true, opacity: .68 })
  );
  scene.add(bead);
  routeFlow.push({ bead, curve, offset: Math.random() });
}

for (const stage of stages) {
  const group = new THREE.Group();
  group.position.set(...stage.position);

  const baseSize = .18 * stage.scale;
  const coreGeometry = stage.state === '沈点未討伐'
    ? new THREE.OctahedronGeometry(baseSize * 1.35, 1)
    : new THREE.SphereGeometry(baseSize, 28, 18);
  const core = new THREE.Mesh(
    coreGeometry,
    new THREE.MeshStandardMaterial({
      color: stage.color,
      emissive: stage.color,
      emissiveIntensity: stage.state === '未解放' ? .14 : .58,
      roughness: .22,
      metalness: .08
    })
  );
  core.userData.stage = stage;
  group.add(core);
  pickables.push(core);

  const halo = new THREE.Mesh(
    new THREE.RingGeometry(.30 * stage.scale, .37 * stage.scale, 56),
    new THREE.MeshBasicMaterial({ color: stage.color, transparent: true, opacity: stage.state === '未解放' ? .22 : .54, depthWrite: false })
  );
  halo.rotation.x = -Math.PI * .5;
  group.add(halo);

  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(.42 * stage.scale, 48),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: .22, depthWrite: false })
  );
  shadow.rotation.x = -Math.PI * .5;
  shadow.position.y = -.34;
  group.add(shadow);

  const pillar = new THREE.Mesh(
    new THREE.CylinderGeometry(.008, .018, .52, 8),
    new THREE.MeshBasicMaterial({ color: stage.color, transparent: true, opacity: .24 })
  );
  pillar.position.y = -.2;
  group.add(pillar);

  if (stage.state === '未解放') {
    const veil = new THREE.Mesh(
      new THREE.RingGeometry(.45 * stage.scale, .47 * stage.scale, 54),
      new THREE.MeshBasicMaterial({ color: 0xeee4c7, transparent: true, opacity: .12, depthWrite: false })
    );
    veil.rotation.x = -Math.PI * .5;
    group.add(veil);
  }

  if (stage.state === '沈点未討伐') {
    const bossRing = new THREE.Mesh(
      new THREE.TorusGeometry(.48 * stage.scale, .017, 8, 72),
      new THREE.MeshBasicMaterial({ color: 0xd56b82, transparent: true, opacity: .76 })
    );
    bossRing.rotation.x = Math.PI * .5;
    group.add(bossRing);
  }

  const label = makeLabel(stage.title, stage.state === '未解放' ? 0x8f887d : stage.color, .58, 30, stage.state === '未解放' ? .55 : .82);
  label.position.set(0, .5, 0);
  group.add(label);

  scene.add(group);
  stageMeshes.set(stage.id, { group, core, halo, label });
}

const selectionRing = new THREE.Group();
const selectionA = new THREE.Mesh(
  new THREE.TorusGeometry(.62, .012, 8, 96),
  new THREE.MeshBasicMaterial({ color: 0xd6b86b, transparent: true, opacity: .9 })
);
selectionA.rotation.x = Math.PI * .5;
const selectionB = new THREE.Mesh(
  new THREE.TorusGeometry(.78, .008, 8, 96),
  new THREE.MeshBasicMaterial({ color: 0x69d7bd, transparent: true, opacity: .5 })
);
selectionB.rotation.x = Math.PI * .5;
selectionRing.add(selectionA, selectionB);
scene.add(selectionRing);

const particleCount = 620;
const particlePositions = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount; i++) {
  particlePositions[i * 3] = (Math.random() - .5) * 18;
  particlePositions[i * 3 + 1] = Math.random() * 2.8 + .2;
  particlePositions[i * 3 + 2] = (Math.random() - .5) * 12;
}
const particleGeometry = new THREE.BufferGeometry();
particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
const particleMaterial = new THREE.PointsMaterial({ color: 0xc2ad77, size: .022, transparent: true, opacity: .36, depthWrite: false });
const particles = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particles);

function makePaperTexture() {
  const c = document.createElement('canvas');
  const ctx = c.getContext('2d');
  c.width = 1024;
  c.height = 768;
  const gradient = ctx.createRadialGradient(512, 384, 80, 512, 384, 620);
  gradient.addColorStop(0, '#2b2418');
  gradient.addColorStop(.58, '#161317');
  gradient.addColorStop(1, '#060609');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, c.width, c.height);
  for (let i = 0; i < 4200; i++) {
    const x = Math.random() * c.width;
    const y = Math.random() * c.height;
    const a = Math.random() * .16;
    ctx.fillStyle = `rgba(238, 228, 199, ${a})`;
    ctx.fillRect(x, y, Math.random() * 2.4, Math.random() * 1.2);
  }
  for (let i = 0; i < 22; i++) {
    ctx.beginPath();
    ctx.strokeStyle = `rgba(214,184,107,${.025 + Math.random() * .035})`;
    ctx.lineWidth = .6 + Math.random() * 1.2;
    const y = Math.random() * c.height;
    ctx.moveTo(0, y);
    for (let x = 0; x < c.width; x += 72) ctx.lineTo(x, y + Math.sin(x * .01 + i) * 18);
    ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(c);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function makeBlobGeometry(radius, phase) {
  const shape = new THREE.Shape();
  const count = 96;
  for (let i = 0; i <= count; i++) {
    const a = i / count * Math.PI * 2;
    const r = radius * (1 + Math.sin(a * 3 + phase) * .045 + Math.sin(a * 7 + phase * 1.7) * .028);
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) shape.moveTo(x, y); else shape.lineTo(x, y);
  }
  return new THREE.ShapeGeometry(shape);
}

function makeBlobRingGeometry(radius, phase) {
  const points = [];
  const count = 128;
  for (let i = 0; i <= count; i++) {
    const a = i / count * Math.PI * 2;
    const r = radius * (1 + Math.sin(a * 3 + phase) * .04 + Math.sin(a * 8 + phase * 1.3) * .02);
    points.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0));
  }
  return new THREE.BufferGeometry().setFromPoints(points);
}

function makeCompassRose() {
  const group = new THREE.Group();
  const material = new THREE.MeshBasicMaterial({ color: 0xd6b86b, transparent: true, opacity: .34, depthWrite: false });
  const ring = new THREE.Mesh(new THREE.RingGeometry(.46, .47, 80), material);
  ring.rotation.x = -Math.PI * .5;
  group.add(ring);
  for (let i = 0; i < 8; i++) {
    const ray = new THREE.Mesh(new THREE.PlaneGeometry(.012, i % 2 === 0 ? .62 : .36), material);
    ray.position.y = .003;
    ray.rotation.x = -Math.PI * .5;
    ray.rotation.z = i * Math.PI / 4;
    group.add(ray);
  }
  return group;
}

function makeLabel(text, color, scale, fontSize, opacity) {
  const canvas2d = document.createElement('canvas');
  const context = canvas2d.getContext('2d');
  canvas2d.width = 512;
  canvas2d.height = 128;
  context.clearRect(0, 0, canvas2d.width, canvas2d.height);
  context.font = `600 ${fontSize}px serif`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.shadowColor = '#040408';
  context.shadowBlur = 14;
  context.fillStyle = '#eee4c7';
  context.fillText(text, 256, 64);
  const texture = new THREE.CanvasTexture(canvas2d);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({ map: texture, color, transparent: true, opacity, depthWrite: false });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(2.45 * scale, .62 * scale, 1);
  return sprite;
}

function updateCamera() {
  const x = target.x + Math.sin(drag.yaw) * Math.cos(drag.pitch) * drag.radius;
  const y = target.y + Math.sin(drag.pitch) * drag.radius;
  const z = target.z + Math.cos(drag.yaw) * Math.cos(drag.pitch) * drag.radius;
  camera.position.set(x, y, z);
  camera.lookAt(target);
}

function setSheetExpanded(expanded) {
  hudEl.classList.toggle('is-expanded', expanded);
  hudEl.setAttribute('aria-expanded', String(expanded));
}

function selectStage(stage) {
  selected = stage;
  sheetTitleEl.textContent = stage.title;
  sheetStateEl.textContent = stage.state;
  titleEl.textContent = stage.title;
  descEl.textContent = stage.desc;
  stateEl.textContent = stage.state;
  depthEl.textContent = stage.depth;
  echoEl.textContent = stage.echo;
  deployBtn.disabled = stage.state === '未解放';
  deployBtn.textContent = stage.state === '未解放' ? '未解放' : 'このステージへ出撃';
  target.lerp(new THREE.Vector3(stage.position[0], 0, stage.position[2]), .45);
  selectionRing.position.set(stage.position[0], stage.position[1] + .02, stage.position[2]);
  selectionRing.scale.setScalar(stage.scale);
}

function pickStage(event) {
  pointer.x = event.clientX / window.innerWidth * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(pickables, false);
  if (hits.length > 0) selectStage(hits[0].object.userData.stage);
}

function resetView() {
  drag.yaw = 0;
  drag.pitch = 1.16;
  drag.radius = 12.5;
  target.set(0, 0, 0);
  updateCamera();
}

function onPointerDown(event) {
  if (event.target.closest('#hud')) return;
  drag.active = true;
  drag.moved = false;
  drag.x = event.clientX;
  drag.y = event.clientY;
  canvas.setPointerCapture(event.pointerId);
}

function onPointerMove(event) {
  if (!drag.active) return;
  const dx = event.clientX - drag.x;
  const dy = event.clientY - drag.y;
  if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true;
  drag.x = event.clientX;
  drag.y = event.clientY;
  drag.yaw -= dx * .0048;
  drag.pitch = Math.max(.62, Math.min(1.36, drag.pitch + dy * .0032));
}

function onPointerUp(event) {
  if (!drag.active) return;
  drag.active = false;
  if (!drag.moved) pickStage(event);
  canvas.releasePointerCapture(event.pointerId);
}

function onWheel(event) {
  event.preventDefault();
  drag.radius = Math.max(7.5, Math.min(20, drag.radius + event.deltaY * .008));
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  updateCamera();
}

function animate() {
  requestAnimationFrame(animate);
  const elapsed = clock.getElapsedTime();
  particles.rotation.y = elapsed * .006;
  lowLight.intensity = 1.8 + Math.sin(elapsed * 1.2) * .35;

  for (const item of routeFlow) {
    const t = (elapsed * .075 + item.offset) % 1;
    item.bead.position.copy(item.curve.getPointAt(t));
  }

  for (const stage of stages) {
    const parts = stageMeshes.get(stage.id);
    const active = selected.id === stage.id;
    const pulse = 1 + Math.sin(elapsed * 2.4 + stage.position[0]) * .045;
    parts.group.scale.setScalar(active ? 1.34 * pulse : 1 * pulse);
    parts.halo.rotation.z = elapsed * (active ? .72 : .28);
    parts.core.material.emissiveIntensity = active ? 1.12 : (stage.state === '未解放' ? .14 : .5);
    parts.label.material.opacity = active ? .98 : (stage.state === '未解放' ? .42 : .72);
  }

  selectionA.rotation.z = elapsed * .7;
  selectionB.rotation.z = -elapsed * .42;
  selectionRing.visible = Boolean(selected);
  updateCamera();
  renderer.render(scene, camera);
}

canvas.addEventListener('pointerdown', onPointerDown);
canvas.addEventListener('pointermove', onPointerMove);
canvas.addEventListener('pointerup', onPointerUp);
canvas.addEventListener('pointercancel', () => { drag.active = false; });
canvas.addEventListener('wheel', onWheel, { passive: false });
window.addEventListener('resize', onResize);
sheetToggle.addEventListener('click', () => setSheetExpanded(!hudEl.classList.contains('is-expanded')));
resetBtn.addEventListener('click', resetView);
deployBtn.addEventListener('click', () => {
  descEl.textContent = `${selected.title}を選択しました。ここに既存の出撃処理を接続できます。`;
  setSheetExpanded(true);
});

selectStage(selected);
setSheetExpanded(false);
resetView();
animate();
