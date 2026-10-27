const DB_NAME='weave-source-image-v1',STORE='images';

function openDatabase(){
 return new Promise((resolve,reject)=>{
  const request=indexedDB.open(DB_NAME,1);
  request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains(STORE))request.result.createObjectStore(STORE,{keyPath:'projectId'});};
  request.onerror=()=>reject(request.error||Error('The source image store could not be opened.'));
  request.onsuccess=()=>resolve(request.result);
 });
}

function requestResult(request){return new Promise((resolve,reject)=>{request.onsuccess=()=>resolve(request.result??null);request.onerror=()=>reject(request.error);});}

export async function readSourceImage(projectId){
 const db=await openDatabase(),tx=db.transaction(STORE,'readonly');
 try{return await requestResult(tx.objectStore(STORE).get(projectId));}
 finally{db.close();}
}

export async function writeSourceImage(record){
 if(!record?.projectId||!(record.blob instanceof Blob))throw Error('The source image record is incomplete.');
 const db=await openDatabase(),tx=db.transaction(STORE,'readwrite');
 try{await requestResult(tx.objectStore(STORE).put(record));}
 finally{db.close();}
}

export async function deleteSourceImage(projectId){
 const db=await openDatabase(),tx=db.transaction(STORE,'readwrite');
 try{await requestResult(tx.objectStore(STORE).delete(projectId));}
 finally{db.close();}
}
