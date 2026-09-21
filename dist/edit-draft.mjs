// Certified geometry and saved revisions are immutable. Copy only editable
// metadata; callers replace derived results, never mutate them in place.
export function copyWorkingForEdit(working) {
 const derived=working.weave?.derived;
 const copy=structuredClone({...working,...(working.weave?{weave:{...working.weave,derived:null}}:{})});
 if(copy.weave)copy.weave.derived=derived;
 return copy;
}
export function copyProjectForEdit(project) {
 return {...project,working:copyWorkingForEdit(project.working),
  boundaries:project.boundaries.map(entry=>({...entry,revisions:[...entry.revisions]})),
  carrierStudies:project.carrierStudies.map(entry=>({...entry,revisions:[...entry.revisions]})),
  weaveStudies:project.weaveStudies.map(entry=>({...entry,revisions:[...entry.revisions]}))};
}
