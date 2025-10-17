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
function onStateChange(element, callback) {
    var enabledCallback = function (mutations) {
        for (var i in mutations) {
            if (mutations[i].attributeName === 'disabled') {
                var htmlElement = mutations[i].target;
                var enable = htmlElement.getAttribute('disabled') !== 'true';
                callback(enable);
            }
        }
    };
    var enableObserver = new MutationObserver(enabledCallback);
    enableObserver.observe(element, { attributeFilter: ['disabled'], attributeOldValue: true });
}
function synchronizeDisabledState(source, targets) {
    var enabledCallback = function (enable) {
        app.layoutingService.appendLayoutingTask(function () {
            for (var i in targets) {
                if (enable) {
                    targets[i].removeAttribute('disabled');
                }
                else {
                    targets[i].setAttribute('disabled', 'true');
                }
            }
        });
    };
    onStateChange(source, enabledCallback);
}
JSDialog.OnStateChange = onStateChange;
JSDialog.SynchronizeDisabledState = synchronizeDisabledState;
//# sourceMappingURL=Util.StateChange.js.map