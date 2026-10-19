'use strict';
// Match native header/profile avatars, including the no-photo letter and palette.
function project(user = {}) {
 const uid = Number(user.uid) || 0;
 const raw = String(user['icon:text'] || user.username || user.displayname || '?');
 const initial = Array.from(raw)[0].toUpperCase().replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const color = /^#[a-f0-9]{3,8}$/i.test(user['icon:bgColor'] || '') ? user['icon:bgColor'] : '#5f91d8';
 return {uid, picture: user.picture || '', initial, color};
}
module.exports = host => ({
 async batch(uids) {
  const unique = [...new Set(uids.map(Number).filter(uid=>Number.isSafeInteger(uid)&&uid>0))];
  const users = await host('user').getUsersFields(unique,['uid','username','picture','icon:text','icon:bgColor']);
  return new Map(users.map(user=>[Number(user.uid),project(user)]));
 }, project,
});
module.exports.project = project;
