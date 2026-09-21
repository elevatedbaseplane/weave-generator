// Identical binary64 outward rounding, isolated from legacy module cycles.
const ab=new ArrayBuffer(8),dv=new DataView(ab);
export function nextUp(x){if(Number.isNaN(x)||x===Infinity)return x;if(Object.is(x,-0))x=0;if(x===0)return Number.MIN_VALUE;dv.setFloat64(0,x);let b=dv.getBigUint64(0);b+=x>0?1n:-1n;dv.setBigUint64(0,b);return dv.getFloat64(0);}
export function nextDown(x){if(Number.isNaN(x)||x===-Infinity)return x;if(Object.is(x,0))return -Number.MIN_VALUE;dv.setFloat64(0,x);let b=dv.getBigUint64(0);b+=x>0?-1n:1n;dv.setBigUint64(0,b);return dv.getFloat64(0);}
