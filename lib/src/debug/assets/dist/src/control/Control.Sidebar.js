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
/*
 * JSDialog.Sidebar
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
// /* global app */
var Sidebar = /** @class */ (function (_super) {
    __extends(Sidebar, _super);
    function Sidebar(map, options /* Default speed: to be used on load */) {
        if (options === void 0) { options = {
            animSpeed: 1000,
        }; }
        var _this = _super.call(this, map, options, SidebarType.Sidebar) || this;
        _this.isUserRequest = true;
        return _this;
    }
    Sidebar.prototype.onAdd = function (map) {
        _super.prototype.onAdd.call(this, map);
        this.map.on('sidebar', this.onSidebar, this);
    };
    Sidebar.prototype.onRemove = function () {
        _super.prototype.onRemove.call(this);
        this.map.off('sidebar');
    };
    Sidebar.prototype.setAsInitialized = function () {
        this.isUserRequest = false;
    };
    Sidebar.prototype.updateSidebarPrefs = function (currentDeck) {
        var decks = [
            'PropertyDeck',
            'SdSlideTransitionDeck',
            'SdCustomAnimationDeck',
            'SdMasterPagesDeck',
            'NavigatorDeck',
            'StyleListDeck',
            'A11yCheckDeck',
        ];
        var deckPref = {};
        decks.forEach(function (deck) {
            deckPref[deck] = currentDeck === deck ? 'true' : 'false';
        });
        this.map.uiManager.setDocTypeMultiplePrefs(deckPref);
    };
    Sidebar.prototype.commandForDeck = function (deckId) {
        if (deckId === 'PropertyDeck')
            return '.uno:SidebarDeck.PropertyDeck';
        else if (deckId === 'SdSlideTransitionDeck')
            return '.uno:SlideChangeWindow';
        else if (deckId === 'SdCustomAnimationDeck')
            return '.uno:CustomAnimation';
        else if (deckId === 'SdMasterPagesDeck')
            return '.uno:MasterSlidesPanel';
        else if (deckId === 'NavigatorDeck')
            return '.uno:Navigator';
        else if (deckId === 'StyleListDeck')
            return '.uno:SidebarDeck.StyleListDeck';
        else if (deckId === 'A11yCheckDeck')
            return '.uno:SidebarDeck.A11yCheckDeck';
        return '';
    };
    Sidebar.prototype.setupTargetDeck = function (unoCommand) {
        this.targetDeckCommand = unoCommand;
    };
    Sidebar.prototype.getTargetDeck = function () {
        return this.targetDeckCommand;
    };
    Sidebar.prototype.changeDeck = function (unoCommand) {
        if (unoCommand !== null && unoCommand !== undefined)
            app.socket.sendMessage('uno ' + unoCommand);
        this.setupTargetDeck(unoCommand);
    };
    Sidebar.prototype.onSidebar = function (data) {
        var _this = this;
        var sidebarData = data.data;
        this.builder.setWindowId(sidebarData.id);
        $(this.container).empty();
        if (sidebarData.action === 'close' ||
            window.app.file.disableSidebar ||
            this.map.isReadOnlyMode()) {
            this.closeSidebar();
        }
        else if (sidebarData.children) {
            for (var i = sidebarData.children.length - 1; i >= 0; i--) {
                if (sidebarData.children[i].type !== 'deck') {
                    sidebarData.children.splice(i, 1);
                    continue;
                }
                if (typeof sidebarData.children[i].id === 'string' &&
                    sidebarData.children[i].id.startsWith('Navigator')) {
                    this.markNavigatorTreeView(sidebarData);
                }
            }
            if (sidebarData.children.length) {
                this.onResize();
                if (sidebarData.children &&
                    sidebarData.children[0] &&
                    sidebarData.children[0].id) {
                    var currentDeck = sidebarData.children[0].id;
                    this.updateSidebarPrefs(currentDeck);
                    if (this.targetDeckCommand) {
                        var stateHandler = this.map['stateChangeHandler'];
                        var isCurrent = stateHandler
                            ? stateHandler.getItemValue(this.targetDeckCommand)
                            : false;
                        // just to be sure check with other method
                        if (isCurrent === 'false' || !isCurrent)
                            isCurrent =
                                this.targetDeckCommand === this.commandForDeck(currentDeck);
                        if (this.targetDeckCommand && (isCurrent === 'false' || !isCurrent))
                            this.changeDeck(this.targetDeckCommand);
                    }
                    else {
                        this.changeDeck(this.targetDeckCommand);
                    }
                }
                this.builder.build(this.container, [sidebarData]);
                if (!this.isVisible()) {
                    $('#sidebar-dock-wrapper').addClass('visible');
                    // schedule focus after animation so it will not shift the browser page
                    if (this.isUserRequest) {
                        setTimeout(function () {
                            app.layoutingService.appendLayoutingTask(function () {
                                var focusables = JSDialog.GetFocusableElements(_this.container);
                                if (focusables && focusables.length) {
                                    focusables[0].focus();
                                }
                            });
                        }, 250); // see animation time in #sidebar-dock-wrapper.visible
                    }
                }
                this.map.uiManager.setDocTypePref('ShowSidebar', true);
            }
            else {
                this.closeSidebar();
            }
            this.isUserRequest = true;
        }
    };
    return Sidebar;
}(SidebarBase));
JSDialog.Sidebar = function (map, options) {
    return new Sidebar(map, options);
};
//# sourceMappingURL=Control.Sidebar.js.map