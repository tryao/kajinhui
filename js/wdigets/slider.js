/*
 * Class Slider
 * @param  {[type]} opts [description]
 * @author : Zhong Yuan 2013.6.26
 * @version : v2.0.1
 */
var Slider = function(opts) {
    var init = function(opts) {
        this.conf = this._extends({
            wrap: 'slider',
            itemClass: 'slider_item',
            startOn: 0,
            // startOnPX : 300,
            slideBy: 1,
            // slidePX : 400,
            speed: 6,
            isVertical: false,
            isLoop: true,
            autoPlay: true,
            autoInterval: 3,
            onReady: function(states) {},
            onAniStart: function(states) {},
            onAniEnd: function(states) {},
            onEdge: function(states) {}
        }, opts);
        this._initDoms();
        this._initStates();
        this._initEvents();
        this._launch();
    };
    init.prototype = {
        // utils
        _id: function(id) {
            return document.getElementById(id);
        },
        _class: function(searchClass, node, tag) {
            var classElements = [],
                els, elsLen, pattern;
            if (node === null) node = document.body;
            if (tag === null) tag = '*';
            if (node.getElementsByClassName) {
                return node.getElementsByClassName(searchClass);
            }
            els = node.getElementsByTagName(tag);
            elsLen = els.length;
            pattern = new RegExp("(^|\\s)" + searchClass + "(\\s|$)");
            for (i = 0, j = 0; i < elsLen; i++) {
                if (pattern.test(els[i].className)) {
                    classElements[j] = els[i];
                    j++;
                }
            }
            return classElements;
        },
        _extends: function(destination, source) {
            for (var property in source) {
                destination[property] = source[property];
            }
            return destination;
        },
        _css3Prop: function() {
            if (this.css3Prop) return this.css3Prop;
            var me = {};
            var _elementStyle = document.createElement('div').style;
            var _vendor = (function() {
                var vendors = ['t', 'webkitT', 'MozT', 'msT', 'OT'],
                    transform,
                    i = 0,
                    l = vendors.length;
                for (; i < l; i++) {
                    transform = vendors[i] + 'ransform';
                    if (transform in _elementStyle) return vendors[i].substr(0, vendors[i].length - 1);
                }
                return false;
            })();

            this.css3Prop = {
                support: typeof _vendor === 'boolean' ? false : true,
                vendor: _vendor,
                cssVendor: _vendor ? '-' + _vendor.toLowerCase() + '-' : '',
                transform: _prefixStyle('transform'),
                transition: _prefixStyle('transition'),
                transitionProperty: _prefixStyle('transitionProperty'),
                transitionDuration: _prefixStyle('transitionDuration'),
                transformOrigin: _prefixStyle('transformOrigin'),
                transitionTimingFunction: _prefixStyle('transitionTimingFunction'),
                transitionDelay: _prefixStyle('transitionDelay'),
                transitionEnd: _prefixStyle('transitionend')
            };
            return this.css3Prop;

            function _prefixStyle(style) {
                if (_vendor === false) return false;
                if (_vendor === '') return style;
                return _vendor + style.charAt(0).toUpperCase() + style.substr(1);
            }
        },
        _easeOut: function(t, b, c, d) {
            return -c * (t /= d) * (t - 2) + b;
        },
        _addEvent: function(o, type, fn) {
            o.attachEvent ? o.attachEvent('on' + type, fn) : o.addEventListener(type, fn, false);
        },
        _initDoms: function(opts) {
            var that = this,
                c = this.conf,
                wrap = that._id(c.wrap),
                flStr, itemsStr, inner = wrap.innerHTML,
                initStr,
                aniWrap, items;

            flStr = c.isVertical ? '' : ' style="float:left;"';
            itemsStr = c.isLoop ? ('<div' + flStr + '>' + inner + '</div><div' + flStr + '>' + inner + '</div>') : inner;
            initStr = '<div style="' + (c.isVertical ? 'height' : 'width') + ':30000px;zoom:1;">' + itemsStr + '</div>';

            wrap.innerHTML = initStr;
            aniWrap = wrap.getElementsByTagName('div')[0];
            aniWrap.style.position = 'relative';
            items = this._class(c.itemClass, wrap, 'div');

            for (var i = 0, itemsLen = items.length; i < itemsLen; i++) {
                items[i].style['float'] = c.isVertical ? 'none' : 'left';
            }

            this.doms = {
                wrap: wrap,
                aniWrap: aniWrap,
                items: items
            };
        },
        _initStates: function(opts) {
            var that = this,
                c = this.conf,
                d = this.doms,
                items = d.items,
                css3Prop = this._css3Prop(),
                slidePX, slideBy, slideDir, total, wrapSize, duration, supportTouch, cssProterty, now, fromPos, itemPosProp, itemSizeProp, itemPos, totalPX,
                transitionAni, onTransitionEnd;

            slideDir = c.isVertical ? 'v' : 'h';
            wrapSize = c.isVertical ? d.wrap.clientHeight : d.wrap.clientWidth;
            total = items.length;
            duration = c.speed / 10;
            slidePX = wrapSize * c.slideBy;

            itemPosProp = c.isVertical ? 'offsetTop' : 'offsetLeft';
            itemSizeProp = c.isVertical ? 'offsetHeight' : 'offsetWidth';
            itemPos = [];
            for (var i = 0; i < total; i++) {
                itemPos.push(items[i][itemPosProp]);
            }
            totalPX = itemPos[total - 1] + items[total - 1][itemSizeProp];

            supportTouch = 'ontouchstart' in window;

            cssProterty = c.isVertical ? 'marginTop' : 'marginLeft';

            if (css3Prop.vendor === '') {
                transitionAni = 'transform ' + duration + 's ease-out';
            } else if (css3Prop.vendor) {
                transitionAni = '-' + css3Prop.vendor + '-transform ' + duration + 's ease-out';
            }

            onTransitionEnd = function() {
                var c = that.conf,
                    d = that.doms,
                    s = that.states,
                    css3Prop = that._css3Prop();
                c.onAniEnd && c.onAniEnd.call(that);
                s.animating = false;
                d.aniWrap.removeEventListener(css3Prop.transitionEnd, arguments.callee, false);
            };

            this.states = {
                curIdx: c.startOn,
                slideDir: slideDir,
                wrapSize: wrapSize,
                total: total,
                slidePX: slidePX,
                itemPos: itemPos,
                totalPX: totalPX,
                duration: duration,
                supportTouch: supportTouch,
                cssProterty: cssProterty,
                to: null,
                now: 0,
                fromPos: null,
                movedPos: null,
                animating: false,
                transitionAni: transitionAni,
                onTransitionEnd: onTransitionEnd,
                touchStartX: null,
                touchStartY: null,
                deltaDis0: null,
                deltaDis1: null,
                startPos: null
            };
        },
        _initEvents: function(opts) {
            var that = this,
                c = this.conf,
                d = this.doms,
                s = this.states,
                wrap = d.wrap;
            this._addEvent(wrap, 'mouseover', function() {
                if (c.autoPlay) {
                    clearInterval(that._auto);
                    that._auto = null;
                }
            });
            this._addEvent(wrap, 'mouseout', function() {
                if (c.autoPlay) {
                    that.autoSlide(true);
                }
            });

            if (s.supportTouch) {
                this._addEvent(wrap, 'touchstart', function(e) {
                    that._touchstart(e);
                });
                this._addEvent(wrap, 'touchmove', function(e) {
                    that._touchmove(e);
                });
                this._addEvent(wrap, 'touchend', function(e) {
                    that._touchend(e);
                });
            }
        },
        _launch: function() {
            var c = this.conf,
                d = this.doms,
                s = this.states;

            if ('startOn' in c) {
                this._moveToEle(c.startOn);
                s.fromPos = -s.wrapSize * c.startOnPX;
            } else if ('startOnPX' in c) {
                this._moveByPx(c.startOnPX, true);
                s.fromPos = -c.startOnPX;
            }

            c.onReady && c.onReady.call(this);

            if (c.autoPlay) {
                this.autoSlide(true);
            }
        },
        _touchstart: function(e) {
            var that = this,
                c = this.conf,
                d = this.doms,
                s = this.states,
                css3Prop = this._css3Prop();
            if (e.touches.length !== 1) {
                return;
            }

            if (c.isLoop) {
                if (s.curIdx === 0) {
                    s.curIdx += s.total / 2;
                }
                if (s.curIdx == s.total - 1) {
                    s.curIdx -= s.total / 2;
                }
                d.aniWrap.style[css3Prop.transition] = 'all 0s ease-out';
                this._moveToEle(s.curIdx);
            }

            clearInterval(this._auto);
            this._auto = null;

            s.touchStartX = e.touches[0].pageX;
            s.touchStartY = e.touches[0].pageY;
            if (c.isVertical) {
                s.deltaDis0 = s.touchStartY;
            } else {
                s.deltaDis0 = s.touchStartX;
            }
            s.startPos = -s.curIdx * s.slidePX;
            s.touched = true;
        },
        _touchmove: function(e) {
            var that = this,
                c = this.conf,
                d = this.doms,
                s = this.states,
                css3Prop = this._css3Prop(),
                cX, cY, dX, dY, finalDis, toPosStr;
            if (e.touches.length !== 1) {
                return;
            }

            cX = e.touches[0].pageX;
            cY = e.touches[0].pageY;
            dX = cX - s.touchStartX;
            dY = cY - s.touchStartY;
            if (c.isVertical) {
                /*if (Math.abs(dY) === 0 || Math.abs(dX) / Math.abs(dY) >= 1) {
                    e.preventDefault();
                }*/
                s.deltaDis1 = cY - s.deltaDis0;
                finalDis = s.startPos + dY;
            } else {
                /*if (Math.abs(dX) === 0 || Math.abs(dY) / Math.abs(dX) >= 1) {
                    e.preventDefault();
                }*/
                s.deltaDis1 = cX - s.deltaDis0;
                finalDis = s.startPos + dX;
            }
            toPosStr = c.isVertical ? ('translate3d(0,' + finalDis + 'px,0)') : ('translate3d(' + finalDis + 'px,0,0)');
            d.aniWrap.style[css3Prop.transform] = toPosStr;
        },
        _touchend: function(e) {
            var that = this,
                c = this.conf,
                d = this.doms,
                s = this.states,
                css3Prop = this._css3Prop(),
                toPos;

            if (s.deltaDis1 < -30) {
                this.next();
                s.deltaDis1 = 0;
            } else if (s.deltaDis1 > 30) {
                this.prev();
                s.deltaDis1 = 0;
            } else {
                this._slideToCss3(s.curIdx);
            }
            s.touched = false;
        },
        _moveToEle: function(to, isOffset, onMoveEnd) {
            var that = this,
                c = this.conf,
                d = this.doms,
                s = this.states,
                curIdx = s.curIdx,
                toIdx = isOffset ? curIdx + to : to,
                aniWrap = d.aniWrap,
                items = d.items,
                toItem = items[toIdx],
                css3Prop = this._css3Prop(),
                toPos, toPosStr;

            if (to !== curIdx) {
                c.onIndexChanged && c.onIndexChanged.call(this, to);
            }

            toPos = -s.itemPos[toIdx];
            toPosStr = c.isVertical ? ('translate3d(0,' + toPos + 'px,0)') : ('translate3d(' + toPos + 'px,0,0)');

            if (css3Prop.vendor !== false) {
                if (s.animating) {
                    aniWrap.removeEventListener(css3Prop.transitionEnd, s.onTransitionEnd, false);
                }

                aniWrap.style[css3Prop.transition] = 'all 0s ease-out';
                aniWrap.style[css3Prop.transform] = toPosStr;
                s.curIdx = toIdx;
                setTimeout(function() {
                    onMoveEnd && onMoveEnd.call(that);
                }, 20);
            } else {
                aniWrap.style[s.cssProterty] = toPos + 'px';
                s.curIdx = toIdx;
                onMoveEnd && onMoveEnd.call(this);
            }
        },
        _moveToPX: function(toPX, isOffset, onMoveEnd) {
            var that = this,
                c = this.conf,
                d = this.doms,
                s = this.states,
                aniWrap = d.aniWrap,
                items = d.items,
                toItem = items[toIdx],
                css3Prop = this._css3Prop(),
                toPos, toPosStr;
        },
        _slideToCss3: function(fIndex) {
            var that = this,
                c = this.conf,
                d = this.doms,
                s = this.states,
                items = d.items,
                aniWrap = d.aniWrap,
                css3Prop = this._css3Prop(),
                toPos, toPosStr;

            aniWrap.style[css3Prop.transition] = s.transitionAni;

            toPos = c.isVertical ? -items[fIndex].offsetTop : -items[fIndex].offsetLeft;
            toPosStr = c.isVertical ? ('translate3d(0,' + toPos + 'px,0)') : ('translate3d(' + toPos + 'px,0,0)');

            aniWrap.style[css3Prop.transform] = toPosStr;

            if (s.animating) {
                aniWrap.removeEventListener(css3Prop.transitionEnd, s.onTransitionEnd, false);
            }

            aniWrap.style[css3Prop.transform] = toPosStr;
            aniWrap.addEventListener(css3Prop.transitionEnd, s.onTransitionEnd, false);

            s.curIdx = fIndex;
        },
        _slideToTdt: function(to) {
            var that = this,
                c = this.conf,
                d = this.doms,
                s = this.states,
                aniWrap = d.aniWrap,
                cssProterty = s.cssProterty,
                duration = s.duration * 1000,
                now = s.now,
                wrapSize = s.wrapSize,
                movedPos;

            if (s.to === null || s.to == to) {
                s.fromPos = -s.curIdx * wrapSize;
            } else {
                s.fromPos = s.movedPos;
                s.now = 0;
            }

            if (duration - now < 20) {
                aniWrap.style[cssProterty] = -to * wrapSize + 'px';
                s.curIdx = to;

                clearTimeout(this.aniInterval);
                this.aniInterval = null;

                s.now = 0;
                s.to = null;
                s.fromPos = -s.curIdx * wrapSize;
                s.movedPos = null;

                c.onAniEnd && c.onAniEnd.call(this);
                s.animating = false;
                return;
            }

            movedPos = this._easeOut(now, s.fromPos, -to * wrapSize - s.fromPos, duration);
            aniWrap.style[cssProterty] = movedPos + 'px';
            s.now += 20;
            s.movedPos = movedPos;

            this.aniInterval = setTimeout(function() {
                that._slideToTdt(to);
                // that._tranditionSlide.apply(that, args.slice(0, 6).concat([later]));
            }, 20);
        },
        prev: function() {
            var c = this.conf,
                d = this.doms,
                s = this.states,
                curIdx = s.curIdx,
                toIdx;
            if (c.isLoop && curIdx === 0) {
                this._moveToEle(s.total / 2, false, function() {
                    toIdx = s.curIdx - c.slideBy;
                    this.slideTo(toIdx);
                });
            } else {
                toIdx = s.curIdx - c.slideBy;
                this.slideTo(toIdx);
            }
        },
        next: function() {
            var c = this.conf,
                d = this.doms,
                s = this.states,
                curIdx = s.curIdx,
                toIdx;
            if (c.isLoop && curIdx === s.total - 1) {
                this._moveToEle(s.total / 2 - 1, false, function() {
                    toIdx = s.curIdx + c.slideBy;
                    this.slideTo(toIdx);
                });
            } else {
                toIdx = s.curIdx + c.slideBy;
                this.slideTo(toIdx);
            }
        },
        slideByEle: function(offset) {
            var toIdx = this.states.curIdx + offset;
            this.slideTo(toIdx);
        },
        slideTo: function(i) {
            var that = this,
                c = this.conf,
                d = this.doms,
                s = this.states,
                curIdx = s.curIdx,
                total = s.total,
                css3Prop = this._css3Prop(),
                fnlIndex, cssProterty;

            fnlIndex = (i > total - 1) ? i % total : (i < 0 ? (total + i % total) : i);
            if (fnlIndex === curIdx) {
                return;
            }

            c.onIndexChanged && c.onIndexChanged.call(this, fnlIndex);

            s.animating = true;

            if (c.autoPlay) {
                this.autoSlide(true);
            }

            c.onAniStart && c.onAniStart.call(this);
            // css3 animation
            if (css3Prop.vendor !== false) {
                this._slideToCss3(fnlIndex);
            }
            // traditional animation
            else {
                this._slideToTdt(fnlIndex);
            }
        },
        autoSlide: function(enable) {
            var that = this;
            if (this._auto) {
                clearInterval(this._auto);
                this._auto = null;
            }
            if (enable) {
                this._auto = setInterval(function() {
                    that.next();
                }, this.conf.autoInterval * 1000);
            }
        },
        refresh: function(conf) {
            var that = this,
                c = this.conf,
                d = this.doms,
                s = this.states,
                css3Prop = this._css3Prop(),
                wrapSize;

            wrapSize = c.isVertical ? d.wrap.clientHeight : d.wrap.clientWidth;

            s.slidePX = wrapSize * c.slideBy;
            if (s.animating) {
                s.onTransitionEnd();
            }
            d.aniWrap.style[css3Prop.transition] = 'all 0s ease-out';
            this._moveToEle(s.curIdx);
        },
        destroy: function() {
            // todo
        }
    };
    return init;
}();
