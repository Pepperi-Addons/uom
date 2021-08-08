'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function createCommonjsModule(fn, basedir, module) {
	return module = {
		path: basedir,
		exports: {},
		require: function (path, base) {
			return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
		}
	}, fn(module, module.exports), module.exports;
}

function commonjsRequire () {
	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
}

var cpiSide = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {};

});

async function load(configuration) {
    var _a;
    console.log('inside load of uom module cpi side file\n before subscribing to interceptor');
    (_a = pepperi.events.on('TSAButton')) === null || _a === void 0 ? void 0 : _a.use(async (data, next, main) => {
        let block = await confirm('this will run before relevant program. continue?');
        await next(block ? null : main);
        await alert('program had finished running.');
    });
}

exports.load = load;
