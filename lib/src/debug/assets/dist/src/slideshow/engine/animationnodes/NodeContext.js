// @ts-strict-ignore
/* -*- tab-width: 4 -*- */
/*
 * Copyright the Collabora Online contributors.
 *
 * SPDX-License-Identifier: MPL-2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
var NodeContext = /** @class */ (function () {
    function NodeContext(aSlideShowContext) {
        this.aContext = null;
        this.aAnimationNodeMap = null;
        this.aAnimatedElementMap = null;
        this.aSourceEventElementMap = null;
        this.metaSlide = null;
        this.nStartDelay = 0.0;
        this.bFirstRun = undefined;
        this.bIsInvalid = false;
        this.aContext = aSlideShowContext;
    }
    NodeContext.prototype.makeSourceEventElement = function (sId, aSlideShow) {
        if (!this.aContext.aEventMultiplexer) {
            window.app.console.log('NodeContext.makeSourceEventElement: event multiplexer not initialized');
            return null;
        }
        if (!this.aSourceEventElementMap.has(sId)) {
            var triggerInfo = this.metaSlide.getTriggerInfo(sId);
            if (!triggerInfo) {
                window.app.console.log('NodeContext.makeSourceEventElement: no bounds found for event trigger: ' +
                    sId);
                return null;
            }
            this.aSourceEventElementMap.set(sId, new SourceEventElement(sId, this.aContext.aCanvas, triggerInfo.bounds, triggerInfo.index, aSlideShow, this.aContext.aEventMultiplexer));
        }
        return this.aSourceEventElementMap.get(sId);
    };
    return NodeContext;
}());
//# sourceMappingURL=NodeContext.js.map