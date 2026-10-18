<div class="d-flex navigator-mobile" aria-label="Điều hướng thảo luận">
	<div class="pagination-block vvjob-progress-pill" >
		<div class="wrapper dropup-center d-flex align-items-center justify-content-between w-100 h-100" style="padding: 5px 0px;">
			<div class="d-flex">
				<div class="lh-1 px-2">
					<button type="button" class="pagetop" aria-label="Bài viết đầu tiên"><i class="fa fa-angle-up" aria-hidden="true"></i></button>
				</div>
				{{{ if config.usePagination }}}
				<div class="lh-1 px-2">
					<i class="fa fa-angle-left pointer fa-fw pageprev fs-5" style="z-index: 1;"></i>
				</div>
				{{{ end }}}
			</div>

			<a href="#" class="text-reset dropdown-toggle d-inline-block px-3 text-decoration-none" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
				<span class="pagination-text visually-hidden"></span><i class="fa fa-align-left" aria-hidden="true"></i> <span class="vvjob-progress-label"></span>
			</a>

			<div class="d-flex">
				{{{ if config.usePagination }}}
				<div class="lh-1 px-2">
					<i class="fa fa-angle-right pointer fa-fw pagenext fs-5" style="z-index: 1;"></i>
				</div>
				{{{ end }}}
				<div class="lh-1 px-2">
					<button type="button" class="pagebottom" aria-label="Bình luận cuối cùng"><i class="fa fa-angle-down" aria-hidden="true"></i></button>
				</div>
			</div>

			<ul class="dropdown-menu p-0" role="menu" style="width: 100%;">
				<li class="p-3">
					<div class="row">
						<div class="col-8 post-content overflow-hidden mb-3" style="height: 350px;"></div>
						<div class="col-4 ps-0 text-end">
							<div class="scroller-content">
								<span class="pointer pagetop">[[topic:first-post]] <i class="fa fa-angle-double-up"></i></span>
								<div class="scroller-container border-gray-200" style="height: 300px;">
									<div class="scroller-thumb position-relative text-nowrap" style="height: 40px;">
										<span class="thumb-text text-sm fw-bold user-select-none position-relative pe-2" style="top: -15px;"></span>
										<div class="rounded-2 scroller-thumb-icon bg-primary d-inline-block position-relative" style="width: 9px; height:40px;"></div>
									</div>
								</div>
								<span class="pointer pagebottom">[[topic:last-post]] <i class="fa fa-angle-double-down"></i></span>
							</div>
						</div>
					</div>
					<div class="row">
						<div class="col-6">
							<button id="myNextPostBtn" class="btn btn-sm btn-ghost border form-control text-truncate" disabled>[[topic:go-to-my-next-post]]</button>
						</div>
						<div class="col-6">
							<input type="number" class="form-control form-control-sm" id="indexInput" placeholder="[[global:pagination.enter-index]]">
						</div>
					</div>
				</li>
			</ul>
		</div>
	</div>
</div>