'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),rank=require('../extensions/nodebb-plugin-vvjob/lib/people-ranking');
const me={companyId:'a',positionId:'engineer',position:'Kỹ sư phần mềm',jobFamilyId:'engineering',industryId:'technology',city:'Hà Nội'};
test('recommendations favor actual roles, professional families and industry; location contributes nothing',()=>{assert(rank({positionId:'engineer'},me).score>rank({companyId:'a'},me).score);assert(rank({jobFamilyId:'engineering'},me).score>rank({industryId:'technology'},me).score);assert.equal(rank({city:'Hà Nội'},me).score,rank({city:'Đà Nẵng'},me).score);assert(!rank({city:'Hà Nội'},me).reason.includes('thành phố'));});
test('simulated certification is never treated as a real trust or ranking boost',()=>{assert.equal(rank({isDemo:true,simulatedVerified:true},me).score,rank({isDemo:true},me).score);});
test('unknown role and industry buckets do not falsely create professional matches',()=>{assert.equal(rank({positionId:'other',industryId:'other'},{positionId:'other',industryId:'other'}).score,0)});
