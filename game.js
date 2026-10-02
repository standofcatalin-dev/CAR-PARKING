// =============================================================
//         BMW M5 F90 — 3D WORLD — LOW POLY STYLE
// =============================================================

// Показать ошибки на экране
window.addEventListener('error', function(e) {
  var el = document.getElementById('error');
  if (el) {
    el.style.display = 'block';
    el.textContent = '❌ ' + e.message + ' (' + (e.filename || '').split('/').pop() + ':' + e.lineno + ')';
  }
});

// Telegram
if (window.Telegram && window.Telegram.WebApp) {
  window.Telegram.WebApp.ready();
  window.Telegram.WebApp.expand();
}

// =============================================================
//                       СЦЕНА
// =============================================================
var scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x1a0033, 80, 320);

var camera = new THREE.PerspectiveCamera(
  55, window.innerWidth / window.innerHeight, 0.1, 600
);

var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// =============================================================
//                       СВЕТ (4 источника)
// =============================================================
// Ambient — общий фон
scene.add(new THREE.AmbientLight(0x8899bb, 1.0));

// Солнце — основной тёплый
var sun = new THREE.DirectionalLight(0xffccaa, 2.0);
sun.position.set(-40, 60, -30);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -30;
sun.shadow.camera.right = 30;
sun.shadow.camera.top = 30;
sun.shadow.camera.bottom = -30;
sun.shadow.camera.near = 1;
sun.shadow.camera.far = 200;
scene.add(sun);

// Задняя подсветка — холодная (rim light)
var rim = new THREE.DirectionalLight(0x6688ff, 1.2);
rim.position.set(30, 20, 40);
scene.add(rim);

// Ближний точечный свет (двигается с машиной)
var fill = new THREE.PointLight(0xffffff, 1.5, 25);
fill.position.set(0, 4, 0);
scene.add(fill);

// =============================================================
//                        НЕБО
// =============================================================
var skyMat = new THREE.ShaderMaterial({
  side: THREE.BackSide,
  uniforms: {
    top:    { value: new THREE.Color(0x0a0015) },
    mid:    { value: new THREE.Color(0x3a0a55) },
    bottom: { value: new THREE.Color(0xff0088) }
  },
  vertexShader:
    'varying vec3 vPos;' +
    'void main(){ vPos = position;' +
    'gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
  fragmentShader:
    'uniform vec3 top; uniform vec3 mid; uniform vec3 bottom;' +
    'varying vec3 vPos;' +
    'void main(){ float h = normalize(vPos).y; vec3 c;' +
    'if(h>0.0) c = mix(mid, top, h); else c = mix(mid, bottom, -h);' +
    'gl_FragColor = vec4(c,1.0); }'
});
scene.add(new THREE.Mesh(new THREE.SphereGeometry(350, 32, 16), skyMat));

// Солнце-диск
var sunDisk = new THREE.Mesh(
  new THREE.SphereGeometry(18, 32, 16),
  new THREE.MeshBasicMaterial({ color: 0xffcc00 })
);
sunDisk.position.set(-100, 40, -200);
scene.add(sunDisk);

var sunGlow = new THREE.Mesh(
  new THREE.SphereGeometry(40, 32, 16),
  new THREE.MeshBasicMaterial({ color: 0xff8800, transparent: true, opacity: 0.3 })
);
sunGlow.position.copy(sunDisk.position);
scene.add(sunGlow);

// Звёзды
var starsGeo = new THREE.BufferGeometry();
var starsCount = 1000;
var starsPos = new Float32Array(starsCount * 3);
for (var i = 0; i < starsCount; i++) {
  var r = 220 + Math.random() * 80;
  var theta = Math.random() * Math.PI * 2;
  var phi = Math.random() * Math.PI * 0.5;
  starsPos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
  starsPos[i * 3 + 1] = r * Math.cos(phi) + 30;
  starsPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
}
starsGeo.setAttribute('position', new THREE.BufferAttribute(starsPos, 3));
scene.add(new THREE.Points(starsGeo, new THREE.PointsMaterial({
  color: 0xffffff, size: 1.0, transparent: true, opacity: 0.9
})));

