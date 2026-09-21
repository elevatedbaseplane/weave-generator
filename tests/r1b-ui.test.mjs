import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html=fs.readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
const app=fs.readFileSync(new URL('../dist/app.mjs',import.meta.url),'utf8');

test('R1D shell has current labels and build identity',()=>{
  assert.doesNotMatch(html,/R1A|WF-R1A/);
  assert.match(html,/FIELDS \/ R1D/);
  assert.match(html,/WF-R1D-ANCESTRY-REPAIR-20260917/);
  assert.match(app,/BUILD='WF-R1D-ANCESTRY-REPAIR-20260917'/);
});

test('Add Influence follows Weave Pattern directly and creates its result automatically',()=>{
  const controls=html.slice(html.indexOf('<details id="field-section"'),html.indexOf('<details><summary>DISPLAY'));
  assert.ok(controls.indexOf('id="add-attractor"')<controls.indexOf('id="show-weave-source"'));
  assert.match(controls,/INFLUENCE FIELD/);
  assert.match(controls,/class="primary">ADD INFLUENCE/);
  assert.match(controls,/Influenced Grid is created, calculated, and saved automatically/);
  assert.doesNotMatch(html,/<details id="weave-section"/);
  assert.match(app,/\$\('attractor-prompt'\)\.hidden=fields\.length>0/);
  assert.match(app,/patternReady=Boolean/);
});

test('one discoverable selector exposes all R1C influence types and deflector direction',()=>{
  const controls=html.slice(html.indexOf('id="attractor-controls"'),html.indexOf('<details><summary>DISPLAY'));
  assert.match(controls,/id="influence-type"/);
  for(const kind of ['ATTRACTOR','REPELLER','DEFLECTOR'])assert.ok(controls.includes(kind),kind);
  assert.match(controls,/id="influence-direction"[^>]*hidden/);
  assert.match(controls,/id="influence-direction-range"[^>]*type="range"/);
  assert.match(controls,/id="influence-direction-value"/);
  assert.match(app,/'data-attractor-handle':'direction'/);
});

test('all visible numeric editing uses sliders with value readouts',()=>{
  assert.doesNotMatch(html,/<input(?![^>]*hidden)[^>]*type="number"/);
  for(const id of ['square-size','attractor-radius','attractor-strength','attractor-tension','influence-direction','family-spacing','family-angle','family-offset','family-density']){
    assert.match(html,new RegExp(`id="${id}"[^>]*hidden`));
    assert.match(html,new RegExp(`id="${id}-range"[^>]*type="range"`));
    assert.match(html,new RegExp(`id="${id}-value"`));
  }
});

test('vertex editor uses selection and coordinate sliders instead of the raw text box',()=>{
  assert.match(html,/id="vertex-index-range"[^>]*type="range"/);
  assert.match(html,/id="vertex-x-range"[^>]*type="range"/);
  assert.match(html,/id="vertex-y-range"[^>]*type="range"/);
  assert.match(html,/id="coordinates" hidden/);
  assert.match(app,/VERTEX UPDATED\. ONE UNDO RESTORES THE SLIDER MOVE\./);
});

test('explicit enabled action replaces pending work and can dispatch re-enable',()=>{
  assert.match(html,/id="attractor-enabled" type="checkbox" hidden/);
  assert.match(html,/id="toggle-attractor-enabled"[^>]*>DISABLE INFLUENCE/);
  assert.match(app,/const desired=!field\.enabled/);
  assert.match(app,/if\(pending\)cancelPending\('PENDING CHANGE REPLACED BY ENABLED STATE\.'\)/);
  assert.match(app,/INFLUENCE ENABLED AND SAVED/);
  assert.match(app,/enabledAction=true/);
});

test('influence vertical slice exposes direct control automatic saving and visual check',()=>{
  const controls=html.slice(html.indexOf('id="attractor-controls"'),html.indexOf('<details><summary>DISPLAY'));
  for(const text of ['1 ADD · 2 MANIPULATE · 3 SAVED AUTOMATICALLY','ADD INFLUENCE','SHOW ALL INFLUENCE GUIDES','RESET DEFAULTS','QUICK VISUAL CHECK'])assert.ok(controls.includes(text),text);
  assert.match(html,/UNDEFORMED SOURCE WEAVE/);assert.match(html,/DISTORTED DERIVED WEAVE/);
  assert.match(controls,/AUTOMATIC SAVING/);
  assert.match(controls,/COMPLETED FIELD CHANGES SAVE AUTOMATICALLY/);
  assert.match(app,/saveWeaveName/);
  assert.match(controls,/id="attractor-state">READY TO ADD/);
  assert.match(app,/ACTIVE INFLUENCE RESET AND SAVED\./);
  assert.match(app,/function syncAttractorState\(field,count=0\)/);
});

