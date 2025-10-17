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
function _getGridChild(children, row, col) {
    for (var index in children) {
        if (parseInt(children[index].top) == row &&
            parseInt(children[index].left) == col)
            return children[index];
    }
    return null;
}
JSDialog.container = function (parentContainer, data, builder) {
    if (data.cols && data.rows)
        return JSDialog.grid(parentContainer, data, builder);
    if (parentContainer && !parentContainer.id)
        parentContainer.id = data.id;
    return true;
};
JSDialog.grid = function (parentContainer, data, builder) {
    var rows = builder._getGridRows(data.children);
    var cols = builder._getGridColumns(data.children);
    var processedChildren = [];
    var table = L.DomUtil.create('div', builder.options.cssClass + ' ui-grid', parentContainer);
    table.id = data.id;
    var gridRowColStyle = 'grid-template-rows: repeat(' +
        rows +
        ', auto); \
		grid-template-columns: repeat(' +
        cols +
        ', auto);';
    table.style = gridRowColStyle;
    for (var row = 0; row < rows; row++) {
        var prevChild = null;
        for (var col = 0; col < cols; col++) {
            var child = _getGridChild(data.children, row, col);
            var isMergedCell = prevChild &&
                prevChild.width &&
                parseInt(prevChild.left) + parseInt(prevChild.width) > col;
            if (child) {
                if (!child.id || child.id === '')
                    // required for postprocess...
                    child.id = table.id + '-cell-' + row + '-' + col;
                var sandbox = L.DomUtil.create('div');
                builder.build(sandbox, [child], false);
                var control = sandbox.firstChild;
                if (control) {
                    L.DomUtil.addClass(control, 'ui-grid-cell');
                    table.appendChild(control);
                }
                processedChildren.push(child);
                prevChild = child;
            }
            else if (!isMergedCell) {
                // empty placeholder to keep correct order
                L.DomUtil.create('div', 'ui-grid-cell', table);
            }
        }
    }
    for (var i = 0; i < (data.children || []).length; i++) {
        var child = data.children[i];
        if (processedChildren.indexOf(child) === -1) {
            var sandbox = L.DomUtil.create('div');
            builder.build(sandbox, [child], false);
            var control = sandbox.firstChild;
            if (control) {
                L.DomUtil.addClass(control, 'ui-grid-cell');
                table.appendChild(control);
            }
            processedChildren.push(child);
        }
    }
    return false;
};
JSDialog.toolbox = function (parentContainer, data, builder) {
    var levelClass = builder._currentDepth !== undefined
        ? ' level-' + builder._currentDepth
        : '';
    var toolbox = L.DomUtil.create('div', builder.options.cssClass + ' horizontal toolbox' + levelClass, parentContainer);
    toolbox.id = data.id;
    if (data.enabled === false) {
        toolbox.disabled = true;
        for (var index in data.children) {
            data.children[index].enabled = false;
        }
    }
    var enabledCallback = function (enable) {
        for (var j in data.children) {
            var childId = data.children[j].id;
            var toolboxChild = toolbox.querySelector('#' + childId);
            if (!toolboxChild)
                continue;
            if (enable) {
                toolboxChild.removeAttribute('disabled');
                toolboxChild.classList.remove('disabled');
            }
            else {
                toolboxChild.disabled = true;
                toolboxChild.classList.add('disabled');
            }
        }
    };
    JSDialog.OnStateChange(toolbox, enabledCallback);
    // builder modifiers
    var noLabels = builder.options.noLabelsForUnoButtons;
    builder.options.noLabelsForUnoButtons = true;
    var inlineLabels = builder.options.useInLineLabelsForUnoButtons;
    if (data.hasVerticalParent === true && data.children.length === 1)
        builder.options.useInLineLabelsForUnoButtons = true;
    builder.build(toolbox, data.children, false);
    // reset modifiers
    builder.options.useInLineLabelsForUnoButtons = inlineLabels;
    builder.options.noLabelsForUnoButtons = noLabels;
    return false;
};
JSDialog.spacer = function (parentContainer, data, builder) {
    var spacer = L.DomUtil.create('div', builder.options.cssClass + ' ui-spacer', parentContainer);
    spacer.id = data.id;
    return false;
};
//# sourceMappingURL=Widget.Containers.js.map