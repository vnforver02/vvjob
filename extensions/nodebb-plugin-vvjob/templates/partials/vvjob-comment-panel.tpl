          <section class="vvcomments" id="vvcomments-{./domId}" aria-label="Bình luận" hidden>
            <header class="vvcomments-heading"><strong>Cuộc trò chuyện</strong><button type="button" data-comments-close aria-label="Thu gọn bình luận"><i class="fa fa-angle-up" aria-hidden="true"></i></button></header>
            <div data-comment-composer><form class="vvcomments-form" hidden>
              <div class="vvcomments-replying" hidden><span></span><button type="button" data-comment-cancel aria-label="Hủy trả lời"><i class="fa fa-times" aria-hidden="true"></i></button></div>
              <label class="visually-hidden" for="vvcomment-input-{./domId}">Viết bình luận</label>
              <div class="vvcomments-input"><textarea id="vvcomment-input-{./domId}" rows="1" placeholder="Chia sẻ góc nhìn của bạn…" required></textarea><button type="submit" aria-label="Gửi bình luận" title="Gửi bình luận"><i class="fa fa-paper-plane-o" aria-hidden="true"></i></button></div>
              <div class="vvcomments-form-footer"><button type="button" data-comment-emoji aria-expanded="false" aria-controls="vvemoji-{./domId}" aria-label="Thêm biểu cảm"><i class="fa fa-smile-o" aria-hidden="true"></i></button><span>Ctrl / ⌘ + Enter để gửi</span></div>
              <div class="vvcomments-emoji" id="vvemoji-{./domId}" hidden aria-label="Chọn biểu cảm"><button type="button" data-emoji="😊" aria-label="Mỉm cười">😊</button><button type="button" data-emoji="👍" aria-label="Đồng ý">👍</button><button type="button" data-emoji="❤️" aria-label="Yêu thích">❤️</button><button type="button" data-emoji="👏" aria-label="Vỗ tay">👏</button><button type="button" data-emoji="💡" aria-label="Ý tưởng">💡</button><button type="button" data-emoji="💪" aria-label="Cố lên">💪</button></div>
            </form></div>
            <ol class="vvcomments-list" aria-label="Các bình luận"></ol>
            <p class="vvcomments-empty" hidden>Chưa có bình luận. Chia sẻ góc nhìn của bạn nhé.</p>
            <button type="button" class="vvcomments-more" data-comments-more hidden>Xem thêm bình luận</button>
            <p class="vvcomments-status" role="status" aria-live="polite"></p>
            <div class="vvcomments-login" hidden><a href="{config.relative_path}/login">Đăng nhập</a> để tham gia trò chuyện.</div>

            <a class="vvcomments-full" href="{config.relative_path}/topic/{./slug}">Mở toàn bộ thảo luận <i class="fa fa-angle-right" aria-hidden="true"></i></a>
          </section>
