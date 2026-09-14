import {clone} from './document.mjs';
// Saved revision libraries are append-only; undo acts on the working document.
export class History {
  past=[];future=[];
  record(before,after){if(JSON.stringify(before)===JSON.stringify(after))return;this.past.push(clone(before));if(this.past.length>100)this.past.shift();this.future=[];}
  undo(current){if(!this.past.length)return current;this.future.push(clone(current));return this.past.pop();}
  redo(current){if(!this.future.length)return current;this.past.push(clone(current));return this.future.pop();}
}
