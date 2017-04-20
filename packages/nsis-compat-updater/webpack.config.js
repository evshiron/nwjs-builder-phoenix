
const { dirname, resolve } = require('path');

const { dependencies } = require('./package.json');

const externals = {};
Object.keys(dependencies || {}).map((dependency) => {
    externals[dependency] = `commonjs2 ${ dependency }`;
});

module.exports = {
    entry: [ './src/lib/index.ts' ],
    devtool: 'nosources-source-map',
    target: 'electron-renderer',
    output: {
        libraryTarget: 'commonjs2',
        path: resolve(dirname(module.filename), './dist/'),
        filename: 'bundle.js',
    },
    resolve: {
        extensions: [ '.ts', '.tsx', '.js', '.json' ],
    },
    module: {
        loaders: [
            {
                test: /\.(ts|tsx)$/,
                exclude: /(node_modules)/,
                loader: 'awesome-typescript-loader',
            },
        ],
    },
    externals,
};
