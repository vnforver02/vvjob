<header class="vvhot-heading"><div><span class="vvhot-eyebrow"><i class="fa fa-fire" aria-hidden="true"></i> GÓC NHÌN CỘNG ĐỒNG</span><h1>Đang được bàn luận</h1><p>Câu chuyện nào đang thu hút người đi làm?</p></div><button type="button" data-vvjob-compose data-cid="{selectedCommunityId}" aria-label="Mở cuộc thảo luận mới"><i class="fa fa-pencil" aria-hidden="true"></i></button></header>
<nav class="vvhot-periods" aria-label="Khoảng thời gian của bảng xếp hạng">{{{ each hotPeriods }}}<a href="{config.relative_path}{./url}" class="{{{ if ./active }}}active{{{ end }}}" {{{ if ./active }}}aria-current="page"{{{ end }}}>{./label}</a>{{{ end }}}</nav>
<nav class="vvhot-communities" aria-label="Lọc bảng xếp hạng theo cộng đồng"><a href="{config.relative_path}{hotAllUrl}" class="{{{ if !hasCommunity }}}active{{{ end }}}">Tất cả chủ đề</a>{{{ each communities }}}<a href="{config.relative_path}{./hotUrl}" class="{{{ if ./active }}}active{{{ end }}}">{./name}</a>{{{ end }}}</nav>
<div class="vvhot-board">
  <div class="vvhot-board-label"><span>XẾP HẠNG THẢO LUẬN</span><span><i class="fa fa-comments-o" aria-hidden="true"></i> Từ cộng đồng</span></div>
  {{{ each topics }}}
  <article class="vvhot-row" data-feed-tid="{./tid}">
    <div class="vvhot-rank {{{ if ./topRank }}}vvhot-rank-top vvhot-rank-{./rank}{{{ end }}}" aria-label="Hạng {./rank}">{./rank}</div>
    <div class="vvhot-story"><a class="vvhot-category" href="{config.relative_path}/vvjob?cid={./cid}">{./category.name}</a><h2><a href="{config.relative_path}/topic/{./slug}">{./title}</a></h2>{{{ if ./teaser.content }}}<div class="vvhot-excerpt">{./teaser.content}</div>{{{ end }}}
      <div class="vvhot-stats"><span><i class="fa fa-comment-o" aria-hidden="true"></i> <span data-feed-replycount="{./replyCount}">{./replyCount} bình luận</span></span><span><i class="fa fa-eye" aria-hidden="true"></i> {./viewcount} lượt xem</span></div>
      <footer class="vv2-post-actions vvjob-conversation-actions"><button type="button" data-vvjob-comments aria-expanded="false" aria-controls="vvcomments-{./tid}"><i class="fa fa-comment-o" aria-hidden="true"></i> Bình luận</button><button type="button" data-vvjob-share data-url="{config.relative_path}/topic/{./slug}" data-title="{./title}"><i class="fa fa-share-alt" aria-hidden="true"></i> Chia sẻ</button><span class="vvjob-share-feedback" role="status"></span></footer>
      <!-- IMPORT partials/vvjob-comment-panel.tpl -->
    </div>
  </article>
  {{{ end }}}
  {{{ if !topics.length }}}<div class="vvhot-empty"><i class="fa fa-comments-o" aria-hidden="true"></i><h2>Cuộc trò chuyện đang chờ bạn</h2><p>Chưa có thảo luận trong thời gian này. Thử khoảng thời gian khác hoặc chia sẻ câu chuyện đầu tiên.</p><button class="vv2-button" type="button" data-vvjob-compose data-cid="{selectedCommunityId}">Mở cuộc trò chuyện</button></div>{{{ end }}}
</div>
