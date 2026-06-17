const canvas = document.getElementById('atlas-canvas');
const ctx = canvas.getContext('2d');
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

const map = {
  width: 1600,
  height: 1050,
  cameraX: 0,
  cameraY: 0,
  zoom: 0.82,
  targetX: 0,
  targetY: 0,
  targetZoom: 0.82,
};

const landmasses = [
  {
    name: '響森圏',
    fill: '#263f35',
    stroke: '#87d0a8',
    points: [[168,286],[250,188],[392,160],[512,222],[555,340],[490,456],[337,500],[206,430]],
    label: [340,328]
  },
  {
    name: '石窟帯',
    fill: '#38314e',
    stroke: '#a89ee9',
    points: [[528,388],[630,306],[780,318],[900,428],[858,570],[688,628],[552,548]],
    label: [705,470]
  },
  {
    name: '空洞律域',
    fill: '#54303d',
    stroke: '#e08495',
    points: [[850,215],[1044,160],[1188,246],[1222,410],[1122,540],[944,528],[808,392]],
    label: [1030,348]
  },
  {
    name: '沈黙海',
    fill: '#222d45',
    stroke: '#7187b8',
    points: [[984,604],[1130,538],[1372,576],[1490,736],[1426,930],[1214,978],[1046,856]],
    label: [1248,750]
  },
  {
    name: '無響核周辺',
    fill: '#2b2f43',
    stroke: '#8a91b4',
    points: [[448,694],[610,630],[796,696],[850,846],[724,966],[518,944],[398,824]],
    label: [636,800]
  }
];

const routes = [
  ['forest-gate','forest-core'], ['forest-core','moss-choir'], ['forest-core','stone-throat'],
  ['stone-throat','cave'], ['cave','broken-bridge'], ['broken-bridge','hollow'],
  ['hollow','red-lattice'], ['red-lattice','silent-coast'], ['silent-coast','silent-sea'],
  ['silent-sea','echo-reef'], ['broken-bridge','core-rim'], ['core-rim','core'], ['moss-choir','core-rim']
];

const stages = [
  { id:'forest-gate', title:'森の入口', area:'響森圏', x:245, y:335, state:'攻略済み', depth:'深度1 / 階層10', echo:'+4', desc:'もっとも浅い還響域。残響の流れがまだ穏やかに揺れている。', color:'#86e7bf' },
  { id:'forest-core', title:'森の共鳴', area:'響森圏', x:385, y:318, state:'攻略済み', depth:'深度1 / 階層30', echo:'+12', desc:'響森圏の中心にある安定した共鳴点。周辺の街道がここから分岐する。', color:'#86e7bf' },
  { id:'moss-choir', title:'苔むす合唱路', area:'響森圏', x:332, y:442, state:'攻略中', depth:'深度2 / 階層8', echo:'+0', desc:'湿った壁面に声が滲む。余響を集めやすい小径。', color:'#a5ecc9' },
  { id:'stone-throat', title:'石喉の入口', area:'石窟帯', x:604, y:430, state:'攻略済み', depth:'深度2 / 階層12', echo:'+7', desc:'硬い反響が短く返る。装備更新の起点になる。', color:'#b5a9ff' },
  { id:'cave', title:'石窟の反響', area:'石窟帯', x:735, y:498, state:'攻略中', depth:'深度2 / 階層18', echo:'+0', desc:'反響が岩肌を伝って遅れて戻る。装備の質が少し上がる。', color:'#a99bff' },
  { id:'broken-bridge', title:'断響橋', area:'石窟帯', x:850, y:398, state:'未攻略', depth:'深度2 / 階層25', echo:'+0', desc:'響きの橋が途中で途切れている。次の領域への分岐点。', color:'#d0c8ff' },
  { id:'hollow', title:'空洞律', area:'空洞律域', x:1028, y:335, state:'沈点未討伐', depth:'深度3 / 階層0', echo:'+0', desc:'静寂の霧が濃い。沈点の気配が進行路を歪ませている。', color:'#e57b91', boss:true },
  { id:'red-lattice', title:'赤い格子庭', area:'空洞律域', x:1125, y:470, state:'未攻略', depth:'深度3 / 階層12', echo:'+0', desc:'格子状に残響が閉じ込められている。分岐先を見失いやすい。', color:'#e6939f' },
  { id:'silent-coast', title:'沈黙の岸', area:'沈黙海', x:1110, y:640, state:'未解放', depth:'深度4 / 階層0', echo:'+0', desc:'音が水面に吸われる沿岸部。未踏域の入口。', color:'#7e91bd', locked:true },
  { id:'silent-sea', title:'沈黙海', area:'沈黙海', x:1280, y:760, state:'未解放', depth:'深度4 / 階層0', echo:'+0', desc:'未踏域。到達するまで地形の輪郭しか見えない。', color:'#7484ae', locked:true },
  { id:'echo-reef', title:'残響礁', area:'沈黙海', x:1212, y:890, state:'未解放', depth:'深度4 / 階層18', echo:'+0', desc:'沈黙海に浮かぶ小さな礁。薄い声だけが周囲を巡っている。', color:'#8497c6', locked:true },
  { id:'core-rim', title:'核縁部', area:'無響核周辺', x:648, y:730, state:'未解放', depth:'深度5 / 階層0', echo:'+0', desc:'無響核へ続く境界。周囲の音が低く沈んでいる。', color:'#9ba0bf', locked:true },
  { id:'core', title:'無響核', area:'無響核周辺', x:638, y:882, state:'未解放', depth:'深度5 / 階層0', echo:'+0', desc:'最深部に沈む核。現在は静寂に覆われている。', color:'#777d9e', locked:true }
];

