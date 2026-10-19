<footer class="vv2-post-actions vvjob-conversation-actions" aria-label="Tương tác bài viết">
  <button type="button" data-vvjob-share data-url="{config.relative_path}/topic/{./slug}" data-title="{./title}" aria-label="Chia sẻ" title="Chia sẻ"><i class="fa fa-paper-plane-o" aria-hidden="true"></i></button>
  <button type="button" data-vvjob-comments aria-expanded="false" aria-controls="vvcomments-{./domId}" aria-label="Bình luận" title="Bình luận"><i class="fa fa-comment-o" aria-hidden="true"></i><span data-feed-replycount="{./replyCount}">{{{ if ./replyCount }}}{./replyCount}{{{ end }}}</span></button>
  {{{ if ./socialPost }}}<button type="button" data-vvjob-like="{./socialPost.pid}" aria-label="Thích" title="Thích" aria-pressed="{{{ if ./socialPost.liked }}}true{{{ else }}}false{{{ end }}}" {{{ if ./socialPost.selfPost }}}disabled{{{ end }}}><i class="fa {{{ if ./socialPost.liked }}}fa-thumbs-up{{{ else }}}fa-thumbs-o-up{{{ end }}}" aria-hidden="true"></i><span data-like-count>{{{ if ./socialPost.likes }}}{./socialPost.likes}{{{ end }}}</span></button>{{{ end }}}
  <span class="vvjob-share-feedback" role="status" aria-live="polite"></span>
</footer>
