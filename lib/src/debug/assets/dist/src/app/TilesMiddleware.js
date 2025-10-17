// @ts-strict-ignore
/* -*- js-indent-level: 8 -*- */
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
// debugging aid.
function hex2string(inData, length) {
    var hexified = [];
    var data = new Uint8Array(inData);
    for (var i = 0; i < length; i++) {
        var hex = data[i].toString(16);
        var paddedHex = ('00' + hex).slice(-2);
        hexified.push(paddedHex);
    }
    return hexified.join('');
}
var TileCoordData = /** @class */ (function () {
    function TileCoordData(left, top, zoom, part, mode) {
        if (zoom === void 0) { zoom = null; }
        if (part === void 0) { part = null; }
        if (mode === void 0) { mode = null; }
        this.x = left;
        this.y = top;
        this.z = zoom !== null ? zoom : app.map.getZoom();
        this.part = part !== null ? part : app.map._docLayer._selectedPart;
        this.mode = mode !== undefined ? mode : 0;
        this.scale = Math.pow(1.2, this.z - 10);
    }
    TileCoordData.prototype.getPos = function () {
        return new L.Point(this.x, this.y);
    };
    TileCoordData.prototype.key = function () {
        return (this.x +
            ':' +
            this.y +
            ':' +
            this.z +
            ':' +
            this.part +
            ':' +
            (this.mode !== undefined ? this.mode : 0));
    };
    TileCoordData.prototype.toString = function () {
        return ('{ left : ' +
            this.x +
            ', top : ' +
            this.y +
            ', z : ' +
            this.z +
            ', part : ' +
            this.part +
            ', mode : ' +
            this.mode +
            ' }');
    };
    TileCoordData.parseKey = function (key) {
        window.app.console.assert(typeof key === 'string', 'key should be a string');
        var k = key.split(':');
        var mode = k.length === 4 ? +k[4] : 0;
        window.app.console.assert(k.length >= 5, 'invalid key format');
        return new TileCoordData(+k[0], +k[1], +k[2], +k[3], mode);
    };
    TileCoordData.keyToTileCoords = function (key) {
        return TileCoordData.parseKey(key);
    };
    return TileCoordData;
}());
var PaneBorder = /** @class */ (function () {
    function PaneBorder(paneBorder, paneXFixed, paneYFixed) {
        this._border = paneBorder;
        this._xFixed = paneXFixed;
        this._yFixed = paneYFixed;
        this._index = 0;
    }
    PaneBorder.prototype.getBorderIndex = function () {
        return this._index;
    };
    PaneBorder.prototype.incBorderIndex = function () {
        this._index += 1;
    };
    PaneBorder.prototype.getBorderBounds = function () {
        return this._border;
    };
    PaneBorder.prototype.isXFixed = function () {
        return this._xFixed;
    };
    PaneBorder.prototype.isYFixed = function () {
        return this._yFixed;
    };
    return PaneBorder;
}());
var RawDelta = /** @class */ (function () {
    function RawDelta(delta, id, isKeyframe) {
        this._delta = delta;
        this._id = id;
        this._isKeyframe = isKeyframe;
    }
    Object.defineProperty(RawDelta.prototype, "length", {
        get: function () {
            return this.delta.length;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RawDelta.prototype, "delta", {
        get: function () {
            return this._delta;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RawDelta.prototype, "id", {
        get: function () {
            return this._id;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RawDelta.prototype, "isKeyframe", {
        get: function () {
            return this._isKeyframe;
        },
        enumerable: false,
        configurable: true
    });
    return RawDelta;
}());
var Tile = /** @class */ (function () {
    function Tile(coords) {
        this.distanceFromView = 0; // distance to the center of the nearest visible area (0 = visible)
        this.image = null; // ImageBitmap ready to render
        this.imgDataCache = null; // flat byte array of image data
        this.rawDeltas = []; // deltas ready to decompress
        this.deltaCount = 0; // how many deltas on top of the keyframe
        this.updateCount = 0; // how many updates did we have
        this.loadCount = 0; // how many times did we get a new keyframe
        this.gcErrors = 0; // count freed keyframe in JS, but kept in wsd.
        this.missingContent = 0; // how many times rendered without content
        this.invalidateCount = 0; // how many invalidations touched this tile
        this.viewId = 0; // canonical view id
        this.wireId = 0; // monotonic timestamp for optimizing fetch
        this.invalidFrom = 0; // a wireId - for avoiding races on invalidation
        this.deltaId = 0; // monotonic id for delta updates
        this.lastPendingId = 0; // the id of the last delta requested to be decompressed
        this.decompressedId = 0; // the id of the last decompressed delta chunk in imgDataCache
        this.lastRendered = performance.timeOrigin;
        this.lastRequestTime = undefined; // when did we last do a tilecombine request.
        this.coords = coords;
    }
    Tile.prototype.hasContent = function () {
        return this.imgDataCache || this.hasKeyframe();
    };
    Tile.prototype.needsFetch = function () {
        return this.invalidFrom >= this.wireId || !this.hasContent();
    };
    Tile.prototype.needsRehydration = function () {
        if (this.rawDeltas.length === 0)
            return false;
        var lastId = this.rawDeltas[this.rawDeltas.length - 1].id;
        return this.lastPendingId !== lastId;
    };
    Tile.prototype.hasKeyframe = function () {
        return !!this.rawDeltas.length;
    };
    Tile.prototype.isReady = function () {
        return this.decompressedId === this.lastPendingId;
    };
    /// Demand a whole tile back to the keyframe from coolwsd.
    Tile.prototype.forceKeyframe = function (wireId) {
        if (wireId === void 0) { wireId = 0; }
        this.wireId = wireId;
        this.invalidFrom = wireId;
        this.allowFastRequest();
    };
    /// Avoid continually re-requesting tiles for eg. preloading
    Tile.prototype.requestingTooFast = function (now) {
        var tooFast = this.lastRequestTime &&
            now.getTime() - this.lastRequestTime.getTime() < 5000; /* ms */
        return tooFast;
    };
    Tile.prototype.updateLastRequest = function (now) {
        this.lastRequestTime = now;
    };
    /// Allow faster requests
    Tile.prototype.allowFastRequest = function () {
        this.updateLastRequest(undefined);
    };
    Tile.prototype.isReadyToDraw = function () {
        return !!this.image;
    };
    return Tile;
}());
var TileManager = /** @class */ (function () {
    function TileManager() {
    }
    TileManager.initialize = function () {
        var _this = this;
        if (window.Worker && !window.ThisIsAMobileApp) {
            window.app.console.info('Creating CanvasTileWorker');
            this.worker = new Worker(app.LOUtil.getURL('/src/layer/tile/TileWorker.js'));
            this.worker.addEventListener('message', function (e) {
                return _this.onWorkerMessage(e);
            });
            this.worker.addEventListener('error', function (e) { return _this.disableWorker(e); });
        }
    };
    TileManager.isReceivedFirstTile = function () {
        return this.receivedFirstTile;
    };
    TileManager.appendAfterFirstTileTask = function (task) {
        this.afterFirstTileTasks.push(task);
    };
    /// Called before frame rendering to update details
    TileManager.updateOverlayMessages = function () {
        var e_1, _a;
        if (!app.map._debug.tileDataOn)
            return;
        var totalSize = 0;
        var n_bitmaps = 0;
        var n_current = 0;
        try {
            for (var _b = __values(this.tiles.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var tile = _c.value;
                if (tile.image)
                    ++n_bitmaps;
                if (tile.distanceFromView === 0)
                    ++n_current;
                totalSize += tile.rawDeltas.reduce(function (a, c) { return a + c.length; }, 0);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        var mismatch = '';
        if (n_bitmaps != this.tileBitmapList.length)
            mismatch = '\nmismatch! ' + n_bitmaps + ' vs. ' + this.tileBitmapList;
        app.map._debug.setOverlayMessage('top-tileMem', 'Tiles: ' +
            String(this.tiles.size).padStart(4, ' ') +
            ', bitmaps: ' +
            String(n_bitmaps).padStart(3, ' ') +
            ' current ' +
            String(n_current).padStart(3, ' ') +
            ', Delta size ' +
            Math.ceil(totalSize / 1024) +
            '(KB)' +
            ', Bitmap size: ' +
            Math.ceil(n_bitmaps / 2) +
            '(MB)' +
            mismatch);
    };
    TileManager.sortTileKeysByDistance = function () {
        var _this = this;
        return Array.from(this.tiles.keys()).sort(function (a, b) {
            return (_this.tiles.get(b).distanceFromView - _this.tiles.get(a).distanceFromView);
        });
    };
    // Set a high and low watermark of how many bitmaps we want
    // and expire old ones
    TileManager.garbageCollect = function (discardAll) {
        var e_2, _a;
        if (discardAll === void 0) { discardAll = false; }
        // real RAM sizes for keyframes + delta cache in memory.
        var highDeltaMemory = 120 * 1024 * 1024; // 120Mb
        var lowDeltaMemory = 100 * 1024 * 1024; // 100Mb
        // number of tiles
        var highTileCount = 2048;
        var lowTileCount = highTileCount - 128;
        if (discardAll) {
            highDeltaMemory = 0;
            lowDeltaMemory = 0;
            highTileCount = 0;
            lowTileCount = 0;
        }
        /* uncomment to exercise me harder. */
        /* highDeltaMemory = 1024*1024; lowDeltaMemory = 1024*128;
           highTileCount = 100; lowTileCount = 50; */
        // FIXME: could maintain this as we go rather than re-accounting it regularly.
        var totalSize = 0;
        var tileCount = 0;
        try {
            for (var _b = __values(this.tiles.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var tile = _c.value;
                // Don't count size of tiles that are visible. We don't have
                // a mechanism to immediately rehydrate tiles, so GC'ing visible tiles would
                // cause flickering.
                if (tile.distanceFromView !== 0) {
                    totalSize += tile.rawDeltas.reduce(function (a, c) { return a + c.length; }, 0);
                    tileCount++;
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
        // FIXME: We should consider also sorting keys by wireId -
        // which is monotonic server rendering ~time.
        // Try to re-use sorting whenever we can - it's expensive
        var sortedKeys = [];
        // Trim memory down to size.
        if (totalSize > highDeltaMemory) {
            var keys_1 = this.sortTileKeysByDistance();
            sortedKeys = keys_1;
            for (var i = 0; i < keys_1.length && totalSize > lowDeltaMemory; ++i) {
                var key = keys_1[i];
                var tile = this.tiles.get(key);
                if (tile.rawDeltas.length && tile.distanceFromView !== 0) {
                    var rawDeltaSize = tile.rawDeltas.reduce(function (a, c) { return a + c.length; }, 0);
                    totalSize -= rawDeltaSize;
                    if (this.debugDeltas)
                        window.app.console.log('Reclaim delta ' + key + ' memory: ' + rawDeltaSize + ' bytes');
                    this.reclaimTileBitmapMemory(tile);
                    tile.rawDeltas = [];
                    tile.forceKeyframe();
                }
            }
        }
        // Trim the number of tiles down too ...
        if (tileCount > highTileCount) {
            var keys = sortedKeys;
            if (!keys.length)
                keys = this.sortTileKeysByDistance();
            for (var i = 0; i < keys.length - lowTileCount; ++i) {
                var key = keys[i];
                var tile = this.tiles.get(key);
                if (tile.distanceFromView !== 0)
                    this.removeTile(keys[i]);
            }
        }
    };
    // When a new bitmap is set on a tile we should see if we need to expire an old tile
    TileManager.setBitmapOnTile = function (tile, bitmap) {
        // 4k screen -> 8Mpixel, each tile is 64kpixel uncompressed
        var highNumBitmaps = 250; // ~60Mb.
        var assertChecks = false;
        if (tile.image) {
            // fast case - no impact on count of tiles or bitmap list:
            if (assertChecks)
                window.app.console.assert(!!this.tileBitmapList.find(function (i) { return i == tile; }));
            tile.image.close();
            tile.image = bitmap;
            return;
        }
        if (assertChecks)
            window.app.console.assert(!this.tileBitmapList.find(function (i) { return i == tile; }));
        // free the last tile if we need to
        if (this.tileBitmapList.length > highNumBitmaps)
            this.reclaimTileBitmapMemory(this.tileBitmapList[this.tileBitmapList.length - 1]);
        // current tiles are first:
        if (tile.distanceFromView === 0)
            this.tileBitmapList.unshift(tile);
        else {
            var low = 0;
            var high = this.tileBitmapList.length;
            var distance_1 = tile.distanceFromView;
            // sort on insertion
            while (low < high) {
                var mid = Math.floor((low + high) / 2);
                if (this.tileBitmapList[mid].distanceFromView < distance_1)
                    low = mid + 1;
                else
                    high = mid;
            }
            this.tileBitmapList.splice(low, 0, tile);
        }
        tile.image = bitmap;
    };
    TileManager.sortTileBitmapList = function () {
        // furthest away at the end
        this.tileBitmapList.sort(function (a, b) { return a.distanceFromView - b.distanceFromView; });
    };
    // returns negative for not present, and otherwise proportion, low is low expiry.
    TileManager.getExpiryFactor = function (tile) {
        return (this.tileBitmapList.indexOf(tile) /
            Math.max(this.tileBitmapList.length, 1));
    };
    TileManager.endTransactionHandleBitmaps = function (deltas, bitmaps) {
        var e_3, _a;
        var visibleRanges = this.getVisibleRanges();
        while (deltas.length) {
            var delta = deltas.shift();
            var bitmap = bitmaps.shift();
            var tile = this.tiles.get(delta.key);
            if (!tile)
                continue;
            this.setBitmapOnTile(tile, bitmap);
            if (tile.isReady())
                this.tileReady(tile.coords, visibleRanges);
        }
        if (this.pendingTransactions.length === 0)
            window.app.console.warn('Unexpectedly received decompressed deltas');
        else {
            var callbacks = this.pendingTransactions.shift();
            while (callbacks.length)
                callbacks.pop()();
        }
        if (this.pausedForDehydration) {
            // Check if all current tiles are accounted for and resume drawing if so.
            var shouldUnpause = true;
            try {
                for (var _b = __values(this.tiles.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var tile = _c.value;
                    if (tile.distanceFromView === 0 && !tile.isReady()) {
                        shouldUnpause = false;
                        break;
                    }
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_3) throw e_3.error; }
            }
            if (shouldUnpause) {
                app.sectionContainer.resumeDrawing();
                this.pausedForDehydration = false;
            }
        }
        this.garbageCollect();
    };
    TileManager.createTileBitmap = function (tile, delta, deltas, bitmaps) {
        if (tile.imgDataCache) {
            bitmaps.push(createImageBitmap(tile.imgDataCache, {
                premultiplyAlpha: 'none',
            }));
            deltas.push(delta);
        }
        else {
            window.app.console.warn('Unusual: Tried to create a tile bitmap with no image data');
        }
    };
    TileManager.decompressPendingDeltas = function (message) {
        var _this = this;
        if (this.worker) {
            this.worker.postMessage({
                message: message,
                deltas: this.pendingDeltas,
                tileSize: this.tileSize,
                current: Array.from(this.tiles.keys()).filter(function (key) { return _this.tiles.get(key).distanceFromView === 0; }),
            }, this.pendingDeltas.map(function (x) { return x.rawDelta.buffer; }));
        }
        else {
            // Synchronous path
            this.onWorkerMessage({
                data: {
                    message: 'endTransaction',
                    deltas: this.pendingDeltas,
                    tileSize: this.tileSize,
                },
            });
        }
        this.pendingDeltas.length = 0;
    };
    TileManager.applyCompressedDelta = function (tile, rawDeltas, isKeyframe, wireMessage, ids) {
        if (this.inTransaction === 0)
            window.app.console.warn('applyCompressedDelta called outside of transaction');
        // Concatenate the raw deltas for decompression. This also has the benefit of copying
        // them, which allows us to transfer full ownership of the memory to a worker.
        var rawDelta = new Uint8Array(rawDeltas.reduce(function (a, c) { return a + c.length; }, 0));
        rawDeltas.reduce(function (a, c) {
            rawDelta.set(c.delta, a);
            return a + c.length;
        }, 0);
        var e = {
            key: tile.coords.key(),
            rawDelta: rawDelta,
            isKeyframe: isKeyframe,
            wireMessage: wireMessage,
            ids: ids,
        };
        tile.lastPendingId = ids[1];
        this.pendingDeltas.push(e);
    };
    TileManager.applyDeltaChunk = function (imgData, delta, oldData, width, height) {
        var pixSize = width * height * 4;
        if (this.debugDeltas)
            window.app.console.log('Applying a delta of length ' +
                delta.length +
                ' image size: ' +
                pixSize);
        // + ' hex: ' + hex2string(delta, delta.length));
        var offset = 0;
        // Green-tinge the old-Data ...
        if (0) {
            for (var i = 0; i < pixSize; ++i)
                oldData[i * 4 + 1] = 128;
        }
        // wipe to grey.
        if (0) {
            for (var i = 0; i < pixSize * 4; ++i)
                imgData.data[i] = 128;
        }
        // Apply delta.
        var stop = false;
        for (var i = 0; i < delta.length && !stop;) {
            switch (delta[i]) {
                case 99: // 'c': // copy row
                    var count = delta[i + 1];
                    var srcRow = delta[i + 2];
                    var destRow = delta[i + 3];
                    if (this.debugDeltasDetail)
                        window.app.console.log('[' +
                            i +
                            ']: copy ' +
                            count +
                            ' row(s) ' +
                            srcRow +
                            ' to ' +
                            destRow);
                    i += 4;
                    for (var cnt = 0; cnt < count; ++cnt) {
                        var src = (srcRow + cnt) * width * 4;
                        var dest = (destRow + cnt) * width * 4;
                        for (var j = 0; j < width * 4; ++j) {
                            imgData.data[dest + j] = oldData[src + j];
                        }
                    }
                    break;
                case 100: // 'd': // new run
                    destRow = delta[i + 1];
                    var destCol = delta[i + 2];
                    var span = delta[i + 3];
                    offset = destRow * width * 4 + destCol * 4;
                    if (this.debugDeltasDetail)
                        window.app.console.log('[' +
                            i +
                            ']: apply new span of size ' +
                            span +
                            ' at pos ' +
                            destCol +
                            ', ' +
                            destRow +
                            ' into delta at byte: ' +
                            offset);
                    i += 4;
                    span *= 4;
                    for (var j = 0; j < span; ++j)
                        imgData.data[offset++] = delta[i + j];
                    i += span;
                    // imgData.data[offset - 2] = 256; // debug - blue terminator
                    break;
                case 116: // 't': // terminate delta new one next
                    stop = true;
                    i++;
                    break;
                default:
                    console.log('[' + i + ']: ERROR: Unknown delta code ' + delta[i]);
                    i = delta.length;
                    break;
            }
        }
        return i;
    };
    TileManager.checkTileMsgObject = function (msgObj) {
        if (typeof msgObj !== 'object' ||
            typeof msgObj.x !== 'number' ||
            typeof msgObj.y !== 'number' ||
            typeof msgObj.tileWidth !== 'number' ||
            typeof msgObj.tileHeight !== 'number' ||
            typeof msgObj.part !== 'number' ||
            (typeof msgObj.mode !== 'number' && typeof msgObj.mode !== 'undefined')) {
            window.app.console.error('Unexpected content in the parsed tile message.');
        }
    };
    TileManager.checkDocLayer = function () {
        if (this._docLayer)
            return true;
        else if (!this._docLayer && app.map._docLayer) {
            this._docLayer = app.map._docLayer;
            return true;
        }
        else
            return false;
    };
    TileManager.getMaxTileCountToPrefetch = function (tileSize) {
        var viewTileWidth = Math.floor((this._pixelBounds.getSize().x + tileSize - 1) / tileSize);
        var viewTileHeight = Math.floor((this._pixelBounds.getSize().y + tileSize - 1) / tileSize);
        // Read-only views can much more agressively pre-load
        return (Math.ceil((viewTileWidth * viewTileHeight) / 4) *
            (!this._hasEditPerm ? 4 : 1));
    };
    TileManager.updateProperties = function () {
        var updated = false;
        var zoom = app.map.getZoom();
        if (this._zoom !== zoom) {
            this._zoom = zoom;
            updated = true;
        }
        var part = this._docLayer._selectedPart;
        if (this._preFetchPart !== part) {
            this._preFetchPart = part;
            updated = true;
        }
        var mode = this._docLayer._selectedMode;
        if (this._preFetchMode !== mode) {
            this._preFetchMode = mode;
            updated = true;
        }
        var hasEditPerm = app.map.isEditMode();
        if (this._hasEditPerm !== hasEditPerm) {
            this._hasEditPerm = hasEditPerm;
            updated = true;
        }
        var center = app.map.getCenter();
        var pixelBounds = app.map.getPixelBoundsCore(center, this._zoom);
        if (!this._pixelBounds || !pixelBounds.equals(this._pixelBounds)) {
            this._pixelBounds = pixelBounds;
            updated = true;
        }
        var splitPanesContext = this._docLayer.getSplitPanesContext();
        var splitPos = splitPanesContext
            ? splitPanesContext.getSplitPos()
            : new L.Point(0, 0);
        if (!this._splitPos || !splitPos.equals(this._splitPos)) {
            this._splitPos = splitPos;
            updated = true;
        }
        return updated;
    };
    TileManager.computeBorders = function () {
        // Need to compute borders afresh and fetch tiles for them.
        this._borders = []; // Stores borders for each split-pane.
        var tileRanges = this.pxBoundsToTileRanges(this._pixelBounds);
        var splitPanesContext = this._docLayer.getSplitPanesContext();
        var paneStatusList = splitPanesContext
            ? splitPanesContext.getPanesProperties()
            : [{ xFixed: false, yFixed: false }];
        window.app.console.assert(tileRanges.length === paneStatusList.length, 'tileRanges and paneStatusList should agree on the number of split-panes');
        for (var paneIdx = 0; paneIdx < tileRanges.length; ++paneIdx) {
            if (paneStatusList[paneIdx].xFixed && paneStatusList[paneIdx].yFixed) {
                continue;
            }
            var tileRange = tileRanges[paneIdx];
            var paneBorder = new L.Bounds(tileRange.min.add(new L.Point(-1, -1)), tileRange.max.add(new L.Point(1, 1)));
            this._borders.push(new PaneBorder(paneBorder, paneStatusList[paneIdx].xFixed, paneStatusList[paneIdx].yFixed));
        }
    };
    TileManager.clearTilesPreFetcher = function () {
        if (this._tilesPreFetcher !== undefined) {
            clearInterval(this._tilesPreFetcher);
            this._tilesPreFetcher = undefined;
        }
    };
    TileManager.preFetchPartTiles = function (part, mode) {
        this.updateProperties();
        var tileRange = this.pxBoundsToTileRange(this._pixelBounds);
        var tileCombineQueue = [];
        for (var j = tileRange.min.y; j <= tileRange.max.y; j++) {
            for (var i = tileRange.min.x; i <= tileRange.max.x; i++) {
                var coords = new TileCoordData(i * this.tileSize, j * this.tileSize, this._zoom, part, mode);
                if (!this.isValidTile(coords))
                    continue;
                var key = coords.key();
                if (!this.tileNeedsFetch(key))
                    continue;
                tileCombineQueue.push(coords);
            }
        }
        this.sendTileCombineRequest(tileCombineQueue);
    };
    TileManager.queueAcknowledgement = function (tileMsgObj) {
        // Queue acknowledgment, that the tile message arrived
        this.queuedProcessed.push(+tileMsgObj.wireId);
    };
    TileManager.twipsToCoords = function (twips) {
        return new TileCoordData(Math.round(twips.x / twips.tileWidth) * this.tileSize, Math.round(twips.y / twips.tileHeight) * this.tileSize);
    };
    TileManager.tileMsgToCoords = function (tileMsg) {
        var coords = this.twipsToCoords(tileMsg);
        coords.z = tileMsg.zoom;
        coords.part = tileMsg.part;
        coords.mode = tileMsg.mode !== undefined ? tileMsg.mode : 0;
        return coords;
    };
    TileManager.checkPointers = function () {
        if (app.map && app.map._docLayer)
            return true;
        else
            return false;
    };
    TileManager.hasPendingTransactions = function () {
        return this.inTransaction > 0 || this.pendingTransactions.length;
    };
    TileManager.beginTransaction = function () {
        ++this.inTransaction;
    };
    TileManager.getVisibleRanges = function () {
        var zoom = Math.round(app.map.getZoom());
        var pixelBounds = app.map.getPixelBoundsCore(app.map.getCenter(), zoom);
        return app.map._docLayer._splitPanesContext
            ? app.map._docLayer._splitPanesContext.getPxBoundList(pixelBounds)
            : [pixelBounds];
    };
    TileManager.tileZoomIsCurrent = function (coords) {
        var scale = Math.pow(1.2, app.map.getZoom() - 10);
        return Math.round(coords.scale * 1000) === Math.round(scale * 1000);
    };
    TileManager.tileReady = function (coords, visibleRanges) {
        var key = coords.key();
        var tile = this.tiles.get(key);
        if (!tile)
            return;
        // Discard old raw deltas
        for (var i = tile.rawDeltas.length - 1; i > 0; --i) {
            if (tile.rawDeltas[i].isKeyframe) {
                tile.rawDeltas = tile.rawDeltas.splice(i);
                break;
            }
        }
        var emptyTilesCountChanged = false;
        if (this.emptyTilesCount > 0) {
            this.emptyTilesCount -= 1;
            emptyTilesCountChanged = true;
        }
        if (app.map && emptyTilesCountChanged && this.emptyTilesCount === 0) {
            app.map.fire('statusindicator', { statusType: 'alltilesloaded' });
        }
        // Request a redraw if the tile is visible
        var tileBounds = new L.Bounds([tile.coords.x, tile.coords.y], [tile.coords.x + this.tileSize, tile.coords.y + this.tileSize]);
        if (tileBounds.intersectsAny(visibleRanges))
            app.sectionContainer.requestReDraw();
    };
    TileManager.createTile = function (coords, key) {
        if (this.tiles.has(key)) {
            if (this.debugDeltas)
                window.app.console.debug('Already created tile ' + key);
            return this.tiles.get(key);
        }
        var tile = new Tile(coords);
        this.tiles.set(key, tile);
        return tile;
    };
    // Make the given tile current and rehydrates if necessary. Returns true if the tile
    // has pending updates.
    TileManager.makeTileCurrent = function (tile) {
        tile.distanceFromView = 0;
        tile.allowFastRequest();
        this.rehydrateTile(tile, false);
        return !tile.isReady();
    };
    TileManager.rehydrateTile = function (tile, wireMessage) {
        if (tile.needsRehydration()) {
            // Re-hydrate tile from cached raw deltas.
            if (this.debugDeltas)
                window.app.console.log('Restoring a tile from cached delta at ' + tile.coords.key());
            // Get the index of the last stored keyframe
            // FIXME: EcmaScript 2023 has Array.findLastIndex
            var firstDelta = 0;
            for (var i = tile.rawDeltas.length - 1; i > 0; --i) {
                if (tile.rawDeltas[i].isKeyframe) {
                    firstDelta = i;
                    break;
                }
            }
            // Check if we have already decompressed data we can work from
            if (tile.lastPendingId > tile.rawDeltas[firstDelta].id) {
                var continuedIdIndex = tile.rawDeltas.findIndex(function (d) { return d.id === tile.lastPendingId; });
                if (continuedIdIndex !== -1)
                    firstDelta = continuedIdIndex + 1;
            }
            var rawDeltas = tile.rawDeltas.slice(firstDelta);
            var lastId = tile.rawDeltas[tile.rawDeltas.length - 1].id;
            this.applyCompressedDelta(tile, rawDeltas, tile.rawDeltas[firstDelta].isKeyframe, wireMessage, [tile.rawDeltas[firstDelta].id, lastId]);
        }
    };
    TileManager.endTransaction = function (callback) {
        if (callback === void 0) { callback = null; }
        if (this.inTransaction === 0) {
            window.app.console.error('Mismatched endTransaction');
            return;
        }
        --this.inTransaction;
        if (callback)
            this.pendingTransactions[this.pendingTransactions.length - 1].push(callback);
        if (this.inTransaction !== 0)
            return;
        // Short-circuit if there's nothing to decompress
        if (!this.pendingDeltas.length) {
            var callbacks = this.pendingTransactions[this.pendingTransactions.length - 1];
            while (callbacks.length)
                callbacks.pop()();
            return;
        }
        try {
            this.pendingTransactions.push([]);
            this.decompressPendingDeltas('endTransaction');
        }
        catch (e) {
            window.app.console.error('Failed to decompress pending deltas');
            this.inTransaction = 0;
            this.disableWorker(e);
            if (callback)
                callback();
            return;
        }
    };
    TileManager.disableWorker = function (e) {
        if (e === void 0) { e = null; }
        if (e)
            window.app.console.error('Worker-related error encountered', e);
        if (!this.worker)
            return;
        window.app.console.warn('Disabling worker thread');
        try {
            this.worker.terminate();
        }
        catch (e) {
            window.app.console.error('Error terminating worker thread', e);
        }
        this.pendingDeltas.length = 0;
        this.worker = null;
        while (this.pendingTransactions.length) {
            var callbacks = this.pendingTransactions.shift();
            while (callbacks.length)
                callbacks.pop()();
        }
        this.pendingTransactions.push([]);
        this.redraw();
    };
    TileManager.applyDelta = function (tile, rawDeltas, deltas, keyframeDeltaSize, keyframeImage, wireMessage) {
        var e_4, _a;
        var rawDeltaSize = tile.rawDeltas.reduce(function (a, c) { return a + c.length; }, 0);
        if (this.debugDeltas) {
            var hexStrings = [];
            try {
                for (var rawDeltas_1 = __values(rawDeltas), rawDeltas_1_1 = rawDeltas_1.next(); !rawDeltas_1_1.done; rawDeltas_1_1 = rawDeltas_1.next()) {
                    var rawDelta = rawDeltas_1_1.value;
                    hexStrings.push(hex2string(rawDelta, rawDelta.length));
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (rawDeltas_1_1 && !rawDeltas_1_1.done && (_a = rawDeltas_1.return)) _a.call(rawDeltas_1);
                }
                finally { if (e_4) throw e_4.error; }
            }
            var hexString = hexStrings.join('');
            window.app.console.log('Applying a raw ' +
                (keyframeDeltaSize ? 'keyframe' : 'delta') +
                ' of length ' +
                rawDeltaSize +
                (this.debugDeltasDetail ? ' hex: ' + hexString : ''));
        }
        // if re-creating ImageData from rawDeltas, don't update counts
        if (wireMessage) {
            if (keyframeDeltaSize) {
                tile.loadCount++;
                tile.deltaCount = 0;
                tile.updateCount = 0;
                if (app.map._debug.tileDataOn) {
                    app.map._debug.tileDataAddLoad();
                }
            }
            else if (rawDeltas.length === 0) {
                tile.updateCount++;
                this.nullDeltaUpdate++;
                if (app.map._docLayer._emptyDeltaDiv) {
                    app.map._docLayer._emptyDeltaDiv.innerText = this.nullDeltaUpdate;
                }
                if (app.map._debug.tileDataOn) {
                    app.map._debug.tileDataAddUpdate();
                }
                return; // that was easy
            }
            else {
                tile.deltaCount++;
                if (app.map._debug.tileDataOn) {
                    app.map._debug.tileDataAddDelta();
                }
            }
        }
        // else - re-constituting from tile.rawData
        var traceEvent = app.socket.createCompleteTraceEvent('L.CanvasTileLayer.applyDelta', { keyFrame: !!keyframeDeltaSize, length: rawDeltaSize });
        // apply potentially several deltas in turn.
        var i = 0;
        // If it's a new keyframe, use the given image and offset
        var imgData = keyframeImage;
        var offset = keyframeDeltaSize;
        while (offset < deltas.length) {
            if (this.debugDeltas)
                window.app.console.log('Next delta at ' + offset + ' length ' + (deltas.length - offset));
            var delta = !offset ? deltas : deltas.subarray(offset);
            // Debugging paranoia: if we get this wrong bad things happen.
            if (delta.length >= this.tileSize * this.tileSize * 4) {
                window.app.console.warn('Unusual delta possibly mis-tagged, suspicious size vs. type ' +
                    delta.length +
                    ' vs. ' +
                    this.tileSize * this.tileSize * 4);
            }
            if (!imgData)
                // no keyframe
                imgData = tile.imgDataCache;
            if (!imgData) {
                window.app.console.error('Trying to apply delta with no ImageData cache');
                return;
            }
            // copy old data to work from:
            var oldData = new Uint8ClampedArray(imgData.data);
            var len = this.applyDeltaChunk(imgData, delta, oldData, this.tileSize, this.tileSize);
            if (this.debugDeltas)
                window.app.console.log('Applied chunk ' +
                    i++ +
                    ' of total size ' +
                    delta.length +
                    ' at stream offset ' +
                    offset +
                    ' size ' +
                    len);
            offset += len;
        }
        // hold onto the original imgData for reuse in the no keyframe case
        tile.imgDataCache = imgData;
        if (traceEvent)
            traceEvent.finish();
    };
    TileManager.removeTile = function (key) {
        var tile = this.tiles.get(key);
        if (!tile)
            return;
        if (!tile.hasContent() && this.emptyTilesCount > 0)
            this.emptyTilesCount -= 1;
        this.reclaimTileBitmapMemory(tile);
        this.tiles.delete(key);
    };
    TileManager.removeAllTiles = function () {
        var e_5, _a;
        this.tileBitmapList = [];
        try {
            for (var _b = __values(Array.from(this.tiles.keys())), _c = _b.next(); !_c.done; _c = _b.next()) {
                var key = _c.value;
                this.removeTile(key);
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_5) throw e_5.error; }
        }
    };
    TileManager.sortFileBasedQueue = function (queue) {
        for (var i = 0; i < queue.length - 1; i++) {
            for (var j = i + 1; j < queue.length; j++) {
                var a = queue[i];
                var b = queue[j];
                var switchTiles = false;
                if (a.part === b.part) {
                    if (a.y > b.y) {
                        switchTiles = true;
                    }
                    else if (a.y === b.y) {
                        switchTiles = a.x > b.x;
                    }
                    else {
                        switchTiles = false;
                    }
                }
                else {
                    switchTiles = a.part > b.part;
                }
                if (switchTiles) {
                    var temp = a;
                    queue[i] = b;
                    queue[j] = temp;
                }
            }
        }
    };
    TileManager.reclaimTileBitmapMemory = function (tile) {
        if (tile.image) {
            tile.image.close();
            tile.image = null;
            tile.imgDataCache = null;
            tile.decompressedId = 0;
            tile.lastPendingId = 0;
            var n = this.tileBitmapList.findIndex(function (it) { return it == tile; });
            if (n !== -1)
                this.tileBitmapList.splice(n, 1);
        }
    };
    TileManager.initPreFetchPartTiles = function () {
        var _this = this;
        if (!this.checkDocLayer())
            return;
        var targetPart = this._docLayer._selectedPart + app.map._partsDirection;
        if (targetPart < 0 || targetPart >= this._docLayer._parts)
            return;
        // check existing timeout and clear it before the new one
        if (this._partTilePreFetcher)
            clearTimeout(this._partTilePreFetcher);
        this._partTilePreFetcher = setTimeout(function () {
            _this.preFetchPartTiles(targetPart, _this._docLayer._selectedMode);
        }, 100);
    };
    TileManager.initPreFetchAdjacentTiles = function () {
        if (!this.checkDocLayer())
            return;
        this.updateProperties();
        if (this._adjacentTilePreFetcher)
            clearTimeout(this._adjacentTilePreFetcher);
        this._adjacentTilePreFetcher = setTimeout(function () {
            // Extend what we request to include enough to populate a full
            // scroll in the direction we were going after or before
            // the current viewport
            //
            // request separately from the current viewPort to get
            // those tiles first.
            var direction = app.sectionContainer.getLastPanDirection();
            // Conservatively enlarge the area to round to more tiles:
            var pixelTopLeft = this._pixelBounds.getTopLeft();
            pixelTopLeft.y =
                Math.floor(pixelTopLeft.y / this.tileSize) * this.tileSize;
            pixelTopLeft.y -= 1;
            var pixelBottomRight = this._pixelBounds.getBottomRight();
            pixelBottomRight.y =
                Math.ceil(pixelBottomRight.y / this.tileSize) * this.tileSize;
            pixelBottomRight.y += 1;
            this._pixelBounds = new L.Bounds(pixelTopLeft, pixelBottomRight);
            // Translate the area in the direction we're going.
            this._pixelBounds.translate(this._pixelBounds.getSize().x * direction[0], this._pixelBounds.getSize().y * direction[1]);
            var queue = this.getMissingTiles(this._pixelBounds, this._zoom);
            if (this._docLayer.isCalc() || queue.length === 0) {
                // pre-load more aggressively
                this._pixelBounds.translate((this._pixelBounds.getSize().x * direction[0]) / 2, (this._pixelBounds.getSize().y * direction[1]) / 2);
                queue = queue.concat(this.getMissingTiles(this._pixelBounds, this._zoom));
            }
            if (queue.length !== 0)
                this.addTiles(queue);
        }.bind(this), 50 /*ms*/);
    };
    TileManager.sendTileCombineRequest = function (tileCombineQueue) {
        if (tileCombineQueue.length <= 0)
            return;
        // Sort into buckets of consistent part & mode.
        var partMode = {};
        for (var i = 0; i < tileCombineQueue.length; ++i) {
            var coords_1 = tileCombineQueue[i];
            // mode is a small number - give it 8 bits
            var pmKey_1 = (coords_1.part << 8) + coords_1.mode;
            if (partMode[pmKey_1] === undefined)
                partMode[pmKey_1] = [];
            partMode[pmKey_1].push(coords_1);
        }
        var now = new Date();
        for (var pmKey in partMode) {
            // no keys method
            var partTileQueue = partMode[pmKey];
            var part = partTileQueue[0].part;
            var mode = partTileQueue[0].mode;
            var tilePositionsX = [];
            var tilePositionsY = [];
            var tileWids = [];
            var added = {}; // uniqify
            var hasTiles = false;
            for (var i = 0; i < partTileQueue.length; ++i) {
                var coords = partTileQueue[i];
                var key = coords.key();
                var tile = this.tiles.get(key);
                // don't send lots of duplicate, fast tilecombines
                if (tile && tile.requestingTooFast(now))
                    continue;
                // request each tile just once in these tilecombines
                if (added[key])
                    continue;
                added[key] = true;
                hasTiles = true;
                // build parameters
                tileWids.push(tile && tile.wireId !== undefined ? tile.wireId : 0);
                var twips = new L.Point(Math.floor(coords.x / this.tileSize) * app.tile.size.x, Math.floor(coords.y / this.tileSize) * app.tile.size.y);
                tilePositionsX.push(twips.x);
                tilePositionsY.push(twips.y);
                if (tile)
                    tile.updateLastRequest(now);
            }
            var msg = 'tilecombine ' +
                'nviewid=0 ' +
                'part=' +
                part +
                ' ' +
                (mode !== 0 ? 'mode=' + mode + ' ' : '') +
                'width=' +
                this.tileSize +
                ' ' +
                'height=' +
                this.tileSize +
                ' ' +
                'tileposx=' +
                tilePositionsX.join(',') +
                ' ' +
                'tileposy=' +
                tilePositionsY.join(',') +
                ' ' +
                'oldwid=' +
                tileWids.join(',') +
                ' ' +
                'tilewidth=' +
                app.tile.size.x +
                ' ' +
                'tileheight=' +
                app.tile.size.y;
            if (hasTiles)
                app.socket.sendMessage(msg, '');
            else
                window.app.console.log('Skipped empty (too fast) tilecombine');
        }
    };
    TileManager.tileNeedsFetch = function (key) {
        var tile = this.tiles.get(key);
        return !tile || tile.needsFetch();
    };
    TileManager.pxBoundsToTileRanges = function (bounds) {
        var _this = this;
        if (!this.checkPointers())
            return null;
        if (!app.map._docLayer._splitPanesContext) {
            return [this.pxBoundsToTileRange(bounds)];
        }
        var boundList = app.map._docLayer._splitPanesContext.getPxBoundList(bounds);
        return boundList.map(function (x) { return _this.pxBoundsToTileRange(x); });
    };
    TileManager.updateTileDistance = function (tile, zoom, visibleRanges) {
        if (visibleRanges === void 0) { visibleRanges = null; }
        if (tile.coords.z !== zoom ||
            tile.coords.part !== app.map._docLayer._selectedPart ||
            tile.coords.mode !== app.map._docLayer._selectedMode) {
            tile.distanceFromView = Number.MAX_SAFE_INTEGER;
            return;
        }
        if (!visibleRanges)
            visibleRanges = this.getVisibleRanges();
        var tileBounds = new L.Bounds([tile.coords.x, tile.coords.y], [tile.coords.x + this.tileSize, tile.coords.y + this.tileSize]);
        tile.distanceFromView = tileBounds.distanceTo(visibleRanges[0]);
        for (var i = 1; i < visibleRanges.length; ++i) {
            var distance_2 = tileBounds.distanceTo(visibleRanges[i]);
            if (distance_2 < tile.distanceFromView)
                tile.distanceFromView = distance_2;
        }
    };
    TileManager.getMissingTiles = function (pixelBounds, zoom, isCurrent) {
        var e_6, _a;
        if (isCurrent === void 0) { isCurrent = false; }
        var tileRanges = this.pxBoundsToTileRanges(pixelBounds);
        var queue = [];
        // If we're looking for tiles for the current (visible) area, update tile distance.
        if (isCurrent) {
            var currentBounds = app.map._docLayer._splitPanesContext
                ? app.map._docLayer._splitPanesContext.getPxBoundList(pixelBounds)
                : [pixelBounds];
            try {
                for (var _b = __values(this.tiles.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var tile = _c.value;
                    this.updateTileDistance(tile, zoom, currentBounds);
                }
            }
            catch (e_6_1) { e_6 = { error: e_6_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_6) throw e_6.error; }
            }
            this.sortTileBitmapList();
        }
        // create a queue of coordinates to load tiles from. Rehydrate tiles if we're dealing
        // with the currently visible area.
        this.beginTransaction();
        var dehydratedVisible = false;
        for (var rangeIdx = 0; rangeIdx < tileRanges.length; ++rangeIdx) {
            // Expand the 'current' area to add a small buffer around the visible area that
            // helps us avoid visible tile updates.
            var tileRange = isCurrent && !this.shrinkCurrentId
                ? this.expandTileRange(tileRanges[rangeIdx])
                : tileRanges[rangeIdx];
            for (var j = tileRange.min.y; j <= tileRange.max.y; ++j) {
                for (var i = tileRange.min.x; i <= tileRange.max.x; ++i) {
                    var coords = new TileCoordData(i * this.tileSize, j * this.tileSize, zoom, app.map._docLayer._selectedPart, app.map._docLayer._selectedMode);
                    if (!this.isValidTile(coords))
                        continue;
                    var key = coords.key();
                    var tile = this.tiles.get(key);
                    if (!tile || tile.needsFetch())
                        queue.push(coords);
                    else if (isCurrent && this.makeTileCurrent(tile)) {
                        var tileIsVisible = j >= tileRanges[rangeIdx].min.y &&
                            j <= tileRanges[rangeIdx].max.y &&
                            i >= tileRanges[rangeIdx].min.x &&
                            i <= tileRanges[rangeIdx].max.x;
                        if (tileIsVisible)
                            dehydratedVisible = true;
                    }
                }
            }
        }
        // If we dehydrated a visible tile, wait for it to be ready before drawing
        if (dehydratedVisible && !this.pausedForDehydration) {
            app.sectionContainer.pauseDrawing();
            this.pausedForDehydration = true;
        }
        this.endTransaction(null);
        return queue;
    };
    TileManager.removeIrrelevantsFromCoordsQueue = function (coordsQueue) {
        var part = app.map._docLayer._selectedPart;
        var mode = app.map._docLayer._selectedMode;
        for (var i = coordsQueue.length - 1; i > 0; i--) {
            if (coordsQueue[i].part !== part ||
                coordsQueue[i].mode !== mode ||
                !this.tileNeedsFetch(coordsQueue[i].key())) {
                coordsQueue.splice(i, 1);
            }
            else if (app.map._docLayer._moveInProgress) {
                // While we are actively scrolling, filter out duplicate
                // (still) missing tiles requests during the scroll.
                if (app.map._docLayer._moveTileRequests.includes(coordsQueue[i].key()))
                    coordsQueue.splice(i, 1);
                else
                    app.map._docLayer._moveTileRequests.push(coordsQueue[i].key());
            }
        }
    };
    // create tiles if needed for queued coordinates, and build a
    // tilecombined request for any tiles we need to fetch.
    TileManager.addTiles = function (coordsQueue, isCurrent) {
        if (isCurrent === void 0) { isCurrent = false; }
        // Remove irrelevant tiles from the queue earlier.
        this.removeIrrelevantsFromCoordsQueue(coordsQueue);
        // If these aren't current tiles, calculate the visible ranges to update tile distance.
        var visibleRanges = isCurrent ? null : this.getVisibleRanges();
        var zoom = Math.round(app.map.getZoom());
        // Ensure tiles exist for requested coordinates
        for (var i = 0; i < coordsQueue.length; i++) {
            var key = coordsQueue[i].key();
            var tile = this.tiles.get(key);
            if (!tile) {
                tile = this.createTile(coordsQueue[i], key);
                // Newly created tiles have a distance of zero, which means they're current.
                if (!isCurrent)
                    this.updateTileDistance(tile, zoom, visibleRanges);
            }
        }
        // sort the tiles by the rows
        coordsQueue.sort(function (a, b) {
            if (a.y !== b.y)
                return a.y - b.y;
            else
                return a.x - b.x;
        });
        // try group the tiles into rectangular areas
        var rectangles = [];
        while (coordsQueue.length > 0) {
            var coords = coordsQueue[0];
            var rectQueue = [coords];
            var bound = coords.getPos(); // L.Point
            // remove it
            coordsQueue.splice(0, 1);
            // find the close ones
            var rowLocked = false;
            var hasHole = false;
            var i = 0;
            while (i < coordsQueue.length) {
                var current = coordsQueue[i];
                // extend the bound vertically if possible (so far it was continuous)
                if (!hasHole && current.y === bound.y + this.tileSize) {
                    rowLocked = true;
                    bound.y += this.tileSize;
                }
                if (current.y > bound.y)
                    break;
                if (!rowLocked) {
                    if (current.y === bound.y && current.x === bound.x + this.tileSize) {
                        // extend the bound horizontally
                        bound.x += this.tileSize;
                        rectQueue.push(current);
                        coordsQueue.splice(i, 1);
                    }
                    else {
                        // ignore the rest of the row
                        rowLocked = true;
                        ++i;
                    }
                }
                else if (current.x <= bound.x && current.y <= bound.y) {
                    // we are inside the bound
                    rectQueue.push(current);
                    coordsQueue.splice(i, 1);
                }
                else {
                    // ignore this one, but there still may be other tiles
                    hasHole = true;
                    ++i;
                }
            }
            rectangles.push(rectQueue);
        }
        for (var r = 0; r < rectangles.length; ++r)
            this.sendTileCombineRequest(rectangles[r]);
        if (app.map._docLayer._docType === 'presentation' ||
            app.map._docLayer._docType === 'drawing')
            this.initPreFetchPartTiles();
    };
    TileManager.refreshTilesInBackground = function () {
        var e_7, _a;
        try {
            for (var _b = __values(this.tiles.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var tile = _c.value;
                tile.forceKeyframe();
            }
        }
        catch (e_7_1) { e_7 = { error: e_7_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_7) throw e_7.error; }
        }
    };
    TileManager.setDebugDeltas = function (state) {
        this.debugDeltas = state;
        this.debugDeltasDetail = state;
    };
    TileManager.get = function (key) {
        return this.tiles.get(key);
    };
    TileManager.pixelCoordsToTwipTileBounds = function (coords) {
        // We need to calculate pixelsToTwips for the scale of this tile. 15 is the ratio between pixels and twips when the scale is 1.
        var pixelsToTwipsForTile = 15 / app.dpiScale / coords.scale;
        var x = coords.x * pixelsToTwipsForTile;
        var y = coords.y * pixelsToTwipsForTile;
        var width = app.tile.size.pX * pixelsToTwipsForTile;
        var height = app.tile.size.pY * pixelsToTwipsForTile;
        return [x, y, width, height];
    };
    TileManager.overlapInvalidatedRectangleWithView = function (part, mode, wireId, invalidatedRectangle, textMsg) {
        var _this = this;
        var needsNewTiles = false;
        var calc = app.map._docLayer.isCalc();
        this.tiles.forEach(function (tile, key) {
            var coords = tile.coords;
            var tileRectangle = _this.pixelCoordsToTwipTileBounds(coords);
            if (coords.part === part &&
                coords.mode === mode &&
                (invalidatedRectangle.intersectsRectangle(tileRectangle) ||
                    (calc && !_this.tileZoomIsCurrent(coords))) // In calc, we invalidate all tiles with different zoom levels.
            ) {
                if (tile.distanceFromView === 0)
                    needsNewTiles = true;
                _this.invalidateTile(key, wireId);
            }
        });
        if (app.map._docLayer._debug.tileInvalidationsOn &&
            part === app.map._docLayer._selectedPart) {
            app.map._docLayer._debug.addTileInvalidationRectangle(invalidatedRectangle.toArray(), textMsg);
            if (needsNewTiles && mode === app.map._docLayer._selectedMode)
                app.map._docLayer._debug.addTileInvalidationMessage(textMsg);
        }
    };
    TileManager.resetPreFetching = function (resetBorder) {
        if (!this.checkDocLayer())
            return;
        this.clearPreFetch();
        if (resetBorder)
            this._borders = undefined;
        var interval = 250;
        var idleTime = 750;
        this._preFetchPart = this._docLayer._selectedPart;
        this._preFetchMode = this._docLayer._selectedMode;
        this._preFetchIdle = setTimeout(L.bind(function () {
            this._tilesPreFetcher = setInterval(L.bind(this.preFetchTiles, this), interval);
            this._preFetchIdle = undefined;
            this._cumTileCount = 0;
        }, this), idleTime);
    };
    TileManager.clearPreFetch = function () {
        if (!this.checkDocLayer())
            return;
        this.clearTilesPreFetcher();
        if (this._preFetchIdle !== undefined) {
            clearTimeout(this._preFetchIdle);
            this._preFetchIdle = undefined;
        }
    };
    TileManager.preFetchTiles = function (forceBorderCalc) {
        if (!this.checkDocLayer())
            return;
        if (app.file.fileBasedView && this._docLayer)
            this.updateFileBasedView();
        if (!this._docLayer ||
            this.emptyTilesCount > 0 ||
            !this._docLayer._canonicalIdInitialized)
            return;
        var propertiesUpdated = this.updateProperties();
        var tileSize = this.tileSize;
        var maxTilesToFetch = this.getMaxTileCountToPrefetch(tileSize);
        var maxBorderWidth = !this._hasEditPerm ? 40 : 10;
        // FIXME: when we are actually editing we should pre-load much less until we stop
        /*		if (isActiveEditing()) {
            maxTilesToFetch = 5;
            maxBorderWidth = 2;
        } */
        if (propertiesUpdated ||
            forceBorderCalc ||
            !this._borders ||
            this._borders.length === 0)
            this.computeBorders();
        var finalQueue = [];
        var visitedTiles = {};
        var validTileRange = new L.Bounds(new L.Point(0, 0), new L.Point(Math.floor((app.file.size.x - 1) / app.tile.size.x), Math.floor((app.file.size.y - 1) / app.tile.size.y)));
        var tilesToFetch = maxTilesToFetch; // total tile limit per call of preFetchTiles()
        var doneAllPanes = true;
        for (var paneIdx = 0; paneIdx < this._borders.length; ++paneIdx) {
            var queue = [];
            var paneBorder = this._borders[paneIdx];
            var borderBounds = paneBorder.getBorderBounds();
            var paneXFixed = paneBorder.isXFixed();
            var paneYFixed = paneBorder.isYFixed();
            while (tilesToFetch > 0 && paneBorder.getBorderIndex() < maxBorderWidth) {
                var clampedBorder = validTileRange.clamp(borderBounds);
                var fetchTopBorder = !paneYFixed && borderBounds.min.y === clampedBorder.min.y;
                var fetchBottomBorder = !paneYFixed && borderBounds.max.y === clampedBorder.max.y;
                var fetchLeftBorder = !paneXFixed && borderBounds.min.x === clampedBorder.min.x;
                var fetchRightBorder = !paneXFixed && borderBounds.max.x === clampedBorder.max.x;
                if (!fetchLeftBorder &&
                    !fetchRightBorder &&
                    !fetchTopBorder &&
                    !fetchBottomBorder) {
                    break;
                }
                if (fetchBottomBorder) {
                    for (var i = clampedBorder.min.x; i <= clampedBorder.max.x; i++) {
                        // tiles below the visible area
                        queue.push(new TileCoordData(i * tileSize, borderBounds.max.y * tileSize, this._zoom, this._preFetchPart, this._preFetchMode));
                    }
                }
                if (fetchTopBorder) {
                    for (i = clampedBorder.min.x; i <= clampedBorder.max.x; i++) {
                        // tiles above the visible area
                        queue.push(new TileCoordData(i * tileSize, borderBounds.min.y * tileSize, this._zoom, this._preFetchPart, this._preFetchMode));
                    }
                }
                if (fetchRightBorder) {
                    for (i = clampedBorder.min.y; i <= clampedBorder.max.y; i++) {
                        // tiles to the right of the visible area
                        queue.push(new TileCoordData(borderBounds.max.x * tileSize, i * tileSize, this._zoom, this._preFetchPart, this._preFetchMode));
                    }
                }
                if (fetchLeftBorder) {
                    for (i = clampedBorder.min.y; i <= clampedBorder.max.y; i++) {
                        // tiles to the left of the visible area
                        queue.push(new TileCoordData(borderBounds.min.x * tileSize, i * tileSize, this._zoom, this._preFetchPart, this._preFetchMode));
                    }
                }
                var tilesPending = false;
                for (i = 0; i < queue.length; i++) {
                    var coords = queue[i];
                    var key = coords.key();
                    if (visitedTiles[key] ||
                        !this.isValidTile(coords) ||
                        !this.tileNeedsFetch(key))
                        continue;
                    if (tilesToFetch > 0) {
                        visitedTiles[key] = true;
                        finalQueue.push(coords);
                        tilesToFetch -= 1;
                    }
                    else {
                        tilesPending = true;
                    }
                }
                if (tilesPending) {
                    // don't update the border as there are still
                    // some tiles to be fetched
                    continue;
                }
                if (!paneXFixed) {
                    if (borderBounds.min.x > 0) {
                        borderBounds.min.x -= 1;
                    }
                    if (borderBounds.max.x < validTileRange.max.x) {
                        borderBounds.max.x += 1;
                    }
                }
                if (!paneYFixed) {
                    if (borderBounds.min.y > 0) {
                        borderBounds.min.y -= 1;
                    }
                    if (borderBounds.max.y < validTileRange.max.y) {
                        borderBounds.max.y += 1;
                    }
                }
                paneBorder.incBorderIndex();
            } // border width loop end
            if (paneBorder.getBorderIndex() < maxBorderWidth) {
                doneAllPanes = false;
            }
        } // pane loop end
        window.app.console.assert(finalQueue.length <= maxTilesToFetch, 'finalQueue length(' +
            finalQueue.length +
            ') exceeded maxTilesToFetch(' +
            maxTilesToFetch +
            ')');
        var tilesRequested = false;
        if (finalQueue.length > 0) {
            this._cumTileCount += finalQueue.length;
            this.addTiles(finalQueue);
            tilesRequested = true;
        }
        if (!tilesRequested || doneAllPanes) {
            this.clearTilesPreFetcher();
            this._borders = undefined;
        }
    };
    TileManager.sendProcessedResponse = function () {
        var toSend = this.queuedProcessed;
        this.queuedProcessed = [];
        if (toSend.length > 0)
            app.socket.sendMessage('tileprocessed wids=' + toSend.join(','));
        if (this.fetchKeyframeQueue.length > 0) {
            window.app.console.warn('re-fetching prematurely GCd keyframes');
            this.sendTileCombineRequest(this.fetchKeyframeQueue);
            this.fetchKeyframeQueue = [];
        }
    };
    TileManager.onTileMsg = function (textMsg, img) {
        var tileMsgObj = app.socket.parseServerCmd(textMsg);
        this.checkTileMsgObject(tileMsgObj);
        if (app.map._debug.tileDataOn) {
            app.map._debug.tileDataAddMessage();
        }
        // a rather different code-path with a png; should have its own msg perhaps.
        if (tileMsgObj.id !== undefined) {
            app.map.fire('tilepreview', {
                tile: img,
                id: tileMsgObj.id,
                width: tileMsgObj.width,
                height: tileMsgObj.height,
                part: tileMsgObj.part,
                mode: tileMsgObj.mode !== undefined ? tileMsgObj.mode : 0,
                docType: app.map._docLayer._docType,
            });
            this.queueAcknowledgement(tileMsgObj);
            return;
        }
        var coords = this.tileMsgToCoords(tileMsgObj);
        var key = coords.key();
        var tile = this.tiles.get(key);
        if (!tile) {
            tile = this.createTile(coords, key);
            this.updateTileDistance(tile, Math.round(app.map.getZoom()));
        }
        tile.viewId = tileMsgObj.nviewid;
        // update monotonic timestamp
        tile.wireId = +tileMsgObj.wireId;
        if (tile.invalidFrom == tile.wireId)
            window.app.console.debug('Nasty - updated wireId matches old one');
        var hasContent = img != null && img.rawData.length > 0;
        // obscure case: we could have garbage collected the
        // keyframe content in JS but coolwsd still thinks we have
        // it and now we just have a delta with nothing to apply
        // it to; if so, mark it bad to re-fetch.
        if (img && !img.isKeyframe && !tile.hasKeyframe()) {
            window.app.console.debug('Unusual: Delta sent - but we have no keyframe for ' + key);
            // force keyframe
            tile.forceKeyframe();
            tile.gcErrors++;
            // queue a later fetch of this and any other
            // rogue tiles in this state
            this.fetchKeyframeQueue.push(coords);
            hasContent = false;
        }
        // updates don't need more chattiness with a tileprocessed
        if (hasContent) {
            // Store the compressed tile data for later decompression and
            // display. This lets us store many more tiles than if we were
            // to only store the decompressed tile data.
            var rawDelta = new RawDelta(img.rawData, ++tile.deltaId, img.isKeyframe);
            if (img.isKeyframe || tile.hasKeyframe()) {
                tile.rawDeltas.push(rawDelta);
            }
            else {
                window.app.console.warn('Unusual: attempt to append a delta when we have no keyframe.');
            }
        }
        // Only decompress deltas for tiles that are current. This stops
        // prefetching from blowing past GC limits.
        if (tile.distanceFromView === 0)
            this.rehydrateTile(tile, true);
        this.queueAcknowledgement(tileMsgObj);
        if (!this.receivedFirstTile) {
            // This was the first tile, exec the queued tasks.
            this.receivedFirstTile = true;
            while (this.afterFirstTileTasks.length > 0) {
                var task = this.afterFirstTileTasks.shift();
                task();
            }
        }
    };
    // Returns a guess of how many tiles are yet to arrive
    TileManager.predictTilesToSlurp = function () {
        if (!this.checkPointers())
            return 0;
        var size = app.map.getSize();
        if (size.x === 0 || size.y === 0)
            return 0;
        var zoom = Math.round(app.map.getZoom());
        var pixelBounds = app.map.getPixelBoundsCore(app.map.getCenter(), zoom);
        var queue = this.getMissingTiles(pixelBounds, zoom);
        return queue.length;
    };
    TileManager.pruneTiles = function () {
        // update tile.distanceFromView for the view
        if (app.file.fileBasedView)
            this.updateFileBasedView(true);
        this.garbageCollect();
    };
    TileManager.discardAllCache = function () {
        // update tile.distanceFromView for the view
        if (app.file.fileBasedView)
            this.updateFileBasedView(true);
        this.garbageCollect(true);
    };
    TileManager.isValidTile = function (coords) {
        if (coords.x < 0 || coords.y < 0) {
            return false;
        }
        else if (coords.x * app.pixelsToTwips > app.file.size.x ||
            coords.y * app.pixelsToTwips > app.file.size.y) {
            return false;
        }
        else
            return true;
    };
    TileManager.redraw = function () {
        if (app.map) {
            this.removeAllTiles();
            this.update();
        }
        return this;
    };
    TileManager.update = function (center, zoom) {
        var _this = this;
        if (center === void 0) { center = null; }
        if (zoom === void 0) { zoom = null; }
        if (app.file.writer.multiPageView)
            return;
        var map = app.map;
        if (!map ||
            app.map._docLayer._documentInfo === '' ||
            !app.map._docLayer._canonicalIdInitialized) {
            return;
        }
        // Calc: do not set view area too early after load and before we get the cursor position.
        if (app.map._docLayer.isCalc() && !app.map._docLayer._gotFirstCellCursor)
            return;
        // be sure canvas is initialized already and has the correct size.
        var size = map.getSize();
        if (size.x === 0 || size.y === 0) {
            setTimeout(function () {
                this.update();
            }.bind(this), 1);
            return;
        }
        // If an update occurs while we're paused for dehydration, we haven't been able to
        // keep up with scrolling. In this case, we should stop expanding the current area
        // so that it takes less time to dehydrate it.
        if (this.pausedForDehydration) {
            if (this.shrinkCurrentId)
                clearTimeout(this.shrinkCurrentId);
            this.shrinkCurrentId = setTimeout(function () {
                _this.shrinkCurrentId = null;
            }, 100);
        }
        if (app.file.fileBasedView) {
            this.updateFileBasedView();
            return;
        }
        if (!center) {
            center = map.getCenter();
        }
        if (!zoom) {
            zoom = Math.round(map.getZoom());
        }
        var pixelBounds = map.getPixelBoundsCore(center, zoom);
        var queue = this.getMissingTiles(pixelBounds, zoom, true);
        app.map._docLayer._sendClientZoom();
        app.map._docLayer._sendClientVisibleArea();
        if (queue.length !== 0)
            this.addTiles(queue, true);
        if (app.map._docLayer.isCalc() || app.map._docLayer.isWriter())
            this.initPreFetchAdjacentTiles();
    };
    TileManager.onWorkerMessage = function (e) {
        var e_8, _a;
        var _this = this;
        var bitmaps = [];
        var pendingDeltas = [];
        switch (e.data.message) {
            case 'endTransaction':
                var _loop_1 = function (x) {
                    var tile = this_1.tiles.get(x.key);
                    if (!tile) {
                        if (this_1.debugDeltas)
                            window.app.console.warn('Tile deleted during rawDelta decompression.');
                        return "continue";
                    }
                    if (!x.deltas) {
                        // This path is taken when this is called on the DOM thread (i.e. the worker
                        // hasn't decompressed the raw delta)
                        x.deltas = window.fzstd.decompress(x.rawDelta);
                        if (x.isKeyframe) {
                            x.keyframeBuffer = new Uint8ClampedArray(e.data.tileSize * e.data.tileSize * 4);
                            x.keyframeDeltaSize = L.CanvasTileUtils.unrle(x.deltas, e.data.tileSize, e.data.tileSize, x.keyframeBuffer);
                        }
                        else
                            x.keyframeDeltaSize = 0;
                    }
                    var rawDeltas = [];
                    var firstDelta = tile.rawDeltas.findIndex(function (d) { return d.id === x.ids[0]; });
                    var lastDelta = tile.rawDeltas.findIndex(function (d) { return d.id === x.ids[1]; });
                    if (firstDelta !== -1 && lastDelta !== -1)
                        rawDeltas = tile.rawDeltas.slice(firstDelta, lastDelta + 1);
                    else
                        window.app.console.warn('Unusual: Received unknown decompressed keyframe delta(s)');
                    var keyframeImage = null;
                    if (x.isKeyframe) {
                        keyframeImage = new ImageData(x.keyframeBuffer, e.data.tileSize, e.data.tileSize);
                    }
                    else if (tile.decompressedId !== 0) {
                        if (x.ids[0] !== tile.decompressedId + 1) {
                            window.app.console.warn('Unusual: Received discontiguous decompressed delta');
                        }
                    }
                    else {
                        if (this_1.debugDeltas)
                            window.app.console.warn("Decompressed delta received on GC'd tile");
                        return "continue";
                    }
                    this_1.applyDelta(tile, rawDeltas, x.deltas, x.keyframeDeltaSize, keyframeImage, x.wireMessage);
                    this_1.createTileBitmap(tile, x, pendingDeltas, bitmaps);
                    tile.decompressedId = x.ids[1];
                };
                var this_1 = this;
                try {
                    for (var _b = __values(e.data.deltas), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var x = _c.value;
                        _loop_1(x);
                    }
                }
                catch (e_8_1) { e_8 = { error: e_8_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_8) throw e_8.error; }
                }
                Promise.all(bitmaps).then(function (bitmaps) {
                    _this.endTransactionHandleBitmaps(pendingDeltas, bitmaps);
                });
                break;
            default:
                window.app.console.error('Unrecognised message from worker');
                this.disableWorker();
        }
    };
    TileManager.updateOnChangePart = function () {
        if (!this.checkPointers() || app.map._docLayer._documentInfo === '') {
            return;
        }
        var key, coords;
        var center = app.map.getCenter();
        var zoom = Math.round(app.map.getZoom());
        var pixelBounds = app.map.getPixelBoundsCore(center, zoom);
        // create a queue of coordinates to load tiles from
        var queue = this.getMissingTiles(pixelBounds, zoom, true);
        if (queue.length !== 0) {
            for (var i = 0; i < queue.length; i++) {
                coords = queue[i];
                key = coords.key();
                if (!this.tiles.has(key))
                    this.createTile(coords, key);
            }
            this.sendTileCombineRequest(queue);
        }
        if (app.map._docLayer._docType === 'presentation' ||
            app.map._docLayer._docType === 'drawing')
            this.initPreFetchPartTiles();
    };
    TileManager.expandTileRange = function (range) {
        var grow = this.visibleTileExpansion;
        var direction = app.sectionContainer.getLastPanDirection();
        var minOffset = new L.Point(grow - grow * this.directionalTileExpansion * Math.min(0, direction[0]), grow - grow * this.directionalTileExpansion * Math.min(0, direction[1]));
        var maxOffset = new L.Point(grow + grow * this.directionalTileExpansion * Math.max(0, direction[0]), grow + grow * this.directionalTileExpansion * Math.max(0, direction[1]));
        return new L.Bounds(range.min.subtract(minOffset), range.max.add(maxOffset));
    };
    TileManager.pxBoundsToTileRange = function (bounds) {
        return new L.Bounds(bounds.min.divideBy(this.tileSize)._floor(), bounds.max.divideBy(this.tileSize)._floor());
    };
    /*
        Checks the visible tiles in current zoom level.
        Marks the visible ones as current.
    */
    TileManager.updateLayoutView = function (bounds) {
        var queue = this.getMissingTiles(bounds, Math.round(app.map.getZoom()), true);
        if (queue.length > 0)
            this.addTiles(queue, true);
    };
    TileManager.getVisibleCoordList = function (rectangle) {
        var e_9, _a;
        if (rectangle === void 0) { rectangle = app.file.viewedRectangle; }
        var coordList = Array();
        var zoom = app.map.getZoom();
        try {
            for (var _b = __values(this.tiles.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var tile = _c.value;
                var coords = tile.coords;
                if (coords.z === zoom &&
                    rectangle.intersectsRectangle([
                        coords.x * app.pixelsToTwips,
                        coords.y * app.pixelsToTwips,
                        this.tileSize * app.pixelsToTwips,
                        this.tileSize * app.pixelsToTwips,
                    ]))
                    coordList.push(coords);
            }
        }
        catch (e_9_1) { e_9 = { error: e_9_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_9) throw e_9.error; }
        }
        return coordList;
    };
    TileManager.updateFileBasedView = function (checkOnly, zoomFrameBounds, forZoom) {
        var e_10, _a;
        if (checkOnly === void 0) { checkOnly = false; }
        if (zoomFrameBounds === void 0) { zoomFrameBounds = null; }
        if (forZoom === void 0) { forZoom = null; }
        if (app.map._docLayer._partHeightTwips === 0)
            // This is true before status message is handled.
            return [];
        if (app.map._docLayer._isZooming)
            return [];
        if (!checkOnly) {
            // zoomFrameBounds and forZoom params were introduced to work only in checkOnly mode.
            window.app.console.assert(zoomFrameBounds === null, 'zoomFrameBounds must only be supplied when checkOnly is true');
            window.app.console.assert(forZoom === null, 'forZoom must only be supplied when checkOnly is true');
        }
        if (forZoom !== null) {
            window.app.console.assert(zoomFrameBounds, 'zoomFrameBounds must be valid when forZoom is specified');
        }
        var zoom = forZoom || Math.round(app.map.getZoom());
        var currZoom = Math.round(app.map.getZoom());
        var relScale = currZoom == zoom ? 1 : app.map.getZoomScale(zoom, currZoom);
        var ratio = (this.tileSize * relScale) / app.tile.size.y;
        var partHeightPixels = Math.round((app.map._docLayer._partHeightTwips +
            app.map._docLayer._spaceBetweenParts) *
            ratio);
        var partWidthPixels = Math.round(app.map._docLayer._partWidthTwips * ratio);
        var mode = 0; // mode is different only in Impress MasterPage mode so far
        var intersectionAreaRectangle = app.LOUtil._getIntersectionRectangle(app.file.viewedRectangle.pToArray(), [0, 0, partWidthPixels, partHeightPixels * app.map._docLayer._parts]);
        var queue = [];
        if (intersectionAreaRectangle) {
            var minLocalX = Math.floor(intersectionAreaRectangle[0] / app.tile.size.pX) *
                app.tile.size.pX;
            var maxLocalX = Math.floor((intersectionAreaRectangle[0] + intersectionAreaRectangle[2]) /
                app.tile.size.pX) * app.tile.size.pX;
            var startPart = Math.floor(intersectionAreaRectangle[1] / partHeightPixels);
            var startY = app.file.viewedRectangle.pY1 - startPart * partHeightPixels;
            startY = Math.floor(startY / app.tile.size.pY) * app.tile.size.pY;
            var endPart = Math.ceil((intersectionAreaRectangle[1] + intersectionAreaRectangle[3]) /
                partHeightPixels);
            var endY = app.file.viewedRectangle.pY1 +
                app.file.viewedRectangle.pY2 -
                endPart * partHeightPixels;
            endY = Math.floor(endY / app.tile.size.pY) * app.tile.size.pY;
            var vTileCountPerPart = Math.ceil(partHeightPixels / app.tile.size.pY);
            for (var i = startPart; i < endPart; i++) {
                for (var j = minLocalX; j <= maxLocalX; j += app.tile.size.pX) {
                    for (var k = 0; k <= vTileCountPerPart * app.tile.size.pX; k += app.tile.size.pY)
                        if ((i !== startPart || k >= startY) &&
                            (i !== endPart || k <= endY))
                            queue.push(new TileCoordData(j, k, zoom, i, mode));
                }
            }
            this.sortFileBasedQueue(queue);
            try {
                for (var _b = __values(this.tiles.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var tile = _c.value;
                    // Visible tiles' distance property will be set zero below by makeTileCurrent.
                    tile.distanceFromView = Number.MAX_SAFE_INTEGER;
                }
            }
            catch (e_10_1) { e_10 = { error: e_10_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_10) throw e_10.error; }
            }
            this.beginTransaction();
            for (i = 0; i < queue.length; i++) {
                var tempTile = this.tiles.get(queue[i].key());
                if (tempTile)
                    this.makeTileCurrent(tempTile);
            }
            this.endTransaction(null);
        }
        if (checkOnly) {
            return queue;
        }
        else {
            app.map._docLayer._sendClientVisibleArea();
            app.map._docLayer._sendClientZoom();
            var tileCombineQueue = [];
            for (var i = 0; i < queue.length; i++) {
                var key = queue[i].key();
                var tile = this.tiles.get(key);
                if (!tile)
                    tile = this.createTile(queue[i], key);
                if (tile.needsFetch())
                    tileCombineQueue.push(queue[i]);
            }
            this.sendTileCombineRequest(tileCombineQueue);
        }
    };
    // We keep tile content around, but it will need
    // refreshing if we show it again - and we need to
    // know what monotonic time the invalidate came from
    // so we match this to a new incoming tile to unset
    // the invalid state later.
    TileManager.invalidateTile = function (key, wireId) {
        var tile = this.tiles.get(key);
        if (!tile)
            return;
        tile.invalidateCount++;
        if (app.map._debug.tileDataOn) {
            app.map._debug.tileDataAddInvalidate();
        }
        if (!tile.hasContent())
            this.removeTile(key);
        else {
            if (this.debugDeltas)
                window.app.console.debug('invalidate tile ' + key + ' with wireId ' + wireId);
            tile.forceKeyframe(wireId ? wireId : tile.wireId);
        }
    };
    // Indicate that we're about to render this image.
    TileManager.touchImage = function (tile) {
        if (!tile)
            return;
        tile.lastRendered = performance.now();
        if (!tile.image)
            tile.missingContent++;
    };
    TileManager.inTransaction = 0;
    TileManager.pendingTransactions = [[]];
    TileManager.pendingDeltas = [];
    TileManager.nullDeltaUpdate = 0;
    TileManager.queuedProcessed = [];
    TileManager.fetchKeyframeQueue = []; // Queue of tiles which were GC'd earlier than coolwsd expected
    TileManager.emptyTilesCount = 0;
    TileManager.debugDeltas = false;
    TileManager.debugDeltasDetail = false;
    TileManager.tiles = new Map(); // stores all tiles, keyed by coordinates, and cached, compressed deltas
    TileManager.tileBitmapList = []; // stores all tiles with bitmaps, sorted by distance from view(s)
    TileManager.tileSize = 256;
    // The tile distance around the visible tile area that will be requested when updating
    TileManager.visibleTileExpansion = 1;
    // The tile expansion ratio that the visible tile area will be expanded towards when
    // updating during scrolling
    TileManager.directionalTileExpansion = 2;
    TileManager.pausedForDehydration = false;
    TileManager.shrinkCurrentId = null;
    //private static _debugTime: any = {}; Reserved for future.
    // Did we ever get a reply for a tilecombine request?
    TileManager.receivedFirstTile = false;
    // Tasks to be executed after we got our first tile.
    TileManager.afterFirstTileTasks = [];
    return TileManager;
}());
//# sourceMappingURL=TilesMiddleware.js.map