import {clone,findCarrierRevision,validateTrustedWorkspace} from './document.mjs';
import {canonical} from './weave.mjs';

// Repair only exact source snapshots omitted by the former incremental writer.
// Never manufacture missing ancestry or alter stored geometry/certificates.
export function recoverCarrierAncestry(workspace,history=[]){
 const repaired=clone(workspace);let count=0;
 for(const project of repaired.projects){
  const workings=[project.working,...project.weaveStudies.flatMap(e=>e.revisions.map(r=>r.working))];
  const candidates=new Map(),needed=new Set(workings.map(w=>w.carrierSourceRevisionId).filter(Boolean));
  for(const old of history)for(const p of old.projects||[])if(p.id===project.id&&p.working?.weave)workings.push(p.working);
  for(const working of workings){const c=working.weave?.sourceContext;if(!c)continue;
   if(c.sourceBoardId!==project.id||c.snapshot?.id!==c.sourceCarrierRevisionId)throw Error('Recovery source identity mismatch.');
   const prior=candidates.get(c.snapshot.id);if(prior&&canonical(prior)!==canonical(c.snapshot))throw Error('Conflicting recovery source snapshots.');
   candidates.set(c.snapshot.id,c.snapshot);
  }
  for(const id of needed){let snapshot=candidates.get(id);const seen=new Set();while(snapshot&&!findCarrierRevision(project,snapshot.id)&&!seen.has(snapshot.id)){seen.add(snapshot.id);needed.add(snapshot.id);snapshot=candidates.get(snapshot.parentRevisionId);}}
  for(const snapshot of [...candidates.values()].filter(s=>needed.has(s.id)).sort((a,b)=>a.number-b.number)){
   const found=findCarrierRevision(project,snapshot.id);if(found){if(canonical(found.revision)!==canonical(snapshot))throw Error('Recovery source conflicts with saved revision.');continue;}
   const parent=findCarrierRevision(project,snapshot.parentRevisionId);
   if(!parent||parent.entry.latestRevisionId!==snapshot.parentRevisionId||snapshot.number!==parent.entry.revisions.length+1)throw Error('Exact recovery ancestry is incomplete; saved data remains untouched.');
   parent.entry.revisions.push(clone(snapshot));parent.entry.latestRevisionId=snapshot.id;count++;
  }
 }
 validateTrustedWorkspace(repaired);
 return {workspace:repaired,count};
}
