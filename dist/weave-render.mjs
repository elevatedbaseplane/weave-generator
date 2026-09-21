export function derivedFamilyPaths(strands,transform=point=>point){
 const records=[];
 for(const family of [...new Set(strands.map(s=>s.family||s.identity?.roleId))]){
  const commands=[];let fragments=0,segments=0,points=0;
  for(const strand of strands){if((strand.family||strand.identity?.roleId)!==family)continue;for(const fragment of strand.fragments){if(!Array.isArray(fragment.points)||fragment.points.length<2)continue;const first=transform(fragment.points[0]);commands.push(`M${first.x} ${first.y}`);points++;fragments++;for(let i=1;i<fragment.points.length;i++){const point=transform(fragment.points[i]);commands.push(`L${point.x} ${point.y}`);points++;segments++;}}}
  if(commands.length)records.push({family,d:commands.join(' '),fragments,segments,points});
 }
 return records;
}
