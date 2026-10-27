# Changing an async chunk list invalidates an unchanged import caller

Standalone reproduction with **unmodified webpack 5.112.2**, Node.js 22 or newer. No Rspack patches, runtime monkey-patching, dev server, framework, or browser reload fallback.

## Run

```sh
npm ci
npm test
npm run test:control
```

`npm test` asserts the desired behavior and is expected to **exit 1 on the affected version**. The control is expected to exit 0. Each invocation recreates only the gitignored `.work/` directory; tracked source files are unchanged.

## Scenario

The entry calls an unchanged bridge which dynamically imports page. Page self-accepts. Editing page adds a dependency extracted to shared. Neither the bridge source nor the entry source is edited.

The starting files are in [src](src); [steps](steps) contains the exact edits. [reproduce.cjs](reproduce.cjs) performs those edits and applies HMR. The small [harness](harness.cjs) uses webpack's public Node API, persisting compilation records between successive builds, then executes webpack's real emitted runtime.

## Actual and expected behavior

The generated import in bridge changes from ensuring page to ensuring shared plus page. That factory change propagates through bridge to the entry, so HMR aborts because bridge is not accepted. This repo records the abort; it does not run a dev-server client or claim an observed browser reload. Whether topology-only changes should be isolated is a design discussion.

The assertions express the expected result. See [observed.json](observed.json) for the captured failing run and [control.json](control.json) for its successful control. Generated chunks and update files are left in `.work/dist/`; each run also writes `results/last-run.json` with the compilation hashes, chunk/module membership, manifests, and result.

## Control

Disable splitChunks. Bridge's generated chunk list stays unchanged and page's update succeeds.

## Scope

Verified on 2026-10-28. HMR compiler and JavaScript HMR runtime files in the npm release match webpack main commit `bd8eddff945733f65ada91ad441ce8b613f1544a` byte-for-byte. This is **not** a claim that every file or target on main was tested.
