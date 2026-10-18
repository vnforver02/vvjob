'use strict';
const SIZE = 12;
module.exports = function (host, directory) {
 const user = host('user'), db = host('database');
 const positive = value => Math.max(0, Number(value) || 0);
 async function card(row, viewer) {
  const uid = Number(row.uid);
  const [career, following, followerCount] = await Promise.all([directory.profile(uid, viewer), user.isFollowing(viewer, uid), user.getUserField(uid, 'followerCount')]);
  // Explicit projection: never forward native user objects or private career records.
  return { uid, userslug: row.userslug || '', displayname: row.displayname || row.username || '', picture: row.picture || '',
   initial: Array.from(row.displayname || row.username || 'V')[0].toUpperCase(),
   company: career?.companyName || '', position: career?.position || '', city: career?.city || '',
   hasCareer: !!(career?.companyName || career?.position), following: !!following,
   postcount: positive(row.postcount), followerCount: positive(followerCount) };
 }
 async function page(req, res) {
  if (!(Number(req.uid) > 0)) { return res.status(401).json({error: 'Vui lòng đăng nhập để kết nối.'}); }
  res.set('Cache-Control', 'private, no-store');
  const tab = ['following','followers'].includes(req.query.tab) ? req.query.tab : 'discover';
  const query = typeof req.query.q === 'string' ? req.query.q.trim().slice(0,80) : '';
  const page = Math.min(10000, Math.max(1, Math.floor(Number(req.query.page)) || 1));
  const start = (page-1)*SIZE;
  const self = await user.getUserFields(req.uid, ['uid','userslug','username','displayname','picture','postcount','followingCount','followerCount']);
  let rows, hasNext;
  if (query) {
   const result = await host('api/users').search(req, {query, page, searchBy:'username', sortBy:'joindate'});
   rows = result.users || []; hasNext = page < Number(result.pageCount);
  } else {
   const set = tab === 'discover' ? 'users:joindate' : `${tab}:${req.uid}`;
   const uids = await db.getSortedSetRevRange(set, start, start+SIZE);
   hasNext = uids.length > SIZE;
   rows = await user.getUsers(uids.slice(0,SIZE), req.uid);
  }
  const blocked = await user.blocks.list(req.uid);
  const visible = (rows || []).filter(row => row && Number(row.uid)>0 && Number(row.uid)!==Number(req.uid) && !Number(row.banned) && !blocked.map(Number).includes(Number(row.uid)));
  const blockedBy = await user.blocks.is(req.uid, visible.map(row=>Number(row.uid)));
  const people = await Promise.all(visible.filter((row,i)=>!blockedBy[i]).map(row=>card(row,req.uid)));
  const selectedTab = query ? 'discover' : tab;
  const params = new URLSearchParams({tab:selectedTab}); if(query)params.set('q',query);
  const me = await card(self,req.uid);
  res.render('vvjob-people', {title:'Kết nối — VVJOB', people, me, query, isSearch:!!query,
   isDiscover:selectedTab==='discover', isFollowing:selectedTab==='following', isFollowers:selectedTab==='followers',
   listTitle:query ? 'Kết quả tìm kiếm' : selectedTab==='following' ? 'Những người bạn đang theo dõi' : selectedTab==='followers' ? 'Những người theo dõi bạn' : 'Gặp gỡ thành viên mới',
   followingCount:positive(self.followingCount), followerCount:positive(self.followerCount),
   hasNext, hasPrev:page>1, nextUrl:`/users?${params}&page=${page+1}`, prevUrl:`/users?${params}&page=${page-1}`,
  });
 }
 return {page, card};
};
