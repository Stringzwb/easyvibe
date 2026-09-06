# Easy Vibe init contract

Read this reference only when initializing or recognizing another project through the Easy Vibe CLI.

## Command

```bash
npx @zwbcoding/easy-vibe@latest init <target>
```

Before using the command, verify that `npm view @zwbcoding/easy-vibe version` succeeds. A registry `404` means the CLI has not been published and initialization must stop.

The target may be absolute or relative to the command's working directory. In an interactive terminal the CLI may let the user confirm or change the suggested location. In a non-interactive environment it uses the supplied target, or the current directory when no target is supplied.

## Required behavior

The CLI:

1. Resolves the selected project to an absolute path.
2. Checks `<target>/.easyvibe.json`.
3. If a valid marker exists, recognizes the project without creating, repairing, or overwriting content.
4. If no marker exists, checks the target or nearest existing parent for write permission.
5. Creates missing scaffold directories and files while preserving existing paths.
6. Writes `.easyvibe.json` only after all other initialization work succeeds.
7. Reports the absolute path of the declared Agent entry and the project-local Codex Skill source.

Initialization is intentionally additive. It may be used with a non-empty project, but an existing file is preserved even when its content differs from the Easy Vibe template.

## Marker

A supported marker has this shape:

```json
{
  "version": 1,
  "type": "easyvibe-project",
  "agentEntry": "guide/README.md",
  "initializedAt": "2026-09-04T00:00:00.000Z"
}
```

Accept only version `1`, type `easyvibe-project`, and a non-empty project-relative `agentEntry` without a `..` segment. Resolve the entry beneath the target root.

## Failure handling

- Invalid marker: stop and report it. Do not overwrite the marker.
- Marker entry missing: report an incomplete recognized project. Do not rerun init expecting repair because marked projects are recognition-only.
- Target occupied by a regular file: stop and report the conflicting path.
- Permission or read-only failure: report the checked location and let the user choose a writable target or change permissions.
- Partial first initialization without a marker: after the user fixes the failure, rerunning init may safely preserve completed files and add missing ones.
