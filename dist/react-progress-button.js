(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.ProgressButton = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = require('react');

function getPinchProps(touches) {
	return {
		touches: Array.prototype.map.call(touches, function copyTouch(touch) {
			return { identifier: touch.identifier, pageX: touch.pageX, pageY: touch.pageY };
		}),
		center: { x: (touches[0].pageX + touches[1].pageX) / 2, y: (touches[0].pageY + touches[1].pageY) / 2 },
		angle: Math.atan() * (touches[1].pageY - touches[0].pageY) / (touches[1].pageX - touches[0].pageX) * 180 / Math.PI,
		distance: Math.sqrt(Math.pow(Math.abs(touches[1].pageX - touches[0].pageX), 2) + Math.pow(Math.abs(touches[1].pageY - touches[0].pageY), 2))
	};
}

var Mixin = {
	propTypes: {
		onPinchStart: React.PropTypes.func, // fires when a pinch gesture is started
		onPinchMove: React.PropTypes.func, // fires on every touch-move when a pinch action is active
		onPinchEnd: React.PropTypes.func // fires when a pinch action ends
	},

	onPinchStart: function onPinchStart(event) {
		// in case the two touches didn't start exactly at the same time
		if (this._initialTouch) {
			this.endTouch();
		}
		var touches = event.touches;
		this._initialPinch = getPinchProps(touches);
		this._initialPinch = _extends(this._initialPinch, {
			displacement: { x: 0, y: 0 },
			displacementVelocity: { x: 0, y: 0 },
			rotation: 0,
			rotationVelocity: 0,
			zoom: 1,
			zoomVelocity: 0,
			time: Date.now()
		});
		this._lastPinch = this._initialPinch;
		this.props.onPinchStart && this.props.onPinchStart(this._initialPinch, event);
	},

	onPinchMove: function onPinchMove(event) {
		if (this._initialTouch) {
			this.endTouch();
		}
		var touches = event.touches;
		if (touches.length !== 2) {
			return this.onPinchEnd(event); // bail out before disaster
		}

		var currentPinch = touches[0].identifier === this._initialPinch.touches[0].identifier && touches[1].identifier === this._initialPinch.touches[1].identifier ? getPinchProps(touches) // the touches are in the correct order
		: touches[1].identifier === this._initialPinch.touches[0].identifier && touches[0].identifier === this._initialPinch.touches[1].identifier ? getPinchProps(touches.reverse()) // the touches have somehow changed order
		: getPinchProps(touches); // something is wrong, but we still have two touch-points, so we try not to fail

		currentPinch.displacement = {
			x: currentPinch.center.x - this._initialPinch.center.x,
			y: currentPinch.center.y - this._initialPinch.center.y
		};

		currentPinch.time = Date.now();
		var timeSinceLastPinch = currentPinch.time - this._lastPinch.time;

		currentPinch.displacementVelocity = {
			x: (currentPinch.displacement.x - this._lastPinch.displacement.x) / timeSinceLastPinch,
			y: (currentPinch.displacement.y - this._lastPinch.displacement.y) / timeSinceLastPinch
		};

		currentPinch.rotation = currentPinch.angle - this._initialPinch.angle;
		currentPinch.rotationVelocity = currentPinch.rotation - this._lastPinch.rotation / timeSinceLastPinch;

		currentPinch.zoom = currentPinch.distance / this._initialPinch.distance;
		currentPinch.zoomVelocity = (currentPinch.zoom - this._lastPinch.zoom) / timeSinceLastPinch;

		this.props.onPinchMove && this.props.onPinchMove(currentPinch, event);

		this._lastPinch = currentPinch;
	},

	onPinchEnd: function onPinchEnd(event) {
		// TODO use helper to order touches by identifier and use actual values on touchEnd.
		var currentPinch = _extends({}, this._lastPinch);
		currentPinch.time = Date.now();

		if (currentPinch.time - this._lastPinch.time > 16) {
			currentPinch.displacementVelocity = 0;
			currentPinch.rotationVelocity = 0;
			currentPinch.zoomVelocity = 0;
		}

		this.props.onPinchEnd && this.props.onPinchEnd(currentPinch, event);

		this._initialPinch = this._lastPinch = null;

		// If one finger is still on screen, it should start a new touch event for swiping etc
		// But it should never fire an onTap or onPress event.
		// Since there is no support swipes yet, this should be disregarded for now
		// if (event.touches.length === 1) {
		// 	this.onTouchStart(event);
		// }
	}
};

module.exports = Mixin;
},{"react":undefined}],2:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var TappableMixin = require('./TappableMixin');
var PinchableMixin = require('./PinchableMixin');
var getComponent = require('./getComponent');
var touchStyles = require('./touchStyles');

