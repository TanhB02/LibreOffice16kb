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
var AnimationNodeType;
(function (AnimationNodeType) {
    AnimationNodeType[AnimationNodeType["Custom"] = 0] = "Custom";
    AnimationNodeType[AnimationNodeType["Par"] = 1] = "Par";
    AnimationNodeType[AnimationNodeType["Seq"] = 2] = "Seq";
    AnimationNodeType[AnimationNodeType["Iterate"] = 3] = "Iterate";
    AnimationNodeType[AnimationNodeType["Animate"] = 4] = "Animate";
    AnimationNodeType[AnimationNodeType["Set"] = 5] = "Set";
    AnimationNodeType[AnimationNodeType["AnimateMotion"] = 6] = "AnimateMotion";
    AnimationNodeType[AnimationNodeType["AnimateColor"] = 7] = "AnimateColor";
    AnimationNodeType[AnimationNodeType["AnimateTransform"] = 8] = "AnimateTransform";
    AnimationNodeType[AnimationNodeType["TransitionFilter"] = 9] = "TransitionFilter";
    AnimationNodeType[AnimationNodeType["Audio"] = 10] = "Audio";
    AnimationNodeType[AnimationNodeType["Command"] = 11] = "Command";
})(AnimationNodeType || (AnimationNodeType = {}));
function getAnimationNodeType(aNodeInfo) {
    var typeStr = aNodeInfo.nodeName;
    return AnimationNodeType[typeStr];
}
function getNodeChildren(aNode) {
    return aNode.children || [];
}
function isAttributeSupported(aNodeInfo) {
    if (!aNodeInfo.attributeName) {
        console.error('slideshow: missing attributeName');
        return false;
    }
    // return true;
    return AnimatedElement.SupportedProperties.has(aNodeInfo.attributeName.toLowerCase());
}
function isTransformSupported(aNodeInfo) {
    if (!aNodeInfo.transformType) {
        console.error('slideshow: missing transformType');
        return false;
    }
    // return true;
    return AnimatedElement.SupportedTransformations.has(aNodeInfo.transformType.toLowerCase());
}
function createAnimationTree(aAnimationRoot, aNodeContext) {
    return createAnimationNode(aAnimationRoot, null, aNodeContext);
}
function createAnimationNode(aNodeInfo, aParentNode, aNodeContext) {
    assert(aNodeInfo, 'createAnimationNode: invalid animation node');
    var eAnimationNodeType = getAnimationNodeType(aNodeInfo);
    var aCreatedNode = null;
    var aCreatedContainer = null;
    switch (eAnimationNodeType) {
        case AnimationNodeType.Par:
            aCreatedNode = aCreatedContainer = new ParallelTimeContainer(aNodeInfo, aParentNode, aNodeContext);
            break;
        case AnimationNodeType.Iterate:
            window.app.console.log('createAnimationNode: Iterate not implemented');
            return null;
        case AnimationNodeType.Seq:
            aCreatedNode = aCreatedContainer = new SequentialTimeContainer(aNodeInfo, aParentNode, aNodeContext);
            break;
        case AnimationNodeType.Animate:
            if (isAttributeSupported(aNodeInfo)) {
                aCreatedNode = new PropertyAnimationNode(aNodeInfo, aParentNode, aNodeContext);
                break;
            }
            else {
                var attrName = aNodeInfo.attributeName;
                window.app.console.log("createAnimationNode: PropertyAnimationNode: attribute '" + attrName + "' not supported");
                return null;
            }
        case AnimationNodeType.Set:
            if (isAttributeSupported(aNodeInfo)) {
                aCreatedNode = new AnimationSetNode(aNodeInfo, aParentNode, aNodeContext);
                break;
            }
            else {
                var attrName = aNodeInfo.attributeName;
                window.app.console.log("createAnimationNode: AnimationSetNode: attribute '" + attrName + "' not supported");
                return null;
            }
        case AnimationNodeType.AnimateMotion:
            aCreatedNode = new AnimationPathMotionNode(aNodeInfo, aParentNode, aNodeContext);
            // window.app.console.log(
            // 	'createAnimationNode: AnimateMotion not implemented',
            // );
            //return null;
            break;
        case AnimationNodeType.AnimateColor:
            aCreatedNode = new AnimationColorNode(aNodeInfo, aParentNode, aNodeContext);
            break;
        case AnimationNodeType.AnimateTransform:
            if (isTransformSupported(aNodeInfo)) {
                aCreatedNode = new AnimationTransformNode(aNodeInfo, aParentNode, aNodeContext);
                break;
            }
            else {
                var transfType = aNodeInfo
                    .transformType;
                window.app.console.log("createAnimationNode: AnimationTransformNode: transform '" + transfType + "' not supported");
                return null;
            }
        case AnimationNodeType.TransitionFilter: {
            aCreatedNode = new AnimationTransitionFilterNode(aNodeInfo, aParentNode, aNodeContext);
            break;
        }
        case AnimationNodeType.Audio:
            window.app.console.log('createAnimationNode: Audio not implemented');
            return null;
        case AnimationNodeType.Command:
            window.app.console.log('createAnimationNode: Command not implemented');
            return null;
        default:
            window.app.console.log('createAnimationNode: invalid Animation Node Type: ' +
                eAnimationNodeType);
            return null;
    }
    if (aCreatedContainer) {
        var aChildrenArray = getNodeChildren(aNodeInfo);
        for (var i = 0; i < aChildrenArray.length; ++i) {
            if (!createChildNode(aChildrenArray[i], aCreatedContainer, aNodeContext)) {
                // Discard the whole effect except animation node is a Set node and
                // it's not the only node included into the effect.
                if (!(aChildrenArray.length !== 1 &&
                    getAnimationNodeType(aChildrenArray[i]) === AnimationNodeType.Set)) {
                    aCreatedContainer.removeAllChildrenNodes();
                    break;
                }
            }
        }
    }
    return aCreatedNode;
}
function createChildNode(aNodeInfo, aParentNode, aNodeContext) {
    var aChildNode = createAnimationNode(aNodeInfo, aParentNode, aNodeContext);
    if (!aChildNode) {
        window.app.console.log('createChildNode: child node creation failed');
        return false;
    }
    else {
        if (aChildNode.isContainer() && !aChildNode.isMainSequenceRootNode()) {
            var aContainer = aChildNode;
            // an empty effect should be removed, but sibling effects shouldn't, so don't report failure
            if (aContainer.isEmpty()) {
                window.app.console.log("createChildNode: child-node(" + aContainer.getId() + ") is empty");
                return true; // neither append, nor fail
            }
        }
        aParentNode.appendChildNode(aChildNode);
        return true;
    }
}
var SlideAnimations = /** @class */ (function () {
    function SlideAnimations(aSlideShowContext, metaSlide) {
        this.aContext = new NodeContext(aSlideShowContext);
        this.aSlideShowHandler = aSlideShowContext.aSlideShowHandler;
        this.aAnimationNodeMap = new Map();
        this.aAnimatedElementMap = new Map();
        this.aSourceEventElementMap = new Map();
        this.aNextEffectEventArray = new NextEffectEventArray();
        this.aInteractiveAnimationSequenceMap = new Map();
        this.aEventMultiplexer = new EventMultiplexer(aSlideShowContext.aTimerEventQueue);
        this.aRootNode = null;
        this.bElementsParsed = false;
        this.aContext.metaSlide = metaSlide;
        this.aContext.aAnimationNodeMap = this.aAnimationNodeMap;
        this.aContext.aAnimatedElementMap = this.aAnimatedElementMap;
        this.aContext.aSourceEventElementMap = this.aSourceEventElementMap;
    }
    SlideAnimations.prototype.importAnimations = function (aAnimationRoot) {
        if (!aAnimationRoot)
            return false;
        this.aRootNode = createAnimationTree(aAnimationRoot, this.aContext);
        return !!this.aRootNode;
    };
    SlideAnimations.prototype.parseInfo = function () {
        if (!this.aRootNode)
            return false;
        this.aRootNode.parseNodeInfo();
        this.bElementsParsed = true;
    };
    SlideAnimations.prototype.elementsParsed = function () {
        return this.bElementsParsed;
    };
    SlideAnimations.prototype.info = function (verbose) {
        if (this.aRootNode)
            return this.aRootNode.info(verbose);
    };
    SlideAnimations.prototype.isFirstRun = function () {
        return this.aContext.bFirstRun;
    };
    SlideAnimations.prototype.isAnimated = function () {
        if (!this.bElementsParsed)
            return false;
        return this.aRootNode.hasPendingAnimation();
    };
    SlideAnimations.prototype.start = function () {
        if (!this.bElementsParsed)
            return false;
        this.chargeSourceEvents();
        this.chargeInterAnimEvents();
        this.aSlideShowHandler.setSlideEvents(this.aNextEffectEventArray, this.aInteractiveAnimationSequenceMap, this.aEventMultiplexer);
        if (this.aContext.bFirstRun === undefined)
            this.aContext.bFirstRun = true;
        else if (this.aContext.bFirstRun)
            this.aContext.bFirstRun = false;
        // init all nodes
        this.aContext.bIsInvalid = !this.aRootNode.init();
        if (this.aContext.bIsInvalid) {
            ANIMDBG.print('SlideAnimationsthis.start: aContext.bIsInvalid');
            return false;
        }
        // resolve root node
        return this.aRootNode.resolve();
    };
    SlideAnimations.prototype.end = function (bLeftEffectsSkipped) {
        if (!this.bElementsParsed)
            return; // no animations there
        // end root node
        this.aRootNode.deactivate();
        this.aRootNode.end();
        if (bLeftEffectsSkipped && this.isFirstRun()) {
            // in case this is the first run and left events have been skipped
            // some next effect events for the slide could not be collected
            // so the next time we should behave as it was the first run again
            this.aContext.bFirstRun = undefined;
        }
        else if (this.isFirstRun()) {
            this.aContext.bFirstRun = false;
        }
        this.aContext.bIsInvalid = false;
    };
    SlideAnimations.prototype.dispose = function () {
        if (this.aRootNode) {
            this.aRootNode.dispose();
        }
        if (this.aEventMultiplexer) {
            this.aEventMultiplexer.clear();
        }
    };
    SlideAnimations.prototype.clearNextEffectEvents = function () {
        ANIMDBG.print('SlideAnimations.clearNextEffectEvents');
        this.aNextEffectEventArray.clear();
        this.aContext.bFirstRun = undefined;
    };
    SlideAnimations.prototype.chargeSourceEvents = function () {
        this.aSourceEventElementMap.forEach(function (aSourceEventElement) {
            aSourceEventElement.charge();
        });
    };
    SlideAnimations.prototype.chargeInterAnimEvents = function () {
        this.aInteractiveAnimationSequenceMap.forEach(function (aInteractiveAnimationSequence) {
            aInteractiveAnimationSequence.chargeEvents();
        });
    };
    SlideAnimations.prototype.getAnimationsTree = function () {
        return this.aRootNode;
    };
    SlideAnimations.prototype.getAnimatedElementMap = function () {
        return this.aAnimatedElementMap;
    };
    Object.defineProperty(SlideAnimations.prototype, "eventMultiplexer", {
        get: function () {
            return this.aEventMultiplexer;
        },
        enumerable: false,
        configurable: true
    });
    return SlideAnimations;
}());
//# sourceMappingURL=SlideAnimations.js.map