"use strict";
// Career details remain member-only and must have been explicitly made public.
module.exports = (directory, identity) => async (uid, viewer) => {
  const profile = Number(viewer) > 0 ? await directory.profile(uid, viewer) : null;
  const career = profile && Number(profile.publicCompany) === 1 ? profile : null;
  const badge = await identity(uid, career);
  return {
    careerLine: career ? [career.position, career.companyName].filter(Boolean).join(' · ') : '',
    isDemo: !!badge.isDemo, previewFixture: !!badge.previewFixture, simulatedVerified: !!badge.simulatedVerified,
    verified: !!badge.verified && !!career, verificationLabel: badge.isDemo || (career && badge.verified) ? badge.verificationLabel || '' : '',
  };
};
