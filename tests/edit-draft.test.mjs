import test from 'node:test';
import assert from 'node:assert/strict';
import {copyProjectForEdit} from '../dist/edit-draft.mjs';
import {createProject,saveBoundary,saveCarrierStudy,createWeaveStudy,addInfluence,candidateInfluence,saveWeaveStudy} from '../dist/document.mjs';
import {createRectangularCarrier} from '../dist/carrier.mjs';
import {refreshWeave,canonical} from '../dist/weave.mjs';
import {packWorkspace,portableText} from '../dist/storage-codec.mjs';

function fixture(){let p=saveBoundary(createProject(),'BOUNDARY').project;p.working.carrier=createRectangularCarrier();p=saveCarrierStudy(p,'PATTERN').project;p=createWeaveStudy(p,p.working.carrierSourceRevisionId);p=addInfluence(p);p.working=refreshWeave(p.working,p.id);return saveWeaveStudy(p,'FIELD',true).project;}
function freeze(value){if(value&&typeof value==='object'&&!Object.isFrozen(value)){Object.freeze(value);for(const v of Object.values(value))freeze(v);}return value;}
test('editing shares immutable geometry and history while isolating every editable setting',()=>{
 const p=freeze(fixture()),before=canonical(p),draft=copyProjectForEdit(p);
 assert.equal(draft.working.weave.derived,p.working.weave.derived);
 assert.equal(draft.weaveStudies[0].revisions[0],p.weaveStudies[0].revisions[0]);
 draft.working.carrier.families.A.spacing=91;
 draft.working.weave.generation.influences[0].center.x+=10;
 draft.weaveStudies[0].revisions.push({id:'temporary'});
 assert.equal(canonical(p),before);
});
test('100 preview candidates do not append revisions or change committed portable bytes',()=>{
 const p=freeze(fixture()),ws={schemaVersion:6,activeProjectId:p.id,projects:[p]},bytes=portableText(packWorkspace(ws)),before=canonical(p);
 let draft=p;
 for(let strength=0;strength<100;strength++)draft=candidateInfluence(draft,{family:'A',familySettings:{strength}});
 assert.equal(draft.weaveStudies[0].revisions.length,1);
 assert.equal(draft.weaveStudies[0].revisions[0],p.weaveStudies[0].revisions[0]);
 assert.equal(draft.working.weave.derived,p.working.weave.derived);
 draft.working=refreshWeave(draft.working,draft.id);
 const saved=saveWeaveStudy(draft,'FIELD',true).project;
 assert.equal(saved.weaveStudies[0].revisions.length,2);
 assert.equal(saved.weaveStudies[0].revisions[0],p.weaveStudies[0].revisions[0]);
 assert.equal(saved.working.weave.generation.influences[0].families.A.strength,99);
 assert.equal(canonical(p),before);assert.equal(portableText(packWorkspace(ws)),bytes);
});