// =============================================================
//                        ЗЕМЛЯ
// =============================================================
var ground = new THREE.Mesh(
  new THREE.PlaneGeometry(1500, 1500),
  new THREE.MeshStandardMaterial({ color: 0x0a0a1a, roughness: 1, metalness: 0 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

var grid = new THREE.GridHelper(1500, 300, 0xff00ff, 0x6600aa);
grid.position.y = 0.01;
grid.material.opacity = 0.35;
grid.material.transparent = true;
scene.add(grid);

// =============================================================
//                        ДОРОГА
// =============================================================
var ROAD_W = 16;
var ROAD_L = 1500;

var road = new THREE.Mesh(
  new THREE.PlaneGeometry(ROAD_W, ROAD_L),
  new THREE.MeshStandardMaterial({ color: 0x181820, roughness: 0.8, metalness: 0.2 })
);
road.rotation.x = -Math.PI / 2;
road.position.y = 0.02;
road.receiveShadow = true;
scene.add(road);

// Разметка
for (var i = -100; i < 100; i++) {
  var dash = new THREE.Mesh(
    new THREE.PlaneGeometry(0.35, 3.5),
    new THREE.MeshBasicMaterial({ color: 0xffff00 })
  );
  dash.rotation.x = -Math.PI / 2;
  dash.position.set(0, 0.03, i * 8);
  scene.add(dash);
}

// Неоновые линии
[-1, 1].forEach(function(side) {
  var line = new THREE.Mesh(
    new THREE.PlaneGeometry(0.3, ROAD_L),
    new THREE.MeshBasicMaterial({ color: 0xff00ff })
  );
  line.rotation.x = -Math.PI / 2;
  line.position.set(side * ROAD_W / 2, 0.03, 0);
  scene.add(line);
});

// =============================================================
//                        ПАЛЬМЫ
// =============================================================
function createPalm(x, z) {
  var palm = new THREE.Group();

  var trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.32, 6, 6),
    new THREE.MeshStandardMaterial({ color: 0x4a2511 })
  );
  trunk.position.y = 3;
  trunk.castShadow = true;
  palm.add(trunk);

  for (var i = 0; i < 8; i++) {
    var leaf = new THREE.Mesh(
      new THREE.ConeGeometry(0.4, 3.2, 4),
      new THREE.MeshStandardMaterial({ color: 0x00aa44 })
    );
    var a = (i / 8) * Math.PI * 2;
    leaf.position.set(Math.cos(a) * 1, 6.1, Math.sin(a) * 1);
    leaf.rotation.z = Math.cos(a) * 0.9;
    leaf.rotation.x = Math.sin(a) * 0.9;
    palm.add(leaf);
  }
  palm.position.set(x, 0, z);
  scene.add(palm);
}

for (var i = -35; i < 35; i++) {
  var z = i * 22 + Math.random() * 6;
  createPalm(-ROAD_W / 2 - 5 - Math.random() * 4, z);
  createPalm( ROAD_W / 2 + 5 + Math.random() * 4, z);
}

// =============================================================
//                       ЗДАНИЯ
// =============================================================
function createBuilding(x, z) {
  var h = 8 + Math.random() * 25;
  var w = 4 + Math.random() * 4;
  var d = 4 + Math.random() * 4;

  var b = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshStandardMaterial({
      color: 0x1a0a33, emissive: 0x5500aa, emissiveIntensity: 0.5
    })
  );
  b.position.set(x, h / 2, z);
  b.castShadow = true;
  scene.add(b);

  for (var i = 0; i < 8; i++) {
    var win = new THREE.Mesh(
      new THREE.PlaneGeometry(0.5, 0.6),
      new THREE.MeshBasicMaterial({
        color: Math.random() > 0.5 ? 0x00ffff : 0xff66ff
      })
    );
    win.position.set(
      x + (Math.random() - 0.5) * (w - 0.6),
      1.5 + Math.random() * (h - 3),
      z + (d / 2 + 0.02) * (Math.random() > 0.5 ? 1 : -1)
    );
    scene.add(win);
  }
}

for (var i = 0; i < 25; i++) {
  var side = Math.random() > 0.5 ? 1 : -1;
  createBuilding(side * (40 + Math.random() * 80), (Math.random() - 0.5) * 600);
}

// =============================================================
//              BMW M5 F90 — LOW POLY (серебристая)
// =============================================================
var car = new THREE.Group();
var taillights = [];

