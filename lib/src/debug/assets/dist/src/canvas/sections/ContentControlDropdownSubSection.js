// @ts-strict-ignore
/* global Proxy _ */
/*
 * Copyright the Collabora Online contributors.
 *
 * SPDX-License-Identifier: MPL-2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
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
var ContentControlDropdownSubSection = /** @class */ (function (_super) {
    __extends(ContentControlDropdownSubSection, _super);
    function ContentControlDropdownSubSection(sectionName, documentPosition, visible, dropdownMarkerWidth, dropdownMarkerHeight) {
        if (visible === void 0) { visible = true; }
        return _super.call(this, sectionName, dropdownMarkerWidth, dropdownMarkerHeight, documentPosition, 'writer-drop-down-marker', visible) || this;
    }
    ContentControlDropdownSubSection.prototype.callback = function (objectType, eventType, object, data, builder) {
        var fireEvent = 'jsdialog';
        if (window.mode.isMobile()) {
            fireEvent = 'mobilewizard';
        }
        var closeDropdownJson = {
            jsontype: 'dialog',
            type: 'modalpopup',
            action: 'close',
            id: builder.windowId,
        };
        if (eventType === 'close') {
            app.map.fire(fireEvent, { data: closeDropdownJson, callback: undefined });
        }
        else if (eventType === 'select') {
            app.socket.sendMessage('contentcontrolevent type=drop-down selected=' + data);
            app.map.fire(fireEvent, { data: closeDropdownJson, callback: undefined });
        }
    };
    ContentControlDropdownSubSection.prototype.showDatePicker = function () {
        if ($('#datepicker').is(':visible')) {
            $('#datepicker').hide();
        }
        else {
            var datePicker = document.getElementById('datepicker');
            datePicker.style.left = String(this.myTopLeft[0] / app.dpiScale) + 'px';
            datePicker.style.top =
                String((this.myTopLeft[1] + this.size[1]) / app.dpiScale) + 'px';
            $('#datepicker').show();
        }
    };
    ContentControlDropdownSubSection.prototype.getDropdownJson = function () {
        if (!this.sectionProperties.json.items)
            return;
        var json = {
            children: [
                {
                    id: 'container-dropdown',
                    type: 'container',
                    text: '',
                    enabled: true,
                    children: [
                        {
                            id: 'contentControlList',
                            type: 'treelistbox',
                            text: '',
                            enabled: true,
                            singleclickactivate: true,
                        },
                    ],
                    vertical: true,
                },
            ],
            jsontype: 'dialog',
            type: 'modalpopup',
            cancellable: true,
            popupParent: '_POPOVER_',
            clickToClose: '_POPOVER_',
            id: 'contentControlModalpopup',
            isPopupPartialScreen: true,
        };
        var entries = [];
        var items = this.sectionProperties.json.items;
        //add entries
        for (var i in items) {
            var entry = {
                text: items[i],
                columns: [
                    {
                        text: items[i],
                    },
                ],
                row: i.toString(),
            };
            entries.push(entry);
        }
        json.children[0].children[0].entries = entries;
        //add position
        json.posx =
            (this.myTopLeft[0] - this.sectionProperties.parent.size[0]) /
                app.dpiScale;
        json.posy = (this.myTopLeft[1] + this.size[1]) / app.dpiScale;
        return json;
    };
    ContentControlDropdownSubSection.prototype.onMouseEnter = function (point, e) {
        app.map.dontHandleMouse = true;
    };
    ContentControlDropdownSubSection.prototype.onMouseLeave = function (point, e) {
        app.map.dontHandleMouse = false;
    };
    ContentControlDropdownSubSection.prototype.containsPoint = function (point) {
        if (this.position[0] <= point[0] &&
            this.position[0] + this.size[0] >= point[0]) {
            if (this.position[1] <= point[1] &&
                this.position[1] + this.size[1] >= point[1])
                return true;
        }
        return false;
    };
    ContentControlDropdownSubSection.prototype.onClick = function (point, e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        this.stopPropagating();
        if (this.sectionProperties.datePicker) {
            this.showDatePicker();
        }
        else if (this.sectionProperties.json.items) {
            var fireEvent = 'jsdialog';
            if (window.mode.isMobile()) {
                fireEvent = 'mobilewizard';
            }
            app.map.fire(fireEvent, {
                data: this.getDropdownJson(),
                callback: this.callback,
            });
        }
    };
    return ContentControlDropdownSubSection;
}(HTMLObjectSection));
app.definitions.contentControlDropdownSubSection =
    ContentControlDropdownSubSection;
//# sourceMappingURL=ContentControlDropdownSubSection.js.map