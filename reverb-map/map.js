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

const nodes = [
  {
    id: 'forest',
    title: '森の共鳴',
    desc: '深度1の終端。微かな残響がまだ地表に残っている。',
    state: '攻略済み',
    depth: '深度1 / 階層30',
    echo: '+12',
    position: [-5.2, 0.2, 2.2],
    color: 0x69d7bd,
    scale: 1.0
  },
  {
    id: 'cave',
    title: '石窟の反響',
    desc: '反響が岩肌を伝って遅れて戻る。装備の質が少し上がる。',
    state: '攻略中',
    depth: '深度2 / 階層18',
    echo: '+0',
    position: [-2.4, -0.35, .85],
    color: 0x9080d8,
    scale: 1.12
  },
  {
    id: 'hollow',
    title: '空洞律',
    desc: '静寂の霧が濃い。沈点の気配が進行路を歪ませている。',
    state: '沈点未討伐',
    depth: '深度3 / 階層0',
    echo: '+0',
    position: [0.5, -0.75, -0.8],
    color: 0xc45d7a,
    scale: 1.22
  },
  {
    id: 'silent-sea',
    title: '沈黙海',
    desc: '未踏域。到達するまで地形の輪郭しか見えない。',
    state: '未解放',
    depth: '深度4 / 階層0',
    echo: '+0',
    position: [3.4, -1.15, -2.1],
    color: 0x48516f,
    scale: .95
  },
  {
    id: 'core',
    title: '無響核',
    desc: '最深部に沈む核。現在は静寂に覆われている。',
    state: '未解放',
    depth: '深度5 / 階層0',
    echo: '+0',
    position: [6.1, -1.7, -3.2],
    color: 0x34384c,
    scale: .9
  }
];

let selected = nodes[0];
const pickables = [];
const nodeMeshes = new Map();
const clock = new THREE.Clock();
const pointer = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
const target = new THREE.Vector3(0, -0.35, -0.5);
const drag = {
  active: false,
  moved: false,
  x: 0,
  y: 0,
  yaw: 0,
  pitch: 0.72,
  radius: 11
};

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x05050a, 1);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x05050a, 0.058);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 120);

scene.add(new THREE.AmbientLight(0x8890aa, 1.4));
const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
keyLight.position.set(-3, 8, 5);
scene.add(keyLight);

const grid = new THREE.GridHelper(18, 32, 0x2d2b43, 0x171723);
grid.position.y = -2.05;
scene.add(grid);

const routePoints = nodes.map((node) => new THREE.Vector3(...node.position));
const routeCurve = new THREE.CatmullRomCurve3(routePoints);
const routeGeometry = new THREE.TubeGeometry(routeCurve, 160, 0.035, 10, false);
const routeMaterial = new THREE.MeshBasicMaterial({ color: 0x6e668f, transparent: true, opacity: 0.72 });
scene.add(new THREE.Mesh(routeGeometry, routeMaterial));

const glowRouteGeometry = new THREE.TubeGeometry(routeCurve, 160, 0.12, 12, false);
const glowRouteMaterial = new THREE.MeshBasicMaterial({ color: 0x69d7bd, transparent: true, opacity: 0.08 });
scene.add(new THREE.Mesh(glowRouteGeometry, glowRouteMaterial));

for (const node of nodes) {
  const group = new THREE.Group();
  group.position.set(...node.position);

  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.38 * node.scale, 1),
    new THREE.MeshStandardMaterial({
      color: node.color,
      emissive: node.color,
      emissiveIntensity: node.id === 'forest' ? 0.75 : 0.35,
      roughness: 0.35,
      metalness: 0.08
    })
  );
  core.userData.node = node;
  group.add(core);
  pickables.push(core);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.72 * node.scale, 0.012, 8, 80),
    new THREE.MeshBasicMaterial({ color: node.color, transparent: true, opacity: 0.55 })
  );
  ring.rotation.x = Math.PI * 0.5;
  group.add(ring);

  const vertical = new THREE.Mesh(
    new THREE.TorusGeometry(0.55 * node.scale, 0.01, 8, 80),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.14 })
  );
  vertical.rotation.y = Math.PI * 0.5;
  group.add(vertical);

  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.015, 0.015, 2.2, 8),
    new THREE.MeshBasicMaterial({ color: node.color, transparent: true, opacity: 0.18 })
  );
  stem.position.y = -1.05;
  group.add(stem);

  scene.add(group);
  nodeMeshes.set(node.id, { group, core, ring, vertical });
}

const particleCount = 420;
const particlePositions = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount; i++) {
  particlePositions[i * 3] = (Math.random() - 0.5) * 19;
  particlePositions[i * 3 + 1] = (Math.random() - 0.35) * 5;
  particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 13;
}
const particleGeometry = new THREE.BufferGeometry();
particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
const particleMaterial = new THREE.PointsMaterial({
  color: 0x9a90c8,
  size: 0.025,
  transparent: true,
  opacity: 0.5,
  depthWrite: false
});
const particles = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particles);

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

function selectNode(node) {
  selected = node;
  sheetTitleEl.textContent = node.title;
  sheetStateEl.textContent = node.state;
  titleEl.textContent = node.title;
  descEl.textContent = node.desc;
  stateEl.textContent = node.state;
  depthEl.textContent = node.depth;
  echoEl.textContent = node.echo;
  deployBtn.disabled = node.state === '未解放';
  deployBtn.textContent = node.state === '未解放' ? '未解放' : 'この還響域へ出撃';

  target.lerp(new THREE.Vector3(...node.position), 0.35);
}

function pickNode(event) {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(pickables, false);
  if (hits.length > 0) selectNode(hits[0].object.userData.node);
}

function resetView() {
  drag.yaw = 0;
  drag.pitch = 0.72;
  drag.radius = 11;
  target.set(0, -0.35, -0.5);
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
  drag.yaw -= dx * 0.006;
  drag.pitch = Math.max(0.2, Math.min(1.15, drag.pitch + dy * 0.004));
}

function onPointerUp(event) {
  if (!drag.active) return;
  drag.active = false;
  if (!drag.moved) pickNode(event);
  canvas.releasePointerCapture(event.pointerId);
}

function onWheel(event) {
  event.preventDefault();
  drag.radius = Math.max(5, Math.min(18, drag.radius + event.deltaY * 0.008));
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
  particles.rotation.y = elapsed * 0.018;

  for (const node of nodes) {
    const parts = nodeMeshes.get(node.id);
    const active = selected.id === node.id;
    const pulse = 1 + Math.sin(elapsed * 2.2 + node.position[0]) * 0.04;
    parts.group.scale.setScalar(active ? 1.18 * pulse : 1 * pulse);
    parts.ring.rotation.z = elapsed * (active ? 0.45 : 0.18);
    parts.vertical.rotation.x = elapsed * 0.22;
    parts.core.material.emissiveIntensity = active ? 1.05 : 0.32;
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

selectNode(selected);
setSheetExpanded(false);
resetView();
animate();
