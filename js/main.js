/* BOLIDE — 火流星档案 · v3 交互 */
(function () {
  'use strict';

  var nav = document.getElementById('nav');
  var menuBtn = document.getElementById('menuBtn');
  var docmenu = document.getElementById('docmenu');
  var gaugeFill = document.getElementById('gaugeFill');
  var gaugeNo = document.getElementById('gaugeNo');
  var archiveBox = document.getElementById('archiveBox');
  var archiveHead = document.getElementById('archiveHead');
  var archiveToggle = document.getElementById('archiveToggle');

  /* 导航 */
  var onScroll = function () {
    if (nav) nav.classList.toggle('is-solid', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* 目录浮层 */
  if (menuBtn && docmenu) {
    menuBtn.addEventListener('click', function () {
      var open = docmenu.classList.toggle('is-open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    docmenu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A' || e.target === docmenu) {
        docmenu.classList.remove('is-open');
        menuBtn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  /* 滚动进度 + 档案页码 */
  var docs = Array.prototype.slice.call(document.querySelectorAll('.doc, .hero'));
  var docMap = [];
  docs.forEach(function (el) {
    var label = '—';
    if (el.id === 'hero') label = '00';
    else if (/^doc\d+$/.test(el.id)) label = el.id.replace('doc', '');
    else if (el.id === 'archive') label = 'AP';
    docMap.push({ el: el, label: label });
  });
  var onProgress = function () {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    var p = max > 0 ? (h.scrollTop || document.body.scrollTop) / max : 0;
    if (gaugeFill) gaugeFill.style.height = (p * 100).toFixed(1) + '%';
    if (gaugeNo) {
      var cur = '00';
      var y = h.scrollTop + h.clientHeight * 0.4;
      docMap.forEach(function (d) {
        if (y >= d.el.offsetTop) cur = d.label;
      });
      gaugeNo.textContent = cur;
    }
  };
  window.addEventListener('scroll', onProgress, { passive: true });
  window.addEventListener('resize', onProgress, { passive: true });
  onProgress();

  /* 档案库折叠 */
  if (archiveHead && archiveBox) {
    archiveHead.addEventListener('click', function () {
      var open = archiveBox.classList.toggle('is-open');
      if (archiveToggle) archiveToggle.textContent = open ? '收起 ▲' : '展开 ▼';
    });
  }

  /* 视口触发：reveal + 性能条 + 对比尺 */
  var runAnim = function (el) {
    el.classList.add('is-run');
    el.classList.add('is-in');
  };
  var io = ('IntersectionObserver' in window) ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        runAnim(en.target);
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -5% 0px' }) : null;

  if (io) {
    document.querySelectorAll('.reveal, .perf__fill, .perf__mark, .scale2__fill').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.reveal, .perf__fill, .perf__mark, .scale2__fill').forEach(function (el) { runAnim(el); });
  }

  /* W16 热点探索 */
  var hotspots = document.querySelectorAll('.hotspot');
  var isTouch = window.matchMedia('(hover: none)').matches;
  hotspots.forEach(function (hs, i) {
    if (!isTouch) {
      hs.addEventListener('mouseenter', function () { hs.classList.add('is-active'); });
      hs.addEventListener('mouseleave', function () { hs.classList.remove('is-active'); });
    } else {
      hs.addEventListener('click', function () {
        var was = hs.classList.contains('is-active');
        hotspots.forEach(function (h) { h.classList.remove('is-active'); });
        if (!was) hs.classList.add('is-active');
      });
    }
  });

  /* PWA */
  if (window.location.protocol === 'https:' && 'serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    });
  }
})();
