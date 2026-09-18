/* ForestMirror hero + 全屏主题页
 * 第 1 屏：白色背景 + 中心向四周发散的黑色放射线（隧道聚焦感）+ 中心黑色圆环 + 艺术字标题
 * 第 2 屏：DeepSeek 主题全屏页
 * 第 3 屏：OpenAI 主题全屏页
 * 静态绘制（无动画循环），性能极佳。
 */
(function () {
  'use strict';

  var header, canvas, ctx;
  var W = 0, H = 0;

  /* ---------- 第 1 屏：放射线 + 圆环 ---------- */

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

  /* ---------- 第 2、3 屏：品牌主题装饰 ---------- */

  function hexPoints(cx, cy, r, rotDeg) {
    var pts = [];
    for (var i = 0; i < 6; i++) {
      var a = (Math.PI / 180) * (60 * i + rotDeg);
      pts.push((cx + r * Math.cos(a)).toFixed(1) + ',' + (cy + r * Math.sin(a)).toFixed(1));
    }
    return pts.join(' ');
  }

  function deepseekDeco() {
    var rings = '';
    for (var j = 1; j <= 4; j++) rings += '<circle cx="720" cy="450" r="' + (150 * j) + '"/>';
    var waves = '';
    for (var i = 0; i < 4; i++) {
      var y = 620 + i * 58;
      waves += '<path d="M-120,' + y + ' C240,' + (y - 130) + ' 480,' + (y + 130) +
        ' 760,' + y + ' S1280,' + (y - 130) + ' 1560,' + y + '"/>';
    }
    return '<svg class="tp-svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">' +
      '<g fill="none" stroke="rgba(255,255,255,0.09)" stroke-width="1.2">' + rings + '</g>' +
      '<g fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1.4">' + waves + '</g></svg>';
  }

  function openaiDeco() {
    var hexes = '';
    for (var k = 1; k <= 5; k++) hexes += '<polygon points="' + hexPoints(720, 450, 128 * k, -90) + '"/>';
    var grid = '';
    for (var gx = 0; gx <= 1440; gx += 96) {
      for (var gy = 0; gy <= 900; gy += 96) {
        grid += '<path d="M' + gx + ',' + gy + ' l96,0" />';
      }
    }
    return '<svg class="tp-svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">' +
      '<g fill="none" stroke="rgba(18,185,143,0.22)" stroke-width="1.4">' + hexes + '</g>' +
      '<g fill="none" stroke="rgba(18,185,143,0.06)" stroke-width="1">' + grid + '</g></svg>';
  }

  function addThemePages() {
    var main = document.getElementById('content-inner');
    if (!main || !main.parentNode || document.querySelector('.theme-page')) return;

    var defs = [
      { cls: 'theme-deepseek', title: 'DeepSeek', sub: '深度求索 · 大语言模型', deco: deepseekDeco() },
      { cls: 'theme-openai', title: 'OpenAI', sub: '人工智能 · 研究与应用', deco: openaiDeco() }
    ];

    defs.forEach(function (d) {
      var sec = document.createElement('section');
      sec.className = 'theme-page ' + d.cls;
      sec.innerHTML = d.deco +
        '<div class="tp-body"><h2 class="tp-title">' + d.title + '</h2>' +
        '<p class="tp-sub">' + d.sub + '</p></div>';
      main.parentNode.insertBefore(sec, main);
    });
  }

  /* ---------- 初始化 ---------- */

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

    // 插入第 2、3 屏全屏主题页
    addThemePages();

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
