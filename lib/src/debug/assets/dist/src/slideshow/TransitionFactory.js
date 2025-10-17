/* -*- js-indent-level: 8 -*- */
var TransitionType;
(function (TransitionType) {
    TransitionType[TransitionType["INVALID"] = 0] = "INVALID";
    TransitionType[TransitionType["BARWIPE"] = 1] = "BARWIPE";
    TransitionType[TransitionType["PINWHEELWIPE"] = 2] = "PINWHEELWIPE";
    TransitionType[TransitionType["SLIDEWIPE"] = 3] = "SLIDEWIPE";
    TransitionType[TransitionType["RANDOMBARWIPE"] = 4] = "RANDOMBARWIPE";
    TransitionType[TransitionType["CHECKERBOARDWIPE"] = 5] = "CHECKERBOARDWIPE";
    TransitionType[TransitionType["FOURBOXWIPE"] = 6] = "FOURBOXWIPE";
    TransitionType[TransitionType["IRISWIPE"] = 7] = "IRISWIPE";
    TransitionType[TransitionType["FANWIPE"] = 8] = "FANWIPE";
    TransitionType[TransitionType["BLINDSWIPE"] = 9] = "BLINDSWIPE";
    TransitionType[TransitionType["FADE"] = 10] = "FADE";
    TransitionType[TransitionType["DISSOLVE"] = 11] = "DISSOLVE";
    TransitionType[TransitionType["PUSHWIPE"] = 12] = "PUSHWIPE";
    TransitionType[TransitionType["ELLIPSEWIPE"] = 13] = "ELLIPSEWIPE";
    TransitionType[TransitionType["BARNDOORWIPE"] = 14] = "BARNDOORWIPE";
    TransitionType[TransitionType["WATERFALLWIPE"] = 15] = "WATERFALLWIPE";
    TransitionType[TransitionType["MISCSHAPEWIPE"] = 16] = "MISCSHAPEWIPE";
    TransitionType[TransitionType["ZOOM"] = 17] = "ZOOM";
})(TransitionType || (TransitionType = {}));
var TransitionSubType;
(function (TransitionSubType) {
    TransitionSubType[TransitionSubType["DEFAULT"] = 0] = "DEFAULT";
    TransitionSubType[TransitionSubType["LEFTTORIGHT"] = 1] = "LEFTTORIGHT";
    TransitionSubType[TransitionSubType["TOPTOBOTTOM"] = 2] = "TOPTOBOTTOM";
    TransitionSubType[TransitionSubType["EIGHTBLADE"] = 3] = "EIGHTBLADE";
    TransitionSubType[TransitionSubType["FOURBLADE"] = 4] = "FOURBLADE";
    TransitionSubType[TransitionSubType["THREEBLADE"] = 5] = "THREEBLADE";
    TransitionSubType[TransitionSubType["TWOBLADEVERTICAL"] = 6] = "TWOBLADEVERTICAL";
    TransitionSubType[TransitionSubType["ONEBLADE"] = 7] = "ONEBLADE";
    TransitionSubType[TransitionSubType["FROMTOPLEFT"] = 8] = "FROMTOPLEFT";
    TransitionSubType[TransitionSubType["FROMTOPRIGHT"] = 9] = "FROMTOPRIGHT";
    TransitionSubType[TransitionSubType["FROMBOTTOMLEFT"] = 10] = "FROMBOTTOMLEFT";
    TransitionSubType[TransitionSubType["FROMBOTTOMRIGHT"] = 11] = "FROMBOTTOMRIGHT";
    TransitionSubType[TransitionSubType["VERTICAL"] = 12] = "VERTICAL";
    TransitionSubType[TransitionSubType["HORIZONTAL"] = 13] = "HORIZONTAL";
    TransitionSubType[TransitionSubType["DOWN"] = 14] = "DOWN";
    TransitionSubType[TransitionSubType["ACROSS"] = 15] = "ACROSS";
    TransitionSubType[TransitionSubType["CORNERSOUT"] = 16] = "CORNERSOUT";
    TransitionSubType[TransitionSubType["DIAMOND"] = 17] = "DIAMOND";
    TransitionSubType[TransitionSubType["CIRCLE"] = 18] = "CIRCLE";
    TransitionSubType[TransitionSubType["RECTANGLE"] = 19] = "RECTANGLE";
    TransitionSubType[TransitionSubType["CENTERTOP"] = 20] = "CENTERTOP";
    TransitionSubType[TransitionSubType["CROSSFADE"] = 21] = "CROSSFADE";
    TransitionSubType[TransitionSubType["FADEOVERCOLOR"] = 22] = "FADEOVERCOLOR";
    TransitionSubType[TransitionSubType["FROMLEFT"] = 23] = "FROMLEFT";
    TransitionSubType[TransitionSubType["FROMRIGHT"] = 24] = "FROMRIGHT";
    TransitionSubType[TransitionSubType["FROMTOP"] = 25] = "FROMTOP";
    TransitionSubType[TransitionSubType["FROMBOTTOM"] = 26] = "FROMBOTTOM";
    TransitionSubType[TransitionSubType["HORIZONTALLEFT"] = 27] = "HORIZONTALLEFT";
    TransitionSubType[TransitionSubType["HORIZONTALRIGHT"] = 28] = "HORIZONTALRIGHT";
    TransitionSubType[TransitionSubType["COMBVERTICAL"] = 29] = "COMBVERTICAL";
    TransitionSubType[TransitionSubType["COMBHORIZONTAL"] = 30] = "COMBHORIZONTAL";
    TransitionSubType[TransitionSubType["TOPLEFT"] = 31] = "TOPLEFT";
    TransitionSubType[TransitionSubType["TOPRIGHT"] = 32] = "TOPRIGHT";
    TransitionSubType[TransitionSubType["BOTTOMRIGHT"] = 33] = "BOTTOMRIGHT";
    TransitionSubType[TransitionSubType["BOTTOMLEFT"] = 34] = "BOTTOMLEFT";
    TransitionSubType[TransitionSubType["TOPCENTER"] = 35] = "TOPCENTER";
    TransitionSubType[TransitionSubType["RIGHTCENTER"] = 36] = "RIGHTCENTER";
    TransitionSubType[TransitionSubType["BOTTOMCENTER"] = 37] = "BOTTOMCENTER";
    TransitionSubType[TransitionSubType["HEARTCORNERSIN"] = 38] = "HEARTCORNERSIN";
    TransitionSubType[TransitionSubType["FANOUTHORIZONTAL"] = 39] = "FANOUTHORIZONTAL";
    TransitionSubType[TransitionSubType["CORNERSIN"] = 40] = "CORNERSIN";
    TransitionSubType[TransitionSubType["HEART"] = 41] = "HEART";
    TransitionSubType[TransitionSubType["ROTATEIN"] = 42] = "ROTATEIN";
})(TransitionSubType || (TransitionSubType = {}));
var stringToTransitionTypeMap = {
    Invalid: TransitionType.INVALID,
    BarWipe: TransitionType.BARWIPE,
    PineWheelWipe: TransitionType.PINWHEELWIPE,
    SlideWipe: TransitionType.SLIDEWIPE,
    RandomBarWipe: TransitionType.RANDOMBARWIPE,
    CheckerBoardWipe: TransitionType.CHECKERBOARDWIPE,
    FourBoxWipe: TransitionType.FOURBOXWIPE,
    IrisWipe: TransitionType.IRISWIPE,
    FanWipe: TransitionType.FANWIPE,
    BlindWipe: TransitionType.BLINDSWIPE,
    Fade: TransitionType.FADE,
    Dissolve: TransitionType.DISSOLVE,
    PushWipe: TransitionType.PUSHWIPE,
    EllipseWipe: TransitionType.ELLIPSEWIPE,
    BarnDoorWipe: TransitionType.BARNDOORWIPE,
    WaterfallWipe: TransitionType.WATERFALLWIPE,
    MiscShapeWipe: TransitionType.MISCSHAPEWIPE,
    Zoom: TransitionType.ZOOM,
};
var stringToTransitionSubTypeMap = {
    Default: TransitionSubType.DEFAULT,
    LeftToRight: TransitionSubType.LEFTTORIGHT,
    TopToBottom: TransitionSubType.TOPTOBOTTOM,
    '8Blade': TransitionSubType.EIGHTBLADE,
    '4Blade': TransitionSubType.FOURBLADE,
    '3Blade': TransitionSubType.THREEBLADE,
    '2BladeVertical': TransitionSubType.TWOBLADEVERTICAL,
    '1Blade': TransitionSubType.ONEBLADE,
    FromTopLeft: TransitionSubType.FROMTOPLEFT,
    FromTopRight: TransitionSubType.FROMTOPRIGHT,
    FromBottomLeft: TransitionSubType.FROMBOTTOMLEFT,
    FromBottomRight: TransitionSubType.FROMBOTTOMRIGHT,
    Vertical: TransitionSubType.VERTICAL,
    Horizontal: TransitionSubType.HORIZONTAL,
    Down: TransitionSubType.DOWN,
    Across: TransitionSubType.ACROSS,
    CornersOut: TransitionSubType.CORNERSOUT,
    Diamond: TransitionSubType.DIAMOND,
    Circle: TransitionSubType.CIRCLE,
    Rectangle: TransitionSubType.RECTANGLE,
    CenterTop: TransitionSubType.CENTERTOP,
    CrossFade: TransitionSubType.CROSSFADE,
    FadeOverColor: TransitionSubType.FADEOVERCOLOR,
    FromLeft: TransitionSubType.FROMLEFT,
    FromRight: TransitionSubType.FROMRIGHT,
    FromTop: TransitionSubType.FROMTOP,
    FromBottom: TransitionSubType.FROMBOTTOM,
    HorizontalLeft: TransitionSubType.HORIZONTALLEFT,
    HorizontalRight: TransitionSubType.HORIZONTALRIGHT,
    CombVertical: TransitionSubType.COMBVERTICAL,
    CombHorizontal: TransitionSubType.COMBHORIZONTAL,
    TopLeft: TransitionSubType.TOPLEFT,
    TopRight: TransitionSubType.TOPRIGHT,
    BottomRight: TransitionSubType.BOTTOMRIGHT,
    BottomLeft: TransitionSubType.BOTTOMLEFT,
    TopCenter: TransitionSubType.TOPCENTER,
    RightCenter: TransitionSubType.RIGHTCENTER,
    BottomCenter: TransitionSubType.BOTTOMCENTER,
    CornersIn: TransitionSubType.CORNERSIN,
    FanOutHorizontal: TransitionSubType.FANOUTHORIZONTAL,
    Heart: TransitionSubType.HEART,
    RotateIn: TransitionSubType.ROTATEIN,
};
function createTransition(transitionParameters, isSlideTransition) {
    var type = transitionParameters.transitionFilterInfo.transitionType;
    switch (type) {
        case TransitionType.BARWIPE:
            return BarWipeTransition(transitionParameters);
        case TransitionType.PINWHEELWIPE:
            return new SlideShow.WheelTransition(transitionParameters);
        case TransitionType.RANDOMBARWIPE:
            return new SlideShow.BarsTransition(transitionParameters);
        case TransitionType.CHECKERBOARDWIPE:
            return new SlideShow.CheckersTransition(transitionParameters);
        case TransitionType.FOURBOXWIPE:
            return new SlideShow.PlusTransition(transitionParameters);
        case TransitionType.IRISWIPE:
            return SlideShow.IrisWipeTransition(transitionParameters);
        case TransitionType.ELLIPSEWIPE:
            return SlideShow.EllipseWipeTransition(transitionParameters);
        case TransitionType.FANWIPE:
            return new SlideShow.WedgeTransition(transitionParameters);
        case TransitionType.BLINDSWIPE:
            return new SlideShow.VenetianTransition(transitionParameters);
        case TransitionType.DISSOLVE:
            return new SlideShow.SimpleDissolveTransition(transitionParameters);
        case TransitionType.BARNDOORWIPE:
            return new SlideShow.SplitTransition(transitionParameters);
        case TransitionType.WATERFALLWIPE:
            return new SlideShow.DiagonalTransition(transitionParameters);
    }
    if (isSlideTransition) {
        switch (type) {
            case TransitionType.FADE:
                return new SlideShow.FadeTransition(transitionParameters);
            case TransitionType.SLIDEWIPE:
                return SlideWipeTransition(transitionParameters);
            case TransitionType.PUSHWIPE:
                return SlideShow.PushWipeTransition(transitionParameters);
            case TransitionType.MISCSHAPEWIPE:
                return SlideShow.MicsShapeWipeTransition(transitionParameters);
            case TransitionType.ZOOM:
                return SlideShow.NewsFlashTransition(transitionParameters);
        }
    }
    console.log('Unknown transition type', transitionParameters.transitionFilterInfo.transitionType);
    return new SlideShow.NoTransition(transitionParameters);
}
//# sourceMappingURL=TransitionFactory.js.map