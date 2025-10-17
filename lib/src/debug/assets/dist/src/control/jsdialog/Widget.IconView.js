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
function _createEntryImage(parent, builder, entryData, image) {
    var img = L.DomUtil.create('img', builder.options.cssClass, parent);
    if (image)
        img.src = image;
    if (entryData.text) {
        img.alt = entryData.text;
    }
    else if (entryData.tooltip) {
        img.alt = entryData.tooltip;
    }
    else {
        img.alt = '';
    }
    if (entryData.tooltip)
        img.title = entryData.tooltip;
    else
        img.title = entryData.text;
}
function _createEntryText(parent, entryData) {
    // Add text below Icon
    L.DomUtil.addClass(parent, 'icon-view-item-container');
    var placeholder = L.DomUtil.create('span', 'ui-iconview-entry-title', parent);
    placeholder.innerText = entryData.text;
}
function _iconViewEntry(parentContainer, parentData, entry, builder) {
    var disabled = parentData.enabled === false;
    var hasText = entry.text && parentData.textWithIconEnabled;
    if (entry.separator && entry.separator === true) {
        L.DomUtil.create('hr', builder.options.cssClass + ' ui-iconview-separator', parentContainer);
        return;
    }
    var entryContainer = L.DomUtil.create('div', builder.options.cssClass + ' ui-iconview-entry', parentContainer);
    //id is needed to find the element to regain focus after widget is updated. see updateWidget in Control.JSDialogBuilder.js
    entryContainer.id = parentData.id + '_' + entry.row;
    // By default `aria-presed` should be false
    entryContainer.setAttribute('aria-pressed', 'false');
    if (entry.selected && entry.selected === true) {
        $(entryContainer).addClass('selected');
        entryContainer.setAttribute('aria-pressed', 'true');
    }
    if (entry.ondemand) {
        var placeholder = L.DomUtil.create('span', builder.options.cssClass, entryContainer);
        placeholder.innerText = entry.text;
        if (entry.tooltip)
            placeholder.title = entry.tooltip;
        else
            placeholder.title = entry.text;
        // Add tabindex attribute for accessibility, enabling keyboard navigation in the icon preview
        entryContainer.setAttribute('tabindex', '0');
        JSDialog.OnDemandRenderer(builder, parentData.id, 'iconview', entry.row, placeholder, entryContainer, entry.text);
    }
    else {
        _createEntryImage(entryContainer, builder, entry, entry.image);
    }
    if (hasText)
        _createEntryText(entryContainer, entry);
    if (!disabled) {
        var singleClick_1 = parentData.singleclickactivate === true;
        $(entryContainer).click(function () {
            entryContainer.setAttribute('tabindex', '0');
            entryContainer.focus();
            //avoid re-selecting already selected entry
            if ($(entryContainer).hasClass('selected'))
                return;
            $('#' + parentData.id + ' .ui-iconview-entry').removeClass('selected');
            builder.callback('iconview', 'select', parentData, entry.row, builder);
            if (singleClick_1) {
                builder.callback('iconview', 'activate', parentData, entry.row, builder);
            }
        });
        entryContainer.addEventListener('contextmenu', function (e) {
            $('#' + parentData.id + ' .ui-iconview-entry').removeClass('selected');
            builder.callback('iconview', 'select', parentData, entry.row, builder);
            $(entryContainer).addClass('selected');
            builder.callback('iconview', 'contextmenu', parentData, entry.row, builder);
            e.preventDefault();
        });
        if (!singleClick_1) {
            $(entryContainer).dblclick(function () {
                builder.callback('iconview', 'activate', parentData, entry.row, builder);
            });
        }
        builder._preventDocumentLosingFocusOnClick(entryContainer);
    }
}
JSDialog.iconView = function (parentContainer, data, builder) {
    var container = L.DomUtil.create('div', builder.options.cssClass + ' ui-iconview', parentContainer);
    container.id = data.id;
    var disabled = data.enabled === false;
    if (disabled)
        L.DomUtil.addClass(container, 'disabled');
    for (var i in data.entries) {
        _iconViewEntry(container, data, data.entries[i], builder);
    }
    var updateAllIndexes = function () {
        // Example: if gridTemplateColumns = "96px 96px 96px"
        // Step 1: Split the string by spaces:           ["96px", "96px", "96px"]
        // Step 2: Remove any empty entries (if any):    ["96px", "96px", "96px"]
        // Step 3: The length of this array is the number of columns in the grid.
        var gridTemplateColumns = getComputedStyle(container).gridTemplateColumns;
        var columns = gridTemplateColumns.split(' ').filter(Boolean).length;
        if (columns > 0) {
            var entries = container.querySelectorAll('.ui-iconview-entry');
            entries.forEach(function (entry, flatIndex) {
                var row = Math.floor(flatIndex / columns);
                var column = flatIndex % columns;
                entry.setAttribute('index', row + ':' + column);
            });
        }
    };
    // update indexes on resize
    var resizeObserver = new ResizeObserver(function () {
        updateAllIndexes();
    });
    resizeObserver.observe(container);
    var firstSelected = $(container).children('.selected').get(0);
    var blockOption = JSDialog._scrollIntoViewBlockOption('nearest');
    if (firstSelected)
        firstSelected.scrollIntoView({
            behavior: 'smooth',
            block: blockOption,
            inline: 'nearest',
        });
    container.onSelect = function (position) {
        $(container).children('.selected').removeClass('selected');
        var entry = container.children.length > position
            ? container.children[position]
            : null;
        if (entry) {
            L.DomUtil.addClass(entry, 'selected');
            var blockOption_1 = JSDialog._scrollIntoViewBlockOption('nearest');
            entry.scrollIntoView({
                behavior: 'smooth',
                block: blockOption_1,
                inline: 'nearest',
            });
        }
        else if (position != -1)
            console.warn('not found entry: "' + position + '" in: "' + container.id + '"');
    };
    container.updateRenders = function (pos) {
        var dropdown = container.querySelectorAll('.ui-iconview-entry, .ui-iconview-separator');
        if (dropdown[pos]) {
            var container_1 = dropdown[pos];
            var entry = data.entries[pos];
            var image = builder.rendersCache[data.id].images[pos];
            var hasText = entry.text && data.textWithIconEnabled;
            container_1.replaceChildren();
            if (hasText) {
                container_1 = L.DomUtil.create('div', builder.options.cssClass, dropdown[pos]);
            }
            _createEntryImage(container_1, builder, entry, image);
            if (hasText)
                _createEntryText(container_1, entry);
        }
    };
    JSDialog.KeyboardGridNavigation(container);
    container.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter' && e.key !== ' ' && e.code !== 'Space')
            return;
        var active = document.activeElement;
        if (!active || !active.classList.contains('ui-iconview-entry'))
            return;
        var iconViewEntries = Array.from(container.querySelectorAll('.ui-iconview-entry'));
        var selectedIndex = iconViewEntries.indexOf(active);
        if (selectedIndex === -1)
            return;
        if (e.key === ' ' || e.code === 'Space')
            builder.callback('iconview', 'select', data, selectedIndex, builder);
        else if (e.key === 'Enter')
            builder.callback('iconview', 'activate', data, selectedIndex, builder);
    });
    return false;
};
//# sourceMappingURL=Widget.IconView.js.map