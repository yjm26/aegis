import { ShaderMount, meshGradientFragmentShader } from '@paper-design/shaders';

const container = document.getElementById('topo-canvas');
if (!container) {
  console.warn('[hero-shader] #topo-canvas not found');
} else {
  // Paper shader style: dark paper with subtle grainy gradient
  const mount = new ShaderMount(
    container,
    meshGradientFragmentShader,
    {
      // Dark paper look (close to the 21st.dev example)
      colors: ['#000000', '#0f0f0f', '#1a1a1a', '#2a2a2a', '#ffffff'],
      distortion: 0.45,
      swirl: 0.25,
      grainMixer: 0.35,
      grainOverlay: 0.4,
    },
    undefined, // webgl context attrs
    0.85,      // speed
    0          // starting frame
  );

  // Optional: pause when tab hidden (library already handles some of this)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      mount.setSpeed(0);
    } else {
      mount.setSpeed(0.85);
    }
  });
}
