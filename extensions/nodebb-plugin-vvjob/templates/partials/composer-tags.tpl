<div class="tag-row vvjob-editor-topics">
	<div class="tags-container d-flex align-items-center {{{ if tagWhitelist.length }}}haswhitelist{{{ end }}}">
		<div class="btn-group dropup me-2 {{{ if !tagWhitelist.length }}}hidden{{{ end }}}" component="composer/tag/dropdown">
			<button class="btn btn-sm btn-link text-body dropdown-toggle" data-bs-toggle="dropdown" type="button" aria-haspopup="true" aria-expanded="false">
				<span class="visible-sm-inline visible-md-inline visible-lg-inline"><i class="fa fa-tags"></i></span>
				Chọn chủ đề
			</button>

			<ul class="dropdown-menu p-1" role="menu">
				{{{ each tagWhitelist }}}
				<li data-tag="{@value}"><a class="dropdown-item rounded-1" href="#" role="menuitem">{@value}</a></li>
				{{{ end }}}
			</ul>
		</div>
		<span class="vvjob-topic-symbol" aria-hidden="true">#</span><input class="tags" type="text" aria-label="Chủ đề bài viết (không bắt buộc)" placeholder="Thêm hoặc tìm chủ đề…" />
	</div>
  <small class="vvjob-topic-help" data-vvjob-topic-help>Không bắt buộc. Nhập chủ đề rồi nhấn Enter; chọn gợi ý nếu đã có.</small>
</div>