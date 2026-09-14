export const defaults=()=>[{id:'a',visible:true,density:10,tension:40},{id:'b',visible:true,density:10,tension:40}];
export function select(paths,family,index){if(!family.visible)return[];const members=paths.filter((_,i)=>i%2===index),step=Math.max(1,Math.ceil(10/family.density));return members.filter((_,i)=>i%step===0)}
