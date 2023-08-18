import * as rollup from '@rollup/browser';
import {babel} from '@rollup/plugin-babel';

const modules = {
	'main.js': "import foo from 'foo.js'; console.log(foo);",
	'foo.js': 'export default 42;'
};

rollup
	.rollup({
		input: 'main.js',
		plugins: [
			{
				name: 'loader',
				resolveId(source) {
					if (modules.hasOwnProperty(source)) {
						return source;
					}
				},
				load(id) {
					if (modules.hasOwnProperty(id)) {
						return modules[id];
					}
				}
			},
      babel({ babelHelpers: 'bundled' })
		]
	})
	.then(bundle => bundle.generate({ format: 'es' }))
	.then(({ output }) => console.log(output[0].code));