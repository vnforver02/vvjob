'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
test('Vietnamese overrides preserve every native translation placeholder', () => {
  const contracts = require('./fixtures/vi-placeholders.json');
  for (const [namespace, keys] of Object.entries(contracts)) {
    const data = JSON.parse(fs.readFileSync(path.join('extensions/nodebb-plugin-vvjob/languages/vi', `${namespace}.json`)));
    assert.deepEqual(Object.keys(data).sort(), Object.keys(keys).sort());
    for (const [key, placeholders] of Object.entries(keys)) {
      assert.ok(data[key].trim());
      assert.deepEqual((data[key].match(/%\d+/g) || []).sort(), placeholders, `${namespace}:${key}`);
    }
  }
  const register = require('../extensions/nodebb-plugin-vvjob/languages/vi/register.json');
  assert.match(register['help.username-restrictions'], /id='yourUsername'/);
  const reset = require('../extensions/nodebb-plugin-vvjob/languages/vi/reset_password.json');
  assert.match(reset['password-reset-sent'], /Nếu email này/);
});
