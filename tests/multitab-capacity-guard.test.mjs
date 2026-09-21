import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const app=fs.readFileSync(new URL('../dist/app.mjs',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
const storage=fs.readFileSync(new URL('../dist/storage.mjs',import.meta.url),'utf8');

test('field commits check the authoritative IndexedDB head before backup admission',()=>{
  const commit=app.slice(app.indexOf("worker.onmessage=async e=>"),app.indexOf("async function certifyWorking"));
  const freshness=commit.indexOf('await store.assertCurrent()');
  const admission=commit.indexOf('prepareIncrementalWorkspace(');
  assert.ok(freshness>=0,'missing freshness check');
  assert.ok(admission>freshness,'backup admission must follow the authoritative head check');
  assert.match(storage,/async assertCurrent\(\)/);
  assert.match(storage,/Another tab saved a newer workspace\. Reload this tab to continue from the latest saved version\./);
});

test('all non-worker saves also check freshness before packing',()=>{
  const persist=app.slice(app.indexOf('async function persist('),app.indexOf('function deriveWorking('));
  assert.ok(persist.indexOf('await store.assertCurrent()')<persist.indexOf('prepareStorage('));
});

test('a stale tab exposes one clear reload action instead of a capacity message',()=>{
  assert.match(html,/id="reload-latest" hidden>RELOAD LATEST SAVED WORKSPACE/);
  assert.match(app,/\['concurrent-change','storage-open','storage-blocked'\]\.includes\(error\?\.code\)/);
  assert.match(app,/\$\('reload-latest'\)\.hidden=false/);
  assert.match(app,/\$\('reload-latest'\)\.onclick=\(\)=>location\.reload\(\)/);
  // Build names are not behavior. Exercise the real error adapter for each
  // stale-connection code, and ensure ordinary capacity failures stay distinct.
  const source=app.slice(app.indexOf('function surfaceError('),app.indexOf('function setEditFeedback('));
  for(const code of ['concurrent-change','storage-open','storage-blocked','backup-capacity']){
    const nodes={'field-section':{open:false},'reload-latest':{hidden:true},'project-section':{open:false}},messages=[];
    const context={$:id=>nodes[id],status:message=>messages.push(message),setEditFeedback(){}};
    vm.createContext(context);vm.runInContext(source,context);
    context.surfaceError({code,message:code+' detail'});
    assert.equal(nodes['reload-latest'].hidden,code==='backup-capacity');
    assert.equal(nodes['project-section'].open,code!=='backup-capacity');
    assert.deepEqual(messages,[code+' detail']);
  }
});

test('the current build invalidates older live IndexedDB writers without changing stores',()=>{
  assert.match(storage,/DB_NAME='weave-foundation-v1',DB_VERSION=2/);
  assert.match(storage,/this\.db\.onversionchange=\(\)=>\{this\.blocked=true;this\.db\.close\(\);this\.db=null;\}/);
  assert.match(app,/\['concurrent-change','storage-open','storage-blocked'\]/);
});
