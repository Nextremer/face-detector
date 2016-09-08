(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("eventemitter3"), require("clmtrackr"));
	else if(typeof define === 'function' && define.amd)
		define(["eventemitter3", "clmtrackr"], factory);
	else if(typeof exports === 'object')
		exports["face-detector"] = factory(require("eventemitter3"), require("clmtrackr"));
	else
		root["face-detector"] = factory(root["eventemitter3"], root["clmtrackr"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_1__, __WEBPACK_EXTERNAL_MODULE_3__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _eventemitter = __webpack_require__(1);

	var _eventemitter2 = _interopRequireDefault(_eventemitter);

	var _faceDetectorClmtrackr = __webpack_require__(2);

	var _faceDetectorClmtrackr2 = _interopRequireDefault(_faceDetectorClmtrackr);

	var _clmtrackr = __webpack_require__(3);

	var _clmtrackr2 = _interopRequireDefault(_clmtrackr);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	// import FaceDetectorTrackingjs from './face-detector-trackingjs';


	var supportedTrackers = {
	  clmtrackr: _faceDetectorClmtrackr2.default
	};

	var FaceDetector = function (_EventEmitter) {
	  _inherits(FaceDetector, _EventEmitter);

	  function FaceDetector(_ref) {
	    var tracker = _ref.tracker;

	    _classCallCheck(this, FaceDetector);

	    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(FaceDetector).call(this));

	    _this.tracker = _this._createTracker(tracker);
	    if (!tracker) {
	      throw new Error('Invalid tracker!');
	    }

	    _this.detectedStatus = false;
	    _this.ctx = null;
	    _this.stream = null;
	    _this.dataURL = null;
	    return _this;
	  }

	  _createClass(FaceDetector, [{
	    key: 'setup',
	    value: function setup(_ref2) {
	      var _this2 = this;

	      var videoTag = _ref2.videoTag;
	      var canvasTag = _ref2.canvasTag;
	      var freq = _ref2.freq;
	      var scoreThreshold = _ref2.scoreThreshold;
	      var sizeThreshold = _ref2.sizeThreshold;

	      this.freq = freq || 1000;
	      this.scoreThreshold = scoreThreshold || 0.5;
	      this.sizeThreshold = sizeThreshold || { x: 10, y: 10 };

	      /**
	       * Video Tag
	       */
	      if (!videoTag) {
	        throw new Error('Invalid video tag!');
	      }
	      this.videoTag = videoTag;

	      /**
	       * Canvas Tag
	       */
	      if (!canvasTag) {
	        throw new Error('Invalid canvas tag!');
	      }
	      this.canvasTag = canvasTag;
	      this.ctx = this.canvasTag.getContext('2d');

	      /**
	       * Media
	       */
	      navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
	      navigator.getUserMedia({ video: true, audio: true }, function (stream) {
	        _this2.videoTag.src = URL.createObjectURL(stream);
	        _this2.emit('ready');
	        _this2.stream = stream;
	        _this2.videoTag.onloadedmetadata = function () {
	          _this2.videoTag.width = _this2.videoTag.videoWidth;
	          _this2.videoTag.height = _this2.videoTag.videoHeight;
	        };
	      }, function (err) {
	        console.log(err);
	      });

	      // TODO: 指定方法考える
	      this.tracker.setup({
	        videoTag: this.videoTag,
	        canvasTag: this.canvasTag,
	        model: _clmtrackr2.default.models.pca20Svm,
	        initialScale: 4,
	        stepSize: 2,
	        edgesDensity: 0.1,
	        scoreThreshold: this.scoreThreshold,
	        sizeThreshold: this.sizeThreshold
	      });
	    }
	  }, {
	    key: '_createTracker',
	    value: function _createTracker(tracker) {
	      if (typeof tracker === 'string' && tracker in supportedTrackers) {
	        return new supportedTrackers[tracker]();
	      } else if ((typeof tracker === 'undefined' ? 'undefined' : _typeof(tracker)) === 'object') {
	        return tracker;
	      }
	      return null;
	    }
	  }, {
	    key: 'start',
	    value: function start() {
	      var _this3 = this;

	      this.tracker.start();
	      this.intervalTimer = setInterval(function () {
	        var newDetectedStatus = _this3.tracker.isDetected();

	        if (newDetectedStatus) {
	          var _tracker$getFaceInfo = _this3.tracker.getFaceInfo();

	          var position = _tracker$getFaceInfo.position;
	          var size = _tracker$getFaceInfo.size;

	          _this3.capture();
	          if (!_this3.detectedStatus) {
	            _this3.emit('detected', { position: position, size: size, dataURL: _this3.dataURL });
	          } else {
	            _this3.emit('interim report', { position: position, size: size, dataURL: _this3.dataURL });
	          }
	        } else if (_this3.detectedStatus) {
	          _this3.emit('lost');
	        }
	        _this3.detectedStatus = newDetectedStatus;
	      }, this.freq);
	    }
	  }, {
	    key: 'stop',
	    value: function stop() {
	      this.tracker.stop();
	      clearInterval(this.intervalTimer);
	    }
	  }, {
	    key: 'capture',
	    value: function capture() {
	      if (this.stream) {
	        var _tracker$getVertexesF = this.tracker.getVertexesForCapture();

	        var point = _tracker$getVertexesF.point;
	        var size = _tracker$getVertexesF.size;


	        var cw = this.canvasTag.width;
	        var ch = this.canvasTag.height;

	        if (size.x / size.y > cw / ch) {
	          ch = size.y / size.x * cw;
	        } else {
	          cw = size.x / size.y * ch;
	        }

	        this.ctx.drawImage(this.videoTag, point.x, point.y, size.x, size.y, 0, 0, cw, ch);
	        this.dataURL = this.canvasTag.toDataURL('image/png');
	      }
	    }
	  }]);

	  return FaceDetector;
	}(_eventemitter2.default);

	exports.default = FaceDetector;

/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = require("eventemitter3");

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _clmtrackr = __webpack_require__(3);

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var FaceDetectorClmtrackr = function () {
	  function FaceDetectorClmtrackr() {
	    _classCallCheck(this, FaceDetectorClmtrackr);

	    this.tracker = new _clmtrackr.tracker();

	    this.freq = null;
	    this.scoreThreshold = null;
	    this.sizeThreshold = null;
	    this.detectedStatus = false;
	    this.videoTag = null;
	    this.canvasTag = null;
	    this.ctx = null;
	    this.dataURL = null;
	  }

	  _createClass(FaceDetectorClmtrackr, [{
	    key: 'setup',
	    value: function setup(_ref) {
	      var videoTag = _ref.videoTag;
	      var canvasTag = _ref.canvasTag;
	      var model = _ref.model;
	      var scoreThreshold = _ref.scoreThreshold;
	      var sizeThreshold = _ref.sizeThreshold;

	      /**
	       * Model
	       */
	      var _model = null;
	      if (typeof model === 'string' && model in _clmtrackr.models) {
	        _model = _clmtrackr.models[model];
	      } else if ((typeof model === 'undefined' ? 'undefined' : _typeof(model)) === 'object' && this._isClmTrackrModel(model)) {
	        _model = model;
	      }

	      if (!_model) {
	        throw new Error('Specified model is invalid!');
	      }

	      this.tracker.init(_model);

	      /**
	       * Video Tag
	       */
	      this.videoTag = videoTag;

	      /**
	       * Canvas Tag
	       */
	      this.canvasTag = canvasTag;

	      this.scoreThreshold = scoreThreshold;
	      this.sizeThreshold = sizeThreshold;
	    }
	  }, {
	    key: 'start',
	    value: function start() {
	      if (!this.videoTag) {
	        throw new Error('Please setup before start');
	      }
	      this.tracker.start(this.videoTag);
	    }
	  }, {
	    key: 'stop',
	    value: function stop() {
	      this.tracker.stop();
	      clearInterval(this.intervalTimer);
	    }
	  }, {
	    key: 'isDetected',
	    value: function isDetected() {
	      return this._checkDetectedByScore() && this._checkDetectedBySize();
	    }
	  }, {
	    key: 'getFaceInfo',
	    value: function getFaceInfo(points) {
	      var _points = points || this._getPoints();
	      var size = this._calculateSizePercentage(_points);
	      var position = this._calculatePositionPercentage(_points);
	      return { position: position, size: size };
	    }
	  }, {
	    key: 'getVertexesForCapture',
	    value: function getVertexesForCapture() {
	      var points = this._getPoints();

	      var position = this._calculatePosition(points);
	      var size = this._calculateSize(points);

	      var _getVertexes2 = this._getVertexes(points);

	      var min = _getVertexes2.min;
	      var max = _getVertexes2.max;

	      /** 髪比率 **/

	      min.y = min.y > size.y * 0.6 ? min.y - size.y * 0.6 : 0;
	      size.y = min.y > 0 ? size.y * 1.6 : max.y;

	      /** 正方形に変換 **/
	      min.x = position.x - size.y / 2;
	      size.x = size.y;

	      return { point: _extends({}, min), size: _extends({}, size) };
	    }
	  }, {
	    key: '_checkDetectedByScore',
	    value: function _checkDetectedByScore() {
	      return this.tracker.getScore() > this.scoreThreshold;
	    }
	  }, {
	    key: '_checkDetectedBySize',
	    value: function _checkDetectedBySize() {
	      var points = this._getPoints();
	      if (!points) return null;
	      var size = this._calculateSizePercentage(points);
	      return size.x > this.sizeThreshold.x && size.y > this.sizeThreshold.y;
	    }
	  }, {
	    key: '_getPoints',
	    value: function _getPoints() {
	      var position = this.tracker.getCurrentPosition();
	      if (!position) return null;

	      var _transpose2 = this._transpose(position);

	      var _transpose3 = _slicedToArray(_transpose2, 2);

	      var xs = _transpose3[0];
	      var ys = _transpose3[1];

	      return { xs: xs, ys: ys };
	    }
	  }, {
	    key: '_calculatePositionPercentage',
	    value: function _calculatePositionPercentage(points) {
	      return this._getPercentage(this._calculatePosition(points));
	    }
	  }, {
	    key: '_calculatePosition',
	    value: function _calculatePosition(points) {
	      var xs = points.xs;
	      var ys = points.ys;

	      return { x: this._getCenter(xs), y: this._getCenter(ys) };
	    }
	  }, {
	    key: '_calculateSizePercentage',
	    value: function _calculateSizePercentage(points) {
	      var size = this._calculateSize(points);
	      return {
	        x: size.x / this.videoTag.width * 100,
	        y: size.y / this.videoTag.height * 100
	      };
	    }
	  }, {
	    key: '_calculateSize',
	    value: function _calculateSize(points) {
	      var xs = points.xs;
	      var ys = points.ys;

	      return {
	        x: Math.max.apply(Math, _toConsumableArray(xs)) - Math.min.apply(Math, _toConsumableArray(xs)),
	        y: Math.max.apply(Math, _toConsumableArray(ys)) - Math.min.apply(Math, _toConsumableArray(ys))
	      };
	    }
	  }, {
	    key: '_transpose',
	    value: function _transpose(targ) {
	      return [targ.map(function (x) {
	        return x[0];
	      }), targ.map(function (x) {
	        return x[1];
	      })];
	    }
	  }, {
	    key: '_getCenter',
	    value: function _getCenter(targ) {
	      return (Math.min.apply(Math, _toConsumableArray(targ)) + Math.max.apply(Math, _toConsumableArray(targ))) / 2;
	    }
	  }, {
	    key: '_getPercentage',
	    value: function _getPercentage(targ) {
	      return {
	        x: 100 - targ.x / this.videoTag.width * 100,
	        y: targ.y / this.videoTag.height * 100
	      };
	    }
	  }, {
	    key: '_getVertexes',
	    value: function _getVertexes(_ref2) {
	      var xs = _ref2.xs;
	      var ys = _ref2.ys;

	      return {
	        min: { x: Math.min.apply(Math, _toConsumableArray(xs)), y: Math.min.apply(Math, _toConsumableArray(ys)) },
	        max: { x: Math.max.apply(Math, _toConsumableArray(xs)), y: Math.max.apply(Math, _toConsumableArray(ys)) }
	      };
	    }
	  }, {
	    key: '_isClmTrackrModel',
	    value: function _isClmTrackrModel(model) {
	      // 簡易チェック
	      return model.hasOwnProperty('scoring') && model.hasOwnProperty('path') && model.hasOwnProperty('patchModel') && model.hasOwnProperty('shapeModel') && model.hasOwnProperty('hints');
	    }
	  }]);

	  return FaceDetectorClmtrackr;
	}();

	exports.default = FaceDetectorClmtrackr;

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = require("clmtrackr");

/***/ }
/******/ ])
});
;