// =========================================================
// Opening: soft flames rise and fill the screen, then settle
// while The Addict logo lights up in its place.
// WebGL shader (GPU, smooth on phones) with a CSS fallback.
// Plays once per visit (session); add ?intro=1 to replay.
// =========================================================
import { reducedMotion, lockScroll, unlockScroll } from './ui.js';

const SEEN_KEY = 'addict-intro-seen';

const VERT = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;
const FRAG = `
precision mediump float;
uniform vec2 uRes;
uniform float uTime;
uniform float uLevel;
float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.-2.*f);
  float a=hash(i),b=hash(i+vec2(1.,0.)),c=hash(i+vec2(0.,1.)),d=hash(i+vec2(1.,1.));
  return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes;
  vec2 q=vec2(uv.x*uRes.x/uRes.y,uv.y);
  float t=uTime;
  float n1=fbm(q*vec2(4.,3.)-vec2(0.,t*1.6));
  float n=fbm(q*vec2(6.5,4.5)+vec2(n1*1.3,-t*2.8));
  float h=uv.y/max(uLevel,.0001);
  float heat=clamp(n*1.3-h*.95+.12,0.,1.);
  heat=pow(heat,1.15);
  vec3 ember=vec3(.26,.02,.02);
  vec3 red=vec3(.86,.1,.12);
  vec3 orange=vec3(.98,.38,.1);
  vec3 amber=vec3(1.,.66,.28);
  vec3 col=mix(ember,red,smoothstep(.12,.42,heat));
  col=mix(col,orange,smoothstep(.45,.75,heat));
  col=mix(col,amber,smoothstep(.78,1.,heat)*.7);
  float a=smoothstep(.04,.3,heat)*.94;
  gl_FragColor=vec4(col*a,a);
}`;

const easeOut = (x) => 1 - Math.pow(1 - x, 3);
const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

function shouldPlay() {
  try {
    if (new URLSearchParams(location.search).has('intro')) return true;
    return !sessionStorage.getItem(SEEN_KEY);
  } catch { return true; }
}
function markSeen() { try { sessionStorage.setItem(SEEN_KEY, '1'); } catch { /* ignore */ } }

function setupGL(canvas) {
  const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, powerPreference: 'low-power' });
  if (!gl) return null;
  const sh = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  };
  const vs = sh(gl.VERTEX_SHADER, VERT);
  const fs = sh(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;
  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  return {
    gl,
    uRes: gl.getUniformLocation(prog, 'uRes'),
    uTime: gl.getUniformLocation(prog, 'uTime'),
    uLevel: gl.getUniformLocation(prog, 'uLevel'),
  };
}

export function runIntro({ onDone } = {}) {
  const intro = document.getElementById('intro');
  const body = document.body;
  const finishReady = () => {
    body.classList.remove('is-intro', 'logo-in');
    body.classList.add('is-ready');
    if (onDone) onDone();
  };

  if (!intro || !shouldPlay()) {
    intro?.remove();
    finishReady();
    return;
  }
  markSeen();
  try { history.scrollRestoration = 'manual'; } catch { /* ignore */ }
  window.scrollTo(0, 0);
  lockScroll();

  const canvas = intro.querySelector('canvas');
  const skipBtn = intro.querySelector('.intro__skip');
  let raf = 0;
  let ended = false;
  let logoAt = 0;
  const showLogo = () => {
    if (logoAt) return;
    logoAt = performance.now();
    body.classList.add('logo-in');
  };
  const timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));

  const end = () => {
    if (ended) return;
    ended = true;
    cancelAnimationFrame(raf);
    timers.forEach(clearTimeout);
    showLogo();
    intro.classList.add('is-done');
    unlockScroll();
    // let the logo animation finish, then hand over to the calm idle state
    const wait = Math.max(450, 1250 - (performance.now() - logoAt));
    setTimeout(() => {
      finishReady();
      intro.remove();
    }, wait);
  };
  skipBtn?.addEventListener('click', end);

  // Reduced motion: no flames, just a gentle logo fade.
  if (reducedMotion()) {
    canvas?.remove();
    later(showLogo, 100);
    later(end, 900);
    return;
  }

  // Timeline (seconds)
  const RISE = 1.0;
  const HOLD = 0.85;
  const FALL = 1.15;
  const LOGO_AT = RISE + HOLD - 0.1;
  const TOTAL = RISE + HOLD + FALL;
  const PEAK = 2.05; // flame height: > 2 fills the whole screen

  const ctx = canvas ? setupGL(canvas) : null;
  if (!ctx) {
    // CSS fallback: a warm glow rising and fading
    canvas?.remove();
    const glow = document.createElement('div');
    glow.className = 'intro__glow';
    intro.prepend(glow);
    requestAnimationFrame(() => glow.classList.add('is-up'));
    later(() => { showLogo(); glow.classList.add('is-fading'); }, LOGO_AT * 1000);
    later(end, (TOTAL + 0.2) * 1000);
    return;
  }

  const { gl, uRes, uTime, uLevel } = ctx;
  const resize = () => {
    const scale = 0.5; // render at half resolution: flames are soft anyway, and it's much lighter
    const w = Math.max(2, Math.round(window.innerWidth * scale));
    const h = Math.max(2, Math.round(window.innerHeight * scale));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
    gl.uniform2f(uRes, w, h);
  };
  resize();
  window.addEventListener('resize', resize);

  const start = performance.now();
  const frame = (now) => {
    const t = (now - start) / 1000;
    let level;
    if (t < RISE) level = easeOut(t / RISE) * PEAK;
    else if (t < RISE + HOLD) level = PEAK;
    else level = PEAK * (1 - easeInOut(Math.min(1, (t - RISE - HOLD) / FALL)));
    gl.uniform1f(uTime, t);
    gl.uniform1f(uLevel, Math.max(0.0001, level));
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (t >= LOGO_AT) showLogo();
    if (t >= TOTAL) {
      window.removeEventListener('resize', resize);
      end();
      return;
    }
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
  // safety net: never trap the visitor in the intro
  later(end, (TOTAL + 2) * 1000);
}
