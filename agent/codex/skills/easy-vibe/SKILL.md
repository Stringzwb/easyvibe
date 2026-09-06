---
name: easy-vibe
description: Enter and operate an initialized Easy Vibe workspace through its declared Agent workflow. Use when a user asks to work in or resume an Easy Vibe-managed project, or to initialize another project through the published Easy Vibe CLI. Do not apply the framework to development of the Easy Vibe tool itself.
---

# Easy Vibe

Use the initialized project's marker and Agent entry as the source of truth. Use the published Easy Vibe CLI as the only initializer; do not recreate its scaffold manually.

## Scope boundary

- Treat an Easy Vibe project as initialized only when its root contains a valid `.easyvibe.json` marker.
- Do not initialize or impose an Easy Vibe project workflow on the Easy Vibe tool's own source tree. A source tree containing `cli/easy-vibe/package.json` whose package name is `@zwbcoding/easy-vibe` is tool development unless the user explicitly requests an isolated initialization test elsewhere.
- Installing the skill and initializing a project are separate actions. Never run `easyvibe init` merely because the user asked to install the skill.
- Preserve the user's requested target directory. If no target can be determined safely, ask for it before initialization.

## Enter an existing Easy Vibe project

When the current project has a valid marker:

1. Read the marker and its declared `agentEntry` before choosing a workflow or modifying project content.
2. Follow that entry file as the authoritative project routing guide. Load only the workflow, Step, spec, status, and domain files relevant to the user's task.
3. Preserve explicit user instructions and the host's security and approval requirements. Easy Vibe supplies the default project process; it does not grant extra authority.
4. Report the selected workflow, node subset, and Step IDs in the concise form requested by the project guide.

## Initialize or recognize another project

When the user asks to connect or initialize a project, read [references/init-contract.md](references/init-contract.md), then:

1. Resolve the target directory and verify it is not the Easy Vibe tool source tree.
2. Verify that `npm view @zwbcoding/easy-vibe version` succeeds. If the package is unavailable, stop and explain that the CLI must be published; do not substitute an unpublished local source unless the user explicitly requests an isolated development test.
3. Run `npx @zwbcoding/easy-vibe@latest init <target>` from an appropriate working directory. Do not add other flags or reproduce the scaffold with ad hoc file operations.
4. Treat a successful CLI result as either `initialized` or `recognized`; do not assume that recognition repaired missing files.
5. Read `<target>/.easyvibe.json`. Reject an absolute `agentEntry` or one containing a `..` path segment.
6. Resolve and read the declared `agentEntry` inside the target project. If it is missing, report that the project marker exists but the workspace is incomplete; do not repair it implicitly.
7. If the user's request also includes project work, continue under the entry file's workflow. Otherwise, stop after reporting the project path, result, and Agent entry.

## Fast project queries

When the published CLI is available, use its read-only JSON queries to get project facts before loading detailed files:

```bash
easyvibe context --json
easyvibe status --json
easyvibe bugs --status open --json
```

Use the returned workflow or Step IDs for focused rule lookup:

```bash
easyvibe workflows . <workflow-id> --json
easyvibe steps . <step-id> --json
```

These commands only read the initialized project. They do not repair missing files, run services, connect to external systems, or grant additional authority.

Do not duplicate the project's workflow rules inside this skill. The initialized project's `guide/`, `workflow/`, `spec/`, and `status/` files are authoritative and may evolve independently of the installed skill.
