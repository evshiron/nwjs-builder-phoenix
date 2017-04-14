
# FAQs

> Why do you set `package.json:build.packed` to `false` by default?

NW.js is not Electron. Using a zip file in NW.js, no matter as a separated `.nw` or combined with the executable, will require unzipping at every time the app launches, which results in a longer launch time, current working directory change and possibly slient crashes if unzipped path is longer than 255/260 characters.

If you want to reduce the amount of files, try using `webpack` or something like that to pack project sources and most of node modules into bundles. `devDependencies` are ignored automatically (so if a node module is supposed to be packed into bundles, make it a `devDependency`).

> Icons on Windows?

* Prepare different sizes (e.g. 32x32, 48x48, 64x64, 128x128, 256x256, etc.) of `.png`s and use `icotool` or some other tools to create a proper `.ico` file.
* Set `package.json:build.win.icon` to the path of the `.ico` file.
* Set `package.json:window.icon` to the path of a `.png` file.
* Save and build.

Windows Explorer might not reflect the changes immediately, if you have everything done and still see a default icon, check with something like Resource Hacker and restart Windows Explorer.

> Building for NSIS target takes a long time, what can I do?

Please follow [evshiron/nwjs-builder-phoenix#7](https://github.com/evshiron/nwjs-builder-phoenix/issues/7), before that you can add `--concurrent` to enable concurrent building, which should reduce time when building for multiple platforms.

> How can I use `nwjs-builder-phoenix` with Chrome Apps?

Simply add `--chrome-app` to the commandline arguments which enables support for Chrome Apps.

Also configurations should be set in `manifest.json` instead of `package.json` but within the same `build` property.

> What's `nsis` target? What's the difference between `nsis` and `nsis7z` targets?

`nsis` target will build NSIS installers (and updaters when `package.json:build.nsis.diffUpdaters` is `true`) for Windows.

`nsis7z` target will use `7za` to compress and [Nsis7z plug-in](http://nsis.sourceforge.net/Nsis7z_plug-in) to extract, instead of the built-in LZMA compression, resulting in a better and faster compression. But it doesn't list installed files, only a percentage indicating the progress of extraction when installing.
