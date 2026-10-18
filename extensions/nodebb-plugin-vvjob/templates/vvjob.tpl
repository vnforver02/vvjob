<div class="vvjob" lang="vi">
  <header class="vvjob-masthead">
    <a class="vvjob-logo" href="{config.relative_path}/vvjob" aria-label="VVJOB — Bảng tin"><span class="vvjob-mark">V</span>VVJOB<span class="vvjob-beta">CỘNG ĐỒNG</span></a>
    <a class="vvjob-search" href="{config.relative_path}/search"><i class="fa fa-search" aria-hidden="true"></i> Tìm kiếm câu chuyện, đồng nghiệp…</a>
    <a class="vvjob-account" href="{config.relative_path}/me">Hồ sơ của tôi <i class="fa fa-arrow-right" aria-hidden="true"></i></a>
  </header>
  <div class="vvjob-layout">
    <aside class="vvjob-sidebar" aria-label="Điều hướng cộng đồng">
      <div class="vvjob-eyebrow">KHÔNG GIAN CỦA BẠN</div>
      <nav class="vvjob-nav">
        <a class="active" href="{config.relative_path}/vvjob"><i class="fa fa-home" aria-hidden="true"></i> Bảng tin</a>
        <a href="{config.relative_path}/unread"><i class="fa fa-compass" aria-hidden="true"></i> Chưa đọc</a>
        <a href="{config.relative_path}/notifications"><i class="fa fa-bell-o" aria-hidden="true"></i> Thông báo</a>
        <a href="{config.relative_path}/categories"><i class="fa fa-th-large" aria-hidden="true"></i> Khám phá cộng đồng</a>
      </nav>
      <div class="vvjob-eyebrow">CÙNG NHAU CHIA SẺ</div>
      <nav class="vvjob-communities">
        {{{ each communities }}}
        <a href="{config.relative_path}/category/{./slug}"><span aria-hidden="true">#</span> {./name}</a>
        {{{ end }}}
      </nav>
      <div class="vvjob-privacy"><i class="fa fa-shield" aria-hidden="true"></i><strong>Trao đổi ẩn danh</strong><span>Chưa mở. Bài viết hiện tại gắn với tài khoản của bạn.</span></div>
      <p class="vvjob-side-note">Kết nối chân thành.<br>Vững bước sự nghiệp.</p>
    </aside>
    <main class="vvjob-feed" id="vvjob-feed">
      <section class="vvjob-hero">
        <div class="vvjob-eyebrow">GÓC NHÌN MỚI MỖI NGÀY</div>
        <h1>Đi làm có nhau.</h1>
        <p>Một câu chuyện, nhiều góc nhìn.<br>Cùng người đi làm Việt Nam chia sẻ và trưởng thành.</p>
        <a href="{config.relative_path}/categories">Tìm cộng đồng của bạn <i class="fa fa-arrow-right" aria-hidden="true"></i></a>
        <span class="vvjob-hero-art" aria-hidden="true">V<span>V</span></span>
      </section>
      <section class="vvjob-composer" aria-label="Chia sẻ bài viết">
        <span class="vvjob-compose-icon" aria-hidden="true"><i class="fa fa-pencil"></i></span>
        <button type="button" data-vvjob-compose>Hôm nay bạn muốn chia sẻ điều gì?</button>
        <button type="button" class="btn btn-primary" data-vvjob-compose>Viết bài</button>
      </section>
      <nav class="vvjob-tabs" aria-label="Sắp xếp bảng tin">
        <a class="{{{ if !isPopular }}}selected{{{ end }}}" href="{config.relative_path}/vvjob" {{{ if !isPopular }}}aria-current="page"{{{ end }}}>Mới nhất</a>
        <a class="{{{ if isPopular }}}selected{{{ end }}}" href="{config.relative_path}/vvjob?sort=popular" {{{ if isPopular }}}aria-current="page"{{{ end }}}>Được quan tâm</a>
        <span>Câu chuyện từ cộng đồng</span>
      </nav>
      <div class="vvjob-posts">
        {{{ each topics }}}
        <article class="vvjob-post">
          <div class="vvjob-post-meta"><i class="fa fa-user-circle-o" aria-hidden="true"></i><div><a href="{config.relative_path}/user/{./user.userslug}">{./user.displayname}</a><span>{./category.name}</span></div><a class="vvjob-post-open" href="{config.relative_path}/topic/{./slug}" aria-label="Mở bài viết"><i class="fa fa-arrow-up-right-from-square" aria-hidden="true"></i></a></div>
          <h2><a href="{config.relative_path}/topic/{./slug}">{./title}</a></h2>
          {{{ if ./teaser.content }}}<div class="vvjob-excerpt">{./teaser.content}</div>{{{ end }}}
          <a class="vvjob-read" href="{config.relative_path}/topic/{./slug}">Đọc câu chuyện <i class="fa fa-arrow-right" aria-hidden="true"></i></a>
          <footer><a href="{config.relative_path}/topic/{./slug}"><i class="fa fa-comment-o" aria-hidden="true"></i> {./postcount} bài viết trong thảo luận</a><span><i class="fa fa-eye" aria-hidden="true"></i> {./viewcount} lượt xem</span></footer>
        </article>
        {{{ end }}}
        {{{ if !topics.length }}}
        <section class="vvjob-empty"><i class="fa fa-comments-o" aria-hidden="true"></i><h2>Câu chuyện đầu tiên bắt đầu từ bạn</h2><p>Chưa có bài viết để hiển thị. Hãy mở một cuộc trò chuyện về công việc của bạn.</p><button type="button" class="btn btn-primary" data-vvjob-compose>Chia sẻ câu chuyện</button></section>
        {{{ end }}}
      </div>
      <!-- IMPORT partials/paginator.tpl -->
    </main>
    <aside class="vvjob-right" aria-label="Chủ đề nổi bật">
      <section class="vvjob-panel"><div class="vvjob-eyebrow">ĐANG ĐƯỢC QUAN TÂM</div><h2>Chuyện trong tuần <span aria-hidden="true">↗</span></h2><ol class="vvjob-trending">
        {{{ each trending }}}<li><a href="{config.relative_path}/topic/{./slug}">{./title}</a><span>{./postcount} bài viết trong thảo luận</span></li>{{{ end }}}{{{ if !trending.length }}}<li class="vvjob-no-trend">Những cuộc thảo luận nổi bật sẽ xuất hiện tại đây.</li>{{{ end }}}
      </ol></section>
      <section class="vvjob-panel vvjob-welcome"><span class="vvjob-eyebrow">BẠN THUỘC VỀ NƠI ĐÂY</span><h2>Chia sẻ thật.<br>Kết nối bền lâu.</h2><p>Từ ngày đầu đi làm đến bước ngoặt sự nghiệp — luôn có người lắng nghe.</p><a href="{config.relative_path}/register">Tham gia VVJOB <i class="fa fa-arrow-right" aria-hidden="true"></i></a></section>
      <p class="vvjob-fine">Tôn trọng khác biệt. Bảo vệ thông tin cá nhân. Dùng chức năng báo cáo trong bài viết khi cần hỗ trợ.</p>
      <span class="vvjob-copyright">© VVJOB · Cộng đồng người đi làm</span>
    </aside>
  </div>
</div>
