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
// TODO: remove this hack
var lastClickHelperRow = -1;
var lastClickHelperId = '';
// TODO: remove this hack
var TreeViewControl = /** @class */ (function () {
    function TreeViewControl(data, builder) {
        this._thead = null;
        this._isRealTree = this.isRealTree(data);
        this._container = L.DomUtil.create('div', builder.options.cssClass + ' ui-treeview');
        this._container.id = data.id;
        this._columns = TreeViewControl.countColumns(data);
        this._hasState = TreeViewControl.hasState(data);
        this._hasIcon = TreeViewControl.hasIcon(data);
        this._isNavigator = this.isNavigator(data);
        this._singleClickActivate = TreeViewControl.isSingleClickActivate(data);
        this._tbody = this._container;
        this._container.filterEntries = this.filterEntries.bind(this);
        this.setupDragAndDrop(data, builder);
        this.setupKeyEvents(data, builder);
        if (this._isRealTree) {
            this._container.setAttribute('role', 'treegrid');
            if (!data.headers || data.headers.length === 0)
                L.DomUtil.addClass(this._container, 'ui-treeview-tree');
        }
        else
            this._container.setAttribute('role', 'grid');
    }
    Object.defineProperty(TreeViewControl.prototype, "Container", {
        get: function () {
            return this._container;
        },
        enumerable: false,
        configurable: true
    });
    TreeViewControl.countColumns = function (data) {
        if (!data.entries || !data.entries.length)
            return data.headers ? data.headers.length : 1;
        var maxColumns = 0;
        for (var e in data.entries) {
            var entry = data.entries[e];
            var count = entry.columns ? entry.columns.length : 0;
            if (count > maxColumns)
                maxColumns = count;
        }
        return maxColumns;
    };
    TreeViewControl.hasState = function (data) {
        for (var e in data.entries) {
            var entry = data.entries[e];
            if (entry.state !== undefined)
                return true;
        }
        return false;
    };
    TreeViewControl.hasIcon = function (data) {
        for (var e in data.entries) {
            var entry = data.entries[e];
            for (var i in entry.columns) {
                if (entry.columns[i].collapsed !== undefined ||
                    entry.columns[i].expanded !== undefined ||
                    entry.columns[i].collapsedimage !== undefined ||
                    entry.columns[i].expandedimage !== undefined) {
                    return true;
                }
            }
        }
        return false;
    };
    TreeViewControl.prototype.findEntryWithRow = function (entries, row) {
        for (var i in entries) {
            if (entries[i].row == row)
                return entries[i];
            else if (entries[i].children) {
                var found = this.findEntryWithRow(entries[i].children, row);
                if (found)
                    return found;
            }
        }
        return null;
    };
    TreeViewControl.prototype.changeCheckboxStateOnClick = function (checkbox, treeViewData, builder, entry) {
        var foundEntry;
        if (checkbox.checked) {
            foundEntry = this.findEntryWithRow(treeViewData.entries, entry.row);
            if (foundEntry)
                checkbox.checked = foundEntry.state = true;
            builder.callback('treeview', 'change', treeViewData, { row: entry.row, value: true }, builder);
        }
        else {
            foundEntry = this.findEntryWithRow(treeViewData.entries, entry.row);
            if (foundEntry)
                checkbox.checked = foundEntry.state = false;
            builder.callback('treeview', 'change', treeViewData, { row: entry.row, value: false }, builder);
        }
    };
    TreeViewControl.prototype.createCheckbox = function (parent, treeViewData, builder, entry) {
        var checkbox = L.DomUtil.create('input', builder.options.cssClass + ' ui-treeview-checkbox', parent);
        checkbox.type = 'checkbox';
        checkbox.tabIndex = -1;
        if (entry.state === true)
            checkbox.checked = true;
        else
            checkbox.checked = false;
        return checkbox;
    };
    TreeViewControl.prototype.createRadioButton = function (parent, treeViewData, builder, entry) {
        var radioButton = L.DomUtil.create('input', builder.options.cssClass + ' ui-treeview-checkbox', parent);
        radioButton.type = 'radio';
        radioButton.tabIndex = -1;
        if (entry.state === true)
            radioButton.checked = true;
        else
            radioButton.checked = false;
        return radioButton;
    };
    TreeViewControl.prototype.createSelectionElement = function (parent, treeViewData, entry, builder) {
        var _this = this;
        var selectionElement;
        var checkboxtype = treeViewData.checkboxtype;
        if (checkboxtype == 'radio') {
            selectionElement = this.createRadioButton(parent, treeViewData, builder, entry);
        }
        else {
            selectionElement = this.createCheckbox(parent, treeViewData, builder, entry);
        }
        if (entry.enabled === false)
            selectionElement.disabled = true;
        if (treeViewData.enabled !== false) {
            selectionElement.addEventListener('change', function () {
                _this.changeCheckboxStateOnClick(selectionElement, treeViewData, builder, entry);
            });
        }
        return selectionElement;
    };
    TreeViewControl.prototype.isSeparator = function (element) {
        if (!element.text)
            return false;
        return element.text.toLowerCase() === 'separator';
    };
    TreeViewControl.isSingleClickActivate = function (treeViewData) {
        return treeViewData.singleclickactivate === true;
    };
    TreeViewControl.prototype.isNavigator = function (data) {
        return (data.id && typeof data.id === 'string' && data.id.startsWith('Navigator'));
    };
    TreeViewControl.prototype.getCellIconId = function (cellData) {
        var iconId = (cellData.collapsed ? cellData.collapsed : cellData.expanded);
        var newLength = iconId.lastIndexOf('.');
        if (newLength > 0)
            iconId = iconId.substr(0, newLength).replaceAll('/', '');
        else
            iconId = iconId.replaceAll('/', '');
        return iconId;
    };
    TreeViewControl.prototype.createImageColumn = function (parentContainer, builder, imageUrl) {
        var colorPreviewButton = L.DomUtil.create('img', builder.options.cssClass + ' ui-treeview-checkbox', parentContainer);
        colorPreviewButton.src = imageUrl;
        colorPreviewButton.style.setProperty('outline', '1px solid var(--color-btn-border)');
        colorPreviewButton.style.setProperty('vertical-align', 'middle');
        colorPreviewButton.tabIndex = -1;
        colorPreviewButton.alt = ''; //In this case, it is advisable to use an empty alt tag, as the information of the function is available in text form
        return colorPreviewButton;
    };
    TreeViewControl.prototype.isExpanded = function (entry) {
        for (var i in entry.columns)
            if (entry.columns[i].expanded === true)
                return true;
        return false;
    };
    TreeViewControl.prototype.fillHeader = function (header, builder) {
        if (!header)
            return;
        var th = L.DomUtil.create('div', builder.options.cssClass + ' ui-treeview-header', this._thead);
        var span = L.DomUtil.create('span', builder.options.cssClass + ' ui-treeview-header-text', th);
        span.innerText = header.text;
        if (header.sortable !== false) {
            L.DomUtil.create('span', builder.options.cssClass + ' ui-treeview-header-sort-icon', span);
        }
    };
    TreeViewControl.prototype.fillRow = function (data, entry, builder, level, parent) {
        var tr = L.DomUtil.create('div', builder.options.cssClass + ' ui-treeview-entry', parent);
        var dummyColumns = 0;
        if (this._hasState)
            dummyColumns++;
        tr.style.gridColumn = '1 / ' + (this._columns + dummyColumns + 1);
        tr.setAttribute('tabindex', 0);
        var selectionElement;
        if (this._hasState) {
            var td = L.DomUtil.create('div', '', tr);
            selectionElement = this.createSelectionElement(td, data, entry, builder);
            if (this._isRealTree)
                td.setAttribute('aria-level', level);
        }
        this.fillCells(entry, builder, data, tr, level, selectionElement);
        this.setupRowProperties(tr, entry, level, selectionElement);
        this.setupRowDragAndDrop(tr, data, entry, builder);
    };
    TreeViewControl.prototype.highlightAllTreeViews = function (highlight) {
        if (highlight) {
            document.querySelectorAll('.ui-treeview').forEach(function (item) {
                L.DomUtil.addClass(item, 'droptarget');
            });
        }
        else {
            document.querySelectorAll('.ui-treeview').forEach(function (item) {
                L.DomUtil.removeClass(item, 'droptarget');
            });
        }
    };
    TreeViewControl.prototype.setupDragAndDrop = function (treeViewData, builder) {
        var _this = this;
        if (treeViewData.enabled !== false) {
            this._container.ondrop = function (ev) {
                ev.preventDefault();
                var row = ev.dataTransfer.getData('text');
                builder.callback('treeview', 'dragend', treeViewData, row, builder);
                _this.highlightAllTreeViews(false);
            };
            this._container.ondragover = function (event) {
                event.preventDefault();
            };
        }
    };
    TreeViewControl.prototype.setupRowDragAndDrop = function (tr, treeViewData, entry, builder) {
        var _this = this;
        if (treeViewData.enabled !== false && entry.state == null) {
            tr.draggable = treeViewData.draggable === false ? false : true;
            tr.ondragstart = function (ev) {
                ev.dataTransfer.setData('text', '' + entry.row);
                builder.callback('treeview', 'dragstart', treeViewData, entry.row, builder);
                _this.highlightAllTreeViews(true);
            };
            tr.ondragend = function () {
                _this.highlightAllTreeViews(false);
            };
            tr.ondragover = function (event) {
                event.preventDefault();
            };
        }
    };
    TreeViewControl.prototype.setupRowProperties = function (tr, entry, level, selectionElement) {
        if (entry.children)
            tr.setAttribute('aria-expanded', 'true');
        if (level !== undefined && this._isRealTree)
            tr.setAttribute('aria-level', '' + level);
        if (entry.selected === true)
            this.selectEntry(tr, selectionElement);
        var disabled = entry.enabled === false;
        if (disabled)
            L.DomUtil.addClass(tr, 'disabled');
        if (entry.ondemand || entry.collapsed) {
            L.DomUtil.addClass(tr, 'collapsed');
            tr.setAttribute('aria-expanded', 'false');
        }
    };
    TreeViewControl.prototype.createExpandableIconCell = function (parent, entry, index, builder) {
        var icon = L.DomUtil.create('img', 'ui-treeview-icon', parent);
        if (this._isNavigator)
            icon.draggable = false;
        var iconId = this.getCellIconId(entry.columns[index]);
        L.DomUtil.addClass(icon, iconId + 'img');
        var iconName = app.LOUtil.getIconNameOfCommand(iconId, true);
        app.LOUtil.setImage(icon, iconName, builder.map);
        icon.tabIndex = -1;
        icon.alt = ''; //In this case, it is advisable to use an empty alt tag for the icons, as the information of the function is available in text form
    };
    TreeViewControl.prototype.createTextCell = function (parent, entry, index, builder) {
        var cell = L.DomUtil.create('span', builder.options.cssClass +
            (" ui-treeview-cell-text ui-treeview-cell-text-content ui-treeview-" + entry.row + "-" + index), parent);
        cell.innerText =
            builder._cleanText(entry.columns[index].text) ||
                builder._cleanText(entry.text);
    };
    TreeViewControl.prototype.createLinkCell = function (parent, entry, index, builder) {
        var cell = L.DomUtil.create('span', builder.options.cssClass + ' ui-treeview-cell-text', parent);
        var link = L.DomUtil.create('a', '', cell);
        link.href = entry.columns[index].link || entry.columns[index].text;
        link.innerText = entry.columns[index].text || entry.text;
        link.target = '_blank';
        link.rel = 'noopener';
    };
    TreeViewControl.prototype.fillCells = function (entry, builder, treeViewData, tr, level, selectionElement) {
        var td, expander, span, text, img, icon, iconId, iconName, link, innerText;
        var rowElements = [];
        // row is a separator
        if (this.isSeparator(entry))
            L.DomUtil.addClass(tr, 'context-menu-separator');
        // column for expander
        if (this._isRealTree) {
            td = L.DomUtil.create('div', 'ui-treeview-expander-column', tr);
            rowElements.push(td);
            if (entry.children && entry.children.length)
                expander = L.DomUtil.create('div', builder.options.cssClass + ' ui-treeview-expander', td);
        }
        // regular columns
        for (var index in entry.columns) {
            td = L.DomUtil.create('div', '', tr);
            rowElements.push(td);
            span = L.DomUtil.create('span', builder.options.cssClass + ' ui-treeview-cell', td);
            text = L.DomUtil.create('span', builder.options.cssClass + ' ui-treeview-cell-text', span);
            if (entry.text == '<dummy>')
                continue;
            img = entry.columns[index].collapsedimage
                ? entry.columns[index].collapsedimage
                : entry.columns[index].expandedimage;
            if (img) {
                L.DomUtil.addClass(td, 'ui-treeview-icon-column');
                this.createImageColumn(text, builder, img);
            }
            else if (entry.columns[index].collapsed ||
                entry.columns[index].expanded) {
                L.DomUtil.addClass(td, 'ui-treeview-icon-column');
                L.DomUtil.addClass(span, 'ui-treeview-expandable-with-icon');
                this.createExpandableIconCell(text, entry, index, builder);
            }
            else if (entry.columns[index].link &&
                !this.isSeparator(entry.columns[index])) {
                this.createLinkCell(text, entry, index, builder);
            }
            else if (entry.columns[index].text &&
                !this.isSeparator(entry.columns[index])) {
                this.createTextCell(text, entry, index, builder);
            }
            // row sub-elements
            for (var i in rowElements) {
                var element = rowElements[i];
                // setup properties
                element.setAttribute('role', 'gridcell');
            }
        }
        // setup callbacks
        var clickFunction = this.createClickFunction(tr, selectionElement, true, this._singleClickActivate, builder, treeViewData, entry);
        var doubleClickFunction = this.createClickFunction(tr, selectionElement, false, true, builder, treeViewData, entry);
        this.setupEntryMouseEvents(tr, entry, treeViewData, builder, selectionElement, expander, clickFunction, doubleClickFunction);
        this.setupEntryKeyEvent(tr, entry, selectionElement, expander, clickFunction);
        this.setupEntryContextMenuEvent(tr, entry, treeViewData, builder);
    };
    TreeViewControl.prototype.setupEntryContextMenuEvent = function (tr, entry, treeViewData, builder) {
        tr.addEventListener('contextmenu', function (e) {
            builder.callback('treeview', 'contextmenu', treeViewData, entry.row, builder);
            e.preventDefault();
        });
    };
    TreeViewControl.prototype.setupEntryMouseEvents = function (tr, entry, treeViewData, builder, selectionElement, expander, clickFunction, doubleClickFunction) {
        var _this = this;
        tr.addEventListener('click', clickFunction);
        if (!this._singleClickActivate) {
            if (window.ThisIsTheiOSApp) {
                // TODO: remove this hack
                tr.addEventListener('click', function (event) {
                    if (L.DomUtil.hasClass(tr, 'disabled'))
                        return;
                    if (entry.row == lastClickHelperRow &&
                        treeViewData.id == lastClickHelperId)
                        doubleClickFunction(event);
                    else {
                        lastClickHelperRow = entry.row;
                        lastClickHelperId = treeViewData.id;
                        setTimeout(function () {
                            lastClickHelperRow = -1;
                        }, 300);
                    }
                });
                // TODO: remove this hack
            }
            else {
                $(tr).dblclick(doubleClickFunction);
            }
        }
        var toggleFunction = function (e) {
            _this.toggleEntry(tr, treeViewData, entry, builder);
            e.preventDefault();
        };
        var expandFunction = function (e) {
            _this.expandEntry(tr, treeViewData, entry, builder);
            e.preventDefault();
        };
        if (expander && entry.children && entry.children.length) {
            if (entry.ondemand) {
                L.DomEvent.on(expander, 'click', expandFunction);
            }
            else {
                $(expander).click(function (e) {
                    if (entry.state && e.target === selectionElement)
                        e.preventDefault(); // do not toggle on checkbox
                    toggleFunction(e.originalEvent);
                });
            }
        }
    };
    TreeViewControl.prototype.setupEntryKeyEvent = function (tr, entry, selectionElement, expander, clickFunction) {
        var _this = this;
        if (entry.enabled === false)
            return;
        tr.addEventListener('keydown', function (event) {
            if (event.key === ' ' && expander) {
                expander.click();
                tr.focus();
                event.preventDefault();
                event.stopPropagation();
            }
            else if (event.key === 'Enter' || event.key === ' ') {
                clickFunction(event);
                if (selectionElement)
                    selectionElement.click();
                if (expander) {
                    expander.click();
                }
                tr.focus();
                event.preventDefault();
                event.stopPropagation();
            }
            else if (event.key === 'Tab') {
                if (!L.DomUtil.hasClass(tr, 'selected'))
                    _this.unselectEntry(tr); // remove tabIndex
            }
        });
    };
    TreeViewControl.prototype.toggleEntry = function (span, treeViewData, entry, builder) {
        if (entry.enabled === false)
            return;
        if (L.DomUtil.hasClass(span, 'collapsed'))
            builder.callback('treeview', 'expand', treeViewData, entry.row, builder);
        else
            builder.callback('treeview', 'collapse', treeViewData, entry.row, builder);
        $(span).toggleClass('collapsed');
    };
    TreeViewControl.prototype.expandEntry = function (span, treeViewData, entry, builder) {
        if (entry.enabled === false)
            return;
        if (entry.ondemand && L.DomUtil.hasClass(span, 'collapsed'))
            builder.callback('treeview', 'expand', treeViewData, entry.row, builder);
        $(span).toggleClass('collapsed');
    };
    TreeViewControl.prototype.selectEntry = function (span, checkbox) {
        this.makeTreeViewFocusable(false);
        L.DomUtil.addClass(span, 'selected');
        span.setAttribute('aria-selected', 'true');
        span.tabIndex = 0;
        span.focus();
        if (checkbox)
            checkbox.removeAttribute('tabindex');
    };
    TreeViewControl.prototype.unselectEntry = function (item) {
        L.DomUtil.removeClass(item, 'selected');
        item.removeAttribute('aria-selected');
        item.removeAttribute('tabindex');
        var itemCheckbox = item.querySelector('input');
        if (itemCheckbox)
            itemCheckbox.tabIndex = -1;
    };
    TreeViewControl.prototype.createClickFunction = function (parentContainer, checkbox, select, activate, builder, treeViewData, entry) {
        var _this = this;
        return function (e) {
            if (e && e.target === checkbox)
                return; // allow default handler to trigger change event
            if (e && L.DomUtil.hasClass(parentContainer, 'disabled')) {
                e.preventDefault();
                return;
            }
            _this._container
                .querySelectorAll('.ui-treeview-entry.selected')
                .forEach(function (item) {
                _this.unselectEntry(item);
            });
            _this.selectEntry(parentContainer, checkbox);
            if (checkbox && (!e || e.target === checkbox))
                _this.changeCheckboxStateOnClick(checkbox, treeViewData, builder, entry);
            var cell = _this.getTextCellForElement(e.target);
            var column;
            var editable = false;
            if (cell) {
                column = _this.getColumnForCell(entry, cell);
                editable = _this.canEdit(entry, column);
            }
            if (select)
                builder.callback('treeview', 'select', treeViewData, entry.row, builder);
            if (!editable && activate)
                builder.callback('treeview', 'activate', treeViewData, entry.row, builder);
            if (editable && activate)
                _this.startEditing(builder, cell, column, entry, parentContainer, treeViewData);
        };
    };
    TreeViewControl.prototype.getTextCellForElement = function (element) {
        var textCells = Array.from(element.getElementsByClassName('ui-treeview-cell-text-content'));
        if (element.classList.contains('ui-treeview-cell-text-content')) {
            textCells.push(element);
        }
        if (textCells.length !== 1) {
            return null;
        }
        var cell = textCells[0];
        return cell;
    };
    TreeViewControl.prototype.getColumnForCell = function (entry, cell) {
        var e_1, _a;
        var column;
        try {
            for (var _b = __values(Array.from(cell.classList)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var className = _c.value;
                var prefix = "ui-treeview-" + entry.row + "-";
                if (className.startsWith(prefix)) {
                    column = parseInt(className.slice(prefix.length));
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        if (column === undefined || Number.isNaN(column)) {
            return null;
        }
        if (column >= entry.columns.length) {
            return null;
        }
        return column;
    };
    TreeViewControl.prototype.canEdit = function (entry, column) {
        if (column === null || entry.columns[column].text === undefined) {
            return false;
        }
        return !!entry.columns[column].editable;
    };
    TreeViewControl.prototype.startEditing = function (builder, cell, column, entry, parentContainer, treeViewData) {
        var e_2, _a, e_3, _b;
        var _this = this;
        try {
            for (var _c = __values(Array.from(cell.childNodes)), _d = _c.next(); !_d.done; _d = _c.next()) {
                var child = _d.value;
                child.remove();
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_2) throw e_2.error; }
        }
        var rowShouldBeDraggable = parentContainer.draggable; // TODO: does this work with tree views or only tables?
        var input = document.createElement('input');
        input.style.width = '100%';
        input.style.boxSizing = 'border-box';
        input.value = entry.columns[column].text;
        input.enterKeyHint = 'done';
        var cancelledUpdate = false;
        input.addEventListener('keydown', function (e) {
            if (e.code === 'Enter') {
                input.blur();
            }
            else if (e.code === 'Escape') {
                cancelledUpdate = true;
                input.blur();
            }
            e.stopImmediatePropagation(); // We need events to type and with some keys that doesn't happen (e.g. space which selects a different cell)
        }, { capture: true });
        var conflictingEventTypes = ['click', 'dblclick'];
        try {
            for (var conflictingEventTypes_1 = __values(conflictingEventTypes), conflictingEventTypes_1_1 = conflictingEventTypes_1.next(); !conflictingEventTypes_1_1.done; conflictingEventTypes_1_1 = conflictingEventTypes_1.next()) {
                var eventType = conflictingEventTypes_1_1.value;
                input.addEventListener(eventType, function (e) {
                    e.stopPropagation();
                });
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (conflictingEventTypes_1_1 && !conflictingEventTypes_1_1.done && (_b = conflictingEventTypes_1.return)) _b.call(conflictingEventTypes_1);
            }
            finally { if (e_3) throw e_3.error; }
        }
        input.addEventListener('blur', function () {
            _this.endEditing(builder, cancelledUpdate, cell, column, entry, input, parentContainer, rowShouldBeDraggable, treeViewData);
        });
        parentContainer.draggable = false;
        parentContainer.parentElement.onFocus = function () {
            /* no-op */
        };
        // We need to cancel focus events - which are used when we select - or we will blur our input and stop editing
        // The grab_focus is on the grid we're already in - i.e. we're not changing anything about what is being selected - so there is no need to re-do a selection/etc. once editing is done
        cell.appendChild(input);
        input.focus();
    };
    TreeViewControl.prototype.endEditing = function (builder, cancelledUpdate, cell, column, entry, input, parentContainer, rowShouldBeDraggable, treeViewData) {
        var e_4, _a;
        parentContainer.draggable = rowShouldBeDraggable;
        parentContainer.parentElement.onFocus = undefined;
        try {
            for (var _b = __values(Array.from(cell.childNodes)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var child = _c.value;
                child.remove();
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_4) throw e_4.error; }
        }
        if (cancelledUpdate) {
            cell.append(entry.columns[column].text);
            return;
        }
        cell.append(input.value);
        // This is changed on core too - but we may as well optimistically set the new value here anyway
        // If core fails the update, it'll send us back the old value
        builder.callback('treeview', 'editend', treeViewData, { row: entry.row, column: column, value: input.value }, builder);
    };
    TreeViewControl.prototype.filterEntries = function (filter) {
        if (this._filterTimer)
            clearTimeout(this._filterTimer);
        var entriesToHide = [];
        var allEntries = this._container.querySelectorAll('.ui-treeview-entry');
        filter = filter.trim();
        allEntries.forEach(function (entry) {
            if (filter === '')
                return;
            var cells = entry.querySelectorAll('div');
            for (var i in cells) {
                var entryText = cells[i].innerText;
                if (entryText &&
                    entryText.toLowerCase().indexOf(filter.toLowerCase()) >= 0) {
                    return;
                }
            }
            entriesToHide.push(entry);
        });
        this._filterTimer = setTimeout(function () {
            allEntries.forEach(function (entry) {
                L.DomUtil.removeClass(entry, 'hidden');
            });
            entriesToHide.forEach(function (entry) {
                L.DomUtil.addClass(entry, 'hidden');
            });
        }, 100);
    };
    TreeViewControl.prototype.setupKeyEvents = function (data, builder) {
        var _this = this;
        this._container.addEventListener('keydown', function (event) {
            var listElements = _this._container.querySelectorAll('.ui-treeview-entry');
            _this.handleKeyEvent(event, listElements, builder, data);
        });
    };
    TreeViewControl.prototype.changeFocusedRow = function (listElements, fromIndex, toIndex) {
        var nextElement = listElements.at(toIndex);
        nextElement.tabIndex = 0;
        nextElement.focus();
        var nextInput = Array.from(listElements
            .at(toIndex)
            .querySelectorAll('.ui-treeview-entry > div > input'));
        if (nextInput && nextInput.length)
            nextInput.at(0).removeAttribute('tabindex');
        if (fromIndex >= 0) {
            var oldElement = listElements.at(fromIndex);
            if (L.DomUtil.hasClass(oldElement, 'selected'))
                return;
            oldElement.removeAttribute('tabindex');
            var oldInput = Array.from(listElements
                .at(fromIndex)
                .querySelectorAll('.ui-treeview-entry > div > input'));
            if (oldInput && oldInput.length)
                oldInput.at(0).tabIndex = -1;
        }
    };
    TreeViewControl.prototype.getCurrentEntry = function (listElements) {
        var focusedElement = document.activeElement;
        // tr - row itself
        var currIndex = listElements.indexOf(focusedElement);
        // input - child of a row
        if (currIndex < 0)
            currIndex = listElements.indexOf(focusedElement.parentNode.parentNode);
        // no focused entry - try with selected one
        if (currIndex < 0) {
            var selected = listElements.filter(function (o) {
                return o.classList.contains('selected');
            });
            if (selected && selected.length)
                currIndex = listElements.indexOf(selected[0]);
        }
        if (currIndex < 0) {
            for (var i in listElements) {
                var parent = listElements[i].parentNode;
                if (parent)
                    parent = parent.parentNode;
                else
                    break;
                if (parent && L.DomUtil.hasClass(parent, 'selected')) {
                    currIndex = listElements.indexOf(listElements[i]);
                    break;
                }
            }
        }
        return currIndex;
    };
    TreeViewControl.prototype.handleKeyEvent = function (event, nodeList, builder, data) {
        var preventDef = false;
        var listElements = Array.from(nodeList); // querySelector returns NodeList not array
        var treeLength = listElements.length;
        var currIndex = this.getCurrentEntry(listElements);
        if (event.key === 'ArrowDown') {
            if (currIndex < 0)
                this.changeFocusedRow(listElements, currIndex, 0);
            else {
                var nextIndex = currIndex + 1;
                while (nextIndex < treeLength - 1 &&
                    listElements[nextIndex].clientHeight <= 0)
                    nextIndex++;
                if (nextIndex < treeLength)
                    this.changeFocusedRow(listElements, currIndex, nextIndex);
            }
            preventDef = true;
        }
        else if (event.key === 'ArrowUp') {
            if (currIndex < 0)
                this.changeFocusedRow(listElements, currIndex, treeLength - 1);
            else {
                var nextIndex = currIndex - 1;
                while (nextIndex >= 0 && listElements[nextIndex].clientHeight <= 0)
                    nextIndex--;
                if (nextIndex >= 0)
                    this.changeFocusedRow(listElements, currIndex, nextIndex);
            }
            preventDef = true;
        }
        else if (data.fireKeyEvents &&
            // FIXME: can callback return boolean?
            builder.callback('treeview', 'keydown', { id: data.id, key: event.key }, currIndex, builder)) {
            // used in mentions
            preventDef = true;
        }
        if (preventDef) {
            event.preventDefault();
            event.stopPropagation();
        }
    };
    TreeViewControl.prototype.isRealTree = function (data) {
        var isRealTreeView = false;
        for (var i in data.entries) {
            if (data.entries[i].children && data.entries[i].children.length) {
                isRealTreeView = true;
                break;
            }
        }
        return isRealTreeView;
    };
    TreeViewControl.prototype.getSortComparator = function (columnIndex, up) {
        return function (a, b) {
            if (!a || !b)
                return 0;
            var tda = a.querySelectorAll('div').item(columnIndex);
            var tdb = b.querySelectorAll('div').item(columnIndex);
            if (tda.querySelector('input')) {
                if (tda.querySelector('input').checked ===
                    tdb.querySelector('input').checked)
                    return 0;
                if (up) {
                    if (tda.querySelector('input').checked >
                        tdb.querySelector('input').checked)
                        return 1;
                    else
                        return -1;
                }
                else if (tdb.querySelector('input').checked >
                    tda.querySelector('input').checked)
                    return 1;
                else
                    return -1;
            }
            if (up)
                return tdb.innerText
                    .toLowerCase()
                    .localeCompare(tda.innerText.toLowerCase());
            else
                return tda.innerText
                    .toLowerCase()
                    .localeCompare(tdb.innerText.toLowerCase());
        };
    };
    TreeViewControl.prototype.sortByColumn = function (icon, columnIndex, up) {
        this.clearSorting();
        L.DomUtil.addClass(icon, up ? 'up' : 'down');
        var toSort = [];
        var container = this._container;
        container
            .querySelectorAll(':not(.ui-treeview-expanded-content) .ui-treeview-entry')
            .forEach(function (item) {
            toSort.push(item);
            container.removeChild(item);
        });
        toSort.sort(this.getSortComparator(columnIndex, up));
        toSort.forEach(function (item) {
            container.insertBefore(item, container.lastChild.nextSibling);
        });
    };
    TreeViewControl.prototype.clearSorting = function () {
        var icons = this._thead.querySelectorAll('.ui-treeview-header-sort-icon');
        icons.forEach(function (icon) {
            L.DomUtil.removeClass(icon, 'down');
            L.DomUtil.removeClass(icon, 'up');
        });
    };
    TreeViewControl.prototype.fillHeaders = function (headers, builder) {
        var _this = this;
        if (!headers)
            return;
        this._thead = L.DomUtil.create('div', 'ui-treeview-headers', this._container);
        var dummyCells = this._columns - headers.length;
        if (this._hasState)
            dummyCells++;
        this._thead.style.gridColumn = '1 / ' + (this._columns + dummyCells + 1);
        for (var index = 0; index < dummyCells; index++) {
            this.fillHeader({ text: '', sortable: false }, builder);
            if (index === 0 && this._hasState)
                L.DomUtil.addClass(this._thead.lastChild, 'ui-treeview-state-column');
            else
                L.DomUtil.addClass(this._thead.lastChild, 'ui-treeview-icon-column');
        }
        for (var index in headers) {
            this.fillHeader(headers[index], builder);
            if (headers[index].sortable === false)
                continue;
            var clickFunction = function (columnIndex, icon) {
                return function () {
                    if (L.DomUtil.hasClass(icon, 'down'))
                        _this.sortByColumn(icon, columnIndex + dummyCells, true);
                    else
                        _this.sortByColumn(icon, columnIndex + dummyCells, false);
                };
            };
            var last = this._thead.lastChild;
            last.onclick = clickFunction(parseInt(index), last.querySelector('.ui-treeview-header-sort-icon'));
        }
    };
    TreeViewControl.prototype.makeEmptyList = function (data, builder) {
        // contentbox and tree can never be empty, 1 page or 1 sheet always exists
        if (data.id === 'contenttree') {
            var tr = L.DomUtil.create('div', builder.options.cssClass + ' ui-treview-entry ui-treeview-placeholder', this._container);
            tr.innerText = _('Headings and objects that you add to the document will appear here');
        }
        else {
            L.DomUtil.addClass(this._container, 'empty');
            if (data.hideIfEmpty)
                L.DomUtil.addClass(this._container, 'hidden');
        }
    };
    TreeViewControl.prototype.makeTreeViewFocusable = function (enable) {
        if (enable)
            this._container.tabIndex = 0;
        else
            this._container.removeAttribute('tabindex');
    };
    TreeViewControl.prototype.fillEntries = function (data, entries, builder, level, parent) {
        var hasSelectedEntry = false;
        for (var index in entries) {
            this.fillRow(data, entries[index], builder, level, parent);
            hasSelectedEntry = hasSelectedEntry || entries[index].selected;
            if (entries[index].children && entries[index].children.length) {
                L.DomUtil.addClass(parent.lastChild, 'ui-treeview-expandable');
                var subGrid = L.DomUtil.create('div', 'ui-treeview-expanded-content', parent);
                var dummyColumns = 0;
                if (this._hasState)
                    dummyColumns++;
                subGrid.style.gridColumn = '1 / ' + (this._columns + dummyColumns + 1);
                this.fillEntries(data, entries[index].children, builder, level + 1, subGrid);
            }
        }
        if (entries && entries.length === 0)
            this.makeEmptyList(data, builder);
        // we need to provide a way for making the treeview control focusable
        // when no entry is selected
        if (level === 1 && !hasSelectedEntry)
            this.makeTreeViewFocusable(true);
    };
    TreeViewControl.prototype.getColumnType = function (column) {
        var isString = column.link || column.text;
        var isIcon = column.collapsed ||
            column.collapsedimage ||
            column.expanded ||
            column.expandedimage;
        var columnType = 'unknown';
        if (this.isSeparator(column))
            columnType = 'separator';
        else if (isString)
            columnType = 'string';
        else if (isIcon)
            columnType = 'icon';
        return columnType;
    };
    TreeViewControl.prototype.preprocessColumnData = function (entires) {
        var _this = this;
        if (!entires || !entires.length)
            return;
        // generate array of types for each entry
        var columnTypes = entires
            .map(function (entry) {
            var currentTypes = new Array();
            entry.columns.forEach(function (column) {
                currentTypes.push(_this.getColumnType(column));
            });
            return currentTypes;
        })
            .reduce(function (prev, next) {
            if (!next || prev.length > next.length)
                return prev;
            return next;
        });
        // put missing dummy columns where are missing
        entires.forEach(function (entry) {
            var existingColumns = entry.columns;
            var missingColumns = columnTypes.length - existingColumns.length;
            if (missingColumns <= 0)
                return;
            var newColumns = Array();
            var targetIndex = 0;
            var existingIndex = 0;
            while (targetIndex < columnTypes.length) {
                var isExistingColumn = existingIndex < existingColumns.length;
                var currentType = isExistingColumn
                    ? _this.getColumnType(existingColumns[existingIndex])
                    : 'unknown';
                if (currentType === 'separator')
                    break; // don't add new columns - full width
                if (!isExistingColumn || currentType !== columnTypes[targetIndex]) {
                    newColumns.push({ text: '' });
                }
                else {
                    newColumns.push(existingColumns[existingIndex]);
                    existingIndex++;
                }
                targetIndex++;
            }
            entry.columns = newColumns;
        });
    };
    TreeViewControl.prototype.build = function (data, builder, parentContainer) {
        this.preprocessColumnData(data.entries);
        this.fillHeaders(data.headers, builder);
        this.fillEntries(data, data.entries, builder, 1, this._tbody);
        parentContainer.appendChild(this._container);
        return true;
    };
    return TreeViewControl;
}());
JSDialog.treeView = function (parentContainer, data, builder) {
    var treeView = new TreeViewControl(data, builder);
    treeView.build(data, builder, parentContainer);
    return false;
};
JSDialog.isDnDActive = function () {
    var dndElements = document.querySelectorAll('.droptarget');
    return dndElements && dndElements.length;
};
//# sourceMappingURL=Widget.TreeView.js.map