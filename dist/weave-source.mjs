import {validateBoundaryRecord} from './boundary.mjs';
import {validateCarrierRecipe} from './carrier.mjs';
import {validateFamilyCatalog} from './family-domain.mjs';
import {validateThreadAppearance} from './thread-appearance.mjs';
import {validateInterlacing} from './interlacing.mjs';
import {ATTRACTOR_VERSIONS,validateGeneration} from './attractor.mjs';
import {INFLUENCE_VERSIONS,FAMILY_INFLUENCE_VERSIONS,validateGeneration as validateInfluenceGeneration} from './influence.mjs';
import {COMBINED_VERSIONS,validateCombinedGeneration} from './combined.mjs';
import {STITCH_VERSIONS,validateStitchGeneration} from './stitch.mjs';
import {STITCH_SOURCE} from './stitch-source.mjs';

export const WEAVE_SOURCE_VERSION='canonical-weave-source-v1';
const optional=['familyCatalog','threadAppearance','interlacing'];
const required=['boundary','sourceRevisionId','carrier','carrierSourceRevisionId','weave'];
function keys(value,required,optional=[]){
 if(!value||typeof value!=='object'||Array.isArray(value)||required.some(k=>!Object.hasOwn(value,k))||Object.keys(value).some(k=>!required.includes(k)&&!optional.includes(k)))throw Error('Invalid canonical weave source keys.');
}
function identity(value,nullable=false){if(nullable&&value===null)return;if(typeof value!=='string'||!value||value.length>120)throw Error('Invalid canonical source identity.');}

// The schema-6 working envelope remains the wire adapter. Never persist a second
// source beside it. Its derived member is a replaceable compatibility cache.
// sourceContext.snapshot is immutable historical provenance, NOT the current
// editable recipe. Current geometry uses working.boundary/carrier exclusively.
export function readWeaveSource(working,projectId){
 keys(working,required,optional);
 const sourceWorking={...working};
 if(working.weave){const {derived,...decisions}=working.weave;sourceWorking.weave=decisions;}
 const source=structuredClone({version:WEAVE_SOURCE_VERSION,projectId,working:sourceWorking});
 validateWeaveSource(source);return source;
}
export function validateWeaveSource(source){
 keys(source,['version','projectId','working']);
 if(source.version!==WEAVE_SOURCE_VERSION)throw Error('Unsupported canonical weave source version.');
 identity(source.projectId);const w=source.working;keys(w,required,optional);
 identity(w.sourceRevisionId,true);identity(w.carrierSourceRevisionId,true);
 validateBoundaryRecord(w.boundary);if(w.carrier!==null)validateCarrierRecipe(w.carrier);
 validateFamilyCatalog(w.familyCatalog,w.carrier);validateThreadAppearance(w.threadAppearance);validateInterlacing(w.interlacing);
 if(w.weave!==null){
  keys(w.weave,['studyId','sourceName','sourceContext','originLineage'],['weaveVersion','generation']);
  identity(w.weave.studyId);if(!w.carrier)throw Error('Canonical weave requires a recipe.');
  const version=w.weave.weaveVersion||'weave-study-v1';
  if(version==='weave-study-v1'){if('generation' in w.weave||'weaveVersion' in w.weave)throw Error('Invalid legacy identity source.');}
  else if(version===ATTRACTOR_VERSIONS.study)validateGeneration(w.weave.generation);
  else if([INFLUENCE_VERSIONS.study,FAMILY_INFLUENCE_VERSIONS.study].includes(version))validateInfluenceGeneration(w.weave.generation);
  else if(version===COMBINED_VERSIONS.study)validateCombinedGeneration(w.weave.generation);
  else if(version===STITCH_VERSIONS.study)validateStitchGeneration(w.weave.generation,w.carrier.roles);
  else throw Error('Unsupported canonical weave algorithm version.');
  if((w.carrier.kind===STITCH_SOURCE)!==(version===STITCH_VERSIONS.study))throw Error('Canonical recipe and algorithm do not match.');
  if(typeof w.weave.sourceName!=='string'||w.weave.sourceName.length>80)throw Error('Invalid canonical source name.');
  const c=w.weave.sourceContext;keys(c,['sourceBoardId','sourceCarrierRevisionId','parameterizationVersion','snapshot']);
  if(c.parameterizationVersion!==(version===STITCH_VERSIONS.study?STITCH_VERSIONS.parameterization:'rect-distance-v1'))throw Error('Unsupported canonical parameterization.');
  identity(c.sourceCarrierRevisionId);if(c.sourceBoardId!==source.projectId||c.snapshot?.id!==c.sourceCarrierRevisionId||c.snapshot?.carrier?.id!==w.carrier.id)throw Error('Canonical source provenance does not match.');
  if(!Array.isArray(w.weave.originLineage)||w.weave.originLineage.length>100)throw Error('Invalid canonical source lineage.');
  for(const origin of w.weave.originLineage){keys(origin,['boardId','sourceCarrierRevisionId']);identity(origin.boardId);if(origin.sourceCarrierRevisionId!==c.sourceCarrierRevisionId)throw Error('Invalid canonical source lineage.');}
 }
 return source;
}
// Supply only independently calculated/verified geometry here; no serialized
// cache is accepted as an input to canonical source regeneration.
export function materializeWeaveSource(source,derived=null){
 validateWeaveSource(source);const working=structuredClone(source.working);
 if(working.weave)working.weave.derived=derived;
 return working;
}
export function weaveCalculationInput(source){
 validateWeaveSource(source);const {boundary,carrier,weave}=source.working;
 if(!weave)throw Error('Canonical source has no applied weave.');
 return structuredClone({boundary,carrier,sourceContext:weave.sourceContext,...('generation' in weave?{generation:weave.generation}:{})});
}
