'use client';

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';

// Min-Heap Priority Queue for O(log N) slot ranking
class MinHeap {
  constructor() {
    this.a = [];
  }
  push(key, value) {
    const a = this.a;
    a.push([key, value]);
    let i = a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (a[p][0] <= a[i][0]) break;
      [a[p], a[i]] = [a[i], a[p]];
      i = p;
    }
  }
  pop() {
    const a = this.a;
    if (!a.length) return;
    const t = a[0];
    const l = a.pop();
    if (a.length) {
      a[0] = l;
      let i = 0;
      for (;;) {
        let m = i;
        const x = 2 * i + 1;
        const y = x + 1;
        if (x < a.length && a[x][0] < a[m][0]) m = x;
        if (y < a.length && a[y][0] < a[m][0]) m = y;
        if (m === i) break;
        [a[m], a[i]] = [a[i], a[m]];
        i = m;
      }
    }
    return t;
  }
}

const R = 7;
const C = 14;
const M = 5; // meters per grid step
const ENT = [0, 0];
const CAR_COLORS = ['#c8102e', '#232a35', '#3d7a4a', '#8b93a1', '#e7cf78', '#f6f4ef'];

function roadAt(r, c) {
  return r % 3 === 0 || c === 0 || c === 13 || c === 6;
}

function renderCarSvg(c) {
  return (
    <svg viewBox="0 0 40 80" aria-hidden="true" style={{ width: '100%', height: '100%', display: 'block' }}>
      <rect x="3" y="2" width="34" height="76" rx="14" fill={c} stroke="rgba(0,0,0,.2)" />
      <rect x="8" y="22" width="24" height="34" rx="6" fill="#1b1520" opacity=".85" />
      <path d="M10 20l3-8h14l3 8z M10 58l3 8h14l3-8z" fill="#fff" opacity=".6" />
      <circle cx="9" cy="6" r="3.2" fill="#f7e48a" />
      <circle cx="31" cy="6" r="3.2" fill="#f7e48a" />
      <circle cx="9" cy="74" r="3" fill="#f27c8c" />
      <circle cx="31" cy="74" r="3" fill="#f27c8c" />
    </svg>
  );
}

const treeSvg = (
  <svg viewBox="0 0 100 100" aria-hidden="true" style={{ display: 'block', width: '100%', height: '100%' }}>
    <ellipse cx="56" cy="60" rx="42" ry="40" fill="#000" opacity=".25" />
    <g fill="#2a6636" stroke="#1f4f29" strokeWidth="1.5">
      <circle cx="50" cy="26" r="24" />
      <circle cx="74" cy="50" r="24" />
      <circle cx="50" cy="74" r="24" />
      <circle cx="26" cy="50" r="24" />
    </g>
    <g fill="#3f8a4b">
      <circle cx="50" cy="32" r="20" />
      <circle cx="68" cy="50" r="20" />
      <circle cx="50" cy="68" r="20" />
      <circle cx="32" cy="50" r="20" />
    </g>
    <circle cx="50" cy="50" r="22" fill="#55a35e" />
    <circle cx="40" cy="40" r="11" fill="#8fcf86" opacity=".75" />
    <circle cx="62" cy="58" r="7" fill="#b7df8a" opacity=".5" />
    <circle cx="58" cy="36" r="4" fill="#2a6636" opacity=".5" />
  </svg>
);

const TREES = [
  [-0.85, 1.35, 1.45],
  [-0.72, 2.45, 1.3],
  [-0.85, 4.4, 1.3],
  [-0.72, 5.45, 1.45],
  [14.85, 1.35, 1.3],
  [14.72, 2.45, 1.45],
  [14.85, 4.4, 1.45],
  [14.72, 5.45, 1.3],
];

const LAMPS = [
  [-0.45, 0.5, 'L'],
  [-0.45, 3.5, 'L'],
  [-0.45, 6.5, 'L'],
  [14.45, 0.5, 'R'],
  [14.45, 3.5, 'R'],
  [14.45, 6.5, 'R'],
];

