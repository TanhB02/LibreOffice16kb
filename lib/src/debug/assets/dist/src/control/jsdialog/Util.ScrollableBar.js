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
function createScrollButtons(parent, scrollable) {
    L.DomUtil.addClass(scrollable, 'ui-scroll-wrapper');
    var left = L.DomUtil.create('div', 'ui-scroll-left', parent);
    var right = L.DomUtil.create('div', 'ui-scroll-right', parent);
    JSDialog.AddOnClick(left, function () {
        var scroll = $(scrollable).scrollLeft() - 300;
        $(scrollable).animate({ scrollLeft: scroll }, 300);
        setTimeout(function () {
            JSDialog.RefreshScrollables();
        }, 350);
    });
    JSDialog.AddOnClick(right, function () {
        var scroll = $(scrollable).scrollLeft() + 300;
        $(scrollable).animate({ scrollLeft: scroll }, 300);
        setTimeout(function () {
            JSDialog.RefreshScrollables();
        }, 350);
    });
}
function showArrow(arrow, show) {
    if (show)
        arrow.style.setProperty('display', 'block');
    else
        arrow.style.setProperty('display', 'none');
}
function setupResizeHandler(container, scrollable) {
    var left = container.querySelector('.ui-scroll-left');
    var right = container.querySelector('.ui-scroll-right');
    var isRTL = document.documentElement.dir === 'rtl';
    var timer; // for shift + mouse wheel up/down
    var handler = function () {
        var rootContainer = scrollable.querySelector('div');
        if (!rootContainer)
            return;
        if (rootContainer.scrollWidth > window.innerWidth) {
            // we have overflowed content
            var direction = isRTL ? -1 : 1;
            if (direction * scrollable.scrollLeft > 0) {
                if (isRTL)
                    showArrow(right, true);
                else
                    showArrow(left, true);
            }
            else if (isRTL)
                showArrow(right, false);
            else
                showArrow(left, false);
            if (direction * scrollable.scrollLeft <
                rootContainer.scrollWidth - window.innerWidth - 1) {
                if (isRTL)
                    showArrow(left, true);
                else
                    showArrow(right, true);
            }
            else if (isRTL)
                showArrow(left, false);
            else
                showArrow(right, false);
        }
        else {
            showArrow(left, false);
            showArrow(right, false);
        }
    }.bind(this);
    // handler for toolbar and statusbar
    // runs if shift + mouse wheel up/down are used
    var shiftHandler = function (e) {
        var rootContainer = scrollable.querySelector('div');
        if (!rootContainer || !e.shiftKey)
            return;
        clearTimeout(timer);
        // wait until mouse wheel stops scrolling
        timer = setTimeout(function () {
            JSDialog.RefreshScrollables();
        }, 350);
    };
    window.addEventListener('resize', handler);
    window.addEventListener('scroll', handler);
    scrollable.addEventListener('wheel', shiftHandler);
}
function setupPriorityStatusHandler(scrollable, toolItems) {
    var handler = function () {
        var e_1, _a;
        var rootContainer = scrollable.querySelector('div');
        if (!rootContainer)
            return;
        var statusBarItems = Array.from(rootContainer.children);
        // Match DOM items to toolItems by ID and set data-priority
        statusBarItems.forEach(function (domItem) {
            var toolItem = toolItems.find(function (item) {
                var itemIdBase = item.id.split(':')[0]; // The base ID with a possible suffix for example 'languagestatus:LanguageStatusMenu'
                return (itemIdBase === domItem.id || item.id + '-container' === domItem.id);
            });
            if (toolItem && toolItem.dataPriority) {
                domItem.setAttribute('data-priority', toolItem.dataPriority);
            }
            else {
                domItem.removeAttribute('data-priority');
            }
        });
        // Reset visibility of hidden statuses
        statusBarItems.forEach(function (item) {
            item.classList.remove('status-hidden');
        });
        var availableWidth = window.innerWidth;
        var contentWidth = rootContainer.scrollWidth;
        if (contentWidth > availableWidth) {
            // Group items by data-priority
            var itemsByPriorityLevel_1 = {};
            statusBarItems.forEach(function (item) {
                if (item.hasAttribute('data-priority')) {
                    var priority = item.getAttribute('data-priority') || '0';
                    if (!itemsByPriorityLevel_1[priority]) {
                        itemsByPriorityLevel_1[priority] = [];
                    }
                    itemsByPriorityLevel_1[priority].push(item);
                }
            });
            var priorityLevels = Object.keys(itemsByPriorityLevel_1)
                .map(Number)
                .sort(function (a, b) { return b - a; });
            var remainingWidthToFit = contentWidth - availableWidth;
            try {
                // Hide items with the same priority level
                for (var priorityLevels_1 = __values(priorityLevels), priorityLevels_1_1 = priorityLevels_1.next(); !priorityLevels_1_1.done; priorityLevels_1_1 = priorityLevels_1.next()) {
                    var priority = priorityLevels_1_1.value;
                    var itemsAtPriority = itemsByPriorityLevel_1[priority];
                    if (!itemsAtPriority)
                        continue;
                    // Calculate total width of the items
                    var combinedWidthAtPriority = itemsAtPriority.reduce(function (sum, item) { return sum + item.offsetWidth; }, 0);
                    if (remainingWidthToFit > 0) {
                        itemsAtPriority.forEach(function (item) {
                            item.classList.add('status-hidden');
                        });
                        remainingWidthToFit -= combinedWidthAtPriority;
                        contentWidth -= combinedWidthAtPriority;
                    }
                    else {
                        break;
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (priorityLevels_1_1 && !priorityLevels_1_1.done && (_a = priorityLevels_1.return)) _a.call(priorityLevels_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
    }.bind(this);
    window.addEventListener('resize', handler);
}
JSDialog.MakeScrollable = function (parent, scrollable) {
    L.DomUtil.addClass(scrollable, 'ui-scrollable-content');
    createScrollButtons(parent, scrollable);
    setupResizeHandler(parent, scrollable);
};
JSDialog.MakeStatusPriority = function (scrollable, toolItems) {
    L.DomUtil.addClass(scrollable, 'ui-scrollable-content');
    setupPriorityStatusHandler(scrollable, toolItems);
};
JSDialog.RefreshScrollables = function () {
    window.dispatchEvent(new Event('resize'));
};
//# sourceMappingURL=Util.ScrollableBar.js.map