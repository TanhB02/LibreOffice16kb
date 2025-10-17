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
var SnackbarController = /** @class */ (function () {
    function SnackbarController() {
        this.snackbarTimeout = 10000;
        this.showingSnackbar = false;
        this.snackbarQueue = new Array();
    }
    SnackbarController.prototype.closeSnackbar = function () {
        var closeMessage = {
            id: 'snackbar',
            jsontype: 'dialog',
            type: 'snackbar',
            action: 'close',
        };
        app.socket._onMessage({
            textMsg: 'jsdialog: ' + JSON.stringify(closeMessage),
        });
        this.showingSnackbar = false;
        this.scheduleSnackbar();
    };
    SnackbarController.prototype.showSnackbar = function (label, action, callback, timeout, hasProgress, withDismiss, infinite) {
        if (!app.socket)
            return;
        this.snackbarQueue.push({
            label: label,
            action: action,
            callback: callback,
            timeout: timeout,
            hasProgress: hasProgress,
            withDismiss: withDismiss,
            infinite: infinite,
        });
        this.scheduleSnackbar();
    };
    SnackbarController.prototype.extractTimeout = function (snackbarData) {
        return snackbarData.timeout || this.snackbarTimeout;
    };
    SnackbarController.prototype.scheduleSnackbar = function () {
        if (this.showingSnackbar || !this.snackbarQueue.length)
            return;
        var snackbarData = this.snackbarQueue.shift();
        this.showSnackbarImpl(snackbarData);
        this.showingSnackbar = true;
    };
    SnackbarController.prototype.showSnackbarImpl = function (snackbarData) {
        var _this = this;
        var buttonId = 'button';
        var labelId = 'label';
        var json = {
            id: 'snackbar',
            jsontype: 'dialog',
            type: 'snackbar',
            timeout: this.extractTimeout(snackbarData),
            init_focus_id: snackbarData.action ? buttonId : undefined,
            children: [
                {
                    id: snackbarData.hasProgress
                        ? 'snackbar-container-progress'
                        : 'snackbar-container',
                    type: 'container',
                    children: [
                        snackbarData.action
                            ? {
                                id: labelId,
                                type: 'fixedtext',
                                text: snackbarData.label,
                                labelFor: buttonId,
                            }
                            : {
                                id: 'label-no-action',
                                type: 'fixedtext',
                                text: snackbarData.label,
                            },
                        snackbarData.withDismiss
                            ? {
                                id: 'snackbar-dismiss-button',
                                type: 'pushbutton',
                                text: _('Dismiss'),
                            }
                            : {},
                        snackbarData.hasProgress
                            ? {
                                id: 'progress',
                                type: 'progressbar',
                                value: 0,
                                maxValue: 100,
                                infinite: snackbarData.infinite,
                            }
                            : {},
                        snackbarData.action
                            ? {
                                id: buttonId,
                                type: 'pushbutton',
                                text: snackbarData.action,
                                labelledBy: labelId,
                            }
                            : {},
                    ],
                },
            ],
        };
        var builderCallback = function (objectType, eventType, object, data, builder) {
            window.app.console.debug("control: '" +
                objectType +
                "' id:'" +
                object.id +
                "' event: '" +
                eventType +
                "' state: '" +
                data +
                "'");
            if (object.id === buttonId &&
                objectType === 'pushbutton' &&
                eventType === 'click') {
                if (typeof snackbarData.callback === 'function')
                    snackbarData.callback();
                _this.closeSnackbar();
            }
            else if (object.id === '__POPOVER__' &&
                objectType === 'popover' &&
                eventType === 'close') {
                _this.closeSnackbar();
            }
            if (object.id === 'snackbar-dismiss-button' &&
                objectType === 'pushbutton' &&
                eventType === 'click') {
                _this.closeSnackbar();
            }
        };
        app.socket._onMessage({
            textMsg: 'jsdialog: ' + JSON.stringify(json),
            callback: builderCallback,
        });
    };
    // value should be in range 0-100
    SnackbarController.prototype.setSnackbarProgress = function (value, infinite) {
        if (!app.socket)
            return;
        var json = {
            id: 'snackbar',
            jsontype: 'dialog',
            type: 'snackbar',
            action: 'update',
            control: {
                id: 'progress',
                type: 'progressbar',
                value: value,
                maxValue: 100,
                infinite: infinite,
            },
        };
        app.socket._onMessage({ textMsg: 'jsdialog: ' + JSON.stringify(json) });
    };
    return SnackbarController;
}());
JSDialog.SnackbarController = new SnackbarController();
//# sourceMappingURL=Util.SnackbarController.js.map