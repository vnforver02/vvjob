'use strict';
// Native registration uses empty HEAD existence checks, not public user profiles.
module.exports = format => (req, res, next) => {
  if (req.loggedIn && Number(req.uid) > 0) return next();
  if (req.method === 'HEAD' && /^\/(?:bySlug\/[^/]+|[1-9]\d*)\/?$/.test(req.path || '')) return next();
  return format(401, res, new Error('[[error:not-logged-in]]'));
};
