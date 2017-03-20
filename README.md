
# nwjs-builder-phoenix

A possible solution to build and package a ready for distribution NW.js app for Windows, macOS and Linux.

## Why Bother?

We already has official `nw-builder` and `nwjs-builder`, which was built as an alternative before `nw-builder` would support 0.13.x and later versions.
`nw-builder` has made little progress on the way, and `nwjs-builder` has been hard to continue due to personal and historic reasons.

`electron-builder` inspired me when I became an Electron user later, loose files excluding, various target formats, auto updater, artifacts publishing and code signing, amazing!

Although NW.js has much lesser popularity than Electron, and is really troubled by historic headaches, let's have something modern.

## Installation

```shell
npm install nwjs-builder-phoenix --save-dev
```

By installing it locally, `build` and `run` commands will be available in npm scripts. You can access help information via `./node_modules/.bin/{ build, run } --help`. Do NOT install it globally, as the command names are just too common.

Add the following to `package.json`, and `npm run build` and `npm run launch` will work.

```json
// package.json
{
    "scripts": {
        "build": "build --win --mac --linux --x86 --x64 --mirror https://dl.nwjs.io/ .",
        "launch": "run --x86 --mirror https://dl.nwjs.io/ ."
    }
}
```

## Options

Passing and managing commandline arguments can be painful. In `nwjs-builder-phoenix`, we configure via the `build` property of the `package.json` in the project. Also you can specify external `builder.json` file (whatever filename) by appending `--config builder.json` to CLI arguments.

See all available [Options](./docs/Options.md).

## Examples

* [./assets/project/](./assets/project/)

## Differences to `nwjs-builder`

* `nwjs-builder-phoenix` queries `versions.json` only when a symbol like `lts`, `stable` or `latest` is used to specify a version.
* `nwjs-builder-phoenix` uses `rcedit` instead of `node-resourcehacker`, thus it's up to you to create proper `.ico` files with different sizes.
* `nwjs-builder-phoenix` supports node.js 4.x and later versions only.
* `nwjs-builder-phoenix` writes with TypeScript and benefits from strong typing and async/await functions.

## Known Mirrors

If you have difficulties connecting to the official download source, you can specify a mirror via `--mirror` argument of both `build` and `run`, or by setting `NWJS_MIRROR` environment variable. Environment variables like `HTTP_PROXY`, `HTTPS_PROXY` and `ALL_PROXY` should be useful too.

* China Mainland
  * https://npm.taobao.org/mirrors/nwjs/
* Singapore
  * https://cnpmjs.org/mirrors/nwjs/

## License

MIT.
