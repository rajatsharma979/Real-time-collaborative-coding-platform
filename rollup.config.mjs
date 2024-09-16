import nodeResolve from '@rollup/plugin-node-resolve';

export default {
    input: "./public/editor.mjs",
    output: {
        file: "public/editorBundle.js",
        format: "iife"
    },
    plugins: [nodeResolve()]
};