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
// By default DOMPurify will strip all targets, so set everything
// as target=_blank with rel=noopener
DOMPurify.addHook('afterSanitizeAttributes', function (node) {
    if (node.tagName === 'A') {
        node.setAttribute('target', '_blank');
        node.setAttribute('rel', 'noopener');
    }
});
var cool;
(function (cool) {
    /*
        data.layoutStatus: Enumartion sent from the core side.
        0: INVISIBLE, 1: VISIBLE, 2: INSERTED, 3: DELETED, 4: NONE, 5: HIDDEN
        Ex: "DELETED" means that the comment is deleted while the "track changes" is on.
    */
    var CommentLayoutStatus;
    (function (CommentLayoutStatus) {
        CommentLayoutStatus[CommentLayoutStatus["INVISIBLE"] = 0] = "INVISIBLE";
        CommentLayoutStatus[CommentLayoutStatus["VISIBLE"] = 1] = "VISIBLE";
        CommentLayoutStatus[CommentLayoutStatus["INSERTED"] = 2] = "INSERTED";
        CommentLayoutStatus[CommentLayoutStatus["DELETED"] = 3] = "DELETED";
        CommentLayoutStatus[CommentLayoutStatus["NONE"] = 4] = "NONE";
        CommentLayoutStatus[CommentLayoutStatus["HIDDEN"] = 5] = "HIDDEN";
    })(CommentLayoutStatus = cool.CommentLayoutStatus || (cool.CommentLayoutStatus = {}));
    var Comment = /** @class */ (function (_super) {
        __extends(Comment, _super);
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        function Comment(data, options, commentListSectionPointer) {
            var _this = _super.call(this) || this;
            _this.name = L.CSections.Comment.name;
            _this.processingOrder = L.CSections.Comment.processingOrder;
            _this.drawingOrder = L.CSections.Comment.drawingOrder;
            _this.zIndex = L.CSections.Comment.zIndex;
            _this.valid = true;
            _this.pendingInit = true;
            _this.cachedCommentHeight = null;
            _this.cachedIsEdit = false;
            _this.hidden = null;
            _this.myTopLeft = [0, 0];
            _this.documentObject = true;
            _this.map = L.Map.THIS;
            if (!options)
                options = {};
            _this.sectionProperties.commentListSection = commentListSectionPointer;
            _this.sectionProperties.docLayer = _this.map._docLayer;
            _this.sectionProperties.selectedAreaPoint = null;
            _this.sectionProperties.cellCursorPoint = null;
            _this.sectionProperties.draggingStarted = false;
            _this.sectionProperties.dragStartPosition = null;
            _this.sectionProperties.minWidth = options.minWidth ? options.minWidth : 160;
            _this.sectionProperties.maxHeight = options.maxHeight ? options.maxHeight : 50;
            _this.sectionProperties.imgSize = options.imgSize ? options.imgSize : [32, 32];
            _this.sectionProperties.margin = options.margin ? options.margin : [40, 40];
            _this.sectionProperties.noMenu = options.noMenu ? options.noMenu : false;
            if (data.parent === undefined)
                data.parent = '0';
            _this.sectionProperties.data = data;
            /*
                possibleParentCommentId:
                    * User deletes a parent comment.
                    * User deletes also its child comment.
                    * User reverts the last change (deletion of child comment).
                    * A comment "Add" action is sent from the core side.
                    * The child comment has also its parent id.
                    * But there is no such parent at the moment.
                    * So we will remember its possible parent comment in case user also reverts the deletion of parent comment.
                    * In that case, parent comment will come with its old id.
                    * Child comment can now find its parent.
                    * We will check child comment to see if its parent has also been revived.
            */
            _this.sectionProperties.possibleParentCommentId = null;
            _this.sectionProperties.wrapper = null;
            _this.sectionProperties.container = null;
            _this.sectionProperties.author = null;
            _this.sectionProperties.resolvedTextElement = null;
            _this.sectionProperties.authorAvatarImg = null;
            _this.sectionProperties.authorAvatartdImg = null;
            _this.sectionProperties.contentAuthor = null;
            _this.sectionProperties.contentDate = null;
            _this.sectionProperties.acceptButton = null;
            _this.sectionProperties.rejectButton = null;
            _this.sectionProperties.menu = null;
            _this.sectionProperties.captionNode = null;
            _this.sectionProperties.captionText = null;
            _this.sectionProperties.contentNode = null;
            _this.sectionProperties.nodeModify = null;
            _this.sectionProperties.nodeModifyText = null;
            _this.sectionProperties.contentText = null;
            _this.sectionProperties.nodeReply = null;
            _this.sectionProperties.nodeReplyText = null;
            _this.sectionProperties.contextMenu = false;
            _this.sectionProperties.highlightedTextColor = '#777777'; // Writer.
            _this.sectionProperties.usedTextColor = _this.sectionProperties.data.color; // Writer.
            _this.sectionProperties.showSelectedCoordinate = true; // Writer.
            if (app.map._docLayer._docType === 'presentation' || app.map._docLayer._docType === 'drawing') {
                _this.sectionProperties.parthash = parseInt(_this.sectionProperties.data.parthash);
                _this.sectionProperties.partIndex = app.impress.getIndexFromSlideHash(_this.sectionProperties.parthash);
            }
            _this.sectionProperties.isHighlighted = false;
            _this.name = data.id === 'new' ? 'new comment' : 'comment ' + data.id;
            _this.sectionProperties.commentContainerRemoved = false;
            _this.sectionProperties.children = []; // This is used for Writer comments. There is parent / child relationship between comments in Writer files.
            _this.sectionProperties.childLinesNode = null;
            _this.sectionProperties.childLines = [];
            _this.sectionProperties.childCommentOffset = 8;
            _this.sectionProperties.commentMarkerSubSection = null; // For Impress and Draw documents.
            _this.convertRectanglesToCoreCoordinates(); // Convert rectangle coordiantes into core pixels on initialization.
            app.map.on('sheetgeometrychanged', _this.setPositionAndSize.bind(_this));
            return _this;
        }
        // Comments import can be costly if the document has a lot of them. If they are all imported/initialized
        // when online gets comments message from core, the initial doc render is delayed. To avoid that we do
        // lazy import of each comment when it needs to be shown (based on its coordinates).
        Comment.prototype.doPendingInitializationInView = function (force) {
            if (force === void 0) { force = false; }
            if (!this.pendingInit)
                return;
            if (!force && !this.convertRectanglesToViewCoordinates())
                return;
            var button = L.DomUtil.create('div', 'annotation-btns-container', this.sectionProperties.nodeModify);
            L.DomEvent.on(this.sectionProperties.nodeModifyText, 'input', this.textAreaInput, this);
            L.DomEvent.on(this.sectionProperties.nodeReplyText, 'input', this.textAreaInput, this);
            L.DomEvent.on(this.sectionProperties.nodeModifyText, 'keydown', this.textAreaKeyDown, this);
            L.DomEvent.on(this.sectionProperties.nodeReplyText, 'keydown', this.textAreaKeyDown, this);
            this.createButton(button, 'annotation-cancel-' + this.sectionProperties.data.id, 'annotation-button button-secondary', _('Cancel'), this.handleCancelCommentButton);
            this.createButton(button, 'annotation-save-' + this.sectionProperties.data.id, 'annotation-button button-primary', _('Save'), this.handleSaveCommentButton);
            button = L.DomUtil.create('div', '', this.sectionProperties.nodeReply);
            this.createButton(button, 'annotation-cancel-reply-' + this.sectionProperties.data.id, 'annotation-button button-secondary', _('Cancel'), this.handleCancelCommentButton);
            this.createButton(button, 'annotation-reply-' + this.sectionProperties.data.id, 'annotation-button button-primary', _('Reply'), this.handleReplyCommentButton);
            L.DomEvent.disableScrollPropagation(this.sectionProperties.container);
            // Since this is a late called function, if the width is enough, we shouldn't collapse the comments.
            if (app.map._docLayer._docType !== 'text' || this.sectionProperties.commentListSection.isCollapsed === true)
                this.sectionProperties.container.style.visibility = 'hidden';
            this.sectionProperties.nodeModify.style.display = 'none';
            this.sectionProperties.nodeReply.style.display = 'none';
            var events = ['click', 'dblclick', 'mousedown', 'mouseup', 'mouseover', 'mouseout', 'keydown', 'keypress', 'keyup', 'touchstart', 'touchmove', 'touchend'];
            L.DomEvent.on(this.sectionProperties.container, 'click', this.onMouseClick, this);
            L.DomEvent.on(this.sectionProperties.container, 'keydown', this.onEscKey, this);
            this.sectionProperties.container.onwheel = function (e) {
                // Don't scroll the document if mouse is over comment content. Scrolling the comment content is priority.
                if (!this.sectionProperties.contentNode.matches(':hover')) {
                    e.preventDefault();
                    app.sectionContainer.onMouseWheel(e);
                }
            }.bind(this);
            for (var it = 0; it < events.length; it++) {
                L.DomEvent.on(this.sectionProperties.container, events[it], L.DomEvent.stopPropagation, this);
            }
            L.DomEvent.on(this.sectionProperties.container, 'touchstart', function (e) {
                if (e && e.touches.length > 1) {
                    L.DomEvent.preventDefault(e);
                }
            }, this);
            this.update();
            this.pendingInit = false;
        };
        Comment.prototype.onInitialize = function () {
            this.createContainerAndWrapper();
            this.createAuthorTable();
            if (this.sectionProperties.data.trackchange && !this.map.isReadOnlyMode()) {
                this.createTrackChangeButtons();
            }
            if (this.sectionProperties.noMenu !== true && app.isCommentEditingAllowed()) {
                this.createMenu();
            }
            if (this.sectionProperties.data.trackchange) {
                this.sectionProperties.captionNode = L.DomUtil.create('div', 'cool-annotation-caption', this.sectionProperties.wrapper);
                this.sectionProperties.captionText = L.DomUtil.create('div', '', this.sectionProperties.captionNode);
            }
            this.sectionProperties.contentNode = L.DomUtil.create('div', 'cool-annotation-content cool-dont-break', this.sectionProperties.wrapper);
            this.sectionProperties.contentNode.id = 'annotation-content-area-' + this.sectionProperties.data.id;
            this.sectionProperties.nodeModify = L.DomUtil.create('div', 'cool-annotation-edit' + ' modify-annotation', this.sectionProperties.wrapper);
            this.sectionProperties.nodeModifyText = L.DomUtil.create('div', 'cool-annotation-textarea', this.sectionProperties.nodeModify);
            this.sectionProperties.nodeModifyText.setAttribute('contenteditable', 'true');
            this.sectionProperties.nodeModifyText.setAttribute('role', 'textbox');
            this.sectionProperties.nodeModifyText.setAttribute('aria-label', _('Edit comment'));
            this.sectionProperties.nodeModifyText.id = 'annotation-modify-textarea-' + this.sectionProperties.data.id;
            this.sectionProperties.contentText = L.DomUtil.create('div', '', this.sectionProperties.contentNode);
            this.sectionProperties.nodeReply = L.DomUtil.create('div', 'cool-annotation-edit' + ' reply-annotation', this.sectionProperties.wrapper);
            this.sectionProperties.nodeReplyText = L.DomUtil.create('div', 'cool-annotation-textarea', this.sectionProperties.nodeReply);
            this.sectionProperties.nodeReplyText.setAttribute('contenteditable', 'true');
            this.sectionProperties.nodeReplyText.setAttribute('role', 'textbox');
            this.sectionProperties.nodeReplyText.setAttribute('aria-label', _('Reply comment'));
            this.sectionProperties.nodeReplyText.id = 'annotation-reply-textarea-' + this.sectionProperties.data.id;
            this.createChildLinesNode();
            this.sectionProperties.container.style.visibility = 'hidden';
            if (this.sectionProperties.commentMarkerSubSection === null && app.map._docLayer._docType === 'presentation' || app.map._docLayer._docType === 'drawing')
                this.createMarkerSubSection();
            this.doPendingInitializationInView();
        };
        Comment.prototype.createContainerAndWrapper = function () {
            var isRTL = document.documentElement.dir === 'rtl';
            this.sectionProperties.container = L.DomUtil.create('div', 'cool-annotation' + (isRTL ? ' rtl' : ''));
            this.sectionProperties.container.id = 'comment-container-' + this.sectionProperties.data.id;
            L.DomEvent.on(this.sectionProperties.container, 'focusout', this.onLostFocus, this);
            var mobileClass = window.mode.isMobile() ? ' wizard-comment-box' : '';
            if (this.sectionProperties.data.trackchange) {
                this.sectionProperties.wrapper = L.DomUtil.create('div', 'cool-annotation-redline-content-wrapper' + mobileClass, this.sectionProperties.container);
            }
            else {
                this.sectionProperties.wrapper = L.DomUtil.create('div', 'cool-annotation-content-wrapper' + mobileClass, this.sectionProperties.container);
            }
            this.sectionProperties.wrapper.style.marginLeft = this.sectionProperties.childCommentOffset * this.getChildLevel() + 'px';
            if (!window.mode.isMobile())
                document.getElementById('document-container').appendChild(this.sectionProperties.container);
            // We make comment directly visible when its transitioned to its determined position
            if (cool.CommentSection.autoSavedComment)
                this.sectionProperties.container.style.visibility = 'hidden';
        };
        Comment.prototype.createAuthorTable = function () {
            this.sectionProperties.author = L.DomUtil.create('table', 'cool-annotation-table', this.sectionProperties.wrapper);
            var tbody = L.DomUtil.create('tbody', '', this.sectionProperties.author);
            var rowResolved = L.DomUtil.create('tr', '', tbody);
            var tdResolved = L.DomUtil.create('td', 'cool-annotation-resolved', rowResolved);
            var pResolved = L.DomUtil.create('div', 'cool-annotation-content-resolved', tdResolved);
            this.sectionProperties.resolvedTextElement = pResolved;
            this.updateResolvedField(this.sectionProperties.data.resolved);
            var tr = L.DomUtil.create('tr', '', tbody);
            this.sectionProperties.authorRow = tr;
            tr.id = 'author table row ' + this.sectionProperties.data.id;
            var tdImg = L.DomUtil.create('td', 'cool-annotation-img', tr);
            var tdAuthor = L.DomUtil.create('td', 'cool-annotation-author', tr);
            var imgAuthor = L.DomUtil.create('img', 'avatar-img', tdImg);
            imgAuthor.setAttribute('alt', this.sectionProperties.data.author);
            var viewId = this.map.getViewId(this.sectionProperties.data.author);
            app.LOUtil.setUserImage(imgAuthor, this.map, viewId);
            imgAuthor.setAttribute('width', this.sectionProperties.imgSize[0]);
            imgAuthor.setAttribute('height', this.sectionProperties.imgSize[1]);
            if (app.map._docLayer._docType !== 'spreadsheet') {
                this.sectionProperties.collapsedInfoNode = L.DomUtil.create('div', 'cool-annotation-info-collapsed', tdImg);
                this.sectionProperties.collapsedInfoNode.style.display = 'none';
            }
            this.sectionProperties.authorAvatarImg = imgAuthor;
            this.sectionProperties.authorAvatartdImg = tdImg;
            this.sectionProperties.contentAuthor = L.DomUtil.create('div', 'cool-annotation-content-author', tdAuthor);
            this.sectionProperties.contentDate = L.DomUtil.create('div', 'cool-annotation-date', tdAuthor);
            this.sectionProperties.autoSave = L.DomUtil.create('div', 'cool-annotation-autosavelabel', tdAuthor);
        };
        Comment.prototype.createMenu = function () {
            var tdMenu = L.DomUtil.create('td', 'cool-annotation-menubar', this.sectionProperties.authorRow);
            this.sectionProperties.menu = L.DomUtil.create('div', this.sectionProperties.data.trackchange ? 'cool-annotation-menu-redline' : 'cool-annotation-menu', tdMenu);
            this.sectionProperties.menu.id = 'comment-annotation-menu-' + this.sectionProperties.data.id;
            this.sectionProperties.menu.tabIndex = 0;
            this.sectionProperties.menu.onclick = this.menuOnMouseClick.bind(this);
            this.sectionProperties.menu.onkeypress = this.menuOnKeyPress.bind(this);
            var divMenuTooltipText = _('Open menu');
            this.sectionProperties.menu.dataset.title = divMenuTooltipText;
            this.sectionProperties.menu.setAttribute('aria-label', divMenuTooltipText);
            this.sectionProperties.menu.annotation = this;
        };
        Comment.prototype.createChildLinesNode = function () {
            this.sectionProperties.childLinesNode = L.DomUtil.create('div', '', this.sectionProperties.container);
            this.sectionProperties.childLinesNode.id = 'annotation-child-lines-' + this.sectionProperties.data.id;
            this.sectionProperties.childLinesNode.style.width = this.sectionProperties.childCommentOffset * (this.getChildLevel() + 1) + 'px';
        };
        Comment.prototype.getContainerPosX = function () {
            return parseInt(this.sectionProperties.container.style.left.replace('px', ''));
        };
        Comment.prototype.getContainerPosY = function () {
            return parseInt(this.sectionProperties.container.style.top.replace('px', ''));
        };
        Comment.prototype.updateChildLines = function () {
            if (!this.isContainerVisible())
                return;
            this.sectionProperties.wrapper.style.marginLeft = this.sectionProperties.childCommentOffset * this.getChildLevel() + 'px';
            this.sectionProperties.childLinesNode.style.width = this.sectionProperties.childCommentOffset * (this.getChildLevel() + 1) + 'px';
            var childPositions = [];
            for (var i_1 = 0; i_1 < this.sectionProperties.children.length; i_1++) {
                if (this.sectionProperties.children[i_1].isContainerVisible())
                    childPositions.push({ id: this.sectionProperties.children[i_1].sectionProperties.data.id,
                        posY: this.getContainerPosY() });
            }
            childPositions.sort(function (a, b) { return a.posY - b.posY; });
            var lastPosY = this.getContainerPosY() + this.getCommentHeight(false);
            var i = 0;
            for (; i < childPositions.length; i++) {
                if (this.sectionProperties.childLines[i] === undefined) {
                    this.sectionProperties.childLines[i] = L.DomUtil.create('div', 'cool-annotation-child-line', this.sectionProperties.childLinesNode);
                    this.sectionProperties.childLines[i].id = 'annotation-child-line-' + this.sectionProperties.data.id + '-' + i;
                    this.sectionProperties.childLines[i].style.width = this.sectionProperties.childCommentOffset / 2 + 'px';
                }
                this.sectionProperties.childLines[i].style.marginLeft = (this.sectionProperties.childCommentOffset * this.getChildLevel() + 4) + 'px';
                this.sectionProperties.childLines[i].style.height = (childPositions[i].posY + 24 - lastPosY) + 'px';
                lastPosY = childPositions[i].posY + 24;
            }
            if (i < this.sectionProperties.childLines.length) {
                for (var j = i; j < this.sectionProperties.childLines.length; j++) {
                    this.sectionProperties.childLinesNode.removeChild(this.sectionProperties.childLines[i]);
                    this.sectionProperties.childLines.splice(i);
                }
            }
        };
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        Comment.prototype.setData = function (data) {
            this.sectionProperties.data = data;
        };
        Comment.prototype.createTrackChangeButtons = function () {
            var tdAccept = L.DomUtil.create('td', 'cool-annotation-menubar', this.sectionProperties.authorRow);
            var acceptButton = this.sectionProperties.acceptButton = L.DomUtil.create('button', 'cool-redline-accept-button', tdAccept);
            var tdReject = L.DomUtil.create('td', 'cool-annotation-menubar', this.sectionProperties.authorRow);
            var rejectButton = this.sectionProperties.rejectButton = L.DomUtil.create('button', 'cool-redline-reject-button', tdReject);
            acceptButton.dataset.title = _('Accept change');
            acceptButton.setAttribute('aria-label', _('Accept change'));
            L.DomEvent.on(acceptButton, 'click', function () {
                this.map.fire('RedlineAccept', { id: this.sectionProperties.data.id });
            }, this);
            rejectButton.dataset.title = _('Reject change');
            rejectButton.setAttribute('aria-label', _('Reject change'));
            L.DomEvent.on(rejectButton, 'click', function () {
                this.map.fire('RedlineReject', { id: this.sectionProperties.data.id });
            }, this);
        };
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        Comment.prototype.createButton = function (container, id, cssClass, value, handler) {
            var button = L.DomUtil.create('input', cssClass, container);
            button.id = id;
            button.type = 'button';
            button.value = value;
            L.DomEvent.on(button, 'mousedown', L.DomEvent.preventDefault);
            L.DomEvent.on(button, 'click', handler, this);
        };
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        Comment.prototype.parentOf = function (comment) {
            return this.sectionProperties.data.id === comment.sectionProperties.data.parent;
        };
        Comment.prototype.updateResolvedField = function (state) {
            this.sectionProperties.resolvedTextElement.innerText = state === 'true' ? _('Resolved') : '';
        };
        Comment.prototype.isNewPara = function () {
            var selection = window.getSelection();
            if (!selection.rangeCount)
                return;
            var range = selection.getRangeAt(0);
            var cursorPosition = range.startOffset;
            var node = range.startContainer;
            var beforeCursor = node.textContent.slice(0, cursorPosition);
            return /^\s*$/.test(beforeCursor.slice(0, -1));
        };
        Comment.prototype.textAreaInput = function (ev) {
            var _a;
            this.sectionProperties.autoSave.innerText = '';
            if (ev && app.map._docLayer._docType === 'text') {
                // special handling for mentions
                (_a = this.map) === null || _a === void 0 ? void 0 : _a.mention.handleMentionInput(ev, this.isNewPara());
            }
        };
        Comment.prototype.handleKeyDownForPopup = function (ev, id) {
            var popup = this.map._textInput._handleKeyDownForPopup(ev, id);
            // Block Esc from propogating if it closes the comment mention Popup
            if (popup && id === 'mentionPopup' && ev.key === 'Escape') {
                ev.preventDefault();
                ev.stopPropagation();
            }
        };
        Comment.prototype.textAreaKeyDown = function (ev) {
            var _a;
            if (ev && ev.ctrlKey && ev.key === "Enter") {
                (_a = this.map.mention) === null || _a === void 0 ? void 0 : _a.closeMentionPopup(false);
                if (this.sectionProperties.nodeReplyText.id == ev.srcElement.id) {
                    this.handleReplyCommentButton(ev);
                }
                else {
                    this.handleSaveCommentButton(ev);
                }
                return;
            }
            this.handleKeyDownForPopup(ev, 'mentionPopup');
        };
        Comment.prototype.sanitize = function (html) {
            if (DOMPurify.isSupported) {
                return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
            }
            return '';
        };
        Comment.prototype.updateContent = function () {
            if (this.sectionProperties.data.html)
                this.sectionProperties.contentText.innerHTML = this.sanitize(this.sectionProperties.data.html);
            else
                this.sectionProperties.contentText.innerText = this.sectionProperties.data.text ? this.sectionProperties.data.text : '';
            // Get the escaped HTML out and find for possible, useful links
            var linkedText = Autolinker.link(this.sectionProperties.contentText.outerHTML);
            this.sectionProperties.contentText.innerHTML = this.sanitize(linkedText);
            // Original unlinked text
            this.sectionProperties.contentText.origText = this.sectionProperties.data.text ? this.sectionProperties.data.text : '';
            this.sectionProperties.contentText.origHTML = this.sectionProperties.data.html ? this.sectionProperties.data.html : '';
            this.sectionProperties.nodeModifyText.innerText = this.sectionProperties.data.text ? this.sectionProperties.data.text : '';
            if (this.sectionProperties.data.html) {
                this.sectionProperties.nodeModifyText.innerHTML = this.sanitize(this.sectionProperties.data.html);
            }
            this.sectionProperties.contentAuthor.innerText = this.sectionProperties.data.author;
            this.updateResolvedField(this.sectionProperties.data.resolved);
            if (this.sectionProperties.data.avatar) {
                this.sectionProperties.authorAvatarImg.setAttribute('src', this.sectionProperties.data.avatar);
            }
            else {
                $(this.sectionProperties.authorAvatarImg).css('padding-top', '4px');
            }
            var user = this.map.getViewId(this.sectionProperties.data.author);
            if (user >= 0) {
                var color = app.LOUtil.rgbToHex(this.map.getViewColor(user));
                this.sectionProperties.authorAvatartdImg.style.borderColor = color;
            }
            // dateTime is already in UTC, so we will not append Z that will create issues while converting date
            var d = new Date(this.sectionProperties.data.dateTime.replace(/,.*/, ''));
            var dateOptions = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' };
            this.sectionProperties.contentDate.innerText = isNaN(d.getTime()) ? this.sectionProperties.data.dateTime : d.toLocaleDateString(String.locale, dateOptions);
            if (this.sectionProperties.data.trackchange) {
                this.sectionProperties.captionText.innerText = this.sectionProperties.data.description;
            }
        };
        Comment.prototype.updateLayout = function () {
            var style = this.sectionProperties.wrapper.style;
            style.width = '';
            style.whiteSpace = 'nowrap';
            style.whiteSpace = '';
        };
        Comment.prototype.setPositionAndSize = function () {
            var rectangles = this.sectionProperties.data.rectanglesOriginal;
            if (rectangles && app.map._docLayer._docType === 'text') {
                var xMin = Infinity, yMin = Infinity, xMax = 0, yMax = 0;
                for (var i = 0; i < rectangles.length; i++) {
                    if (rectangles[i][0] < xMin)
                        xMin = rectangles[i][0];
                    if (rectangles[i][1] < yMin)
                        yMin = rectangles[i][1];
                    if (rectangles[i][0] + rectangles[i][2] > xMax)
                        xMax = rectangles[i][0] + rectangles[i][2];
                    if (rectangles[i][1] + rectangles[i][3] > yMax)
                        yMax = rectangles[i][1] + rectangles[i][3];
                }
                // Rectangles are in twips. Convert them to core pixels.
                xMin = Math.round(xMin * app.twipsToPixels);
                yMin = Math.round(yMin * app.twipsToPixels);
                xMax = Math.round(xMax * app.twipsToPixels);
                yMax = Math.round(yMax * app.twipsToPixels);
                this.setPosition(xMin, yMin); // This function is added by section container.
                this.size = [xMax - xMin, yMax - yMin];
                if (this.size[0] < 5)
                    this.size[0] = 5;
            }
            else if (this.sectionProperties.data.cellRange && app.map._docLayer._docType === 'spreadsheet') {
                this.size = this.calcCellSize();
                var cellPos = app.map._docLayer._cellRangeToTwipRect(this.sectionProperties.data.cellRange).toRectangle();
                var startX = cellPos[0];
                if (this.isCalcRTL()) { // Mirroring is done in setPosition
                    var sizeX = cellPos[2];
                    startX += sizeX; // but adjust for width of the cell.
                }
                this.setShowSection(true);
                var position = [Math.round(cellPos[0] * app.twipsToPixels), Math.round(cellPos[1] * app.twipsToPixels)];
                this.setPosition(position[0], position[1]);
            }
            else if (app.map._docLayer._docType === 'presentation' || app.map._docLayer._docType === 'drawing') {
                this.size = [Math.round(this.sectionProperties.imgSize[0] * app.dpiScale), Math.round(this.sectionProperties.imgSize[1] * app.dpiScale)];
                this.setPosition(Math.round(this.sectionProperties.data.rectangle[0] * app.twipsToPixels), Math.round(this.sectionProperties.data.rectangle[1] * app.twipsToPixels));
            }
        };
        Comment.prototype.removeHighlight = function () {
            if (app.map._docLayer._docType === 'text') {
                this.sectionProperties.usedTextColor = this.sectionProperties.data.color;
                this.sectionProperties.isHighlighted = false;
            }
            else if (app.map._docLayer._docType === 'spreadsheet') {
                this.backgroundColor = null;
                this.backgroundOpacity = 1;
            }
        };
        Comment.prototype.highlight = function () {
            if (app.map._docLayer._docType === 'text') {
                this.sectionProperties.usedTextColor = this.sectionProperties.highlightedTextColor;
                var x = Math.round(this.position[0] / app.dpiScale);
                var y = Math.round(this.position[1] / app.dpiScale);
                this.containerObject.getSectionWithName(L.CSections.Scroll.name).onScrollTo({ x: x, y: y });
            }
            else if (app.map._docLayer._docType === 'spreadsheet') {
                this.backgroundColor = '#777777'; //background: rgba(119, 119, 119, 0.25);
                this.backgroundOpacity = 0.25;
                var x = Math.round(this.position[0] / app.dpiScale);
                var y = Math.round(this.position[1] / app.dpiScale);
                this.containerObject.getSectionWithName(L.CSections.Scroll.name).onScrollTo({ x: x, y: y });
            }
            else if (app.map._docLayer._docType === 'presentation' || app.map._docLayer._docType === 'drawing') {
                var x = Math.round(this.position[0] / app.dpiScale);
                var y = Math.round(this.position[1] / app.dpiScale);
                this.containerObject.getSectionWithName(L.CSections.Scroll.name).onScrollTo({ x: x, y: y });
            }
            this.containerObject.requestReDraw();
            this.sectionProperties.isHighlighted = true;
        };
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        Comment.doesRectIntersectView = function (pos, size, viewContext) {
            var paneBoundsList = viewContext.paneBoundsList;
            var endPos = [pos[0] + size[0], pos[1] + size[1]];
            for (var i = 0; i < paneBoundsList.length; ++i) {
                var paneBounds = paneBoundsList[i];
                var rectInvisible = (endPos[0] < paneBounds.min.x || endPos[1] < paneBounds.min.y ||
                    pos[0] > paneBounds.max.x || pos[1] > paneBounds.max.y);
                if (!rectInvisible)
                    return true;
            }
            return false;
        };
        /*
            This function doesn't take topleft positions of sections into account.
            This just returns bare pixel coordinates of the rectangles.
        */
        Comment.prototype.convertRectanglesToCoreCoordinates = function () {
            var pixelBasedOrgRectangles = new Array();
            var originals = this.sectionProperties.data.rectanglesOriginal;
            var pos, size;
            if (originals) {
                for (var i = 0; i < originals.length; i++) {
                    pos = [
                        Math.round(originals[i][0] * app.twipsToPixels),
                        Math.round(originals[i][1] * app.twipsToPixels)
                    ];
                    size = [
                        Math.round(originals[i][2] * app.twipsToPixels),
                        Math.round(originals[i][3] * app.twipsToPixels)
                    ];
                    pixelBasedOrgRectangles.push([pos[0], pos[1], size[0], size[1]]);
                }
                this.sectionProperties.pixelBasedOrgRectangles = pixelBasedOrgRectangles;
            }
        };
        // This is for svg elements that will be bound to document-container.
        // This also returns whether any rectangle has an intersection with the visible area/panes.
        // This function calculates the core pixel coordinates then converts them into view coordinates.
        Comment.prototype.convertRectanglesToViewCoordinates = function () {
            var rectangles = this.sectionProperties.data.rectangles;
            var originals = this.sectionProperties.data.rectanglesOriginal;
            var viewContext = this.map.getTileSectionMgr()._paintContext();
            var intersectsVisibleArea = false;
            var pos, size;
            if (rectangles) {
                var documentAnchorSection = this.containerObject.getDocumentAnchorSection();
                var diff = [documentAnchorSection.myTopLeft[0] - this.documentTopLeft[0], documentAnchorSection.myTopLeft[1] - this.documentTopLeft[1]];
                for (var i = 0; i < rectangles.length; i++) {
                    pos = [
                        Math.round(originals[i][0] * app.twipsToPixels),
                        Math.round(originals[i][1] * app.twipsToPixels)
                    ];
                    size = [
                        Math.round(originals[i][2] * app.twipsToPixels),
                        Math.round(originals[i][3] * app.twipsToPixels)
                    ];
                    if (!intersectsVisibleArea && Comment.doesRectIntersectView(pos, size, viewContext))
                        intersectsVisibleArea = true;
                    rectangles[i][0] = pos[0] + diff[0];
                    rectangles[i][1] = pos[1] + diff[1];
                    rectangles[i][2] = size[0];
                    rectangles[i][3] = size[1];
                }
            }
            else if (this.sectionProperties.data.trackchange && this.sectionProperties.data.anchorPos) {
                // For redline comments there are no 'rectangles' or 'rectangleOriginal' properties in sectionProperties.data
                // So use the comment rectangle stored in anchorPos (in display? twips).
                pos = this.getPosition();
                size = this.getSize();
                intersectsVisibleArea = Comment.doesRectIntersectView(pos, size, viewContext);
            }
            return intersectsVisibleArea;
        };
        Comment.prototype.getPosition = function () {
            // For redline comments there are no 'rectangles' or 'rectangleOriginal' properties in sectionProperties.data
            // So use the comment rectangle stored in anchorPos (in display? twips).
            if (this.sectionProperties.data.trackchange && this.sectionProperties.data.anchorPos) {
                var anchorPos = this.sectionProperties.data.anchorPos;
                return [
                    Math.round(anchorPos[0] * app.twipsToPixels),
                    Math.round(anchorPos[1] * app.twipsToPixels)
                ];
            }
            else {
                return this.position;
            }
        };
        Comment.prototype.getSize = function () {
            // For redline comments there are no 'rectangles' or 'rectangleOriginal' properties in sectionProperties.data
            // So use the comment rectangle stored in anchorPos (in display? twips).
            if (this.sectionProperties.data.trackchange && this.sectionProperties.data.anchorPos) {
                var anchorPos = this.sectionProperties.data.anchorPos;
                return [
                    Math.round(anchorPos[2] * app.twipsToPixels),
                    Math.round(anchorPos[3] * app.twipsToPixels)
                ];
            }
            else {
                return this.size;
            }
        };
        Comment.prototype.updatePosition = function () {
            this.convertRectanglesToViewCoordinates();
            this.convertRectanglesToCoreCoordinates();
            this.setPositionAndSize();
            if (app.map._docLayer._docType === 'spreadsheet')
                this.positionCalcComment();
            else if (app.map._docLayer._docType === "presentation" || app.map._docLayer._docType === "drawing") {
                if (this.sectionProperties.commentMarkerSubSection !== null) {
                    this.sectionProperties.commentMarkerSubSection.sectionProperties.data = this.sectionProperties.data;
                    this.sectionProperties.commentMarkerSubSection.setPosition(this.sectionProperties.data.anchorPos[0] * app.twipsToPixels, this.sectionProperties.data.anchorPos[1] * app.twipsToPixels);
                }
            }
        };
        Comment.prototype.createMarkerSubSection = function () {
            if (this.sectionProperties.data.rectangle === null)
                return;
            var showMarker = app.impress.partList[app.map._docLayer._selectedPart].hash === this.sectionProperties.data.parthash ||
                app.file.fileBasedView;
            this.sectionProperties.commentMarkerSubSection = new CommentMarkerSubSection(this.name + this.sectionProperties.data.id + String(Math.random()), // Section name - only as a placeholder.
            28, 28, // Width and height.
            new cool.SimplePoint(this.sectionProperties.data.anchorPos[0], this.sectionProperties.data.anchorPos[1]), // Document position.
            'annotation-marker', // Extra class.
            showMarker, // Show section.
            this, // Parent section.
            this.sectionProperties.data);
            app.sectionContainer.addSection(this.sectionProperties.commentMarkerSubSection);
        };
        Comment.prototype.isContainerVisible = function () {
            return this.sectionProperties.container.style &&
                this.sectionProperties.container.style.display !== 'none' &&
                (this.sectionProperties.container.style.visibility === 'visible' ||
                    this.sectionProperties.container.style.visibility === '');
        };
        Comment.prototype.update = function () {
            this.updateContent();
            this.updateLayout();
            this.updatePosition();
        };
        Comment.prototype.showMarker = function () {
            if (this.sectionProperties.commentMarkerSubSection != null) {
                this.sectionProperties.commentMarkerSubSection.showSection = true;
                this.sectionProperties.commentMarkerSubSection.onSectionShowStatusChange();
            }
        };
        Comment.prototype.hideMarker = function () {
            if (this.sectionProperties.commentMarkerSubSection != null) {
                this.sectionProperties.commentMarkerSubSection.showSection = false;
                this.sectionProperties.commentMarkerSubSection.onSectionShowStatusChange();
            }
        };
        Comment.prototype.showWriter = function () {
            if (!this.isCollapsed || this.isSelected()) {
                this.sectionProperties.container.style.visibility = '';
                this.sectionProperties.container.style.display = '';
            }
            if (this.sectionProperties.data.resolved !== 'true' || this.sectionProperties.commentListSection.sectionProperties.showResolved) {
                L.DomUtil.addClass(this.sectionProperties.container, 'cool-annotation-collapsed-show');
                this.sectionProperties.showSelectedCoordinate = true;
            }
            this.sectionProperties.contentNode.style.display = '';
            this.sectionProperties.nodeModify.style.display = 'none';
            this.sectionProperties.nodeReply.style.display = 'none';
            this.sectionProperties.collapsedInfoNode.style.visibility = '';
            this.cachedIsEdit = false;
        };
        Comment.prototype.showCalc = function () {
            this.sectionProperties.container.style.display = '';
            this.sectionProperties.contentNode.style.display = '';
            this.sectionProperties.nodeModify.style.display = 'none';
            this.sectionProperties.nodeReply.style.display = 'none';
            this.cachedIsEdit = false;
            this.positionCalcComment();
            if (!window.mode.isMobile()) {
                this.sectionProperties.commentListSection.select(this);
            }
            this.sectionProperties.container.style.visibility = '';
        };
        Comment.prototype.getCommentWidth = function () {
            // note: getComputedStyle can be an exceptional bottle-neck with many comments
            return parseFloat(getComputedStyle(this.sectionProperties.container).width) * app.dpiScale;
        };
        Comment.prototype.positionCalcComment = function () {
            if (!window.mode.isMobile()) {
                var cellPos = app.map._docLayer._cellRangeToTwipRect(this.sectionProperties.data.cellRange).toRectangle();
                var originalSize = [Math.round((cellPos[2]) * app.twipsToPixels), Math.round((cellPos[3]) * app.twipsToPixels)];
                var startX = this.isCalcRTL() ? this.myTopLeft[0] - this.getCommentWidth() : this.myTopLeft[0] + originalSize[0] - 3;
                var pos = [Math.round(startX / app.dpiScale), Math.round(this.myTopLeft[1] / app.dpiScale)];
                this.sectionProperties.container.style.transform = 'translate3d(' + pos[0] + 'px, ' + pos[1] + 'px, 0px)';
            }
        };
        Comment.prototype.showImpressDraw = function () {
            if (this.isInsideActivePart()) {
                this.sectionProperties.container.style.display = '';
                this.sectionProperties.nodeModify.style.display = 'none';
                this.sectionProperties.nodeReply.style.display = 'none';
                this.sectionProperties.contentNode.style.display = '';
                this.cachedIsEdit = false;
                if (this.isSelected() || !this.isCollapsed) {
                    this.sectionProperties.container.style.visibility = '';
                }
                else {
                    this.sectionProperties.container.style.visibility = 'hidden';
                }
                L.DomUtil.addClass(this.sectionProperties.container, 'cool-annotation-collapsed-show');
            }
        };
        Comment.prototype.setLayoutClass = function () {
            this.sectionProperties.container.classList.remove('tracked-deleted-comment-show');
            this.sectionProperties.container.classList.remove('tracked-deleted-comment-hide');
            var showTrackedChanges = this.map['stateChangeHandler'].getItemValue('.uno:ShowTrackedChanges') === 'true';
            var layoutClass = showTrackedChanges ? 'tracked-deleted-comment-show' : 'tracked-deleted-comment-hide';
            if (this.sectionProperties.data.layoutStatus === CommentLayoutStatus.DELETED) {
                this.sectionProperties.container.classList.add(layoutClass);
            }
        };
        Comment.prototype.show = function () {
            this.doPendingInitializationInView(true /* force */);
            if (this.hidden === false && !this.isEdit())
                return;
            this.showMarker();
            // On mobile, container shouldn't be 'document-container', but it is 'document-container' on initialization. So we hide the comment until comment wizard is opened.
            if (window.mode.isMobile() && this.sectionProperties.container.parentElement === document.getElementById('document-container'))
                this.sectionProperties.container.style.visibility = 'hidden';
            if (cool.CommentSection.commentWasAutoAdded)
                return;
            // We don't cache the hidden state for spreadsheets. Only one comment can be
            // visible and they're hidden when scrolling, so it's easier this way.
            if (app.map._docLayer._docType === 'text') {
                this.showWriter();
                this.hidden = false;
            }
            else if (app.map._docLayer._docType === 'presentation' || app.map._docLayer._docType === 'drawing') {
                this.showImpressDraw();
                this.hidden = false;
            }
            else if (app.map._docLayer._docType === 'spreadsheet')
                this.showCalc();
            this.setLayoutClass();
        };
        Comment.prototype.hideWriter = function () {
            this.sectionProperties.container.style.visibility = 'hidden';
            this.sectionProperties.nodeModify.style.display = 'none';
            this.sectionProperties.nodeReply.style.display = 'none';
            this.sectionProperties.showSelectedCoordinate = false;
            L.DomUtil.removeClass(this.sectionProperties.container, 'cool-annotation-collapsed-show');
            this.cachedIsEdit = false;
            this.hidden = true;
        };
        Comment.prototype.hideCalc = function () {
            this.sectionProperties.container.style.visibility = 'hidden';
            this.sectionProperties.nodeModify.style.display = 'none';
            this.sectionProperties.nodeReply.style.display = 'none';
            this.cachedIsEdit = false;
            if (this.sectionProperties.commentListSection.sectionProperties.selectedComment === this)
                this.sectionProperties.commentListSection.sectionProperties.selectedComment = null;
        };
        Comment.prototype.hideImpressDraw = function () {
            if (!this.isInsideActivePart()) {
                this.sectionProperties.container.style.display = 'none';
                this.hideMarker();
            }
            else {
                this.sectionProperties.container.style.display = '';
                if (this.isCollapsed)
                    this.sectionProperties.container.style.visibility = 'hidden';
                this.sectionProperties.nodeModify.style.display = 'none';
                this.sectionProperties.nodeReply.style.display = 'none';
                this.cachedIsEdit = false;
            }
            L.DomUtil.removeClass(this.sectionProperties.container, 'cool-annotation-collapsed-show');
            this.hidden = true;
        };
        // check if this is "our" autosaved comment
        // core is not aware it's autosaved one so use this simplified detection based on content
        Comment.prototype.isAutoSaved = function () {
            var autoSavedComment = cool.CommentSection.autoSavedComment;
            if (!autoSavedComment)
                return false;
            var authorMatch = this.sectionProperties.data.author === this.map.getViewName(app.map._docLayer._viewId);
            return authorMatch;
        };
        Comment.prototype.hide = function () {
            if (this.hidden === true || this.isEdit()) {
                return;
            }
            if (this.sectionProperties.data.id === 'new') {
                this.sectionProperties.commentListSection.removeItem(this.sectionProperties.data.id);
                return;
            }
            if (app.map._docLayer._docType === 'text')
                this.hideWriter();
            else if (app.map._docLayer._docType === 'spreadsheet')
                this.hideCalc();
            else if (app.map._docLayer._docType === 'presentation' || app.map._docLayer._docType === 'drawing')
                this.hideImpressDraw();
        };
        Comment.prototype.isInsideActivePart = function () {
            // Impress and Draw only.
            return this.sectionProperties.partIndex === app.map._docLayer._selectedPart;
        };
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        Comment.prototype.menuOnMouseClick = function (e) {
            $(this.sectionProperties.menu).contextMenu();
            L.DomEvent.stopPropagation(e);
        };
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        Comment.prototype.menuOnKeyPress = function (e) {
            if (e.code === 'Space' || e.code === 'Enter')
                $(this.sectionProperties.menu).contextMenu();
            L.DomEvent.stopPropagation(e);
        };
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        Comment.prototype.onMouseClick = function (e) {
            if ((window.mode.isMobile() || window.mode.isTablet())
                && this.map.getDocType() == 'spreadsheet'
                && !this.map.uiManager.mobileWizard.isOpen()) {
                this.hide();
            }
            L.DomEvent.stopPropagation(e);
            this.sectionProperties.commentListSection.click(this);
        };
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        Comment.prototype.onEscKey = function (e) {
            if (window.mode.isDesktop()) {
                if (e.keyCode === 27) {
                    this.onCancelClick(e);
                }
                else if (e.keyCode === 33 /*PageUp*/ || e.keyCode === 34 /*PageDown*/) {
                    // work around for a chrome issue https://issues.chromium.org/issues/41417806
                    L.DomEvent.preventDefault(e);
                    var pos = e.keyCode === 33 ? 0 : e.target.textLength;
                    var currentPos = e.target.selectionStart;
                    if (e.shiftKey) {
                        var _a = __read(currentPos <= pos ? [currentPos, pos] : [pos, currentPos], 2), start = _a[0], end = _a[1];
                        e.target.setSelectionRange(start, end, currentPos > pos ? 'backward' : 'forward');
                    }
                    else {
                        e.target.setSelectionRange(pos, pos);
                    }
                }
            }
        };
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        Comment.prototype.handleReplyCommentButton = function (e) {
            cool.CommentSection.autoSavedComment = null;
            cool.CommentSection.commentWasAutoAdded = false;
            this.textAreaInput(null);
            this.onReplyClick(e);
        };
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        Comment.prototype.onReplyClick = function (e) {
            L.DomEvent.stopPropagation(e);
            if (window.mode.isMobile()) {
                this.sectionProperties.data.reply = this.sectionProperties.data.text;
                this.sectionProperties.commentListSection.saveReply(this);
            }
            else {
                this.removeLastBRTag(this.sectionProperties.nodeReplyText);
                this.sectionProperties.data.reply = this.sectionProperties.nodeReplyText.innerText;
                this.sectionProperties.data.html = this.sectionProperties.nodeReplyText.innerHTML;
                // Assigning an empty string to .innerHTML property in some browsers will convert it to 'null'
                // While in browsers like Chrome and Firefox, a null value is automatically converted to ''
                // Better to assign '' here instead of null to keep the behavior same for all
                this.sectionProperties.nodeReplyText.innerText = '';
                this.show();
                this.sectionProperties.commentListSection.saveReply(this);
            }
        };
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        Comment.prototype.handleCancelCommentButton = function (e) {
            if (cool.CommentSection.commentWasAutoAdded) {
                app.sectionContainer.getSectionWithName(L.CSections.CommentList.name).remove(this.sectionProperties.data.id);
            }
            if (cool.CommentSection.autoSavedComment) {
                this.sectionProperties.contentText.origText = this.sectionProperties.contentText.uneditedText;
                this.sectionProperties.contentText.uneditedText = null;
                this.sectionProperties.contentText.origHTML = this.sectionProperties.contentText.uneditedHTML;
                this.sectionProperties.contentText.uneditedHTML = null;
            }
            // These lines are repeated in onCancelClick,
            // it makes things simple by not adding so many condition for different apps and different situation
            // It is mandatory to change these values before handleSaveCommentButton is called
            // calling handleSaveCommentButton in onCancelClick causes problem because that is also called from many other events/function (i.e: onPartChange)
            if (this.sectionProperties.contentText.origHTML) {
                this.sectionProperties.nodeModifyText.innerHTML = this.sanitize(this.sectionProperties.contentText.origHTML);
            }
            else {
                this.sectionProperties.nodeModifyText.innerText = this.sectionProperties.contentText.origText;
            }
            this.sectionProperties.nodeReplyText.innerText = '';
            if (cool.CommentSection.autoSavedComment)
                this.handleSaveCommentButton(e);
            this.onCancelClick(e);
            if (app.map._docLayer._docType === 'spreadsheet')
                this.hideCalc();
            cool.CommentSection.commentWasAutoAdded = false;
            cool.CommentSection.autoSavedComment = null;
        };
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        Comment.prototype.onCancelClick = function (e) {
            if (e)
                L.DomEvent.stopPropagation(e);
            if (this.sectionProperties.contentText.origHTML) {
                this.sectionProperties.nodeModifyText.innerHTML = this.sanitize(this.sectionProperties.contentText.origHTML);
            }
            else {
                this.sectionProperties.nodeModifyText.innerText = this.sectionProperties.contentText.origText;
            }
            this.sectionProperties.nodeReplyText.innerText = '';
            if (app.map._docLayer._docType !== 'spreadsheet')
                this.show();
            this.sectionProperties.commentListSection.cancel(this);
        };
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        Comment.prototype.handleSaveCommentButton = function (e) {
            cool.CommentSection.autoSavedComment = null;
            cool.CommentSection.commentWasAutoAdded = false;
            this.sectionProperties.contentText.uneditedText = null;
            this.sectionProperties.contentText.uneditedHTML = null;
            this.textAreaInput(null);
            this.onSaveComment(e);
        };
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        Comment.prototype.onSaveComment = function (e) {
            this.sectionProperties.commentContainerRemoved = true;
            L.DomEvent.stopPropagation(e);
            this.removeLastBRTag(this.sectionProperties.nodeModifyText);
            this.sectionProperties.data.text = this.sectionProperties.nodeModifyText.innerText;
            this.sectionProperties.data.html = this.sectionProperties.nodeModifyText.innerHTML;
            this.updateContent();
            if (!cool.CommentSection.autoSavedComment)
                this.show();
            this.sectionProperties.commentListSection.save(this);
        };
        // for some reason firefox adds <br> at of the end of text in contenteditable div
        // there have been similar reports: https://bugzilla.mozilla.org/show_bug.cgi?id=1615852
        Comment.prototype.removeLastBRTag = function (element) {
            if (!L.Browser.gecko)
                return;
            var brElements = element.querySelectorAll('br');
            if (brElements.length > 0)
                brElements[brElements.length - 1].remove();
        };
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        Comment.prototype.onLostFocus = function (e) {
            var _a;
            if (!this.isEdit() || this.sectionProperties.container.contains(e.relatedTarget))
                return;
            if (this.sectionProperties.nodeReply.contains(e.target)) {
                this.onLostFocusReply(e);
                return;
            }
            if (app.map._docLayer._docType === 'text' && ((_a = this.map.mention) === null || _a === void 0 ? void 0 : _a.isTypingMention())) {
                return;
            }
            if (!this.sectionProperties.commentContainerRemoved) {
                this.cachedIsEdit = false;
                $(this.sectionProperties.container).removeClass('annotation-active reply-annotation-container modify-annotation-container');
                this.removeLastBRTag(this.sectionProperties.nodeModifyText);
                if (this.sectionProperties.contentText.origText !== this.sectionProperties.nodeModifyText.innerText ||
                    this.sectionProperties.contentText.origHTML !== this.sectionProperties.nodeModifyText.innerHTML) {
                    if (!document.hasFocus())
                        app.definitions.CommentSection.needFocus = this;
                    if (!this.sectionProperties.contentText.uneditedHTML)
                        this.sectionProperties.contentText.uneditedHTML = this.sectionProperties.contentText.origHTML;
                    if (!this.sectionProperties.contentText.uneditedText)
                        this.sectionProperties.contentText.uneditedText = this.sectionProperties.contentText.origText;
                    cool.CommentSection.autoSavedComment = this;
                    this.onSaveComment(e);
                }
                else if (this.containerObject.testing) {
                    var insertButton = document.getElementById('menu-insertcomment');
                    if (insertButton) {
                        if (window.getComputedStyle(insertButton).display === 'none') {
                            this.onCancelClick(e);
                        }
                    }
                }
            }
        };
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        Comment.prototype.onLostFocusReply = function (e) {
            var _a;
            if (app.map._docLayer._docType === 'text' && ((_a = this.map.mention) === null || _a === void 0 ? void 0 : _a.isTypingMention())) {
                return;
            }
            if (this.sectionProperties.nodeReplyText.innerText !== '') {
                if (!document.hasFocus())
                    app.definitions.CommentSection.needFocus = this;
                if (!this.sectionProperties.contentText.uneditedHTML)
                    this.sectionProperties.contentText.uneditedHTML = this.sectionProperties.contentText.origHTML;
                if (!this.sectionProperties.contentText.uneditedText)
                    this.sectionProperties.contentText.uneditedText = this.sectionProperties.contentText.origText;
                cool.CommentSection.autoSavedComment = this;
                this.onReplyClick(e);
            }
            else {
                this.sectionProperties.nodeReply.style.display = 'none';
                if (!this.sectionProperties.nodeModify || this.sectionProperties.nodeModify.style.display === 'none')
                    this.cachedIsEdit = false;
            }
        };
        Comment.prototype.focus = function () {
            this.sectionProperties.container.classList.add('annotation-active');
            this.sectionProperties.nodeModifyText.focus({ focusVisible: true });
            this.sectionProperties.nodeReplyText.focus({ focusVisible: true });
            // set cursor at the last position on refocus after autosave
            if (this.isModifying() && this.sectionProperties.nodeModifyText.childNodes.length > 0) {
                var range = document.createRange();
                var sel = document.getSelection();
                range.setStartAfter(this.sectionProperties.nodeModifyText.lastChild);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
            }
        };
        Comment.prototype.reply = function () {
            this.sectionProperties.container.classList.add('reply-annotation-container');
            this.sectionProperties.container.style.visibility = '';
            this.sectionProperties.contentNode.style.display = '';
            this.sectionProperties.nodeModify.style.display = 'none';
            this.sectionProperties.nodeReply.style.display = '';
            this.cachedIsEdit = true;
            return this;
        };
        Comment.prototype.edit = function () {
            this.doPendingInitializationInView(true /* force */);
            this.sectionProperties.container.classList.add('modify-annotation-container');
            this.sectionProperties.nodeModify.style.display = '';
            this.sectionProperties.nodeReply.style.display = 'none';
            this.sectionProperties.container.style.visibility = '';
            this.sectionProperties.contentNode.style.display = 'none';
            this.cachedIsEdit = true;
            return this;
        };
        Comment.prototype.isEdit = function () {
            return this.cachedIsEdit;
        };
        Comment.prototype.isModifying = function () {
            return !this.pendingInit && this.sectionProperties.nodeModify && this.sectionProperties.nodeModify.style.display !== 'none';
        };
        Comment.isAnyEdit = function () {
            var section = app.sectionContainer && app.sectionContainer instanceof CanvasSectionContainer ?
                app.sectionContainer.getSectionWithName(L.CSections.CommentList.name) : null;
            if (!section) {
                return null;
            }
            var commentList = section.sectionProperties.commentList;
            for (var i in commentList) {
                var modifyNode = commentList[i].sectionProperties.nodeModify;
                var replyNode = commentList[i].sectionProperties.nodeReply;
                if (!commentList[i].pendingInit &&
                    ((modifyNode && modifyNode.style.display !== 'none') ||
                        (replyNode && replyNode.style.display !== 'none')))
                    return commentList[i];
            }
            return null;
        };
        Comment.isAnyFocus = function () {
            var comment_ = Comment.isAnyEdit();
            // We have a comment in edit mode. Is it focused?
            if (comment_ && (document.activeElement === comment_.sectionProperties.nodeModifyText || document.activeElement === comment_.sectionProperties.nodeReplyText))
                return true;
            return false;
        };
        Comment.prototype.isDisplayed = function () {
            return (this.sectionProperties.container.style && this.sectionProperties.container.style.visibility === '');
        };
        Comment.prototype.onResize = function () {
            this.updatePosition();
        };
        Comment.prototype.isSelected = function () {
            return this.sectionProperties.commentListSection.sectionProperties.selectedComment === this;
        };
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        Comment.prototype.doesRectangleContainPoint = function (rectangle, point) {
            if (point[0] >= rectangle[0] && point[0] <= rectangle[0] + rectangle[2]) {
                if (point[1] >= rectangle[1] && point[1] <= rectangle[1] + rectangle[3]) {
                    return true;
                }
            }
            return false;
        };
        /*
            point is the core pixel coordinate of the cursor.
            Not adjusted according to the view.
            For adjusting, we need to take document top left and documentAnchor top left into account.
            No need to do that for now.
        */
        Comment.prototype.checkIfCursorIsOnThisCommentWriter = function (rectangles, point) {
            for (var i = 0; i < rectangles.length; i++) {
                if (this.doesRectangleContainPoint(rectangles[i], point)) {
                    if (!this.isSelected()) {
                        this.sectionProperties.commentListSection.selectById(this.sectionProperties.data.id);
                    }
                    this.stopPropagating();
                    return;
                }
            }
            // If we are here, this comment is not selected.
            if (this.isSelected()) {
                if (this.isCollapsed)
                    this.setCollapsed();
                this.sectionProperties.commentListSection.unselect();
            }
        };
        /// This event is Writer-only. Fired by CanvasSectionContainer.
        Comment.prototype.onCursorPositionChanged = function (newPosition) {
            var x = newPosition.pX1;
            var y = Math.round(newPosition.pCenter[1]);
            if (this.sectionProperties.pixelBasedOrgRectangles) {
                this.checkIfCursorIsOnThisCommentWriter(this.sectionProperties.pixelBasedOrgRectangles, [x, y]);
            }
        };
        /// This event is Calc-only. Fired by CanvasSectionContainer.
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        Comment.prototype.onCellAddressChanged = function () {
            if (this.sectionProperties.data.rectangles) {
                var midX = this.containerObject.getDocumentAnchor()[0] + Math.round(app.calc.cellCursorRectangle.pCenter[0]);
                var midY = this.containerObject.getDocumentAnchor()[1] + Math.round(app.calc.cellCursorRectangle.pCenter[1]);
                if (midX > this.sectionProperties.data.rectangles[0][0] && midX < this.sectionProperties.data.rectangles[0][0] + this.sectionProperties.data.rectangles[0][2]
                    && midY > this.sectionProperties.data.rectangles[0][1] && midY < this.sectionProperties.data.rectangles[0][1] + this.sectionProperties.data.rectangles[0][3]) {
                    this.sectionProperties.commentListSection.sectionProperties.calcCurrentComment = this;
                }
                else if (this.isSelected()) {
                    this.hide();
                    this.sectionProperties.commentListSection.sectionProperties.calcCurrentComment = null;
                }
                else if (this.sectionProperties.commentListSection.sectionProperties.calcCurrentComment == this)
                    this.sectionProperties.commentListSection.sectionProperties.calcCurrentComment = null;
            }
        };
        Comment.prototype.onClick = function (point, e) {
            if (app.map._docLayer._docType === 'presentation' || app.map._docLayer._docType === 'drawing') {
                this.sectionProperties.commentListSection.selectById(this.sectionProperties.data.id);
                e.stopPropagation();
                this.stopPropagating();
            }
        };
        Comment.prototype.onDraw = function () {
            if (this.sectionProperties.showSelectedCoordinate) {
                if (app.map._docLayer._docType === 'text') {
                    var rectangles = this.sectionProperties.data.rectangles;
                    if (rectangles) {
                        this.context.fillStyle = this.sectionProperties.usedTextColor;
                        this.context.globalAlpha = 0.25;
                        for (var i = 0; i < this.sectionProperties.data.rectangles.length; i++) {
                            var x = rectangles[i][0] - this.myTopLeft[0];
                            var y = rectangles[i][1] - this.myTopLeft[1];
                            var w = rectangles[i][2] > 3 ? rectangles[i][2] : 3;
                            var h = rectangles[i][3];
                            this.context.fillRect(x, y, w, h);
                        }
                        this.context.globalAlpha = 1;
                    }
                }
                else if (app.map._docLayer._docType === 'spreadsheet' &&
                    parseInt(this.sectionProperties.data.tab) === app.map._docLayer._selectedPart) {
                    var cellSize = this.calcCellSize();
                    if (cellSize[0] !== 0 && cellSize[1] !== 0) { // don't draw notes in hidden cells
                        // `zoom` represents the current zoom level of the map, retrieved from `this.map.getZoom()`.
                        // `baseSize` is a constant that defines the base size of the square at the initial zoom level.
                        // `squareDim` calculates the dimension of the square, which dynamically adjusts based on the current zoom level.
                        // The dimension increases proportionally to the zoom level by adding `zoom` to `baseSize`.
                        var margin = 1;
                        var baseSize = 2;
                        var zoom = this.map.getZoom();
                        var squareDim = baseSize + zoom;
                        var isRTL = this.isCalcRTL();
                        // this.size may currently have an artificially wide size if mouseEnter without moveLeave seen
                        // so fetch the real size
                        var x = isRTL ? margin : cellSize[0] - squareDim - margin;
                        var commentColor = getComputedStyle(document.body).getPropertyValue('--color-calc-comment');
                        this.context.fillStyle = commentColor;
                        var region = new Path2D();
                        region.moveTo(x, 0);
                        region.lineTo(x + squareDim, 0);
                        region.lineTo(x + (isRTL ? 0 : squareDim), squareDim);
                        region.closePath();
                        this.context.fill(region);
                    }
                }
            }
        };
        Comment.prototype.onMouseMove = function (point, dragDistance, e) {
            return;
        };
        Comment.prototype.onMouseUp = function (point, e) {
            // Hammer.js doesn't fire onClick event after touchEnd event.
            // CanvasSectionContainer fires the onClick event. But since Hammer.js is used for map, it disables the onClick for SectionContainer.
            // We will use this event as click event on touch devices, until we remove Hammer.js (then this code will be removed from here).
            // Control.ColumnHeader.js file is not affected by this situation, because map element (so Hammer.js) doesn't cover headers.
            if (!this.containerObject.isDraggingSomething() && window.mode.isMobile() || window.mode.isTablet()) {
                if (app.map._docLayer._docType === 'presentataion' || app.map._docLayer._docType === 'drawing')
                    app.map._docLayer._openCommentWizard(this);
                this.onMouseEnter();
                this.onClick(point, e);
            }
        };
        Comment.prototype.onMouseDown = function (point, e) {
            return;
        };
        Comment.prototype.calcContinueWithMouseEvent = function () {
            if (app.map._docLayer._docType === 'spreadsheet') {
                var conditions = !this.isEdit();
                if (conditions) {
                    var sc = this.sectionProperties.commentListSection.sectionProperties.selectedComment;
                    if (sc)
                        conditions = sc.sectionProperties.data.id !== 'new';
                }
                return conditions;
            }
            else {
                return false;
            }
        };
        Comment.prototype.calcCellSize = function () {
            var cellPos = app.map._docLayer._cellRangeToTwipRect(this.sectionProperties.data.cellRange).toRectangle();
            return [Math.round((cellPos[2]) * app.twipsToPixels), Math.round((cellPos[3]) * app.twipsToPixels)];
        };
        Comment.prototype.onMouseEnter = function () {
            if (this.calcContinueWithMouseEvent()) {
                // When mouse is above this section, comment's HTML element will be shown.
                // If mouse pointer goes to HTML element, onMouseLeave event shouldn't be fired.
                // But mouse pointer will have left the borders of this section and onMouseLeave event will be fired.
                // Let's do it properly, when mouse is above this section, we will make this section's size bigger and onMouseLeave event will not be fired.
                if (parseInt(this.sectionProperties.data.tab) === app.map._docLayer._selectedPart) {
                    var sc = this.sectionProperties.commentListSection.sectionProperties.selectedComment;
                    if (sc) {
                        if (!sc.isEdit())
                            sc.hide();
                        else
                            return; // Another comment is being edited. Return.
                    }
                    var containerWidth = this.sectionProperties.container.getBoundingClientRect().width;
                    var cellPos = app.map._docLayer._cellRangeToTwipRect(this.sectionProperties.data.cellRange).toRectangle();
                    this.size = [Math.round((cellPos[2]) * app.twipsToPixels + containerWidth), Math.round((cellPos[3]) * app.twipsToPixels)];
                    this.sectionProperties.commentListSection.selectById(this.sectionProperties.data.id);
                    this.show();
                }
            }
        };
        Comment.prototype.onMouseLeave = function (point) {
            if (this.calcContinueWithMouseEvent()) {
                if (parseInt(this.sectionProperties.data.tab) === app.map._docLayer._selectedPart) {
                    // Revert the changes we did on "onMouseEnter" event.
                    this.size = this.calcCellSize();
                    if (point) {
                        this.hide();
                    }
                }
            }
        };
        Comment.prototype.onNewDocumentTopLeft = function () {
            this.doPendingInitializationInView();
            this.updatePosition();
        };
        Comment.prototype.onCommentDataUpdate = function () {
            this.doPendingInitializationInView();
            this.updatePosition();
        };
        Comment.prototype.onRemove = function () {
            this.sectionProperties.commentContainerRemoved = true;
            if (this.sectionProperties.commentListSection.sectionProperties.selectedComment === this)
                this.sectionProperties.commentListSection.sectionProperties.selectedComment = null;
            this.sectionProperties.commentListSection.hideArrow();
            var container = this.sectionProperties.container;
            if (this.sectionProperties.commentMarkerSubSection !== null)
                app.sectionContainer.removeSection(this.sectionProperties.commentMarkerSubSection.name);
            if (container && container.parentElement) {
                var c = 0;
                while (c < 10) {
                    try {
                        container.parentElement.removeChild(container);
                        break;
                    }
                    catch (e) {
                        c++;
                    }
                }
            }
        };
        Comment.prototype.isRootComment = function () {
            return this.sectionProperties.data.parent === '0';
        };
        Comment.prototype.setAsRootComment = function () {
            this.sectionProperties.data.parent = '0';
            if (app.map._docLayer._docType === 'text')
                this.sectionProperties.data.parentId = '0';
        };
        Comment.prototype.getChildrenLength = function () {
            return this.sectionProperties.children.length;
        };
        Comment.prototype.getChildByIndex = function (index) {
            if (this.sectionProperties.children.length > index)
                return this.sectionProperties.children[index];
            else
                return null;
        };
        Comment.prototype.removeChildByIndex = function (index) {
            if (this.sectionProperties.children.length > index)
                this.sectionProperties.children.splice(index, 1);
        };
        Comment.prototype.getParentCommentId = function () {
            if (this.sectionProperties.data.parent && this.sectionProperties.data.parent !== '0')
                return this.sectionProperties.data.parent;
            else
                return null;
        };
        Comment.prototype.getIndexOfChild = function (comment) {
            return this.sectionProperties.children.indexOf(comment);
        };
        Comment.prototype.getChildLevel = function () {
            if (this.isRootComment())
                return 0;
            var parentComment = this.sectionProperties.commentListSection.getComment(this.getParentCommentId());
            if (parentComment)
                return parentComment.getChildLevel() + 1;
            return 1; // Comment list not fully initialized but we know we are not root
        };
        Comment.prototype.getCommentHeight = function (invalidateCache) {
            if (invalidateCache === void 0) { invalidateCache = true; }
            if (invalidateCache)
                this.cachedCommentHeight = null;
            if (this.cachedCommentHeight === null)
                this.cachedCommentHeight = this.sectionProperties.container.getBoundingClientRect().height
                    - this.sectionProperties.childLinesNode.getBoundingClientRect().height;
            return this.cachedCommentHeight;
        };
        Comment.prototype.setCollapsed = function () {
            this.isCollapsed = true;
            if (!this.isEdit())
                this.show();
            if (this.isRootComment() || app.map._docLayer._docType === 'presentation' || app.map._docLayer._docType === 'drawing') {
                this.sectionProperties.container.style.display = '';
                this.sectionProperties.container.style.visibility = 'hidden';
            }
            this.updateThreadInfoIndicator();
            if (this.sectionProperties.data.resolved === 'false'
                || this.sectionProperties.commentListSection.sectionProperties.showResolved
                || app.map._docLayer._docType === 'presentation'
                || app.map._docLayer._docType === 'drawing')
                L.DomUtil.addClass(this.sectionProperties.container, 'cool-annotation-collapsed-show');
        };
        Comment.prototype.updateThreadInfoIndicator = function (replycount) {
            if (replycount === void 0) { replycount = -1; }
            if (app.map._docLayer._docType === 'spreadsheet')
                return;
            var innerText;
            if (this.isEdit())
                innerText = '!';
            else if (replycount === '!' || typeof replycount === "number" && replycount > 0)
                innerText = replycount;
            else
                innerText = '';
            if (this.sectionProperties.collapsedInfoNode.innerText != innerText)
                this.sectionProperties.collapsedInfoNode.innerText = innerText;
            if (innerText === '' || this.isContainerVisible())
                this.sectionProperties.collapsedInfoNode.style.display = 'none';
            else if ((!this.isContainerVisible() && this.sectionProperties.collapsedInfoNode.innerText !== ''))
                this.sectionProperties.collapsedInfoNode.style.display = '';
        };
        Comment.prototype.setExpanded = function () {
            if (!this.isCollapsed)
                return;
            this.isCollapsed = false;
            if (this.sectionProperties.data.resolved === 'false' || this.sectionProperties.commentListSection.sectionProperties.showResolved) {
                this.sectionProperties.container.style.display = '';
                this.sectionProperties.container.style.visibility = '';
            }
            if (app.map._docLayer._docType === 'text')
                this.sectionProperties.collapsedInfoNode.style.display = 'none';
            L.DomUtil.removeClass(this.sectionProperties.container, 'cool-annotation-collapsed-show');
        };
        Comment.prototype.autoCompleteMention = function (username, profileLink, replacement) {
            var _a, _b, _c;
            var selection = window.getSelection();
            if (!selection.rangeCount)
                return;
            var range = selection.getRangeAt(0);
            var cursorPosition = range.endOffset;
            var container = range.startContainer;
            var containerText = container.textContent || '';
            var mentionStart = containerText.lastIndexOf(replacement, cursorPosition);
            if (mentionStart !== -1) {
                var mentionEnd = mentionStart + replacement.length;
                var beforeMention = containerText.substring(0, mentionStart);
                var afterMention = containerText.substring(mentionEnd);
                var hyperlink = document.createElement('a');
                hyperlink.href = profileLink;
                hyperlink.textContent = "@" + username;
                container.textContent = beforeMention;
                (_a = container.parentNode) === null || _a === void 0 ? void 0 : _a.insertBefore(hyperlink, container.nextSibling);
                var afterTextNode = document.createTextNode(afterMention);
                var extraSpaceNode = document.createTextNode('\u00A0');
                (_b = hyperlink.parentNode) === null || _b === void 0 ? void 0 : _b.insertBefore(extraSpaceNode, hyperlink.nextSibling);
                (_c = hyperlink.parentNode) === null || _c === void 0 ? void 0 : _c.insertBefore(afterTextNode, extraSpaceNode.nextSibling);
                var newRange = document.createRange();
                newRange.setStartAfter(extraSpaceNode);
                newRange.setEndAfter(extraSpaceNode);
                selection.removeAllRanges();
                selection.addRange(newRange);
            }
        };
        return Comment;
    }(CanvasSectionObject));
    cool.Comment = Comment;
})(cool || (cool = {}));
app.definitions.Comment = cool.Comment;
//# sourceMappingURL=CommentSection.js.map