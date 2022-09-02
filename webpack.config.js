module.exports = (env) => {
    console.log("Environment: ", env);

    const path = require("path");
    const webpack = require("webpack");
    const LodashModuleReplacementPlugin = require("lodash-webpack-plugin");

    const RELEASE = !(env && env.debug); // Development only! Use Release for Release!
    const RELEASE_SOURCE_MAPS = false; // false or "source-map" (extremely slow)

    console.log("release", RELEASE)

    const MomentLocalesPlugin = require("moment-locales-webpack-plugin");
    const { VueLoaderPlugin } = require("vue-loader");

    let plugs = [
        new VueLoaderPlugin(),
        new MomentLocalesPlugin({
            localesToKeep: ["de"],
        }),
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
        }),
        new LodashModuleReplacementPlugin(),
    ];

    if (RELEASE) {
        const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

        //plugs.push(new BundleAnalyzerPlugin()); // For analyzing the bundle size
    } else {
        /* const BrowserSyncPlugin = require("browser-sync-webpack-plugin");

        plugs.push(
            new BrowserSyncPlugin({
                host: "localhost",
                port: 3000,
                proxy: "http://app.localhost/",
            })
        );*/
    }

    console.log("Writing to:", path.resolve(__dirname, "./public/js"));

    return {
        performance: {
            maxEntrypointSize: 8120000,
            maxAssetSize: 8120000,
        },
        entry: {
            app: ["./src/app.ts"],
        },
        cache: !RELEASE,
        devtool: RELEASE ? RELEASE_SOURCE_MAPS : "eval-cheap-module-source-map",
        mode: RELEASE ? "production" : "development",

        output: {
            filename: "app.js",
            chunkFilename: "[name].[chunkhash].bundle.js",
            path: path.resolve(__dirname, "./public/res/notation/js"),
            publicPath: "./public/",
        },
        resolve: {
            extensions: [
                ".webpack.js",
                ".web.js",
                ".ts",
                ".js",
                ".vue",
                ".json",
                ".png",
                ".jpg",
                ".scss",
            ],
            alias: {
                vue$: "vue/dist/vue.esm.js",
                //  "@": path.join(__dirname, "..", "resource")
            },
        },
        plugins: plugs,
        module: {
            noParse: [/benchmark/],
            rules: [
                {
                    test: /\.(png|jp(e*)g|svg)$/,
                    use: [
                        {
                            loader: "url-loader",
                            options: {
                                limit: 8000, // Convert images < 8kb to base64 strings
                                name: "images/[hash]-[name].[ext]",
                            },
                        },
                    ],
                },
                {
                    test: /\.tsx?$/,
                    exclude: /node_modules/,
                    use: {
                        loader: "ts-loader",
                        options: {
                            configFile: "tsconfig.json",
                            appendTsSuffixTo: [/\.vue$/],
                        },
                    },
                },

                {
                    test: /\.(s*)[ac]ss$/i,
                    use: [
                        // Creates `style` nodes from JS strings
                        "style-loader",
                        // Translates CSS into CommonJS
                        { loader: "css-loader", options: { url: false } },

                        // Compiles Sass to CSS
                        "sass-loader",
                    ],
                },

                {
                    test: /\.(eot|svg|ttf|woff|woff2)$/,
                    loader: "file-loader",
                    options: {
                        name: "public/fonts/[name].[ext]",
                    },
                },

                {
                    exclude: /node_modules/,
                    test: /\.vue$/,
                    use: ["vue-loader"],
                },
            ],
        },
        externals: {
            fs: true,
        },
    };
};
