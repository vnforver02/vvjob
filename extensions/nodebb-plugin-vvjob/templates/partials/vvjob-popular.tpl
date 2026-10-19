<header class="vvhot-heading"><div><span class="vvhot-eyebrow"><i class="fa fa-fire" aria-hidden="true"></i> CHỦ ĐỀ NỔI BẬT</span><h1>Chủ đề nổi bật</h1><p>Câu chuyện nào đang thu hút người đi làm?</p></div><button type="button" data-vvjob-compose data-cid="{selectedCommunityId}" aria-label="Mở cuộc thảo luận mới"><i class="fa fa-pencil" aria-hidden="true"></i></button></header>
<nav class="vvhot-periods" aria-label="Khoảng thời gian của bảng xếp hạng">{{{ each hotPeriods }}}<a href="{config.relative_path}{./url}" class="{{{ if ./active }}}active{{{ end }}}" {{{ if ./active }}}aria-current="page"{{{ end }}}>{./label}</a>{{{ end }}}</nav>
<nav class="vvhot-communities" aria-label="Lọc bảng xếp hạng theo cộng đồng"><a href="{config.relative_path}{hotAllUrl}" class="{{{ if !hasCommunity }}}active{{{ end }}}">Tất cả chủ đề</a>{{{ each communities }}}<a href="{config.relative_path}{./hotUrl}" class="{{{ if ./active }}}active{{{ end }}}">{./name}</a>{{{ end }}}</nav>
<div class="vvhot-board">
  <div class="vvhot-board-label"><span>XẾP HẠNG THẢO LUẬN</span><span><i class="fa fa-comments-o" aria-hidden="true"></i> Từ cộng đồng</span></div>
  {{{ each topics }}}
  <article class="vvhot-row" data-feed-tid="{./tid}">
    <div class="vvhot-rank {{{ if ./topRank }}}vvhot-rank-top vvhot-rank-{./rank}{{{ end }}}" aria-label="Hạng {./rank}">{./rank}</div>
    <div class="vvhot-story"><!-- IMPORT partials/vvjob-post-body.tpl -->

      <!-- IMPORT partials/vvjob-social-actions.tpl -->

    </div>
  </article>
  {{{ end }}}
  {{{ if !topics.length }}}<div class="vvhot-empty"><i class="fa fa-comments-o" aria-hidden="true"></i><h2>Cuộc trò chuyện đang chờ bạn</h2><p>Chưa có thảo luận trong thời gian này. Thử khoảng thời gian khác hoặc chia sẻ câu chuyện đầu tiên.</p><button class="vv2-button" type="button" data-vvjob-compose data-cid="{selectedCommunityId}">Mở cuộc trò chuyện</button></div>{{{ end }}}
</div>

{{{ if ongoing.length }}}<section class="vvjob-ongoing" aria-label="Đang được bàn luận"><header><span><i class="fa fa-comments-o" aria-hidden="true"></i> Đang được bàn luận</span><p>Góc nhìn thật từ cộng đồng người đi làm</p></header><div class="vv2-posts">{{{ each ongoing }}}<!-- IMPORT partials/vvjob-feed-card.tpl -->{{{ end }}}</div></section>{{{ end }}}
