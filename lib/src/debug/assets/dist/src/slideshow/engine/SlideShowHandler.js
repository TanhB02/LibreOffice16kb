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
var SlideShowContext = /** @class */ (function () {
    function SlideShowContext(aSlideShowHandler, aTimerEventQueue, aEventMultiplexer, aNextEffectEventArray, aInteractiveAnimationSequenceMap, aActivityQueue) {
        this.aSlideShowHandler = aSlideShowHandler;
        this.aTimerEventQueue = aTimerEventQueue;
        this.aEventMultiplexer = aEventMultiplexer;
        this.aNextEffectEventArray = aNextEffectEventArray;
        this.aInteractiveAnimationSequenceMap = aInteractiveAnimationSequenceMap;
        this.aActivityQueue = aActivityQueue;
        this.bIsSkipping = false;
    }
    return SlideShowContext;
}());
var SlideShowHandler = /** @class */ (function () {
    function SlideShowHandler(presenter) {
        this.bIsFirstAutoEffectRunning = false;
        this.transitionsWithMipMapEnabled = new Set([
            TransitionSubType.CORNERSOUT,
            TransitionSubType.TOPTOBOTTOM,
            TransitionSubType.LEFTTORIGHT,
            TransitionSubType.BOTTOMRIGHT,
            TransitionSubType.BOTTOMLEFT,
            TransitionSubType.TOPCENTER,
            TransitionSubType.CORNERSIN,
            TransitionSubType.TOPLEFT,
            TransitionSubType.CIRCLE,
            TransitionSubType.FANOUTHORIZONTAL,
            TransitionSubType.ACROSS,
            TransitionSubType.DIAMOND,
            TransitionSubType.HEART,
        ]);
        this.presenter = presenter;
        this.aTimer = new ElapsedTime();
        this.aFrameSynchronization = new FrameSynchronization(SlideShowHandler.PREFERRED_FRAME_RATE);
        this.aTimerEventQueue = new TimerEventQueue(this.aTimer);
        this.aActivityQueue = new ActivityQueue(this.aTimer);
        this.aNextEffectEventArray = null;
        this.aInteractiveAnimationSequenceMap = null;
        this.aEventMultiplexer = null;
        this.aContext = new SlideShowContext(this, this.aTimerEventQueue, this.aEventMultiplexer, this.aNextEffectEventArray, this.aInteractiveAnimationSequenceMap, this.aActivityQueue);
        this.bIsIdle = true;
        this.bIsEnabled = true;
        this.bNoSlideTransition = false;
        this.bIsTransitionRunning = false;
        this.nCurrentEffect = 0;
        this.bIsNextEffectRunning = false;
        this.bIsRewinding = false;
        this.bIsSkipping = false;
        this.bIsSkippingAll = false;
        this.nTotalInteractivePlayingEffects = 0;
        this.aStartedEffectList = [];
        this.aStartedEffectIndexMap = new Map();
        this.aStartedEffectIndexMap.set(-1, undefined);
        this.automaticAdvanceTimeout = null;
    }
    Object.defineProperty(SlideShowHandler.prototype, "automaticAdvanceTimeoutRewindedEffect", {
        get: function () {
            var automaticAdvanceTimeout = this.automaticAdvanceTimeout;
            return automaticAdvanceTimeout.rewindedEffect;
        },
        enumerable: false,
        configurable: true
    });
    SlideShowHandler.prototype.setMetaPresentation = function (metaPres) {
        this.theMetaPres = metaPres;
    };
    SlideShowHandler.prototype.setNavigator = function (slideShowNavigator) {
        this.slideShowNavigator = slideShowNavigator;
    };
    SlideShowHandler.prototype.isGlSupported = function () {
        return !this.presenter._slideRenderer._context.is2dGl();
    };
    SlideShowHandler.prototype.setSlideEvents = function (aNextEffectEventArray, aInteractiveAnimationSequenceMap, aEventMultiplexer) {
        if (!aNextEffectEventArray)
            window.app.console.log('SlideShow.setSlideEvents: aNextEffectEventArray is not valid');
        if (!aInteractiveAnimationSequenceMap)
            window.app.console.log('SlideShow.setSlideEvents:aInteractiveAnimationSequenceMap  is not valid');
        if (!aEventMultiplexer)
            window.app.console.log('SlideShow.setSlideEvents: aEventMultiplexer is not valid');
        this.aContext.aNextEffectEventArray = aNextEffectEventArray;
        this.aNextEffectEventArray = aNextEffectEventArray;
        this.aContext.aInteractiveAnimationSequenceMap =
            aInteractiveAnimationSequenceMap;
        this.aInteractiveAnimationSequenceMap = aInteractiveAnimationSequenceMap;
        this.aContext.aEventMultiplexer = aEventMultiplexer;
        this.aEventMultiplexer = aEventMultiplexer;
        this.nCurrentEffect = 0;
    };
    SlideShowHandler.prototype.createSlideTransition = function (aSlideTransitionHandler, transitionParameters, aTransitionEndEvent) {
        if (this.bNoSlideTransition)
            return null;
        var aSlideTransition = aSlideTransitionHandler.createSlideTransition(transitionParameters);
        if (!aSlideTransition)
            return null;
        var nDuration = 0.001;
        if (aSlideTransitionHandler.getDuration().isValue()) {
            nDuration = aSlideTransitionHandler.getDuration().getValue();
        }
        else {
            window.app.console.log('SlideShow.createSlideTransition: duration is not a number');
        }
        var aCommonParameterSet = new ActivityParamSet();
        aCommonParameterSet.aEndEvent = aTransitionEndEvent;
        aCommonParameterSet.aTimerEventQueue = this.aTimerEventQueue;
        aCommonParameterSet.aActivityQueue = this.aActivityQueue;
        aCommonParameterSet.nMinDuration = nDuration;
        aCommonParameterSet.nMinNumberOfFrames =
            aSlideTransitionHandler.getMinFrameCount();
        aCommonParameterSet.nSlideWidth = this.theMetaPres.slideWidth;
        aCommonParameterSet.nSlideHeight = this.theMetaPres.slideHeight;
        return new SimpleActivity(aCommonParameterSet, aSlideTransition, DirectionType.Forward);
    };
    SlideShowHandler.prototype.isEnabled = function () {
        return this.bIsEnabled;
    };
    SlideShowHandler.prototype.disable = function () {
        this.bIsEnabled = false;
        this.dispose();
    };
    SlideShowHandler.prototype.isRunning = function () {
        return !this.bIsIdle;
    };
    SlideShowHandler.prototype.isTransitionPlaying = function () {
        return this.bIsTransitionRunning;
    };
    SlideShowHandler.prototype.isMainEffectPlaying = function () {
        return this.bIsNextEffectRunning;
    };
    SlideShowHandler.prototype.isInteractiveEffectPlaying = function () {
        return this.nTotalInteractivePlayingEffects > 0;
    };
    SlideShowHandler.prototype.isAnyEffectPlaying = function () {
        return this.isMainEffectPlaying() || this.isInteractiveEffectPlaying();
    };
    SlideShowHandler.prototype.hasAnyEffectStarted = function () {
        return this.aStartedEffectList.length > 0;
    };
    SlideShowHandler.prototype.notifyNextEffectStart = function () {
        var _this = this;
        assert(!this.bIsNextEffectRunning, 'SlideShowHandler.notifyNextEffectStart: an effect is already started.');
        ANIMDBG.print('SlideShowHandler.notifyNextEffectStart invoked.');
        this.bIsNextEffectRunning = true;
        this.aEventMultiplexer.registerNextEffectEndHandler(this.notifyNextEffectEnd.bind(this));
        var aEffect = new Effect();
        aEffect.start();
        this.aStartedEffectIndexMap.set(-1, this.aStartedEffectList.length);
        this.aStartedEffectList.push(aEffect);
        var sCurSlideHash = this.theMetaPres.getCurrentSlideHash();
        var curMetaSlide = this.theMetaPres.getMetaSlide(sCurSlideHash);
        if (curMetaSlide.animationsHandler) {
            var aAnimatedElementMap = curMetaSlide.animationsHandler.getAnimatedElementMap();
            aAnimatedElementMap.forEach(function (aAnimatedElement) {
                aAnimatedElement.notifyNextEffectStart(_this.nCurrentEffect);
            });
        }
    };
    SlideShowHandler.prototype.notifyNextEffectEnd = function () {
        assert(this.bIsNextEffectRunning, 'SlideShow.notifyNextEffectEnd: effect already ended.');
        ANIMDBG.print('SlideShowHandler.notifyNextEffectEnd invoked.');
        this.bIsNextEffectRunning = false;
        this.aStartedEffectList[this.aStartedEffectIndexMap.get(-1)].end();
        if (this.automaticAdvanceTimeout !== null) {
            if (this.automaticAdvanceTimeoutRewindedEffect === this.nCurrentEffect) {
                this.automaticAdvanceTimeout = null;
                this.notifyAnimationsEnd();
            }
        }
    };
    SlideShowHandler.prototype.notifyAnimationsEnd = function () {
        ANIMDBG.print('SlideShowHandler.notifyAnimationsEnd: current slide index: ' +
            this.slideShowNavigator.currentSlideIndex);
        var sCurrSlideHash = this.theMetaPres.getCurrentSlideHash();
        if (this.theMetaPres.isLastSlide(sCurrSlideHash))
            return;
        assert(this.automaticAdvanceTimeout === null, 'SlideShow.notifyAnimationsEnd: Timeout already set.');
        var slideInfo = this.theMetaPres.getSlideInfo(sCurrSlideHash);
        if ((slideInfo === null || slideInfo === void 0 ? void 0 : slideInfo.nextSlideDuration) && slideInfo.nextSlideDuration > 0) {
            this.automaticAdvanceTimeout = window.setTimeout(this.slideShowNavigator.switchSlide.bind(this.slideShowNavigator, 1, false), slideInfo.nextSlideDuration);
        }
    };
    SlideShowHandler.prototype.notifySlideStart = function (nNewSlideIndex, nOldSlideIndex) {
        var _this = this;
        this.nCurrentEffect = 0;
        this.bIsRewinding = false;
        this.bIsSkipping = false;
        this.bIsSkippingAll = false;
        this.nTotalInteractivePlayingEffects = 0;
        this.aStartedEffectList = [];
        this.aStartedEffectIndexMap = new Map();
        this.aStartedEffectIndexMap.set(-1, undefined);
        if (nOldSlideIndex !== undefined) {
            var metaOldSlide = this.theMetaPres.getMetaSlideByIndex(nOldSlideIndex);
            if (metaOldSlide.animationsHandler) {
                var aAnimatedElementMap = metaOldSlide.animationsHandler.getAnimatedElementMap();
                aAnimatedElementMap.forEach(function (aAnimatedElement) {
                    aAnimatedElement.notifySlideEnd();
                });
            }
        }
        var metaNewSlide = this.theMetaPres.getMetaSlideByIndex(nNewSlideIndex);
        if (metaNewSlide.animationsHandler) {
            var aAnimatedElementMap = metaNewSlide.animationsHandler.getAnimatedElementMap();
            aAnimatedElementMap.forEach(function (aAnimatedElement) {
                aAnimatedElement.notifySlideStart(_this.aContext);
            });
        }
        this.slideCompositor.notifyTransitionStart();
        this.presenter._map.fire('transitionstart', { slide: nNewSlideIndex });
    };
    SlideShowHandler.prototype.notifyTransitionEnd = function (nNewSlide, nOldSlide) {
        NAVDBG.print('SlideShowHandler.notifyTransitionEnd: nNewSlide: ' +
            nNewSlide +
            ', nOldSlide: ' +
            nOldSlide +
            ', this.bIsRewinding: ' +
            this.bIsRewinding);
        this.bIsTransitionRunning = false;
        if (this.bIsRewinding) {
            this.theMetaPres.getMetaSlideByIndex(nNewSlide).hide();
            this.slideShowNavigator.rewindToPreviousSlide();
            this.bIsRewinding = false;
            return;
        }
        var sCurSlideHash = this.theMetaPres.getCurrentSlideHash();
        this.slideCompositor.notifyTransitionEnd(sCurSlideHash);
        try {
            this.presentSlide(nNewSlide);
        }
        catch (message) {
            console.error('notifyTransitionEnd: ' + message);
        }
        this.presenter._map.fire('transitionend', { slide: nNewSlide });
        this.enteringSlideTexture = null;
        this.isStarting = false;
        if (this.isEnabled()) {
            // clear all queues
            this.dispose();
            var aCurrentSlide = this.theMetaPres.getMetaSlide(sCurSlideHash);
            if (aCurrentSlide &&
                aCurrentSlide.animationsHandler &&
                aCurrentSlide.animationsHandler.elementsParsed()) {
                aCurrentSlide.animationsHandler.start();
                this.aEventMultiplexer.registerAnimationsEndHandler(this.notifyAnimationsEnd.bind(this));
            }
            else
                this.notifyAnimationsEnd();
            this.update();
        }
        else
            this.notifyAnimationsEnd();
    };
    SlideShowHandler.prototype.notifyInteractiveAnimationSequenceStart = function (nNodeId) {
        ++this.nTotalInteractivePlayingEffects;
        var aEffect = new Effect(nNodeId);
        aEffect.start();
        this.aStartedEffectIndexMap.set(nNodeId, this.aStartedEffectList.length);
        this.aStartedEffectList.push(aEffect);
    };
    SlideShowHandler.prototype.notifyInteractiveAnimationSequenceEnd = function (nNodeId) {
        assert(this.isInteractiveEffectPlaying(), 'SlideShow.notifyInteractiveAnimationSequenceEnd: no interactive effect playing.');
        this.aStartedEffectList[this.aStartedEffectIndexMap.get(nNodeId)].end();
        --this.nTotalInteractivePlayingEffects;
    };
    /** nextEffect
     *  Start the next effect belonging to the main animation sequence if any.
     *  If there is an already playing effect belonging to any animation sequence
     *  it is skipped.
     *
     *  @return {Boolean}
     *      False if there is no more effect to start, true otherwise.
     */
    SlideShowHandler.prototype.nextEffect = function () {
        if (!this.isEnabled())
            return false;
        if (this.isTransitionPlaying()) {
            this.skipTransition();
            return true;
        }
        if (this.isFirstAutoEffectRunning()) {
            this.skipFirstAutoEffect();
            return true;
        }
        ANIMDBG.print("SlideShowHandler.nextEffect: current effect: " + this.nCurrentEffect);
        if (this.isAnyEffectPlaying()) {
            this.skipAllPlayingEffects();
            return true;
        }
        if (!this.aNextEffectEventArray)
            return false;
        if (this.nCurrentEffect >= this.aNextEffectEventArray.size())
            return false;
        this.notifyNextEffectStart();
        this.aNextEffectEventArray.at(this.nCurrentEffect).fire();
        ++this.nCurrentEffect;
        this.update();
        return true;
    };
    /** skipTransition
     *  Skip the current playing slide transition.
     */
    SlideShowHandler.prototype.skipTransition = function () {
        if (this.bIsSkipping || this.bIsRewinding)
            return;
        this.bIsSkipping = true;
        this.aActivityQueue.endAll();
        this.aTimerEventQueue.forceEmpty();
        this.aActivityQueue.endAll();
        this.update();
        this.bIsSkipping = false;
    };
    /** skipAllPlayingEffects
     *  Skip all playing effect, independently to which animation sequence they
     *  belong.
     *
     */
    SlideShowHandler.prototype.skipAllPlayingEffects = function () {
        if (this.bIsSkipping || this.bIsRewinding)
            return true;
        this.bIsSkipping = true;
        // TODO: The correct order should be based on the left playing time.
        for (var i = 0; i < this.aStartedEffectList.length; ++i) {
            var aEffect = this.aStartedEffectList[i];
            if (aEffect.isPlaying()) {
                if (aEffect.isMainEffect())
                    this.aEventMultiplexer.notifySkipEffectEvent();
                else
                    this.aEventMultiplexer.notifySkipInteractiveEffectEvent(aEffect.getId());
            }
        }
        this.update();
        this.bIsSkipping = false;
        return true;
    };
    /** skipNextEffect
     *  Skip the next effect to be played (if any) that belongs to the main
     *  animation sequence.
     *  Require: no effect is playing.
     *
     *  @return {Boolean}
     *      False if there is no more effect to skip, true otherwise.
     */
    SlideShowHandler.prototype.skipNextEffect = function () {
        if (this.bIsSkipping || this.bIsRewinding)
            return true;
        ANIMDBG.print("SlideShowHandler.skipNextEffect: current effect: " + this.nCurrentEffect);
        assert(!this.isAnyEffectPlaying(), 'SlideShowHandler.skipNextEffect');
        if (!this.aNextEffectEventArray)
            return false;
        if (this.nCurrentEffect >= this.aNextEffectEventArray.size())
            return false;
        this.notifyNextEffectStart();
        this.bIsSkipping = true;
        this.aNextEffectEventArray.at(this.nCurrentEffect).fire();
        this.aEventMultiplexer.notifySkipEffectEvent();
        ++this.nCurrentEffect;
        this.update();
        this.bIsSkipping = false;
        return true;
    };
    /** skipPlayingOrNextEffect
     *  Skip the next effect to be played that belongs to the main animation
     *  sequence  or all playing effects.
     *
     *  @return {Boolean}
     *      False if there is no more effect to skip, true otherwise.
     */
    SlideShowHandler.prototype.skipPlayingOrNextEffect = function () {
        if (this.isTransitionPlaying()) {
            this.skipTransition();
            return true;
        }
        if (this.isFirstAutoEffectRunning()) {
            this.skipFirstAutoEffect();
            return true;
        }
        if (this.isAnyEffectPlaying())
            return this.skipAllPlayingEffects();
        else
            return this.skipNextEffect();
    };
    /** skipAllEffects
     *  Skip all left effects that belongs to the main animation sequence and all
     *  playing effects on the current slide.
     *
     *  @return {Boolean}
     *      True if it is already skipping or when it has ended skipping,
     *      false if the next slide needs to be displayed.
     */
    SlideShowHandler.prototype.skipAllEffects = function () {
        if (this.bIsSkippingAll)
            return true;
        this.bIsSkippingAll = true;
        if (this.isTransitionPlaying()) {
            this.skipTransition();
        }
        if (this.isFirstAutoEffectRunning()) {
            this.skipFirstAutoEffect();
        }
        if (this.isAnyEffectPlaying()) {
            this.skipAllPlayingEffects();
        }
        else if (!this.aNextEffectEventArray ||
            this.nCurrentEffect >= this.aNextEffectEventArray.size()) {
            this.bIsSkippingAll = false;
            return false;
        }
        // Pay attention here: a new next effect event is appended to
        // aNextEffectEventArray only after the related animation node has been
        // resolved, that is only after the animation node related to the previous
        // effect has notified to be deactivated to the main sequence time container.
        // So you should avoid any optimization here because the size of
        // aNextEffectEventArray will going on increasing after every skip action.
        while (this.nCurrentEffect < this.aNextEffectEventArray.size()) {
            this.skipNextEffect();
        }
        this.bIsSkippingAll = false;
        return true;
    };
    /** rewindTransition
     * Rewind the current playing slide transition.
     */
    SlideShowHandler.prototype.rewindTransition = function () {
        if (this.bIsSkipping || this.bIsRewinding)
            return;
        this.bIsRewinding = true;
        this.aActivityQueue.endAll();
        this.update();
        this.bIsRewinding = false;
    };
    /** rewindEffect
     *  Rewind all the effects started after at least one of the current playing
     *  effects. If there is no playing effect, it rewinds the last played one,
     *  both in case it belongs to the main or to an interactive animation sequence.
     *
     */
    SlideShowHandler.prototype.rewindEffect = function () {
        if (this.bIsSkipping || this.bIsRewinding)
            return;
        if (this.automaticAdvanceTimeout !== null &&
            !this.automaticAdvanceTimeoutRewindedEffect) {
            clearTimeout(this.automaticAdvanceTimeout);
            this.automaticAdvanceTimeout = { rewindedEffect: this.nCurrentEffect };
        }
        if (!this.hasAnyEffectStarted()) {
            this.rewindToPreviousSlide();
            return;
        }
        this.bIsRewinding = true;
        var nFirstPlayingEffectIndex = undefined;
        var i = 0;
        for (; i < this.aStartedEffectList.length; ++i) {
            var aEffect = this.aStartedEffectList[i];
            if (aEffect.isPlaying()) {
                nFirstPlayingEffectIndex = i;
                break;
            }
        }
        // There is at least one playing effect.
        if (nFirstPlayingEffectIndex !== undefined) {
            i = this.aStartedEffectList.length - 1;
            for (; i >= nFirstPlayingEffectIndex; --i) {
                var aEffect = this.aStartedEffectList[i];
                if (aEffect.isPlaying()) {
                    if (aEffect.isMainEffect()) {
                        this.aEventMultiplexer.notifyRewindCurrentEffectEvent();
                        if (this.nCurrentEffect > 0)
                            --this.nCurrentEffect;
                    }
                    else {
                        this.aEventMultiplexer.notifyRewindRunningInteractiveEffectEvent(aEffect.getId());
                    }
                }
                else if (aEffect.isEnded()) {
                    if (aEffect.isMainEffect()) {
                        this.aEventMultiplexer.notifyRewindLastEffectEvent();
                        if (this.nCurrentEffect > 0)
                            --this.nCurrentEffect;
                    }
                    else {
                        this.aEventMultiplexer.notifyRewindEndedInteractiveEffectEvent(aEffect.getId());
                    }
                }
            }
            this.update();
            // Pay attention here: we need to remove all rewinded effects from
            // the started effect list only after updating.
            i = this.aStartedEffectList.length - 1;
            for (; i >= nFirstPlayingEffectIndex; --i) {
                var aEffect = this.aStartedEffectList.pop();
                if (!aEffect.isMainEffect())
                    this.aStartedEffectIndexMap.delete(aEffect.getId());
            }
        } // there is no playing effect
        else {
            var aEffect = this.aStartedEffectList.pop();
            if (!aEffect.isMainEffect())
                this.aStartedEffectIndexMap.delete(aEffect.getId());
            if (aEffect.isEnded()) {
                // Well that is almost an assertion.
                if (aEffect.isMainEffect()) {
                    this.aEventMultiplexer.notifyRewindLastEffectEvent();
                    if (this.nCurrentEffect > 0)
                        --this.nCurrentEffect;
                }
                else {
                    this.aEventMultiplexer.notifyRewindEndedInteractiveEffectEvent(aEffect.getId());
                }
            }
            this.update();
        }
        this.bIsRewinding = false;
    };
    /** rewindToPreviousSlide
     *  Displays the previous slide with all effects, that belong to the main
     *  animation sequence, played.
     *
     */
    SlideShowHandler.prototype.rewindToPreviousSlide = function () {
        NAVDBG.print('SlideShowHandler.rewindToPreviousSlide');
        if (this.isFirstAutoEffectRunning()) {
            this.rewindFirstAutoEffect();
        }
        if (this.isTransitionPlaying()) {
            this.rewindTransition();
            return;
        }
        if (this.isAnyEffectPlaying())
            return;
        this.slideShowNavigator.rewindToPreviousSlide();
    };
    /** rewindAllEffects
     *  Rewind all effects already played on the current slide.
     *
     */
    SlideShowHandler.prototype.rewindAllEffects = function () {
        if (!this.hasAnyEffectStarted()) {
            this.rewindToPreviousSlide();
            return;
        }
        while (this.hasAnyEffectStarted()) {
            this.rewindEffect();
        }
    };
    SlideShowHandler.prototype.cleanLeavingSlideStatus = function (nOldSlide, bSkipSlideTransition) {
        var aMetaDoc = this.theMetaPres;
        if (nOldSlide !== undefined) {
            this.slideCompositor.pauseVideos(aMetaDoc.getSlideHash(nOldSlide));
            var oldMetaSlide = aMetaDoc.getMetaSlideByIndex(nOldSlide);
            if (this.isEnabled()) {
                if (oldMetaSlide.animationsHandler &&
                    oldMetaSlide.animationsHandler.isAnimated()) {
                    // force end animations
                    oldMetaSlide.animationsHandler.end(bSkipSlideTransition);
                    // clear all queues
                    this.dispose();
                }
            }
            if (this.automaticAdvanceTimeout !== null) {
                clearTimeout(this.automaticAdvanceTimeout);
                this.automaticAdvanceTimeout = null;
            }
        }
    };
    // This method must be invoked by SlideShowNavigator.displaySlide only,
    // since we need to update the current slide index.
    SlideShowHandler.prototype.displaySlide = function (nNewSlide, nOldSlide, bSkipSlideTransition) {
        NAVDBG.print('SlideShowHandler.displaySlide: nNewSlide: ' +
            nNewSlide +
            ', nOldSlide: ' +
            nOldSlide);
        var aMetaDoc = this.theMetaPres;
        if (nNewSlide >= aMetaDoc.numberOfSlides) {
            this.exitSlideShow();
        }
        if (this.isTransitionPlaying()) {
            this.skipTransition();
        }
        if (this.isFirstAutoEffectRunning()) {
            this.skipFirstAutoEffect();
        }
        // handle current slide
        if (nOldSlide !== undefined) {
            this.cleanLeavingSlideStatus(nOldSlide, bSkipSlideTransition);
        }
        this.notifySlideStart(nNewSlide, nOldSlide);
        if (this.isEnabled() && this.isGlSupported() && !bSkipSlideTransition) {
            // create slide transition and add to activity queue
            if ((nOldSlide === undefined && this.isStarting) ||
                (nOldSlide !== undefined && nNewSlide > nOldSlide)) {
                var aNewMetaSlide = aMetaDoc.getMetaSlideByIndex(nNewSlide);
                var aSlideTransitionHandler = aNewMetaSlide.transitionHandler;
                if (aSlideTransitionHandler && aSlideTransitionHandler.isValid()) {
                    var aTransitionEndEvent = makeEvent(this.notifyTransitionEnd.bind(this, nNewSlide, nOldSlide));
                    try {
                        var transitionParameters = this.createTransitionParameters(nNewSlide, nOldSlide);
                        this.enteringSlideTexture = transitionParameters.next;
                        var aTransitionActivity = this.createSlideTransition(aSlideTransitionHandler, transitionParameters, aTransitionEndEvent);
                        if (aTransitionActivity) {
                            this.bIsTransitionRunning = true;
                            this.aActivityQueue.addActivity(aTransitionActivity);
                            this.update();
                            this.presenter.stopLoader();
                            return;
                        }
                    }
                    catch (message) {
                        console.error('displaySlide failed: ' + message);
                    }
                }
            }
        }
        this.notifyTransitionEnd(nNewSlide, nOldSlide);
    };
    SlideShowHandler.prototype.exitSlideShow = function () {
        // TODO: implement it;
        this.automaticAdvanceTimeout = null;
    };
    SlideShowHandler.prototype.update = function () {
        this.aTimer.holdTimer();
        // process queues
        this.aTimerEventQueue.process();
        this.aActivityQueue.process();
        if (!this.bIsTransitionRunning)
            this.aFrameSynchronization.synchronize();
        this.aActivityQueue.processDequeued();
        this.aTimer.releaseTimer();
        var bActivitiesLeft = !this.aActivityQueue.isEmpty();
        var bTimerEventsLeft = !this.aTimerEventQueue.isEmpty();
        var bEventsLeft = bActivitiesLeft || bTimerEventsLeft;
        if (bEventsLeft) {
            var nNextTimeout = void 0;
            if (bActivitiesLeft) {
                nNextTimeout = SlideShowHandler.MINIMUM_TIMEOUT;
                this.aFrameSynchronization.activate();
            }
            else {
                nNextTimeout = this.aTimerEventQueue.nextTimeout();
                if (nNextTimeout < SlideShowHandler.MINIMUM_TIMEOUT)
                    nNextTimeout = SlideShowHandler.MINIMUM_TIMEOUT;
                else if (nNextTimeout > SlideShowHandler.MAXIMUM_TIMEOUT)
                    nNextTimeout = SlideShowHandler.MAXIMUM_TIMEOUT;
                this.aFrameSynchronization.deactivate();
            }
            this.bIsIdle = false;
            setTimeout(this.update.bind(this), nNextTimeout * 1000);
        }
        else {
            this.bIsIdle = true;
        }
    };
    SlideShowHandler.prototype.dispose = function () {
        // clear all queues
        this.aTimerEventQueue.clear();
        this.aActivityQueue.clear();
        this.aNextEffectEventArray = null;
        this.aEventMultiplexer = null;
        this.automaticAdvanceTimeout = null;
    };
    SlideShowHandler.prototype.getContext = function () {
        return this.aContext;
    };
    Object.defineProperty(SlideShowHandler.prototype, "slideRenderer", {
        get: function () {
            return this.presenter._slideRenderer;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SlideShowHandler.prototype, "slideCompositor", {
        get: function () {
            return this.presenter._slideCompositor;
        },
        enumerable: false,
        configurable: true
    });
    SlideShowHandler.prototype.getSlideInfo = function (nSlideIndex) {
        return this.theMetaPres.getSlideInfoByIndex(nSlideIndex);
    };
    SlideShowHandler.prototype.getAnimatedLayerInfo = function (slideHash, targetElement) {
        return this.slideCompositor.getAnimatedLayerInfo(slideHash, targetElement);
    };
    SlideShowHandler.prototype.isMipMapsEnable = function (transitionFilterInfo) {
        return (transitionFilterInfo.transitionType === TransitionType.MISCSHAPEWIPE &&
            this.transitionsWithMipMapEnabled.has(transitionFilterInfo.transitionSubtype));
    };
    SlideShowHandler.prototype.getTexture = function (nSlideIndex, transitionFilterInfo) {
        var slideImage = this.slideCompositor.getSlide(nSlideIndex);
        if (!slideImage) {
            console.error('SlideShowHandler: cannot get texture');
            return null;
        }
        // added check for mipmap texture
        var isMipMapEnable = false;
        if (transitionFilterInfo &&
            transitionFilterInfo.transitionType &&
            transitionFilterInfo.transitionSubtype) {
            isMipMapEnable = this.isMipMapsEnable(transitionFilterInfo);
        }
        return this.slideRenderer.createTexture(slideImage, isMipMapEnable);
    };
    SlideShowHandler.prototype.presentSlide = function (nSlideIndex) {
        var slideTexture = this.enteringSlideTexture;
        if (!slideTexture)
            slideTexture = this.getTexture(nSlideIndex);
        this.slideRenderer.renderSlide(slideTexture, this.getSlideInfo(nSlideIndex));
        this.presenter.stopLoader();
    };
    SlideShowHandler.prototype.createTransitionParameters = function (nNewSlide, nOldSlide) {
        var leavingSlideTexture = null;
        var transitionFilterInfo = TransitionFilterInfo.fromSlideInfo(this.getSlideInfo(nNewSlide));
        if (this.isStarting) {
            leavingSlideTexture = this.slideRenderer.createEmptyTexture();
        }
        else {
            leavingSlideTexture =
                nOldSlide !== undefined &&
                    this.slideRenderer.lastRenderedSlideIndex === nOldSlide
                    ? this.slideRenderer.getSlideTexture()
                    : this.getTexture(nOldSlide, transitionFilterInfo);
        }
        var enteringSlideTexture = this.getTexture(nNewSlide, transitionFilterInfo);
        var transitionParameters = new TransitionParameters();
        transitionParameters.context = this.slideRenderer._context;
        transitionParameters.current = leavingSlideTexture;
        transitionParameters.next = enteringSlideTexture;
        transitionParameters.transitionFilterInfo = transitionFilterInfo;
        return transitionParameters;
    };
    SlideShowHandler.prototype.notifyFirstAutoEffectStarted = function () {
        console.debug('SlideShowHandler.notifyFirstAutoEffectStarted');
        this.bIsFirstAutoEffectRunning = true;
    };
    SlideShowHandler.prototype.notifyFirstAutoEffectEnded = function () {
        console.debug('SlideShowHandler.notifyFirstAutoEffectEnded');
        this.bIsFirstAutoEffectRunning = false;
    };
    SlideShowHandler.prototype.isFirstAutoEffectRunning = function () {
        return this.bIsFirstAutoEffectRunning;
    };
    SlideShowHandler.prototype.skipFirstAutoEffect = function () {
        console.debug('SlideShowHandler.skipFirstAutoEffect');
        this.bIsSkipping = true;
        this.aEventMultiplexer.notifySkipEffectEvent();
        this.update();
        this.bIsSkipping = false;
        // empty body
    };
    SlideShowHandler.prototype.rewindFirstAutoEffect = function () {
        this.bIsRewinding = true;
        this.aEventMultiplexer.notifyRewindCurrentEffectEvent();
        this.update();
        this.bIsRewinding = false;
    };
    SlideShowHandler.MAXIMUM_FRAME_COUNT = 120;
    SlideShowHandler.MINIMUM_TIMEOUT = 1.0 / SlideShowHandler.MAXIMUM_FRAME_COUNT;
    SlideShowHandler.MAXIMUM_TIMEOUT = 4.0;
    SlideShowHandler.MINIMUM_FRAMES_PER_SECONDS = 10;
    SlideShowHandler.PREFERRED_FRAMES_PER_SECONDS = 60;
    SlideShowHandler.PREFERRED_FRAME_RATE = 1.0 / SlideShowHandler.PREFERRED_FRAMES_PER_SECONDS;
    return SlideShowHandler;
}());
//# sourceMappingURL=SlideShowHandler.js.map