{{{ each comments }}}
<li class="vvcomment" data-comment-pid="{./pid}">
  <a class="vvcomment-avatar" href="{config.relative_path}/user/{./user.userslug}" aria-label="Hồ sơ {./user.displayname}">{{{ if ./user.picture }}}<img src="{./user.picture}" alt="" loading="lazy">{{{ else }}}<i class="fa fa-user-o" aria-hidden="true"></i>{{{ end }}}</a>
  <div class="vvcomment-main"><div class="vvcomment-bubble"><a class="vvcomment-author" href="{config.relative_path}/user/{./user.userslug}">{./user.displayname}</a>{{{ if ./replyTo }}}<span class="vvcomment-parent">Trả lời {./replyTo}</span>{{{ end }}}<div class="vvcomment-content">{./content}</div></div>
  <div class="vvcomment-meta"><time data-comment-time="{./timestamp}"></time>{{{ if canReply }}}<button type="button" data-comment-reply="{./pid}" data-name="{./user.displayname}">Trả lời</button>{{{ end }}}<a href="{config.relative_path}/post/{./pid}" aria-label="Mở bình luận và tùy chọn báo cáo">Chi tiết</a></div></div>
</li>
{{{ end }}}
