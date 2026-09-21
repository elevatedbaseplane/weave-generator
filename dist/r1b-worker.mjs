import {deriveStitchWithTrace,STITCH_VERSIONS} from './stitch.mjs';
import {deriveAttractorAsync,ATTRACTOR_VERSIONS} from './attractor.mjs';
import {deriveInfluenceAsync,INFLUENCE_VERSIONS,FAMILY_INFLUENCE_VERSIONS} from './influence.mjs';
import {deriveCombinedAsync,COMBINED_VERSIONS} from './combined.mjs';
import {digest} from './weave.mjs';
import {encodeDerivedAsync} from './storage-codec.mjs';
import {dependencyPlan as calculateDependencyPlan} from './dependency-plan.mjs';

const cache=new Map(),keys=(v,k)=>v&&typeof v==='object'&&!Array.isArray(v)&&Object.keys(v).length===k.length&&k.every(x=>x in v);let lastCombined=null;
function errorCode(error){const text=String(error?.message||'').toLowerCase();if(/unsupported worker request|fingerprint mismatch|dependency plan/.test(text))return'invalid-request';if(/precision|epsilon|certificate|certif/.test(text))return'precision';if(/limit|budget|too many|exceed/.test(text))return'work-limit';if(/nonfinite|finite|numeric/.test(text))return'numerical';return'evaluator';}
function validatePlan(plan){if(!keys(plan,['version','families','stages','reuse','reasons'])||plan.version!=='dependency-plan-v1'||!Array.isArray(plan.families)||!Array.isArray(plan.stages)||!keys(plan.reuse,['geometry','crossings','presentation'])||!Array.isArray(plan.reasons))throw Error('Invalid dependency plan.');}
function remember(key,value){cache.delete(key);cache.set(key,value);while(cache.size>4)cache.delete(cache.keys().next().value);}

self.onmessage=async e=>{
 const started=performance.now(),receivedEpoch=performance.timeOrigin+started,m=e.data;
 try{
  const legacy=['protocolVersion','workerBuildId','sessionId','requestSequence','requestId','boardId','weaveStudyId','baseCommittedFingerprint','candidateInputFingerprint','algorithmVersions','candidate'],planned=[...legacy.slice(0,-1),'dependencyPlan','candidate'],r1c=[INFLUENCE_VERSIONS.protocol,FAMILY_INFLUENCE_VERSIONS.protocol].includes(m.protocolVersion),r1d=m.protocolVersion===COMBINED_VERSIONS.protocol,sp1=m.protocolVersion===STITCH_VERSIONS.protocol;
  if((!keys(m,legacy)&&!keys(m,planned))||(!r1c&&!r1d&&!sp1&&m.protocolVersion!==ATTRACTOR_VERSIONS.protocol)||!Number.isSafeInteger(m.requestSequence))throw Error('Unsupported worker request.');
  const dependencyPlan=m.dependencyPlan||{version:'dependency-plan-v1',families:[],stages:['geometry'],reuse:{geometry:false,crossings:false,presentation:false},reasons:['legacy-request']};validatePlan(dependencyPlan);if(digest(m.candidate)!==m.candidateInputFingerprint)throw Error('Worker candidate fingerprint mismatch.');
  const c=m.candidate,cached=cache.get(m.candidateInputFingerprint),actualPlan=r1d&&lastCombined?calculateDependencyPlan(lastCombined.candidate,c):null,incremental=r1d&&lastCombined?.result?.__familyWork&&digest(actualPlan)===digest(dependencyPlan)&&actualPlan.families.length?{previous:lastCombined.result,families:actualPlan.families}:null,deriveStarted=performance.now(),evaluated=cached||await (sp1?deriveStitchWithTrace:r1d?deriveCombinedAsync:r1c?deriveInfluenceAsync:deriveAttractorAsync)(c.boundary,c.carrier,m.boardId,c.sourceContext,c.generation,incremental),result=sp1?evaluated.derived:evaluated,sourceTrace=sp1?evaluated.trace:null,deriveMs=performance.now()-deriveStarted;
  if(!cached)remember(m.candidateInputFingerprint,evaluated);
  if(r1d)lastCombined={candidate:structuredClone(c),result};
  const encodeStarted=performance.now(),payload=await encodeDerivedAsync(result),encodeMs=performance.now()-encodeStarted,postedEpoch=performance.timeOrigin+performance.now(),workerMs=performance.now()-started,reused=cached?['geometry']:incremental?[...new Set(Object.keys(c.carrier.families||{}).filter(n=>!actualPlan.families.includes(n)).map(n=>'family:'+n))]:[];
  self.postMessage({type:'success',protocolVersion:m.protocolVersion,workerBuildId:m.workerBuildId,sessionId:m.sessionId,requestSequence:m.requestSequence,requestId:m.requestId,boardId:m.boardId,weaveStudyId:m.weaveStudyId,baseCommittedFingerprint:m.baseCommittedFingerprint,candidateInputFingerprint:m.candidateInputFingerprint,algorithmVersions:m.algorithmVersions,dependencyPlan,result,sourceTrace,payload,reused,resultCanonicalFingerprint:payload.id,workerMs,timing:{receivedEpoch,deriveMs,encodeMs,postedEpoch}},[payload.f64,payload.u32,payload.i32,payload.u16]);
 }catch(error){self.postMessage({type:'failure',protocolVersion:m?.protocolVersion,requestId:m?.requestId,requestSequence:m?.requestSequence,error:{code:errorCode(error),name:error.name,message:error.message},workerMs:performance.now()-started});}
};
