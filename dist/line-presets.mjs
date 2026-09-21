import {createRectangularCarrier,validateCarrierRecipe} from './carrier.mjs';
// Presets are copied parameter values, never shared mutable source objects.
export const LINE_PRESETS=Object.freeze({
 'square-grid':Object.freeze({label:'Square grid',angles:Object.freeze([0,90]),spacing:50}),
 'diamond-grid':Object.freeze({label:'Diamond grid',angles:Object.freeze([45,-45]),spacing:50}),
 'triangular-grid':Object.freeze({label:'Triangular grid',angles:Object.freeze([0,60,120]),spacing:60})
});
export function createLinePreset(id,carrierId){
 const preset=LINE_PRESETS[id];if(!preset)throw Error('Unknown line pattern preset.');
 const source=createRectangularCarrier(carrierId);source.generatorVersion='rect-v2';delete source.angleDegrees;
 source.families=Object.fromEntries(preset.angles.map((angleDegrees,i)=>[String.fromCharCode(65+i),{spacing:preset.spacing,offset:0,density:100,angleDegrees}]));
 return validateCarrierRecipe(source);
}
