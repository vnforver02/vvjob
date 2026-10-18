<div class="vv2 vvjob-site-shell vvjob-site-top">
  <header class="vv2-header">
    <div class="vv2-header-inner">
      <a class="vv2-logo" href="{relative_path}/" aria-label="VVJOB — Bảng tin"><span class="vv2-symbol" aria-hidden="true">v<span>v</span></span><span>vvjob<span class="vv2-logo-caption">Real Work. Real Talk.</span></span></a>
      <form class="vv2-search" action="{relative_path}/search" method="get" role="search"><i class="fa fa-search" aria-hidden="true"></i><input type="search" name="term" placeholder="Tìm câu chuyện, chủ đề, cộng đồng" aria-label="Tìm kiếm trên VVJOB"><button type="submit" aria-label="Tìm kiếm">↵</button></form>
      <nav class="vv2-header-nav" aria-label="Điều hướng chính"><a data-vvjob-nav="feed" href="{relative_path}/vvjob">Bảng tin</a><a data-vvjob-nav="communities" href="{relative_path}/categories">Cộng đồng</a><a href="{relative_path}/vvjob/companies">Công ty</a><a data-vvjob-nav="people" href="{relative_path}/users">Kết nối</a></nav>
      <div class="vv2-header-actions"><a class="vv2-mobile-search" href="{relative_path}/search" aria-label="Tìm kiếm"><i class="fa fa-search" aria-hidden="true"></i></a>
        {{{ if config.loggedIn }}}
        <ul id="logged-in-menu" class="vvjob-member-tools list-unstyled" role="menu">
          <li component="notifications" class="nav-item notifications dropdown" role="menuitem"><!-- IMPORT partials/sidebar/notifications.tpl --></li>
          {{{ if canChat }}}<li class="nav-item chats dropdown" role="menuitem"><!-- IMPORT partials/sidebar/chats.tpl --></li>{{{ end }}}
          <li component="sidebar/drafts" class="nav-item drafts dropdown" role="menuitem"><!-- IMPORT partials/sidebar/drafts.tpl --></li>
          <li id="user_label" class="nav-item usermenu dropdown" role="menuitem"><!-- IMPORT partials/sidebar/user-menu.tpl --></li>
        </ul>
        {{{ else }}}
        <div id="logged-out-menu" class="vvjob-guest-tools"><a class="vv2-login" href="{relative_path}/login">Đăng nhập</a><a class="vv2-button vv2-button-small" href="{relative_path}/register">Tham gia</a></div>
        {{{ end }}}
      </div>
    </div>
  </header>
</div>
