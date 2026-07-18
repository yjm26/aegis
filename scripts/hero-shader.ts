import * as THREE from 'three';

const container = document.getElementById('topo-canvas');
if (!container) throw new Error('Missing #topo-canvas');

const scene = new THREE.Scene();

const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.domElement.style.width = '100%';
renderer.domElement.style.height = '100%';
renderer.domElement.style.display = 'block';
container.appendChild(renderer.domElement);

// MeshGradient-like shader
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;
  uniform float uTime;
  uniform vec2 uResolution;
  varying vec2 vUv;

  // Simplex noise helpers
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                       -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                           + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
                            dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vec2 uv = vUv;
    float t = uTime * 0.15;

    // Layered noise for organic movement
    float n1 = snoise(uv * 2.5 + t * 0.3) * 0.5 + 0.5;
    float n2 = snoise(uv * 4.0 - t * 0.2 + vec2(50.0)) * 0.5 + 0.5;
    float n3 = snoise(uv * 1.5 + t * 0.1 + vec2(100.0)) * 0.5 + 0.5;

    float blend = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;

    // Colors: black -> #1a1a1a -> #333333 -> white
    vec3 c1 = vec3(0.0, 0.0, 0.0);         // #000000
    vec3 c2 = vec3(0.102, 0.102, 0.102);  // #1a1a1a
    vec3 c3 = vec3(0.2, 0.2, 0.2);        // #333333
    vec3 c4 = vec3(1.0, 1.0, 1.0);        // #ffffff

    vec3 color;
    if (blend < 0.33) {
      color = mix(c1, c2, blend / 0.33);
    } else if (blend < 0.66) {
      color = mix(c2, c3, (blend - 0.33) / 0.33);
    } else {
      color = mix(c3, c4, (blend - 0.66) / 0.34);
    }

    // Vignette
    float vignette = 1.0 - length(uv - 0.5) * 0.8;
    color *= vignette;

    gl_FragColor = vec4(color, 1.0);
  }
`;

const uniforms = {
  uTime: { value: 0 },
  uResolution: { value: new THREE.Vector2(container.clientWidth, container.clientHeight) },
};

const material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms,
});

const geometry = new THREE.PlaneGeometry(2, 2);
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

function animate() {
  requestAnimationFrame(animate);
  uniforms.uTime.value += 0.016;
  renderer.render(scene, camera);
}

animate();

function onResize() {
  const w = container.clientWidth;
  const h = container.clientHeight;
  renderer.setSize(w, h);
  uniforms.uResolution.value.set(w, h);
}
window.addEventListener('resize', onResize);