var Component = getComponent([TappableMixin, PinchableMixin]);

module.exports = Component;
module.exports.touchStyles = touchStyles;
module.exports.Mixin = _extends({}, TappableMixin, {
  onPinchStart: PinchableMixin.onPinchStart,
  onPinchMove: PinchableMixin.onPinchMove,
  onPinchEnd: PinchableMixin.onPinchEnd
});
},{"./PinchableMixin":1,"./TappableMixin":3,"./getComponent":4,"./touchStyles":5}],3:[function(require,module,exports){
'use strict';

var React = require('react');

function getTouchProps(touch) {
	if (!touch) return {};
	return {
		pageX: touch.pageX,
		pageY: touch.pageY,
		clientX: touch.clientX,
		clientY: touch.clientY
	};
}

var Mixin = {
	propTypes: {
		moveThreshold: React.PropTypes.number, // pixels to move before cancelling tap
		activeDelay: React.PropTypes.number, // ms to wait before adding the `-active` class
		pressDelay: React.PropTypes.number, // ms to wait before detecting a press
		pressMoveThreshold: React.PropTypes.number, // pixels to move before cancelling press
		preventDefault: React.PropTypes.bool, // whether to preventDefault on all events
		stopPropagation: React.PropTypes.bool, // whether to stopPropagation on all events

		onTap: React.PropTypes.func, // fires when a tap is detected
		onPress: React.PropTypes.func, // fires when a press is detected
		onTouchStart: React.PropTypes.func, // pass-through touch event
		onTouchMove: React.PropTypes.func, // pass-through touch event
		onTouchEnd: React.PropTypes.func, // pass-through touch event
		onMouseDown: React.PropTypes.func, // pass-through mouse event
		onMouseUp: React.PropTypes.func, // pass-through mouse event
		onMouseMove: React.PropTypes.func, // pass-through mouse event
		onMouseOut: React.PropTypes.func // pass-through mouse event
	},

	getDefaultProps: function getDefaultProps() {
		return {
			activeDelay: 0,
			moveThreshold: 100,
			pressDelay: 1000,
			pressMoveThreshold: 5
		};
	},

	getInitialState: function getInitialState() {
		return {
			isActive: false,
			touchActive: false,
			pinchActive: false
		};
	},

	componentWillUnmount: function componentWillUnmount() {
		this.cleanupScrollDetection();
		this.cancelPressDetection();
		this.clearActiveTimeout();
	},

	processEvent: function processEvent(event) {
		if (this.props.preventDefault) event.preventDefault();
		if (this.props.stopPropagation) event.stopPropagation();
	},

	onTouchStart: function onTouchStart(event) {
		if (this.props.onTouchStart && this.props.onTouchStart(event) === false) return;
		this.processEvent(event);
		window._blockMouseEvents = true;
		if (event.touches.length === 1) {
			this._initialTouch = this._lastTouch = getTouchProps(event.touches[0]);
			this.initScrollDetection();
			this.initPressDetection(event, this.endTouch);
			this._activeTimeout = setTimeout(this.makeActive, this.props.activeDelay);
		} else if (this.onPinchStart && (this.props.onPinchStart || this.props.onPinchMove || this.props.onPinchEnd) && event.touches.length === 2) {
			this.onPinchStart(event);
		}
	},

	makeActive: function makeActive() {
		if (!this.isMounted()) return;
		this.clearActiveTimeout();
		this.setState({
			isActive: true
		});
	},

	clearActiveTimeout: function clearActiveTimeout() {
		clearTimeout(this._activeTimeout);
		this._activeTimeout = false;
	},

	initScrollDetection: function initScrollDetection() {
		this._scrollPos = { top: 0, left: 0 };
		this._scrollParents = [];
		this._scrollParentPos = [];
		var node = this.getDOMNode();
		while (node) {
			if (node.scrollHeight > node.offsetHeight || node.scrollWidth > node.offsetWidth) {
				this._scrollParents.push(node);
				this._scrollParentPos.push(node.scrollTop + node.scrollLeft);
				this._scrollPos.top += node.scrollTop;
				this._scrollPos.left += node.scrollLeft;
			}
			node = node.parentNode;
		}
	},

	calculateMovement: function calculateMovement(touch) {
		return {
			x: Math.abs(touch.clientX - this._initialTouch.clientX),
			y: Math.abs(touch.clientY - this._initialTouch.clientY)
		};
	},

	detectScroll: function detectScroll() {
		var currentScrollPos = { top: 0, left: 0 };
		for (var i = 0; i < this._scrollParents.length; i++) {
			currentScrollPos.top += this._scrollParents[i].scrollTop;
			currentScrollPos.left += this._scrollParents[i].scrollLeft;
		}
		return !(currentScrollPos.top === this._scrollPos.top && currentScrollPos.left === this._scrollPos.left);
	},

	cleanupScrollDetection: function cleanupScrollDetection() {
		this._scrollParents = undefined;
		this._scrollPos = undefined;
	},

	initPressDetection: function initPressDetection(event, callback) {
		if (!this.props.onPress) return;
		this._pressTimeout = setTimeout((function () {
			this.props.onPress(event);
			callback();
		}).bind(this), this.props.pressDelay);
	},

	cancelPressDetection: function cancelPressDetection() {
		clearTimeout(this._pressTimeout);
	},

	onTouchMove: function onTouchMove(event) {
		if (this._initialTouch) {
			this.processEvent(event);

			if (this.detectScroll()) return this.endTouch(event);

			this.props.onTouchMove && this.props.onTouchMove(event);
			this._lastTouch = getTouchProps(event.touches[0]);
			var movement = this.calculateMovement(this._lastTouch);
			if (movement.x > this.props.pressMoveThreshold || movement.y > this.props.pressMoveThreshold) {
				this.cancelPressDetection();
			}
			if (movement.x > this.props.moveThreshold || movement.y > this.props.moveThreshold) {
				if (this.state.isActive) {
					this.setState({
						isActive: false
					});
				} else if (this._activeTimeout) {
					this.clearActiveTimeout();
				}
			} else {
				if (!this.state.isActive && !this._activeTimeout) {
					this.setState({
						isActive: true
					});
				}
			}
		} else if (this._initialPinch && event.touches.length === 2 && this.onPinchMove) {
			this.onPinchMove(event);
			event.preventDefault();
		}
	},

	onTouchEnd: function onTouchEnd(event) {
		var _this = this;

		if (this._initialTouch) {
			this.processEvent(event);
			var afterEndTouch;
			var movement = this.calculateMovement(this._lastTouch);
			if (movement.x <= this.props.moveThreshold && movement.y <= this.props.moveThreshold && this.props.onTap) {
				event.preventDefault();
				afterEndTouch = function () {
					var finalParentScrollPos = _this._scrollParents.map(function (node) {
						return node.scrollTop + node.scrollLeft;
					});
					var stoppedMomentumScroll = _this._scrollParentPos.some(function (end, i) {
						return end !== finalParentScrollPos[i];
					});
					if (!stoppedMomentumScroll) {
						_this.props.onTap(event);
					}
				};
			}
			this.endTouch(event, afterEndTouch);
		} else if (this.onPinchEnd && this._initialPinch && event.touches.length + event.changedTouches.length === 2) {
			this.onPinchEnd(event);
			event.preventDefault();
		}
	},

	endTouch: function endTouch(event, callback) {
		this.cancelPressDetection();
		this.clearActiveTimeout();
		if (event && this.props.onTouchEnd) {
			this.props.onTouchEnd(event);
		}
		this._initialTouch = null;
		this._lastTouch = null;
		if (callback) {
			callback();
		}
		if (this.state.isActive) {
			this.setState({
				isActive: false
			});
		}
	},

	onMouseDown: function onMouseDown(event) {
		if (window._blockMouseEvents) {
			window._blockMouseEvents = false;
			return;
		}
		if (this.props.onMouseDown && this.props.onMouseDown(event) === false) return;
		this.processEvent(event);
		this.initPressDetection(event, this.endMouseEvent);
		this._mouseDown = true;
		this.setState({
			isActive: true
		});
	},

	onMouseMove: function onMouseMove(event) {
		if (window._blockMouseEvents || !this._mouseDown) return;
		this.processEvent(event);
		this.props.onMouseMove && this.props.onMouseMove(event);
	},

	onMouseUp: function onMouseUp(event) {
		if (window._blockMouseEvents || !this._mouseDown) return;
		this.processEvent(event);
		this.props.onMouseUp && this.props.onMouseUp(event);
		this.props.onTap && this.props.onTap(event);
		this.endMouseEvent();
	},

	onMouseOut: function onMouseOut(event) {
		if (window._blockMouseEvents || !this._mouseDown) return;
		this.processEvent(event);
		this.props.onMouseOut && this.props.onMouseOut(event);
		this.endMouseEvent();
	},

	endMouseEvent: function endMouseEvent() {
		this.cancelPressDetection();
		this._mouseDown = false;
		this.setState({
			isActive: false
		});
	},

	cancelTap: function cancelTap() {
		this.endTouch();
		this._mouseDown = false;
	},

	handlers: function handlers() {
		return {
			onTouchStart: this.onTouchStart,
			onTouchMove: this.onTouchMove,
			onTouchEnd: this.onTouchEnd,
			onMouseDown: this.onMouseDown,
			onMouseUp: this.onMouseUp,
			onMouseMove: this.onMouseMove,
			onMouseOut: this.onMouseOut
		};
	}
};

module.exports = Mixin;
},{"react":undefined}],4:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = require('react');
var touchStyles = require('./touchStyles');

