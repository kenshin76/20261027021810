(function () {
  'use strict';
  var doc = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;

  /* 등장 효과 */
  if (hasIO && !reduce) {
    doc.classList.add('js');
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    document.querySelectorAll('.rv').forEach(function (el, i) {
      el.style.transitionDelay = Math.min((i % 4) * 60, 180) + 'ms';
      io.observe(el);
    });
    window.addEventListener('beforeprint', function () { document.querySelectorAll('.rv').forEach(function (el) { el.classList.add('in'); }); });
  }

  /* 중앙 프로토타입 버튼을 지나치면 상단·떠 있는 버튼 표시, 마무리 버튼이 보이면 떠 있는 버튼 숨김 */
  var main = document.getElementById('protoBtn');
  var top = document.getElementById('topCta');
  var fl = document.getElementById('floatCta');
  var bar = document.querySelector('.top');
  var close = document.querySelector('.close .pbtn');
  var passedMain = false;
  var closeVisible = false;
  function setButtonState(button, on) {
    if (!button) return;
    button.classList.toggle('on', on);
    button.setAttribute('aria-hidden', on ? 'false' : 'true');
    button.tabIndex = on ? 0 : -1;
  }
  function updateButtons() {
    setButtonState(top, passedMain);
    setButtonState(fl, passedMain && !closeVisible);
  }
  updateButtons();
  if (main && hasIO) {
    var ctaObserver = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.target === main) passedMain = !e.isIntersecting && e.boundingClientRect.top < 0;
        if (e.target === close) closeVisible = e.isIntersecting;
      });
      updateButtons();
    });
    ctaObserver.observe(main);
    if (close) ctaObserver.observe(close);
  }

  /* 펼쳐 보기 — 인쇄 시 모두 펼침, 주소의 #으로 들어오면 해당 항목 펼침 */
  var accs = document.querySelectorAll('details.acc');
  // 이전에 펼친 상태가 남아 있어도 첫 진입은 모두 접힌 상태로 시작합니다.
  accs.forEach(function (d) { d.open = false; });
  window.addEventListener('beforeprint', function () { accs.forEach(function (d) { d.open = true; }); });
  function revealSection(el) {
    var d = el && el.closest('details.acc');
    if (!d) return;
    d.open = true;
    d.classList.add('in');
    d.querySelectorAll('.rv').forEach(function (item) { item.classList.add('in'); });
  }
  function openHash() { var id = location.hash.slice(1); if (id) revealSection(document.getElementById(id)); }
  openHash(); window.addEventListener('hashchange', openHash);
  window.addEventListener('load', function () {
    var target = document.getElementById(location.hash.slice(1));
    if (!target || !target.closest('details.acc')) return;
    // 새로고침 시 복원되는 이전 스크롤 위치보다 현재 참조 제목을 우선합니다.
    window.requestAnimationFrame(function () { target.scrollIntoView({ block: 'start' }); });
  });
  document.querySelectorAll('a.xref').forEach(function (link) {
    link.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button > 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
      var target = document.getElementById(link.hash.slice(1));
      if (!target) return;
      // 같은 참조를 다시 눌러도 펼치고, 이동 후 키보드 탐색을 해당 제목에서 이어갑니다.
      revealSection(target);
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });
  accs.forEach(function (d) { d.addEventListener('toggle', function () { if (d.open) d.querySelectorAll('.rv').forEach(function (el) { el.classList.add('in'); }); }); });
  window.addEventListener('scroll', function () { if (bar) bar.classList.toggle('scrolled', window.scrollY > 8); }, { passive: true });
})();
