// @ts-strict-ignore
/* -*- js-indent-level: 8 -*- */
/*
 * Copyright the Collabora Online contributors.
 *
 * SPDX-License-Identifier: MPL-2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
function handleKeyboardNavigation(event, currentElement, parentContainer) {
    switch (event.key) {
        case 'ArrowRight':
            moveFocus(parentContainer, currentElement, 'next', 'horizontal');
            event.preventDefault();
            break;
        case 'ArrowLeft':
            moveFocus(parentContainer, currentElement, 'previous', 'horizontal');
            event.preventDefault();
            break;
        case 'ArrowDown':
            moveFocus(parentContainer, currentElement, 'next', 'vertical');
            event.preventDefault();
            break;
        case 'ArrowUp':
            moveFocus(parentContainer, currentElement, 'previous', 'vertical');
            event.preventDefault();
            break;
        default:
            break;
    }
}
function moveFocus(parentContainer, currentElement, direction, axis) {
    var focusableElements = Array.from(JSDialog.GetFocusableElements(parentContainer));
    var _a = __read(getRowColumn(currentElement), 2), currentRow = _a[0], currentColumn = _a[1];
    var targetRow = currentRow;
    var targetColumn = currentColumn;
    if (axis === 'horizontal') {
        if (direction === 'next') {
            targetColumn++;
            if (!focusableElements.find(function (el) {
                return getRowColumn(el)[0] === currentRow &&
                    getRowColumn(el)[1] === targetColumn;
            })) {
                targetColumn = 0;
            }
        }
        else {
            targetColumn--;
            if (targetColumn < 0) {
                targetColumn =
                    focusableElements.filter(function (el) { return getRowColumn(el)[0] === currentRow; })
                        .length - 1;
            }
        }
    }
    else if (axis === 'vertical') {
        if (direction === 'next') {
            targetRow++;
        }
        else {
            targetRow--;
        }
        // If the target column does not exist in the target row, move to the last column in the target row
        var elementsInTargetRow = focusableElements.filter(function (el) { return getRowColumn(el)[0] === targetRow; });
        if (elementsInTargetRow.length > 0) {
            if (targetColumn >= elementsInTargetRow.length) {
                targetColumn = elementsInTargetRow.length - 1;
            }
        }
    }
    var targetElement = focusableElements.find(function (el) {
        return getRowColumn(el)[0] === targetRow && getRowColumn(el)[1] === targetColumn;
    });
    if (targetElement) {
        targetElement.focus();
    }
    else {
        // Handle edge cases by moving to adjacent sibling elements if no exact match is found
        var potentialCurrentElement = axis === 'vertical' ? parentContainer : currentElement;
        var nextElement = direction === 'next'
            ? JSDialog.FindFocusableElement(potentialCurrentElement.nextElementSibling, 'next')
            : JSDialog.FindFocusableElement(potentialCurrentElement.previousElementSibling, 'previous');
        if (nextElement) {
            nextElement.focus();
        }
    }
}
function getRowColumn(element) {
    var index = element.getAttribute('index');
    if (!index)
        return [-1, -1]; // we will never have this kind of index this is why we are passing negative values here
    var _a = __read(index.split(':').map(Number), 2), row = _a[0], column = _a[1];
    return [row, column];
}
JSDialog.KeyboardGridNavigation = function (container) {
    container.addEventListener('keydown', function (event) {
        var activeElement = document.activeElement;
        if (!JSDialog.IsTextInputField(activeElement)) {
            handleKeyboardNavigation(event, activeElement, activeElement.parentElement);
        }
    });
};
//# sourceMappingURL=Util.KeyboardGridNavigation.js.map