'use strict';
/* global app, ajaxify */
$(window).on('action:ajaxify.end', function () {
  if (ajaxify.data.template.name !== 'vvjob') { return; }
  $('[data-vvjob-compose]').off('click.vvjob').on('click.vvjob', function () {
    if (!app.user.uid) { return ajaxify.go('login'); }
    // Native composer asks for a category and enforces posting privileges.
    require(['composer'], function (composer) { composer.newTopic({}); });
  });
});
