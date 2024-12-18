/**
 * @module q5-server
 * @description Run q5 with node.js using node-canvas and jsdom
 */

try {
	global.CairoCanvas ??= require('canvas');
	global.JSDOM ??= require('jsdom').JSDOM;
} catch (e) {
	require('./q5.js');
	module.exports = Q5;
	return;
}

global.window = new JSDOM('', { url: 'http://localhost' }).window;

{
	let props = Object.getOwnPropertyNames(window).concat(Object.getOwnPropertyNames(Object.getPrototypeOf(window)));
	for (let prop of props) {
		if (!global[prop]) {
			Object.defineProperty(global, prop, Object.getOwnPropertyDescriptor(window, prop));
		}
	}
	global.Event = window.Event;
}

require('./q5.js');

Q5._createServerCanvas = function () {
	let cairoCanvas = CairoCanvas.createCanvas(...arguments);
	let domCanvas = window.document.createElement('canvas');

	return new Proxy(cairoCanvas, {
		get: function (target, prop) {
			let t = prop in target ? target : domCanvas;
			let p = t[prop];
			if (typeof p === 'function') return p.bind(t);
			return p;
		},
		set: function (target, prop, value) {
			if (prop in target) {
				target[prop] = value;
			} else {
				domCanvas[prop] = value;
			}
			return true;
		}
	});
};

module.exports = Q5;
