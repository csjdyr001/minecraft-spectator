let webpack = require('webpack')
let path = require('path')

module.exports = {
    entry: {
        index: path.join(__dirname, '/src/js/app/index.js')
    },
    output: {
        path: path.join(__dirname, './public'),
        filename: 'javascripts/[name].bundle.js'
    },
    resolve: {
        alias: {
            'minecraft-protocol': path.resolve(__dirname,'node_modules/minecraft-protocol/src/index.js'), // Hack to allow creating the client in a browser
            express: false,
            net: 'net-browserify',
            fs: 'memfs'
        },
        fallback: {
            zlib: require.resolve('browserify-zlib'),
            stream: require.resolve('stream-browserify'),
            buffer: require.resolve('buffer/'),
            events: require.resolve('events/'),
            assert: require.resolve('assert/'),
            crypto: require.resolve('crypto-browserify'),
            path: require.resolve('path-browserify'),
            constants: require.resolve('constants-browserify'),
            os: require.resolve('os-browserify/browser'),
            http: require.resolve('http-browserify'),
            https: require.resolve('https-browserify'),
            timers: require.resolve('timers-browserify'),
            // fs: require.resolve("fs-memory/singleton"),
            child_process: false,
            perf_hooks: path.resolve(__dirname, 'src/js/app/perf_hooks_replacement.js'),
            dns: path.resolve(__dirname, 'src/js/app/dns.js'),
            querystring: require.resolve("querystring-es3")
        }
    }
}