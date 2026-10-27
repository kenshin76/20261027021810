/* 루멘병원 프로토타입 — 통합 관리자 */
(function () {
  'use strict';
  var A = window.APP, D = window.DB, U = D.U, S = A.S, ACT = A.ACT, ic = A.ic, bdg = A.bdg, stB = A.stB, ENG = A.ENG;
  var AF = { bid: '', did: '', st: '', from: '', to: '', q: '', view: 'list' };
  var BF = { type: 'notice' };
  var SF = { bid: 'pt', did: 'os' };

  function me() { return D.ADMINS.filter(function (a) { return a.id === S.admin; })[0]; }
  function lockB() { var m = me(); return m && m.role === 'branch' ? m.bid : null; }
  function canB(bid) { var m = me(); return !!m && (m.role === 'super' || m.bid === bid); }
  function canScope(scope) { var m = me(); return !!m && (m.role === 'super' || (scope.length === 1 && scope[0] === m.bid)); }
  function allowed(ok) { if (!ok) A.toast('이 작업을 수행할 권한이 없습니다.', 'err'); return ok; }
  function audit(what, warn) { var m = me(); D.AUDIT.unshift({ t: Date.now(), who: m ? m.name : '시스템', what: what, ip: m ? m.ip : '-', bid:m ? m.bid : null, warn: !!warn }); if (A.Store) A.Store.schedule(); }
  A.audit = audit;
  function bName(id) { var b = D.branch(id); return b ? b.name : '전체'; }
  function dot(c) { return '<i style="display:inline-block;width:9px;height:9px;border-radius:50%;background:' + c + '"></i>'; }
  function myRes() { var l = lockB(); return D.RES.filter(function (r) { return !l || r.bid === l; }); }
  function myInq() { var l = lockB(); return D.INQ.filter(function (q) { return !l || q.bid === l; }); }

  var MENU = [
    ['운영', [['', 'grid', '대시보드'], ['res', 'cal', '예약 관리', 'req'], ['sched', 'clock', '예약 스케줄'], ['pat', 'user', '예약자 관리'], ['inquiry', 'msg', '문의 관리', 'inq']]],
    ['콘텐츠', [['board', 'news', '게시판'], ['banner', 'mega', '배너 · 팝업'], ['org', 'building', '지점 · 진료과']]],
    ['분석 · 시스템', [['stats', 'chart', '통계'], ['env', 'server', '운영 환경 (NCP)'], ['audit', 'shield', '권한 · 접속 기록']]]
  ];

  A.adminRender = function (r) {
    var page = r.p[1] || '';
    if (!me() || page === 'login') { A.title = '관리자 로그인'; return login(); }
    var m = me();
    var VIEW = { '': dash, res: resV, sched: schedV, pat: patV, inquiry: inqV, board: boardV, banner: bannerV, org: orgV, stats: statsV, env: envV, audit: auditV }[page] || dash;
    var title = '';
    MENU.forEach(function (g) { g[1].forEach(function (x) { if (x[0] === page) title = x[2]; }); });
    A.title = (title || '대시보드') + ' — 관리자';
    var cnt = { req: myRes().filter(function (x) { return x.status === 'request'; }).length, inq: myInq().filter(function (x) { return x.status === 'wait'; }).length };
    return '<div class="adm"><aside class="aside" id="aside"><a class="logo" href="#/admin">' + A.logo(1) + '<span>' + D.HOSP.name + '<small>ADMIN</small></span></a>' +
      '<div class="who"><b>' + m.name + '</b>' + m.label + (m.role === 'branch' ? '<br><span style="color:#C3DCC5">' + bName(m.bid) + ' 데이터만 표시</span>' : '') + '</div>' +
      '<nav>' + MENU.map(function (g) { return '<span class="gh">' + g[0] + '</span>' + g[1].map(function (x) { return '<a href="#/admin/' + x[0] + '" class="' + (x[0] === page ? 'on' : '') + '">' + ic(x[1], 's') + x[2] + (x[3] && cnt[x[3]] ? '<span class="n">' + cnt[x[3]] + '</span>' : '') + '</a>'; }).join(''); }).join('') + '</nav>' +
      '<div class="ft">예약·콘텐츠 운영 관리<br><a href="#/" style="color:#C3DCC5">사용자 사이트 보기 →</a></div></aside>' +
      '<div class="amain"><header class="abar"><button class="ibtn amtog" data-act="aside" aria-label="메뉴">' + ic('menu') + '</button><h1>' + (title || '대시보드') + '</h1>' +
      '<div class="rt"><span class="envb ' + (D.ENV.view === 'staging' ? 'stg' : 'prod') + '" title="현재 보고 있는 환경">' + (D.ENV.view === 'staging' ? 'STAGING' : 'PRODUCTION') + '</span>' +
      '<span class="small b hide-s">' + U.esc(m.name) + ' · ' + m.label + '</span>' +
      '<a class="btn o sm hide-s" href="#/">' + ic('home', 's') + '사이트</a><button class="btn g sm" data-act="aOut">로그아웃</button></div></header>' +
      '<div class="acont">' + VIEW(r) + '</div></div></div>';
  };
  function login() {
    return '<div class="alog"><div class="alog-frame"><div class="alog-photo"><div><span class="eyebrow">LUMEN WORKSPACE</span><h2 class="mt16">더 나은 진료를 위한<br>하나의 운영 공간.</h2><p>예약과 진료 일정, 병원 소식을<br>한곳에서 관리하세요.</p></div></div><div class="bx"><div class="row sb"><div class="logo">' + A.logo() + '<span>' + D.HOSP.name + '</span></div><a class="btn o sm" href="#/">사용자 사이트로</a></div><h1 class="login-title">관리자 로그인</h1><p class="muted mt8">계정 정보를 입력해 관리 화면으로 이동하세요.</p><form id="adminLogin" onsubmit="return false"><div class="fld"><label for="adminEmail">이메일</label><input class="inp" id="adminEmail" type="email" autocomplete="username" placeholder="이메일을 입력해 주세요"></div><div class="fld mt16"><label for="adminPassword">비밀번호</label><input class="inp" id="adminPassword" type="password" autocomplete="current-password" placeholder="비밀번호를 입력해 주세요"></div><p class="hint err mt8" id="adminError" role="alert"></p><button class="btn p blk mt24" data-act="aLogin" type="submit">로그인</button></form><div class="login-demo"><div class="row sb wr"><b>체험 계정</b><span class="hint">선택하면 입력란에 채워집니다.</span></div>' + D.ADMINS.map(function(a) { return '<button class="acc" data-act="aFill" data-id="' + a.id + '"><span class="av">' + a.name[0] + '</span><span class="grow"><b>' + a.label + '</b><small class="muted">' + a.email + '</small></span><span class="credential mono">' + a.password + '</span></button>'; }).join('') + '<p class="hint mt16">가상 계정으로만 이용하는 체험 환경입니다. 실제 관리자 인증·지정 IP 제한은 서버 구축 시 적용합니다.</p><div class="demo-storage mt16"><p class="hint" data-demo-storage aria-live="polite">이 브라우저에 체험 데이터를 자동 저장합니다.</p><button type="button" class="btn o sm mt12" data-act="demoReset">' + ic('refresh', 's') + '체험 데이터 초기화</button><p class="hint mt8">초기화하면 저장한 체험 내용과 로그인 상태가 처음으로 돌아갑니다.</p></div></div></div></div></div>';
  }
  function resetSession(id) {
    clearTimeout(afT); revealed = {}; S.admin = id; S.me = null; S.rsv = null; S.lastRes = null;
    AF = {bid:lockB() || '', did:'', st:'', from:'', to:'', q:'', view:'list'};
    if (lockB()) { SF.bid = lockB(); SF.did = D.BRANCH_DEPTS[SF.bid][0]; }
  }
  ACT.aFill = function(el) { var a = D.ADMINS.find(function(x) { return x.id === el.dataset.id; }); if (!a) return; document.getElementById('adminEmail').value = a.email; document.getElementById('adminPassword').value = a.password; document.getElementById('adminError').textContent = ''; document.querySelector('[data-act="aLogin"]').focus(); };
  ACT.aLogin = function(el, event) {
    if (event) event.preventDefault();
    var email = document.getElementById('adminEmail').value.trim().toLowerCase(), password = document.getElementById('adminPassword').value;
    var a = D.ADMINS.find(function(x) { return x.email === email && x.password === password; });
    if (!a) { document.getElementById('adminError').textContent = '이메일과 비밀번호를 확인해 주세요.'; return; }
    resetSession(a.id); audit('관리자 로그인'); A.go('#/admin');
  };
  document.addEventListener('submit',function(e) { if (e.target.id === 'adminLogin') { e.preventDefault(); ACT.aLogin(); } });
  ACT.aIn = function(el) { ACT.aFill(el); };
  ACT.aOut = function() { audit('로그아웃'); resetSession(null); A.go('#/admin/login'); };
  ACT.aSwitch = function(el) { if (!D.ADMINS.some(function(a) { return a.id === el.value; })) return; resetSession(el.value); audit('체험 계정 전환'); A.render(); };
  ACT.aside = function () { document.getElementById('aside').classList.toggle('open'); };

  /* ================= 대시보드 ================= */
  function dash() {
    var t = U.ymd(U.today()), rs = myRes(), l = lockB();
    var today = rs.filter(function (x) { return x.date === t && x.status !== 'cancel'; });
    var req = rs.filter(function (x) { return x.status === 'request'; });
    var wEnd = U.ymd(U.addDays(U.today(), 6));
    var week = rs.filter(function (x) { return x.date >= t && x.date <= wEnd && x.status !== 'cancel'; });
    var inq = myInq().filter(function (x) { return x.status === 'wait'; });
    var h = '<div class="kpis"><div class="kpi hl"><span class="ic">' + ic('cal') + '</span><span class="l">오늘 예약</span><div class="v">' + today.length + '<small>건</small></div><span class="s">' + (l ? bName(l) : '4개 지점') + ' · 내원 ' + today.filter(function (x) { return x.status === 'done'; }).length + '</span></div>' +
      '<div class="kpi"><span class="ic" style="background:var(--warn-soft);color:var(--warn)">' + ic('clock') + '</span><span class="l">확정 대기</span><div class="v">' + req.length + '<small>건</small></div><span class="s">병원 확인이 필요한 신청</span></div>' +
      '<div class="kpi"><span class="ic">' + ic('chart') + '</span><span class="l">앞으로 7일</span><div class="v">' + week.length + '<small>건</small></div><span class="s">취소 제외</span></div>' +
      '<div class="kpi"><span class="ic" style="background:var(--acc-soft);color:var(--acc-ink)">' + ic('msg') + '</span><span class="l">미답변 문의</span><div class="v">' + inq.length + '<small>건</small></div><span class="s">가장 오래된 ' + (inq.length ? U.ago(inq[inq.length - 1].at) : '-') + '</span></div></div>';
    /* 지점별 7일 */
    var bs = l ? [D.branch(l)] : D.BRANCHES;
    var days = []; for (var i = 0; i < 7; i++) days.push(U.ymd(U.addDays(U.today(), i)));
    var max = 1; var data = days.map(function (ds) { var o = { ds: ds }; bs.forEach(function (b) { o[b.id] = rs.filter(function (x) { return x.bid === b.id && x.date === ds && x.status !== 'cancel'; }).length; }); var s = bs.reduce(function (a, b) { return a + o[b.id]; }, 0); if (s > max) max = s; return o; });
    h += '<div class="dgrid"><div class="pnl"><div class="hd"><h3>' + ic('chart', 's') + '앞으로 7일 예약</h3><div class="legend">' + bs.map(function (b) { return '<span><i style="background:' + b.color + '"></i>' + b.short + '</span>'; }).join('') + '</div></div>' +
      '<div class="bars">' + data.map(function (o) { var s = bs.reduce(function (a, b) { return a + o[b.id]; }, 0); return '<div class="bc"><b class="small">' + s + '</b><div class="stk" style="height:' + Math.max(4, s / max * 130) + 'px">' + bs.map(function (b) { return o[b.id] ? '<i style="background:' + b.color + ';flex:' + o[b.id] + '"></i>' : ''; }).join('') + '</div><small>' + U.md(o.ds) + ' ' + U.dow(o.ds) + '</small></div>'; }).join('') + '</div></div>' +
      '<div class="pnl"><div class="hd"><h3>' + ic('clock', 's') + '확정 대기 예약</h3><a class="btn g xs" href="#/admin/res">전체 ' + ic('arrow', 's') + '</a></div>' + (req.length ? '<div class="col" style="gap:0">' + req.sort(function (a, b) { return (a.date + a.time) < (b.date + b.time) ? -1 : 1; }).slice(0, 6).map(function (x) { return '<div class="row sb" style="padding:9px 0;border-bottom:1px solid var(--line)"><span class="c2 small"><b>' + U.md(x.date) + ' ' + x.time + ' · ' + U.maskName(x.name) + '</b><span class="muted">' + D.branch(x.bid).short + ' ' + D.dept(x.did).name + '</span></span><button class="btn p xs" data-act="rSet" data-id="' + x.id + '" data-v="confirm">확정</button></div>'; }).join('') + '</div>' : '<div class="empty">대기 중인 예약이 없습니다</div>') + '</div></div>';
    h += '<div class="dgrid"><div class="pnl"><div class="hd"><h3>' + ic('msg', 's') + '최근 문의</h3><a class="btn g xs" href="#/admin/inquiry">전체 ' + ic('arrow', 's') + '</a></div><div class="tw"><table class="t"><tbody>' + myInq().slice(0, 5).map(function (q) { return '<tr><td class="nw">' + (q.status === 'wait' ? bdg('답변 대기', 'warn') : bdg('답변 완료', 'ok')) + '</td><td>' + U.esc(q.title) + '<br><span class="tiny muted">' + bName(q.bid) + ' · ' + q.cat + '</span></td><td class="nw small muted">' + U.ago(q.at) + '</td></tr>'; }).join('') + '</tbody></table></div></div>' +
      '<div class="pnl"><div class="hd"><h3>' + ic('server', 's') + '운영 환경</h3><a class="btn g xs" href="#/admin/env">상세 ' + ic('arrow', 's') + '</a></div>' + envMini() + '</div></div>';
    return h;
  }
  function envMini() {
    var E = D.ENV, lb = E.backups[0], exp = Math.round((U.parse(E.prod.ssl.exp) - U.today()) / 864e5);
    return '<ul class="feed"><li><span class="fdot"></span><span class="grow">Production <b>' + E.prod.version + '</b> 운영 중 · Staging <b>' + E.stg.version + '</b> 검수 대기</span></li>' +
      '<li><span class="fdot"></span><span class="grow">최근 DB 백업 ' + U.dt(lb.at) + ' ' + (lb.ok ? bdg('성공', 'ok') : bdg('실패', 'err')) + '</span></li>' +
      '<li><span class="fdot"></span><span class="grow">SSL 인증서 만료까지 <b>D-' + exp + '</b> · 자동 갱신 예정 ' + U.date(E.prod.ssl.renew) + '</span></li>' +
      '<li><span class="fdot"></span><span class="grow">백업 복구 시험 ' + U.date(E.restoreTest.at) + ' ' + bdg('정상', 'ok') + '</span></li></ul>';
  }

  /* ================= 예약 관리 ================= */
  function filtRes() {
    var l = lockB();
    return D.RES.filter(function (x) {
      if (l && x.bid !== l) return false;
      if (AF.bid && x.bid !== AF.bid) return false;
      if (AF.did && x.did !== AF.did) return false;
      if (AF.st && x.status !== AF.st) return false;
      if (AF.from && x.date < AF.from) return false;
      if (AF.to && x.date > AF.to) return false;
      if (AF.q && (x.name + x.no + x.phone).indexOf(AF.q) < 0) return false;
      return true;
    }).sort(function (a, b) { return (a.date + a.time) < (b.date + b.time) ? -1 : 1; });
  }
  function bSel(attr, val, all) {
    var l = lockB();
    return '<select class="sel" ' + attr + ' aria-label="지점">' + (l || all === false ? '' : '<option value="">' + (all || '전체 지점') + '</option>') + D.BRANCHES.filter(function (b) { return !l || b.id === l; }).map(function (b) { return '<option value="' + b.id + '"' + (val === b.id ? ' selected' : '') + '>' + b.name + '</option>'; }).join('') + '</select>';
  }
  function resV() {
    if (!AF.from) { AF.from = U.ymd(U.today()); AF.to = U.ymd(U.addDays(U.today(), 13)); }
    var list = filtRes();
    var h = '<div class="pnl"><div class="filt">' + bSel('data-ch="afSet" data-k="bid"', AF.bid) +
      '<select class="sel" data-ch="afSet" data-k="did" aria-label="진료과"><option value="">전체 진료과</option>' + D.DEPTS.map(function (d) { return '<option value="' + d.id + '"' + (AF.did === d.id ? ' selected' : '') + '>' + d.name + '</option>'; }).join('') + '</select>' +
      '<select class="sel" data-ch="afSet" data-k="st" aria-label="상태"><option value="">전체 상태</option>' + Object.keys(D.STATUS).map(function (k) { return '<option value="' + k + '"' + (AF.st === k ? ' selected' : '') + '>' + D.STATUS[k][0] + '</option>'; }).join('') + '</select>' +
      '<input class="inp" type="date" data-ch="afSet" data-k="from" value="' + AF.from + '" aria-label="시작일"><span class="muted">~</span><input class="inp" type="date" data-ch="afSet" data-k="to" value="' + AF.to + '" aria-label="종료일">' +
      '<input class="inp" placeholder="이름·예약번호" data-in="afQ" value="' + U.esc(AF.q) + '" aria-label="검색" style="min-width:150px">' +
      '<span class="grow"></span><div class="seg"><button data-act="afView" data-v="list" aria-label="목록 보기" title="목록 보기" class="' + (AF.view === 'list' ? 'on' : '') + '">' + ic('list', 's') + '</button><button data-act="afView" data-v="week" aria-label="주간 보기" title="주간 보기" class="' + (AF.view === 'week' ? 'on' : '') + '">' + ic('cal', 's') + '</button></div>' +
      '<button class="btn o sm" data-act="resCsv">' + ic('down', 's') + '엑셀(CSV)</button></div></div>';
    if (AF.view === 'week') return h + weekGrid(list);
    h += '<div class="pnl"><div class="hd"><h3>예약 ' + list.length + '건</h3><span class="small muted">이름·연락처는 가려서 표시합니다. 상세 열람은 「예약자 관리」에서 사유를 남기고 확인합니다.</span></div><div class="tw"><table class="t"><thead><tr><th>예약일시</th><th>지점 · 진료과</th><th>예약자</th><th>구분</th><th>상태</th><th>접수</th><th style="text-align:right">처리</th></tr></thead><tbody>' +
      (list.length ? list.slice(0, 80).map(function (x) {
        var b = D.branch(x.bid);
        return '<tr id="row-' + x.id + '"><td class="nw"><b>' + U.md(x.date) + ' (' + U.dow(x.date) + ') ' + x.time + '</b><br><span class="tiny muted mono">' + x.no + '</span></td><td class="nw">' + dot(b.color) + ' ' + b.short + ' · ' + D.dept(x.did).name + '</td><td class="nw">' + U.maskName(x.name) + '<br><span class="tiny muted">' + U.maskPhone(x.phone) + '</span></td><td class="nw small">' + (x.first ? '초진' : '재진') + (x.memo ? ' ' + bdg('메모', 'info', 1) : '') + '</td><td class="nw">' + stB(x.status) + '</td><td class="nw small muted">' + U.ago(x.created) + '</td><td class="nw" style="text-align:right">' + actBtns(x) + '</td></tr>';
      }).join('') : '<tr><td colspan="7" class="empty">조건에 맞는 예약이 없습니다</td></tr>') + '</tbody></table></div>' + (list.length > 80 ? '<p class="small muted mt12">상위 80건만 표시합니다 (시연).</p>' : '') + '</div>';
    return h;
  }
  function actBtns(x) {
    var o = '';
    if (x.status === 'request') o += '<button class="btn p xs" data-act="rSet" data-id="' + x.id + '" data-v="confirm">확정</button> ';
    if (x.status === 'confirm' && x.date <= U.ymd(U.today())) o += '<button class="btn o xs" data-act="rSet" data-id="' + x.id + '" data-v="done">내원</button> <button class="btn o xs" data-act="rSet" data-id="' + x.id + '" data-v="noshow">미내원</button> ';
    if (x.status === 'request' || x.status === 'confirm') o += '<button class="btn g xs" data-act="rSet" data-id="' + x.id + '" data-v="cancel">취소</button> ';
    return o + '<button class="btn g xs" data-act="rHist" data-id="' + x.id + '" aria-label="이력">' + ic('list', 's') + '</button>';
  }
  function weekGrid(list) {
    var start = AF.from ? U.parse(AF.from) : U.today(), days = [];
    for (var i = 0; i < 7; i++) days.push(U.ymd(U.addDays(start, i)));
    var hrs = []; for (var hh = 8; hh <= 19; hh++) hrs.push(hh);
    var g = '<div class="pnl"><div class="hd"><h3>주간 보기 · ' + U.md(days[0]) + ' ~ ' + U.md(days[6]) + '</h3><span class="small muted">칸을 누르면 상세 이력이 열립니다 · 시작일 필터 기준 7일</span></div><div class="tw"><div class="wkg" style="min-width:760px"><span></span>' + days.map(function (ds) { return '<span class="h">' + U.md(ds) + ' ' + U.dow(ds) + '</span>'; }).join('');
    hrs.forEach(function (hh) {
      g += '<span class="t0">' + U.pad(hh) + ':00</span>';
      days.forEach(function (ds) {
        var it = list.filter(function (x) { return x.date === ds && +x.time.slice(0, 2) === hh && x.status !== 'cancel'; });
        g += '<div class="cl">' + it.map(function (x) { var b = D.branch(x.bid); return '<button type="button" data-act="rHist" data-id="' + x.id + '" style="background:' + (x.status === 'request' ? 'var(--warn-soft)' : 'var(--pri-soft)') + ';border-left:3px solid ' + b.color + '" aria-label="' + U.mdw(x.date) + ' ' + x.time + ' ' + D.dept(x.did).name + ' 예약 이력">' + x.time + ' ' + D.dept(x.did).name + '</button>'; }).join('') + '</div>';
      });
    });
    return g + '</div></div><div class="legend mt12"><span><i style="background:var(--warn-soft)"></i>신청</span><span><i style="background:var(--pri-soft)"></i>확정·완료</span>' + D.BRANCHES.map(function (b) { return '<span><i style="background:' + b.color + '"></i>' + b.short + '</span>'; }).join('') + '</div></div>';
  }
  ACT.afSet = function (el) { AF[el.dataset.k] = el.value; A.render(); };
  var afT; ACT.afQ = function (el) { AF.q = el.value.trim(); clearTimeout(afT); afT = setTimeout(function () { var p = el.selectionStart; A.render(); var n = document.querySelector('[data-in="afQ"]'); if (n) { n.focus(); n.setSelectionRange(p, p); } }, 350); };
  ACT.afView = function (el) { AF.view = el.dataset.v; A.render(); };
  ACT.rSet = function (el) {
    var x = D.res(el.dataset.id), v = el.dataset.v;
    if (!x || !me()) return;
    if (!canB(x.bid)) { A.toast('다른 지점의 예약은 처리할 수 없습니다', 'err'); audit('권한 없는 예약 처리 시도 차단 (' + x.no + ')', true); return; }
    var actor = S.admin;
    var go = function () { if (!allowed(S.admin === actor && canB(x.bid))) return; if (!['request','confirm'].includes(x.status) || !['confirm','done','noshow','cancel'].includes(v) || (v === 'confirm' && x.status !== 'request') || (['done','noshow'].includes(v) && (x.status !== 'confirm' || x.date > U.ymd(U.today())))) return A.toast('현재 상태에서는 처리할 수 없습니다.', 'err'); var prev = D.STATUS[x.status][0]; x.status = v; x.hist.push({ t: Date.now(), who: me().name, what: prev + ' → ' + D.STATUS[v][0] }); audit('예약 ' + x.no + ' 상태 변경 (' + prev + ' → ' + D.STATUS[v][0] + ')'); var y = window.scrollY; A.render(); window.scrollTo(0, y); A.toast(D.STATUS[v][0] + ' 처리했습니다', 'ok'); };
    if (v === 'cancel') A.confirm('예약을 취소 처리할까요?', '<p>' + U.mdw(x.date) + ' ' + x.time + ' · ' + U.maskName(x.name) + '</p><p class="small muted mt8">취소된 시간은 바로 다른 환자가 예약할 수 있게 열립니다. 환자 안내는 전화로 진행해 주세요.</p>', '취소 처리', go, true);
    else go();
  };
  ACT.rHist = function (el) {
    var x = D.res(el.dataset.id); if (!x || !allowed(canB(x.bid))) return; var b = D.branch(x.bid);
    A.modal({ title: '예약 ' + x.no, icon: 'cal', body: '<dl class="kv"><dt>일시</dt><dd>' + U.mdw(x.date) + ' ' + x.time + '</dd><dt>지점·진료과</dt><dd>' + b.name + ' · ' + D.dept(x.did).name + '</dd><dt>예약자</dt><dd>' + U.maskName(x.name) + ' · ' + U.maskPhone(x.phone) + '</dd><dt>상태</dt><dd>' + stB(x.status) + '</dd>' + (x.memo ? '<dt>증상 메모</dt><dd><button class="btn o xs" data-act="memoShow" data-id="' + x.id + '">사유 입력 후 열람</button></dd>' : '') + '</dl><h4 class="mt16" style="font-size:.95rem">처리 이력</h4><ul class="feed mt8">' + x.hist.slice().reverse().map(function (h) { return '<li><span class="fdot"></span><span class="grow">' + U.esc(h.what) + '<br><span class="tiny muted">' + U.dt(h.t) + ' · ' + U.esc(h.who) + '</span></span></li>'; }).join('') + '</ul>', foot: '<button class="btn o" data-x>닫기</button>' });
  };
  ACT.memoShow = function(el) {
    var x = D.res(el.dataset.id); if (!x || !allowed(canB(x.bid))) return;
    var actor = S.admin, m = A.modal({title:'증상 메모 열람', icon:'lock', body:'<div class="fld"><label for="memoReason">열람 사유</label><select class="sel" id="memoReason"><option>예약 진료 내용 확인</option><option>환자 요청 확인</option></select></div>', foot:'<button class="btn o" data-x>취소</button><button class="btn p" id="memoOk">열람</button>'});
    m.el.querySelector('#memoOk').addEventListener('click',function() { if (!allowed(S.admin === actor && canB(x.bid))) return; audit('증상 메모 열람 ' + x.no + ' — ' + m.el.querySelector('#memoReason').value); m.close(); A.modal({title:'증상 메모',body:'<p class="policy-copy">' + U.esc(x.memo) + '</p>',foot:'<button class="btn o" data-x>닫기</button>'}); });
  };
  function csvDownload(name, rows) {
    var csv = '\ufeff' + rows.map(function(row) { return row.map(function(c) { var v = String(c == null ? '' : c); if (/^[=+@\-]/.test(v)) v = "'" + v; return '"' + v.replace(/"/g,'""') + '"'; }).join(','); }).join('\r\n');
    var url = URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})), a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function() { URL.revokeObjectURL(url); },1000);
  }
  ACT.resCsv = function () {
    var list = filtRes(), rows = [['예약번호', '일자', '시간', '지점', '진료과', '예약자(마스킹)', '연락처(마스킹)', '구분', '상태']];
    list.forEach(function (x) { rows.push([x.no, x.date, x.time, D.branch(x.bid).name, D.dept(x.did).name, U.maskName(x.name), U.maskPhone(x.phone), x.first ? '초진' : '재진', D.STATUS[x.status][0]]); });
    csvDownload('lumen_reservations_' + U.ymd(new Date()) + '.csv', rows);
    audit('예약 목록 내려받기 ' + list.length + '건 (마스킹)'); A.toast('예약 ' + list.length + '건을 내려받았습니다 (개인정보 마스킹)', 'ok');
  };

  /* ================= 예약 스케줄 ================= */
  var DAYS = [['mon', '월'], ['tue', '화'], ['wed', '수'], ['thu', '목'], ['fri', '금'], ['sat', '토'], ['sun', '일']];
  function schedV() {
    var l = lockB(); if (l) SF.bid = l;
    if (D.BRANCH_DEPTS[SF.bid].indexOf(SF.did) < 0) SF.did = D.BRANCH_DEPTS[SF.bid][0];
    var sc = D.sched(SF.bid, SF.did), b = D.branch(SF.bid);
    var h = '<div class="pnl"><div class="filt">' + bSel('data-ch="sfSet" data-k="bid"', SF.bid, false) +
      '<div class="row wr" style="gap:6px">' + D.deptsOf(SF.bid).map(function (d) { return '<button class="chip ' + (d.id === SF.did ? 'on' : '') + '" data-act="sfDept" data-v="' + d.id + '">' + d.name + '</button>'; }).join('') + '</div></div>' +
      '<p class="note mt12">' + ic('info', 's') + '<span>지점·진료과별 운영표가 사용자 화면의 달력·시간 선택과 「가장 빠른 예약」 계산에 바로 쓰입니다. 저장한 내용은 예약 화면에 반영됩니다.</span></p></div>';
    h += '<div class="dgrid"><div class="pnl" id="weekPnl"><div class="hd"><h3>' + ic('clock', 's') + b.short + ' · ' + D.dept(SF.did).name + ' 요일별 운영표</h3><button class="btn p sm" data-act="schSave">' + ic('check', 's') + '저장</button></div>' +
      DAYS.map(function (k) { var w = sc.week[k[0]]; return '<div class="wkr"><b>' + k[1] + '요일</b><div class="rgs" data-day="' + k[0] + '">' + (w.length ? w.map(function (rg, i) { return '<span class="rg"><input value="' + rg[0] + '" aria-label="' + k[1] + ' 시작"> ~ <input value="' + rg[1] + '" aria-label="' + k[1] + ' 종료"><button data-act="rgDel" aria-label="구간 삭제">' + ic('x', 's') + '</button></span>'; }).join('') : '<span class="muted small">휴진</span>') + '<button class="btn g xs" data-act="rgAdd" data-day="' + k[0] + '">' + ic('plus', 's') + '구간</button></div></div>'; }).join('') + '</div>' +
      '<div class="col" style="gap:18px"><div class="pnl"><div class="hd"><h3>' + ic('gear', 's') + '예약 규칙</h3></div><div class="g2">' +
      '<div class="fld"><label for="scI">시간 간격</label><select class="sel" id="scI">' + [15, 20, 30, 60].map(function (n) { return '<option' + (sc.interval === n ? ' selected' : '') + ' value="' + n + '">' + n + '분</option>'; }).join('') + '</select></div>' +
      '<div class="fld"><label for="scC">시간대별 정원</label><input class="inp" id="scC" type="number" min="1" max="20" value="' + sc.cap + '"></div>' +
      '<div class="fld"><label for="scD">예약 가능 기간</label><select class="sel" id="scD">' + [14, 30, 60].map(function (n) { return '<option' + (sc.days === n ? ' selected' : '') + ' value="' + n + '">' + n + '일</option>'; }).join('') + '</select></div>' +
      '<div class="fld"><label for="scX">온라인 취소 마감</label><select class="sel" id="scX">' + [1, 2, 3, 24].map(function (n) { return '<option' + (sc.cancelHours === n ? ' selected' : '') + ' value="' + n + '">진료 ' + n + '시간 전</option>'; }).join('') + '</select></div>' +
      '<div class="fld" style="grid-column:1/-1"><label for="scM">확정 방식</label><select class="sel" id="scM"><option value="request"' + (sc.mode === 'request' ? ' selected' : '') + '>신청 후 병원 확정</option><option value="instant"' + (sc.mode === 'instant' ? ' selected' : '') + '>즉시 확정</option></select></div></div></div>' +
      '<div class="pnl" id="excPnl"><div class="hd"><h3>' + ic('alert', 's') + '휴진 · 예외 일정</h3><button class="btn o sm" data-act="excAdd">' + ic('plus', 's') + '등록</button></div><div class="tw"><table class="t"><tbody>' +
      D.EXC.filter(function (e) { return (e.bid === 'all' || e.bid === SF.bid) && e.date >= U.ymd(U.today()); }).sort(function (a, b) { return a.date < b.date ? -1 : 1; }).map(function (e) { return '<tr><td class="nw"><b>' + U.md(e.date) + ' (' + U.dow(e.date) + ')</b></td><td>' + bdg(e.type, e.type === '휴진' ? 'err' : 'warn') + ' ' + U.esc(e.note) + (e.until ? ' (' + e.until + '까지)' : '') + '<br><span class="tiny muted">' + (e.bid === 'all' ? '전 지점' : bName(e.bid)) + ' · ' + (e.did === 'all' ? '전체 진료과' : D.dept(e.did).name) + '</span></td><td style="text-align:right">' + (e.bid === 'all' && lockB() ? '' : '<button class="btn g xs" data-act="excDel" data-id="' + e.id + '" aria-label="삭제">' + ic('trash', 's') + '</button>') + '</td></tr>'; }).join('') + '</tbody></table></div></div></div></div>';
    return h;
  }
  ACT.sfSet = function (el) { if (!D.branch(el.value) || !allowed(canB(el.value))) return; SF.bid = el.value; A.render(); };
  ACT.sfDept = function (el) { if (D.BRANCH_DEPTS[SF.bid].indexOf(el.dataset.v) < 0) return; SF.did = el.dataset.v; A.render(); };
  ACT.rgAdd = function (el) { var box = el.parentNode; var m = box.querySelector('.muted'); if (m) m.remove(); var s = document.createElement('span'); s.className = 'rg'; s.innerHTML = '<input value="14:00" aria-label="시작"> ~ <input value="18:00" aria-label="종료"><button data-act="rgDel" aria-label="구간 삭제">' + ic('x', 's') + '</button>'; box.insertBefore(s, el); s.querySelector('input').focus(); };
  ACT.rgDel = function (el) { el.closest('.rg').remove(); };
  ACT.schSave = function () {
    if (!allowed(canB(SF.bid))) return;
    var sc = D.sched(SF.bid, SF.did), nw = {}, bad = '';
    document.querySelectorAll('#weekPnl .rgs').forEach(function (box) {
      var k = box.dataset.day; nw[k] = [];
      box.querySelectorAll('.rg').forEach(function (rg) { var i = rg.querySelectorAll('input'), a = i[0].value.trim(), b = i[1].value.trim(); if (!U.validTime(a) || !U.validTime(b, true) || U.min(a) >= U.min(b)) bad = '시간 형식(HH:MM)과 시작·종료 순서를 확인해 주세요'; else nw[k].push([a, b]); });
    });
    Object.keys(nw).forEach(function(k) { nw[k].sort(function(a,b) { return U.min(a[0])-U.min(b[0]); }); for (var i=1;i<nw[k].length;i++) if (U.min(nw[k][i][0]) < U.min(nw[k][i-1][1])) bad = '같은 요일의 진료 시간이 겹칩니다. 구간을 확인해 주세요.'; });
    if (bad) { A.toast(bad, 'err'); return; }
    var interval = +document.getElementById('scI').value, cap = +document.getElementById('scC').value;
    var days = +document.getElementById('scD').value, cancelHours = +document.getElementById('scX').value, mode = document.getElementById('scM').value;
    if (!Number.isInteger(cap) || cap < 1 || cap > 20 || ![15,20,30,60].includes(interval) || ![14,30,60].includes(days) || ![1,2,3,24].includes(cancelHours) || !['request','instant'].includes(mode)) { A.toast('시간 간격·정원(1~20명)·예약 규칙을 확인해 주세요.', 'err'); return; }
    /* 변경으로 운영 시간 밖이 되는 예약 확인 */
    var t = U.ymd(U.today()), test = { week: nw, interval: interval };
    var orphan = D.RES.filter(function (x) { if (x.bid !== SF.bid || x.did !== SF.did || x.date < t || (x.status !== 'request' && x.status !== 'confirm')) return false; return D.slotTimes(test, x.date).indexOf(x.time) < 0; });
    var owner = SF.bid, did = SF.did, actor = S.admin;
    var capacityConflicts = D.RES.filter(function(x) { return x.bid === owner && x.did === did && x.date >= t && ['request','confirm'].includes(x.status) && ENG.used(owner,did,x.date,x.time) > cap; });
    orphan = orphan.concat(capacityConflicts.filter(function(x) { return orphan.indexOf(x) < 0; }));
    var apply = function () {
      if (!allowed(S.admin === actor && canB(owner))) return;
      sc.week = nw; sc.interval = interval; sc.cap = cap; sc.days = days; sc.cancelHours = cancelHours; sc.mode = mode;
      audit(bName(SF.bid) + ' ' + D.dept(SF.did).name + ' 예약 스케줄 변경'); A.render(); A.toast('저장했습니다. 사용자 예약 화면에 바로 반영됩니다', 'ok');
    };
    if (orphan.length) A.confirm('변경 내용을 확인할 기존 예약 ' + orphan.length + '건', '<p class="small">변경 후 운영 시간 밖에 놓이거나 새 정원을 초과하는 기존 예약이 있습니다. 예약은 유지됩니다. 연락 대상과 조치 방법을 확인한 뒤 저장해 주세요.</p><ul class="feed mt8">' + orphan.slice(0, 6).map(function (x) { return '<li><span class="fdot w"></span>' + U.md(x.date) + ' ' + x.time + ' · ' + U.maskName(x.name) + ' · ' + U.maskPhone(x.phone) + '</li>'; }).join('') + '</ul>', '확인하고 저장', apply);
    else apply();
  };
  ACT.excAdd = function () {
    var l = lockB();
    var m = A.modal({ title: '휴진 · 예외 일정 등록', icon: 'alert', body: '<div class="g2"><div class="fld"><label for="exD">날짜</label><input class="inp" type="date" id="exD" value="' + D.DEMO_EXC + '"></div><div class="fld"><label for="exT">유형</label><select class="sel" id="exT"><option value="휴진">종일 휴진</option><option value="단축">단축 진료</option></select></div>' +
      '<div class="fld"><label for="exB">지점</label>' + bSel('id="exB"', SF.bid, l ? null : '전 지점') + '</div><div class="fld"><label for="exP">진료과</label><select class="sel" id="exP"><option value="all">전체 진료과</option>' + D.DEPTS.map(function (d) { return '<option value="' + d.id + '"' + (d.id === SF.did ? ' selected' : '') + '>' + d.name + '</option>'; }).join('') + '</select></div>' +
      '<div class="fld"><label for="exU">단축 시 종료 시각</label><input class="inp" id="exU" value="12:30"></div><div class="fld"><label for="exN">사유</label><input class="inp" id="exN" maxlength="500" value="학회 참석"></div></div>' +
      '<p class="note mt12">' + ic('info', 's') + '<span>이미 예약이 있는 날짜에 등록하면 영향을 받는 예약을 먼저 보여 드립니다.</span></p>', foot: '<button class="btn o" data-x>취소</button><button class="btn p" id="exOk">등록</button>' });
    m.el.querySelector('#exOk').addEventListener('click', function () {
      var e = { id: 'ex' + Date.now(), date: m.el.querySelector('#exD').value, type: m.el.querySelector('#exT').value, bid: m.el.querySelector('#exB').value || 'all', did: m.el.querySelector('#exP').value, until: m.el.querySelector('#exU').value, note: m.el.querySelector('#exN').value || '휴진' };
      if (e.type === '휴진') delete e.until;
      if (!U.validDate(e.date) || e.date < U.ymd(U.today()) || (e.type === '단축' && !U.validTime(e.until))) return A.toast('날짜와 종료 시각을 확인해 주세요.', 'err');
      if (!allowed(me() && (me().role === 'super' || e.bid === me().bid))) return;
      var actor = S.admin;
      var hit = D.RES.filter(function (x) { return x.date === e.date && (e.bid === 'all' || x.bid === e.bid) && (e.did === 'all' || x.did === e.did) && (x.status === 'request' || x.status === 'confirm') && (e.type === '휴진' || U.min(x.time) + D.sched(x.bid,x.did).interval > U.min(e.until)); });
      m.close();
      var save = function (cancel) {
        if (!allowed(S.admin === actor && me() && (me().role === 'super' || e.bid === me().bid))) return;
        D.EXC.push(e);
        if (cancel) hit.forEach(function (x) { x.status = 'cancel'; x.hist.push({ t: Date.now(), who: me().name, what: '휴진 등록으로 취소 (' + e.note + ')' }); });
        audit('예외 일정 등록 ' + e.date + ' ' + e.type + (cancel ? ' · 영향 예약 ' + hit.length + '건 취소' : ''));
        A.render(); A.toast('예외 일정을 등록했습니다. 해당 시간은 사용자 화면에서 예약할 수 없습니다', 'ok');
      };
      if (!hit.length) return save(false);
      var mm = A.modal({ wide: true, title: '이 일정에 이미 예약 ' + hit.length + '건이 있습니다', icon: 'alert', body: '<p class="note warn">' + ic('alert', 's') + '<span>휴진을 등록하면 새 예약은 막히지만, 이미 받은 예약은 환자에게 연락해 처리해야 합니다. 연락 대상 목록을 확인해 주세요.</span></p><div class="tw mt12"><table class="t"><thead><tr><th>시간</th><th>지점·진료과</th><th>예약자</th><th>연락처</th><th>상태</th></tr></thead><tbody>' + hit.map(function (x) { return '<tr><td>' + x.time + '</td><td>' + D.branch(x.bid).short + ' ' + D.dept(x.did).name + '</td><td>' + U.maskName(x.name) + '</td><td>' + U.maskPhone(x.phone) + '</td><td>' + stB(x.status) + '</td></tr>'; }).join('') + '</tbody></table></div>',
        foot: '<button class="btn o" data-x>등록 보류</button><button class="btn o" id="exKeep">예약 유지하고 등록</button><button class="btn d" id="exCancel">연락 후 예약 취소 처리</button>' });
      mm.el.querySelector('#exKeep').addEventListener('click', function () { mm.close(); save(false); });
      mm.el.querySelector('#exCancel').addEventListener('click', function () { mm.close(); save(true); });
    });
  };
  ACT.excDel = function (el) { var i = D.EXC.findIndex(function (e) { return e.id === el.dataset.id; }); if (i >= 0 && allowed(me() && (me().role === 'super' || D.EXC[i].bid === me().bid))) { audit('예외 일정 삭제 ' + D.EXC[i].date); D.EXC.splice(i, 1); A.render(); A.toast('삭제했습니다'); } };

  /* ================= 예약자 관리 ================= */
  var revealed = {};
  function patV() {
    var map = {};
    myRes().forEach(function (x) { var k = x.di; if (!map[k]) map[k] = { di: k, name: x.name, phone: x.phone, birth: x.birth, list: [] }; map[k].list.push(x); });
    var arr = Object.keys(map).map(function (k) { return map[k]; }).sort(function (a, b) { return b.list.length - a.list.length; });
    return '<div class="pnl"><div class="hd"><h3>' + ic('user', 's') + '예약자 ' + arr.length + '명 <span class="small muted" style="font-weight:500">· 회원가입 없이 본인인증 결과로 같은 사람을 묶어 보여 줍니다</span></h3></div>' +
      '<p class="note">' + ic('lock', 's') + '<span>목록은 이름·연락처를 가려 표시합니다. 「열람」을 누르면 사유를 입력해야 하며, 열람 기록은 「권한 · 접속 기록」에 남습니다.</span></p>' +
      '<div class="tw mt12"><table class="t"><thead><tr><th>예약자</th><th>생년월일</th><th>연락처</th><th>예약</th><th>최근 예약</th><th></th></tr></thead><tbody>' +
      arr.slice(0, 40).map(function (p) { var r = revealed[p.di], last = p.list.slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; })[0]; return '<tr><td><b>' + (r ? U.esc(p.name) : U.maskName(p.name)) + '</b></td><td class="small">' + (r ? p.birth : p.birth.slice(0, 4) + '-**-**') + '</td><td class="small">' + (r ? p.phone : U.maskPhone(p.phone)) + '</td><td>' + p.list.length + '건 ' + (p.list.some(function (x) { return x.status === 'noshow'; }) ? bdg('미내원 이력', 'err', 1) : '') + '</td><td class="small">' + U.md(last.date) + ' · ' + D.branch(last.bid).short + ' ' + D.dept(last.did).name + '</td><td style="text-align:right">' + (r ? bdg('열람 중', 'warn', 1) : '<button class="btn o xs" data-act="patShow" data-di="' + p.di + '">' + ic('eye', 's') + '열람</button>') + '</td></tr>'; }).join('') + '</tbody></table></div></div>';
  }
  ACT.patShow = function (el) {
    var di = el.dataset.di; if (!allowed(myRes().some(function(x) { return x.di === di; }))) return; var actor = S.admin;
    var m = A.modal({ title: '개인정보 열람 사유', icon: 'lock', body: '<div class="fld"><label for="pvR">사유</label><select class="sel" id="pvR"><option>예약 시간 변경 전화 안내</option><option>휴진에 따른 예약 취소 안내</option><option>환자 본인 요청 확인</option></select></div><p class="hint mt8">열람 기록(열람자·시각·사유·IP)이 남고, 화면 이동 시 다시 가려집니다.</p>', foot: '<button class="btn o" data-x>취소</button><button class="btn p" id="pvOk">열람</button>' });
    m.el.querySelector('#pvOk').addEventListener('click', function () { if (!allowed(S.admin === actor && myRes().some(function(x) { return x.di === di; }))) return; revealed[di] = true; audit('예약자 상세 열람 — 사유: ' + m.el.querySelector('#pvR').value); m.close(); A.render(); });
  };
  var revealKey = '';
  A.beforeRender.push(function(r) { var key = String(S.admin) + ':' + r.p.join('/'); if (key !== revealKey) revealed = {}; revealKey = key; });

  /* ================= 문의 관리 ================= */
  function inqV() {
    var list = myInq();
    return '<div class="pnl"><div class="hd"><h3>' + ic('msg', 's') + '문의 ' + list.length + '건 · 답변 대기 ' + list.filter(function (q) { return q.status === 'wait'; }).length + '건</h3></div><div class="tw"><table class="t"><thead><tr><th>상태</th><th>제목</th><th>지점 · 분류</th><th>작성자</th><th>등록</th><th></th></tr></thead><tbody>' +
      list.map(function (q) { return '<tr><td class="nw">' + (q.status === 'wait' ? bdg('답변 대기', 'warn') : bdg('답변 완료', 'ok')) + '</td><td><b>' + U.esc(q.title) + '</b><br><span class="small muted">' + U.esc(q.body).slice(0, 60) + '</span></td><td class="nw small">' + bName(q.bid) + ' · ' + q.cat + '</td><td class="nw small">' + U.maskName(q.name) + '<br>' + U.maskPhone(q.phone) + '</td><td class="nw small muted">' + U.ago(q.at) + '</td><td class="nw" style="text-align:right"><button class="btn ' + (q.status === 'wait' ? 'p' : 'o') + ' xs" data-act="inqOpen" data-id="' + q.id + '">' + (q.status === 'wait' ? '답변' : '보기') + '</button></td></tr>'; }).join('') + '</tbody></table></div></div>';
  }
  ACT.inqOpen = function (el) {
    var q = D.INQ.filter(function (x) { return x.id === el.dataset.id; })[0];
    if (!q || !allowed(canB(q.bid))) return; var actor = S.admin;
    var m = A.modal({ wide: true, title: q.title, icon: 'msg', body: '<p class="small muted">' + bName(q.bid) + ' · ' + q.cat + ' · ' + U.maskName(q.name) + ' · ' + U.dt(q.at) + '</p><div class="card pad mt12" style="white-space:pre-line">' + U.esc(q.body) + '</div>' +
      '<div class="fld mt16"><label for="iqAns">답변 (남긴 연락처로 안내 · 처리 기록 보관)</label><textarea class="ta" id="iqAns">' + U.esc(q.answer || '') + '</textarea></div>' + (q.answeredAt ? '<p class="hint mt8">' + U.dt(q.answeredAt) + ' · ' + q.answeredBy + ' 답변</p>' : ''), foot: '<button class="btn o" data-x>닫기</button><button class="btn p" id="iqSave">답변 저장</button>' });
    m.el.querySelector('#iqSave').addEventListener('click', function () { if (!allowed(S.admin === actor && canB(q.bid))) return; var v = m.el.querySelector('#iqAns').value.trim(); if (!v) return A.toast('답변을 입력해 주세요', 'err'); q.answer = v; q.status = 'done'; q.answeredAt = Date.now(); q.answeredBy = me().label; audit('문의 답변 등록 — ' + q.title); m.close(); A.render(); A.toast('답변을 저장했습니다', 'ok'); });
  };

  /* ================= 게시판 ================= */
  function boardV() {
    var l = lockB();
    var list = D.POSTS.filter(function (p) { return p.type === BF.type && (!l || p.scope.indexOf('all') >= 0 || p.scope.indexOf(l) >= 0); }).sort(function (a, b) { return (b.pin ? 1 : 0) - (a.pin ? 1 : 0) || b.at - a.at; });
    return '<div class="pnl"><div class="hd"><div class="seg">' + ['notice', 'press', 'faq'].map(function (t) { return '<button data-act="bfType" data-v="' + t + '" class="' + (BF.type === t ? 'on' : '') + '">' + D.BTYPE[t] + '</button>'; }).join('') + '</div><button class="btn p sm" data-act="postEdit">' + ic('plus', 's') + '새 글</button></div>' +
      '<div class="tw"><table class="t"><thead><tr><th>제목</th><th>노출 지점</th><th>등록</th><th>조회</th><th>공개</th><th></th></tr></thead><tbody>' +
      list.map(function (p) { var mine = !l || (p.scope.length === 1 && p.scope[0] === l); return '<tr><td>' + (p.pin ? bdg('고정', 'acc', 1) + ' ' : '') + '<b>' + U.esc(p.title) + '</b></td><td class="nw">' + A.scopeLabel(p.scope) + '</td><td class="nw small muted">' + U.date(p.at) + '</td><td class="small">' + p.views + '</td><td><button class="tgl ' + (p.hidden ? '' : 'on') + '" data-act="postHide" data-id="' + p.id + '" aria-label="공개 여부"' + (mine ? '' : ' aria-disabled="true" data-why="전 지점 공통 글은 전체 관리자만 수정할 수 있습니다"') + '></button></td><td class="nw" style="text-align:right"><a class="btn g xs" href="#/post/' + p.id + '" aria-label="사이트에서 보기">' + ic('eye', 's') + '</a><button class="btn o xs" aria-label="게시글 수정" data-act="postEdit" data-id="' + p.id + '"' + (mine ? '' : ' aria-disabled="true" data-why="전 지점 공통 글은 전체 관리자만 수정할 수 있습니다"') + '>' + ic('edit', 's') + '</button></td></tr>'; }).join('') + '</tbody></table></div></div>';
  }
  ACT.bfType = function (el) { BF.type = el.dataset.v; A.render(); };
  ACT.postHide = function (el) { var p = D.post(el.dataset.id); if (!p || !allowed(canScope(p.scope))) return; p.hidden = !p.hidden; audit('게시글 ' + (p.hidden ? '비공개' : '공개') + ' — ' + p.title); A.render(); A.toast(p.hidden ? '비공개로 바꿨습니다. 목록과 직접 주소 모두에서 보이지 않습니다' : '공개했습니다'); };
  ACT.postEdit = function (el) {
    var p = el.dataset.id ? D.post(el.dataset.id) : null, l = lockB();
    if (p && !allowed(canScope(p.scope))) return; var actor = S.admin;
    var sc = p ? p.scope : (l ? [l] : ['all']);
    var m = A.modal({ wide: true, title: p ? '게시글 수정' : D.BTYPE[BF.type] + ' 새 글', icon: 'edit', body:
      '<div class="fld"><label for="peT">제목</label><input class="inp" id="peT" value="' + U.esc(p ? p.title : '') + '" maxlength="80"></div>' +
      '<div class="fld mt12"><span class="lbl">노출 지점</span><div class="row wr" id="peS">' + (l ? '' : '<label class="chip ' + (sc.indexOf('all') >= 0 ? 'on' : '') + '"><input type="checkbox" class="sr" value="all"' + (sc.indexOf('all') >= 0 ? ' checked' : '') + '>전 지점 공통</label>') + D.BRANCHES.filter(function (b) { return !l || b.id === l; }).map(function (b) { var on = sc.indexOf(b.id) >= 0; return '<label class="chip ' + (on ? 'on' : '') + '"><input type="checkbox" class="sr" value="' + b.id + '"' + (on ? ' checked' : '') + '>' + b.short + '</label>'; }).join('') + '</div><span class="hint">전 지점 공통을 고르면 모든 지점 홈과 게이트웨이에 노출됩니다.</span></div>' +
       '<div class="fld mt12"><label for="peB">본문</label><textarea class="ta" id="peB" maxlength="100000" style="min-height:180px">' + U.esc(p ? p.body : '') + '</textarea><span class="hint">줄바꿈을 지원하는 텍스트 편집입니다.</span></div>' +
      '<div class="row wr mt12"><label class="chk"><input type="checkbox" id="peP"' + (p && p.pin ? ' checked' : '') + '><span>상단 고정</span></label><span class="hint">저장 시 위험한 태그는 제거하고 저장합니다.</span></div>',
      foot: '<button class="btn o" data-x>취소</button><button class="btn p" id="peOk">' + (p ? '수정' : '등록') + '</button>' });
    m.el.querySelectorAll('#peS label').forEach(function (lb) { lb.querySelector('input').addEventListener('change', function (e) { lb.classList.toggle('on', e.target.checked); if (e.target.value === 'all' && e.target.checked) m.el.querySelectorAll('#peS input').forEach(function (i) { if (i.value !== 'all') { i.checked = false; i.parentNode.classList.remove('on'); } }); if (e.target.value !== 'all' && e.target.checked) { var a = m.el.querySelector('#peS input[value="all"]'); if (a) { a.checked = false; a.parentNode.classList.remove('on'); } } }); });
    m.el.querySelector('#peOk').addEventListener('click', function () {
      var t = m.el.querySelector('#peT').value.trim(), b = m.el.querySelector('#peB').value.trim().replace(/<[^>]*>/g, '');
      var s = Array.prototype.map.call(m.el.querySelectorAll('#peS input:checked'), function (i) { return i.value; });
      if (!t || !b || t.length > 80 || b.length > 100000) return A.toast('제목(80자 이내)과 본문(100,000자 이내)을 확인해 주세요.', 'err');
      if (!s.length) return A.toast('노출 지점을 하나 이상 선택해 주세요', 'err');
      if (!allowed(S.admin === actor && canScope(s) && (!p || canScope(p.scope)))) return;
      if (p) { p.title = t; p.body = b; p.scope = s; p.pin = m.el.querySelector('#peP').checked; }
      else D.POSTS.push({ id: 'P' + (D.POSTS.length + 200), type: BF.type, scope: s, title: t, body: b, at: Date.now(), views: 0, pin: m.el.querySelector('#peP').checked, order: 99, cat: '기타' });
      audit('게시글 ' + (p ? '수정' : '등록') + ' 「' + t + '」 (노출: ' + (s.indexOf('all') >= 0 ? '전 지점' : s.map(bName).join(', ')) + ')');
      m.close(); A.render(); A.toast('저장했습니다. 선택한 지점 화면에 바로 노출됩니다', 'ok');
    });
  };

  /* ================= 배너 · 팝업 ================= */
  var bannerTargets = { reserve:'진료 예약', screening:'건강검진 예약', lookup:'예약 조회', notice:'공지사항', faq:'자주 묻는 질문', inquiry:'온라인 문의', branch:'지점 안내' };
  var bannerTones = { teal:'딥 그린', coral:'웜 브라운', navy:'포레스트' };
  function bannerState(x) {
    var today = U.ymd(new Date());
    return !x.on ? bdg('숨김', 'gray') : x.from > today ? bdg('노출 예정', 'info') : x.to < today ? bdg('노출 종료', 'gray') : bdg('노출 중', 'ok');
  }
  function bannerV() {
    var list = D.BANNERS.filter(function(x) { return !lockB() || x.scope.indexOf('all') >= 0 || x.scope.indexOf(lockB()) >= 0; });
    return '<div class="pnl"><div class="hd"><div><h3>메인 배너 · 팝업</h3><p class="hint mt4">노출 지점·기간과 이동할 화면을 설정하세요. 종료일 다음 날부터 자동으로 숨겨집니다.</p></div><button class="btn p sm" data-act="bnEdit">' + ic('plus', 's') + '배너·팝업 등록</button></div><div class="g3">' +
      list.map(function (x) { var writable = canScope(x.scope); return '<div class="card" style="overflow:hidden"><div class="bnr ' + x.tone + '" style="border-radius:0;min-height:132px;padding:20px"><div><span class="tiny" style="opacity:.8;font-weight:800;letter-spacing:.1em">' + (x.kind === 'popup' ? 'POPUP' : 'BANNER') + '</span><h3 style="font-size:1.1rem">' + U.esc(x.title) + '</h3><p class="small">' + U.esc(x.sub) + '</p></div></div><div style="padding:16px" class="col"><div class="row sb">' + bannerState(x) + '<button class="tgl ' + (x.on ? 'on' : '') + '" data-act="bnTgl" data-id="' + x.id + '" aria-label="' + U.esc(x.title) + ' 노출" aria-pressed="' + !!x.on + '"' + (writable ? '' : ' disabled') + '></button></div><span class="small muted">' + U.date(x.from) + ' ~ ' + U.date(x.to) + '</span><div>' + A.scopeLabel(x.scope) + '</div><span class="hint">이동 화면 · ' + (bannerTargets[x.target] || (x.kind === 'popup' ? '공지사항' : '진료 예약')) + '</span><div class="row sb">' + (writable ? '<button class="btn o sm" data-act="bnEdit" data-id="' + x.id + '">' + ic('edit', 's') + '수정</button>' : '<span class="hint">공통·여러 지점 항목은 전체 관리자만 수정</span>') + '<a class="btn g sm" href="' + (x.scope.indexOf('all') >= 0 ? '#/' : '#/b/' + x.scope[0]) + '">사이트 보기 ' + ic('arrow', 's') + '</a></div></div></div>'; }).join('') + (list.length ? '' : '<p class="empty">등록된 배너·팝업이 없습니다.</p>') + '</div></div>';
  }
  ACT.bnTgl = function (el) { var x = D.BANNERS.filter(function (b) { return b.id === el.dataset.id; })[0]; if (!x || !allowed(canScope(x.scope))) return; x.on = !x.on; audit((x.kind === 'popup' ? '팝업' : '배너') + ' ' + (x.on ? '노출 허용' : '숨김') + ' — ' + x.title); A.render(); };
  ACT.bnEdit = function(el) {
    var x = el.dataset.id ? D.BANNERS.find(function(b) { return b.id === el.dataset.id; }) : null;
    if ((el.dataset.id && !x) || (x && !allowed(canScope(x.scope)))) return;
    var actor = S.admin, l = lockB(), scope = x ? x.scope : l ? [l] : ['all'], closed = false;
    var today = U.ymd(new Date()), end = U.ymd(U.addDays(new Date(), 30));
    function options(values, current) { return Object.keys(values).map(function(k) { return '<option value="' + k + '"' + (current === k ? ' selected' : '') + '>' + values[k] + '</option>'; }).join(''); }
    var m = A.modal({wide:true, title:x ? '배너·팝업 수정' : '배너·팝업 등록', icon:'mega', onClose:function() { closed = true; }, body:
      '<div class="g2"><div class="fld"><label for="beKind">유형</label><select class="sel" id="beKind"><option value="banner"' + (!x || x.kind === 'banner' ? ' selected' : '') + '>배너</option><option value="popup"' + (x && x.kind === 'popup' ? ' selected' : '') + '>팝업</option></select></div><div class="fld"><label for="beTone">색상</label><select class="sel" id="beTone">' + options(bannerTones, x ? x.tone : 'teal') + '</select></div></div>' +
      '<div class="fld mt16"><label class="req" for="beTitle">제목</label><input class="inp" id="beTitle" maxlength="60" value="' + U.esc(x ? x.title : '') + '" placeholder="예: 건강검진 예약 안내"></div><div class="fld mt12"><label for="beSub">안내 문구</label><textarea class="ta" id="beSub" maxlength="180" rows="2">' + U.esc(x ? x.sub : '') + '</textarea></div>' +
      '<div class="g2 mt16"><div class="fld"><label class="req" for="beFrom">노출 시작일</label><input class="inp" type="date" id="beFrom" value="' + (x ? x.from : today) + '"></div><div class="fld"><label class="req" for="beTo">노출 종료일</label><input class="inp" type="date" id="beTo" value="' + (x ? x.to : end) + '"></div></div>' +
      '<fieldset class="promo-scope mt16"><legend class="lbl">노출 지점</legend><div class="row wr" id="beScope">' + (l ? '' : '<label class="chk"><input type="checkbox" value="all"' + (scope.indexOf('all') >= 0 ? ' checked' : '') + '><span>전 지점 공통</span></label>') + D.BRANCHES.filter(function(b) { return !l || b.id === l; }).map(function(b) { return '<label class="chk"><input type="checkbox" value="' + b.id + '"' + (scope.indexOf(b.id) >= 0 ? ' checked' : '') + '><span>' + b.name + '</span></label>'; }).join('') + '</div></fieldset>' +
      '<div class="fld mt16"><label for="beTarget">클릭 시 이동할 화면</label><select class="sel" id="beTarget">' + options(bannerTargets, x ? x.target || (x.kind === 'popup' ? 'notice' : 'reserve') : 'reserve') + '</select></div><label class="chk mt16"><input type="checkbox" id="beOn"' + (!x || x.on ? ' checked' : '') + '><span>설정한 기간에 노출</span></label>' +
      '<div class="mt16"><span class="lbl">내용 미리보기</span><div id="bePreview" class="mt8"></div></div><p class="hint err mt12" id="beError" role="alert"></p>',
      foot:'<button class="btn o" data-x>취소</button><button class="btn p" id="beSave">' + (x ? '저장' : '등록') + '</button>'});
    var $ = function(id) { return m.el.querySelector('#' + id); };
    function preview() { var tone = Object.prototype.hasOwnProperty.call(bannerTones, $('beTone').value) ? $('beTone').value : 'teal'; $('bePreview').innerHTML = '<div class="bnr ' + tone + '"><div><h3>' + U.esc($('beTitle').value.trim() || '제목을 입력해 주세요') + '</h3><p>' + U.esc($('beSub').value.trim() || '안내 문구가 표시됩니다.') + '</p></div></div>'; }
    ['beTitle','beSub','beTone'].forEach(function(id) { $(id).addEventListener(id === 'beTone' ? 'change' : 'input', preview); });
    m.el.querySelectorAll('#beScope input').forEach(function(input) { input.addEventListener('change',function() { if (!input.checked) return; m.el.querySelectorAll('#beScope input').forEach(function(other) { if ((input.value === 'all' && other.value !== 'all') || (input.value !== 'all' && other.value === 'all')) other.checked = false; }); }); });
    preview();
    $('beSave').addEventListener('click',function() {
      if (closed) return;
      var value = {kind:$('beKind').value, title:$('beTitle').value.trim(), sub:$('beSub').value.trim(), from:$('beFrom').value, to:$('beTo').value, tone:$('beTone').value, target:$('beTarget').value, on:$('beOn').checked, scope:Array.from(m.el.querySelectorAll('#beScope input:checked')).map(function(input) { return input.value; })};
      function error(t) { $('beError').textContent = t; }
      if (!value.title || value.title.length > 60 || value.sub.length > 180) return error('제목은 1~60자, 안내 문구는 180자 이내로 입력해 주세요.');
      if (!U.validDate(value.from) || !U.validDate(value.to) || value.from > value.to) return error('노출 시작일과 종료일을 확인해 주세요. 종료일은 시작일보다 빠를 수 없습니다.');
      if (!['banner','popup'].includes(value.kind) || !Object.prototype.hasOwnProperty.call(bannerTones,value.tone) || !Object.prototype.hasOwnProperty.call(bannerTargets,value.target)) return error('유형·색상·이동 화면을 확인해 주세요.');
      if (!value.scope.length || value.scope.some(function(id) { return id !== 'all' && !D.branch(id); }) || (value.scope.includes('all') && value.scope.length !== 1)) return error('노출 지점을 하나 이상 선택해 주세요. 전 지점 공통은 다른 지점과 함께 선택할 수 없습니다.');
      if (!allowed(S.admin === actor && canScope(value.scope) && (!x || (D.BANNERS.includes(x) && canScope(x.scope))))) return;
      value.updatedAt = Date.now();
      if (x) Object.assign(x,value); else { value.id = 'B' + (D.BANNERS.reduce(function(n,b) { return Math.max(n, Number(b.id.slice(1)) || 0); },0) + 1); D.BANNERS.unshift(value); }
      audit((value.kind === 'popup' ? '팝업' : '배너') + ' ' + (x ? '수정' : '등록') + ' — ' + value.title);
      m.close(); A.render(); A.toast('저장했습니다. 노출 지점과 기간에 맞춰 사이트에 반영됩니다.', 'ok');
    });
  };

  /* ================= 지점 · 진료과 ================= */
  function orgV() {
    var l = lockB();
    return '<div class="pnl"><div class="hd"><h3>' + ic('building', 's') + '지점별 운영 진료과</h3><span class="small muted">켜고 끄면 지점 홈 메뉴·진료과 페이지·예약 선택지가 함께 바뀝니다</span></div>' +
      (l ? '<p class="note warn">' + ic('lock', 's') + '<span>진료과 운영 구성은 전체 관리자만 변경합니다. 지점 관리자는 아래에서 자기 지점의 기본 정보를 수정할 수 있습니다.</span></p>' : '') +
      '<div class="tw mt12"><table class="mx"><thead><tr><th>진료과</th>' + D.BRANCHES.map(function (b) { return '<th>' + dot(b.color) + ' ' + b.short + '</th>'; }).join('') + '</tr></thead><tbody>' +
      D.DEPTS.map(function (d) { return '<tr><td><b>' + d.name + '</b></td>' + D.BRANCHES.map(function (b) { var on = D.BRANCH_DEPTS[b.id].indexOf(d.id) >= 0; return '<td><button class="tgl ' + (on ? 'on' : '') + '" data-act="orgTgl" data-b="' + b.id + '" data-d="' + d.id + '" aria-label="' + b.short + ' ' + d.name + ' 운영"' + (l ? ' aria-disabled="true" data-why="전체 관리자만 변경할 수 있습니다"' : '') + '></button></td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div></div>' +
      '<div class="g2"><div class="pnl"><div class="hd"><h3>' + ic('pin', 's') + '지점 정보</h3></div>' + D.BRANCHES.filter(function (b) { return !l || b.id === l; }).map(function (b) { return '<div class="row sb wr branch-info-row"><span class="grow small">' + dot(b.color) + ' <b>' + b.name + '</b><br><span class="muted">' + U.esc(b.addr) + ' · ' + U.esc(b.tel) + '</span></span><div class="row"><button class="btn o xs" data-act="branchEdit" data-id="' + b.id + '">' + ic('edit', 's') + '수정</button><a class="btn g xs" href="#/b/' + b.id + '">' + ic('eye', 's') + '보기</a></div></div>'; }).join('') + '<p class="hint mt12">주소·전화·주차·대중교통·층별 안내를 수정할 수 있습니다. 지점 관리자는 자기 지점의 기본 정보만 수정합니다.</p></div>' +
      '<div class="pnl"><div class="hd"><h3>' + ic('layers', 's') + '운영 설정 안내</h3></div><ul class="feed"><li><span class="fdot"></span>진료과 운영 여부를 변경하면 홈페이지의 진료과 안내와 예약 선택지에 함께 반영됩니다</li><li><span class="fdot"></span>진료과별 운영 시간은 「예약 스케줄」에서, 주소·연락처는 「지점 정보」에서 수정합니다</li><li><span class="fdot"></span>운영을 끄더라도 이미 받은 예약은 유지되고 「예약 관리」에서 처리할 수 있습니다</li></ul></div></div>';
  }
  ACT.orgTgl = function (el) {
    if (!allowed(me() && me().role === 'super')) return;
    var b = el.dataset.b, d = el.dataset.d; if (!D.branch(b) || !D.dept(d)) return; var arr = D.BRANCH_DEPTS[b], i = arr.indexOf(d);
    if (i >= 0) { if (arr.length <= 1) return A.toast('지점마다 최소 1개 진료과가 필요합니다', 'err'); arr.splice(i, 1); }
    else arr.push(d);
    audit(bName(b) + ' ' + D.dept(d).name + ' 운영 ' + (i >= 0 ? '중지' : '시작'));
    A.render(); A.toast(bName(b) + ' ' + D.dept(d).name + ' — ' + (i >= 0 ? '운영 중지: 메뉴와 예약 선택지에서 빠졌습니다' : '운영 시작: 메뉴와 예약에 추가되었습니다'), 'ok');
  };
  ACT.branchEdit = function(el) {
    var b = D.branch(el.dataset.id);
    if (!b || !allowed(canB(b.id))) return;
    var actor = S.admin;
    var fields = [
      {key:'tag', label:'지점 소개', max:60, required:false},
      {key:'addr', label:'주소', max:180, required:true},
      {key:'tel', label:'대표전화', max:20, required:true, type:'tel'},
      {key:'floors', label:'층별 안내', max:180, required:false},
      {key:'park', label:'주차 안내', max:500, required:false, multiline:true},
      {key:'bus', label:'대중교통 안내', max:500, required:false, multiline:true}
    ];
    var closed = false;
    var m = A.modal({wide:true, title:b.name + ' 정보 수정', icon:'building', onClose:function() { closed = true; }, body:
      '<p class="hint">저장한 정보는 지점 홈·오시는 길·예약 안내·하단 연락처에 함께 반영됩니다. 진료시간은 「예약 스케줄」에서 관리하세요.</p><div class="g2 mt16">' + fields.map(function(f) { var id = 'branch_' + f.key; return '<div class="fld"><label for="' + id + '"' + (f.required ? ' class="req"' : '') + '>' + f.label + (f.required ? '' : ' (선택)') + '</label>' + (f.multiline ? '<textarea class="ta" id="' + id + '" maxlength="' + f.max + '" rows="3">' + U.esc(b[f.key] || '') + '</textarea>' : '<input class="inp" id="' + id + '" type="' + (f.type || 'text') + '" maxlength="' + f.max + '" value="' + U.esc(b[f.key] || '') + '">') + (f.key === 'tel' ? '<span class="hint">예: 031-123-4567, 02-1234-5678, 1588-1234</span>' : '') + '</div>'; }).join('') + '</div><p class="hint err mt12" id="branchError" role="alert"></p>',
      foot:'<button class="btn o" data-x>취소</button><button class="btn p" id="branchSave">저장</button>'});
    m.el.querySelector('#branchSave').addEventListener('click',function() {
      if (closed || !allowed(S.admin === actor && canB(b.id))) return;
      var values = {}, error = '';
      fields.forEach(function(f) { var value = m.el.querySelector('#branch_' + f.key).value.trim(); values[f.key] = value; if ((f.required && !value) || value.length > f.max) error = f.label + ' 항목을 확인해 주세요. 최대 ' + f.max + '자까지 입력할 수 있습니다.'; });
      if (!error && !/^(?:0\d{1,2}-\d{3,4}-\d{4}|1[568]\d{2}-\d{4})$/.test(values.tel)) error = '대표전화의 번호와 하이픈 형식을 확인해 주세요.';
      if (error) { m.el.querySelector('#branchError').textContent = error; return; }
      Object.assign(b, values);
      audit(b.name + ' 기본 정보 수정'); m.close(); A.render(); A.toast('지점 정보를 저장했습니다. 사용자 화면에 함께 반영됩니다.', 'ok');
    });
  };

  /* ================= 통계 ================= */
  var statMode = 'week';
  ACT.statMode = function(el) { statMode = el.dataset.v; A.render(); };
  function statsV() {
    var l = lockB(), bs = l ? [D.branch(l)] : D.BRANCHES, rs = myRes();
    var W = statMode === 'month' ? Array.from({length:6},function(_,k) { var d = new Date(U.today().getFullYear(), U.today().getMonth() - 5 + k,1), key = U.ymd(d).slice(0,7), o = {label:(d.getMonth()+1)+'월'}; bs.forEach(function(b) { o[b.id] = rs.filter(function(r) { return r.bid === b.id && r.date.slice(0,7) === key && r.status !== 'cancel'; }).length; }); return o; }) : D.WEEKLY, max = 1;
    W.forEach(function (o) { var s = bs.reduce(function (a, b) { return a + o[b.id]; }, 0); if (s > max) max = s; });
    var h = '<div class="pnl"><div class="filt"><span class="small muted">기간</span><div class="seg"><button data-act="statMode" data-v="week" class="' + (statMode === 'week' ? 'on' : '') + '">최근 8주</button><button data-act="statMode" data-v="month" class="' + (statMode === 'month' ? 'on' : '') + '">월별</button></div><span class="grow"></span><button class="btn o sm" data-act="statCsv">' + ic('down', 's') + '엑셀(CSV)</button></div></div>';
    h += '<div class="pnl"><div class="hd"><h3>' + ic('chart', 's') + '' + (statMode === 'month' ? '월별 예약 추이' : '주간 예약 추이') + '</h3><div class="legend">' + bs.map(function (b) { return '<span><i style="background:' + b.color + '"></i>' + b.short + '</span>'; }).join('') + '</div></div><div class="bars" style="height:220px">' +
      W.map(function (o) { var s = bs.reduce(function (a, b) { return a + o[b.id]; }, 0); return '<div class="bc"><b class="small">' + s + '</b><div class="stk" style="height:' + (s / max * 170) + 'px">' + bs.map(function (b) { return '<i style="background:' + b.color + ';flex:' + o[b.id] + '"></i>'; }).join('') + '</div><small>' + o.label + (statMode === 'week' ? '주' : '') + '</small></div>'; }).join('') + '</div><p class="hint mt8">최근 8주 추이는 가상 통계이며, 월별은 현재 체험 예약을 집계합니다. 아래 예약 결과는 전체 체험 예약 기준입니다.</p></div>';
    var byD = D.DEPTS.map(function (d) { return { d: d, n: rs.filter(function (x) { return x.did === d.id && x.status !== 'cancel'; }).length }; }).sort(function (a, b) { return b.n - a.n; });
    var dm = Math.max.apply(null, byD.map(function (x) { return x.n; }).concat([1]));
    var tot = rs.length, can = rs.filter(function (x) { return x.status === 'cancel'; }).length, ns = rs.filter(function (x) { return x.status === 'noshow'; }).length, dn = rs.filter(function (x) { return x.status === 'done'; }).length;
    h += '<div class="g2"><div class="pnl"><div class="hd"><h3>진료과별 예약</h3></div>' + byD.map(function (x) { return '<div class="hbar"><span class="small b">' + x.d.name + '</span><span class="tr"><i style="width:' + (x.n / dm * 100) + '%"></i></span><span class="small" style="text-align:right">' + x.n + '건</span></div>'; }).join('') + '</div>' +
      '<div class="pnl"><div class="hd"><h3>예약 결과</h3></div><div class="g2"><div class="kpi"><span class="l">내원 완료</span><div class="v">' + dn + '</div></div><div class="kpi"><span class="l">취소율</span><div class="v">' + (tot ? Math.round(can / tot * 100) : 0) + '<small>%</small></div></div><div class="kpi"><span class="l">미내원율</span><div class="v">' + (dn + ns ? Math.round(ns / (dn + ns) * 100) : 0) + '<small>%</small></div></div><div class="kpi"><span class="l">초진 비율</span><div class="v">' + (tot ? Math.round(rs.filter(function (x) { return x.first; }).length / tot * 100) : 0) + '<small>%</small></div></div></div>' +
      '<h4 class="mt16" style="font-size:.92rem">요일 × 시간대 예약 분포</h4><div class="heat mt8"><span class="h"></span>' + ['월', '화', '수', '목', '금', '토'].map(function (d) { return '<div class="h">' + d + '</div>'; }).join('') +
      [['09', '오전 9'], ['10', '10'], ['11', '11'], ['14', '오후 2'], ['15', '3'], ['16', '4'], ['17', '5']].map(function (hh) { return '<div class="h">' + hh[1] + '</div>' + [1, 2, 3, 4, 5, 6].map(function (wd) { var n = rs.filter(function (x) { return U.parse(x.date).getDay() === wd && x.time.slice(0, 2) === hh[0]; }).length; var a = Math.min(1, n / 8); return '<div style="background:rgba(49,95,89,' + (0.08 + a * 0.82) + ');color:' + (a > .45 ? '#fff' : 'var(--ink-2)') + '">' + n + '</div>'; }).join(''); }).join('') + '</div></div></div>';
    return h;
  }
  ACT.statCsv = function () { var rs = myRes(), rows = [['지점','진료과','전체 예약','내원 완료','취소','미내원']]; D.BRANCHES.filter(function(b) { return canB(b.id); }).forEach(function(b) { D.DEPTS.forEach(function(d) { var list = rs.filter(function(x) { return x.bid === b.id && x.did === d.id; }); if (list.length) rows.push([b.name,d.name,list.length,list.filter(function(x) { return x.status === 'done'; }).length,list.filter(function(x) { return x.status === 'cancel'; }).length,list.filter(function(x) { return x.status === 'noshow'; }).length]); }); }); csvDownload('lumen_statistics_' + U.ymd(new Date()) + '.csv', rows); audit('통계 내려받기'); A.toast('전체 체험 예약의 지점·진료과별 통계를 내려받았습니다.', 'ok'); };

  /* ================= 운영 환경 (NCP) ================= */
  function envV() {
    var E = D.ENV, l = lockB();
    var card = function (e, k) {
      var exp = Math.round((U.parse(e.ssl.exp) - U.today()) / 864e5);
      return '<div class="envc ' + k + '"><div class="hd">' + ic(k === 'prod' ? 'cloud' : 'layers') + '<b>' + e.label + '</b><span class="tiny" style="margin-left:auto;opacity:.85">' + e.version + '</span></div><dl>' +
        '<dt>도메인</dt><dd class="mono small">' + e.domain + '</dd><dt>웹 서버</dt><dd>' + e.web + '</dd><dt>DB</dt><dd>' + e.db + '</dd><dt>네트워크</dt><dd>' + e.net + '</dd><dt>접근 규칙</dt><dd><ul>' + e.acg.map(function (a) { return '<li>' + a + '</li>'; }).join('') + '</ul></dd>' +
        '<dt>SSL</dt><dd>' + e.ssl.kind + ' · 만료 ' + U.date(e.ssl.exp) + ' ' + bdg('D-' + exp, exp < 20 ? 'err' : 'ok', 1) + '<br><span class="tiny muted">자동 갱신 예정 ' + U.date(e.ssl.renew) + ' · 실패 시 알림</span></dd></dl></div>';
    };
    var h = '<p class="note">' + ic('info', 's') + '<span>Staging과 Production은 서버·DB·접근 규칙·도메인을 따로 둡니다. 모든 변경은 Staging에서 확인한 뒤 <b>같은 버전</b>을 Production에 반영합니다. 이 화면은 운영 상태를 보여 주는 시연용이며, 실제 NCP 콘솔 조작은 매뉴얼로 안내합니다.</span></p>';
    h += '<div class="envs">' + card(E.prod, 'prod') + card(E.stg, 'stg') + '</div>';
    var pend = E.deploys.filter(function (d) { return d.env === 'stg'; })[0];
    h += '<div class="pnl"><div class="hd"><h3>' + ic('refresh', 's') + '배포 흐름</h3><div class="row"><span class="small muted">사이트를</span><div class="seg"><button data-act="envView" data-v="production" class="' + (E.view !== 'staging' ? 'on' : '') + '">운영으로 보기</button><button data-act="envView" data-v="staging" class="' + (E.view === 'staging' ? 'on' : '') + '">Staging으로 보기</button></div></div></div>' +
      '<div class="pipe"><span class="st">' + ic('link', 's') + '사이트 저장소</span><span class="ar">' + ic('arrow') + '</span><span class="st ' + (pend ? 'on' : '') + '">' + ic('layers', 's') + 'Staging ' + E.stg.version + '</span><span class="ar">' + ic('arrow') + '</span><span class="st">' + ic('check', 's') + '운영 담당자 확인</span><span class="ar">' + ic('arrow') + '</span><span class="st">' + ic('cloud', 's') + 'Production ' + E.prod.version + '</span></div>' +
      (pend ? '<div class="card pad mt16"><div class="row sb wr"><div><b>' + pend.v + '</b> Staging 반영 · ' + U.ago(pend.at) + '<p class="small muted">' + pend.note + '</p></div><div class="row wr"><label class="chk"><input type="checkbox" data-ch="qaChk"' + (pend.checks.qa ? ' checked' : '') + (l ? ' disabled' : '') + '><span>Staging 확인 완료 (운영 승인)</span></label><button class="btn p sm" data-act="promote"' + (!pend.checks.qa || l ? ' aria-disabled="true" data-why="' + (l ? '배포는 전체 관리자 승인 후 진행합니다' : 'Staging 확인을 먼저 체크해 주세요') + '"' : '') + '>' + ic('up', 's') + 'Production 반영</button></div></div><p class="hint mt8">반영 전 운영 DB 백업을 자동으로 남기고, 문제가 생기면 이전 버전으로 되돌립니다.</p></div>' : '<p class="note ok mt16">' + ic('check', 's') + '<span>Staging과 Production이 같은 버전입니다.</span></p>') +
      '<div class="tw mt16"><table class="t"><thead><tr><th>버전</th><th>환경</th><th>내용</th><th>시각</th></tr></thead><tbody>' + E.deploys.map(function (d) { return '<tr><td class="mono">' + d.v + '</td><td>' + (d.env === 'prod' ? '<span class="envb prod">PROD</span>' : '<span class="envb stg">STG</span>') + '</td><td class="small">' + U.esc(d.note) + '</td><td class="small muted nw">' + U.dt(d.at) + '</td></tr>'; }).join('') + '</tbody></table></div></div>';
    h += '<div class="g2"><div class="pnl"><div class="hd"><h3>' + ic('db', 's') + '백업</h3><button class="btn o sm" data-act="restoreTest"' + (l ? ' aria-disabled="true" data-why="전체 관리자만 실행할 수 있습니다"' : '') + '>' + ic('refresh', 's') + '복구 시험</button></div>' +
      '<p class="small">DB 논리 백업 매일 03:10 · 보관 14일 · 운영 DB와 분리된 저장소 / 웹 서버 이미지 주 1회</p><p class="small mt4">최근 복구 시험 ' + U.date(E.restoreTest.at) + ' — ' + bdg(E.restoreTest.ok ? '정상' : '실패', E.restoreTest.ok ? 'ok' : 'err') + ' <span class="muted">' + U.esc(E.restoreTest.rows) + '</span></p>' +
      '<div class="tw mt12"><table class="t"><tbody>' + E.backups.slice(0, 8).map(function (b) { return '<tr><td class="nw small">' + U.dt(b.at) + '</td><td class="small">' + U.esc(b.kind) + '</td><td class="small muted">' + U.esc(b.size) + '</td><td>' + (b.ok ? bdg('성공', 'ok') : bdg('실패 → 재시도 성공', 'warn')) + '</td></tr>'; }).join('') + '</tbody></table></div></div>' +
      '<div class="pnl"><div class="hd"><h3>' + ic('doc', 's') + '운영 관리 안내</h3></div><ol style="margin:0;padding-left:20px;line-height:2" class="small"><li>계정·권한 (서브 계정 관리)</li><li>서버 접속 방법 (인증키 보관·접속 절차)</li><li><b>비상 시 재부팅 방법</b> (콘솔 재시작 · 웹/DB 서비스 재시작)</li><li><b>SSL 인증서 갱신 주기와 확인 방법</b></li><li><b>백업 확인 경로와 복구 절차</b></li><li>Staging → Production 배포 절차</li><li>접근 규칙(관리자 IP) 변경 방법</li><li>월 요금 확인과 Staging 정지·재시작</li><li>장애 시 연락 체계</li></ol><p class="hint mt8">계정·배포·백업 작업 전에는 관리 지침을 확인해 주세요.</p></div></div>';
    return h;
  }
  ACT.envView = function (el) { D.ENV.view = el.dataset.v; audit('사이트 보기 환경 전환 → ' + el.dataset.v); A.render(); A.toast(el.dataset.v === 'staging' ? 'Staging 환경으로 보고 있습니다 (화면 왼쪽 위 표시)' : '운영 환경으로 돌아왔습니다', el.dataset.v === 'staging' ? 'warn' : 'ok'); };
  ACT.qaChk = function (el) { if (!allowed(me() && me().role === 'super')) return; D.ENV.deploys.filter(function (d) { return d.env === 'stg'; })[0].checks.qa = el.checked; A.render(); };
  ACT.promote = function () {
    if (!allowed(me() && me().role === 'super')) return;
    var E = D.ENV, d = E.deploys.filter(function (x) { return x.env === 'stg'; })[0];
    if (!d || !d.checks.qa) return A.toast('Staging 확인을 먼저 완료해 주세요.', 'err'); var actor = S.admin;
    A.confirm('Production에 ' + d.v + '을(를) 반영할까요?', '<ol class="small" style="padding-left:18px;line-height:1.9"><li>운영 DB 백업 생성</li><li>Staging에서 확인한 같은 버전을 운영 서버에 배포</li><li>주요 화면·예약 접수 점검</li><li>문제가 있으면 이전 버전(' + E.prod.version + ')으로 되돌리기</li></ol>', '반영', function () {
      if (!allowed(S.admin === actor && me() && me().role === 'super' && d.checks.qa && E.deploys.indexOf(d) >= 0)) return;
      E.backups.unshift({ at: Date.now(), kind: 'DB 논리 백업 (배포 전)', size: '183.4 MB', ok: true, where: '백업 전용 저장소' });
      E.deploys.unshift({ v: d.v, at: Date.now(), env: 'prod', who: me().name, note: d.note, checks: { qa: true } });
      d.env = 'done'; E.deploys = E.deploys.filter(function (x) { return x.env !== 'done'; });
      E.prod.version = d.v; E.stg.version = E.prod.version;
      audit('Production 배포 ' + E.prod.version); A.render(); A.toast('Production에 ' + E.prod.version + '을(를) 반영했습니다 (시연)', 'ok');
    });
  };
  ACT.restoreTest = function () {
    if (!allowed(me() && me().role === 'super')) return;
    var stopped = false, timers = [], actor = S.admin;
    var m = A.modal({ onClose:function() { stopped = true; timers.forEach(clearTimeout); }, title: '백업 복구 시험', icon: 'db', body: '<p class="small">최근 운영 백업을 <b>접근이 제한된 임시 복구용 DB</b>에 복원하고 건수를 대조합니다. 운영 DB에는 영향이 없습니다.</p><ul class="feed mt12" id="rtLog"><li><span class="fdot"></span>복구용 임시 DB 준비 중…</li></ul>', foot: '<button class="btn o" data-x>닫기</button>' });
    var steps = ['최근 백업 ' + U.dt(D.ENV.backups[0].at) + ' 내려받기', '임시 DB에 복원', '예약 ' + D.RES.length + '건 · 게시물 ' + D.POSTS.length + '건 대조 — 일치', '임시 DB 삭제 · 결과 기록'];
    steps.forEach(function (s, i) { timers.push(setTimeout(function () { if (stopped || S.admin !== actor) return; var u = m.el.querySelector('#rtLog'); if (u) u.insertAdjacentHTML('beforeend', '<li><span class="fdot"></span>' + s + '</li>'); if (i === steps.length - 1) { D.ENV.restoreTest = { at: Date.now(), ok: true, rows: '예약 ' + D.RES.length + '건 · 게시물 ' + D.POSTS.length + '건 일치' }; audit('백업 복구 시험 — 정상'); } }, 500 * (i + 1))); });
  };

  /* ================= 권한 · 접속 기록 ================= */
  function auditV() {
    return '<div class="g2"><div class="pnl"><div class="hd"><h3>' + ic('shield', 's') + '관리자 권한</h3></div><table class="mx"><thead><tr><th>기능</th><th>전체 관리자</th><th>지점 관리자</th></tr></thead><tbody>' +
      [['예약 조회·처리', '전 지점', '자기 지점'], ['예약 스케줄·휴진', '전 지점', '자기 지점'], ['예약자 상세 열람', '사유 입력', '사유 입력'], ['게시판', '전 지점 글', '자기 지점 글'], ['배너·팝업', '전 지점', '자기 지점 전용 항목'], ['지점 기본 정보', '전 지점', '자기 지점'], ['지점·진료과 구성', '변경', '조회'], ['운영 환경·배포', '승인', '조회'], ['통계', '전 지점', '자기 지점']].map(function (r) { return '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td><td>' + r[2] + '</td></tr>'; }).join('') + '</tbody></table>' +
      '<h4 class="mt16" style="font-size:.95rem">관리자 계정</h4>' + D.ADMINS.filter(function(a) { return me().role === 'super' || a.id === S.admin; }).map(function (a) { return '<div class="row sb" style="padding:8px 0;border-bottom:1px solid var(--line)"><span class="small"><b>' + a.name + '</b> · ' + a.label + '</span><span class="tiny muted mono">허용 IP ' + a.ip + '</span></div>'; }).join('') +
      '<p class="hint mt12">비밀번호 정책, 로그인 5회 실패 시 잠금, 관리자 화면 지정 IP 접속을 적용합니다.</p></div>' +
      '<div class="pnl"><div class="hd"><h3>' + ic('list', 's') + '접속 · 처리 기록</h3></div><ul class="feed">' + D.AUDIT.filter(function(a) { return me().role === 'super' || a.bid === lockB() || a.who === me().name; }).slice(0, 18).map(function (a) { return '<li><span class="fdot ' + (a.warn ? 'w' : '') + '"></span><span class="grow">' + U.esc(a.what) + '<br><span class="tiny muted">' + U.dt(a.t) + ' · ' + U.esc(a.who) + ' · ' + a.ip + '</span></span></li>'; }).join('') + '</ul></div></div>';
  }

  var adminActions = ['aOut','aSwitch','aside','afSet','afQ','afView','rSet','rHist','memoShow','resCsv','sfSet','sfDept','rgAdd','rgDel','schSave','excAdd','excDel','patShow','inqOpen','bfType','postHide','postEdit','bnTgl','bnEdit','orgTgl','branchEdit','statMode','statCsv','envView','qaChk','promote','restoreTest'];
  adminActions.forEach(function(name) { var fn = ACT[name]; ACT[name] = function() { if (!allowed(!!me())) return; return fn.apply(this,arguments); }; });

  /* ================= 시연 시나리오 ================= */
  function asAdm(id) { resetSession(id); }
  var sc = A.scenario, G = A.guide, go = A.go;
  sc({ t: '진료 예약 처음부터', d: '지점 → 진료과 → 날짜·시간 → 본인인증 → 예약 완료', run: function () { S.rsv = null; go('#/reserve?new=1'); G('<b>진료 예약</b> — 지점과 진료과를 고르면 운영표·휴진·정원으로 계산한 예약 가능 날짜와 시간만 열립니다. 본인인증 번호는 <b>123456</b>입니다.'); } });
  sc({ t: '진료과 상세에서 바로 예약', d: '빠른 예약 시간을 누르면 지점·진료과·시간이 선택된 채 시작', run: function () { go('#/b/dt/d/os'); G('<b>동탄점 정형외과</b> — 오른쪽 「빠른 예약 가능 시간」을 누르면 예약 3단계에서 바로 시작합니다. 의료진 일정표도 같은 스케줄 데이터로 그려집니다.'); A.spot('.slots-q', 500); } });
  sc({ t: '같은 시간 동시 예약 20건', d: '남은 정원에 따른 접수·마감 처리 모의 시험', run: function () { go('#/'); setTimeout(A.raceDemo, 400); } });
  sc({ t: '신청 직전에 마감된 경우', d: '다른 환자가 먼저 예약 → 안내 후 시간 다시 선택', run: function () { S.race = true; S.rsv = null; go('#/reserve?b=pt&d=im'); A.demoPanel(); G('<b>경합 시연이 켜졌습니다.</b> 날짜·시간을 고르고 본인인증 후 「예약 신청」을 누르면, 그 직전에 다른 환자가 남은 자리를 모두 예약한 상황을 재현합니다.'); } });
  sc({ t: '비회원 예약 조회·취소', d: '본인인증으로 내 예약만 · 취소 마감 시각 적용', run: function () { S.me = null; go('#/lookup'); G('시연용 예약자 <b>정하늘 · 19880412 · 010-2468-1357</b>로 인증하면 예약 2건이 보입니다. 진료 2시간 전까지 온라인 취소가 가능합니다.'); } });
  sc({ t: '지점별 소식 노출', d: '공통 글 + 지점 글을 지점 홈에 함께 표시', run: function () { go('#/b/dt?s=loc'); G('<b>동탄점 홈</b>의 소식에는 동탄점 글과 전 지점 공통 글만 보입니다. 관리자 「게시판」에서 노출 지점을 고릅니다.'); } });
  sc({ admin: true, t: '확정 대기 예약 처리', d: '신청 → 확정 · 이력과 처리자 기록', run: function () { asAdm('a_all'); AF.st = 'request'; go('#/admin/res'); G('<b>예약 관리</b> — 확정 대기 예약을 확정하면 처리자·시각이 이력에 남습니다. 오른쪽 위 달력 버튼으로 주간 보기, 엑셀(CSV)은 개인정보를 가린 채 내려받습니다.'); } });
  sc({ admin: true, t: '휴진 등록 시 기존 예약 경고', d: '영향 받는 예약을 먼저 보여 주고 처리 선택', run: function () { asAdm('a_all'); SF.bid = 'dt'; SF.did = 'ns'; go('#/admin/sched'); G('<b>예약 스케줄</b> — 「휴진 · 예외 일정」의 <b>등록</b>을 누르고 그대로 저장해 보세요. 그날 이미 받은 동탄점 신경외과 예약이 연락 대상 목록으로 먼저 표시됩니다.'); A.spot('#excPnl', 500); } });
  sc({ admin: true, t: '지점·진료과 운영 → 사이트 즉시 반영', d: '매핑 하나로 메뉴·상세·예약이 함께 변경', run: function () { asAdm('a_all'); go('#/admin/org'); G('안성점의 <b>정형외과</b>를 켜고 사용자 사이트의 안성점 홈과 진료 예약을 열어 보세요. 진료과 메뉴와 예약 선택지에 바로 추가됩니다.'); } });
  sc({ admin: true, t: '지점 관리자 권한', d: '동탄점 관리자는 동탄점 데이터만', run: function () { asAdm('a_dt'); go('#/admin/res'); G('<b>동탄점 관리자</b>로 들어왔습니다. 예약·문의·통계·스케줄이 동탄점만 보이고, 공통 게시글과 지점 구성은 수정할 수 없습니다.'); } });
  sc({ admin: true, t: '예약자 개인정보 열람 기록', d: '가려진 목록 → 사유 입력 후 열람 → 기록', run: function () { asAdm('a_all'); go('#/admin/pat'); G('목록은 이름·연락처를 가려 보여 줍니다. 「열람」은 사유를 입력해야 하고, 「권한 · 접속 기록」에 남습니다.'); } });
  sc({ admin: true, t: 'Staging → Production 배포 · 복구 시험', d: '환경 분리 · 같은 버전 반영 · 백업 복구', run: function () { asAdm('a_all'); go('#/admin/env'); G('<b>운영 환경</b> — Staging 확인을 체크한 뒤 Production에 반영하고, 「복구 시험」으로 격리 복원·대조·정리 절차를 체험해 보세요. 실제 NCP에는 연결되지 않습니다. 「Staging으로 보기」를 누르면 사이트에 STAGING 표시가 붙습니다.'); } });
  sc({ admin: true, t: '통계', d: '주간 추이 · 진료과별 · 요일×시간대 분포', run: function () { asAdm('a_all'); go('#/admin/stats'); } });
})();
