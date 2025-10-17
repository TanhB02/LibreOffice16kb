/* -*- tab-width: 4 -*- */
/*
 * Copyright the Collabora Online contributors.
 *
 * SPDX-License-Identifier: MPL-2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
var EffectState;
(function (EffectState) {
    EffectState[EffectState["NotStarted"] = 0] = "NotStarted";
    EffectState[EffectState["Playing"] = 1] = "Playing";
    EffectState[EffectState["Ended"] = 2] = "Ended";
})(EffectState || (EffectState = {}));
var Effect = /** @class */ (function () {
    function Effect(nId) {
        if (nId === void 0) { nId = -1; }
        this.nId = nId;
        this.eState = EffectState.NotStarted;
    }
    Effect.prototype.getId = function () {
        return this.nId;
    };
    Effect.prototype.isMainEffect = function () {
        return this.nId === -1;
    };
    Effect.prototype.isPlaying = function () {
        return this.eState === EffectState.Playing;
    };
    Effect.prototype.isEnded = function () {
        return this.eState === EffectState.Ended;
    };
    Effect.prototype.start = function () {
        assert(this.eState === EffectState.NotStarted, 'Effect.start: wrong state.');
        this.eState = EffectState.Playing;
    };
    Effect.prototype.end = function () {
        assert(this.eState === EffectState.Playing, 'Effect.end: wrong state.');
        this.eState = EffectState.Ended;
    };
    return Effect;
}());
//# sourceMappingURL=Effect.js.map