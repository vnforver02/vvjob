'use strict';
const catalog = require('../data/career-taxonomy.json');
const fold = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().trim();
const find = (kind, value) => String(value || '').trim() ? catalog[kind].find(row => row.id === value || [row.label, ...row.aliases.split(';')].some(label => fold(label) === fold(value))) : undefined;
function field(kind, id, value = '') {
  if (id === 'other') { if (!String(value).trim()) { throw Error('Vui lòng điền thông tin cho lựa chọn khác.'); } return { id, label: value }; }
  if (id === '') { return { id: '', label: '' }; }
  const row = id === undefined ? find(kind, value) : catalog[kind].find(row => row.id === id);
  if (row) { return row; }
  if (id !== undefined) { throw Error('Lựa chọn không hợp lệ. Vui lòng chọn lại từ danh sách.'); }
  return { id: value ? 'other' : '', label: value };
}
function options(kind, selected, legacy = '', family = '') {
  const match = find(kind, selected || legacy);
  const selectedId = selected === 'other' ? 'other' : match ? match.id : legacy ? 'other' : '';
  return [...catalog[kind], { id: 'other', label: 'Khác / Chưa có trong danh sách', aliases: '' }].map(row => ({ ...row, selected: row.id === selectedId, hidden: !!(family && row.family && row.family !== family) }));
}
module.exports = { catalog, fold, find, field, options };
