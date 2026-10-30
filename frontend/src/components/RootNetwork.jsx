import { useEffect, useRef } from 'react';

/* A living root / mycelium network. Roots grow in from the edges, branch, and reach toward the cursor. */
function initRoots(canvas) {
  var ctx = canvas.getContext('2d');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var w = 0, h = 0, tips = [], nodes = [], raf = 0, running = false, inView = true, frame = 0, lastMove = 0;
  var mouse = { x: -9999, y: -9999, active: false };
  var colors = { a: '#53643A', b: '#C4912E' };

  function readColors() {
    var cs = getComputedStyle(document.documentElement);
    colors.a = cs.getPropertyValue('--accent').trim() || colors.a;
    colors.b = cs.getPropertyValue('--ochre').trim() || colors.b;
  }
  function dot(x, y, r, color, alpha) {
    ctx.globalAlpha = alpha; ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  function addTip(x, y, a, gen, max) {
    tips.push({ x: x, y: y, a: a, gen: gen, len: 0, max: max, speed: 0.9 + Math.random() * 0.6, ph: Math.random() * 6.28 });
  }
  function addNode(x, y) { nodes.push({ x: x, y: y }); if (nodes.length > 500) nodes.shift(); }

  function seed() {
    var e = Math.random(), x, y, a;
    if (e < 0.6) { x = Math.random() * w; y = h + 4; a = -Math.PI / 2 + (Math.random() - 0.5) * 1.1; }   // up from the ground
    else if (e < 0.8) { x = -4; y = h * (0.3 + Math.random() * 0.7); a = (Math.random() - 0.5) * 0.9; }  // in from the left
    else { x = w + 4; y = h * (0.3 + Math.random() * 0.7); a = Math.PI + (Math.random() - 0.5) * 0.9; }  // in from the right
    addTip(x, y, a, 0, 260 + Math.random() * 320);
  }

  function step() {
    frame++;
    if (!reduce && frame % 4 === 0) {                       // slowly fade old roots so the network keeps renewing
      ctx.globalCompositeOperation = 'destination-out'; ctx.fillStyle = 'rgba(0,0,0,0.014)';
      ctx.fillRect(0, 0, w, h); ctx.globalCompositeOperation = 'source-over';
    }
    ctx.lineCap = 'round';
    var cap = Math.round(Math.min(110, Math.max(28, w / 14)));
    if (tips.length < cap && Math.random() < 0.12) seed();

    if (mouse.active && frame % 12 === 0 && performance.now() - lastMove < 1800 && tips.length < cap + 30) {
      for (var j = 0; j < nodes.length; j += 3) {           // send a new branch from a nearby node toward the cursor
        var n = nodes[j], d0 = Math.hypot(n.x - mouse.x, n.y - mouse.y);
        if (d0 < 300 && d0 > 30 && Math.random() < 0.5) {
          addTip(n.x, n.y, Math.atan2(mouse.y - n.y, mouse.x - n.x) + (Math.random() - 0.5) * 0.5, 2, 110 + Math.random() * 90);
          break;
        }
      }
    }

    for (var i = tips.length - 1; i >= 0; i--) {
      var p = tips[i];
      p.a += Math.sin(frame * 0.012 + p.ph) * 0.03 + (Math.random() - 0.5) * 0.04;      // organic wander
      if (mouse.active) {                                                               // lean toward the cursor
        var dx = mouse.x - p.x, dy = mouse.y - p.y, d = Math.hypot(dx, dy);
        if (d < 260 && d > 6) {
          var diff = Math.atan2(dy, dx) - p.a; diff = Math.atan2(Math.sin(diff), Math.cos(diff));
          p.a += diff * 0.05 * (1 - d / 260);
        }
      }
      var nx = p.x + Math.cos(p.a) * p.speed, ny = p.y + Math.sin(p.a) * p.speed, life = p.len / p.max;
      ctx.globalAlpha = 0.55 * (1 - life * 0.5);
      ctx.strokeStyle = colors.a;
      ctx.lineWidth = Math.max(0.5, (1.7 - p.gen * 0.32) * (1 - life * 0.55));          // thinner toward the tips
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(nx, ny); ctx.stroke();
      p.x = nx; p.y = ny; p.len += p.speed;

      if (p.len > 34 && p.gen < 4 && Math.random() < 0.011) {                           // branch
        var side = Math.random() < 0.5 ? -1 : 1;
        addTip(p.x, p.y, p.a + side * (0.5 + Math.random() * 0.5), p.gen + 1, p.max * (0.45 + Math.random() * 0.25));
        addNode(p.x, p.y); dot(p.x, p.y, 2.2, colors.b, 0.85);
      } else if (Math.random() < 0.03) { addNode(p.x, p.y); }

      if (p.len > p.max || p.x < -20 || p.x > w + 20 || p.y < -20 || p.y > h + 20) {
        dot(p.x, p.y, 1.6, colors.b, 0.7); tips.splice(i, 1);
      }
    }
    ctx.globalAlpha = 1;
  }

  function resize() {
    var r = canvas.parentElement.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = r.width; h = r.height;
    canvas.width = Math.max(1, Math.round(w * dpr)); canvas.height = Math.max(1, Math.round(h * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    tips = []; nodes = []; frame = 0; ctx.clearRect(0, 0, w, h);
    for (var k = 0; k < 14; k++) seed();
    for (var s = 0; s < (reduce ? 700 : 90); s++) step();   // pre-grow so the first paint is not empty (still frame if reduced motion)
  }

  function loop() { if (!running) return; step(); raf = requestAnimationFrame(loop); }
  function start() { if (running || reduce || !inView || document.hidden) return; running = true; raf = requestAnimationFrame(loop); }
  function stop() { running = false; cancelAnimationFrame(raf); }
  function onMove(e) {
    var r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; lastMove = performance.now();
    mouse.active = mouse.x >= 0 && mouse.y >= 0 && mouse.x <= w && mouse.y <= h;
  }
  function onLeave() { mouse.active = false; }
  function onVisibility() { document.hidden ? stop() : start(); }

  readColors(); resize();
  var ro = new ResizeObserver(resize); ro.observe(canvas.parentElement);
  var io = new IntersectionObserver(function (es) { inView = es[0].isIntersecting; inView ? start() : stop(); });
  io.observe(canvas);
  var mo = new MutationObserver(readColors);               // follow palette changes (Moss, Clay, Bark)
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  window.addEventListener('pointermove', onMove, { passive: true });
  document.documentElement.addEventListener('mouseleave', onLeave);
  document.addEventListener('visibilitychange', onVisibility);
  start();

  return function cleanup() {
    stop(); ro.disconnect(); io.disconnect(); mo.disconnect();
    window.removeEventListener('pointermove', onMove);
    document.documentElement.removeEventListener('mouseleave', onLeave);
    document.removeEventListener('visibilitychange', onVisibility);
  };
}

/** Living root network behind the hero: roots grow in, branch, and reach toward the cursor. */
export default function RootNetwork() {
  const ref = useRef(null);
  useEffect(() => initRoots(ref.current), []);
  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}
    />
  );
}
