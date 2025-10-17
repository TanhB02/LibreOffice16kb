// @ts-strict-ignore
/* -*- tab-width: 4 -*- */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/*
 * Copyright the Collabora Online contributors.
 *
 * SPDX-License-Identifier: MPL-2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
var ISlideChangeBase = /** @class */ (function () {
    function ISlideChangeBase() {
    }
    return ISlideChangeBase;
}());
// we use mixin for simulating multiple inheritance
function SlideChangeTemplate(BaseType) {
    var SlideChangeBase = /** @class */ (function (_super) {
        __extends(SlideChangeBase, _super);
        function SlideChangeBase() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var _this = this;
            assert(args.length === 1, 'SlideChangeBase, constructor args length is wrong');
            var transitionParameters = args[0];
            _this = _super.call(this, transitionParameters) || this;
            _this.transitionParameters = transitionParameters;
            _this.leavingSlide = transitionParameters.current;
            _this.enteringSlide = transitionParameters.next;
            _this.isFinished = false;
            _this.requestAnimationFrameId = null;
            _this.time = null;
            _this.isLastFrame = false;
            return _this;
        }
        SlideChangeBase.prototype.end = function () {
            if (this.isFinished)
                return;
            // end() can be invoked before last render() execution
            if (this.requestAnimationFrameId !== null) {
                console.debug('SlideChangeBase.end: render() not yet executed');
                this.requestAnimationFrameId = null;
                setTimeout(this.end.bind(this), 100);
                return;
            }
            this.isFinished = true;
            this.endTransition();
        };
        SlideChangeBase.prototype.perform = function (nT, last) {
            if (last === void 0) { last = false; }
            if (this.isFinished)
                return;
            this.time = nT;
            this.isLastFrame = last;
        };
        SlideChangeBase.prototype.renderFrame = function (nT, properties) {
            if (nT !== null && nT >= 0.0) {
                this.render(nT, properties);
            }
        };
        SlideChangeBase.prototype.animate = function () {
            if (this.time !== null && this.time > 0.0) {
                this.render(this.time);
            }
            if (!this.isLastFrame)
                this.requestAnimationFrameId = requestAnimationFrame(this.animate.bind(this));
        };
        SlideChangeBase.prototype.getUnderlyingValue = function () {
            return 0.0;
        };
        return SlideChangeBase;
    }(BaseType));
    return SlideChangeBase;
}
// classes passed to SlideChangeTemplate must have the same number and types of ctor parameters
// expected by SlideChangeBase, so we define the following wrapper class
var TextureRendererCtorForSlideChangeBase = /** @class */ (function (_super) {
    __extends(TextureRendererCtorForSlideChangeBase, _super);
    function TextureRendererCtorForSlideChangeBase(transitionParameters) {
        return _super.call(this, transitionParameters.context, 
        /*create program*/ false) || this;
    }
    return TextureRendererCtorForSlideChangeBase;
}(SimpleTextureRenderer));
// SlideChangeGl extends SlideChangeBase, SimpleTextureRenderer
var SlideChangeGl = SlideChangeTemplate(TextureRendererCtorForSlideChangeBase);
//# sourceMappingURL=SlideChangeBase.js.map