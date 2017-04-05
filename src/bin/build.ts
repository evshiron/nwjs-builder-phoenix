#!/usr/bin/env node

import * as yargs from 'yargs';

const debug = require('debug')('build:commandline:build');

import { Builder } from '../lib';

const argv = require('yargs')
.option('win', {
    type: 'boolean',
    describe: 'Build for Windows platform',
    default: Builder.DEFAULT_OPTIONS.win,
    alias: 'w',
})
.option('mac', {
    type: 'boolean',
    describe: 'Build for macOS platform',
    default: Builder.DEFAULT_OPTIONS.mac,
    alias: 'm',
})
.option('linux', {
    type: 'boolean',
    describe: 'Build for Linux platform',
    default: Builder.DEFAULT_OPTIONS.linux,
    alias: 'l',
})
.option('x86', {
    type: 'boolean',
    describe: 'Build for x86 arch',
    default: Builder.DEFAULT_OPTIONS.x86,
})
.option('x64', {
    type: 'boolean',
    describe: 'Build for x64 arch',
    default: Builder.DEFAULT_OPTIONS.x64,
})
.option('chrome-app', {
    type: 'boolean',
    describe: 'Build from Chrome App',
    default: Builder.DEFAULT_OPTIONS.chromeApp,
})
.option('mirror', {
    describe: 'Modify NW.js mirror',
    default: Builder.DEFAULT_OPTIONS.mirror,
})
.option('concurrent', {
    type: 'boolean',
    describe: 'Build concurrently',
    default: Builder.DEFAULT_OPTIONS.concurrent,
})
.help()
.argv;

(async () => {

    debug('in commandline', 'argv', argv);

    const builder = new Builder({
        win: argv.win,
        mac: argv.mac,
        linux: argv.linux,
        x86: argv.x86,
        x64: argv.x64,
        chromeApp: argv['chrome-app'],
        mirror: argv.mirror,
        concurrent: argv.concurrent,
        mute: false,
    }, argv._.shift());

    await builder.build();

    process.exitCode = 0;

})()
.catch((err) => {

    console.error(err);
    process.exitCode = -1;

});
