
# FAQs

> Icons on Windows?

* Prepare different sizes (eg. 32x32, 48x48, 64x64, 128x128, 256x256, etc.) of `.png`s and use `icotool` or some other tools to create a proper `.ico` file. 
* Set the path of `.ico` to `package.json:build.win.icon`.
* Set the path of a `.png` to `package.json:window.icon`.
* Save and build.

Windows Explorer might not reflect the changes immediately, if you have everything done and still see a default icon, check with something like Resource Hacker and restart Windows Explorer.

> Building for NSIS target takes a long time, what can I do?

Please follow [evshiron/nwjs-builder-phoenix#7](https://github.com/evshiron/nwjs-builder-phoenix/issues/7), before that you can add `--concurrent` to enable concurrent building, which should reduce time when building for multiple platforms.

> How can I use `nwjs-builder-phoenix` with Chrome Apps?

Simply add `--chrome-app` to the commandline arguments which enables support for Chrome Apps.

Also configurations should be set in `manifest.json` instead of `package.json` but within the same `build` property.
