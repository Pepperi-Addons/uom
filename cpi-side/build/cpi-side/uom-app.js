"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.load = void 0;
require("@pepperi-addons/cpi-node");
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
//# sourceMappingURL=uom-app.js.map