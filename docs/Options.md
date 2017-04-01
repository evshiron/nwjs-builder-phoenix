
# Options

Options can be defined in the `package.json` of the project under `build` property, see an [example](../assets/project/package.json).

## build <- [BuildConfig](../src/lib/BuildConfig.ts)

Name | Type | Description
--- | --- | ---
nwVersion | string | Used NW.js version. Support `lts`, `stable` and `latest` symbols. Defaults to `lts`.
nwFlavor | string | Used NW.js flavor for builder. Runner will always use `sdk`. `normal` or `sdk`. Defaults to `normal`.
output | string | Output directory relative to the project root. Defaults to `./dist/`.
packed | boolean | Whether to pack app or not. Packed app needed to be extracted at launch time. Defaults to `false`.
targets | string[] | Target formats to build. `zip`, `7z`, etc. Defaults to `[]`.
files | string[] | Glob patterns for included files. Exclude `${ output }` automatically. Defaults to `[ '**/*' ]`.
excludes | string[] | Glob patterns for excluded files. Defaults to `[]`.
appId | string | App identity URI. Defaults to `io.github.nwjs.${ name }`.
ffmpegIntegration | boolean | Whether to integrate `iteufel/nwjs-ffmpeg-prebuilt`. If `true`, you can NOT use symbols in `nwVersion`. Defaults to `false`.

## build.win <- [WinConfig](../src/lib/WinConfig.ts)

Name | Type | Description
--- | --- | ---
productVersion | string | Product version. Defaults to `${ version }`.
fileVersion | string | File version. Defaults to `${ productVersion }`
versionStrings | { [key: string]: string } | `rcedit` version strings. Defaults to `{ ProductName: "${ name }", FileDescription: "${ description }" }`.
icon | string | .ico icon file. Defaults to `undefined`.

## build.mac <- [MacConfig](../src/lib/MacConfig.ts)

Name | Type | Description
--- | --- | ---
name | string | Name in `Info.plist`. Defaults to `${ name }`.
displayName | string | DisplayName in `Info.plist`. Defaults to `${ name }`.
version | string | Version in `Info.plist`. Defaults to `${ version }`.
description | string | Description in `InfoPlist.strings`. Defaults to `${ description }`.
copyright | string | Copyright in `InfoPlist.strings`. Defaults to `""`.
icon | string | .icns icon file. Defaults to `undefined`.

## build.linux <- [LinuxConfig](../src/lib/LinuxConfig.ts)

Currently noop.

## build.nsis <- [NsisConfig](../src/lib/NsisConfig.ts)

Name | Type | Description
--- | --- | ---
diffUpdaters | boolean | Whether to build diff updaters. Defaults to `false`.
hashCalculation | boolean | Whether to calculate hashes for installers and updaters. Defaults to `true`.
