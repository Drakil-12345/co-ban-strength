(function (global) {
  "use strict";
  const DAY_LABELS = { monday: "Thứ 2", tuesday: "Thứ 3", wednesday: "Thứ 4", thursday: "Thứ 5", friday: "Thứ 6", saturday: "Thứ 7", sunday: "Chủ nhật" };
  const LESSONS = [
    { id: "lesson-1", week: 1, weekTitle: "Hiểu đúng", title: "Tập cơ là gì và cần bao nhiêu?", eyebrow: "BÀI 01 · HIỂU ĐÚNG", duration: "5 phút", summary: "Nắm chuẩn cơ bản để biết một tuần tập thế nào là đủ.", focus: "Khuyến nghị vận động và cách bắt đầu vừa sức.", modes: "Chung cho Nhà và Gym", safetyNote: "Bắt đầu nhẹ và dừng lại nếu thấy đau bất thường.", videoUrl: "", tryAction: "", quiz: [
      { q: "Mỗi tuần nên có ít nhất bao nhiêu buổi tập tăng cường cơ?", options: ["Tập đến kiệt sức mỗi ngày", "Ít nhất hai buổi cho các nhóm cơ chính", "Chỉ cần tập khi có huấn luyện viên"], answer: 1, explanation: "Khuyến nghị nền là hai buổi mỗi tuần tác động các nhóm cơ chính." },
      { q: "Buổi tập đầu tiên khi mới bắt đầu nên ở mức nào?", options: ["Vừa sức, kiểm soát được toàn bộ động tác", "Nặng nhất từng nâng được trong quá khứ", "Nặng đến cơ đau nhiều ngày liền"], answer: 0, explanation: "Vừa sức giúp bạn học đúng chuyển động và tăng dần an toàn." },
      { q: "Điều gì giúp việc tập duy trì được lâu dài?", options: ["Tăng độ khó thật nhanh ngay tuần đầu", "Lịch tập vừa với đời sống và tăng dần có chủ đích", "Chờ phòng gym đầy đủ mới bắt đầu"], answer: 2, explanation: "Hiểu đúng và kế hoạch cụ thể giúp bạn đi đều, không gồng rồi bỏ." }
    ] },
    { id: "lesson-2", week: 1, weekTitle: "Hiểu đúng", title: "7 nhóm cơ chính trong một buổi toàn thân", eyebrow: "BÀI 02 · HIỂU ĐÚNG", duration: "5 phút", summary: "Biết cách nhìn một buổi tập toàn thân thay vì chỉ tập một động tác.", focus: "Ngực, lưng, vai, tay, chân, hông và vùng thân giữa.", modes: "Chung cho Nhà và Gym", safetyNote: "Chọn biến thể bạn kiểm soát được trong toàn bộ biên độ.", videoUrl: "", tryAction: "", quiz: [
      { q: "Một buổi tập toàn thân nên tác động đến điều gì?", options: ["Chỉ nhóm cơ dễ thấy nhất", "Một nhóm cơ duy nhất suốt tháng đầu", "Các nhóm cơ chính: ngực, lưng, vai, tay, chân, hông và thân giữa"], answer: 2, explanation: "Cấu trúc toàn thân giúp bạn xây nền cân bằng, không bỏ sót nhóm nào." },
      { q: "Mỗi buổi khi mới bắt đầu nên gồm khoảng bao nhiêu động tác?", options: ["Năm đến sáu động tác cơ bản", "Hai mươi động tác cho dày", "Chỉ một động tác duy nhất"], answer: 0, explanation: "Năm đến sáu động tác là một điểm bắt đầu dễ quản lý." },
      { q: "Khi học một động tác mới, điều nào quan trọng hơn?", options: ["Tốc độ thật nhanh", "Kỹ thuật kiểm soát trên toàn bộ biên độ", "Số cân nặng lớn"], answer: 1, explanation: "Kỹ thuật kiểm soát giúp bạn học đúng chuyển động." }
    ] },
    { id: "lesson-3", week: 2, weekTitle: "Tập an toàn", title: "Khởi động, thư giãn và dấu hiệu cần dừng", eyebrow: "BÀI 03 · TẬP AN TOÀN", duration: "5 phút", summary: "Tạo thói quen mở đầu và kết thúc buổi tập có chủ đích.", focus: "Khởi động ngắn, thở đều và nhận biết tín hiệu cơ thể.", modes: "Chung cho Nhà và Gym", safetyNote: "Nếu đau nhói, chóng mặt hoặc khó thở bất thường, hãy dừng và tìm hỗ trợ y tế.", videoUrl: "", tryAction: "", quiz: [
      { q: "Khởi động trước buổi tập giúp bạn điều gì?", options: ["Cơ thể chuyển dần sang trạng thái vận động", "Thay thế hoàn toàn buổi tập chính", "Tập nặng ngay mà xem"], answer: 0, explanation: "Khởi động giúp cơ thể chuyển dần sang trạng thái vận động." },
      { q: "Thư giãn cuối buổi tập có tác dụng gì?", options: ["Tăng gấp đôi kết quả buổi tập", "Giúp nhịp thở và cơ thể trở về bình thường", "Chỉ dành cho ai tập nặng"], answer: 1, explanation: "Thư giãn ngắn là phần khép lại có chủ đích của buổi tập." },
      { q: "Tín hiệu nào nghĩa là cần dừng và tìm hỗ trợ y tế?", options: ["Cơ hơi mỏi sau một hiệp", "Thở nhanh nhẹ trong lúc gắng sức", "Đau nhói, chóng mặt hoặc khó thở bất thường"], answer: 2, explanation: "An toàn luôn quan trọng hơn hoàn thành một con số." }
    ] },
    { id: "lesson-4", week: 2, weekTitle: "Tập an toàn", title: "Kỹ thuật nền: squat, đẩy và kéo", eyebrow: "BÀI 04 · TẬP AN TOÀN", duration: "5 phút", summary: "Thử các mẫu chuyển động nền với biến thể phù hợp nơi bạn tập.", focus: "Giữ thân ổn định, chuyển động chậm và dừng trước khi mất kiểm soát.", modes: "Nhà hoặc Gym", safetyNote: "Thử 60 giây ở mức nhẹ; không cố vượt qua đau hoặc mất thăng bằng.", videoUrl: "", tryAction: "Thử 60 giây: 5 squat chậm và 5 lần đẩy tường.", quiz: [
      { q: "Squat ghế và đẩy tường ở Nhà giúp bạn học điều gì?", options: ["Thay thế hoàn toàn phòng gym", "Không có gì giá trị cho kỹ thuật", "Mẫu chuyển động nền qua biến thể đơn giản"], answer: 2, explanation: "Biến thể đơn giản vẫn dạy đúng mẫu chuyển động nền." },
      { q: "Dấu hiệu kỹ thuật nào cho thấy nên giảm độ khó?", options: ["Cơ có cảm giác đang làm việc", "Mất kiểm soát chuyển động hoặc thăng bằng", "Hơi thở nặng nhưng vẫn đều"], answer: 1, explanation: "Giảm độ khó giúp bạn giữ mẫu chuyển động an toàn." },
      { q: "Trong lần thử 60 giây, bạn nên ưu tiên điều gì?", options: ["Chậm, có kiểm soát và dừng trước khi mất hình động tác", "Nhanh tối đa để nhiều lần hơn", "Không cần nghỉ giữa các lần"], answer: 0, explanation: "Chất lượng chuyển động là mục tiêu của bài này." }
    ] },
    { id: "lesson-5", week: 3, weekTitle: "Tập đủ", title: "Cường độ, số lần lặp và số hiệp", eyebrow: "BÀI 05 · TẬP ĐỦ", duration: "5 phút", summary: "Đọc cảm giác gắng sức để chọn mức tập vừa đủ cho hôm nay.", focus: "Cường độ vừa, số lần lặp có thể duy trì và khoảng nghỉ hợp lý.", modes: "Chung cho Nhà và Gym", safetyNote: "Không cần tập đến kiệt sức để một buổi tập có ý nghĩa.", videoUrl: "", tryAction: "Thử 60 giây: chọn một biến thể và thực hiện ở mức còn kiểm soát.", quiz: [
      { q: "Cường độ 'vừa' cảm giác như thế nào?", options: ["Không thể nói chuyện lấy một câu", "Hơi nỗ lực nhưng vẫn giữ được kỹ thuật", "Không cơ nào đang làm việc"], answer: 1, explanation: "Bạn cần cảm nhận nỗ lực mà vẫn kiểm soát được động tác." },
      { q: "Khi kỹ thuật bắt đầu xấu đi giữa hiệp, bạn nên?", options: ["Cố thêm vài lần cho đủ số", "Dừng hiệp hoặc giảm độ khó", "Tăng tải để bắt buộc đúng"], answer: 1, explanation: "Chất lượng và an toàn đi trước số lượng." },
      { q: "Khoảng nghỉ giữa các hiệp giúp gì?", options: ["Lấy lại hơi thở và kiểm soát cho hiệp sau", "Làm buổi tập thất bại", "Không có công dụng gì"], answer: 0, explanation: "Nghỉ đủ giúp bạn tiếp tục với kỹ thuật tốt." }
    ] },
    { id: "lesson-6", week: 3, weekTitle: "Tập đủ", title: "Tăng dần độ khó an toàn", eyebrow: "BÀI 06 · TẬP ĐỦ", duration: "5 phút", summary: "Biết khi nào nên tăng một bước nhỏ và khi nào nên giữ nguyên.", focus: "Tăng từng biến số: thời gian, lần lặp, hiệp hoặc độ khó.", modes: "Nhà hoặc Gym", safetyNote: "Chỉ tăng một yếu tố mỗi lần và quay lại mức nhẹ nếu cơ thể chưa sẵn sàng.", videoUrl: "", tryAction: "Thử 60 giây: ghi lại biến thể bạn làm được hôm nay.", quiz: [
      { q: "Cách tăng tiến độ khó an toàn là gì?", options: ["Tăng từng bước nhỏ, mỗi lần chỉ một biến số", "Tăng thời gian, lần lặp, hiệp và độ khó cùng lúc", "Đổi bài tập mỗi phút"], answer: 0, explanation: "Từng bước nhỏ giúp bạn biết cơ thể phản hồi ra sao." },
      { q: "Khi kỹ thuật chưa ổn định, bạn nên làm gì?", options: ["Tăng thêm tải để dễ nhận ra sai", "Giữ nguyên mãi không tăng", "Quay lại mức nhẹ và ổn định trước"], answer: 2, explanation: "Ổn định trước rồi mới tăng độ khó." },
      { q: "Ghi nhận gì giữa các lần tập để điều chỉnh đúng?", options: ["Ngoại hình người khác", "Biến thể làm được và cảm giác gắng sức", "Số cân nặng lớn nhất có thể"], answer: 1, explanation: "Ghi nhận giúp lần sau chọn mức phù hợp hơn." }
    ] },
    { id: "lesson-7", week: 4, weekTitle: "Tự tập", title: "Lập kế hoạch hai buổi mỗi tuần", eyebrow: "BÀI 07 · TỰ TẬP", duration: "5 phút", summary: "Chọn hai ngày CƠ BẢN và biến ý định thành lịch cụ thể.", focus: "Kế hoạch nếu–thì và lịch tập có thể thực hiện.", modes: "Chung cho Nhà và Gym", safetyNote: "Chọn hai thời điểm thực tế, chừa khoảng nghỉ và bắt đầu ở mức vừa sức.", videoUrl: "", tryAction: "", quiz: [
      { q: "Một kế hoạch hai buổi tốt cần có gì?", options: ["Một mục tiêu chung chung", "Lịch kín cả bảy ngày", "Hai ngày cụ thể và thời điểm rõ ràng"], answer: 2, explanation: "Cụ thể giúp bạn biết chính xác lúc nào sẽ bắt đầu." },
      { q: "Câu nào là kế hoạch 'nếu–thì' đúng nghĩa?", options: ["Nếu tan học thứ 3, thì tập 20 phút ở nhà", "Nếu rảnh thì lúc nào cũng được", "Nếu mệt thì thôi cả tuần"], answer: 0, explanation: "Tín hiệu rõ và hành động cụ thể dễ thực hiện hơn." },
      { q: "Chọn hai ngày tập nên dựa vào điều gì?", options: ["Lịch của người khác", "Hai ngày bạn thật sự giữ được, chừa giờ nghỉ giữa", "Hai ngày liên tiếp cho tiện"], answer: 1, explanation: "Kế hoạch cần vừa với đời sống thật của bạn." }
    ] },
    { id: "lesson-8", week: 4, weekTitle: "Tự tập", title: "Gỡ hiểu lầm và kiểm tra cuối", eyebrow: "BÀI 08 · TỰ TẬP", duration: "5 phút", summary: "Ôn lại điều cốt lõi, kiểm tra cuối và nhận chứng nhận hoàn thành.", focus: "Tập đủ, tập an toàn và biết tự điều chỉnh.", modes: "Chung cho Nhà và Gym", safetyNote: "Chứng nhận ghi nhận việc học; hãy tiếp tục lắng nghe cơ thể khi tập thật.", videoUrl: "", tryAction: "", quiz: [
      { q: "Câu nào nói đúng về tập tăng cường cơ?", options: ["Càng đau nhức càng hiệu quả", "Đều đặn và vừa sức quan trọng hơn tập cực nặng", "Phải có huấn luyện viên mới bắt đầu được"], answer: 1, explanation: "Tính đều đặn và kiểm soát giúp xây nền lâu dài." },
      { q: "CƠ BẢN có thể xác nhận chắc chắn điều gì?", options: ["Kết quả sức khỏe dài hạn", "Bạn đã duy trì thói quen suốt cả năm", "Việc bạn đã học, lập kế hoạch và mở giáo án"], answer: 2, explanation: "Prototype đo đến ba bậc hành vi đầu, không tự khẳng định dài hạn." },
      { q: "Sau khi học xong 8 bài, bước hợp lý tiếp theo là gì?", options: ["Bắt đầu theo kế hoạch và điều chỉnh dần", "Tăng độ khó tối đa ngay lập tức", "Dừng tập vì đã đủ chứng nhận"], answer: 0, explanation: "Hãy dùng kế hoạch như một điểm bắt đầu linh hoạt." }
    ] }
  ];
  const FINAL_QUIZ = LESSONS[7].quiz;
  /* ENTRY_QUIZ — 10 câu đánh giá đầu vào (màn "Điểm bắt đầu" khi onboard).
     Mỗi câu là một câu hỏi riêng, độc lập với quiz của từng bài học, có thể
     trả lời trước khi học. Đảm bảo không lặp lại câu nào. */
  const ENTRY_QUIZ = [
    { q: "Mỗi tuần nên dành bao nhiêu buổi cho tập tăng cường cơ?", options: ["Một buổi khi có hứng thú", "Hai buổi là chuẩn nền cho các nhóm cơ chính", "Tập mỗi ngày, càng gắng càng tốt"], answer: 1, explanation: "Chuẩn nền là hai buổi mỗi tuần tác động các nhóm cơ chính." },
    { q: "Vì sao cần khởi động trước buổi tập chính?", options: ["Giúp cơ thể chuyển dần sang trạng thái vận động", "Vì mồ hôi khởi động tính là đã tập", "Không cần thiết với người mới"], answer: 0, explanation: "Khởi động ngắn chuẩn bị cơ thể cho chuyển động." },
    { q: "Để bắt đầu tập cơ bản, bạn cần trang bị gì tối thiểu?", options: ["Thiết bị chuyên dụng đầy đủ", "Không gian đơn giản và trọng lượng cơ thể", "Một phòng gym hiện đại"], answer: 1, explanation: "Nhiều biến thể ở Nhà dùng trọng lượng cơ thể và dây kháng lực." },
    { q: "Một buổi toàn thân hợp lý thường gồm bao nhiêu động tác nền?", options: ["Chỉ một động tác duy nhất", "Khoảng năm đến sáu động tác cho các nhóm cơ chính", "Hai mươi mốt động tác ngẫu nhiên"], answer: 1, explanation: "Năm đến sáu động tác nền là điểm bắt đầu dễ kiểm soát." },
    { q: "Ở mức gắng sức 'vừa', bạn vẫn có thể làm gì?", options: ["Nói chuyện bình thường khi vẫn thấy nỗ lực", "Không nói được lấy một câu", "Tập tiếp cả vài tiếng đồng hồ"], answer: 0, explanation: "Mức vừa nghĩa là có thử thách nhưng vẫn kiểm soát được." },
    { q: "Lúc nào nên kết thúc một hiệp đang gắng sức?", options: ["Khi kỹ thuật bắt đầu xấu đi", "Khi cơ chưa hề mỏi", "Chỉ đúng số lần đã ghi, bất kể kỹ thuật"], answer: 0, explanation: "Kỹ thuật xấu đi nghĩa là nên dừng hiệp hoặc giảm độ khó." },
    { q: "Kế hoạch 'Nếu… thì…' có ích vì điều gì?", options: ["Làm cho việc bỏ tập dễ hơn", "Thay thế toàn bộ giáo án", "Gắn buổi tập với một tín hiệu cụ thể trong ngày của bạn"], answer: 2, explanation: "Tín hiệu rõ và hành động cụ thể dễ giữ đều đặn hơn." },
    { q: "Nghỉ giữa hai buổi tập có tác dụng gì?", options: ["Làm mọi kết quả mất đi", "Cơ thể phục hồi và thích nghi lúc nghỉ", "Chỉ cần cho người chuyên nghiệp"], answer: 1, explanation: "Cơ bắp cần thời gian phục hồi để thích nghi với tải." },
    { q: "Hiểu lầm nào dưới đây là sai?", options: ["Đều đặn mỗi tuần quan trọng hơn một buổi cực nặng", "Kỹ thuật quan trọng hơn số cân nặng", "Càng đau nhức càng chứng minh tập hiệu quả"], answer: 2, explanation: "Đau nhức không đồng nghĩa hiệu quả; đều đặn và kiểm soát mới quý." },
    { q: "Ghi chú sau mỗi buổi tập nên gồm điều gì?", options: ["Số cân nặng của bạn tập cùng", "Không cần ghi gì cả", "Tên động tác, mức gắng sức và cảm giác"], answer: 2, explanation: "Ghi nhận giúp lần sau chọn đúng mức tăng tiến." }
  ];
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
  const api = { DAY_LABELS: DAY_LABELS, LESSONS: LESSONS, FINAL_QUIZ: FINAL_QUIZ, ENTRY_QUIZ: ENTRY_QUIZ, freshState: freshState, normalizeState: normalizeState, calculateScore: calculateScore, refreshUnlocks: refreshUnlocks, completeLesson: completeLesson, progress: progress, behaviorStage: behaviorStage, validPlan: validPlan, updateAchievements: updateAchievements, certificateEligible: certificateEligible, addAction: addAction, makeICS: makeICS, exportState: exportState, importState: importState };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  global.CoBanLogic = api;
})(typeof window !== "undefined" ? window : globalThis);