// --- МАТЕРИАЛЫ ---
var silverBody = new THREE.MeshStandardMaterial({
  color: 0xc8ccd2, roughness: 0.25, metalness: 0.85
});
var blackRoof = new THREE.MeshStandardMaterial({
  color: 0x1a1a1e, roughness: 0.5, metalness: 0.4
});
var blackTrim = new THREE.MeshStandardMaterial({
  color: 0x0a0a0a, roughness: 0.7, metalness: 0.3
});
var chrome = new THREE.MeshStandardMaterial({
  color: 0xf0f0f0, roughness: 0.05, metalness: 1
});
var glassMat = new THREE.MeshStandardMaterial({
  color: 0x0a1a2a, roughness: 0.05, metalness: 0.95,
  transparent: true, opacity: 0.75
});
var headlightMat = new THREE.MeshStandardMaterial({
  color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 2.5,
  roughness: 0.05, metalness: 0.5
});
var drlMat = new THREE.MeshStandardMaterial({
  color: 0xffffff, emissive: 0x88ddff, emissiveIntensity: 3.5
});
var grilleMat = new THREE.MeshStandardMaterial({
  color: 0x0a0a0a, roughness: 0.4, metalness: 0.8
});

var L = 5.0, W = 1.95, H = 0.75;

// --- НИЖНИЙ КУЗОВ ---
var lowerBody = new THREE.Mesh(new THREE.BoxGeometry(L, H, W), silverBody);
lowerBody.position.y = 0.8;
lowerBody.castShadow = true;
car.add(lowerBody);

// Пороги
[-1, 1].forEach(function(side) {
  var skirt = new THREE.Mesh(new THREE.BoxGeometry(L * 0.95, 0.12, 0.1), blackTrim);
  skirt.position.set(0, 0.45, side * (W / 2 + 0.02));
  car.add(skirt);
});

// --- КАПОТ ---
var hood = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.35, W * 0.98), silverBody);
hood.position.set(1.7, 1.15, 0);
hood.rotation.z = -0.08;
hood.castShadow = true;
car.add(hood);

// Power dome
var powerDome = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.1, 0.75), silverBody);
powerDome.position.set(1.5, 1.35, 0);
car.add(powerDome);

// Cowl
var cowl = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.5, W * 0.96), silverBody);
cowl.position.set(0.85, 1.3, 0);
car.add(cowl);

// --- КРЫША ---
var roof = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.6, W * 0.88), blackRoof);
roof.position.set(-0.4, 1.55, 0);
roof.castShadow = true;
car.add(roof);

// --- СТЁКЛА ---
var windshield = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.85, W * 0.86), glassMat);
windshield.position.set(0.85, 1.5, 0);
windshield.rotation.z = -0.7;
car.add(windshield);

var rearGlassMesh = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.7, W * 0.86), glassMat);
rearGlassMesh.position.set(-1.5, 1.5, 0);
rearGlassMesh.rotation.z = 0.6;
car.add(rearGlassMesh);

[-1, 1].forEach(function(side) {
  var sideWin = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.55, 0.04), glassMat);
  sideWin.position.set(-0.4, 1.65, side * (W * 0.44 + 0.02));
  car.add(sideWin);

  var pillar = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.6, 0.06), blackRoof);
  pillar.position.set(-0.4, 1.6, side * (W * 0.44 + 0.03));
  car.add(pillar);
});

// --- БАГАЖНИК ---
var trunk = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.4, W * 0.96), silverBody);
trunk.position.set(-2.15, 1.15, 0);
car.add(trunk);

// --- ПЕРЕДНИЙ БАМПЕР ---
var frontBumper = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.85, W), silverBody);
frontBumper.position.set(2.5, 0.75, 0);
frontBumper.castShadow = true;
car.add(frontBumper);

var frontLip = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.18, W * 0.98), blackTrim);
frontLip.position.set(2.55, 0.35, 0);
car.add(frontLip);

var intakeCenter = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.4, 0.9), blackTrim);
intakeCenter.position.set(2.72, 0.65, 0);
car.add(intakeCenter);

[-1, 1].forEach(function(side) {
  var intake = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.35, 0.4), blackTrim);
  intake.position.set(2.72, 0.65, side * 0.75);
  car.add(intake);
});

// --- НОЗДРИ BMW ---
[-0.3, 0.3].forEach(function(zOff) {
  var grille = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.6, 0.55), grilleMat);
  grille.position.set(2.72, 1.15, zOff);
  car.add(grille);

  for (var i = -2; i <= 2; i++) {
    var rib = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.55, 0.04), chrome);
    rib.position.set(2.74, 1.15, zOff + i * 0.09);
    car.add(rib);
  }
});

// --- ФАРЫ LED ---
[-1, 1].forEach(function(side) {
  var headlight = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.32, 0.6), headlightMat);
  headlight.position.set(2.72, 1.18, side * 0.7);
  car.add(headlight);

  var drl = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.08, 0.6), drlMat);
  drl.position.set(2.73, 1.32, side * 0.7);
  car.add(drl);
});

