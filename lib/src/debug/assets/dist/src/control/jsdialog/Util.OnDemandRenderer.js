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
function onDemandRenderer(builder, controlId, controlType, entryId, placeholder, parentContainer, entryText) {
    var setupOnDemandRenderer = function () {
        var cachedComboboxEntries = builder.rendersCache[controlId];
        var requestRender = true;
        if (cachedComboboxEntries && cachedComboboxEntries.images[entryId]) {
            L.DomUtil.remove(placeholder);
            placeholder = L.DomUtil.create('img', '', parentContainer);
            var placeholderImg = placeholder;
            placeholderImg.src = cachedComboboxEntries.images[entryId];
            placeholderImg.alt = entryText;
            placeholderImg.title = entryText;
            requestRender = !cachedComboboxEntries.persistent;
        }
        if (requestRender) {
            // render on demand
            var onIntersection = function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        builder.callback(controlType, 'render_entry', { id: controlId }, entryId +
                            ';' +
                            Math.floor(100 * window.devicePixelRatio) +
                            ';' +
                            Math.floor(100 * window.devicePixelRatio), builder);
                    }
                });
            };
            var observer = new IntersectionObserver(onIntersection, {
                root: null,
                threshold: 0.01, // percentage of visible area
            });
            observer.observe(placeholder);
        }
    };
    if (TileManager.isReceivedFirstTile()) {
        setupOnDemandRenderer();
    }
    else {
        // No first tile yet, delay sending the render request.
        TileManager.appendAfterFirstTileTask(setupOnDemandRenderer);
    }
}
JSDialog.OnDemandRenderer = onDemandRenderer;
//# sourceMappingURL=Util.OnDemandRenderer.js.map