'use strict';
/* global app, ajaxify, config */
(function () {
  const base = () => config.relative_path || '';
  async function post(path, data) {
    const response = await fetch(`${base()}/api/vvjob/${path}`, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json', 'x-csrf-token': config.csrf_token }, body: JSON.stringify(data) });
    if (response.redirected) { ajaxify.go('login'); throw Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'); }
    let result;
    try { result = await response.json(); } catch { throw Error('Không thể lưu. Vui lòng tải lại trang rồi thử lại.'); }
    if (!response.ok) { throw Error(result.error || result.status && result.status.message || 'Không thể lưu. Vui lòng thử lại.'); }
    return result;
  }
  const feedback = (form, message, failed) => $(form).find('.vvjob-career-feedback').text(message).toggleClass('text-danger', !!failed);
  async function busy(form, task) {
    const buttons = $(form).find('button'); buttons.prop('disabled', true);
    try { await task(); } catch (err) { feedback(form, err.message, true); } finally { buttons.prop('disabled', false); }
  }
  function choose(form, row) {
    searchVersion++; clearTimeout(searchTimer);
    form.elements.companyId.value = row.id;
    $('#career-company-query').val(row.name);
    $('#career-selected').text(`Đã chọn: ${row.name} · Chưa xác minh nghề nghiệp`);
    $('#career-company-results').empty(); $('#career-company-query').attr('aria-expanded', 'false');
  }
  let searchTimer, searchVersion = 0;
  $(document).on('input.vvjobCareer', '#career-company-query', function () {
    const input = this, form = document.querySelector('#vvjob-career-form'), version = ++searchVersion;
    form.elements.companyId.value = ''; $('#career-selected').text('Chọn một công ty từ kết quả tìm kiếm để lưu.');
    clearTimeout(searchTimer);
    searchTimer = setTimeout(async () => {
      try {
        const response = await fetch(`${base()}/api/vvjob/companies?q=${encodeURIComponent(input.value)}`);
        if (!response.ok) { throw Error('Không thể tìm công ty. Vui lòng thử lại.'); }
        const data = await response.json(); if (version !== searchVersion || !input.isConnected) { return; }
        const results = $('#career-company-results').empty(); $(input).attr('aria-expanded', 'true');
        data.companies.forEach(row => $('<button>', { type: 'button', role: 'option', 'aria-selected': 'false', class: 'vvjob-picker-result' }).append($('<strong>').text(row.name), $('<small>').text(row.domain)).on('click', () => choose(form, row)).appendTo(results));
        if (!data.companies.length) { $('<p>').text('Chưa tìm thấy. Bạn có thể đề xuất công ty bên dưới.').appendTo(results); }
      } catch (err) { if (version === searchVersion) { $('#career-company-results').text(err.message); } }
    }, 250);
  });
  $(document).on('pointerdown.vvjobCareer', function (event) {
    if (!$(event.target).closest('.vvjob-company-picker').length) {
      searchVersion++; clearTimeout(searchTimer);
      $('#career-company-results').empty(); $('#career-company-query').attr('aria-expanded', 'false');
    }
  });
  $(document).on('focus.vvjobCareer', '#career-company-query', function () {
    // Opening suggestions must not clear an existing selection until typing starts.
    if (!this.value) { $(this).trigger('input'); }
  });
  $(document).on('keydown.vvjobCareer', '#career-company-query', function (event) {
    if (event.key === 'ArrowDown') { event.preventDefault(); $('#career-company-results button').first().trigger('focus'); }
    if (event.key === 'Escape') { $('#career-company-results').empty(); $(this).attr('aria-expanded', 'false'); }
  });
  $(document).on('keydown.vvjobCareer', '#career-company-results button', function (event) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); $(this)[event.key === 'ArrowDown' ? 'next' : 'prev']('button').trigger('focus'); }
    if (event.key === 'Escape') { $('#career-company-results').empty(); $('#career-company-query').attr('aria-expanded', 'false').trigger('focus'); }
  });
  $(document).on('change.vvjobCareer', '#career-family', function () {
    const position = document.querySelector('#career-position');
    [...position.options].forEach(option => { option.hidden = !!(this.value && option.dataset.family && option.dataset.family !== this.value); });
    if (position.selectedOptions[0]?.hidden) { position.value = ''; position.dispatchEvent(new Event('change', { bubbles: true })); }
    position.dispatchEvent(new Event('vvjob:refresh'));
  });
  $(document).on('change.vvjobCareer', '#vvjob-career-form select', function () {
    const container = document.querySelector(`[data-other-field="${this.name}"]`);
    if (container) { container.hidden = this.value !== 'other'; const input = container.querySelector('input'); input.required = this.value === 'other'; }
  });
  $(document).on('click.vvjobCareer', '[data-clear-company]', function () {
    searchVersion++; clearTimeout(searchTimer);
    const form = document.querySelector('#vvjob-career-form'); form.elements.companyId.value = '';
    $('#career-company-query').val('').attr('aria-expanded', 'false'); $('#career-selected').text('Chưa chọn công ty.'); $('#career-company-results').empty();
  });
  $(document).on('submit.vvjobCareer', '#vvjob-career-form', function (event) {
    event.preventDefault(); const form = this, data = Object.fromEntries(new FormData(form));
    data.publicCompany = form.elements.publicCompany.checked;
    if ($('#career-company-query').val().trim() && !data.companyId) { return feedback(form, 'Vui lòng chọn công ty từ kết quả hoặc bỏ chọn công ty.', true); }
    busy(form, async () => {
      await post('career', data);
      feedback(form, 'Đã lưu hồ sơ. Đang mở trang cá nhân…');
      const destination = app.user.userslug ? `user/${encodeURIComponent(app.user.userslug)}` : `uid/${app.user.uid}`;
      ajaxify.go(destination, function () {
        require(['alerts'], function (alerts) {
          alerts.success(data.publicCompany ? 'Đã lưu hồ sơ. Thông tin nghề nghiệp đang được công khai và chưa được xác minh.' : 'Đã lưu hồ sơ. Thông tin nghề nghiệp chỉ hiển thị với bạn và chưa được xác minh.');
        });
      });
    });
  });
  $(document).on('click.vvjobCareer', '[data-career-dismiss]', function () {
    const banner = this.closest('.vvjob-career-reminder'), button = this;
    button.disabled = true;
    post('career/skip', {}).then(() => banner.remove()).catch(err => { feedback(banner, err.message, true); button.disabled = false; });
  });
  $(document).on('click.vvjobCareer', '[data-career-skip]', function () {
    const form = this.form;
    busy(form, async () => { await post('career/skip', {}); ajaxify.go('vvjob'); });
  });
  $(document).on('submit.vvjobCareer', '#suggest-company', function (event) {
    event.preventDefault(); const form = this;
    busy(form, async () => { await post('companies/submit', Object.fromEntries(new FormData(form))); form.reset(); feedback(form, 'Đã gửi đề xuất. Công ty sẽ hiển thị sau khi được duyệt.'); });
  });
  $(document).on('submit.vvjobCareer', '[data-review-company]', function (event) {
    event.preventDefault(); const form = this, button = event.originalEvent.submitter;
    if (!button) { return; }
    const data = { ...Object.fromEntries(new FormData(form)), id: form.dataset.reviewCompany, action: button.value };
    busy(form, async () => { await post('companies/review', data); feedback(form, 'Đã lưu thay đổi.'); });
  });
  $(document).on('submit.vvjobCareer', '#vvjob-company-import', function (event) {
    event.preventDefault(); const form = this, button = event.originalEvent.submitter;
    if (!button) { return; }
    busy(form, async () => {
      const source = form.elements.companies.value.trim(), data = { dryRun: button.value !== 'import' };
      if (source) { data.companies = JSON.parse(source); } else { data.useSeed = true; }
      const result = await post('companies/import', data);
      feedback(form, `${result.dryRun ? 'Kiểm tra' : 'Đã nhập'}: ${result.added} công ty mới; ${result.skipped} mã đã tồn tại.`);
    });
  });
  function init() {
    const form = document.querySelector('#vvjob-career-form');
    if (!form || form.dataset.ready) { return; }
    form.dataset.ready = '1';
    form.elements.workStatus.value = form.dataset.workStatus || 'unspecified';
    form.elements.publicCompany.checked = form.dataset.publicCompany === '1';
    form.querySelectorAll('select[name]').forEach(select => { select.dispatchEvent(new Event('change', { bubbles: true })); select.dispatchEvent(new Event('vvjob:refresh')); });
    const requested = new URLSearchParams(location.search).get('company');
    if (requested && /^[a-zA-Z0-9-]{1,64}$/.test(requested)) {
      fetch(`${base()}/api/vvjob/companies/selected?id=${encodeURIComponent(requested)}`).then(r => r.ok ? r.json() : null).then(row => { if (row && form.isConnected) { choose(form, row); } }).catch(() => {});
    }
  }
  $(window).on('action:ajaxify.end.vvjobCareer', init); $(init);
  document.addEventListener('error', function (event) { if (event.target.classList && event.target.classList.contains('vvjob-company-logo')) { event.target.hidden = true; } }, true);
})();
