<div component="chat/message/window" class="d-flex flex-column h-100">
	{{{ if widgets.header.length }}}
	<div data-widget-area="header">
		{{{each widgets.header}}}
		{{widgets.header.html}}
		{{{end}}}
	</div>
	{{{ end }}}
	{{{ if !roomId }}}
	<section class="vvjob-chat-welcome"><div class="vvjob-chat-welcome-icon"><svg viewBox="0 0 64 64" fill="none" aria-hidden="true"><path d="M47 29c0 11-9 19-20 19-4 0-7-1-10-2l-10 3 3-10a18 18 0 0 1-3-10c0-11 9-19 20-19s20 8 20 19Z" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/><path d="M49 25c5 3 8 8 8 14 0 3-1 6-2 9l3 9-9-3c-3 1-5 2-8 2-5 0-10-2-13-5M19 29h16" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg></div><span>KẾT NỐI CÓ Ý NGHĨA</span><h2>Một lời chào, một kết nối mới.</h2><p>Chọn một cuộc trò chuyện để tiếp tục, hoặc kết nối với những người cùng quan tâm đến công việc.</p><a href="{config.relative_path}/users">Khám phá kết nối <i class="fa fa-arrow-right" aria-hidden="true"></i></a><small>Tôn trọng sự riêng tư. Chỉ chia sẻ khi bạn cảm thấy thoải mái.</small></section>
	{{{ else }}}
	<div component="chat/header" class="d-flex align-items-center px-md-3 gap-3">
		<a href="#" data-action="close" role="button" class="flex-shrink-0 d-flex d-md-none btn btn-ghost border align-text-top"><i class="fa fa-chevron-left"></i></a>
		<h5 component="chat/header/title" class="members flex-grow-1 fw-semibold tracking-tight mb-0 text-truncate text-nowrap" style="line-height: initial;">
			{{{ if ./roomName }}}<i class="fa {icon} text-muted"></i> {roomName}{{{ else }}}{./chatWithMessage}{{{ end}}}
		</h5>

		<!-- IMPORT partials/chats/options.tpl -->
	</div>
	<!-- IMPORT partials/chats/scroll-up-alert.tpl -->
	<hr class="my-1"/>
	<div class="d-flex flex-grow-1 gap-1 overflow-auto" style="min-width: 0px;">
		<div component="chat/messages" class="expanded-chat d-flex flex-column flex-grow-1" data-roomid="{roomId}" style="min-width: 0px;">
			<ul component="chat/message/content" class="chat-content p-0 m-0 list-unstyled overflow-auto flex-grow-1 ghost-scrollbar">
				<!-- IMPORT partials/chats/messages.tpl -->
			</ul>
			<ul component="chat/message/search/results" class="chat-content p-0 m-0 list-unstyled overflow-auto flex-grow-1 hidden">
				<div component="chat/message/search/no-results" class="text-center p-4 d-flex flex-column">
					<div class="p-4"><i class="fa-solid fa-wind fs-2 text-muted"></i></div>
					<div class="text-xs fw-semibold text-muted">[[search:no-matches]]</div>
				</div>
			</ul>
			<!-- IMPORT partials/chats/composer.tpl -->
		</div>

		<!-- IMPORT partials/chats/user-list.tpl -->
		<!-- IMPORT partials/chats/pinned-messages.tpl -->
	</div>
	{{{ end }}}
</div>