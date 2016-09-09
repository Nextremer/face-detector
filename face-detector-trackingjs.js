import EventEmitter from 'eventemitter3';
import { track, ObjectTracker } from 'tracking';
// import 'tracking';

export default class FaceDetectorTrackingjs extends EventEmitter {
  constructor() {
    super();
    this.tracker = new ObjectTracker( 'face' );
    this.trackerTask = null;

    this.sizeThreshold = null;
    this.initialScale = null;
    this.stepSize = null;
    this.edgesDensity = null;

    this.point = null;
    this.size = null;
  }

  setup({ videoTag, canvasTag, sizeThreshold, initialScale, stepSize, edgesDensity }) {
    this.videoTag = videoTag;
    this.canvasTag = canvasTag;

    this.sizeThreshold = sizeThreshold;
    this.initialScale = initialScale || 4;
    this.stepSize = stepSize || 2;
    this.edgesDensity = edgesDensity || 0.1;

    this.tracker.setInitialScale( this.initialScale );
    this.tracker.setStepSize( this.stepSize );
    this.tracker.setEdgesDensity( this.edgesDensity );
  }

  start() {
    if ( ! this.videoTag ) {
      throw new Error( 'Please setup before start' );
    }
    this.trackerTask = track( this.videoTag, this.tracker, { camera: true } );
    this.tracker.on('track', e => {
      if ( ! Array.isArray( e.data ) || e.data.length <= 0 ) {
        this.point = null;
        this.size = null;
        return;
      }

      // 複数取れた場合は最大サイズのものをデータとする
      let maxIdx = null, max = 0;

      e.data.forEach( ( r, i ) => {
        const size = this._getSizeScala( r.width, r.height );
        if ( max < size ) {
          max = size;
          maxIdx = i;
        }
      });

      this.point = { x: e.data[ maxIdx ].x, y: e.data[ maxIdx ].y };
      this.size = { x: e.data[ maxIdx ].width, y: e.data[ maxIdx ].height };
    });
  }

  _getSizeScala( x, y ) {
    return Math.sqrt( Math.pow( x, 2 ) + Math.pow( y, 2 ) );
  }

  stop() {
    this.trackerTask.stop();
  }

  isDetected() {
    return this._checkDetectedBySize();
  }

  _checkDetectedBySize() {
    if ( ! this.size ) return false;
    const size = this._calculateSizePercentage();
    return size.x > this.sizeThreshold.x && size.y > this.sizeThreshold.y;
  }

  getFaceInfo() {
    const position = this._calculatePositionPercentage();
    const size = this._calculateSizePercentage();
    return { position, size };
  }

  getVertexesForCapture() {
    const position = this._calculatePosition();
    const size = this.size;
    const { min, max } = this._getVertexes();

    /** 髪比率 **/
    min.y = min.y > size.y * 0.6 ? min.y - size.y * 0.6 : 0;
    size.y = min.y > 0 ? size.y * 1.6 : max.y;

    /** 正方形に変換 **/
    min.x = position.x - size.y / 2;
    size.x = size.y;

    return { point: { ...min }, size: { ...size } };
  }

  _calculatePositionPercentage() {
    const position = this._calculatePosition();
    if ( ! position ) return null
    return this._getPercentage( position );
  }

  _calculatePosition() {
    if ( ! this.point || ! this.size ) return null;
    return {
      x: this.point.x + this.size.x / 2,
      y: this.point.y + this.size.y / 2
    };
  }

  _calculateSizePercentage() {
    return ( ! this.size ) ? null : {
      x: this.size.x / this.videoTag.videoWidth * 100,
      y: this.size.y / this.videoTag.videoHeight * 100,
    };
  }

  _getVertexes() {
    return {
      min: { x: this.point.x, y: this.point.y },
      max: { x: this.point.x + this.size.x, y: this.point.y + this.size.y },
    };
  }

  _getPercentage( targ ) {
    return {
      x: 100 - targ.x / this.videoTag.videoWidth * 100,
      y: targ.y / this.videoTag.videoHeight * 100
    };
  }
}
