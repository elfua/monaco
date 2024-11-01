const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const TerserPlugin = require('terser-webpack-plugin');

const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

// https://github.com/microsoft/monaco-editor/blob/c321d0fbecb50ab8a5365fa1965476b0ae63fc87/samples/browser-esm-webpack-typescript-react/webpack.config.js
// module.exports = {

//   // rest of the configuration
// };

module.exports = {

    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
        // https://webpack.js.org/configuration/output/#outputchunkformat
        // possible values: false string: 'array-push' | 'commonjs' | 'module' | <any string>
        chunkFormat: 'array-push' // https://github.com/webpack/webpack/issues/3637#issuecomment-1911310809
    },
    // module: {
    //     rules: [
    //         {
    //             test: /\.js$/,
    //             exclude: /node_modules/,
    //             use: 'babel-loader'
    //         },
    //         {
    //             test: /\.css$/,
    //             use: ['style-loader', 'css-loader']
    //         }
    //     ]
    // },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
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
                'json'], // specify only needed languages
        })
    ],
    // plugins: [
    //     new HtmlWebpackPlugin({
    //         template: './public/index.html'
    //     })
    // ],
    devServer: {


        static: path.join(__dirname, 'dist'),
        liveReload: true,
        compress: true,
        port: 9001, // port you prefer
        open: true, //Automatically open browser
        hot: true, //Enable webpack's Hot Module Replacement feature
        watchFiles: ['src/**/*', 'public/**/*']
    },

    mode: process.env.NODE_ENV, // Enables minification
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                // MUST SEE: 
                //      https://terser.org/docs/options/
                //      https://terser.org/docs/options/#format-options
                extractComments: false,
                parallel: true,
                terserOptions: {
                    ecma: 2020,
                    compress: 
                     {
                        // defaults: true,
                        drop_console: true,
                        drop_debugger: true,
                        
                    },
                    // comments: false,
                    // {
                    //     // drop_console: true, // Remove console logs
                    // },
                    mangle: true,

                },
            }),
        ],
    },
};
