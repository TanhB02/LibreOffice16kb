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
var AnimationBase = /** @class */ (function () {
    function AnimationBase() {
    }
    return AnimationBase;
}());
var GenericAnimation = /** @class */ (function (_super) {
    __extends(GenericAnimation, _super);
    function GenericAnimation(aGetValueFunc, aSetValueFunc, aGetModifier, aSetModifier) {
        var _this = _super.call(this) || this;
        assert(aGetValueFunc && aSetValueFunc, 'GenericAnimation constructor: get value functor and/or set value functor are not valid');
        _this.aGetValueFunc = aGetValueFunc;
        _this.aSetValueFunc = aSetValueFunc;
        _this.aGetModifier = aGetModifier;
        _this.aSetModifier = aSetModifier;
        _this.aAnimatableElement = null;
        _this.bAnimationStarted = false;
        return _this;
    }
    GenericAnimation.prototype.start = function (aAnimatableElement) {
        assert(aAnimatableElement, 'GenericAnimation.start: animatable element is not valid');
        this.aAnimatableElement = aAnimatableElement;
        this.aAnimatableElement.notifyAnimationStart();
        if (!this.bAnimationStarted)
            this.bAnimationStarted = true;
    };
    GenericAnimation.prototype.end = function () {
        if (this.bAnimationStarted) {
            this.bAnimationStarted = false;
            this.aAnimatableElement.notifyAnimationEnd();
        }
    };
    GenericAnimation.prototype.perform = function (aValue) {
        if (this.aSetModifier)
            aValue = this.aSetModifier(aValue);
        this.aSetValueFunc(aValue);
    };
    GenericAnimation.prototype.getUnderlyingValue = function () {
        var aValue = this.aGetValueFunc();
        if (this.aGetModifier)
            aValue = this.aGetModifier(aValue);
        return aValue;
    };
    return GenericAnimation;
}(AnimationBase));
var TupleAnimation = /** @class */ (function (_super) {
    __extends(TupleAnimation, _super);
    function TupleAnimation(aGetValueFunc, aSetValueFunc, aDefaultValue, aReferenceSize) {
        var _this = _super.call(this, aGetValueFunc, aSetValueFunc) || this;
        assert(aDefaultValue && aReferenceSize, 'TupleAnimation constructor: default value functor and/or reference size are not valid');
        _this.aDefaultValue = aDefaultValue;
        _this.aReferenceSize = aReferenceSize;
        return _this;
    }
    TupleAnimation.prototype.perform = function (aNormValue) {
        assert(aNormValue.length === this.aReferenceSize.length, 'TupleAnimation.perform: aNormValue array param has wrong length');
        var aValue = [];
        for (var i = 0; i < aNormValue.length; ++i) {
            aValue.push(aNormValue[i] * this.aReferenceSize[i]);
        }
        this.aSetValueFunc(aValue);
    };
    TupleAnimation.prototype.getUnderlyingValue = function () {
        var aValue = this.aGetValueFunc();
        assert(aValue.length === this.aReferenceSize.length, 'TupleAnimation.perform: array param has wrong length');
        var aNormValue = [];
        for (var i = 0; i < aValue.length; ++i) {
            aNormValue.push(aValue[i] / this.aReferenceSize[i]);
        }
        return aNormValue;
    };
    return TupleAnimation;
}(GenericAnimation));
var HSLAnimationWrapper = /** @class */ (function () {
    function HSLAnimationWrapper(aColorAnimation) {
        this.aAnimation = aColorAnimation;
    }
    HSLAnimationWrapper.prototype.start = function (aAnimatableElement) {
        this.aAnimation.start(aAnimatableElement);
    };
    HSLAnimationWrapper.prototype.end = function () {
        this.aAnimation.end();
    };
    HSLAnimationWrapper.prototype.perform = function (aHSLValue) {
        this.aAnimation.perform(aHSLValue.convertToRGB());
    };
    HSLAnimationWrapper.prototype.getUnderlyingValue = function () {
        return this.aAnimation.getUnderlyingValue().convertToHSL();
    };
    return HSLAnimationWrapper;
}());
function createPropertyAnimation(sAttrName, aAnimatedElement, nWidth, nHeight) {
    var sPropNameAsKey = sAttrName;
    if (!aPropertyGetterSetterMap[sPropNameAsKey]) {
        window.app.console.log('createPropertyAnimation: attribute is unknown: ' + sAttrName);
        return null;
    }
    var aFunctorSet = aPropertyGetterSetterMap[sPropNameAsKey];
    var sGetValueMethod = aFunctorSet.get;
    var sSetValueMethod = aFunctorSet.set;
    if (!sGetValueMethod || !sSetValueMethod) {
        window.app.console.log('createPropertyAnimation: attribute is not handled');
        return null;
    }
    // nWidth, nHeight are used here
    var aGetModifier = eval(aFunctorSet.getmod);
    var aSetModifier = eval(aFunctorSet.setmod);
    var aGetValueMethod = aAnimatedElement[sGetValueMethod];
    var aSetValueMethod = aAnimatedElement[sSetValueMethod];
    return new GenericAnimation(aGetValueMethod.bind(aAnimatedElement), aSetValueMethod.bind(aAnimatedElement), aGetModifier, aSetModifier);
}
function createPairPropertyAnimation(sTransformType, aAnimatedElement, nWidth, nHeight) {
    var sTransformTypeAsKey = sTransformType;
    var aFunctorSet = aPropertyGetterSetterMap[sTransformTypeAsKey];
    var sGetValueMethod = aFunctorSet.get;
    var sSetValueMethod = aFunctorSet.set;
    var aDefaultValue = [];
    var aSizeReference = [];
    if (sTransformType === 'scale') {
        aDefaultValue[0] = aSizeReference[0] = aAnimatedElement.getBaseBBox().width;
        aDefaultValue[1] = aSizeReference[1] =
            aAnimatedElement.getBaseBBox().height;
    }
    else if (sTransformType === 'translate') {
        aDefaultValue[0] = aAnimatedElement.getBaseCenterX();
        aDefaultValue[1] = aAnimatedElement.getBaseCenterY();
        aSizeReference[0] = nWidth;
        aSizeReference[1] = nHeight;
    }
    else {
        window.app.console.log('createPairPropertyAnimation: transform type is not handled');
        return null;
    }
    var aGetValueMethod = aAnimatedElement[sGetValueMethod];
    var aSetValueMethod = aAnimatedElement[sSetValueMethod];
    return new TupleAnimation(aGetValueMethod.bind(aAnimatedElement), aSetValueMethod.bind(aAnimatedElement), aDefaultValue, aSizeReference);
}
var TransitionFilterAnimation = /** @class */ (function (_super) {
    __extends(TransitionFilterAnimation, _super);
    function TransitionFilterAnimation(nNodeId, transitionFilterInfo, aAnimatableElement) {
        var _this = this;
        assert(aAnimatableElement, 'TransitionFilterAnimation: animatable element is not valid');
        ANIMDBG.print('TransitionFilterAnimation: Animated Element Id: ' +
            aAnimatableElement.getId());
        _this = _super.call(this) || this;
        _this.nNodeId = nNodeId;
        _this.aTransitionFilterInfo = transitionFilterInfo;
        _this.aAnimatableElement = aAnimatableElement;
        _this.bAnimationStarted = false;
        _this.aTransition = null;
        return _this;
    }
    TransitionFilterAnimation.prototype.getNodeId = function () {
        return this.nNodeId;
    };
    TransitionFilterAnimation.prototype.start = function (aAnimatableElement) {
        assert(this.aAnimatableElement.getId() === aAnimatableElement.getId(), 'TransitionFilterAnimation: animatable element mismatch');
        if (!this.aTransition) {
            var transitionParameters = this.createTransitionParameters(this.aAnimatableElement, this.aTransitionFilterInfo);
            this.aTransition = this.createShapeTransition(transitionParameters);
        }
        this.aAnimatableElement.notifyAnimationStart();
        if (!this.bAnimationStarted)
            this.bAnimationStarted = true;
    };
    TransitionFilterAnimation.prototype.end = function () {
        if (this.bAnimationStarted) {
            this.bAnimationStarted = false;
            this.aAnimatableElement.notifyAnimationEnd();
        }
    };
    TransitionFilterAnimation.prototype.perform = function (nT) {
        this.aAnimatableElement.setTransitionFilterFrame(this, nT);
    };
    TransitionFilterAnimation.prototype.renderFrame = function (nT, properties) {
        if (this.aTransition) {
            this.aTransition.renderFrame(nT, properties);
        }
    };
    TransitionFilterAnimation.prototype.notifySlideEnd = function () {
        // clean up resources
        if (this.aTransition) {
            this.aTransition.end();
            this.aTransition = null;
        }
    };
    TransitionFilterAnimation.prototype.getUnderlyingValue = function () {
        return 0.0;
    };
    TransitionFilterAnimation.prototype.createTransitionParameters = function (aAnimatedElement, transitionFilterInfo) {
        var transitionParameters = new TransitionParameters();
        aAnimatedElement.setTransitionParameters(transitionParameters);
        transitionParameters.transitionFilterInfo = transitionFilterInfo;
        return transitionParameters;
    };
    TransitionFilterAnimation.prototype.createShapeTransition = function (transitionParameters) {
        return createTransition(transitionParameters, /*isSlideTransition*/ false);
    };
    return TransitionFilterAnimation;
}(AnimationBase));
var PathAnimation = /** @class */ (function (_super) {
    __extends(PathAnimation, _super);
    function PathAnimation(path, eAdditive, slideWidth, slideHeight) {
        var _this = _super.call(this) || this;
        _this.path = path;
        _this.eAdditive = eAdditive;
        _this.slideWidth = slideWidth;
        _this.slideHeight = slideHeight;
        _this.svgPath = _this.createSvgPath(path);
        _this.pathLength = _this.svgPath.getTotalLength();
        return _this;
    }
    PathAnimation.prototype.start = function (aAnimatableElement) {
        assert(aAnimatableElement, 'GenericAnimation.start: animatable element is not valid');
        this.aAnimatableElement = aAnimatableElement;
        this.centerX = this.aAnimatableElement.getBaseCenterX();
        this.centerY = this.aAnimatableElement.getBaseCenterY();
        this.aAnimatableElement.notifyAnimationStart();
        if (!this.bAnimationStarted)
            this.bAnimationStarted = true;
    };
    PathAnimation.prototype.end = function () {
        if (this.bAnimationStarted) {
            this.bAnimationStarted = false;
            this.aAnimatableElement.notifyAnimationEnd();
        }
    };
    PathAnimation.prototype.perform = function (nT) {
        var aOutPos = this.parametricPath(nT);
        aOutPos = [aOutPos[0] * this.slideWidth, aOutPos[1] * this.slideHeight];
        aOutPos = [aOutPos[0] + this.centerX, aOutPos[1] + this.centerY];
        this.aAnimatableElement.setPos(aOutPos);
    };
    PathAnimation.prototype.getUnderlyingValue = function () {
        return 0.0;
    };
    PathAnimation.prototype.createSvgPath = function (path) {
        var svgPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        svgPath.setAttribute('d', path);
        return svgPath;
    };
    PathAnimation.prototype.parametricPath = function (nT) {
        var distance = this.pathLength * nT;
        var point = this.svgPath.getPointAtLength(distance);
        return [point.x, point.y];
    };
    return PathAnimation;
}(AnimationBase));
function createShapeTransition(aActivityParamSet, aAnimatedElement, nSlideWidth, nSlideHeight, aAnimatedTransitionFilterNode) {
    if (!aAnimatedTransitionFilterNode) {
        window.app.console.log('createShapeTransition: the animated transition filter node is not valid.');
        return null;
    }
    var eTransitionType = aAnimatedTransitionFilterNode.getTransitionType();
    var eTransitionSubType = aAnimatedTransitionFilterNode.getTransitionSubtype();
    var bDirectionForward = !aAnimatedTransitionFilterNode.getReverseDirection();
    var bModeIn = aAnimatedTransitionFilterNode.getTransitionMode() == TransitionMode.in;
    var transitionFilterInfo = new TransitionFilterInfo(eTransitionType, eTransitionSubType, bDirectionForward, bModeIn);
    var aTransitionInfo = null;
    if (aTransitionInfoTable[eTransitionType])
        aTransitionInfo = aTransitionInfoTable[eTransitionType][eTransitionSubType];
    var eTransitionClass = aTransitionInfo
        ? aTransitionInfo['class']
        : TransitionClass.Invalid;
    switch (eTransitionClass) {
        default:
        case TransitionClass.Invalid:
            window.app.console.log('createShapeTransition: transition class: TRANSITION_INVALID');
            return null;
        case TransitionClass.ClipPoligon: {
            var aClippingAnimation = new TransitionFilterAnimation(aAnimatedTransitionFilterNode.getId(), transitionFilterInfo, aAnimatedElement);
            return new SimpleActivity(aActivityParamSet, aClippingAnimation, DirectionType.Forward);
        }
        case TransitionClass.Special:
            switch (eTransitionType) {
                // map SLIDEWIPE to BARWIPE, for now
                case TransitionType.SLIDEWIPE: {
                    var subtype = TransitionSubType.DEFAULT;
                    var isForwardDirection = true;
                    switch (eTransitionSubType) {
                        case TransitionSubType.FROMLEFT:
                            subtype = TransitionSubType.LEFTTORIGHT;
                            isForwardDirection = true;
                            break;
                        case TransitionSubType.FROMRIGHT:
                            subtype = TransitionSubType.LEFTTORIGHT;
                            isForwardDirection = false;
                            break;
                        case TransitionSubType.FROMTOP:
                            subtype = TransitionSubType.TOPTOBOTTOM;
                            isForwardDirection = true;
                            break;
                        case TransitionSubType.FROMBOTTOM:
                            subtype = TransitionSubType.TOPTOBOTTOM;
                            isForwardDirection = false;
                            break;
                        default:
                            window.app.console.log('createShapeTransition: unexpected subtype for SLIDEWIPE');
                            break;
                    }
                    transitionFilterInfo.transitionType = TransitionType.BARWIPE;
                    transitionFilterInfo.transitionSubtype = subtype;
                    transitionFilterInfo.isDirectionForward = isForwardDirection;
                    var aClippingAnimation = new TransitionFilterAnimation(aAnimatedTransitionFilterNode.getId(), transitionFilterInfo, aAnimatedElement);
                    return new SimpleActivity(aActivityParamSet, aClippingAnimation, DirectionType.Forward);
                }
                // we map everything else to crossfade
                default: {
                    return createCrossFadeTransition(aActivityParamSet, aAnimatedElement, nSlideWidth, nSlideHeight, bModeIn);
                }
            }
    }
}
function createCrossFadeTransition(aActivityParamSet, aAnimatedElement, nSlideWidth, nSlideHeight, bModeIn) {
    var aAnimation = createPropertyAnimation('opacity', aAnimatedElement, nSlideWidth, nSlideHeight);
    var eDirection = bModeIn ? DirectionType.Forward : DirectionType.Backward;
    return new SimpleActivity(aActivityParamSet, aAnimation, eDirection);
}
//# sourceMappingURL=AnimationFactory.js.map