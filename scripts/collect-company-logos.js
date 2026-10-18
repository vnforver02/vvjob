'use strict';
// Fetch only the checked-in, reviewed official websites. No arbitrary fetch URL
// endpoint is exposed to members. Images are candidates, never auto-approved.
const fs = require('node:fs/promises');
const path = require('node:path');
const seed = require('../extensions/nodebb-plugin-vvjob/data/companies.json');
async function collect() {
  const rows = [];
  for (const company of seed) {
    const result = { ...company, logoCandidateUrl: '', logoCandidateSource: company.website };
    try {
      const response = await fetch(company.website, { redirect: 'error', signal: AbortSignal.timeout(15000), headers: { 'User-Agent': 'VVJOB-CompanyDirectory/0.7 (official homepage reference check)' } });
      if (!response.ok) { throw Error(`HTTP ${response.status}`); }
      const reader = response.body.getReader(); let size = 0, html = '';
      try {
        while (true) {
          const { done, value } = await reader.read(); if (done) { break; }
          size += value.byteLength; if (size > 1500000) { throw Error('Homepage exceeds 1.5MB'); }
          html += new TextDecoder().decode(value);
        }
      } finally { await reader.cancel(); }
      const tags = html.match(/<(?:img|link)\b[^>]*>/gi) || [];
      const tag = tags.find(value => /logo/i.test(value) && /(?:src|href)\s*=/.test(value));
      const match = tag && tag.match(/(?:src|href)\s*=\s*["']([^"']+)["']/i);
      if (match) {
        const candidate = new URL(match[1].replace(/&amp;/g, '&'), company.website);
        if (candidate.protocol === 'https:') { result.logoCandidateUrl = candidate.href; }
      }
      result.logoCandidateNote = result.logoCandidateUrl ? 'Official-page candidate; review image and usage before publishing.' : 'No logo candidate found; retain placeholder.';
    } catch (err) { result.logoCandidateNote = `Not collected: ${err.message}. Retain placeholder.`; }
    rows.push(result); console.error(`${company.id}: ${result.logoCandidateUrl ? 'candidate found' : 'placeholder'}`);
  }
  const output = process.argv[2] || path.join('artifacts', 'company-logo-candidates.json');
  await fs.mkdir(path.dirname(output), { recursive: true });
  await fs.writeFile(output, `${JSON.stringify(rows, null, 2)}\n`);
  console.error(`Saved ${rows.length} source records to ${output}; no images downloaded or approved.`);
}
collect().catch(err => { console.error(err); process.exitCode = 1; });
