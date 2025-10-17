var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
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
 * L.Control.DownloadProgress.
 */
/* global _ $ JSDialog app */
L.Control.DownloadProgress = L.Control.extend({
    options: {
        snackbarTimeout: 20000,
        userWarningKey: 'warnedAboutLargeCopy'
    },
    initialize: function (options) {
        L.setOptions(this, options);
    },
    onAdd: function (map) {
        this._map = map;
        this._started = false;
        this._complete = false;
        this._closed = false;
        this._isLargeCopy = false;
        this._infinite = true;
    },
    _userAlreadyWarned: function () {
        return window.prefs.getBoolean(this.options.userWarningKey);
    },
    _setUserAlreadyWarned: function () {
        window.prefs.set(this.options.userWarningKey, true);
    },
    _getDialogTitle: function () {
        return _('Download Selection');
    },
    _getLargeCopyPasteMessage: function () {
        return this._map._clip._substProductName(_('If you want to share large elements outside of {productname} it\'s necessary to first download them.'));
    },
    _getDownloadProgressDialogId: function () {
        return 'copy_paste_download_progress';
    },
    // Step 1. Large copy paste warning
    _showLargeCopyPasteWarning: function (inSnackbar) {
        var _this = this;
        var modalId = this._getDownloadProgressDialogId();
        var msg = this._getLargeCopyPasteMessage();
        var buttonText = _('Download') + app.util.replaceCtrlAltInMac(' (Ctrl + C)');
        if (inSnackbar) {
            this._map.uiManager.showSnackbar(msg, buttonText, this._onStartDownload.bind(this), this.options.snackbarTimeout);
            this.setupKeyboardShortcutForSnackbar();
        }
        else {
            this._map.uiManager.showInfoModal(modalId, this._getDialogTitle(), msg, '', buttonText, this._onStartDownload.bind(this), true, modalId + '-response');
            app.layoutingService.appendLayoutingTask(function () {
                _this.setupKeyboardShortcutForDialog(modalId);
            });
        }
    },
    // Step 2. Download progress
    _showDownloadProgress: function (inSnackbar) {
        var modalId = this._getDownloadProgressDialogId();
        var msg = _('Downloading clipboard content');
        var buttonText = _('Cancel');
        if (inSnackbar) {
            this._map.uiManager.showProgressBar(msg, buttonText, this._onClose.bind(this), undefined, undefined, this._infinite);
        }
        else if (this._isLargeCopy) {
            // downloading for copy, next: show download complete dialog
            buttonText = _('Copy') + app.util.replaceCtrlAltInMac(' (Ctrl + C)');
            this._map.uiManager.showProgressBarDialog(modalId, this._getDialogTitle(), msg, buttonText, this._onConfirmCopyAction.bind(this), 0, this._onClose.bind(this), this._infinite);
            JSDialog.enableButtonInModal(modalId, modalId + '-response', false);
        }
        else {
            // downloading for paste, next: dialog will disappear
            this._map.uiManager.showProgressBarDialog(modalId, this._getDialogTitle(), msg, '', this._onClose.bind(this), 0, this._onClose.bind(this), this._infinite);
        }
    },
    _closeDownloadProgressDialog: function () {
        var modalId = this._getDownloadProgressDialogId();
        if (!this._userAlreadyWarned())
            this._map.uiManager.closeModal(this._map.uiManager.generateModalId(modalId));
    },
    // Step 3. Download complete
    _showDownloadComplete: function (inSnackbar) {
        var _this = this;
        var modalId = this._getDownloadProgressDialogId();
        var snackbarMsg = _('Download completed and ready to be copied to clipboard.');
        var dialogMsg = snackbarMsg + ' ' + _('From now on clipboard notifications will discreetly appear at the bottom.');
        var buttonText = _('Copy') + app.util.replaceCtrlAltInMac(' (Ctrl + C)');
        if (inSnackbar) {
            this._map.uiManager.setSnackbarProgress(100);
            this._map.uiManager.showSnackbar(snackbarMsg, buttonText, this._onConfirmCopyAction.bind(this), this.options.snackbarTimeout);
            setTimeout(function () {
                _this.setupKeyboardShortcutForSnackbar();
            }, 100);
        }
        else {
            JSDialog.setMessageInModal(modalId, dialogMsg, '');
            JSDialog.enableButtonInModal(modalId, modalId + '-response', true);
            this.setupKeyboardShortcutForDialog(modalId);
        }
    },
    _setupKeyboardShortcutForElement: function (eventTargetId, buttonId) {
        var keyDownCallback = function (e) {
            var modifierKeys = !e.altKey && !e.shiftKey;
            if (L.Browser.mac) {
                modifierKeys = modifierKeys && e.metaKey && !e.ctrlKey;
            }
            else {
                modifierKeys = modifierKeys && e.ctrlKey && !e.metaKey;
            }
            // CTRL + C / Command + C
            if (modifierKeys && e.key === 'c') {
                document.getElementById(buttonId).click();
                e.preventDefault();
            }
        };
        if (document.getElementById(eventTargetId))
            document.getElementById(eventTargetId).onkeydown = keyDownCallback.bind(this);
    },
    setupKeyboardShortcutForDialog: function (modalId) {
        var dialogId = this._map.uiManager.generateModalId(modalId);
        var buttonId = modalId + '-response';
        this._setupKeyboardShortcutForElement(dialogId, buttonId);
        document.getElementById(buttonId).focus();
    },
    setupKeyboardShortcutForSnackbar: function () {
        this._setupKeyboardShortcutForElement('snackbar-container', 'button');
        // Snackbars cannot get focus, but we are using it with a button and it requires to be focused. No need to change snackbar imp for now.
        if (document.getElementById('button'))
            document.getElementById('button').focus(); // TODO: This "button" id is too generic. It could be something like "snackbar-button" etc.
    },
    // isLargeCopy specifies if we are copying and have to explain user the process
    // if it is false we do paste so only show download progress
    show: function (isLargeCopy) {
        window.app.console.log('DownloadProgress.show');
        // better to init the following state variables here,
        // since the widget could be re-used without having been destroyed
        this._started = false;
        this._complete = false;
        this._closed = false;
        this._isLargeCopy = isLargeCopy;
        if (isLargeCopy)
            this._showLargeCopyPasteWarning(this._userAlreadyWarned());
        else
            this._showDownloadProgress(this._userAlreadyWarned());
    },
    isClosed: function () {
        return this._closed;
    },
    isStarted: function () {
        return this._started;
    },
    isComplete: function () {
        return this._complete;
    },
    currentStatus: function () {
        if (this._closed)
            return 'closed';
        if (!this._started && !this._complete)
            return 'downloadButton';
        if (this._started)
            return 'progress';
        if (this._complete)
            return 'confirmPasteButton';
    },
    setURI: function (uri) {
        // set up data uri to be downloaded
        this._uri = uri;
    },
    setValue: function (value) {
        if (this._userAlreadyWarned())
            this._map.uiManager.setSnackbarProgress(Math.round(value), this._infinite);
        else {
            var modalId = this._getDownloadProgressDialogId();
            this._map.uiManager.setDialogProgress(modalId, Math.round(value), this._infinite);
        }
    },
    _setProgressCursor: function () {
        $('#map').css('cursor', 'progress');
    },
    _setNormalCursor: function () {
        $('#map').css('cursor', 'default');
    },
    startProgressMode: function () {
        this._setProgressCursor();
        this._started = true;
        this.setValue(0);
    },
    _onStartDownload: function () {
        if (!this._uri)
            return;
        this._showDownloadProgress(this._userAlreadyWarned());
        this.startProgressMode();
        this._download();
        return true;
    },
    _onUpdateProgress: function (e) {
        if (e.statusType === 'setvalue') {
            this.setValue(e.value);
        }
        else if (e.statusType === 'finish') {
            this._onComplete();
        }
    },
    _onComplete: function () {
        if (this._complete)
            return;
        this.setValue(100);
        this._setNormalCursor();
        this._complete = true;
        this._started = false;
        if (this._isLargeCopy)
            this._showDownloadComplete(this._userAlreadyWarned());
        else
            this._closeDownloadProgressDialog();
    },
    _onConfirmCopyAction: function () {
        this._map._clip.filterExecCopyPaste('.uno:Copy');
        this._onClose();
        this._setUserAlreadyWarned();
        var msg = _('Content copied to clipboard');
        this._map.uiManager.showSnackbar(msg);
    },
    _onClose: function () {
        if (this._userAlreadyWarned())
            this._map.uiManager.closeSnackbar();
        if (this._started)
            this._closeDownloadProgressDialog();
        this._started = false;
        this._complete = false;
        this._closed = true;
        this._setNormalCursor();
        this._cancelDownload();
        if (this._map)
            this._map.focus();
    },
    _download: function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_1, reader;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this._map._clip._doAsyncDownload('GET', this._uri, null, true, function (progress) { return progress / 2; })];
                    case 1:
                        response = _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        this._onClose();
                        app.showAsyncDownloadError(error_1, _('Download failed'));
                        return [2 /*return*/];
                    case 3:
                        window.app.console.log('clipboard async download done');
                        reader = new FileReader();
                        reader.onload = function () {
                            var text = reader.result;
                            window.app.console.log('async clipboard parse done: ' + text.substring(0, 256));
                            var result = _this._map._clip.parseClipboard(text);
                            _this._map._clip.setTextSelectionHTML(result['html'], result['plain']);
                        };
                        // TODO: failure to parse ? ...
                        reader.readAsText(response);
                        return [2 /*return*/];
                }
            });
        });
    },
    _cancelDownload: function () {
        this._setNormalCursor();
        if (!this._started || this._complete)
            return;
        // TODO: insert code for cancelling an async download
    }
});
L.control.downloadProgress = function (options) {
    return new L.Control.DownloadProgress(options);
};
//# sourceMappingURL=Control.DownloadProgress.js.map