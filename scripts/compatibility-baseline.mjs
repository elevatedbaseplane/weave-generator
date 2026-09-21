// Phase 0 diagnostics only. Export native portable strings to avoid numeric
// transport changing binary64 values in expanded WebMCP object snapshots.
export function compatibilityBaselineTool(readState, exportProject) {
  return {
    name: 'read_weave_compatibility_baseline',
    description: 'Read exact native portable backups for saved projects and the storage root, without editing. Diagnostic compatibility capture.',
    inputSchema: {type:'object',properties:{},additionalProperties:false},
    annotations: {readOnlyHint:true},
    async execute(input) {
      if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).length) throw Error('No input properties are accepted.');
      const before = readState();
      if (before.blocked || !before.packed || before.pending) throw Error('Wait for an unblocked, settled workspace before capturing the baseline.');
      const projects = [];
      for (const project of before.packed.manifest.projects) {
        const {text} = await exportProject(before.packed, project.id);
        projects.push({id:project.id,name:project.name,portableText:text});
      }
      const after = readState();
      if (after.blocked || after.pending || after.packed !== before.packed || after.root !== before.root) throw Error('Workspace changed during capture. Capture again after it settles.');
      return {diagnosticVersion:'stability-phase0-v1',build:before.build,root:before.root,activeProjectId:before.packed.manifest.activeProjectId,projects};
    }
  };
}