// ============================================================
//                       ЗАДНЯЯ ЧАСТЬ
// ============================================================
var rearBumper = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.85, W), silverBody);
rearBumper.position.set(-2.6, 0.75, 0);
car.add(rearBumper);

[-1, 1].forEach(function(side) {
  var tlMat = new THREE.MeshStandardMaterial({
    color: 0x330000, emissive: 0xff0000, emissiveIntensity: 1.0
  });
  var tlMain = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.22, 0.8), tlMat);
  tlMain.position.set(-2.82, 1.1, side * 0.62);
  tlMain.userData.isBrake = true;
  car.add(tlMain);
  taillights.push(tlMain);

  var tlInner = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, 0.4), tlMat.clone());
  tlInner.position.set(-2.82, 1.1, side * 0.16);
  car.add(tlInner);
});

// Чёрная полоса между фонарями
var tailStrip = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, W * 0.85), blackTrim);
tailStrip.position.set(-2.82, 1.1, 0);
car.add(tailStrip);

// Диффузор
var diffuser = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.3, W * 0.85), blackTrim);
diffuser.position.set(-2.75, 0.5, 0);
car.add(diffuser);

for (var i = -3; i <= 3; i++) {
  var fin = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.22, 0.06), blackTrim);
  fin.position.set(-2.75, 0.5, i * 0.23);
  car.add(fin);
}

// 4 выхлопные трубы
[-0.6, -0.38, 0.38, 0.6].forEach(function(zOff) {
  var pipe = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.09, 0.35, 12),
    chrome
  );
  pipe.rotation.z = Math.PI / 2;
  pipe.position.set(-2.86, 0.42, zOff);
  car.add(pipe);
});

// Спойлер
var spoiler = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.08, W * 0.75), blackRoof);
spoiler.position.set(-2.45, 1.42, 0);
car.add(spoiler);

// --- ЗЕРКАЛА ---
[-1, 1].forEach(function(side) {
  var stem = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.06, 0.15), blackRoof);
  stem.position.set(0.7, 1.5, side * 1.05);
  car.add(stem);

  var mirror = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.24, 0.3), silverBody);
  mirror.position.set(0.78, 1.55, side * 1.22);
  car.add(mirror);
});

// --- ПОЛОСА M (триколор, теперь видна!) ---
[0x0066cc, 0x6600cc, 0xcc0000].forEach(function(color, i) {
  var stripe = new THREE.Mesh(
    new THREE.BoxGeometry(4.8, 0.04, 0.2),
    new THREE.MeshStandardMaterial({ color: color, emissive: color, emissiveIntensity: 0.6 })
  );
  stripe.position.set(0, 1.24, -0.4 + i * 0.4);
  car.add(stripe);
});

// ============================================================
//                        КОЛЁСА
// ============================================================
var wheels = [];
var wheelPositions = [
  [ 1.6, 0.55,  1.05],
  [ 1.6, 0.55, -1.05],
  [-1.6, 0.55,  1.05],
  [-1.6, 0.55, -1.05]
];

wheelPositions.forEach(function(pos) {
  var wheel = new THREE.Group();

  var tire = new THREE.Mesh(
    new THREE.CylinderGeometry(0.6, 0.6, 0.45, 24),
    new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.95 })
  );
  tire.rotation.x = Math.PI / 2;
  tire.castShadow = true;
  wheel.add(tire);

  var rim = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.42, 0.47, 24),
    new THREE.MeshStandardMaterial({ color: 0x3a3a3a, metalness: 1, roughness: 0.3 })
  );
  rim.rotation.x = Math.PI / 2;
  wheel.add(rim);

  for (var i = 0; i < 5; i++) {
    var a = (i / 5) * Math.PI * 2;
    [-0.07, 0.07].forEach(function(offset) {
      var spoke = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 0.05, 0.05),
        new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 1, roughness: 0.15 })
      );
      spoke.rotation.z = a;
      spoke.position.y = offset;
      wheel.add(spoke);
    });
  }

  var cap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.11, 0.11, 0.5, 12),
    new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.9, roughness: 0.2 })
  );
  cap.rotation.x = Math.PI / 2;
  wheel.add(cap);

  wheel.position.set(pos[0], pos[1], pos[2]);
  car.add(wheel);
  wheels.push(wheel);
});