test('right rail follows the settled workflow and keeps deferred stages noninteractive',()=>{
  const rail=html.slice(html.indexOf('<aside id="controls"'),html.indexOf('</aside>',html.indexOf('<aside id="controls"')));
  const headings=['PROJECT / STUDY','BOUNDARY','WEAVE PATTERN','FIELD FORCES','DISPLAY','EXCHANGE + BACKUP'];
  let prior=-1;for(const heading of headings){const at=rail.indexOf(heading);assert.ok(at>prior,heading);prior=at;}
  for(const stage of ['ANALYZE','INTERPRET','EXPORT'])assert.match(rail,new RegExp(`<li>${stage} <em>UPCOMING</em></li>`));
  assert.doesNotMatch(rail,/(EXTRACT|SYNTHESIZE|POINT EXTRACTION|POLYLINE COMPOSER)/);
  assert.doesNotMatch(rail,/<button[^>]*>\s*(ANALYZE|INTERPRET)/);
});

test('reference shell exposes header actions workflow strip and paired drafting sliders',()=>{
  assert.match(html,/B\.A\.C: WEAVE GENERATOR\.\.\.\.\. V02/);
  assert.match(html,/id="toggle-boards"[\s\S]*id="new-board"[\s\S]*id="toggle-controls"/);
  assert.match(html,/class="stage-tab active"><b>01<\/b> WEAVE FIELD/);
  assert.equal((html.match(/class="stage-tab(?:\s|")/g)||[]).length,1);
  assert.doesNotMatch(html,/(POINT EXTRACTION|POLYLINE COMPOSER|EXTRACT → SYNTHESIZE)/);
  const css=fs.readFileSync(new URL('../dist/style.css',import.meta.url),'utf8');
  assert.match(css,/\.slider-label output\{display:block;border:1px solid var\(--ink\)/);
  assert.match(css,/\.model-slider\{appearance:none/);
  assert.match(app,/VIEW_KEY='weave-foundation-view-v2'/);
});

test('display modes canvas legend and adjustable certified falloff are visible and functional',()=>{
  for(const theme of ['light','dark','neo'])assert.ok((html.match(new RegExp(`data-theme="${theme}"`,'g'))||[]).length>=2,theme);
  for(const id of ['canvas-legend','legend-source-count','legend-derived-count','legend-guide-state'])assert.match(html,new RegExp(`id="${id}"`));
  assert.match(html,/id="attractor-falloff"[^>]*hidden/);
  assert.match(html,/id="attractor-falloff-range"[^>]*type="range"[^>]*min="1"[^>]*max="5"/);
  assert.match(html,/id="attractor-falloff-value"/);
  assert.match(app,/syncSlider\('attractor-falloff',field\.falloff\?\?3\)/);
  assert.match(app,/function updateCanvasLegend\(\)/);
  assert.match(app,/display\.theme=b\.dataset\.theme;saveView\(\)/);
});

test('simple creation flow hides redundant Boundary save UI and reveals Pattern geometry before fields',()=>{
  assert.doesNotMatch(html,/SAVE AS|UPDATE BOUNDARY|THE CURRENT NAMED BOUNDARY/);
  assert.match(html,/<div hidden aria-hidden="true"><input id="boundary-name"/);
  assert.match(app,/display\.originalGrid=true;display\.weaveSource=false;display\.weaveDerived=false;display\.attractor=false;saveView\(\)/);
  assert.match(app,/WEAVE PATTERN AND SAVED INFLUENCES OPENED/);
  assert.match(app,/children=project\(\)\.weaveStudies\.filter/);
});

test('Make Square exposes its save result and safely retries one stale-tab conflict',()=>{
  assert.match(html,/id="boundary-action-status"[^>]*aria-live="polite"/);
  assert.match(app,/async function reloadLatestForBoundaryCreate\(boardId\)/);
  assert.match(app,/error\.code!==['"]concurrent-change['"]/);
  assert.match(app,/SYNCING AND RETRYING SAFELY/);
  assert.match(app,/CREATE WEAVE PATTERN IS READY/);
});

test('Original Grid replaces family style toggles and fades only with distortion',()=>{
  assert.match(html,/id="show-original-grid"[^>]*>ORIGINAL GRID/);
  assert.doesNotMatch(html,/DASH SECONDARY FAMILY STYLE|show-family-b-dashes/);
  assert.match(app,/hasVisibleDistortion/);
  const css=fs.readFileSync(new URL('../dist/style.css',import.meta.url),'utf8');
  assert.match(css,/\.carrier-family\{stroke:var\(--muted\);stroke-width:1\.25/);
  assert.match(css,/\.distortion-active #family-a-layer \.carrier-family,\.distortion-active #family-b-layer \.carrier-family\{opacity:\.24\}/);
  assert.match(css,/\.pending-result\{opacity:1\}/);
  assert.doesNotMatch(css,/\.distortion-active \.carrier-family\{opacity:/);
});

test('selected influence is highlighted and blank canvas clicks deselect it',()=>{
  const css=fs.readFileSync(new URL('../dist/style.css',import.meta.url),'utf8');
  assert.match(css,/\.attractor-ring\.active\{stroke-width:3/);
  assert.match(css,/\.attractor-ring\.inactive,[^}]*\{opacity:\.18\}/);
  assert.match(app,/common=\(pending&&active\?' pending':''\)\+\(active\?' active':' inactive'\)/);
  assert.match(app,/function deselectActiveInfluence\(\)/);
  assert.match(app,/document\.querySelector\('\.workspace'\)\.addEventListener\('pointerdown'/);
  assert.match(app,/INFLUENCE DESELECTED\. SELECT A GUIDE OR LIST ITEM TO EDIT IT\./);
});

test('post-influence Pattern gestures preserve the latest candidate and atomically finalize it',()=>{
  assert.match(app,/function recipeFromControls\(owner=transientProject\(\)\)/);
  assert.match(app,/const base=transientProject\(\),carrier=recipeFromControls\(base\)/);
  assert.match(app,/PENDING PATTERN PREVIEW REPLACED BY FINAL PATTERN UPDATE/);
  assert.match(app,/commitPatternCarrier\(carrier,`WEAVE FAMILY \$\{activePatternFamily\} UPDATED, RECLIPPED, AND SAVED\.`,base\)/);
});

test('display presets expose real derived-only compare and construction behavior',()=>{
  for(const [id,label] of [['display-derived-only','DISTORTED ONLY'],['display-compare','SOURCE + DISTORTED'],['display-construction','WEAVE PATTERN SOURCE']])assert.match(html,new RegExp(`id="${id}"[^>]*>${label.replace('+','\\+')}`));
  assert.match(app,/display=applyDisplayPreset\(display,preset\);saveView\(\)/);
  assert.match(app,/\$\('display-derived-only'\)\.disabled=!w/);
  assert.match(html,/DISTORTED ONLY HIDES EVERY UNDERLYING CARRIER AND SOURCE-WEAVE LINE/);
});

test('family-specific force controls and bottom-right display menu are discoverable and live',()=>{
  for(const id of ['influence-family-tabs','family-control-label'])assert.match(html,new RegExp(`id="${id}"`));
  assert.match(html,/STRENGTH AND TENSION APPLY ONLY TO THE SELECTED FAMILY/);
  assert.match(app,/activeInfluenceFamily='A'/);assert.match(app,/familySettings:\{strength:Number/);
  assert.match(html,/class="canvas-display-menu"/);assert.match(html,/data-display-preset="derived-only"/);assert.match(html,/data-display-key="weaveDerived"/);
  assert.match(app,/document\.querySelectorAll\('\[data-display-key\]'\)/);
});

test('R1D exposes a real influence list and deterministic variation controls',()=>{
  const controls=html.slice(html.indexOf('id="attractor-controls"'),html.indexOf('<details id="display-section"'));
  for(const id of ['influence-list','influence-count','add-another-influence','duplicate-influence','variation-family-range','variation-seed-range','new-variation-seed','reset-variation'])assert.match(controls,new RegExp(`id="${id}"`),id);
  assert.match(controls,/0 \/ 8/);assert.match(controls,/DETERMINISTIC PER-STRAND OFFSETS/);
  assert.match(app,/function renderInfluenceList\(weave\)/);
  assert.match(app,/activeInfluenceId=f\.id/);
  assert.match(app,/candidateVariation\(base,\{seed/);
  assert.match(app,/data-influence-id/);
});

test('saved hierarchy labels every level, stays collapsible, and hides internal revisions',()=>{
  for(const label of ['BOARD','BOUNDARY','WEAVE PATTERN','INFLUENCED GRID'])assert.match(app,new RegExp(`'${label}'`),label);
  assert.match(app,/element\('details','board tree-board'\)/);
  assert.match(app,/element\('details',`tree-node tree-\$\{type\}`\)/);
  assert.doesNotMatch(app,/element\('details','tree-history'\)|REVISION HISTORY/);
  assert.match(app,/entry\.latestRevisionId/);
  assert.match(app,/treeOpenState\.set/);
  assert.match(app,/dataset\.treeKey/);
});
