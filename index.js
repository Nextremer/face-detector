'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _eventemitter = require('eventemitter3');

var _eventemitter2 = _interopRequireDefault(_eventemitter);

var _clmtrackr = require('clmtrackr');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var FaceDetector = function (_EventEmitter) {
  _inherits(FaceDetector, _EventEmitter);

  function FaceDetector(_ref) {
    var model = _ref.model;

    _classCallCheck(this, FaceDetector);

    /**
     * Model
     */
    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(FaceDetector).call(this));

    var _model = null;
    if (typeof model === 'string' && model in _clmtrackr.models) {
      _model = _clmtrackr.models[model];
    } else if ((typeof model === 'undefined' ? 'undefined' : _typeof(model)) === 'object' && _this._isClmTrackrModel(model)) {
      _model = model;
    }

    if (!_model) {
      throw new Error('Specified model is invalid!');
    }

    _this.tracker = new _clmtrackr.tracker();
    _this.tracker.init(_model);

    _this.freq = null;
    _this.scoreThreshold = null;
    _this.sizeThreshold = null;
    _this.detectedStatus = false;
    _this.videoTag = null;
    _this.canvasTag = null;
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
        throw new Error('Specified video tag is invalid!');
      }
      this.videoTag = videoTag;

      /**
       * Canvas Tag
       */
      if (!canvasTag) {
        throw new Error('Specified canvas tag is invalid!');
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
      }, function (err) {
        console.log(err);
      });
    }
  }, {
    key: 'start',
    value: function start() {
      var _this3 = this;

      if (!this.videoTag) {
        throw new Error('Please setup before start');
      }
      this.tracker.start(this.videoTag);
      this.intervalTimer = setInterval(function () {
        var size = void 0,
            position = void 0,
            newDetectedStatus = void 0,
            score = _this3.tracker.getScore();
        if (_this3._detectedByScore(score)) {
          size = _this3._calculateFaceSize();
          position = _this3._calculateFacePosition();
          newDetectedStatus = _this3._detectedBySize(size);
        } else {
          newDetectedStatus = false;
        }

        if (newDetectedStatus) {
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
      if (!this.videoTag) {
        throw new Error('Please setup before stop');
      }
      this.tracker.stop();
      clearInterval(this.intervalTimer);
    }
  }, {
    key: 'detected',
    value: function detected(score, size) {
      if (!this.videoTag) {
        throw new Error('Please setup');
      }
      return this._detectedByScore(score) && this._detectedBySize(size);
    }
  }, {
    key: 'getFaceInfo',
    value: function getFaceInfo() {
      if (!this.videoTag) {
        throw new Error('Please setup');
      }
      var size = this._calculateFaceSize();
      var position = this._calculateFacePosition();
      return { position: position, size: size };
    }
  }, {
    key: 'getSize',
    value: function getSize() {
      if (!this.videoTag) {
        throw new Error('Please setup');
      }
      return _calculateFaceSize();
    }
  }, {
    key: 'getPosition',
    value: function getPosition() {
      if (!this.videoTag) {
        throw new Error('Please setup');
      }
      return _calculateFacePosition();
    }
  }, {
    key: 'capture',
    value: function capture() {
      if (this.stream) {
        var _getCurrentPosition2 = this._getCurrentPosition();

        var x = _getCurrentPosition2.x;
        var y = _getCurrentPosition2.y;


        var min = { x: Math.min.apply(Math, _toConsumableArray(x)), y: Math.min.apply(Math, _toConsumableArray(y)) };
        var max = { x: Math.max.apply(Math, _toConsumableArray(x)), y: Math.max.apply(Math, _toConsumableArray(y)) };
        var size = this._calculateSize();
        var pos = { x: this._getCenter(x), y: this._getCenter(y) };

        /** 髪比率 **/
        min.y = min.y > size.y * 0.6 ? min.y - size.y * 0.6 : 0;
        size.y = min.y > 0 ? size.y * 1.6 : max.y;

        min.x = pos.x - size.y / 2;
        size.x = size.y;

        min.x *= 1.5;min.y *= 1.5;
        size.x *= 1.8;size.y *= 1.8;

        var cw = this.canvasTag.width;
        var ch = this.canvasTag.height;

        if (size.x / size.y > cw / ch) {
          ch = size.y / size.x * cw;
        } else {
          cw = size.x / size.y * ch;
        }

        this.canvasTag.width = cw;
        this.canvasTag.height = ch;

        this.ctx.drawImage(this.videoTag, min.x, min.y, size.x, size.y, 0, 0, cw, ch);
        this.dataURL = this.canvasTag.toDataURL('image/png');
      }
    }
  }, {
    key: '_detectedByScore',
    value: function _detectedByScore(score) {
      return score > this.scoreThreshold;
    }
  }, {
    key: '_detectedBySize',
    value: function _detectedBySize(size) {
      return size.x > this.sizeThreshold.x && size.y > this.sizeThreshold.y;
    }
  }, {
    key: '_getCurrentPosition',
    value: function _getCurrentPosition() {
      var position = this.tracker.getCurrentPosition();
      if (!position) return null;

      var _transpose2 = this._transpose(position);

      var _transpose3 = _slicedToArray(_transpose2, 2);

      var x = _transpose3[0];
      var y = _transpose3[1];

      return { x: x, y: y };
    }
  }, {
    key: '_calculateFacePosition',
    value: function _calculateFacePosition() {
      var _getCurrentPosition3 = this._getCurrentPosition();

      var x = _getCurrentPosition3.x;
      var y = _getCurrentPosition3.y;

      return this._getPercentage({ x: this._getCenter(x), y: this._getCenter(y) });
    }
  }, {
    key: '_calculateFaceSize',
    value: function _calculateFaceSize() {
      var size = this._calculateSize();
      return {
        x: size.x / this.videoTag.width * 100,
        y: size.y / this.videoTag.height * 100
      };
    }
  }, {
    key: '_calculateSize',
    value: function _calculateSize() {
      var _getCurrentPosition4 = this._getCurrentPosition();

      var x = _getCurrentPosition4.x;
      var y = _getCurrentPosition4.y;

      return {
        x: Math.max.apply(Math, _toConsumableArray(x)) - Math.min.apply(Math, _toConsumableArray(x)),
        y: Math.max.apply(Math, _toConsumableArray(y)) - Math.min.apply(Math, _toConsumableArray(y))
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
    key: '_isClmTrackrModel',
    value: function _isClmTrackrModel(model) {
      // 簡易チェック
      return model.hasOwnProperty('scoring') && model.hasOwnProperty('path') && model.hasOwnProperty('patchModel') && model.hasOwnProperty('shapeModel') && model.hasOwnProperty('hints');
    }
  }]);

  return FaceDetector;
}(_eventemitter2.default);

exports.default = FaceDetector;
