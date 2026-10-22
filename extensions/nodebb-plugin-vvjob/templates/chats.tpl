<div class="vvjob-chat-workspace row h-100">
	<div class="h-100 {{{if widgets.sidebar.length }}}col-lg-9 col-sm-12{{{ else }}}col-lg-12{{{ end }}}">
		<div class="chats-full d-flex gap-1 h-100 mt-3 mt-md-0 py-md-3">
			<div component="chat/nav-wrapper" class="flex-shrink-0 d-flex flex-column h-100 gap-1" data-loaded="{{{ if roomId }}}1{{{ else }}}0{{{ end }}}">

				<div class="vvjob-chat-heading"><div><span>VVJOB CONNECT</span><h1>Tin nhắn</h1></div><button component="chat/create" type="button" class="btn vvjob-new-chat" aria-label="Tin nhắn mới" title="Tin nhắn mới"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M13 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-7M15 4l5 5M10 14l1-5 7-7 5 5-7 7-6 1Z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div>
                <label class="vvjob-chat-search"><i class="fa fa-search" aria-hidden="true"></i><input type="search" data-chat-filter placeholder="Tìm cuộc trò chuyện đã tải…" aria-label="Tìm trong các cuộc trò chuyện đã tải" autocomplete="off"></label>
                <div class="vvjob-chat-tabs" role="group" aria-label="Lọc tin nhắn"><button type="button" data-chat-tab="all" aria-pressed="true">Tất cả</button><button type="button" data-chat-tab="unread" aria-pressed="false">Chưa đọc <span data-chat-unread></span></button></div>
                <p class="vvjob-chat-filter-empty" role="status" hidden>Không có cuộc trò chuyện phù hợp.</p>

				{{{ if publicRooms.length }}}
				<hr class="my-1">

				<div class="d-flex flex-column gap-1">
					<div class="d-flex gap-1 align-items-center justify-content-between justify-content-lg-start">
						<button class="btn btn-ghost btn-sm p-1 order-1 order-lg-0" data-bs-toggle="collapse" data-bs-target="#public-rooms"
						onclick="$(this).find('i').toggleClass('fa-rotate-180');"><i class="fa fa-fw fa-chevron-up" style="transition: 0.25s ease;"></i></button>
						<label class="text-sm text-muted lh-1">[[modules:chat.public-rooms, {publicRooms.length}]]</label>
					</div>
					<div id="public-rooms" component="chat/public" class="collapse show">
						<div class="d-flex gap-1 flex-column">
							{{{ each publicRooms }}}
							<div component="chat/public/room" class="btn btn-ghost btn-sm ff-sans d-flex justify-content-between hover-parent {{{ if ./unread}}}unread{{{ end }}}" data-roomid="{./roomId}">
								<div class="d-flex gap-1 align-items-center"><i class="fa {./icon} text-muted"></i> {./roomName} <div component="chat/public/room/unread/count" data-count="{./unreadCount}" class="badge border bg-light text-primary {{{ if !./unreadCount }}}hidden{{{ end }}}">{./unreadCountText}</div></div>
								<div>
									<div component="chat/public/room/sort/handle" class="text-muted {{{ if isAdmin }}}hover-d-block{{{ else }}}d-none{{{ end }}}" style="cursor:grab;"><i class="fa fa-bars"></i></div>
								</div>
							</div>
							{{{ end }}}
						</div>
					</div>
				</div>
				{{{ end }}}

				<hr class="my-1">

				<div class="d-flex flex-column gap-1 overflow-auto">
					{{{ if rooms.length }}}
					<div class="d-flex gap-1 align-items-center justify-content-between justify-content-lg-start">
						<button class="btn btn-ghost btn-sm p-1 order-1 order-lg-0" data-bs-toggle="collapse" data-bs-target="#private-rooms"
						onclick="$(this).find('i').toggleClass('fa-rotate-180')"><i class="fa fa-fw fa-chevron-up" style="transition: 0.25s ease;"></i></button>
						<label class="text-sm text-muted lh-1">[[modules:chat.private-rooms, {privateRoomCount}]]</label>
					</div>
					{{{ end }}}

					{{{ if !rooms.length }}}<div class="vvjob-chat-empty"><i class="fa fa-commenting-o" aria-hidden="true"></i><strong>Chưa có cuộc trò chuyện</strong><p>Bắt đầu trò chuyện riêng với một thành viên bạn muốn kết nối.</p></div>{{{ end }}}
					<div id="private-rooms" component="chat/recent" class="chats-list overflow-auto mb-0 pe-1 pb-5 pb-lg-0 collapse show ghost-scrollbar" data-nextstart="{nextStart}">
						{{{ each rooms }}}
						<!-- IMPORT partials/chats/recent_room.tpl -->
						{{{ end }}}
					</div>
				</div>
			</div>
			<div component="chat/main-wrapper" class="flex-grow-1 ms-md-2 ps-md-2 border-1 border-start-md h-100" style="min-width: 0;" data-roomid="{roomId}">
				<!-- IMPORT partials/chats/message-window.tpl -->
			</div>
			<div class="imagedrop"><div>[[topic:composer.drag-and-drop-images]]</div></div>
		</div>
	</div>
	<div data-widget-area="sidebar" class="h-100 col-lg-3 col-sm-12 {{{ if !widgets.sidebar.length }}}hidden{{{ end }}}">
		{{{ each widgets.sidebar }}}
		{{widgets.sidebar.html}}
		{{{ end }}}
	</div>
</div>
