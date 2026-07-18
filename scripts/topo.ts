import * as THREE from 'three';

const container = document.getElementById('topo-canvas');
if (!container) throw new Error('Missing #topo-canvas');

const scene = new THREE.Scene();
scene.background = new THREE.Color('#0a0a0a');

const camera = new THREE.PerspectiveCamera(
  50,
  container.clientWidth / container.clientHeight,
  0.1,
  1000
);
camera.position.set(0, 8, 18);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.domElement.style.width = '100%';
renderer.domElement.style.height = '100%';
renderer.domElement.style.display = 'block';
container.appendChild(renderer.domElement);

// Lights
const ambient = new THREE.AmbientLight('#ffffff', 0.4);
scene.add(ambient);

const dir = new THREE.DirectionalLight('#ffffff', 1.0);
dir.position.set(5, 10, 5);
scene.add(dir);

const point = new THREE.PointLight('#00e5ff', 0.6, 30);
point.position.set(-5, 5, 5);
scene.add(point);

// Chromatic ring palette
const RING_COUNT = 14;
const rings: THREE.Mesh[] = [];
const group = new THREE.Group();
scene.add(group);

for (let i = 0; i < RING_COUNT; i++) {
  const radius = 1.2 + i * 1.3;
  const segments = 96 + i * 8;
  const geo = new THREE.RingGeometry(radius, radius + 0.12, segments);

  // Vortex depth: inner rings deeper (negative Z)
  const zDepth = -i * 0.35;

  // Displace vertices into funnel
  const pos = geo.attributes.position;
  const center = new THREE.Vector3();
  for (let v = 0; v < pos.count; v++) {
    const x = pos.getX(v);
    const y = pos.getY(v);
    const dist = Math.sqrt(x * x + y * y);
    // Funnel: deeper in center, shallow at edges
    const funnel = -Math.max(0, (RING_COUNT - i) * 0.15 - dist * 0.05);
    pos.setZ(v, zDepth + funnel);
  }
  geo.computeVertexNormals();

  // Chromatic edge color via HSL
  const hue = (i * 25) % 360;
  const color = new THREE.Color(`hsl(${hue}, 80%, 55%)`);

  const mat = new THREE.MeshStandardMaterial({
    color: color,
    emissive: color,
    emissiveIntensity: 0.4,
    roughness: 0.4,
    metalness: 0.6,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.85,
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2; // lay flat
  mesh.userData = { index: i, baseHue: hue };
  rings.push(mesh);
  group.add(mesh);
}

// Animation state
let time = 0;
let mouseX = 0;
let mouseY = 0;
let targetRotX = 0;
let targetRotY = 0;

function onMouseMove(e: MouseEvent) {
  mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
  mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
}
window.addEventListener('mousemove', onMouseMove);

function animate() {
  requestAnimationFrame(animate);
  time += 0.005;

  // Global group rotation (tilt toward camera)
  targetRotX = mouseY * 0.15;
  targetRotY = mouseX * 0.15;
  group.rotation.x += (targetRotX - group.rotation.x) * 0.04;
  group.rotation.z += (targetRotY - group.rotation.z) * 0.04;
  // Base tilt
  group.rotation.x = Math.max(-0.5, Math.min(0.2, group.rotation.x - 0.3));

  // Per-ring breathe + rotate
  rings.forEach((ring, i) => {
    const offset = i * 0.4;
    // Slow rotation
    ring.rotation.z = time * (0.2 + i * 0.03) + offset;
    // Breathe: scale Y slightly (makes rings undulate)
    const breathe = 1 + Math.sin(time * 2 + offset) * 0.04;
    ring.scale.set(1, breathe, 1);
    // Color shift
    const hueShift = (ring.userData.baseHue + time * 10) % 360;
    const c = new THREE.Color(`hsl(${hueShift}, 80%, 55%)`);
    (ring.material as THREE.MeshStandardMaterial).color.copy(c);
    (ring.material as THREE.MeshStandardMaterial).emissive.copy(c);
  });

  renderer.render(scene, camera);
}

animate();

// Resize
function onResize() {
  const w = container.clientWidth;
  const h = container.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}
window.addEventListener('resize', onResize);
