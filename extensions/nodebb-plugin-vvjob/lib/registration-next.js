'use strict';
module.exports = (next, relative = '') => {
  const fallback = `${relative}/vvjob`;
  if (typeof next !== 'string' || !next.startsWith('/')) return fallback;
  const target = new URL(next, 'https://vvjob.invalid');
  if (target.origin !== 'https://vvjob.invalid' || !target.pathname.startsWith(`${relative}/`)) return fallback;
  const route = target.pathname.slice(relative.length);
  if (route === '/') return target.pathname + target.search + target.hash;
  if (!/^\/(?:vvjob|topic|category|categories|tags|users|user|me|search|notifications|chats)(?:\/|$)/.test(route)) return fallback;
  if (/^\/vvjob\/[^/]*admin(?:\/|$)/.test(route)) return fallback;
  return target.pathname + target.search + target.hash;
};
