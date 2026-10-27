/* 루멘병원 프로토타입 — 공통 코어 · 예약 엔진 · 사용자 화면 */
(function () {
  'use strict';
  var D = window.DB, U = D.U;
  var A = window.APP = {};
  var S = A.S = { fs: 16, popupOff: false, rsv: null, me: null, admin: null, race: false, adminTab: {}, lastRes: null, inquiry: null };
  var ACT = A.ACT = {};
  A.beforeRender = [];
  A.afterRender = [];
  var activeModals = [];
  var VIEWS = A.VIEWS = {};

  /* ---------- 아이콘 ---------- */
  var IC = {
    steth: '<path d="M6 3v5a4 4 0 0 0 8 0V3"/><path d="M10 12v3a5 5 0 0 0 10 0v-2"/><circle cx="20" cy="11" r="2"/>',
    scope: '<circle cx="12" cy="12" r="3"/><path d="M3 12a9 9 0 0 1 15.5-6.2M21 12a9 9 0 0 1-15.5 6.2"/><path d="M18.5 2.5v3.3h-3.3M5.5 21.5v-3.3h3.3"/>',
    bone: '<path d="M17 3.5a2.5 2.5 0 0 1 3.5 3.5 2.5 2.5 0 0 1-2 3.9L11 18.4A2.5 2.5 0 0 1 7 20.5a2.5 2.5 0 0 1-3.5-3.5 2.5 2.5 0 0 1 2-3.9L13 5.6A2.5 2.5 0 0 1 17 3.5z"/>',
    spine: '<rect x="9" y="2.5" width="6" height="3.5" rx="1"/><rect x="8.5" y="7.5" width="7" height="3.5" rx="1"/><rect x="8.5" y="12.5" width="7" height="3.5" rx="1"/><rect x="9" y="17.5" width="6" height="4" rx="1"/><path d="M5 6.5h2M17 6.5h2M5 14h2M17 14h2"/>',
    walk: '<circle cx="13" cy="4" r="2"/><path d="M8 22l3-7 3 3v4M10 11l2-3 3 2 3 1M7 13l3-5"/>',
    kid: '<circle cx="12" cy="8" r="5"/><path d="M10 7.5h.01M14 7.5h.01M10.5 10a2 2 0 0 0 3 0M5 22a7 7 0 0 1 14 0"/>',
    ear: '<path d="M6 8.5a6 6 0 1 1 12 0c0 3.5-3 4.5-3 7.5a3.5 3.5 0 0 1-6.5 1.8"/><path d="M9.5 8.5a2.5 2.5 0 0 1 5 0c0 1.5-1.5 2-1.5 3"/>',
    heart: '<path d="M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.7l-1-1.1a5.5 5.5 0 1 0-7.8 7.8L12 22l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/><path d="M3.5 12h4l2-3 3 6 2-3h5"/>',
    cal: '<rect x="3" y="4.5" width="18" height="17" rx="3"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    phone: '<path d="M5 3h3.5l2 5-2.5 1.5a11 11 0 0 0 6.5 6.5L16 13.5l5 2V19a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2"/>',
    pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>', back: '<path d="M19 12H5M11 18l-6-6 6-6"/>',
    chev: '<path d="M6 9l6 6 6-6"/>', chevR: '<path d="M9 6l6 6-6 6"/>', chevL: '<path d="M15 6l-6 6 6 6"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7"/>', x: '<path d="M6 6l12 12M18 6L6 18"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>', user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
    doc: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
    bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 21a2 2 0 0 0 4 0"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>', gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    server: '<rect x="3" y="4" width="18" height="7" rx="2"/><rect x="3" y="13" width="18" height="7" rx="2"/><path d="M7 7.5h.01M7 16.5h.01M11 7.5h6M11 16.5h6"/>',
    db: '<ellipse cx="12" cy="5.5" rx="8" ry="3"/><path d="M4 5.5v13c0 1.7 3.6 3 8 3s8-1.3 8-3v-13M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
    lock: '<rect x="4" y="10.5" width="16" height="10.5" rx="2.5"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/>',
    mega: '<path d="M3 11v3a1 1 0 0 0 1 1h3l6 4V6L7 10H4a1 1 0 0 0-1 1z"/><path d="M17 8.5a5 5 0 0 1 0 7M7 15l1.5 5"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17.5h.01"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3.5 6.5l8.5 6.5 8.5-6.5"/>',
    home: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>', edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M14 6l4 4"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    down: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>', refresh: '<path d="M20 11a8 8 0 0 0-14.8-4M4 13a8 8 0 0 0 14.8 4"/><path d="M4 4v4h4M20 20v-4h-4"/>',
    eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    alert: '<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18h.01"/>', info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5h.01"/>',
    spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>', grid: '<rect x="3" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5"/>',
    building: '<path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M16 9h3a1 1 0 0 1 1 1v11M2 21h20M8 7h4M8 11h4M8 15h4"/>',
    up: '<path d="M12 19V5M6 11l6-6 6 6"/>', layers: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>', key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l3 3M15 8l2 2"/>',
    cloud: '<path d="M7 18a5 5 0 0 1-.5-10A6.5 6.5 0 0 1 19 9.5a4.3 4.3 0 0 1-.5 8.5z"/>', link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    car: '<path d="M5 17h14v-5l-2-5H7l-2 5zM5 12h14"/><circle cx="8" cy="17.5" r="1.8"/><circle cx="16" cy="17.5" r="1.8"/>', bus: '<rect x="4" y="3" width="16" height="15" rx="3"/><path d="M4 11h16M8 21v-3M16 21v-3M8 15h.01M16 15h.01"/>',
    msg: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 21l1.9-5.4A8 8 0 1 1 21 12z"/>', news: '<path d="M4 5h13v14H6a2 2 0 0 1-2-2zM17 9h3v8a2 2 0 0 1-2 2"/><path d="M8 9h5M8 13h5M8 16h3"/>',
    door: '<path d="M14 3H6v18h8M14 3l5 2v14l-5 2zM11 12h.01"/>', play: '<path d="M7 4v16l13-8z"/>', zap: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>'
  };
  var ic = A.ic = function (n, cls) { return '<svg class="i' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" aria-hidden="true">' + (IC[n] || '') + '</svg>'; };
  A.logo = function () {
    return '<svg class="mk" viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="12" fill="#315F59"/><path d="M17 10h6v7h7v6h-7v7h-6v-7h-7v-6h7z" fill="#fff"/><circle cx="30" cy="10" r="3.2" fill="#E8D6BA"/></svg>';
  };
  var bdg = A.bdg = function (t, c, nd) { return '<span class="bdg ' + (c || '') + (nd ? ' nd' : '') + '">' + t + '</span>'; };
  var stB = A.stB = function (s) { var x = D.STATUS[s]; return bdg(x[0], x[1]); };

  /* ---------- 예약 엔진 (시연: 브라우저에서 서버 규칙을 흉내냄) ---------- */
  var WK = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  var CLINIC_DAYS = [['mon', '월'], ['tue', '화'], ['wed', '수'], ['thu', '목'], ['fri', '금'], ['sat', '토'], ['sun', '일']];
  var PM_START = 12 * 60 + 30;
  var ENG = A.ENG = {
    exc: function (bid, did, ds) { return D.EXC.filter(function (e) { return e.date === ds && (e.bid === 'all' || e.bid === bid) && (e.did === 'all' || e.did === did); }); },
    used: function (bid, did, ds, t) { return D.RES.filter(function (r) { return r.bid === bid && r.did === did && r.date === ds && r.time === t && r.status !== 'cancel'; }).length; },
    slots: function (bid, did, ds) {
      var sc = D.sched(bid, did);
      if (!D.branch(bid) || !D.dept(did) || !sc || !U.validDate(ds)) return { closed:'예약 정보를 확인해 주세요', list:[] };
      if (D.BRANCH_DEPTS[bid].indexOf(did) < 0) return { closed: '이 지점에서 운영하지 않는 진료과', list: [] };
      if (!Number.isInteger(sc.interval) || sc.interval < 1 || !Number.isInteger(sc.cap) || sc.cap < 1) return { closed:'예약 설정 확인이 필요합니다', list:[] };
      var d = U.parse(ds), t0 = U.today();
      var diff = Math.round((d - t0) / 864e5);
      if (diff < 0) return { closed: '지난 날짜', list: [] };
      if (diff >= sc.days) return { closed: '예약 가능 기간(' + sc.days + '일) 이후', list: [] };
      var ex = ENG.exc(bid, did, ds);
      var off = ex.filter(function (e) { return e.type === '휴진'; })[0];
      if (off) return { closed: off.note || '휴진', holiday: true, list: [] };
      var short = ex.filter(function (e) { return e.type === '단축'; }).sort(function(a,b) { return U.min(a.until) - U.min(b.until); })[0];
      var w = sc.week[WK[d.getDay()]];
      if (!w || !w.length) return { closed: '휴진(정기)', list: [] };
      var nowMin = diff === 0 ? new Date().getHours() * 60 + new Date().getMinutes() + sc.lead : -1;
      var list = [];
      w.forEach(function (rg) {
        if (!U.validTime(rg[0]) || !U.validTime(rg[1], true)) return;
        for (var m = U.min(rg[0]); m + sc.interval <= U.min(rg[1]); m += sc.interval) {
          if (short && m + sc.interval > U.min(short.until)) continue;
          var t = U.tm(m), used = ENG.used(bid, did, ds, t);
          if (list.some(function(x) { return x.t === t; })) continue;
          list.push({ t: t, m: m, used: used, cap: sc.cap, left: Math.max(0, sc.cap - used), past: m < nowMin, pm: m >= PM_START });
        }
      });
      return { closed: false, short: short, list: list };
    },
    day: function (bid, did, ds) {
      var s = ENG.slots(bid, did, ds);
      if (s.closed) return { st: s.holiday ? 'h' : 'x', label: s.holiday ? '휴진' : (s.closed.indexOf('정기') >= 0 ? '휴진' : ''), reason: s.closed };
      var left = s.list.filter(function (x) { return !x.past; }).reduce(function (a, x) { return a + x.left; }, 0);
      if (!left) return { st: 'full', label: '마감', left: 0 };
      return { st: 'open', label: left > 9 ? '여유' : '잔여 ' + left, left: left };
    },
    first: function (bid, did, n) {
      var out = [];
      for (var i = 0; i < Math.min(366, (D.sched(bid, did) || {}).days || 0) && out.length < n; i++) {
        var ds = U.ymd(U.addDays(U.today(), i)), s = ENG.slots(bid, did, ds);
        if (s.closed) continue;
        s.list.forEach(function (x) { if (out.length < n && !x.past && x.left > 0) out.push({ date: ds, t: x.t, left: x.left }); });
      }
      return out;
    },
    openNow: function (bid) {
      var did = D.BRANCH_DEPTS[bid][0], sc = D.sched(bid, did), now = new Date();
      var ds = U.ymd(now);
      if (ENG.exc(bid, 'all', ds).some(function (e) { return e.type === '휴진'; })) return { open: false, label: '오늘 휴진' };
      var w = sc.week[WK[now.getDay()]].map(function(r) { return r.slice(); }), m = now.getHours() * 60 + now.getMinutes();
      var short = ENG.exc(bid, 'all', ds).filter(function(e) { return e.type === '단축'; }).sort(function(a,b) { return U.min(a.until)-U.min(b.until); })[0];
      if (short) w = w.map(function(r) { return [r[0], U.min(r[1]) > U.min(short.until) ? short.until : r[1]]; }).filter(function(r) { return U.min(r[0]) < U.min(r[1]); });
      if (!w.length) return { open: false, label: '오늘 휴진' };
      var inR = w.some(function (r) { return m >= U.min(r[0]) && m < U.min(r[1]); });
      var end = w[w.length - 1][1];
      if (inR) return { open: true, label: '진료 중 · ' + end + '까지' };
      if (m < U.min(w[0][0])) return { open: false, label: w[0][0] + ' 진료 시작' };
      if (m < U.min(end)) return { open: false, label: '점심시간 · ' + w[w.length - 1][0] + ' 재개' };
      return { open: false, label: '오늘 진료 종료' };
    },
    /* 서버 측 저장 규칙: 다시 검증 → 정원 확인(행 잠금 가정) → 중복 확인 → 저장 */
    book: function (q) {
      if (!q || !q.idv || !U.person(q.idv.name, q.idv.birth, q.idv.phone) || q.idv.di !== U.person(q.idv.name, q.idv.birth, q.idv.phone).di) return { ok:false, code:'AUTH', msg:'예약자 본인인증을 다시 진행해 주세요.' };
      var s = ENG.slots(q.bid, q.did, q.date);
      if (s.closed) return { ok: false, code: 'CLOSED', msg: '예약할 수 없는 날짜입니다 (' + s.closed + ').' };
      var sl = s.list.filter(function (x) { return x.t === q.time; })[0];
      if (!sl) return { ok: false, code: 'NOSLOT', msg: '선택하신 시간에는 예약할 수 없습니다. 다른 시간을 선택해 주세요.' };
      if (sl.past) return { ok: false, code: 'PAST', msg: '이미 지난 시간입니다.' };
      if (sl.left <= 0) return { ok: false, code: 'FULL', msg: '방금 다른 환자의 예약으로 이 시간이 마감되었습니다. 다른 시간을 선택해 주세요.' };
      var dup = D.RES.filter(function (r) { return r.di === q.idv.di && r.date === q.date && r.time === q.time && r.status !== 'cancel'; })[0];
      if (dup) return { ok: false, code: 'DUP', msg: '같은 시간에 이미 예약이 있습니다 (예약번호 ' + dup.no + ').' };
      var sc = D.sched(q.bid, q.did);
      var r = D.mkRes({ bid: q.bid, did: q.did, date: q.date, time: q.time, name: q.idv.name, phone: q.idv.phone, birth: q.idv.birth, di: q.idv.di, memo: q.memo || '', first: q.first, status: sc.mode === 'instant' ? 'confirm' : 'request', created: Date.now() });
      return { ok: true, res: r };
    },
    canCancel: function (r) {
      if (r.status !== 'request' && r.status !== 'confirm') return false;
      var t = U.parse(r.date); t.setHours(+r.time.slice(0, 2), +r.time.slice(3), 0, 0);
      return t.getTime() - Date.now() > D.sched(r.bid, r.did).cancelHours * 36e5;
    }
  };

  /* ---------- 라우터 ---------- */
  function parse() {
    var h = location.hash.replace(/^#\/?/, ''), q = {};
    var decode = function(v) { try { return decodeURIComponent(v); } catch(e) { return ''; } };
    var qi = h.indexOf('?');
    if (qi >= 0) { h.slice(qi + 1).split('&').forEach(function (kv) { var p = kv.split('='); if (p[0]) q[decode(p[0])] = decode(p.slice(1).join('=') || ''); }); h = h.slice(0, qi); }
    var p = h.split('/').filter(Boolean);
    return { p: p, q: q, raw: location.hash };
  }
  A.parse = parse;
  var go = A.go = function (h) { if (location.hash === h) render(); else location.hash = h; };
  var after = [];
  A.after = function (fn) { after.push(fn); };
  function render() {
    var r = parse(), app = document.getElementById('app');
    after = [];
    activeModals.slice().forEach(function(m) { m.close(); });
    A.beforeRender.forEach(function(fn) { fn(r); });
    document.querySelectorAll('.pop').forEach(function (x) { x.remove(); });
    var html;
    if (r.p[0] === 'admin') { html = A.adminRender ? A.adminRender(r) : ''; document.body.classList.add('is-admin'); }
    else {
      document.body.classList.remove('is-admin');
      var v = r.p[0] || '';
      var fn = { '': VIEWS.gateway, b: VIEWS.branch, reserve: VIEWS.reserve, lookup: VIEWS.lookup, news: VIEWS.news, post: VIEWS.post, inquiry: VIEWS.inquiry }[v] || VIEWS.nf;
      html = shell(r, fn(r));
    }
    app.innerHTML = html;
    if (!r.keepScroll) window.scrollTo(0, 0);
    after.forEach(function (f) { try { f(); } catch (e) { console.error(e); } });
    document.title = (A.title || D.HOSP.name).indexOf(D.HOSP.name) >= 0 ? (A.title || D.HOSP.name) : A.title + ' | ' + D.HOSP.name;
    ribbon();
    if (Date.now() - gAt > 1500) { var gd = document.getElementById('guide'); if (gd) gd.innerHTML = ''; }
    ACT.popX();
    if ((!r.p[0] || (r.p[0] === 'b' && !r.p[2])) && !S.popupOff) setTimeout(popup, 600);
    A.afterRender.forEach(function(fn) { fn(r); });
  }
  A.render = render;
  window.addEventListener('hashchange', render);

  /* ---------- 사용자 셸 ---------- */
  function curBranch(r) { return r.p[0] === 'b' ? D.branch(r.p[1]) : (r.q.b ? D.branch(r.q.b) : null); }
  function shell(r, body) {
    var b = curBranch(r), v = r.p[0] || '';
    var nav = [
      ['', '병원 소개', v === ''],
      [b ? '#/b/' + b.id + '?s=depts' : '#/?s=depts', '진료과', false],
      ['#/reserve' + (b ? '?b=' + b.id : ''), '진료 예약', v === 'reserve'],
      ['#/lookup', '예약 조회', v === 'lookup'],
      ['#/news/notice', '병원 소식', v === 'news' || v === 'post'],
      ['#/inquiry', '고객 문의', v === 'inquiry']
    ];
    nav[0][0] = b ? '#/b/' + b.id : '#/';
    nav[0][1] = b ? b.short + ' 홈' : '병원 소개';
    nav[0][2] = v === '' || (v === 'b' && !r.p[2]);
    var tel = b ? b.tel : D.HOSP.tel;
    return '<div class="util"><div class="wrap in">' +
      '<span class="hide-s">' + D.HOSP.name + ' · 대표전화 <b>' + D.HOSP.tel + '</b> <span class="muted" style="color:rgba(255,255,255,.55)">(가상)</span></span>' +
      '<span class="sp"></span>' +
      '<span class="fsz" role="group" aria-label="글자 크기"><button data-act="fs" data-v="15" class="' + (S.fs === 15 ? 'on' : '') + '" aria-label="글자 작게">가-</button><button data-act="fs" data-v="16" class="' + (S.fs === 16 ? 'on' : '') + '" aria-label="기본 글자">가</button><button data-act="fs" data-v="18" class="' + (S.fs === 18 ? 'on' : '') + '" aria-label="글자 크게">가+</button></span>' +
      '<a href="#/lookup">예약 조회</a><a href="#/admin" class="admin-access">관리자</a></div></div>' +
      '<header class="hdr" id="hdr"><div class="wrap in">' +
      '<a class="logo" href="#/" aria-label="' + D.HOSP.name + ' 처음으로">' + A.logo() + '<span>' + D.HOSP.name + '<small>' + D.HOSP.en + '</small></span></a>' +
      '<button class="brpick" data-act="brpick" aria-haspopup="true" style="--bc:' + (b ? b.color : '#315F59') + '"><i></i>' + (b ? b.name : '지점 선택') + ic('chev', 's') + '</button>' +
      '<nav class="gnb" aria-label="주 메뉴">' + nav.map(function (n) { return '<a href="' + n[0] + '" class="' + (n[2] ? 'on' : '') + '">' + n[1] + '</a>'; }).join('') + '</nav>' +
      '<div class="rt">' + (v === '' ? '<a class="btn o sm backmain" href="../index.html" title="제안서 메인 화면으로 이동">' + ic('back', 's') + '<span>메인으로</span></a>' : '') + '<a class="btn o sm hide-m" href="tel:' + tel + '" data-act="tel">' + ic('phone', 's') + tel + '</a>' +
      '<a class="btn a sm" href="#/reserve' + (b ? '?b=' + b.id : '') + '">' + ic('cal', 's') + '진료 예약</a>' +
      '<button class="ibtn mtog" data-act="drawer" aria-label="메뉴 열기">' + ic('menu') + '</button></div>' +
      '</div></header>' +
      '<main id="main" tabindex="-1">' + body + '</main>' +
      footer() +
      '<nav class="mbar" aria-label="빠른 메뉴"><a href="#/reserve' + (b ? '?b=' + b.id : '') + '" class="hl">' + ic('cal') + '진료 예약</a><a href="tel:' + tel + '" data-act="tel">' + ic('phone') + '전화</a><a href="' + (b ? '#/b/' + b.id + '?s=loc' : '#/?s=branches') + '">' + ic('pin') + '오시는 길</a><a href="#/lookup">' + ic('search') + '예약 조회</a></nav>' +
      '<button class="toTop" id="toTop" data-act="top" aria-label="맨 위로">' + ic('up') + '</button>' +
      '<div class="drawer" id="drawer" data-act="drawerBg"><div class="pn" role="dialog" aria-label="전체 메뉴"><div class="row sb"><span class="logo">' + A.logo() + '<span>' + D.HOSP.name + '</span></span><button class="ibtn" data-act="drawer" aria-label="닫기">' + ic('x') + '</button></div>' +
      '<nav class="mt16">' + nav.map(function (n) { return '<a href="' + n[0] + '">' + n[1] + ic('chevR', 's') + '</a>'; }).join('') + '</nav>' +
      '<h5 class="mt24 muted small">지점 바로가기</h5><div class="col mt8">' + D.BRANCHES.map(function (x) { return '<a class="btn o" href="#/b/' + x.id + '" style="justify-content:flex-start"><i style="width:10px;height:10px;border-radius:50%;background:' + x.color + '"></i>' + x.name + '</a>'; }).join('') + '</div>' +
      '<a class="btn g blk mt16" href="#/admin">' + ic('lock', 's') + '관리자 로그인</a></div></div>';
  }
  function footer() {
    return '<footer class="ftr"><div class="wrap"><div class="top"><div><span class="logo">' + A.logo(1) + '<span>' + D.HOSP.name + '<small>' + D.HOSP.en + '</small></span></span><p class="mt12">' + D.HOSP.slogan + '</p><p class="mt8">대표전화 ' + D.HOSP.tel + ' (가상)</p></div>' +
      '<div class="brl">' + D.BRANCHES.map(function (b) { return '<div><b>' + b.name + '</b>' + U.esc(b.tel) + '<br><span style="font-size:.78rem">' + U.esc(b.addr) + '</span></div>'; }).join('') + '</div></div>' +
      '<div class="bt"><button data-act="nope" class="pv">개인정보처리방침</button><button data-act="nope">이용약관</button><button data-act="nope">비급여 진료비 안내</button><button data-act="nope">환자 권리장전</button><a href="#/news/faq">자주 묻는 질문</a><a href="#/admin">관리자</a></div>' +
      '<p class="dis">체험용 사이트입니다. 병원·의료진·환자·사진은 가상 자료이며, 실제 본인인증·예약·문의 전송 및 클라우드 연동은 이루어지지 않습니다. 실제 개인정보를 입력하지 마세요. 저장한 체험 내용은 현재 브라우저에 유지됩니다. 초기화는 관리자 로그인 화면에서 할 수 있습니다.</p></div></footer>';
  }
  function ribbon() {
    var rb = document.getElementById('ribbon');
    if (D.ENV.view === 'staging') { if (!rb) { rb = document.createElement('div'); rb.id = 'ribbon'; rb.className = 'ribbon'; rb.textContent = 'STAGING'; document.body.appendChild(rb); } }
    else if (rb) rb.remove();
  }

  /* ---------- 공통 UI ---------- */
  A.toast = function (msg, kind) {
    var t = document.createElement('div'); t.className = 'toast ' + (kind || '');
    t.innerHTML = ic(kind === 'err' ? 'alert' : kind === 'warn' ? 'info' : 'check') + '<span>' + msg + '</span>';
    document.getElementById('toasts').appendChild(t);
    setTimeout(function () { t.style.transition = 'opacity .3s'; t.style.opacity = 0; setTimeout(function () { t.remove(); }, 300); }, 3200);
  };
  A.modal = function (o) {
    var root = document.getElementById('modal-root'), prev = document.activeElement, closed = false;
    var el = document.createElement('div'); el.className = 'mdl'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', o.title);
    el.innerHTML = '<div class="bx ' + (o.wide ? 'w' : '') + '"><div class="mh">' + (o.icon ? '<span class="ibtn" style="border:0;background:var(--pri-soft);color:var(--pri)">' + ic(o.icon) + '</span>' : '') + '<h3>' + U.esc(o.title) + '</h3><button class="ibtn x" data-x aria-label="닫기">' + ic('x') + '</button></div><div class="mb">' + o.body + '</div>' + (o.foot ? '<div class="mf">' + o.foot + '</div>' : '') + '</div>';
    root.appendChild(el);
    var handle = { el:el, close:close }; activeModals.push(handle);
    document.body.classList.add('modal-open');
    function close() { if (closed) return; closed = true; el.remove(); document.removeEventListener('keydown', keys); var i = activeModals.indexOf(handle); if (i >= 0) activeModals.splice(i,1); if (!activeModals.length) document.body.classList.remove('modal-open'); if (prev && prev.isConnected && prev.focus) prev.focus(); if (o.onClose) o.onClose(); }
    function keys(e) {
      if (activeModals[activeModals.length - 1] !== handle) return;
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      if (e.key === 'Tab') { var f = Array.from(el.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]')).filter(function(x) { return !x.closest('[hidden]'); }); var first = f[0], last = f[f.length - 1]; if (e.shiftKey && (document.activeElement === first || !el.contains(document.activeElement))) { e.preventDefault(); if (last) last.focus(); } else if (!e.shiftKey && (document.activeElement === last || !el.contains(document.activeElement))) { e.preventDefault(); if (first) first.focus(); } }
    }
    document.addEventListener('keydown', keys);
    el.addEventListener('click', function (e) { if (e.target === el || e.target.closest('[data-x]')) close(); });
    setTimeout(function () { if (closed) return; var f = el.querySelector('input,select,textarea,.mf .btn.p,.mf .btn.a,.x'); if (f) f.focus(); }, 30);
    return handle;
  };
  A.confirm = function (title, body, ok, fn, danger) {
    var m = A.modal({ title: title, body: body, foot: '<button class="btn o" data-x>닫기</button><button class="btn ' + (danger ? 'd' : 'p') + '" id="cfOk">' + ok + '</button>' });
    m.el.querySelector('#cfOk').addEventListener('click', function () { m.close(); fn(); });
  };
  var gT, gAt = 0;
  A.guide = function (html) {
    var g = document.getElementById('guide'); clearTimeout(gT); gAt = Date.now();
    g.innerHTML = '<div class="guide">' + ic('spark') + '<div>' + html + '</div><button data-act="guideX" aria-label="안내 닫기">닫기</button></div>';
    gT = setTimeout(function () { g.innerHTML = ''; }, 14000);
  };
  A.spot = function (sel, delay) {
    setTimeout(function () { var el = document.querySelector(sel); if (!el) return; el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.classList.add('spot'); setTimeout(function () { el.classList.remove('spot'); }, 4500); }, delay || 350);
  };

  /* 본인인증 (시연용 모의 인증창) */
  A.idVerify = function (cb, pre) {
    pre = pre || {};
    var carrier = 'SKT', sent = null;
    var m = A.modal({
      title: '휴대폰 본인인증', icon: 'shield', body:
        '<div class="idbox"><div class="brand">' + ic('lock', 's') + '<span><b>체험용 모의 인증</b>입니다. 실제 개인정보를 입력하지 마세요. 가상 인증번호는 <b>123456</b>이며 실제 인증 문자는 발송되지 않습니다.</span></div>' +
        '<div class="g2 mt16"><div class="fld"><label class="req" for="ivN">이름</label><input class="inp" id="ivN" autocomplete="off" value="' + U.esc(pre.name || '') + '"></div><div class="fld"><label class="req" for="ivB">생년월일 (8자리)</label><input class="inp" id="ivB" inputmode="numeric" maxlength="8" placeholder="예: 19880412" value="' + U.esc((pre.birth || '').replace(/-/g, '')) + '"></div></div>' +
        '<div class="fld mt12"><span class="lbl">통신사</span><div class="carrier">' + ['SKT', 'KT', 'LG U+', '알뜰폰'].map(function (c) { return '<button type="button" data-c="' + c + '" class="' + (c === carrier ? 'on' : '') + '">' + c + '</button>'; }).join('') + '</div></div>' +
        '<div class="fld mt12"><label class="req" for="ivP">휴대폰 번호</label><div class="row"><input class="inp" id="ivP" inputmode="tel" placeholder="010-0000-0000" value="' + U.esc(pre.phone || '') + '"><button class="btn o" id="ivSend" style="flex:0 0 auto">인증번호 받기</button></div></div>' +
        '<div class="fld mt12" id="ivCodeW" hidden><label for="ivC">인증번호 6자리</label><input class="inp" id="ivC" inputmode="numeric" maxlength="6" placeholder="123456"><span class="hint">시연용 인증번호: 123456 · 발급 후 3분간 유효</span></div>' +
        '<p class="hint err mt8" id="ivE" role="alert"></p></div>',
      foot: '<button class="btn o" data-x>취소</button><button class="btn p" id="ivOk" disabled>인증 완료</button>'
    });
    var $ = function (s) { return m.el.querySelector(s); };
    m.el.querySelectorAll('.carrier button').forEach(function (b) { b.addEventListener('click', function () { carrier = b.dataset.c; invalidate(); m.el.querySelectorAll('.carrier button').forEach(function (x) { x.classList.toggle('on', x === b); }); }); });
    $('#ivP').addEventListener('input', function (e) { var v = e.target.value.replace(/\D/g, '').slice(0, 11); e.target.value = v.length > 7 ? v.slice(0, 3) + '-' + v.slice(3, v.length - 4) + '-' + v.slice(-4) : v.length > 3 ? v.slice(0, 3) + '-' + v.slice(3) : v; });
    $('#ivSend').addEventListener('click', function () {
      var person = U.person($('#ivN').value, $('#ivB').value, $('#ivP').value);
      if (!person) return err('이름, 실제 날짜 형식의 생년월일 8자리, 휴대폰 번호(010)를 확인해 주세요.');
      err(''); sent = { person:person, carrier:carrier, expires:Date.now() + 180000 }; $('#ivCodeW').hidden = false; $('#ivOk').disabled = false; $('#ivSend').textContent = '재전송'; $('#ivC').focus();
      A.toast('체험용 인증번호는 123456입니다. 실제 문자는 발송되지 않습니다.');
    });
    function invalidate() { if (!sent) return; sent = null; $('#ivOk').disabled = true; $('#ivC').value = ''; err('인증 정보가 변경되었습니다. 인증번호를 다시 받아 주세요.'); }
    ['#ivN','#ivB','#ivP'].forEach(function(sel) { $(sel).addEventListener('input', invalidate); });
    function err(t) { $('#ivE').textContent = t; return false; }
    $('#ivOk').addEventListener('click', function () {
      if (!sent) return err('인증번호를 먼저 받아 주세요.');
      if (Date.now() >= sent.expires) { invalidate(); return err('인증번호 유효시간이 지났습니다. 다시 받아 주세요.'); }
      var current = U.person($('#ivN').value, $('#ivB').value, $('#ivP').value);
      if (!current || current.di !== sent.person.di || carrier !== sent.carrier) { invalidate(); return err('인증 정보가 변경되었습니다. 다시 인증해 주세요.'); }
      if ($('#ivC').value.trim() !== '123456') return err('인증번호가 올바르지 않습니다.');
      var verified = Object.assign({}, sent.person, { carrier:sent.carrier, at:Date.now() }); m.close(); cb(verified);
    });
  };

  /* ---------- 팝업 ---------- */
  function popup() {
    var route = parse(), bid = route.p[0] === 'b' ? route.p[1] : null;
    if (S.popupOff || (route.p[0] && !(route.p[0] === 'b' && !route.p[2] && D.branch(bid))) || document.querySelector('.popup')) return;
    var p = A.promos('popup', bid)[0];
    if (!p) return;
    var el = document.createElement('div'); el.className = 'popup ' + p.tone; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', '알림 팝업');
    el.innerHTML = '<div class="pb"><span class="k">NOTICE</span><h3>' + U.esc(p.title) + '</h3><p>' + U.esc(p.sub) + '</p><a class="btn w sm mt16" href="' + A.bannerTarget(p, bid) + '">자세히 보기 ' + ic('arrow', 's') + '</a></div><div class="pf"><button data-act="popOff">오늘 하루 보지 않기</button><button data-act="popX">닫기</button></div>';
    document.body.appendChild(el);
  }
  ACT.popOff = function () { S.popupOff = true; try { localStorage.setItem(A.Store ? A.Store.popupKey : 'lumen-demo:2026102702:v1:popup-off', U.ymd(new Date())); } catch(e) {} ACT.popX(); };
  ACT.popX = function () { var p = document.querySelector('.popup'); if (p) p.remove(); };

  /* ---------- 이벤트 위임 ---------- */
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-act]');
    if (el) {
      if (el.getAttribute('aria-disabled') === 'true') { e.preventDefault(); if (el.dataset.why) A.toast(el.dataset.why, 'warn'); return; }
      var fn = ACT[el.dataset.act];
      if (fn) { if (el.tagName === 'A' && el.dataset.act !== 'tel') e.preventDefault(); fn(el, e); }
      return;
    }
    var g = e.target.closest('[data-go]');
    if (g) { e.preventDefault(); go(g.dataset.go); }
    if (!e.target.closest('.pop') && !e.target.closest('[data-act="brpick"]')) document.querySelectorAll('.pop').forEach(function (x) { x.remove(); });
  });
  document.addEventListener('input', function (e) { var el = e.target.closest('[data-in]'); if (el && ACT[el.dataset.in]) ACT[el.dataset.in](el, e); });
  document.addEventListener('change', function (e) { var el = e.target.closest('[data-ch]'); if (el && ACT[el.dataset.ch]) ACT[el.dataset.ch](el, e); });
  window.addEventListener('scroll', function () {
    var h = document.getElementById('hdr'); if (h) h.classList.toggle('sc', window.scrollY > 10);
    var t = document.getElementById('toTop'); if (t) t.classList.toggle('on', window.scrollY > 600);
  }, { passive: true });

  ACT.fs = function (el) { S.fs = +el.dataset.v; document.documentElement.style.setProperty('--fs', S.fs + 'px'); document.querySelectorAll('.fsz button').forEach(function (b) { b.classList.toggle('on', +b.dataset.v === S.fs); }); };
  ACT.top = function () { window.scrollTo({ top: 0, behavior: 'smooth' }); };
  ACT.tel = function (el, e) { e.preventDefault(); A.toast('시연 화면에서는 전화 연결이 되지 않습니다. 실제 사이트에서는 지점 대표번호로 바로 연결됩니다.'); };
  ACT.nope = function (el) {
    var label = el && el.textContent ? el.textContent.trim() : '이용 안내';
    var text = label.indexOf('개인정보') >= 0 || label.indexOf('전문') >= 0 ? '체험용 개인정보 안내\n이 화면은 가상 병원 이용 흐름을 확인하기 위한 체험 환경입니다. 실제 개인정보나 건강 정보를 입력하지 마세요. 체험용 입력·수정 내용은 현재 브라우저에 자동 저장되며, 관리자 로그인 화면의 「체험 데이터 초기화」로 삭제할 수 있습니다. 실제 본인인증·예약 접수·문의 전송은 이루어지지 않습니다.' : label.indexOf('비급여') >= 0 ? '비급여 진료 항목과 비용은 진료 내용에 따라 다를 수 있습니다. 자세한 안내는 방문하실 지점에 문의해 주세요. 이 체험 사이트에는 실제 진료비 정보가 등록되어 있지 않습니다.' : label.indexOf('권리') >= 0 ? '환자는 진료에 관해 설명을 듣고 질문하며, 자신의 개인정보를 보호받을 권리가 있습니다. 진료 관련 문의나 불편 사항은 해당 지점에 알려 주세요. 체험용 안내 문구입니다.' : '이 사이트는 가상 자료로 구성된 체험 환경이며 실제 의료 서비스를 제공하지 않습니다. 실제 진료나 예약 문의는 이용하시는 의료기관에 연락해 주세요.';
    A.modal({title:label, body:'<div class="policy-copy">' + U.esc(text) + '</div>', foot:'<button class="btn p" data-x>확인</button>'});
  };
  ACT.guideX = function () { document.getElementById('guide').innerHTML = ''; };
  ACT.drawer = function () { document.getElementById('drawer').classList.toggle('open'); };
  ACT.drawerBg = function (el, e) { if (e.target === el) el.classList.remove('open'); };
  ACT.brpick = function (el) {
    var ex = document.querySelector('.pop'); if (ex) { ex.remove(); return; }
    var r = el.getBoundingClientRect();
    var p = document.createElement('div'); p.className = 'pop'; p.style.left = Math.max(8, Math.min(r.left, window.innerWidth - 296)) + 'px'; p.style.top = (r.bottom + window.scrollY + 8) + 'px';
    p.innerHTML = '<a href="#/"><i style="background:var(--navy)"></i>전체 지점 (게이트웨이)</a>' + D.BRANCHES.map(function (b) { return '<a href="#/b/' + b.id + '"><i style="background:' + b.color + '"></i>' + b.name + '<span>' + U.esc(b.tag.split(' · ')[0]) + '</span></a>'; }).join('');
    document.body.appendChild(p);
  };

  /* ---------- 공통 조각 ---------- */
  function scopeLabel(sc) { return sc.indexOf('all') >= 0 ? bdg('전 지점', 'navy', 1) : sc.map(function (s) { return bdg(D.branch(s).short, 'teal', 1); }).join(' '); }
  A.scopeLabel = scopeLabel;
  function postsFor(bid, type) {
    return D.POSTS.filter(function (p) { return (!type || p.type === type) && (!bid || p.scope.indexOf('all') >= 0 || p.scope.indexOf(bid) >= 0) && !p.hidden; })
      .sort(function (a, b) { return (b.pin ? 1 : 0) - (a.pin ? 1 : 0) || b.at - a.at; });
  }
  A.postsFor = postsFor;
  A.promos = function(kind, bid) {
    var today = U.ymd(new Date());
    return D.BANNERS.filter(function(x) { return x.kind === kind && x.on && U.validDate(x.from) && U.validDate(x.to) && x.from <= today && x.to >= today && (x.scope.includes('all') || (bid && x.scope.includes(bid))); }).sort(function(a,b) {
      var priority = kind === 'popup' && bid ? Number(b.scope.includes(bid)) - Number(a.scope.includes(bid)) : 0;
      return priority || (b.updatedAt || 0) - (a.updatedAt || 0);
    });
  };
  A.bannerTarget = function(x, bid) {
    var target = x.target || (x.kind === 'popup' ? 'notice' : 'reserve');
    var branch = D.branch(bid) ? bid : x.scope.length === 1 && D.branch(x.scope[0]) ? x.scope[0] : null;
    if (target === 'branch') return branch ? '#/b/' + branch : '#/?s=branches';
    if (target === 'reserve' || target === 'screening') {
      if (!branch && target === 'screening') branch = D.BRANCHES.find(function(b) { return D.BRANCH_DEPTS[b.id].includes('hc') && (x.scope.includes('all') || x.scope.includes(b.id)); })?.id;
      return '#/reserve' + (branch ? '?b=' + branch + (target === 'screening' && D.BRANCH_DEPTS[branch].includes('hc') ? '&d=hc' : '') : '');
    }
    return ({lookup:'#/lookup',notice:'#/news/notice',faq:'#/news/faq',inquiry:'#/inquiry'})[target] || '#/reserve';
  };
  function bannersFor(bid) { return A.promos('banner',bid); }
  function deptTile(b, d) {
    return '<a class="dt" href="#/b/' + b.id + '/d/' + d.id + '"><span class="ico">' + ic(d.icon, 'l') + '</span><h4>' + d.name + '</h4><p>' + d.desc + '</p><span class="go">' + ic('arrow') + '</span></a>';
  }
  function avatar(doc) { var b = D.branch(doc.bid); return '<span class="av" style="--bc:' + b.color + '">' + doc.name[0] + '</span>'; }
  function hasPeriod(sc, day, afternoon) {
    return sc.week[day].some(function(rg) {
      var start = U.min(rg[0]), last = U.min(rg[1]) - sc.interval;
      // Use the same slot boundary and duration as the reservation calendar.
      if (afternoon) start += Math.ceil(Math.max(0, PM_START - start) / sc.interval) * sc.interval;
      return start <= last && (afternoon || start < PM_START);
    });
  }
  function mapBox(b) {
    return '<div class="map" aria-label="' + b.name + ' 위치 지도 (시연용 그림)"><svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice"><rect width="400" height="300" fill="#E9F0EC"/>' +
      '<path d="M0 210 Q120 180 200 200 T400 170" stroke="#fff" stroke-width="18" fill="none"/><path d="M140 0 L170 300" stroke="#fff" stroke-width="14"/><path d="M0 90 L400 120" stroke="#fff" stroke-width="10"/><path d="M300 0 Q280 150 330 300" stroke="#fff" stroke-width="8" fill="none"/>' +
      '<rect x="40" y="20" width="80" height="55" rx="8" fill="#D8E6DE"/><rect x="200" y="30" width="70" height="70" rx="8" fill="#D8E6DE"/><rect x="190" y="215" width="90" height="60" rx="8" fill="#D8E6DE"/><rect x="30" y="230" width="90" height="50" rx="8" fill="#CFE3D6"/><circle cx="350" cy="60" r="34" fill="#CFE6DA"/>' +
      '<path d="M0 140 Q60 130 90 160 T160 150" stroke="#B9D9EC" stroke-width="12" fill="none" opacity=".8"/></svg>' +
      '<div class="pin" style="left:' + b.lat + '%;top:' + (b.lng + 8) + '%"><b>' + D.HOSP.name + ' ' + b.short + '</b><i></i></div><span class="tag">위치 안내용 가상 지도</span></div>';
  }

  /* ================= 게이트웨이 ================= */
  VIEWS.gateway = function (r) {
    A.title = D.HOSP.name;
    var t = U.ymd(new Date());
    var fast = D.BRANCHES.map(function (b) {
      var did = b.id === 'dt' ? 'os' : b.id === 'ca' ? 'gi' : 'im';
      if (D.BRANCH_DEPTS[b.id].indexOf(did) < 0) did = D.BRANCH_DEPTS[b.id][0];
      var f = ENG.first(b.id, did, 1)[0];
      return '<li><a href="#/reserve?b=' + b.id + '&d=' + did + (f ? '&date=' + f.date + '&t=' + f.t : '') + '" style="--bc:' + b.color + '"><span class="dot"></span><span><b>' + b.name + '</b><small>' + D.dept(did).name + '</small></span><span class="tt2">' + (f ? (f.date === t ? '오늘' : U.md(f.date) + ' (' + U.dow(f.date) + ')') + ' ' + f.t + '<small>잔여 ' + f.left + '</small>' : '예약 마감') + '</span></a></li>';
    }).join('');
    var h = '<section class="ghero"><span class="blob b1"></span><span class="blob b2"></span><div class="wrap in"><div>' +
      '<span class="eyebrow"><i></i>4개 지점 통합 온라인 예약</span>' +
      '<h1>가까운 곳에서,<br><em>끝까지 함께하는</em> 진료</h1>' +
      '<p class="lead">평택·동탄·안성·천안 4개 지점의 진료과와 진료시간을 한곳에서 확인하고, 회원가입 없이 본인인증만으로 진료를 예약하세요.</p>' +
      '<div class="finder" id="finder"><span class="lbl">어떤 진료가 필요하세요?</span><div class="chips">' + D.DEPTS.map(function (d) { return '<button class="chip" data-act="find" data-d="' + d.id + '">' + d.name + '</button>'; }).join('') + '</div><div class="res" id="findRes" aria-live="polite">진료과를 고르면 진료 가능한 지점을 알려 드립니다.</div></div>' +
      '<div class="cta"><a class="btn a lg" href="#/reserve">' + ic('cal') + '진료 예약하기</a><a class="btn gl lg" href="#/lookup">' + ic('search') + '예약 조회·취소</a></div>' +
      '<div class="stats"><div><b>4</b><span>지점</span></div><div><b>' + D.DEPTS.length + '</b><span>진료과·센터</span></div><div><b>' + D.DOCTORS.length + '</b><span>전문 의료진</span></div></div>' +
      '</div><div class="fast" id="fast"><h3>' + ic('zap', 's') + '가장 빠른 진료 예약<span class="live"><i></i>실시간</span></h3><ul>' + fast + '</ul><p class="ft">' + ic('info', 's') + '표시된 잔여 인원은 예약 시점에 달라질 수 있습니다.</p></div></div></section>';

    h += '<section class="sec tight" id="branches"><div class="wrap lift"><div class="brs">' + D.BRANCHES.map(function (b) {
      var on = ENG.openNow(b.id);
      return '<article class="brc" style="--bc:' + b.color + '"><span class="tg">' + U.esc(b.tag) + '</span><h3>' + b.name + '</h3><p class="ad">' + U.esc(b.addr) + '</p>' +
        '<div class="st">' + (on.open ? bdg('진료 중', 'ok') : bdg(on.label.indexOf('휴진') >= 0 ? '휴진' : '진료 외 시간', 'gray')) + '<span class="muted">' + on.label.replace(/^진료 중 · /, '') + '</span></div>' +
        '<div class="dps">' + D.deptsOf(b.id).map(function (d) { return '<span>' + d.name + '</span>'; }).join('') + '</div>' +
        '<div class="act"><a class="btn o sm" href="#/b/' + b.id + '">지점 홈</a><a class="btn p sm" href="#/reserve?b=' + b.id + '">예약</a></div></article>';
    }).join('') + '</div></div></section>';

    h += '<section class="sec" id="depts"><div class="wrap"><div class="sh"><div><span class="k">Departments</span><h2>진료과 · 센터</h2><p>진료과를 고르면 진료하는 지점과 의료진, 예약 가능한 시간을 안내합니다.</p></div></div><div class="dts">' +
      D.DEPTS.map(function (d) { var bs = D.branchesWith(d.id); return '<button class="dt" style="text-align:left;font:inherit" data-act="deptPick" data-d="' + d.id + '"><span class="ico">' + ic(d.icon, 'l') + '</span><h4>' + d.name + '</h4><p>' + bs.map(function (b) { return b.short; }).join(' · ') + ' 진료</p><span class="go">' + ic('arrow') + '</span></button>'; }).join('') + '</div></div></section>';

    var bn = bannersFor(null);
    if (bn.length) h += '<section class="sec tight alt"><div class="wrap"><div class="bnrs">' + bn.map(function (x) { return '<a class="bnr ' + x.tone + '" href="' + A.bannerTarget(x,null) + '"><div><h3>' + U.esc(x.title) + '</h3><p>' + U.esc(x.sub) + '</p></div></a>'; }).join('') + (bn.length < 2 ? '<a class="bnr navy" href="#/news/faq"><div><h3>처음 방문하시나요?</h3><p>준비물·주차·서류 발급을 확인하세요</p></div></a>' : '') + '</div></div></section>';

    h += '<section class="sec care-section"><div class="wrap"><div class="care-story"><img src="assets/images/consultation-room.webp" alt="따뜻한 채광이 들어오는 진료 공간 이미지" width="1536" height="1024" loading="lazy"><div><span class="k">CARE, CLOSE TO YOU</span><h2>편안한 공간에서,<br>나에게 맞는 진료를.</h2><p>진료과와 의료진을 살펴보고 가까운 지점을 선택하세요. 예약부터 방문 안내까지 한곳에서 확인할 수 있습니다.</p><a class="btn p" href="#/?s=depts">진료과 살펴보기 ' + ic('arrow', 's') + '</a></div></div></div></section>';
    var nt = postsFor(null, 'notice').slice(0, 5), pr = postsFor(null, 'press').slice(0, 3);
    h += '<section class="sec"><div class="wrap news"><div><div class="sh"><div><span class="k">News</span><h2>병원 소식</h2></div><a class="btn g sm" href="#/news/notice">전체 보기 ' + ic('arrow', 's') + '</a></div><ul class="nl">' +
      nt.concat(pr).slice(0, 6).map(function (p) { return '<li><a href="#/post/' + p.id + '">' + bdg(D.BTYPE[p.type], p.type === 'press' ? 'info' : 'teal', 1) + '<h4>' + (p.pin ? '📌 ' : '') + U.esc(p.title) + '</h4><span class="d">' + U.date(p.at) + '</span></a></li>'; }).join('') + '</ul></div>' +
      '<div><div class="sh"><div><span class="k">Quick</span><h2>빠른 안내</h2></div></div><div class="ql">' +
      '<a href="#/reserve">' + ic('cal', 'l') + '진료 예약<span>지점·진료과·시간 선택</span></a><a href="#/lookup">' + ic('search', 'l') + '예약 조회·취소<span>본인인증으로 확인</span></a><a href="#/news/faq">' + ic('help', 'l') + '자주 묻는 질문<span>준비물·주차·서류</span></a><a href="#/inquiry">' + ic('msg', 'l') + '온라인 문의<span>궁금한 점을 남겨 주세요</span></a></div></div></div></section>';
    if (r.q.s) A.after(function () { var el = document.getElementById(r.q.s); if (el) el.scrollIntoView({ behavior: 'smooth' }); });
    return h;
  };
  ACT.find = function (el) {
    document.querySelectorAll('#finder .chip').forEach(function (c) { c.classList.toggle('on', c === el); });
    var d = D.dept(el.dataset.d), bs = D.branchesWith(d.id);
    document.getElementById('findRes').innerHTML = '<b>' + d.name + '</b> 진료 지점 →' + bs.map(function (b) { return '<a href="#/b/' + b.id + '/d/' + d.id + '">' + b.short + ' ' + ic('arrow', 's') + '</a>'; }).join('');
  };
  ACT.deptPick = function (el) {
    var d = D.dept(el.dataset.d), bs = D.branchesWith(d.id);
    var m = A.modal({ title: d.name + ' — 진료 지점 선택', icon: d.icon, body: '<p class="muted small">' + d.desc + '</p><div class="col mt16">' + bs.map(function (b) { var f = ENG.first(b.id, d.id, 1)[0]; return '<a class="opt" href="#/b/' + b.id + '/d/' + d.id + '" style="--bc:' + b.color + '"><span class="bar"></span><span class="ic">' + ic('building') + '</span><span><b>' + b.name + '</b><small>' + (f ? '가장 빠른 예약 ' + U.md(f.date) + ' ' + f.t : '예약 마감') + '</small></span><span class="ck">' + ic('chevR', 's') + '</span></a>'; }).join('') + '</div>' });
    m.el.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { m.close(); }); });
  };

  /* ================= 지점 홈 · 진료과 상세 ================= */
  VIEWS.branch = function (r) {
    var b = D.branch(r.p[1]);
    if (!b) return VIEWS.nf();
    if (r.p[2] === 'd') return deptView(b, D.dept(r.p[3]), r);
    A.title = b.name + ' — ' + D.HOSP.name;
    var on = ENG.openNow(b.id), sc = D.sched(b.id, D.BRANCH_DEPTS[b.id][0]);
    var rows = CLINIC_DAYS.map(function (k) { var w = sc.week[k[0]]; return '<tr><td>' + k[1] + '요일' + (w.some(function(rg) { return U.min(rg[1]) > 18 * 60; }) ? ' <b style="color:#E8D6BA">야간</b>' : '') + '</td><td>' + (w.length ? w.map(function(rg) { return rg[0] + ' ~ ' + rg[1]; }).join(' / ') : '휴진') + '</td></tr>'; }).join('');
    var h = '<section class="bhero" style="--bc:' + b.color + '"><div class="wrap in"><div><div class="crumb"><a href="#/">' + D.HOSP.name + '</a> › ' + b.name + '</div>' +
      '<h1>' + D.HOSP.name + ' ' + b.name + '</h1><span class="tg">' + U.esc(b.tag) + '</span>' +
      '<div class="meta"><span>' + ic('pin', 's') + U.esc(b.addr) + '</span><span>' + ic('phone', 's') + U.esc(b.tel) + '</span><span>' + (on.open ? bdg('진료 중', 'ok') : bdg(on.label, 'gray', 1)) + '</span></div>' +
      '<div class="cta"><a class="btn a lg" href="#/reserve?b=' + b.id + '">' + ic('cal') + '이 지점 예약</a><a class="btn gl lg" href="#/b/' + b.id + '?s=loc">' + ic('pin') + '오시는 길</a></div></div>' +
      '<div class="today"><div class="h"><span>' + ic('clock', 's') + ' 진료시간 · ' + D.deptsOf(b.id)[0].name + ' 기준</span>' + bdg('오늘 ' + U.dow(new Date()) + '요일', 'acc', 1) + '</div><table>' + rows + '</table><p class="tiny mt8" style="color:rgba(255,255,255,.7)">진료과별 시간과 휴진·단축 일정은 예약 화면에서 확인해 주세요.</p></div></div></section>';
    h += '<section class="sec tight"><div class="wrap lift"><nav class="qm" aria-label="지점 빠른 메뉴"><a class="hl" href="#/reserve?b=' + b.id + '"><span class="ic">' + ic('cal') + '</span><span>진료 예약<small>회원가입 없이</small></span></a><a href="#/b/' + b.id + '?s=depts"><span class="ic">' + ic('grid') + '</span><span>진료과<small>' + D.deptsOf(b.id).length + '개 진료과</small></span></a><a href="#/b/' + b.id + '?s=docs"><span class="ic">' + ic('user') + '</span><span>의료진<small>진료 일정</small></span></a><a href="#/b/' + b.id + '?s=loc"><span class="ic">' + ic('pin') + '</span><span>오시는 길<small>주차·대중교통</small></span></a></nav></div></section>';
    h += '<section class="sec tight" id="depts"><div class="wrap"><div class="sh"><div><span class="k">Departments</span><h2>' + b.short + ' 진료과</h2><p>진료과별 의료진과 예약 가능한 시간을 확인해 주세요.</p></div></div><div class="dts">' + D.deptsOf(b.id).map(function (d) { return deptTile(b, d); }).join('') + '</div></div></section>';
    var bn = bannersFor(b.id);
    if (bn.length) h += '<section class="sec tight"><div class="wrap"><div class="bnrs">' + bn.map(function (x) { return '<a class="bnr ' + x.tone + '" href="' + A.bannerTarget(x,b.id) + '"><div><h3>' + U.esc(x.title) + '</h3><p>' + U.esc(x.sub) + '</p></div></a>'; }).join('') + '</div></div></section>';
    h += '<section class="sec alt" id="docs"><div class="wrap"><div class="sh"><div><span class="k">Doctors</span><h2>의료진</h2></div></div><div class="docs">' + D.docsOf(b.id).map(function (doc) { return '<a class="doc" href="#/b/' + b.id + '/d/' + doc.did + '?s=docs">' + avatar(doc) + '<span><span class="tt">' + D.dept(doc.did).name + ' ' + doc.title + '</span><b>' + doc.name + '</b><span class="sp">' + doc.spec + '</span></span></a>'; }).join('') + '</div></div></section>';
    var nt = postsFor(b.id).filter(function (p) { return p.type !== 'faq'; }).slice(0, 5);
    h += '<section class="sec" id="loc"><div class="wrap news"><div><div class="sh"><div><span class="k">Location</span><h2>오시는 길</h2></div></div>' + mapBox(b) +
      '<dl class="kv mt16"><dt>주소</dt><dd>' + U.esc(b.addr) + '</dd><dt>대표전화</dt><dd>' + U.esc(b.tel) + '</dd><dt>' + ic('car', 's') + ' 주차</dt><dd>' + U.esc(b.park) + '</dd><dt>' + ic('bus', 's') + ' 대중교통</dt><dd>' + U.esc(b.bus) + '</dd><dt>층별 안내</dt><dd>' + U.esc(b.floors) + '</dd></dl></div>' +
      '<div><div class="sh"><div><span class="k">Notice</span><h2>' + b.short + ' 소식</h2></div><a class="btn g sm" href="#/news/notice?b=' + b.id + '">전체 ' + ic('arrow', 's') + '</a></div><ul class="nl">' + nt.map(function (p) { return '<li><a href="#/post/' + p.id + '">' + (p.scope.indexOf('all') >= 0 ? bdg('공통', 'gray', 1) : bdg(b.short, 'teal', 1)) + '<h4>' + U.esc(p.title) + '</h4><span class="d">' + U.md(p.at) + '</span></a></li>'; }).join('') + '</ul>' +
      '<p class="note mt16">' + ic('info', 's') + '<span>' + b.short + ' 소식과 전 지점 공통 안내를 확인해 주세요.</span></p></div></div></section>';
    if (r.q.s) A.after(function () { var el = document.getElementById(r.q.s); if (el) setTimeout(function () { el.scrollIntoView({ behavior: 'smooth' }); }, 60); });
    return h;
  };
  function deptView(b, d, r) {
    if (!d) return VIEWS.nf();
    A.title = b.short + ' ' + d.name + ' — ' + D.HOSP.name;
    var opn = D.BRANCH_DEPTS[b.id].indexOf(d.id) >= 0;
    var docs = D.docsOf(b.id, d.id), fs = opn ? ENG.first(b.id, d.id, 6) : [];
    var days = CLINIC_DAYS;
    var sc = D.sched(b.id, d.id);
    var h = '<section class="dhero"><div class="wrap in"><div><nav class="crumb2" aria-label="현재 위치"><a href="#/">' + D.HOSP.name + '</a>›<a href="#/b/' + b.id + '">' + b.name + '</a>›<span>' + d.name + '</span></nav>' +
      '<h1><small>' + d.en + '</small>' + d.name + '</h1><p class="muted mt12" style="max-width:640px">' + d.desc + '</p>' +
      '<div class="row wr mt16">' + (opn ? '<a class="btn a lg" href="#/reserve?b=' + b.id + '&d=' + d.id + '">' + ic('cal') + '이 진료과 예약하기</a>' : bdg('현재 ' + b.short + '에서 운영하지 않는 진료과', 'warn')) + '<a class="btn o lg" href="#/b/' + b.id + '">' + ic('back') + b.short + ' 홈</a></div></div>' +
      '<img class="dept-photo" src="assets/images/consultation-room.webp" alt="편안한 진료 공간을 표현한 이미지" width="1536" height="1024"></div>' +
      '<div class="wrap"><div class="dsub" role="navigation" aria-label="' + b.short + ' 진료과">' + D.deptsOf(b.id).map(function (x) { return '<a class="chip ' + (x.id === d.id ? 'on' : '') + '" href="#/b/' + b.id + '/d/' + x.id + '">' + x.name + '</a>'; }).join('') + '</div></div></section>';
    h += '<section class="sec tight"><div class="wrap dlay"><div class="col" style="gap:30px">' +
      '<div><h2 style="font-size:1.4rem">주요 진료</h2><div class="its mt16">' + d.items.map(function (x, i) { return '<div><i>' + U.pad(i + 1) + '</i>' + x + '</div>'; }).join('') + '</div></div>' +
      '<div><h2 style="font-size:1.4rem">보유 장비·시설</h2><div class="row wr mt12">' + d.equip.map(function (x) { return '<span class="chip">' + ic('check', 's') + x + '</span>'; }).join('') + '</div></div>' +
      '<div id="docs"><h2 style="font-size:1.4rem">의료진 · 진료 일정</h2><div class="col mt16">' + (docs.length ? docs.map(function (doc) {
        return '<div class="card pad"><div class="row">' + avatar(doc) + '<div class="grow"><span class="small b" style="color:var(--pri-ink)">' + d.name + ' ' + doc.title + '</span><h3 style="font-size:1.15rem">' + doc.name + '</h3><p class="small muted">전문 분야 · ' + doc.spec + '</p></div>' + (opn ? '<a class="btn p sm" href="#/reserve?b=' + b.id + '&d=' + d.id + '">예약</a>' : '') + '</div>' +
          '<div class="tw"><table class="sch"><thead><tr><th></th>' + days.map(function (k) { return '<th>' + k[1] + '</th>'; }).join('') + '</tr></thead><tbody>' +
          ['오전', '오후'].map(function (ap, ai) { return '<tr><th>' + ap + '</th>' + days.map(function (k) { var has = opn && hasPeriod(sc, k[0], ai === 1); if (ai === 1 && doc.off === k[0]) has = false; return '<td>' + (has ? '<span class="o" title="진료"></span>' : '<span class="x">휴진</span>') + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div></div>';
      }).join('') : '<div class="empty card">의료진 정보를 준비하고 있습니다. 자세한 진료 일정은 지점에 문의해 주세요.</div>') + '</div></div></div>' +
      '<aside class="side"><div class="card pad"><h3 style="font-size:1.05rem" class="row">' + ic('zap', 's') + '빠른 예약 가능 시간</h3>' + (fs.length ? '<div class="slots-q">' + fs.map(function (f) { return '<a href="#/reserve?b=' + b.id + '&d=' + d.id + '&date=' + f.date + '&t=' + f.t + '">' + U.md(f.date) + ' (' + U.dow(f.date) + ') ' + f.t + '<small>잔여 ' + f.left + '</small></a>'; }).join('') + '</div><p class="hint mt12">시간을 누르면 지점·진료과·시간이 선택된 상태로 예약을 시작합니다.</p>' : '<p class="muted small mt8">예약 가능한 시간이 없습니다.</p>') + '</div>' +
      '<div class="card pad"><h3 style="font-size:1.05rem">다른 지점에서도 진료해요</h3><div class="col mt12">' + D.branchesWith(d.id).filter(function (x) { return x.id !== b.id; }).map(function (x) { return '<a class="btn o" style="justify-content:space-between" href="#/b/' + x.id + '/d/' + d.id + '"><span class="row"><i style="width:9px;height:9px;border-radius:50%;background:' + x.color + '"></i>' + x.name + '</span>' + ic('chevR', 's') + '</a>'; }).join('') + '</div></div>' +
      '<div class="card pad"><h3 style="font-size:1.05rem">' + b.name + '</h3><p class="small muted mt8">' + U.esc(b.addr) + '</p><p class="b mt8">' + U.esc(b.tel) + '</p></div></aside></div></section>';
    if (r.q.s) A.after(function () { var el = document.getElementById(r.q.s); if (el) el.scrollIntoView({ behavior: 'smooth' }); });
    return h;
  }

  /* ================= 진료 예약 ================= */
  var STEPS = ['지점', '진료과', '날짜·시간', '정보 확인', '예약 완료'];
  function rsvInit(q) {
    var R = S.rsv;
    if (!R || q.b || q.d || q.date || q.new) {
      R = S.rsv = { step: 0, bid: null, did: null, date: null, time: null, first: 'first', memo: '', agree: false, sens: false, idv: null, mon: null, done: null, err: '' };
      if (q.b && D.branch(q.b)) { R.bid = q.b; R.step = 1; }
      if (R.bid && q.d && D.BRANCH_DEPTS[R.bid].indexOf(q.d) >= 0) { R.did = q.d; R.step = 2; }
      if (R.did && U.validDate(q.date) && !ENG.slots(R.bid,R.did,q.date).closed) { R.date = q.date; if (U.validTime(q.t) && ENG.slots(R.bid,R.did,q.date).list.some(function(x) { return x.t === q.t && !x.past && x.left > 0; })) R.time = q.t; }
      if (q.b || q.d || q.date || q.new) history.replaceState(null, '', '#/reserve');
    }
    return R;
  }
  VIEWS.reserve = function (r) {
    A.title = '진료 예약 — ' + D.HOSP.name;
    var R = rsvInit(r.q);
    var h = '<section class="rhead"><div class="wrap"><h1>진료 예약</h1><p>회원가입 없이 휴대폰 본인인증만으로 예약하고, 같은 인증으로 조회·취소할 수 있습니다.</p>' +
      '<ol class="steps">' + STEPS.map(function (s, i) { return '<li class="' + (i === R.step ? 'on' : i < R.step ? 'dn' : '') + '"><i>' + (i < R.step ? ic('check', 's') : i + 1) + '</i><span>' + s + '</span></li>'; }).join('') + '</ol></div></section>';
    h += '<div class="wrap rsv rbody"><div class="rpanel" id="rpanel">' + rsvStep(R) + '</div>' + rsvSum(R) + '</div>';
    return h;
  };
  function rsvSum(R) {
    var b = R.bid && D.branch(R.bid), d = R.did && D.dept(R.did);
    return '<aside class="sumc" aria-label="예약 요약"><div class="hd">' + ic('doc', 's') + '예약 내용</div><dl>' +
      '<div><dt>지점</dt><dd>' + (b ? b.name : '—') + '</dd></div><div><dt>진료과</dt><dd>' + (d ? d.name : '—') + '</dd></div>' +
      '<div><dt>날짜</dt><dd>' + (R.date ? U.mdw(R.date) : '—') + '</dd></div><div><dt>시간</dt><dd>' + (R.time || '—') + '</dd></div>' +
      '<div><dt>본인인증</dt><dd>' + (R.idv ? '<span style="color:var(--ok)">완료</span>' : '—') + '</dd></div></dl>' +
      '<div class="ft"><span>' + ic('info', 's') + ' 진료 ' + (R.bid && R.did ? D.sched(R.bid, R.did).cancelHours : 2) + '시간 전까지 온라인으로 취소할 수 있습니다.</span><span>' + ic('shield', 's') + ' 진료받으실 분의 정보로 예약해 주세요. 체험 중에는 실제 개인정보를 입력하지 마세요.</span></div></aside>';
  }
  function rsvStep(R) {
    var nav = function (back, next, nextLbl, dis, why) { return '<div class="rnav">' + (back ? '<button class="btn o" data-act="rStep" data-v="' + (R.step - 1) + '">' + ic('back', 's') + '이전</button>' : '<span></span>') + (next ? '<button class="btn p lg" data-act="' + next + '"' + (dis ? ' aria-disabled="true" data-why="' + why + '"' : '') + '>' + nextLbl + ic('arrow', 's') + '</button>' : '') + '</div>'; };
    if (R.step === 0) {
      return '<h2>1. 지점을 선택해 주세요</h2><p class="sub">가까운 지점을 고르면 그 지점에서 운영하는 진료과만 보여 드립니다.</p><div class="opts">' +
        D.BRANCHES.map(function (b) { var on = ENG.openNow(b.id); return '<button class="opt ' + (R.bid === b.id ? 'on' : '') + '" data-act="rBranch" data-v="' + b.id + '" style="--bc:' + b.color + '"><span class="bar"></span><span class="ic">' + ic('building') + '</span><span><b>' + b.name + '</b><small>' + U.esc(b.tag) + ' · ' + on.label + '</small></span><span class="ck">' + ic('check', 's') + '</span></button>'; }).join('') + '</div>';
    }
    if (R.step === 1) {
      return '<h2>2. 진료과를 선택해 주세요</h2><p class="sub">' + D.branch(R.bid).name + '에서 운영하는 진료과입니다.</p><div class="opts">' +
        D.deptsOf(R.bid).map(function (d) { var f = ENG.first(R.bid, d.id, 1)[0]; return '<button class="opt ' + (R.did === d.id ? 'on' : '') + '" data-act="rDept" data-v="' + d.id + '"><span class="ic">' + ic(d.icon) + '</span><span><b>' + d.name + '</b><small>' + (f ? '가장 빠른 예약 ' + U.md(f.date) + ' ' + f.t : '예약 가능한 시간 없음') + '</small></span><span class="ck">' + ic('check', 's') + '</span></button>'; }).join('') + '</div>' + nav(true);
    }
    if (R.step === 2) {
      var sc = D.sched(R.bid, R.did);
      if (R.mon && R.mon < new Date(U.today().getFullYear(), U.today().getMonth(), 1)) R.mon = null;
      if (!R.mon) { var md = R.date && R.date >= U.ymd(U.today()) ? U.parse(R.date) : U.today(); R.mon = new Date(md.getFullYear(), md.getMonth(), 1); }
      var m0 = R.mon, first = new Date(m0.getFullYear(), m0.getMonth(), 1), last = new Date(m0.getFullYear(), m0.getMonth() + 1, 0);
      var cells = '';
      for (var i = 0; i < first.getDay(); i++) cells += '<span class="d e"></span>';
      for (var dd = 1; dd <= last.getDate(); dd++) {
        var ds = U.ymd(new Date(m0.getFullYear(), m0.getMonth(), dd)), inf = ENG.day(R.bid, R.did, ds);
        var cls = 'd ' + (inf.st === 'open' ? '' : inf.st === 'full' ? 'full x' : inf.st) + (ds === U.ymd(U.today()) ? ' tdy' : '') + (R.date === ds ? ' on' : '');
        cells += inf.st === 'open' ? '<button class="' + cls + '" data-act="rDate" data-v="' + ds + '" aria-label="' + U.mdw(ds) + ' ' + inf.label + '">' + dd + '<small>' + inf.label + '</small></button>' : '<span class="' + cls + '" title="' + U.esc(inf.reason || inf.label) + '">' + dd + '<small>' + inf.label + '</small></span>';
      }
      var prevOk = m0 > new Date(U.today().getFullYear(), U.today().getMonth(), 1);
      var lim = U.addDays(U.today(), sc.days - 1), nextOk = new Date(m0.getFullYear(), m0.getMonth() + 1, 1) <= lim;
      var tms = '';
      if (R.date) {
        var s = ENG.slots(R.bid, R.did, R.date);
        var grp = function (pm) { return s.list.filter(function (x) { return x.pm === pm; }).map(function (x) { var dis = x.past || x.left <= 0; return '<button class="tm ' + (R.time === x.t ? 'on' : '') + '" data-act="rTime" data-v="' + x.t + '"' + (dis ? ' disabled' : '') + ' aria-label="' + x.t + (dis ? ' 마감' : ' 잔여 ' + x.left) + '">' + x.t + '<small class="' + (x.left === 1 ? 'lo' : '') + '">' + (x.past ? '지남' : x.left <= 0 ? '마감' : '잔여 ' + x.left) + '</small></button>'; }).join(''); };
        var am = grp(false), pm = grp(true);
        tms = '<div class="tms" id="tms">' + (s.short ? '<p class="note warn">' + ic('alert', 's') + '<span>' + U.esc(s.short.note) + ' — ' + s.short.until + ' 이후 예약을 받지 않습니다.</span></p>' : '') + (am ? '<h4>오전</h4><div class="tgrid">' + am + '</div>' : '') + (pm ? '<h4>오후</h4><div class="tgrid">' + pm + '</div>' : '') + '</div>';
      }
      return '<h2>3. 날짜와 시간을 선택해 주세요</h2><p class="sub">' + D.branch(R.bid).name + ' · ' + D.dept(R.did).name + ' — ' + sc.interval + '분 단위, 시간대별 정원 ' + sc.cap + '명. 휴진일과 마감된 시간은 선택할 수 없습니다.</p>' +
        '<div class="cal" id="cal"><div class="hd"><button class="ibtn" data-act="rMon" data-v="-1" aria-label="이전 달"' + (prevOk ? '' : ' disabled') + '>' + ic('chevL') + '</button><b>' + m0.getFullYear() + '년 ' + (m0.getMonth() + 1) + '월</b><button class="ibtn" data-act="rMon" data-v="1" aria-label="다음 달"' + (nextOk ? '' : ' disabled') + '>' + ic('chevR') + '</button></div>' +
        '<div class="gr">' + ['일', '월', '화', '수', '목', '금', '토'].map(function (w, i) { return '<span class="wk ' + (i === 0 ? 'su' : i === 6 ? 'sa' : '') + '">' + w + '</span>'; }).join('') + cells + '</div></div>' + tms +
        (R.err ? '<p class="note err mt16" role="alert">' + ic('alert', 's') + '<span>' + R.err + '</span></p>' : '') +
        nav(true, 'rToInfo', '다음', !(R.date && R.time), '날짜와 시간을 선택해 주세요');
    }
    if (R.step === 3) {
      return '<h2>4. 진료 정보 확인과 본인인증</h2><p class="sub">진료받으실 분 본인 명의로 인증해 주세요. 이름·연락처는 인증 결과로 채워집니다.</p>' +
        '<div class="fld mt16"><span class="lbl">진료 구분</span><div class="seg" role="radiogroup"><button data-act="rFirst" data-v="first" class="' + (R.first === 'first' ? 'on' : '') + '" role="radio" aria-checked="' + (R.first === 'first') + '">처음 방문 (초진)</button><button data-act="rFirst" data-v="re" class="' + (R.first === 're' ? 'on' : '') + '" role="radio" aria-checked="' + (R.first === 're') + '">다시 방문 (재진)</button></div></div>' +
        '<div class="fld mt16"><label for="rMemo">증상·요청 사항 <span class="muted">(선택)</span></label><textarea class="ta" id="rMemo" data-in="rMemo" maxlength="200" placeholder="예: 3일 전부터 오른쪽 무릎이 아파요">' + U.esc(R.memo) + '</textarea><span class="hint">입력하시면 아래 「민감정보 처리 동의」가 필요합니다. 최대 200자.</span></div>' +
        '<div class="col mt16" style="gap:12px"><label class="chk"><input type="checkbox" data-ch="rAgree" ' + (R.agree ? 'checked' : '') + '><span><b>[필수]</b> 개인정보 수집·이용 동의 — 이름, 생년월일, 휴대폰 번호 / 예약 확인·안내 목적 / 예약 처리에 필요한 기간 동안 보관 후 파기 <a href="#" data-act="nope" style="color:var(--pri);text-decoration:underline">전문 보기</a></span></label>' +
        '<label class="chk"><input type="checkbox" data-ch="rSens" ' + (R.sens ? 'checked' : '') + '><span><b>[선택]</b> 민감정보(증상 메모) 처리 동의 — 메모를 입력한 경우에만 필요합니다</span></label></div>' +
        '<div class="idv ' + (R.idv ? 'ok' : '') + '" id="idv">' + (R.idv ? ic('shield', 'l') + '<div class="grow"><b>본인인증 완료</b><p class="small muted">' + U.esc(R.idv.name) + ' · ' + U.maskPhone(R.idv.phone) + ' · ' + R.idv.carrier + '</p></div><button class="btn g sm" data-act="rIdv">다시 인증</button>' : ic('shield', 'l') + '<div class="grow"><b>휴대폰 본인인증</b><p class="small muted">회원가입 없이 본인인증으로 예약자를 확인합니다</p></div><button class="btn p" data-act="rIdv">본인인증</button>') + '</div>' +
        (R.err ? '<p class="note err mt16" role="alert">' + ic('alert', 's') + '<span>' + R.err + '</span></p>' : '') +
        nav(true, 'rSubmit', '예약 신청', !(R.agree && R.idv && (!R.memo.trim() || R.sens)), !R.agree ? '필수 동의에 체크해 주세요' : !R.idv ? '본인인증을 진행해 주세요' : '증상 메모를 입력하셨다면 민감정보 처리에 동의해 주세요');
    }
    var x = R.done, b = D.branch(x.bid), dpt = D.dept(x.did);
    var completion = {
      request:['예약 신청이 접수되었습니다','병원에서 확인한 뒤 확정합니다. 예약 조회 화면에서 상태를 확인하실 수 있습니다.'],
      confirm:['예약이 확정되었습니다','방문 시간 10분 전까지 도착해 주세요.'],
      cancel:['예약이 취소되었습니다','새로운 진료 일정이 필요하시면 아래 「새 예약」을 선택해 주세요.'],
      done:['진료가 완료된 예약입니다','다음 진료가 필요하시면 새로운 일정으로 예약해 주세요.'],
      noshow:['미내원 처리된 예약입니다','다시 방문하실 일정은 새로 예약하거나 해당 지점에 문의해 주세요.']
    }[x.status] || ['예약 내역을 확인해 주세요','현재 예약 상태는 아래에 표시됩니다.'];
    return '<div class="done"><div class="ck ' + (x.status === 'cancel' ? 'cancel' : '') + '">' + ic(x.status === 'cancel' ? 'x' : 'check') + '</div><h2 class="mt16" style="font-size:1.6rem">' + completion[0] + '</h2>' +
      '<p class="muted mt8">' + completion[1] + '</p>' +
      '<div class="ticket"><div class="tp"><span><span class="tiny" style="opacity:.7">예약번호</span><br><b class="mono" style="font-size:1.1rem">' + x.no + '</b></span>' + stB(x.status) + '</div><dl>' +
      '<div><dt>지점</dt><dd>' + b.name + '</dd></div><div><dt>진료과</dt><dd>' + dpt.name + '</dd></div><div><dt>일시</dt><dd>' + U.mdw(x.date) + ' ' + x.time + '</dd></div><div><dt>예약자</dt><dd>' + U.esc(x.name) + ' · ' + U.maskPhone(x.phone) + '</dd></div><div><dt>온라인 취소</dt><dd>진료 ' + D.sched(x.bid, x.did).cancelHours + '시간 전까지</dd></div></dl></div>' +
      '<div class="row wr mt24" style="justify-content:center"><a class="btn p" href="#/lookup">' + ic('search', 's') + '예약 조회</a><a class="btn o" href="#/b/' + b.id + '?s=loc">' + ic('pin', 's') + '오시는 길</a><a class="btn g" href="#/reserve?new=1">새 예약</a></div>' +
      '<p class="note mt24" style="text-align:left">' + ic('info', 's') + '<span>예약 상태는 「예약 조회」에서 확인해 주세요. 방문 일정에 관한 문의는 해당 지점 대표번호로 연락해 주세요.</span></p></div>';
  }
  function rRender() { var y = window.scrollY; render(); window.scrollTo(0, y); }
  ACT.rStep = function (el) { S.rsv.step = +el.dataset.v; S.rsv.err = ''; rRender(); };
  ACT.rBranch = function (el) { var R = S.rsv; if (R.bid !== el.dataset.v) { R.did = null; R.date = null; R.time = null; R.mon = null; } R.bid = el.dataset.v; R.step = 1; R.err = ''; rRender(); };
  ACT.rDept = function (el) { var R = S.rsv; if (R.did !== el.dataset.v) { R.date = null; R.time = null; R.mon = null; } R.did = el.dataset.v; R.step = 2; R.err = ''; rRender(); };
  ACT.rMon = function (el) { var R = S.rsv; R.mon = new Date(R.mon.getFullYear(), R.mon.getMonth() + (+el.dataset.v), 1); rRender(); };
  ACT.rDate = function (el) { var R = S.rsv; R.date = el.dataset.v; R.time = null; R.err = ''; rRender(); A.after && setTimeout(function () { var t = document.getElementById('tms'); if (t && window.innerWidth < 960) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 50); };
  ACT.rTime = function (el) { S.rsv.time = el.dataset.v; S.rsv.err = ''; document.querySelectorAll('.tm').forEach(function (t) { t.classList.toggle('on', t === el); }); var n = document.querySelector('[data-act="rToInfo"]'); if (n) n.removeAttribute('aria-disabled'); refreshSum(); };
  function refreshSum() { var s = document.querySelector('.sumc'); if (s) s.outerHTML = rsvSum(S.rsv); }
  ACT.rToInfo = function () {
    var R = S.rsv;
    /* 다음 단계로 넘어가기 전 남은 자리를 다시 확인 */
    var sl = ENG.slots(R.bid, R.did, R.date).list.filter(function (x) { return x.t === R.time; })[0];
    if (!sl || sl.past || sl.left <= 0) { R.err = '선택하신 시간이 방금 마감되었습니다. 다른 시간을 선택해 주세요.'; R.time = null; rRender(); return; }
    R.step = 3; R.err = ''; rRender();
  };
  ACT.rFirst = function (el) { S.rsv.first = el.dataset.v; document.querySelectorAll('.seg button').forEach(function (b) { b.classList.toggle('on', b === el); b.setAttribute('aria-checked', b === el); }); };
  ACT.rMemo = function (el) { S.rsv.memo = el.value; updSubmit(); };
  ACT.rAgree = function (el) { S.rsv.agree = el.checked; updSubmit(); };
  ACT.rSens = function (el) { S.rsv.sens = el.checked; updSubmit(); };
  function updSubmit() {
    var R = S.rsv, b = document.querySelector('[data-act="rSubmit"]'); if (!b) return;
    var ok = R.agree && R.idv && (!R.memo.trim() || R.sens);
    if (ok) b.removeAttribute('aria-disabled'); else { b.setAttribute('aria-disabled', 'true'); b.dataset.why = !R.agree ? '필수 동의에 체크해 주세요' : !R.idv ? '본인인증을 진행해 주세요' : '증상 메모를 입력하셨다면 민감정보 처리에 동의해 주세요'; }
  }
  ACT.rIdv = function () { A.idVerify(function (v) { S.rsv.idv = v; S.rsv.err = ''; rRender(); A.toast('본인인증이 완료되었습니다', 'ok'); }, S.rsv.idv || {}); };
  ACT.rSubmit = function () {
    var R = S.rsv;
    if (!R || !R.agree || !R.idv || (R.memo.trim() && !R.sens)) { A.toast('필수 동의와 본인인증을 확인해 주세요.', 'err'); return; }
    if (R.done) return;
    if (S.race) { /* 시연: 제출 직전에 다른 환자가 같은 시간을 예약 */
      var s = ENG.slots(R.bid, R.did, R.date).list.filter(function (x) { return x.t === R.time; })[0];
      for (var i = 0; s && i < s.left; i++) D.mkRes({ bid: R.bid, did: R.did, date: R.date, time: R.time, name: '다른환자' + (i + 1), phone: '010-0000-000' + i, birth: '1990-01-01', di: U.hash('other' + i + Date.now()), status: 'request' });
      S.race = false;
    }
    var res = ENG.book({ bid: R.bid, did: R.did, date: R.date, time: R.time, idv: R.idv, first: R.first === 'first', memo: R.sens ? R.memo.trim() : '' });
    if (!res.ok) {
      R.err = res.msg;
      if (['FULL','PAST','CLOSED','NOSLOT'].includes(res.code)) { R.step = 2; R.time = null; if (res.code === 'CLOSED') { R.date = null; R.mon = null; } }
      rRender(); A.toast(res.msg, 'err'); return;
    }
    S.lastRes = res.res; S.me = R.idv;
    R.done = res.res; R.step = 4; R.err = ''; rRender();
  };

  /* ================= 예약 조회·취소 ================= */
  VIEWS.lookup = function () {
    A.title = '예약 조회 — ' + D.HOSP.name;
    var h = '<section class="rhead"><div class="wrap"><h1>예약 조회 · 취소</h1><p>예약할 때와 같은 휴대폰 본인인증으로 내 예약만 확인합니다.</p></div></section><div class="wrap" style="padding-bottom:70px"><div class="rpanel rbody">';
    if (!S.me) {
      h += '<div class="done"><div class="ck" style="background:var(--navy)">' + ic('shield') + '</div><h2 class="mt16">본인인증 후 예약을 확인할 수 있어요</h2><p class="muted mt8">예약번호를 몰라도 본인인증만으로 지금까지의 예약을 모두 보여 드립니다.</p><button class="btn p lg mt24" data-act="lkIdv">' + ic('shield') + '휴대폰 본인인증</button><p class="hint mt16">시연용 예약자: 정하늘 · 19880412 · 010-2468-1357 (인증번호 123456)</p></div>';
    } else {
      var mine = D.RES.filter(function (x) { return x.di === S.me.di; }).sort(function (a, b) { return (a.date + a.time) < (b.date + b.time) ? -1 : 1; });
      var t = U.ymd(U.today());
      var up = mine.filter(function (x) { return x.date >= t && x.status !== 'cancel' && x.status !== 'done' && x.status !== 'noshow'; }), past = mine.filter(function (x) { return up.indexOf(x) < 0; });
      h += '<div class="row sb wr"><div><h2>' + U.esc(S.me.name) + '님의 예약</h2><p class="sub">' + U.maskPhone(S.me.phone) + ' · 본인인증 ' + U.hm(S.me.at) + '</p></div><button class="btn g sm" data-act="lkOut">' + ic('door', 's') + '조회 종료</button></div>' +
        '<h3 class="mt24" style="font-size:1.02rem">예정된 예약 ' + up.length + '건</h3><div class="mres">' + (up.length ? up.map(mrow).join('') : '<div class="empty">예정된 예약이 없습니다. <a href="#/reserve?new=1" style="color:var(--pri);font-weight:700">예약하기</a></div>') + '</div>' +
        (past.length ? '<h3 class="mt32" style="font-size:1.02rem">지난·취소된 예약</h3><div class="mres">' + past.reverse().map(mrow).join('') + '</div>' : '');
    }
    return h + '</div></div>';
  };
  function mrow(x) {
    var b = D.branch(x.bid), d = D.dept(x.did), can = ENG.canCancel(x), active = x.status === 'request' || x.status === 'confirm';
    return '<div class="mr ' + (active ? '' : 'past') + '" id="mr-' + x.id + '"><div class="dd">' + U.md(x.date) + '<small>' + U.dow(x.date) + ' ' + x.time + '</small></div><div><div class="row wr">' + stB(x.status) + '<span class="mono tiny muted">' + x.no + '</span></div><b class="mt4" style="display:block">' + b.name + ' · ' + d.name + '</b><span class="small muted">' + (x.memo ? '메모: ' + U.esc(x.memo) : '진료 ' + D.sched(x.bid, x.did).cancelHours + '시간 전까지 온라인 취소 가능') + '</span></div>' +
      '<div class="act row">' + (active ? (can ? '<button class="btn d sm" data-act="lkCancel" data-id="' + x.id + '">예약 취소</button>' : '<button class="btn o sm" aria-disabled="true" data-act="noop" data-why="진료 ' + D.sched(x.bid, x.did).cancelHours + '시간 전이 지나 온라인 취소가 마감되었습니다. ' + U.esc(b.tel) + '로 연락해 주세요.">취소 마감</button>') : '') + '</div></div>';
  }
  ACT.noop = function () {};
  ACT.lkIdv = function () { A.idVerify(function (v) { S.me = v; render(); A.toast('본인인증이 완료되었습니다', 'ok'); }); };
  ACT.lkOut = function () { S.me = null; S.rsv = null; S.lastRes = null; render(); };
  ACT.lkCancel = function (el) {
    var x = D.res(el.dataset.id);
    if (!x || !S.me || x.di !== S.me.di) return A.toast('본인 예약만 취소할 수 있습니다.', 'err');
    var owner = S.me.di;
    A.confirm('예약을 취소할까요?', '<p><b>' + D.branch(x.bid).name + ' · ' + D.dept(x.did).name + '</b><br>' + U.mdw(x.date) + ' ' + x.time + '</p><p class="muted small mt8">취소한 시간은 다른 환자가 예약할 수 있도록 바로 열립니다.</p>', '예약 취소', function () {
      if (!S.me || S.me.di !== owner || x.di !== owner) return A.toast('본인인증을 다시 진행해 주세요.', 'err');
      if (!ENG.canCancel(x)) { A.toast('온라인 취소 가능 시간이 지났습니다.', 'err'); return; }
      x.status = 'cancel'; x.hist.push({ t: Date.now(), who: '환자(온라인)', what: '예약 취소' }); render(); A.toast('예약을 취소했습니다', 'ok');
    }, true);
  };

  /* ================= 병원 소식 · 게시판 ================= */
  VIEWS.news = function (r) {
    var type = r.p[1] || 'notice', bid = r.q.b || '', kw = r.q.k || '';
    if (!D.BTYPE[type] || (bid && !D.branch(bid))) return VIEWS.nf();
    A.title = D.BTYPE[type] + ' — ' + D.HOSP.name;
    var list = postsFor(bid || null, type).filter(function (p) { return !kw || (p.title + p.body).indexOf(kw) >= 0; });
    var h = '<section class="phead"><div class="wrap"><span class="small b" style="color:var(--pri)">병원 소식</span><h1>' + D.BTYPE[type] + '</h1>' +
      '<nav class="tabs" aria-label="게시판">' + ['notice', 'press', 'faq'].map(function (t) { return '<a href="#/news/' + t + (bid ? '?b=' + bid : '') + '" class="' + (t === type ? 'on' : '') + '">' + D.BTYPE[t] + '</a>'; }).join('') + '</nav></div></section>';
    h += '<section class="sec tight"><div class="wrap"><div class="row wr sb"><div class="row wr"><span class="chip ' + (!bid ? 'on' : '') + '" data-go="#/news/' + type + '" role="button" tabindex="0">전체</span>' + D.BRANCHES.map(function (b) { return '<span class="chip ' + (bid === b.id ? 'on' : '') + '" data-go="#/news/' + type + '?b=' + b.id + '" role="button" tabindex="0">' + b.short + '</span>'; }).join('') + '</div>' +
      '<form class="row" onsubmit="return false" role="search"><label class="sr" for="nk">검색어</label><input class="inp" style="height:40px;width:220px;max-width:52vw" id="nk" placeholder="검색어" value="' + U.esc(kw) + '"><button class="btn o sm" data-act="nSearch" data-t="' + type + '" data-b="' + bid + '">' + ic('search', 's') + '검색</button></form></div>';
    if (type === 'faq') {
      h += '<div class="faq mt24">' + (list.length ? list.sort(function (a, b) { return a.order - b.order; }).map(function (p) { return '<details><summary><span class="q">Q</span><span><span class="c">' + U.esc(p.cat || '') + '</span><br>' + U.esc(p.title) + '</span>' + ic('chev') + '</summary><div class="a">' + U.esc(p.body) + '</div></details>'; }).join('') : '<div class="empty">검색 결과가 없습니다.</div>') + '</div>';
    } else {
      h += '<div class="tw mt24"><table class="btable"><thead><tr><th style="width:70px" class="hide-s">번호</th><th>제목</th><th style="width:150px" class="hide-s">노출 지점</th><th style="width:110px">등록일</th><th style="width:70px" class="hide-s">조회</th></tr></thead><tbody>' +
        (list.length ? list.map(function (p, i) { return '<tr class="' + (p.pin ? 'pin' : '') + '"><td class="hide-s">' + (p.pin ? bdg('고정', 'acc', 1) : list.length - i) + '</td><td><a href="#/post/' + p.id + '">' + U.esc(p.title) + '</a>' + (p.source ? ' <span class="tiny muted">' + U.esc(p.source) + '</span>' : '') + '</td><td class="hide-s">' + scopeLabel(p.scope) + '</td><td class="small muted">' + U.date(p.at) + '</td><td class="small muted hide-s">' + p.views + '</td></tr>'; }).join('') : '<tr><td colspan="5" class="empty">검색 결과가 없습니다.</td></tr>') + '</tbody></table></div>';
    }
    return h + '</div></section>';
  };
  ACT.nSearch = function (el) { var k = document.getElementById('nk').value.trim(); go('#/news/' + el.dataset.t + '?' + (el.dataset.b ? 'b=' + el.dataset.b + '&' : '') + 'k=' + encodeURIComponent(k)); };
  document.addEventListener('keydown', function (e) { if (e.key === 'Enter' && e.target.id === 'nk') { e.preventDefault(); var b = document.querySelector('[data-act="nSearch"]'); if (b) ACT.nSearch(b); } if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[role="button"][data-go]')) { e.preventDefault(); go(e.target.dataset.go); } });
  VIEWS.post = function (r) {
    var p = D.post(r.p[1]);
    if (!p || p.hidden) return VIEWS.nf();
    p.views++;
    A.title = p.title + ' — ' + D.HOSP.name;
    var same = postsFor(null, p.type).filter(function (x) { return x.id !== p.id; }).slice(0, 3);
    return '<section class="sec tight"><div class="wrap" style="max-width:900px"><nav class="crumb2"><a href="#/">' + D.HOSP.name + '</a>›<a href="#/news/' + p.type + '">' + D.BTYPE[p.type] + '</a></nav><article class="art mt16"><h1>' + U.esc(p.title) + '</h1><div class="meta"><span>' + U.date(p.at) + '</span><span>조회 ' + p.views + '</span><span>' + scopeLabel(p.scope) + '</span>' + (p.source ? '<span>출처 ' + U.esc(p.source) + '</span>' : '') + '</div><div class="bd">' + U.esc(p.body) + '</div></article>' +
      '<div class="row sb mt24"><a class="btn o" href="#/news/' + p.type + '">' + ic('list', 's') + '목록</a></div>' +
      (same.length ? '<h3 class="mt32" style="font-size:1.05rem">다른 글</h3><ul class="nl">' + same.map(function (x) { return '<li><a href="#/post/' + x.id + '">' + scopeLabel(x.scope) + '<h4>' + U.esc(x.title) + '</h4><span class="d">' + U.date(x.at) + '</span></a></li>'; }).join('') + '</ul>' : '') + '</div></section>';
  };

  /* ================= 온라인 문의 ================= */
  VIEWS.inquiry = function () {
    A.title = '온라인 문의 — ' + D.HOSP.name;
    return '<section class="rhead"><div class="wrap"><h1>온라인 문의</h1><p>진료·예약·서류 등 궁금한 점을 남겨 주세요. 답변은 남기신 연락처로 안내합니다.</p></div></section><div class="wrap" style="padding-bottom:70px"><div class="rpanel rbody" style="max-width:820px;margin-left:auto;margin-right:auto"><form id="iqf" novalidate onsubmit="return false">' +
      '<div class="g2"><div class="fld"><label class="req" for="iqB">지점</label><select class="sel" id="iqB">' + D.BRANCHES.map(function (b) { return '<option value="' + b.id + '">' + b.name + '</option>'; }).join('') + '</select></div><div class="fld"><label class="req" for="iqC">문의 분류</label><select class="sel" id="iqC"><option>진료</option><option>예약</option><option>검진</option><option>서류</option><option>이용</option></select></div></div>' +
      '<div class="g2 mt12"><div class="fld"><label class="req" for="iqN">이름</label><input class="inp" id="iqN" maxlength="80" autocomplete="name"></div><div class="fld"><label class="req" for="iqP">연락처</label><input class="inp" id="iqP" maxlength="15" inputmode="tel" placeholder="010-0000-0000"></div></div>' +
      '<div class="fld mt12"><label class="req" for="iqT">제목</label><input class="inp" id="iqT" maxlength="60"></div>' +
      '<div class="fld mt12"><label class="req" for="iqX">내용</label><textarea class="ta" id="iqX" maxlength="1000" placeholder="개인 건강 정보는 꼭 필요한 만큼만 적어 주세요."></textarea></div>' +
      '<label class="chk mt16"><input type="checkbox" id="iqA"><span><b>[필수]</b> 개인정보 수집·이용 동의 — 이름, 연락처 / 문의 답변 목적 / 문의 처리에 필요한 기간 동안 보관 후 파기</span></label>' +
      '<div class="fld mt16"><label for="iqQ">자동 등록 방지 — 3 + 4 = ?</label><input class="inp" id="iqQ" inputmode="numeric" style="max-width:140px"></div>' +
      '<p class="hint err mt8" id="iqE" role="alert"></p><div class="rnav"><span class="hint">' + ic('lock', 's') + ' 남겨 주신 내용은 담당자가 확인합니다.</span><button class="btn p lg" data-act="iqSend">문의 등록 ' + ic('arrow', 's') + '</button></div></form></div></div>';
  };
  ACT.iqSend = function (el, e) {
    e.preventDefault();
    var v = function (id) { return document.getElementById(id).value.trim(); }, er = document.getElementById('iqE');
    if (!v('iqN') || v('iqN').length > 80 || !v('iqT') || v('iqT').length > 60 || !v('iqX') || v('iqX').length > 1000) { er.textContent = '이름·제목·내용을 입력해 주세요.'; return; }
    if (!/^01\d-?\d{3,4}-?\d{4}$/.test(v('iqP'))) { er.textContent = '연락처를 확인해 주세요.'; return; }
    if (!document.getElementById('iqA').checked) { er.textContent = '개인정보 수집·이용에 동의해 주세요.'; return; }
    if (v('iqQ') !== '7') { er.textContent = '자동 등록 방지 답을 확인해 주세요.'; return; }
    D.INQ.unshift({ id: 'Q' + (D.INQ.length + 12), bid: v('iqB'), cat: v('iqC'), name: v('iqN'), phone: v('iqP'), title: v('iqT'), body: v('iqX'), at: Date.now(), status: 'wait' });
    A.modal({ title: '문의가 등록되었습니다', icon: 'check', body: '<p>담당자가 확인한 뒤 남기신 연락처로 답변드립니다.</p><p class="hint mt16">체험 환경에서는 문의가 실제로 전송되지 않습니다.</p>', foot: '<button class="btn o" data-x>닫기</button><a class="btn p" href="#/" data-x>병원 홈으로</a>' });
    S.inquiry = null;
    document.getElementById('iqf').reset();
  };

  VIEWS.nf = function () { A.title = '페이지 없음'; return '<section class="sec"><div class="wrap"><div class="empty"><h2>페이지를 찾을 수 없습니다</h2><p class="mt8">주소를 확인하시거나 처음 화면으로 이동해 주세요.</p><a class="btn p mt16" href="#/">처음으로</a></div></div></section>'; };

  /* ---------- 기능 살펴보기 패널 ---------- */
  var SCN = A.SCN = [];
  A.scenario = function (o) { SCN.push(o); };
  A.demoPanel = function () {
    var el = document.getElementById('demo');
    el.innerHTML = '<div class="pn" id="demoPn"><div class="row sb"><b>체험 안내</b><span class="tiny muted">가상 데이터 · 브라우저 자동 저장</span></div>' +
      '<h5>화면 이동</h5><div class="sw"><a class="btn o sm" href="#/" data-act="demoClose">사용자 사이트</a><a class="btn o sm" href="#/admin" data-act="demoClose">관리자</a><button class="btn o sm" data-act="demoRace">' + (S.race ? '경합 시연 켜짐 ✓' : '예약 경합 시연 켜기') + '</button></div>' +
      '<h5>환자 화면</h5>' + SCN.filter(function (s) { return !s.admin; }).map(scBtn).join('') +
      '<h5>관리자 화면</h5>' + SCN.filter(function (s) { return s.admin; }).map(scBtn).join('') + '</div>' +
      '<button class="tg" data-act="demoTg" aria-expanded="false" aria-controls="demoPn">' + ic('spark') + '<span>체험 안내</span>' + ic('chev') + '</button>';
    function scBtn(s) { var i = SCN.indexOf(s); return '<button class="sc" data-act="demoRun" data-i="' + i + '"><i>' + (i + 1) + '</i><span><b>' + s.t + '</b><small>' + s.d + '</small></span></button>'; }
  };
  ACT.demoTg = function () { var d = document.getElementById('demo'); d.classList.toggle('open'); d.querySelector('.tg').setAttribute('aria-expanded', d.classList.contains('open')); };
  ACT.demoClose = function (el) { document.getElementById('demo').classList.remove('open'); go(el.getAttribute('href')); };
  ACT.demoRun = function (el) { document.getElementById('demo').classList.remove('open'); SCN[+el.dataset.i].run(); };
  ACT.demoRace = function () { S.race = !S.race; A.demoPanel(); document.getElementById('demo').classList.add('open'); A.toast(S.race ? '다음 예약 신청 직전에 다른 환자가 같은 시간을 먼저 예약하도록 설정했습니다.' : '경합 시연을 껐습니다.', 'warn'); };

  /* 동시 예약 20건 시연 — 서버가 정원을 지키는지 */
  A.raceDemo = function () {
    var bid = 'pt', did = 'im', pickS = null;
    for (var i = 1; i < 14 && !pickS; i++) { var ds = U.ymd(U.addDays(U.today(), i)), s = ENG.slots(bid, did, ds); if (!s.closed) { var x = s.list.filter(function (y) { return y.left >= 1 && !y.past; })[0]; if (x) pickS = { date: ds, t: x.t, left: x.left, cap: x.cap }; } }
    if (!pickS) return;
    var timers = [], made = [], stopped = false;
    function cleanup() { stopped = true; timers.forEach(clearTimeout); made.forEach(function(x) { var i = D.RES.indexOf(x); if (i >= 0) D.RES.splice(i,1); }); }
    var m = A.modal({ onClose:cleanup, wide: true, title: '같은 시간에 예약 20건이 동시에 들어오면?', icon: 'zap', body: '<p>평택 본원 · 내과 · <b>' + U.mdw(pickS.date) + ' ' + pickS.t + '</b> (정원 ' + pickS.cap + '명 · 남은 자리 <b>' + pickS.left + '</b>)에 20명이 동시에 「예약 신청」을 누른 상황을 재현합니다.</p><p class="small muted mt8">브라우저에서 정원 확인 규칙을 순차 실행하는 모의 시험입니다. 실제 서버·DB의 동시 요청 처리를 검증하는 시험은 아닙니다.</p><div class="race" id="race">' + Array.from({ length: 20 }, function (_, k) { return '<div id="rc' + k + '">요청 ' + U.pad(k + 1) + '</div>'; }).join('') + '</div><p class="mt16 b" id="raceRes" aria-live="polite">처리 중…</p>', foot: '<button class="btn p" data-x>확인</button>' });
    var order = Array.from({ length: 20 }, function (_, k) { return k; }).sort(function () { return Math.random() - .5; });
    var ok = 0, no = 0;
    order.forEach(function (k, idx) {
      timers.push(setTimeout(function () { if (stopped) return; var c = document.getElementById('rc' + k); if (c) c.className = 'run'; }, idx * 60));
      timers.push(setTimeout(function () {
        if (stopped) return;
        var nm = '동시요청' + U.pad(k + 1), res = ENG.book({ bid: bid, did: did, date: pickS.date, time: pickS.t, idv: { name: nm, phone: '010-9000-' + U.pad(k, 4), birth: '1990-01-01', di: U.hash(nm + '1990-01-01' + '010-9000-' + U.pad(k, 4)) } });
        var c = document.getElementById('rc' + k);
        if (res.ok) { res.res.demoTransient = true; ok++; made.push(res.res); if (c) { c.className = 'ok'; c.textContent = '요청 ' + U.pad(k + 1) + ' 접수'; } }
        else { no++; if (c) { c.className = 'no'; c.textContent = '요청 ' + U.pad(k + 1) + ' 마감'; } }
        if (ok + no === 20) { var r = document.getElementById('raceRes'); if (r) r.innerHTML = '결과: <span style="color:var(--ok)">접수 ' + ok + '건</span> · <span style="color:var(--err)">마감 안내 ' + no + '건</span> — 정원을 넘는 예약 0건'; }
      }, 400 + idx * 90));
    });

  };

  A.start = function () {
    if (A.Store) A.Store.init();
    A.demoPanel();
    render();
  };
})();
