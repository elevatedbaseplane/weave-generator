const SOURCE_KEYS=['sourceLattice','originalGrid','weaveSource'];

export function applyDisplayPreset(display,name){
  if(!display||typeof display!=='object')throw Error('Display state is required.');
  const next={...display};
  if(name==='derived-only'){
    for(const key of SOURCE_KEYS)next[key]=false;
    next.weaveDerived=true;
  }else if(name==='compare'){
    next.sourceLattice=false;next.originalGrid=true;next.weaveSource=false;next.weaveDerived=true;
  }else if(name==='construction'){
    next.sourceLattice=true;next.originalGrid=true;next.weaveSource=false;next.weaveDerived=false;
  }else throw Error('Unknown display preset.');
  return next;
}

export function displayPresetName(display){
  if(!display||typeof display!=='object')return'custom';
  if(SOURCE_KEYS.every(key=>display[key]===false)&&display.weaveDerived===true)return'derived-only';
  if(display.sourceLattice===false&&display.originalGrid===true&&display.weaveSource===false&&display.weaveDerived===true)return'compare';
  if(display.sourceLattice===true&&display.originalGrid===true&&display.weaveSource===false&&display.weaveDerived===false)return'construction';
  return'custom';
}
