// Editing scope only: persisted response values keep their existing schema.
export function influenceResponseChanges(field,family,linked,changed,values){
 const key=changed==='attractor-strength'?'strength':changed==='attractor-tension'?'tension':null;
 if(!key)return {};
 const value={[key]:values[key]};
 return linked&&field.families?{families:Object.fromEntries(Object.keys(field.families).map(name=>[name,{...value}]))}:{family,familySettings:value};
}
