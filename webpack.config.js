const path = require('path');

const CopyPlugin = require("copy-webpack-plugin");
const TerserPlugin = require('terser-webpack-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');


module.exports = {

    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
        chunkFormat: 'array-push',
        clean: true,
    },
    // https://webpack.js.org/configuration/module/#modulegenerator
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf|html|ico)$/i,
                type: 'asset/resource',
            }
        ],

    },
    plugins: [
        new MonacoWebpackPlugin({
            languages: [
                'javascript',
                'typescript',
                'java',
                'css',
                'html',
                'python',
                'xml',
                'html',
                'java',
                'json'],
        }),
        new CopyPlugin({
            patterns: [
              { from: "public"},
            ],
          }),
    ],
    devServer: {
        static: path.join(__dirname, 'dist'),
        liveReload: true,
        compress: true,
        port: 9001, // port you prefer
        open: true, //Automatically open browser
        hot: true, //Enable webpack's Hot Module Replacement feature
        watchFiles: ['src/**/*', 'public/**/*']
    },

    mode: process.env.NODE_ENV, 
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                extractComments: false,
                parallel: true,
                terserOptions: {
                    ecma: 2020,
                    compress:
                    {
                        drop_console: true,
                        drop_debugger: true,

                    },
                    mangle: true,
                },
            }),
        ],
    },
};
