const path = require('path');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = {

    mode: 'production', 
    //mode: 'development', 

    entry: './src/ts/widget_editor.ts', 

    // resolve: {
    //     alias: {
    //         // 'vs' というパスが来たら node_modules/monaco-editor/min/vs を見るように指定
    //         'vs': path.resolve(__dirname, 'node_modules/monaco-editor/min/vs')
    //     }
    // },

    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader'
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            // {
            //     test: /\.ttf$/,
            //     type: 'asset/resource'
            // },
        ]
    },

    plugins: [
        new MonacoWebpackPlugin({
            languages: [],
        })
    ],

    experiments: {
        outputModule: true
    },
    output: {
        library: {
            type: 'module',
        },
        path: path.resolve(__dirname, 'scripts/widget_editor'),
        filename: '[name].bundle.js'
    },
};