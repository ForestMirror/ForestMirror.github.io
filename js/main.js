(function () {
  'use strict';

  const articles = [
    {
      id: 'summary',
      title: '博客概览与总结',
      date: '2026-10-03',
      category: '概览',
      chapters: [
        { id: 'summary-overview', num: '0.1', title: '关于本博客' },
        { id: 'summary-topics', num: '0.2', title: '主题方向' },
        { id: 'summary-tools', num: '0.3', title: '工具与环境' }
      ]
    },
    {
      id: 'blog-restart',
      title: '博客重新出发',
      date: '2026-09-15',
      category: '杂谈',
      chapters: [
        { id: 'restart-why', num: '1.1', title: '为什么重新开始' },
        { id: 'restart-content', num: '1.2', title: '这里会有什么' },
        { id: 'restart-about', num: '1.3', title: '关于我' }
      ]
    },
    {
      id: 'fpga-notes',
      title: 'FPGA 学习笔记',
      date: '2026-09-15',
      category: '技术',
      chapters: [
        { id: 'fpga-env', num: '2.1', title: '开发环境' },
        { id: 'fpga-timing', num: '2.2', title: '时序约束入门' },
        { id: 'fpga-cdc', num: '2.3', title: 'CDC 跨时钟域处理' },
        { id: 'fpga-axi', num: '2.4', title: 'AXI 接口基础' },
        { id: 'fpga-ila', num: '2.5', title: 'ILA 在线调试' }
      ]
    },
    {
      id: 'rf-basics',
      title: 'RF 基础笔记',
      date: '2026-09-20',
      category: '技术',
      chapters: [
        { id: 'rf-impedance', num: '3.1', title: '阻抗匹配基础' },
        { id: 'rf-filter', num: '3.2', title: '滤波器设计' },
        { id: 'rf-sparam', num: '3.3', title: 'S 参数分析' }
      ]
    },
    {
      id: 'labview-daq',
      title: 'LabVIEW 数据采集实践',
      date: '2026-09-25',
      category: '技术',
      chapters: [
        { id: 'labview-overview', num: '4.1', title: 'DAQ 系统概述' },
        { id: 'labview-ai', num: '4.2', title: '模拟输入采集' },
        { id: 'labview-trigger', num: '4.3', title: '触发与同步' },
        { id: 'labview-signals', num: '4.4', title: '信号处理 VI' }
      ]
    }
  ];

  let currentArticleId = 'summary';

  const articleListEl = document.getElementById('article-list');
  const tocNavEl = document.getElementById('toc-nav');
  const tocPanel = document.getElementById('toc-panel');
  const searchInput = document.getElementById('search-input');
  const contentMain = document.querySelector('.content-main');
  const mobileTocToggle = document.querySelector('.mobile-toc-toggle');
  const printBtn = document.querySelector('.print-btn');

  function buildSidebar(filter) {
    articleListEl.innerHTML = '';
    const query = (filter || '').toLowerCase().trim();
    let visibleCount = 0;

    articles.forEach(function (article) {
      const matchesTitle = !query || article.title.toLowerCase().includes(query);
      const matchesCategory = !query || article.category.toLowerCase().includes(query);
      const matchesChapter = !query || article.chapters.some(function (ch) {
        return ch.title.toLowerCase().includes(query);
      });

      if (!matchesTitle && !matchesCategory && !matchesChapter) return;

      visibleCount++;
      const li = document.createElement('li');
      li.className = 'article-tab-item';
      li.setAttribute('role', 'presentation');

      const btn = document.createElement('button');
      btn.className = 'article-tab';
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', article.id === currentArticleId ? 'true' : 'false');
      btn.setAttribute('data-article', article.id);
      btn.type = 'button';

      const titleSpan = document.createElement('span');
      titleSpan.textContent = article.title;
      btn.appendChild(titleSpan);

      const metaSpan = document.createElement('span');
      metaSpan.className = 'tab-meta';
      metaSpan.textContent = article.category + ' · ' + article.date;
      btn.appendChild(metaSpan);

      btn.addEventListener('click', function () {
        switchArticle(article.id);
      });

      li.appendChild(btn);
      articleListEl.appendChild(li);
    });

    var existing = articleListEl.parentElement.querySelector('.no-results');
    if (existing) existing.remove();

    if (visibleCount === 0) {
      var noRes = document.createElement('div');
      noRes.className = 'no-results';
      noRes.textContent = '未找到匹配的文章';
      noRes.style.display = 'block';
      articleListEl.parentElement.appendChild(noRes);
    }
  }

  function buildTOC(articleId) {
    tocNavEl.innerHTML = '';
    var article = articles.find(function (a) { return a.id === articleId; });
    if (!article) return;

    article.chapters.forEach(function (ch) {
      var a = document.createElement('a');
      a.className = 'toc-link';
      a.href = '#' + ch.id;
      a.setAttribute('data-section', ch.id);

      var numSpan = document.createElement('span');
      numSpan.className = 'toc-num';
      numSpan.textContent = ch.num;
      a.appendChild(numSpan);

      var textNode = document.createTextNode(ch.title);
      a.appendChild(textNode);

      a.addEventListener('click', function (e) {
        e.preventDefault();
        var target = document.getElementById(ch.id);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          history.replaceState(null, '', '#' + ch.id);
        }
      });

      tocNavEl.appendChild(a);
    });
  }

  function switchArticle(articleId) {
    currentArticleId = articleId;

    document.querySelectorAll('.article-panel').forEach(function (panel) {
      panel.classList.toggle('active', panel.getAttribute('data-article') === articleId);
    });

    document.querySelectorAll('.article-tab').forEach(function (tab) {
      tab.setAttribute('aria-selected', tab.getAttribute('data-article') === articleId ? 'true' : 'false');
    });

    buildTOC(articleId);
    contentMain.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    setTimeout(function () {
      setupScrollSpy();
    }, 100);
  }

  function setupScrollSpy() {
    var article = articles.find(function (a) { return a.id === currentArticleId; });
    if (!article) return;

    var sections = article.chapters.map(function (ch) {
      return document.getElementById(ch.id);
    }).filter(Boolean);

    if (sections.length === 0) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.id;
          document.querySelectorAll('.toc-link').forEach(function (link) {
            link.classList.toggle('active', link.getAttribute('data-section') === id);
          });
        }
      });
    }, {
      rootMargin: '-80px 0px -60% 0px',
      threshold: 0.1
    });

    sections.forEach(function (sec) {
      observer.observe(sec);
    });
  }

  searchInput.addEventListener('input', function () {
    buildSidebar(this.value);
  });

  if (mobileTocToggle) {
    mobileTocToggle.addEventListener('click', function () {
      var expanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', String(!expanded));
      tocPanel.classList.toggle('expanded', !expanded);
    });
  }

  if (printBtn) {
    printBtn.addEventListener('click', function () {
      window.print();
    });
  }

  function handleHash() {
    var hash = window.location.hash.slice(1);
    if (!hash) return;

    for (var i = 0; i < articles.length; i++) {
      var match = articles[i].chapters.find(function (ch) { return ch.id === hash; });
      if (match) {
        switchArticle(articles[i].id);
        setTimeout(function () {
          var target = document.getElementById(hash);
          if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 200);
        return;
      }
      if (articles[i].id === hash) {
        switchArticle(hash);
        return;
      }
    }
  }

  buildSidebar();
  switchArticle('summary');
  handleHash();
  window.addEventListener('hashchange', handleHash);
})();
