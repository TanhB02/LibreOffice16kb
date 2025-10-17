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
function createActivity(aActivityParamSet, aAnimationNode, aAnimation, aInterpolator) {
    var eCalcMode = aAnimationNode.getCalcMode();
    var sAttributeName = aAnimationNode.getAttributeName();
    var sKey = sAttributeName;
    var aAttributeProp = aPropertyGetterSetterMap[sKey];
    var eValueType = aAttributeProp['type'];
    // do we need to get an interpolator ?
    if (!aInterpolator) {
        aInterpolator = PropertyInterpolator.getInterpolator(eValueType);
    }
    // is it cumulative ?
    var bAccumulate = aAnimationNode.getAccumulate() === AccumulateMode.Sum &&
        !(eValueType === PropertyValueType.Bool ||
            eValueType === PropertyValueType.String ||
            eValueType === PropertyValueType.Enum);
    if (aAnimationNode.getFormula()) {
        var sFormula_1 = aAnimationNode.getFormula();
        var reMath = /abs|sqrt|asin|acos|atan|sin|cos|tan|exp|log|min|max/g;
        sFormula_1 = sFormula_1.replace(reMath, 'Math.$&');
        sFormula_1 = sFormula_1.replace(/pi(?!\w)/g, 'Math.PI');
        sFormula_1 = sFormula_1.replace(/e(?!\w)/g, 'Math.E');
        sFormula_1 = sFormula_1.replace(/\$/g, '__PARAM0__');
        var aAnimatedElement = aAnimationNode.getAnimatedElement();
        var aBBox = aAnimatedElement.getBaseBBox();
        // the following variable are used for evaluating sFormula
        /* eslint-disable no-unused-vars */
        var width = aBBox.width / aActivityParamSet.nSlideWidth;
        var height = aBBox.height / aActivityParamSet.nSlideHeight;
        var x = (aBBox.x + aBBox.width / 2) / aActivityParamSet.nSlideWidth;
        var y = (aBBox.y + aBBox.height / 2) / aActivityParamSet.nSlideHeight;
        aActivityParamSet.aFormula = function (__PARAM0__) {
            return eval(sFormula_1);
        };
        /* eslint-enable no-unused-vars */
    }
    aActivityParamSet.aDiscreteTimes = aAnimationNode.getKeyTimes();
    // do we have a value list ?
    var aValueSet = aAnimationNode.getValues();
    var nValueSetSize = aValueSet.length;
    if (nValueSetSize != 0) {
        // Value list activity
        if (aActivityParamSet.aDiscreteTimes.length == 0) {
            for (var i = 0; i < nValueSetSize; ++i)
                aActivityParamSet.aDiscreteTimes.push(i / nValueSetSize);
        }
        switch (eCalcMode) {
            case CalcMode.Discrete:
                aActivityParamSet.aWakeupEvent = new WakeupEvent(aActivityParamSet.aTimerEventQueue.getTimer(), aActivityParamSet.aActivityQueue);
                return createValueListActivity(aActivityParamSet, aAnimationNode, aAnimation, aInterpolator, DiscreteValueListActivity, bAccumulate, eValueType);
            default:
                window.app.console.log('createActivity: unexpected calculation mode: ' + CalcMode[eCalcMode]);
            // FALLTHROUGH intended
            case CalcMode.Paced:
            case CalcMode.Spline:
            case CalcMode.Linear:
                return createValueListActivity(aActivityParamSet, aAnimationNode, aAnimation, aInterpolator, LinearValueListActivity, bAccumulate, eValueType);
        }
    }
    else {
        // FromToBy activity
        switch (eCalcMode) {
            case CalcMode.Discrete:
                aActivityParamSet.aWakeupEvent = new WakeupEvent(aActivityParamSet.aTimerEventQueue.getTimer(), aActivityParamSet.aActivityQueue);
                return createFromToByActivity(aActivityParamSet, aAnimationNode, aAnimation, aInterpolator, DiscreteFromToByActivity, bAccumulate, eValueType);
            default:
                window.app.console.log('createActivity: unexpected calculation mode: ' + CalcMode[eCalcMode]);
            // FALLTHROUGH intended
            case CalcMode.Paced:
            case CalcMode.Spline:
            case CalcMode.Linear:
                return createFromToByActivity(aActivityParamSet, aAnimationNode, aAnimation, aInterpolator, LinearFromToByActivity, bAccumulate, eValueType);
        }
    }
}
function createValueListActivity(aActivityParamSet, aAnimationNode, aAnimation, aInterpolator, ValueListActivityCtor, bAccumulate, eValueType) {
    var aAnimatedElement = aAnimationNode.getAnimatedElement();
    var aOperatorSet = aOperatorSetMap.get(eValueType);
    assert(aOperatorSet, 'createValueListActivity: no operator set found');
    var aValueSet = aAnimationNode.getValues();
    var aValueList = [];
    extractAttributeValues(eValueType, aValueList, aValueSet, aAnimatedElement.getBaseBBox(), aActivityParamSet.nSlideWidth, aActivityParamSet.nSlideHeight);
    for (var i = 0; i < aValueList.length; ++i) {
        ANIMDBG.print('createValueListActivity: value[' + i + '] = ' + aValueList[i]);
    }
    return new ValueListActivityCtor(aValueList, aActivityParamSet, aAnimation, aInterpolator, aOperatorSet, bAccumulate);
}
function createFromToByActivity(aActivityParamSet, aAnimationNode, aAnimation, aInterpolator, ClassTemplateInstance, bAccumulate, eValueType) {
    var aAnimatedElement = aAnimationNode.getAnimatedElement();
    var aOperatorSet = aOperatorSetMap.get(eValueType);
    assert(aOperatorSet, 'createFromToByActivity: no operator set found');
    var aValueSet = [];
    aValueSet[0] = aAnimationNode.getFromValue();
    aValueSet[1] = aAnimationNode.getToValue();
    aValueSet[2] = aAnimationNode.getByValue();
    ANIMDBG.print('createFromToByActivity: value type: ' +
        PropertyValueType[eValueType] +
        ', aFrom = ' +
        aValueSet[0] +
        ', aTo = ' +
        aValueSet[1] +
        ', aBy = ' +
        aValueSet[2]);
    var aValueList = [];
    extractAttributeValues(eValueType, aValueList, aValueSet, aAnimatedElement.getBaseBBox(), aActivityParamSet.nSlideWidth, aActivityParamSet.nSlideHeight);
    ANIMDBG.print('createFromToByActivity: ' +
        ', aFrom = ' +
        aValueList[0] +
        ', aTo = ' +
        aValueList[1] +
        ', aBy = ' +
        aValueList[2]);
    return new ClassTemplateInstance(aValueList[0], aValueList[1], aValueList[2], aActivityParamSet, aAnimation, aInterpolator, aOperatorSet, bAccumulate);
}
function extractAttributeValues(eValueType, aValueList, aValueSet, aBBox, nSlideWidth, nSlideHeight) {
    var i;
    switch (eValueType) {
        case PropertyValueType.Number:
            evalValuesAttribute(aValueList, aValueSet, aBBox, nSlideWidth, nSlideHeight);
            break;
        case PropertyValueType.Bool:
            for (i = 0; i < aValueSet.length; ++i) {
                var aValue = booleanParser(aValueSet[i]);
                aValueList.push(aValue);
            }
            break;
        case PropertyValueType.String:
            for (i = 0; i < aValueSet.length; ++i) {
                aValueList.push(aValueSet[i]);
            }
            break;
        case PropertyValueType.Enum:
            for (i = 0; i < aValueSet.length; ++i) {
                aValueList.push(aValueSet[i]);
            }
            break;
        case PropertyValueType.Color:
            for (i = 0; i < aValueSet.length; ++i) {
                var aValue = colorParser(aValueSet[i]);
                aValueList.push(aValue);
            }
            break;
        case PropertyValueType.TupleNumber:
            for (i = 0; i < aValueSet.length; ++i) {
                if (typeof aValueSet[i] === 'string') {
                    var aTuple = aValueSet[i].split(',');
                    var aValue = [];
                    evalValuesAttribute(aValue, aTuple, aBBox, nSlideWidth, nSlideHeight);
                    aValueList.push(aValue);
                }
                else {
                    aValueList.push(undefined);
                }
            }
            break;
        default:
            window.app.console.log('createValueListActivity: unexpected value type: ' + eValueType);
    }
}
function evalValuesAttribute(aValueList, aValueSet, aBBox, nSlideWidth, nSlideHeight) {
    // the following variables are used for evaluating sValue later
    /* eslint-disable no-unused-vars */
    var width = aBBox.width / nSlideWidth;
    var height = aBBox.height / nSlideHeight;
    var x = (aBBox.x + aBBox.width / 2) / nSlideWidth;
    var y = (aBBox.y + aBBox.height / 2) / nSlideHeight;
    /* eslint-enable no-unused-vars */
    var reMath = /abs|sqrt|asin|acos|atan|sin|cos|tan|exp|log|min|max/g;
    for (var i = 0; i < aValueSet.length; ++i) {
        var sValue = aValueSet[i];
        if (sValue) {
            sValue = sValue.replace(reMath, 'Math.$&');
            sValue = sValue.replace(/pi(?!\w)/g, 'Math.PI');
            sValue = sValue.replace(/e(?!\w)/g, 'Math.E');
        }
        var aValue = eval(sValue);
        aValueList.push(aValue);
    }
}
//# sourceMappingURL=ActivityFactory.js.map