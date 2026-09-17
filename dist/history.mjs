import {clone} from './document.mjs';
// Saved revision libraries are append-only; undo acts on the working document.
export class History {
  past=[];future=[];
  record(before,after){if(JSON.stringify(before)===JSON.stringify(after))return;this.past.push(clone(before));if(this.past.length>100)this.past.shift();this.future=[];}
  recordImmutable(before){this.past.push(before);if(this.past.length>100)this.past.shift();this.future=[];}
  undoImmutable(current){if(!this.past.length)return current;this.future.push(current);return this.past.pop();}
  redoImmutable(current){if(!this.future.length)return current;this.past.push(current);return this.future.pop();}
  undo(current){if(!this.past.length)return current;this.future.push(clone(current));return this.past.pop();}
  redo(current){if(!this.future.length)return current;this.past.push(clone(current));return this.future.pop();}
}
