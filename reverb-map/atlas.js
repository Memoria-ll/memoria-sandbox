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
  width: 1700,
  height: 1120,
  cameraX: 0,
  cameraY: 0,
  zoom: 0.78,
  targetX: 0,
  targetY: 0,
  targetZoom: 0.78,
};

const base = {
  id: 'base',
  title: '観測拠点',
  state: '拠点',
  depth: '帰還地点',
  echo: '—',
  desc: '各バイオームへの出撃と帰還を行う拠点。還響域の外縁に置かれた、かろうじて音が安定する場所。',
  x: 545,
  y: 555,
  color: '#eee4c7',
  base: true,
};

const biomes = [
  {
    id: 'anechoic-hall',
    title: '無響の広間',
    state: '到達可能',
    depth: '近接域 / 深度1',
    echo: '+3',
    desc: '拠点から最も近い最初のバイオーム。広すぎる室内のような空間で、足音だけが吸われて戻らない。',
    x: 720,
    y: 520,
    color: '#eee4c7',
    fill: '#3b3326',
    points: [[625,430],[742,382],[850,452],[872,570],[790,660],[658,632],[594,540]],
  },
  {
    id: 'glass-hollow',
    title: '硝子の空洞',
    state: '未攻略',
    depth: '広間奥 / 深度2',
    echo: '+0',
    desc: '無響の広間の少し先で開く透明な空洞。見える距離と響く距離が一致せず、探索者の距離感を狂わせる。',
    x: 950,
    y: 430,
    color: '#9fe7ff',
    fill: '#25475d',
    points: [[862,352],[982,306],[1098,380],[1120,500],[1014,592],[888,540]],
  },
  {
    id: 'pipe-city',
    title: '軋む配管都市',
    state: '未攻略',
    depth: '遠隔北東域 / 深度3',
    echo: '+0',
    desc: '拠点からかなり離れた廃都市。建物のように絡む配管が、風もないのに軋み続けている。',
    x: 1260,
    y: 260,
    color: '#b6a2ff',
    fill: '#342f4e',
    points: [[1096,178],[1268,112],[1430,210],[1474,366],[1340,480],[1148,424],[1054,292]],
  },
  {
    id: 'weeping-forest',
    title: '啜り泣く樹海',
    state: '到達可能',
    depth: '西域 / 深度2',
    echo: '+8',
    desc: '拠点とは別方向に広がる樹海。葉擦れの奥で、泣き声に似た残響が途切れず続く。',
    x: 300,
    y: 310,
    color: '#7ee0ad',
    fill: '#213b31',
    points: [[160,250],[292,152],[446,204],[510,352],[404,484],[220,456],[114,334]],
  },
  {
    id: 'bell-valley',
    title: '鳴鐘の谷',
    state: '地域接続',
    depth: '樹海外縁 / 深度2',
    echo: '+5',
    desc: '樹海と砂海の間に刻まれた谷。遠くの衝撃が遅れて鐘のように鳴り、進路の目印になる。',
    x: 350,
    y: 595,
    color: '#d8c176',
    fill: '#3f3824',
    points: [[224,500],[370,454],[502,568],[454,718],[282,744],[172,638]],
  },
  {
    id: 'humming-sand',
    title: '唸る砂海',
    state: '未攻略',
    depth: '南西域 / 深度3',
    echo: '+0',
    desc: '樹海の先、谷を越えたところに広がる砂の海。風ではなく地中の残響が砂丘を震わせている。',
    x: 545,
    y: 875,
    color: '#e1bd73',
    fill: '#5a4324',
    points: [[326,790],[530,688],[736,774],[774,948],[604,1040],[388,1012],[270,900]],
  },
  {
    id: 'silent-sea',
    title: '沈黙海',
    state: '未解放',
    depth: '外縁域 / 深度5',
    echo: '+0',
    desc: '砂海のさらに外側に広がる静かな海域。音の欠落が潮のように満ち、地図上の境界を曖昧にする。',
    x: 960,
    y: 900,
    color: '#8790ad',
    fill: '#292e43',
    points: [[810,790],[998,710],[1218,824],[1170,1046],[940,1092],[764,984]],
    locked: true,
  },
];

