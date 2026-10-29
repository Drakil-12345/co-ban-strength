(function (global) {
  "use strict";
  const DAY_LABELS = { monday: "Thứ 2", tuesday: "Thứ 3", wednesday: "Thứ 4", thursday: "Thứ 5", friday: "Thứ 6", saturday: "Thứ 7", sunday: "Chủ nhật" };
  const LESSONS = [
    { id: "lesson-1", week: 1, weekTitle: "Hiểu đúng", title: "Tập cơ là gì và cần bao nhiêu?", eyebrow: "BÀI 01 · HIỂU ĐÚNG", duration: "5 phút", summary: "Nắm chuẩn cơ bản để biết một tuần tập thế nào là đủ.", focus: "Khuyến nghị vận động và cách bắt đầu vừa sức.", modes: "Chung cho Nhà và Gym", safetyNote: "Bắt đầu nhẹ và dừng lại nếu thấy đau bất thường.", videoUrl: "", tryAction: "", quiz: [
      { q: "Khuyến nghị cơ bản là gì?", options: ["Tập tăng cường cơ ít nhất 2 lần mỗi tuần", "Tập thật nặng mỗi ngày", "Chỉ tập khi có PT"], answer: 0, explanation: "Mục tiêu nền là ít nhất hai buổi mỗi tuần với các nhóm cơ chính." },
      { q: "Một buổi tập tốt nên bắt đầu thế nào?", options: ["Từ mức vừa sức", "Từ mức nặng nhất", "Bỏ qua khởi động"], answer: 0, explanation: "Tăng dần giúp bạn tự tin và giảm nguy cơ quá sức." },
      { q: "CƠ BẢN giúp bạn làm gì?", options: ["Hiểu chuẩn và tự lập kế hoạch", "Theo dõi người khác", "Thi đấu ngay lập tức"], answer: 0, explanation: "Website tập trung vào kiến thức, kế hoạch và hành động bắt đầu." }
    ] },
    { id: "lesson-2", week: 1, weekTitle: "Hiểu đúng", title: "7 nhóm cơ chính trong một buổi toàn thân", eyebrow: "BÀI 02 · HIỂU ĐÚNG", duration: "5 phút", summary: "Biết cách nhìn một buổi tập toàn thân thay vì chỉ tập một động tác.", focus: "Ngực, lưng, vai, tay, chân, hông và vùng thân giữa.", modes: "Chung cho Nhà và Gym", safetyNote: "Chọn biến thể bạn kiểm soát được trong toàn bộ biên độ.", videoUrl: "", tryAction: "", quiz: [
      { q: "Một buổi toàn thân nên hướng tới điều gì?", options: ["Tác động các nhóm cơ chính", "Chỉ tập phần dễ thấy", "Tập đến kiệt sức"], answer: 0, explanation: "Cấu trúc toàn thân giúp bạn xây nền cân bằng." },
      { q: "Khi mới tập, số động tác nên thế nào?", options: ["Khoảng 5–6 động tác cơ bản", "Càng nhiều càng tốt", "Chỉ một động tác"], answer: 0, explanation: "Năm đến sáu động tác là một điểm bắt đầu dễ quản lý." },
      { q: "Bạn nên ưu tiên điều gì?", options: ["Kỹ thuật kiểm soát", "Tốc độ thật nhanh", "Số cân nặng lớn"], answer: 0, explanation: "Kiểm soát giúp bạn học đúng chuyển động." }
    ] },
    { id: "lesson-3", week: 2, weekTitle: "Tập an toàn", title: "Khởi động, thư giãn và dấu hiệu cần dừng", eyebrow: "BÀI 03 · TẬP AN TOÀN", duration: "5 phút", summary: "Tạo thói quen mở đầu và kết thúc buổi tập có chủ đích.", focus: "Khởi động ngắn, thở đều và nhận biết tín hiệu cơ thể.", modes: "Chung cho Nhà và Gym", safetyNote: "Nếu đau nhói, chóng mặt hoặc khó thở bất thường, hãy dừng và tìm hỗ trợ y tế.", videoUrl: "", tryAction: "", quiz: [
      { q: "Khởi động giúp bạn làm gì?", options: ["Chuẩn bị cơ thể cho chuyển động", "Thay thế toàn bộ buổi tập", "Tập nặng ngay"], answer: 0, explanation: "Khởi động giúp cơ thể chuyển dần sang trạng thái vận động." },
      { q: "Khi có đau nhói bất thường, bạn nên?", options: ["Dừng lại và đánh giá", "Cố thêm cho đủ", "Tăng tốc"], answer: 0, explanation: "An toàn luôn quan trọng hơn hoàn thành một con số." },
      { q: "Hơi thở nên thế nào?", options: ["Đều và không nín lâu", "Nín trong mọi động tác", "Không cần để ý"], answer: 0, explanation: "Thở đều giúp bạn duy trì kiểm soát." }
    ] },
    { id: "lesson-4", week: 2, weekTitle: "Tập an toàn", title: "Kỹ thuật nền: squat, đẩy và kéo", eyebrow: "BÀI 04 · TẬP AN TOÀN", duration: "5 phút", summary: "Thử các mẫu chuyển động nền với biến thể phù hợp nơi bạn tập.", focus: "Giữ thân ổn định, chuyển động chậm và dừng trước khi mất kiểm soát.", modes: "Nhà hoặc Gym", safetyNote: "Thử 60 giây ở mức nhẹ; không cố vượt qua đau hoặc mất thăng bằng.", videoUrl: "", tryAction: "Thử 60 giây: 5 squat chậm và 5 lần đẩy tường.", quiz: [
      { q: "Dấu hiệu kỹ thuật cần giảm độ khó là gì?", options: ["Mất kiểm soát chuyển động", "Cảm thấy cơ đang làm việc", "Thở đều"], answer: 0, explanation: "Giảm độ khó giúp bạn giữ mẫu chuyển động an toàn." },
      { q: "Ở Nhà, bạn có thể bắt đầu bằng?", options: ["Squat ghế hoặc đẩy tường", "Động tác khó nhất", "Thiết bị nặng bất kỳ"], answer: 0, explanation: "Biến thể đơn giản giúp bạn học kỹ thuật." },
      { q: "Một lần thử nên ưu tiên?", options: ["Chậm và có kiểm soát", "Nhanh tối đa", "Không cần nghỉ"], answer: 0, explanation: "Chất lượng chuyển động là mục tiêu của bài này." }
    ] },
    { id: "lesson-5", week: 3, weekTitle: "Tập đủ", title: "Cường độ, số lần lặp và số hiệp", eyebrow: "BÀI 05 · TẬP ĐỦ", duration: "5 phút", summary: "Đọc cảm giác gắng sức để chọn mức tập vừa đủ cho hôm nay.", focus: "Cường độ vừa, số lần lặp có thể duy trì và khoảng nghỉ hợp lý.", modes: "Chung cho Nhà và Gym", safetyNote: "Không cần tập đến kiệt sức để một buổi tập có ý nghĩa.", videoUrl: "", tryAction: "Thử 60 giây: chọn một biến thể và thực hiện ở mức còn kiểm soát.", quiz: [
      { q: "Cường độ vừa nghĩa là gì?", options: ["Có thử thách nhưng vẫn giữ kỹ thuật", "Không thể nói chuyện", "Luôn đau"], answer: 0, explanation: "Bạn cần cảm nhận nỗ lực mà vẫn kiểm soát được động tác." },
      { q: "Nếu kỹ thuật xấu đi, bạn nên?", options: ["Dừng hiệp hoặc giảm độ khó", "Cố thêm bằng mọi giá", "Tăng tải"], answer: 0, explanation: "Chất lượng và an toàn đi trước số lượng." },
      { q: "Khoảng nghỉ giúp gì?", options: ["Lấy lại kiểm soát", "Làm buổi tập thất bại", "Không có tác dụng"], answer: 0, explanation: "Nghỉ đủ giúp bạn tiếp tục với kỹ thuật tốt." }
    ] },
    { id: "lesson-6", week: 3, weekTitle: "Tập đủ", title: "Tăng dần độ khó an toàn", eyebrow: "BÀI 06 · TẬP ĐỦ", duration: "5 phút", summary: "Biết khi nào nên tăng một bước nhỏ và khi nào nên giữ nguyên.", focus: "Tăng từng biến số: thời gian, lần lặp, hiệp hoặc độ khó.", modes: "Nhà hoặc Gym", safetyNote: "Chỉ tăng một yếu tố mỗi lần và quay lại mức nhẹ nếu cơ thể chưa sẵn sàng.", videoUrl: "", tryAction: "Thử 60 giây: ghi lại biến thể bạn làm được hôm nay.", quiz: [
      { q: "Cách tăng tiến an toàn là gì?", options: ["Tăng từng bước nhỏ", "Tăng mọi thứ cùng lúc", "Đổi bài mỗi phút"], answer: 0, explanation: "Từng bước nhỏ giúp bạn biết cơ thể phản hồi ra sao." },
      { q: "Khi nào nên giữ nguyên mức?", options: ["Khi kỹ thuật chưa ổn định", "Khi muốn nhanh hơn", "Khi chưa thử"], answer: 0, explanation: "Ổn định trước rồi mới tăng độ khó." },
      { q: "Bạn nên ghi nhận điều gì?", options: ["Biến thể và cảm giác gắng sức", "Ngoại hình người khác", "Số cân nặng lớn nhất"], answer: 0, explanation: "Ghi nhận giúp lần sau chọn mức phù hợp hơn." }
    ] },
    { id: "lesson-7", week: 4, weekTitle: "Tự tập", title: "Lập kế hoạch hai buổi mỗi tuần", eyebrow: "BÀI 07 · TỰ TẬP", duration: "5 phút", summary: "Chọn hai ngày CƠ BẢN và biến ý định thành lịch cụ thể.", focus: "Kế hoạch nếu–thì và lịch tập có thể thực hiện.", modes: "Chung cho Nhà và Gym", safetyNote: "Chọn hai thời điểm thực tế, chừa khoảng nghỉ và bắt đầu ở mức vừa sức.", videoUrl: "", tryAction: "", quiz: [
      { q: "Một kế hoạch tốt cần gì?", options: ["Hai ngày và thời điểm cụ thể", "Một mục tiêu mơ hồ", "Lịch kín mỗi ngày"], answer: 0, explanation: "Cụ thể giúp bạn biết lúc nào sẽ bắt đầu." },
      { q: "Ví dụ kế hoạch nếu–thì là gì?", options: ["Nếu tan học thứ 3, thì tập 20 phút", "Nếu rảnh thì lúc nào cũng được", "Nếu mệt thì tập nặng hơn"], answer: 0, explanation: "Tín hiệu rõ và hành động cụ thể dễ thực hiện hơn." },
      { q: "Bạn nên chọn ngày thế nào?", options: ["Phù hợp lịch thật", "Theo lịch của người khác", "Hai ngày liên tiếp luôn"], answer: 0, explanation: "Kế hoạch cần vừa với đời sống của bạn." }
    ] },
    { id: "lesson-8", week: 4, weekTitle: "Tự tập", title: "Gỡ hiểu lầm và kiểm tra cuối", eyebrow: "BÀI 08 · TỰ TẬP", duration: "5 phút", summary: "Ôn lại điều cốt lõi, kiểm tra cuối và nhận chứng nhận hoàn thành.", focus: "Tập đủ, tập an toàn và biết tự điều chỉnh.", modes: "Chung cho Nhà và Gym", safetyNote: "Chứng nhận ghi nhận việc học; hãy tiếp tục lắng nghe cơ thể khi tập thật.", videoUrl: "", tryAction: "", quiz: [
      { q: "Điều nào đúng?", options: ["Tập đều và vừa sức quan trọng hơn tập cực nặng", "Càng đau càng hiệu quả", "Phải có PT mới bắt đầu được"], answer: 0, explanation: "Tính đều đặn và kiểm soát giúp xây nền lâu dài." },
      { q: "Website ghi nhận chắc chắn điều gì?", options: ["Việc học, lập kế hoạch và hành động bắt đầu", "Bạn đã duy trì thói quen", "Kết quả sức khỏe dài hạn"], answer: 0, explanation: "Prototype đo đến ba bậc hành vi đầu." },
      { q: "Sau khóa học, bước phù hợp là?", options: ["Bắt đầu theo kế hoạch và điều chỉnh dần", "Tăng độ khó ngay lập tức", "Bỏ qua an toàn"], answer: 0, explanation: "Hãy dùng kế hoạch như một điểm bắt đầu linh hoạt." }
    ] }
  ];
  const FINAL_QUIZ = LESSONS[7].quiz;
  const clone = function (value) { return JSON.parse(JSON.stringify(value)); };
  const nowISO = function () { return new Date().toISOString(); };
  function freshState() {
    const lessons = {};
    LESSONS.forEach(function (lesson, index) { lessons[lesson.id] = { status: index === 0 ? "available" : "locked", attempts: 0, bestScore: 0, completedAt: null }; });
    return { version: 1, profile: { ageRange: "", location: "", intent: false, experience: "", mode: "", parq: {}, selectedDays: [] }, assessment: { form: "A", answers: [], score: 0, completedAt: null }, lessons: lessons, plan: { mode: "", days: [], ifThen: { ifText: "", thenText: "" }, createdAt: null, startedAt: null }, actions: { openedLessons: [], openedGuides: [], downloadedGuides: [], addedCalendar: [] }, achievements: [], finalAssessment: null };
  }
  function normalizeState(input) {
    const base = freshState();
    if (!input || typeof input !== "object") return base;
    const state = clone(base);
    state.profile = { ...base.profile, ...(input.profile || {}), parq: { ...(input.profile && input.profile.parq || {}) }, selectedDays: Array.isArray(input.profile && input.profile.selectedDays) ? input.profile.selectedDays.slice(0, 7) : [] };
    state.assessment = { ...base.assessment, ...(input.assessment || {}), answers: Array.isArray(input.assessment && input.assessment.answers) ? input.assessment.answers : [] };
    LESSONS.forEach(function (lesson) { state.lessons[lesson.id] = { ...base.lessons[lesson.id], ...(input.lessons && input.lessons[lesson.id] || {}) }; });
    state.plan = { ...base.plan, ...(input.plan || {}), days: Array.isArray(input.plan && input.plan.days) ? input.plan.days.slice(0, 7) : [], ifThen: { ...base.plan.ifThen, ...(input.plan && input.plan.ifThen || {}) } };
    state.actions = { ...base.actions, ...(input.actions || {}) };
    state.achievements = Array.isArray(input.achievements) ? input.achievements : [];
    state.finalAssessment = input.finalAssessment || null;
    refreshUnlocks(state);
    return state;
  }
  function calculateScore(answers, quiz) {
    quiz = quiz || FINAL_QUIZ;
    if (!Array.isArray(answers)) return 0;
    const correct = quiz.reduce(function (sum, item, index) { return sum + (Number(answers[index]) === item.answer ? 1 : 0); }, 0);
    return Math.round(correct / quiz.length * 100);
  }
  function refreshUnlocks(state) {
    LESSONS.forEach(function (lesson, index) { const current = state.lessons[lesson.id]; if (current.status === "completed") return; current.status = index === 0 || state.lessons[LESSONS[index - 1].id].status === "completed" ? "available" : "locked"; });
    return state;
  }
  function completeLesson(state, lessonId, answers) {
    const lesson = LESSONS.find(function (item) { return item.id === lessonId; });
    if (!lesson) throw new Error("Không tìm thấy bài học");
    const record = state.lessons[lessonId];
    if (!record || record.status === "locked") throw new Error("Bài học chưa mở");
    const score = calculateScore(answers, lesson.quiz); record.attempts += 1; record.bestScore = Math.max(record.bestScore || 0, score);
    if (score >= 60) { record.status = "completed"; record.completedAt = nowISO(); }
    refreshUnlocks(state); updateAchievements(state); return { score: score, completed: record.status === "completed" };
  }
  function progress(state) { return LESSONS.filter(function (lesson) { return state.lessons[lesson.id] && state.lessons[lesson.id].status === "completed"; }).length; }
  function behaviorStage(state) { const count = progress(state); if (count >= 8 && state.actions.openedGuides.length) return 3; if (count >= 7 && validPlan(state.plan)) return 2; return count ? 1 : 0; }
  function validPlan(plan) { return Boolean(plan && Array.isArray(plan.days) && plan.days.length >= 2 && plan.ifThen && plan.ifThen.ifText && plan.ifThen.ifText.trim() && plan.ifThen.thenText && plan.ifThen.thenText.trim() && ["home", "gym"].includes(plan.mode)); }
  function updateAchievements(state) { const completed = progress(state); state.achievements = [2, 4, 6, 8].filter(function (milestone) { return completed >= milestone; }).map(function (milestone) { return "badge-" + milestone; }); return state.achievements; }
  function certificateEligible(state) { return progress(state) === 8 && Number(state.finalAssessment && state.finalAssessment.score || state.lessons["lesson-8"].bestScore || 0) >= 80; }
  function addAction(state, key, value) { if (!Array.isArray(state.actions[key])) state.actions[key] = []; if (!state.actions[key].includes(value)) state.actions[key].push(value); }
  function makeICS(plan, startDate) {
    if (!validPlan(plan)) throw new Error("Kế hoạch chưa đủ thông tin");
    const date = new Date(startDate || new Date()); date.setHours(18, 0, 0, 0);
    const dayNames = plan.days.map(function (day) { return DAY_LABELS[day] || day; }).join(", ");
    const pad = function (n) { return String(n).padStart(2, "0"); };
    const stamp = date.getUTCFullYear() + pad(date.getUTCMonth() + 1) + pad(date.getUTCDate()) + "T" + pad(date.getUTCHours()) + pad(date.getUTCMinutes()) + pad(date.getUTCSeconds()) + "Z";
    const escapeICS = function (value) { return String(value).replace(/[\\;,]/g, function (match) { return "\\\\" + match; }).replace(/\n/g, "\\n"); };
    return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//CO BAN//Strength Plan//VI", "CALSCALE:GREGORIAN", "BEGIN:VEVENT", "UID:co-ban-" + Date.now() + "@local", "DTSTAMP:" + stamp, "DTSTART:" + stamp.slice(0, 8) + "T180000", "DURATION:PT30M", "SUMMARY:" + escapeICS("CƠ BẢN · Buổi tập"), "DESCRIPTION:" + escapeICS((plan.mode === "home" ? "Nhà" : "Gym") + " · Ngày: " + dayNames + " · " + plan.ifThen.ifText + " → " + plan.ifThen.thenText), "END:VEVENT", "END:VCALENDAR", ""].join("\r\n");
  }
  function exportState(state) { return JSON.stringify({ ...clone(state), exportedAt: nowISO(), product: "co-ban-strength" }, null, 2); }
  function importState(raw) { const parsed = typeof raw === "string" ? JSON.parse(raw) : raw; if (!parsed || typeof parsed !== "object") throw new Error("JSON không hợp lệ"); return normalizeState(parsed); }
  const api = { DAY_LABELS: DAY_LABELS, LESSONS: LESSONS, FINAL_QUIZ: FINAL_QUIZ, freshState: freshState, normalizeState: normalizeState, calculateScore: calculateScore, refreshUnlocks: refreshUnlocks, completeLesson: completeLesson, progress: progress, behaviorStage: behaviorStage, validPlan: validPlan, updateAchievements: updateAchievements, certificateEligible: certificateEligible, addAction: addAction, makeICS: makeICS, exportState: exportState, importState: importState };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  global.CoBanLogic = api;
})(typeof window !== "undefined" ? window : globalThis);

