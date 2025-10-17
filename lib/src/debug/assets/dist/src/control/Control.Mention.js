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
 * Control.Mention
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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var Mention = /** @class */ (function (_super) {
    __extends(Mention, _super);
    function Mention(map) {
        return _super.call(this, 'mentionPopup', map) || this;
    }
    Mention.prototype.onAdd = function () {
        this.newPopupData.isAutoCompletePopup = true;
        this.typingMention = false;
        this.partialMention = [];
        this.cursorPosAtStart = { x: 0, y: 0 };
    };
    Mention.prototype.sendMentionPostMsg = function (partialText) {
        var _this = this;
        if (this.debouceTimeoutId)
            clearTimeout(this.debouceTimeoutId);
        // happens when user deletes last character before '@'
        // if we send empty string to the WOPIHost. They might return us list
        // with thousand of users
        if (partialText === '') {
            this.closeMentionPopup(true);
            return;
        }
        this.debouceTimeoutId = setTimeout(function () {
            _this.map.fire('postMessage', {
                msgId: 'UI_Mention',
                args: { type: 'autocomplete', text: partialText },
            });
        }, 300);
    };
    Mention.prototype.getPopupEntries = function (users) {
        var _a, _b;
        var entries = [];
        if (users === null)
            return entries;
        var text = this.getPartialMention();
        // filterout the users from list according to the text
        if (text.length > 1) {
            this.filteredUsers = users.filter(function (element) {
                var _a;
                var uid = (_a = element.label) !== null && _a !== void 0 ? _a : element.username;
                // case insensitive
                return uid.toLowerCase().includes(text.toLowerCase());
            });
        }
        else {
            this.filteredUsers = users;
        }
        if (this.filteredUsers.length !== 0) {
            for (var i in this.filteredUsers) {
                var currentUser = this.filteredUsers[i];
                var entry = {
                    text: (_a = currentUser.label) !== null && _a !== void 0 ? _a : currentUser.username,
                    columns: [
                        {
                            text: (_b = currentUser.label) !== null && _b !== void 0 ? _b : currentUser.username,
                        },
                    ],
                    row: i.toString(),
                };
                entries.push(entry);
            }
        }
        return entries;
    };
    Mention.prototype.openMentionPopup = function (users) {
        if (!this.typingMention)
            return;
        var entries = this.getPopupEntries(users);
        var commentSection = app.sectionContainer.getSectionWithName(L.CSections.CommentList.name);
        var isMobileCommentActive = commentSection === null || commentSection === void 0 ? void 0 : commentSection.isMobileCommentActive();
        var mobileCommentModalId = commentSection === null || commentSection === void 0 ? void 0 : commentSection.getMobileCommentModalId();
        if (entries.length === 0 && this.isMobile && isMobileCommentActive) {
            var control_1 = this.getTreeJSON();
            control_1.hideIfEmpty = true;
            var data_1 = this.getPopupJSON(control_1, { x: 0, y: 0 });
            data_1.id = mobileCommentModalId;
            data_1.control.entries = [];
            this.sendUpdate(data_1);
            return;
        }
        // change start position if cursor Y position changes.
        // It happens when user is typing mention at the end where there is no
        // horizontal space and whole '@mention' goes to new line
        var currentPos = this.getCursorPosition();
        var cursorPos = __assign({}, this.cursorPosAtStart); // Make a copy so changes to cursorPos don’t affect the original position
        if (this.cursorPosAtStart.y !== currentPos.y) {
            cursorPos = currentPos;
            this.cursorPosAtStart = currentPos;
        }
        // popup mention should have total top margin of navigation bar + if toolbar present then toolbar height
        var canvasEl = this.map._docLayer._canvas.getBoundingClientRect();
        cursorPos.y += canvasEl.top;
        if (entries.length === 0) {
            // If the key pressed was a space, and there are no matches, then just
            // dismiss the popup.
            var noMatchOnSpace = this.getPartialMention().indexOf(' ');
            if (noMatchOnSpace !== -1) {
                this.closeMentionPopup(false);
                return;
            }
            var control_2 = this.getSimpleTextJSON();
            if (L.DomUtil.get(this.popupId + 'fixedtext')) {
                var data_2 = this.getPopupJSON(control_2, cursorPos);
                this.sendUpdate(data_2);
                return;
            }
            if (L.DomUtil.get(this.popupId))
                this.closeMentionPopup(true);
            var data_3 = this.newPopupData;
            data_3.children[0].children[0] = control_2;
            data_3.posx = cursorPos.x;
            data_3.posy = cursorPos.y;
            this.sendJSON(data_3);
            return;
        }
        var control = this.getTreeJSON();
        if (isMobileCommentActive)
            control.hideIfEmpty = true;
        if (L.DomUtil.get(this.popupId + 'List')) {
            var data_4 = this.getPopupJSON(control, cursorPos);
            if (isMobileCommentActive)
                data_4.id = mobileCommentModalId;
            data_4.control.entries = entries;
            this.sendUpdate(data_4);
            return;
        }
        if (L.DomUtil.get(this.popupId))
            this.closeMentionPopup(true);
        var data = this.newPopupData;
        data.children[0].children[0] = control;
        data.children[0].children[0].entries = entries;
        data.posx = cursorPos.x;
        data.posy = cursorPos.y;
        this.sendJSON(data);
    };
    Mention.prototype.getSimpleTextJSON = function () {
        return {
            id: this.popupId + 'fixedtext',
            type: 'fixedtext',
            text: _('No search results found!'),
            enabled: true,
        };
    };
    Mention.prototype.closeMentionPopup = function (typingMention) {
        this.typingMention = typingMention;
        if (!typingMention)
            this.partialMention = [];
        var mentionPopup = L.DomUtil.get(this.popupId) ||
            L.DomUtil.get(this.popupId + 'List') ||
            L.DomUtil.get(this.popupId + 'fixedtext');
        if (!mentionPopup)
            return;
        this.map.jsdialog.focusToLastElement(this.popupId);
        if (this.isMobile) {
            var commentSection = app.sectionContainer.getSectionWithName(L.CSections.CommentList.name);
            var isMobileCommentActive = commentSection === null || commentSection === void 0 ? void 0 : commentSection.isMobileCommentActive();
            var mobileCommentModalId = commentSection === null || commentSection === void 0 ? void 0 : commentSection.getMobileCommentModalId();
            if (isMobileCommentActive) {
                var control = this.getTreeJSON();
                control.hideIfEmpty = true;
                var data = this.getPopupJSON(control, { x: 0, y: 0 });
                data.id = mobileCommentModalId;
                data.control.entries = [];
                this.sendUpdate(data);
            }
            else {
                this.map.fire('closemobilewizard');
            }
        }
        else
            this.map.jsdialog.clearDialog(this.popupId);
    };
    // get partialMention excluding '@'
    Mention.prototype.getPartialMention = function () {
        return this.partialMention.join('').substring(1);
    };
    Mention.prototype.isTypingMention = function () {
        return this.typingMention;
    };
    Mention.prototype.handleMentionInput = function (ev, newPara) {
        if (!this.typingMention) {
            var isAtSymbol = ev.data === '@';
            var isLastCharAtOrSpace = this.lastTypedChar === ' ' || this.lastTypedChar === '@';
            if ((newPara && isAtSymbol) || (isAtSymbol && isLastCharAtOrSpace)) {
                this.partialMention.push(ev.data);
                this.typingMention = true;
                this.cursorPosAtStart = this.getCursorPosition();
                return;
            }
            this.lastTypedChar = ev.data;
            return;
        }
        var deleteEvent = ev.inputType === 'deleteContentBackward' ||
            ev.inputType === 'deleteContentForward';
        if (deleteEvent) {
            var ch = this.partialMention.pop();
            if (ch === '@')
                this.closeMentionPopup(false);
            else
                this.sendMentionPostMsg(this.getPartialMention());
            return;
        }
        if (ev.data === '@' && this.partialMention.length === 1) {
            return;
        }
        var regEx = /^[0-9a-zA-Z ]+$/;
        if (ev.data && ev.data.match(regEx)) {
            this.partialMention.push(ev.data);
            this.sendMentionPostMsg(this.getPartialMention());
        }
        else {
            this.closeMentionPopup(false);
        }
    };
    Mention.prototype.getMentionUserData = function (index) {
        if (index >= this.filteredUsers.length)
            return { username: '', profile: '', label: null };
        return this.filteredUsers[index];
    };
    Mention.prototype.sendHyperlinkUnoCommand = function (uid, profile, replacement) {
        var command = {
            'Hyperlink.Text': {
                type: 'string',
                value: '@' + uid,
            },
            'Hyperlink.URL': {
                type: 'string',
                value: profile,
            },
            'Hyperlink.ReplacementText': {
                type: 'string',
                value: replacement,
            },
        };
        this.map.sendUnoCommand('.uno:SetHyperlink', command, true);
    };
    Mention.prototype.callback = function (objectType, eventType, object, index) {
        var commentSection = app.sectionContainer.getSectionWithName(L.CSections.CommentList.name);
        var comment = commentSection === null || commentSection === void 0 ? void 0 : commentSection.getActiveEdit();
        if (eventType === 'close') {
            this.closeMentionPopup(false);
        }
        else if (eventType === 'select' || eventType === 'activate') {
            var username = this.filteredUsers[index].username;
            var profileLink = this.filteredUsers[index].profile;
            var label = this.filteredUsers[index].label;
            var replacement = '@' + this.getPartialMention();
            if (comment) {
                comment.autoCompleteMention(label !== null && label !== void 0 ? label : username, profileLink, replacement);
            }
            else {
                this.sendHyperlinkUnoCommand(label !== null && label !== void 0 ? label : username, profileLink, replacement);
                this.map._textInput._sendText(' ');
            }
            this.map.fire('postMessage', {
                msgId: 'UI_Mention',
                args: { type: 'selected', username: username, label: label },
            });
            this.closeMentionPopup(false);
        }
        else if (eventType === 'keydown') {
            if (object.key !== 'Tab' && object.key !== 'Shift') {
                if (comment)
                    comment.focus();
                else
                    this.map.focus();
                return true;
            }
        }
        return false;
    };
    return Mention;
}(L.Control.AutoCompletePopup));
L.control.mention = function (map) {
    return new Mention(map);
};
//# sourceMappingURL=Control.Mention.js.map