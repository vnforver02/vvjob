<footer class="vv2-post-actions vvjob-conversation-actions" aria-label="Tương tác bài viết">
  {{{ if ./socialPost }}}<button type="button" data-vvjob-like="{./socialPost.pid}" aria-label="Thích" title="Thích" aria-pressed="{{{ if ./socialPost.liked }}}true{{{ else }}}false{{{ end }}}" {{{ if ./socialPost.selfPost }}}disabled title="Bài viết của bạn"{{{ end }}}><i class="fa {{{ if ./socialPost.liked }}}fa-heart{{{ else }}}fa-heart-o{{{ end }}}" aria-hidden="true"></i><span data-like-count>{{{ if ./socialPost.likes }}}{./socialPost.likes}{{{ end }}}</span></button>{{{ end }}}
  <button type="button" data-vvjob-comments aria-expanded="false" aria-controls="vvcomments-{./tid}" aria-label="Bình luận" title="Bình luận"><i class="fa fa-comment-o" aria-hidden="true"></i><span data-feed-replycount="{./replyCount}">{{{ if ./replyCount }}}{./replyCount}{{{ end }}}</span></button>
  <button type="button" data-vvjob-share data-url="{config.relative_path}/topic/{./slug}" data-title="{./title}" aria-label="Chia sẻ" title="Chia sẻ"><i class="fa fa-paper-plane-o" aria-hidden="true"></i></button>
  <span class="vvjob-share-feedback" role="status" aria-live="polite"></span>
</footer>
