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
  { title: '響森圏', position: [-5.4, -0.08, 3.0], radius: 2.35, color: 0x315f58 },
  { title: '石窟帯', position: [-1.8, -0.1, 1.0], radius: 2.05, color: 0x4b4476 },
  { title: '空洞律域', position: [2.25, -0.1, 1.65], radius: 2.25, color: 0x6a3449 },
  { title: '沈黙海', position: [4.9, -0.12, -2.3], radius: 2.75, color: 0x29314d },
  { title: '無響核周辺', position: [-1.15, -0.14, -3.35], radius: 2.35, color: 0x3d425d }
];

const stages = [
  {
    id: 'forest-gate',
    title: '森の入口',
    desc: 'もっとも浅い還響域。残響の流れがまだ穏やかに揺れている。',
    state: '攻略済み',
    depth: '深度1 / 階層10',
    echo: '+4',
    position: [-6.4, 0.18, 3.65],
    color: 0x69d7bd,
    scale: .82
  },
  {
    id: 'forest-core',
    title: '森の共鳴',
    desc: '深度1の終端。微かな残響がまだ地表に残っている。',
    state: '攻略済み',
    depth: '深度1 / 階層30',
    echo: '+12',
    position: [-4.75, 0.2, 2.6],
    color: 0x69d7bd,
    scale: 1.0
  },
  {
    id: 'moss-choir',
    title: '苔むす合唱路',
    desc: '湿った壁面に声が滲む。余響を集めやすい小径。',
    state: '攻略中',
    depth: '深度2 / 階層8',
    echo: '+0',
    position: [-5.95, 0.16, 1.45],
    color: 0x84d9b9,
    scale: .9
  },
  {
    id: 'stone-throat',
    title: '石喉の入口',
    desc: '硬い反響が短く返る。装備更新の起点になる。',
    state: '攻略済み',
    depth: '深度2 / 階層12',
    echo: '+7',
    position: [-2.65, 0.16, 1.7],
    color: 0x9b8cff,
    scale: .9
  },
  {
    id: 'cave',
    title: '石窟の反響',
    desc: '反響が岩肌を伝って遅れて戻る。装備の質が少し上がる。',
    state: '攻略中',
    depth: '深度2 / 階層18',
    echo: '+0',
    position: [-1.2, 0.22, .45],
    color: 0x9080d8,
    scale: 1.08
  },
  {
    id: 'broken-bridge',
    title: '断響橋',
    desc: '響きの橋が途中で途切れている。次の領域への分岐点。',
    state: '未攻略',
    depth: '深度2 / 階層25',
    echo: '+0',
    position: [.15, 0.18, 2.35],
    color: 0xb1a2ff,
    scale: .85
  },
  {
    id: 'hollow',
    title: '空洞律',
    desc: '静寂の霧が濃い。沈点の気配が進行路を歪ませている。',
    state: '沈点未討伐',
    depth: '深度3 / 階層0',
    echo: '+0',
    position: [2.2, 0.28, 2.0],
    color: 0xc45d7a,
    scale: 1.2
  },
  {
    id: 'red-lattice',
    title: '赤い格子庭',
    desc: '格子状に残響が閉じ込められている。分岐先を見失いやすい。',
    state: '未攻略',
    depth: '深度3 / 階層12',
    echo: '+0',
    position: [3.55, 0.18, .8],
    color: 0xd8748e,
    scale: .88
  },
  {
    id: 'silent-coast',
    title: '沈黙の岸',
    desc: '音が水面に吸われる沿岸部。未踏域の入口。',
    state: '未解放',
    depth: '深度4 / 階層0',
    echo: '+0',
    position: [3.75, 0.12, -1.3],
    color: 0x58627f,
    scale: .84
  },
  {
    id: 'silent-sea',
    title: '沈黙海',
    desc: '未踏域。到達するまで地形の輪郭しか見えない。',
    state: '未解放',
    depth: '深度4 / 階層0',
    echo: '+0',
    position: [5.65, 0.14, -2.75],
    color: 0x48516f,
    scale: 1.0
  },
  {
    id: 'echo-reef',
    title: '残響礁',
    desc: '沈黙海に浮かぶ小さな礁。薄い声だけが周囲を巡っている。',
    state: '未解放',
    depth: '深度4 / 階層18',
    echo: '+0',
    position: [3.65, 0.12, -3.65],
    color: 0x596b8f,
    scale: .78
  },
  {
    id: 'core-rim',
    title: '核縁部',
    desc: '無響核へ続く境界。周囲の音が低く沈んでいる。',
    state: '未解放',
    depth: '深度5 / 階層0',
    echo: '+0',
    position: [-.15, 0.12, -2.45],
    color: 0x626986,
    scale: .86
  },
  {
    id: 'core',
    title: '無響核',
    desc: '最深部に沈む核。現在は静寂に覆われている。',
    state: '未解放',
    depth: '深度5 / 階層0',
    echo: '+0',
    position: [-2.0, 0.2, -4.2],
    color: 0x34384c,
    scale: 1.12
  }
];

