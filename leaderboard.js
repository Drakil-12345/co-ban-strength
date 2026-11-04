/* leaderboard.js — bảng xếp hạng tiến độ, layer chỉ ĐỌC đối với state app.
   Đọc localStorage "co-ban-strength-v1" (tiêu chí xếp hạng) + key riêng của nó
   ("co-ban-strength-leader-v1" hồ sơ bạn, "co-ban-strength-friends-v1" bạn bè
   nhập bằng mã) và render <section id="fx-leaderboard"> ngay sau #fx-rewards
   trên màn Tiến độ. Không bao giờ ghi state app, không đụng app.js/logic.js.
   TRANSPORT hiện tại là "demo" (dữ liệu mô phỏng, có đánh dấu). Khi có backend
   thật (kvdb.io bucket đã verify email, hoặc Firebase Realtime Database), chỉ
   cần thay Transport.fetch / Transport.publish bên dưới — giao diện giữ nguyên:
     kvdb.io : GET https://kvdb.io/<BUCKET>/leaderboard → JSON; publish = GET,
               ghép mảng, PUT lại (bucket đơn, dùng được vì CORS "open").
     Firebase: GET /leaderboard.json, PATCH entry theo uid. */
(function () {
  "use strict";

  var L = window.CoBanLogic || null;
  var STORE = "co-ban-strength-leader-v1";
  var FRIENDS = "co-ban-strength-friends-v1";
  var SECTION_ID = "fx-leaderboard";

  /* ---------- helpers ---------- */

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function readJSON(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return fallback;
      var parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : fallback;
    } catch (error) { return fallback; }
  }

  function writeJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (error) { return false; }
  }

  function readState() {
    if (!L) return null;
    try {
      var raw = localStorage.getItem("co-ban-strength-v1");
      return raw ? L.normalizeState(JSON.parse(raw)) : L.freshState();
    } catch (error) { return null; }
  }

  /* Cùng thang bậc với logic.js (2/4/6/8) — bản local để module độc lập. */
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
    return TIERS[index];
  }

  function bestScore(state) {
    return L.LESSONS.reduce(function (max, lesson) {
      var record = state.lessons[lesson.id];
      return Math.max(max, (record && Number(record.bestScore)) || 0);
    }, 0);
  }

  /* ---------- transport (pluggable) ---------- */

  var TRANSPORT_ID = "demo";

  var DEMO_PEERS = [
    { uid: "d01", nick: "Minh Anh", lessons: 8, best: 96 },
    { uid: "d02", nick: "Hoàng Nam", lessons: 7, best: 90 },
    { uid: "d03", nick: "Kim Ngân", lessons: 6, best: 100 },
    { uid: "d04", nick: "Trung Tín", lessons: 6, best: 83 },
    { uid: "d05", nick: "Bảo Trân", lessons: 5, best: 79 },
    { uid: "d06", nick: "Quốc Đạt", lessons: 4, best: 100 },
    { uid: "d07", nick: "Như Ý", lessons: 4, best: 72 },
    { uid: "d08", nick: "Gia Huy", lessons: 3, best: 88 },
    { uid: "d09", nick: "Thanh Tâm", lessons: 3, best: 61 },
    { uid: "d10", nick: "Vĩnh Khang", lessons: 2, best: 94 },
    { uid: "d11", nick: "Mai Phương", lessons: 2, best: 70 },
    { uid: "d12", nick: "Hưng Cường", lessons: 1, best: 100 },
    { uid: "d13", nick: "Thảo Vy", lessons: 1, best: 66 },
    { uid: "d14", nick: "Sáng Vinh", lessons: 0, best: 0 }
  ];

  var Transport = {
    id: "demo",
    label: "DEMO · chưa kết nối",
    /* Khi cắm backend thật, hai hàm dưới đây là chỗ duy nhất phải sửa. */
    fetch: function () {
      return Promise.resolve(DEMO_PEERS.map(function (p) { return Object.assign({}, p); }));
    },
    publish: function (entry) {
      /* demo: bản thân mới được "lên sóng" trong phiên — không lưu ngoài. */
      return Promise.resolve(entry);
    }
  };

  /* ---------- profile (bạn) + bạn bè ---------- */

  function loadProfile() { return readJSON(STORE, null); }

  function loadFriends() {
    var list = readJSON(FRIENDS, []);
    return Array.isArray(list) ? list : [];
  }

  function friendFromLine(line) {
    var parts = String(line).trim().split("|").map(function (part) { return part.trim(); });
    if (parts.length !== 5 || parts[0].toUpperCase() !== "CB") return null;
    var nick = parts[1].slice(0, 20);
    var tierIndex = Math.min(4, Math.max(0, parseInt(parts[2], 10) || 0));
    var lessons = Math.min(8, Math.max(0, parseInt(parts[3], 10) || 0));
    var best = Math.min(100, Math.max(0, parseInt(parts[4], 10) || 0));
    if (!nick) return null;
    return { uid: "f" + nick.toLowerCase(), nick: nick, lessons: lessons, best: best, tier: tierIndex, friend: true };
  }

  function shareCode(entry) {
    return "CB|" + (entry.nick || "Bạn") + "|" + (entry.tier || 0) + "|" + entry.lessons + "|" + entry.best;
  }

  function myEntry() {
    var state = readState();
    if (!state) return null;
    var count = L.progress(state);
    var profile = loadProfile();
    return {
      uid: "me",
      nick: (profile && profile.nick) || "",
      lessons: count,
      best: bestScore(state),
      tier: TIERS.indexOf(tierInfo(count)),
      me: true
    };
  }

  /* ---------- render ---------- */

  function rows(entries) {
    return entries.map(function (entry, index) {
      var tier = TIERS[entry.tier] || TIERS[0];
      var tag = entry.me ? '<span class="lb-you-tag">BẠN</span>' : entry.friend ? '<span class="lb-friend-tag">BẠN BÈ</span>' : "";
      return '<li class="lb-row' + (entry.me ? " me" : "") + '">' +
        '<span class="lb-pos">' + (index + 1) + '</span>' +
        '<span class="lb-nick" title="' + esc(entry.nick) + '">' + esc(entry.nick || "Vô danh") + tag + '</span>' +
        '<span class="lb-tier">B' + entry.tier + ' · ' + esc(tier.name) + '</span>' +
        '<span class="lb-lessons">' + entry.lessons + '/8</span>' +
        '<span class="lb-best">' + entry.best + '</span>' +
        '</li>';
    }).join("");
  }

  function table(entries, me) {
    var myIndex = -1;
    entries.forEach(function (entry, index) { if (entry.me) myIndex = index; });
    var rank = myIndex >= 0 ? "#" + (myIndex + 1) + "/" + entries.length : "chưa có mặt";
    return '<header class="lb-head"><div><p class="kicker">ĐUA SỨC BỀN, KHÔNG ĐUA TẢN NHÊ</p>' +
      '<h3>Bảng xếp hạng demo</h3></div>' +
      '<div class="lb-head-meta"><span class="lb-mode">' + Transport.label + '</span>' +
      '<span class="lb-rank">Hạng của bạn <b>' + esc(rank) + '</b></span></div></header>' +
      '<ul class="lb-list" role="list">' +
      '<li class="lb-row lb-cols" aria-hidden="true"><span>#</span><span>Nickname</span><span>Bậc</span><span>Bài</span><span>Điểm</span></li>' +
      rows(entries) +
      '</ul>' +
      '<div class="lb-actions">' +
      '<button class="button ghost lb-refresh" type="button">Làm mới</button>' +
      '<button class="button ghost lb-copy" type="button">Chia sẻ mã của bạn</button>' +
      '<button class="button ghost lb-add" type="button">Nhập mã bạn bè</button>' +
      '</div>' +
      '<form class="lb-import" id="lb-import-form" hidden>' +
      '<input class="input" id="lb-friend-codes" maxlength="400" placeholder="Dán mã trên mỗi dòng · CB|Tên|bậc|bài|điểm">' +
      '<button class="button primary" type="submit">Ghép vào bảng</button>' +
      '</form>' +
      '<p class="lb-note">Demo so sánh theo bài học xong và điểm cao nhất. Khi cắm backend online (kvdb / Firebase), bảng giữa những người thật sẽ thay vào chỗ này — giao diện giữ nguyên.</p>';
  }

  function setupForm() {
    return '<header class="lb-head"><div><p class="kicker">ĐUA SỨC BỀN, KHÔNG ĐUA TẢN NHÊ</p>' +
      '<h3>Bảng xếp hạng demo</h3><p class="lb-sub">Chọn một nickname để hiện mặt trong bảng. Không mật khẩu, không email.</p></div>' +
      '<span class="lb-mode">' + Transport.label + '</span></header>' +
      '<form class="lb-setup" id="lb-setup-form">' +
      '<input class="input" id="lb-nick" maxlength="20" placeholder="Nickname của bạn" autocomplete="off">' +
      '<button class="button primary" type="submit">Vào bảng hạng</button>' +
      '</form>';
  }

  function section(me, entries, ok) {
    var body;
    if (!ok) {
      body = '<header class="lb-head"><div><p class="kicker">ĐUA SỨC BỀN, KHÔNG ĐUA TẢN NHÊ</p>' +
        '<h3>Bảng xếp hạng demo</h3><p class="lb-sub">Không tải được dữ liệu bảng lúc này.</p></div>' +
        '<span class="lb-mode">'+ Transport.label + '</span></header>' +
        '<div class="lb-actions"><button class="button ghost lb-refresh" type="button">Thử lại</button></div>';
    } else if (me && me.nick) {
      body = table(entries, me);
    } else {
      body = setupForm();
    }
    return '<section id="' + SECTION_ID + '" aria-label="Bảng xếp hạng demo">' + body + '</section>';
  }

  /* ---------- wiring ---------- */

  var cachedEntries = null;

  function serialize(entries) {
    var me = entries.filter(function (entry) { return entry.me; })[0];
    var others = entries.filter(function (entry) { return !entry.me; });
    return { me: me, entries: entries, others: others };
  }

  function computeEntries() {
    var me = myEntry();
    var wantMe = me && me.nick;
    return Transport.fetch().then(function (peers) {
      var friends = loadFriends();
      var all = peers.map(function (entry) {
        var tier = (typeof entry.tier === "number" && entry.tier >= 0)
          ? entry.tier
          : TIERS.indexOf(tierInfo(entry.lessons || 0));
        return { uid: entry.uid, nick: entry.nick, lessons: entry.lessons, best: entry.best, tier: tier };
      });
      friends.forEach(function (friend) {
        var friendTier = (typeof friend.tier === "number" && friend.tier >= 0)
          ? friend.tier
          : TIERS.indexOf(tierInfo(friend.lessons || 0));
        all.push({ uid: friend.uid, nick: friend.nick, lessons: friend.lessons, best: friend.best, tier: friendTier, friend: true });
      });
      if (wantMe) all.push({ uid: "me", nick: me.nick, lessons: me.lessons, best: me.best, tier: me.tier, me: true });
      all.sort(function (a, b) {
        if (b.lessons !== a.lessons) return b.lessons - a.lessons;
        if (b.best !== a.best) return b.best - a.best;
        return a.nick.localeCompare(b.nick, "vi");
      });
      return { me: me, entries: all, ok: true };
    }).catch(function () {
      return { me: me, entries: null, ok: false };
    });
  }

  function mount(force) {
    if (!L) return;
    var anchor = document.getElementById("fx-rewards");
    if (!anchor) return; /* chỉ gắn trên route achievements */
    if (!force) {
      var following = anchor.nextElementSibling;
      if (following && following.id === SECTION_ID) return;
    }
    var stale = document.getElementById(SECTION_ID);
    if (stale) stale.remove();

    computeEntries().then(function (result) {
      var el = document.createElement("section");
      el.id = SECTION_ID;
      el.innerHTML = section(result.me, result.entries, result.ok);
      anchor.after(el);
      cachedEntries = result;
    });
  }

  /* ---------- sự kiện (delegation, sống cùng innerHTML lặp lại) ---------- */

  function flash(button, label) {
    if (button._lbBusy) return;
    button._lbBusy = true;
    var original = button.textContent;
    button.textContent = label;
    button.classList.add("copied");
    window.setTimeout(function () {
      button.textContent = original;
      button.classList.remove("copied");
      button._lbBusy = false;
    }, 1600);
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

  document.addEventListener("submit", function (event) {
    var form = event.target;
    if (form.id === "lb-setup-form") {
      event.preventDefault();
      var input = form.querySelector("#lb-nick");
      var nick = (input.value || "").trim().slice(0, 20);
      if (!nick) { input.focus(); return; }
      writeJSON(STORE, { uid: "me", nick: nick, savedAt: new Date().toISOString() });
      var me = myEntry();
      Transport.publish({ uid: "me", nick: nick, lessons: me ? me.lessons : 0, best: me ? me.best : 0, tier: me ? me.tier : 0, updatedAt: Date.now() });
      mount(true); /* force re-render: section đã tồn tại phải thay bằng bảng */
      return;
    }
    if (form.id === "lb-import-form") {
      event.preventDefault();
      var codes = (form.querySelector("#lb-friend-codes").value || "").split("\n");
      var friends = loadFriends();
      var added = 0;
      codes.forEach(function (line) {
        if (!line.trim()) return;
        var friend = friendFromLine(line);
        if (friend && !friends.some(function (existing) { return existing.uid === friend.uid; })) {
          friends.push(friend);
          added += 1;
        }
      });
      if (added) writeJSON(FRIENDS, friends.slice(-40));
      mount(true); /* force: hiện bảng mới với bạn bè vừa nhập */
      return;
    }
  });

  document.addEventListener("click", function (event) {
    var button = event.target.closest("button");
    if (!button) return;
    var section = button.closest("#" + SECTION_ID);
    if (!section) return;
    if (button.classList.contains("lb-refresh")) {
      cachedEntries = null;
      mount(true);
      flash(button, "Đã làm mới");
      return;
    }
    if (button.classList.contains("lb-copy") && cachedEntries && cachedEntries.me) {
      var code = shareCode(cachedEntries.me);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code).then(
          function () { flash(button, "Đã sao chép"); },
          function () { legacyCopy(code) ? flash(button, "Đã sao chép") : flash(button, "Chưa chép được"); }
        );
      } else {
        legacyCopy(code) ? flash(button, "Đã sao chép") : flash(button, "Chưa chép được");
      }
      return;
    }
    if (button.classList.contains("lb-add")) {
      var form = section.querySelector("#lb-import-form");
      if (form) {
        form.hidden = !form.hidden;
        if (!form.hidden) form.querySelector("#lb-friend-codes").focus();
      }
    }
  });

  /* ---------- mount theo render của app ---------- */

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

  /* API cho test và cho giao năng tương lai (vẫn chỉ đọc). */
  window.CoBanLeaderboard = {
    transport: Transport,
    shareCode: shareCode,
    importCodes: function (text) {
      var friends = loadFriends();
      var added = 0;
      String(text).split("\n").forEach(function (line) {
        if (!line.trim()) return;
        var friend = friendFromLine(line);
        if (friend && !friends.some(function (existing) { return existing.uid === friend.uid; })) {
          friends.push(friend); added += 1;
        }
      });
      if (added) writeJSON(FRIENDS, friends.slice(-40));
      return added;
    },
    setNick: function (nick) {
      writeJSON(STORE, { uid: "me", nick: String(nick || "").slice(0, 20), savedAt: new Date().toISOString() });
    }
  };
})();
