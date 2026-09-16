import fs from 'node:fs';
import os from 'node:os';
import {createWorkspace,saveCarrierStudy,createWeaveStudy,saveWeaveStudy,validateWorkspace,serializeWorkspace,parseBackup,restoreWeaveStudy} from '../dist/document.mjs';
import {createRectangularCarrier} from '../dist/carrier.mjs';
import {refreshWeave} from '../dist/weave.mjs';
import {LocalStore} from '../dist/storage.mjs';
let w=createWorkspace();w.projects[0].working.carrier=createRectangularCarrier();w.projects[0]=saveCarrierStudy(w.projects[0],'SOURCE').project;w.projects[0]=createWeaveStudy(w.projects[0],w.projects[0].carrierStudies[0].latestRevisionId);
for(let i=0;i<5;i++){w.projects[0].working.carrier.families.A.spacing=50+i;w.projects[0].working=refreshWeave(w.projects[0].working,w.projects[0].id);w.projects[0]=saveWeaveStudy(w.projects[0],'FIVE REVISIONS').project;}
const memory=new Map(),store=new LocalStore({getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v)});store.load();
const json=serializeWorkspace(w),operations={validate:()=>validateWorkspace(w),save:()=>store.save(w),backup:()=>serializeWorkspace(w),parse:()=>parseBackup(json),restore:()=>{const p=restoreWeaveStudy(w.projects[0],w.projects[0].weaveStudies[0].revisions[0].id);validateWorkspace({...w,projects:[p]});}};
const result={build:'WF-R1A-20260916',node:process.version,platform:os.platform(),cpu:os.cpus()[0].model,revisions:5,backupCodeUnits:json.length,operations:{}};
for(const [name,op] of Object.entries(operations)){op();op();const times=[];for(let i=0;i<30;i++){const start=performance.now();op();times.push(performance.now()-start);}times.sort((a,b)=>a-b);result.operations[name]={runs:30,p50:times[15],p95:times[28],max:times[29]};}
fs.mkdirSync('verification/local-r1a',{recursive:true});fs.writeFileSync('verification/local-r1a/storage-benchmark.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
