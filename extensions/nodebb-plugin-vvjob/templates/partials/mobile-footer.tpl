<div class="vv2 vvjob-site-shell vvjob-global-bottom" component="bottombar">
  <div class="vvjob-mobile-progress"><!-- IMPORT partials/topic/navigator-mobile.tpl --></div>
  <nav class="vv2-mobile-nav bottombar-nav" aria-label="Điều hướng di động">
    <a aria-label="Trang chủ" data-vvjob-nav="feed" href="{relative_path}/vvjob"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 10 9-7 9 7v11h-7v-7h-4v7H3Z"/></svg><span>Trang chủ</span></a>
    <a aria-label="Kết nối" data-vvjob-nav="people" href="{relative_path}/users"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="7" r="4"/><path d="M4 22v-3a8 8 0 0 1 16 0v3"/></svg><span>Kết nối</span></a>
    <button type="button" data-vvjob-compose aria-label="Viết bài"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v16M4 12h16"/></svg></button>
    <a data-vvjob-nav="chats" href="{relative_path}/chats" aria-label="Tin nhắn"><span class="vvjob-chat-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 11a9 9 0 0 1-9 9c-2 0-3-.4-4-1l-5 2 1.5-5A9 9 0 1 1 21 11Z"/></svg>{{{ if config.loggedIn }}}<span component="chat/count" class="vvjob-chat-count {{{ if !unreadCount.chat }}}hidden{{{ end }}}" aria-label="Cuộc trò chuyện chưa đọc">{unreadCount.chat}</span>{{{ end }}}</span><span>Tin nhắn</span></a>
    <a aria-label="Cá nhân" data-vvjob-nav="profile" href="{relative_path}/me"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="7" r="4"/><path d="M4 22v-3a8 8 0 0 1 16 0v3"/></svg><span>Cá nhân</span></a>
  </nav>
</div>
