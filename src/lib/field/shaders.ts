// GLSL for the particle field (WebGL2). Positions and velocities live in
// float textures, one texel per particle; the sim pass writes both at once.

const hash = /* glsl */ `
float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
`;

/** A full-screen triangle, no buffers needed. */
export const fullscreenVert = /* glsl */ `#version 300 es
out vec2 vUv;
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  vUv = p;
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}
`;

export const simFrag = /* glsl */ `#version 300 es
precision highp float;
precision highp sampler2D;

uniform sampler2D uPos;
uniform sampler2D uVel;
uniform sampler2D uTarget;
uniform float uDt;
uniform float uTime;
uniform float uSpring;
uniform float uDrag;
uniform float uTurb;
uniform float uSnap;
uniform mat4 uViewProj;
uniform mat4 uModel;
uniform mat3 uInvRot;
uniform vec2 uProjScale;
uniform vec2 uOffset;
uniform float uAspect;
uniform vec2 uPointer;
uniform vec2 uPointerVel;
uniform float uWind;

layout(location = 0) out vec4 oPos;
layout(location = 1) out vec4 oVel;

${hash}

// Curl of a vector potential made of sines: divergence free, cheap, smooth.
vec3 curl(vec3 p, float t) {
  vec3 k1 = vec3(1.7, -1.1, 0.9);
  vec3 k2 = vec3(-0.8, 1.9, 1.3);
  vec3 k3 = vec3(1.2, 0.7, -1.8);
  vec3 k4 = vec3(2.9, 2.3, -0.6);
  vec3 k5 = vec3(-2.1, 0.4, 2.7);
  vec3 k6 = vec3(0.5, -2.6, 2.2);
  // Potential psi = (a1 + a4, a2 + a5, a3 + a6), each a = sin(k.p + phase).
  vec3 g1 = k1 * cos(dot(k1, p) + t);
  vec3 g4 = k4 * cos(dot(k4, p) - t * 1.3) * 0.5;
  vec3 g2 = k2 * cos(dot(k2, p) + t * 0.8);
  vec3 g5 = k5 * cos(dot(k5, p) + t * 1.1) * 0.5;
  vec3 g3 = k3 * cos(dot(k3, p) - t * 0.9);
  vec3 g6 = k6 * cos(dot(k6, p) + t * 1.7) * 0.5;
  vec3 gx = g1 + g4;
  vec3 gy = g2 + g5;
  vec3 gz = g3 + g6;
  return vec3(gz.y - gy.z, gx.z - gz.x, gy.x - gx.y);
}

void main() {
  ivec2 id = ivec2(gl_FragCoord.xy);
  vec4 P = texelFetch(uPos, id, 0);
  vec4 V = texelFetch(uVel, id, 0);
  vec4 T = texelFetch(uTarget, id, 0);
  float accentT = T.w > 1.5 ? 1.0 : 0.0;
  float toneT = T.w - 2.0 * accentT;

  if (uSnap > 0.5) {
    oPos = vec4(T.xyz, accentT);
    oVel = vec4(0.0, 0.0, 0.0, toneT);
    return;
  }

  float h1 = hash12(vec2(id) + 0.5);
  float h2 = hash12(vec2(id) + 71.3);

  // Spring with per-particle stiffness so morphs ripple.
  float k = uSpring * mix(8.0, 36.0, h1 * h1) * mix(1.0, 1.7, max(P.w, accentT));
  vec3 acc = (T.xyz - P.xyz) * k;

  // Turbulence, gentler on the initials so they stay legible.
  float turb = uTurb * mix(1.0, 0.2, P.w) * (0.6 + 0.8 * h2);
  acc += curl(P.xyz * 1.6 + h2 * 0.05, uTime * 0.35) * turb;

  // Wind from the pointer, measured on screen.
  vec4 clip = uViewProj * (uModel * vec4(P.xyz, 1.0));
  vec2 ndc = clip.xy / clip.w + uOffset * 2.0;
  vec2 d = (ndc - uPointer) * vec2(uAspect, 1.0);
  float r2 = dot(d, d);
  float fall = exp(-r2 / 0.03);
  if (uWind > 0.0 && fall > 0.002) {
    float speed = length(uPointerVel);
    vec3 push = vec3(uPointerVel / uProjScale, 0.0) * clip.w * 5.5;
    vec2 out2 = normalize(d + vec2(1e-4)) / vec2(uAspect, 1.0);
    vec3 outward = vec3(out2 / uProjScale, (h1 - 0.5) * 0.6) * clip.w * min(speed, 3.0) * 1.6;
    acc += uInvRot * (push + outward) * fall * uWind * mix(1.0, 0.45, P.w);
  }

  vec3 v = V.xyz * exp(-uDrag * uDt) + acc * uDt;
  vec3 p = P.xyz + v * uDt;
  float ease = 1.0 - exp(-uDt * 3.5);
  oPos = vec4(p, mix(P.w, accentT, ease));
  oVel = vec4(v, mix(V.w, toneT, ease));
}
`;

