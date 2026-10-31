<div component="composer" class="composer vvjob-composer vvjob-slim-composer {{{ if isEditing }}}vvjob-is-editing{{{ end }}} {{{ if (isTopic && !isEditing) }}}vvjob-titleless{{{ end }}} pb-3 h-100 {{{ if resizable }}} resizable{{{ end }}}{{{ if !isTopicOrMain }}} reply{{{ end }}}"{{{ if !disabled }}} style="visibility: inherit;"{{{ end }}}>
	<div class="composer-container d-flex flex-column gap-1 h-100"><!-- IMPORT partials/vvjob-editor-heading.tpl -->
		<form id="compose-form" method="post">
			{{{ if pid }}}
			<input type="hidden" name="pid" value="{pid}" />
			<input type="hidden" name="thumb" value="{thumb}" />
			{{{ end }}}
			{{{ if tid }}}
			<input type="hidden" name="tid" value="{tid}" />
			{{{ end }}}
			{{{ if cid }}}
			<input type="hidden" name="cid" value="{cid}" />
			{{{ end }}}
			<input type="hidden" name="_csrf" value="{config.csrf_token}" />
		</form>

		{{{ if !isEditing }}}<div class="vvjob-editor-identity"><span class="vvjob-editor-avatar" data-editor-avatar aria-hidden="true">V</span><div><strong data-editor-name>Bạn</strong><span>Chia sẻ với cộng đồng</span></div></div>{{{ end }}}
<!-- IMPORT partials/composer-title-container.tpl -->

		<!-- IMPORT partials/composer-formatting.tpl -->

		<!-- IMPORT partials/composer-write-preview.tpl -->

		{{{ if isTopicOrMain }}}
		<!-- IMPORT partials/composer-tags.tpl -->
		{{{ end }}}
<footer class="vvjob-editor-footer"><span>Cộng đồng</span><button type="button" class="btn composer-submit" data-action="post">Đăng</button></footer>
	</div>
</div>