const links = [
  ['forest-gate', 'forest-core'],
  ['forest-core', 'moss-choir'],
  ['forest-core', 'stone-throat'],
  ['stone-throat', 'cave'],
  ['cave', 'broken-bridge'],
  ['broken-bridge', 'hollow'],
  ['hollow', 'red-lattice'],
  ['red-lattice', 'silent-coast'],
  ['silent-coast', 'silent-sea'],
  ['silent-sea', 'echo-reef'],
  ['broken-bridge', 'core-rim'],
  ['core-rim', 'core']
];

let selected = stages[1];
const pickables = [];
const stageMeshes = new Map();
const clock = new THREE.Clock();
const pointer = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
const target = new THREE.Vector3(0, 0, 0);
const drag = {
  active: false,
  moved: false,
  x: 0,
  y: 0,
  yaw: 0,
  pitch: 1.16,
  radius: 12.5
};

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x05050a, 1);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x05050a, 0.052);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 120);

scene.add(new THREE.AmbientLight(0x8890aa, 1.5));
const keyLight = new THREE.DirectionalLight(0xffffff, 1.9);
keyLight.position.set(-3, 8, 5);
scene.add(keyLight);

const grid = new THREE.GridHelper(18, 36, 0x2d2b43, 0x151521);
grid.position.y = -0.18;
scene.add(grid);

for (const region of regions) {
  const disc = new THREE.Mesh(
    new THREE.CircleGeometry(region.radius, 72),
    new THREE.MeshBasicMaterial({ color: region.color, transparent: true, opacity: 0.18, depthWrite: false })
  );
  disc.rotation.x = -Math.PI * 0.5;
  disc.position.set(...region.position);
  scene.add(disc);

  const rim = new THREE.Mesh(
    new THREE.RingGeometry(region.radius * .98, region.radius, 96),
    new THREE.MeshBasicMaterial({ color: region.color, transparent: true, opacity: 0.42, depthWrite: false })
  );
  rim.rotation.x = -Math.PI * 0.5;
  rim.position.set(region.position[0], region.position[1] + .012, region.position[2]);
  scene.add(rim);

  const label = makeLabel(region.title, region.color, .78);
  label.position.set(region.position[0], .35, region.position[2] - region.radius * .78);
  scene.add(label);
}

const stageById = new Map(stages.map((stage) => [stage.id, stage]));
for (const [fromId, toId] of links) {
  const from = new THREE.Vector3(...stageById.get(fromId).position);
  const to = new THREE.Vector3(...stageById.get(toId).position);
  const mid = from.clone().lerp(to, 0.5);
  mid.y += 0.12;
  const curve = new THREE.CatmullRomCurve3([from, mid, to]);
  const geometry = new THREE.TubeGeometry(curve, 32, 0.018, 8, false);
  const material = new THREE.MeshBasicMaterial({ color: 0x70678e, transparent: true, opacity: 0.62 });
  scene.add(new THREE.Mesh(geometry, material));
}