export const pointsVert = /* glsl */ `#version 300 es
precision highp float;
precision highp sampler2D;

uniform sampler2D uPos;
uniform sampler2D uVel;
uniform int uSide;
uniform mat4 uViewProj;
uniform mat4 uModel;
uniform vec2 uOffset;
uniform float uSize;
uniform float uBlur;
uniform float uVeil;
uniform float uSpread;
uniform float uTime;
uniform float uGrow;
uniform float uScale;
uniform float uKeep;
uniform float uAlpha;
uniform float uCamDist;
uniform vec3 uInk;
uniform vec3 uAccent;

out vec4 vColor;
out float vSoft;

${hash}

void main() {
  ivec2 c = ivec2(gl_VertexID % uSide, gl_VertexID / uSide);
  float h = hash12(vec2(c) + 13.7);
  if (h > uKeep) {
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
    gl_PointSize = 0.0;
    vColor = vec4(0.0);
    vSoft = 0.0;
    return;
  }
  vec4 P = texelFetch(uPos, c, 0);
  float tone = texelFetch(uVel, c, 0).w;
  float h2 = hash12(vec2(c) + 4.1);
  // In the background the form diffuses into a larger, breathing cloud.
  float spread = uSpread * (0.25 + 0.75 * h2 + 0.12 * sin(uTime * 0.35 + h2 * 6.2831));
  vec4 clip = uViewProj * (uModel * vec4(P.xyz * (1.0 + spread), 1.0));
  clip.xy += uOffset * 2.0 * clip.w;
  gl_Position = clip;

  float persp = clamp(uCamDist / clip.w, 0.6, 1.8);
  float size = uSize * mix(1.0, 1.25, P.w) * persp * uGrow;
  float px = size * uScale;
  gl_PointSize = max(px, 1.0);
  // Points smaller than a layer pixel give up alpha instead of size, so the
  // low-resolution layer used for blur carries the same amount of ink.
  float cover = px < 1.0 ? px * px : 1.0;
  float a = uAlpha * mix(mix(0.18, 0.7, uBlur), 1.0, tone) * cover / uKeep;
  a *= mix(1.0, 1.15, P.w);
  // The accent belongs to the sharp form. Pulled back into the background,
  // the initials settle into graphite with only a trace of warmth.
  float accent = P.w * (1.0 - 0.88 * smoothstep(0.15, 0.85, max(uBlur, uVeil)));
  vColor = vec4(mix(uInk, uAccent, accent), clamp(a, 0.0, 1.0));
  vSoft = uBlur;
}
`;

export const pointsFrag = /* glsl */ `#version 300 es
precision mediump float;
in vec4 vColor;
in float vSoft;
out vec4 outColor;
void main() {
  vec2 q = gl_PointCoord * 2.0 - 1.0;
  float r2 = dot(q, q);
  if (r2 > 1.0) discard;
  float disc = 1.0 - smoothstep(0.45, 1.0, r2);
  float soft = exp(-r2 * 3.2) * (1.0 - r2);
  float m = mix(disc, soft, clamp(vSoft * 2.0, 0.0, 1.0));
  float a = vColor.a * m;
  outColor = vec4(vColor.rgb * a, a);
}
`;

/** Draws the low-resolution points layer onto the canvas. */
export const compositeFrag = /* glsl */ `#version 300 es
precision mediump float;
uniform sampler2D uTex;
uniform vec2 uUvScale;
uniform float uOpacity;
uniform float uCap;
in vec2 vUv;
out vec4 outColor;
void main() {
  vec4 c = texture(uTex, vUv * uUvScale) * uOpacity;
  // Never darker than uCap: veiled behind text, dense spots flatten into a
  // light tone instead of a stain. Premultiplied, so scale it all.
  if (c.a > uCap) c *= uCap / c.a;
  outColor = c;
}
`;

/** One direction of a separable Gaussian blur over the points layer. */
export const blurFrag = /* glsl */ `#version 300 es
precision mediump float;
uniform sampler2D uTex;
uniform vec2 uUvScale;
uniform vec2 uStep;
in vec2 vUv;
out vec4 outColor;
void main() {
  vec2 uv = vUv * uUvScale;
  vec4 sum = texture(uTex, uv) * 0.1435;
  float w[7] = float[7](0.1346, 0.1112, 0.0808, 0.0517, 0.0291, 0.0144, 0.0063);
  for (int i = 0; i < 7; i++) {
    vec2 o = uStep * float(i + 1);
    sum += (texture(uTex, uv + o) + texture(uTex, uv - o)) * w[i];
  }
  outColor = sum;
}
`;
