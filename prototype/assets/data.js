/* 루멘병원 — 시연용 가상 데이터. 병원·지점·의료진·환자·게시물·수치는 모두 가상입니다. */
(function () {
  'use strict';

  /* ---------- 유틸 ---------- */
  var U = {
    pad: function (n, l) { n = String(n); while (n.length < (l || 2)) n = '0' + n; return n; },
    ymd: function (d) { d = new Date(d); return d.getFullYear() + '-' + U.pad(d.getMonth() + 1) + '-' + U.pad(d.getDate()); },
    parse: function (s) { var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); },
    addDays: function (d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; },
    validDate: function (s) { if (!/^\d{4}-\d{2}-\d{2}$/.test(s || '')) return false; var d = U.parse(s); return Number.isFinite(d.getTime()) && U.ymd(d) === s; },
    validTime: function (s, end) { return /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(s || '') || (!!end && s === '24:00'); },
    person: function (n, birth, phone) { n = String(n || '').trim(); var b = String(birth || '').replace(/-/g, ''), p = String(phone || '').replace(/\D/g, ''); var ds = b.slice(0,4) + '-' + b.slice(4,6) + '-' + b.slice(6); if (n.length < 2 || n.length > 40 || !/^(19|20)\d{6}$/.test(b) || !U.validDate(ds) || ds > U.ymd(new Date()) || !/^010\d{8}$/.test(p)) return null; var ph = p.slice(0,3) + '-' + p.slice(3,7) + '-' + p.slice(7); return { name:n, birth:ds, phone:ph, di:U.hash(n + ds + ph) }; },
    today: function () { var d = new Date(); d.setHours(0, 0, 0, 0); return d; },
    dow: function (d) { return ['일', '월', '화', '수', '목', '금', '토'][new Date(d).getDay()]; },
    md: function (d) { d = typeof d === 'string' ? U.parse(d) : new Date(d); return (d.getMonth() + 1) + '.' + U.pad(d.getDate()); },
    mdw: function (d) { d = typeof d === 'string' ? U.parse(d) : new Date(d); return (d.getMonth() + 1) + '월 ' + d.getDate() + '일 (' + U.dow(d) + ')'; },
    date: function (d) { d = typeof d === 'string' ? U.parse(d) : new Date(d); return d.getFullYear() + '.' + U.pad(d.getMonth() + 1) + '.' + U.pad(d.getDate()); },
    dt: function (t) { var d = new Date(t); return U.date(d) + ' ' + U.pad(d.getHours()) + ':' + U.pad(d.getMinutes()); },
    hm: function (t) { var d = new Date(t); return U.pad(d.getHours()) + ':' + U.pad(d.getMinutes()); },
    min: function (s) { var p = s.split(':'); return +p[0] * 60 + +p[1]; },
    tm: function (m) { return U.pad(Math.floor(m / 60)) + ':' + U.pad(m % 60); },
    esc: function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); },
    maskName: function (n) { n = String(n); return n.length <= 2 ? n[0] + '*' : n[0] + '*'.repeat(n.length - 2) + n[n.length - 1]; },
    maskPhone: function (p) { var n = String(p || '').replace(/\D/g, ''); if (n.length !== 10 && n.length !== 11) return '***'; return n.slice(0,3) + '-' + '*'.repeat(n.length - 7) + '-' + n.slice(-4); },
    hash: function (s) { var h1 = 0x811c9dc5, h2 = 0x01000193; s = String(s); for (var i = 0; i < s.length; i++) { h1 ^= s.charCodeAt(i); h1 = Math.imul(h1, 16777619) >>> 0; h2 = Math.imul(h2 ^ s.charCodeAt(i), 2246822507) >>> 0; } return (h1.toString(16) + h2.toString(16)).padStart(16, '0'); },
    ago: function (t) { var s = Math.floor((Date.now() - t) / 1000); if (s < 60) return '방금 전'; if (s < 3600) return Math.floor(s / 60) + '분 전'; if (s < 86400) return Math.floor(s / 3600) + '시간 전'; return Math.floor(s / 86400) + '일 전'; }
  };

  /* 결정적 난수 (시연 데이터가 매번 같게) */
  var seed = 20261027;
  function rnd() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }
  function pick(a) { return a[Math.floor(rnd() * a.length)]; }

  var T0 = U.today();
  var NOW = Date.now();

  /* ---------- 병원·지점 ---------- */
  var HOSP = { name: '루멘병원', en: 'LUMEN HOSPITAL', slogan: '가까운 곳에서, 끝까지 함께', tel: '1600-0000', domain: 'www.lumen-hospital.example' };

  var BRANCHES = [
    { id: 'pt', name: '평택 본원', short: '평택', tag: '종합 진료 · 건강검진센터', addr: '경기도 평택시 루멘대로 100 (가상 주소)', tel: '031-000-1000', floors: 'B2~10F', park: '지하 2층·지상 주차 120대', bus: '루멘병원 정류장 하차 도보 1분', color: '#315F59', night: 'wed', lat: 42, lng: 38 },
    { id: 'dt', name: '동탄점', short: '동탄', tag: '척추·관절 · 재활', addr: '경기도 화성시 동탄루멘로 21 (가상 주소)', tel: '031-000-2000', floors: '3~7F', park: '건물 지하 주차 2시간 무료', bus: '동탄역 3번 출구 도보 5분', color: '#506A7B', night: 'thu', lat: 30, lng: 56 },
    { id: 'as', name: '안성점', short: '안성', tag: '내과 · 소아청소년', addr: '경기도 안성시 중앙루멘길 7 (가상 주소)', tel: '031-000-3000', floors: '1~5F', park: '병원 전용 주차 40대', bus: '안성터미널 도보 7분', color: '#647A58', night: null, lat: 60, lng: 64 },
    { id: 'ca', name: '천안점', short: '천안', tag: '소화기 · 내시경센터', addr: '충청남도 천안시 루멘로 55 (가상 주소)', tel: '041-000-4000', floors: '2~8F', park: '건물 주차장 3시간 무료', bus: '천안아산역 셔틀 15분', color: '#876B54', night: 'tue', lat: 76, lng: 30 }
  ];

  /* ---------- 진료과 ---------- */
  var DEPTS = [
    { id: 'im', name: '내과', en: 'Internal Medicine', icon: 'steth', desc: '고혈압·당뇨·갑상선 등 만성질환을 꾸준히 관리하고, 검사 결과를 알기 쉽게 설명해 드립니다.', items: ['고혈압·당뇨·고지혈증', '갑상선 질환', '호흡기·감기·폐렴', '빈혈·피로 클리닉'], equip: ['초음파', '심전도', '폐기능 검사'] },
    { id: 'gi', name: '소화기내과', en: 'Gastroenterology', icon: 'scope', desc: '수면 위·대장 내시경 검사와 소화기 질환 진료를 한곳에서 받으실 수 있으며, 당일 결과 상담도 진행합니다.', items: ['위·대장 내시경', '역류성 식도염', '과민성 장증후군', '간 질환·지방간'], equip: ['고화질 내시경', '복부 초음파', '내시경 소독 시스템'] },
    { id: 'os', name: '정형외과', en: 'Orthopedics', icon: 'bone', desc: '어깨·무릎·손목의 통증부터 스포츠 손상까지, 비수술 치료를 우선으로 정확하게 진단합니다.', items: ['어깨 통증·오십견', '무릎 관절염·연골 손상', '손목·발목 염좌', '골절·스포츠 손상'], equip: ['디지털 X-ray', '근골격 초음파', '체외충격파'] },
    { id: 'ns', name: '신경외과', en: 'Neurosurgery', icon: 'spine', desc: '목·허리 디스크와 척추 질환을 영상 검사로 정밀하게 진단하고 단계별 치료를 제안합니다.', items: ['목·허리 디스크', '척추관 협착증', '두통·어지럼증', '신경차단술'], equip: ['MRI', 'C-arm 영상장비', '신경전도 검사'] },
    { id: 're', name: '재활의학과', en: 'Rehabilitation', icon: 'walk', desc: '수술 후·통증 재활과 도수치료를 전담 치료사와 1:1로 진행해 일상 회복을 돕습니다.', items: ['도수치료·운동치료', '수술 후 재활', '자세 교정', '통증 재활'], equip: ['재활 운동실', '도수치료실', '물리치료 장비'] },
    { id: 'pd', name: '소아청소년과', en: 'Pediatrics', icon: 'kid', desc: '영유아 검진과 예방접종, 성장 상담까지. 아이 눈높이에 맞춘 진료 공간을 준비했습니다.', items: ['영유아 건강검진', '예방접종', '성장·발달 상담', '알레르기·비염'], equip: ['소아 전용 진료실', '수유실', '격리 대기 공간'] },
    { id: 'en', name: '이비인후과', en: 'Otolaryngology', icon: 'ear', desc: '비염·축농증과 어지럼증, 청력 검사까지 정밀 장비로 원인을 찾아 치료합니다.', items: ['비염·축농증', '중이염·청력 저하', '어지럼증', '편도·목 질환'], equip: ['내시경 진단기', '청력 검사실', '전정기능 검사'] },
    { id: 'hc', name: '건강검진센터', en: 'Health Screening', icon: 'heart', desc: '생애주기별 맞춤 검진과 기업 검진. 결과는 전문의가 직접 상담해 드립니다.', items: ['국가 건강검진', '종합 건강검진', '기업 단체 검진', '맞춤 추가 검사'], equip: ['CT·초음파', '골밀도 검사', '검진 전용 동선'] }
  ];

  /* 지점별 운영 진료과 (관리자에서 변경하면 사이트 메뉴·예약이 함께 바뀜) */
  var BRANCH_DEPTS = {
    pt: ['im', 'gi', 'os', 'ns', 're', 'pd', 'en', 'hc'],
    dt: ['os', 'ns', 're', 'im', 'en'],
    as: ['im', 'pd', 'en', 'gi', 'hc'],
    ca: ['gi', 'im', 'hc', 'os', 'pd']
  };

  /* ---------- 의료진 ---------- */
  var DOC_NAMES = ['김도윤', '이서준', '박지안', '최하린', '정민재', '강서윤', '윤태오', '임채원', '한지호', '오유나', '서재현', '신다인', '권우진', '황보람', '조은호', '송가온', '유하준', '문소율', '배시우', '장예린', '남궁현', '홍서아', '전이안', '고나연'];
  var DOCTORS = [];
  var di = 0;
  BRANCHES.forEach(function (b) {
    BRANCH_DEPTS[b.id].forEach(function (d, k) {
      var n = (b.id === 'pt' && k < 3) ? 2 : 1;
      for (var i = 0; i < n; i++) {
        var dep = DEPTS.filter(function (x) { return x.id === d; })[0];
        DOCTORS.push({
          id: 'dr' + (++di), bid: b.id, did: d, name: DOC_NAMES[(di * 7) % DOC_NAMES.length],
          title: i === 0 && b.id === 'pt' ? (k === 0 ? '병원장' : '진료부장') : (i === 0 ? '과장' : '전문의'),
          spec: dep.items.slice(0, 2).join(' · '),
          off: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'][(di * 3) % 6] /* 휴진 요일(오후) */
        });
      }
    });
  });

  /* ---------- 예약 스케줄 (지점·진료과별) ---------- */
  function baseWeek(b, d) {
    var am = [['09:00', '12:30']], pm = [['14:00', '18:00']];
    var w = { sun: [], mon: am.concat(pm), tue: am.concat(pm), wed: am.concat(pm), thu: am.concat(pm), fri: am.concat(pm), sat: [['09:00', '13:00']] };
    if (b.night) w[b.night] = am.concat([['14:00', '20:00']]);
    if (d === 'hc') { w.sat = [['08:00', '12:00']]; ['mon', 'tue', 'wed', 'thu', 'fri'].forEach(function (k) { w[k] = [['08:00', '12:00'], ['13:30', '16:00']]; }); }
    return w;
  }
  var SCHED = {};
  BRANCHES.forEach(function (b) {
    DEPTS.forEach(function (d) {
      SCHED[b.id + ':' + d.id] = {
        week: baseWeek(b, d.id),
        interval: d.id === 'hc' ? 30 : (d.id === 're' ? 60 : 30),
        cap: d.id === 'os' || d.id === 're' ? 3 : (d.id === 'hc' ? 4 : 2),
        days: 30,         /* 예약 가능 기간(일) */
        lead: 60,         /* 당일 예약은 지금부터 60분 이후 */
        cancelHours: 2,   /* 진료 2시간 전까지 온라인 취소 */
        mode: 'request'   /* request: 신청 후 병원 확정 / instant: 즉시 확정 */
      };
    });
  });

  /* 휴진·예외 일정 */
  var HOLI = [['2026-12-25', '성탄절'], ['2027-01-01', '신정'], ['2027-03-01', '삼일절'], ['2026-11-03', '병원 내부 점검']];
  var EXC = HOLI.filter(function (h) { return h[1] !== '병원 내부 점검'; }).map(function (h, i) { return { id: 'ex' + (i + 1), date: h[0], bid: 'all', did: 'all', type: '휴진', note: h[1] }; });
  EXC.push({ id:'ex-yearend', date:'2026-12-31', bid:'all', did:'all', type:'단축', until:'13:00', note:'연말 단축 진료' });
  EXC.push({ id:'ex-screening', date:'2026-12-31', bid:'all', did:'hc', type:'휴진', note:'건강검진센터 연말 휴무' });
  EXC.push({ id: 'ex90', date: U.ymd(U.addDays(T0, 19)), bid: 'dt', did: 'ns', type: '단축', until: '12:30', note: '학회 참석 — 오후 휴진' });

  /* ---------- 예약 (가상 환자) ---------- */
  var FAM = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임', '한', '오', '서', '신', '권', '황', '안', '송', '전', '홍'];
  var GIV = ['민준', '서연', '지호', '하은', '도현', '지우', '예준', '수아', '시우', '지아', '주원', '하윤', '건우', '서윤', '우진', '채원', '현우', '유진', '선우', '다은', '정훈', '미경', '영수', '순자', '경희', '상철'];
  var RES = [];
  var rseq = 1000;
  function mkRes(o) {
    var r = {
      id: 'R' + (++rseq), no: 'LM' + U.ymd(o.created || NOW).replace(/-/g, '').slice(2) + '-' + U.pad(rseq % 10000, 4),
      bid: o.bid, did: o.did, date: o.date, time: o.time,
      name: o.name, phone: o.phone, birth: o.birth, di: o.di, memo: o.memo || '', first: !!o.first,
      status: o.status, created: o.created || NOW, hist: o.hist || []
    };
    if (!r.hist.length) r.hist.push({ t: r.created, who: '환자(온라인)', what: '예약 신청' });
    RES.push(r);
    return r;
  }
  function slotTimes(sc, dateStr) {
    if (!sc || !U.validDate(dateStr) || !Number.isInteger(sc.interval) || sc.interval < 1 || sc.interval > 1440) return [];
    var w = sc.week[['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][U.parse(dateStr).getDay()]] || [], out = [];
    w.forEach(function (rg) { if (!U.validTime(rg[0]) || !U.validTime(rg[1], true)) return; for (var m = U.min(rg[0]); m + sc.interval <= U.min(rg[1]); m += sc.interval) { var t = U.tm(m); if (out.indexOf(t) < 0) out.push(t); } });
    return out.sort();
  }
  for (var dd = -21; dd <= 14; dd++) {
    var day = U.addDays(T0, dd), ds = U.ymd(day);
    if (day.getDay() === 0 || HOLI.some(function (h) { return h[0] === ds; })) continue;
    BRANCHES.forEach(function (b) {
      var n = b.id === 'pt' ? 9 : 5;
      if (dd > 7) n = Math.max(1, Math.floor(n / 3));
      for (var i = 0; i < n; i++) {
        var did = pick(BRANCH_DEPTS[b.id]);
        var sc = SCHED[b.id + ':' + did];
        var times = slotTimes(sc, ds);
        if (!times.length) continue;
        var tm = pick(times);
        var nm = pick(FAM) + pick(GIV);
        var ph = '010-' + U.pad(Math.floor(rnd() * 9000) + 1000, 4) + '-' + U.pad(Math.floor(rnd() * 9000) + 1000, 4);
        var birth = (1950 + Math.floor(rnd() * 66)) + '-' + U.pad(1 + Math.floor(rnd() * 12)) + '-' + U.pad(1 + Math.floor(rnd() * 28));
        var used = RES.filter(function (x) { return x.bid === b.id && x.did === did && x.date === ds && x.time === tm && x.status !== 'cancel'; }).length;
        if (used >= sc.cap) continue;
        var st;
        if (dd < 0) { var q = rnd(); st = q < 0.78 ? 'done' : (q < 0.9 ? 'cancel' : 'noshow'); }
        else if (dd === 0) { st = rnd() < 0.7 ? 'confirm' : 'request'; }
        else { st = rnd() < (dd < 3 ? 0.85 : 0.75) ? 'confirm' : 'request'; if (rnd() < 0.06) st = 'cancel'; }
        var cr = U.addDays(day, -(1 + Math.floor(rnd() * 6))).getTime() + Math.floor(rnd() * 36e6) + 32e6;
        if (cr > NOW) cr = NOW - Math.floor(rnd() * 72e5) - 6e5;
        mkRes({ bid: b.id, did: did, date: ds, time: tm, name: nm, phone: ph, birth: birth, di: U.hash(nm + birth + ph), status: st, created: cr, first: rnd() < 0.35 });
      }
    });
  }
  /* 시연 환자(조회·취소 시나리오) */
  var DEMO_P = { name: '정하늘', birth: '1988-04-12', phone: '010-2468-1357' };
  DEMO_P.di = U.hash(DEMO_P.name + DEMO_P.birth + DEMO_P.phone);
  (function () {
    ['os', 'hc'].forEach(function(did, k) {
      for (var offset = k ? 9 : 3; offset < 30; offset++) {
        var date = U.ymd(U.addDays(T0, offset));
        if (EXC.some(function(e) { return e.date === date && e.type === '휴진' && (e.bid === 'all' || e.bid === 'pt') && (e.did === 'all' || e.did === did); })) continue;
        var sc = SCHED['pt:' + did], times = slotTimes(sc, date);
        var time = times.filter(function(t) { return RES.filter(function(r) { return r.bid === 'pt' && r.did === did && r.date === date && r.time === t && r.status !== 'cancel'; }).length < sc.cap; })[0];
        if (!time) continue;
        mkRes({ bid:'pt', did:did, date:date, time:time, name:DEMO_P.name, phone:DEMO_P.phone, birth:DEMO_P.birth, di:DEMO_P.di, status:k ? 'request' : 'confirm', created:NOW - 2 * 864e5, memo:k ? '' : '오른쪽 무릎 통증' });
        break;
      }
    });
  })();
  /* 휴진 등록 충돌 시연용: 동탄점 신경외과 12일 뒤 오후 예약 */
  var DEMO_EXC = U.addDays(T0, 12);
  while (DEMO_EXC.getDay() === 0 || DEMO_EXC.getDay() === 6 || HOLI.some(function (h) { return h[0] === U.ymd(DEMO_EXC); })) DEMO_EXC = U.addDays(DEMO_EXC, 1);
  (function () {
    var d = DEMO_EXC;
    mkRes({ bid: 'dt', did: 'ns', date: U.ymd(d), time: '15:00', name: '류민호', phone: '010-5521-3390', birth: '1971-09-03', di: U.hash('류민호'), status: 'confirm', created: NOW - 3 * 864e5 });
  })();

  /* ---------- 게시판 ---------- */
  var POSTS = [];
  var pseq = 100;
  function post(o) { o.id = 'P' + (++pseq); o.views = o.views || Math.floor(rnd() * 900) + 40; POSTS.push(o); return o; }
  post({ type: 'notice', scope: ['all'], pin: true, title: '연말연시 진료 일정 안내', at: NOW - 2 * 864e5, body: '12월 25일(성탄절)과 1월 1일(신정)은 전 지점 휴진합니다. 12월 31일은 오후 1시까지 진료하며, 건강검진센터는 12월 31일 휴무입니다.\n\n휴진일에는 온라인 예약이 열리지 않으며, 응급 상황 시 가까운 응급의료기관을 이용해 주세요.' });
  post({ type: 'notice', scope: ['all'], title: '독감·코로나19 예방접종 시작 안내', at: NOW - 9 * 864e5, body: '전 지점에서 인플루엔자·코로나19 예방접종을 시작합니다. 접종 대상과 일정은 지점별로 다를 수 있으니 방문 전 확인해 주세요.' });
  post({ type: 'notice', scope: ['dt'], pin: true, title: '[동탄점] 지하 주차장 도색 공사 안내', at: NOW - 4 * 864e5, body: '11월 둘째 주 주말 동안 지하 주차장 도색 공사가 진행됩니다. 공사 기간에는 인근 공영주차장을 이용해 주시고, 주차권은 원무과에서 발급해 드립니다.' });
  post({ type: 'notice', scope: ['ca'], title: '[천안점] 내시경센터 확장 이전', at: NOW - 15 * 864e5, body: '천안점 내시경센터가 4층으로 확장 이전했습니다. 회복실이 넓어지고 보호자 대기 공간이 새로 마련되었습니다.' });
  post({ type: 'notice', scope: ['as', 'pt'], title: '평택 본원 소아청소년과 야간 진료 안내', at: NOW - 21 * 864e5, body: '평택 본원 소아청소년과는 수요일에 야간 진료를 운영합니다. 방문 전 해당 지점의 진료시간과 예약 가능 시간을 확인해 주세요.' });
  post({ type: 'notice', scope: ['pt'], title: '[평택 본원] 신규 MRI 장비 가동 안내', at: NOW - 28 * 864e5, body: '평택 본원 영상의학 검사실에 신규 MRI 장비가 가동되었습니다. 검사 대기 시간이 줄고 검사 소음도 낮아졌습니다.' });
  post({ type: 'press', scope: ['all'], title: '루멘병원, 지역 주민 대상 무료 건강강좌 개최', at: NOW - 6 * 864e5, source: '가상일보', body: '루멘병원은 매월 셋째 주 토요일 지역 주민을 대상으로 만성질환 관리와 바른 자세를 주제로 한 무료 건강강좌를 열고 있다.' });
  post({ type: 'press', scope: ['ca'], title: '천안점 내시경센터, 소독 관리 우수 기관 선정 (가상 기사)', at: NOW - 19 * 864e5, source: '가상메디컬', body: '루멘병원 천안점 내시경센터가 내시경 소독 관리 평가에서 우수 기관으로 선정됐다.' });
  post({ type: 'press', scope: ['dt'], title: '동탄점, 척추 비수술 치료 프로그램 운영 (가상 기사)', at: NOW - 33 * 864e5, source: '가상헬스뉴스', body: '루멘병원 동탄점은 척추 질환 환자를 위한 단계별 비수술 치료 프로그램을 운영하고 있다.' });
  post({ type: 'press', scope: ['all'], title: '루멘병원, 4개 지점 통합 온라인 예약 오픈 (가상 기사)', at: NOW - 1 * 864e5, source: '가상일보', body: '루멘병원이 4개 지점의 진료 예약을 하나의 홈페이지에서 할 수 있는 통합 온라인 예약 서비스를 시작했다.' });
  var FAQ = [
    ['예약', '회원가입 없이 예약할 수 있나요?', '네. 회원가입 없이 휴대폰 본인인증만으로 예약하실 수 있고, 같은 본인인증으로 예약 조회·취소도 하실 수 있습니다.'],
    ['예약', '예약을 변경하고 싶어요.', '온라인에서는 기존 예약을 취소한 뒤 다시 예약해 주세요. 진료 2시간 전까지 온라인 취소가 가능하며, 이후에는 지점 대표번호로 연락해 주세요.'],
    ['예약', '온라인 예약은 언제 확정되나요?', '진료과에 따라 예약 신청 후 병원에서 확인해 확정합니다. 예약 조회 화면에서 확정 여부를 확인하실 수 있습니다.'],
    ['진료', '처음 방문할 때 무엇을 준비하나요?', '신분증과 복용 중인 약 목록을 준비해 주세요. 다른 병원 검사 결과가 있다면 함께 가져오시면 진료에 도움이 됩니다.'],
    ['진료', '보호자가 대신 예약할 수 있나요?', '온라인 예약은 진료받으실 분의 본인인증으로 진행합니다. 보호자 대리 예약이나 미성년 자녀의 예약은 방문하실 지점에 전화로 문의해 주세요.'],
    ['이용', '주차는 무료인가요?', '지점마다 주차 조건이 다릅니다. 각 지점 홈의 「오시는 길」에서 주차 안내를 확인해 주세요.'],
    ['서류', '진단서·진료비 영수증은 어떻게 발급받나요?', '진료 당일 원무과에서 발급받으실 수 있습니다. 대리 발급 시 필요한 서류는 원무과에 문의해 주세요.']
  ];
  FAQ.forEach(function (f, i) { post({ type: 'faq', scope: ['all'], cat: f[0], title: f[1], body: f[2], at: NOW - (40 + i) * 864e5, order: i }); });

  /* ---------- 문의 ---------- */
  var INQ = [
    { id: 'Q11', bid: 'pt', cat: '진료', name: '박서연', phone: '010-3344-1122', title: '도수치료 실비 보험 서류 문의', body: '도수치료 받은 후 실비 청구할 때 어떤 서류가 필요한지 궁금합니다.', at: NOW - 3 * 36e5, status: 'wait' },
    { id: 'Q10', bid: 'dt', cat: '예약', name: '김태훈', phone: '010-8811-4545', title: '토요일 오후 진료 가능한가요?', body: '토요일 오후에 MRI 촬영이 가능한지 문의드립니다.', at: NOW - 20 * 36e5, status: 'wait' },
    { id: 'Q9', bid: 'ca', cat: '검진', name: '이순자', phone: '010-2299-7766', title: '대장내시경 약 복용 방법', body: '검사 전날 약 복용 시간이 헷갈립니다.', at: NOW - 30 * 36e5, status: 'done', answer: '검사 안내문의 복용 시간표를 문자로 다시 보내 드렸습니다. 궁금하신 점은 내시경센터로 연락 주세요.', answeredAt: NOW - 26 * 36e5, answeredBy: '천안점 관리자' },
    { id: 'Q8', bid: 'as', cat: '이용', name: '최민아', phone: '010-5050-2020', title: '수유실 위치 문의', body: '소아과 방문 시 수유실을 이용할 수 있나요?', at: NOW - 52 * 36e5, status: 'done', answer: '2층 소아청소년과 옆에 수유실이 있습니다.', answeredAt: NOW - 50 * 36e5, answeredBy: '안성점 관리자' },
    { id: 'Q7', bid: 'pt', cat: '서류', name: '정우성', phone: '010-7171-9090', title: '진료기록 사본 발급', body: '타 병원 제출용 진료기록 사본 발급 절차가 궁금합니다.', at: NOW - 75 * 36e5, status: 'wait' }
  ];

  /* ---------- 배너·팝업 ---------- */
  var BANNERS = [
    { id: 'B1', kind: 'banner', target:'reserve', scope: ['all'], title: '4개 지점 통합 온라인 예약', sub: '회원가입 없이 본인인증만으로 예약하세요', from: U.ymd(U.addDays(T0, -10)), to: U.ymd(U.addDays(T0, 60)), on: true, tone: 'teal' },
    { id: 'B2', kind: 'banner', target:'screening', scope: ['pt', 'as', 'ca'], title: '건강검진 예약 오픈', sub: '연말 검진 혼잡 전, 미리 예약하세요', from: U.ymd(U.addDays(T0, -5)), to: U.ymd(U.addDays(T0, 30)), on: true, tone: 'coral' },
    { id: 'B3', kind: 'popup', target:'notice', scope: ['all'], title: '연말연시 진료 안내', sub: '12/25·1/1 전 지점 휴진 · 12/31 오후 1시까지', from: U.ymd(U.addDays(T0, -2)), to: U.ymd(U.addDays(T0, 70)), on: true, tone: 'navy' }
  ];

  /* ---------- 관리자 ---------- */
  var ADMINS = [
    { id: 'a_all', name: '최은서', role: 'super', bid: null, label: '전체 관리자', ip: '211.000.10.21' },
    { id: 'a_pt', name: '박지훈', role: 'branch', bid: 'pt', label: '평택 본원 관리자', ip: '211.000.10.34' },
    { id: 'a_dt', name: '이수민', role: 'branch', bid: 'dt', label: '동탄점 관리자', ip: '121.000.4.18' }
  ];
  ADMINS.forEach(function (a, i) { a.email = ['admin@demo.lumen', 'pyeongtaek@demo.lumen', 'dongtan@demo.lumen'][i]; a.password = ['lumen2026', 'pt2026', 'dt2026'][i]; });
  var AUDIT = [
    { t: NOW - 26 * 6e4, who: '박지훈', what: '예약 R1088 상태 변경 (신청 → 확정)', ip: '211.000.10.34' },
    { t: NOW - 90 * 6e4, who: '최은서', what: '게시글 「연말연시 진료 일정 안내」 수정 (노출: 전 지점)', ip: '211.000.10.21' },
    { t: NOW - 5 * 36e5, who: '이수민', what: '관리자 로그인', ip: '121.000.4.18' },
    { t: NOW - 26 * 36e5, who: '최은서', what: '예약자 상세 열람 — 사유: 예약 시간 변경 전화 안내', ip: '211.000.10.21' },
    { t: NOW - 49 * 36e5, who: '알 수 없음', what: '관리자 로그인 실패 3회 — 허용되지 않은 IP(203.000.77.5) 차단', ip: '203.000.77.5', warn: true }
  ];

  /* ---------- 운영 환경 (NCP) ---------- */
  var ENV = {
    view: 'production',
    prod: { label: 'Production', domain: HOSP.domain, web: 'Standard 2vCPU / 8GB · web-prod-01', db: 'Standard 2vCPU / 8GB · db-prod-01 · MySQL 8', net: 'VPC lumen-prod · 웹 서브넷(공개) / DB 서브넷(내부)', acg: ['80·443 → 전체 허용', '22(SSH) → 귀사·당사 지정 IP', '3306(DB) → web-prod-01만', '/admin → 지정 IP만 (Nginx)'], ssl: { kind: '자동 갱신 인증서', exp: U.ymd(U.addDays(T0, 64)), renew: U.ymd(U.addDays(T0, 34)) }, version: 'v1.0.2' },
    stg: { label: 'Staging', domain: 'staging.lumen-hospital.example', web: 'High CPU 2vCPU / 4GB · stg-01 (웹·DB 통합)', db: 'stg-01 내부 MySQL 8 · 시험용 가상 데이터', net: 'VPC lumen-stg · 운영과 분리', acg: ['80·443 → 지정 IP + 접속 인증', '22(SSH) → 당사 지정 IP', '검색엔진 노출 차단(noindex)'], ssl: { kind: '자동 갱신 인증서', exp: U.ymd(U.addDays(T0, 71)), renew: U.ymd(U.addDays(T0, 41)) }, version: 'v1.0.3-rc2' },
    backups: [],
    deploys: [
      { v: 'v1.0.3-rc2', at: NOW - 5 * 36e5, env: 'stg', who: '백엔드(수석)', note: '예약 취소 마감 시각 안내 문구 수정, 통계 엑셀 열 추가', checks: { qa: false } },
      { v: 'v1.0.2', at: NOW - 3 * 864e5, env: 'prod', who: '백엔드(수석)', note: '게시판 지점별 노출 필터 개선', checks: { qa: true } },
      { v: 'v1.0.1', at: NOW - 8 * 864e5, env: 'prod', who: '백엔드(수석)', note: '모바일 하단 고정 메뉴 접근성 보완', checks: { qa: true } }
    ],
    restoreTest: { at: NOW - 6 * 864e5, ok: true, rows: '예약 1,284건 · 게시물 212건 일치' }
  };
  for (var bk = 0; bk < 14; bk++) {
    var bt = U.addDays(T0, -bk); bt.setHours(3, 10 + (bk % 3), 0, 0);
    if (bt.getTime() > NOW) continue;
    ENV.backups.push({ at: bt.getTime(), kind: 'DB 논리 백업', size: (182 - bk * 1.3).toFixed(1) + ' MB', ok: bk !== 9 || false, where: '백업 전용 저장소 (운영 DB와 분리)' });
    if (bk % 7 === 1) ENV.backups.push({ at: bt.getTime() + 18e5, kind: '웹 서버 이미지', size: '12.4 GB', ok: true, where: '서버 이미지 백업' });
  }

  /* 주간 예약 추이 (통계용, 지난 8주 · 가상) */
  var WEEKLY = [];
  for (var wk = 7; wk >= 0; wk--) {
    var o = { label: U.md(U.addDays(T0, -wk * 7 - T0.getDay() + 1)) };
    BRANCHES.forEach(function (b) { o[b.id] = Math.round((b.id === 'pt' ? 260 : 140) * (0.82 + rnd() * 0.36) * (1 + (7 - wk) * 0.02)); });
    WEEKLY.push(o);
  }

  function syncCounters() { rseq = RES.reduce(function(n,r) { return Math.max(n, Number(r.id.slice(1)) || 0); },1000); }

  window.DB = {
    U: U, T0: T0, HOSP: HOSP, BRANCHES: BRANCHES, DEPTS: DEPTS, BRANCH_DEPTS: BRANCH_DEPTS, DOCTORS: DOCTORS,
    SCHED: SCHED, EXC: EXC, HOLI: HOLI, RES: RES, POSTS: POSTS, INQ: INQ, BANNERS: BANNERS, ADMINS: ADMINS, AUDIT: AUDIT, ENV: ENV, WEEKLY: WEEKLY,
    DEMO_P: DEMO_P, DEMO_EXC: U.ymd(DEMO_EXC), mkRes: mkRes, slotTimes: slotTimes, syncCounters: syncCounters,
    branch: function (id) { return BRANCHES.filter(function (b) { return b.id === id; })[0]; },
    dept: function (id) { return DEPTS.filter(function (d) { return d.id === id; })[0]; },
    deptsOf: function (bid) { return (BRANCH_DEPTS[bid] || []).map(function (d) { return DEPTS.filter(function (x) { return x.id === d; })[0]; }); },
    branchesWith: function (did) { return BRANCHES.filter(function (b) { return BRANCH_DEPTS[b.id].indexOf(did) >= 0; }); },
    docsOf: function (bid, did) { return DOCTORS.filter(function (d) { return d.bid === bid && (!did || d.did === did); }); },
    sched: function (bid, did) { return SCHED[bid + ':' + did]; },
    res: function (id) { return RES.filter(function (r) { return r.id === id; })[0]; },
    post: function (id) { return POSTS.filter(function (p) { return p.id === id; })[0]; },
    STATUS: { request: ['신청', 'warn'], confirm: ['확정', 'teal'], done: ['내원 완료', 'ok'], cancel: ['취소', 'gray'], noshow: ['미내원', 'err'] },
    BTYPE: { notice: '공지사항', press: '언론보도', faq: 'FAQ' }
  };
})();
