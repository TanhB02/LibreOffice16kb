// @ts-strict-ignore
/* -*- js-indent-level: 8; fill-column: 100 -*- */
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
var GraphicSelection = /** @class */ (function () {
    function GraphicSelection() {
    }
    GraphicSelection.hasActiveSelection = function () {
        return this.rectangle !== null;
    };
    GraphicSelection.onUpdatePermission = function () {
        this.rectangle = null;
        this.updateGraphicSelection();
    };
    GraphicSelection.resetSelectionRanges = function () {
        this.rectangle = null;
        this.extraInfo = null;
        if (this.handlesSection) {
            this.handlesSection.removeSubSections();
            app.sectionContainer.removeSection(this.handlesSection.name);
            this.handlesSection = null;
        }
    };
    // shows the video inside current selection marker
    GraphicSelection.onEmbeddedVideoContent = function (textMsg) {
        if (!this.handlesSection)
            return;
        var videoDesc = JSON.parse(textMsg);
        if (this.hasActiveSelection()) {
            videoDesc.width = this.rectangle.cWidth;
            videoDesc.height = this.rectangle.cHeight;
        }
        // proxy cannot identify RouteToken if it is encoded
        var routeTokenIndex = videoDesc.url.indexOf('%26RouteToken=');
        if (routeTokenIndex != -1) {
            videoDesc.url = videoDesc.url.replace('%26RouteToken=', '&amp;RouteToken=');
        }
        var videoToInsert = '<?xml version="1.0" encoding="UTF-8"?>\
		<foreignObject xmlns="http://www.w3.org/2000/svg" overflow="visible" width="' +
            videoDesc.width +
            '" height="' +
            videoDesc.height +
            '">\
			<body xmlns="http://www.w3.org/1999/xhtml">\
				<video controls="controls" width="' +
            videoDesc.width +
            '" height="' +
            videoDesc.height +
            '">\
					<source src="' +
            videoDesc.url +
            '" type="' +
            videoDesc.mimeType +
            '"/>\
				</video>\
			</body>\
		</foreignObject>';
        this.handlesSection.addEmbeddedVideo(videoToInsert);
    };
    GraphicSelection.renderDarkOverlay = function () {
        var topLeft = new L.Point(this.rectangle.pX1, this.rectangle.pY1);
        var bottomRight = new L.Point(this.rectangle.pX2, this.rectangle.pY2);
        if (app.map._docLayer.isCalcRTL()) {
            // Dark overlays (like any other overlay) need regular document coordinates.
            // But in calc-rtl mode, charts (like shapes) have negative x document coordinate
            // internal representation.
            topLeft.x = Math.abs(topLeft.x);
            bottomRight.x = Math.abs(bottomRight.x);
        }
        var bounds = new L.Bounds(topLeft, bottomRight);
        app.map._docLayer._oleCSelections.setPointSet(CPointSet.fromBounds(bounds));
    };
    // When a shape is selected, the rectangles of other shapes are also sent from the core side.
    // They are in twips units.
    GraphicSelection.convertObjectRectangleTwipsToPixels = function () {
        if (this.extraInfo && this.extraInfo.ObjectRectangles) {
            for (var i = 0; i < this.extraInfo.ObjectRectangles.length; i++) {
                for (var j = 0; j < 4; j++)
                    this.extraInfo.ObjectRectangles[i][j] *=
                        app.twipsToPixels * app.impress.twipsCorrection;
            }
        }
    };
    GraphicSelection.extractAndSetGraphicSelection = function (messageJSON) {
        var signX = app.map._docLayer.isCalcRTL() ? -1 : 1;
        var hasExtraInfo = messageJSON.length > 5;
        var hasGridOffset = false;
        var extraInfo = null;
        if (hasExtraInfo) {
            extraInfo = messageJSON[5];
            if (extraInfo.gridOffsetX || extraInfo.gridOffsetY) {
                app.map._docLayer._shapeGridOffset = new app.definitions.simplePoint(signX * extraInfo.gridOffsetX, extraInfo.gridOffsetY);
                hasGridOffset = true;
            }
        }
        // Calc RTL: Negate positive X coordinates from core if grid offset is available.
        signX = hasGridOffset && app.map._docLayer.isCalcRTL() ? -1 : 1;
        this.rectangle = new app.definitions.simpleRectangle(signX * messageJSON[0], messageJSON[1], signX * messageJSON[2], messageJSON[3]);
        if (hasGridOffset)
            this.rectangle.moveBy([
                app.map._docLayer._shapeGridOffset.x,
                app.map._docLayer._shapeGridOffset.y,
            ]);
        this.extraInfo = extraInfo;
        if (app.map._docLayer._docType === 'presentation')
            this.convertObjectRectangleTwipsToPixels();
    };
    /// Push down the graphic selection on non-first pages of scrolling PDF view.
    GraphicSelection.transformGraphicSelection = function (messageJSON) {
        var e_1, _a;
        var _b, _c;
        var docLayer = app.map._docLayer;
        var verticalOffset = docLayer.getFiledBasedViewVerticalOffset();
        if (!verticalOffset) {
            return;
        }
        // y
        messageJSON[1] += verticalOffset;
        var extraInfo = messageJSON[5];
        var rectangle = (_c = (_b = extraInfo === null || extraInfo === void 0 ? void 0 : extraInfo.handles) === null || _b === void 0 ? void 0 : _b.kinds) === null || _c === void 0 ? void 0 : _c.rectangle;
        if (!rectangle) {
            return;
        }
        try {
            for (var _d = __values(['1', '2', '3', '4', '5', '6', '7', '8']), _e = _d.next(); !_e.done; _e = _d.next()) {
                var key = _e.value;
                var y = parseInt(rectangle[key][0].point.y);
                rectangle[key][0].point.y = y + verticalOffset;
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    GraphicSelection.updateGraphicSelection = function () {
        if (this.hasActiveSelection()) {
            // Hide the keyboard on graphic selection, unless cursor is visible.
            // Don't interrupt editing in dialogs
            if (!JSDialog.IsAnyInputFocused())
                app.map.focus(app.file.textCursor.visible);
            var editMode = app.map.isEditMode();
            if (!editMode) {
                // If the just added signature line shape is selected, show the
                // graphic selection.
                editMode = this.extraInfo && this.extraInfo.isSignature;
            }
            if (!editMode) {
                return;
            }
            var extraInfo = this.extraInfo;
            var addHandlesSection = false;
            if (!this.handlesSection)
                addHandlesSection = true;
            else if (extraInfo.id !== this.handlesSection.sectionProperties.info.id) {
                // Another shape is selected.
                this.handlesSection.removeSubSections();
                app.sectionContainer.removeSection(this.handlesSection.name);
                this.handlesSection = null;
                addHandlesSection = true;
            }
            if (addHandlesSection) {
                this.handlesSection = new app.definitions.shapeHandlesSection({});
                app.sectionContainer.addSection(this.handlesSection);
            }
            this.handlesSection.setPosition(this.rectangle.pX1, this.rectangle.pY1);
            extraInfo.hasTableSelection = app.map._docLayer.hasTableSelection(); // scaleSouthAndEastOnly
            this.handlesSection.refreshInfo(this.extraInfo);
            this.handlesSection.setShowSection(true);
            app.sectionContainer.requestReDraw();
        }
        else if (this.handlesSection &&
            app.sectionContainer.doesSectionExist(this.handlesSection.name)) {
            this.handlesSection.removeSubSections();
            app.sectionContainer.removeSection(this.handlesSection.name);
            this.handlesSection = null;
        }
        app.map._docLayer._updateCursorAndOverlay();
    };
    GraphicSelection.onShapeSelectionContent = function (textMsg) {
        textMsg = textMsg.substring('shapeselectioncontent:'.length + 1);
        var extraInfo = this.extraInfo;
        if (extraInfo && extraInfo.id) {
            app.map._cacheSVG[extraInfo.id] = textMsg;
        }
        // video is handled in _onEmbeddedVideoContent
        if (this.handlesSection && this.handlesSection.sectionProperties.hasVideo)
            app.map._cacheSVG[extraInfo.id] = undefined;
        else if (this.handlesSection)
            this.handlesSection.setSVG(textMsg);
    };
    GraphicSelection.onMessage = function (textMsg) {
        app.definitions.urlPopUpSection.closeURLPopUp();
        if (textMsg.match('EMPTY')) {
            this.resetSelectionRanges();
        }
        else if (textMsg.match('INPLACE EXIT')) {
            app.map._docLayer._oleCSelections.clear();
        }
        else if (textMsg.match('INPLACE')) {
            if (app.map._docLayer._oleCSelections.empty()) {
                textMsg = '[' + textMsg.substr('graphicselection:'.length) + ']';
                try {
                    var msgData = JSON.parse(textMsg);
                    if (msgData.length > 1)
                        this.extractAndSetGraphicSelection(msgData);
                }
                catch (error) {
                    window.app.console.warn('cannot parse graphicselection command');
                }
                this.renderDarkOverlay();
                this.rectangle = null;
                this.updateGraphicSelection();
            }
        }
        else {
            textMsg = '[' + textMsg.substr('graphicselection:'.length) + ']';
            msgData = JSON.parse(textMsg);
            this.transformGraphicSelection(msgData);
            this.extractAndSetGraphicSelection(msgData);
            // Update the dark overlay on zooming & scrolling
            if (!app.map._docLayer._oleCSelections.empty()) {
                app.map._docLayer._oleCSelections.clear();
                this.renderDarkOverlay();
            }
            this.selectionAngle = msgData.length > 4 ? msgData[4] : 0;
            if (this.extraInfo) {
                var dragInfo = this.extraInfo.dragInfo;
                if (dragInfo && dragInfo.dragMethod === 'PieSegmentDragging') {
                    dragInfo.initialOffset /= 100.0;
                    var dragDir = dragInfo.dragDirection;
                    dragInfo.dragDirection = app.map._docLayer._twipsToPixels(new L.Point(dragDir[0], dragDir[1]));
                    dragDir = dragInfo.dragDirection;
                    dragInfo.range2 = dragDir.x * dragDir.x + dragDir.y * dragDir.y;
                }
            }
            // defaults
            var extraInfo = this.extraInfo;
            if (extraInfo) {
                if (extraInfo.isDraggable === undefined)
                    extraInfo.isDraggable = true;
                if (extraInfo.isResizable === undefined)
                    extraInfo.isResizable = true;
                if (extraInfo.isRotatable === undefined)
                    extraInfo.isRotatable = true;
            }
            // Workaround for tdf#123874. For some reason the handling of the
            // shapeselectioncontent messages that we get back causes the WebKit process
            // to crash on iOS.
            // Note2: scroll to frame in writer would result an error:
            //   svgexport.cxx:810: ...UnknownPropertyException message: "Background
            var isFrame = extraInfo.type == 601 && !extraInfo.isWriterGraphic;
            if (!window.ThisIsTheiOSApp &&
                this.extraInfo.isDraggable &&
                !this.extraInfo.svg &&
                !isFrame) {
                app.socket.sendMessage('rendershapeselection mimetype=image/svg+xml');
            }
            // scroll to selected graphics, if it has no cursor
            if (!app.map._docLayer.isWriter() &&
                this.rectangle &&
                app.map._docLayer._allowViewJump()) {
                if ((!app.isPointVisibleInTheDisplayedArea([
                    this.rectangle.x1,
                    this.rectangle.y1,
                ]) ||
                    !app.isPointVisibleInTheDisplayedArea([
                        this.rectangle.x2,
                        this.rectangle.y2,
                    ])) &&
                    !app.map._docLayer._selectionHandles.active &&
                    !(app.isFollowingEditor() || app.isFollowingUser()) &&
                    !app.map.calcInputBarHasFocus()) {
                    app.map._docLayer.scrollToPos(new app.definitions.simplePoint(this.rectangle.x1, this.rectangle.y1));
                }
            }
        }
        // Graphics are by default complex selections, unless Core tells us otherwise.
        if (app.map._clip)
            app.map._clip.onComplexSelection('');
        // Reset text selection - important for textboxes in Impress
        if (app.map._docLayer._selectionContentRequest)
            clearTimeout(app.map._docLayer._selectionContentRequest);
        app.map._docLayer._onMessage('textselectioncontent:');
        this.updateGraphicSelection();
        if (msgData && msgData.length > 5) {
            var extraInfo = msgData[5];
            if (extraInfo.url !== undefined) {
                this.onEmbeddedVideoContent(JSON.stringify(extraInfo));
            }
        }
    };
    GraphicSelection.rectangle = null;
    GraphicSelection.extraInfo = null;
    GraphicSelection.selectionAngle = 0;
    GraphicSelection.handlesSection = null;
    return GraphicSelection;
}());
app.events.on('updatepermission', GraphicSelection.onUpdatePermission.bind(GraphicSelection));
app.definitions.graphicSelection = GraphicSelection;
//# sourceMappingURL=GraphicSelectionMiddleware.js.map