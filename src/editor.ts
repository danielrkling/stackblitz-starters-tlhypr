import globals from './globals'
import File from './file'
import * as monaco from 'monaco-editor'


monaco.editor.setTheme('vs-dark');

monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true)
monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true)

monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.Latest,
    allowNonTsExtensions: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.CommonJS,
    noEmit: true,
    esModuleInterop: true,
    jsx: monaco.languages.typescript.JsxEmit.React,
    reactNamespace: "React",
    allowJs: true,
    typeRoots: ["node_modules/@types"],
    allowUmdGlobalAccess: true
  });

monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
   noSemanticValidation: false,
   noSyntaxValidation: false,
});

fetch('https://cdn.jsdelivr.net/npm/@types/react@16.9.41/index.d.ts').then(async function(res){
monaco.languages.typescript.typescriptDefaults.addExtraLib(
    await res.text(),
   `file:///node_modules/@react/types/index.d.ts`
);
})


      

export const leftContainer = document.getElementById("leftContainer")
export const rightContainer = document.getElementById("rightContainer")

export const leftEditorContainer = document.getElementById("leftEditor")
export const rightEditorContainer = document.getElementById("rightEditor")

export const leftTabs = document.getElementById("leftTabs")
export const rightTabs = document.getElementById("rightTabs")

const splitButton = document.getElementById("splitView")

splitButton.addEventListener('click', function () {
    if (rightContainer.classList.contains('hidden')) {
        rightContainer.classList.remove('hidden')
        splitButton.classList.add('orange')
    } else {
        rightContainer.classList.add('hidden')
        splitButton.classList.remove('orange')
        rightEditor.activeFile?.deactivate({right:true})
    }
})

type Editor = monaco.editor.IStandaloneCodeEditor & { activeFile?: File }

export const leftEditor = monaco.editor.create(leftContainer, {
    model: null,
    automaticLayout: true,
    wrappingIndent: "indent",
    detectIndentation:false
}) as Editor

export const rightEditor = monaco.editor.create(rightContainer, {
    model: null,
    automaticLayout: true,
    wrappingIndent: "indent",
    detectIndentation:false
}) as Editor



leftContainer.addEventListener('drop', function (event) {
    event.preventDefault();
    globals.dragFile.activate({ left: true }, true)
})
leftContainer.addEventListener("dragover", function (event) {
    event.preventDefault();
});

rightContainer.addEventListener('drop', function (event) {
    event.preventDefault();
    globals.dragFile.activate({ right: true }, true)
})
rightContainer.addEventListener("dragover", function (event) {
    event.preventDefault();
});




