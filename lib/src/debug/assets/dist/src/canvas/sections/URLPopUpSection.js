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
var URLPopUpSection = /** @class */ (function (_super) {
    __extends(URLPopUpSection, _super);
    function URLPopUpSection(url, documentPosition, linkPosition) {
        var _this = _super.call(this, URLPopUpSection.sectionName, null, null, documentPosition, URLPopUpSection.cssClass) || this;
        _this.containerId = 'hyperlink-pop-up-preview';
        _this.linkId = 'hyperlink-pop-up';
        _this.copyButtonId = 'hyperlink-pop-up-copy';
        _this.editButtonId = 'hyperlink-pop-up-edit';
        _this.removeButtonId = 'hyperlink-pop-up-remove';
        var objectDiv = _this.getHTMLObject();
        objectDiv.remove();
        document.getElementById('document-container').appendChild(objectDiv);
        _this.sectionProperties.url = url;
        _this.createUIElements(url);
        _this.setUpCallbacks(linkPosition);
        document.getElementById('hyperlink-pop-up').title = url;
        if (app.map['wopi'].EnableRemoteLinkPicker)
            app.map.fire('postMessage', { msgId: 'Action_GetLinkPreview', args: { url: url } });
        _this.sectionProperties.documentPosition = documentPosition.clone();
        return _this;
    }
    URLPopUpSection.prototype.getPopUpWidth = function () {
        return this.getHTMLObject().getBoundingClientRect().width;
    };
    URLPopUpSection.prototype.getPopUpHeight = function () {
        return this.getHTMLObject().getBoundingClientRect().height;
    };
    URLPopUpSection.prototype.getPopUpBoundingRectangle = function () {
        return this.getHTMLObject().getBoundingClientRect();
    };
    URLPopUpSection.prototype.createUIElements = function (url) {
        var parent = this.getHTMLObject();
        L.DomUtil.createWithId('div', this.containerId, parent);
        var link = L.DomUtil.createWithId('a', this.linkId, parent);
        link.innerText = url;
        var copyLinkText = _('Copy link location');
        var copyBtn = L.DomUtil.createWithId('div', this.copyButtonId, parent);
        L.DomUtil.addClass(copyBtn, 'hyperlink-popup-btn');
        copyBtn.setAttribute('title', copyLinkText);
        copyBtn.setAttribute('role', 'button');
        copyBtn.setAttribute('aria-label', copyLinkText);
        var imgCopyBtn = L.DomUtil.create('img', 'hyperlink-pop-up-copyimg', copyBtn);
        app.LOUtil.setImage(imgCopyBtn, 'lc_copyhyperlinklocation.svg', app.map);
        imgCopyBtn.setAttribute('width', 18);
        imgCopyBtn.setAttribute('height', 18);
        imgCopyBtn.setAttribute('alt', copyLinkText);
        imgCopyBtn.style.padding = '4px';
        var editLinkText = _('Edit link');
        var editBtn = L.DomUtil.createWithId('div', this.editButtonId, parent);
        L.DomUtil.addClass(editBtn, 'hyperlink-popup-btn');
        editBtn.setAttribute('title', editLinkText);
        editBtn.setAttribute('role', 'button');
        editBtn.setAttribute('aria-label', copyLinkText);
        var imgEditBtn = L.DomUtil.create('img', 'hyperlink-pop-up-editimg', editBtn);
        app.LOUtil.setImage(imgEditBtn, 'lc_edithyperlink.svg', app.map);
        imgEditBtn.setAttribute('width', 18);
        imgEditBtn.setAttribute('height', 18);
        imgEditBtn.setAttribute('alt', editLinkText);
        imgEditBtn.style.padding = '4px';
        var removeLinkText = _('Remove link');
        var removeBtn = L.DomUtil.createWithId('div', this.removeButtonId, parent);
        L.DomUtil.addClass(removeBtn, 'hyperlink-popup-btn');
        removeBtn.setAttribute('title', removeLinkText);
        removeBtn.setAttribute('role', 'button');
        removeBtn.setAttribute('aria-label', removeLinkText);
        var imgRemoveBtn = L.DomUtil.create('img', 'hyperlink-pop-up-removeimg', removeBtn);
        app.LOUtil.setImage(imgRemoveBtn, 'lc_removehyperlink.svg', app.map);
        imgRemoveBtn.setAttribute('width', 18);
        imgRemoveBtn.setAttribute('height', 18);
        imgRemoveBtn.setAttribute('alt', removeLinkText);
        imgRemoveBtn.style.padding = '4px';
        this.arrowDiv = document.createElement('div');
        this.arrowDiv.className = 'arrow-div';
        parent.appendChild(this.arrowDiv);
    };
    URLPopUpSection.prototype.setUpCallbacks = function (linkPosition) {
        var _this = this;
        document.getElementById(this.linkId).onclick = function () {
            if (!_this.sectionProperties.url.startsWith('#'))
                app.map.fire('warn', { url: _this.sectionProperties.url, map: app.map, cmd: 'openlink' });
            else
                app.map.sendUnoCommand('.uno:JumpToMark?Bookmark:string=' + encodeURIComponent(_this.sectionProperties.url.substring(1)));
        };
        var params;
        if (linkPosition) {
            params = {
                PositionX: {
                    type: 'long',
                    value: linkPosition.x
                },
                PositionY: {
                    type: 'long',
                    value: linkPosition.y
                }
            };
        }
        document.getElementById(this.copyButtonId).onclick = function () {
            // If _navigatorClipboardWrite is available, use it.
            if (L.Browser.clipboardApiAvailable || window.ThisIsTheiOSApp)
                app.map._clip.filterExecCopyPaste('.uno:CopyHyperlinkLocation', params);
            else // Or use previous method.
                app.map.sendUnoCommand('.uno:CopyHyperlinkLocation', params);
        };
        document.getElementById(this.editButtonId).onclick = function () {
            app.map.sendUnoCommand('.uno:EditHyperlink', params);
        };
        document.getElementById(this.removeButtonId).onclick = function () {
            app.map.sendUnoCommand('.uno:RemoveHyperlink', params);
            URLPopUpSection.closeURLPopUp();
        };
    };
    URLPopUpSection.prototype.reLocateArrow = function (arrowAtTop) {
        if (arrowAtTop)
            this.arrowDiv.classList.add('reverse');
        else
            this.arrowDiv.classList.remove('reverse');
        /*
            Normally, the documentPosition sent from the core side nicely positions the arrow.
            We will check if we reposition the popup.
            If the arrow position falls outside of the popup, we will put it on the edge.
        */
        var clientRect = this.getPopUpBoundingRectangle();
        var arrowCSSLeft = this.sectionProperties.documentPosition.pX - this.documentTopLeft[0] + this.containerObject.getDocumentAnchor()[0] - URLPopUpSection.arrowHalfWidth;
        arrowCSSLeft /= app.dpiScale;
        arrowCSSLeft += document.getElementById('canvas-container').getBoundingClientRect().left; // Add this in case there is something on its left.
        arrowCSSLeft -= clientRect.left;
        this.arrowDiv.style.left = (arrowCSSLeft > URLPopUpSection.horizontalPadding ? arrowCSSLeft : URLPopUpSection.horizontalPadding) + 'px';
    };
    URLPopUpSection.resetPosition = function (section) {
        if (!section)
            section = app.sectionContainer.getSectionWithName(URLPopUpSection.sectionName);
        if (!section)
            return;
        var originalLeft = section.sectionProperties.documentPosition.pX - section.getPopUpWidth() * 0.5 * app.dpiScale;
        var originalTop = section.sectionProperties.documentPosition.pY - (section.getPopUpHeight() + URLPopUpSection.popupVerticalMargin) * app.dpiScale;
        var checkLeft = originalLeft - section.containerObject.getDocumentTopLeft()[0];
        var checkTop = originalTop - section.containerObject.getDocumentTopLeft()[1];
        var arrowAtTop = false;
        if (checkTop < 0) {
            originalTop = section.sectionProperties.documentPosition.pY + (URLPopUpSection.popupVerticalMargin * 2 * app.dpiScale);
            arrowAtTop = true;
        }
        if (checkLeft < 0)
            originalLeft = section.documentTopLeft[0];
        section.setPosition(originalLeft, originalTop);
        section.adjustHTMLObjectPosition();
        section.reLocateArrow(arrowAtTop);
        section.containerObject.requestReDraw();
    };
    URLPopUpSection.showURLPopUP = function (url, documentPosition, linkPosition) {
        if (URLPopUpSection.isOpen())
            URLPopUpSection.closeURLPopUp();
        var section = new URLPopUpSection(url, documentPosition, linkPosition);
        app.sectionContainer.addSection(section);
        this.resetPosition(section);
    };
    URLPopUpSection.closeURLPopUp = function () {
        if (URLPopUpSection.isOpen())
            app.sectionContainer.removeSection(URLPopUpSection.sectionName);
    };
    URLPopUpSection.isOpen = function () {
        return app.sectionContainer.doesSectionExist(URLPopUpSection.sectionName);
    };
    URLPopUpSection.sectionName = 'URL PopUp';
    URLPopUpSection.cssClass = 'hyperlink-pop-up-container';
    URLPopUpSection.arrowHalfWidth = 10;
    URLPopUpSection.horizontalPadding = 6;
    URLPopUpSection.popupVerticalMargin = 20;
    return URLPopUpSection;
}(HTMLObjectSection));
app.definitions.urlPopUpSection = URLPopUpSection;
//# sourceMappingURL=URLPopUpSection.js.map