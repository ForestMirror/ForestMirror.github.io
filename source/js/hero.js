/* ForestMirror hero — 放射状隧道线条 + 中心圆环
 * 白色背景，中心向四周无限发散的黑色放射线（隧道聚焦感），
 * 中心一个黑色圆环，圆环内是 ForestMirror 艺术字标题。
 * 静态绘制（无动画循环），性能极佳。
 */
(function () {
  'use strict';

  var header, canvas, ctx;
  var W = 0, H = 0;

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = header.clientWidth;
    H = header.clientHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function render() {
    var cx = W / 2, cy = H / 2;
    var maxR = Math.sqrt(W * W + H * H) / 2 + 4; // 覆盖到画布四角
    var ringR = Math.min(W, H) * 0.26;           // 中心圆环半径

    // 白色背景
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);

    // 放射状黑线：从圆环外缘向四周发散
    var N = 110;
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.16)';
    for (var i = 0; i < N; i++) {
      var a = (i / N) * Math.PI * 2;
      var dx = Math.cos(a), dy = Math.sin(a);
      ctx.beginPath();
      ctx.moveTo(cx + dx * ringR, cy + dy * ringR);
      ctx.lineTo(cx + dx * maxR, cy + dy * maxR);
      ctx.stroke();
    }

    // 中心白色圆（清空圆环内的线条，形成干净标题区）
    ctx.beginPath();
    ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // 中心黑色圆环描边
    ctx.beginPath();
    ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  function init() {
    header = document.getElementById('page-header');
    if (!header || !header.classList.contains('full_page')) return; // 仅首页

    canvas = document.createElement('canvas');
    canvas.id = 'hero-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    header.insertBefore(canvas, header.firstChild);
    ctx = canvas.getContext('2d', { alpha: false });

    // 标题替换为艺术字图片
    var siteTitle = document.getElementById('site-title');
    if (siteTitle) {
      siteTitle.innerHTML = '<img src="/img/titile.png" alt="ForestMirror\'s Website" />';
    }

    resize();
    render();

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () { resize(); render(); }, 150);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
