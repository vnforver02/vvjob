<div class="vvjob-page-intro"><span>CÙNG CHIA SẺ, CÙNG TIẾN BỘ</span><h1>Khám phá</h1><p>Chọn điều bạn quan tâm: chuyện công sở, lương thưởng, trải nghiệm công ty và kinh nghiệm đi làm.</p></div>
<aside class="vvjob-discovery-note"><i class="fa fa-shield" aria-hidden="true"></i><div><strong>Chia sẻ có trách nhiệm</strong><p>Bài viết hiện gắn với tài khoản. Đăng ẩn danh chưa được mở.</p></div><a href="{config.relative_path}/vvjob/guide">Xem hướng dẫn</a></aside>
<div data-widget-area="header">
	{{{ each widgets.header }}}
	{{widgets.header.html}}
	{{{ end }}}
</div>
<div class="row flex-fill py-2">
	<div class="{{{ if widgets.sidebar.length }}}col-lg-9 col-sm-12{{{ else }}}col-lg-12{{{ end }}}">
		{{{ if pagination.pages.length }}}
		<div><!-- IMPORT partials/category/selector-dropdown-left.tpl --></div>
		{{{ end }}}
		<ul class="categories-list list-unstyled" itemscope itemtype="http://www.schema.org/ItemList">
			{{{ each categories }}}
			<!-- IMPORT partials/categories/item.tpl -->
			{{{ end }}}
		</ul>

		<!-- IMPORT partials/paginator.tpl -->
	</div>
	<div data-widget-area="sidebar" class="col-lg-3 col-sm-12 {{{ if !widgets.sidebar.length }}}hidden{{{ end }}}">
		{{{ each widgets.sidebar }}}
		{{widgets.sidebar.html}}
		{{{ end }}}
	</div>
</div>
<div data-widget-area="footer">
	{{{ each widgets.footer }}}
	{{widgets.footer.html}}
	{{{ end }}}
</div>