const lorePoints = [
  { id:'lore-forest', title:'響森圏', parent:'啜り泣く樹海', x:372, y:420, color:'#7ee0ad', desc:'かつて森の共鳴域として記録されていた浅層一帯。現在は啜り泣く樹海の外縁名として残っている。' },
  { id:'lore-cave', title:'石窟帯', parent:'軋む配管都市', x:1128, y:394, color:'#b6a2ff', desc:'配管都市の地下側に広がる旧石窟名。硬質な反響が装備素材の選別に使われる。' },
  { id:'lore-hollow', title:'空洞律域', parent:'硝子の空洞', x:1032, y:555, color:'#9fe7ff', desc:'硝子の空洞の深部にある律動域。空間そのものが一定周期で鳴り、通路の距離感を狂わせる。' },
  { id:'lore-sea', title:'沈黙海旧記録', parent:'沈黙海', x:1110, y:978, color:'#8790ad', desc:'沈黙海の古い観測名。現在は外縁域全体の呼称として統合されている。' },
  { id:'lore-core', title:'無響核周辺', parent:'沈黙海', x:865, y:1020, color:'#9ca2c2', desc:'沈黙海のさらに先にあるとされる外周帯。現在の地図では輪郭だけが記録されている。' },
  { id:'lore-reef', title:'残響礁', parent:'沈黙海', x:1030, y:790, color:'#8fa5d6', desc:'沈黙海に点在する薄い残響の溜まり場。攻略地点ではなく、未踏域の手掛かりとして扱われる。' },
  { id:'lore-bridge', title:'断響橋', parent:'鳴鐘の谷', x:486, y:660, color:'#d8c176', desc:'鳴鐘の谷から別領域へ伸びる古い響道。途中で音が途切れるため、帰還経路としては不安定。' },
  { id:'lore-hollow2', title:'空洞律', parent:'無響の広間', x:812, y:610, color:'#eee4c7', desc:'無響の広間で観測される局所的な法則名。広間内部の一部では、反響ではなく沈黙そのものが周期を持つ。' },
];

const nodes = [base, ...biomes, ...lorePoints.map(point => ({
  ...point,
  state: '地域情報',
  depth: point.parent,
  echo: '記録',
  infoOnly: true,
}))];

const routePairs = [
  ['base','anechoic-hall'],
  ['anechoic-hall','glass-hollow'],
  ['glass-hollow','pipe-city'],
  ['base','weeping-forest'],
  ['weeping-forest','bell-valley'],
  ['bell-valley','humming-sand'],
  ['humming-sand','silent-sea'],
  ['anechoic-hall','bell-valley'],
  ['glass-hollow','silent-sea'],
];

const nodeById = new Map(nodes.map(node => [node.id, node]));
let selected = base;
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
  const g = ctx.createRadialGradient(window.innerWidth * .48, window.innerHeight * .48, 50, window.innerWidth * .48, window.innerHeight * .48, Math.max(window.innerWidth, window.innerHeight));
  g.addColorStop(0, '#211912');
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
  drawDistanceRings();
  drawLatLines();
  biomes.forEach(drawLandmass);
  drawFarFog();
  drawRoutes();
  drawBasePulse();
  drawBiomeLabels();
  biomes.forEach(drawBiomeNode);
  lorePoints.forEach(drawLorePoint);
  drawBase();
  drawCompass();
}

