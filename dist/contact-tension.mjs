export const CONTACT_TENSION_DEFAULT=Object.freeze({enabled:false,base:100,adaptive:60});

export function validateContactTension(value){
 if(!value||Object.keys(value).sort().join(',')!=='adaptive,base,enabled'||typeof value.enabled!=='boolean'||!Number.isInteger(value.base)||value.base<0||value.base>100||!Number.isInteger(value.adaptive)||value.adaptive<0||value.adaptive>100)throw Error('Invalid contact tension.');
 return value;
}

export function effectiveContactTension(settings){
 return settings?.version==='interlacing-v4'?validateContactTension(settings.contact):CONTACT_TENSION_DEFAULT;
}

const clamp=value=>Math.max(0,Math.min(1,value));
export function adaptiveContactReach(baseReach,threadWidth,metrics,contact){
 validateContactTension(contact);
 if(!contact.enabled)return baseReach;
 const nearest=Number.isFinite(metrics.nearest)?metrics.nearest:Infinity;
 const proximity=Number.isFinite(nearest)?clamp(1-nearest/(baseReach*4||1)):0;
 const pressure=clamp(.35*proximity+.25*clamp(1-metrics.sin)+.25*clamp(metrics.curvature)+.15*clamp(metrics.neighborCount/2));
 const effective=Math.min(100,contact.base+contact.adaptive*pressure*(100-contact.base)/100);
 const desired=baseReach+threadWidth*1.5*(1-effective/100);
 const room=Number.isFinite(nearest)?Math.max(0,nearest/2-baseReach):Infinity;
 return baseReach+Math.min(desired-baseReach,room);
}
