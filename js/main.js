/* BOLIDE — 火流星档案 · 交互脚本 */
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

  /* 导航：滚动后加深底色 */
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

  /* 右缘滚动进度 + 当前档案页码 */
  var docs = Array.prototype.slice.call(document.querySelectorAll('.doc, .hero'));
  var docMap = []; /* [top, bottom, label] */
  var docLabels = ['00', '01', '02', '03', '04', '05', '06', '07'];
  docs.forEach(function (el, i) {
    var label = el.id === 'hero' ? '00' : (el.id ? el.id.replace('doc', '') : '—');
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

  /* 入场渐显 */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('is-in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* 图片资源解码完成后增强（可选，保持克制） */
  if (window.location.protocol === 'https:' && 'serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    });
  }
})();
