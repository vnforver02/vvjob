'use strict';

module.exports = function brandLinks(data, relativePath = '') {
  // Ajax page data has no document head; preserve native API metadata semantics.
  if (data.req?.res?.locals?.isAPI) return data;
  const base = `${relativePath}/assets/plugins/nodebb-plugin-vvjob/brand/`;
  const icon = name => `${base}${name}?v=20261025`;
  data.links = data.links.filter(link => !['icon', 'shortcut icon', 'apple-touch-icon', 'apple-touch-icon-precomposed'].includes(link.rel));
  data.links.push(
    { rel: 'icon', type: 'image/png', sizes: '32x32', href: icon('favicon-32.png') },
    { rel: 'icon', type: 'image/svg+xml', sizes: 'any', href: icon('vvjob-mark.svg') },
    { rel: 'apple-touch-icon', sizes: '180x180', href: icon('apple-touch-icon.png') },
  );
  return data;
};

module.exports.manifest = function brandManifest(data, relativePath = '') {
  data.manifest.icons = [192, 512].map(size => ({
    src: `${relativePath}/assets/plugins/nodebb-plugin-vvjob/brand/icon-${size}.png?v=20261025`,
    sizes: `${size}x${size}`,
    type: 'image/png',
    purpose: 'any',
  }));
  return data;
};
