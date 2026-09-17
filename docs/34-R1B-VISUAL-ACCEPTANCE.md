# R1B visual acceptance checklist

Status: R1B is locally complete. This checklist covers the accepted R1B feature set from a fresh workspace. R1C is not started and publication is not authorized.

Preview: `http://127.0.0.1:43830/?r1b-ui=20260916`

Build identity: the served application must show `FOUNDATION / R1B` in the header and `WF-R1B-DELTA-20260916` in the status bar. The local preview was checked directly after the UI correction and serves that build. No `FOUNDATION / R1A` or `WF-R1A` label remains.

## Fresh-workspace prerequisite

1. In the left **BOARDS** rail, select **+**, name the board `R1B ACCEPTANCE`, and select **CREATE**.
2. In the right **CONTROLS** rail, open **CARRIER**, select **CREATE RECTANGULAR CARRIER**, then open **DISPLAY** and check **BOUNDARY**, **FAMILY A**, and **FAMILY B**.
3. Still in **CARRIER**, leave the default spacing and rotation, enter `R1B CARRIER` under **SAVE AS**, and select **SAVE CARRIER STUDY**.
4. Open **WEAVE STUDY**, choose the saved `R1B CARRIER` revision under **SOURCE CARRIER REVISION**, and select **CREATE WEAVE STUDY**.
5. At the top of the expanded Weave Study controls, confirm that the bordered **ATTRACTOR FIELD** block appears before **SOURCE OVERLAY**, with a primary **ADD ATTRACTOR** button and the prompt “Add one certified attractor to deform this Weave Study.” If it does not, stop: that is a UI defect.

## Visual checks

1. **Discoverability, guide, and local pull**
   - Prerequisite: complete the fresh-workspace steps above.
   - Control: **WEAVE STUDY → ATTRACTOR FIELD → ADD ATTRACTOR**; numeric settings use sliders with live value readouts.
   - Change: select **ADD ATTRACTOR**. Leave Center `0, 0`, Radius `150`, Strength `50`, Tension `0`, and **ENABLED** checked. Toggle **SHOW ATTRACTOR GUIDE**, **SOURCE OVERLAY**, and **DERIVED OVERLAY**.
   - Expect: a center handle and radius ring appear; nearby off-center A/B strands bend inward while distant portions remain straight. Source shows the straight reference, Derived shows the curved result, and each overlay hides and returns independently. The status ends at **CERTIFIED ATTRACTOR COMMITTED**.

2. **Place, resize, pending state, and undo**
   - Prerequisite: the default attractor from check 1 is visible with **SHOW ATTRACTOR GUIDE** checked.
   - Control: drag the attractor center handle and radius-ring handle on the canvas; **UNDO/REDO** are in the top toolbar. Center and Radius also appear in **ATTRACTOR FIELD**.
   - Change: drag the center toward the right edge and release; then drag the ring outward and release. Use **UNDO** once after each completed drag, then **REDO**.
   - Expect: the affected area follows the center and ring. During a calculation the last complete weave remains visible in a pending/faded state; saving and Derived SVG export are unavailable, and **CANCEL PENDING** can appear. Each completed drag is one undo step. Undo restores the whole prior gesture; redo restores it.

3. **Strength, tension, enabled state, and removal**
   - Prerequisite: an attractor exists.
   - Controls: **STRENGTH**, **TENSION**, **ENABLED**, and **REMOVE ATTRACTOR** in **WEAVE STUDY → ATTRACTOR FIELD**.
   - Change: raise Strength; raise Tension; set Tension to `100`; return it to `0`; uncheck and recheck **ENABLED**; finally select **REMOVE ATTRACTOR**.
   - Expect: greater Strength increases pull, greater Tension reduces bending, Tension `100` is straight, disabling is straight, and re-enabling restores the prior bend. Removal restores the identity weave and returns the clearly visible **ADD ATTRACTOR** action; saved revisions are retained.

4. **Concave clipping and carrier response**
   - Prerequisite: create a second new board with **BOARDS → +**. Before creating its carrier, open **VERTEX COORDINATES**.
   - Control: draw the U boundary on the canvas, or import it as SVG. Use **VERTEX EDITOR** to select and adjust individual points with X/Y sliders. Then use **CARRIER → CREATE RECTANGULAR CARRIER / SAVE CARRIER STUDY**, create its **WEAVE STUDY**, and select **ADD ATTRACTOR**. Use the attractor Center sliders to place it near the notch and **CARRIER → ROTATION** for the final change.

     ```text
     -150, -150
     150, -150
     150, 150
     50, 150
     50, -50
     -50, -50
     -50, 150
     -150, 150
     ```

   - Change: place the attractor close to the inner notch, then change Rotation to `25`.
   - Expect: curved fragments stop exactly at the U boundary and remain separate across the open notch; no path bridges the gap. Rotation updates the clipped weave while the attractor center and radius stay fixed in document coordinates.

5. **Immutable revisions, reload, backup, and SVG**
   - Prerequisite: return to a square R1B study with an attractor and wait for **CERTIFIED ATTRACTOR COMMITTED**.
   - Controls: **WEAVE STUDY → SAVE AS / SAVE WEAVE REVISION / DERIVED SVG**; saved revisions are in the left **BOARDS** rail; **DOWNLOAD BACKUP** and **IMPORT BACKUP** are at the bottom of that rail.
   - Change: save one revision, move the attractor, save a second revision, reload the page, and select each saved revision. Export **DERIVED SVG**. Download the JSON backup and import it in a separate fresh browser profile or isolated test workspace.
   - Expect: each revision restores its own center, radius, strength, tension, enabled state, and matching geometry; the earlier revision never changes. The SVG contains the complete certified A/B result with concave gaps preserved. Both revisions survive reload and remain available after backup import.

Exhaustive malformed-data, numerical-limit, capacity, migration, recovery, concurrency, and performance rejection checks remain automated checkpoint evidence; they are not manual visual acceptance steps.