function drawParchment() {
  ctx.save();
  ctx.translate(80, 54);
  roundedPath(0, 0, map.width - 160, map.height - 108, 22);
  const g = ctx.createRadialGradient(map.width / 2, map.height / 2, 80, map.width / 2, map.height / 2, 980);
  g.addColorStop(0, '#3a2a1a');
  g.addColorStop(.56, '#171419');
  g.addColorStop(1, '#09080b');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = 'rgba(214,184,107,.36)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.globalAlpha = .16;
  for (let i = 0; i < 76; i++) {
    ctx.beginPath();
    ctx.strokeStyle = i % 2 ? '#d6b86b' : '#eee4c7';
    ctx.lineWidth = .6;
    const y = 20 + i * 15;
    ctx.moveTo(22, y);
    for (let x = 22; x < map.width - 182; x += 50) ctx.lineTo(x, y + Math.sin(x * .012 + i) * 4);
    ctx.stroke();
  }
  ctx.restore();
}

function drawDistanceRings() {
  ctx.save();
  ctx.translate(base.x, base.y);
  ctx.strokeStyle = 'rgba(214,184,107,.14)';
  ctx.lineWidth = 1;
  [190, 420, 680].forEach((r, i) => {
    ctx.setLineDash(i === 1 ? [12, 10] : []);
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();
  });
  ctx.setLineDash([]);
  ctx.restore();
}

