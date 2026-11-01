const assert = require("node:assert/strict");
const { test } = require("node:test");
const {
  LESSONS, FINAL_QUIZ, ENTRY_QUIZ, freshState, calculateScore, completeLesson,
  progress, validPlan, makeICS, certificateEligible, exportState, importState,
  behaviorStage
} = require("./logic.js");

test("seed có đủ 8 bài theo 4 tuần", () => {
  assert.equal(LESSONS.length, 8);
  assert.deepEqual(LESSONS.map((lesson) => lesson.week), [1,1,2,2,3,3,4,4]);
  assert.ok(LESSONS.every((lesson) => lesson.quiz.length >= 3));
});

test("câu hỏi quiz không lặp đề và mỗi đáp án đúng nằm trong miền hợp lệ", () => {
  const all = LESSONS.flatMap((lesson) => lesson.quiz).concat(ENTRY_QUIZ);
  const texts = all.map((item) => item.q);
  assert.equal(new Set(texts).size, texts.length, "không được có câu hỏi lặp lại");
  all.forEach((item) => {
    assert.ok(item.options.length >= 3, "mỗi câu cần ít nhất 3 lựa chọn");
    assert.ok(new Set(item.options).size === item.options.length, "các lựa chọn không trùng nhau");
    assert.ok(item.answer >= 0 && item.answer < item.options.length, "đáp án nằm trong miền lựa chọn");
  });
});

test("đáp án đúng không luôn nằm ở vị trí đầu tiên", () => {
  const all = LESSONS.flatMap((lesson) => lesson.quiz).concat(ENTRY_QUIZ);
  const zeros = all.filter((item) => item.answer === 0).length;
  assert.ok(zeros > 0 && zeros < all.length / 2, "vị trí đáp án mặc lại phân tán, không game hóa ở A");
});

test("tính điểm quiz theo thang 100", () => {
  assert.equal(calculateScore(FINAL_QUIZ.map((item) => item.answer), FINAL_QUIZ), 100);
  assert.equal(calculateScore(FINAL_QUIZ.map(() => 1), [{ answer: 0 }, { answer: 0 }, { answer: 0 }]), 0);
});

test("bài sau bị khóa và mở tuần tự", () => {
  const state = freshState();
  assert.equal(state.lessons["lesson-1"].status, "available");
  assert.equal(state.lessons["lesson-2"].status, "locked");
  const result = completeLesson(state, "lesson-1", LESSONS[0].quiz.map((item) => item.answer));
  assert.equal(result.completed, true);
  assert.equal(state.lessons["lesson-2"].status, "available");
  assert.equal(progress(state), 1);
});

test("quiz dưới 60 điểm cho phép làm lại nhưng chưa hoàn thành", () => {
  const state = freshState();
  const result = completeLesson(state, "lesson-1", [1, 1, 1]);
  assert.equal(result.completed, false);
  assert.equal(state.lessons["lesson-1"].status, "available");
  assert.equal(state.lessons["lesson-1"].attempts, 1);
});

test("kế hoạch yêu cầu chế độ, hai ngày và hai vế nếu-thì", () => {
  assert.equal(validPlan({ mode: "home", days: ["tuesday"], ifThen: { ifText: "a", thenText: "b" } }), false);
  assert.equal(validPlan({ mode: "home", days: ["tuesday", "saturday"], ifThen: { ifText: "a", thenText: "b" } }), true);
});

test("tạo lịch ICS có summary, ngày và mô tả", () => {
  const ics = makeICS({ mode: "gym", days: ["tuesday", "saturday"], ifThen: { ifText: "tan hoc", thenText: "tap 20 phut" } }, new Date("2026-10-27T10:00:00Z"));
  assert.match(ics, /BEGIN:VCALENDAR/);
  assert.match(ics, /SUMMARY:CƠ BẢN/);
  assert.match(ics, /DTSTART:/);
  assert.match(ics, /DESCRIPTION:/);
  assert.match(ics, /END:VCALENDAR/);
});

test("chứng nhận chỉ đạt khi hoàn thành 8 bài và bài cuối từ 80", () => {
  const state = freshState();
  LESSONS.forEach((lesson) => { state.lessons[lesson.id] = { status: "completed", attempts: 1, bestScore: 100, completedAt: new Date().toISOString() }; });
  state.finalAssessment = { score: 79 };
  assert.equal(certificateEligible(state), false);
  state.finalAssessment.score = 80;
  assert.equal(certificateEligible(state), true);
  assert.equal(behaviorStage(state), 1);
});

test("ENTRY_QUIZ có 10 câu riêng cho đánh giá đầu vào", () => {
  assert.equal(ENTRY_QUIZ.length, 10);
  assert.equal(calculateScore(ENTRY_QUIZ.map((item) => item.answer), ENTRY_QUIZ), 100);
  ENTRY_QUIZ.forEach((item) => { assert.ok(!LESSONS.some((lesson) => lesson.quiz.some((q) => q.q === item.q)), "câu đầu vào không trùng đề của bài học"); });
});

test("làm sai toàn bộ bài 1 (chọn B) vẫn dưới 60 điểm", () => {
  const state = freshState();
  const result = completeLesson(state, "lesson-1", [1, 1, 1]);
  assert.equal(result.completed, false);
});

test("export/import giữ nguyên tiến độ", () => {
  const state = freshState();
  state.profile.mode = "home";
  state.lessons["lesson-1"].status = "completed";
  const restored = importState(exportState(state));
  assert.equal(restored.profile.mode, "home");
  assert.equal(restored.lessons["lesson-1"].status, "completed");
  assert.equal(progress(restored), 1);
});