var compilerTypes =
    `
  declare namespace Compiler {

    export interface Config {
        input: string;
        output: string;
        format: Format;
        target: 'last 2 edge versions' | 'ie 11' | string;
        name?: string;
        preCompilerOptions?: TransformOptions;
        bundleOptions?: BundleOptions;
        generateOptions?: GenerateOptions;
        postCompilerOptions?: TransformOptions;
        scripts: string[];
    }

    export type Format = 'amd' | 'cjs' | 'es' | 'iife' | 'umd' | 'css'

    export interface BundleOptions {
        /** The format of the generated bundle. */
        format: Format
        /** What export mode to use. Defaults to auto, which guesses your intentions based on what the \`entry\` module exports. */
        exports?: 'auto' | 'default' | 'named' | 'none'
        /** An ID to use for AMD/UMD bundles. */
        moduleId?: string
        /** The name to use for the module for UMD/IIFE bundles (required for bundles with exports). */
        name?: string
        /** Mapping of IDs → global variable names. Used for UMD/IIFE bundles. */
        globals?: { [id: string]: string }
        /**
         * Function that takes an ID and returns a path, or Object of id: path pairs.
         * Where supplied, these paths will be used in the generated bundle instead of the module ID, allowing you to (for example) load dependencies from a CDN.
         */
        paths?: ((id: string) => string) | { [id: string]: string }
        /**
         * The indent string to use, for formats that require code to be indented (AMD, IIFE, UMD).
         * Can also be false (no indent), or true (the default – auto-indent)
         */
        indent?: string | boolean
        /**
         * Whether or not to add an 'interop block'. By default (interop: true).
         * For safety's sake, Rollup will assign any external dependencies' default exports to a separate variable if it's necessary to distinguish between default and named exports.
         * This generally only applies if your external dependencies were transpiled (for example with Babel) – if you're sure you don't need it, you can save a few bytes with interop: false.
         */
        interop?: boolean
        /** A string to prepend to the bundle. */
        banner?: string
        /** A string to append to the bundle. */
        footer?: string
        /** A string prepended to the code inside of the format-specific wrapper */
        intro?: string
        /** A string appended to the code inside of the format-specific wrapper */
        outro?: string
        /**
         * Whether to include the 'use strict' pragma at the top of generated non-ES6 bundles.
         * Strictly-speaking (geddit?), ES6 modules are always in strict mode, so you shouldn't disable this without good reason.
         */
        strict?: boolean
    }

    export interface GenerateOptions extends BundleOptions {
        /** Whether to generate a sourcemap. If true, the return value from \`bundle.generate(...)\` will include a map property */
        sourcemap?: boolean
        /**
         * The location of the generated bundle. If this is an absolute path, all the sources paths in the sourcemap will be relative to it.
         * The map.file property is the basename of sourcemapFile, as the location of the sourcemap is assumed to be adjacent to the bundle.
         */
        sourcemapFile?: string
    }

    export interface TransformOptions {
        /**
         * Specify which assumptions it can make about your code, to better optimize the compilation result. **NOTE**: This replaces the various \`loose\` options in plugins in favor of
         * top-level options that can apply to multiple plugins
         *
         * @see https://babeljs.io/docs/en/assumptions
         */
        assumptions?: { [name: string]: boolean } | null | undefined;

        /**
         * Include the AST in the returned object
         *
         * Default: \`false\`
         */
        ast?: boolean | null | undefined;

        /**
         * Attach a comment after all non-user injected code
         *
         * Default: \`null\`
         */
        auxiliaryCommentAfter?: string | null | undefined;

        /**
         * Attach a comment before all non-user injected code
         *
         * Default: \`null\`
         */
        auxiliaryCommentBefore?: string | null | undefined;

        /**
         * Specify the "root" folder that defines the location to search for "babel.config.js", and the default folder to allow \`.babelrc\` files inside of.
         *
         * Default: \`"."\`
         */
        root?: string | null | undefined;

        /**
         * This option, combined with the "root" value, defines how Babel chooses its project root.
         * The different modes define different ways that Babel can process the "root" value to get
         * the final project root.
         *
         * @see https://babeljs.io/docs/en/next/options#rootmode
         */
        rootMode?: 'root' | 'upward' | 'upward-optional' | undefined;

        /**
         * The config file to load Babel's config from. Defaults to searching for "babel.config.js" inside the "root" folder. \`false\` will disable searching for config files.
         *
         * Default: \`undefined\`
         */
        configFile?: string | boolean | null | undefined;

        /**
         * Specify whether or not to use .babelrc and
         * .babelignore files.
         *
         * Default: \`true\`
         */
        babelrc?: boolean | null | undefined;

        /**
         * Specify which packages should be search for .babelrc files when they are being compiled. \`true\` to always search, or a path string or an array of paths to packages to search
         * inside of. Defaults to only searching the "root" package.
         *
         * Default: \`(root)\`
         */
        babelrcRoots?: boolean | MatchPattern | MatchPattern[] | null | undefined;

        /**
         * Toggles whether or not browserslist config sources are used, which includes searching for any browserslist files or referencing the browserslist key inside package.json.
         * This is useful for projects that use a browserslist config for files that won't be compiled with Babel.
         *
         * If a string is specified, it must represent the path of a browserslist configuration file. Relative paths are resolved relative to the configuration file which specifies
         * this option, or to \`cwd\` when it's passed as part of the programmatic options.
         *
         * Default: \`true\`
         */
        browserslistConfigFile?: boolean | null | undefined;

        /**
         * The Browserslist environment to use.
         *
         * Default: \`undefined\`
         */
        browserslistEnv?: string | null | undefined;

        /**
         * By default \`babel.transformFromAst\` will clone the input AST to avoid mutations.
         * Specifying \`cloneInputAst: false\` can improve parsing performance if the input AST is not used elsewhere.
         *
         * Default: \`true\`
         */
        cloneInputAst?: boolean | null | undefined;

        /**
         * Defaults to environment variable \`BABEL_ENV\` if set, or else \`NODE_ENV\` if set, or else it defaults to \`"development"\`
         *
         * Default: env vars
         */
        envName?: string | undefined;

        /**
         * If any of patterns match, the current configuration object is considered inactive and is ignored during config processing.
         */
        exclude?: MatchPattern | MatchPattern[] | undefined;

        /**
         * Enable code generation
         *
         * Default: \`true\`
         */
        code?: boolean | null | undefined;

        /**
         * Output comments in generated output
         *
         * Default: \`true\`
         */
        comments?: boolean | null | undefined;

        /**
         * Do not include superfluous whitespace characters and line terminators. When set to \`"auto"\` compact is set to \`true\` on input sizes of >500KB
         *
         * Default: \`"auto"\`
         */
        compact?: boolean | 'auto' | null | undefined;

        /**
         * The working directory that Babel's programmatic options are loaded relative to.
         *
         * Default: \`"."\`
         */
        cwd?: string | null | undefined;

        /**
         * Utilities may pass a caller object to identify themselves to Babel and
         * pass capability-related flags for use by configs, presets and plugins.
         *
         * @see https://babeljs.io/docs/en/next/options#caller
         */
        caller?: TransformCaller | undefined;

        /**
         * This is an object of keys that represent different environments. For example, you may have: \`{ env: { production: { \/* specific options *\/ } } }\`
         * which will use those options when the \`envName\` is \`production\`
         *
         * Default: \`{}\`
         */
        env?: { [index: string]: TransformOptions | null | undefined } | null | undefined;

        /**
         * A path to a \`.babelrc\` file to extend
         *
         * Default: \`null\`
         */
        extends?: string | null | undefined;

        /**
         * Filename for use in errors etc
         *
         * Default: \`"unknown"\`
         */
        filename?: string | null | undefined;

        /**
         * Filename relative to \`sourceRoot\`
         *
         * Default: \`(filename)\`
         */
        filenameRelative?: string | null | undefined;

        /**
         * An object containing the options to be passed down to the babel code generator, @babel/generator
         *
         * Default: \`{}\`
         */
        generatorOpts?: GeneratorOptions | null | undefined;

        /**
         * Specify a custom callback to generate a module id with. Called as \`getModuleId(moduleName)\`. If falsy value is returned then the generated module id is used
         *
         * Default: \`null\`
         */
        getModuleId?: ((moduleName: string) => string | null | undefined) | null | undefined;

        /**
         * ANSI highlight syntax error code frames
         *
         * Default: \`true\`
         */
        highlightCode?: boolean | null | undefined;

        /**
         * Opposite to the \`only\` option. \`ignore\` is disregarded if \`only\` is specified
         *
         * Default: \`null\`
         */
        ignore?: MatchPattern[] | null | undefined;

        /**
         * This option is a synonym for "test"
         */
        include?: MatchPattern | MatchPattern[] | undefined;



        /**
         * Should the output be minified (not printing last semicolons in blocks, printing literal string values instead of escaped ones, stripping \`()\` from \`new\` when safe)
         *
         * Default: \`false\`
         */
        minified?: boolean | null | undefined;

        /**
         * Specify a custom name for module ids
         *
         * Default: \`null\`
         */
        moduleId?: string | null | undefined;

        /**
         * If truthy, insert an explicit id for modules. By default, all modules are anonymous. (Not available for \`common\` modules)
         *
         * Default: \`false\`
         */
        moduleIds?: boolean | null | undefined;

        /**
         * Optional prefix for the AMD module formatter that will be prepend to the filename on module definitions
         *
         * Default: \`(sourceRoot)\`
         */
        moduleRoot?: string | null | undefined;

        /**
         * A glob, regex, or mixed array of both, matching paths to **only** compile. Can also be an array of arrays containing paths to explicitly match. When attempting to compile
         * a non-matching file it's returned verbatim
         *
         * Default: \`null\`
         */
        only?: MatchPattern[] | null | undefined;

        /**
         * Allows users to provide an array of options that will be merged into the current configuration one at a time.
         * This feature is best used alongside the "test"/"include"/"exclude" options to provide conditions for which an override should apply
         */
        overrides?: TransformOptions[] | undefined;

        /**
         * An object containing the options to be passed down to the babel parser, @babel/parser
         *
         * Default: \`{}\`
         */
        parserOpts?: ParserOptions | null | undefined;

        /**
         * List of plugins to load and use
         *
         * Default: \`[]\`
         */
        plugins?: PluginItem[] | null | undefined;

        /**
         * List of presets (a set of plugins) to load and use
         *
         * Default: \`[]\`
         */
        presets?: PluginItem[] | null | undefined;

        /**
         * Retain line numbers. This will lead to wacky code but is handy for scenarios where you can't use source maps. (**NOTE**: This will not retain the columns)
         *
         * Default: \`false\`
         */
        retainLines?: boolean | null | undefined;

        /**
         * An optional callback that controls whether a comment should be output or not. Called as \`shouldPrintComment(commentContents)\`. **NOTE**: This overrides the \`comment\` option when used
         *
         * Default: \`null\`
         */
        shouldPrintComment?: ((commentContents: string) => boolean) | null | undefined;

        /**
         * Set \`sources[0]\` on returned source map
         *
         * Default: \`(filenameRelative)\`
         */
        sourceFileName?: string | null | undefined;

        /**
         * If truthy, adds a \`map\` property to returned output. If set to \`"inline"\`, a comment with a sourceMappingURL directive is added to the bottom of the returned code. If set to \`"both"\`
         * then a \`map\` property is returned as well as a source map comment appended. **This does not emit sourcemap files by itself!**
         *
         * Default: \`false\`
         */
        sourceMaps?: boolean | 'inline' | 'both' | null | undefined;

        /**
         * The root from which all sources are relative
         *
         * Default: \`(moduleRoot)\`
         */
        sourceRoot?: string | null | undefined;

        /**
         * Indicate the mode the code should be parsed in. Can be one of "script", "module", or "unambiguous". \`"unambiguous"\` will make Babel attempt to guess, based on the presence of ES6
         * \`import\` or \`export\` statements. Files with ES6 \`import\`s and \`export\`s are considered \`"module"\` and are otherwise \`"script"\`.
         *
         * Default: \`("module")\`
         */
        sourceType?: 'script' | 'module' | 'unambiguous' | null | undefined;

        /**
         * If all patterns fail to match, the current configuration object is considered inactive and is ignored during config processing.
         */
        test?: MatchPattern | MatchPattern[] | undefined;

        /**
         * Describes the environments you support/target for your project.
         * This can either be a [browserslist-compatible](https://github.com/ai/browserslist) query (with [caveats](https://babeljs.io/docs/en/babel-preset-env#ineffective-browserslist-queries))
         *
         * Default: \`{}\`
         */
        targets?:
        | string
        | string[]
        | {
            esmodules?: boolean;
            node?: Omit<string, 'current'> | 'current' | true;
            safari?: Omit<string, 'tp'> | 'tp';
            browsers?: string | string[];
            android?: string;
            chrome?: string;
            deno?: string;
            edge?: string;
            electron?: string;
            firefox?: string;
            ie?: string;
            ios?: string;
            opera?: string;
            rhino?: string;
            samsung?: string;
        };

    }

    export type MatchPattern = string | RegExp | ((filename: string | undefined, context: MatchPatternContext) => boolean);

    export interface TransformCaller {
        // the only required property
        name: string;
        // e.g. set to true by \`babel-loader\` and false by \`babel-jest\`
        supportsStaticESM?: boolean | undefined;
        supportsDynamicImport?: boolean | undefined;
        supportsExportNamespaceFrom?: boolean | undefined;
        supportsTopLevelAwait?: boolean | undefined;
        // augment this with a "declare module '@babel/core' { ... }" if you need more keys
    }

    export interface MatchPatternContext {
        envName: string;
        dirname: string;
        caller: TransformCaller | undefined;
    }

    export interface ConfigItem {
        /**
         * The name that the user gave the plugin instance, e.g. \`plugins: [ ['env', {}, 'my-env'] ]\`
         */
        name?: string | undefined;

        /**
         * The resolved value of the plugin.
         */
        value: object | ((...args: any[]) => any);

        /**
         * The options object passed to the plugin.
         */
        options?: object | false | undefined;

        /**
         * The path that the options are relative to.
         */
        dirname: string;

        /**
         * Information about the plugin's file, if Babel knows it.
         *  *
         */
        file?:
        | {
            /**
             * The file that the user requested, e.g. \`"@babel/env"\`
             */
            request: string;

            /**
             * The full path of the resolved file, e.g. \`"/tmp/node_modules/@babel/preset-env/lib/index.js"\`
             */
            resolved: string;
        }
        | null
        | undefined;
    }

    export type PluginOptions = object | undefined | false;

    export type PluginTarget = string | object | ((...args: any[]) => any);

    export type PluginItem =
        | ConfigItem
        | PluginTarget
        | [PluginTarget, PluginOptions]
        | [PluginTarget, PluginOptions, string | undefined];


    export interface GeneratorOptions {
        /**
         * Optional string to add as a block comment at the start of the output file.
         */
        auxiliaryCommentBefore?: string | undefined;

        /**
         * Optional string to add as a block comment at the end of the output file.
         */
        auxiliaryCommentAfter?: string | undefined;

        /**
         * Function that takes a comment (as a string) and returns true if the comment should be included in the output.
         * By default, comments are included if \`opts.comments\` is \`true\` or if \`opts.minifed\` is \`false\` and the comment
         * contains \`@preserve\` or \`@license\`.
         */
        shouldPrintComment?(comment: string): boolean;

        /**
         * Attempt to use the same line numbers in the output code as in the source code (helps preserve stack traces).
         * Defaults to \`false\`.
         */
        retainLines?: boolean | undefined;

        /**
         * Should comments be included in output? Defaults to \`true\`.
         */
        comments?: boolean | undefined;

        /**
         * Set to true to avoid adding whitespace for formatting. Defaults to the value of \`opts.minified\`.
         */
        compact?: boolean | 'auto' | undefined;

        /**
         * Should the output be minified. Defaults to \`false\`.
         */
        minified?: boolean | undefined;

        /**
         * Set to true to reduce whitespace (but not as much as opts.compact). Defaults to \`false\`.
         */
        concise?: boolean | undefined;

        /**
         * The type of quote to use in the output. If omitted, autodetects based on \`ast.tokens\`.
         */
        quotes?: 'single' | 'double' | undefined;

        /**
         * Used in warning messages
         */
        filename?: string | undefined;

        /**
         * Enable generating source maps. Defaults to \`false\`.
         */
        sourceMaps?: boolean | undefined;

        /**
         * The filename of the generated code that the source map will be associated with.
         */
        sourceMapTarget?: string | undefined;

        /**
         * A root for all relative URLs in the source map.
         */
        sourceRoot?: string | undefined;

        /**
         * The filename for the source code (i.e. the code in the \`code\` argument).
         * This will only be used if \`code\` is a string.
         */
        sourceFileName?: string | undefined;

        /**
         * Set to true to run jsesc with "json": true to print "\u00A9" vs. "©";
         */
        jsonCompatibleStrings?: boolean | undefined;
    }
}`

monaco.languages.typescript.javascriptDefaults.addExtraLib(compilerTypes)
monaco.languages.typescript.typescriptDefaults.addExtraLib(compilerTypes)