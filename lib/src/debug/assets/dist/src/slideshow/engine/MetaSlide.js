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
var MetaSlide = /** @class */ (function () {
    function MetaSlide(slideInfo, metaPres) {
        this._info = slideInfo;
        this._metaPres = metaPres;
        this._slideShowHandler = metaPres.slideShowHandler;
        if (this.hasTransition())
            this._transitionHandler = new SlideTransition(slideInfo);
        if (slideInfo.animations) {
            this._animationsHandler = new SlideAnimations(this._slideShowHandler.getContext(), this);
            this._animationsHandler.importAnimations(slideInfo.animations.root);
            this._animationsHandler.parseInfo();
            console.debug("\u001B[1mSlide " + this._info.index + " Animation Tree\u001B[m\n" +
                this._animationsHandler.info(true));
        }
    }
    MetaSlide.prototype.hasTransition = function () {
        return stringToTransitionTypeMap[this._info.transitionType] !== undefined;
    };
    Object.defineProperty(MetaSlide.prototype, "info", {
        get: function () {
            return this._info;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MetaSlide.prototype, "hidden", {
        get: function () {
            return this._info.hidden;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MetaSlide.prototype, "next", {
        get: function () {
            return this.info.next ? this._metaPres.getMetaSlide(this.info.next) : null;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MetaSlide.prototype, "prev", {
        get: function () {
            return this.info.prev ? this._metaPres.getMetaSlide(this.info.prev) : null;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MetaSlide.prototype, "transitionHandler", {
        get: function () {
            return this._transitionHandler;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MetaSlide.prototype, "animationsHandler", {
        get: function () {
            return this._animationsHandler;
        },
        enumerable: false,
        configurable: true
    });
    MetaSlide.prototype.getTriggerInfo = function (hash) {
        var triggers = this._info.triggers;
        if (triggers) {
            var index = triggers.findIndex(function (value) { return value.hash === hash; });
            if (index !== -1) {
                return {
                    bounds: triggers[index].bounds,
                    index: index,
                };
            }
        }
        return null;
    };
    MetaSlide.prototype.show = function () {
        // TODO implement it ?
    };
    MetaSlide.prototype.hide = function () {
        // TODO implement it ?
    };
    return MetaSlide;
}());
//# sourceMappingURL=MetaSlide.js.map