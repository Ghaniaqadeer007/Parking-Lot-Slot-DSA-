'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function Car3DViewer({ color = '#c8102e' }) {
  const containerRef = useRef(null);
  const colorRef = useRef(color);
  const bodyMaterialRef = useRef(null);

  useEffect(() => {
    colorRef.current = color;
    if (bodyMaterialRef.current) {
      bodyMaterialRef.current.color.set(color);
    }
  }, [color]);

  useEffect(() => {
    const host = containerRef.current;
    if (!host) return;

    let destroyed = false;
    const T = THREE;
    const R = new T.WebGLRenderer({ antialias: true, alpha: true });
    R.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    host.appendChild(R.domElement);
    R.domElement.style.cssText = 'width:100%;height:100%;display:block;touch-action:pan-y;cursor:grab';

    const S = new T.Scene();
    const C = new T.PerspectiveCamera(30, 1, 0.1, 50);
    C.position.set(0, 0.4, 10.5);
    C.lookAt(0, 0, 0);

    S.add(new T.HemisphereLight(0xffffff, 0xb8b2a6, 1.2));
    const DL = new T.DirectionalLight(0xffffff, 1.5);
    DL.position.set(3, 5, 4);
    S.add(DL);

    const M = (c, m, r) => new T.MeshStandardMaterial({ color: c, metalness: m, roughness: r });
    const body = M(colorRef.current, 0.55, 0.28);
    bodyMaterialRef.current = body;
    const glass = M(0x14121a, 0.4, 0.12);
    const tire = M(0x111111, 0, 0.85);
    const rim = M(0xbfc3ca, 0.9, 0.3);

    const car = new T.Group();
    const add = (g, m, x, y, z, rz) => {
      const o = new T.Mesh(g, m);
      o.position.set(x, y, z);
      if (rz) o.rotation.z = rz;
      car.add(o);
      return o;
    };

    add(new T.BoxGeometry(1.8, 0.55, 4), body, 0, 0.5, 0);
    add(new T.BoxGeometry(1.6, 0.42, 2.1), glass, 0, 1, -0.25);
    add(new T.BoxGeometry(1.5, 0.12, 1.8), body, 0, 1.26, -0.25);

    for (const x of [-0.95, 0.95]) {
      for (const z of [-1.3, 1.3]) {
        add(new T.CylinderGeometry(0.45, 0.45, 0.32, 28), tire, x, 0.38, z, Math.PI / 2);
        add(new T.CylinderGeometry(0.26, 0.26, 0.34, 20), rim, x, 0.38, z, Math.PI / 2);
      }
    }

    for (const x of [-0.6, 0.6]) {
      add(new T.BoxGeometry(0.4, 0.16, 0.06), new T.MeshBasicMaterial({ color: 0xf7e48a }), x, 0.58, 2.01);
      add(new T.BoxGeometry(0.4, 0.16, 0.06), new T.MeshBasicMaterial({ color: 0xf27c8c }), x, 0.58, -2.01);
    }

    car.position.y = -0.55;
    const spin = new T.Group();
    const tilt = new T.Group();
    const fl = new T.Group();
    spin.add(car);
    tilt.add(spin);
    fl.add(tilt);
    S.add(fl);

    const cv = document.createElement('canvas');
    cv.width = cv.height = 128;
    const g = cv.getContext('2d');
    const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, 'rgba(0,0,0,.5)');
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, 128, 128);

    const sh = new T.Mesh(
      new T.PlaneGeometry(5.4, 5.4),
      new T.MeshBasicMaterial({ map: new T.CanvasTexture(cv), transparent: true, depthWrite: false })
    );
    sh.rotation.x = -Math.PI / 2;
    sh.position.y = -1.18;
    S.add(sh);

    const m = {
      yaw: -0.6,
      pv: 0,
      pitch: 0.2,
      vy: 0,
      idle: 0,
      drag: false,
      tx: 0,
      ty: 0,
      gx: 0,
      gy: 0,
      t: 0,
      intro: 0,
      reset: false,
      lx: 0,
      ly: 0,
    };
    const el = R.domElement;

    const onPointerDown = (e) => {
      m.drag = true;
      m.lx = e.clientX;
      m.ly = e.clientY;
      m.vy = 0;
      m.idle = 0;
      el.setPointerCapture(e.pointerId);
      el.style.cursor = 'grabbing';
    };

    const onPointerMove = (e) => {
      const r = el.getBoundingClientRect();
      m.gy = (((e.clientX - r.left) / r.width) * 2 - 1) * 0.15;
      m.gx = (((e.clientY - r.top) / r.height) * 2 - 1) * 0.09;
      if (m.drag) {
        const dx = e.clientX - m.lx;
        const dy = e.clientY - m.ly;
        m.lx = e.clientX;
        m.ly = e.clientY;
        m.yaw += dx * 0.0065;
        m.vy = dx * 0.0065 * 60;
        m.pitch = Math.max(-0.6, Math.min(0.9, m.pitch + dy * 0.0065));
        m.idle = 0;
      }
    };

    const onPointerUp = () => {
      m.drag = false;
      el.style.cursor = 'grab';
    };

    const onPointerLeave = () => {
      m.gx = m.gy = 0;
    };

    const onDblClick = () => {
      m.reset = true;
      m.vy = 0;
    };

    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', onPointerUp);
    el.addEventListener('pointercancel', onPointerUp);
    el.addEventListener('pointerleave', onPointerLeave);
    el.addEventListener('dblclick', onDblClick);

    let rafId = 0;
    let last = 0;

    const loop = (n) => {
      if (destroyed) return;
      rafId = requestAnimationFrame(loop);
      const w = host.clientWidth;
      const h = host.clientHeight;
      if (w < 4 || document.hidden) {
        last = 0;
        return;
      }
      const dt = last ? Math.min((n - last) / 1000, 0.05) : 0.016;
      last = n;

      if (
        R.domElement.width !== Math.round(w * R.getPixelRatio()) ||
        R.domElement.height !== Math.round(h * R.getPixelRatio())
      ) {
        R.setSize(w, h, false);
        C.aspect = w / h;
        C.updateProjectionMatrix();
      }

      m.t += dt;
      m.idle += dt;
      m.intro = Math.min(1, m.intro + dt / 1.3);
      const e = 1 - Math.pow(1 - m.intro, 3);

      if (m.reset) {
        m.yaw += (-0.6 + Math.round((m.yaw + 0.6) / 6.283) * 6.283 - m.yaw) * (1 - Math.exp(-dt * 7));
        m.pitch += (0.2 - m.pitch) * (1 - Math.exp(-dt * 7));
        if (Math.abs(m.pitch - 0.2) < 0.002) m.reset = false;
      } else if (!m.drag) {
        m.yaw += m.vy * dt;
        m.vy *= Math.exp(-dt * 4.5);
        if (m.idle > 2) m.pv += (0.4 - m.pv) * (1 - Math.exp(-dt * 2));
        else m.pv *= 0.9;
        m.yaw += m.pv * dt;
      }

      m.tx += (m.gx - m.tx) * (1 - Math.exp(-dt * 6));
      m.ty += (m.gy - m.ty) * (1 - Math.exp(-dt * 6));

      spin.rotation.set(m.pitch, m.yaw + (1 - e) * -0.5, 0, 'YXZ');
      tilt.rotation.set(m.tx, m.ty, 0);
      fl.position.y = (1 - e) * -0.45 + Math.sin(m.t * 1.3) * 0.08;
      fl.scale.setScalar(0.9 + 0.1 * e);
      R.domElement.style.opacity = e;
      R.render(S, C);
    };

    rafId = requestAnimationFrame(loop);

    return () => {
      destroyed = true;
      cancelAnimationFrame(rafId);
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerup', onPointerUp);
      el.removeEventListener('pointercancel', onPointerUp);
      el.removeEventListener('pointerleave', onPointerLeave);
      el.removeEventListener('dblclick', onDblClick);
      if (host.contains(R.domElement)) {
        host.removeChild(R.domElement);
      }
      R.dispose();
    };
  }, []);

  return <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }} />;
}
