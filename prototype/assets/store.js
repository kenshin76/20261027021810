/* This prototype's local demo storage. No server/session authentication is provided. */
(function () {
  'use strict';
  var A = window.APP, D = window.DB, U = D.U, S = A.S;
  var KEY = 'lumen-demo:2026102702:v1', POPUP_KEY = KEY + ':popup-off';
  var ready = false, resetting = false, blocked = false, timer = null, lastBody = '', warned = false;
  var status = { savedAt:null, error:'', restored:false };
  var branchIds = D.BRANCHES.map(function(b) { return b.id; });
  var deptIds = D.DEPTS.map(function(d) { return d.id; });
  var branchFields = ['tag','addr','tel','park','bus','floors'];
  var inquiryFields = ['iqB','iqC','iqN','iqP','iqT','iqX'];
  var weekdays = ['sun','mon','tue','wed','thu','fri','sat'];
  function object(x) { return !!x && typeof x === 'object' && !Array.isArray(x); }
  function text(x, max) { return typeof x === 'string' && x.length <= (max || 1000); }
  function number(x) { return typeof x === 'number' && Number.isFinite(x); }
  function check(ok) { if (!ok) throw new Error('Invalid demo snapshot'); }
  function scope(x) { return Array.isArray(x) && x.length > 0 && x.length <= 4 && new Set(x).size === x.length && x.every(function(b) { return branchIds.includes(b) || b === 'all'; }) && (!x.includes('all') || x.length === 1); }
  function rows(x, fn, unique) { check(Array.isArray(x) && x.length <= 20000); x.forEach(function(r) { check(object(r) && fn(r)); }); if (unique) check(new Set(x.map(function(r) { return r.id; })).size === x.length); return x; }
  function timeRecord(x) { return object(x) && number(x.t) && text(x.who,100) && text(x.what,2000); }
  function normalizeModel(m) {
    check(object(m));
    var out = {};
    out.branches = rows(m.branches,function(b) { return branchIds.includes(b.id) && branchFields.every(function(k) { return text(b[k], k === 'tag' ? 60 : k === 'tel' ? 20 : k === 'addr' || k === 'floors' ? 180 : 500); }) && /^(?:0\d{1,2}-\d{3,4}-\d{4}|1[568]\d{2}-\d{4})$/.test(b.tel); },true);
    check(out.branches.length === branchIds.length);
    check(object(m.branchDepts) && Object.keys(m.branchDepts).length === branchIds.length);
    out.branchDepts = {};
    branchIds.forEach(function(b) { var ds = m.branchDepts[b]; check(Array.isArray(ds) && ds.length > 0 && ds.length <= deptIds.length && new Set(ds).size === ds.length && ds.every(function(d) { return deptIds.includes(d); })); out.branchDepts[b] = ds.slice(); });
    check(object(m.schedules) && Object.keys(m.schedules).length === Object.keys(D.SCHED).length);
    out.schedules = {};
    Object.keys(D.SCHED).forEach(function(k) {
      var sc = m.schedules[k];
      check(object(sc) && object(sc.week) && Object.keys(sc.week).length === 7 && [15,20,30,60].includes(sc.interval) && Number.isInteger(sc.cap) && sc.cap >= 1 && sc.cap <= 20 && [14,30,60].includes(sc.days) && [1,2,3,24].includes(sc.cancelHours) && Number.isInteger(sc.lead) && sc.lead >= 0 && sc.lead <= 1440 && ['request','instant'].includes(sc.mode));
      var week = {};
      weekdays.forEach(function(day) { var ranges = sc.week[day]; check(Array.isArray(ranges) && ranges.length <= 24); var end = -1; week[day] = ranges.map(function(r) { check(Array.isArray(r) && r.length === 2 && U.validTime(r[0]) && U.validTime(r[1],true) && U.min(r[0]) < U.min(r[1]) && U.min(r[0]) >= end); end = U.min(r[1]); return r.slice(); }); });
      out.schedules[k] = {week:week, interval:sc.interval, cap:sc.cap, days:sc.days, lead:sc.lead, cancelHours:sc.cancelHours, mode:sc.mode};
    });
    out.reservations = rows(m.reservations,function(r) { return /^R\d+$/.test(r.id) && /^LM\d{6}-\d{4}$/.test(r.no) && branchIds.includes(r.bid) && deptIds.includes(r.did) && U.validDate(r.date) && U.validTime(r.time) && Object.hasOwn(D.STATUS,r.status) && text(r.name,80) && typeof r.phone === 'string' && /^[\d-]{10,15}$/.test(r.phone) && U.validDate(r.birth) && /^[a-f0-9]{16}$/.test(r.di) && text(r.memo,200) && number(r.created) && Array.isArray(r.hist) && r.hist.length <= 2000 && r.hist.every(timeRecord); },true);
    out.posts = rows(m.posts,function(p) { return /^P\d+$/.test(p.id) && Object.hasOwn(D.BTYPE,p.type) && scope(p.scope) && text(p.title,500) && text(p.body,100000) && number(p.at) && Number.isInteger(p.views) && p.views >= 0 && (!p.source || text(p.source,120)) && (!p.cat || text(p.cat,80)); },true);
    out.inquiries = rows(m.inquiries,function(q) { return /^Q\d+$/.test(q.id) && branchIds.includes(q.bid) && ['진료','예약','검진','서류','이용'].includes(q.cat) && text(q.name,80) && typeof q.phone === 'string' && /^[\d-]{10,15}$/.test(q.phone) && text(q.title,200) && text(q.body,5000) && number(q.at) && ['wait','done'].includes(q.status) && (!q.answer || text(q.answer,20000)) && (!q.answeredBy || text(q.answeredBy,100)) && (!q.answeredAt || number(q.answeredAt)); },true);
    out.banners = rows(m.banners,function(b) { return /^B\d+$/.test(b.id) && ['banner','popup'].includes(b.kind) && scope(b.scope) && text(b.title,60) && text(b.sub,180) && U.validDate(b.from) && U.validDate(b.to) && b.from <= b.to && ['teal','coral','navy'].includes(b.tone) && ['reserve','screening','lookup','notice','faq','inquiry','branch'].includes(b.target) && typeof b.on === 'boolean' && (!b.updatedAt || number(b.updatedAt)); },true);
    out.exceptions = rows(m.exceptions,function(e) { return /^ex[\w-]+$/.test(e.id) && U.validDate(e.date) && (e.bid === 'all' || branchIds.includes(e.bid)) && (e.did === 'all' || deptIds.includes(e.did)) && ['휴진','단축'].includes(e.type) && text(e.note,500) && (e.type !== '단축' || U.validTime(e.until)); },true);
    out.audit = rows(m.audit,function(e) { return timeRecord(e) && text(e.ip,80) && /^[\d.:-]+$/.test(e.ip) && (!e.bid || branchIds.includes(e.bid)); });
    out.weekly = rows(m.weekly,function(w) { return text(w.label,30) && branchIds.every(function(b) { return number(w[b]) && w[b] >= 0; }); });
    var e = m.environment;
    check(object(e) && ['production','staging'].includes(e.view) && /^[\w.+-]{1,80}$/.test(e.prodVersion) && /^[\w.+-]{1,80}$/.test(e.stgVersion));
    check(Array.isArray(e.backups) && e.backups.length > 0);
    rows(e.backups,function(b) { return number(b.at) && text(b.kind,120) && text(b.size,40) && typeof b.ok === 'boolean' && text(b.where,200); });
    rows(e.deploys,function(d) { return /^[\w.+-]{1,80}$/.test(d.v) && number(d.at) && ['stg','prod'].includes(d.env) && text(d.who,100) && text(d.note,2000) && object(d.checks) && typeof d.checks.qa === 'boolean'; });
    check(object(e.restoreTest) && number(e.restoreTest.at) && typeof e.restoreTest.ok === 'boolean' && text(e.restoreTest.rows,200));
    out.environment = e;
    check(U.validDate(m.seedDate) && U.validDate(m.demoExceptionDate));
    out.seedDate = m.seedDate; out.demoExceptionDate = m.demoExceptionDate;
    return out;
  }
  function replaceArray(target, source) { target.splice.apply(target,[0,target.length].concat(source)); }
  function applyModel(m) {
    m.branches.forEach(function(value) { var b = D.branch(value.id); branchFields.forEach(function(k) { b[k] = value[k]; }); });
    branchIds.forEach(function(b) { D.BRANCH_DEPTS[b] = m.branchDepts[b]; });
    Object.keys(m.schedules).forEach(function(k) { D.SCHED[k] = m.schedules[k]; });
    [[D.RES,m.reservations],[D.POSTS,m.posts],[D.INQ,m.inquiries],[D.BANNERS,m.banners],[D.EXC,m.exceptions],[D.AUDIT,m.audit],[D.WEEKLY,m.weekly]].forEach(function(pair) { replaceArray(pair[0],pair[1]); });
    D.ENV.view = m.environment.view; D.ENV.prod.version = m.environment.prodVersion; D.ENV.stg.version = m.environment.stgVersion;
    D.ENV.backups = m.environment.backups; D.ENV.deploys = m.environment.deploys; D.ENV.restoreTest = m.environment.restoreTest;
    D.T0 = U.parse(m.seedDate); D.DEMO_EXC = m.demoExceptionDate; D.syncCounters();
  }
  function model() {
    return {branches:D.BRANCHES.map(function(b) { var value = {id:b.id}; branchFields.forEach(function(k) { value[k] = b[k]; }); return value; }), branchDepts:D.BRANCH_DEPTS, schedules:D.SCHED,
      reservations:D.RES.filter(function(r) { return !r.demoTransient; }), posts:D.POSTS, inquiries:D.INQ, banners:D.BANNERS, exceptions:D.EXC, audit:D.AUDIT, weekly:D.WEEKLY,
      environment:{view:D.ENV.view,prodVersion:D.ENV.prod.version,stgVersion:D.ENV.stg.version,backups:D.ENV.backups,deploys:D.ENV.deploys,restoreTest:D.ENV.restoreTest}, seedDate:U.ymd(D.T0), demoExceptionDate:D.DEMO_EXC};
  }
  function session() {
    var r = S.rsv;
    return {admin:S.admin,fs:S.fs,inquiry:S.inquiry || null,reservation:r ? {step:r.step,bid:r.bid,did:r.did,date:r.date,time:r.time,first:r.first,memo:r.memo,doneId:r.done ? r.done.id : null} : null};
  }
  function restoreSession(saved) {
    saved = object(saved) ? saved : {};
    S.admin = D.ADMINS.some(function(a) { return a.id === saved.admin; }) ? saved.admin : null;
    S.fs = [15,16,18].includes(saved.fs) ? saved.fs : 16;
    S.me = null; S.race = false; S.lastRes = null; S.inquiry = null;
    if (object(saved.inquiry)) { var draft = {}; inquiryFields.forEach(function(k) { if (text(saved.inquiry[k],k === 'iqX' ? 1000 : 200)) draft[k] = saved.inquiry[k]; }); if (draft.iqB && !branchIds.includes(draft.iqB)) delete draft.iqB; if (draft.iqC && !['진료','예약','검진','서류','이용'].includes(draft.iqC)) delete draft.iqC; S.inquiry = draft; }
    var r = saved.reservation;
    if (!object(r)) return;
    var bid = branchIds.includes(r.bid) ? r.bid : null, did = bid && D.BRANCH_DEPTS[bid].includes(r.did) ? r.did : null;
    var date = did && U.validDate(r.date) && !A.ENG.slots(bid,did,r.date).closed ? r.date : null;
    var time = date && U.validTime(r.time) && A.ENG.slots(bid,did,date).list.some(function(s) { return s.t === r.time && !s.past && s.left > 0; }) ? r.time : null;
    var done = typeof r.doneId === 'string' ? D.res(r.doneId) : null;
    S.rsv = {step:done ? 4 : Math.min(Number.isInteger(r.step) ? Math.max(0,r.step) : 0, time ? 3 : did ? 2 : bid ? 1 : 0),bid:done ? done.bid : bid,did:done ? done.did : did,date:done ? done.date : date,time:done ? done.time : time,first:r.first === 're' ? 're' : 'first',memo:text(r.memo,200) ? r.memo : '',agree:false,sens:false,idv:null,mon:null,done:done,err:''};
  }
  function paint() {
    document.querySelectorAll('[data-demo-storage]').forEach(function(el) { el.textContent = status.error || (status.savedAt ? '이 브라우저에 자동 저장됨 · ' + U.dt(status.savedAt) : '이 브라우저에 체험 데이터를 자동 저장합니다.'); });
  }
  function fail(message) { status.error = message; paint(); if (!warned && ready) { warned = true; A.toast(message,'warn'); } return false; }
  var Store = A.Store = {
    key:KEY, popupKey:POPUP_KEY, status:status,
    init:function() {
      if (ready) return;
      try {
        var raw = localStorage.getItem(KEY);
        if (raw) {
          check(raw.length < 4000000);
          var data = JSON.parse(raw); check(object(data) && data.version === 1 && number(data.savedAt));
          var clean = normalizeModel(data.data); // Validate all records before changing live data.
          applyModel(clean); restoreSession(data.session); status.savedAt = data.savedAt; status.restored = true;
        }
      } catch(error) { blocked = true; status.error = '저장된 체험 데이터를 읽지 못했습니다. 초기화 후 다시 이용해 주세요.'; }
      ready = true; document.documentElement.style.setProperty('--fs',S.fs + 'px');
      try { S.popupOff = localStorage.getItem(POPUP_KEY) === U.ymd(new Date()); } catch(error) { status.error = '브라우저 저장소를 사용할 수 없습니다. 현재 화면의 내용만 유지됩니다.'; }
      paint();
    },
    save:function() {
      if (!ready || resetting || blocked) return false;
      clearTimeout(timer); timer = null;
      try {
        var body = {version:1,data:model(),session:session()};
        normalizeModel(body.data);
        var encoded = JSON.stringify(body);
        if (encoded === lastBody) return true;
        check(encoded.length < 4000000);
        body.savedAt = Date.now(); var payload = JSON.stringify(body); check(payload.length < 4000000); localStorage.setItem(KEY,payload);
        lastBody = encoded; status.savedAt = body.savedAt; status.error = ''; warned = false; paint(); return true;
      } catch(error) { return fail('브라우저에 저장하지 못했습니다. 새로고침하면 최근 변경 내용이 사라질 수 있습니다.'); }
    },
    schedule:function() { if (!ready || resetting || blocked) return; clearTimeout(timer); timer = setTimeout(Store.save,180); },
    reset:function() {
      clearTimeout(timer); timer = null;
      try { localStorage.removeItem(KEY); localStorage.removeItem(POPUP_KEY); }
      catch(error) { return fail('저장소 접근이 제한되어 초기화하지 못했습니다. 브라우저 저장소 설정을 확인해 주세요.'); }
      resetting = true; S.admin = null; S.me = null; S.rsv = null; S.inquiry = null; S.lastRes = null; S.race = false; S.popupOff = false;
      history.replaceState(null,'','#/admin/login'); location.reload(); return true;
    }
  };
  A.ACT.demoReset = function() { A.confirm('체험 데이터를 초기화할까요?','<p>이 프로토타입에서 저장한 예약·문의·설정·게시물·처리 이력과 로그인 상태를 처음으로 되돌립니다.</p><p class="hint mt12">다른 사이트의 저장 데이터에는 영향을 주지 않습니다.</p>','초기화',Store.reset,true); };
  A.afterRender.push(function() {
    if (S.inquiry && A.parse().p[0] === 'inquiry') inquiryFields.forEach(function(k) { var el = document.getElementById(k); if (el && typeof S.inquiry[k] === 'string') el.value = S.inquiry[k]; });
    paint(); Store.schedule();
  });
  function changed(event) {
    if (A.parse().p[0] === 'inquiry' && event.target && inquiryFields.includes(event.target.id)) {
      S.inquiry = {}; inquiryFields.forEach(function(k) { var el = document.getElementById(k); if (el) S.inquiry[k] = el.value; });
    }
    Store.schedule();
  }
  document.addEventListener('input',changed); document.addEventListener('change',changed); document.addEventListener('click',Store.schedule);
  window.addEventListener('pagehide',Store.save); window.addEventListener('beforeunload',Store.save);
  document.addEventListener('visibilitychange',function() { if (document.visibilityState === 'hidden') Store.save(); });
  window.addEventListener('storage',function(event) { if (event.key === KEY && event.newValue === null && ready && !resetting) { resetting = true; clearTimeout(timer); S.admin = null; S.me = null; history.replaceState(null,'','#/admin/login'); location.reload(); } });
})();
