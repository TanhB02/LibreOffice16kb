/* -*- js-indent-level: 8 -*- */
function PushWipeTransition(transitionParameters) {
    var transitionSubType = transitionParameters.transitionFilterInfo.transitionSubtype;
    if (transitionSubType == TransitionSubType.COMBHORIZONTAL ||
        transitionSubType == TransitionSubType.COMBVERTICAL) {
        return new SlideShow.CombTransition(transitionParameters);
    }
    else {
        return new SlideShow.PushTransition(transitionParameters);
    }
}
SlideShow.PushWipeTransition = PushWipeTransition;
//# sourceMappingURL=PushWipeTransition.js.map