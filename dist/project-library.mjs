const copy=value=>structuredClone(value);

export function boundaryEntryForRevision(project,revisionId=project.working.sourceRevisionId){
  return project.boundaries.find(entry=>entry.revisions.some(revision=>revision.id===revisionId))||null;
}

export function weaveResultForPattern(project,pattern){
  const revisionIds=new Set(pattern.revisions.map(revision=>revision.id));
  return project.weaveStudies
    .filter(entry=>entry.revisions.some(revision=>revisionIds.has(revision.working.weave.sourceContext.sourceCarrierRevisionId)))
    .sort((left,right)=>String(left.revisions.at(-1).createdAt).localeCompare(String(right.revisions.at(-1).createdAt)))
    .at(-1)||null;
}

export function patternsForBoundary(project,boundary){
  if(!boundary)return [];
  const revisionIds=new Set(boundary.revisions.map(revision=>revision.id));
  return project.carrierStudies.filter(pattern=>pattern.revisions.some(revision=>revisionIds.has(revision.boundarySourceRevisionId)));
}

export function activeLibraryItems(project){
  const boundary=boundaryEntryForRevision(project);
  const available=new Set(patternsForBoundary(project,boundary).map(entry=>entry.id));
  const pattern=project.carrierStudies.find(entry=>available.has(entry.id)&&entry.revisions.some(revision=>revision.id===project.working.carrierSourceRevisionId))||null;
  return {boundary,pattern};
}

function mapPoint(point,source,target){
  const sx=source.maxX-source.minX||1,sy=source.maxY-source.minY||1;
  return {x:target.minX+(point.x-source.minX)/sx*(target.maxX-target.minX),y:target.minY+(point.y-source.minY)/sy*(target.maxY-target.minY)};
}

export function adaptGenerationToBoundary(generation,sourceBounds,targetBounds){
  const next=copy(generation),scale=Math.max(targetBounds.maxX-targetBounds.minX,targetBounds.maxY-targetBounds.minY)/Math.max(sourceBounds.maxX-sourceBounds.minX,sourceBounds.maxY-sourceBounds.minY,1);
  const adapt=influence=>{
    if(!influence||!Number.isFinite(influence.x)||!Number.isFinite(influence.y))return;
    const point=mapPoint(influence,sourceBounds,targetBounds);influence.x=point.x;influence.y=point.y;
    if(Number.isFinite(influence.radius))influence.radius*=scale;
    if(Number.isFinite(influence.extent))influence.extent*=scale;
  };
  if(Array.isArray(next.influences))next.influences.forEach(adapt);
  adapt(next.influence);adapt(next.attractor);
  return next;
}
