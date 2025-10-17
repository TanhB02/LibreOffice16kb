/* -*- js-indent-level: 8; fill-column: 100 -*- */
/*
 * Copyright the Collabora Online contributors.
 *
 * SPDX-License-Identifier: MPL-2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
/* eslint-disable no-inner-declarations */
/* eslint no-unused-vars: ["warn", { "argsIgnorePattern": "^_" }] */
/* global importScripts Uint8Array */
if ('undefined' === typeof window) {
    self.L = {};
    importScripts('CanvasTileUtils.js');
    addEventListener('message', onMessage);
    console.info('CanvasTileWorker initialised');
    function onMessage(e) {
        var e_1, _a;
        switch (e.data.message) {
            case 'endTransaction':
                var tileByteSize = e.data.tileSize * e.data.tileSize * 4;
                var decompressed = [];
                var buffers = [];
                try {
                    for (var _b = __values(e.data.deltas), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var tile = _c.value;
                        var deltas = self.fzstd.decompress(tile.rawDelta);
                        tile.keyframeDeltaSize = 0;
                        // Decompress the keyframe buffer
                        if (tile.isKeyframe) {
                            var keyframeBuffer = new Uint8Array(tileByteSize);
                            tile.keyframeDeltaSize = L.CanvasTileUtils.unrle(deltas, e.data.tileSize, e.data.tileSize, keyframeBuffer);
                            tile.keyframeBuffer = new Uint8ClampedArray(keyframeBuffer.buffer, keyframeBuffer.byteOffset, keyframeBuffer.byteLength);
                            buffers.push(tile.keyframeBuffer.buffer);
                        }
                        // Now wrap as Uint8ClampedArray as that's what ImageData requires. Don't do
                        // it earlier to avoid unnecessarily incurring bounds-checking penalties.
                        tile.deltas = new Uint8ClampedArray(deltas.buffer, deltas.byteOffset, deltas.length);
                        // The main thread has no use for the concatenated rawDelta, delete it here
                        // instead of passing it back.
                        delete tile.rawDelta;
                        decompressed.push(tile);
                        buffers.push(tile.deltas.buffer);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                postMessage({
                    message: e.data.message,
                    deltas: decompressed,
                    tileSize: e.data.tileSize,
                }, buffers);
                break;
            default:
                console.error('Unrecognised worker message');
        }
    }
}
//# sourceMappingURL=CanvasTileWorkerSrc.js.map