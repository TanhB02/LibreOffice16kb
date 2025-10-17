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
function sanitizeString(text) {
    var sanitizer = document.createElement('div');
    sanitizer.innerText = text;
    return sanitizer.innerHTML;
}
function getPermissionModeElements(isReadOnlyMode, canUserWrite, map) {
    var permissionModeDiv = document.createElement('div');
    permissionModeDiv.className = 'jsdialog ui-badge';
    if (isReadOnlyMode && !canUserWrite) {
        permissionModeDiv.classList.add('status-readonly-mode');
        permissionModeDiv.textContent = _('Read-only');
        permissionModeDiv.setAttribute('data-cooltip', _('Permission Mode'));
        L.control.attachTooltipEventListener(permissionModeDiv, map);
    }
    else if (isReadOnlyMode && canUserWrite) {
        permissionModeDiv.classList.add('status-readonly-transient-mode');
        permissionModeDiv.style.display = 'none';
    }
    else {
        permissionModeDiv.classList.add('status-edit-mode');
        permissionModeDiv.textContent = _('Edit mode');
        permissionModeDiv.setAttribute('data-cooltip', _('Permission Mode'));
        L.control.attachTooltipEventListener(permissionModeDiv, map);
    }
    return permissionModeDiv;
}
function getStatusbarItemElements(id, title, text, builder) {
    var div = document.createElement('div');
    div.id = id;
    div.className = 'jsdialog ui-badge';
    div.textContent = text;
    div.setAttribute('data-cooltip', title);
    L.control.attachTooltipEventListener(div, builder.map);
    return div;
}
function getPageNumberElements(text, builder) {
    return getStatusbarItemElements('StatePageNumber', _('Number of Pages'), text, builder);
}
function getWordCountElements(text, builder) {
    return getStatusbarItemElements('StateWordCount', _('Word Counter'), text, builder);
}
function getStatusDocPosElements(text, builder) {
    return getStatusbarItemElements('StatusDocPos', _('Number of Sheets'), text, builder);
}
function getInsertModeElements(text, builder) {
    return getStatusbarItemElements('InsertMode', _('Entering text mode'), text, builder);
}
function getSelectionModeElements(text, builder) {
    return getStatusbarItemElements('StatusSelectionMode', _('Selection Mode'), text, builder);
}
function getRowColSelCountElements(text, builder) {
    return getStatusbarItemElements('RowColSelCount', _('Selected range of cells'), text, builder);
}
function getStateTableCellElements(text, builder) {
    return getStatusbarItemElements('StateTableCell', _('Choice of functions'), text, builder);
}
function getSlideStatusElements(text, builder) {
    return getStatusbarItemElements('SlideStatus', _('Number of Slides'), text, builder);
}
function getPageStatusElements(text, builder) {
    return getStatusbarItemElements('PageStatus', _('Number of Pages'), text, builder);
}
function getDocumentStatusElements(text, builder) {
    var docstat = getStatusbarItemElements('DocumentStatus', _('Your changes have been saved'), '', builder);
    if (text === 'SAVING')
        docstat.textContent = _('Saving...');
    else if (text === 'SAVED') {
        var lastSaved = document.createElement('span');
        lastSaved.id = 'last-saved';
        lastSaved.textContent = '';
        lastSaved.setAttribute('data-cooltip', _('Your changes have been saved') + '.');
        L.control.attachTooltipEventListener(lastSaved, builder.map);
        docstat.appendChild(lastSaved);
    }
    return docstat;
}
function getShowCommentsStatusElements(text, builder) {
    return getStatusbarItemElements('ShowComments', _('Show Comments'), text, builder);
}
var getElementsFromId = function (id, closeCallback, data, builder) {
    if (id === 'iconset')
        return window.getConditionalFormatMenuElements('iconsetoverlay', true);
    else if (id === 'scaleset')
        return window.getConditionalColorScaleMenuElements('iconsetoverlay', true);
    else if (id === 'databarset')
        return window.getConditionalDataBarMenuElements('iconsetoverlay', true);
    else if (id === 'inserttablepopup')
        return window.getInsertTablePopupElements(closeCallback);
    else if (id === 'borderstylepopup')
        return window.getBorderStyleMenuElements(closeCallback);
    else if (id === 'insertshapespopup')
        return window.getShapesPopupElements(closeCallback);
    else if (id === 'insertconnectorspopup')
        return window.getConnectorsPopupElements(closeCallback);
    else if (id === 'userslistpopup')
        return L.control.createUserListWidget();
    else if (id === 'permissionmode')
        return getPermissionModeElements(data.isReadOnlyMode, data.canUserWrite, builder.map);
    else if (id === 'statepagenumber')
        return getPageNumberElements(data.text, builder);
    else if (id === 'statewordcount')
        return getWordCountElements(data.text, builder);
    else if (id === 'showcomments')
        return getShowCommentsStatusElements(data.text, builder);
    else if (id === 'statusdocpos')
        return getStatusDocPosElements(data.text, builder);
    else if (id === 'insertmode')
        return getInsertModeElements(data.text, builder);
    else if (id === 'statusselectionmode')
        return getSelectionModeElements(data.text, builder);
    else if (id === 'rowcolselcount')
        return getRowColSelCountElements(data.text, builder);
    else if (id === 'statetablecell')
        return getStateTableCellElements(data.text, builder);
    else if (id === 'slidestatus')
        return getSlideStatusElements(data.text, builder);
    else if (id === 'pagestatus')
        return getPageStatusElements(data.text, builder);
    else if (id === 'documentstatus')
        return getDocumentStatusElements(data.text, builder);
};
function htmlContent(parentContainer, data, builder) {
    parentContainer.replaceChildren();
    var elements = getElementsFromId(data.htmlId, data.closeCallback, data, builder);
    parentContainer.appendChild(elements);
    // TODO: remove this and create real widget for userslistpopup
    if (data.htmlId === 'userslistpopup')
        setTimeout(function () { return builder.map.userList.renderAll(); }, 0);
    if (data.enabled === false && parentContainer.firstChild)
        parentContainer.firstChild.setAttribute('disabled', 'true');
}
JSDialog.htmlContent = htmlContent;
//# sourceMappingURL=Widget.HTMLContent.js.map