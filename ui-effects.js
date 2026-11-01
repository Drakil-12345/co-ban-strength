/* ui-effects.js — presentation-only layer. Zero deps, runs on file:// too.
   Drives: scroll progress bar, below-fold reveal, ripple, count-up,
   progress-ring sweep, card tilt. All effects are skipped entirely when
   prefers-reduced-motion is set, so state/logic and tests stay untouched. */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- helpers ---------- */

  function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function raf(fn) { return window.requestAnimationFrame(fn); }

  /* ---------- scroll progress hairline + sidebar shadow ---------- */

  var progressBar = null;
  var scrollTick = false;

  function onScroll() {
    if (scrollTick) return;
    scrollTick = true;
    raf(function () {
      scrollTick = false;
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      var ratio = max > 0 ? clamp(window.scrollY / max, 0, 1) : 0;
      progressBar.style.transform = "scaleX(" + ratio + ")";
      document.body.classList.toggle("fx-scrolled", window.scrollY > 8);
    });
  }

  if (!reduced) {
    progressBar = document.createElement("div");
    progressBar.id = "fx-progress";
    progressBar.setAttribute("aria-hidden", "true");
    document.body.appendChild(progressBar);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- below-fold reveal ---------- */

  var REVEAL_SELECTOR = [
    ".week-block", ".achievement", ".score-banner", ".next-up",
    ".plan-summary", ".form-card", ".panel", ".onboarding-shell",
    ".guide-phase", ".safety-note"
  ].join(",");

  var io = null;
  if (!reduced && "IntersectionObserver" in window) {
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("fx-in");
        io.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
  }

  function previousDelay(el, selector) {
    var delay = 0;
    var step = el;
    while ((step = step.previousElementSibling)) {
      if (!step.matches(selector)) continue;
      delay += 70;
      if (delay >= 420) break;
    }
    return delay;
  }

  function registerReveal(root) {
    if (!io || !root || !root.querySelectorAll) return;
    var targets = root.querySelectorAll(REVEAL_SELECTOR);
    Array.prototype.forEach.call(targets, function (el) {
      if (el.classList.contains("fx-reveal") || el.classList.contains("fx-in")) return;
      var box = el.getBoundingClientRect();
      if (box.top < window.innerHeight * 0.92) return; /* above fold → CSS entrance handles it */
      el.classList.add("fx-reveal");
      el.style.setProperty("--fx-delay", previousDelay(el, el.className.split(" ")[0]) + "ms");
      io.observe(el);
    });
  }

  /* ---------- count-up + progress ring sweep ---------- */
  /* Elements: .hero-ring strong (0..completed), .score-number (single integer
     text node when not "ĐẠT"). Ring sweep animates --progress 0deg → target. */

  var doneNumbers = new WeakSet;

  function animateNumber(el, to) {
    if (doneNumbers.has(el)) return;
    doneNumbers.add(el);
    if (el.dataset.fxTarget !== undefined) to = Number(el.dataset.fxTarget);
    if (!isFinite(to)) return;
    el.dataset.fxTarget = String(to);
    var start = null;
    var duration = to > 20 ? 900 : 620;
    function frame(now) {
      if (start === null) start = now;
      var t = clamp((now - start) / duration, 0, 1);
      el.textContent = String(Math.round(easeOutCubic(t) * to));
      if (t < 1) raf(frame);
    }
    raf(frame);
  }

  function animateRing(ring) {
    if (ring.dataset.fxSwept) return;
    var target = parseFloat(ring.style.getPropertyValue("--progress"));
    if (!isFinite(target)) return;
    ring.dataset.fxSwept = "1";
    var start = null;
    var duration = 950;
    function frame(now) {
      if (start === null) start = now;
      var t = clamp((now - start) / duration, 0, 1);
      ring.style.setProperty("--progress", (easeOutCubic(t) * target).toFixed(2) + "deg");
      if (t < 1) raf(frame);
    }
    raf(frame);
  }

  function registerCounters(root) {
    if (!root || !root.querySelectorAll) return;
    if (reduced) { /* skip: leaves exact numbers in place */ }
    else {
      Array.prototype.forEach.call(root.querySelectorAll(".hero-ring strong"), function (el) {
        animateNumber(el, Number(el.textContent) || 0);
      });
      Array.prototype.forEach.call(root.querySelectorAll(".score-number"), function (el) {
        var raw = (el.textContent || "").trim();
        var match = raw.match(/^\d+/);
        if (match) animateNumber(el.firstChild && el.firstChild.nodeType === 3 ? el.firstChild : el, Number(match[0]));
      });
    }
    Array.prototype.forEach.call(root.querySelectorAll(".hero-ring"), animateRing);
  }

  /* ---------- ripple ---------- */

  var RIPPLE_SELECTOR = ".button, .icon-button, .close, .option, .mobile-nav button";

  document.addEventListener("pointerdown", function (event) {
    if (reduced || event.button !== 0) return;
    var host = event.target.closest(RIPPLE_SELECTOR);
    if (!host || host.disabled || host.classList.contains("locked")) return;
    var rect = host.getBoundingClientRect();
    var size = Math.max(rect.width, rect.height) * 2.2;
    var ripple = document.createElement("span");
    ripple.className = "fx-ripple";
    ripple.style.width = ripple.style.height = size + "px";
    ripple.style.left = (event.clientX - rect.left - size / 2) + "px";
    ripple.style.top = (event.clientY - rect.top - size / 2) + "px";
    var flow = getComputedStyle(host).position;
    ripple._cleanup = function () { ripple.remove(); };
    ripple.addEventListener("animationend", ripple._cleanup);
    host.style.position = flow === "static" ? "relative" : flow;
    if (getComputedStyle(host).overflow !== "hidden") host.style.overflow = "clip";
    host.appendChild(ripple);
  }, { passive: true });

  /* ---------- subtle tilt on interactive cards ---------- */

  function tilt(card) {
    if (card.dataset.fxTiltBound) return;
    card.dataset.fxTiltBound = "1";
    var frame = 0;
    card.addEventListener("mousemove", function (event) {
      if (frame) return;
      var rect = card.getBoundingClientRect();
      var dx = (event.clientX - rect.left) / rect.width - 0.5;
      var dy = (event.clientY - rect.top) / rect.height - 0.5;
      frame = raf(function () {
        frame = 0;
        card.style.transform =
          "perspective(900px) rotateX(" + (-dy * 3).toFixed(2) + "deg) rotateY(" +
          (dx * 3).toFixed(2) + "deg) translateY(-3px)";
      });
    });
    card.addEventListener("mouseleave", function () {
      if (frame) { window.cancelAnimationFrame(frame); frame = 0; }
      card.style.transform = "";
    });
  }

  /* ---------- per-render init (survives innerHTML swaps) ---------- */

  function init(root) {
    registerReveal(root);
    registerCounters(root);
    if (finePointer && !reduced) {
      Array.prototype.forEach.call((root || document).querySelectorAll(".journey-card, .achievement"), tilt);
    }
  }

  var pending = 0;
  function schedule(root) {
    if (pending) window.cancelAnimationFrame(pending);
    pending = raf(function () { pending = 0; init(root); });
  }

  var rootEl = document.getElementById("app-root");
  if (rootEl) {
    schedule(rootEl);
    if ("MutationObserver" in window && !reduced) {
      new MutationObserver(function () { schedule(rootEl); })
        .observe(rootEl, { childList: true, subtree: true });
    }
  } else {
    raf(function () { init(document.body); });
  }

  ["lesson-dialog", "guide-dialog"].forEach(function (id) {
    var dialog = document.getElementById(id);
    if (!dialog) return;
    if ("MutationObserver" in window && !reduced) {
      new MutationObserver(function () { schedule(dialog); })
        .observe(dialog, { childList: true, subtree: true });
    }
  });
})();
