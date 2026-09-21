// Typed entries commit on Enter or blur, never on partial keystrokes. The existing
// range handlers remain the one editing/save path for both kinds of input.
export function parseSliderNumber(text,min,max,step){
 if(typeof text!=='string'||!text.trim())throw Error('Enter a number.');
 const n=Number(text),lo=Number(min),hi=Number(max),inc=step==='any'?0:Number(step||1);
 if(!Number.isFinite(n)||n<lo||n>hi)throw Error(`Enter a value from ${lo} to ${hi}.`);
 if(inc>0&&Math.abs((n-lo)/inc-Math.round((n-lo)/inc))>1e-7)throw Error(`Use increments of ${inc} from ${lo}.`);
 return n;
}
// A typed value must survive any synchronous preview redraw caused by the
// input event. Consumers read this captured value instead of consulting a
// range element that may already have been restored from committed state.
export function sliderEventNumber(event,range){
 const captured=event?.detail?.sliderValue;
 return Number(captured===undefined?range.value:captured);
}
export function dispatchSliderCommit(range,value){
 const detail={sliderValue:value,source:'typed-number'};
 range.value=String(value);
 range.dispatchEvent(new CustomEvent('input',{bubbles:true,detail}));
 range.value=String(value);
 range.dispatchEvent(new CustomEvent('change',{bubbles:true,detail}));
}
export function installNumericInputs(root=document){
 const paired=new WeakMap();let serial=0,scheduled=false;
 function sync(){scheduled=false;for(const range of root.querySelectorAll('input[type="range"]')){
  if(range.hidden)continue;const row=range.closest('label')||range.parentElement;let number=paired.get(range);
  if(!number){number=document.createElement('input');number.type='number';number.className='slider-number';if(!range.id)range.id='numeric-slider-'+(++serial);number.id=range.id+'-typed';number.dataset.sliderFor=range.id;number.setAttribute('aria-label',(range.getAttribute('aria-label')||row.querySelector('span')?.textContent||range.id)+' number');const out=row.querySelector('output');if(out)out.classList.add('numeric-pair-output');range.before(number);paired.set(range,number);
   const restore=()=>{number.value=range.value;number.setCustomValidity('');};
   const commit=()=>{if(number.disabled)return;if(number.value===range.value){number.setCustomValidity('');return;}try{const value=parseSliderNumber(number.value,range.min||'0',range.max||'100',range.step);number.setCustomValidity('');dispatchSliderCommit(range,value);schedule();}catch(error){number.setCustomValidity(error.message);number.reportValidity();}};
   number.addEventListener('change',commit);number.addEventListener('input',()=>number.setCustomValidity(''));
   number.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();commit();}if(e.key==='Escape'){e.preventDefault();restore();number.blur();}});
   range.addEventListener('input',()=>{number.value=range.value;number.setCustomValidity('');});
  }
  for(const name of ['min','max','step']){const value=range.getAttribute(name)||({min:'0',max:'100',step:'1'})[name];if(number.getAttribute(name)!==value)number.setAttribute(name,value);}
  if(number.disabled!==range.disabled)number.disabled=range.disabled;
  if(document.activeElement!==number&&number.value!==range.value)number.value=range.value;
 }}
 function schedule(){if(!scheduled){scheduled=true;queueMicrotask(sync);}}
 const observer=new MutationObserver(schedule);observer.observe(root,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['min','max','step','disabled','hidden','value']});sync();return {sync,disconnect:()=>observer.disconnect()};
}
