'use strict';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').toLowerCase().trim();
module.exports=function rank(person,me){
 let score=0,professional=false;const reasons=[];
 const exact=person.positionId&&person.positionId!=='other'&&person.positionId===me.positionId||person.position&&me.position&&fold(person.position)===fold(me.position);
 if(exact){professional=true;score+=150;reasons.push('Cùng vị trí công việc');}
 else if(person.jobFamilyId&&person.jobFamilyId!=='other'&&person.jobFamilyId===me.jobFamilyId){professional=true;score+=100;reasons.push('Cùng chuyên môn');}
 if(person.industryId&&person.industryId!=='other'&&person.industryId===me.industryId){professional=true;score+=70;reasons.push('Cùng lĩnh vực');}
 if(person.companyId&&person.companyId===me.companyId){score+=60;reasons.push('Cùng công ty');}
 if(person.hasCareer)score+=5;
 // Neither location nor simulated verification contributes to recommendation.
 if(person.verified&&!person.isDemo)score+=3;
 return {score,professional,reason:reasons.slice(0,2).join(' · ')||(person.hasCareer?'Có hồ sơ nghề nghiệp':'Khám phá góc nhìn mới')};
};
