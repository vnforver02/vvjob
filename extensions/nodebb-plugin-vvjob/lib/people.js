'use strict';
const SIZE = 12;
module.exports = function (host, directory, identity = async () => ({})) {
 const user = host('user'), db = host('database');
 const positive = value => Math.max(0, Number(value) || 0);
 async function card(row, viewer) {
  const uid = Number(row.uid);
  const [career, following, followerCount] = await Promise.all([directory.profile(uid, viewer), user.isFollowing(viewer, uid), user.getUserField(uid, 'followerCount')]);
  const badge = await identity(uid, career);
  const company = career?.companyId && directory.resolve ? await directory.resolve(career.companyId) : null;
  const displayname = badge.isDemo ? await user.getUserField(uid, 'fullname') : row.displayname || row.username || '';
  // Explicit projection: never forward native user objects or private career records.
  return { uid, ...badge, userslug: row.userslug || '', displayname, picture: row.picture || '',
   initial: Array.from(row.displayname || row.username || 'V')[0].toUpperCase(),
   companyId: career?.companyId || '', positionId: career?.positionId || '', jobFamilyId: career?.jobFamilyId || '', industryId: company?.industryId || (Number(uid)===Number(viewer)?career?.industryId:'') || '', joinedAt: Number(row.joindate)||0, company: career?.companyName || '', position: career?.position || '', city: career?.city || '',
   hasCareer: !!(career?.companyName || career?.position), following: !!following,
   postcount: positive(row.postcount), followerCount: positive(followerCount) };
 }
 async function page(req, res) {
  if (!(Number(req.uid) > 0)) { return res.status(401).json({error: 'Vui lòng đăng nhập để kết nối.'}); }
  res.set('Cache-Control', 'private, no-store');
  const tab = ['following','followers','new','coworkers'].includes(req.query.tab) ? req.query.tab : 'discover';
  const query = typeof req.query.q === 'string' ? req.query.q.trim().slice(0,80) : '';
  const page = Math.min(10000, Math.max(1, Math.floor(Number(req.query.page)) || 1));
  const start = (page-1)*SIZE;
  const self = await user.getUserFields(req.uid, ['uid','userslug','username','displayname','picture','postcount','followingCount','followerCount']);
  let rows, hasNext;
  if (query) {
   const result = await host('api/users').search(req, {query, page, searchBy:'username', sortBy:'joindate'});
   rows = result.users || []; hasNext = page < Number(result.pageCount);
  } else {
   const curated = ['discover','new','coworkers'].includes(tab);
   const set = curated ? 'users:joindate' : `${tab}:${req.uid}`;
   const uids = await db.getSortedSetRevRange(set, curated?0:start, curated?499:start+SIZE);
   hasNext = !curated && uids.length > SIZE;
   rows = await user.getUsers(curated?uids:uids.slice(0,SIZE), req.uid);
  }
  const blocked = await user.blocks.list(req.uid);
  const visible = (rows || []).filter(row => row && Number(row.uid)>0 && Number(row.uid)!==Number(req.uid) && !Number(row.banned) && !blocked.map(Number).includes(Number(row.uid)));
  const blockedBy = await user.blocks.is(req.uid, visible.map(row=>Number(row.uid)));
  const candidates=visible.filter((row,i)=>!blockedBy[i]);
  const people=[];let cursor=0;
  await Promise.all(Array.from({length:Math.min(8,candidates.length)},async()=>{while(cursor<candidates.length){const index=cursor++;people[index]=await card(candidates[index],req.uid);}}));
  const selectedTab = query ? 'discover' : tab;
  const params = new URLSearchParams({tab:selectedTab}); if(query)params.set('q',query);
  const me = await card(self,req.uid);
  let selected=people;
  if(!query&&['discover','new','coworkers'].includes(tab)){
   if(tab==='coworkers')selected=people.filter(person=>!!me.companyId&&person.companyId===me.companyId);
   if(tab==='new')selected=people.filter(person=>person.joinedAt>=Date.now()-30*86400000);
   if(tab==='discover')selected=people.filter(person=>!person.following).map(person=>({...person,...require('./people-ranking')(person,me)})).sort((a,b)=>b.score-a.score||b.joinedAt-a.joinedAt||a.uid-b.uid);
   hasNext=selected.length>start+SIZE;selected=selected.slice(start,start+SIZE);
  }
  const needsCompany=tab==='coworkers'&&!me.companyId;
  res.render('vvjob-people', {title:'Kết nối — VVJOB', people:selected, me, query, needsCompany, isSearch:!!query,
   isDiscover:selectedTab==='discover', isNew:selectedTab==='new', isCoworkers:selectedTab==='coworkers', isFollowing:selectedTab==='following', isFollowers:selectedTab==='followers',
   listTitle:query ? 'Kết quả tìm kiếm' : selectedTab==='following' ? 'Những người bạn đang theo dõi' : selectedTab==='followers' ? 'Những người theo dõi bạn' : selectedTab==='new'?'Mới tham gia trong 30 ngày':selectedTab==='coworkers'?'Đồng nghiệp cùng công ty':'Gợi ý dành cho bạn',
   followingCount:positive(self.followingCount), followerCount:positive(self.followerCount),
   hasNext, hasPrev:page>1, nextUrl:`/users?${params}&page=${page+1}`, prevUrl:`/users?${params}&page=${page-1}`,
  });
 }
 return {page, card};
};
