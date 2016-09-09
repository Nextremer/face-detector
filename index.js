(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("eventemitter3"), require("clmtrackr"), require("tracking"));
	else if(typeof define === 'function' && define.amd)
		define(["eventemitter3", "clmtrackr", "tracking"], factory);
	else if(typeof exports === 'object')
		exports["face-detector"] = factory(require("eventemitter3"), require("clmtrackr"), require("tracking"));
	else
		root["face-detector"] = factory(root["eventemitter3"], root["clmtrackr"], root["tracking"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_1__, __WEBPACK_EXTERNAL_MODULE_3__, __WEBPACK_EXTERNAL_MODULE_5__) {
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

	var _faceDetectorTrackingjs = __webpack_require__(4);

	var _faceDetectorTrackingjs2 = _interopRequireDefault(_faceDetectorTrackingjs);

	var _clmtrackr = __webpack_require__(3);

	var _clmtrackr2 = _interopRequireDefault(_clmtrackr);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var supportedTrackers = {
	  clmtrackr: _faceDetectorClmtrackr2.default,
	  trackingjs: _faceDetectorTrackingjs2.default
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
	    _this.cw = null;
	    _this.ch = null;
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
	      var started = false;
	      navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
	      navigator.getUserMedia({ video: true, audio: true }, function (stream) {
	        _this2.videoTag.src = URL.createObjectURL(stream);
	        _this2.stream = stream;
	        _this2.videoTag.onloadedmetadata = function () {
	          if (!started) {
	            started = true;
	            _this2.videoTag.width = _this2.videoTag.videoWidth;
	            _this2.videoTag.height = _this2.videoTag.videoHeight;
	            // TODO: 指定方法考える
	            _this2.tracker.setup({
	              videoTag: _this2.videoTag,
	              canvasTag: _this2.canvasTag,
	              model: _clmtrackr2.default.models.pca20Svm,
	              initialScale: 4,
	              stepSize: 2,
	              edgesDensity: 0.1,
	              scoreThreshold: _this2.scoreThreshold,
	              sizeThreshold: _this2.sizeThreshold
	            });
	            _this2.emit('ready');
	          }
	        };
	      }, function (err) {
	        console.log(err);
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


	        if (!this.cw || !this.ch) {
	          this.cw = this.canvasTag.width;
	          this.ch = this.canvasTag.height;

	          if (size.x / size.y > this.cw / this.ch) {
	            this.ch = size.y / size.x * this.cw;
	          } else {
	            this.cw = size.x / size.y * this.ch;
	          }
	        }

	        this.ctx.drawImage(this.videoTag, point.x, point.y, size.x, size.y, 0, 0, this.cw, this.ch);
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

	    this.scoreThreshold = null;
	    this.sizeThreshold = null;
	    this.videoTag = null;
	    this.canvasTag = null;
	  }

	  _createClass(FaceDetectorClmtrackr, [{
	    key: 'setup',
	    value: function setup(_ref) {
	      var videoTag = _ref.videoTag;
	      var canvasTag = _ref.canvasTag;
	      var model = _ref.model;
	      var scoreThreshold = _ref.scoreThreshold;
	      var sizeThreshold = _ref.sizeThreshold;

	      this.videoTag = videoTag;
	      this.canvasTag = canvasTag;

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
	    }
	  }, {
	    key: 'isDetected',
	    value: function isDetected() {
	      return this._checkDetectedByScore() && this._checkDetectedBySize();
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
	      if (!points) return false;
	      var size = this._calculateSizePercentage(points);
	      return size.x > this.sizeThreshold.x && size.y > this.sizeThreshold.y;
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
	        x: size.x / this.videoTag.videoWidth * 100,
	        y: size.y / this.videoTag.videoHeight * 100
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
	        x: 100 - targ.x / this.videoTag.videoWidth * 100,
	        y: targ.y / this.videoTag.videoHeight * 100
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

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _eventemitter = __webpack_require__(1);

	var _eventemitter2 = _interopRequireDefault(_eventemitter);

	var _tracking = __webpack_require__(5);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	// import 'tracking';

	var FaceDetectorTrackingjs = function (_EventEmitter) {
	  _inherits(FaceDetectorTrackingjs, _EventEmitter);

	  function FaceDetectorTrackingjs() {
	    _classCallCheck(this, FaceDetectorTrackingjs);

	    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(FaceDetectorTrackingjs).call(this));

	    _this.tracker = new _tracking.ObjectTracker('face');
	    _this.trackerTask = null;

	    _this.sizeThreshold = null;
	    _this.initialScale = null;
	    _this.stepSize = null;
	    _this.edgesDensity = null;

	    _this.point = null;
	    _this.size = null;
	    return _this;
	  }

	  _createClass(FaceDetectorTrackingjs, [{
	    key: 'setup',
	    value: function setup(_ref) {
	      var videoTag = _ref.videoTag;
	      var canvasTag = _ref.canvasTag;
	      var sizeThreshold = _ref.sizeThreshold;
	      var initialScale = _ref.initialScale;
	      var stepSize = _ref.stepSize;
	      var edgesDensity = _ref.edgesDensity;

	      this.videoTag = videoTag;
	      this.canvasTag = canvasTag;

	      this.sizeThreshold = sizeThreshold;
	      this.initialScale = initialScale || 4;
	      this.stepSize = stepSize || 2;
	      this.edgesDensity = edgesDensity || 0.1;

	      this.tracker.setInitialScale(this.initialScale);
	      this.tracker.setStepSize(this.stepSize);
	      this.tracker.setEdgesDensity(this.edgesDensity);
	    }
	  }, {
	    key: 'start',
	    value: function start() {
	      var _this2 = this;

	      if (!this.videoTag) {
	        throw new Error('Please setup before start');
	      }
	      this.trackerTask = (0, _tracking.track)(this.videoTag, this.tracker, { camera: true });
	      this.tracker.on('track', function (e) {
	        if (!Array.isArray(e.data) || e.data.length <= 0) {
	          _this2.point = null;
	          _this2.size = null;
	          return;
	        }

	        // 複数取れた場合は最大サイズのものをデータとする
	        var maxIdx = null,
	            max = 0;

	        e.data.forEach(function (r, i) {
	          var size = _this2._getSizeScala(r.width, r.height);
	          if (max < size) {
	            max = size;
	            maxIdx = i;
	          }
	        });

	        _this2.point = { x: e.data[maxIdx].x, y: e.data[maxIdx].y };
	        _this2.size = { x: e.data[maxIdx].width, y: e.data[maxIdx].height };
	      });
	    }
	  }, {
	    key: '_getSizeScala',
	    value: function _getSizeScala(x, y) {
	      return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
	    }
	  }, {
	    key: 'stop',
	    value: function stop() {
	      this.trackerTask.stop();
	    }
	  }, {
	    key: 'isDetected',
	    value: function isDetected() {
	      return this._checkDetectedBySize();
	    }
	  }, {
	    key: '_checkDetectedBySize',
	    value: function _checkDetectedBySize() {
	      if (!this.size) return false;
	      var size = this._calculateSizePercentage();
	      return size.x > this.sizeThreshold.x && size.y > this.sizeThreshold.y;
	    }
	  }, {
	    key: 'getFaceInfo',
	    value: function getFaceInfo() {
	      var position = this._calculatePositionPercentage();
	      var size = this._calculateSizePercentage();
	      return { position: position, size: size };
	    }
	  }, {
	    key: 'getVertexesForCapture',
	    value: function getVertexesForCapture() {
	      var position = this._calculatePosition();
	      var size = this.size;

	      var _getVertexes2 = this._getVertexes();

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
	    key: '_calculatePositionPercentage',
	    value: function _calculatePositionPercentage() {
	      var position = this._calculatePosition();
	      if (!position) return null;
	      return this._getPercentage(position);
	    }
	  }, {
	    key: '_calculatePosition',
	    value: function _calculatePosition() {
	      if (!this.point || !this.size) return null;
	      return {
	        x: this.point.x + this.size.x / 2,
	        y: this.point.y + this.size.y / 2
	      };
	    }
	  }, {
	    key: '_calculateSizePercentage',
	    value: function _calculateSizePercentage() {
	      return !this.size ? null : {
	        x: this.size.x / this.videoTag.videoWidth * 100,
	        y: this.size.y / this.videoTag.videoHeight * 100
	      };
	    }
	  }, {
	    key: '_getVertexes',
	    value: function _getVertexes() {
	      return {
	        min: { x: this.point.x, y: this.point.y },
	        max: { x: this.point.x + this.size.x, y: this.point.y + this.size.y }
	      };
	    }
	  }, {
	    key: '_getPercentage',
	    value: function _getPercentage(targ) {
	      return {
	        x: 100 - targ.x / this.videoTag.videoWidth * 100,
	        y: targ.y / this.videoTag.videoHeight * 100
	      };
	    }
	  }]);

	  return FaceDetectorTrackingjs;
	}(_eventemitter2.default);

	exports.default = FaceDetectorTrackingjs;

/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = require("tracking");

/***/ }
/******/ ])
});
;