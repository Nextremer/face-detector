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
    var videoTag = _ref.videoTag;
    var model = _ref.model;
    var freq = _ref.freq;
    var scoreThreshold = _ref.scoreThreshold;
    var sizeThreshold = _ref.sizeThreshold;

    _classCallCheck(this, FaceDetector);

    /**
     * Video Tag
     */
    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(FaceDetector).call(this));

    if (!videoTag) {
      throw new Error('Specified video tag is invalid!');
    }
    _this.videoTag = videoTag;

    /**
     * Model
     */
    var _model = null;
    if (typeof model === 'string' && model in _clmtrackr.models) {
      _model = _clmtrackr.models[model];
    } else if ((typeof model === 'undefined' ? 'undefined' : _typeof(model)) === 'object' && _this._isClmTrackrModel(model)) {
      _model = model;
    }

    if (!_model) {
      throw new Error('Specified model is invalid!');
    }

    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    navigator.getUserMedia({ video: true, audio: false }, function (stream) {
      _this.videoTag.src = URL.createObjectURL(stream);
      _this.emit('ready');
    }, function (err) {
      console.log(err);
    });

    _this.tracker = new _clmtrackr.tracker();
    _this.tracker.init(_model);

    _this.freq = freq || 1000;
    _this.scoreThreshold = scoreThreshold || 0.5;
    _this.sizeThreshold = sizeThreshold || { x: 30, y: 30 };
    _this.detectedStatus = false;
    return _this;
  }

  _createClass(FaceDetector, [{
    key: 'start',
    value: function start() {
      var _this2 = this;

      this.tracker.start(this.videoTag);
      this.intervalTimer = setInterval(function () {
        var size = void 0,
            position = void 0,
            newDetectedStatus = void 0,
            score = _this2.tracker.getScore();
        if (_this2._detectedByScore(score)) {
          size = _this2._calculateFaceSize();
          position = _this2._calculateFacePosition();
          newDetectedStatus = _this2._detectedBySize(size);
        } else {
          newDetectedStatus = false;
        }

        if (newDetectedStatus) {
          if (!_this2.detectedStatus) {
            _this2.emit('detected', { position: position, size: size });
          } else {
            _this2.emit('interim report', { position: position, size: size });
          }
        } else if (_this2.detectedStatus) {
          _this2.emit('lost');
        }
        _this2.detectedStatus = newDetectedStatus;
      }, this.freq);
    }
  }, {
    key: 'stop',
    value: function stop() {
      this.tracker.stop();
      clearInterval(this.intervalTimer);
    }
  }, {
    key: 'detected',
    value: function detected(score, size) {
      return this._detectedByScore(score) && this._detectedBySize(size);
    }
  }, {
    key: 'getFaceInfo',
    value: function getFaceInfo() {
      var size = this._calculateFaceSize();
      var position = this._calculateFacePosition();
      return { position: position, size: size };
    }
  }, {
    key: 'getSize',
    value: function getSize() {
      return _calculateFaceSize();
    }
  }, {
    key: 'getPosition',
    value: function getPosition() {
      return _calculateFacePosition();
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
      var _getCurrentPosition2 = this._getCurrentPosition();

      var x = _getCurrentPosition2.x;
      var y = _getCurrentPosition2.y;

      return this._getPercentage({ x: this._getCenter(x), y: this._getCenter(y) });
    }
  }, {
    key: '_calculateFaceSize',
    value: function _calculateFaceSize() {
      var _getCurrentPosition3 = this._getCurrentPosition();

      var x = _getCurrentPosition3.x;
      var y = _getCurrentPosition3.y;

      return {
        x: Math.max.apply(Math, _toConsumableArray(x)) - Math.min.apply(Math, _toConsumableArray(x)),
        y: Math.max.apply(Math, _toConsumableArray(y)) - Math.min.apply(Math, _toConsumableArray(y))
      };
    }
  }, {
    key: '_transpose',
    value: function _transpose(targ) {
      return Object.keys(targ[0]).map(function (c) {
        return targ.map(function (r) {
          return r[c];
        });
      });
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