for (const stage of stages) {
  const group = new THREE.Group();
  group.position.set(...stage.position);

  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.17 * stage.scale, 24, 16),
    new THREE.MeshStandardMaterial({
      color: stage.color,
      emissive: stage.color,
      emissiveIntensity: stage.state === '未解放' ? 0.18 : 0.58,
      roughness: 0.28,
      metalness: 0.05
    })
  );
  core.userData.stage = stage;
  group.add(core);
  pickables.push(core);

  const halo = new THREE.Mesh(
    new THREE.RingGeometry(0.28 * stage.scale, 0.34 * stage.scale, 40),
    new THREE.MeshBasicMaterial({ color: stage.color, transparent: true, opacity: stage.state === '未解放' ? 0.24 : 0.52, depthWrite: false })
  );
  halo.rotation.x = -Math.PI * 0.5;
  group.add(halo);

  const pillar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.01, 0.01, 0.42, 8),
    new THREE.MeshBasicMaterial({ color: stage.color, transparent: true, opacity: 0.25 })
  );
  pillar.position.y = -0.18;
  group.add(pillar);

  if (stage.state === '沈点未討伐') {
    const bossRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.46 * stage.scale, 0.018, 8, 64),
      new THREE.MeshBasicMaterial({ color: 0xc45d7a, transparent: true, opacity: .72 })
    );
    bossRing.rotation.x = Math.PI * 0.5;
    group.add(bossRing);
  }

  const label = makeLabel(stage.title, stage.color, .62);
  label.position.set(0, .46, 0);
  group.add(label);

  scene.add(group);
  stageMeshes.set(stage.id, { group, core, halo });
}

const particleCount = 520;
const particlePositions = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount; i++) {
  particlePositions[i * 3] = (Math.random() - 0.5) * 18;
  particlePositions[i * 3 + 1] = Math.random() * 2.8 + 0.2;
  particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 12;
}
const particleGeometry = new THREE.BufferGeometry();
particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
const particleMaterial = new THREE.PointsMaterial({
  color: 0x9a90c8,
  size: 0.026,
  transparent: true,
  opacity: 0.42,
  depthWrite: false
});
const particles = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particles);

function makeLabel(text, color, scale) {
  const canvas2d = document.createElement('canvas');
  const context = canvas2d.getContext('2d');
  canvas2d.width = 512;
  canvas2d.height = 128;
  context.clearRect(0, 0, canvas2d.width, canvas2d.height);
  context.font = '600 34px sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.shadowColor = '#05050a';
  context.shadowBlur = 12;
  context.fillStyle = '#d6d3e8';
  context.fillText(text, 256, 64);
  const texture = new THREE.CanvasTexture(canvas2d);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({ map: texture, color, transparent: true, opacity: .86, depthWrite: false });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(2.4 * scale, .6 * scale, 1);
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

  target.lerp(new THREE.Vector3(stage.position[0], 0, stage.position[2]), 0.45);
}

function pickStage(event) {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
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
  drag.yaw -= dx * 0.0048;
  drag.pitch = Math.max(0.62, Math.min(1.36, drag.pitch + dy * 0.0032));
}

function onPointerUp(event) {
  if (!drag.active) return;
  drag.active = false;
  if (!drag.moved) pickStage(event);
  canvas.releasePointerCapture(event.pointerId);
}

function onWheel(event) {
  event.preventDefault();
  drag.radius = Math.max(7.5, Math.min(20, drag.radius + event.deltaY * 0.008));
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
  particles.rotation.y = elapsed * 0.01;

  for (const stage of stages) {
    const parts = stageMeshes.get(stage.id);
    const active = selected.id === stage.id;
    const pulse = 1 + Math.sin(elapsed * 2.4 + stage.position[0]) * 0.045;
    parts.group.scale.setScalar(active ? 1.38 * pulse : 1 * pulse);
    parts.halo.rotation.z = elapsed * (active ? 0.72 : 0.28);
    parts.core.material.emissiveIntensity = active ? 1.05 : (stage.state === '未解放' ? 0.16 : 0.48);
  }

  updateCamera();
  renderer.render(scene, camera);
}

canvas.addEventListener('pointerdown', onPointerDown);
canvas.addEventListener('pointermove', onPointerMove);
canvas.addEventListener('pointerup', onPointerUp);
canvas.addEventListener('pointercancel', () => { drag.active = false; });
canvas.addEventListener('wheel', onWheel, { passive: false });
window.addEventListener('resize', onResize);
sheetToggle.addEventListener('click', () => {
  setSheetExpanded(!hudEl.classList.contains('is-expanded'));
});
resetBtn.addEventListener('click', resetView);
deployBtn.addEventListener('click', () => {
  descEl.textContent = `${selected.title}を選択しました。ここに既存の出撃処理を接続できます。`;
  setSheetExpanded(true);
});

selectStage(selected);
setSheetExpanded(false);
resetView();
animate();