export default function GridScanLotMap({
  userCar = { plate: 'LEA-1234', color: '#c8102e', passengers: '2' },
  onBack,
}) {
  const gridbgRef = useRef(null);
  const mwRef = useRef(null);
  const lotwRef = useRef(null);

  // Initial spots state
  const [spots, setSpots] = useState(() => {
    const list = [];
    for (let r = 0; r < R; r++) {
      for (let c = 0; c < C; c++) {
        if (!roadAt(r, c)) {
          const acc = r === 1 ? [0, c] : r === 2 ? [3, c] : r === 4 ? [3, c] : [6, c];
          const id = 'ABCD'[[1, 2, 4, 5].indexOf(r)] + (c < 6 ? c : c - 1);
          const col = CAR_COLORS[(r * 3 + c) % CAR_COLORS.length];
          const occ = (r * 7 + c * 13 + r * c) % 5 < 2;
          list.push({ r, c, id, acc, col, occ });
        }
      }
    }
    return list;
  });

  const [selectedSlot, setSelectedSlot] = useState(null);
  const [guidanceActive, setGuidanceActive] = useState(false);
  const [animStep, setAnimStep] = useState(null);
  const [arrived, setArrived] = useState(false);

  // Compute BFS distances from entrance gate
  const k = useCallback((p) => p[0] * C + p[1], []);

  const { dist, prev } = useMemo(() => {
    const d = {};
    const p = {};
    const q = [ENT];
    d[k(ENT)] = 0;
    for (let i = 0; i < q.length; i++) {
      const [r, c] = q[i];
      for (const [dr, dc] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) {
        const n = [r + dr, c + dc];
        if (n[0] < 0 || n[1] < 0 || n[0] >= R || n[1] >= C || !roadAt(n[0], n[1]) || d[k(n)] != null) continue;
        d[k(n)] = d[k(q[i])] + 1;
        p[k(n)] = q[i];
        q.push(n);
      }
    }
    return { dist: d, prev: p };
  }, [k]);

  // Rank available spots using Min-Heap
  const rankedSlots = useMemo(() => {
    const heap = new MinHeap();
    spots.forEach((s) => {
      if (!s.occ) {
        heap.push(dist[k(s.acc)] + 1, s);
      }
    });
    const result = [];
    while (result.length < 5) {
      const item = heap.pop();
      if (!item) break;
      result.push(item[1]);
    }
    return result;
  }, [spots, dist, k]);

  // Route calculation
  const routeTo = useCallback(
    (to) => {
      const p = [];
      let cur = to;
      while (cur) {
        p.push(cur);
        cur = prev[k(cur)];
      }
      return p.reverse();
    },
    [prev, k]
  );

  // Auto-select nearest slot on initial load or slot vacancy changes
  useEffect(() => {
    if (!selectedSlot || selectedSlot.occ) {
      if (rankedSlots.length > 0) {
        setSelectedSlot(rankedSlots[0]);
      }
    }
  }, [rankedSlots, selectedSlot]);

  // Current active path to selected parking bay
  const path = useMemo(() => {
    if (!selectedSlot) return [];
    return routeTo(selectedSlot.acc).concat([[selectedSlot.r, selectedSlot.c]]);
  }, [selectedSlot, routeTo]);

  // Turn-by-turn directions generator
  const directions = useMemo(() => {
    if (path.length <= 1) return [];
    const out = [];
    let seg = null;
    let h = [0, 1];
    for (let i = 1; i < path.length; i++) {
      const d = [path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]];
      if (seg && seg.d[0] === d[0] && seg.d[1] === d[1] && i < path.length - 1) {
        seg.n++;
      } else {
        const cr = h[0] * d[1] - h[1] * d[0];
        seg = { d, n: 1, t: cr < 0 ? 'right' : cr > 0 ? 'left' : 'straight' };
        out.push(seg);
        h = d;
      }
    }
    return out.map((s, i) => {
      const last = i === out.length - 1;
      if (last) {
        return `Turn <b>${s.t}</b> into <b>slot ${selectedSlot ? selectedSlot.id : ''}</b> and park.`;
      }
      if (i === 0) {
        return `Enter and ${s.t === 'straight' ? 'drive straight' : 'turn <b>' + s.t + '</b> and drive'} for ~${s.n * M} m.`;
      }
      return `Turn <b>${s.t}</b> and continue ~${s.n * M} m.`;
    });
  }, [path, selectedSlot]);

  // Refresh availability handler
  const handleRefresh = () => {
    setSpots((prevSpots) => {
      const next = [...prevSpots];
      for (let i = 0; i < 4; i++) {
        const idx = Math.floor(Math.random() * next.length);
        next[idx] = { ...next[idx], occ: !next[idx].occ };
      }
      return next;
    });
  };

  // Start animated guidance
  const handleStartGuidance = () => {
    if (guidanceActive || path.length <= 1) return;
    setGuidanceActive(true);
    setArrived(false);
    let step = 0;

    const interval = setInterval(() => {
      if (step >= path.length) {
        clearInterval(interval);
        setGuidanceActive(false);
        setArrived(true);
        setAnimStep(null);
        return;
      }

      const p = path[step];
      const nextP = path[step + 1] || path[step - 1] || p;
      const dr = nextP[0] - p[0];
      const dc = nextP[1] - p[1];
      const ang =
        step + 1 < path.length
          ? (Math.atan2(dc, -dr) * 180) / Math.PI
          : (Math.atan2(p[1] - path[step - 1][1], -(p[0] - path[step - 1][0])) * 180) / Math.PI;

      setAnimStep({ coord: p, angle: ang });
      step++;
    }, 350);
  };

  // WebGL2 GridScan effect
  useEffect(() => {
    const container = gridbgRef.current;
    if (!container) return;

    let destroyed = false;
    let raf = 0;

    const V = `#version 300 es
out vec2 vUv;void main(){vec2 p=vec2(float((gl_VertexID<<1)&2),float(gl_VertexID&2));vUv=p;gl_Position=vec4(p*2.0-1.0,0.0,1.0);}`;

    const ROOM = `#version 300 es
precision highp float;precision highp int;
uniform float uAspect,uPixel,uDepth,uThick,uDot,uFade,uScanZ,uScanDir,uScanAlpha,uScanWidth,uTrail,uReveal,uPoints,uReflect,uHaze,uShade,uLight,uTime;
uniform vec3 uEye,uCell,uLineColor,uScanColor,uCoreColor;uniform int uStyle;
uniform vec4 uPing[4];uniform float uPingAlpha[4];uniform vec4 uHover;
in vec2 vUv;layout(location=0)out vec4 outColor;layout(location=1)out vec4 outGlow;
struct Light{float grid,fade,core,trail,spill,ping,wake,reveal;};
float hash(vec2 p){vec3 q=fract(vec3(p.xyx)*0.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
vec2 hash2(vec2 p){vec3 q=fract(vec3(p.xyx)*vec3(0.1031,0.103,0.0973));q+=dot(q,q.yzx+33.33);return fract((q.xx+q.yz)*q.zy);}
float lines(float across,float period,float fa){float u=across/period;float du=fa/period;float d=abs(fract(u+0.5)-0.5)/max(du,1e-5);float dense=smoothstep(0.1,0.4,du);float cov=clamp(uThick+0.5-d,0.0,1.0);float mean=min(1.0,2.0*uThick*du);return mix(cov,mean,dense);}
float depthFade(float z){float n=clamp(z/uDepth,0.0,1.0);return mix(1.0,(exp(-3.0*n)-0.0497871)/0.9502129,uFade);}
vec3 project(vec3 eye,vec3 o,int face,float plane){vec3 d=o-eye;float t=face==0?(plane-o.x)/d.x:(face==1?(plane-o.y)/d.y:(plane-o.z)/d.z);return o+d*t;}
void trace(vec3 o,vec3 d,out int face,out float plane,out vec3 h){float sx=d.x>0.0?0.5*uAspect:-0.5*uAspect;float sy=d.y>0.0?0.5:-0.5;float tx=abs(d.x)>1e-6?(sx-o.x)/d.x:1e9;float ty=abs(d.y)>1e-6?(sy-o.y)/d.y:1e9;float t=(uDepth-o.z)/d.z;face=2;plane=uDepth;if(tx<t){face=0;plane=sx;t=tx;}if(ty<t){face=1;plane=sy;t=ty;}h=o+d*t;}
vec2 faceUv(vec3 h,int face){if(face==0)return vec2(h.z,h.y+0.5);if(face==1)return vec2(h.x+0.5*uAspect,h.z);return vec2(h.x+0.5*uAspect,h.y+0.5);}
Light illuminate(vec3 h,int face,vec2 uv,vec2 foot,float blur){Light l;vec2 cell=face==0?uCell.zy:(face==1?uCell.xz:uCell.xy);vec2 f=foot*blur;
float minor=max(lines(uv.x,cell.x,f.x),lines(uv.y,cell.y,f.y));float major=max(lines(uv.x,cell.x*4.0,f.x),lines(uv.y,cell.y*4.0,f.y));l.grid=max(minor*0.75,major)/blur;
float z=h.z;l.fade=depthFade(z);l.reveal=smoothstep(uReveal,uReveal-0.2,z);float zFoot=face==0?f.x:(face==1?f.y:0.0);float width=max(uScanWidth,zFoot*1.1);float dz=z-uScanZ;
l.core=exp(-dz*dz/(width*width))*(face==2?0.45:1.0)*uScanAlpha;float behind=-dz*uScanDir;l.trail=exp(-max(behind,0.0)/uTrail)*smoothstep(-width,width*0.5,behind)*uScanAlpha;l.spill=exp(-dz*dz/0.05)*uScanAlpha;
l.ping=0.0;l.wake=0.0;for(int i=0;i<4;i++){float a=uPingAlpha[i];if(a<=0.0)continue;float dist=length(h-uPing[i].xyz)-uPing[i].w;l.ping+=exp(-dist*dist/0.0012)*a;l.wake+=exp(min(dist,0.0)/0.22)*smoothstep(0.03,-0.03,dist)*a;}return l;}
void over(inout vec4 acc,vec3 c,float a){a=clamp(a,0.0,1.0);acc=vec4(c*a,a)+acc*(1.0-a);}
void paint(inout vec4 color,inout float energy,Light l,float gain,float lift,float hover){float base=l.grid*l.fade*l.reveal*lift;float far=l.fade*l.reveal*gain;
float lit=l.grid*(l.core*1.2+l.trail*0.75+l.ping*1.4+l.wake*0.5+hover*0.5)*far;float sheen=(l.core*0.14+l.spill*0.05+l.trail*0.03+l.ping*0.2+l.wake*0.04)*far;float laser=(l.core+l.ping*0.35)*far;
over(color,uLineColor,base);over(color,uScanColor,sheen);over(color,uScanColor,lit);over(color,uCoreColor,laser*0.9);energy+=laser*0.9+lit*0.5;}
void main(){vec3 p=vec3((vUv.x-0.5)*uAspect,vUv.y-0.5,0.0);vec3 d=p-uEye;int face;float plane;vec3 h;trace(p,d,face,plane,h);
vec3 hx=project(uEye,p+vec3(uPixel,0.0,0.0),face,plane);vec3 hy=project(uEye,p+vec3(0.0,uPixel,0.0),face,plane);vec2 uv=faceUv(h,face);vec2 ux=faceUv(hx,face)-uv;vec2 uy=faceUv(hy,face)-uv;
vec2 foot=vec2(length(vec2(ux.x,uy.x)),length(vec2(ux.y,uy.y)));Light l=illuminate(h,face,uv,foot,1.0);vec4 color=vec4(0.0);float energy=0.0;
if(uShade>0.0){vec2 gaps=face==0?vec2(0.5-abs(h.y),uDepth-h.z):(face==1?vec2(0.5*uAspect-abs(h.x),uDepth-h.z):vec2(0.5*uAspect-abs(h.x),0.5-abs(h.y)));
vec2 crease=1.0-exp(-max(gaps,0.0)/0.16);float occ=crease.x*crease.y;float lamp=1.0/(1.0+h.z*h.z*0.9);float tilt=face==1?(plane<0.0?1.1:0.85):(face==2?0.8:1.0);
float shadow=(1.0-lamp*tilt)*0.09+(1.0-occ)*0.2;over(color,vec3(0.0),shadow*uShade*l.reveal*l.fade);over(color,uScanColor,(l.spill*0.5+l.trail*0.12)*l.reveal*l.fade*uShade*occ*0.35);}
if(face==1&&plane<0.0&&uReflect>0.0){vec3 mirror=vec3(uEye.x,-1.0-uEye.y,uEye.z);vec3 r=h-mirror;int face2;float plane2;vec3 h2;trace(h,r,face2,plane2,h2);vec2 uv2=faceUv(h2,face2);
vec2 ux2=faceUv(project(mirror,hx,face2,plane2),face2)-uv2;vec2 uy2=faceUv(project(mirror,hy,face2,plane2),face2)-uv2;vec2 foot2=vec2(length(vec2(ux2.x,uy2.x)),length(vec2(ux2.y,uy2.y)));
float travel=length(h2-h);Light m=illuminate(h2,face2,uv2,foot2,1.0+travel*4.0);m.reveal*=l.reveal;float g=1.0-normalize(r).y;
float gain=(0.3+0.7*g*g*g*g)*uReflect*exp(-travel*1.1)*0.6;float refl=0.0;paint(color,refl,m,gain,0.0,0.0);energy+=refl*0.6;}
vec3 near=h-uHover.xyz;float hover=exp(-dot(near,near)/0.08)*uHover.w;paint(color,energy,l,1.0,1.0,hover);
if(uPoints>0.5){vec2 cell=face==0?uCell.zy:(face==1?uCell.xz:uCell.xy);vec2 spacing=cell/2.5;vec2 q=uv/spacing;vec2 id=floor(q);vec2 seed=id+vec2(float(face)*13.7+plane*5.3,float(face)*3.1);
vec2 delta=(q-id-(0.2+0.6*hash2(seed)))*spacing;float det=ux.x*uy.y-ux.y*uy.x;vec2 s=vec2(delta.x*uy.y-delta.y*uy.x,ux.x*delta.y-ux.y*delta.x)/det;
float radius=uDot*mix(1.0,0.55,clamp(h.z/uDepth,0.0,1.0));float spot=clamp(radius+0.5-length(s),0.0,1.0);float gap=min(spacing.x/foot.x,spacing.y/foot.y);float r=hash(seed+7.7);
float fl=0.75+0.25*sin(uTime*(3.0+r*5.0)+r*40.0);float dots=spot*smoothstep(5.0,10.0,gap)*smoothstep(0.25,0.6,r)*(0.3+0.7*r*r)*fl;
float hot=l.core*2.5+l.ping*1.6;float warm=l.trail*l.trail*1.3+l.wake*0.6+hover*1.3;float spark=dots*(hot+warm)*l.fade*l.reveal;
over(color,mix(uScanColor,uCoreColor,clamp(hot/max(hot+warm,1e-4),0.0,1.0)),spark);energy+=spark*0.9;}
energy=clamp(energy,0.0,1.0);outColor=color;outGlow=vec4(uScanColor*energy,energy);}`;

    const DOWN = `#version 300 es
precision highp float;uniform sampler2D uSource;uniform vec2 uTexel;in vec2 vUv;out vec4 outColor;
void main(){vec2 o=uTexel;outColor=0.25*(texture(uSource,vUv+vec2(-o.x,-o.y))+texture(uSource,vUv+vec2(o.x,-o.y))+texture(uSource,vUv+vec2(-o.x,o.y))+texture(uSource,vUv+vec2(o.x,o.y)));}`;

    const BLUR = `#version 300 es
precision highp float;uniform sampler2D uSource;uniform vec2 uStep;in vec2 vUv;out vec4 outColor;
void main(){vec4 s=texture(uSource,vUv)*0.1964825501511404;
s+=(texture(uSource,vUv+uStep*1.411764705882353)+texture(uSource,vUv-uStep*1.411764705882353))*0.2969069646728344;
s+=(texture(uSource,vUv+uStep*3.2941176470588234)+texture(uSource,vUv-uStep*3.2941176470588234))*0.09447039785044732;
s+=(texture(uSource,vUv+uStep*5.176470588235294)+texture(uSource,vUv-uStep*5.176470588235294))*0.010381362401148057;outColor=s;}`;

    const COMP = `#version 300 es
precision highp float;uniform sampler2D uScene,uBloom;uniform float uGlow;in vec2 vUv;out vec4 outColor;
void main(){vec4 sc=texture(uScene,vUv);vec4 b=texture(uBloom,vUv)*uGlow;b.a=min(b.a,1.0);b.rgb=min(b.rgb,vec3(b.a));outColor=sc+b*(1.0-sc.a);}`;

    const cl = (v, a, b) => Math.min(b, Math.max(a, v));

    const cv = document.createElement('canvas');
    cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block';
    container.appendChild(cv);

    const gl = cv.getContext('webgl2', {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      stencil: false,
    });
    if (!gl) return;

    const sh = (t, s) => {
      const x = gl.createShader(t);
      gl.shaderSource(x, s);
      gl.compileShader(x);
      return x;
    };

    const mk = (f) => {
      const p = gl.createProgram();
      gl.attachShader(p, sh(gl.VERTEX_SHADER, V));
      gl.attachShader(p, sh(gl.FRAGMENT_SHADER, f));
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) return null;
      const u = {};
      const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
      for (let i = 0; i < n; i++) {
        const a = gl.getActiveUniform(p, i).name.replace(/\[0\]$/, '');
        u[a] = gl.getUniformLocation(p, a);
      }
      return { p, u };
    };

    const room = mk(ROOM);
    const down = mk(DOWN);
    const blur = mk(BLUR);
    const comp = mk(COMP);
    if (!room || !down || !blur || !comp) return;

    const vao = gl.createVertexArray();
    const tg = () => {
      const t = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t);
      [
        [10241, 9729],
        [10240, 9729],
        [10242, 33071],
        [10243, 33071],
      ].forEach((a) => gl.texParameteri(gl.TEXTURE_2D, a[0], a[1]));
      return { t, w: 0, h: 0 };
    };

    const sz = (g, w, h) => {
      if (g.w === w && g.h === h) return;
      g.w = w;
      g.h = h;
      gl.bindTexture(gl.TEXTURE_2D, g.t);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    };

    const scene = tg();
    const lightT = tg();
    const bA = tg();
    const bB = tg();
    const fS = gl.createFramebuffer();
    const fA = gl.createFramebuffer();
    const fB = gl.createFramebuffer();

    const pr = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
    const rgb = (c) => {
      pr.clearRect(0, 0, 1, 1);
      pr.fillStyle = '#000';
      pr.fillStyle = c;
      pr.fillRect(0, 0, 1, 1);
      const d = pr.getImageData(0, 0, 1, 1).data;
      return [d[0] / 255, d[1] / 255, d[2] / 255];
    };

    const view = { w: 1, h: 1, r: 1 };
    const eye = { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0, f: 2.5 };
    const look = { x: 0, y: 0, held: false };
    const ptr = { x: 0, y: 0, in: false };
    const hov = { x: 0, y: 0, z: 0, s: 0, ready: false };
    const scan = { z: 0, dir: 1, a: 0, start: 0, sweeps: 0, wait: false };
    const pings = [];
    const pd = new Float32Array(16);
    const pa = new Float32Array(4);
    let time = 0;
    let intro = 0;
    let last = 0;

    const proj = (x, z) => {
      const s = eye.f / (z + eye.f);
      const a = view.w / view.h;
      const px = eye.x + (x - eye.x) * s;
      const py = eye.y + (-0.5 - eye.y) * s;
      return [(px / a + 0.5) * view.w, (0.5 - py) * view.h];
    };

    const rs = () => {
      const a = view.w / view.h;
      const cy = 1 / 12;
      const cx = a / Math.max(1, Math.round(a / cy));
      return { a, cx, cy, D: 1.2 };
    };

    const cast = (u, v) => {
      const { a, D } = rs();
      const px = (u - 0.5) * a;
      const py = v - 0.5;
      const dx = px - eye.x;
      const dy = py - eye.y;
      const dz = eye.f;
      const sx = dx > 0 ? 0.5 * a : -0.5 * a;
      const sy = dy > 0 ? 0.5 : -0.5;
      let t = D / dz;
      if (Math.abs(dx) > 1e-6) t = Math.min(t, (sx - px) / dx);
      if (Math.abs(dy) > 1e-6) t = Math.min(t, (sy - py) / dy);
      return { x: px + dx * t, y: py + dy * t, z: dz * t };
    };

    const sweep = () => {
      scan.dir = 1;
      scan.start = time;
      scan.wait = false;
      scan.sweeps++;
    };

    const resize = () => {
      view.w = Math.max(1, container.clientWidth);
      view.h = Math.max(1, container.clientHeight);
      view.r = Math.min(window.devicePixelRatio || 1, 1.5);
      cv.width = Math.round(view.w * view.r);
      cv.height = Math.round(view.h * view.r);
      sz(scene, cv.width, cv.height);
      sz(lightT, cv.width, cv.height);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fS);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, scene.t, 0);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, lightT.t, 0);
      const w = Math.max(1, cv.width >> 2);
      const h = Math.max(1, cv.height >> 2);
      sz(bA, w, h);
      sz(bB, w, h);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fA);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, bA.t, 0);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fB);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, bB.t, 0);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      draw();
    };

    const tri = () => gl.drawArrays(gl.TRIANGLES, 0, 3);

    const draw = () => {
      const { a, cx, cy, D } = rs();
      const L = rgb('#9d9686');
      const S = rgb('#3d7a4a');
      const u = room.u;

      gl.bindVertexArray(vao);
      gl.disable(gl.BLEND);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fS);
      gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1]);
      gl.viewport(0, 0, cv.width, cv.height);
      gl.useProgram(room.p);

      gl.uniform1f(u.uAspect, a);
      gl.uniform1f(u.uPixel, 1 / cv.height);
      gl.uniform3f(u.uEye, eye.x, eye.y, -eye.f);
      gl.uniform1f(u.uDepth, D);
      gl.uniform3f(u.uCell, cx, cy, cy);
      gl.uniform1f(u.uThick, 1 * view.r * 0.5);
      gl.uniform1f(u.uDot, 1.8 * view.r);
      gl.uniform1i(u.uStyle, 0);
      gl.uniform3fv(u.uLineColor, L);
      gl.uniform3fv(u.uScanColor, S);
      gl.uniform3fv(u.uCoreColor, S);
      gl.uniform1f(u.uFade, 0.6);
      gl.uniform1f(u.uScanZ, scan.z);
      gl.uniform1f(u.uScanDir, scan.dir);
      gl.uniform1f(u.uScanAlpha, scan.a);
      gl.uniform1f(u.uScanWidth, 0.006);
      gl.uniform1f(u.uTrail, 0.04 + 0.5 * 1.1);
      gl.uniform1f(u.uReveal, intro < 1 ? scan.z + 0.05 : 1e4);
      gl.uniform1f(u.uPoints, 1);
      gl.uniform1f(u.uReflect, 0.3);
      gl.uniform1f(u.uHaze, 0.03);
      gl.uniform1f(u.uShade, 0.6);
      gl.uniform1f(u.uLight, 1);
      gl.uniform4fv(u.uPing, pd);
      gl.uniform1fv(u.uPingAlpha, pa);
      gl.uniform4f(u.uHover, hov.x, hov.y, hov.z, hov.s);
      gl.uniform1f(u.uTime, time);
      tri();

      gl.bindFramebuffer(gl.FRAMEBUFFER, fA);
      gl.viewport(0, 0, bA.w, bA.h);
      gl.useProgram(down.p);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, lightT.t);
      gl.uniform1i(down.u.uSource, 0);
      gl.uniform2f(down.u.uTexel, 1 / lightT.w, 1 / lightT.h);
      tri();

      const sp = (2.2 * view.r) / 2;
      gl.useProgram(blur.p);
      gl.uniform1i(blur.u.uSource, 0);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fB);
      gl.bindTexture(gl.TEXTURE_2D, bA.t);
      gl.uniform2f(blur.u.uStep, sp / bA.w, 0);
      tri();

      gl.bindFramebuffer(gl.FRAMEBUFFER, fA);
      gl.bindTexture(gl.TEXTURE_2D, bB.t);
      gl.uniform2f(blur.u.uStep, 0, sp / bA.h);
      tri();

      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, cv.width, cv.height);
      gl.useProgram(comp.p);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, scene.t);
      gl.uniform1i(comp.u.uScene, 0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, bA.t);
      gl.uniform1i(comp.u.uBloom, 1);
      gl.uniform1f(comp.u.uGlow, 0.6 * 0.8);
      tri();
      gl.activeTexture(gl.TEXTURE0);
    };

    const layLot = (pFunc) => {
      const mw = mwRef.current;
      const m = lotwRef.current;
      const st = container;
      if (!mw || !m || !st || !st.clientHeight) return;
      const W = m.offsetWidth;
      const H = m.offsetHeight;
      if (!W || !H) return;

      const f = 2.5;
      const z0 = 0.02;
      const z1 = 1.1;
      const a = st.clientWidth / st.clientHeight;
      const xw = (0.48 * a) / (f / (z0 + f));
      const D = [pFunc(-xw, z1), pFunc(xw, z1), pFunc(xw, z0), pFunc(-xw, z0)];
      const S = [
        [0, 0],
        [W, 0],
        [W, H],
        [0, H],
      ];
      const A = [];
      S.forEach((p, i) => {
        const x = p[0];
        const y = p[1];
        const u = D[i][0];
        const v = D[i][1];
        A.push([x, y, 1, 0, 0, 0, -u * x, -u * y, u], [0, 0, 0, x, y, 1, -v * x, -v * y, v]);
      });

      for (let i = 0; i < 8; i++) {
        let p = i;
        for (let r = i + 1; r < 8; r++) {
          if (Math.abs(A[r][i]) > Math.abs(A[p][i])) p = r;
        }
        [A[i], A[p]] = [A[p], A[i]];
        for (let r = 0; r < 8; r++) {
          if (r === i) continue;
          const kVal = A[r][i] / A[i][i];
          for (let c = i; c < 9; c++) A[r][c] -= kVal * A[i][c];
        }
      }
      const h = A.map((r, i) => r[8] / r[i]);
      mw.style.transform = `matrix3d(${h[0]},${h[3]},0,${h[6]},${h[1]},${h[4]},0,${h[7]},0,0,1,0,${h[2]},${h[5]},0,1)`;
    };

    const frame = (now) => {
      if (destroyed) return;
      raf = requestAnimationFrame(frame);
      if (document.hidden || container.clientWidth < 4) {
        last = 0;
        return;
      }
      const dt = last ? cl((now - last) / 1000, 0.001, 0.05) : 1 / 60;
      last = now;
      time += dt;
      const { D } = rs();

      if (intro < 1) intro = Math.min(1, intro + dt / 2.2);
      if (intro < 1) {
        const kVal = intro;
        scan.dir = 1;
        scan.z = kVal * (D + 0.4) - 0.2;
        scan.a = Math.min(1, kVal * 6) * (1 - Math.max(0, kVal - 0.85) / 0.15);
      } else {
        if (scan.sweeps === 0 && !scan.wait) {
          scan.wait = true;
          scan.start = time;
          scan.a = 0;
        }
        if (scan.wait) {
          scan.a = 0;
          if (time - scan.start >= 1.4) sweep();
        } else {
          const kVal = (time - scan.start) / 2.6;
          if (kVal >= 1) {
            scan.wait = true;
            scan.start = time;
            scan.a = 0;
          } else {
            scan.z = kVal * (D + 0.3) - 0.15;
            scan.a = Math.min(1, kVal / 0.12) * Math.min(1, (1 - kVal) / 0.12);
          }
        }
      }

      const nx = look.held ? look.x : Math.sin(time * 0.21) * 0.2 + Math.sin(time * 0.083 + 1.3) * 0.12;
      const ny = look.held ? look.y : Math.sin(time * 0.17 + 2.1) * 0.16;
      eye.tx = nx * 1 * 0.22 * (view.w / view.h);
      eye.ty = 1.1 + ny * 1 * 0.22;

      const n = Math.max(1, Math.ceil(dt * 120));
      const hStep = dt / n;
      for (let i = 0; i < n; i++) {
        eye.vx += ((eye.tx - eye.x) * 42 - eye.vx * 11) * hStep;
        eye.vy += ((eye.ty - eye.y) * 42 - eye.vy * 11) * hStep;
        eye.x += eye.vx * hStep;
        eye.y += eye.vy * hStep;
      }

      const aim = ptr.in ? 1 : 0;
      if (aim) {
        const t = cast(ptr.x, ptr.y);
        if (!hov.ready) Object.assign(hov, t, { ready: true });
        const f = 1 - Math.exp(-dt / 0.08);
        hov.x += (t.x - hov.x) * f;
        hov.y += (t.y - hov.y) * f;
        hov.z += (t.z - hov.z) * f;
      }
      hov.s += (aim - hov.s) * (1 - Math.exp(-dt / 0.25));
      if (!aim && hov.s < 0.01) hov.ready = false;

      for (let i = pings.length - 1; i >= 0; i--) {
        pings[i].age += dt;
        if (pings[i].age > 2.4) pings.splice(i, 1);
      }
      for (let i = 0; i < 4; i++) {
        const p = pings[i];
        if (!p) {
          pa[i] = 0;
          continue;
        }
        const kVal = p.age / 2.4;
        pd.set([p.x, p.y, p.z, p.age * 1.15], i * 4);
        pa[i] = Math.min(1, p.age / 0.05) * (1 - kVal) * (1 - kVal);
      }

      layLot(proj);
      draw();
    };

    const loc = (e) => {
      const r = container.getBoundingClientRect();
      const u = (e.clientX - r.left) / r.width;
      const v = 1 - (e.clientY - r.top) / r.height;
      return { u, v, in: u >= 0 && u <= 1 && v >= 0 && v <= 1 };
    };

    const onPointerMove = (e) => {
      const p = loc(e);
      ptr.x = p.u;
      ptr.y = p.v;
      ptr.in = p.in;
      if (p.in) {
        look.x = cl(p.u * 2 - 1, -1, 1);
        look.y = cl(p.v * 2 - 1, -1, 1);
        look.held = true;
      }
    };

    const onPointerLeave = () => {
      ptr.in = false;
      look.held = false;
    };

    const onPointerDown = (e) => {
      if (e.target.closest('button,input,select,label,a,.free')) return;
      const p = loc(e);
      if (!p.in) return;
      pings.unshift(Object.assign(cast(p.u, p.v), { age: 0 }));
      if (pings.length > 4) pings.pop();
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onPointerLeave);
    window.addEventListener('pointerdown', onPointerDown, { passive: true });

    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();
    raf = requestAnimationFrame(frame);

    return () => {
      destroyed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('pointerdown', onPointerDown);
      if (container.contains(cv)) {
        container.removeChild(cv);
      }
    };
  }, []);

  const freeCount = spots.filter((s) => !s.occ).length;
  const occupiedCount = spots.length - freeCount;

  return (
    <section className="page map-view on">
      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px 60px' }}>
        {/* ================= TOP SECTION: GRID (LEFT) + NEAREST AVAILABLE (RIGHT) ================= */}
        <div className="map-top-layout">
          {/* Main 3D Parking Lot Stage on the Left */}
          <div className="card stage" style={{ height: 620, minHeight: 620, position: 'relative' }}>
            <div id="gridbg" ref={gridbgRef} aria-hidden="true" />

            {/* Top Stage Header (Steps, Title, Chips) */}
            <div className="stage-top-header">
              <div className="steps">
                <span>Step 3 of 3</span>
                <i className="on" />
                <i className="on" />
                <i className="on" />
              </div>
              <h3 style={{ fontFamily: 'var(--serif)', fontWeight: 900, fontSize: 32, margin: '8px 0 10px', color: 'var(--ink)' }}>
                Pick your slot
              </h3>

              {/* Chips row */}
              <div className="chips">
                <span className="chip">{userCar.plate || 'PLATE'}</span>
                <span className="chip">
                  <span className="dot" style={{ background: userCar.color }} />
                  Colour
                </span>
                <span className="chip">
                  {userCar.passengers} passenger{userCar.passengers === '1' ? '' : 's'}
                </span>
              </div>
            </div>

            {/* Perspective Projector Wrapper for 3D Lot */}
            <div className="mapw" ref={mwRef}>
              <div id="lotw" ref={lotwRef}>
                <div id="lotin">
                  <div id="map">
                    {Array.from({ length: R }).map((_, r) =>
                      Array.from({ length: C }).map((_, c) => {
                        const isRoad = roadAt(r, c);
                        const isEntrance = r === 0 && c === 0;

                        if (isRoad) {
                          const pathIdx = path.findIndex(([pr, pc]) => pr === r && pc === c);
                          const isPath = pathIdx !== -1;
                          let arrowAngle = 0;
                          if (isPath) {
                            const p = path[pathIdx];
                            const n = path[pathIdx + 1] || path[pathIdx - 1] || p;
                            const dr = n[0] - p[0];
                            const dc = n[1] - p[1];
                            arrowAngle = (Math.atan2(dc, -dr) * 180) / Math.PI;
                          }

                          const isAnimCurrent =
                            animStep && animStep.coord[0] === r && animStep.coord[1] === c;

                          return (
                            <div
                              key={`${r}-${c}`}
                              className={`road ${isEntrance ? 'ent' : r % 3 === 0 ? 'h' : 'v'} ${
                                isPath ? 'path' : ''
                              }`}
                            >
                              {isEntrance && 'IN'}
                              {isPath && !isEntrance && (
                                <svg
                                  className="arr"
                                  viewBox="0 0 24 24"
                                  style={{ transform: `rotate(${arrowAngle}deg)` }}
                                  aria-hidden="true"
                                >
                                  <path d="M12 3.5L18.5 11H14V20H10V11H5.5L12 3.5Z" fill="#1f2430" />
                                </svg>
                              )}
                              {isAnimCurrent && (
                                <div
                                  className="mk"
                                  style={{ transform: `rotate(${animStep.angle}deg)` }}
                                >
                                  {renderCarSvg(userCar.color)}
                                </div>
                              )}
                            </div>
                          );
                        }

                        // Parking slot
                        const spot = spots.find((s) => s.r === r && s.c === c);
                        if (!spot) return <div key={`${r}-${c}`} />;

                        const isSelected = selectedSlot && selectedSlot.id === spot.id;
                        const isAnimCurrent =
                          animStep && animStep.coord[0] === r && animStep.coord[1] === c;

                        return (
                          <div
                            key={`${r}-${c}`}
                            className={`${spot.occ ? 'occ' : 'free'} ${isSelected ? 'sel' : ''}`}
                            onClick={() => {
                              if (!spot.occ) {
                                setSelectedSlot(spot);
                              }
                            }}
                          >
                            {spot.occ ? renderCarSvg(spot.col) : spot.id}
                            {isAnimCurrent && (
                              <div
                                className="mk"
                                style={{ transform: `rotate(${animStep.angle}deg)` }}
                              >
                                {renderCarSvg(userCar.color)}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Scenery: Trees and Street Lamps */}
                  <div id="deco" aria-hidden="true">
                    {TREES.map(([x, y, z], idx) => {
                      const w = (z / C) * 100;
                      return (
                        <div
                          key={idx}
                          className="tree"
                          style={{
                            left: `${(x / C) * 100}%`,
                            top: `${(y / R) * 100}%`,
                            width: `${w}%`,
                            aspectRatio: '1',
                            margin: `${-w / 2}% 0 0 ${-w / 2}%`,
                            transform: 'none',
                          }}
                        >
                          {treeSvg}
                        </div>
                      );
                    })}
                    {LAMPS.map(([x, y, sd], idx) => (
                      <div
                        key={idx}
                        className={`lamp ${sd}`}
                        style={{
                          left: `${(x / C) * 100}%`,
                          top: `${(y / R) * 100}%`,
                        }}
                      >
                        <i className="glow" />
                        <i className="arm" />
                        <i className="base" />
                        <i className="head" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Stage Bottom Floating Legend (Never collides with the lot) */}
            <div className="stage-bottom-legend">
              <div className="leg">
                <span>
                  <i style={{ background: '#2b323d', border: '1.5px solid #fff' }} />
                  Available
                </span>
                <span>
                  <i style={{ background: '#2b323d', border: '1.5px solid #fff', position: 'relative' }} />
                  Occupied
                </span>
                <span>
                  <i style={{ background: 'var(--ye)' }} />
                  Your route
                </span>
                <span>
                  <i style={{ background: 'var(--gr)' }} />
                  Entrance
                </span>
                <span id="cnt" style={{ fontWeight: 700, color: 'var(--ink)' }}>
                  {freeCount} free, {occupiedCount} occupied
                </span>
              </div>
            </div>
          </div>

          {/* Nearest Available Card on the Right */}
          <div className="nearest-card">
            <div className="nearest-inner">
              <h4>Nearest available</h4>
              <div className="nearest-list">
                {rankedSlots.map((s, idx) => {
                  const isSel = selectedSlot && selectedSlot.id === s.id;
                  const meters = (dist[k(s.acc)] + 1) * M;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      className={`nearest-item ${isSel ? 'on' : ''}`}
                      onClick={() => setSelectedSlot(s)}
                    >
                      <span>
                        #{idx + 1} Slot {s.id}
                      </span>
                      <span>{meters} m</span>
                    </button>
                  );
                })}
                {rankedSlots.length === 0 && <p className="dir-empty">Lot is full. Try again shortly.</p>}
              </div>
              <button type="button" className="refresh-btn" onClick={handleRefresh}>
                Refresh availability
              </button>
            </div>
          </div>
        </div>

        {/* ================= BOTTOM SECTION: DIRECTIONS (DOWNWARD, IN HORIZONTAL) ================= */}
        <div className="directions-horizontal-card">
          <div className="dir-header-row">
            <div>
              <h4>Directions & Route Guidance</h4>
              <p style={{ margin: '4px 0 0', color: 'var(--mu)', fontSize: 14 }}>
                Optimized shortest path from Entrance Gate [IN] to Bay {selectedSlot ? selectedSlot.id : '...'}
              </p>
            </div>
            <div className="dir-acts">
              <button
                type="button"
                className="btn o"
                onClick={onBack}
              >
                Back
              </button>
              <button
                type="button"
                className="btn"
                disabled={guidanceActive || path.length <= 1}
                onClick={handleStartGuidance}
                style={{ padding: '14px 28px' }}
              >
                {guidanceActive ? 'Driving...' : 'Start guidance →'}
              </button>
            </div>
          </div>

          {/* Arrival Status Banner */}
          {arrived && (
            <div className="arrived-alert">
              <span>✓</span> You have arrived at your allocated parking bay!
            </div>
          )}

          {/* Horizontal Steps Ribbon */}
          {directions.length > 0 ? (
            <div className="steps-ribbon">
              {directions.map((stepText, idx) => {
                const isLast = idx === directions.length - 1;
                return (
                  <React.Fragment key={idx}>
                    <div className={`step-pill ${isLast ? 'dest' : ''}`}>
                      <div className="step-badge">{idx + 1}</div>
                      <div
                        className="step-text"
                        dangerouslySetInnerHTML={{ __html: stepText }}
                      />
                    </div>
                    {!isLast && (
                      <div className="step-arrow-divider" aria-hidden="true">
                        ➔
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          ) : (
            <p className="dir-empty">Choose a slot on the map or list above to see directions.</p>
          )}
        </div>
      </main>
    </section>
  );
}
