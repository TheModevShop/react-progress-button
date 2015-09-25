'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _reactTappable = require('react-tappable');

var _reactTappable2 = _interopRequireDefault(_reactTappable);

var _react = require('react');

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