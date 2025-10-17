/* -*- js-indent-level: 8 -*- */
function BarWipeTransition(transitionParameters) {
    var transitionSubType = transitionParameters.transitionFilterInfo.transitionSubtype;
    if (transitionSubType == TransitionSubType.FADEOVERCOLOR) {
        return new SlideShow.CutTransition(transitionParameters);
    }
    else {
        return new SlideShow.WipeTransition(transitionParameters);
    }
}
SlideShow.BarWipeTransition = BarWipeTransition;
//# sourceMappingURL=BarWipeTransition.js.map