// Тень под машиной
var carShadow = new THREE.Mesh(
  new THREE.PlaneGeometry(6, 3),
  new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.6 })
);
carShadow.rotation.x = -Math.PI / 2;
carShadow.position.y = 0.04;
car.add(carShadow);

// УВЕЛИЧИВАЕМ ВСЮ МАШИНУ (чтобы была заметная)
car.scale.set(1.5, 1.5, 1.5);

scene.add(car);

// =============================================================
//                     УПРАВЛЕНИЕ
// =============================================================
var keys = { left: false, right: false, forward: false, back: false };

document.addEventListener('keydown', function(e) {
  if (e.key === 'ArrowLeft'  || e.key === 'a') keys.left = true;
  if (e.key === 'ArrowRight' || e.key === 'd') keys.right = true;
  if (e.key === 'ArrowUp'    || e.key === 'w') keys.forward = true;
  if (e.key === 'ArrowDown'  || e.key === 's') keys.back = true;
});
document.addEventListener('keyup', function(e) {
  if (e.key === 'ArrowLeft'  || e.key === 'a') keys.left = false;
  if (e.key === 'ArrowRight' || e.key === 'd') keys.right = false;
  if (e.key === 'ArrowUp'    || e.key === 'w') keys.forward = false;
  if (e.key === 'ArrowDown'  || e.key === 's') keys.back = false;
});

function bindBtn(id, key) {
  var el = document.getElementById(id);
  if (!el) return;
  var on  = function(e) { e.preventDefault(); keys[key] = true; };
  var off = function(e) { e.preventDefault(); keys[key] = false; };
  el.addEventListener('touchstart', on, { passive: false });
  el.addEventListener('touchend', off, { passive: false });
  el.addEventListener('touchcancel', off, { passive: false });
  el.addEventListener('mousedown', on);
  el.addEventListener('mouseup', off);
  el.addEventListener('mouseleave', off);
}

bindBtn('btnLeft', 'left');
bindBtn('btnRight', 'right');
bindBtn('btnForward', 'forward');
bindBtn('btnBack', 'back');

// =============================================================
//                       ФИЗИКА
// =============================================================
var speedZ = 0;
var carAngle = Math.PI; // нос смотрит на -Z (к солнцу)
var MAX_SPEED_Z = 0.9;
var ACCEL_Z = 0.03;
var BRAKE_Z = 0.055;
var FRICTION_Z = 0.97;
var TURN_SPEED = 0.04;

// =============================================================
//                    ЧАСТИЦЫ ВЫХЛОПА
// =============================================================
var exhaustParticles = [];
var exhaustGeo = new THREE.SphereGeometry(0.15, 6, 6);

function spawnExhaust() {
  var p = new THREE.Mesh(
    exhaustGeo,
    new THREE.MeshBasicMaterial({ color: 0xff8800, transparent: true, opacity: 0.85 })
  );
  var offset = new THREE.Vector3(-3.2, 0.5, 0.6);
  offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), carAngle);
  p.position.copy(car.position).add(offset);
  scene.add(p);
  exhaustParticles.push({
    mesh: p, life: 1,
    vx: Math.sin(carAngle) * 0.15 + (Math.random() - 0.5) * 0.05,
    vz: Math.cos(carAngle) * 0.15 + (Math.random() - 0.5) * 0.05,
    vy: 0.05 + Math.random() * 0.05
  });
}

// =============================================================
//                     СЛЕДЫ ШИН
// =============================================================
var skidMarks = [];
var skidGeo = new THREE.PlaneGeometry(0.4, 0.55);

function spawnSkid(worldX, worldZ) {
  var m = new THREE.Mesh(
    skidGeo,
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.7 })
  );
  m.rotation.x = -Math.PI / 2;
  m.rotation.z = carAngle;
  m.position.set(worldX, 0.05, worldZ);
  scene.add(m);
  skidMarks.push({ mesh: m, life: 1 });
  if (skidMarks.length > 300) {
    scene.remove(skidMarks[0].mesh);
    skidMarks.shift();
  }
}

// =============================================================
//                          HUD
// =============================================================
var speedEl = document.getElementById('speed');

// =============================================================
//                       ИГРОВОЙ ЦИКЛ
// =============================================================
var lastTime = performance.now();
var skidTimer = 0;
var exhaustTimer = 0;

