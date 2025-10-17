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
 * L.Control.UserList
 */
/* global app */
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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var UserList = /** @class */ (function (_super) {
    __extends(UserList, _super);
    function UserList() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.options = {
            userLimitHeader: 6,
            userLimitHeaderWhenFollowing: 3,
            userPopupTimeout: null,
            userJoinedPopupMessage: _('{user} has joined'),
            userLeftPopupMessage: _('{user} has left'),
            followingChipTextUser: _('Following {user}'),
            followingChipTextEditor: _('Following the editor'),
            followingChipTooltipText: _('Stop following'),
            userAvatarAlt: _('Avatar for {user}'),
            nUsers: undefined,
            oneUser: undefined,
            noUser: undefined,
        };
        _this.users = new Map();
        return _this;
    }
    UserList.prototype.onAdd = function (map) {
        this.map = map;
        map.on('addview', this.onAddView, this);
        map.on('removeview', this.onRemoveView, this);
        map.on('deselectuser', this.deselectUser, this);
        if (window.mode.isMobile() || window.mode.isTablet()) {
            this.options.nUsers = '%n';
            this.options.oneUser = '1';
            this.options.noUser = '0';
        }
        else {
            this.options.nUsers = _('%n users');
            this.options.oneUser = _('1 user');
            this.options.noUser = _('0 users');
        }
        var userListElement = document.getElementById('userListSummary');
        userListElement.setAttribute('aria-label', _('User List Summary'));
        this.registerHeaderAvatarEvents();
    };
    UserList.prototype.selectUser = function (viewId) {
        var user = this.users.get(viewId);
        if (user === undefined) {
            console.debug("User doesn't exist: " + viewId);
            return;
        }
        this.renderAll();
    };
    UserList.prototype.getFollowedUser = function () {
        var followedId = app.getFollowedViewId();
        var myViewId = this.map && this.map._docLayer && this.map._docLayer._viewId;
        if (myViewId === followedId ||
            followedId === -1 ||
            !app.isFollowingUser()) {
            return undefined;
        }
        var followedUser = this.users.get(followedId);
        if (followedUser === undefined) {
            return undefined;
        }
        return [followedId, followedUser];
    };
    UserList.prototype.unfollowAll = function () {
        app.setFollowingOff();
    };
    UserList.prototype.followUser = function (viewId, instantJump) {
        if (instantJump === void 0) { instantJump = true; }
        var myViewId = this.map._docLayer._viewId;
        var followingViewId = app.getFollowedViewId();
        var followMyself = viewId === myViewId;
        if (followingViewId === viewId)
            return;
        app.setFollowingUser(viewId);
        if (followMyself) {
            this.map._setFollowing(true, myViewId, instantJump);
        }
        else if (viewId !== -1) {
            this.map._setFollowing(true, viewId, instantJump);
        }
        else {
            this.unfollowAll();
            this.map._setFollowing(false, -1);
        }
        this.selectUser(viewId);
    };
    UserList.prototype.createAvatar = function (cachedElement, viewId, username, extraInfo, color, zIndex) {
        if (zIndex === undefined) {
            zIndex = 'auto';
        }
        var img = cachedElement;
        if (img === undefined) {
            img = L.DomUtil.create('img', 'avatar-img');
        }
        app.LOUtil.setUserImage(img, this.map, viewId);
        img.alt = this.options.userAvatarAlt.replace('{user}', username);
        img.style.zIndex = zIndex.toString();
        img.style.borderColor = color;
        img.style.backgroundColor = 'var(--color-background-lighter)';
        img.setAttribute('data-view-id', viewId.toString());
        return img;
    };
    UserList.prototype.getUserItem = function (viewId, username, extraInfo, color) {
        var content = L.DomUtil.create('tr', 'useritem');
        content.id = 'user-' + viewId;
        $(document).on('click', '#' + content.id, this.onUseritemClicked.bind(this));
        var iconTd = L.DomUtil.create('td', 'usercolor', content);
        var nameTd = L.DomUtil.create('td', 'username cool-font', content);
        var avatarElement = this.createAvatar(undefined, viewId, username, extraInfo, color);
        iconTd.appendChild(avatarElement);
        nameTd.textContent = username;
        return content;
    };
    UserList.prototype.openDropdown = function () {
        var userListSummary = document.getElementById('userListSummaryBackground');
        var userListPopover = document.getElementById('userlist-dropdown');
        // checking case ''(empty string) is because when element loads first time it does not have any inline display style
        var canShowDropdown = !userListPopover &&
            userListSummary &&
            userListSummary.style.display !== 'none';
        if (canShowDropdown) {
            JSDialog.OpenDropdown('userlist', document.getElementById('userListSummary'), JSDialog.MenuDefinitions.get('UsersListMenu'));
        }
    };
    UserList.prototype.registerHeaderAvatarEvents = function () {
        document.getElementById('userListSummary').addEventListener('click', function (e) {
            e.stopPropagation();
            this.openDropdown();
        }.bind(this));
    };
    UserList.prototype.hideUserList = function () {
        return (window /* TODO: remove cast after gh#8221 */.ThisIsAMobileApp ||
            (this.map['wopi'].HideUserList !== null &&
                this.map['wopi'].HideUserList !== undefined &&
                $.inArray('true', this.map['wopi'].HideUserList) >= 0) ||
            (window.mode.isMobile() &&
                $.inArray('mobile', this.map['wopi'].HideUserList) >= 0) ||
            (window.mode.isTablet() &&
                $.inArray('tablet', this.map['wopi'].HideUserList) >= 0) ||
            (window.mode.isDesktop() &&
                $.inArray('desktop', this.map['wopi'].HideUserList) >= 0));
    };
    UserList.prototype.getSortedUsers = function () {
        return function () {
            var self, followedUser, readonlyUsers, _a, _b, _c, viewId, user, isSelf, isFollowed, e_1_1;
            var e_1, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        self = this.users.get(this.map._docLayer._viewId);
                        if (this.users.get(this.map._docLayer._viewId) === undefined) {
                            return [2 /*return*/];
                        }
                        followedUser = this.getFollowedUser();
                        if (!(followedUser !== undefined)) return [3 /*break*/, 2];
                        return [4 /*yield*/, followedUser];
                    case 1:
                        _e.sent();
                        _e.label = 2;
                    case 2: return [4 /*yield*/, [this.map._docLayer._viewId, self]];
                    case 3:
                        _e.sent();
                        readonlyUsers = [];
                        _e.label = 4;
                    case 4:
                        _e.trys.push([4, 9, 10, 11]);
                        _a = __values(Array.from(this.users.entries()).reverse()), _b = _a.next();
                        _e.label = 5;
                    case 5:
                        if (!!_b.done) return [3 /*break*/, 8];
                        _c = __read(_b.value, 2), viewId = _c[0], user = _c[1];
                        isSelf = viewId === this.map._docLayer._viewId;
                        isFollowed = followedUser !== undefined && viewId === followedUser[0];
                        if (isSelf || isFollowed) {
                            return [3 /*break*/, 7];
                        }
                        if (user.readonly) {
                            readonlyUsers.push([viewId, user]);
                            return [3 /*break*/, 7];
                        }
                        return [4 /*yield*/, [viewId, user]];
                    case 6:
                        _e.sent();
                        _e.label = 7;
                    case 7:
                        _b = _a.next();
                        return [3 /*break*/, 5];
                    case 8: return [3 /*break*/, 11];
                    case 9:
                        e_1_1 = _e.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 11];
                    case 10:
                        try {
                            if (_b && !_b.done && (_d = _a.return)) _d.call(_a);
                        }
                        finally { if (e_1) throw e_1.error; }
                        return [7 /*endfinally*/];
                    case 11: return [5 /*yield**/, __values(readonlyUsers)];
                    case 12:
                        _e.sent();
                        return [2 /*return*/];
                }
            });
        }.bind(this)();
    };
    UserList.prototype.renderHeaderAvatars = function () {
        var _this = this;
        var userListElementBackground = document.getElementById('userListSummaryBackground');
        var userListElement = document.getElementById('userListSummary');
        if (window.mode.isMobile() ||
            this.hideUserList() ||
            this.users.size === 1) {
            userListElement.removeAttribute('accesskey');
            userListElementBackground.style.display = 'none';
            return;
        }
        var displayCount;
        if (this.getFollowedUser() === undefined && !app.isFollowingEditor()) {
            displayCount = this.options.userLimitHeader;
        }
        else {
            displayCount = this.options.userLimitHeaderWhenFollowing;
        }
        var avatarUsers = Array.from(this.getSortedUsers()).slice(0, displayCount);
        var followed = this.getFollowedUser();
        userListElement.setAttribute('accesskey', 'UP');
        userListElement.replaceChildren.apply(userListElement, __spreadArray([], __read(avatarUsers.map(function (_a, index) {
            var _b = __read(_a, 2), viewId = _b[0], user = _b[1];
            var img = _this.createAvatar(user.cachedHeaderAvatar, viewId, user.username, user.extraInfo, user.color, displayCount - index);
            user.cachedHeaderAvatar = img;
            if (followed !== undefined && followed[0] === viewId) {
                img.classList.add('following');
            }
            else {
                img.classList.remove('following');
            }
            return img;
        })), false));
        userListElementBackground.style.display = 'block';
    };
    UserList.prototype.updateUserListCount = function () {
        var count = this.users.size;
        var text = '';
        if (count > 1) {
            text = this.options.nUsers.replace('%n', count.toString());
        }
        else if (count === 1) {
            text = this.options.oneUser;
        }
        else {
            text = this.options.noUser;
        }
        if (this.map.mobileTopBar) {
            if (!this.hideUserList() && count > 1)
                this.map.mobileTopBar.showItem('userlist', true);
            else
                this.map.mobileTopBar.showItem('userlist', false);
        }
    };
    UserList.prototype.deselectUser = function (e) {
        var user = this.users.get(e.viewId);
        if (user === undefined) {
            console.debug("User doesn't exist: " + e.viewId);
            return;
        }
        this.renderAll();
    };
    UserList.prototype.onAddView = function (e) {
        var color;
        var username;
        var you;
        if (e.viewId === this.map._docLayer._viewId) {
            username = _('You');
            color = 'var(--color-main-text)';
            you = true;
        }
        else {
            username = e.username;
            color = app.LOUtil.rgbToHex(this.map.getViewColor(e.viewId));
            you = false;
        }
        this.users.set(e.viewId, {
            you: you,
            username: username,
            extraInfo: e.extraInfo,
            color: color,
            readonly: e.readonly,
        });
        this.showJoinLeaveMessage('join', e.viewId, username, color);
        this.renderAll();
    };
    UserList.prototype.onRemoveView = function (e) {
        var user = this.users.get(e.viewId);
        this.users.delete(e.viewId);
        if (e.viewId === app.getFollowedViewId()) {
            this.unfollowAll();
        }
        if (user !== undefined) {
            this.showJoinLeaveMessage('leave', e.viewId, user.username, user.color);
        }
        this.renderAll();
    };
    UserList.prototype.renderAll = function () {
        this.updateUserListCount();
        this.renderHeaderAvatars();
        var popoverElement = document.getElementById('userlist-entries');
        if (popoverElement)
            this.renderHeaderAvatarPopover(popoverElement);
        this.renderFollowingChip();
    };
    UserList.prototype.showTooltip = function (text) {
        var userList = $('#userListHeader');
        if (userList) {
            userList.get(0).title = text;
            userList.tooltip({
                content: text,
            });
            userList.tooltip('enable');
            userList.tooltip('open');
        }
    };
    UserList.prototype.hideTooltip = function () {
        var userList = $('#userListHeader');
        if (userList) {
            userList.get(0).title = undefined;
            userList.tooltip('option', 'disabled', true);
        }
    };
    UserList.prototype.showJoinLeaveMessage = function (type, viewId, username, // As the user no longer exists when we are showing a leave message, we can't get this from the viewId
    _color /* TODO: make this display in user colors */) {
        var _this = this;
        var message;
        if (viewId === this.map._docLayer._viewId) {
            return;
        }
        if (type === 'join') {
            message = this.options.userJoinedPopupMessage.replace('{user}', username);
        }
        else {
            message = this.options.userLeftPopupMessage.replace('{user}', username);
        }
        var sanitizer = document.createElement('div');
        sanitizer.innerText = message;
        this.showTooltip(sanitizer.innerHTML);
        clearTimeout(this.options.userPopupTimeout);
        this.options.userPopupTimeout = setTimeout(function () {
            _this.hideTooltip();
        }, 3000);
    };
    UserList.prototype.renderHeaderAvatarPopover = function (popoverElement) {
        var _this = this;
        // Popover rendering
        var users = Array.from(this.getSortedUsers());
        var following = this.getFollowedUser();
        var userElements = users.map(function (_a) {
            var _b = __read(_a, 2), viewId = _b[0], user = _b[1];
            var userLabel = L.DomUtil.create('div', 'user-list-item--name');
            userLabel.innerText = user.username;
            var userFollowingLabel = L.DomUtil.create('div', 'user-list-item--following-label');
            userFollowingLabel.innerText = _('Following');
            var userLabelContainer = L.DomUtil.create('div', 'user-list-item--name-container');
            userLabelContainer.appendChild(userLabel);
            userLabelContainer.appendChild(userFollowingLabel);
            var listItem = L.DomUtil.create('div', 'user-list-item');
            listItem.setAttribute('data-view-id', viewId);
            listItem.setAttribute('role', 'button');
            if (following !== undefined && viewId == following[0]) {
                $(listItem).addClass('selected-user');
            }
            var avatar = _this.createAvatar(user.cachedUserListAvatar, viewId, user.username, user.extraInfo, user.color);
            user.cachedUserListAvatar = avatar;
            listItem.appendChild(avatar);
            listItem.appendChild(userLabelContainer);
            listItem.addEventListener('click', function () {
                _this.followUser(viewId);
                JSDialog.CloseDropdown('userlist');
            });
            return listItem;
        });
        var followEditorWrapper = L.DomUtil.create('div', '');
        followEditorWrapper.id = 'follow-editor';
        var followEditorCheckbox = L.DomUtil.create('input', 'follow-editor-checkbox jsdialog ui-checkbox', followEditorWrapper);
        followEditorCheckbox.id = 'follow-editor-checkbox';
        followEditorCheckbox.setAttribute('type', 'checkbox');
        followEditorCheckbox.onchange = function (event) {
            window.editorUpdate(event);
            _this.renderAll();
        };
        followEditorCheckbox.checked =
            app.isFollowingEditor();
        var followEditorCheckboxLabel = L.DomUtil.create('label', 'follow-editor-label', followEditorWrapper);
        followEditorCheckboxLabel.innerText = _('Always follow the editor');
        followEditorCheckboxLabel.setAttribute('for', 'follow-editor-checkbox');
        popoverElement.replaceChildren.apply(popoverElement, __spreadArray(__spreadArray([], __read(userElements), false), [followEditorWrapper], false));
    };
    UserList.prototype.renderFollowingChip = function () {
        var _this = this;
        var followingChipBackground = document.getElementById('followingChipBackground');
        var followingChip = document.getElementById('followingChip');
        var following = this.getFollowedUser();
        if (following === undefined && !app.isFollowingEditor()) {
            followingChipBackground.style.display = 'none';
            return;
        }
        var topAvatarZIndex = this.options.userLimitHeaderWhenFollowing;
        if (app.isFollowingEditor()) {
            followingChip.innerText = this.options.followingChipTextEditor;
            followingChip.style.borderColor = 'var(--color-main-text)';
        }
        else {
            followingChip.innerText = this.options.followingChipTextUser.replace('{user}', following[1].username);
            followingChip.style.borderColor = following[1].color;
        }
        followingChip.onclick = function () {
            _this.unfollowAll();
            _this.renderAll();
        };
        followingChip.title = this.options.followingChipTooltipText;
        $(followingChip).tooltip();
        followingChipBackground.style.display = 'block';
        followingChipBackground.style.zIndex = topAvatarZIndex.toString();
    };
    return UserList;
}(L.Control));
L.control.userList = function () {
    return new UserList();
};
L.control.createUserListWidget = function () {
    // TODO: this is not interactive
    var userlistElement = L.DomUtil.create('div');
    app.map.userList.renderHeaderAvatarPopover(userlistElement);
    return userlistElement;
};
//# sourceMappingURL=Control.UserList.js.map