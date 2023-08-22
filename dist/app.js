(function (monaco, rollup, Babel, ts) {
    'use strict';

    function _interopNamespaceDefault(e) {
        var n = Object.create(null);
        if (e) {
            Object.keys(e).forEach(function (k) {
                if (k !== 'default') {
                    var d = Object.getOwnPropertyDescriptor(e, k);
                    Object.defineProperty(n, k, d.get ? d : {
                        enumerable: true,
                        get: function () { return e[k]; }
                    });
                }
            });
        }
        n.default = e;
        return Object.freeze(n);
    }

    var monaco__namespace = /*#__PURE__*/_interopNamespaceDefault(monaco);
    var rollup__namespace = /*#__PURE__*/_interopNamespaceDefault(rollup);
    var Babel__namespace = /*#__PURE__*/_interopNamespaceDefault(Babel);
    var ts__namespace = /*#__PURE__*/_interopNamespaceDefault(ts);

    const resizer = document.getElementById("resizer");
    const sideBar = document.getElementById("sidebar");
    const container = document.getElementById("container");
    resizer.addEventListener("mousedown", (event) => {
        document.addEventListener("mousemove", resize, false);
        document.addEventListener("mouseup", () => {
            document.removeEventListener("mousemove", resize, false);
        }, false);
    });
    function resize(e) {
        const size = `${e.x}px`;
        sideBar.style.width = size;
        container.style.width = `${document.body.offsetWidth - e.x}px`;
    }
    resize({ x: 250 });

    document.getElementById('npmButton').addEventListener('click', async function npmDownload() {
        try {
            const npmPackageName = document.getElementById('npmPackageName');
            const response = await fetch(`https://registry.npmjs.org/${npmPackageName.value}/latest`);
            const json = await response.json();
            const tarball = json.dist.tarball;
            downloadLink(tarball, json.name);
        }
        catch (e) {
            console.log(e);
        }
        function downloadLink(url, fileName) {
            var a = document.createElement("a");
            document.body.appendChild(a);
            a.style.display = "none";
            a.href = url;
            a.download = fileName;
            a.target = "_blank";
            a.click();
            a.remove();
        }
    });

    const files = {};
    var rootFolder;
    var leftActiveFile;
    var rightActiveFile;
    var dragFile;
    //export var activeEditor: monaco.editor.IEditor | monaco.editor.IDiffEditor;
    const globals = { files, rootFolder, leftActiveFile, rightActiveFile, dragFile };

    monaco__namespace.editor.setTheme('vs-dark');
    monaco__namespace.languages.typescript.typescriptDefaults.setEagerModelSync(true);
    monaco__namespace.languages.typescript.javascriptDefaults.setEagerModelSync(true);
    monaco__namespace.languages.typescript.typescriptDefaults.setCompilerOptions({
        target: monaco__namespace.languages.typescript.ScriptTarget.Latest,
        allowNonTsExtensions: true,
        moduleResolution: monaco__namespace.languages.typescript.ModuleResolutionKind.NodeJs,
        module: monaco__namespace.languages.typescript.ModuleKind.CommonJS,
        noEmit: true,
        esModuleInterop: true,
        jsx: monaco__namespace.languages.typescript.JsxEmit.React,
        reactNamespace: "React",
        allowJs: true,
        typeRoots: ["node_modules/@types"],
        allowUmdGlobalAccess: true
    });
    monaco__namespace.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: false,
        noSyntaxValidation: false,
    });
    fetch('https://cdn.jsdelivr.net/npm/@types/react@16.9.41/index.d.ts').then(async function (res) {
        monaco__namespace.languages.typescript.typescriptDefaults.addExtraLib(await res.text(), `file:///node_modules/@react/types/index.d.ts`);
    });
    const leftContainer = document.getElementById("leftContainer");
    const rightContainer = document.getElementById("rightContainer");
    document.getElementById("leftEditor");
    document.getElementById("rightEditor");
    const leftTabs = document.getElementById("leftTabs");
    const rightTabs = document.getElementById("rightTabs");
    const splitButton = document.getElementById("splitView");
    splitButton.addEventListener('click', function () {
        if (rightContainer.classList.contains('hidden')) {
            rightContainer.classList.remove('hidden');
            splitButton.classList.add('orange');
        }
        else {
            rightContainer.classList.add('hidden');
            splitButton.classList.remove('orange');
            rightEditor.activeFile?.deactivate({ right: true });
        }
    });
    const leftEditor = monaco__namespace.editor.create(leftContainer, {
        model: null,
        automaticLayout: true,
        wrappingIndent: "indent",
        detectIndentation: false
    });
    const rightEditor = monaco__namespace.editor.create(rightContainer, {
        model: null,
        automaticLayout: true,
        wrappingIndent: "indent",
        detectIndentation: false
    });
    leftContainer.addEventListener('drop', function (event) {
        event.preventDefault();
        globals.dragFile.activate({ left: true }, true);
    });
    leftContainer.addEventListener("dragover", function (event) {
        event.preventDefault();
    });
    rightContainer.addEventListener('drop', function (event) {
        event.preventDefault();
        globals.dragFile.activate({ right: true }, true);
    });
    rightContainer.addEventListener("dragover", function (event) {
        event.preventDefault();
    });
    var compilerTypes = `
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
}`;
    monaco__namespace.languages.typescript.javascriptDefaults.addExtraLib(compilerTypes);
    monaco__namespace.languages.typescript.typescriptDefaults.addExtraLib(compilerTypes);

    function Div(config) {
        const div = document.createElement('div');
        if (!config) {
            return div;
        }
        div.className = config.className ?? '';
        if (config.listeners) {
            for (const listener of config.listeners) {
                div.addEventListener(listener.type, listener.listener);
            }
        }
        if (config.innerHTML) {
            div.innerHTML = config.innerHTML;
        }
        if (config.children) {
            for (const child of config.children) {
                div.appendChild(child);
            }
        }
        if (config.parent) {
            config.parent.appendChild(div);
        }
        return div;
    }

    class Menu {
        container;
        constructor(item, contextMenuItems) {
            const self = this;
            this.container = Div({
                className: 'context-menu hidden',
                children: [
                    Div({
                        innerHTML: `${item.icon()}<span class='tree-label-name'>${item.name()}</span>`,
                    }),
                    document.createElement('HR'),
                    ...contextMenuItems.map(function (item) {
                        return Div({
                            className: 'context-menu-action',
                            innerHTML: item.icon + item.label,
                            listeners: [{
                                    type: 'click',
                                    listener: async function () {
                                        self.hide();
                                        item.action();
                                    }
                                }]
                        });
                    })
                ]
            });
        }
        show(event) {
            closeContextMenus();
            this.container.classList.remove('hidden');
            this.container.style.top = event.clientY + 'px';
            this.container.style.left = event.clientX + 'px';
            var rect = this.container.getBoundingClientRect();
            if (rect.bottom > window.innerHeight) {
                this.container.style.top = (event.clientY - this.container.offsetHeight) + 'px';
            }
            event.stopPropagation();
            event.preventDefault();
        }
        hide() {
            this.container.classList.add('hidden');
        }
    }
    document.addEventListener('click', closeContextMenus);
    document.addEventListener('contextmenu', closeContextMenus);
    function closeContextMenus() {
        const dropdowns = document.getElementsByClassName('context-menu');
        for (const dropdown of dropdowns) {
            dropdown.classList.add('hidden');
        }
    }

    async function compileFile(file) {
        try {
            var bundle = await rollup__namespace.rollup({
                input: file.path(),
                plugins: [
                    {
                        name: 'loader',
                        resolveId(source, importer) {
                            return resolveModule(source, importer);
                        },
                        async load(id) {
                            return await loadModule(id);
                        }
                    }
                ],
            });
            var result = await bundle.generate({ format: 'es' });
            var src = result.output[0].code;
            var outputFilePath = prompt("Output Filepath:", file.path() + '.js');
            var outputFile = await globals.rootFolder.newFile(outputFilePath);
            outputFile.setText(src);
        }
        catch (e) {
            console.log(e);
        }
    }
    // interface CompilerConfig {
    //     input: string;
    //     output: string;
    //     format: string;
    //     target: 'last 2 edge versions' | 'ie 11' | string;
    //     name?: string;
    //     preCompilerOptions?: object;
    //     inputOptions?: object;
    //     outputOptions?: object;
    //     postCompilerOptions?: object;
    //     scripts?: string[];
    // }
    const compileButton = document.getElementById('compileButton');
    compileButton.addEventListener('click', async function () { await compile(); });
    async function compile() {
        try {
            compileButton.children[0].classList.add('fa-spin');
            // @ts-ignore
            window.config = {};
            var configJS = await globals.files['config.js'].getText();
            eval(configJS);
            var bundle = await rollup__namespace.rollup({
                // @ts-ignore
                ...window.config.rollup,
                plugins: [
                    {
                        name: 'loader',
                        resolveId(source, importer) {
                            return resolveModule(source, importer);
                        },
                        async load(id) {
                            // @ts-ignore
                            return await loadModule(id, window.config);
                        }
                    }
                ],
            });
            // @ts-ignore
            var result = await bundle.generate({ format: 'es', ...window.config.outputOptions });
            var src = result.output[0].code;
            // @ts-ignore
            var code = compileJavascript(src, window.config.babel);
            // @ts-ignore
            var outputFilePath = window.config.outputPath;
            var outputFile = await globals.rootFolder.newFile(outputFilePath);
            outputFile.setText(code);
        }
        catch (e) {
            console.log(e);
        }
        compileButton.children[0].classList.remove('fa-spin');
        compileButton.classList.remove('orange');
    }
    // async function bundleSCSS(config) {
    //     try {
    //         await sassClearFiles();
    //         const files = {}
    //         for (const [key, file] of Object.entries(globals.files)) {
    //             if (file.language() === 'css' || file.language() === 'scss') {
    //                 files[key] = await file.getText();
    //             }
    //         }
    //         await sassWriteFiles(files)
    //         var result = await sassCompileFile(config.input)
    //         var file = await globals.rootFolder.newFile(config.output)
    //         file.setText(result)
    //     } catch (e) {
    //         console.log(e)
    //     }
    // }
    // async function bundle(config: CompilerConfig) {
    //     try {
    //         var bundle = await rollup.rollup({
    //             input: config.input,
    //             plugins: [
    //                 {
    //                     name: 'loader',
    //                     resolveId(source, importer) {
    //                         if (config.log) {
    //                             console.log(source + ' from ' + importer)
    //                         }
    //                         return resolveModule(source, importer)
    //                     },
    //                     async load(id) {
    //                         return await loadModule(id, config.preCompilerOptions)
    //                     }
    //                 }
    //             ],
    //             ...config.inputOptions
    //         })
    //         var result = await bundle.generate({ format: config.format, ...config.outputOptions })
    //         var src = result.output[0].code
    //         var code = compileJavascript(src, config.target, config.postCompilerOptions)
    //         var scriptCode = '';
    //         if (config.scripts) {
    //             // var scripts = config.scripts.map(async function (path) { return await globals.files[path].getText() })
    //             // await Promise.all(scripts)
    //             for (const path of config.scripts) {
    //                 scriptCode += await loadModule(path, {}) + '\n'
    //             }
    //             code = scriptCode + code;
    //         }
    //         var file = await globals.rootFolder.newFile(config.output)
    //         file.setText(code)
    //     } catch (e) {
    //         console.log(e)
    //     }
    // }
    function resolveModule(sourcePath, importerPath) {
        if (sourcePath.slice(0, 8) === 'https://') {
            return sourcePath;
        }
        var importerSplit = importerPath ? importerPath.split('/') : [''];
        var sourceSplit = sourcePath.split('/');
        var i = sourceSplit.findLastIndex(s => s === '..');
        if (i >= 0) {
            for (; i >= 0; i--) {
                sourceSplit[i] = importerSplit[i];
            }
            importerSplit = [''];
        }
        if (sourceSplit[0] === '.') {
            sourceSplit[0] = importerSplit.slice(0, importerSplit.length - 1).join('/');
            importerSplit = [''];
        }
        sourcePath = sourceSplit.join('/');
        while (importerSplit.length > 0) {
            importerSplit.pop();
            let testPath = importerSplit.join('/') + (importerSplit.length > 0 ? '/' : '') + sourcePath;
            if (globals.files.hasOwnProperty(testPath)) {
                return testPath;
            }
            if (globals.files.hasOwnProperty(testPath + '.ts')) {
                return testPath + '.ts';
            }
            if (globals.files.hasOwnProperty(testPath + '.js')) {
                return testPath + '.js';
            }
            if (globals.files.hasOwnProperty(testPath + '.css')) {
                return testPath + '.css';
            }
            if (globals.files.hasOwnProperty(testPath + '.scss')) {
                return testPath + '.scss';
            }
        }
    }
    // @ts-ignore
    async function loadModule(sourcePath, opts) {
        if (sourcePath.slice(0, 8) === 'https://') {
            var response = await fetch(sourcePath);
            var text = await response.text();
            //console.log(JSON.stringify(response.headers.get('Content-Type')) + sourcePath);
            var header = response.headers.get('Content-Type');
            if (header.includes('javascript')) {
                var language = 'javascript';
            }
            if (header.includes('css')) {
                var language = 'css';
            }
        }
        else {
            var file = globals.files[sourcePath];
            var text = await file.getText();
            var language = file.language();
        }
        switch (language) {
            case 'typescript':
            case 'javascript':
                return compileTypescript(text, opts?.typescript);
            //case 'scss': return compileCSS(await sassCompileString(text, file.name()));
            case 'css': return compileCSS(text);
            default: return '';
        }
    }
    // @ts-ignore
    function compileTypescript(src, opts) {
        try {
            return ts__namespace.transpile(src, {
                jsx: ts__namespace.JsxEmit.React,
                module: ts__namespace.ModuleKind.ESNext,
                target: ts__namespace.ScriptTarget.Latest,
                ...opts
            });
        }
        catch (e) {
            console.log(e);
        }
    }
    // @ts-ignore
    function compileJavascript(src, opts) {
        try {
            return Babel__namespace.transform(src, {
                presets: ['env'],
                // targets: 'ie 11',
                sourceType: "unambiguous",
                filename: "file.ts",
                ...opts
            }).code;
        }
        catch (e) {
            console.log(e);
        }
    }
    // async function sassCompileString(src: string, name?: string): Promise<string> {
    //     return new Promise((resolve, reject) => {
    //         Sass.compile(src, function (result) {
    //             if (!result.text) {
    //                 console.log(name + '\n' + result.formatted);
    //                 resolve('')
    //             }
    //             resolve(result.text)
    //         });
    //     })
    // }
    // async function sassClearFiles(): Promise<void> {
    //     return new Promise((resolve, reject) => {
    //         try {
    //             Sass.clearFiles(function () {
    //                 resolve()
    //             });
    //         } catch (e) {
    //             reject()
    //         }
    //     })
    // }
    // async function sassWriteFile(path: string, source: string): Promise<void> {
    //     return new Promise((resolve, reject) => {
    //         try {
    //             Sass.writeFile(path, source, function (success) {
    //                 success ? resolve() : reject();
    //             });
    //         } catch (e) {
    //             reject()
    //         }
    //     })
    // }
    // async function sassWriteFiles(files: Record<string, string>): Promise<void> {
    //     return new Promise((resolve, reject) => {
    //         try {
    //             Sass.writeFile(files, function (result) {
    //                 result ? resolve() : reject();
    //             });
    //         } catch (e) {
    //             reject()
    //         }
    //     })
    // }
    // async function sassCompileFile(path: string): Promise<string> {
    //     return new Promise((resolve, reject) => {
    //         try {
    //             Sass.compileFile(path, function (result) {
    //                 result.text ? resolve(result.text) : reject(JSON.stringify(result, null, 1));
    //             });
    //         } catch (e) {
    //             reject('Error Compiling File')
    //         }
    //     })
    // }
    function compileCSS(src) {
        // const style = document.createElement('style');
        // style.innerHTML= JSON.stringify(minifyCSS(src));
        // document.head.appendChild(style);
        const js = `(function(){
      const style = document.createElement('style');
      style.innerHTML= ${JSON.stringify(minifyCSS(src))};
      document.head.appendChild(style);
    })();`;
        return js;
    }
    /* minify css */
    function minifyCSS(content) {
        content = content.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, "");
        content = content.replace(/ {2,}/g, " ");
        content = content.replace(/ ([{:}]) /g, "$1");
        content = content.replace(/([{:}]) /g, "$1");
        content = content.replace(/([;,]) /g, "$1");
        content = content.replace(/ !/g, "!");
        return content;
    }

    class File {
        handle;
        model;
        modifiedModel;
        parentFolder;
        container;
        label;
        input;
        leftTab;
        rightTab;
        state;
        saveTimer;
        constructor(handle, parentFolder) {
            this.handle = handle;
            this.parentFolder = parentFolder;
            this.state = { loaded: parentFolder.state.loaded };
            this.container = Div({
                className: 'container file'
            });
        }
        name() {
            return this.handle.name;
        }
        extension() {
            return this.name().split('.').pop();
        }
        path() {
            if (this.parentFolder === globals.rootFolder) {
                return this.name();
            }
            else {
                return this.parentFolder.path() + '/' + this.name();
            }
        }
        language() {
            switch (this.extension()) {
                case 'html': return 'html';
                case 'hta': return 'html';
                case 'jsx': return 'javascript';
                case 'css': return 'css';
                case 'scss': return 'scss';
                case 'js': return 'javascript';
                case 'mjs': return 'javascript';
                case 'json': return 'json';
                case 'md': return 'markdown';
                case 'vb': return 'vb';
                case 'vbs': return 'vb';
                case 'bas': return 'vb';
                case 'cls': return 'vb';
                case 'sql': return 'sql';
                case 'cs': return 'cs';
                case 'ts': return 'typescript';
                case 'tsx': return 'typescript';
                case 'txt': return 'text';
                default: return null;
            }
        }
        icon() {
            switch (this.language()) {
                case 'javascript': return '<i class="fa-brands fa-square-js"></i>';
                case 'typescript': return '<i class="fa-brands fa-square-js typescript"></i>';
                case 'css': return '<i class="fa-solid fa-palette"></i>';
                case 'scss': return '<i class="fa-solid fa-palette scss"></i>';
                case 'html': return '<i class="fa-solid fa-code"></i>';
                case 'json': return '<i class="fa-solid fa-gear"></i>';
                case 'sql': return '<i class="fa-solid fa-database"></i>';
                case 'vb': return '<i class="fa-solid fa-scroll"></i>';
                case 'text': return '<i class="fa-solid fa-font"></i>';
                case 'markdown': return '<i class="fa-solid fa-book"></i>';
                default: return '<i class="fa-solid fa-file"></i>';
            }
        }
        async getText() {
            if (this.model) {
                return this.model.getValue();
            }
            else {
                const file = await this.handle.getFile();
                return await file.text();
            }
        }
        async setText(text) {
            if (this.model) {
                return this.model.setValue(text);
            }
            else {
                // @ts-ignore
                const writable = await this.handle.createWritable();
                await writable.write(text);
                await writable.close();
            }
        }
        async loadModel() {
            if (this.model) {
                this.unloadModel();
            }
            const self = this;
            const text = await this.getText();
            this.model = monaco__namespace.editor.createModel(text, this.language(), monaco__namespace.Uri.file(this.path()));
            this.model.onDidChangeContent(function (e) {
                autoSave(self, e.isFlush ? 0 : 2000);
            });
            this.input.checked = true;
        }
        async loadTree() {
            globals.files[this.path()] = this;
            return this.createTreeElement();
        }
        unloadModel() {
            this.deactivate({ left: true, right: true });
            this.leftTab?.remove();
            this.leftTab = null;
            this.rightTab?.remove();
            this.rightTab = null;
            this.model?.dispose();
            this.model = undefined;
            this.input.checked = false;
        }
        async save() {
            if (!this.language()) {
                if (!confirm('File Type not supported. Okay to save?')) {
                    return;
                }
            }
            // @ts-ignore
            const writable = await this.handle.createWritable();
            await writable.write(this.model.getValue());
            await writable.close();
        }
        async remove(hideWarning) {
            if (hideWarning || confirm(`Are you sure you want to delete ${this.name()}`)) {
                this.unloadModel();
                delete globals.files[this.path()];
                delete this.parentFolder.files[this.name()];
                this.container.remove();
                // @ts-ignore
                await this.handle.remove({ recursive: true });
            }
        }
        async rename() {
            var fileName = prompt("New filename", this.name());
            if (fileName) {
                if (this.parentFolder.files[fileName]) {
                    alert('File already exists with that name: ' + fileName);
                    return false;
                }
                //let active = {(globals.leftActiveFile === this);}
                let loaded = this.input.checked;
                let leftActive = leftEditor.activeFile === this;
                let rightActive = rightEditor.activeFile === this;
                this.unloadModel();
                delete globals.files[this.path()];
                delete this.parentFolder.files[this.name()];
                // @ts-ignore
                await this.handle.move(fileName);
                this.container.remove();
                await this.parentFolder.loadFile(this);
                if (loaded) {
                    await this.loadModel();
                    this.activate({ left: leftActive, right: rightActive });
                }
                // if (active) {
                //   await this.activate()
                // }
            }
        }
        contextMenu() {
            const self = this;
            return new Menu(this, [
                ...(this.language() === 'javascript' || this.language() === 'typescript' ? [{
                        icon: '<i class="fa-solid fa-gear"></i>',
                        label: 'Compile',
                        action: async function () { await compileFile(self); }
                    }] : []),
                ...(this.language() === 'markdown' ? [{
                        icon: '<i class="fa-solid fa-gear"></i>',
                        label: 'PreviewMarkdown',
                        action: function () { }
                    }] : []),
                {
                    icon: '<i class="fa-solid fa-pencil"></i>',
                    label: 'Rename',
                    action: async function () { await self.rename(); }
                },
                {
                    icon: '<i class="fa-solid fa-trash-can"></i>',
                    label: 'Delete',
                    action: async function () { await self.remove(); }
                },
            ]);
        }
        createTreeElement() {
            const self = this;
            this.container.innerHTML = '';
            this.label = Div({
                parent: this.container,
                className: 'label',
                innerHTML: `${this.icon()}<span>${this.name()}</span>`,
                listeners: [
                    {
                        type: 'click', listener: function () {
                            self.activate({ left: true });
                        }
                    },
                    {
                        type: 'contextmenu', listener: function (mouseEvent) {
                            contextMenu.show(mouseEvent);
                        }
                    }
                ]
            });
            this.label.draggable = true;
            this.label.addEventListener('dragstart', function (ev) {
                globals.dragFile = self;
            });
            this.input = document.createElement('input');
            this.input.type = 'checkbox';
            this.input.checked = false;
            this.input.addEventListener('change', async function () {
                if (self.input.checked) {
                    await self.loadModel();
                    //self.activate({ left: (leftEditor.activeFile === self), right: (rightEditor.activeFile === self) });
                }
                else {
                    self.unloadModel();
                }
            });
            const contextMenu = this.contextMenu();
            this.container.appendChild(this.input);
            this.container.appendChild(this.label);
            this.container.appendChild(contextMenu.container);
            return this.container;
        }
        async activate(editor, createTab) {
            if (!this.input.checked) {
                this.input.checked = true;
                await this.loadModel();
            }
            //this.model.setValue(this.model.getValue())
            if (editor.left) {
                leftEditor.activeFile?.deactivate({ left: true });
                leftEditor.setModel(this.model);
                leftEditor.restoreViewState(this.state.viewState);
                this.label.classList.add('active', 'left');
                leftEditor.activeFile = this;
                if (!this.leftTab) {
                    this.createTab({ left: true });
                }
                else {
                    this.leftTab.classList.add('active');
                }
            }
            if (editor.right) {
                rightEditor.activeFile?.deactivate({ right: true });
                rightEditor.setModel(this.model);
                rightEditor.restoreViewState(this.state.viewState);
                this.label.classList.add('active', 'right');
                rightEditor.activeFile = this;
                if (!this.rightTab) {
                    this.createTab({ right: true });
                }
                else {
                    this.rightTab.classList.add('active');
                }
            }
        }
        deactivate(editor) {
            this.state.viewState = leftEditor.saveViewState();
            // if (editor === undefined) {
            //   editor.left = true
            // }
            if (editor.left) {
                this.label?.classList.remove('left');
                leftEditor.activeFile = null;
                leftEditor.setModel(null);
                this.leftTab?.classList.remove('active');
            }
            if (editor.right) {
                this.label?.classList.remove('right');
                rightEditor.activeFile = null;
                rightEditor.setModel(null);
                this.rightTab?.classList.remove('active');
            }
            if (!(rightEditor.activeFile === this || leftEditor.activeFile === this)) {
                this.label?.classList.remove('active');
            }
        }
        createTab(side) {
            const self = this;
            const contextMenu = new Menu(this, [
                {
                    icon: '<i class="fa-solid fa-circle-left"></i>',
                    label: 'Move Left',
                    action: async function () {
                        if (tab.previousElementSibling) {
                            tab.parentNode.insertBefore(tab, tab.previousElementSibling);
                        }
                    }
                },
                {
                    icon: '<i class="fa-solid fa-circle-right"></i>',
                    label: 'Move Right',
                    action: async function () {
                        if (tab.nextElementSibling) {
                            tab.parentNode.insertBefore(tab, tab.nextElementSibling);
                        }
                    }
                },
                {
                    icon: '<i class="fa-solid fa-xmark"></i>',
                    label: 'Close',
                    action: async function () {
                        tab.remove();
                        self.deactivate(side);
                        if (side.left) {
                            self.leftTab = null;
                        }
                        if (side.right) {
                            self.rightTab = null;
                        }
                    }
                },
            ]);
            const tab = Div({
                parent: this.container,
                className: 'tab active',
                innerHTML: `${this.icon()}<span>${this.name()}</span>`,
                listeners: [
                    {
                        type: 'click', listener: function (mouseEvent) {
                            if (!contextMenu.container.contains(mouseEvent.target)) {
                                self.activate(side);
                            }
                        }
                    },
                    {
                        type: 'contextmenu', listener: function (mouseEvent) {
                            if (!contextMenu.container.contains(mouseEvent.target)) {
                                contextMenu.show(mouseEvent);
                            }
                        }
                    }
                ]
            });
            tab.appendChild(contextMenu.container);
            if (side.left) {
                this.leftTab = tab;
                leftTabs.appendChild(tab);
            }
            if (side.right) {
                this.rightTab = tab;
                rightTabs.appendChild(tab);
            }
        }
        async run() {
            // if (this.language() === 'typescript') {
            // 	var code = compileTypescript(await this.getText(), {
            // 		parserOpts: {
            // 			allowReturnOutsideFunction: true
            // 		}
            // 	});
            // } else {
            // 	var code = await this.getText();
            // }
            // Function(code)()
        }
    }
    const saveTimers = {};
    var saveCount = 0;
    function autoSave(file, timer) {
        document.getElementById('autoSave').classList.add('orange');
        document.getElementById('compileButton').classList.add('orange');
        clearTimeout(saveTimers[file.path()]);
        saveTimers[file.path()] = setTimeout(async function () {
            document.getElementById('autoSave').children[0].classList.add('fa-flip');
            saveCount++;
            await file.save();
            saveCount--;
            if (saveCount === 0) {
                document.getElementById('autoSave').children[0].classList.remove('fa-flip');
            }
            delete saveTimers[file.path()];
            if (Object.keys(saveTimers).length == 0) {
                document.getElementById('autoSave').classList.remove('orange');
            }
        }, timer);
    }

    class Folder {
        handle;
        parentFolder;
        container;
        label;
        childrenContainer;
        fileContainer;
        folderContainer;
        files;
        folders;
        state;
        constructor(handle, parentFolder) {
            this.handle = handle;
            this.parentFolder = parentFolder;
            this.state = { expanded: false, loaded: parentFolder?.state.loaded ?? false };
            this.files = {};
            this.folders = {};
            this.container = Div({
                className: 'container folder'
            });
        }
        name() {
            return this.handle.name;
        }
        path() {
            if (this.parentFolder === globals.rootFolder) {
                return this.name();
            }
            else {
                return this.parentFolder.path() + '/' + this.name();
            }
        }
        icon() {
            return '<i class="fa-solid fa-folder"></i>';
        }
        contextMenu() {
            const self = this;
            return new Menu(this, [
                {
                    icon: '<i class="fa-solid fa-file-circle-plus"></i>',
                    label: 'New File',
                    action: async function () { var file = await self.newFile(); file.activate({ left: true }); self.expand(); }
                },
                {
                    icon: '<i class="fa-solid fa-folder-plus"></i>',
                    label: 'New Folder',
                    action: async function () { await self.newFolder(); self.expand(); }
                },
                {
                    icon: '<i class="fa-solid fa-rotate"></i>',
                    label: 'Refresh',
                    action: async function () { await self.reload(); }
                },
                {
                    icon: '<i class="fa-solid fa-circle-plus"></i>',
                    label: 'Load Models',
                    action: async function () { await self.loadModels(); }
                },
                {
                    icon: '<i class="fa-solid fa-circle-minus"></i>',
                    label: 'Unload Models',
                    action: async function () { await self.unloadModels(); }
                },
                {
                    icon: '<i class="fa-solid fa-trash-can"></i>',
                    label: 'Delete',
                    action: async function () { await self.remove(); }
                },
            ]);
        }
        createTreeElement() {
            const self = this;
            this.container.innerHTML = '';
            this.label = Div({
                parent: this.container,
                className: 'label',
                listeners: [
                    {
                        type: 'click', listener: function () {
                            (self.state.expanded) ? self.collapse() : self.expand();
                        }
                    },
                    {
                        type: 'contextmenu', listener: function (mouseEvent) {
                            contextMenu.show(mouseEvent);
                        }
                    }
                ]
            });
            this.childrenContainer = Div({
                parent: this.container,
                className: 'children hidden'
            });
            this.folderContainer = Div({
                parent: this.childrenContainer,
            });
            this.fileContainer = Div({
                parent: this.childrenContainer,
            });
            const contextMenu = this.contextMenu();
            this.container.appendChild(contextMenu.container);
            this.collapse();
            return this.container;
        }
        collapse() {
            this.label.innerHTML = `
		<i class='fa-solid fa-chevron-right'></i>
		<i class='fa-solid fa-folder'></i>
		<span class='tree-label-name'>${this.name()}</span>`;
            this.childrenContainer.classList.toggle('hidden', true);
            this.state.expanded = false;
        }
        expand() {
            this.label.innerHTML = `
		<i class='fa-solid fa-chevron-down'></i>
		<i class='fa-solid fa-folder-open'></i>
		<span class='tree-label-name'>${this.name()}</span>`;
            this.childrenContainer.classList.toggle('hidden', false);
            this.state.expanded = true;
        }
        async loadTree() {
            await this.unloadModels();
            this.files = {};
            this.folders = {};
            const treeElement = this.createTreeElement();
            // @ts-ignore
            for await (const child of this.handle.values()) {
                if (child.kind == 'directory') {
                    this.loadFolder(new Folder(child, this));
                }
                else {
                    this.loadFile(new File(child, this));
                }
            }
            return treeElement;
        }
        async loadFolder(folder) {
            this.folders[folder.name()] = folder;
            let keys = Object.keys(this.folders).sort();
            let nextIndex = keys.indexOf(folder.name()) + 1;
            let nextItem = this.folders[keys[nextIndex]];
            const elem = await folder.loadTree();
            this.folderContainer.insertBefore(elem, nextItem?.container);
        }
        async loadFile(file) {
            this.files[file.name()] = file;
            let keys = Object.keys(this.files).sort();
            let nextIndex = keys.indexOf(file.name()) + 1;
            let nextItem = this.files[keys[nextIndex]];
            const elem = await file.loadTree();
            this.fileContainer.insertBefore(elem, nextItem?.container);
        }
        async loadModels() {
            for await (const [key, file] of Object.entries(this.files)) {
                if (file.language()) {
                    await file.loadModel();
                }
            }
            for await (const [key, folder] of Object.entries(this.folders)) {
                if (folder.name()[0] !== '!') {
                    await folder.loadModels();
                }
            }
        }
        async unloadModels() {
            for await (const [key, file] of Object.entries(this.files)) {
                file.unloadModel();
            }
            for await (const [key, folder] of Object.entries(this.folders)) {
                await folder.unloadModels();
            }
        }
        async reload() {
            await this.loadTree();
            (this.state.expanded) ? this.collapse() : this.expand();
        }
        async remove(hideWarning) {
            if (hideWarning || confirm(`Are you sure you want to delete ${this.name()}`)) {
                for await (const [key, file] of Object.entries(this.files)) {
                    await file.remove(true);
                }
                for await (const [key, folder] of Object.entries(this.folders)) {
                    await folder.remove(true);
                }
                this.container.remove();
                // @ts-ignore
                await this.handle.remove({ recursive: true });
            }
        }
        async newFile(filePath) {
            const path = filePath ?? prompt("Name of new file with extension");
            if (!path)
                return null;
            const pathArray = path.split('/');
            const fileName = pathArray.pop();
            const folderName = pathArray.join('/');
            var folder = await this.newFolder(folderName);
            if (!fileName)
                return null;
            try {
                var handle = await folder.handle.getFileHandle(fileName);
                var file = folder.files[fileName];
                return file;
            }
            catch (e) {
                var handle = await folder.handle.getFileHandle(fileName, { create: true });
                var file = new File(handle, folder);
                await folder.loadFile(file);
                return file;
            }
        }
        async newFolder(folderPath) {
            const path = folderPath ?? prompt("Name of new folder");
            if (!path)
                return this;
            const pathArray = path.split('/');
            const firstFolderName = pathArray.shift();
            const nextFolderName = pathArray.join('/');
            try {
                var handle = await this.handle.getDirectoryHandle(firstFolderName);
                var folder = this.folders[firstFolderName];
                return await folder.newFolder(nextFolderName);
            }
            catch (e) {
                var handle = await this.handle.getDirectoryHandle(firstFolderName, { create: true });
                var folder = new Folder(handle, this);
                await this.loadFolder(folder);
                return await folder.newFolder(nextFolderName);
            }
        }
    }

    //import './compile'
    window.addEventListener('error', function (ev) {
        console.log(ev.message);
    });
    console.log = function (text) {
        document.getElementById('log').innerText += '\n' + text;
        document.getElementById('viewLog').classList.add('orange');
    };
    const logContainer = document.getElementById('logContainer');
    document.getElementById('viewLog').addEventListener('click', function () {
        logContainer.classList.toggle('hidden');
        document.getElementById('viewLog').classList.remove('orange');
    });
    logContainer.addEventListener('click', function (ev) {
        if (ev.target === logContainer) {
            logContainer.classList.add('hidden');
            document.getElementById('log').innerHTML = '';
        }
    });
    // export var rootFolder: Folder;
    document.getElementById('openFolder').addEventListener('click', async function () {
        try {
            // @ts-ignore
            const folderHandle = await window.showDirectoryPicker();
            await verifyPermission(folderHandle);
            globals.rootFolder = new Folder(folderHandle);
            document.title = globals.rootFolder.name();
            const tree = document.getElementById('tree');
            tree.innerHTML = '';
            tree.appendChild(await globals.rootFolder.loadTree());
            await globals.rootFolder.loadModels();
        }
        catch (e) {
            console.log(e);
        }
        async function verifyPermission(folderHandle) {
            // Check if we already have permission, if so, return true.
            // @ts-ignore
            if ((await folderHandle.queryPermission({ mode: 'readwrite' })) === "granted") {
                return true;
            }
            // Request permission to the file, if the user grants permission, return true.
            // @ts-ignore
            if ((await folderHandle.requestPermission({ mode: 'readwrite' })) === "granted") {
                return true;
            }
            // The user did not grant permission, return false.
            return false;
        }
    });

})(monaco, rollup, Babel, ts);
