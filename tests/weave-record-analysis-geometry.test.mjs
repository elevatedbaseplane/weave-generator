import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorkspace,saveCarrierStudy,createWeaveStudy,addInfluence,saveWeaveStudy,validateTrustedWorkspace} from '../dist/document.mjs';
import {createRectangularCarrier} from '../dist/carrier.mjs';
import {packWorkspace,unpackWorkspace} from '../dist/storage-codec.mjs';
import {refreshWeave} from '../dist/weave.mjs';
import {ANALYSIS_GEOMETRY_VERSION,resolveAnalysisGeometry} from '../dist/weave-record.mjs';

function centerlinesByStrand(strands){
 return Object.fromEntries(strands.map(strand=>[strand.strandId,strand.fragments.map(fragment=>fragment.points.map(point=>({x:point.x,y:point.y})))]));
}

test('an influenced weave pins the certified centerlines and keeps that fingerprint after reload',()=>{
 const ws=createWorkspace();
 let project=ws.projects[0];
 project.working.carrier=createRectangularCarrier();
 project=saveCarrierStudy(project,'WEAVE',{generatorVersion:'TEST-BUILD'}).project;
 const sourceFingerprint=project.carrierStudies[0].revisions[0].geometryRef.geometryFingerprint;
 assert.equal(project.carrierStudies[0].revisions[0].geometryRef.geometryVersion,ANALYSIS_GEOMETRY_VERSION);
 assert.equal(project.carrierStudies[0].revisions[0].geometryRef.artifactId,null);
 const sourceSnapshot=resolveAnalysisGeometry(project,project.carrierStudies[0].revisions[0]);
 project=createWeaveStudy(project,project.carrierStudies[0].latestRevisionId);
 project=addInfluence(project);
 project.working=refreshWeave(project.working,project.id);
 project=saveWeaveStudy(project,'FIELD',true).project;
 const revision=project.carrierStudies[0].revisions.at(-1);
 const ref=revision.geometryRef;
 assert.equal(ref.geometryVersion,ANALYSIS_GEOMETRY_VERSION);
 assert.equal(typeof ref.geometryFingerprint,'string');
 assert.notEqual(ref.geometryFingerprint,sourceFingerprint);
 assert.equal(typeof ref.artifactId,'string');
 assert.equal(ref.contentFingerprint,project.working.weave.derived.contentFingerprint);
 const snapshot=resolveAnalysisGeometry(project,revision);
 assert.deepEqual(snapshot.boundary,revision.boundary.points.map(point=>({x:point.x,y:point.y})));
 assert.deepEqual(centerlinesByStrand(snapshot.strands),centerlinesByStrand(project.working.weave.derived.strands));
 assert.notDeepEqual(snapshot,sourceSnapshot);
 assert.equal(JSON.stringify(snapshot).includes('width'),false);
 assert.equal(JSON.stringify(snapshot).includes('segmentErrorBounds'),false);
 const fingerprint=ref.geometryFingerprint;
 project.working.carrier.families.A.spacing=12;
 assert.equal(revision.geometryRef.geometryFingerprint,fingerprint);
 ws.projects[0]=project;
 validateTrustedWorkspace(ws);
 const reloaded=unpackWorkspace(packWorkspace(ws));
 const restored=reloaded.projects[0].carrierStudies[0].revisions.at(-1);
 assert.equal(restored.geometryRef.geometryFingerprint,fingerprint);
 assert.equal(restored.geometryRef.artifactId,ref.artifactId);
 assert.deepEqual(resolveAnalysisGeometry(reloaded.projects[0],restored),snapshot);
 const stranded=structuredClone(reloaded.projects[0]);
 stranded.weaveStudies=[];
 stranded.working.weave.derived=null;
 assert.throws(()=>resolveAnalysisGeometry(stranded,restored),/was not regenerated/);
});
