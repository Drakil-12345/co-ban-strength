# CƠ BẢN — Từ đã lưu đến đã tập

CƠ BẢN là prototype PWA offline giúp người mới học nền tảng tập tăng cường cơ trong 4 tuần. Luồng gồm onboarding, PAR-Q+ rút gọn, bài kiểm tra đầu vào, 8 bài học, quiz, kế hoạch hai buổi, giáo án Nhà/Gym, lịch .ics, huy hiệu và chứng nhận.

## Chạy local

    python -m http.server 4173

Mở http://localhost:4173. Chạy qua HTTP để service worker hoạt động.

## Phát triển

Không cần framework hoặc build step. Các file chính:

- index.html: khung app và điều hướng.
- styles.css: design system CƠ BẢN, responsive desktop/mobile.
- logic.js: dữ liệu 8 bài và logic thuần cho quiz, tiến độ, kế hoạch, ICS, export/import.
- app.js: render màn hình, tương tác và lưu localStorage.
- logic.test.js: unit test bằng Node test runner.

Chạy test: node --test logic.test.js

## Thêm hoặc sửa bài học

Mở logic.js và sửa mảng LESSONS. Mỗi bài có id, week, title, eyebrow, duration, summary, focus, modes, safetyNote, videoUrl, tryAction và quiz. Mỗi câu quiz cần q, options, answer (index bắt đầu từ 0) và explanation.

Bài được mở tuần tự. Quiz đạt từ 60 điểm sẽ hoàn thành bài và mở bài tiếp theo. Bài cuối đạt từ 80 điểm sau khi hoàn thành đủ 8 bài sẽ đủ điều kiện chứng nhận.

## State và dữ liệu

State được lưu ở localStorage với key co-ban-strength-v1. Dữ liệu không gửi lên máy chủ. Màn hình Dữ liệu cho phép tải JSON, nhập JSON và xóa toàn bộ tiến độ. Khi thay đổi schema, tăng version và cập nhật normalizeState trong logic.js.

## Thiết kế

Giao diện hiện đi theo hướng **gym editorial / Winner-inspired**: masthead trắng, hero ảnh tập luyện nền đen, đỏ năng lượng, typography Barlow Condensed + Barlow, nút CTA rõ và dải module bên dưới hero. Ảnh hero/video placeholder dùng ảnh remote từ Unsplash để prototype nhẹ, không tự sinh ảnh và không thêm file ảnh lớn vào repo. Desktop dùng navigation ngang; màn hình nhỏ dùng header gọn và bottom navigation. Các control có focus state, keyboard navigation, touch target đủ lớn và prefers-reduced-motion.

Design system được lưu tại design-system/co-ban-strength/MASTER.md. Khi đổi palette, spacing hoặc motion, cập nhật token trong styles.css và tài liệu này cùng lúc. Repo UI/UX Pro Max chỉ được dùng làm nguồn phương pháp và token thiết kế; ứng dụng vẫn là static vanilla HTML/CSS/JS.

### Bản tinh chỉnh theo mẫu Winner

`winner.css` tải sau `styles.css`, quản lý bảng màu đỏ–đen–trắng, hero, dải biểu tượng và responsive. Khách mới vào trang chủ trước; nút bắt đầu dẫn vào onboarding. Ảnh hero hiện lưu tại `assets/hero-training.jpg`, có cache offline, thay cho ảnh hero remote ở bản trước. Không dùng ảnh AI.

Nguồn ảnh: [Andres Ayrton / Pexels — A Man and a Woman Training at the Gym](https://www.pexels.com/photo/a-man-and-a-woman-training-at-the-gym-6550840/).

### Đổi màu và theme

Các token hiện hành nằm ở đầu winner.css: --color-primary và --color-accent (đỏ), --color-background (nền), --panel (card) và --ink (chữ). Đổi token trước, sau đó kiểm tra contrast trên desktop và mobile. Không thêm emoji làm icon; dùng inline SVG.

## Deploy GitHub Pages

Workflow .github/workflows/deploy-pages.yml deploy site tĩnh từ nhánh main:

    git init
    git add .
    git commit -m "Build Co Ban strength learning PWA"
    git branch -M main
    gh auth login
    gh repo create co-ban-strength --public --source . --remote origin --push

Sau khi workflow chạy, bật Pages nếu GitHub yêu cầu và mở URL repository. App dùng đường dẫn tương đối nên chạy được trên subpath của Pages. Theo dõi tab Actions để workflow Deploy to GitHub Pages hoàn tất; URL dự kiến là https://drakil-12345.github.io/co-ban-strength/.

## Giới hạn prototype

Prototype đo việc mở và hoàn thành bài, điểm quiz, lập kế hoạch và mở giáo án. Nó không xác minh người dùng đã tập thật hoặc duy trì đủ hai buổi mỗi tuần. Video đang là placeholder cho đến khi thêm URL vào dữ liệu bài học. Email tự động, tài khoản thật, backend và analytics chưa nằm trong bản offline này.

