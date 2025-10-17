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
function findColorName(hexCode) {
    var color = window.app.colorNames.find(function (c) { return c.hexCode.toLowerCase() === hexCode.toLowerCase(); });
    return color ? color.name : _('Unknown color');
}
function getCurrentPaletteName() {
    var palette = window.prefs.get('colorPalette');
    if (palette === undefined ||
        window.app.colorPalettes[palette] === undefined) {
        return 'StandardColors';
    }
    return palette;
}
// TODO: we don't need to use that format now - simplify?
function toW2Palette(corePalette) {
    var pal = [];
    if (!corePalette)
        return pal;
    for (var i = 0; i < corePalette.length; i++) {
        var row = [];
        for (var j = 0; j < corePalette[i].length; j++) {
            row.push(String(corePalette[i][j].Value).toUpperCase());
        }
        pal.push(row);
    }
    return pal;
}
function generatePalette(paletteName) {
    var colorPalette = toW2Palette(window.app.colorPalettes[paletteName].colors);
    var customColorRow = window.prefs.get('customColor');
    var recentRow = window.prefs.get('recentColor');
    if (customColorRow !== undefined) {
        colorPalette.push(JSON.parse(customColorRow));
    }
    else {
        colorPalette.push(['F2F2F2', 'F2F2F2', 'F2F2F2', 'F2F2F2', 'F2F2F2']); // custom colors (up to 4)
    }
    if (recentRow !== undefined) {
        colorPalette.push(JSON.parse(recentRow));
    }
    else {
        colorPalette.push([
            'F2F2F2',
            'F2F2F2',
            'F2F2F2',
            'F2F2F2',
            'F2F2F2',
            'F2F2F2',
            'F2F2F2',
            'F2F2F2',
        ]); // recent colors (up to 8)
    }
    return colorPalette;
}
function createColor(parentContainer, builder, colorItem, index, themeData, widgetData, isCurrent, themeColors) {
    var color = L.DomUtil.create('div', builder.options.cssClass + ' ui-color-picker-entry', parentContainer);
    color.style.backgroundColor = '#' + colorItem;
    color.setAttribute('name', colorItem);
    color.setAttribute('index', index);
    color.tabIndex = 0;
    color.innerHTML = isCurrent ? '&#149;' : '&#160;';
    if (themeData)
        color.setAttribute('theme', themeData);
    // Set color tooltips
    var colorTooltip;
    var found = themeColors.find(function (item) { return item.Value.toLowerCase() === colorItem.toLowerCase(); });
    if (found)
        colorTooltip = found.Name;
    else if (window.app.colorNames)
        colorTooltip = findColorName(colorItem);
    else
        colorTooltip = _('Unknown color');
    color.setAttribute('data-cooltip', colorTooltip);
    // Assuming 'color' is your target HTMLElement
    color.addEventListener('click', function (event) {
        handleColorSelection(event.target, // The clicked element
        builder, // Pass the builder object
        widgetData);
    });
    color.addEventListener('keydown', function (event) {
        if (event.code === 'Enter') {
            handleColorSelection(event.target, // The clicked element
            builder, // Pass the builder object
            widgetData);
        }
    });
    L.control.attachTooltipEventListener(color, builder.map);
    return color;
}
function handleColorSelection(target, builder, widgetData) {
    var palette = generatePalette(getCurrentPaletteName());
    var colorCode = target.getAttribute('name');
    var themeData = target.getAttribute('theme');
    if (colorCode != null) {
        JSDialog.sendColorCommand(builder, widgetData, colorCode, themeData);
        builder.callback('colorpicker', 'hidedropdown', widgetData, themeData ? themeData : colorCode, builder);
    }
    else {
        JSDialog.sendColorCommand(builder, widgetData, 'transparent');
        builder.callback('colorpicker', 'hidedropdown', widgetData, 'transparent', builder);
    }
    // Update the recent colors list
    var recentRow = palette[palette.length - 1];
    if (recentRow.indexOf(colorCode) !== -1)
        recentRow.splice(recentRow.indexOf(colorCode), 1);
    recentRow.unshift(colorCode);
    window.prefs.set('recentColor', JSON.stringify(recentRow));
}
function createAutoColorButton(parentContainer, data, builder) {
    // Create a div container for the button
    var buttonContainer = L.DomUtil.create('div', 'auto-color-button-container', parentContainer);
    var hasTransparent = data.command !== '.uno:FontColor' && data.command !== '.uno:Color';
    var buttonText = hasTransparent ? _('No fill') : _('Automatic');
    var autoButton = L.DomUtil.create('button', builder.options.cssClass + ' ui-pushbutton auto-color-button', buttonContainer);
    autoButton.id = 'transparent-color-button';
    autoButton.innerText = buttonText;
    autoButton.tabIndex = '0';
    autoButton.focus();
    autoButton.addEventListener('click', function () {
        JSDialog.sendColorCommand(builder, data, 'transparent');
        builder.callback('colorpicker', 'hidedropdown', data, '-1', builder);
    });
}
function createPaletteSwitch(parentContainer, builder) {
    var paletteListbox = L.DomUtil.create('div', builder.options.cssClass + ' ui-listbox-container color-palette-selector', parentContainer);
    var listbox = L.DomUtil.create('select', builder.options.cssClass + ' ui-listbox', paletteListbox);
    listbox.setAttribute('aria-labelledby', 'color-palette');
    listbox.setAttribute('tabindex', '0');
    for (var i in window.app.colorPalettes) {
        var paletteOption = L.DomUtil.create('option', '', listbox);
        if (i === getCurrentPaletteName())
            paletteOption.setAttribute('selected', 'selected');
        paletteOption.value = i;
        paletteOption.innerText = window.app.colorPalettes[i].name;
    }
    L.DomUtil.create('span', builder.options.cssClass + ' ui-listbox-arrow', paletteListbox);
    return listbox;
}
function updatePalette(paletteName, data, builder, paletteContainer, customContainer, recentContainer) {
    var hexColor = String(JSDialog.getCurrentColor(data, builder));
    var currentColor = hexColor.toUpperCase().replace('#', '');
    var palette = generatePalette(paletteName);
    var detailedPalette = window.app.colorPalettes[paletteName].colors;
    var themeColors = window.app.colorPalettes['ThemeColors'].colors.flat();
    paletteContainer.style.gridTemplateRows =
        'repeat(' + (palette.length - 2) + ', auto)';
    paletteContainer.style.gridTemplateColumns =
        'repeat(' + palette[0].length + ', auto)';
    paletteContainer.replaceChildren();
    for (var i = 0; i < palette.length - 2; i++) {
        for (var j = 0; j < palette[i].length; j++) {
            var themeData = detailedPalette[i][j].Data
                ? JSON.stringify(detailedPalette[i][j].Data)
                : undefined;
            createColor(paletteContainer, builder, palette[i][j], i + ':' + j, themeData, data, currentColor == palette[i][j], themeColors);
        }
    }
    customContainer.replaceChildren();
    var customInput = L.DomUtil.create('input', '', customContainer);
    customInput.placeholder = '#FFF000';
    customInput.maxlength = 7;
    customInput.type = 'text';
    customInput.addEventListener('change', function () {
        var color = customInput.value;
        if (color.indexOf('#') === 0)
            color = color.substr(1);
        if (color.length != 6) {
            customInput.value = '';
            return;
        }
        var customColorRow = palette[palette.length - 2];
        if (customColorRow.indexOf(color) !== -1) {
            customColorRow.splice(customColorRow.indexOf(color), 1);
        }
        customColorRow.unshift(color.toUpperCase());
        window.prefs.set('customColor', JSON.stringify(customColorRow));
        updatePalette(paletteName, data, builder, paletteContainer, customContainer, recentContainer);
    });
    var customColors = palette[palette.length - 2];
    for (var i = 0; i < customColors.length && i < 4; i++) {
        createColor(customContainer, builder, customColors[i], '8:' + i, undefined, data, currentColor == customColors[i], themeColors);
    }
    recentContainer.replaceChildren();
    var recentColors = palette[palette.length - 1];
    for (var i = 0; i < recentColors.length && i < 8; i++) {
        createColor(recentContainer, builder, recentColors[i], '9:' + i, undefined, data, currentColor == recentColors[i], themeColors);
    }
}
JSDialog.colorPicker = function (parentContainer, data, builder) {
    var container = L.DomUtil.create('div', 'ui-color-picker', parentContainer);
    container.id = data.id;
    container.tabIndex = '-1'; // focus should be on first element in grid for color picker
    createAutoColorButton(container, data, builder);
    var listbox = createPaletteSwitch(container, builder);
    var paletteContainer = L.DomUtil.create('div', builder.options.cssClass + ' ui-color-picker-palette', container);
    var customContainer = L.DomUtil.createWithId('div', 'ui-color-picker-custom', container);
    var recentLabel = L.DomUtil.create('label', '', container);
    recentLabel.innerText = _('Recent');
    recentLabel.htmlFor = 'ui-color-picker-recent';
    var recentContainer = L.DomUtil.createWithId('div', 'ui-color-picker-recent', container);
    updatePalette(getCurrentPaletteName(), data, builder, paletteContainer, customContainer, recentContainer);
    listbox.addEventListener('change', function () {
        var newPaletteName = listbox.value;
        window.prefs.set('colorPalette', newPaletteName);
        updatePalette(newPaletteName, data, builder, paletteContainer, customContainer, recentContainer);
    });
    JSDialog.MakeFocusCycle(container);
    return false;
};
//# sourceMappingURL=Widget.ColorPicker.js.map