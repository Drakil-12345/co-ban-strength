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

  /* ---------- badge artwork (inline SVG, palette: red accent + neutrals) ---------- */

  function svgOpen(size) {
    return '<svg class="{{cls}}" viewBox="0 0 48 48" width="' + size + '" height="' + size + '" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
  }
  function svgText(x, y, size, content) {
    return '<text x="' + x + '" y="' + y + '" font-size="' + size + '" font-weight="800" text-anchor="middle" fill="currentColor" stroke="none">' + content + '</text>';
  }

  function actionIcon(key) {
    var i = svgOpen(44).replace("{{cls}}", "ab-svg");
    if (key === "perfect") return i +
      '<circle cx="24" cy="24" r="21"/>' +
      '<path d="M24 11.5l3.7 7.6 8.4 1.2-6 5.9 1.4 8.3L24 30.5l-7.5 4 1.4-8.3-6-5.9 8.4-1.2z"/>' +
      '</svg>';
    if (key === "plan") return i +
      '<rect x="12" y="9" width="24" height="30" rx="3"/>' +
      '<rect x="19" y="6" width="10" height="6" rx="2"/>' +
      '<path d="M18 25l4 4 8.5-8.5"/>' +
      '</svg>';
    if (key === "guides") return i +
      '<path d="M24 12c-3.5-2.6-9-2.7-14-.6v25c5-2.1 10.5-2 14 .6 3.5-2.6 9-2.7 14-.6v-25c-5-2.1-10.5-2-14 .6z"/>' +
      '<path d="M24 12v25"/>' +
      '</svg>';
    if (key === "ics") return i +
      '<rect x="9" y="12" width="30" height="27" rx="3"/>' +
      '<path d="M9 19.5h30M17 10v5M31 10v5"/>' +
      svgText(24, 33.5, 11, "30") +
      '</svg>';
    if (key === "cert") return i +
      '<circle cx="24" cy="19" r="10"/>' +
      '<circle cx="24" cy="19" r="5.2"/>' +
      '<path d="M18.5 27.5L15 43l9-5 9 5-3.5-15.5"/>' +
      '</svg>';
    return i + '</svg>';
  }

  function lessonCoin(index, status) {
    var svg = '<svg class="lt-svg" viewBox="0 0 48 48" width="42" height="42" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">' +
      (status === "locked"
        ? '<circle cx="24" cy="24" r="19" stroke-dasharray="3.5 4"/>'
        : '<circle cx="24" cy="24" r="19"/>') +
      '<circle cx="24" cy="24" r="14" stroke-width=".8" stroke-dasharray="1.5 3"/>' +
      svgText(24, 30.5, 16, index < 10 ? "0" + index : String(index)) +
      (status === "completed"
        ? '<g class="lt-check"><circle cx="36.5" cy="36.5" r="7" fill="#4d9e61" stroke="none"/><path d="M33.2 36.6l2.4 2.4 4-4.6" stroke="#fff" stroke-width="1.8"/></g>'
        : "") +
      '</svg>';
    return '<span class="lt-coin" aria-hidden="true">' + svg + '</span>';
  }

  function laurel() {
    /* engraved laurel wreath behind the tier numeral */
    return '<svg class="rank-laurel" viewBox="0 0 48 48" width="88" height="88" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" aria-hidden="true">' +
      '<circle cx="24" cy="24" r="22" opacity=".55"/>' +
      '<path d="M14 8C9 15 7.5 24 10 33c1.6 3.2 3.9 5.6 6.8 7" opacity=".9"/>' +
      '<path d="M34 8c5 7 6.5 16 4 25-1.6 3.2-3.9 5.6-6.8 7" opacity=".9"/>' +
      '<path d="M9.5 28l-3-1.4M11 22l-3.2-.9M13.5 17l-3-1.7M17 12.8l-2.4-2.3M38.5 28l3-1.4M37 22l3.2-.9M34.5 17l3-1.7M31 12.8l2.4-2.3" opacity=".8"/>' +
      '<path d="M17 40l7 3 7-3" opacity=".9"/>' +
      '</svg>';
  }

  /* ---------- sections ---------- */

  function rankCard(state, count) {
    var info = tierInfo(count);
    var sub;
    if (count === 0) sub = "Chưa ghi nhận bài học nào — bài 1 đang mở.";
    else if (info.next) sub = count + "/8 bài học · còn " + (info.next.min - count) + " bài để lên Bậc " + info.next.numeral + " " + esc(info.next.name) + ".";
    else sub = "8/8 bài học · bạn đã mở đủ bốn bậc.";
    return '<article class="reward-rank" data-tier="' + info.current.numeral + '">' +
      '<div class="rank-medal" aria-hidden="true">' + laurel() +
      '<span class="rank-numeral">' + info.current.numeral + '</span><small class="rank-tag">BẬC</small></div>' +
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
        lessonCoin(index + 1, status) +
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
        '<span class="ab-icon" aria-hidden="true">' + actionIcon(action.key) + '</span>' +
        '<span class="ab-text"><strong>' + action.label + '</strong>' +
        '<small>' + action.desc + '</small></span>' +
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
