/* ForestMirror hero — binary particle depth field
 * 二进制 0/1 粒子向屏幕深处发散的轻量 canvas 背景。
 * 性能：粒子数自适应 / 30fps 节流 / 离屏暂停 / DPR 限制 / reduced-motion 降级 / 移动端减量。
 */
(function () {
  'use strict';

  var header, canvas, ctx;
  var W = 0, H = 0;
  var particles = [];
  var rafId = null;
  var running = true;
  var lastT = 0;

  var Z_NEAR = 0.5, Z_FAR = 3.4; // 深度范围（z 越小越近）

  function makeParticle(initZ) {
    return {
      x: Math.random() * 2 - 1,
      y: Math.random() * 2 - 1,
      z: initZ === undefined ? Z_NEAR + Math.random() * (Z_FAR - Z_NEAR) : initZ,
      ch: Math.random() < 0.5 ? '0' : '1'
    };
  }

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2); // 限制 DPR，避免高分辨率屏性能崩
    W = header.clientWidth;
    H = header.clientHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function render() {
    // 深色径向渐变背景（中心略亮 → 边缘深），强化空间纵深
    var g = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.75);
    g.addColorStop(0, '#141925');
    g.addColorStop(1, '#05060a');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    var cx = W / 2, cy = H / 2;             // 透视消失点（屏幕中心）
    var spread = Math.min(W, H) * 0.9;      // 发散半径
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      var s = 1 / p.z;
      var sx = cx + p.x * spread * s;
      var sy = cy + p.y * spread * s;
      if (sx < -32 || sx > W + 32 || sy < -32 || sy > H + 32) continue;

      var depth = (p.z - Z_NEAR) / (Z_FAR - Z_NEAR); // 0 = 近，1 = 远
      var alpha = (1 - depth) * 0.9;
      var size = 9 + 24 * s; // 近大远小
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#dfe6f0';
      ctx.font = size.toFixed(1) + 'px Consolas, "SF Mono", Menlo, monospace';
      ctx.fillText(p.ch, sx, sy);
    }
    ctx.globalAlpha = 1;
  }

  function step() {
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.z += 0.004;      // 向深处运动
      p.x *= 1.0006;     // 轻微向外发散
      p.y *= 1.0006;
      if (p.z > Z_FAR || Math.abs(p.x) > 1.35 || Math.abs(p.y) > 1.35) {
        particles[i] = makeParticle(Z_NEAR);
      }
    }
  }

  function loop(t) {
    if (!running) return;
    if (t - lastT >= 33) { // 30fps 节流
      lastT = t;
      render();
      step();
    }
    rafId = requestAnimationFrame(loop);
  }

  function start() {
    cancelAnimationFrame(rafId);
    if (running) rafId = requestAnimationFrame(loop);
  }

  function init() {
    header = document.getElementById('page-header');
    if (!header || !header.classList.contains('full_page')) return; // 仅首页 hero

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var isMobile = Math.min(window.innerWidth, window.innerHeight) < 768;
    var COUNT = reduceMotion ? 60 : (isMobile ? 130 : 380);

    canvas = document.createElement('canvas');
    canvas.id = 'hero-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    header.insertBefore(canvas, header.firstChild);
    ctx = canvas.getContext('2d', { alpha: false });

    for (var i = 0; i < COUNT; i++) particles.push(makeParticle());

    resize();
    if (reduceMotion) {
      render(); // 仅静态一帧
    } else {
      start();
    }

    // 滚动出视口 → 暂停动画
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        running = entries[0].isIntersecting;
        if (running) start();
        else cancelAnimationFrame(rafId);
      }).observe(header);
    }

    // 标签页隐藏 → 暂停
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) cancelAnimationFrame(rafId);
      else if (running) start();
    });

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        resize();
        if (reduceMotion) render();
      }, 150);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
