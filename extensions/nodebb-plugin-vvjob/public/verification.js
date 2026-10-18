'use strict';
/* global config, ajaxify */
(function () {
  async function submit(form, path, payload) {
    const buttons = $(form).find('button'), feedback = $(form).find('.vvjob-career-feedback');
    buttons.prop('disabled', true); feedback.removeClass('text-danger').text('Đang xử lý…');
    try {
      const response = await fetch(`${config.relative_path || ''}/api/vvjob/verification/${path}`, {
        method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json', 'x-csrf-token': config.csrf_token }, body: JSON.stringify(payload),
      });
      let result;
      try { result = await response.json(); } catch { throw Error('Phiên làm việc có thể đã hết hạn. Vui lòng tải lại trang.'); }
      if (!response.ok) { throw Error(result.error || 'Không thể xử lý yêu cầu.'); }
      if (form.hasAttribute('data-verification-confirm')) {
        // Server computes the status; client never grants a badge from form data.
        if (result.status !== 'verified') { throw Error('Chưa thể xác minh. Vui lòng tải lại trạng thái.'); }
      }
      ajaxify.refresh();
    } catch (err) { feedback.addClass('text-danger').text(err.message); } finally { buttons.prop('disabled', false); }
  }
  const data = form => Object.fromEntries(new FormData(form));
  $(document).on('submit.vvjobVerification', '[data-verification-request]', function (event) {
    event.preventDefault(); submit(this, 'request', { email: this.elements.email.value.trim(), consent: this.elements.consent.checked });
  });
  $(document).on('submit.vvjobVerification', '[data-verification-confirm]', function (event) {
    event.preventDefault(); submit(this, 'confirm', { code: this.elements.code.value.trim(), challengeId: this.dataset.challenge });
  });
  $(document).on('submit.vvjobVerification', '[data-verification-withdraw]', function (event) { event.preventDefault(); submit(this, 'withdraw', {}); });
  $(document).on('submit.vvjobVerification', '[data-verification-policy]', function (event) {
    event.preventDefault(); submit(this, 'policy', { ...data(this), active: this.elements.active.checked, confirmOwnership: this.elements.confirmOwnership.checked });
  });
  $(document).on('submit.vvjobVerification', '[data-verification-settings]', function (event) {
    event.preventDefault(); submit(this, 'settings', { enabled: this.elements.enabled.checked, deliveryConfirmed: this.elements.deliveryConfirmed.checked });
  });
  $(document).on('submit.vvjobVerification', '[data-verification-revoke]', function (event) { event.preventDefault(); submit(this, 'revoke', { uid: this.elements.uid.value }); });
})();
