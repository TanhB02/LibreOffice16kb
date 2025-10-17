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
var cool;
(function (cool) {
    var ContentControlSection = /** @class */ (function (_super) {
        __extends(ContentControlSection, _super);
        function ContentControlSection() {
            var _this = _super.call(this) || this;
            _this.name = L.CSections.ContentControl.name;
            _this.processingOrder = L.CSections.ContentControl.processingOrder;
            _this.drawingOrder = L.CSections.ContentControl.drawingOrder;
            _this.zIndex = L.CSections.ContentControl.zIndex;
            _this.interactable = false;
            _this.documentObject = true;
            _this.map = L.Map.THIS;
            _this.sectionProperties.json = null;
            _this.sectionProperties.datePicker = false;
            _this.sectionProperties.picturePicker = null;
            _this.sectionProperties.polygon = null;
            _this.sectionProperties.dropdownSection = null;
            _this.sectionProperties.dropdownMarkerWidth = 22;
            _this.sectionProperties.dropdownMarkerHeight = 22;
            return _this;
        }
        ContentControlSection.prototype.onInitialize = function () {
            this.map.on('darkmodechanged', this.changeBorderStyle, this);
            var container = L.DomUtil.createWithId('div', 'datepicker');
            container.style.zIndex = '12';
            container.style.position = 'absolute';
            document.getElementById('document-container').appendChild(container);
            this.sectionProperties.picturePicker = false;
        };
        ContentControlSection.prototype.setDatePickerVisibility = function (visible) {
            this.sectionProperties.datePicker = visible;
            if (this.sectionProperties.dropdownSection)
                this.sectionProperties.dropdownSection.sectionProperties.datePicker = visible;
        };
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        ContentControlSection.prototype.drawContentControl = function (json) {
            this.removeDropdownSection();
            this.sectionProperties.json = json;
            this.setDatePickerVisibility(false);
            this.sectionProperties.picturePicker = false;
            if (json.date) {
                $.datepicker.setDefaults($.datepicker.regional[window.langParamLocale.language]);
                $('#datepicker').datepicker({
                    onSelect: function (date, datepicker) {
                        if (date != '') {
                            app.socket.sendMessage('contentcontrolevent type=date selected=' + date);
                        }
                    }
                });
                $('#datepicker').hide();
            }
            else
                $('#datepicker').datepicker('destroy');
            if (json.action === 'show')
                this.preparePolygon();
            else if (json.action === 'hide')
                this.sectionProperties.polygon = null;
            else if (json.action === 'change-picture') {
                this.sectionProperties.picturePicker = true;
                if (!this.map.wopi.EnableInsertRemoteImage)
                    L.DomUtil.get('insertgraphic').click();
                else
                    this.map.fire('postMessage', { msgId: 'UI_InsertGraphic' });
            }
            this.setPositionAndSize();
            if (this.sectionProperties.json.items || json.date) {
                this.addDropDownSection();
                if (json.date)
                    this.setDatePickerVisibility(true);
            }
            app.sectionContainer.requestReDraw();
        };
        ContentControlSection.prototype.setPositionAndSize = function () {
            if (!this.sectionProperties.json || !this.sectionProperties.json.rectangles)
                return;
            var rectangles = this.getRectangles(this.sectionProperties.json.rectangles);
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
        };
        ContentControlSection.prototype.onResize = function () {
            this.setPositionAndSize();
        };
        ContentControlSection.prototype.preparePolygon = function () {
            if (!this.sectionProperties.json.rectangles)
                return;
            // Parse rectangles first.
            var rectangleArray = this.getRectangles(this.sectionProperties.json.rectangles);
            this.sectionProperties.polygon = cool.rectanglesToPolygon(rectangleArray, app.twipsToPixels);
            this.changeBorderStyle();
        };
        ContentControlSection.prototype.drawPolygon = function () {
            this.context.strokeStyle = this.sectionProperties.polygonColor;
            this.context.beginPath();
            this.context.moveTo(this.sectionProperties.polygon[0] - this.position[0], this.sectionProperties.polygon[0 + 1] - this.position[1]);
            for (var i = 0; i < this.sectionProperties.polygon.length - 1; i++) {
                this.context.lineTo(this.sectionProperties.polygon[i] - this.position[0], this.sectionProperties.polygon[i + 1] - this.position[1]);
                i += 1;
            }
            this.context.closePath();
            this.context.stroke();
        };
        ContentControlSection.prototype.onDraw = function () {
            if (!this.sectionProperties.json)
                return;
            if (this.sectionProperties.polygon)
                this.drawPolygon();
            var text = this.sectionProperties.json.alias;
            if (text) {
                var rectangles = this.getRectangles(this.sectionProperties.json.rectangles);
                var x = rectangles[rectangles.length - 1][0] * app.twipsToPixels;
                var y = rectangles[rectangles.length - 1][1] * app.twipsToPixels;
                // fixed height for alias tag
                var h = 20;
                var startX = x - this.position[0] + 5;
                var startY = y - this.position[1];
                var padding = 10;
                var fontStyle = getComputedStyle(document.body).getPropertyValue('--docs-font').split(',')[0].replace(/'/g, '');
                var fontSize = getComputedStyle(document.body).getPropertyValue('--default-font-size');
                var font = fontSize + ' ' + fontStyle;
                var textWidth = app.util.getTextWidth(text, font) + padding;
                // draw rectangle with backgroundcolor
                this.context.beginPath();
                this.context.fillStyle = '#E6FFFF';
                this.context.font = font;
                this.context.fillRect(startX, startY - h, textWidth, h);
                // add text to the rectangle
                this.context.textAlign = 'center';
                this.context.textBaseline = 'middle';
                this.context.fillStyle = '#026296';
                this.context.fillText(text, startX + textWidth / 2, startY - h / 2);
                // draw borders around the rectangle
                this.context.strokeStyle = '#026296';
                this.context.lineWidth = app.dpiScale;
                this.context.strokeRect(startX - 0.5, startY - h - 0.5, textWidth, h);
            }
        };
        ContentControlSection.prototype.onNewDocumentTopLeft = function () {
            this.setPositionAndSize();
        };
        ContentControlSection.prototype.removeDropdownSection = function () {
            if (this.sectionProperties.dropdownSection)
                app.sectionContainer.removeSection(this.sectionProperties.dropdownSection.name);
        };
        ContentControlSection.prototype.addDropDownSection = function () {
            this.sectionProperties.dropdownSection = new ContentControlDropdownSubSection('dropdown' + String(Math.random()), new cool.SimplePoint((this.position[0] + this.size[0]) * app.pixelsToTwips, (this.position[1]) * app.pixelsToTwips), true, this.sectionProperties.dropdownMarkerWidth, this.sectionProperties.dropdownMarkerHeight);
            this.sectionProperties.dropdownSection.size[0] = this.sectionProperties.dropdownMarkerWidth * app.dpiScale;
            this.sectionProperties.dropdownSection.size[1] = this.size[1];
            this.sectionProperties.dropdownSection.sectionProperties.json = this.sectionProperties.json;
            this.sectionProperties.dropdownSection.sectionProperties.parent = this;
            app.sectionContainer.addSection(this.sectionProperties.dropdownSection);
            this.sectionProperties.dropdownSection.adjustHTMLObjectPosition();
            this.sectionProperties.dropdownSection.setShowSection(true);
        };
        ContentControlSection.prototype.getRectangles = function (rect) {
            var rectangles = [];
            //convert string to number coordinates
            var matches = rect.match(/\d+/g);
            if (matches !== null) {
                for (var i = 0; i < matches.length; i += 4) {
                    rectangles.push([parseInt(matches[i]), parseInt(matches[i + 1]), parseInt(matches[i + 2]), parseInt(matches[i + 3])]);
                }
            }
            return rectangles;
        };
        ContentControlSection.prototype.changeBorderStyle = function () {
            var polygonColor = window.prefs.getBoolean('darkTheme') ? 'white' : 'black';
            if (this.sectionProperties.polygonColor !== polygonColor)
                this.sectionProperties.polygonColor = polygonColor;
        };
        return ContentControlSection;
    }(CanvasSectionObject));
    cool.ContentControlSection = ContentControlSection;
})(cool || (cool = {}));
app.definitions.ContentControlSection = cool.ContentControlSection;
//# sourceMappingURL=ContentControlSection.js.map