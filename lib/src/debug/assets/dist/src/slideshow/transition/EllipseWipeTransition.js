/* -*- js-indent-level: 8 -*- */
function EllipseWipeTransition(transitionParameters) {
    var transitionSubType = transitionParameters.transitionFilterInfo.transitionSubtype;
    if (transitionSubType != TransitionSubType.VERTICAL) {
        return new SlideShow.CircleTransition(transitionParameters);
    }
    else {
        return new SlideShow.OvalTransition(transitionParameters);
    }
}
SlideShow.EllipseWipeTransition = EllipseWipeTransition;
//# sourceMappingURL=EllipseWipeTransition.js.map