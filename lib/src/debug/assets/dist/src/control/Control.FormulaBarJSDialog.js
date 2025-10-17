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
/*
 * JSDialog.FormulaBar - implementation of formulabar toolbar
 */
/* global JSDialog _ _UNO UNOKey */
var EXPAND_FORMULA_BAR_TEXT = _('Expand Formula Bar');
var FUNCTION_WIZARD_TEXT = _('Function Wizard');
var FormulaBar = /** @class */ (function () {
    function FormulaBar(map) {
        this.map = map;
        this.parentContainer = L.DomUtil.get('formulabar');
        this.map.on('formulabar', this.onFormulaBar, this);
        this.map.on('jsdialogupdate', this.onJSUpdate, this);
        this.map.on('jsdialogaction', this.onJSAction, this);
        this.map.on('doclayerinit', this.onDocLayerInit, this);
        this.builder = new L.control.jsDialogBuilder({
            mobileWizard: this,
            map: this.map,
            cssClass: 'formulabar jsdialog',
            callback: this.callback.bind(this)
        });
        this.createFormulabar('');
    }
    FormulaBar.prototype.onRemove = function () {
        this.map.off('formulabar', this.onFormulaBar, this);
        this.map.off('jsdialogupdate', this.onJSUpdate, this);
        this.map.off('jsdialogaction', this.onJSAction, this);
        this.map.off('doclayerinit', this.onDocLayerInit, this);
    };
    FormulaBar.prototype.onDocLayerInit = function () {
        var docType = this.map.getDocType();
        if (docType == 'spreadsheet')
            this.showFormulabar();
    };
    FormulaBar.prototype.createFormulabar = function (text) {
        if (!window.mode.isMobile()) {
            var data = [
                {
                    id: 'formulabar-buttons-toolbox',
                    type: 'toolbox',
                    children: [
                        {
                            id: 'functiondialog',
                            type: 'toolitem',
                            text: FUNCTION_WIZARD_TEXT,
                            command: '.uno:FunctionDialog'
                        },
                        {
                            id: 'AutoSumMenu:AutoSumMenu',
                            type: 'menubutton',
                            class: 'AutoSumMenu',
                            noLabel: true,
                            text: _('Select Function'),
                            command: '.uno:AutoSumMenu'
                        },
                        {
                            id: 'startformula',
                            type: 'customtoolitem',
                            text: _('Formula'),
                        },
                        {
                            // on mobile we show other buttons on the top bar
                            id: 'acceptformula',
                            type: 'customtoolitem',
                            text: _('Accept'),
                            visible: false
                        },
                        {
                            id: 'cancelformula',
                            type: 'customtoolitem',
                            text: _UNO('.uno:Cancel', 'spreadsheet'),
                            visible: false
                        }
                    ]
                },
                {
                    id: 'formulabar-toolbox',
                    type: 'toolbox',
                    children: [
                        {
                            id: 'sc_input_window',
                            type: 'formulabaredit',
                            text: text ? text : ''
                        },
                        {
                            id: 'expand',
                            type: 'pushbutton',
                            text: EXPAND_FORMULA_BAR_TEXT,
                            symbol: 'SPIN_DOWN',
                        }
                    ]
                }
            ];
        }
        else {
            var data = [
                {
                    id: 'formulabar-toolbox',
                    type: 'toolbox',
                    children: [
                        {
                            id: 'functiondialog',
                            type: 'toolitem',
                            text: FUNCTION_WIZARD_TEXT,
                            command: '.uno:FunctionDialog'
                        }, {
                            id: 'sc_input_window',
                            type: 'formulabaredit',
                            text: text ? text : ''
                        },
                        {
                            id: 'expand',
                            type: 'pushbutton',
                            text: EXPAND_FORMULA_BAR_TEXT,
                            symbol: 'SPIN_DOWN',
                        }
                    ]
                }
            ];
        }
        this.parentContainer.replaceChildren();
        this.builder.build(this.parentContainer, data);
    };
    FormulaBar.prototype.toggleMultiLine = function (input) {
        if (L.DomUtil.hasClass(input, 'expanded')) {
            L.DomUtil.removeClass(input, 'expanded');
            L.DomUtil.removeClass(this.parentContainer, 'expanded');
            this.onJSUpdate({
                data: {
                    jsontype: 'formulabar',
                    id: this.builder.windowId,
                    'control_id': 'expand',
                    control: {
                        id: 'expand',
                        type: 'pushbutton',
                        text: EXPAND_FORMULA_BAR_TEXT,
                        symbol: 'SPIN_DOWN'
                    }
                }
            });
        }
        else {
            L.DomUtil.addClass(input, 'expanded');
            L.DomUtil.addClass(this.parentContainer, 'expanded');
            this.onJSUpdate({
                data: {
                    jsontype: 'formulabar',
                    id: this.builder.windowId,
                    'control_id': 'expand',
                    control: {
                        id: 'expand',
                        type: 'pushbutton',
                        text: _('Collapse Formula Bar'),
                        symbol: 'SPIN_UP'
                    }
                }
            });
        }
    };
    FormulaBar.prototype.callback = function (objectType, eventType, object, data, builder) {
        if (object.id === 'expand') {
            var input = this.getInputField();
            if (input)
                this.toggleMultiLine(input);
            return;
        }
        // in the core we have DrawingArea not TextView
        if (object.id.indexOf('sc_input_window') === 0) {
            var map = builder.map;
            objectType = 'drawingarea';
            if (eventType === 'keypress' && data === UNOKey.RETURN || data === UNOKey.ESCAPE)
                map.focus();
            else if (eventType === 'grab_focus') {
                this.focusField();
                map.onFormulaBarFocus();
            }
            map.userList.followUser(map._docLayer._getViewId(), false);
        }
        builder._defaultCallbackHandler(objectType, eventType, object, data, builder);
    };
    FormulaBar.prototype.focusField = function () {
        L.DomUtil.addClass(this.getInputField(), 'focused');
    };
    FormulaBar.prototype.blurField = function () {
        L.DomUtil.removeClass(this.getInputField(), 'focused');
    };
    FormulaBar.prototype.enable = function () {
        var input = this.getInputField();
        if (!input)
            return;
        input.enable();
    };
    FormulaBar.prototype.disable = function () {
        var input = this.getInputField();
        if (!input)
            return;
        input.disable();
    };
    FormulaBar.prototype.hasFocus = function () {
        var input = this.getInputField();
        if (!input)
            return false;
        return L.DomUtil.hasClass(input, 'focused');
    };
    FormulaBar.prototype.isInEditMode = function () {
        var acceptButton = this.parentContainer.querySelector('#acceptformula');
        if (acceptButton)
            return !acceptButton.classList.contains('hidden');
        return false;
    };
    FormulaBar.prototype.showFormulabar = function () {
        if (this.parentContainer)
            this.parentContainer.style.setProperty('display', 'table-cell');
    };
    FormulaBar.prototype.show = function (action) {
        this.showButton(action, true);
    };
    FormulaBar.prototype.hide = function (action) {
        this.showButton(action, false);
    };
    FormulaBar.prototype.showButton = function (action, show) {
        this.onJSAction({
            data: {
                jsontype: 'formulabar',
                id: this.builder.windowId,
                data: {
                    'control_id': action,
                    'action_type': show ? 'show' : 'hide'
                }
            }
        });
    };
    FormulaBar.prototype.getControl = function (controlId) {
        if (!this.parentContainer)
            return;
        var control = this.parentContainer.querySelector('[id=\'' + controlId + '\']');
        if (!control)
            window.app.console.warn('formulabar update: not found control with id: "' + controlId + '"');
        return control;
    };
    FormulaBar.prototype.getInputField = function () {
        return this.getControl('sc_input_window');
    };
    FormulaBar.prototype.onFormulaBar = function (e) {
        var data = e.data;
        if (data.jsontype !== 'formulabar')
            return;
        console.warn('formulabar: old style formulabar full update - to fix in core');
        return;
    };
    FormulaBar.prototype.onJSUpdate = function (e) {
        var data = e.data;
        if (data.jsontype !== 'formulabar')
            return;
        var control = this.getControl(data.control.id);
        if (!control)
            return;
        var parent = control.parentNode;
        if (!parent)
            return;
        control.style.visibility = 'hidden';
        var temporaryParent = L.DomUtil.create('div');
        this.builder.build(temporaryParent, [data.control], false);
        parent.insertBefore(temporaryParent.firstChild, control.nextSibling);
        L.DomUtil.remove(control);
    };
    FormulaBar.prototype.onJSAction = function (e) {
        var data = e.data;
        if (data.jsontype !== 'formulabar')
            return;
        if (!this.builder)
            return;
        this.builder.setWindowId(data.id);
        var innerData = data ? data.data : null;
        if (this.parentContainer.firstChild) {
            var messageForInputField = innerData && innerData.control_id === 'sc_input_window';
            var isSetTextMessage = innerData && innerData.action_type === 'setText';
            var isGrabFocusMessage = innerData && innerData.action_type === 'grab_focus';
            if (messageForInputField && isGrabFocusMessage) {
                this.focusField();
                return;
            }
            if (messageForInputField && isSetTextMessage) {
                var customEditArea = this.getInputField();
                if (customEditArea) {
                    var selection = innerData.selection.split(';');
                    customEditArea.setText(innerData.text, selection);
                }
                return;
            }
            this.builder.executeAction(this.parentContainer, innerData);
        }
        else
            this.createFormulabar(innerData.text);
    };
    return FormulaBar;
}());
JSDialog.FormulaBar = function (map) {
    return new FormulaBar(map);
};
//# sourceMappingURL=Control.FormulaBarJSDialog.js.map