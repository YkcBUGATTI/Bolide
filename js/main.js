/* BOLIDE — v5 交互 */
(function () {
  'use strict';

  var nav = document.getElementById('nav');
  var menuBtn = document.getElementById('menuBtn');
  var docmenu = document.getElementById('docmenu');
  var archiveBox = document.getElementById('archiveBox');
  var archiveHead = document.getElementById('archiveHead');
  var archiveToggle = document.getElementById('archiveToggle');

  /* 导航滚动态 */
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

  /* 档案库折叠 */
  if (archiveHead && archiveBox) {
    archiveHead.addEventListener('click', function () {
      var open = archiveBox.classList.toggle('is-open');
      if (archiveToggle) archiveToggle.textContent = open ? '收起 ▲' : '展开 ▼';
    });
  }

  /* 数字滚动计数 */
  var countUp = function (n) {
    if (n.dataset.done) return;
    n.dataset.done = '1';
    var target = parseInt(n.dataset.count, 10);
    var dur = 1400;
    var t0 = null;
    var fmt = function (v) {
      return v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };
    var step = function (ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      n.textContent = fmt(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  var runAnim = function (el) {
    el.classList.add('is-run');
    el.classList.add('is-in');
    if (el.matches && el.matches('[data-count]')) { countUp(el); return; }
    /* 数字滚动计数 */
    el.querySelectorAll('[data-count]').forEach(countUp);
  };
  var io = ('IntersectionObserver' in window) ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        runAnim(en.target);
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }) : null;

  var animTargets = document.querySelectorAll('.reveal, .perf__bar, .scale2__col, .bignums, [data-count]');
  /* 调试/验证模式：?plain=1 时不做渐显动画，全部立即显示 */
  if (/[?&]plain=1/.test(location.search)) {
    animTargets.forEach(function (el) { runAnim(el); });
    /* ?shot=ch03 即时定位（验证用，避免 smooth scroll 干扰） */
    var sm = location.search.match(/[?&]shot=([\w]+)/);
    if (sm) {
      var sel = document.getElementById(sm[1]);
      if (sel) {
        document.documentElement.style.scrollBehavior = 'auto';
        document.documentElement.scrollTop = sel.offsetTop;
        document.body.scrollTop = sel.offsetTop;
      }
    }
  } else {
  /* 兜底：已在视口内的元素立即显示（锚点直达 / 快速跳转 / 无 IO 环境） */
  var showInView = function () {
    var vh = window.innerHeight || document.documentElement.clientHeight;
    var sy = window.pageYOffset || document.documentElement.scrollTop || 0;
    animTargets.forEach(function (el) {
      if (el.classList.contains('is-in')) return;
      var r = el.getBoundingClientRect();
      if (r.top < vh * 0.94 && r.bottom > 0) runAnim(el);
    });
  };
  if (io) {
    animTargets.forEach(function (el) { io.observe(el); });
    window.addEventListener('scroll', showInView, { passive: true });
    window.addEventListener('resize', showInView, { passive: true });
    showInView();
  } else {
    animTargets.forEach(function (el) { runAnim(el); });
  }
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