function animate() {
  requestAnimationFrame(animate);

  var now = performance.now();
  var dt = Math.min((now - lastTime) / 16.67, 2);
  lastTime = now;

  // Газ / тормоз
  if (keys.forward) {
    speedZ += ACCEL_Z * dt;
  } else if (keys.back) {
    speedZ -= BRAKE_Z * dt;
  } else {
    speedZ *= FRICTION_Z;
    if (Math.abs(speedZ) < 0.002) speedZ = 0;
  }
  speedZ = Math.max(-MAX_SPEED_Z * 0.4, Math.min(MAX_SPEED_Z, speedZ));

  // Поворот руля
  var turnInput = 0;
  if (keys.left)  turnInput = 1;
  if (keys.right) turnInput = -1;

  var speedFactor = Math.min(Math.abs(speedZ) / 0.2, 1);
  if (Math.abs(speedZ) > 0.05) {
    carAngle += turnInput * TURN_SPEED * dt * speedFactor * Math.sign(speedZ);
  } else if (Math.abs(speedZ) < 0.02) {
    carAngle += turnInput * TURN_SPEED * 0.3 * dt;
  }

  car.rotation.y = carAngle;

  // Движение вперёд
  var forwardX = Math.sin(carAngle);
  var forwardZ = Math.cos(carAngle);
  car.position.x += forwardX * speedZ * dt * 10;
  car.position.z += forwardZ * speedZ * dt * 10;

  // Вращение колёс
  wheels.forEach(function(w) { w.rotation.z -= speedZ * 0.5; });

  // Стоп-сигналы
  var braking = (keys.back && speedZ > 0.02);
  taillights.forEach(function(t) {
    if (t.userData && t.userData.isBrake) {
      t.material.emissiveIntensity = braking ? 4 : 1.0;
    }
  });

  // Выхлоп
  exhaustTimer += dt;
  if (keys.forward && exhaustTimer > 2) {
    spawnExhaust();
    exhaustTimer = 0;
  }

  // Частицы
  for (var i = exhaustParticles.length - 1; i >= 0; i--) {
    var p = exhaustParticles[i];
    p.mesh.position.x += p.vx * dt;
    p.mesh.position.z += p.vz * dt;
    p.mesh.position.y += p.vy * dt;
    p.life -= 0.02 * dt;
    p.mesh.material.opacity = p.life * 0.85;
    p.mesh.scale.setScalar(1 + (1 - p.life) * 2);
    if (p.life <= 0) {
      scene.remove(p.mesh);
      exhaustParticles.splice(i, 1);
    }
  }

  // Следы шин
  skidTimer += dt;
  if (Math.abs(speedZ) > 0.1 && skidTimer > 3) {
    skidTimer = 0;
    var cs = Math.cos(carAngle);
    var sn = Math.sin(carAngle);
    [[-1.6 * 1.5, 1.05 * 1.5], [-1.6 * 1.5, -1.05 * 1.5]].forEach(function(pos) {
      spawnSkid(
        car.position.x + (pos[0] * cs + pos[1] * sn),
        car.position.z + (-pos[0] * sn + pos[1] * cs)
      );
    });
  }
  for (var j = skidMarks.length - 1; j >= 0; j--) {
    var m = skidMarks[j];
    m.life -= 0.002 * dt;
    m.mesh.material.opacity = m.life * 0.7;
    if (m.life <= 0) {
      scene.remove(m.mesh);
      skidMarks.splice(j, 1);
    }
  }

  // ============ КАМЕРА — сзади машины, ближе ============
  var camDist = 10;
  var camHeight = 4.5;

  var camX = car.position.x - Math.sin(carAngle) * camDist;
  var camZ = car.position.z - Math.cos(carAngle) * camDist;

  camera.position.x += (camX - camera.position.x) * 0.08;
  camera.position.y += (camHeight - camera.position.y) * 0.08;
  camera.position.z += (camZ - camera.position.z) * 0.08;

  camera.lookAt(
    car.position.x + Math.sin(carAngle) * 3,
    1.5,
    car.position.z + Math.cos(carAngle) * 3
  );

  // Свет следует за машиной
  fill.position.x = car.position.x;
  fill.position.z = car.position.z;
  fill.position.y = 5;

  // HUD
  if (speedEl) {
    speedEl.textContent = Math.abs(Math.round(speedZ * 700));
  }

  renderer.render(scene, camera);
}

// Стартовая камера — позади машины
camera.position.set(-Math.sin(carAngle) * 10, 4.5, -Math.cos(carAngle) * 10);
camera.lookAt(0, 1.5, 0);

animate();

// Resize
window.addEventListener('resize', function() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
