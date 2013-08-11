/*
 jQRangeSlider
 Copyright (C) Guillaume Gautreau 2012
 Dual licensed under the MIT or GPL Version 2 licenses.
 */
(function(c) {
    c.widget("ui.rangeSliderMouseTouch", c.ui.mouse, {_mouseInit: function() {
            var a = this;
            c.ui.mouse.prototype._mouseInit.apply(this);
            this._mouseDownEvent = !1;
            this.element.bind("touchstart." + this.widgetName, function(b) {
                return a._touchStart(b)
            })
        }, _mouseDestroy: function() {
            c(document).unbind("touchmove." + this.widgetName, this._touchMoveDelegate).unbind("touchend." + this.widgetName, this._touchEndDelegate);
            c.ui.mouse.prototype._mouseDestroy.apply(this)
        }, _touchStart: function(a) {
            a.which = 1;
            a.preventDefault();
            this._fillTouchEvent(a);
            var b = this, d = this._mouseDownEvent;
            this._mouseDown(a);
            if (d !== this._mouseDownEvent)
                this._touchEndDelegate = function(a) {
                    b._touchEnd(a)
                }, this._touchMoveDelegate = function(a) {
                    b._touchMove(a)
                }, c(document).bind("touchmove." + this.widgetName, this._touchMoveDelegate).bind("touchend." + this.widgetName, this._touchEndDelegate)
        }, _touchEnd: function(a) {
            this._fillTouchEvent(a);
            this._mouseUp(a);
            c(document).unbind("touchmove." + this.widgetName, this._touchMoveDelegate).unbind("touchend." + this.widgetName,
                    this._touchEndDelegate);
            this._mouseDownEvent = !1;
            c(document).trigger("mouseup")
        }, _touchMove: function(a) {
            a.preventDefault();
            this._fillTouchEvent(a);
            return this._mouseMove(a)
        }, _fillTouchEvent: function(a) {
            var b;
            b = typeof a.targetTouches === "undefined" && typeof a.changedTouches === "undefined" ? a.originalEvent.targetTouches[0] || a.originalEvent.changedTouches[0] : a.targetTouches[0] || a.changedTouches[0];
            a.pageX = b.pageX;
            a.pageY = b.pageY
        }})
})(jQuery);
(function(c) {
    c.widget("ui.rangeSliderDraggable", c.ui.rangeSliderMouseTouch, {cache: null, options: {containment: null}, _create: function() {
            setTimeout(c.proxy(this._initElement, this), 10)
        }, _initElement: function() {
            this._mouseInit();
            this._cache()
        }, _setOption: function(a, b) {
            if (a == "containment")
                this.options.containment = b === null || c(b).length == 0 ? null : c(b)
        }, _mouseStart: function(a) {
            this._cache();
            this.cache.click = {left: a.pageX, top: a.pageY};
            this.cache.initialOffset = this.element.offset();
            this._triggerMouseEvent("mousestart");
            return!0
        }, _mouseDrag: function(a) {
            a = a.pageX - this.cache.click.left;
            a = this._constraintPosition(a + this.cache.initialOffset.left);
            this._applyPosition(a);
            this._triggerMouseEvent("sliderDrag");
            return!1
        }, _mouseStop: function() {
            this._triggerMouseEvent("stop")
        }, _constraintPosition: function(a) {
            this.element.parent().length !== 0 && this.cache.parent.offset != null && (a = Math.min(a, this.cache.parent.offset.left + this.cache.parent.width - this.cache.width.outer), a = Math.max(a, this.cache.parent.offset.left));
            return a
        }, _applyPosition: function(a) {
            var b =
                    {top: this.cache.offset.top, left: a};
            this.element.offset({left: a});
            this.cache.offset = b
        }, _cacheIfNecessary: function() {
            this.cache === null && this._cache()
        }, _cache: function() {
            this.cache = {};
            this._cacheMargins();
            this._cacheParent();
            this._cacheDimensions();
            this.cache.offset = this.element.offset()
        }, _cacheMargins: function() {
            this.cache.margin = {left: this._parsePixels(this.element, "marginLeft"), right: this._parsePixels(this.element, "marginRight"), top: this._parsePixels(this.element, "marginTop"), bottom: this._parsePixels(this.element,
                        "marginBottom")}
        }, _cacheParent: function() {
            if (this.options.parent !== null) {
                var a = this.element.parent();
                this.cache.parent = {offset: a.offset(), width: a.width()}
            } else
                this.cache.parent = null
        }, _cacheDimensions: function() {
            this.cache.width = {outer: this.element.outerWidth(), inner: this.element.width()}
        }, _parsePixels: function(a, b) {
            return parseInt(a.css(b), 10) || 0
        }, _triggerMouseEvent: function(a) {
            var b = this._prepareEventData();
            this.element.trigger(a, b)
        }, _prepareEventData: function() {
            return{element: this.element, offset: this.cache.offset ||
                        null}
        }})
})(jQuery);
(function(c) {
    c.widget("ui.rangeSliderBar", c.ui.rangeSliderDraggable, {options: {leftHandle: null, rightHandle: null, bounds: {min: 0, max: 100}, type: "rangeSliderHandle", range: !1, drag: function() {
            }, stop: function() {
            }, values: {min: 0, max: 20}, wheelSpeed: 4, wheelMode: null}, _values: {min: 0, max: 20}, _waitingToInit: 2, _wheelTimeout: !1, _create: function() {
            c.ui.rangeSliderDraggable.prototype._create.apply(this);
            this.element.css("position", "absolute").css("top", 0).addClass("ui-rangeSlider-bar");
            this.options.leftHandle.bind("initialize",
                    c.proxy(this._onInitialized, this)).bind("mousestart", c.proxy(this._cache, this)).bind("stop", c.proxy(this._onHandleStop, this));
            this.options.rightHandle.bind("initialize", c.proxy(this._onInitialized, this)).bind("mousestart", c.proxy(this._cache, this)).bind("stop", c.proxy(this._onHandleStop, this));
            this._bindHandles();
            this._values = this.options.values;
            this._setWheelModeOption(this.options.wheelMode)
        }, _setOption: function(a, b) {
            a === "range" ? this._setRangeOption(b) : a === "wheelSpeed" ? this._setWheelSpeedOption(b) :
                    a === "wheelMode" && this._setWheelModeOption(b)
        }, _setRangeOption: function(a) {
            if (typeof a != "object" || a === null)
                a = !1;
            if (!(a === !1 && this.options.range === !1))
                this.options.range = a !== !1 ? {min: typeof a.min === "undefined" ? this.options.range.min || !1 : a.min, max: typeof a.max === "undefined" ? this.options.range.max || !1 : a.max} : !1, this._setLeftRange(), this._setRightRange()
        }, _setWheelSpeedOption: function(a) {
            if (typeof a === "number" && a > 0)
                this.options.wheelSpeed = a
        }, _setWheelModeOption: function(a) {
            if (a === null || a === !1 || a === "zoom" ||
                    a === "scroll")
                this.options.wheelMode !== a && this.element.parent().unbind("mousewheel.bar"), this._bindMouseWheel(a), this.options.wheelMode = a
        }, _bindMouseWheel: function(a) {
            a === "zoom" ? this.element.parent().bind("mousewheel.bar", c.proxy(this._mouseWheelZoom, this)) : a === "scroll" && this.element.parent().bind("mousewheel.bar", c.proxy(this._mouseWheelScroll, this))
        }, _setLeftRange: function() {
            if (this.options.range == !1)
                return!1;
            var a = this._values.max, b = {min: !1, max: !1};
            b.max = (this.options.range.min || !1) !== !1 ? this._leftHandle("substract",
                    a, this.options.range.min) : !1;
            b.min = (this.options.range.max || !1) !== !1 ? this._leftHandle("substract", a, this.options.range.max) : !1;
            this._leftHandle("option", "range", b)
        }, _setRightRange: function() {
            var a = this._values.min, b = {min: !1, max: !1};
            b.min = (this.options.range.min || !1) !== !1 ? this._rightHandle("add", a, this.options.range.min) : !1;
            b.max = (this.options.range.max || !1) !== !1 ? this._rightHandle("add", a, this.options.range.max) : !1;
            this._rightHandle("option", "range", b)
        }, _deactivateRange: function() {
            this._leftHandle("option",
                    "range", !1);
            this._rightHandle("option", "range", !1)
        }, _reactivateRange: function() {
            this._setRangeOption(this.options.range)
        }, _onInitialized: function() {
            this._waitingToInit--;
            this._waitingToInit === 0 && this._initMe()
        }, _initMe: function() {
            this._cache();
            this.min(this.options.values.min);
            this.max(this.options.values.max);
            var a = this._leftHandle("position"), b = this._rightHandle("position") + this.options.rightHandle.width();
            this.element.offset({left: a});
            this.element.css("width", b - a)
        }, _leftHandle: function() {
            return this._handleProxy(this.options.leftHandle,
                    arguments)
        }, _rightHandle: function() {
            return this._handleProxy(this.options.rightHandle, arguments)
        }, _handleProxy: function(a, b) {
            var c = Array.prototype.slice.call(b);
            return a[this.options.type].apply(a, c)
        }, _cache: function() {
            c.ui.rangeSliderDraggable.prototype._cache.apply(this);
            this._cacheHandles()
        }, _cacheHandles: function() {
            this.cache.rightHandle = {};
            this.cache.rightHandle.width = this.options.rightHandle.width();
            this.cache.rightHandle.offset = this.options.rightHandle.offset();
            this.cache.leftHandle = {};
            this.cache.leftHandle.offset =
                    this.options.leftHandle.offset()
        }, _mouseStart: function(a) {
            c.ui.rangeSliderDraggable.prototype._mouseStart.apply(this, [a]);
            this._deactivateRange()
        }, _mouseStop: function(a) {
            c.ui.rangeSliderDraggable.prototype._mouseStop.apply(this, [a]);
            this._cacheHandles();
            this._values.min = this._leftHandle("value");
            this._values.max = this._rightHandle("value");
            this._reactivateRange();
            this._leftHandle().trigger("stop");
            this._rightHandle().trigger("stop")
        }, _onDragLeftHandle: function(a, b) {
            this._cacheIfNecessary();
            this._switchedValues() ?
                    (this._switchHandles(), this._onDragRightHandle(a, b)) : (this._values.min = b.value, this.cache.offset.left = b.offset.left, this.cache.leftHandle.offset = b.offset, this._positionBar())
        }, _onDragRightHandle: function(a, b) {
            this._cacheIfNecessary();
            this._switchedValues() ? (this._switchHandles(), this._onDragLeftHandle(a, b)) : (this._values.max = b.value, this.cache.rightHandle.offset = b.offset, this._positionBar())
        }, _positionBar: function() {
            var a = this.cache.rightHandle.offset.left + this.cache.rightHandle.width - this.cache.leftHandle.offset.left;
            this.cache.width.inner = a;
            this.element.css("width", a).offset({left: this.cache.leftHandle.offset.left})
        }, _onHandleStop: function() {
            this._setLeftRange();
            this._setRightRange()
        }, _switchedValues: function() {
            if (this.min() > this.max()) {
                var a = this._values.min;
                this._values.min = this._values.max;
                this._values.max = a;
                return!0
            }
            return!1
        }, _switchHandles: function() {
            var a = this.options.leftHandle;
            this.options.leftHandle = this.options.rightHandle;
            this.options.rightHandle = a;
            this._leftHandle("option", "isLeft", !0);
            this._rightHandle("option",
                    "isLeft", !1);
            this._bindHandles();
            this._cacheHandles()
        }, _bindHandles: function() {
            this.options.leftHandle.unbind(".bar").bind("sliderDrag.bar update.bar moving.bar", c.proxy(this._onDragLeftHandle, this));
            this.options.rightHandle.unbind(".bar").bind("sliderDrag.bar update.bar moving.bar", c.proxy(this._onDragRightHandle, this))
        }, _constraintPosition: function(a) {
            var b = {};
            b.left = c.ui.rangeSliderDraggable.prototype._constraintPosition.apply(this, [a]);
            b.left = this._leftHandle("position", b.left);
            a = this._rightHandle("position",
                    b.left + this.cache.width.outer - this.cache.rightHandle.width);
            b.width = a - b.left + this.cache.rightHandle.width;
            return b
        }, _applyPosition: function(a) {
            c.ui.rangeSliderDraggable.prototype._applyPosition.apply(this, [a.left]);
            this.element.width(a.width)
        }, _mouseWheelZoom: function(a, b, d, e) {
            a = this._values.min + (this._values.max - this._values.min) / 2;
            b = {};
            d = {};
            this.options.range === !1 || this.options.range.min === !1 ? (b.max = a, d.min = a) : (b.max = a - this.options.range.min / 2, d.min = a + this.options.range.min / 2);
            if (this.options.range !==
                    !1 && this.options.range.max !== !1)
                b.min = a - this.options.range.max / 2, d.max = a + this.options.range.max / 2;
            this._leftHandle("option", "range", b);
            this._rightHandle("option", "range", d);
            clearTimeout(this._wheelTimeout);
            this._wheelTimeout = setTimeout(c.proxy(this._wheelStop, this), 200);
            this.zoomOut(e * this.options.wheelSpeed);
            return!1
        }, _mouseWheelScroll: function(a, b, d, e) {
            this._wheelTimeout === !1 ? this.startScroll() : clearTimeout(this._wheelTimeout);
            this._wheelTimeout = setTimeout(c.proxy(this._wheelStop, this), 200);
            this.scrollLeft(e *
                    this.options.wheelSpeed);
            return!1
        }, _wheelStop: function() {
            this.stopScroll();
            this._wheelTimeout = !1
        }, min: function(a) {
            return this._leftHandle("value", a)
        }, max: function(a) {
            return this._rightHandle("value", a)
        }, startScroll: function() {
            this._deactivateRange()
        }, stopScroll: function() {
            this._reactivateRange();
            this._triggerMouseEvent("stop")
        }, scrollLeft: function(a) {
            a = a || 1;
            if (a < 0)
                return this.scrollRight(-a);
            a = this._leftHandle("moveLeft", a);
            this._rightHandle("moveLeft", a);
            this.update();
            this._triggerMouseEvent("scroll")
        },
        scrollRight: function(a) {
            a = a || 1;
            if (a < 0)
                return this.scrollLeft(-a);
            a = this._rightHandle("moveRight", a);
            this._leftHandle("moveRight", a);
            this.update();
            this._triggerMouseEvent("scroll")
        }, zoomIn: function(a) {
            a = a || 1;
            if (a < 0)
                return this.zoomOut(-a);
            var b = this._rightHandle("moveLeft", a);
            a > b && (b /= 2, this._rightHandle("moveRight", b));
            this._leftHandle("moveRight", b);
            this.update();
            this._triggerMouseEvent("zoom")
        }, zoomOut: function(a) {
            a = a || 1;
            if (a < 0)
                return this.zoomIn(-a);
            var b = this._rightHandle("moveRight", a);
            a > b &&
                    (b /= 2, this._rightHandle("moveLeft", b));
            this._leftHandle("moveLeft", b);
            this.update();
            this._triggerMouseEvent("zoom")
        }, values: function(a, b) {
            if (typeof a !== "undefined" && typeof b !== "undefined") {
                var c = Math.min(a, b), e = Math.max(a, b);
                this._deactivateRange();
                this.options.leftHandle.unbind(".bar");
                this.options.rightHandle.unbind(".bar");
                this._values.min = this._leftHandle("value", c);
                this._values.max = this._rightHandle("value", e);
                this._bindHandles();
                this._reactivateRange();
                this.update()
            }
            return{min: this._values.min,
                max: this._values.max}
        }, update: function() {
            this._values.min = this.min();
            this._values.max = this.max();
            this._cache();
            this._positionBar()
        }})
})(jQuery);
(function(c) {
    function a(a, d, e, f) {
        this.label1 = a;
        this.label2 = d;
        this.type = e;
        this.options = f;
        this.handle1 = this.label1[this.type]("option", "handle");
        this.handle2 = this.label2[this.type]("option", "handle");
        this.cache = null;
        this.left = a;
        this.right = d;
        this.updating = this.initialized = this.moving = !1;
        this.Init = function() {
            this.BindHandle(this.handle1);
            this.BindHandle(this.handle2);
            this.options.show === "show" ? (setTimeout(c.proxy(this.PositionLabels, this), 1), this.initialized = !0) : setTimeout(c.proxy(this.AfterInit, this),
                    1E3)
        };
        this.AfterInit = function() {
            this.initialized = !0
        };
        this.Cache = function() {
            if (this.label1.css("display") != "none")
                this.cache = {}, this.cache.label1 = {}, this.cache.label2 = {}, this.cache.handle1 = {}, this.cache.handle2 = {}, this.cache.offsetParent = {}, this.CacheElement(this.label1, this.cache.label1), this.CacheElement(this.label2, this.cache.label2), this.CacheElement(this.handle1, this.cache.handle1), this.CacheElement(this.handle2, this.cache.handle2), this.CacheElement(this.label1.offsetParent(), this.cache.offsetParent)
        };
        this.CacheIfNecessary = function() {
            this.cache === null ? this.Cache() : (this.CacheWidth(this.label1, this.cache.label1), this.CacheWidth(this.label2, this.cache.label2), this.CacheHeight(this.label1, this.cache.label1), this.CacheHeight(this.label2, this.cache.label2), this.CacheWidth(this.label1.offsetParent(), this.cache.offsetParent))
        };
        this.CacheElement = function(a, b) {
            this.CacheWidth(a, b);
            this.CacheHeight(a, b);
            b.offset = a.offset();
            b.margin = {left: this.ParsePixels("marginLeft", a), right: this.ParsePixels("marginRight",
                        a)};
            b.border = {left: this.ParsePixels("borderLeftWidth", a), right: this.ParsePixels("borderRightWidth", a)}
        };
        this.CacheWidth = function(a, b) {
            b.width = a.width();
            b.outerWidth = a.outerWidth()
        };
        this.CacheHeight = function(a, b) {
            b.outerHeightMargin = a.outerHeight(!0)
        };
        this.ParsePixels = function(a, b) {
            return parseInt(b.css(a), 10) || 0
        };
        this.BindHandle = function(a) {
            a.bind("updating", c.proxy(this.onHandleUpdating, this));
            a.bind("update", c.proxy(this.onHandleUpdated, this));
            a.bind("moving", c.proxy(this.onHandleMoving, this));
            a.bind("stop", c.proxy(this.onHandleStop, this))
        };
        this.PositionLabels = function() {
            this.CacheIfNecessary();
            if (this.cache != null) {
                var a = this.GetRawPosition(this.cache.label1, this.cache.handle1), b = this.GetRawPosition(this.cache.label2, this.cache.handle2);
                this.ConstraintPositions(a, b);
                this.PositionLabel(this.label1, a.left, this.cache.label1);
                this.PositionLabel(this.label2, b.left, this.cache.label2)
            }
        };
        this.PositionLabel = function(a, b, c) {
            var d = this.cache.offsetParent.offset.left + this.cache.offsetParent.border.left;
            d - b >= 0 ? (a.css("right", ""), a.offset({left: b})) : (d += this.cache.offsetParent.width, b = b + c.margin.left + c.outerWidth + c.margin.right, b = d - b, a.css("left", ""), a.css("right", b))
        };
        this.ConstraintPositions = function(a, b) {
            a.center < b.center && a.outerRight > b.outerLeft ? (a = this.getLeftPosition(a, b), this.getRightPosition(a, b)) : a.center > b.center && b.outerRight > a.outerLeft && (b = this.getLeftPosition(b, a), this.getRightPosition(b, a))
        };
        this.getLeftPosition = function(a, b) {
            a.left = (b.center + a.center) / 2 - a.cache.outerWidth - a.cache.margin.right +
                    a.cache.border.left;
            return a
        };
        this.getRightPosition = function(a, b) {
            b.left = (b.center + a.center) / 2 + b.cache.margin.left + b.cache.border.left;
            return b
        };
        this.ShowIfNecessary = function() {
            if (!(this.options.show === "show" || this.moving || !this.initialized || this.updating))
                this.label1.stop(!0, !0).fadeIn(this.options.durationIn || 0), this.label2.stop(!0, !0).fadeIn(this.options.durationIn || 0), this.moving = !0
        };
        this.HideIfNeeded = function() {
            if (this.moving === !0)
                this.label1.stop(!0, !0).delay(this.options.delayOut || 0).fadeOut(this.options.durationOut ||
                        0), this.label2.stop(!0, !0).delay(this.options.delayOut || 0).fadeOut(this.options.durationOut || 0), this.moving = !1
        };
        this.onHandleMoving = function(a, b) {
            this.ShowIfNecessary();
            this.CacheIfNecessary();
            this.UpdateHandlePosition(b);
            this.PositionLabels()
        };
        this.onHandleUpdating = function() {
            this.updating = !0
        };
        this.onHandleUpdated = function() {
            this.updating = !1;
            this.cache = null
        };
        this.onHandleStop = function() {
            this.HideIfNeeded()
        };
        this.UpdateHandlePosition = function(a) {
            this.cache != null && (a.element[0] == this.handle1[0] ? this.UpdatePosition(a,
                    this.cache.handle1) : this.UpdatePosition(a, this.cache.handle2))
        };
        this.UpdatePosition = function(a, b) {
            b.offset = a.offset
        };
        this.GetRawPosition = function(a, b) {
            var c = b.offset.left + b.outerWidth / 2, d = c - a.outerWidth / 2, e = d - a.margin.left - a.border.left;
            return{left: d, outerLeft: e, top: b.offset.top - a.outerHeightMargin, right: d + a.outerWidth - a.border.left - a.border.right, outerRight: e + a.outerWidth + a.margin.left + a.margin.right, cache: a, center: c}
        };
        this.Init()
    }
    c.widget("ui.rangeSliderLabel", c.ui.rangeSliderMouseTouch, {options: {handle: null,
            formatter: !1, handleType: "rangeSliderHandle", show: "show", durationIn: 0, durationOut: 500, delayOut: 500, isLeft: !1}, cache: null, _positionner: null, _valueContainer: null, _innerElement: null, _create: function() {
            this.options.isLeft = this._handle("option", "isLeft");
            this.element.addClass("ui-rangeSlider-label").css("position", "absolute").css("display", "block");
            this._valueContainer = c("<div class='ui-rangeSlider-label-value' />").appendTo(this.element);
            this._innerElement = c("<div class='ui-rangeSlider-label-inner' />").appendTo(this.element);
            this._toggleClass();
            this.options.handle.bind("moving", c.proxy(this._onMoving, this)).bind("update", c.proxy(this._onUpdate, this)).bind("switch", c.proxy(this._onSwitch, this));
            this.options.show !== "show" && this.element.hide();
            this._mouseInit()
        }, _handle: function() {
            return this.options.handle[this.options.handleType].apply(this.options.handle, Array.prototype.slice.apply(arguments))
        }, _setOption: function(a, c) {
            a === "show" ? this._updateShowOption(c) : (a === "durationIn" || a === "durationOut" || a === "delayOut") && this._updateDurations(a,
                    c)
        }, _updateShowOption: function(a) {
            this.options.show = a;
            this.options.show !== "show" ? this.element.hide() : (this.element.show(), this._display(this.options.handle[this.options.handleType]("value")), this._positionner.PositionLabels());
            this._positionner.options.show = this.options.show
        }, _updateDurations: function(a, c) {
            parseInt(c) === c && (this._positionner.options[a] = c, this.options[a] = c)
        }, _display: function(a) {
            this.options.formatter == !1 ? this._displayText(Math.round(a)) : this._displayText(this.options.formatter(a))
        },
        _displayText: function(a) {
            this._valueContainer.text(a)
        }, _toggleClass: function() {
            this.element.toggleClass("ui-rangeSlider-leftLabel", this.options.isLeft).toggleClass("ui-rangeSlider-rightLabel", !this.options.isLeft)
        }, _mouseDown: function(a) {
            this.options.handle.trigger(a)
        }, _mouseUp: function(a) {
            this.options.handle.trigger(a)
        }, _mouseMove: function(a) {
            this.options.handle.trigger(a)
        }, _onMoving: function(a, c) {
            this._display(c.value)
        }, _onUpdate: function() {
            this.options.show === "show" && this.update()
        }, _onSwitch: function(a,
                c) {
            this.options.isLeft = c;
            this._toggleClass();
            this._positionner.PositionLabels()
        }, pair: function(b) {
            if (this._positionner == null)
                this._positionner = new a(this.element, b, this.widgetName, {show: this.options.show, durationIn: this.options.durationIn, durationOut: this.options.durationOut, delayOut: this.options.delayOut}), b[this.widgetName]("positionner", this._positionner)
        }, positionner: function(a) {
            if (typeof a !== "undefined")
                this._positionner = a;
            return this._positionner
        }, update: function() {
            this._positionner.cache = null;
            this._display(this._handle("value"));
            this.options.show == "show" && this._positionner.PositionLabels()
        }})
})(jQuery);
(function(c) {
    c.widget("ui.rangeSliderHandle", c.ui.rangeSliderDraggable, {currentMove: null, margin: 0, parentElement: null, options: {isLeft: !0, bounds: {min: 0, max: 100}, range: !1, value: 0, step: !1}, _value: 0, _left: 0, _create: function() {
            c.ui.rangeSliderDraggable.prototype._create.apply(this);
            this.element.css("position", "absolute").css("top", 0).addClass("ui-rangeSlider-handle").toggleClass("ui-rangeSlider-leftHandle", this.options.isLeft).toggleClass("ui-rangeSlider-rightHandle", !this.options.isLeft);
            this._value = this.options.value
        },
        _setOption: function(a, b) {
            if (a === "isLeft" && (b === !0 || b === !1) && b != this.options.isLeft)
                this.options.isLeft = b, this.element.toggleClass("ui-rangeSlider-leftHandle", this.options.isLeft).toggleClass("ui-rangeSlider-rightHandle", !this.options.isLeft), this._position(this._value), this.element.trigger("switch", this.options.isLeft);
            else if (a === "step" && this._checkStep(b))
                this.options.step = b, this.update();
            else if (a === "bounds")
                this.options.bounds = b, this.update();
            else if (a === "range" && this._checkRange(b))
                this.options.range =
                        b, this.update();
            c.ui.rangeSliderDraggable.prototype._setOption.apply(this, [a, b])
        }, _checkRange: function(a) {
            return a === !1 || (typeof a.min === "undefined" || a.min === !1 || parseFloat(a.min) === a.min) && (typeof a.max === "undefined" || a.max === !1 || parseFloat(a.max) === a.max)
        }, _checkStep: function(a) {
            return a === !1 || parseFloat(a) == a
        }, _initElement: function() {
            c.ui.rangeSliderDraggable.prototype._initElement.apply(this);
            this.cache.parent.width === 0 || this.cache.parent.width === null ? setTimeout(c.proxy(this._initElement, this),
                    500) : (this._position(this.options.value), this._triggerMouseEvent("initialize"))
        }, _bounds: function() {
            return this.options.bounds
        }, _cache: function() {
            c.ui.rangeSliderDraggable.prototype._cache.apply(this);
            this._cacheParent()
        }, _cacheParent: function() {
            var a = this.element.parent();
            this.cache.parent = {element: a, offset: a.offset(), padding: {left: this._parsePixels(a, "paddingLeft")}, width: a.width()}
        }, _position: function(a) {
            this._applyPosition(this._getPositionForValue(a))
        }, _constraintPosition: function(a) {
            return this._getPositionForValue(this._getValueForPosition(a))
        },
        _applyPosition: function(a) {
            c.ui.rangeSliderDraggable.prototype._applyPosition.apply(this, [a]);
            this._left = a;
            this._setValue(this._getValueForPosition(a));
            this._triggerMouseEvent("moving")
        }, _prepareEventData: function() {
            var a = c.ui.rangeSliderDraggable.prototype._prepareEventData.apply(this);
            a.value = this._value;
            return a
        }, _setValue: function(a) {
            if (a != this._value)
                this._value = a
        }, _constraintValue: function(a) {
            a = Math.min(a, this._bounds().max);
            a = Math.max(a, this._bounds().min);
            a = this._round(a);
            if (this.options.range !==
                    !1) {
                var b = this.options.range.min || !1, c = this.options.range.max || !1;
                b !== !1 && (a = Math.max(a, this._round(b)));
                c !== !1 && (a = Math.min(a, this._round(c)))
            }
            return a
        }, _round: function(a) {
            if (this.options.step !== !1 && this.options.step > 0)
                return Math.round(a / this.options.step) * this.options.step;
            return a
        }, _getPositionForValue: function(a) {
            if (this.cache.parent.offset == null)
                return 0;
            a = this._constraintValue(a);
            return(a - this.options.bounds.min) / (this.options.bounds.max - this.options.bounds.min) * (this.cache.parent.width - this.cache.width.outer) +
                    this.cache.parent.offset.left
        }, _getValueForPosition: function(a) {
            return this._constraintValue(this._getRawValueForPositionAndBounds(a, this.options.bounds.min, this.options.bounds.max))
        }, _getRawValueForPositionAndBounds: function(a, b, c) {
            return(a - (this.cache.parent.offset == null ? 0 : this.cache.parent.offset.left)) / (this.cache.parent.width - this.cache.width.outer) * (c - b) + b
        }, value: function(a) {
            typeof a != "undefined" && (this._cache(), a = this._constraintValue(a), this._position(a));
            return this._value
        }, update: function() {
            this._cache();
            var a = this._constraintValue(this._value), b = this._getPositionForValue(a);
            a != this._value ? (this._triggerMouseEvent("updating"), this._position(a), this._triggerMouseEvent("update")) : b != this.cache.offset.left && (this._triggerMouseEvent("updating"), this._position(a), this._triggerMouseEvent("update"))
        }, position: function(a) {
            typeof a != "undefined" && (this._cache(), a = this._constraintPosition(a), this._applyPosition(a));
            return this._left
        }, add: function(a, b) {
            return a + b
        }, substract: function(a, b) {
            return a - b
        }, stepsBetween: function(a,
                b) {
            if (this.options.step === !1)
                return b - a;
            return(b - a) / this.options.step
        }, multiplyStep: function(a, b) {
            return a * b
        }, moveRight: function(a) {
            var b;
            if (this.options.step == !1)
                return b = this._left, this.position(this._left + a), this._left - b;
            b = this._value;
            this.value(this.add(b, this.multiplyStep(this.options.step, a)));
            return this.stepsBetween(b, this._value)
        }, moveLeft: function(a) {
            return-this.moveRight(-a)
        }, stepRatio: function() {
            return this.options.step == !1 ? 1 : this.cache.parent.width / ((this.options.bounds.max - this.options.bounds.min) /
                    this.options.step)
        }})
})(jQuery);
(function(c) {
    c.widget("ui.rangeSlider", {options: {bounds: {min: 0, max: 100}, defaultValues: {min: 20, max: 50}, wheelMode: null, wheelSpeed: 4, arrows: !0, valueLabels: "show", formatter: null, durationIn: 0, durationOut: 400, delayOut: 200, range: {min: !1, max: !1}, step: !1}, _values: null, _valuesChanged: !1, bar: null, leftHandle: null, rightHandle: null, innerBar: null, container: null, arrows: null, labels: null, changing: {min: !1, max: !1}, changed: {min: !1, max: !1}, _create: function() {
            this._values = {min: this.options.defaultValues.min, max: this.options.defaultValues.max};
            this.labels = {left: null, right: null, leftDisplayed: !0, rightDisplayed: !0};
            this.arrows = {left: null, right: null};
            this.changing = {min: !1, max: !1};
            this.changed = {min: !1, max: !1};
            this.element.css("position") !== "absolute" && this.element.css("position", "relative");
            this.container = c("<div class='ui-rangeSlider-container' />").css("position", "absolute").appendTo(this.element);
            this.innerBar = c("<div class='ui-rangeSlider-innerBar' />").css("position", "absolute").css("top", 0).css("left", 0);
            this.leftHandle = this._createHandle({isLeft: !0,
                bounds: this.options.bounds, value: this.options.defaultValues.min, step: this.options.step}).appendTo(this.container);
            this.rightHandle = this._createHandle({isLeft: !1, bounds: this.options.bounds, value: this.options.defaultValues.max, step: this.options.step}).appendTo(this.container);
            this._createBar();
            this.container.prepend(this.innerBar);
            this.arrows.left = this._createArrow("left");
            this.arrows.right = this._createArrow("right");
            this.element.addClass("ui-rangeSlider");
            this.options.arrows ? this.element.addClass("ui-rangeSlider-withArrows") :
                    (this.arrows.left.css("display", "none"), this.arrows.right.css("display", "none"), this.element.addClass("ui-rangeSlider-noArrow"));
            this.options.valueLabels !== "hide" ? this._createLabels() : this._destroyLabels();
            this._bindResize();
            setTimeout(c.proxy(this.resize, this), 1);
            setTimeout(c.proxy(this._initValues, this), 1)
        }, _bindResize: function() {
            var a = this;
            this._resizeProxy = function(b) {
                a.resize(b)
            };
            c(window).resize(this._resizeProxy)
        }, _initWidth: function() {
            this.container.css("width", this.element.width() - this.container.outerWidth(!0) +
                    this.container.width());
            this.innerBar.css("width", this.container.width() - this.innerBar.outerWidth(!0) + this.innerBar.width())
        }, _initValues: function() {
            this.values(this.options.defaultValues.min, this.options.defaultValues.max)
        }, _setOption: function(a, b) {
            if (a === "defaultValues") {
                if (typeof b.min !== "undefined" && typeof b.max !== "undefined" && parseFloat(b.min) === b.min && parseFloat(b.max) === b.max)
                    this.options.defaultValues = b
            } else if (a === "wheelMode" || a === "wheelSpeed")
                this._bar("option", a, b), this.options[a] = this._bar("option",
                        a);
            else if (a === "arrows" && (b === !0 || b === !1) && b !== this.options.arrows)
                this._setArrowsOption(b);
            else if (a === "valueLabels")
                this._setLabelsOption(b);
            else if (a === "durationIn" || a === "durationOut" || a === "delayOut")
                this._setLabelsDurations(a, b);
            else if (a === "formatter" && b !== null && typeof b === "function")
                this.options.formatter = b, this.options.valueLabels !== "hide" && (this._destroyLabels(), this._createLabels());
            else if (a === "bounds" && typeof b.min !== "undefined" && typeof b.max !== "undefined")
                this.bounds(b.min, b.max);
            else if (a ===
                    "range")
                this._bar("option", "range", b), this.options.range = this._bar("option", "range"), this._changed(!0);
            else if (a === "step")
                this.options.step = b, this._leftHandle("option", "step", b), this._rightHandle("option", "step", b), this._changed(!0)
        }, _validProperty: function(a, b, c) {
            if (a === null || typeof a[b] === "undefined")
                return c;
            return a[b]
        }, _setLabelsOption: function(a) {
            if (!(a !== "hide" && a !== "show" && a !== "change"))
                this.options.valueLabels = a, a !== "hide" ? (this._createLabels(), this._leftLabel("update"), this._rightLabel("update")) :
                        this._destroyLabels()
        }, _setArrowsOption: function(a) {
            if (a === !0)
                this.element.removeClass("ui-rangeSlider-noArrow").addClass("ui-rangeSlider-withArrows"), this.arrows.left.css("display", "block"), this.arrows.right.css("display", "block"), this.options.arrows = !0;
            else if (a === !1)
                this.element.addClass("ui-rangeSlider-noArrow").removeClass("ui-rangeSlider-withArrows"), this.arrows.left.css("display", "none"), this.arrows.right.css("display", "none"), this.options.arrows = !1;
            this._initWidth()
        }, _setLabelsDurations: function(a,
                b) {
            parseInt(b, 10) === b && (this.labels.left !== null && this._leftLabel("option", a, b), this.labels.right !== null && this._rightLabel("option", a, b), this.options[a] = b)
        }, _createHandle: function(a) {
            return c("<div />")[this._handleType()](a).bind("sliderDrag", c.proxy(this._changing, this)).bind("stop", c.proxy(this._changed, this))
        }, _createBar: function() {
            this.bar = c("<div />").prependTo(this.container).bind("sliderDrag scroll zoom", c.proxy(this._changing, this)).bind("stop", c.proxy(this._changed, this));
            this._bar({leftHandle: this.leftHandle,
                rightHandle: this.rightHandle, values: {min: this.options.defaultValues.min, max: this.options.defaultValues.max}, type: this._handleType(), range: this.options.range, wheelMode: this.options.wheelMode, wheelSpeed: this.options.wheelSpeed});
            this.options.range = this._bar("option", "range");
            this.options.wheelMode = this._bar("option", "wheelMode");
            this.options.wheelSpeed = this._bar("option", "wheelSpeed")
        }, _createArrow: function(a) {
            var b = c("<div class='ui-rangeSlider-arrow' />").append("<div class='ui-rangeSlider-arrow-inner' />").addClass("ui-rangeSlider-" +
                    a + "Arrow").css("position", "absolute").css(a, 0).appendTo(this.element), a = a === "right" ? c.proxy(this._scrollRightClick, this) : c.proxy(this._scrollLeftClick, this);
            b.bind("mousedown touchstart", a);
            return b
        }, _proxy: function(a, b, c) {
            c = Array.prototype.slice.call(c);
            return a[b].apply(a, c)
        }, _handleType: function() {
            return"rangeSliderHandle"
        }, _barType: function() {
            return"rangeSliderBar"
        }, _bar: function() {
            return this._proxy(this.bar, this._barType(), arguments)
        }, _labelType: function() {
            return"rangeSliderLabel"
        }, _leftLabel: function() {
            return this._proxy(this.labels.left,
                    this._labelType(), arguments)
        }, _rightLabel: function() {
            return this._proxy(this.labels.right, this._labelType(), arguments)
        }, _leftHandle: function() {
            return this._proxy(this.leftHandle, this._handleType(), arguments)
        }, _rightHandle: function() {
            return this._proxy(this.rightHandle, this._handleType(), arguments)
        }, _getValue: function(a, b) {
            b === this.rightHandle && (a -= b.outerWidth());
            return a * (this.options.bounds.max - this.options.bounds.min) / (this.container.innerWidth() - b.outerWidth(!0)) + this.options.bounds.min
        }, _trigger: function(a) {
            var b =
                    this;
            setTimeout(function() {
                b.element.trigger(a, {label: b.element, values: b.values()})
            }, 1)
        }, _changing: function() {
            if (this._updateValues())
                this._trigger("valuesChanging"), this._valuesChanged = !0
        }, _changed: function(a) {
            if (this._updateValues() || this._valuesChanged)
                this._trigger("valuesChanged"), a !== !0 && this._trigger("userValuesChanged"), this._valuesChanged = !1
        }, _updateValues: function() {
            var a = this._leftHandle("value"), b = this._rightHandle("value"), c = this._min(a, b), e = this._max(a, b), c = c !== this._values.min || e !==
                    this._values.max;
            this._values.min = this._min(a, b);
            this._values.max = this._max(a, b);
            return c
        }, _min: function(a, b) {
            return Math.min(a, b)
        }, _max: function(a, b) {
            return Math.max(a, b)
        }, _createLabel: function(a, b) {
            var d;
            a === null ? (d = this._getLabelConstructorParameters(a, b), a = c("<div />").appendTo(this.element)[this._labelType()](d)) : (d = this._getLabelRefreshParameters(a, b), a[this._labelType()](d));
            return a
        }, _getLabelConstructorParameters: function(a, b) {
            return{handle: b, handleType: this._handleType(), formatter: this._getFormatter(),
                show: this.options.valueLabels, durationIn: this.options.durationIn, durationOut: this.options.durationOut, delayOut: this.options.delayOut}
        }, _getLabelRefreshParameters: function() {
            return{formatter: this._getFormatter(), show: this.options.valueLabels, durationIn: this.options.durationIn, durationOut: this.options.durationOut, delayOut: this.options.delayOut}
        }, _getFormatter: function() {
            if (this.options.formatter === !1 || this.options.formatter === null)
                return this._defaultFormatter;
            return this.options.formatter
        }, _defaultFormatter: function(a) {
            return Math.round(a)
        },
        _destroyLabel: function(a) {
            a !== null && (a.remove(), a = null);
            return a
        }, _createLabels: function() {
            this.labels.left = this._createLabel(this.labels.left, this.leftHandle);
            this.labels.right = this._createLabel(this.labels.right, this.rightHandle);
            this._leftLabel("pair", this.labels.right)
        }, _destroyLabels: function() {
            this.labels.left = this._destroyLabel(this.labels.left);
            this.labels.right = this._destroyLabel(this.labels.right)
        }, _stepRatio: function() {
            return this._leftHandle("stepRatio")
        }, _scrollRightClick: function(a) {
            a.preventDefault();
            this._bar("startScroll");
            this._bindStopScroll();
            this._continueScrolling("scrollRight", 4 * this._stepRatio(), 1)
        }, _continueScrolling: function(a, b, c, e) {
            this._bar(a, c);
            e = e || 5;
            e--;
            var f = this, g = Math.max(1, 4 / this._stepRatio());
            this._scrollTimeout = setTimeout(function() {
                e === 0 && (b > 16 ? b = Math.max(16, b / 1.5) : c = Math.min(g, c * 2), e = 5);
                f._continueScrolling(a, b, c, e)
            }, b)
        }, _scrollLeftClick: function(a) {
            a.preventDefault();
            this._bar("startScroll");
            this._bindStopScroll();
            this._continueScrolling("scrollLeft", 4 * this._stepRatio(),
                    1)
        }, _bindStopScroll: function() {
            var a = this;
            this._stopScrollHandle = function(b) {
                b.preventDefault();
                a._stopScroll()
            };
            c(document).bind("mouseup touchend", this._stopScrollHandle)
        }, _stopScroll: function() {
            c(document).unbind("mouseup touchend", this._stopScrollHandle);
            this._bar("stopScroll");
            clearTimeout(this._scrollTimeout)
        }, values: function(a, b) {
            var c = this._bar("values", a, b);
            typeof a !== "undefined" && typeof b !== "undefined" && this._changed(!0);
            return c
        }, min: function(a) {
            this._values.min = this.values(a, this._values.max).min;
            return this._values.min
        }, max: function(a) {
            this._values.max = this.values(this._values.min, a).max;
            return this._values.max
        }, bounds: function(a, b) {
            typeof a !== "undefined" && typeof b !== "undefined" && parseFloat(a) === a && parseFloat(b) === b && a < b && (this._setBounds(a, b), this._changed(!0));
            return this.options.bounds
        }, _setBounds: function(a, b) {
            this.options.bounds = {min: a, max: b};
            this._leftHandle("option", "bounds", this.options.bounds);
            this._rightHandle("option", "bounds", this.options.bounds);
            this._bar("option", "bounds", this.options.bounds)
        },
        zoomIn: function(a) {
            this._bar("zoomIn", a)
        }, zoomOut: function(a) {
            this._bar("zoomOut", a)
        }, scrollLeft: function(a) {
            this._bar("startScroll");
            this._bar("scrollLeft", a);
            this._bar("stopScroll")
        }, scrollRight: function(a) {
            this._bar("startScroll");
            this._bar("scrollRight", a);
            this._bar("stopScroll")
        }, resize: function() {
            this._initWidth();
            this._leftHandle("update");
            this._rightHandle("update")
        }, destroy: function() {
            this.element.removeClass("ui-rangeSlider-withArrows").removeClass("ui-rangeSlider-noArrow");
            this.bar.detach();
            this.leftHandle.detach();
            this.rightHandle.detach();
            this.innerBar.detach();
            this.container.detach();
            this.arrows.left.detach();
            this.arrows.right.detach();
            this.element.removeClass("ui-rangeSlider");
            this._destroyLabels();
            delete this.options;
            c(window).unbind("resize", this._resizeProxy);
            c.Widget.prototype.destroy.apply(this, arguments)
        }})
})(jQuery);
(function(c) {
    c.widget("ui.editRangeSliderLabel", c.ui.rangeSliderLabel, {options: {type: "text", step: !1, id: ""}, _input: null, _text: "", _create: function() {
            c.ui.rangeSliderLabel.prototype._create.apply(this);
            this._createInput()
        }, _setOption: function(a, b) {
            a === "type" ? this._setTypeOption(b) : a === "step" && this._setStepOption(b);
            c.ui.rangeSliderLabel.prototype._setOption.apply(this, [a, b])
        }, _createInput: function() {
            this._input = c("<input type='" + this.options.type + "' />").addClass("ui-editRangeSlider-inputValue").appendTo(this._valueContainer);
            this._setInputName();
            this._input.bind("keyup", c.proxy(this._onKeyUp, this));
            this._input.blur(c.proxy(this._onChange, this));
            this.options.type === "number" && (this.options.step !== !1 && this._input.attr("step", this.options.step), this._input.click(c.proxy(this._onChange, this)));
            this._input.val(this._text)
        }, _setInputName: function() {
            this._input.attr("name", this.options.id + (this.options.isLeft ? "left" : "right"))
        }, _onSwitch: function(a, b) {
            c.ui.rangeSliderLabel.prototype._onSwitch.apply(this, [a, b]);
            this._setInputName()
        },
        _destroyInput: function() {
            this._input.detach();
            this._input = null
        }, _onKeyUp: function(a) {
            if (a.which == 13)
                return this._onChange(a), !1
        }, _onChange: function() {
            var a = this._returnCheckedValue(this._input.val());
            a !== !1 && this._triggerValue(a)
        }, _triggerValue: function(a) {
            this.element.trigger("valueChange", [{isLeft: this.options.handle[this.options.handleType]("option", "isLeft"), value: a}])
        }, _returnCheckedValue: function(a) {
            var b = parseFloat(a);
            if (isNaN(b) || b.toString() != a)
                return!1;
            return b
        }, _setTypeOption: function(a) {
            if ((a ===
                    "text" || a === "number") && this.options.type != a)
                this._destroyInput(), this.options.type = a, this._createInput()
        }, _setStepOption: function(a) {
            this.options.step = a;
            this.options.type === "number" && this._input.attr("step", a !== !1 ? a : "any")
        }, _displayText: function(a) {
            this._input.val(a);
            this._text = a
        }})
})(jQuery);
(function(c) {
    c.widget("ui.editRangeSlider", c.ui.rangeSlider, {options: {type: "text", round: 1}, _create: function() {
            c.ui.rangeSlider.prototype._create.apply(this);
            this.element.addClass("ui-editRangeSlider")
        }, destroy: function() {
            this.element.removeClass("ui-editRangeSlider");
            c.ui.rangeSlider.prototype.destroy.apply(this)
        }, _setOption: function(a, b) {
            (a === "type" || a === "step") && this._setLabelOption(a, b);
            a === "type" && (this.options[a] = this.labels.left === null ? b : this._leftLabel("option", a));
            c.ui.rangeSlider.prototype._setOption.apply(this,
                    [a, b])
        }, _setLabelOption: function(a, b) {
            this.labels.left !== null && (this._leftLabel("option", a, b), this._rightLabel("option", a, b))
        }, _labelType: function() {
            return"editRangeSliderLabel"
        }, _createLabel: function(a, b) {
            var d = c.ui.rangeSlider.prototype._createLabel.apply(this, [a, b]);
            a === null && d.bind("valueChange", c.proxy(this._onValueChange, this));
            return d
        }, _addPropertiesToParameter: function(a) {
            a.type = this.options.type;
            a.step = this.options.step;
            a.id = this.element.attr("id");
            return a
        }, _getLabelConstructorParameters: function(a,
                b) {
            return this._addPropertiesToParameter(c.ui.rangeSlider.prototype._getLabelConstructorParameters.apply(this, [a, b]))
        }, _getLabelRefreshParameters: function(a, b) {
            return this._addPropertiesToParameter(c.ui.rangeSlider.prototype._getLabelRefreshParameters.apply(this, [a, b]))
        }, _onValueChange: function(a, b) {
            b.isLeft ? this.min(b.value) : this.max(b.value)
        }})
})(jQuery);
