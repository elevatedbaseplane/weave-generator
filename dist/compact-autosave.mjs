export class CompactAutosave {
  constructor({persist,delay=180,onState=()=>{},setTimer=setTimeout,clearTimer=clearTimeout}){
    if(typeof persist!=='function')throw new Error('Compact autosave needs a persistence function.');
    this.persist=persist;this.delay=delay;this.onState=onState;this.setTimer=(fn,ms)=>setTimer(fn,ms);this.clearTimer=id=>clearTimer(id);
    this.sequence=0;this.savedSequence=0;this.queued=null;this.running=null;this.timer=null;this.lastFailure=null;
  }
  accept(value,meta={}){
    const item={sequence:++this.sequence,value,meta,acceptedAt:Date.now()};
    this.queued=item;this.lastFailure=null;this.#arm();this.onState({state:'pending',item});return item.sequence;
  }
  #arm(delay=this.delay){if(this.timer!==null)this.clearTimer(this.timer);this.timer=this.setTimer(()=>{this.timer=null;void this.#drain();},delay);}
  async #drain(){
    if(this.running||!this.queued)return;
    const item=this.queued;this.queued=null;this.running=item;this.onState({state:'saving',item});
    try{await this.persist(item.value,item);this.savedSequence=item.sequence;this.lastFailure=null;this.onState({state:'saved',item,queued:this.queued});}
    catch(error){this.lastFailure={item,error};this.onState({state:'failed',item,error,queued:this.queued});}
    finally{this.running=null;if(this.queued)this.#arm(Math.max(0,this.delay-(Date.now()-this.queued.acceptedAt)));}
  }
  async flush(){
    if(this.timer!==null){this.clearTimer(this.timer);this.timer=null;}
    while(this.running)await new Promise(resolve=>this.setTimer(resolve,0));
    if(!this.queued&&this.lastFailure)this.queued=this.lastFailure.item;
    await this.#drain();
    while(this.running)await new Promise(resolve=>this.setTimer(resolve,0));
    return {sequence:this.sequence,savedSequence:this.savedSequence,failure:this.lastFailure?.error||null};
  }
  async settle(){
    if(this.timer!==null){this.clearTimer(this.timer);this.timer=null;}
    while(this.running)await new Promise(resolve=>this.setTimer(resolve,0));
    if(this.timer!==null){this.clearTimer(this.timer);this.timer=null;}
    this.queued=null;this.lastFailure=null;
  }
  state(){return{sequence:this.sequence,savedSequence:this.savedSequence,pending:Boolean(this.queued),saving:Boolean(this.running),failed:Boolean(this.lastFailure),timer:Boolean(this.timer!==null)};}
}
