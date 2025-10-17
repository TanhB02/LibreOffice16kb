/* -*- js-indent-level: 8 -*- */
function IrisWipeTransition(transitionParameters) {
    var transitionSubType = transitionParameters.transitionFilterInfo.transitionSubtype;
    if (transitionSubType == TransitionSubType.DIAMOND) {
        return new SlideShow.DiamondTransition(transitionParameters);
    }
    else {
        return new SlideShow.BoxTransition(transitionParameters);
    }
}
SlideShow.IrisWipeTransition = IrisWipeTransition;
//# sourceMappingURL=IrisWipeTransition.js.map