const stageById = new Map(stages.map(stage => [stage.id, stage]));
let selected = stageById.get('forest-core');
let hovered = null;
let dragging = false;
let moved = false;
let lastX = 0;
let lastY = 0;
let time = 0;

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function worldToScreen(x, y) {
  return {
    x: window.innerWidth / 2 + (x - map.width / 2 + map.cameraX) * map.zoom,
    y: window.innerHeight / 2 + (y - map.height / 2 + map.cameraY) * map.zoom,
  };
}

function screenToWorld(x, y) {
  return {
    x: (x - window.innerWidth / 2) / map.zoom + map.width / 2 - map.cameraX,
    y: (y - window.innerHeight / 2) / map.zoom + map.height / 2 - map.cameraY,
  };
}

function draw() {
  time += 0.016;
  map.cameraX += (map.targetX - map.cameraX) * 0.1;
  map.cameraY += (map.targetY - map.cameraY) * 0.1;
  map.zoom += (map.targetZoom - map.zoom) * 0.12;

  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  drawBackdrop();
  ctx.save();
  const origin = worldToScreen(0, 0);
  ctx.translate(origin.x, origin.y);
  ctx.scale(map.zoom, map.zoom);
  drawMapLayer();
  ctx.restore();
  drawOverlay();
  requestAnimationFrame(draw);
}

function drawBackdrop() {
  const g = ctx.createRadialGradient(window.innerWidth * .52, window.innerHeight * .45, 40, window.innerWidth * .52, window.innerHeight * .45, Math.max(window.innerWidth, window.innerHeight));
  g.addColorStop(0, '#201911');
  g.addColorStop(.55, '#0b0b12');
  g.addColorStop(1, '#030306');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

  ctx.save();
  ctx.globalAlpha = .08;
  for (let i = 0; i < 220; i++) {
    const x = (i * 97) % window.innerWidth;
    const y = (i * 53) % window.innerHeight;
    ctx.fillStyle = i % 3 ? '#f1d89a' : '#86e7bf';
    ctx.fillRect(x, y, 1.4, 1.4);
  }
  ctx.restore();
}

