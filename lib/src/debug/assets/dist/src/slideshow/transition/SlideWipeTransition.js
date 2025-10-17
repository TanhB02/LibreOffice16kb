/* -*- js-indent-level: 8 -*- */
function SlideWipeTransition(transitionParameters) {
    if (transitionParameters.transitionFilterInfo.isDirectionForward) {
        return new SlideShow.CoverTransition(transitionParameters);
    }
    else {
        return new SlideShow.UncoverTransition(transitionParameters);
    }
}
SlideShow.SlideWipeTransition = SlideWipeTransition;
//# sourceMappingURL=SlideWipeTransition.js.map