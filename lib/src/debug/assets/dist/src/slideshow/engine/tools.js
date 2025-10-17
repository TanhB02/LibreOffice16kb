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
function assert(object, message) {
    if (!object) {
        window.app.console.trace();
        throw new Error(message);
    }
}
function getCurrentSystemTime() {
    return performance.now();
}
// Remove any whitespace inside a string
function removeWhiteSpaces(str) {
    if (!str)
        return '';
    var re = / */;
    var aSplitString = str.split(re);
    return aSplitString.join('');
}
function clampN(nValue, nMinimum, nMaximum) {
    return Math.min(Math.max(nValue, nMinimum), nMaximum);
}
function hasValue(x) {
    return x !== undefined && x !== null;
}
function booleanParser(sValue) {
    sValue = sValue.toLowerCase();
    return sValue === 'true';
}
function colorParser(sValue) {
    // The following 3 color functions are used in evaluating sValue string
    // so don't remove them.
    /* eslint-disable no-unused-vars */
    function hsl(nHue, nSaturation, nLuminance) {
        return new HSLColor(nHue, nSaturation / 100, nLuminance / 100);
    }
    function rgb(nRed, nGreen, nBlue) {
        return new RGBColor(nRed / 255, nGreen / 255, nBlue / 255);
    }
    function prgb(nRed, nGreen, nBlue) {
        return new RGBColor(nRed / 100, nGreen / 100, nBlue / 100);
    }
    /* eslint-enable no-unused-vars */
    var sCommaPattern = ' *[,] *';
    var sNumberPattern = '[+-]?[0-9]+[.]?[0-9]*';
    var sHexDigitPattern = '[0-9A-Fa-f]';
    var sHexColorPattern = '#(' +
        sHexDigitPattern +
        '{2})(' +
        sHexDigitPattern +
        '{2})(' +
        sHexDigitPattern +
        '{2})';
    var sRGBIntegerPattern = 'rgb[(] *' +
        sNumberPattern +
        sCommaPattern +
        sNumberPattern +
        sCommaPattern +
        sNumberPattern +
        ' *[)]';
    var sRGBPercentPattern = 'rgb[(] *' +
        sNumberPattern +
        '%' +
        sCommaPattern +
        sNumberPattern +
        '%' +
        sCommaPattern +
        sNumberPattern +
        '%' +
        ' *[)]';
    var sHSLPercentPattern = 'hsl[(] *' +
        sNumberPattern +
        sCommaPattern +
        sNumberPattern +
        '%' +
        sCommaPattern +
        sNumberPattern +
        '%' +
        ' *[)]';
    var reHexColor = new RegExp(sHexColorPattern);
    var reRGBInteger = new RegExp(sRGBIntegerPattern);
    var reRGBPercent = new RegExp(sRGBPercentPattern);
    var reHSLPercent = new RegExp(sHSLPercentPattern);
    if (reHexColor.test(sValue)) {
        var aRGBTriple = reHexColor.exec(sValue);
        var nRed = parseInt(aRGBTriple[1], 16) / 255;
        var nGreen = parseInt(aRGBTriple[2], 16) / 255;
        var nBlue = parseInt(aRGBTriple[3], 16) / 255;
        return new RGBColor(nRed, nGreen, nBlue);
    }
    else if (reHSLPercent.test(sValue)) {
        sValue = sValue.replace(/%/g, '');
        return eval(sValue);
    }
    else if (reRGBInteger.test(sValue)) {
        return eval(sValue);
    }
    else if (reRGBPercent.test(sValue)) {
        sValue = 'p' + sValue.replace(/%/g, '');
        return eval(sValue);
    }
    else {
        return null;
    }
}
var RGBColor = /** @class */ (function () {
    function RGBColor(nRed, nGreen, nBlue) {
        this.eColorSpace = ColorSpace.rgb;
        // values in the [0,1] range
        this.nRed = nRed;
        this.nGreen = nGreen;
        this.nBlue = nBlue;
    }
    RGBColor.prototype.clone = function () {
        return new RGBColor(this.nRed, this.nGreen, this.nBlue);
    };
    RGBColor.prototype.equal = function (aRGBColor) {
        return (this.nRed == aRGBColor.nRed &&
            this.nGreen == aRGBColor.nGreen &&
            this.nBlue == aRGBColor.nBlue);
    };
    RGBColor.prototype.add = function (aRGBColor) {
        this.nRed += aRGBColor.nRed;
        this.nGreen += aRGBColor.nGreen;
        this.nBlue += aRGBColor.nBlue;
        return this;
    };
    RGBColor.prototype.scale = function (aT) {
        this.nRed *= aT;
        this.nGreen *= aT;
        this.nBlue *= aT;
        return this;
    };
    RGBColor.clamp = function (aRGBColor) {
        var aClampedRGBColor = new RGBColor(0, 0, 0);
        aClampedRGBColor.nRed = clampN(aRGBColor.nRed, 0.0, 1.0);
        aClampedRGBColor.nGreen = clampN(aRGBColor.nGreen, 0.0, 1.0);
        aClampedRGBColor.nBlue = clampN(aRGBColor.nBlue, 0.0, 1.0);
        return aClampedRGBColor;
    };
    RGBColor.prototype.convertToHSL = function () {
        var nRed = clampN(this.nRed, 0.0, 1.0);
        var nGreen = clampN(this.nGreen, 0.0, 1.0);
        var nBlue = clampN(this.nBlue, 0.0, 1.0);
        var nMax = Math.max(nRed, nGreen, nBlue);
        var nMin = Math.min(nRed, nGreen, nBlue);
        var nDelta = nMax - nMin;
        var nLuminance = (nMax + nMin) / 2.0;
        var nSaturation = 0.0;
        var nHue = 0.0;
        if (nDelta !== 0) {
            nSaturation =
                nLuminance > 0.5
                    ? nDelta / (2.0 - nMax - nMin)
                    : nDelta / (nMax + nMin);
            if (nRed == nMax)
                nHue = (nGreen - nBlue) / nDelta;
            else if (nGreen == nMax)
                nHue = 2.0 + (nBlue - nRed) / nDelta;
            else if (nBlue == nMax)
                nHue = 4.0 + (nRed - nGreen) / nDelta;
            nHue *= 60.0;
            if (nHue < 0.0)
                nHue += 360.0;
        }
        return new HSLColor(nHue, nSaturation, nLuminance);
    };
    RGBColor.prototype.toFloat32Array = function () {
        var aRGBColor = RGBColor.clamp(this);
        return new Float32Array([
            aRGBColor.nRed,
            aRGBColor.nGreen,
            aRGBColor.nBlue,
            1.0,
        ]);
    };
    RGBColor.prototype.toString = function (bClamped) {
        if (bClamped === void 0) { bClamped = false; }
        var aRGBColor;
        if (bClamped) {
            aRGBColor = RGBColor.clamp(this);
        }
        else {
            aRGBColor = this;
        }
        var nRed = Math.round(aRGBColor.nRed * 255);
        var nGreen = Math.round(aRGBColor.nGreen * 255);
        var nBlue = Math.round(aRGBColor.nBlue * 255);
        return 'rgb(' + nRed + ',' + nGreen + ',' + nBlue + ')';
    };
    RGBColor.interpolate = function (aStartRGB, aEndRGB, nT) {
        var aResult = aStartRGB.clone();
        var aTEndRGB = aEndRGB.clone();
        aResult.scale(1.0 - nT);
        aTEndRGB.scale(nT);
        aResult.add(aTEndRGB);
        return aResult;
    };
    return RGBColor;
}());
var HSLColor = /** @class */ (function () {
    function HSLColor(nHue, nSaturation, nLuminance) {
        this.eColorSpace = ColorSpace.hsl;
        // Hue is in the [0,360[ range, Saturation and Luminance are in the [0,1] range
        this.nHue = nHue;
        this.nSaturation = nSaturation;
        this.nLuminance = nLuminance;
        this.normalizeHue();
    }
    HSLColor.prototype.clone = function () {
        return new HSLColor(this.nHue, this.nSaturation, this.nLuminance);
    };
    HSLColor.prototype.equal = function (aHSLColor) {
        return (this.nHue == aHSLColor.nHue &&
            this.nSaturation == aHSLColor.nSaturation &&
            this.nLuminance == aHSLColor.nLuminance);
    };
    HSLColor.prototype.add = function (aHSLColor) {
        this.nHue += aHSLColor.nHue;
        this.nSaturation += aHSLColor.nSaturation;
        this.nLuminance += aHSLColor.nLuminance;
        this.normalizeHue();
        return this;
    };
    HSLColor.prototype.scale = function (aT) {
        this.nHue *= aT;
        this.nSaturation *= aT;
        this.nLuminance *= aT;
        this.normalizeHue();
        return this;
    };
    HSLColor.clamp = function (aHSLColor) {
        var aClampedHSLColor = new HSLColor(0, 0, 0);
        aClampedHSLColor.nHue = aHSLColor.nHue % 360;
        if (aClampedHSLColor.nHue < 0)
            aClampedHSLColor.nHue += 360;
        aClampedHSLColor.nSaturation = clampN(aHSLColor.nSaturation, 0.0, 1.0);
        aClampedHSLColor.nLuminance = clampN(aHSLColor.nLuminance, 0.0, 1.0);
        return aClampedHSLColor;
    };
    HSLColor.prototype.normalizeHue = function () {
        this.nHue = this.nHue % 360;
        if (this.nHue < 0)
            this.nHue += 360;
    };
    HSLColor.prototype.toString = function () {
        return ('hsl(' +
            this.nHue.toFixed(3) +
            ',' +
            this.nSaturation.toFixed(3) +
            ',' +
            this.nLuminance.toFixed(3) +
            ')');
    };
    HSLColor.prototype.convertToRGB = function () {
        var nHue = this.nHue % 360;
        if (nHue < 0)
            nHue += 360;
        var nSaturation = clampN(this.nSaturation, 0.0, 1.0);
        var nLuminance = clampN(this.nLuminance, 0.0, 1.0);
        if (nSaturation === 0) {
            return new RGBColor(nLuminance, nLuminance, nLuminance);
        }
        var nVal1 = nLuminance <= 0.5
            ? nLuminance * (1.0 + nSaturation)
            : nLuminance + nSaturation - nLuminance * nSaturation;
        var nVal2 = 2.0 * nLuminance - nVal1;
        var nRed = HSLColor.hsl2rgbHelper(nVal2, nVal1, nHue + 120);
        var nGreen = HSLColor.hsl2rgbHelper(nVal2, nVal1, nHue);
        var nBlue = HSLColor.hsl2rgbHelper(nVal2, nVal1, nHue - 120);
        return new RGBColor(nRed, nGreen, nBlue);
    };
    HSLColor.hsl2rgbHelper = function (nValue1, nValue2, nHue) {
        nHue = nHue % 360;
        if (nHue < 0)
            nHue += 360;
        if (nHue < 60.0)
            return nValue1 + ((nValue2 - nValue1) * nHue) / 60.0;
        else if (nHue < 180.0)
            return nValue2;
        else if (nHue < 240.0)
            return nValue1 + ((nValue2 - nValue1) * (240.0 - nHue)) / 60.0;
        else
            return nValue1;
    };
    HSLColor.interpolate = function (aFrom, aTo, nT, bCCW) {
        var nS = 1.0 - nT;
        var nHue = 0.0;
        if (aFrom.nHue <= aTo.nHue && !bCCW) {
            // interpolate hue clockwise. That is, hue starts at
            // high values and ends at low ones. Therefore, we
            // must 'cross' the 360 degrees and start at low
            // values again (imagine the hues to lie on the
            // circle, where values above 360 degrees are mapped
            // back to [0,360)).
            nHue = nS * (aFrom.nHue + 360.0) + nT * aTo.nHue;
        }
        else if (aFrom.nHue > aTo.nHue && bCCW) {
            // interpolate hue counter-clockwise. That is, hue
            // starts at high values and ends at low
            // ones. Therefore, we must 'cross' the 360 degrees
            // and start at low values again (imagine the hues to
            // lie on the circle, where values above 360 degrees
            // are mapped back to [0,360)).
            nHue = nS * aFrom.nHue + nT * (aTo.nHue + 360.0);
        }
        else {
            // interpolate hue counter-clockwise. That is, hue
            // starts at low values and ends at high ones (imagine
            // the hue value as degrees on a circle, with
            // increasing values going counter-clockwise)
            nHue = nS * aFrom.nHue + nT * aTo.nHue;
        }
        var nSaturation = nS * aFrom.nSaturation + nT * aTo.nSaturation;
        var nLuminance = nS * aFrom.nLuminance + nT * aTo.nLuminance;
        return new HSLColor(nHue, nSaturation, nLuminance);
    };
    return HSLColor;
}());
// makeScaler is used in aPropertyGetterSetterMap:
// eslint-disable-next-line no-unused-vars
function makeScaler(nScale) {
    if (typeof nScale !== typeof 0 || !isFinite(nScale)) {
        window.app.console.log('makeScaler: not valid param passed: ' + nScale);
        return null;
    }
    return function (nValue) {
        return nScale * nValue;
    };
}
function getRectCenter(rect) {
    var cx = rect.x + rect.width / 2;
    var cy = rect.y + rect.height / 2;
    return { x: cx, y: cy };
}
function convert(convFactor, rect) {
    var x1 = Math.floor(rect.x * convFactor.x);
    var y1 = Math.floor(rect.y * convFactor.y);
    var x2 = Math.ceil((rect.x + rect.width) * convFactor.x);
    var y2 = Math.ceil((rect.y + rect.height) * convFactor.y);
    return new DOMRect(x1, y1, x2 - x1 + 1, y2 - y1 + 1);
}
var PriorityQueue = /** @class */ (function () {
    function PriorityQueue(aCompareFunc) {
        this.aSequence = [];
        this.aCompareFunc = aCompareFunc;
    }
    PriorityQueue.prototype.clone = function () {
        var aCopy = new PriorityQueue(this.aCompareFunc);
        var src = this.aSequence;
        var dest = [];
        for (var i = 0, l = src.length; i < l; ++i) {
            if (i in src) {
                dest.push(src[i]);
            }
        }
        aCopy.aSequence = dest;
        return aCopy;
    };
    PriorityQueue.prototype.top = function () {
        return this.aSequence[this.aSequence.length - 1];
    };
    PriorityQueue.prototype.isEmpty = function () {
        return this.aSequence.length === 0;
    };
    PriorityQueue.prototype.push = function (aValue) {
        this.aSequence.unshift(aValue);
        this.aSequence.sort(this.aCompareFunc);
    };
    PriorityQueue.prototype.clear = function () {
        this.aSequence = [];
    };
    PriorityQueue.prototype.pop = function () {
        return this.aSequence.pop();
    };
    return PriorityQueue;
}());
var GlHelpers;
(function (GlHelpers) {
    GlHelpers.nearestPointOnSegment = "\n\t\tfloat nearestPointOnSegment(vec4 CF, vec4 CT, vec4 C) {\n\n\t\t\t// Compute the vector along the segment (CT - CF)\n\t\t\tvec4 segment = CT - CF;\n\n\t\t\t// Compute the vector from the endpoint CF to the point C\n\t\t\tvec4 toC = C - CF;\n\n\t\t\tfloat length2 = dot(segment, segment);\n\n\t\t\t// Project C onto the segment, finding the scalar 't'\n\t\t\tfloat t = dot(toC, segment) / length2;\n\n\t\t\t// Clamp 't' to [0, 1] range to ensure the nearest point lies on the segment\n\t\t\tt = clamp(t, 0.0, 1.0);\n\t\t\treturn t;\n\t\t}\n";
    GlHelpers.computeColor = "\n\t\tvec4 computeColor(vec4 color) {\n\t\t\tif (fromLineColor != toLineColor || fromFillColor != toFillColor) {\n\t\t\t\tvec4 colorSegment = fromFillColor - fromLineColor;\n\t\t\t\tfloat length2 = dot(colorSegment, colorSegment);\n\t\t\t\tif (length2 < 1e-6) {\n\t\t\t\t \treturn toFillColor;\n\t\t\t\t}\n\t\t\t\telse {\n\t\t\t\t\tfloat t = nearestPointOnSegment(fromLineColor, fromFillColor, color);\n\t\t\t\t\tvec4 fromColor = fromLineColor + t * colorSegment;\n\t\t\t\t\tvec4 toColor = toLineColor + t * (toFillColor - toLineColor);\n\t\t\t\t\treturn mix(color, toColor, float(distance(color, fromColor) < 0.01));\n\t\t\t\t}\n\t\t\t}\n\t\t\treturn color;\n\t\t}\n";
})(GlHelpers || (GlHelpers = {}));
/** class PriorityEntry
 *  It provides an entry type for priority queues.
 *  Higher is the value of nPriority higher is the priority of the created entry.
 *
 *  @param aValue
 *      The object to be prioritized.
 *  @param nPriority
 *      An integral number representing the object priority.*
 */