function drawMapLayer() {
  drawParchment();
  drawLatLines();
  landmasses.forEach(drawLandmass);
  drawUnknownFog();
  drawRoutes();
  drawLabels();
  stages.forEach(drawStagePin);
  drawCompass();
}

function drawParchment() {
  ctx.save();
  ctx.translate(80, 54);
  roundedPath(0, 0, map.width - 160, map.height - 108, 22);
  const g = ctx.createRadialGradient(map.width / 2, map.height / 2, 80, map.width / 2, map.height / 2, 920);
  g.addColorStop(0, '#382818');
  g.addColorStop(.56, '#171419');
  g.addColorStop(1, '#09080b');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = 'rgba(214,184,107,.36)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.globalAlpha = .18;
  for (let i = 0; i < 70; i++) {
    ctx.beginPath();
    ctx.strokeStyle = i % 2 ? '#d6b86b' : '#eee4c7';
    ctx.lineWidth = .6;
    const y = 20 + i * 16;
    ctx.moveTo(22, y);
    for (let x = 22; x < map.width - 182; x += 50) ctx.lineTo(x, y + Math.sin(x * .012 + i) * 4);
    ctx.stroke();
  }
  ctx.restore();
}

function drawLatLines() {
  ctx.save();
  ctx.strokeStyle = 'rgba(238,228,199,.08)';
  ctx.lineWidth = 1;
  for (let x = 160; x <= 1440; x += 160) {
    ctx.beginPath();
    ctx.moveTo(x, 100);
    ctx.lineTo(x, 960);
    ctx.stroke();
  }
  for (let y = 150; y <= 900; y += 150) {
    ctx.beginPath();
    ctx.moveTo(110, y);
    ctx.lineTo(1490, y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawLandmass(land) {
  ctx.save();
  const path = new Path2D();
  land.points.forEach(([x, y], i) => i ? path.lineTo(x, y) : path.moveTo(x, y));
  path.closePath();

  ctx.shadowColor = land.stroke;
  ctx.shadowBlur = 18;
  ctx.fillStyle = land.fill;
  ctx.globalAlpha = .82;
  ctx.fill(path);
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
  ctx.strokeStyle = land.stroke;
  ctx.lineWidth = 3;
  ctx.stroke(path);

  ctx.globalAlpha = .16;
  ctx.strokeStyle = '#eee4c7';
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    const offset = 11 + i * 16;
    ctx.setLineDash([8 + i * 2, 14]);
    ctx.stroke(path);
    ctx.translate(Math.sin(i) * 1.4, Math.cos(i) * 1.4);
  }
  ctx.setLineDash([]);
  ctx.restore();
}

function drawUnknownFog() {
  ctx.save();
  const fog = ctx.createRadialGradient(1260, 795, 70, 1260, 795, 330);
  fog.addColorStop(0, 'rgba(22,28,45,.15)');
  fog.addColorStop(.58, 'rgba(14,17,31,.48)');
  fog.addColorStop(1, 'rgba(5,5,10,.02)');
  ctx.fillStyle = fog;
  ctx.fillRect(900, 460, 610, 540);
  ctx.globalAlpha = .18;
  ctx.strokeStyle = '#9aa7c9';
  ctx.lineWidth = 1;
  for (let i = 0; i < 18; i++) {
    ctx.beginPath();
    const y = 520 + i * 24;
    ctx.moveTo(940, y);
    for (let x = 940; x < 1490; x += 42) ctx.lineTo(x, y + Math.sin(x * .025 + i + time) * 9);
    ctx.stroke();
  }
  ctx.restore();
}

function drawRoutes() {
  routes.forEach(([a, b], index) => {
    const from = stageById.get(a);
    const to = stageById.get(b);
    const unlocked = !from.locked && !to.locked;
    ctx.save();
    ctx.strokeStyle = unlocked ? 'rgba(214,184,107,.72)' : 'rgba(160,156,170,.26)';
    ctx.lineWidth = unlocked ? 4 : 2;
    ctx.setLineDash(unlocked ? [] : [10, 10]);
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    const cx = (from.x + to.x) / 2 + Math.sin(index * 1.7) * 38;
    const cy = (from.y + to.y) / 2 + Math.cos(index * 1.1) * 30;
    ctx.quadraticCurveTo(cx, cy, to.x, to.y);
    ctx.stroke();
    if (unlocked) {
      const t = (time * .2 + index * .17) % 1;
      const p = quadPoint(from, {x:cx, y:cy}, to, t);
      ctx.fillStyle = '#86e7bf';
      ctx.shadowColor = '#86e7bf';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  });
}

function drawLabels() {
  landmasses.forEach(land => {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '600 38px serif';
    ctx.fillStyle = 'rgba(238,228,199,.72)';
    ctx.shadowColor = '#040408';
    ctx.shadowBlur = 18;
    ctx.fillText(land.name, land.label[0], land.label[1]);
    ctx.font = '14px serif';
    ctx.fillStyle = 'rgba(214,184,107,.58)';
    ctx.fillText('RESONANCE TERRITORY', land.label[0], land.label[1] + 34);
    ctx.restore();
  });
}

function drawStagePin(stage) {
  const isSelected = selected.id === stage.id;
  const isHovered = hovered?.id === stage.id;
  const r = isSelected ? 17 : isHovered ? 14 : 11;
  ctx.save();
  ctx.translate(stage.x, stage.y);

  ctx.fillStyle = 'rgba(0,0,0,.26)';
  ctx.beginPath();
  ctx.ellipse(0, 22, r * 1.5, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = stage.color;
  ctx.fillStyle = stage.locked ? '#202333' : stage.color;
  ctx.lineWidth = stage.boss ? 4 : 2.5;
  ctx.shadowColor = stage.color;
  ctx.shadowBlur = isSelected ? 28 : stage.locked ? 2 : 12;

  ctx.beginPath();
  if (stage.boss) {
    for (let i = 0; i < 8; i++) {
      const a = -Math.PI / 2 + i * Math.PI * 2 / 8;
      const rr = i % 2 ? r * .9 : r * 1.45;
      const x = Math.cos(a + time * .28) * rr;
      const y = Math.sin(a + time * .28) * rr;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.closePath();
  } else {
    ctx.arc(0, 0, r, 0, Math.PI * 2);
  }
  ctx.fill();
  ctx.stroke();

  ctx.shadowBlur = 0;
  ctx.strokeStyle = isSelected ? '#d6b86b' : 'rgba(238,228,199,.32)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, r + 10 + Math.sin(time * 2.4) * (isSelected ? 3 : 0), 0, Math.PI * 2);
  ctx.stroke();

  if (stage.locked) {
    ctx.fillStyle = 'rgba(238,228,199,.42)';
    ctx.font = '18px serif';
    ctx.textAlign = 'center';
    ctx.fillText('×', 0, 6);
  }

  ctx.fillStyle = isSelected ? '#fff0be' : 'rgba(238,228,199,.76)';
  ctx.font = `${isSelected ? 22 : 17}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.shadowColor = '#040408';
  ctx.shadowBlur = 12;
  ctx.fillText(stage.title, 0, r + 16);
  ctx.restore();
}

function drawCompass() {
  ctx.save();
  ctx.translate(1410, 160);
  ctx.strokeStyle = 'rgba(214,184,107,.55)';
  ctx.fillStyle = 'rgba(214,184,107,.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 52, 0, Math.PI * 2);
  ctx.stroke();
  for (let i = 0; i < 8; i++) {
    ctx.rotate(Math.PI / 4);
    ctx.beginPath();
    ctx.moveTo(0, -48);
    ctx.lineTo(6, -12);
    ctx.lineTo(0, -20);
    ctx.lineTo(-6, -12);
    ctx.closePath();
    ctx.fill();
  }
  ctx.font = '18px serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(238,228,199,.72)';
  ctx.fillText('N', 0, -68);
  ctx.restore();
}

function drawOverlay() {
  const vignette = ctx.createRadialGradient(window.innerWidth / 2, window.innerHeight / 2, window.innerHeight * .25, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight * .85);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, 'rgba(0,0,0,.55)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
}

function roundedPath(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
}

function quadPoint(a, c, b, t) {
  const x = (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * c.x + t * t * b.x;
  const y = (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * c.y + t * t * b.y;
  return { x, y };
}

function selectStage(stage, focus = true) {
  selected = stage;
  sheetTitleEl.textContent = stage.title;
  sheetStateEl.textContent = stage.state;
  titleEl.textContent = stage.title;
  descEl.textContent = stage.desc;
  stateEl.textContent = stage.state;
  depthEl.textContent = stage.depth;
  echoEl.textContent = stage.echo;
  deployBtn.disabled = Boolean(stage.locked);
  deployBtn.textContent = stage.locked ? '未解放' : 'このステージへ出撃';
  if (focus) {
    map.targetX = map.width / 2 - stage.x;
    map.targetY = map.height / 2 - stage.y;
    map.targetZoom = Math.max(map.targetZoom, 0.9);
  }
}

function setSheetExpanded(expanded) {
  hudEl.classList.toggle('is-expanded', expanded);
  hudEl.setAttribute('aria-expanded', String(expanded));
}

function hitTest(clientX, clientY) {
  const p = screenToWorld(clientX, clientY);
  for (let i = stages.length - 1; i >= 0; i--) {
    const stage = stages[i];
    const dx = p.x - stage.x;
    const dy = p.y - stage.y;
    if (Math.hypot(dx, dy) < 34 / map.zoom) return stage;
  }
  return null;
}

canvas.addEventListener('pointerdown', event => {
  dragging = true;
  moved = false;
  lastX = event.clientX;
  lastY = event.clientY;
  canvas.setPointerCapture(event.pointerId);
});

canvas.addEventListener('pointermove', event => {
  hovered = hitTest(event.clientX, event.clientY);
  canvas.style.cursor = hovered ? 'pointer' : dragging ? 'grabbing' : 'grab';
  if (!dragging) return;
  const dx = event.clientX - lastX;
  const dy = event.clientY - lastY;
  if (Math.abs(dx) + Math.abs(dy) > 4) moved = true;
  lastX = event.clientX;
  lastY = event.clientY;
  map.targetX += dx / map.zoom;
  map.targetY += dy / map.zoom;
});

canvas.addEventListener('pointerup', event => {
  dragging = false;
  canvas.releasePointerCapture(event.pointerId);
  const stage = hitTest(event.clientX, event.clientY);
  if (!moved && stage) selectStage(stage);
});

canvas.addEventListener('pointercancel', () => { dragging = false; });

canvas.addEventListener('wheel', event => {
  event.preventDefault();
  const before = screenToWorld(event.clientX, event.clientY);
  const factor = event.deltaY > 0 ? .9 : 1.1;
  map.targetZoom = Math.max(.48, Math.min(1.75, map.targetZoom * factor));
  const after = screenToWorld(event.clientX, event.clientY);
  map.targetX += after.x - before.x;
  map.targetY += after.y - before.y;
}, { passive: false });

sheetToggle.addEventListener('click', () => setSheetExpanded(!hudEl.classList.contains('is-expanded')));
resetBtn.addEventListener('click', () => {
  map.targetX = 0;
  map.targetY = 0;
  map.targetZoom = .82;
});
deployBtn.addEventListener('click', () => {
  descEl.textContent = `${selected.title}を選択しました。ここに既存の出撃処理を接続できます。`;
  setSheetExpanded(true);
});
window.addEventListener('resize', resize);

resize();
selectStage(selected, false);
draw();