/**
 * Tappable Component
 * ==================
 */
module.exports = function (mixins) {
	return React.createClass({
		displayName: 'Tappable',

		mixins: mixins,

		propTypes: {
			component: React.PropTypes.any, // component to create
			className: React.PropTypes.string, // optional className
			classBase: React.PropTypes.string, // base for generated classNames
			style: React.PropTypes.object, // additional style properties for the component
			disabled: React.PropTypes.bool // only applies to buttons
		},

		getDefaultProps: function getDefaultProps() {
			return {
				component: 'span',
				classBase: 'Tappable'
			};
		},

		render: function render() {
			var props = this.props;
			var className = props.classBase + (this.state.isActive ? '-active' : '-inactive');

			if (props.className) {
				className += ' ' + props.className;
			}

			var style = {};
			_extends(style, touchStyles, props.style);

			var newComponentProps = _extends({}, props, {
				style: style,
				className: className,
				disabled: props.disabled,
				handlers: this.handlers
			}, this.handlers());

			delete newComponentProps.onTap;
			delete newComponentProps.onPress;
			delete newComponentProps.onPinchStart;
			delete newComponentProps.onPinchMove;
			delete newComponentProps.onPinchEnd;
			delete newComponentProps.moveThreshold;
			delete newComponentProps.pressDelay;
			delete newComponentProps.pressMoveThreshold;
			delete newComponentProps.preventDefault;
			delete newComponentProps.stopPropagation;
			delete newComponentProps.component;

			return React.createElement(props.component, newComponentProps, props.children);
		}
	});
};
},{"./touchStyles":5,"react":undefined}],5:[function(require,module,exports){
'use strict';

var touchStyles = {
  WebkitTapHighlightColor: 'rgba(0,0,0,0)',
  WebkitTouchCallout: 'none',
  WebkitUserSelect: 'none',
  KhtmlUserSelect: 'none',
  MozUserSelect: 'none',
  msUserSelect: 'none',
  userSelect: 'none',
  cursor: 'pointer'
};

module.exports = touchStyles;
},{}],6:[function(require,module,exports){
(function (global){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _reactTappable = require('react-tappable');

var _reactTappable2 = _interopRequireDefault(_reactTappable);

var _react = (typeof window !== "undefined" ? window['React'] : typeof global !== "undefined" ? global['React'] : null);

var _react2 = _interopRequireDefault(_react);

var ProgressButton = _react2['default'].createClass({
  displayName: 'ProgressButton',

  propTypes: {
    classNamespace: _react2['default'].PropTypes.string,
    durationError: _react2['default'].PropTypes.number,
    durationSuccess: _react2['default'].PropTypes.number,
    form: _react2['default'].PropTypes.string,
    onClick: _react2['default'].PropTypes.func,
    onError: _react2['default'].PropTypes.func,
    onSuccess: _react2['default'].PropTypes.func,
    state: _react2['default'].PropTypes.string,
    type: _react2['default'].PropTypes.string,
    shouldAllowClickOnLoading: _react2['default'].PropTypes.bool
  },

  getDefaultProps: function getDefaultProps() {
    return {
      classNamespace: 'pb-',
      durationError: 1200,
      durationSuccess: 500,
      onClick: function onClick() {},
      onError: function onError() {},
      onSuccess: function onSuccess() {},
      shouldAllowClickOnLoading: false
    };
  },

  getInitialState: function getInitialState() {
    return {
      currentState: this.props.state || ''
    };
  },

  render: function render() {
    return _react2['default'].createElement(
      _reactTappable2['default'],
      { className: this.props.classNamespace + "container " + this.state.currentState, onTap: this.handleClick },
      _react2['default'].createElement("button", { type: this.props.type, form: this.props.form,
        className: this.props.classNamespace + "button" }, _react2['default'].createElement("span", null, this.props.children), _react2['default'].createElement("svg", { className: this.props.classNamespace + "progress-circle",
        viewBox: "0 0 41 41" }, _react2['default'].createElement("path", { d: "M38,20.5 C38,30.1685093 30.1685093,38 20.5,38" })), _react2['default'].createElement("svg", { className: this.props.classNamespace + "checkmark",
        viewBox: "0 0 70 70" }, _react2['default'].createElement("path", { d: "m31.5,46.5l15.3,-23.2" }), _react2['default'].createElement("path", { d: "m31.5,46.5l-8.5,-7.1" })), _react2['default'].createElement("svg", { className: this.props.classNamespace + "cross",
        viewBox: "0 0 70 70" }, _react2['default'].createElement("path", { d: "m35,35l-9.3,-9.3" }), _react2['default'].createElement("path", { d: "m35,35l9.3,9.3" }), _react2['default'].createElement("path", { d: "m35,35l-9.3,9.3" }), _react2['default'].createElement("path", { d: "m35,35l9.3,-9.3" })))
    );
  },

  handleClick: function handleClick(e) {
    if ((this.props.shouldAllowClickOnLoading || this.state.currentState !== 'loading') && this.state.currentState !== 'disabled') {
      this.props.onClick(e);
    } else {
      e.preventDefault();
    }
  },

  loading: function loading() {
    this.setState({ currentState: 'loading' });
  },

  notLoading: function notLoading() {
    this.setState({ currentState: '' });
  },

  enable: function enable() {
    this.setState({ currentState: '' });
  },

  disable: function disable() {
    this.setState({ currentState: 'disabled' });
  },

  success: function success(callback, dontRemove) {
    this.setState({ currentState: 'success' });
    this._timeout = setTimeout((function () {
      callback = callback || this.props.onSuccess;
      callback();
      if (dontRemove === true) {
        return;
      }
      this.setState({ currentState: '' });
    }).bind(this), this.props.durationSuccess);
  },

  error: function error(callback) {
    this.setState({ currentState: 'error' });
    this._timeout = setTimeout((function () {
      callback = callback || this.props.onError;
      callback();
      this.setState({ currentState: '' });
    }).bind(this), this.props.durationError);
  },

  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    switch (nextProps.state) {
      case 'success':
        this.success();
        return;
      case 'error':
        this.error();
        return;
      case 'loading':
        this.loading();
        return;
      case 'disabled':
        this.disable();
        return;
      case '':
        this.notLoading();
        return;
      default:
        return;
    }
  },

  componentWillUnmount: function componentWillUnmount() {
    clearTimeout(this._timeout);
  }
});

module.exports = ProgressButton;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"react-tappable":2}]},{},[6])(6)
});