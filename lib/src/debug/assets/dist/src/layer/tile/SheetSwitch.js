/* -*- js-indent-level: 8 -*- */
var cool;
(function (cool) {
    // SheetSwitchViewRestore is used to store the last view position of a sheet
    // before a sheet switch so that when the user switches back to previously used
    // sheets we can restore the last scroll position of that sheet.
    var SheetSwitchViewRestore = /** @class */ (function () {
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        function SheetSwitchViewRestore(map) {
            this.map = map;
            this.docLayer = this.map._docLayer;
            this.centerOfSheet = new Map();
            this.mayRestore = false;
            this.restorePart = -1;
            this.setPartRecvd = false;
            this.currentSheetIndexReassigned = false;
        }
        SheetSwitchViewRestore.prototype.save = function (toPart) {
            if (!this.currentSheetIndexReassigned) {
                this.centerOfSheet.set(this.docLayer._selectedPart, this.map.getCenter());
            }
            else {
                this.currentSheetIndexReassigned = false;
            }
            this.mayRestore = this.centerOfSheet.has(toPart);
            this.restorePart = this.mayRestore ? toPart : -1;
            this.setPartRecvd = false;
        };
        SheetSwitchViewRestore.prototype.updateOnSheetMoved = function (oldIndex, newIndex) {
            if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex)
                return;
            var movedSheetCenter = this.centerOfSheet.get(oldIndex);
            if (oldIndex < newIndex) {
                for (var i = oldIndex; i < newIndex; ++i) {
                    var center = this.centerOfSheet.get(i + 1);
                    if (center)
                        this.centerOfSheet.set(i, center);
                    else
                        this.centerOfSheet.delete(i);
                }
            }
            else {
                for (var i = oldIndex; i > newIndex; --i) {
                    var center = this.centerOfSheet.get(i - 1);
                    if (center)
                        this.centerOfSheet.set(i, center);
                    else
                        this.centerOfSheet.delete(i);
                }
            }
            if (movedSheetCenter)
                this.centerOfSheet.set(newIndex, movedSheetCenter);
            else
                this.centerOfSheet.delete(newIndex);
        };
        SheetSwitchViewRestore.prototype.updateOnSheetInsertion = function (index) {
            if (index < 0)
                return;
            // when insert a sheet
            this.centerOfSheet.set(this.docLayer._selectedPart, this.map.getCenter());
            var numberOfSheets = this.map.getNumberOfParts();
            for (var i = numberOfSheets; i > index; --i) {
                var center = this.centerOfSheet.get(i - 1);
                if (center)
                    this.centerOfSheet.set(i, center);
                else
                    this.centerOfSheet.delete(i);
            }
            this.centerOfSheet.delete(index);
            var currentSheetNumber = this.map.getCurrentPartNumber();
            this.currentSheetIndexReassigned = index <= currentSheetNumber;
            if (this.currentSheetIndexReassigned) {
                this.centerOfSheet.set(currentSheetNumber + 1, this.map.getCenter());
            }
        };
        SheetSwitchViewRestore.prototype.updateOnSheetDeleted = function (index) {
            if (index < 0)
                return;
            var numberOfSheets = this.map.getNumberOfParts();
            for (var i = index; i < numberOfSheets; ++i) {
                var center = this.centerOfSheet.get(i + 1);
                if (center)
                    this.centerOfSheet.set(i, center);
                else
                    this.centerOfSheet.delete(i);
            }
            var currentSheetNumber = this.map.getCurrentPartNumber();
            this.currentSheetIndexReassigned = index <= currentSheetNumber;
            if (index < currentSheetNumber) {
                this.centerOfSheet.set(currentSheetNumber - 1, this.map.getCenter());
            }
        };
        SheetSwitchViewRestore.prototype.gotSetPart = function (part) {
            this.setPartRecvd = (part === this.restorePart);
        };
        // This resets the flags but not the center map.
        SheetSwitchViewRestore.prototype.reset = function () {
            this.restorePart = -1;
            this.mayRestore = false;
        };
        SheetSwitchViewRestore.prototype.restoreView = function () {
            var center = this.centerOfSheet.get(this.restorePart);
            if (center === undefined) {
                this.reset();
                return;
            }
            this.map._resetView(center, this.map._zoom);
            // Keep restoring view for every cell-cursor messages until we get this
            // call after receiving cell-cursor msg after setpart incoming msg.
            // Because it is guaranteed that cell-cursor messages belong to the new part
            // after setpart(incoming) msg.
            if (this.setPartRecvd)
                this.reset();
        };
        // This should be called to restore sheet's last scroll position if necessary and
        // returns whether the map should scroll to current cursor.
        SheetSwitchViewRestore.prototype.tryRestore = function (duplicateCursor, currentPart) {
            var shouldScrollToCursor = false;
            var attemptRestore = (this.mayRestore && currentPart === this.restorePart);
            if (attemptRestore) {
                if (this.setPartRecvd && duplicateCursor)
                    this.reset();
                if (!this.setPartRecvd)
                    this.restoreView();
            }
            if ((!attemptRestore || this.setPartRecvd) && !duplicateCursor)
                shouldScrollToCursor = true;
            return shouldScrollToCursor;
        };
        return SheetSwitchViewRestore;
    }());
    cool.SheetSwitchViewRestore = SheetSwitchViewRestore;
})(cool || (cool = {}));
L.SheetSwitchViewRestore = cool.SheetSwitchViewRestore;
//# sourceMappingURL=SheetSwitch.js.map