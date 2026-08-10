/* BOLIDE — v5 交互 */
(function () {
  'use strict';

  var nav = document.getElementById('nav');
  var menuBtn = document.getElementById('menuBtn');
  var menuOverlay = document.getElementById('menuOverlay');
  var menuNav = document.querySelector('.menu-overlay__nav');
  var navNow = document.getElementById('navNow');
  var navBar = document.getElementById('navBar');
  var sg = document.querySelector('.scroll-gauge');
  var sgBar = sg ? sg.querySelector('.sg__bar') : null;
  var sgNum = sg ? sg.querySelector('.sg__num') : null;
  var SG_LEN = 119.4;
  var isEN = (document.documentElement.lang || '').toLowerCase() === 'en';

  /* 章节名映射（tourbillon 同款结构，适配 bolide 7 章） */
  var sectionNames = isEN ? {
    ch01: 'Meteor', ch02: 'Design', ch03: 'Engineering',
    ch04: 'Performance', ch05: 'Cockpit', ch06: 'Track Chronicle', ch07: 'Legacy'
  } : {
    ch01: '火流星', ch02: '设计', ch03: '工程',
    ch04: '性能', ch05: '座舱', ch06: '赛道纪事', ch07: '传承'
  };

  /* 构建章节菜单（编号从 01 开始） */
  var navSections = Array.prototype.slice.call(document.querySelectorAll('.chapter-break[id]'));
  var navItems = [];
  navSections.forEach(function (s, i) {
    var name = sectionNames[s.id] || s.id;
    var idx = String(i + 1).padStart(2, '0');
    if (menuNav) {
      var a = document.createElement('a');
      a.href = '#' + s.id;
      a.innerHTML = '<span class="idx">' + idx + '</span>' + name;
      menuNav.appendChild(a);
      navItems.push(a);
    }
  });

  /* 章节高亮：当前章节 → navNow 文字 */
  var sectionIO = ('IntersectionObserver' in window) ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var id = en.target.id;
      navItems.forEach(function (a) {
        a.classList.toggle('is-active', a.getAttribute('href') === '#' + id);
      });
      var brand = document.querySelector('.nav__brand');
      var langWrap = document.querySelector('.nav__lang');
      if (navNow) {
        if (id === 'hero') {
          navNow.style.opacity = '0';
          navNow.style.pointerEvents = 'none';
          if (brand) brand.classList.add('is-hidden');
          if (langWrap) langWrap.classList.add('is-hidden');
        } else {
          navNow.style.opacity = '1';
          navNow.style.pointerEvents = 'auto';
          if (brand) brand.classList.remove('is-hidden');
          if (langWrap) langWrap.classList.remove('is-hidden');
          var idx = navSections.indexOf(en.target) + 1;
          navNow.innerHTML = '<b>' + String(idx).padStart(2, '0') + '</b> · ' + (sectionNames[id] || id);
        }
      }
    });
  }, { rootMargin: '-35% 0px -60% 0px' }) : null;

  var allSections = [document.getElementById('hero')].concat(navSections);
  allSections.forEach(function (s) { if (s && sectionIO) sectionIO.observe(s); });

  /* 菜单开关（tourbillon 同款） */
  if (menuBtn && menuOverlay) {
    menuBtn.addEventListener('click', function () {
      var open = menuOverlay.classList.toggle('is-open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    menuOverlay.addEventListener('click', function (e) {
      if (e.target.tagName === 'A' || e.target === menuOverlay) {
        menuOverlay.classList.remove('is-open');
        menuBtn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  /* 滚动：nav 底色 + 进度条 + 表盘 */
  var onScroll = function () {
    var y = window.scrollY || window.pageYOffset;
    var docH = document.documentElement.scrollHeight - window.innerHeight;
    var p = docH > 0 ? y / docH : 0;
    if (nav) nav.classList.toggle('is-solid', y > 40);
    if (navBar) navBar.style.width = (p * 100).toFixed(1) + '%';
    if (sg) {
      sg.classList.toggle('is-on', y > window.innerHeight * 0.7);
      if (sgBar) sgBar.style.strokeDashoffset = String(SG_LEN * (1 - p));
      if (sgNum) sgNum.textContent = String(Math.round(p * 100)).padStart(2, '0');
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

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

  /* 草图轮播 */
  var slider = document.getElementById('sketchSlider');
  if (slider) {
    var imgs = slider.querySelectorAll('.slider__stage img');
    var cur = 0;
    var capLabel = document.getElementById('sketchCapLabel');
    var capText = document.getElementById('sketchCapText');
    var curNo = document.getElementById('sketchCur');
    var showSlide = function (i) {
      cur = (i + imgs.length) % imgs.length;
      imgs.forEach(function (im, k) { im.classList.toggle('is-on', k === cur); });
      if (capLabel) capLabel.textContent = 'Sketch · 0' + (cur + 1);
      if (capText) capText.textContent = imgs[cur].dataset.cap || '';
      if (curNo) curNo.textContent = '0' + (cur + 1);
    };
    var prev = document.getElementById('sketchPrev');
    var next = document.getElementById('sketchNext');
    if (prev) prev.addEventListener('click', function () { showSlide(cur - 1); });
    if (next) next.addEventListener('click', function () { showSlide(cur + 1); });
    /* 键盘左右键 */
    slider.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { showSlide(cur - 1); e.preventDefault(); }
      if (e.key === 'ArrowRight') { showSlide(cur + 1); e.preventDefault(); }
    });
    showSlide(0);
  }

  /* 规格 tab */
  var tabsBox = document.getElementById('specsTabs');
  if (tabsBox) {
    var tabBtns = tabsBox.querySelectorAll('.specs-tabs__btn');
    var tabPanels = tabsBox.querySelectorAll('.specs-tabs__panel');
    tabBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var t = btn.dataset.tab;
        tabBtns.forEach(function (b) { b.classList.toggle('is-on', b === btn); });
        tabPanels.forEach(function (p) { p.classList.toggle('is-on', p.dataset.panel === t); });
      });
    });
  }

  /* PWA */
  if (window.location.protocol === 'https:' && 'serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    });
  }
})();
