(function () {
  "use strict";
  const L = window.CoBanLogic;
  const STORAGE_KEY = "co-ban-strength-v1";
  const ROUTES = ["home", "roadmap", "plan", "achievements", "settings", "onboarding"];
  const routeFromHash = () => {
    const hash = location.hash.replace("#", "");
    return ROUTES.includes(hash) ? hash : "home";
  };
  let state = loadState();
  let route = routeFromHash();
  let onboardingStep = 0;
  let activeLesson = null;
  let toastTimer = null;
  let hashSynced = false;
  const root = document.getElementById("app-root");
  const title = document.getElementById("page-title");
  const topEyebrow = document.getElementById("top-eyebrow");
  const lessonDialog = document.getElementById("lesson-dialog");
  const guideDialog = document.getElementById("guide-dialog");
  const toastNode = document.getElementById("toast");
  const esc = (value) => String(value ?? "").replace(/[&<>\"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[char]));
  const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  function loadState() { try { return L.normalizeState(JSON.parse(localStorage.getItem(STORAGE_KEY))); } catch (_) { return L.freshState(); } }
  function notify(message) { toastNode.textContent = message; toastNode.classList.add("show"); clearTimeout(toastTimer); toastTimer = setTimeout(() => toastNode.classList.remove("show"), 2800); }
  function routeTitle() {
    return { home: "Từ đã lưu đến đã tập.", roadmap: "Bài học 4 tuần.", plan: "Kế hoạch tập.", achievements: "Tiến độ & thành tựu.", settings: "Cài đặt & dữ liệu.", onboarding: "Bắt đầu từ đây." }[route] || "CƠ BẢN";
  }

  function navigate(next) {
    route = next;
    if (route === "onboarding") onboardingStep = 0;
    if (location.hash !== "#" + next) {
      hashSynced = true;
      location.hash = next;
    }
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function syncRouteFromHash() {
    if (hashSynced) { hashSynced = false; return; }
    const raw = location.hash.replace("#", "");
    if (!ROUTES.includes(raw)) return;
    const next = raw;
    if (next === route) return;
    route = next;
    if (route === "onboarding") onboardingStep = 0;
    render();
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  function render() {
    title.textContent = routeTitle();
    document.title = routeTitle() + " · CƠ BẢN";
    topEyebrow.textContent = route === "onboarding" ? "CƠ BẢN · BẮT ĐẦU" : "CƠ BẢN · 4 TUẦN";
    document.querySelectorAll(".nav-item[data-route], .mobile-nav [data-route]").forEach((el) => {
      const isActive = el.dataset.route === route;
      el.classList.toggle("active", isActive);
      if (isActive) el.setAttribute("aria-current", "page");
      else el.removeAttribute("aria-current");
    });
    if (route === "onboarding") renderOnboarding();
    else if (route === "home") renderHome();
    else if (route === "roadmap") renderRoadmap();
    else if (route === "plan") renderPlan();
    else if (route === "achievements") renderAchievements();
    else renderSettings();
  }

  function nextLesson() {
    return L.LESSONS.find((lesson) => state.lessons[lesson.id].status !== "completed") || null;
  }

  function profileStarted() {
    return Boolean(state.profile.intent && state.profile.experience);
  }

  function nextStep() {
    const completed = L.progress(state);
    const lesson = nextLesson();
    if (completed === 0 && !profileStarted() && !state.profile.setupDeferred) {
      return {
        kind: "onboarding",
        kicker: "BẮT ĐẦU TẠI ĐÂY",
        title: "Cá nhân hóa lộ trình trong 2 phút",
        text: "Chọn chế độ Nhà/Gym, hai ngày tập và xác nhận an toàn. Bạn có thể học thử bài 1 trước nếu muốn.",
        meta: "5 bước · có thể bỏ qua",
        cta: "Thiết lập ngay",
        action: "onboarding"
      };
    }
    if (lesson) {
      const number = L.LESSONS.indexOf(lesson) + 1;
      return {
        kind: "lesson",
        kicker: "VIỆC CẦN LÀM TIẾP THEO",
        title: "Bài " + number + " · " + lesson.title,
        text: lesson.summary,
        meta: lesson.duration + " · " + lesson.quiz.length + " câu quiz · " + lesson.modes,
        cta: completed ? "Học tiếp bài " + number : "Bắt đầu bài 1",
        action: "lesson",
        lesson: lesson
      };
    }
    if (!L.validPlan(state.plan)) {
      return {
        kind: "plan",
        kicker: "ĐÃ HỌC XONG 8 BÀI",
        title: "Chốt hai ngày tập",
        text: "Chọn hai ngày thật sự phù hợp và viết một câu nếu–thì. Đây là bước biến kiến thức thành lịch.",
        meta: "2 phút · có thể đổi sau",
        cta: "Lập kế hoạch",
        action: "plan"
      };
    }
    if (!state.actions.openedGuides.length) {
      return {
        kind: "guide",
        kicker: "KẾ HOẠCH ĐÃ SẴN SÀNG",
        title: "Mở giáo án buổi đầu",
        text: "Giáo án 30 phút gồm khởi động, toàn thân và thư giãn, theo chế độ bạn đã chọn.",
        meta: "30 phút · Nhà hoặc Gym",
        cta: "Mở giáo án",
        action: "guide"
      };
    }
    if (!state.actions.addedCalendar.length) {
      return {
        kind: "calendar",
        kicker: "GẦN XONG RỒI",
        title: "Đưa lịch tập vào điện thoại",
        text: "Tải file .ics để hai ngày tập hiện trong lịch của bạn và không bị quên.",
        meta: "Tệp .ics · dùng với Google/Apple Calendar",
        cta: "Tải lịch",
        action: "calendar"
      };
    }
    return {
      kind: "done",
      kicker: "BẠN ĐÃ SẴN SÀNG",
      title: "Giữ nhịp hai buổi mỗi tuần",
      text: "Bạn đã học đủ 8 bài, có kế hoạch và đã mở giáo án. Việc còn lại là lặp lại đều đặn.",
      meta: "Xem lại thành tựu hoặc mở lại giáo án bất cứ lúc nào.",
      cta: "Xem thành tựu",
      action: "achievements"
    };
  }

  function renderHome() {
    const completed = L.progress(state);
    const step = nextStep();
    const lesson = step.lesson || nextLesson();
    const total = L.LESSONS.length;
    const percent = Math.round((completed / total) * 100);
    const week = Math.min(4, Math.floor(completed / 2) + 1);
    const weekLesson = L.LESSONS[Math.min(total - 1, completed)];
    const heroTitles = {
      onboarding: "Bắt đầu<br><em>từ bài 1</em>.",
      lesson: "Tiếp tục<br><em>bài " + (L.LESSONS.indexOf(lesson) + 1) + "</em>.",
      plan: "Chốt<br><em>hai ngày tập</em>.",
      guide: "Vào<br><em>buổi tập đầu</em>.",
      calendar: "Đưa lịch tập<br><em>vào điện thoại</em>.",
      done: "Giữ nhịp<br><em>hai buổi mỗi tuần</em>."
    };
    const heroTitle = heroTitles[step.kind] || "Từ đã lưu<br><em>đến đã tập</em>.";
    const stepNumber = step.kind === "done" ? "CUỐI" : step.kind === "calendar" || step.kind === "guide" ? "3" : step.kind === "plan" ? "2" : "1";
    const heroSecondary = step.kind === "onboarding"
      ? '<button class="button secondary" data-action="open-next">Học thử bài 1</button>'
      : '<button class="button secondary" data-route="roadmap">Xem lộ trình</button>';
    const modeLabel = state.profile.mode === "gym" ? "Chế độ Gym" : state.profile.mode === "home" ? "Chế độ Nhà" : "Chưa chọn chế độ";
    const journey = [
      {
        number: "01",
        title: "Học 8 bài nền tảng",
        text: "Mỗi bài 5 phút, kèm 3 câu quiz. Hoàn thành bài nào mở bài tiếp theo.",
        done: completed >= total,
        current: step.kind === "lesson" || step.kind === "onboarding",
        meta: completed + "/" + total + " bài",
        progress: percent,
        cta: completed >= total ? "Xem lại bài học" : completed ? "Học tiếp" : "Bắt đầu học",
        route: "roadmap"
      },
      {
        number: "02",
        title: "Chọn hai ngày tập",
        text: "Một câu nếu–thì và hai ngày cố định. Có thể đổi bất cứ lúc nào.",
        done: L.validPlan(state.plan),
        current: step.kind === "plan",
        meta: L.validPlan(state.plan) ? state.plan.days.map((day) => L.DAY_LABELS[day]).join(" · ") : "Chưa có kế hoạch",
        progress: L.validPlan(state.plan) ? 100 : 0,
        cta: L.validPlan(state.plan) ? "Xem kế hoạch" : "Chọn ngày tập",
        route: "plan"
      },
      {
        number: "03",
        title: "Tập buổi đầu tiên",
        text: "Mở giáo án 30 phút và tải lịch để giữ nhịp hai buổi mỗi tuần.",
        done: state.actions.openedGuides.length > 0,
        current: step.kind === "guide" || step.kind === "calendar",
        meta: state.actions.openedGuides.length ? "Giáo án đã mở" : L.validPlan(state.plan) ? "Sẵn sàng mở" : "Cần kế hoạch trước",
        progress: state.actions.openedGuides.length ? 100 : 0,
        cta: state.actions.openedGuides.length ? "Mở lại giáo án" : L.validPlan(state.plan) ? "Mở giáo án" : "Lập kế hoạch trước",
        route: L.validPlan(state.plan) ? null : "plan",
        action: L.validPlan(state.plan) ? "guide" : null
      }
    ];
    const journeyHTML = journey.map((item, index) => {
      const action = item.route ? 'data-route="' + item.route + '"' : 'data-action="' + item.action + '"';
      return '<article class="journey-card ' + (item.done ? "done" : "") + " " + (item.current ? "current" : "") + '" style="--delay:' + (index * 70) + 'ms">' +
        '<div class="journey-head"><span class="journey-number">' + item.number + '</span><span class="journey-state">' + (item.done ? "Hoàn tất" : item.current ? "Hiện tại" : "Tiếp theo") + '</span></div>' +
        '<h3>' + item.title + '</h3><p>' + item.text + '</p>' +
        '<div class="journey-progress"><span class="journey-bar"><i style="width:' + item.progress + '%"></i></span><b>' + esc(item.meta) + '</b></div>' +
        '<button class="button ghost" ' + action + '>' + esc(item.cta) + ' <span aria-hidden="true">→</span></button></article>';
    }).join("");
    root.innerHTML = '<section class="screen home-screen">' +
      '<section class="hero home-hero"><div class="hero-copy">' +
      '<p class="hero-intro">Từ đã lưu đến đã tập.</p>' +
      '<p class="kicker">LỘ TRÌNH 4 TUẦN · ' + (step.kind === "done" ? "HOÀN TẤT" : "BƯỚC " + stepNumber + "/3") + '</p>' +
      '<h2>' + heroTitle + '</h2><p>' + esc(step.text) + '</p>' +
      '<div class="hero-actions"><button class="button primary" data-action="primary-next">' + esc(step.cta) + ' <span aria-hidden="true">→</span></button>' + heroSecondary + '</div>' +
      '<div class="hero-progress"><div class="hero-progress-label"><span>Tiến độ của bạn</span><strong>' + completed + '/' + total + ' bài</strong></div><span class="hero-progress-track"><i style="width:' + percent + '%"></i></span><span class="hero-progress-week">Tuần ' + week + ' · ' + esc(weekLesson.weekTitle) + '</span></div>' +
      '</div><div class="hero-ring" style="--progress:' + (percent * 3.6) + 'deg" role="img" aria-label="Đã hoàn thành ' + completed + ' trên ' + total + ' bài"><div><strong>' + completed + '</strong><small>/' + total + ' bài</small></div></div></section>' +
      '<section class="journey-section"><div class="section-head"><div><p class="kicker">BẠN CẦN LÀM GÌ</p><h2>Ba bước, không mò mẫm.</h2></div><span class="mode-pill">' + esc(modeLabel) + '</span></div><div class="journey-grid">' + journeyHTML + '</div></section>' +
      '<aside class="safety-note"><strong>An toàn trước.</strong><span>Đau nhói, chóng mặt hoặc khó thở bất thường? Dừng lại và hỏi chuyên môn trước khi tiếp tục.</span><button class="link-button" data-route="settings">Hồ sơ &amp; dữ liệu</button></aside>' +
      '</section>';
  }

  function renderRoadmap() {
    const upcoming = nextLesson();
    const currentWeek = upcoming ? upcoming.week : 4;
    const modeLabel = state.profile.mode === "gym" ? "Chế độ Gym" : state.profile.mode === "home" ? "Chế độ Nhà" : "Chưa chọn chế độ";
    const weekNotes = ["Hiểu chuẩn nền", "Tập an toàn", "Tập đủ và tăng dần", "Tự tập và về đích"];
    const blocks = [1, 2, 3, 4].map((week) => {
      const lessons = L.LESSONS.filter((lesson) => lesson.week === week);
      const done = lessons.filter((lesson) => state.lessons[lesson.id].status === "completed").length;
      return '<section class="week-block ' + (week === currentWeek ? "current" : "") + '"><header><p class="week-label">TUẦN ' + week + (week === currentWeek ? " · ĐANG HỌC" : "") + '</p><h2>' + lessons[0].weekTitle + '</h2><p class="muted week-sub">' + weekNotes[week - 1] + '</p><span class="week-progress">' + done + '/' + lessons.length + ' bài</span></header><div class="lesson-grid">' + lessons.map(renderLessonCard).join("") + '</div></section>';
    }).join("");
    const upNext = upcoming
      ? '<section class="next-up"><div><p class="kicker">BÀI TIẾP THEO · TUẦN ' + upcoming.week + '</p><h2>' + esc(upcoming.title) + '</h2><p>' + esc(upcoming.summary) + '</p><div class="next-up-meta"><span class="mode-pill">' + esc(upcoming.duration) + '</span><span class="muted">' + esc(upcoming.modes) + ' · ' + upcoming.quiz.length + ' câu quiz</span></div></div><button class="button primary" data-action="open-next">Học bài này <span aria-hidden="true">→</span></button></section>'
      : '<section class="next-up done"><div><p class="kicker">ĐÃ HỌC XONG 8 BÀI</p><h2>Bước tiếp theo: kế hoạch hai buổi.</h2><p>Chọn hai ngày và mở giáo án để bắt đầu buổi tập đầu tiên.</p></div><button class="button primary" data-route="plan">Đi tới kế hoạch <span aria-hidden="true">→</span></button></section>';
    const tickerItems = ["TUẦN 1 · HIỂU ĐÚNG", "TUẦN 2 · TẬP AN TOÀN", "TUẦN 3 · TẬP ĐỦ", "TUẦN 4 · TỰ TẬP"];
    const ticker = '<div class="marquee-box roadmap-marquee" aria-hidden="true"><div class="marquee-content">' + tickerItems.concat(tickerItems).map((item) => '<span>' + item + '</span>').join("") + '</div></div>';
    root.innerHTML = '<section class="screen"><div class="section-head roadmap-head"><div><p class="kicker">LỘ TRÌNH TỰ HỌC</p><h2>4 tuần · 8 bài · mỗi bài 5 phút</h2><p>Học theo thứ tự. Bài đang mở được đánh dấu đỏ.</p></div><span class="mode-pill">' + esc(modeLabel) + '</span></div>' + ticker + upNext + '<div class="roadmap">' + blocks + '</div></section>';
  }

  function renderLessonCard(lesson) {
    const record = state.lessons[lesson.id];
    const locked = record.status === "locked";
    const upcoming = nextLesson();
    const isNext = Boolean(upcoming && upcoming.id === lesson.id);
    const statusLabel = record.status === "completed" ? "Đã học" : locked ? "Đang khóa" : isNext ? "Tiếp theo" : "Mở";
    const footer = record.bestScore ? record.bestScore + " điểm" : locked ? "Học xong bài trước" : "Học ngay →";
    return '<article class="lesson-card ' + (locked ? "locked" : "") + ' ' + (record.status === "completed" ? "completed" : "") + ' ' + (isNext ? "next" : "") + '" ' + (!locked ? 'data-lesson="' + lesson.id + '" role="button" tabindex="0" aria-label="Mở ' + esc(lesson.title) + '"' : '') + '><span class="lesson-status">' + statusLabel + '</span><p class="kicker">' + esc(lesson.eyebrow) + '</p><h3>' + esc(lesson.title) + '</h3><p>' + esc(lesson.summary) + '</p><div class="lesson-footer"><span>' + esc(lesson.duration) + '</span><strong>' + footer + '</strong></div></article>';
  }

  function renderPlan() {
    const profile = state.profile;
    const saved = L.validPlan(state.plan);
    const profileMode = ["home", "gym"].includes(profile.mode) ? profile.mode : "";
    const profileDays = Array.isArray(profile.selectedDays) ? profile.selectedDays.slice(0, 2) : [];
    const p = saved ? state.plan : {
      mode: ["home", "gym"].includes(state.plan.mode) ? state.plan.mode : profileMode,
      days: state.plan.days.length ? state.plan.days : profileDays,
      ifThen: state.plan.ifThen || { ifText: "", thenText: "" }
    };
    const days = Object.keys(L.DAY_LABELS).map((day) => '<label class="day-choice"><input type="checkbox" name="days" value="' + day + '" ' + (p.days.includes(day) ? "checked" : "") + '><span>' + L.DAY_LABELS[day] + '</span></label>').join("");
    const ifThenReady = Boolean(p.ifThen.ifText.trim() && p.ifThen.thenText.trim());
    const checks = [
      { key: "mode", text: "Chọn chế độ Nhà hoặc Gym", done: Boolean(p.mode) },
      { key: "days", text: "Chọn ít nhất hai ngày", done: p.days.length >= 2 },
      { key: "ifThen", text: "Viết câu nếu–thì", done: ifThenReady }
    ];
    const canSave = checks.every((item) => item.done);
    const checklist = checks.map((item, index) => '<li data-check="' + item.key + '" class="' + (item.done ? "done" : "") + '"><span>' + (item.done ? "✓" : index + 1) + '</span>' + item.text + '</li>').join("");
    const modeLabel = p.mode === "gym" ? "Chế độ Gym" : p.mode === "home" ? "Chế độ Nhà" : "Chưa chọn chế độ";
    const savedSummary = saved
      ? '<section class="plan-summary"><div><p class="kicker">KẾ HOẠCH ĐÃ LƯU</p><h2>' + p.days.map((day) => L.DAY_LABELS[day]).join(" · ") + '</h2><p><strong>Nếu</strong> ' + esc(p.ifThen.ifText) + ' <strong>thì</strong> ' + esc(p.ifThen.thenText) + '</p><span class="mode-pill">' + (p.mode === "gym" ? "Ở Gym" : "Ở Nhà") + '</span></div><button class="button primary" data-action="guide">' + (state.actions.openedGuides.length ? "Mở lại giáo án" : "Mở giáo án") + ' <span aria-hidden="true">→</span></button></section>'
      : '<div class="plan-note"><strong>Bạn chưa cần hoàn hảo.</strong> Chỉ cần chọn hai ngày thật và một câu nếu–thì đủ cụ thể để biết lúc nào bắt đầu.</div>';
    root.innerHTML = '<section class="screen">' +
      '<div class="section-head"><div><p class="kicker">BƯỚC 2 · CHỐT LỊCH</p><h2>Chọn hai ngày bạn thật sự giữ được.</h2><p>Không cần hoàn hảo. Chỉ cần đủ cụ thể để biết lúc nào bắt đầu.</p></div><span class="mode-pill">' + esc(modeLabel) + '</span></div>' +
      savedSummary +
      '<div class="plan-grid"><form class="form-card" id="plan-form"><h2>Điền ba mục</h2><p>Nút lưu sẽ sáng khi đủ thông tin. Bạn có thể đổi lại bất cứ lúc nào.</p><ol class="plan-checklist" id="plan-checklist">' + checklist + '</ol>' +
      '<label class="field-label">Chế độ tập</label><div class="mode-grid"><label class="mode-choice"><input type="radio" name="mode" value="home" ' + (p.mode === "home" ? "checked" : "") + '><span><strong>Ở Nhà</strong><small>Trọng lượng cơ thể, dây kháng lực.</small></span></label><label class="mode-choice"><input type="radio" name="mode" value="gym" ' + (p.mode === "gym" ? "checked" : "") + '><span><strong>Ở Gym</strong><small>Máy và tạ, theo nhịp của bạn.</small></span></label></div>' +
      '<label class="field-label">Hai ngày tập</label><div class="day-grid">' + days + '</div>' +
      '<label class="field-label" for="if-text">Nếu …</label><input class="input" id="if-text" name="ifText" value="' + esc(p.ifThen.ifText) + '" placeholder="Nếu tan học thứ 3…">' +
      '<label class="field-label" for="then-text">Thì …</label><input class="input" id="then-text" name="thenText" value="' + esc(p.ifThen.thenText) + '" placeholder="…thì tập 20 phút ở nhà.">' +
      '<div style="margin-top:22px"><button class="button primary" type="submit" ' + (canSave ? "" : "disabled") + '>' + (saved ? "Cập nhật kế hoạch" : "Lưu kế hoạch") + ' <span aria-hidden="true">→</span></button></div></form>' +
      '<aside><div class="panel"><p class="kicker">GIÁO ÁN CỦA BẠN</p><h3>' + (p.mode === "gym" ? "Gym cơ bản" : "Nhà cơ bản") + '</h3><div class="guide-list"><div class="guide-item"><b>Khởi động <span>5 phút · Nhẹ và có kiểm soát</span></b></div><div class="guide-item"><b>Toàn thân <span>20 phút · 5–6 động tác nền</span></b></div><div class="guide-item"><b>Thư giãn <span>5 phút · Thở đều và ghi nhận</span></b></div></div><button class="button ghost" data-action="guide" ' + (saved ? "" : "disabled") + '>' + (state.actions.openedGuides.length ? "Đã mở giáo án" : "Mở giáo án") + '</button> <button class="button ghost" data-action="ics" ' + (saved ? "" : "disabled") + '>Tải lịch .ics</button></div><div class="plan-note" style="margin-top:15px"><strong>Gợi ý:</strong> chọn ngày có ít thay đổi lịch nhất. Nếu bận, đổi ngày thay vì bỏ cả tuần.</div></aside></div></section>';
  }

  function renderAchievements() {
    const completed = L.progress(state);
    const score = state.finalAssessment?.score || state.lessons["lesson-8"].bestScore || 0;
    const nextMilestone = [2, 4, 6, 8].find((milestone) => completed < milestone) || null;
    const remaining = nextMilestone ? nextMilestone - completed : 0;
    const badges = [2, 4, 6, 8].map((n) => '<article class="achievement ' + (completed >= n ? "earned" : "") + '"><div class="medal">M' + n + '</div><strong>Bậc ' + n + '</strong><small>' + (completed >= n ? "Đã đạt" : "Mở sau bài " + n) + '</small></article>').join("");
    const upcoming = nextLesson();
    const nextCta = upcoming
      ? '<button class="button primary" data-action="open-next">Học tiếp bài ' + (L.LESSONS.indexOf(upcoming) + 1) + ' <span aria-hidden="true">→</span></button>'
      : '<button class="button primary" data-route="plan">Đi tới kế hoạch <span aria-hidden="true">→</span></button>';
    root.innerHTML = '<section class="screen"><div class="section-head"><div><p class="kicker">GHI NHẬN TIẾN BỘ</p><h2>Không cần hoàn hảo để tiếp tục.</h2><p>Website ghi nhận việc học, kế hoạch và hành động bắt đầu.</p></div></div>' +
      '<section class="score-banner"><div><h2>' + completed + '/8 bài đã hoàn thành</h2><p>' + (nextMilestone ? "Còn " + remaining + " bài để mở Bậc " + nextMilestone + "." : "Bạn đã mở đủ bốn bậc.") + ' Điểm bài cuối hiện tại: ' + score + '/100.</p></div><div class="score-number">' + (L.certificateEligible(state) ? "ĐẠT" : score + '<small>/100</small>') + '</div></section>' +
      '<div class="achievement-grid">' + badges + '</div>' +
      '<section class="panel achievement-next"><div><p class="kicker">VIỆC TIẾP THEO</p><h3>' + (upcoming ? esc(upcoming.title) : "Chốt kế hoạch hai buổi") + '</h3><p>' + (upcoming ? esc(upcoming.summary) : "Chọn hai ngày và mở giáo án để bắt đầu.") + '</p></div>' + nextCta + '</section>' +
      '<section class="panel" style="margin-top:17px"><p class="kicker">ĐIỂM ĐO</p><h3>Giới hạn của prototype</h3><p class="muted" style="line-height:1.65;font-size:12px">CƠ BẢN có thể xác nhận bạn đã học, lập kế hoạch và mở giáo án. Website không tự khẳng định bạn đã duy trì tập đủ hai buổi mỗi tuần.</p></section></section>';
  }

  function renderSettings() {
    const profile = state.profile;
    const setup = [
      Boolean(profile.intent && profile.experience),
      ["home", "gym", "unknown"].includes(profile.mode),
      Boolean(profile.parq && Object.keys(profile.parq).length >= 4 && Object.values(profile.parq).every(Boolean)),
      Array.isArray(profile.selectedDays) && profile.selectedDays.length >= 2,
      Boolean(state.assessment.completedAt)
    ].filter(Boolean).length;
    root.innerHTML = '<section class="screen"><div class="section-head"><div><p class="kicker">HỒ SƠ &amp; DỮ LIỆU RIÊNG TƯ</p><h2>Bạn kiểm soát tiến độ của mình.</h2><p>Dữ liệu prototype nằm trong trình duyệt hiện tại, không gửi lên máy chủ.</p></div><span class="mode-pill">Hồ sơ ' + setup + '/5 bước</span></div>' +
      '<div class="settings-grid"><section class="form-card"><h2>Hồ sơ</h2><p>Thông tin này giúp giao diện gợi ý đúng chế độ và ngày tập.</p><div class="guide-list"><div class="guide-item"><b>Kinh nghiệm <span>' + esc({ never: "Chưa từng", stopped: "Đã từng nhưng đã dừng", active: "Đang tập" }[profile.experience] || "Chưa chọn") + '</span></b></div><div class="guide-item"><b>Chế độ <span>' + esc({ home: "Ở Nhà", gym: "Ở Gym", unknown: "Chưa biết" }[profile.mode] || "Chưa chọn") + '</span></b></div><div class="guide-item"><b>Ngày CƠ BẢN <span>' + ((profile.selectedDays || []).map((day) => L.DAY_LABELS[day]).join(", ") || "Chưa chọn") + '</span></b></div></div><button class="button ghost" data-route="onboarding">Thiết lập lại hồ sơ</button> <button class="button ghost" data-route="plan">Đổi lịch tập</button></section>' +
      '<section class="form-card"><h2>Sao lưu</h2><p>Xuất tiến độ để giữ bản sao hoặc chuyển sang thiết bị khác.</p><button class="button primary" data-action="export">Tải JSON</button><label class="button ghost" style="margin-top:10px;cursor:pointer">Nhập JSON<input id="import-json" type="file" accept="application/json,.json" hidden></label><div style="margin-top:25px;padding-top:18px;border-top:1px solid var(--line)"><button class="link-button" data-action="reset">Xóa toàn bộ dữ liệu</button></div></section></div></section>';
  }

  function renderOnboarding() {
    const steps = ["Bạn là ai?", "Chọn cách tập", "An toàn trước", "Ngày CƠ BẢN", "Bài kiểm tra"]; const p = state.profile;
    let body = "";
    if (onboardingStep === 0) body = '<p class="kicker">BƯỚC 1 · ĐIỀU KIỆN THAM GIA</p><h2>Bắt đầu từ điều phù hợp với bạn.</h2><p>CƠ BẢN dành cho sinh viên đại học tại TP.HCM, 18–24 tuổi, đã có ý định tập tăng cường cơ.</p><div class="check-list"><label class="check-row"><input id="is-student" type="checkbox" '+(p.location === "hcmc" ? "checked" : "")+'> Tôi là sinh viên đại học tại TP.HCM, từ 18–24 tuổi.</label><label class="check-row"><input id="has-intent" type="checkbox" '+(p.intent ? "checked" : "")+'> Tôi dự định tập tăng cường cơ trong thời gian tới.</label></div><label class="field-label">Bạn đã từng tập chưa?</label><div class="choice-grid">'+choice("experience", "never", "Chưa từng", "Bắt đầu từ nền tảng")+choice("experience", "stopped", "Đã từng nhưng đã dừng", "Muốn quay lại có lộ trình")+choice("experience", "active", "Đang tập", "Muốn hiểu rõ hơn")+'</div><p class="onboard-hint">Chưa chắc? Bạn có thể bỏ qua và học thử bài 1 trước.</p>';
    if (onboardingStep === 1) body = '<p class="kicker">BƯỚC 2 · CHẾ ĐỘ TẬP</p><h2>Bạn muốn bắt đầu ở đâu?</h2><p>Cùng một lộ trình, khác nhau ở cách chúng ta gợi ý động tác.</p><div class="choice-grid">'+choice("mode", "home", "Ở Nhà", "Trọng lượng cơ thể và dây kháng lực")+choice("mode", "gym", "Ở Gym", "Máy và tạ, theo nhịp của bạn")+choice("mode", "unknown", "Chưa biết", "Bạn có thể chọn sau")+'</div>';
    if (onboardingStep === 2) body = '<p class="kicker">BƯỚC 3 · AN TOÀN</p><h2>Nghe cơ thể trước khi nghe con số.</h2><p>Checklist này giúp bạn nhận ra khi nào nên hỏi ý kiến chuyên môn trước khi tập.</p><div class="check-list">'+["Tôi không có tình trạng sức khỏe khiến vận động cần được tư vấn riêng.","Tôi hiểu cần dừng nếu đau nhói, chóng mặt hoặc khó thở bất thường.","Tôi sẽ bắt đầu nhẹ và tăng dần độ khó.","Tôi đồng ý tự chịu trách nhiệm chọn mức tập phù hợp."] .map((text, i) => '<label class="check-row"><input type="checkbox" data-parq="p'+i+'" '+(p.parq?.["p"+i] ? "checked" : "")+'>'+text+'</label>').join("")+'</div><div class="safety">Nếu bạn trả lời “có” với bất kỳ câu hỏi sức khỏe cụ thể nào trong PAR-Q+ đầy đủ, hãy hỏi chuyên gia y tế trước khi vận động.</div>';
    if (onboardingStep === 3) body = '<p class="kicker">BƯỚC 4 · NHỊP TẬP</p><h2>Chọn hai ngày bạn có thể giữ.</h2><p>Ngày CƠ BẢN là tín hiệu để biến ý định thành một lịch có thật.</p><label class="field-label">Hai ngày trong tuần</label><div class="day-grid">'+Object.keys(L.DAY_LABELS).map((day) => '<label class="day-choice"><input type="checkbox" data-onboard-day value="'+day+'" '+(p.selectedDays.includes(day) ? "checked" : "")+'><span>'+L.DAY_LABELS[day]+'</span></label>').join("")+'</div><div class="plan-note" style="margin-top:18px">Chọn ít nhất hai ngày. Bạn có thể thay đổi sau trong Kế hoạch tập.</div>';
    if (onboardingStep === 4) body = '<p class="kicker">BƯỚC 5 · ĐIỂM BẮT ĐẦU</p><h2>Bạn đang biết đến đâu?</h2><p>Trả lời nhanh 10 câu. Đây là điểm đầu vào để bạn so sánh với chính mình sau lộ trình.</p><form id="assessment-form"><div class="quiz-list">'+L.ENTRY_QUIZ.map((item, i) => '<div class="quiz-item"><h4>'+ (i+1)+'. '+item.q+'</h4><div class="option-list">'+item.options.map((option, j) => '<label class="option"><input required type="radio" name="q'+i+'" value="'+j+'">'+option+'</label>').join("")+'</div></div>').join("")+'</div></form><p class="onboard-hint">Bài kiểm tra không bắt buộc. Bạn có thể làm lại sau trong Tiến độ.</p>';
    const stepNames = ["Điều kiện", "Chế độ", "An toàn", "Ngày tập", "Điểm bắt đầu"];
    root.innerHTML = '<section class="screen onboarding"><div class="onboarding-shell"><div class="onboard-meta"><span class="kicker">BƯỚC ' + (onboardingStep + 1) + '/5 · ' + stepNames[onboardingStep] + '</span><button class="link-button" data-action="onboard-exit">Để sau, học bài 1 →</button></div><div class="stepper" role="progressbar" aria-label="Tiến độ thiết lập" aria-valuemin="1" aria-valuemax="5" aria-valuenow="' + (onboardingStep + 1) + '">' + steps.map((_, i) => '<span class="' + (i <= onboardingStep ? "active" : "") + '"></span>').join("") + '</div>' + body + '<div class="onboarding-actions">' + (onboardingStep ? '<button class="button ghost" data-action="onboard-back">Quay lại</button>' : '<span></span>') + '<div class="onboard-next-group">' + (onboardingStep === 4 ? '<button class="link-button" data-action="onboard-skip-assessment">Bỏ qua bài kiểm tra</button>' : '') + '<button class="button primary" data-action="onboard-next">' + (onboardingStep === 4 ? "Hoàn tất và vào CƠ BẢN" : "Tiếp tục") + ' <span aria-hidden="true">→</span></button></div></div></div></section>';  }
  function choice(name, value, label, note) { return '<div class="choice-card"><input id="'+name+'-'+value+'" type="radio" name="'+name+'" value="'+value+'" '+(state.profile[name] === value ? "checked" : "")+'><label for="'+name+'-'+value+'"><strong>'+label+'</strong><small>'+note+'</small></label></div>'; }
  function openLesson(id) { const lesson = L.LESSONS.find((item) => item.id === id); if (!lesson || state.lessons[id].status === "locked") return notify("Bài này chưa mở. Hãy học theo thứ tự nhé."); activeLesson = id; L.addAction(state, "openedLessons", id); save(); renderLessonModal(lesson); lessonDialog.showModal(); }
  function renderLessonModal(lesson, feedback = "") {
    const record = state.lessons[lesson.id];
    const number = L.LESSONS.indexOf(lesson) + 1;
    const best = record.bestScore ? '<span class="modal-best">Điểm cao nhất: ' + record.bestScore + '/100</span>' : "";
    const media = lesson.videoUrl
      ? '<a class="lesson-media" href="' + esc(lesson.videoUrl) + '" target="_blank" rel="noopener"><span aria-hidden="true">▶</span><div><strong>Xem video bài học</strong><small>Mở trong tab mới</small></div></a>'
      : '<div class="lesson-media is-placeholder"><span aria-hidden="true">▶</span><div><strong>Video đang cập nhật</strong><small>Bạn vẫn có thể đọc tóm tắt và làm quiz bên dưới.</small></div></div>';
    lessonDialog.innerHTML = '<div class="modal-inner"><div class="modal-head"><div><p class="kicker">BÀI ' + String(number).padStart(2, "0") + '/08 · ' + esc(lesson.duration) + '</p><h2>' + esc(lesson.title) + '</h2></div><button class="close" data-action="close-modal" aria-label="Đóng">×</button></div>' +
      '<div class="modal-progress" aria-hidden="true"><span style="width:' + ((number / L.LESSONS.length) * 100) + '%"></span></div>' + media +
      '<p class="modal-copy"><strong>Hôm nay bạn sẽ học:</strong> ' + esc(lesson.focus) + ' ' + esc(lesson.summary) + '</p>' +
      '<div class="safety">' + esc(lesson.safetyNote) + '</div>' +
      (lesson.tryAction ? '<div class="try-box" style="margin-top:12px"><strong>Thử trong 60 giây</strong><br>' + esc(lesson.tryAction) + '</div>' : '') +
      '<form id="lesson-quiz-form"><div class="quiz-head"><p class="kicker">QUIZ · ' + lesson.quiz.length + ' CÂU</p>' + best + '<span class="muted">Đạt 60 điểm để hoàn thành</span></div><div class="quiz-list">' +
      lesson.quiz.map((item, i) => '<div class="quiz-item"><h4>' + (i + 1) + '. ' + esc(item.q) + '</h4><div class="option-list">' + item.options.map((option, j) => '<label class="option"><input required type="radio" name="q' + i + '" value="' + j + '">' + esc(option) + '</label>').join("") + '</div>' + (feedback && feedback[i] ? '<div class="feedback ' + (feedback[i].startsWith("Đúng") ? "correct" : "wrong") + '">' + esc(feedback[i]) + '</div>' : '') + '</div>').join("") +
      '</div><div class="quiz-submit"><span class="muted">Đạt từ 60 điểm để mở bài tiếp theo.</span><button class="button primary" type="submit">Nộp quiz <span aria-hidden="true">→</span></button></div></form></div>';
  }

  function handleLessonSubmit(form) {
    const lesson = L.LESSONS.find((item) => item.id === activeLesson);
    const answers = lesson.quiz.map((_, i) => Number(new FormData(form).get("q" + i)));
    const result = L.completeLesson(state, activeLesson, answers);
    save();
    if (!result.completed) {
      renderLessonModal(lesson, lesson.quiz.map((item, i) => answers[i] === item.answer ? "Đúng. " + item.explanation : "Chưa đúng. " + item.explanation));
      const feedbackNode = lessonDialog.querySelector(".feedback");
      if (feedbackNode) feedbackNode.scrollIntoView({ block: "center", behavior: "smooth" });
      notify("Bạn cần đạt từ 60 điểm để hoàn thành bài. Làm lại nhé.");
    } else {
      lessonDialog.close();
      render();
      notify("Đã hoàn thành " + lesson.title + " · " + result.score + " điểm");
    }
  }

  function handleOnboardNext() {
    const p = state.profile;
    if (onboardingStep === 0) {
      p.location = document.getElementById("is-student").checked ? "hcmc" : "";
      p.intent = document.getElementById("has-intent").checked;
      p.experience = document.querySelector("input[name=experience]:checked")?.value || "";
      if (p.location !== "hcmc" || !p.intent || !p.experience) return notify("Hãy hoàn thành các thông tin bắt buộc trước khi tiếp tục.");
    } else if (onboardingStep === 1) {
      p.mode = document.querySelector("input[name=mode]:checked")?.value || "";
      if (!p.mode) return notify("Hãy chọn một chế độ để tiếp tục.");
    } else if (onboardingStep === 2) {
      p.parq = {};
      document.querySelectorAll("[data-parq]").forEach((input) => { p.parq[input.dataset.parq] = input.checked; });
      if (Object.values(p.parq).some((value) => !value)) return notify("Hãy xác nhận đủ bốn điều về an toàn.");
    } else if (onboardingStep === 3) {
      p.selectedDays = [...document.querySelectorAll("[data-onboard-day]:checked")].map((input) => input.value);
      if (p.selectedDays.length < 2) return notify("Chọn ít nhất hai ngày CƠ BẢN.");
      if (!state.plan.days.length) state.plan.days = p.selectedDays.slice(0, 2);
      if (!["home", "gym"].includes(state.plan.mode) && ["home", "gym"].includes(p.mode)) state.plan.mode = p.mode;
    } else {
      const form = document.getElementById("assessment-form");
      if (!form.reportValidity()) return;
      const values = [...new FormData(form).values()].map(Number);
      state.assessment = { form: "A", answers: values, score: L.calculateScore(values, values.length === L.ENTRY_QUIZ.length ? L.ENTRY_QUIZ : L.FINAL_QUIZ), completedAt: new Date().toISOString() };
      state.profile.setupDeferred = false;
      save();
      route = "home";
      render();
      notify("Hồ sơ đã xong. Bắt đầu bài 1 nhé.");
      return;
    }
    save();
    onboardingStep += 1;
    render();
  }

  function savePlan(form) {
    const fd = new FormData(form);
    const days = fd.getAll("days");
    const plan = {
      mode: fd.get("mode"),
      days: days,
      ifThen: { ifText: String(fd.get("ifText") || "").trim(), thenText: String(fd.get("thenText") || "").trim() },
      createdAt: new Date().toISOString(),
      startedAt: state.plan.startedAt
    };
    if (!L.validPlan(plan)) {
      updatePlanChecklist(form);
      return notify("Chọn chế độ, ít nhất hai ngày và điền đủ kế hoạch nếu–thì.");
    }
    state.plan = plan;
    save();
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
    notify("Đã lưu kế hoạch hai buổi của bạn.");
  }

  function download(filename, content, type) { const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob([content], { type })); link.download = filename; link.click(); URL.revokeObjectURL(link.href); }

  function buildGuide() {
    const gym = state.plan.mode === "gym";
    return {
      title: gym ? "Gym cơ bản · Buổi đầu" : "Nhà cơ bản · Buổi đầu",
      subtitle: gym ? "Máy và tạ · 30 phút · 5–6 động tác nền" : "Trọng lượng cơ thể · 30 phút · 5–6 động tác nền",
      phases: [
        {
          name: "Khởi động",
          time: "5 phút",
          items: ["Xoay khớp vai, hông và gối · 2 phút", "Squat không tạ · 2 hiệp × 8", "Cầu mông · 2 hiệp × 8"]
        },
        {
          name: "Toàn thân",
          time: "20 phút",
          items: gym
            ? ["Leg press hoặc squat · 3 hiệp × 8", "Chest press hoặc chống đẩy · 3 hiệp × 8", "Lat pulldown hoặc row · 3 hiệp × 8", "Plank · 3 hiệp × 20–30 giây", "Đạp xe hoặc đi bộ nhẹ · 2 phút"]
            : ["Squat ghế · 3 hiệp × 8", "Chống đẩy tường · 3 hiệp × 5–8", "Cầu mông · 3 hiệp × 10", "Plank đầu gối · 3 hiệp × 20 giây", "Đi bộ tại chỗ · 2 phút"]
        },
        {
          name: "Thư giãn",
          time: "5 phút",
          items: ["Thở chậm 4–6 · 2 phút", "Giãn ngực, hông và đùi · 3 phút"]
        }
      ]
    };
  }

  function renderGuide() {
    const guide = buildGuide();
    const phases = guide.phases.map((phase, index) =>
      '<section class="guide-phase"><div class="guide-phase-head"><span>' + String(index + 1).padStart(2, "0") + '</span><div><h3>' + phase.name + '</h3><small>' + phase.time + '</small></div></div><ul>' + phase.items.map((item) => '<li>' + item + '</li>').join("") + '</ul></section>'
    ).join("");
    guideDialog.innerHTML = '<div class="modal-inner"><div class="modal-head"><div><p class="kicker">GIÁO ÁN 30 PHÚT</p><h2>' + guide.title + '</h2></div><button class="close" data-action="close-guide" aria-label="Đóng giáo án">×</button></div>' +
      '<p class="guide-subtitle">' + guide.subtitle + '</p>' +
      '<div class="guide-note"><strong>Quy tắc buổi đầu:</strong> chọn mức vừa sức, nghỉ 60–90 giây giữa hiệp. Nếu đau nhói hoặc chóng mặt, dừng lại.</div>' +
      '<div class="guide-timeline">' + phases + '</div>' +
      '<div class="guide-footer"><span>Mở giáo án đã được ghi nhận. Bạn có thể quay lại bất cứ lúc nào.</span><div><button class="button ghost" data-action="ics">Tải lịch .ics</button><button class="button primary" data-action="close-guide">Bắt đầu buổi tập <span aria-hidden="true">→</span></button></div></div></div>';
    guideDialog.showModal();
  }

  function openGuide() {
    if (!L.validPlan(state.plan)) {
      navigate("plan");
      notify("Hãy lưu kế hoạch hai buổi trước khi mở giáo án.");
      return;
    }
    L.addAction(state, "openedGuides", new Date().toISOString());
    state.plan.startedAt = new Date().toISOString();
    save();
    render();
    renderGuide();
  }

  function downloadCalendar() {
    try {
      download("co-ban-lich-tap.ics", L.makeICS(state.plan), "text/calendar;charset=utf-8");
      L.addAction(state, "addedCalendar", new Date().toISOString());
      save();
      render();
      notify("Đã tải lịch tập.");
    } catch (error) {
      notify(error.message);
    }
  }

  function updatePlanChecklist(form) {
    if (!form) return;
    const fd = new FormData(form);
    const checks = {
      mode: Boolean(fd.get("mode")),
      days: fd.getAll("days").length >= 2,
      ifThen: Boolean(String(fd.get("ifText") || "").trim() && String(fd.get("thenText") || "").trim())
    };
    const list = document.getElementById("plan-checklist");
    if (list) {
      Object.keys(checks).forEach((key) => {
        const item = list.querySelector('[data-check="' + key + '"]');
        if (!item) return;
        item.classList.toggle("done", checks[key]);
        const marker = item.querySelector("span");
        if (marker) marker.textContent = checks[key] ? "✓" : String(["mode", "days", "ifThen"].indexOf(key) + 1);
      });
    }
    const submit = form.querySelector('button[type="submit"]');
    if (submit) submit.disabled = !Object.values(checks).every(Boolean);
  }

  document.addEventListener("click", (event) => {
    const routeButton = event.target.closest("[data-route]");
    if (routeButton) { event.preventDefault(); navigate(routeButton.dataset.route); return; }
    const lesson = event.target.closest("[data-lesson]");
    if (lesson) { openLesson(lesson.dataset.lesson); return; }
    const action = event.target.closest("[data-action]")?.dataset.action;
    if (!action) return;
    if (action === "primary-next") {
      const step = nextStep();
      if (step.action === "onboarding") navigate("onboarding");
      else if (step.action === "lesson") openLesson(step.lesson.id);
      else if (step.action === "plan") navigate("plan");
      else if (step.action === "guide") openGuide();
      else if (step.action === "calendar") downloadCalendar();
      else navigate("achievements");
      return;
    }
    if (action === "open-next") {
      const next = nextLesson() || L.LESSONS[L.LESSONS.length - 1];
      openLesson(next.id);
      return;
    }
    if (action === "close-modal") lessonDialog.close();
    if (action === "close-guide") guideDialog.close();
    if (action === "onboard-next") handleOnboardNext();
    if (action === "onboard-back") { onboardingStep = Math.max(0, onboardingStep - 1); render(); }
    if (action === "onboard-exit") {
      state.profile.setupDeferred = true;
      save();
      navigate("home");
      notify("Đã bỏ qua thiết lập. Bạn vẫn có thể hoàn tất trong Cài đặt.");
    }
    if (action === "onboard-skip-assessment") { save(); navigate("home"); notify("Đã lưu hồ sơ. Bạn có thể làm bài kiểm tra sau."); }
    if (action === "reset") {
      if (confirm("Xóa toàn bộ tiến độ CƠ BẢN trên thiết bị này?")) {
        localStorage.removeItem(STORAGE_KEY);
        state = L.freshState();
        navigate("onboarding");
        notify("Đã xóa dữ liệu.");
      }
    }
    if (action === "guide") openGuide();
    if (action === "ics") downloadCalendar();
    if (action === "export") download("co-ban-tien-do.json", L.exportState(state), "application/json");
  });

  document.addEventListener("keydown", (event) => { const lesson = event.target.closest?.("[data-lesson]"); if (lesson && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); openLesson(lesson.dataset.lesson); } });
  document.addEventListener("submit", (event) => { if (event.target.id === "lesson-quiz-form") { event.preventDefault(); handleLessonSubmit(event.target); } if (event.target.id === "plan-form") { event.preventDefault(); savePlan(event.target); } });
  document.addEventListener("change", (event) => {
    const planForm = event.target.closest?.("#plan-form");
    if (planForm) updatePlanChecklist(event.target.form || planForm);
    if (event.target.id === "import-json" && event.target.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          state = L.importState(reader.result);
          save();
          render();
          notify("Đã nhập tiến độ.");
        } catch (error) {
          notify("Không thể nhập JSON: " + error.message);
        }
      };
      reader.readAsText(event.target.files[0]);
    }
  });
  document.addEventListener("input", (event) => {
    const planForm = event.target.closest?.("#plan-form");
    if (planForm) updatePlanChecklist(event.target.form || planForm);
  });

  window.addEventListener("hashchange", syncRouteFromHash);

  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    navigator.serviceWorker.register("service-worker.js", { updateViaCache: "none" }).catch(() => {});
  }
  render();
})();

