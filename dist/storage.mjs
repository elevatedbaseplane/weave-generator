import {createWorkspace,normalizeWorkspace,validateWorkspace,backupText} from './document.mjs';
export const STORE_KEY='weave-foundation-workspace-v2';
export const RECOVERY_KEY=`${STORE_KEY}-previous`;
export const SCHEMA2_RECOVERY_KEY=`${STORE_KEY}-schema2-original`;
export const SCHEMA3_RECOVERY_KEY=`${STORE_KEY}-schema3-original`;
export class LocalStore{
  constructor(storage){this.storage=storage;this.lastRaw=null;this.blocked=false;this.schema2Raw=null;this.schema3Raw=null;}
  load(){try{this.lastRaw=this.storage.getItem(STORE_KEY);if(this.lastRaw===null)return createWorkspace();const parsed=JSON.parse(this.lastRaw);if(parsed?.schemaVersion===2)this.schema2Raw=this.lastRaw;if(parsed?.schemaVersion===3)this.schema3Raw=this.lastRaw;return normalizeWorkspace(parsed);}catch{this.blocked=true;throw new Error('Saved data could not be opened. It has been left untouched. Download the raw recovery copy before repairing it.');}}
  save(workspace){validateWorkspace(workspace);backupText(workspace);if(this.blocked)throw new Error('Saving is paused to protect unreadable data. Download raw recovery; use another browser for a new workspace.');const current=this.storage.getItem(STORE_KEY);if(current!==this.lastRaw)throw new Error('Another tab changed this workspace. Download your current backup, then reload to reconcile changes.');const text=JSON.stringify(workspace);try{if(this.schema3Raw!==null&&this.storage.getItem(SCHEMA3_RECOVERY_KEY)===null)this.storage.setItem(SCHEMA3_RECOVERY_KEY,this.schema3Raw);if(this.schema2Raw!==null&&this.storage.getItem(SCHEMA2_RECOVERY_KEY)===null)this.storage.setItem(SCHEMA2_RECOVERY_KEY,this.schema2Raw);if(this.lastRaw!==null)this.storage.setItem(RECOVERY_KEY,this.lastRaw);this.storage.setItem(STORE_KEY,text);}catch{throw new Error('Browser storage is unavailable or full. Your last saved workspace is intact. Download a project backup.');}this.lastRaw=text;this.schema2Raw=null;this.schema3Raw=null;}
  raw(){return this.lastRaw??'';}
}
