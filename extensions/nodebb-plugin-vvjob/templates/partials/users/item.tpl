<div class="vvjob-person-card">
	<a href="{config.relative_path}/user/{./userslug}" class="vvjob-person-link d-flex flex-column align-items-center text-center gap-3">
		{buildAvatar(@value, "48px", true, "flex-shrink-0")}
		<div class="d-flex flex-column align-items-center gap-1 w-100">
			<div class="fw-semibold text-truncate" title="{./displayname}">{./displayname}</div>
			<div class="text-xs text-muted text-truncate">@{./username}</div>

			{{{ if section_online }}}
			<div class="text-xs text-muted text-truncate">
				<span class="timeago" title="{./lastonlineISO}"></span>
			</div>
			{{{ end }}}

			{{{ if section_joindate }}}
			<div class="text-xs text-muted text-truncate">
				<span class="timeago" title="{./joindateISO}"></span>
			</div>
			{{{ end }}}

			{{{ if section_sort-reputation }}}
			<div class="text-xs text-muted text-truncate">
				<span>{formattedNumber(./reputation)}</span>
			</div>
			{{{ end }}}

			{{{ if section_sort-posts }}}
			<div class="text-xs text-muted text-truncate">
				<span>{formattedNumber(./postcount)}</span>
			</div>
			{{{ end }}}

			{{{ if section_flagged }}}
			<div class="text-xs text-muted text-truncate">
				<span>{formattedNumber(./flags)}</span>
			</div>
			{{{ end }}}
		</div>
	</a>
</div>