function drawLatLines() {
  ctx.save();
  ctx.strokeStyle = 'rgba(238,228,199,.07)';
  ctx.lineWidth = 1;
  for (let x = 160; x <= 1520; x += 160) {
    ctx.beginPath();
    ctx.moveTo(x, 100);
    ctx.lineTo(x, 1020);
    ctx.stroke();
  }
  for (let y = 150; y <= 1000; y += 150) {
    ctx.beginPath();
    ctx.moveTo(110, y);
    ctx.lineTo(1590, y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawLandmass(land) {
  ctx.save();
  const path = new Path2D();
  land.points.forEach(([x, y], i) => i ? path.lineTo(x, y) : path.moveTo(x, y));
  path.closePath();

  ctx.shadowColor = land.color;
  ctx.shadowBlur = selected.id === land.id ? 28 : 14;
  ctx.fillStyle = land.fill;
  ctx.globalAlpha = selected.id === land.id ? .94 : .78;
  ctx.fill(path);
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
  ctx.strokeStyle = land.color;
  ctx.lineWidth = selected.id === land.id ? 4 : 2.4;
  ctx.stroke(path);

  ctx.globalAlpha = .15;
  ctx.strokeStyle = '#eee4c7';
  ctx.lineWidth = 1;
  ctx.setLineDash([10, 16]);
  ctx.stroke(path);
  ctx.setLineDash([]);
  ctx.restore();
}

function drawFarFog() {
  ctx.save();
  const fog = ctx.createRadialGradient(960, 920, 80, 960, 920, 310);
  fog.addColorStop(0, 'rgba(22,28,45,.1)');
  fog.addColorStop(.58, 'rgba(14,17,31,.46)');
  fog.addColorStop(1, 'rgba(5,5,10,.02)');
  ctx.fillStyle = fog;
  ctx.fillRect(720, 660, 540, 430);
  ctx.globalAlpha = .18;
  ctx.strokeStyle = '#9aa7c9';
  ctx.lineWidth = 1;
  for (let i = 0; i < 15; i++) {
    ctx.beginPath();
    const y = 730 + i * 24;
    ctx.moveTo(760, y);
    for (let x = 760; x < 1220; x += 42) ctx.lineTo(x, y + Math.sin(x * .025 + i + time) * 9);
    ctx.stroke();
  }
  ctx.restore();
}

function drawRoutes() {
  routePairs.forEach(([a, b], index) => {
    const from = nodeById.get(a);
    const to = nodeById.get(b);
    const locked = from.locked || to.locked;
    const active = selected.id === a || selected.id === b;
    ctx.save();
    ctx.strokeStyle = locked ? 'rgba(160,156,170,.24)' : active ? 'rgba(134,231,191,.9)' : 'rgba(214,184,107,.58)';
    ctx.lineWidth = active ? 5 : locked ? 2 : 3.5;
    ctx.setLineDash(locked ? [10, 10] : []);
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    const cx = (from.x + to.x) / 2 + Math.sin(index * 1.7) * 30;
    const cy = (from.y + to.y) / 2 + Math.cos(index * 1.1) * 26;
    ctx.quadraticCurveTo(cx, cy, to.x, to.y);
    ctx.stroke();
    ctx.setLineDash([]);

    if (!locked) {
      const t = (time * .18 + index * .13) % 1;
      const p = quadPoint(from, {x:cx, y:cy}, to, t);
      ctx.fillStyle = active ? '#eee4c7' : '#86e7bf';
      ctx.shadowColor = '#86e7bf';
      ctx.shadowBlur = active ? 18 : 10;
      ctx.beginPath();
      ctx.arc(p.x, p.y, active ? 6 : 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  });
}

function drawBasePulse() {
  ctx.save();
  ctx.translate(base.x, base.y);
  for (let i = 0; i < 4; i++) {
    const r = 48 + i * 22 + Math.sin(time * 1.6 + i) * 4;
    ctx.strokeStyle = `rgba(238,228,199,${0.2 - i * 0.035})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawBiomeLabels() {
  biomes.forEach(biome => {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = selected.id === biome.id ? '600 40px serif' : '600 34px serif';
    ctx.fillStyle = selected.id === biome.id ? '#fff0be' : 'rgba(238,228,199,.72)';
    ctx.shadowColor = '#040408';
    ctx.shadowBlur = 18;
    ctx.fillText(biome.title, biome.x, biome.y + 58);
    ctx.font = '13px serif';
    ctx.fillStyle = 'rgba(214,184,107,.58)';
    ctx.fillText('BIOME', biome.x, biome.y + 88);
    ctx.restore();
  });
}

function drawBiomeNode(node) {
  const active = selected.id === node.id;
  const hover = hovered?.id === node.id;
  const r = active ? 24 : hover ? 21 : 18;
  ctx.save();
  ctx.translate(node.x, node.y);
  ctx.fillStyle = 'rgba(0,0,0,.25)';
  ctx.beginPath();
  ctx.ellipse(0, 28, r * 1.6, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = node.locked ? '#202333' : node.color;
  ctx.strokeStyle = node.color;
  ctx.lineWidth = active ? 4 : 2.6;
  ctx.shadowColor = node.color;
  ctx.shadowBlur = active ? 30 : node.locked ? 4 : 14;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.strokeStyle = active ? '#d6b86b' : 'rgba(238,228,199,.28)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, r + 12 + Math.sin(time * 2.2) * (active ? 3 : 0), 0, Math.PI * 2);
  ctx.stroke();

  if (node.locked) {
    ctx.fillStyle = 'rgba(238,228,199,.46)';
    ctx.font = '22px serif';
    ctx.textAlign = 'center';
    ctx.fillText('×', 0, 7);
  }
  ctx.restore();
}

function drawBase() {
  const active = selected.id === base.id;
  ctx.save();
  ctx.translate(base.x, base.y);
  ctx.fillStyle = 'rgba(0,0,0,.32)';
  ctx.beginPath();
  ctx.ellipse(0, 30, 58, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowColor = '#eee4c7';
  ctx.shadowBlur = active ? 34 : 22;
  ctx.fillStyle = '#eee4c7';
  ctx.strokeStyle = '#d6b86b';
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + i * Math.PI * 2 / 10 + time * .05;
    const r = i % 2 ? 25 : 36;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#fff0be';
  ctx.font = '600 30px serif';
  ctx.textAlign = 'center';
  ctx.shadowColor = '#040408';
  ctx.shadowBlur = 16;
  ctx.fillText(base.title, 0, 65);
  ctx.font = '13px serif';
  ctx.fillStyle = 'rgba(214,184,107,.64)';
  ctx.fillText('BASE', 0, 91);
  ctx.restore();
}

function drawLorePoint(point) {
  const node = nodeById.get(point.id);
  const active = selected.id === point.id;
  const hover = hovered?.id === point.id;
  ctx.save();
  ctx.translate(point.x, point.y);
  ctx.globalAlpha = active ? 1 : .78;
  ctx.fillStyle = active ? point.color : 'rgba(238,228,199,.44)';
  ctx.strokeStyle = point.color;
  ctx.lineWidth = active ? 2.5 : 1.4;
  ctx.shadowColor = point.color;
  ctx.shadowBlur = active || hover ? 16 : 4;
  ctx.beginPath();
  ctx.rect(-8, -8, 16, 16);
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.fillStyle = active ? '#fff0be' : 'rgba(238,228,199,.56)';
  ctx.font = active ? '18px serif' : '15px serif';
  ctx.textAlign = 'center';
  ctx.shadowColor = '#040408';
  ctx.shadowBlur = 10;
  ctx.fillText(node.title, 0, 18);
  ctx.restore();
}

function drawCompass() {
  ctx.save();
  ctx.translate(1510, 160);
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
  return {
    x: (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * c.x + t * t * b.x,
    y: (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * c.y + t * t * b.y,
  };
}

function selectNode(node, focus = true) {
  selected = node;
  sheetTitleEl.textContent = node.title;
  sheetStateEl.textContent = node.state;
  titleEl.textContent = node.title;
  descEl.textContent = node.desc;
  stateEl.textContent = node.state;
  depthEl.textContent = node.depth;
  echoEl.textContent = node.echo;
  deployBtn.disabled = Boolean(node.locked || node.infoOnly || node.base);
  deployBtn.textContent = node.infoOnly ? '情報のみ' : node.base ? '拠点' : node.locked ? '未解放' : 'このバイオームへ出撃';
  if (focus) {
    map.targetX = map.width / 2 - node.x;
    map.targetY = map.height / 2 - node.y;
    map.targetZoom = node.infoOnly ? Math.max(map.targetZoom, 1.1) : Math.max(map.targetZoom, .88);
  }
}

function setSheetExpanded(expanded) {
  hudEl.classList.toggle('is-expanded', expanded);
  hudEl.setAttribute('aria-expanded', String(expanded));
}

function hitTest(clientX, clientY) {
  const p = screenToWorld(clientX, clientY);
  for (let i = nodes.length - 1; i >= 0; i--) {
    const node = nodes[i];
    const radius = node.infoOnly ? 28 : node.base ? 58 : 42;
    if (Math.hypot(p.x - node.x, p.y - node.y) < radius / map.zoom) return node;
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
  const node = hitTest(event.clientX, event.clientY);
  if (!moved && node) selectNode(node);
});

canvas.addEventListener('pointercancel', () => { dragging = false; });

canvas.addEventListener('wheel', event => {
  event.preventDefault();
  const before = screenToWorld(event.clientX, event.clientY);
  const factor = event.deltaY > 0 ? .9 : 1.1;
  map.targetZoom = Math.max(.45, Math.min(1.75, map.targetZoom * factor));
  const after = screenToWorld(event.clientX, event.clientY);
  map.targetX += after.x - before.x;
  map.targetY += after.y - before.y;
}, { passive: false });

sheetToggle.addEventListener('click', () => setSheetExpanded(!hudEl.classList.contains('is-expanded')));
resetBtn.addEventListener('click', () => {
  map.targetX = 0;
  map.targetY = 0;
  map.targetZoom = .78;
});
deployBtn.addEventListener('click', () => {
  descEl.textContent = `${selected.title}を選択しました。ここに既存の出撃処理を接続できます。`;
  setSheetExpanded(true);
});
window.addEventListener('resize', resize);

resize();
selectNode(selected, false);
draw();
