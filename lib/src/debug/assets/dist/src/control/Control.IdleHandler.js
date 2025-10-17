// @ts-strict-ignore
/* -*- js-indent-level: 8 -*- */
/**/
app.idleHandlerId = 'inactive_user_message';
var IdleHandler = /** @class */ (function () {
    function IdleHandler() {
        this._serverRecycling = false;
        this._documentIdle = false;
        this._lastActivity = Date.now();
        this._inactivityTimer = null;
        this._outOfFocusTimer = null;
        this._active = true;
        this.dimId = app.idleHandlerId;
    }
    IdleHandler.prototype.getIdleMessage = function () {
        if (this.map['wopi'] && this.map['wopi'].DisableInactiveMessages) {
            return '';
        }
        else if (window.mode.isDesktop()) {
            return _('Idle document - please click to reload and resume editing');
        }
        else {
            return _('Idle document - please tap to reload and resume editing');
        }
    };
    IdleHandler.prototype.isDimActive = function () {
        return !!document.getElementById(this.map.uiManager.generateModalId(this.dimId));
    };
    // time from the last activity in [s]
    IdleHandler.prototype.getElapsedFromActivity = function () {
        return (Date.now() - this._lastActivity) / 1000;
    };
    IdleHandler.prototype.refreshAnnotations = function () {
        var docLayer = this.map._docLayer;
        if (docLayer.isCalc() && docLayer.options.sheetGeometryDataEnabled) {
            docLayer.requestSheetGeometryData();
        }
        app.socket.sendMessage('commandvalues command=.uno:ViewAnnotations');
    };
    IdleHandler.prototype._activate = function () {
        window.app.console.debug('IdleHandler: _activate()');
        if (this._serverRecycling || this._documentIdle) {
            return false;
        }
        this._startInactiveTimer();
        this._stopOutOfFocusTimer();
        if (!this._active) {
            // Only activate when we are connected.
            if (app.socket.connected()) {
                app.socket.sendMessage('useractive');
                this._active = true;
                /*
                  If we have the docLayer then refresh annotations now. If not then
                  postpone until we do have the docLayer so we know if this is calc
                  or not, because for calc we have to ensure we have the sheet
                  geometry before requesting annotations otherwise we will lack the
                  requirements to position them.
                */
                if (this.map._docLayer) {
                    this.map._docLayer.allowDrawing();
                    this.refreshAnnotations();
                }
                else {
                    this.map.once('doclayerinit', this.refreshAnnotations, this);
                }
                if (this.isDimActive()) {
                    this.map.jsdialog.closeDialog(this.dimId, false);
                    return true;
                }
            }
            else {
                this.map.loadDocument();
            }
        }
        // Ideally instead of separate isAnyEdit check here, we could check isAnyEdit inside isAnyDialogOpen,
        // but unfortunatly that causes problem in _deactivate and unnecessary 'userinactive' message is sent
        if (window.mode.isDesktop()
            && !this.map.uiManager.isAnyDialogOpen()
            && !cool.Comment.isAnyEdit()
            && (this.map.formulabar && !this.map.formulabar.hasFocus())
            && $('input:focus').length === 0) {
            this.map.focus();
        }
        return false;
    };
    IdleHandler.prototype._startInactiveTimer = function () {
        var _this = this;
        if (this._serverRecycling || this._documentIdle || !this.map._docLoaded) {
            return;
        }
        clearTimeout(this._inactivityTimer);
        this._inactivityTimer = setTimeout(function () {
            _this._dimIfInactive();
        }, (L.Browser.cypressTest ? 1000 : 1 * 60 * 1000)); // Check once a minute
    };
    IdleHandler.prototype._startOutOfFocusTimer = function () {
        var _this = this;
        if (this._serverRecycling || this._documentIdle || !this.map._docLoaded) {
            return;
        }
        this._stopOutOfFocusTimer();
        this._outOfFocusTimer = setTimeout(function () {
            _this._dim();
        }, window.outOfFocusTimeoutSecs * 1000);
    };
    IdleHandler.prototype._stopOutOfFocusTimer = function () {
        clearTimeout(this._outOfFocusTimer);
    };
    IdleHandler.prototype._dimIfInactive = function () {
        if (this.map._docLoaded && (this.getElapsedFromActivity() >= window.idleTimeoutSecs)) {
            this._dim();
        }
        else {
            this._startInactiveTimer();
        }
    };
    IdleHandler.prototype._dim = function () {
        var _this = this;
        if (this.map.slideShowPresenter && this.map.slideShowPresenter._checkAlreadyPresenting())
            return; // do not stop presentation
        this.map.fire('closealldialogs');
        var message = this.getIdleMessage();
        window.app.console.debug('IdleHandler: _dim()');
        if (document.getElementById(this.dimId))
            return;
        this._active = false;
        var map = this.map;
        var restartConnectionFn = function () {
            if (app.idleHandler._documentIdle) {
                window.app.console.debug('idleness: reactivating');
                map.fire('postMessage', { msgId: 'User_Active' });
                app.idleHandler._documentIdle = false;
                app.setCursorVisibility(true);
            }
            return app.idleHandler._activate();
        };
        this.map._textInput.hideCursor();
        var uiManager = this.map.uiManager;
        var dialogId = uiManager.generateModalId(this.dimId);
        uiManager.showInfoModal(this.dimId);
        app.layoutingService.appendLayoutingTask(function () {
            var dimNode = document.getElementById(_this.dimId);
            if (!dimNode)
                return;
            dimNode.textContent = message;
            var restartConnection = function () { restartConnectionFn(); };
            if (message === '') {
                var dialogNode = document.getElementById(dialogId);
                if (dialogNode)
                    dialogNode.style.display = 'none';
                app.LOUtil.onRemoveHTMLElement(dimNode, restartConnection);
            }
            else {
                var overlayId = dialogId + '-overlay';
                var overlay = document.getElementById(overlayId);
                if (overlay)
                    overlay.onmouseover = function () { restartConnection(); uiManager.closeModal(dialogId); };
                app.LOUtil.onRemoveHTMLElement(overlay, restartConnection);
            }
        });
        this._sendInactiveMessage();
        TileManager.clearPreFetch();
    };
    IdleHandler.prototype.notifyActive = function () {
        this._lastActivity = Date.now();
        if (window.ThisIsTheAndroidApp) {
            window.postMobileMessage('LIGHT_SCREEN');
        }
    };
    IdleHandler.prototype._sendInactiveMessage = function () {
        this.map._doclayer && this.map._docLayer._onMessage('textselection:', null);
        this.map.fire('postMessage', { msgId: 'User_Idle' });
        if (app.socket.connected()) {
            app.socket.sendMessage('userinactive');
        }
    };
    IdleHandler.prototype._deactivate = function () {
        window.app.console.debug('IdleHandler: _deactivate()');
        if (this._serverRecycling || this._documentIdle || !this.map._docLoaded) {
            return;
        }
        if (window.mode.isDesktop() && (!this._active || this.isDimActive())) {
            // A dialog is already dimming the screen and probably
            // shows an error message. Leave it alone.
            this._active = false;
            this._sendInactiveMessage();
            return;
        }
        if (app.map && app.map.formulabar &&
            (app.map.formulabar.hasFocus() || app.map.formulabar.isInEditMode()))
            app.dispatcher.dispatch('acceptformula'); // save data from the edited cell on exit
        this._startOutOfFocusTimer();
    };
    return IdleHandler;
}());
// Initiate the class.
app.idleHandler = new IdleHandler();
//# sourceMappingURL=Control.IdleHandler.js.map