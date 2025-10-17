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
/*
 * JSDialog.MobileTabControl - widgets handling tabs on mobile
 *
 * Example JSON:
 * {
 *     id: 'id',
 *     type: 'tabcontrol',
 *     children: [...]
 * }
 */
/* global JSDialog $ */
function _panelTabsHandler(parentContainer, data, builder, tabTooltip, isTabControl) {
    if (!builder.options.useSetTabs)
        console.warn('mobile panelTabsHandler: setTabs will be used ignoring useSetTabs property');
    var tabsContainer = L.DomUtil.create('div', 'ui-tabs ' + builder.options.cssClass + ' ui-widget');
    var contentsContainer = L.DomUtil.create('div', 'ui-tabs-content ' + builder.options.cssClass + ' ui-widget', parentContainer);
    var tabIdx, item;
    if (!isTabControl) {
        for (var tabIdx = data.length - 1; tabIdx >= 0; tabIdx--) {
            var item = data[tabIdx];
            if (item.hidden === true)
                data.splice(tabIdx, 1);
        }
    }
    var tabs = [];
    var contentDivs = [];
    var labels = [];
    for (tabIdx = 0; tabIdx < data.length; tabIdx++) {
        item = data[tabIdx];
        var title = builder._cleanText(item.text);
        var tab = L.DomUtil.create('div', 'ui-tab ' + builder.options.cssClass, tabsContainer);
        tab.id = title;
        tabs[tabIdx] = tab;
        var label = L.DomUtil.create('span', 'ui-tab-content ' + builder.options.cssClass + ' unolabel', tab);
        label.textContent = title;
        labels[tabIdx] = title;
        var contentDiv = L.DomUtil.create('div', 'ui-content level-' + builder._currentDepth + ' ' + builder.options.cssClass, contentsContainer);
        contentDiv.title = title;
        builder._currentDepth++;
        if (item.children) {
            for (var i = 0; i < item.children.length; i++) {
                builder.build(contentDiv, [item.children[i]]);
            }
        }
        else // build ourself inside there
         {
            builder.build(contentDiv, [item]);
        }
        builder._currentDepth--;
        $(contentDiv).addClass('hidden');
        contentDivs[tabIdx] = contentDiv;
    }
    if (builder.wizard) {
        builder.wizard.setTabs(tabsContainer, builder);
        for (var t = 0; t < tabs.length; t++) {
            // to get capture of 't' right has to be a sub fn.
            var fn = builder._createTabClick(builder, t, tabs, contentDivs, labels);
            $(tabs[t]).click(fn);
        }
    }
    else {
        window.app.console.debug('Builder used outside of mobile wizard: please implement the click handler');
    }
    $(tabs[0]).click();
    builder.wizard.goLevelDown(contentsContainer);
    return false;
}
// use unified tabs handling in mobile wizard so Tab Control is show exactly like Panels
function _tabsToPanelConverter(parentContainer, data, builder, tabTooltip) {
    var tabs = 0;
    var tabObjects = [];
    for (var tabIdx = 0; data.children && tabIdx < data.children.length; tabIdx++) {
        if (data.children[tabIdx].type === 'tabpage' || data.vertical) {
            tabs++;
            tabObjects.push(data.children[tabIdx]);
        }
    }
    var isMultiTabJSON = tabs > 1;
    if (data.tabs) {
        for (tabIdx = 0; data.tabs && tabIdx < data.tabs.length; tabIdx++) {
            var isSelectedTab = data.selected == data.tabs[tabIdx].id;
            if (isSelectedTab) {
                var singleTabId = tabIdx;
            }
        }
    }
    if (isMultiTabJSON) {
        var tabId = 0;
        for (tabIdx = 0; tabIdx < data.children.length; tabIdx++) {
            var tab = data.children[tabIdx];
            if (tab.type !== 'tabpage' && !data.vertical)
                continue;
            tabObjects[tabId].text = data.tabs[tabId].text;
            tabId++;
        }
    }
    else {
        for (tabIdx = 0; tabIdx < data.children.length; tabIdx++) {
            tab = data.children[tabIdx];
            if (tab.type !== 'tabpage' && !data.vertical)
                continue;
            tabObjects[singleTabId].text = data.tabs[singleTabId].text;
            break;
        }
    }
    _panelTabsHandler(parentContainer, tabObjects, builder, tabTooltip, true);
    return false;
}
// if the tabs list is too long, it ends up being pretty messy. We should switch to submenus in that case
function _tabsToSubmenuConverter(parentContainer, data, builder) {
    var e_1, _a;
    var submenuChildren = [];
    try {
        for (var _b = __values(Object.entries(data.children)), _c = _b.next(); !_c.done; _c = _b.next()) {
            var _d = __read(_c.value, 2), index = _d[0], tab = _d[1];
            if (tab.type !== 'tabpage') {
                continue;
            }
            submenuChildren.push({
                children: tab.children,
                command: tab.command,
                enabled: true,
                executionType: 'menu',
                id: tab.id,
                parent: parentContainer,
                text: data.tabs[index].text,
                type: 'submenu',
            });
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
    data.children = submenuChildren;
    return JSDialog.container(parentContainer, data, builder);
}
JSDialog.mobileTabControl = function (parentContainer, data, builder) {
    var buildInnerData = _tabsToPanelConverter(parentContainer, data, builder);
    return buildInnerData;
};
JSDialog.mobilePanelControl = function (parentContainer, data, builder) {
    var buildInnerData = _panelTabsHandler(parentContainer, data, builder);
    return buildInnerData;
};
JSDialog.mobileSubmenuTabControl = function (parentContainer, data, builder) {
    var buildInnerData = _tabsToSubmenuConverter(parentContainer, data, builder);
    return buildInnerData;
};
//# sourceMappingURL=Widget.MobileTabControl.js.map