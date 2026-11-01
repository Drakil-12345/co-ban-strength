/* rewards.js — rewards layer: per-lesson badges, action badges and a rank
   (Bậc) that mirrors the 2 / 4 / 6 / 8 milestones defined in logic.js.
   READ-ONLY by design: it reads localStorage "co-ban-strength-v1" and
   window.CoBanLogic, then injects <section id="fx-rewards"> right after
   .achievement-grid on the achievements route. It never writes state and
   never modifies app.js / logic.js rendering. Zero deps; runs on file://. */
(function () {
  "use strict";

  var L = window.CoBanLogic || null;
  var STORE_KEY = "co-ban-strength-v1";
  var SECTION_ID = "fx-rewards";

  /* ---------- helpers ---------- */

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function pad(value) { return value < 10 ? "0" + value : String(value); }

  function readState() {
    if (!L) return null;
    var raw = null;
    try { raw = localStorage.getItem(STORE_KEY); } catch (error) { raw = null; }
    if (raw) {
      try { return L.normalizeState(JSON.parse(raw)); } catch (error) { /* corrupt → treat as fresh */ }
    }
    /* No stored state yet: show the ladder anyway so "Tiến độ" stays complete. */
    try { return L.freshState(); } catch (error) { return null; }
  }

  function completedCount(state) { return L.progress(state); }

  function bestScore(state) {
    return L.LESSONS.reduce(function (max, lesson) {
      var record = state.lessons[lesson.id];
      return Math.max(max, (record && Number(record.bestScore)) || 0);
    }, 0);
  }

  function shortDate(iso) {
    var date = new Date(iso);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
  }

  /* ---------- rank ladder (same thresholds as logic.js) ---------- */

  var TIERS = [
    { min: 0, numeral: "0", name: "MẦM NON" },
    { min: 2, numeral: "I", name: "TẬP SỰ" },
    { min: 4, numeral: "II", name: "KIÊN TRÌ" },
    { min: 6, numeral: "III", name: "KỶ LUẬT" },
    { min: 8, numeral: "IV", name: "NỘI LỰC" }
  ];

  function tierInfo(count) {
    var index = 0;
    TIERS.forEach(function (tier, i) { if (count >= tier.min) index = i; });
    var current = TIERS[index];
    var next = TIERS[index + 1] || null;
    var ratio = 1;
    if (next) {
      ratio = Math.min(1, Math.max(0, (count - current.min) / (next.min - current.min)));
    }
    return { current: current, next: next, ratio: ratio };
  }

  /* ---------- sections ---------- */

  function rankCard(state, count) {
    var info = tierInfo(count);
    var sub;
    if (count === 0) sub = "Chưa ghi nhận bài học nào — bài 1 đang mở.";
    else if (info.next) sub = count + "/8 bài học · còn " + (info.next.min - count) + " bài để lên Bậc " + info.next.numeral + " " + esc(info.next.name) + ".";
    else sub = "8/8 bài học · bạn đã mở đủ bốn bậc.";
    return '<article class="reward-rank" data-tier="' + info.current.numeral + '">' +
      '<div class="rank-medal" aria-hidden="true"><span>' + info.current.numeral + '</span><small>BẬC</small></div>' +
      '<div class="rank-body">' +
      '<p class="kicker">XẾP HẠNG TIẾN BỘ</p>' +
      '<h3>Bậc ' + info.current.numeral + ' · ' + esc(info.current.name) + '</h3>' +
      '<p class="rank-sub">' + sub + '</p>' +
      '<div class="rank-track" aria-hidden="true"><span style="width:' + Math.round(info.ratio * 100) + '%"></span></div>' +
      '<div class="rank-meta">' +
      '<span class="rank-chip">Điểm cao nhất · ' + bestScore(state) + '/100</span>' +
      '<button class="button ghost rank-share" type="button">Chia sẻ hạng</button>' +
      '</div></div></article>';
  }

  function lessonTiles(state) {
    return L.LESSONS.map(function (lesson, index) {
      var record = state.lessons[lesson.id];
      var status = (record && record.status) || "locked";
      var stateText;
      if (status === "completed") {
        stateText = "Đã học" + (record.completedAt ? " · " + esc(shortDate(record.completedAt)) : "");
      } else if (status === "available") {
        stateText = "Đang mở";
      } else {
        stateText = "Chưa mở";
      }
      return '<li class="lesson-tile ' + status + '">' +
        '<span class="lt-num" aria-hidden="true">' + pad(index + 1) + '</span>' +
        '<strong>' + esc(lesson.title) + '</strong>' +
        '<small class="lt-state">' + stateText + '</small>' +
        '</li>';
    }).join("");
  }

  function earnedAction(state, key) {
    switch (key) {
      case "perfect": return bestScore(state) === 100;
      case "plan": return Boolean(state.plan && state.plan.createdAt && L.validPlan(state.plan));
      case "guides": return Array.isArray(state.actions.openedGuides) && state.actions.openedGuides.length > 0;
      case "ics": return Array.isArray(state.actions.addedCalendar) && state.actions.addedCalendar.length > 0;
      case "cert": return Boolean(L.certificateEligible(state));
      default: return false;
    }
  }

  var ACTIONS = [
    { key: "perfect", label: "TRỌN ĐIỂM", desc: "Có bài đạt trọn điểm 100/100." },
    { key: "plan", label: "KẾ HOẠCH KHỞI ĐỘNG", desc: "Chốt hai ngày và kế hoạch nếu–thì." },
    { key: "guides", label: "GIÁO ÁN MỞ", desc: "Mở giáo án buổi tập đầu tiên." },
    { key: "ics", label: "LỊCH 30 NGÀY", desc: "Thêm buổi tập vào lịch của bạn." },
    { key: "cert", label: "CHỨNG NHẬN", desc: "Học xong 8 bài, điểm từ 80." }
  ];

  function actionTiles(state) {
    return ACTIONS.map(function (action) {
      var earned = earnedAction(state, action.key);
      return '<li class="action-badge' + (earned ? " earned" : "") + '">' +
        '<strong>' + action.label + '</strong>' +
        '<small>' + action.desc + '</small>' +
        '<span class="ab-mark">' + (earned ? "ĐẠT" : "CHƯA") + '</span>' +
        '</li>';
    }).join("");
  }

  function sectionHTML(state) {
    var count = completedCount(state);
    return rankCard(state, count) +
      '<div class="reward-columns">' +
      '<section class="reward-block"><header><p class="kicker">THÀNH TỰU BÀI HỌC</p><h3>Tám bài, nhịp từng bài một.</h3></header>' +
      '<ol class="reward-lessons">' + lessonTiles(state) + '</ol></section>' +
      '<section class="reward-block"><header><p class="kicker">HUY HIỆU HÀNH ĐỘNG</p><h3>Năm việc thật, không huy hiệu ảo.</h3></header>' +
      '<ul class="reward-actions">' + actionTiles(state) + '</ul></section>' +
      '</div>';
  }

  /* ---------- mount (guarded: never re-injects, never loops) ---------- */

  function mount() {
    if (!L) return;
    var grid = document.querySelector("#app-root .achievement-grid");
    if (!grid) return;
    var following = grid.nextElementSibling;
    if (following && following.id === SECTION_ID) return;
    var stale = document.getElementById(SECTION_ID);
    if (stale) stale.remove();
    var state = readState();
    if (!state) return;
    var section = document.createElement("section");
    section.id = SECTION_ID;
    section.setAttribute("aria-label", "Thành tựu bài học và xếp hạng tiến độ");
    section.innerHTML = sectionHTML(state);
    grid.after(section);
  }

  /* ---------- share rank (clipboard only, no backend) ---------- */

  function shareText(state) {
    var count = completedCount(state);
    var info = tierInfo(count);
    return "CƠ BẢN · Bậc " + info.current.numeral + " " + info.current.name +
      " — " + count + "/8 bài học · Điểm cao nhất " + bestScore(state) + "/100";
  }

  function flash(button, label, ok) {
    if (button._fxRewardBusy) return;
    button._fxRewardBusy = true;
    var original = button.textContent;
    button.textContent = label;
    button.classList.add(ok ? "copied" : "failed");
    button.disabled = true;
    window.setTimeout(function () {
      button.textContent = original;
      button.classList.remove(ok ? "copied" : "failed");
      button.disabled = false;
      button._fxRewardBusy = false;
    }, 1800);
  }

  function legacyCopy(text) {
    var area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "readonly");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (error) { ok = false; }
    area.remove();
    return ok;
  }

  document.addEventListener("click", function (event) {
    var button = event.target.closest(".rank-share");
    if (!button) return;
    var state = readState();
    if (!state) return;
    var text = shareText(state);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { flash(button, "Đã sao chép", true); }, function () {
        if (legacyCopy(text)) flash(button, "Đã sao chép", true);
        else flash(button, "Chưa chép được", false);
      });
    } else if (legacyCopy(text)) {
      flash(button, "Đã sao chép", true);
    } else {
      flash(button, "Chưa chép được", false);
    }
  });

  /* ---------- per-render wiring (survives innerHTML swaps) ---------- */

  var rootEl = document.getElementById("app-root");
  if (rootEl && "MutationObserver" in window) {
    var pending = 0;
    function schedule() {
      if (pending) window.cancelAnimationFrame(pending);
      pending = window.requestAnimationFrame(function () { pending = 0; mount(); });
    }
    new MutationObserver(schedule).observe(rootEl, { childList: true, subtree: true });
    schedule();
  } else {
    mount();
  }
})();
