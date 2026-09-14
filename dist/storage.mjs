import {createWorkspace,validateWorkspace} from './document.mjs';
export const STORE_KEY='weave-foundation-workspace-v2';
export const RECOVERY_KEY=`${STORE_KEY}-previous`;
export class LocalStore {
  constructor(storage){this.storage=storage;this.lastRaw=null;this.blocked=false;}
  load(){
    try {
      this.lastRaw=this.storage.getItem(STORE_KEY);
      return this.lastRaw===null?createWorkspace():validateWorkspace(JSON.parse(this.lastRaw));
    } catch(error) {this.blocked=true;throw new Error('Saved data could not be opened. It has been left untouched. Download the raw recovery copy before repairing it.');}
  }
  save(workspace){
    validateWorkspace(workspace);
    if(this.blocked)throw new Error('Saving is paused to protect unreadable data. Download raw recovery; use another browser for a new workspace.');
    const current=this.storage.getItem(STORE_KEY);
    if(current!==this.lastRaw)throw new Error('Another tab changed this workspace. Download your current backup, then reload to reconcile changes.');
    const text=JSON.stringify(workspace);
    try {
      if(this.lastRaw!==null)this.storage.setItem(RECOVERY_KEY,this.lastRaw);
      this.storage.setItem(STORE_KEY,text);
    } catch {throw new Error('Browser storage is unavailable or full. Your last saved workspace is intact. Download a project backup.');}
    this.lastRaw=text;
  }
  raw(){return this.lastRaw??'';}
}
