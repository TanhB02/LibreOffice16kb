// @ts-strict-ignore
/* -*- js-indent-level: 8 -*- */
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
/*
 * Copyright the Collabora Online contributors.
 *
 * SPDX-License-Identifier: MPL-2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* See CanvasSectionContainer.ts for explanations. */
L.Map.include({
    insertComment: function () {
        if (this.stateChangeHandler.getItemValue('InsertAnnotation') === 'disabled')
            return;
        if (cool.Comment.isAnyEdit()) {
            cool.CommentSection.showCommentEditingWarning();
            return;
        }
        var avatar = undefined;
        var author = this.getViewName(this._docLayer._viewId);
        if (author in this._viewInfoByUserName) {
            avatar = this._viewInfoByUserName[author].userextrainfo.avatar;
        }
        this._docLayer.newAnnotation({
            text: '',
            textrange: '',
            author: author,
            dateTime: new Date().toISOString(),
            id: 'new',
            avatar: avatar
        });
    },
    showResolvedComments: function (on) {
        var unoCommand = '.uno:ShowResolvedAnnotations';
        this.sendUnoCommand(unoCommand);
        app.sectionContainer.getSectionWithName(L.CSections.CommentList.name).setViewResolved(on);
        this.uiManager.setDocTypePref('ShowResolved', on ? true : false);
    },
    showComments: function (on) {
        app.sectionContainer.getSectionWithName(L.CSections.CommentList.name).setView(on);
        this.uiManager.setDocTypePref('showannotations', on ? true : false);
        this.fire('commandstatechanged', { commandName: 'showannotations', state: on ? 'true' : 'false' });
        this.fire('showannotationschanged', { state: on ? 'true' : 'false' });
    }
});
var cool;
(function (cool) {
    var CommentSection = /** @class */ (function (_super) {
        __extends(CommentSection, _super);
        function CommentSection() {
            var _this = _super.call(this) || this;
            _this.name = L.CSections.CommentList.name;
            _this.backgroundColor = app.sectionContainer.clearColor;
            _this.expand = ['bottom'];
            _this.processingOrder = L.CSections.CommentList.processingOrder;
            _this.drawingOrder = L.CSections.CommentList.drawingOrder;
            _this.zIndex = L.CSections.CommentList.zIndex;
            _this.interactable = false;
            _this.disableLayoutAnimation = false;
            _this.mobileCommentId = 'new-annotation-dialog';
            _this.map = L.Map.THIS;
            _this.anchor = ['top', 'right'];
            _this.sectionProperties.docLayer = _this.map._docLayer;
            _this.sectionProperties.commentList = new Array(0);
            _this.sectionProperties.selectedComment = null;
            _this.sectionProperties.arrow = null;
            _this.sectionProperties.show = null;
            _this.sectionProperties.showResolved = null;
            _this.sectionProperties.marginY = 10 * app.dpiScale;
            _this.sectionProperties.offset = 5 * app.dpiScale;
            _this.sectionProperties.width = Math.round(1 * app.dpiScale); // Configurable variable.
            _this.sectionProperties.scrollAnnotation = null; // For impress, when 1 or more comments exist.
            _this.sectionProperties.commentWidth = 200 * 1.3; // CSS pixels.
            _this.sectionProperties.collapsedMarginToTheEdge = 120; // CSS pixels.
            _this.sectionProperties.deflectionOfSelectedComment = 160; // CSS pixels.
            _this.sectionProperties.showSelectedBigger = false;
            _this.sectionProperties.calcCurrentComment = null; // We don't automatically show a Calc comment when cursor is on its cell. But we remember it to show if user presses Alt+C keys.
            _this.sectionProperties.pendingUpdate = false;
            _this.sectionProperties.reLayout = true;
            // This (commentsAreListed) variable means that comments are shown as a list on the right side of the document.
            _this.sectionProperties.commentsAreListed = (app.map._docLayer._docType === 'text' || app.map._docLayer._docType === 'presentation' || app.map._docLayer._docType === 'drawing') && !window.mode.isMobile();
            _this.idIndexMap = new Map();
            _this.mobileCommentModalId = _this.map.uiManager.generateModalId(_this.mobileCommentId);
            _this.annotationMinSize = Number(getComputedStyle(document.documentElement).getPropertyValue('--annotation-min-size'));
            _this.annotationMaxSize = Number(getComputedStyle(document.documentElement).getPropertyValue('--annotation-max-size'));
            return _this;
        }
        CommentSection.prototype.onInitialize = function () {
            this.checkCollapseState();
            this.map.on('RedlineAccept', this.onRedlineAccept, this);
            this.map.on('RedlineReject', this.onRedlineReject, this);
            this.map.on('updateparts', this.showHideComments, this);
            this.map.on('AnnotationScrollUp', this.onAnnotationScrollUp, this);
            this.map.on('AnnotationScrollDown', this.onAnnotationScrollDown, this);
            this.map.on('commandstatechanged', function (event) {
                if (event.commandName === '.uno:ShowResolvedAnnotations')
                    this.setViewResolved(event.state === 'true');
                else if (event.commandName === 'showannotations')
                    this.setView(event.state === 'true');
                else if (event.commandName === '.uno:ShowTrackedChanges' && event.state === 'true')
                    app.socket.sendMessage('commandvalues command=.uno:ViewAnnotations');
            }, this);
            this.map.on('zoomend', function () {
                this.checkCollapseState();
                this.layout(true);
            }, this);
            this.backgroundColor = this.containerObject.getClearColor();
            this.initializeContextMenus();
            if (window.mode.isMobile()) {
                this.setShowSection(false);
                this.size[0] = 0;
            }
        };
        CommentSection.showCommentEditingWarning = function () {
            L.Map.THIS.uiManager.showInfoModal('annotation-editing', _('A comment is being edited'), _('Please save or discard the comment currently being edited.'), null, _('Close'));
        };
        CommentSection.prototype.checkCollapseState = function () {
            if (!window.mode.isMobile() && app.map._docLayer._docType !== 'spreadsheet') {
                if (this.shouldCollapse()) {
                    this.sectionProperties.deflectionOfSelectedComment = 180;
                    this.setCollapsed();
                }
                else {
                    this.sectionProperties.deflectionOfSelectedComment = 70;
                    this.setExpanded();
                }
                if (app.map._docLayer._docType === 'presentation' || app.map._docLayer._docType === 'drawing')
                    this.showHideComments();
            }
        };
        CommentSection.prototype.findNextPartWithComment = function (currentPart) {
            for (var i = 0; i < this.sectionProperties.commentList.length; i++) {
                if (this.sectionProperties.commentList[i].sectionProperties.partIndex > currentPart) {
                    return this.sectionProperties.commentList[i].sectionProperties.partIndex;
                }
            }
            return -1;
        };
        CommentSection.prototype.findPreviousPartWithComment = function (currentPart) {
            for (var i = this.sectionProperties.commentList.length - 1; i > -1; i--) {
                if (this.sectionProperties.commentList[i].sectionProperties.partIndex < currentPart) {
                    return this.sectionProperties.commentList[i].sectionProperties.partIndex;
                }
            }
            return -1;
        };
        CommentSection.prototype.onAnnotationScrollDown = function () {
            var index = this.findNextPartWithComment(app.map._docLayer._selectedPart);
            if (index >= 0) {
                this.map.setPart(index);
            }
        };
        CommentSection.prototype.onAnnotationScrollUp = function () {
            var index = this.findPreviousPartWithComment(app.map._docLayer._selectedPart);
            if (index >= 0) {
                this.map.setPart(index);
            }
        };
        CommentSection.prototype.checkSize = function () {
            // When there is no comment || file is a spreadsheet || view type is mobile, we set this section's size to [0, 0].
            if (app.map._docLayer._docType === 'spreadsheet' || window.mode.isMobile() || this.sectionProperties.commentList.length === 0) {
                if (app.map._docLayer._docType === 'presentation' && this.sectionProperties.scrollAnnotation) {
                    this.map.removeControl(this.sectionProperties.scrollAnnotation);
                    this.sectionProperties.scrollAnnotation = null;
                }
            }
            else if (app.map._docLayer._docType === 'presentation') { // If there are comments but none of them are on the selected part.
                if (!this.sectionProperties.scrollAnnotation) {
                    this.sectionProperties.scrollAnnotation = L.control.scrollannotation();
                    this.sectionProperties.scrollAnnotation.addTo(this.map);
                }
            }
        };
        CommentSection.prototype.isEditing = function () {
            var textBoxes = this.sectionProperties.commentList
                .flatMap(function (section) { return [section.sectionProperties.nodeModifyText, section.sectionProperties.nodeReplyText]; })
                .filter(function (textBox) { return textBox !== undefined; });
            return textBoxes.includes(document.activeElement);
        };
        CommentSection.prototype.getActiveEdit = function () {
            if (!this.sectionProperties.selectedComment) {
                return null;
            }
            if (this.sectionProperties.selectedComment.isEdit()) {
                return this.sectionProperties.selectedComment;
            }
            var openArray = [];
            this.getChildren(this.sectionProperties.selectedComment, openArray);
            for (var i = 0; i < openArray.length; i++) {
                if (openArray[i].isEdit()) {
                    return openArray[i];
                }
            }
            return null;
        };
        CommentSection.prototype.setCollapsed = function () {
            if (this.isEditing()) {
                return;
            }
            this.isCollapsed = true;
            this.unselect();
            for (var i = 0; i < this.sectionProperties.commentList.length; i++) {
                if (this.sectionProperties.commentList[i].sectionProperties.data.id !== 'new')
                    this.sectionProperties.commentList[i].setCollapsed();
                $(this.sectionProperties.commentList[i].sectionProperties.container).addClass('collapsed-comment');
                if (this.sectionProperties.commentList[i].isRootComment())
                    this.collapseReplies(i, this.sectionProperties.commentList[i].sectionProperties.data.id);
            }
        };
        CommentSection.prototype.setExpanded = function () {
            this.isCollapsed = false;
            for (var i = 0; i < this.sectionProperties.commentList.length; i++) {
                this.sectionProperties.commentList[i].setExpanded();
                $(this.sectionProperties.commentList[i].sectionProperties.container).removeClass('collapsed-comment');
            }
        };
        CommentSection.prototype.calculateAvailableSpace = function () {
            var availableSpace = (this.containerObject.getDocumentAnchorSection().size[0] - app.file.size.pX) * 0.5;
            availableSpace = Math.round(availableSpace / app.dpiScale);
            return availableSpace;
        };
        CommentSection.prototype.shouldCollapse = function () {
            if (!this.containerObject.getDocumentAnchorSection() || app.map._docLayer._docType === 'spreadsheet' || window.mode.isMobile())
                return false;
            return this.calculateAvailableSpace() < this.sectionProperties.commentWidth;
        };
        CommentSection.prototype.hideAllComments = function () {
            for (var i = 0; i < this.sectionProperties.commentList.length; i++) {
                this.sectionProperties.commentList[i].hide();
                var part = app.map._docLayer._selectedPart;
                if (app.map._docLayer._docType === 'spreadsheet') {
                    // Change drawing order so they don't prevent each other from being shown.
                    if (parseInt(this.sectionProperties.commentList[i].sectionProperties.data.tab) === part) {
                        this.sectionProperties.commentList[i].drawingOrder = 2;
                    }
                    else {
                        this.sectionProperties.commentList[i].drawingOrder = 1;
                    }
                }
            }
            if (app.map._docLayer._docType === 'spreadsheet')
                this.containerObject.applyDrawingOrders();
        };
        // Mobile.
        CommentSection.prototype.getChildren = function (comment, array) {
            for (var i = 0; i < comment.sectionProperties.children.length; i++) {
                array.push(comment.sectionProperties.children[i]);
                if (comment.sectionProperties.children[i].sectionProperties.children.length > 0)
                    this.getChildren(comment.sectionProperties.children[i], array);
            }
        };
        // Mobile.
        CommentSection.prototype.getCommentListOneDimensionalArray = function () {
            // 1 dimensional array of ordered comments.
            var openArray = [];
            for (var i = 0; i < this.sectionProperties.commentList.length; i++) {
                if (this.sectionProperties.commentList[i].isRootComment()) {
                    openArray.push(this.sectionProperties.commentList[i]);
                    if (this.sectionProperties.commentList[i].sectionProperties.children.length > 0)
                        this.getChildren(this.sectionProperties.commentList[i], openArray);
                }
            }
            return openArray;
        };
        CommentSection.prototype.createCommentStructureWriter = function (menuStructure, threadOnly) {
            var rootComment, comment;
            var commentList = this.getCommentListOneDimensionalArray();
            var showResolved = this.sectionProperties.showResolved;
            if (threadOnly) {
                if (!threadOnly.sectionProperties.data.trackchange && threadOnly.sectionProperties.data.parent !== '0')
                    threadOnly = commentList[this.getIndexOf(threadOnly.sectionProperties.data.parent)];
            }
            for (var i = 0; i < commentList.length; i++) {
                if (commentList[i].isRootComment() || commentList[i].sectionProperties.data.trackchange) {
                    var commentThread = [];
                    do {
                        comment = {
                            id: 'comment' + commentList[i].sectionProperties.data.id,
                            enable: true,
                            data: commentList[i].sectionProperties.data,
                            type: 'comment',
                            text: commentList[i].sectionProperties.data.text,
                            annotation: commentList[i],
                            children: []
                        };
                        if (showResolved || comment.data.resolved !== 'true') {
                            commentThread.unshift(comment);
                        }
                        i++;
                    } while (commentList[i] && commentList[i].sectionProperties.data.parent !== '0');
                    i--;
                    if (commentThread.length > 0) {
                        rootComment = {
                            id: commentThread[commentThread.length - 1].id,
                            enable: true,
                            data: commentThread[commentThread.length - 1].data,
                            type: 'rootcomment',
                            text: commentThread[commentThread.length - 1].data.text,
                            annotation: commentThread[commentThread.length - 1].annotation,
                            children: commentThread
                        };
                        var matchingThread = threadOnly && threadOnly.sectionProperties.data.id === commentThread[0].data.id;
                        if (matchingThread)
                            menuStructure['children'] = commentThread;
                        else if (!threadOnly)
                            menuStructure['children'].push(rootComment);
                    }
                }
            }
        };
        CommentSection.prototype.createCommentStructureImpress = function (menuStructure, threadOnly) {
            var rootComment;
            for (var i in this.sectionProperties.commentList) {
                var matchingThread = !threadOnly || (threadOnly && threadOnly.sectionProperties.data.id === this.sectionProperties.commentList[i].sectionProperties.data.id);
                if (matchingThread && (this.sectionProperties.commentList[i].sectionProperties.partIndex === app.map._docLayer._selectedPart || app.file.fileBasedView)) {
                    rootComment = {
                        id: 'comment' + this.sectionProperties.commentList[i].sectionProperties.data.id,
                        enable: true,
                        data: this.sectionProperties.commentList[i].sectionProperties.data,
                        type: threadOnly ? 'comment' : 'rootcomment',
                        text: this.sectionProperties.commentList[i].sectionProperties.data.text,
                        annotation: this.sectionProperties.commentList[i],
                        children: []
                    };
                    menuStructure['children'].push(rootComment);
                }
            }
        };
        CommentSection.prototype.createCommentStructureCalc = function (menuStructure, threadOnly) {
            var rootComment;
            var commentList = this.sectionProperties.commentList;
            var selectedTab = app.map._docLayer._selectedPart;
            for (var i = 0; i < commentList.length; i++) {
                var matchingThread = !threadOnly || (threadOnly && threadOnly.sectionProperties.data.id === commentList[i].sectionProperties.data.id);
                if (parseInt(commentList[i].sectionProperties.data.tab) === selectedTab && matchingThread) {
                    rootComment = {
                        id: 'comment' + commentList[i].sectionProperties.data.id,
                        enable: true,
                        data: commentList[i].sectionProperties.data,
                        type: threadOnly ? 'comment' : 'rootcomment',
                        text: commentList[i].sectionProperties.data.text,
                        annotation: commentList[i],
                        children: []
                    };
                    menuStructure['children'].push(rootComment);
                }
            }
        };
        // threadOnly - takes annotation indicating which thread will be generated
        CommentSection.prototype.createCommentStructure = function (menuStructure, threadOnly) {
            if (app.map._docLayer._docType === 'text') {
                this.createCommentStructureWriter(menuStructure, threadOnly);
            }
            else if (app.map._docLayer._docType === 'presentation' || app.map._docLayer._docType === 'drawing') {
                this.createCommentStructureImpress(menuStructure, threadOnly);
            }
            else if (app.map._docLayer._docType === 'spreadsheet') {
                this.createCommentStructureCalc(menuStructure, threadOnly);
            }
        };
        CommentSection.prototype.isMobileCommentActive = function () {
            var newComment = document.getElementById(this.mobileCommentId);
            if (!newComment)
                return false;
            return newComment.style.display !== 'none';
        };
        CommentSection.prototype.getMobileCommentModalId = function () {
            return this.mobileCommentModalId;
        };
        CommentSection.prototype.newAnnotationMobile = function (comment, addCommentFn, isMod) {
            var _this = this;
            var commentData = comment.sectionProperties.data;
            var callback = function (div) {
                if (div.textContent || div.innerHTML) {
                    var annotation = comment;
                    annotation.sectionProperties.data.text = div.textContent;
                    annotation.sectionProperties.data.html = div.innerHTML;
                    comment.text = div.textContent;
                    addCommentFn.call(annotation, annotation, comment);
                    if (!isMod)
                        this.containerObject.removeSection(annotation);
                }
                else {
                    this.cancel(comment);
                }
            }.bind(this);
            var listId = 'mentionPopupList';
            if (this.map.mention)
                listId = this.map.mention.getPopupId() + 'List';
            var json = this.map.uiManager._modalDialogJSON(this.mobileCommentId, '', true, [
                {
                    id: 'input-modal-input',
                    type: 'multilineedit',
                    text: (commentData.text && isMod ? commentData.text : ''),
                    html: (commentData.html && isMod ? commentData.html : ''),
                    contenteditable: true
                },
                {
                    id: listId,
                    type: 'treelistbox',
                    text: '',
                    enabled: true,
                    singleclickactivate: false,
                    fireKeyEvents: true,
                    hideIfEmpty: true,
                    entries: [],
                },
                {
                    id: '',
                    type: 'buttonbox',
                    text: '',
                    enabled: true,
                    children: [
                        {
                            id: 'response-cancel',
                            type: 'pushbutton',
                            text: _('Cancel'),
                        },
                        {
                            id: 'response-ok',
                            type: 'pushbutton',
                            text: _('Save'),
                            'has_default': true,
                        }
                    ],
                    vertical: false,
                    layoutstyle: 'end'
                },
            ]);
            var cancelFunction = function () {
                this.cancel(comment);
                this.map.uiManager.closeModal(this.mobileCommentModalId);
            }.bind(this);
            var mentionListCallback = function (objectType, eventType, object, index) {
                var _a;
                var mention = this.map.mention;
                if (eventType === 'close')
                    mention.closeMentionPopup(false);
                else if (eventType === 'select' || eventType === 'activate') {
                    var item = mention.getMentionUserData(index);
                    var replacement = '@' + mention.getPartialMention();
                    var uid = (_a = item.label) !== null && _a !== void 0 ? _a : item.username;
                    if (uid !== '' && item.profile !== '')
                        comment.autoCompleteMention(uid, item.profile, replacement);
                    mention.closeMentionPopup(false);
                }
            }.bind(this);
            this.map.uiManager.showModal(json, [
                { id: 'response-ok', func: function () {
                        if (typeof callback === 'function') {
                            var input = document.getElementById('input-modal-input');
                            callback(input);
                        }
                        this.map.uiManager.closeModal(this.mobileCommentModalId);
                    }.bind(this) },
                { id: 'response-cancel', func: cancelFunction },
                { id: '__POPOVER__', func: cancelFunction },
                { id: '__DIALOG__', func: cancelFunction },
                { id: listId, func: mentionListCallback }
            ]);
            app.layoutingService.appendLayoutingTask(function () {
                var multilineEditDiv = document.getElementById('input-modal-input');
                multilineEditDiv.addEventListener('input', function (ev) {
                    var _a;
                    if (ev && app.map._docLayer._docType === 'text') {
                        // special handling for mentions
                        (_a = this.map) === null || _a === void 0 ? void 0 : _a.mention.handleMentionInput(ev, comment.isNewPara());
                    }
                }.bind(_this));
                var tagTd = 'td', empty = '', tagDiv = 'div';
                var author = L.DomUtil.create('table', 'cool-annotation-table');
                var tbody = L.DomUtil.create('tbody', empty, author);
                var tr = L.DomUtil.create('tr', empty, tbody);
                var tdImg = L.DomUtil.create(tagTd, 'cool-annotation-img', tr);
                var tdAuthor = L.DomUtil.create(tagTd, 'cool-annotation-author', tr);
                var imgAuthor = L.DomUtil.create('img', 'avatar-img', tdImg);
                var user = _this.map.getViewId(commentData.author);
                app.LOUtil.setUserImage(imgAuthor, _this.map, user);
                imgAuthor.setAttribute('width', 32);
                imgAuthor.setAttribute('height', 32);
                var authorAvatarImg = imgAuthor;
                var contentAuthor = L.DomUtil.create(tagDiv, 'cool-annotation-content-author', tdAuthor);
                var contentDate = L.DomUtil.create(tagDiv, 'cool-annotation-date', tdAuthor);
                $(contentAuthor).text(commentData.author);
                $(authorAvatarImg).attr('src', commentData.avatar);
                if (user >= 0) {
                    var color = app.LOUtil.rgbToHex(_this.map.getViewColor(user));
                    $(authorAvatarImg).css('border-color', color);
                }
                if (commentData.dateTime) {
                    var d = new Date(commentData.dateTime.replace(/,.*/, 'Z'));
                    var dateOptions = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
                    $(contentDate).text(isNaN(d.getTime()) ? comment.dateTime : d.toLocaleDateString(String.locale, dateOptions));
                }
                var newAnnotationDialog = document.getElementById(_this.mobileCommentId);
                $(newAnnotationDialog).css('width', '100%');
                var dialogInput = newAnnotationDialog.children[0];
                $(dialogInput).css('height', '30vh');
                var parent = newAnnotationDialog.parentElement;
                parent.insertBefore(author, parent.childNodes[0]);
                document.getElementById('input-modal-input').focus();
            });
        };
        CommentSection.prototype.highlightComment = function (comment) {
            this.removeHighlighters();
            var commentList = this.sectionProperties.commentList;
            var lastChild = this.getLastChildIndexOf(comment.sectionProperties.data.id);
            while (true && lastChild >= 0) {
                commentList[lastChild].highlight();
                if (commentList[lastChild].isRootComment())
                    break;
                lastChild = this.getIndexOf(commentList[lastChild].sectionProperties.data.parent);
            }
        };
        CommentSection.prototype.removeHighlighters = function () {
            var commentList = this.sectionProperties.commentList;
            for (var i = 0; i < commentList.length; i++) {
                if (commentList[i].sectionProperties.isHighlighted) {
                    commentList[i].removeHighlight();
                }
            }
        };
        CommentSection.prototype.removeItem = function (id) {
            var annotation;
            for (var i = 0; i < this.sectionProperties.commentList.length; i++) {
                annotation = this.sectionProperties.commentList[i];
                if (annotation.sectionProperties.data.id === id) {
                    this.containerObject.removeSection(annotation.name);
                    this.sectionProperties.commentList.splice(i, 1);
                    this.updateIdIndexMap();
                    break;
                }
            }
            this.checkSize();
        };
        CommentSection.prototype.click = function (annotation) {
            this.select(annotation);
        };
        CommentSection.prototype.save = function (annotation) {
            var comment;
            if (annotation.sectionProperties.data.id === 'new') {
                comment = __assign({ Author: {
                        type: 'string',
                        value: annotation.sectionProperties.data.author
                    } }, (app.map._docLayer._docType === 'text' &&
                    annotation.sectionProperties.data.html) ?
                    { Html: {
                            type: 'string',
                            value: annotation.sectionProperties.data.html
                        } } :
                    { Text: {
                            type: 'string',
                            value: annotation.sectionProperties.data.text
                        } });
                if (app.file.fileBasedView) {
                    this.map.setPart(app.map._docLayer._selectedPart, false);
                    this.map.sendUnoCommand('.uno:InsertAnnotation', comment, true /* force */);
                    this.map.setPart(0, false);
                }
                else {
                    this.map.sendUnoCommand('.uno:InsertAnnotation', comment, true /* force */);
                }
                // Object is later removed in onACKComment when newly inserted comment object is available
                // It's to reduce the flicker when using comment autosave
                if (!CommentSection.autoSavedComment)
                    this.removeItem(annotation.sectionProperties.data.id);
            }
            else if (annotation.sectionProperties.data.trackchange) {
                comment = {
                    ChangeTrackingId: {
                        type: 'long',
                        value: annotation.sectionProperties.data.index
                    },
                    Text: {
                        type: 'string',
                        value: annotation.sectionProperties.data.text
                    }
                };
                this.map.sendUnoCommand('.uno:CommentChangeTracking', comment, true /* force */);
            }
            else {
                comment = __assign({ Id: {
                        type: 'string',
                        value: annotation.sectionProperties.data.id
                    }, Author: {
                        type: 'string',
                        value: annotation.sectionProperties.data.author
                    } }, (app.map._docLayer._docType === 'text' &&
                    annotation.sectionProperties.data.html) ?
                    { Html: {
                            type: 'string',
                            value: annotation.sectionProperties.data.html
                        } } :
                    { Text: {
                            type: 'string',
                            value: annotation.sectionProperties.data.text
                        } });
                this.map.sendUnoCommand('.uno:EditAnnotation', comment, true /* force */);
            }
            this.unselect();
            this.map.focus();
        };
        CommentSection.prototype.reply = function (annotation) {
            if (cool.Comment.isAnyEdit()) {
                cool.CommentSection.showCommentEditingWarning();
                return;
            }
            if (window.mode.isMobile()) {
                var avatar = undefined;
                var author = this.map.getViewName(app.map._docLayer._viewId);
                if (author in this.map._viewInfoByUserName) {
                    avatar = this.map._viewInfoByUserName[author].userextrainfo.avatar;
                }
                if (app.map._docLayer._docType === 'presentation' || app.map._docLayer._docType === 'drawing') {
                    this.newAnnotationMobile(annotation, annotation.onReplyClick, /* isMod */ false);
                }
                else {
                    var replyAnnotation = {
                        text: '',
                        textrange: '',
                        author: author,
                        dateTime: new Date().toDateString(),
                        id: annotation.sectionProperties.data.id,
                        avatar: avatar,
                        parent: annotation.sectionProperties.data.parent,
                        anchorPos: [annotation.sectionProperties.data.anchorPos[0], annotation.sectionProperties.data.anchorPos[1]],
                    };
                    var replyAnnotationSection = new cool.Comment(replyAnnotation, replyAnnotation.id === 'new' ? { noMenu: true } : {}, this);
                    replyAnnotationSection.name += '-reply';
                    this.newAnnotationMobile(replyAnnotationSection, annotation.onReplyClick, /* isMod */ false);
                }
            }
            else {
                annotation.reply();
                this.select(annotation, true);
                annotation.focus();
            }
        };
        CommentSection.prototype.modify = function (annotation) {
            if (cool.Comment.isAnyEdit()) {
                cool.CommentSection.showCommentEditingWarning();
                return;
            }
            if (window.mode.isMobile()) {
                this.newAnnotationMobile(annotation, function (annotation) {
                    this.save(annotation);
                }.bind(this), /* isMod */ true);
            }
            else {
                // Make sure that comment is not transitioning and comment menu is not open.
                var tempFunction = function () {
                    setTimeout(function () {
                        if (annotation.sectionProperties.container && annotation.sectionProperties.contextMenu === true) {
                            tempFunction();
                        }
                        else {
                            annotation.edit();
                            this.select(annotation, true);
                            annotation.focus();
                        }
                    }.bind(this), 1);
                }.bind(this);
                tempFunction();
            }
        };
        CommentSection.prototype.showCollapsedReplies = function (rootIndex) {
            if (!this.sectionProperties.commentList.length)
                return;
            var lastIndex = this.getLastChildIndexOf(this.sectionProperties.commentList[rootIndex].sectionProperties.data.id);
            var rootComment = this.sectionProperties.commentList[rootIndex];
            while (rootIndex <= lastIndex) {
                this.sectionProperties.commentList[rootIndex].sectionProperties.container.style.display = '';
                this.sectionProperties.commentList[rootIndex].sectionProperties.container.style.visibility = '';
                $(this.sectionProperties.commentList[rootIndex].sectionProperties.container).removeClass('collapsed-comment');
                rootIndex++;
            }
            rootComment.updateThreadInfoIndicator();
        };
        CommentSection.prototype.collapseReplies = function (rootIndex, rootId) {
            var lastChild = this.getLastChildIndexOf(rootId);
            $(this.sectionProperties.commentList[rootIndex].sectionProperties.container).addClass('collapsed-comment');
            for (var i = lastChild; i > rootIndex; i--) {
                this.sectionProperties.commentList[i].sectionProperties.container.style.display = 'none';
                $(this.sectionProperties.commentList[i].sectionProperties.container).addClass('collapsed-comment');
            }
            this.sectionProperties.commentList[i].updateThreadInfoIndicator();
        };
        CommentSection.prototype.cssToCorePixels = function (cssPixels) {
            return cssPixels * app.dpiScale;
        };
        CommentSection.prototype.select = function (annotation, force) {
            if (force === void 0) { force = false; }
            if (force
                || (annotation && !annotation.pendingInit && annotation !== this.sectionProperties.selectedComment
                    && (annotation.sectionProperties.data.resolved !== 'true' || this.sectionProperties.showResolved))) {
                // Select the root comment
                var idx = this.getRootIndexOf(annotation.sectionProperties.data.id);
                // no need to reselect comment, it will cause to scroll to root comment unnecessarily
                if (this.sectionProperties.selectedComment === this.sectionProperties.commentList[idx]) {
                    this.update();
                    return;
                }
                // Unselect first if there anything selected
                if (this.sectionProperties.selectedComment)
                    this.unselect();
                this.sectionProperties.selectedComment = this.sectionProperties.commentList[idx];
                if (this.sectionProperties.selectedComment && !$(this.sectionProperties.selectedComment.sectionProperties.container).hasClass('annotation-active')) {
                    $(this.sectionProperties.selectedComment.sectionProperties.container).addClass('annotation-active');
                }
                if (app.map._docLayer._docType === 'text' && this.sectionProperties.showSelectedBigger) {
                    this.setThreadPopup(this.sectionProperties.selectedComment, true);
                }
                this.scrollCommentIntoView(annotation);
                var selectedComment = this.sectionProperties.selectedComment;
                if (this.isCollapsed) {
                    this.showCollapsedReplies(idx);
                    selectedComment.updateThreadInfoIndicator();
                }
                this.update();
            }
        };
        CommentSection.prototype.scrollCommentIntoView = function (comment) {
            if (CommentSection.importingComments)
                return;
            var docType = app.map._docLayer._docType;
            var anchorPosition = null;
            var rootComment = this.sectionProperties.commentList[this.getRootIndexOf(comment.sectionProperties.data.id)];
            switch (docType) {
                case 'text':
                    {
                        anchorPosition = this.numberArrayToCorePixFromTwips(rootComment.sectionProperties.data.anchorPos, 0, 2);
                        break;
                    }
                case 'spreadsheet':
                    {
                        // in calc comments are not visible on canvas, anchor vertical position is always 1
                        // position is already in core pixels
                        anchorPosition = rootComment.getPosition();
                        break;
                    }
                default:
                    break;
            }
            if (anchorPosition && anchorPosition[1] > 0) {
                var annotationTop = anchorPosition[1];
                var firstIdx = this.getIndexOf(rootComment.sectionProperties.data.id);
                var lastIdx = this.getIndexOf(comment.sectionProperties.data.id);
                for (var i = firstIdx; i < lastIdx; i++) {
                    annotationTop += this.cssToCorePixels(this.sectionProperties.commentList[i].getCommentHeight());
                }
                var annotationBottom = annotationTop + this.cssToCorePixels(comment.getCommentHeight());
                if (!this.isInViewPort([annotationTop, annotationBottom])) {
                    var scrollSection = app.sectionContainer.getSectionWithName(L.CSections.Scroll.name);
                    var screenTopBottom = this.getScreenTopBottom();
                    if (annotationTop < screenTopBottom[0]) {
                        scrollSection.scrollVerticalWithOffset(annotationTop - screenTopBottom[0]);
                    }
                    else
                        scrollSection.scrollVerticalWithOffset(annotationBottom - screenTopBottom[1]);
                    if (docType === 'spreadsheet' && rootComment) {
                        rootComment.positionCalcComment();
                        rootComment.focus();
                    }
                }
            }
        };
        /// returns canvas top and bottom position in core pixels
        CommentSection.prototype.getScreenTopBottom = function () {
            var scrollSection = app.sectionContainer.getSectionWithName(L.CSections.Scroll.name);
            var screenTop = scrollSection.containerObject.getDocumentTopLeft()[1];
            var screenBottom = screenTop + this.cssToCorePixels($('#map').height());
            return [screenTop, screenBottom];
        };
        /// checks if vertical top and bottom point (in core pixels) is shown on the screen currently
        CommentSection.prototype.isInViewPort = function (positionTopBotton) {
            var screenTopBottom = this.getScreenTopBottom();
            var top = positionTopBotton[0];
            var bottom = positionTopBotton[1];
            return (screenTopBottom[0] <= top &&
                screenTopBottom[1] >= bottom);
        };
        CommentSection.prototype.unselect = function () {
            if (this.sectionProperties.selectedComment && this.sectionProperties.selectedComment.sectionProperties.data.id != 'new') {
                if (this.sectionProperties.selectedComment && $(this.sectionProperties.selectedComment.sectionProperties.container).hasClass('annotation-active'))
                    $(this.sectionProperties.selectedComment.sectionProperties.container).removeClass('annotation-active');
                if (app.map._docLayer._docType === 'spreadsheet')
                    this.sectionProperties.selectedComment.hide();
                if (this.sectionProperties.commentsAreListed && this.isCollapsed) {
                    this.sectionProperties.selectedComment.setCollapsed();
                    this.collapseReplies(this.getRootIndexOf(this.sectionProperties.selectedComment.sectionProperties.data.id), this.sectionProperties.selectedComment.sectionProperties.data.id);
                }
                if (app.map._docLayer._docType === 'text' && this.sectionProperties.showSelectedBigger) {
                    this.setThreadPopup(this.sectionProperties.selectedComment, false);
                    this.sectionProperties.showSelectedBigger = false;
                }
                this.sectionProperties.selectedComment = null;
                this.update();
            }
        };
        CommentSection.prototype.setThreadPopup = function (comment, popup) {
            var e_1, _a;
            if (popup && !$(comment.sectionProperties.container).hasClass('annotation-pop-up'))
                $(comment.sectionProperties.container).addClass('annotation-pop-up');
            else if (!popup && $(comment.sectionProperties.container).hasClass('annotation-pop-up'))
                $(comment.sectionProperties.container).removeClass('annotation-pop-up');
            try {
                for (var _b = __values(comment.sectionProperties.children), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var childComment = _c.value;
                    this.setThreadPopup(childComment, popup);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
        };
        CommentSection.prototype.toggleShowBigger = function (comment) {
            var rootComment = this.sectionProperties.commentList[this.getRootIndexOf(comment.sectionProperties.data.id)];
            var isSelected = this.sectionProperties.selectedComment === rootComment;
            if (this.sectionProperties.showSelectedBigger && isSelected) {
                this.sectionProperties.showSelectedBigger = false;
                this.setThreadPopup(this.sectionProperties.selectedComment, false);
            }
            else if (!isSelected) {
                if (this.sectionProperties.selectedComment)
                    this.unselect();
                this.sectionProperties.showSelectedBigger = true;
                this.select(comment);
            }
            else {
                this.sectionProperties.showSelectedBigger = true;
                this.setThreadPopup(rootComment, true);
                this.scrollCommentIntoView(comment);
            }
            this.update();
        };
        CommentSection.prototype.saveReply = function (annotation) {
            var comment = __assign({ Id: {
                    type: 'string',
                    value: annotation.sectionProperties.data.id
                } }, (app.map._docLayer._docType === 'text' &&
                annotation.sectionProperties.data.html) ?
                { Html: {
                        type: 'string',
                        value: annotation.sectionProperties.data.html
                    } } :
                { Text: {
                        type: 'string',
                        value: annotation.sectionProperties.data.reply
                    } });
            if (app.map._docLayer._docType === 'text' || app.map._docLayer._docType === 'spreadsheet')
                this.map.sendUnoCommand('.uno:ReplyComment', comment);
            else if (app.map._docLayer._docType === 'presentation')
                this.map.sendUnoCommand('.uno:ReplyToAnnotation', comment);
            this.unselect();
            this.map.focus();
        };
        CommentSection.prototype.cancel = function (annotation) {
            if (annotation.sectionProperties.data.id === 'new') {
                this.removeItem(annotation.sectionProperties.data.id);
            }
            if (this.sectionProperties.selectedComment === annotation) {
                this.unselect();
            }
            else {
                this.update();
            }
            this.map.focus();
        };
        CommentSection.prototype.onRedlineAccept = function (e) {
            var command = {
                AcceptTrackedChange: {
                    type: 'unsigned short',
                    value: e.id.substring('change-'.length)
                }
            };
            this.map.sendUnoCommand('.uno:AcceptTrackedChange', command);
            this.unselect();
            this.map.focus();
        };
        CommentSection.prototype.onRedlineReject = function (e) {
            var command = {
                RejectTrackedChange: {
                    type: 'unsigned short',
                    value: e.id.substring('change-'.length)
                }
            };
            this.map.sendUnoCommand('.uno:RejectTrackedChange', command);
            this.unselect();
            this.map.focus();
        };
        CommentSection.prototype.remove = function (id) {
            var comment = {
                Id: {
                    type: 'string',
                    value: id
                }
            };
            var removedComment = this.getComment(id);
            removedComment.sectionProperties.selfRemoved = true;
            if (app.file.fileBasedView) // We have to set the part from which the comment will be removed as selected part before the process.
                this.map.setPart(app.map._docLayer._selectedPart, false);
            if (app.map._docLayer._docType === 'text')
                this.map.sendUnoCommand('.uno:DeleteComment', comment);
            else if (app.map._docLayer._docType === 'presentation' || app.map._docLayer._docType === 'drawing')
                this.map.sendUnoCommand('.uno:DeleteAnnotation', comment);
            else if (app.map._docLayer._docType === 'spreadsheet')
                this.map.sendUnoCommand('.uno:DeleteNote', comment);
            if (app.file.fileBasedView)
                this.map.setPart(0, false);
            this.unselect();
            this.map.focus();
        };
        CommentSection.prototype.removeThread = function (id) {
            var comment = {
                Id: {
                    type: 'string',
                    value: id
                }
            };
            this.map.sendUnoCommand('.uno:DeleteCommentThread', comment);
            this.unselect();
            this.map.focus();
        };
        CommentSection.prototype.resolve = function (annotation) {
            var comment = {
                Id: {
                    type: 'string',
                    value: annotation.sectionProperties.data.id
                }
            };
            this.map.sendUnoCommand('.uno:ResolveComment', comment);
        };
        CommentSection.prototype.resolveThread = function (annotation) {
            var comment = {
                Id: {
                    type: 'string',
                    value: annotation.sectionProperties.data.id
                }
            };
            this.map.sendUnoCommand('.uno:ResolveCommentThread', comment);
        };
        CommentSection.prototype.promote = function (annotation) {
            var comment = {
                Id: {
                    type: 'string',
                    value: annotation.sectionProperties.data.id
                }
            };
            this.map.sendUnoCommand('.uno:PromoteComment', comment);
        };
        CommentSection.prototype.getIndexOf = function (id) {
            var index = this.idIndexMap.get(id);
            return (index === undefined) ? -1 : index;
        };
        CommentSection.prototype.isThreadResolved = function (annotation) {
            // If comment has children.
            if (annotation.sectionProperties.children.length > 0) {
                for (var i = 0; i < annotation.sectionProperties.children.length; i++) {
                    if (annotation.sectionProperties.children[i].sectionProperties.data.resolved !== 'true')
                        return false;
                }
                return true;
            }
            // If it has a parent.
            else if (annotation.sectionProperties.data.parent !== '0') {
                var index = this.getSubRootIndexOf(annotation.sectionProperties.data.parent);
                var comment = this.sectionProperties.commentList[index];
                if (comment.sectionProperties.data.resolved !== 'true')
                    return false;
                else if (comment.sectionProperties.children.length > 0) {
                    for (var i = 0; i < comment.sectionProperties.children.length; i++) {
                        if (comment.sectionProperties.children[i].sectionProperties.data.resolved !== 'true')
                            return false;
                    }
                    return true;
                }
            }
        };
        CommentSection.prototype.initializeContextMenus = function () {
            var docLayer = app.map._docLayer;
            L.installContextMenu({
                selector: '.cool-annotation-menu',
                trigger: 'none',
                zIndex: 1500,
                className: 'cool-font',
                build: function ($trigger) {
                    var blockChangeFromDifferentAuthor = this.map.isReadOnlyMode() && docLayer._docType === 'text' && this.map.getViewName(docLayer._viewId) !== $trigger[0].annotation.sectionProperties.data.author;
                    var isShownBig = this.sectionProperties.showSelectedBigger && this.sectionProperties.selectedComment === this.sectionProperties.commentList[this.getRootIndexOf($trigger[0].annotation.sectionProperties.data.id)];
                    return {
                        autoHide: true,
                        items: {
                            modify: blockChangeFromDifferentAuthor ? undefined : {
                                name: _('Modify'),
                                callback: function (key, options) {
                                    this.modify.call(this, options.$trigger[0].annotation);
                                }.bind(this)
                            },
                            reply: (docLayer._docType !== 'text' && docLayer._docType !== 'presentation') ? undefined : {
                                name: _('Reply'),
                                callback: function (key, options) {
                                    this.reply.call(this, options.$trigger[0].annotation);
                                }.bind(this)
                            },
                            remove: blockChangeFromDifferentAuthor ? undefined : {
                                name: _('Remove'),
                                callback: function (key, options) {
                                    this.remove.call(this, options.$trigger[0].annotation.sectionProperties.data.id);
                                }.bind(this)
                            },
                            removeThread: docLayer._docType !== 'text' || !$trigger[0].annotation.isRootComment() || blockChangeFromDifferentAuthor ? undefined : {
                                name: _('Remove Thread'),
                                callback: function (key, options) {
                                    this.removeThread.call(this, options.$trigger[0].annotation.sectionProperties.data.id);
                                }.bind(this)
                            },
                            resolve: docLayer._docType !== 'text' ? undefined : {
                                name: $trigger[0].annotation.sectionProperties.data.resolved === 'false' ? _('Resolve') : _('Unresolve'),
                                callback: function (key, options) {
                                    this.resolve.call(this, options.$trigger[0].annotation);
                                }.bind(this)
                            },
                            resolveThread: docLayer._docType !== 'text' || !$trigger[0].annotation.isRootComment() ? undefined : {
                                name: this.isThreadResolved($trigger[0].annotation) ? _('Unresolve Thread') : _('Resolve Thread'),
                                callback: function (key, options) {
                                    this.resolveThread.call(this, options.$trigger[0].annotation);
                                }.bind(this)
                            },
                            promote: docLayer._docType !== 'text' || $trigger[0].annotation.isRootComment() || blockChangeFromDifferentAuthor ? undefined : {
                                name: _('Promote to top comment'),
                                callback: function (key, options) {
                                    this.promote.call(this, options.$trigger[0].annotation);
                                }.bind(this)
                            },
                            showBigger: docLayer._docType !== 'text' || window.mode.isMobile() ? undefined : {
                                name: isShownBig ? _('Show on the side') : _('Open in full view'),
                                callback: function (key, options) {
                                    this.toggleShowBigger.call(this, options.$trigger[0].annotation);
                                }.bind(this)
                            }
                        },
                    };
                }.bind(this),
                events: {
                    show: function (options) {
                        options.$trigger[0].annotation.sectionProperties.contextMenu = true;
                        setTimeout(function () {
                            options.items.modify.$node[0].tabIndex = 0;
                            options.items.modify.$node[0].focus();
                        }.bind(this), 10);
                    },
                    hide: function (options) {
                        options.$trigger[0].annotation.sectionProperties.contextMenu = false;
                    }
                }
            });
            L.installContextMenu({
                selector: '.cool-annotation-menu-redline',
                trigger: 'none',
                zIndex: 1500,
                className: 'cool-font',
                items: {
                    modify: {
                        name: _('Comment'),
                        callback: function (key, options) {
                            this.modify.call(this, options.$trigger[0].annotation);
                        }.bind(this)
                    }
                },
                events: {
                    show: function (options) {
                        options.$trigger[0].annotation.sectionProperties.contextMenu = true;
                    },
                    hide: function (options) {
                        options.$trigger[0].annotation.sectionProperties.contextMenu = false;
                    }
                }
            });
        };
        CommentSection.prototype.onResize = function () {
            this.checkCollapseState();
            // When window is resized, it may mean that comment wizard is closed. So we hide the highlights.
            this.removeHighlighters();
            this.update();
        };
        CommentSection.prototype.onNewDocumentTopLeft = function () {
            if (app.map._docLayer._docType === 'spreadsheet') {
                if (this.sectionProperties.selectedComment)
                    this.sectionProperties.selectedComment.hide();
            }
            var previousAnimationState = this.disableLayoutAnimation;
            this.disableLayoutAnimation = true;
            this.update(false);
            this.disableLayoutAnimation = previousAnimationState;
        };
        CommentSection.prototype.showHideComments = function () {
            for (var i = 0; i < this.sectionProperties.commentList.length; i++) {
                this.showHideComment(this.sectionProperties.commentList[i]);
            }
        };
        CommentSection.prototype.showHideComment = function (annotation) {
            // This manually shows/hides comments
            if (!this.sectionProperties.showResolved && app.map._docLayer._docType === 'text') {
                if (annotation.isContainerVisible() && annotation.sectionProperties.data.resolved === 'true') {
                    if (this.sectionProperties.selectedComment == annotation) {
                        this.unselect();
                    }
                    annotation.hide();
                    annotation.update();
                }
                else if (!annotation.isContainerVisible() && annotation.sectionProperties.data.resolved === 'false') {
                    annotation.show();
                    annotation.update();
                }
                this.update();
            }
            else if (app.map._docLayer._docType === 'presentation' || app.map._docLayer._docType === 'drawing') {
                if (annotation.sectionProperties.partIndex === app.map._docLayer._selectedPart || app.file.fileBasedView) {
                    if (!annotation.isContainerVisible()) {
                        annotation.show();
                        annotation.update();
                        this.update();
                    }
                }
                else {
                    annotation.hide();
                    annotation.update();
                    this.update();
                }
            }
        };
        CommentSection.prototype.add = function (comment) {
            if (!comment.sectionProperties) {
                var temp = new cool.Comment(comment, comment.id === 'new' ? { noMenu: true } : {}, this);
                temp.sectionProperties.data = comment;
                comment = temp;
            }
            comment.sectionProperties.noMenu = comment.sectionProperties.data.id === 'new' ? true : false;
            /*
                Remove if a comment with the same id exists.
                When user deletes a parent and a child of that parent and undoes the operation respectively:
                    * The first undo: Core side sends the deleted child - this is fine.
                    * The second undo: Core side sends parent and child together - which is not fine. We already had the child with the first undo command.
                So, delete if a comment already exists and trust core side about the ids of the comments.
            */
            if (this.containerObject.doesSectionExist(comment.name))
                this.removeItem(comment.name);
            this.containerObject.addSection(comment);
            this.sectionProperties.commentList.push(comment);
            this.adjustParentAdd(comment);
            this.orderCommentList(); // Also updates the index map.
            this.checkSize();
            if (this.isCollapsed && comment.sectionProperties.data.id !== 'new')
                comment.setCollapsed();
            else
                comment.setExpanded();
            // check if we are the author
            // then select it so it does not get lost in a long list of comments and replies.
            var authorName = this.map.getViewName(app.map._docLayer._viewId);
            var newComment = comment.sectionProperties.data.id === 'new';
            if (!newComment && (authorName === comment.sectionProperties.data.author)) {
                this.select(comment);
            }
            return comment;
        };
        CommentSection.prototype.adjustRedLine = function (redline) {
            // All sane values ?
            if (!redline.textRange) {
                console.warn('Redline received has invalid textRange');
                return false;
            }
            // transform change tracking index into an id
            redline.id = 'change-' + redline.index;
            redline.parent = '0'; // Redlines don't have parents, we need to specify this for consistency.
            redline.anchorPos = this.stringToRectangles(redline.textRange)[0];
            redline.anchorPix = this.numberArrayToCorePixFromTwips(redline.anchorPos, 0, 2);
            redline.trackchange = true;
            redline.text = redline.comment;
            var rectangles = L.PolyUtil.rectanglesToPolygons(app.LOUtil.stringToRectangles(redline.textRange), app.map._docLayer);
            if (rectangles.length > 0) {
                redline.textSelected = L.polygon(rectangles, {
                    pointerEvents: 'all',
                    interactive: false,
                    fillOpacity: 0,
                    opacity: 0
                });
                redline.textSelected.addEventParent(this.map);
                redline.textSelected.on('click', function () {
                    this.selectById(redline.id);
                }, this);
            }
            return true;
        };
        CommentSection.prototype.getComment = function (id) {
            var index = this.getIndexOf(id);
            return index == -1 ? null : this.sectionProperties.commentList[index];
        };
        CommentSection.prototype.checkIfCommentHasPreAssignedChildren = function (comment) {
            for (var i = 0; i < this.sectionProperties.commentList.length; i++) {
                var possibleChild = this.sectionProperties.commentList[i];
                if (possibleChild.sectionProperties.possibleParentCommentId !== null) {
                    if (possibleChild.sectionProperties.possibleParentCommentId === comment.sectionProperties.data.id) {
                        if (!comment.sectionProperties.children.includes(possibleChild))
                            comment.sectionProperties.children.push(possibleChild);
                    }
                }
            }
        };
        // Adjust parent-child relationship, if required, after `comment` is added
        CommentSection.prototype.adjustParentAdd = function (comment) {
            if (comment.sectionProperties.data.parent === undefined)
                comment.sectionProperties.data.parent = '0';
            if (comment.sectionProperties.data.parent !== '0') {
                var parentIdx = this.getIndexOf(comment.sectionProperties.data.parent);
                if (parentIdx === -1) {
                    console.warn('adjustParentAdd: No parent comment to attach received comment to. ' +
                        'Parent comment ID sought is :' + comment.sectionProperties.data.parent + ' for current comment with ID : ' + comment.sectionProperties.data.id);
                    comment.sectionProperties.possibleParentCommentId = comment.sectionProperties.data.parent; // Save the proposed parentId so we can remember if such parent appears.
                    comment.setAsRootComment(); // Set this to default since there is no such parent at the moment.
                }
                else {
                    var parentComment = this.sectionProperties.commentList[parentIdx];
                    if (parentComment && !parentComment.sectionProperties.children.includes(comment))
                        parentComment.sectionProperties.children.unshift(comment);
                }
            }
            // Check if any of the child comments targets the newly added comment as parent.
            this.checkIfCommentHasPreAssignedChildren(comment);
        };
        // Adjust parent-child relationship, if required, after `comment` is removed
        CommentSection.prototype.adjustParentRemove = function (comment) {
            var parentIdx = this.getIndexOf(comment.getParentCommentId());
            // If a child comment is removed.
            var parentComment = this.sectionProperties.commentList[parentIdx];
            if (parentComment) {
                var index = parentComment.getIndexOfChild(comment);
                if (index >= 0)
                    parentComment.removeChildByIndex(index); // Removed comment has a parent. Remove the comment also from its parent's list.
            }
            // If a parent comment is removed.
            for (var i = 0; i < comment.getChildrenLength(); i++) { // Loop over removed comment's children.
                var childComment = comment.getChildByIndex(i);
                if (childComment)
                    childComment.setAsRootComment(); // The children have no parent comment any more.
            }
        };
        CommentSection.prototype.overWriteCommentChanges = function (obj, editComment) {
            this.clearAutoSaveStatus();
            editComment.onCancelClick(null);
            this.onACKComment(obj);
        };
        CommentSection.prototype.handleCommentConflict = function (obj, editComment) {
            var _this = this;
            if (document.getElementById(this.map.uiManager.generateModalId('comments-update')))
                return;
            if (obj.comment.action === 'Remove' || obj.comment.action === 'RedlinedDeletion') {
                JSDialog.showInfoModalWithOptions('comments-update', {
                    'title': _('Comments Updated'),
                    'messages': [_('Another user has removed this comment.')],
                    'buttons': [{ 'text': _('OK'),
                            'callback': function () {
                                _this.overWriteCommentChanges(obj, editComment);
                            } }],
                    'withCancel': false
                });
                return;
            }
            this.map.uiManager.showYesNoButton('comments-update', _('Comments Updated'), _('Another user has updated the comment. Would you like to overwrite those changes?'), _('Overwrite'), _('Update'), null, function () {
                _this.overWriteCommentChanges(obj, editComment);
            }, false);
        };
        CommentSection.prototype.checkIfOnlyAnchorPosChanged = function (obj, editComment) {
            if (obj.comment.action !== 'Modify')
                return false;
            var newComment = obj.comment;
            var editCommentData = editComment.sectionProperties.data;
            if (newComment.author !== editCommentData.author
                || newComment.dateTime !== editCommentData.dateTime
                || newComment.html !== editCommentData.html
                || newComment.layoutStatus !== editCommentData.layoutStatus.toString()
                || newComment.parentId !== editCommentData.parentId
                || newComment.resolved !== editCommentData.resolved
                || newComment.textRange !== editCommentData.textRange)
                return false;
            if (newComment.anchorPos.replaceAll(" ", '') !== editCommentData.anchorPos.toString())
                return true;
            return false;
        };
        CommentSection.prototype.actionPerformedByCurrentUser = function (obj) {
            return obj.comment.author === this.map._viewInfo[this.map._docLayer._editorId].username;
        };
        CommentSection.prototype.onACKComment = function (obj) {
            var id;
            var anyEdit = cool.Comment.isAnyEdit();
            if (anyEdit
                && !this.checkIfOnlyAnchorPosChanged(obj, anyEdit)
                && !anyEdit.sectionProperties.selfRemoved
                && anyEdit.sectionProperties.data.id === obj.comment.id
                && CommentSection.autoSavedComment !== anyEdit
                && !this.actionPerformedByCurrentUser(obj)) {
                this.handleCommentConflict(obj, anyEdit);
                return;
            }
            var changetrack = obj.redline ? true : false;
            var dataroot = changetrack ? 'redline' : 'comment';
            if (changetrack) {
                obj.redline.id = 'change-' + obj.redline.index;
            }
            var action = changetrack ? obj.redline.action : obj.comment.action;
            if (!changetrack && obj.comment.parent === undefined) {
                if (obj.comment.parentId)
                    obj.comment.parent = String(obj.comment.parentId);
                else
                    obj.comment.parent = '0';
            }
            if (changetrack && obj.redline.author in this.map._viewInfoByUserName) {
                obj.redline.avatar = this.map._viewInfoByUserName[obj.redline.author].userextrainfo.avatar;
            }
            else if (!changetrack && obj.comment.author in this.map._viewInfoByUserName) {
                obj.comment.avatar = this.map._viewInfoByUserName[obj.comment.author].userextrainfo.avatar;
            }
            if (window.mode.isMobile()) {
                var annotation = this.sectionProperties.commentList[this.getRootIndexOf(obj[dataroot].id)];
                if (!annotation)
                    annotation = this.sectionProperties.commentList[this.getRootIndexOf(obj[dataroot].parent)]; //this is required for reload after reply in writer
            }
            if (action === 'Add') {
                if (changetrack) {
                    if (!this.adjustRedLine(obj.redline)) {
                        // something wrong in this redline
                        return;
                    }
                    this.add(obj.redline);
                }
                else {
                    var currentComment = this.getComment(obj[dataroot].id);
                    if (currentComment !== null) {
                        if (obj[dataroot].layoutStatus !== undefined) {
                            currentComment.sectionProperties.data.layoutStatus = parseInt(obj[dataroot].layoutStatus);
                            currentComment.setLayoutClass();
                        }
                        return;
                    }
                    this.adjustComment(obj.comment);
                    annotation = this.add(obj.comment);
                    if (app.map._docLayer._docType === 'spreadsheet')
                        annotation.hide();
                    var autoSavedComment = CommentSection.autoSavedComment;
                    if (autoSavedComment) {
                        var isOurComment = annotation.isAutoSaved();
                        if (isOurComment) {
                            if (app.definitions.CommentSection.needFocus) {
                                app.definitions.CommentSection.needFocus = annotation;
                            }
                            annotation.sectionProperties.container.style.visibility = 'visible';
                            annotation.sectionProperties.autoSave.innerText = _('Autosaved');
                            if (app.map._docLayer._docType === 'spreadsheet')
                                annotation.show();
                            if (autoSavedComment.sectionProperties.data.id === 'new')
                                this.removeItem(autoSavedComment.sectionProperties.data.id);
                            annotation.edit();
                            if (this.shouldCollapse())
                                annotation.setCollapsed();
                            CommentSection.autoSavedComment = null;
                            CommentSection.commentWasAutoAdded = true;
                        }
                    }
                }
                if (this.sectionProperties.selectedComment && !this.sectionProperties.selectedComment.isEdit()) {
                    this.map.focus();
                }
            }
            else if (action === 'Remove') {
                id = obj[dataroot].id;
                var removed = this.getComment(id);
                if (removed) {
                    this.adjustParentRemove(removed);
                    if (this.sectionProperties.selectedComment === removed) {
                        this.unselect();
                        this.removeItem(id);
                    }
                    else {
                        this.removeItem(id);
                        this.update();
                    }
                }
            }
            else if (action === 'RedlinedDeletion') {
                id = obj[dataroot].id;
                var _redlined = this.getComment(id);
                if (_redlined && _redlined.sectionProperties.data.layoutStatus === cool.CommentLayoutStatus.INSERTED) {
                    // Do normal removal if comment was added while recording was on
                    // No need to keep the deleted comment
                    obj[dataroot].action = 'Remove';
                    this.onACKComment(obj);
                    return;
                }
                if (_redlined) {
                    _redlined.sectionProperties.data.layoutStatus = cool.CommentLayoutStatus.DELETED;
                    _redlined.setLayoutClass();
                }
            }
            else if (action === 'Modify') {
                id = obj[dataroot].id;
                var modified = this.getComment(id);
                if (modified) {
                    var modifiedObj;
                    if (changetrack) {
                        if (!this.adjustRedLine(obj.redline)) {
                            // something wrong in this redline
                            return;
                        }
                        modifiedObj = obj.redline;
                    }
                    else {
                        this.adjustComment(obj.comment);
                        modifiedObj = obj.comment;
                    }
                    var oldParent = modified.getParentCommentId();
                    modified.setData(modifiedObj);
                    modified.update();
                    if (oldParent !== null && modified.isRootComment()) {
                        var parentIdx = this.getIndexOf(oldParent);
                        var parentComment = this.sectionProperties.commentList[parentIdx];
                        if (parentComment) {
                            var index = parentComment.getIndexOfChild(modified);
                            if (index >= 0)
                                parentComment.removeChildByIndex(index);
                        }
                    }
                    this.update();
                    if (CommentSection.autoSavedComment) {
                        CommentSection.autoSavedComment.sectionProperties.autoSave.innerText = _('Autosaved');
                        if (app.map._docLayer._docType === 'spreadsheet')
                            modified.show();
                        modified.edit();
                        if (this.shouldCollapse())
                            modified.setCollapsed();
                    }
                }
            }
            else if (action === 'Resolve') {
                id = obj[dataroot].id;
                var resolved = this.getComment(id);
                if (resolved) {
                    var resolvedObj;
                    if (changetrack) {
                        if (!this.adjustRedLine(obj.redline)) {
                            // something wrong in this redline
                            return;
                        }
                        resolvedObj = obj.redline;
                    }
                    else {
                        this.adjustComment(obj.comment);
                        resolvedObj = obj.comment;
                    }
                    resolved.setData(resolvedObj);
                    resolved.update();
                    this.showHideComment(resolved);
                    this.update();
                }
            }
            if (window.mode.isMobile()) {
                var shouldOpenWizard = false;
                var wePerformedAction = obj.comment.author === this.map.getViewName(app.map._docLayer._viewId);
                if (window.commentWizard || (action === 'Add' && wePerformedAction))
                    shouldOpenWizard = true;
                if (shouldOpenWizard) {
                    app.map._docLayer._openCommentWizard(annotation);
                }
            }
            if (app.map._docLayer._docType === 'text') {
                this.updateThreadInfoIndicator();
            }
            if (CommentSection.pendingImport) {
                app.socket.sendMessage('commandvalues command=.uno:ViewAnnotations');
                CommentSection.pendingImport = false;
            }
        };
        CommentSection.prototype.selectById = function (commentId) {
            var idx = this.getRootIndexOf(commentId);
            var annotation = this.sectionProperties.commentList[idx];
            this.select(annotation);
        };
        CommentSection.prototype.stringToRectangles = function (str) {
            var strString = typeof str !== 'string' ? String(str) : str;
            var matches = strString.match(/\d+/g);
            var rectangles = [];
            if (matches !== null) {
                for (var i = 0; i < matches.length; i += 4) {
                    rectangles.push([parseInt(matches[i]), parseInt(matches[i + 1]), parseInt(matches[i + 2]), parseInt(matches[i + 3])]);
                }
            }
            return rectangles;
        };
        CommentSection.prototype.onPartChange = function () {
            for (var i = 0; i < this.sectionProperties.commentList.length; i++) {
                this.showHideComment(this.sectionProperties.commentList[i]);
            }
            if (this.sectionProperties.selectedComment)
                this.sectionProperties.selectedComment.onCancelClick(null);
            this.checkSize();
        };
        // This converts the specified number of values into core pixels from twips.
        // Returns a new array with the length of specified numbers.
        CommentSection.prototype.numberArrayToCorePixFromTwips = function (numberArray, startIndex, length) {
            if (startIndex === void 0) { startIndex = 0; }
            if (length === void 0) { length = null; }
            if (!length)
                length = numberArray.length;
            if (startIndex < 0)
                startIndex = 0;
            if (length < 0)
                length = 0;
            if (startIndex + length > numberArray.length)
                length = numberArray.length - startIndex;
            var result = new Array(length);
            for (var i = startIndex; i < length; i++) {
                result[i] = Math.round(numberArray[i] * app.twipsToPixels);
            }
            return result;
        };
        // In file based view, we need to move comments to their part's position.
        // Because all parts are drawn on the screen. Core side doesn't have this feature.
        // Core side sends the information in part coordinates.
        // When a coordinate like [0, 0] is inside 2nd part for example, that coordinate should correspond to a value like (just guessing) [0, 45646].
        // See that y value is different. Because there is 1st part above the 2nd one in the view.
        // We will add their part's position to comment's variables.
        // When we are saving their position, we will remove the additions before sending the information.
        CommentSection.prototype.adjustCommentFileBasedView = function (comment) {
            // Below calculations are the same with the ones we do while drawing tiles in fileBasedView.
            var partHeightTwips = app.map._docLayer._partHeightTwips + app.map._docLayer._spaceBetweenParts;
            var index = app.impress.getIndexFromSlideHash(parseInt(comment.parthash));
            var yAddition = index * partHeightTwips;
            comment.yAddition = yAddition; // We'll use this while we save the new position of the comment.
            comment.trackchange = false;
            comment.rectangles = this.stringToRectangles(comment.textRange || comment.anchorPos || comment.rectangle); // Simple array of point arrays [x1, y1, x2, y2].
            comment.rectangles[0][1] += yAddition; // There is only one rectangle for our case.
            comment.rectanglesOriginal = this.stringToRectangles(comment.textRange || comment.anchorPos || comment.rectangle); // This unmodified version will be kept for re-calculations.
            comment.rectanglesOriginal[0][1] += yAddition;
            comment.anchorPos = this.stringToRectangles(comment.anchorPos || comment.rectangle)[0];
            comment.anchorPos[1] += yAddition;
            if (comment.rectangle) {
                comment.rectangle = this.stringToRectangles(comment.rectangle)[0]; // This is the position of the marker.
                comment.rectangle[1] += yAddition;
            }
            comment.anchorPix = this.numberArrayToCorePixFromTwips(comment.anchorPos, 0, 2);
            comment.parthash = comment.parthash ? comment.parthash : null;
            var viewId = this.map.getViewId(comment.author);
            var color = viewId >= 0 ? app.LOUtil.rgbToHex(this.map.getViewColor(viewId)) : '#43ACE8';
            comment.color = color;
        };
        // Normally, a comment's position information is the same with the desktop version.
        // So we can use it directly.
        CommentSection.prototype.adjustCommentNormal = function (comment) {
            comment.trackchange = false;
            if (comment.cellRange) {
                // turn cell range string into cell bounds
                comment.cellRange = app.map._docLayer._parseCellRange(comment.cellRange);
            }
            var cellPos = comment.cellRange ? app.map._docLayer._cellRangeToTwipRect(comment.cellRange).toRectangle() : null;
            comment.rectangles = this.stringToRectangles(comment.textRange || comment.anchorPos || comment.rectangle || cellPos); // Simple array of point arrays [x1, y1, x2, y2].
            comment.rectanglesOriginal = this.stringToRectangles(comment.textRange || comment.anchorPos || comment.rectangle || cellPos); // This unmodified version will be kept for re-calculations.
            comment.anchorPos = this.stringToRectangles(comment.anchorPos || comment.rectangle || cellPos)[0];
            comment.anchorPix = this.numberArrayToCorePixFromTwips(comment.anchorPos, 0, 2);
            comment.parthash = comment.parthash ? comment.parthash : null;
            comment.tab = (comment.tab || comment.tab === 0) ? comment.tab : null;
            comment.layoutStatus = comment.layoutStatus !== undefined ? parseInt(comment.layoutStatus) : null;
            if (comment.parentId)
                comment.parent = String(comment.parentId);
            if (comment.rectangle) {
                comment.rectangle = this.stringToRectangles(comment.rectangle)[0]; // This is the position of the marker (Impress & Draw).
            }
            var viewId = this.map.getViewId(comment.author);
            var color = viewId >= 0 ? app.LOUtil.rgbToHex(this.map.getViewColor(viewId)) : '#43ACE8';
            comment.color = color;
        };
        CommentSection.prototype.adjustComment = function (comment) {
            if (!app.file.fileBasedView)
                this.adjustCommentNormal(comment);
            else
                this.adjustCommentFileBasedView(comment);
        };
        // Returns the last comment id of comment thread containing the given id
        CommentSection.prototype.getLastChildIndexOf = function (id) {
            var index = this.getIndexOf(id);
            index = this.getRootIndexOf(this.sectionProperties.commentList[index].sectionProperties.data.id);
            while (this.sectionProperties.commentList[index + 1] &&
                index + 1 < this.sectionProperties.commentList.length &&
                this.sectionProperties.commentList[index + 1].sectionProperties.data.parent !== '0') {
                index++;
            }
            return index;
        };
        // If the file type is presentation or drawing then we shall check the selected part in order to hide comments from other parts.
        // But if file is in fileBasedView, then we will not hide any comments from not-selected/viewed parts.
        CommentSection.prototype.mustCheckSelectedPart = function () {
            return (app.map._docLayer._docType === 'presentation' || app.map._docLayer._docType === 'drawing') && !app.file.fileBasedView;
        };
        CommentSection.prototype.layoutUp = function (subList, actualPosition, lastY, relayout) {
            if (relayout === void 0) { relayout = true; }
            var height;
            for (var i = 0; i < subList.length; i++) {
                height = subList[i].getCommentHeight(relayout);
                lastY = subList[i].sectionProperties.data.anchorPix[1] + height < lastY ? subList[i].sectionProperties.data.anchorPix[1] : lastY - (height * app.dpiScale);
                subList[i].sectionProperties.container.style.left = String(Math.round(actualPosition[0] / app.dpiScale)) + 'px';
                subList[i].sectionProperties.container.style.top = String(Math.round(lastY / app.dpiScale)) + 'px';
                if (!subList[i].isEdit())
                    subList[i].show();
            }
            return lastY;
        };
        CommentSection.prototype.loopUp = function (startIndex, x, startY, relayout) {
            if (relayout === void 0) { relayout = true; }
            var tmpIdx = 0;
            var checkSelectedPart = this.mustCheckSelectedPart();
            startY -= this.sectionProperties.marginY;
            // Pass over all comments present
            for (var i = startIndex; i > -1;) {
                var subList = [];
                tmpIdx = i;
                do {
                    this.sectionProperties.commentList[tmpIdx].sectionProperties.data.anchorPix = this.numberArrayToCorePixFromTwips(this.sectionProperties.commentList[tmpIdx].sectionProperties.data.anchorPos, 0, 2);
                    this.sectionProperties.commentList[tmpIdx].sectionProperties.data.anchorPix[1] -= this.documentTopLeft[1];
                    // Add this item to the list of comments.
                    if (this.sectionProperties.commentList[tmpIdx].sectionProperties.data.resolved !== 'true' || this.sectionProperties.showResolved) {
                        if (!checkSelectedPart || app.map._docLayer._selectedPart === this.sectionProperties.commentList[tmpIdx].sectionProperties.partIndex)
                            subList.push(this.sectionProperties.commentList[tmpIdx]);
                    }
                    tmpIdx = tmpIdx - 1;
                    // Continue this loop, until we reach the last item, or an item which is not a direct descendant of the previous item.
                } while (tmpIdx > -1 && this.sectionProperties.commentList[tmpIdx].sectionProperties.data.parent === this.sectionProperties.commentList[tmpIdx + 1].sectionProperties.data.id);
                if (subList.length > 0) {
                    startY = this.layoutUp(subList, [x, subList[0].sectionProperties.data.anchorPix[1]], startY, relayout);
                    i = i - subList.length;
                }
                else {
                    i = tmpIdx;
                }
                startY -= this.sectionProperties.marginY;
            }
            return startY;
        };
        CommentSection.prototype.layoutDown = function (subList, actualPosition, lastY, relayout) {
            if (relayout === void 0) { relayout = true; }
            var selectedComment = subList[0] === this.sectionProperties.selectedComment;
            for (var i = 0; i < subList.length; i++) {
                lastY = subList[i].sectionProperties.data.anchorPix[1] > lastY ? subList[i].sectionProperties.data.anchorPix[1] : lastY;
                var isRTL = document.documentElement.dir === 'rtl';
                if (selectedComment) {
                    // FIXME: getBoundingClientRect is expensive and this is a hot path (called continuously during animations and scrolling)
                    var posX = (this.sectionProperties.showSelectedBigger ?
                        Math.round((document.getElementById('document-container').getBoundingClientRect().width - subList[i].sectionProperties.container.getBoundingClientRect().width) / 2) :
                        Math.round(actualPosition[0] / app.dpiScale) - this.sectionProperties.deflectionOfSelectedComment * (isRTL ? -1 : 1));
                    subList[i].sectionProperties.container.style.left = String(posX) + 'px';
                    subList[i].sectionProperties.container.style.top = String(Math.round(lastY / app.dpiScale)) + 'px';
                }
                else {
                    subList[i].sectionProperties.container.style.left = String(Math.round(actualPosition[0] / app.dpiScale)) + 'px';
                    subList[i].sectionProperties.container.style.top = String(Math.round(lastY / app.dpiScale)) + 'px';
                }
                lastY += (subList[i].getCommentHeight(relayout) * app.dpiScale);
                if (!subList[i].isEdit())
                    subList[i].show();
            }
            return lastY;
        };
        CommentSection.prototype.loopDown = function (startIndex, x, startY, relayout) {
            if (relayout === void 0) { relayout = true; }
            var tmpIdx = 0;
            var checkSelectedPart = this.mustCheckSelectedPart();
            // Pass over all comments present
            for (var i = startIndex; i < this.sectionProperties.commentList.length;) {
                var subList = [];
                tmpIdx = i;
                do {
                    this.sectionProperties.commentList[tmpIdx].sectionProperties.data.anchorPix = this.numberArrayToCorePixFromTwips(this.sectionProperties.commentList[tmpIdx].sectionProperties.data.anchorPos, 0, 2);
                    this.sectionProperties.commentList[tmpIdx].sectionProperties.data.anchorPix[1] -= this.documentTopLeft[1];
                    // Add this item to the list of comments.
                    if (this.sectionProperties.commentList[tmpIdx].sectionProperties.data.resolved !== 'true' || this.sectionProperties.showResolved) {
                        if (!checkSelectedPart || app.map._docLayer._selectedPart === this.sectionProperties.commentList[tmpIdx].sectionProperties.partIndex)
                            subList.push(this.sectionProperties.commentList[tmpIdx]);
                    }
                    tmpIdx = tmpIdx + 1;
                    // Continue this loop, until we reach the last item, or an item which is not a direct descendant of the previous item.
                } while (tmpIdx < this.sectionProperties.commentList.length && this.sectionProperties.commentList[tmpIdx].sectionProperties.data.parent !== '0');
                if (subList.length > 0) {
                    startY = this.layoutDown(subList, [x, subList[0].sectionProperties.data.anchorPix[1]], startY, relayout);
                    i = i + subList.length;
                }
                else {
                    i = tmpIdx;
                }
                startY += this.sectionProperties.marginY;
            }
            return startY;
        };
        CommentSection.prototype.hideArrow = function () {
            if (this.sectionProperties.arrow) {
                document.getElementById('document-container').removeChild(this.sectionProperties.arrow);
                this.sectionProperties.arrow = null;
                app.sectionContainer.requestReDraw();
            }
        };
        CommentSection.prototype.showArrow = function (startPoint, endPoint) {
            var anchorSection = this.containerObject.getDocumentAnchorSection();
            startPoint[0] -= anchorSection.myTopLeft[0] + this.documentTopLeft[0];
            startPoint[1] -= anchorSection.myTopLeft[1] + this.documentTopLeft[1];
            endPoint[1] -= anchorSection.myTopLeft[1] + this.documentTopLeft[1];
            startPoint[0] = Math.floor(startPoint[0] / app.dpiScale);
            startPoint[1] = Math.floor(startPoint[1] / app.dpiScale);
            endPoint[0] = Math.floor(endPoint[0] / app.dpiScale);
            endPoint[1] = Math.floor(endPoint[1] / app.dpiScale);
            if (this.sectionProperties.arrow !== null) {
                var line = (this.sectionProperties.arrow.firstElementChild);
                line.setAttribute('x1', String(startPoint[0]));
                line.setAttribute('y1', String(startPoint[1]));
                line.setAttribute('x2', String(endPoint[0]));
                line.setAttribute('y2', String(endPoint[1]));
            }
            else {
                var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svg.setAttribute('version', '1.1');
                svg.style.zIndex = '9';
                svg.id = 'comment-arrow-container';
                svg.style.position = 'absolute';
                svg.style.top = svg.style.left = svg.style.right = svg.style.bottom = '0';
                svg.setAttribute('width', String(this.context.canvas.width));
                svg.setAttribute('height', String(this.context.canvas.height));
                var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.id = 'comment-arrow-line';
                line.setAttribute('x1', String(startPoint[0]));
                line.setAttribute('y1', String(startPoint[1]));
                line.setAttribute('x2', String(endPoint[0]));
                line.setAttribute('y2', String(endPoint[1]));
                line.setAttribute('stroke', 'darkblue');
                line.setAttribute('stroke-width', '1');
                svg.appendChild(line);
                document.getElementById('document-container').appendChild(svg);
                this.sectionProperties.arrow = svg;
            }
        };
        CommentSection.prototype.layout = function (relayout) {
            if (relayout === void 0) { relayout = true; }
            if (window.mode.isMobile() || app.map._docLayer._docType === 'spreadsheet') {
                if (this.sectionProperties.commentList.length > 0)
                    this.orderCommentList();
                return; // No adjustments for Calc, since only one comment can be shown at a time and that comment is shown at its belonging cell.
            }
            if (this.sectionProperties.commentList.length > 0) {
                this.orderCommentList();
                if (relayout)
                    this.resetCommentsSize();
                var isRTL = document.documentElement.dir === 'rtl';
                var topRight = [this.myTopLeft[0], this.myTopLeft[1] + this.sectionProperties.marginY - this.documentTopLeft[1]];
                var yOrigin = null;
                var selectedIndex = null;
                var x = isRTL ? 0 : topRight[0];
                var availableSpace = this.calculateAvailableSpace();
                if (availableSpace > this.sectionProperties.commentWidth) {
                    if (isRTL)
                        x = Math.round((this.containerObject.getDocumentAnchorSection().size[0] - app.file.size.pX) * 0.5) - this.containerObject.getDocumentAnchorSection().size[0];
                    else
                        x = topRight[0] - Math.round((this.containerObject.getDocumentAnchorSection().size[0] - app.file.size.pX) * 0.5);
                }
                else if (isRTL)
                    x = -this.containerObject.getDocumentAnchorSection().size[0];
                else
                    x -= this.sectionProperties.collapsedMarginToTheEdge;
                if (this.sectionProperties.selectedComment) {
                    selectedIndex = this.getRootIndexOf(this.sectionProperties.selectedComment.sectionProperties.data.id);
                    this.sectionProperties.commentList[selectedIndex].sectionProperties.data.anchorPix = this.numberArrayToCorePixFromTwips(this.sectionProperties.commentList[selectedIndex].sectionProperties.data.anchorPos, 0, 2);
                    this.sectionProperties.commentList[selectedIndex].sectionProperties.data.anchorPix[1];
                    yOrigin = this.sectionProperties.commentList[selectedIndex].sectionProperties.data.anchorPix[1] - this.documentTopLeft[1];
                    var tempCrd = this.sectionProperties.commentList[selectedIndex].sectionProperties.data.anchorPix;
                    var resolved = this.sectionProperties.commentList[selectedIndex].sectionProperties.data.resolved;
                    if (!resolved || resolved === 'false' || this.sectionProperties.showResolved) {
                        var posX = isRTL ? (this.containerObject.getDocumentAnchorSection().size[0] + x + 15) : x;
                        this.showArrow([tempCrd[0], tempCrd[1]], [posX, tempCrd[1]]);
                    }
                }
                else
                    this.hideArrow();
                var lastY = 0;
                if (selectedIndex) {
                    this.loopUp(selectedIndex - 1, x, yOrigin, relayout);
                    lastY = this.loopDown(selectedIndex, x, yOrigin, relayout);
                }
                else {
                    lastY = this.loopDown(0, x, topRight[1], relayout);
                }
            }
            if (relayout)
                this.resizeComments();
            lastY += this.containerObject.getDocumentTopLeft()[1];
            if (lastY > app.file.size.pY) {
                app.view.size.pY = lastY;
                this.containerObject.requestReDraw();
            }
            else
                app.view.size.pY = app.file.size.pY;
            this.disableLayoutAnimation = false;
        };
        CommentSection.prototype.update = function (reLayout) {
            if (reLayout === void 0) { reLayout = true; }
            this.sectionProperties.pendingUpdate = true;
            this.sectionProperties.reLayout = reLayout;
            this.containerObject.requestReDraw();
        };
        CommentSection.prototype.onUpdateDOM = function () {
            if (!this.sectionProperties.pendingUpdate)
                return;
            if (this.sectionProperties.reLayout && app.map._docLayer._docType === 'text')
                this.updateThreadInfoIndicator();
            this.layout(this.sectionProperties.reLayout);
            this.sectionProperties.pendingUpdate = false;
            this.sectionProperties.reLayout = true;
        };
        CommentSection.prototype.updateThreadInfoIndicator = function () {
            for (var i = 0; i < this.sectionProperties.commentList.length; i++) {
                var comment = this.sectionProperties.commentList[i];
                var replyCount = 0;
                var anyEdit = false;
                if (comment && comment.isRootComment()) {
                    var lastIndex = this.getLastChildIndexOf(comment.sectionProperties.data.id);
                    var j = i;
                    while (this.sectionProperties.commentList[j] && j <= lastIndex) {
                        anyEdit = this.sectionProperties.commentList[j].isEdit() || anyEdit;
                        if (this.sectionProperties.commentList[j].sectionProperties.data.parent !== '0') {
                            if ((this.sectionProperties.commentList[j].sectionProperties.data.layoutStatus !== cool.CommentLayoutStatus.DELETED ||
                                this.map['stateChangeHandler'].getItemValue('.uno:ShowTrackedChanges') === 'true') &&
                                this.sectionProperties.commentList[j].sectionProperties.data.resolved !== 'true') {
                                replyCount++;
                            }
                        }
                        j++;
                    }
                }
                if (anyEdit)
                    comment.updateThreadInfoIndicator('!');
                else
                    comment.updateThreadInfoIndicator(replyCount);
            }
        };
        CommentSection.prototype.updateChildLines = function () {
            for (var i = 0; i < this.sectionProperties.commentList.length; i++) {
                this.sectionProperties.commentList[i].updateChildLines();
            }
        };
        // Returns the root comment index of given id
        CommentSection.prototype.getRootIndexOf = function (id) {
            var index = this.getIndexOf(id);
            while (index >= 0) {
                if (this.sectionProperties.commentList[index].sectionProperties.data.parent !== '0')
                    index--;
                else
                    break;
            }
            return index;
        };
        // Returns the sub-root comment index of given id
        CommentSection.prototype.getSubRootIndexOf = function (id) {
            var index = this.getIndexOf(id);
            if (index !== -1) {
                var comment = this.sectionProperties.commentList[index];
                var parentId = comment.sectionProperties.data.parent;
                while (index >= 0) {
                    if (this.sectionProperties.commentList[index].sectionProperties.data.id !== parentId && this.sectionProperties.commentList[index].sectionProperties.data.parent !== '0')
                        index--;
                    else
                        break;
                }
            }
            return index;
        };
        CommentSection.prototype.setViewResolved = function (state) {
            this.sectionProperties.showResolved = state;
            for (var idx = 0; idx < this.sectionProperties.commentList.length; idx++) {
                if (this.sectionProperties.commentList[idx].sectionProperties.data.resolved === 'true') {
                    if (state == false) {
                        if (this.sectionProperties.selectedComment == this.sectionProperties.commentList[idx]) {
                            this.unselect();
                        }
                        this.sectionProperties.commentList[idx].hide();
                    }
                    else {
                        this.sectionProperties.commentList[idx].show();
                    }
                }
                this.sectionProperties.commentList[idx].update();
            }
            this.update();
        };
        CommentSection.prototype.setView = function (state) {
            this.sectionProperties.show = state;
            for (var idx = 0; idx < this.sectionProperties.commentList.length; idx++) {
                if (state == false)
                    this.sectionProperties.commentList[idx].hide();
                else
                    this.sectionProperties.commentList[idx].show();
            }
        };
        CommentSection.prototype.orderCommentList = function () {
            this.sectionProperties.commentList.sort(function (a, b) {
                return Math.abs(a.sectionProperties.data.anchorPos[1]) - Math.abs(b.sectionProperties.data.anchorPos[1]) ||
                    Math.abs(a.sectionProperties.data.anchorPos[0]) - Math.abs(b.sectionProperties.data.anchorPos[0]);
            });
            if (app.map._docLayer._docType === 'text')
                this.orderTextComments();
            // idIndexMap is now invalid, update it.
            this.updateIdIndexMap();
        };
        // reset theis size to default (100px text)
        CommentSection.prototype.resetCommentsSize = function () {
            if (app.map._docLayer._docType === 'text') {
                for (var i = 0; i < this.sectionProperties.commentList.length; i++) {
                    if (this.sectionProperties.commentList[i].sectionProperties.contentNode.style.display !== 'none') {
                        var maxHeight = (this.sectionProperties.commentList[i] === this.sectionProperties.selectedComment) ?
                            this.annotationMaxSize : this.annotationMinSize;
                        this.sectionProperties.commentList[i].sectionProperties.contentNode.style.maxHeight = maxHeight + 'px';
                    }
                }
            }
        };
        // grow comments size if they have more text, and there is enough space between other comments
        CommentSection.prototype.resizeComments = function () {
            // Change it true, if comments are allowed to grow up direction.
            // Now it is disabled, because without constant indicator of the comments anchor, it can be confusing.
            var growUp = false;
            if (app.map._docLayer._docType === 'text') {
                var minMaxHeight = Number(getComputedStyle(document.documentElement).getPropertyValue('--annotation-min-size'));
                var maxMaxHeight = Number(getComputedStyle(document.documentElement).getPropertyValue('--annotation-max-size'));
                for (var i = 0; i < this.sectionProperties.commentList.length; i++) {
                    // Only if ContentNode is displayed.
                    if (this.sectionProperties.commentList[i].sectionProperties.contentNode.style.display !== 'none'
                        && !this.sectionProperties.commentList[i].isEdit()) {
                        // act commentText height
                        var actHeight = this.sectionProperties.commentList[i].sectionProperties.contentText.getBoundingClientRect().height;
                        // if the comment is taller then minimal, we may want to make it taller
                        if (actHeight > minMaxHeight) {
                            // but we don't want to make it taller then the maximum
                            if (actHeight > maxMaxHeight) {
                                actHeight = maxMaxHeight;
                            }
                            if (i + 1 >= this.sectionProperties.commentList.length) {
                                // check if there is more space after this comment.
                                var maxSize = maxMaxHeight;
                                if (i + 1 < this.sectionProperties.commentList.length)
                                    // max size of text should be the space between comments - size of non text parts
                                    maxSize = this.sectionProperties.commentList[i + 1].getContainerPosY()
                                        - this.sectionProperties.commentList[i].getContainerPosY()
                                        - this.sectionProperties.commentList[i].sectionProperties.author.getBoundingClientRect().height
                                        - 3 * this.sectionProperties.marginY //top/bottom of comment window + space between comments
                                        - 2; // not sure why
                                if (maxSize > maxMaxHeight) {
                                    maxSize = maxMaxHeight;
                                }
                                else if (growUp && actHeight > maxSize) {
                                    // if more space needed as we have after the comment
                                    // check it there is any space before the comment
                                    var spaceBefore = this.sectionProperties.commentList[i].getContainerPosY();
                                    if (i > 0) {
                                        spaceBefore -= this.sectionProperties.commentList[i - 1].getContainerPosY()
                                            + this.sectionProperties.commentList[i - 1].getCommentHeight()
                                            + this.sectionProperties.marginY;
                                    }
                                    else {
                                        spaceBefore += this.documentTopLeft[1];
                                    }
                                    // if there is more space
                                    if (spaceBefore > 0) {
                                        var moveUp = 0;
                                        if (actHeight - maxSize < spaceBefore) {
                                            // there is enough space, move up as much as we can;
                                            moveUp = actHeight - maxSize;
                                        }
                                        else {
                                            // there is not enough space
                                            moveUp = spaceBefore;
                                        }
                                        // move up
                                        var posX = this.sectionProperties.commentList[i].getContainerPosX();
                                        var posY = this.sectionProperties.commentList[i].getContainerPosY() - moveUp;
                                        this.sectionProperties.commentList[i].sectionProperties.container.style.left = Math.round(posX) + 'px';
                                        this.sectionProperties.commentList[i].sectionProperties.container.style.top = Math.round(posY) + 'px';
                                        // increase comment height
                                        maxSize += moveUp;
                                    }
                                }
                                if (maxSize > minMaxHeight)
                                    this.sectionProperties.commentList[i].sectionProperties.contentNode.style.maxHeight = Math.round(maxSize) + 'px';
                            }
                        }
                    }
                }
                this.updateChildLines();
            }
        };
        CommentSection.prototype.updateIdIndexMap = function () {
            this.idIndexMap.clear();
            var commentList = this.sectionProperties.commentList;
            for (var idx = 0; idx < commentList.length; idx++) {
                var comment = commentList[idx];
                console.assert(comment.sectionProperties && comment.sectionProperties.data, 'no sectionProperties.data!');
                this.idIndexMap.set(comment.sectionProperties.data.id, idx);
            }
        };
        CommentSection.prototype.turnIntoAList = function (commentList) {
            var newArray;
            if (!Array.isArray(commentList)) {
                newArray = new Array(0);
                for (var prop in commentList) {
                    if (Object.prototype.hasOwnProperty.call(commentList, prop)) {
                        newArray.push(commentList[prop]);
                    }
                }
            }
            else {
                newArray = commentList;
            }
            return newArray;
        };
        CommentSection.prototype.addUpdateChildGroups = function () {
            var parentCommentList = [];
            for (var i = 0; i < this.sectionProperties.commentList.length; i++) {
                var comment = this.sectionProperties.commentList[i];
                comment.sectionProperties.children = [];
                if (comment.sectionProperties.data.parent !== '0') {
                    if (!parentCommentList.includes(comment.sectionProperties.data.parent))
                        parentCommentList.push(comment.sectionProperties.data.parent);
                }
            }
            for (var i = 0; i < parentCommentList.length; i++) {
                var parentComment;
                for (var j = 0; j < this.sectionProperties.commentList.length; j++) {
                    if (this.sectionProperties.commentList[j].sectionProperties.data.id === parentCommentList[i]) {
                        parentComment = this.sectionProperties.commentList[j];
                        break;
                    }
                }
                if (parentComment) {
                    for (var j = 0; j < this.sectionProperties.commentList.length; j++) {
                        if (this.sectionProperties.commentList[j].sectionProperties.data.parent === parentCommentList[i])
                            parentComment.sectionProperties.children.push(this.sectionProperties.commentList[j]);
                    }
                }
                else
                    console.warn('Couldn\'t find parent comment.');
            }
        };
        CommentSection.prototype.addChildrenCommentsToList = function (comment, newOrder) {
            comment.sectionProperties.children.forEach(function (element) {
                newOrder.push(element);
                if (element.sectionProperties.children.length > 0)
                    this.addChildrenCommentsToList(element, newOrder);
            }.bind(this));
        };
        CommentSection.prototype.orderTextComments = function () {
            var newOrder = [];
            for (var i = 0; i < this.sectionProperties.commentList.length; i++) {
                var comment = this.sectionProperties.commentList[i];
                if (comment.isRootComment()) {
                    newOrder.push(comment);
                    if (comment.sectionProperties.children.length > 0)
                        this.addChildrenCommentsToList(comment, newOrder);
                }
            }
            this.sectionProperties.commentList = newOrder;
        };
        CommentSection.prototype.importComments = function (commentList) {
            this.disableLayoutAnimation = true;
            var comment;
            if (cool.Comment.isAnyEdit()) {
                CommentSection.pendingImport = true;
                return;
            }
            CommentSection.importingComments = true;
            this.clearList();
            commentList = this.turnIntoAList(commentList);
            if (commentList.length > 0) {
                for (var i = 0; i < commentList.length; i++) {
                    comment = commentList[i];
                    this.adjustComment(comment);
                    if (comment.author in this.map._viewInfoByUserName) {
                        comment.avatar = this.map._viewInfoByUserName[comment.author].userextrainfo.avatar;
                    }
                    var commentSection = new cool.Comment(comment, {}, this);
                    if (!this.containerObject.addSection(commentSection))
                        continue;
                    this.sectionProperties.commentList.push(commentSection);
                    this.idIndexMap.set(commentSection.sectionProperties.data.id, i);
                }
                if (app.map._docLayer._docType === 'text')
                    this.addUpdateChildGroups();
                this.orderCommentList();
                this.checkSize();
                this.update();
            }
            var show = this.map.stateChangeHandler.getItemValue('showannotations');
            this.setView(show === true || show === 'true');
            var showResolved = this.map.stateChangeHandler.getItemValue('ShowResolvedAnnotations');
            this.setViewResolved(showResolved === true || showResolved === 'true');
            if (app.map._docLayer._docType === 'spreadsheet')
                this.hideAllComments(); // Apply drawing orders.
            if ((app.map._docLayer._docType === 'presentation' || app.map._docLayer._docType === 'drawing'))
                this.showHideComments();
            this.sectionProperties.reLayout = true;
            this.onUpdateDOM();
            CommentSection.importingComments = false;
        };
        // Accepts redlines/changes comments.
        CommentSection.prototype.importChanges = function (changesList) {
            var changeComment;
            this.clearChanges();
            changesList = this.turnIntoAList(changesList);
            if (changesList.length > 0) {
                for (var i = 0; i < changesList.length; i++) {
                    changeComment = changesList[i];
                    if (!this.adjustRedLine(changeComment))
                        // something wrong in this redline, skip this one
                        continue;
                    if (changeComment.author in this.map._viewInfoByUserName) {
                        changeComment.avatar = this.map._viewInfoByUserName[changeComment.author].userextrainfo.avatar;
                    }
                    var commentSection = new cool.Comment(changeComment, {}, this);
                    if (!this.containerObject.addSection(commentSection))
                        continue;
                    this.sectionProperties.commentList.push(commentSection);
                }
                this.orderCommentList();
                this.checkSize();
                this.update();
            }
            if (app.map._docLayer._docType === 'spreadsheet')
                this.hideAllComments(); // Apply drawing orders.
        };
        // Remove redline comments.
        CommentSection.prototype.clearChanges = function () {
            this.containerObject.pauseDrawing();
            for (var i = this.sectionProperties.commentList.length - 1; i > -1; i--) {
                if (this.sectionProperties.commentList[i].sectionProperties.data.trackchange) {
                    this.containerObject.removeSection(this.sectionProperties.commentList[i].name);
                    this.sectionProperties.commentList.splice(i, 1);
                }
            }
            this.updateIdIndexMap();
            this.containerObject.resumeDrawing();
            this.sectionProperties.selectedComment = null;
            this.checkSize();
        };
        CommentSection.prototype.clearAutoSaveStatus = function () {
            CommentSection.autoSavedComment = null;
            CommentSection.commentWasAutoAdded = false;
        };
        // Remove only text comments from the document (excluding change tracking comments)
        CommentSection.prototype.clearList = function () {
            this.containerObject.pauseDrawing();
            for (var i = this.sectionProperties.commentList.length - 1; i > -1; i--) {
                if (!this.sectionProperties.commentList[i].sectionProperties.data.trackchange) {
                    this.containerObject.removeSection(this.sectionProperties.commentList[i].name);
                    this.sectionProperties.commentList.splice(i, 1);
                }
            }
            this.updateIdIndexMap();
            this.containerObject.resumeDrawing();
            this.sectionProperties.selectedComment = null;
            this.checkSize();
            this.clearAutoSaveStatus();
        };
        CommentSection.prototype.onCommentsDataUpdate = function () {
            for (var i = this.sectionProperties.commentList.length - 1; i > -1; i--) {
                var comment = this.sectionProperties.commentList[i];
                if (!comment.valid && comment.sectionProperties.data.id !== 'new') {
                    comment.sectionProperties.commentListSection.removeItem(comment.sectionProperties.data.id);
                }
                comment.onCommentDataUpdate();
            }
        };
        CommentSection.prototype.rejectAllTrackedCommentChanges = function () {
            for (var i = 0; i < this.sectionProperties.commentList.length; i++) {
                var comment = this.sectionProperties.commentList[i];
                if (comment.sectionProperties.data.layoutStatus === cool.CommentLayoutStatus.DELETED) {
                    comment.sectionProperties.data.layoutStatus = cool.CommentLayoutStatus.VISIBLE;
                    comment.sectionProperties.container.classList.remove('tracked-deleted-comment-show');
                }
            }
        };
        CommentSection.prototype.hasAnyComments = function () {
            return this.sectionProperties.commentList.length > 0;
        };
        CommentSection.commentWasAutoAdded = false;
        CommentSection.pendingImport = false;
        CommentSection.importingComments = false; // active during comments insertion, disable scroll
        return CommentSection;
    }(CanvasSectionObject));
    cool.CommentSection = CommentSection;
})(cool || (cool = {}));
app.definitions.CommentSection = cool.CommentSection;
//# sourceMappingURL=CommentListSection.js.map