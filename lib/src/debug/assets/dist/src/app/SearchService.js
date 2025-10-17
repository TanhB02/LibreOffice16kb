/* -*- js-indent-level: 8; fill-column: 100 -*- */
/*
 * Copyright the Collabora Online contributors.
 *
 * SPDX-License-Identifier: MPL-2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
var SearchService = /** @class */ (function () {
    function SearchService() {
    }
    // TODO: avoid L.DomUtil.get(...)
    SearchService.prototype.searchNext = function () {
        this.search(L.DomUtil.get('search-input').value, false);
    };
    SearchService.prototype.searchPrevious = function () {
        this.search(L.DomUtil.get('search-input').value, true);
    };
    SearchService.prototype.search = function (text, backward, replaceString, command, expand) {
        if (backward === undefined) {
            backward = false;
        }
        if (command === undefined) {
            command = 0;
        }
        if (replaceString === undefined) {
            replaceString = '';
        }
        if (L.Map.THIS._docLayer._searchResults &&
            text !== L.Map.THIS._docLayer._searchTerm) {
            L.Map.THIS._docLayer._clearSearchResults();
        }
        var searchCmd = {
            'SearchItem.SearchString': {
                type: 'string',
                value: undefined,
            },
            'SearchItem.ReplaceString': {
                type: 'string',
                value: undefined,
            },
            'SearchItem.Backward': {
                type: 'boolean',
                value: undefined,
            },
            'SearchItem.SearchStartPointX': {
                type: 'long',
                value: undefined,
            },
            'SearchItem.SearchStartPointY': {
                type: 'long',
                value: undefined,
            },
            'SearchItem.Command': {
                type: 'long',
                value: undefined,
            },
        };
        L.Map.THIS.fire('clearselection');
        var searchStartPointX = app.file.viewedRectangle.x1;
        var searchStartPointY = app.file.viewedRectangle.y1;
        if (L.Map.THIS._docLayer &&
            L.Map.THIS._docLayer._lastSearchResult &&
            expand) {
            var strTwips = L.Map.THIS._docLayer._lastSearchResult.twipsRectangles.match(/\d+/g);
            if (strTwips != null) {
                searchStartPointX = strTwips[0];
                searchStartPointY = strTwips[1];
            }
            this.resetSelection();
        }
        searchCmd['SearchItem.SearchString'].value = text;
        searchCmd['SearchItem.Backward'].value = backward;
        searchCmd['SearchItem.ReplaceString'].value = replaceString;
        searchCmd['SearchItem.SearchStartPointX'].value = searchStartPointX;
        searchCmd['SearchItem.SearchStartPointY'].value = searchStartPointY;
        searchCmd['SearchItem.Command'].value = command;
        app.socket.sendMessage('uno .uno:ExecuteSearch ' + JSON.stringify(searchCmd));
    };
    SearchService.prototype.highlightAll = function (text) {
        if (L.Map.THIS._docLayer._searchResults &&
            text === L.Map.THIS._docLayer._searchTerm) {
            return;
        }
        this.search(text, false, '1');
    };
    SearchService.prototype.resetSelection = function () {
        L.Map.THIS._docLayer._clearSearchResults();
        app.socket.sendMessage('resetselection');
    };
    return SearchService;
}());
app.searchService = new SearchService();
//# sourceMappingURL=SearchService.js.map