var PriorityEntry = /** @class */ (function () {
    function PriorityEntry(aValue, nPriority) {
        this.aValue = aValue;
        this.nPriority = nPriority;
    }
    /** PriorityEntry.compare
     *  Compare priority of two entries.
     *
     *  @param aLhsEntry
     *      An instance of type PriorityEntry.
     *  @param aRhsEntry
     *      An instance of type PriorityEntry.
     *  @return Integer
     *      -1 if the left entry has lower priority of the right entry,
     *       1 if the left entry has higher priority of the right entry,
     *       0 if the two entry have the same priority
     */
    PriorityEntry.compare = function (aLhsEntry, aRhsEntry) {
        if (aLhsEntry.nPriority < aRhsEntry.nPriority) {
            return -1;
        }
        else if (aLhsEntry.nPriority > aRhsEntry.nPriority) {
            return 1;
        }
        else {
            return 0;
        }
    };
    return PriorityEntry;
}());
var DebugPrinter = /** @class */ (function () {
    function DebugPrinter() {
        this.bEnabled = false;
    }
    DebugPrinter.prototype.on = function () {
        this.bEnabled = true;
    };
    DebugPrinter.prototype.off = function () {
        this.bEnabled = false;
    };
    DebugPrinter.prototype.isEnabled = function () {
        return this.bEnabled;
    };
    DebugPrinter.prototype.print = function (sMessage, nTime) {
        if (this.isEnabled()) {
            var sInfo = 'DBG: ' + sMessage;
            if (nTime)
                sInfo += ' (at: ' + String(nTime / 1000) + 's)';
            window.app.console.log(sInfo);
        }
    };
    return DebugPrinter;
}());
var aGenericDebugPrinter = new DebugPrinter();
aGenericDebugPrinter.on();
var NAVDBG = new DebugPrinter();
NAVDBG.on();
var ANIMDBG = new DebugPrinter();
ANIMDBG.on();
var aRegisterEventDebugPrinter = new DebugPrinter();
aRegisterEventDebugPrinter.on();
var aTimerEventQueueDebugPrinter = new DebugPrinter();
aTimerEventQueueDebugPrinter.on();
var aEventMultiplexerDebugPrinter = new DebugPrinter();
aEventMultiplexerDebugPrinter.on();
var aNextEffectEventArrayDebugPrinter = new DebugPrinter();
aNextEffectEventArrayDebugPrinter.on();
var aActivityQueueDebugPrinter = new DebugPrinter();
aActivityQueueDebugPrinter.on();
var aAnimatedElementDebugPrinter = new DebugPrinter();
aAnimatedElementDebugPrinter.on();
//# sourceMappingURL=tools.js.map