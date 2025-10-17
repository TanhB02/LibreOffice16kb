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
var DocUtil = /** @class */ (function () {
    function DocUtil() {
    }
    DocUtil.inlineStyleHelper = function (text, toBeReplaced, quotes) {
        var startIndex = 1;
        while (startIndex !== -1) {
            startIndex = text.indexOf(toBeReplaced);
            if (startIndex !== -1) {
                var endIndex = text.indexOf(quotes, startIndex + toBeReplaced.length + 1);
                var subString = text.substr(startIndex, endIndex - startIndex + 1);
                text = text.replace(subString, '');
            }
        }
        return text;
    };
    DocUtil.stripStyle = function (html) {
        var startIndex = 1;
        while (startIndex !== -1) {
            startIndex = html.indexOf('<style ');
            if (startIndex !== -1) {
                var endIndex = html.indexOf('</style>');
                var subString = html.substr(startIndex, endIndex - startIndex + '</style>'.length);
                html = html.replace(subString, '');
            }
        }
        // Remove also inline styles.
        html = this.inlineStyleHelper(html, 'style="', '"'); // For double quotes.
        html = this.inlineStyleHelper(html, "style='", "'"); // For single quotes.
        return html;
    };
    DocUtil.stripHTML = function (html) {
        html = this.stripStyle(html);
        var tmp = new DOMParser().parseFromString(html, 'text/html').body;
        return tmp.textContent.trim() || tmp.innerText.trim() || '';
    };
    return DocUtil;
}());
//# sourceMappingURL=DocUtil.js.map