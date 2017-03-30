#!/usr/bin/env node

import * as yargs from 'yargs';

const debug = require('debug')('build:commandline:run');

import { Runner } from '../lib';

const argv = require('yargs')
.option('x86', {
    type: 'boolean',
    describe: 'Build for x86 arch',
    default: Runner.DEFAULT_OPTIONS.x86,
})
.option('x64', {
    type: 'boolean',
    describe: 'Build for x64 arch',
    default: Runner.DEFAULT_OPTIONS.x64,
})
.option('mirror', {
    describe: 'Modify NW.js mirror',
    default: Runner.DEFAULT_OPTIONS.mirror,
})
.option('detached', {
    describe: 'Detach after launching',
    type: 'boolean',
    default: Runner.DEFAULT_OPTIONS.detached,
})
.help()
.argv;

(async () => {

    debug('in commandline', 'argv', argv);

    const runner = new Runner({
        x86: argv.x86,
        x64: argv.x64,
        mirror: argv.mirror,
        detached: argv.detached,
        mute: false,
    }, argv._);

    const code = await runner.run();

    process.exitCode = code;

})()
.catch((err) => {

    console.error(err);
    process.exitCode = -1;

});
