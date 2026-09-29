// Regression checks for saved weaves. This does not score from the page and does not invent an overall score.
import {analyzeWeave} from './analysis.mjs';
import {criterionDefinition,evaluateWeave} from './evaluation.mjs';

function finite(value){return typeof value==='number'&&Number.isFinite(value)?value:null;}
function compare(label,actual,bound,mode,failures){
 if(bound==null)return;
 if(finite(actual)===null){failures.push(`${label} is missing.`);return;}
 if(mode==='atLeast'&&actual<bound)failures.push(`${label} is ${actual}, expected at least ${bound}.`);
 if(mode==='atMost'&&actual>bound)failures.push(`${label} is ${actual}, expected at most ${bound}.`);
 if(mode==='equals'&&Math.abs(actual-bound)>1e-9)failures.push(`${label} is ${actual}, expected ${bound}.`);
}

export function qaActual(result){
 if(!result)return null;
 return {status:result.status,rating:finite(result.rating),normalizedScore:finite(result.normalizedScore),components:{...(result.components||{})},safeguards:{...(result.safeguards||{})},logicVersion:result.criterionLogicVersion||'',calibrationVersion:result.calibrationVersion||''};
}

export function checkQualitative(actual,expected={}){
 const failures=[];
 if(!actual){failures.push('This criterion was not scored.');return failures;}
 if(expected.status&&actual.status!==expected.status)failures.push(`status is ${actual.status}, expected ${expected.status}.`);
 compare('rating',actual.rating,expected.ratingAtLeast,'atLeast',failures);
 compare('rating',actual.rating,expected.ratingAtMost,'atMost',failures);
 compare('rating',actual.rating,expected.rating,'equals',failures);
 for(const [name,bound] of Object.entries(expected.componentAtLeast||{}))compare(name,actual.components?.[name],bound,'atLeast',failures);
 for(const [name,bound] of Object.entries(expected.componentAtMost||{}))compare(name,actual.components?.[name],bound,'atMost',failures);
 for(const [name,bound] of Object.entries(expected.capAtMost||{}))compare(name,actual.safeguards?.[name],bound,'atMost',failures);
 for(const [name,bound] of Object.entries(expected.capEquals||{}))compare(name,actual.safeguards?.[name],bound,'equals',failures);
 if(expected.logicVersion&&actual.logicVersion!==expected.logicVersion)failures.push(`logic is ${actual.logicVersion}, expected ${expected.logicVersion}.`);
 if(expected.calibrationVersion&&actual.calibrationVersion!==expected.calibrationVersion)failures.push(`calibration is ${actual.calibrationVersion}, expected ${expected.calibrationVersion}.`);
 return failures;
}

export function runQaCase(project,entry,spec){
 if(!spec?.name)throw new Error('A QA case needs a name.');
 const mode=spec.mode||'all';
 let analysisRun=null,evaluation=null;
 if(mode==='analysis')analysisRun=analyzeWeave(project,entry,{grid:spec.grid}).run;
 else if(mode==='criterion'){
  if(!spec.criterionId)throw new Error('A one-criterion case needs a criterion.');
  criterionDefinition(spec.criterionId);
  const result=evaluateWeave(project,entry,{criterionIds:[spec.criterionId],evaluationId:spec.evaluationId,createdAt:spec.createdAt,grid:spec.grid});
  analysisRun=result.analysisRun;
  evaluation=result.evaluation;
 }else if(mode==='all'){
  const result=evaluateWeave(project,entry,{evaluationId:spec.evaluationId,createdAt:spec.createdAt,grid:spec.grid});
  analysisRun=result.analysisRun;
  evaluation=result.evaluation;
 }else throw new Error('Unknown QA mode.');
 const ids=mode==='criterion'?[spec.criterionId]:mode==='all'?Object.keys(evaluation.criterionResults):[];
 const actual=Object.fromEntries(ids.map(id=>[id,qaActual(evaluation.criterionResults[id])]));
 const failures=[];
 for(const [id,expected] of Object.entries(spec.expect||{}))for(const failure of checkQualitative(actual[id],expected))failures.push(`${id}: ${failure}`);
 if(spec.expectAnalysisStatus&&analysisRun?.status!==spec.expectAnalysisStatus)failures.push(`analysis is ${analysisRun?.status}, expected ${spec.expectAnalysisStatus}.`);
 if(evaluation&&Object.hasOwn(evaluation,'overallScore'))failures.push('The run stored an overall score.');
 return {name:spec.name,behavior:spec.behavior||'',mode,geometryFingerprint:analysisRun?.geometryFingerprint||'',analysisStatus:analysisRun?.status||'',actual,failures,passed:failures.length===0};
}

export function assertQaCase(report){
 if(!report?.passed)throw new Error(`${report?.name||'QA case'}: ${(report?.failures||['The case did not pass.']).join(' ')}`);
 return report;
}
