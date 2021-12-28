import alias from "@rollup/plugin-alias"
import replace from "@rollup/plugin-replace"
import vue from "rollup-plugin-vue"
import peerDepsExternal from "rollup-plugin-peer-deps-external"
import typescript from "rollup-plugin-typescript"
import postcss from "rollup-plugin-postcss"
import path from "path"

const external = ["vue"]
const globals = {
  vue: "Vue",
  katex: "katex",
  prismjs: "Prism",
  "fragment-for-vue/vue3": "Fragment",
}
const plugins = [
  typescript({
    tsconfig: false,
    experimentalDecorators: true,
    module: "esnext",
  }),
  replace({
    "process.env.NODE_ENV": JSON.stringify("production"),
    "process.env.ES_BUILD": JSON.stringify("false"),
  }),
  alias({
    entries: {
      "@": path.resolve(path.resolve(__dirname, "."), "src"),
    },
  }),
  peerDepsExternal(),
]

export default [
  // ESM build to be used with webpack/rollup.
  {
    input: "src/entry.ts",
    output: [
      {
        format: "esm",
        name: "Vue3Notion",
        file: "dist/library.ts",
      },
    ],
    external,
    plugins: [vue(), ...plugins],
  },
  // SSR build.
  {
    input: "src/entry.ts",
    output: [
      {
        format: "cjs",
        name: "Vue3Notion",
        file: "dist/library.ssr.ts",
        globals,
      },
    ],
    external,
    //@ts-ignore
    plugins: [vue({ template: { optimizeSSR: true } }), ...plugins],
  },
  // Browser build.
  {
    input: "src/entry.ts",
    output: {
      format: "iife",
      name: "Vue3Notion",
      file: "dist/min.js",
      globals,
    },
    plugins: [vue(), ...plugins],
  },
  // PostCSS build.
  {
    input: "postcss.ts",
    output: {
      format: "es",
      file: "dist/styles.ignore",
    },
    plugins: [
      postcss({
        extract: true,
        minimize: true,
      }),
    ],
  },
]