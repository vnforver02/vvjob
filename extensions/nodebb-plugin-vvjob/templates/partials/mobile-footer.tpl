<div class="vv2 vvjob-site-shell vvjob-global-bottom" component="bottombar">
  <div class="vvjob-mobile-progress"><!-- IMPORT partials/topic/navigator-mobile.tpl --></div>
  <nav class="vv2-mobile-nav bottombar-nav" aria-label="Điều hướng di động">
    <a data-vvjob-nav="feed" href="{relative_path}/vvjob"><i class="fa fa-home" aria-hidden="true"></i><span>Trang chủ</span></a>
    <a data-vvjob-nav="people" href="{relative_path}/users"><i class="fa fa-users" aria-hidden="true"></i><span>Kết nối</span></a>
    <button type="button" data-vvjob-compose aria-label="Viết bài"><i class="fa fa-plus" aria-hidden="true"></i></button>
    <a data-vvjob-nav="chats" href="{relative_path}/chats" aria-label="Tin nhắn"><span class="vvjob-chat-icon"><i class="fa fa-commenting-o" aria-hidden="true"></i>{{{ if config.loggedIn }}}<span component="chat/count" class="vvjob-chat-count {{{ if !unreadCount.chat }}}hidden{{{ end }}}" aria-label="Cuộc trò chuyện chưa đọc">{unreadCount.chat}</span>{{{ end }}}</span><span>Tin nhắn</span></a>
    <a data-vvjob-nav="profile" href="{relative_path}/me"><i class="fa fa-user-o" aria-hidden="true"></i><span>Cá nhân</span></a>
  </nav>
</div>
