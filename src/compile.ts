import * as rollup from '@rollup/browser';
import * as Babel from '@babel/standalone';
import * as ts from 'typescript'

import File from './file'
import globals from './globals'


export async function compileFile(file: File) {
    try {

        var bundle = await rollup.rollup({
            input: file.path(),
            plugins: [
                {
                    name: 'loader',
                    resolveId(source, importer) {
                        return resolveModule(source, importer)
                    },
                    async load(id) {
                        return await loadModule(id)
                    }
                }
            ],
        })

        var result = await bundle.generate({ format: 'es' })

        var src = result.output[0].code

        var outputFilePath = prompt("Output Filepath:", file.path() + '.js')


        var outputFile = await globals.rootFolder.newFile(outputFilePath)
        outputFile.setText(src)

    } catch (e) {
        console.log(e)
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
compileButton.addEventListener('click', async function () { await compile() })

export async function compile() {

    try {
        compileButton.children[0].classList.add('fa-spin')

        // @ts-ignore
        window.config = {};
        var configJS = await globals.files['config.js'].getText() as string;
        eval(configJS)

        var bundle = await rollup.rollup({
                                    // @ts-ignore

            ...window.config.rollup,
            plugins: [
                {
                    name: 'loader',
                    resolveId(source, importer) {
                        return resolveModule(source, importer)
                    },
                    async load(id) {
                        // @ts-ignore
                        return await loadModule(id, window.config)
                    }
                }
            ],
        })
                        // @ts-ignore

        var result = await bundle.generate({ format: 'es', ...window.config.outputOptions })

        var src = result.output[0].code
                                // @ts-ignore

        var code = compileJavascript(src, window.config.babel)


                        // @ts-ignore

        var outputFilePath = window.config.outputPath

        var outputFile = await globals.rootFolder.newFile(outputFilePath)
        outputFile.setText(code)


    } catch (e) {
        console.log(e)
    }
    compileButton.children[0].classList.remove('fa-spin')
    compileButton.classList.remove('orange')
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


function resolveModule(sourcePath: string, importerPath: string) {

    if (sourcePath.slice(0, 8) === 'https://') {
        return sourcePath;
    }

    var importerSplit = importerPath ? importerPath.split('/') : [''];
    var sourceSplit = sourcePath.split('/');

    var i = sourceSplit.findLastIndex(s => s === '..')
    if (i >= 0) {
        for (; i >= 0; i--) {
            sourceSplit[i] = importerSplit[i]
        }
        importerSplit = [''];
    }

    if (sourceSplit[0] === '.') {
        sourceSplit[0] = importerSplit.slice(0, importerSplit.length - 1).join('/');
        importerSplit = [''];
    }

    sourcePath = sourceSplit.join('/')

    while (importerSplit.length > 0) {
        importerSplit.pop();
        let testPath = importerSplit.join('/') + (importerSplit.length > 0 ? '/' : '') + sourcePath

        if (globals.files.hasOwnProperty(testPath)) {
            return testPath
        }

        if (globals.files.hasOwnProperty(testPath + '.ts')) {
            return testPath + '.ts'
        }

        if (globals.files.hasOwnProperty(testPath + '.js')) {
            return testPath + '.js'
        }

        if (globals.files.hasOwnProperty(testPath + '.css')) {
            return testPath + '.css'
        }

        if (globals.files.hasOwnProperty(testPath + '.scss')) {
            return testPath + '.scss'
        }
    }
}
                        // @ts-ignore

async function loadModule(sourcePath: string, opts?: typeof window.config): Promise<string> {

    if (sourcePath.slice(0, 8) === 'https://') {
        var response = await fetch(sourcePath)
        var text = await response.text()
        //console.log(JSON.stringify(response.headers.get('Content-Type')) + sourcePath);
        var header = response.headers.get('Content-Type')
        if (header.includes('javascript')) { var language = 'javascript' };
        if (header.includes('css')) { var language = 'css' };
    } else {

        var file = globals.files[sourcePath];

        var text = await file.getText() as string;
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

export function compileTypescript(src: string, opts?: typeof window.config.typescript): string {
    try {
        return ts.transpile(src, {
            jsx: ts.JsxEmit.React,
            module: ts.ModuleKind.ESNext,
            target: ts.ScriptTarget.Latest,

            ...opts
        })
    } catch (e) {
        console.log(e)
    }
}
                        // @ts-ignore

function compileJavascript(src: string, opts: typeof window.config.babel): string {
    try {
        return Babel.transform(src, {
            presets: ['env'],
            // targets: 'ie 11',
            sourceType: "unambiguous",
            filename: "file.ts",
            ...opts
        }).code;
    } catch (e) {
        console.log(e)
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







function compileCSS(src: string) {
    // const style = document.createElement('style');
    // style.innerHTML= JSON.stringify(minifyCSS(src));
    // document.head.appendChild(style);

    const js = `(function(){
      const style = document.createElement('style');
      style.innerHTML= ${JSON.stringify(minifyCSS(src))};
      document.head.appendChild(style);
    })();`
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
