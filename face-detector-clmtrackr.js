import { tracker, models } from 'clmtrackr';

export class FaceDetectorClmtrackr {
  constructor() {
    this.tracker = new tracker();

    this.freq = null;
    this.scoreThreshold = null;
    this.sizeThreshold = null;
    this.detectedStatus = false;
    this.videoTag = null;
    this.canvasTag = null;
    this.ctx= null;
    this.dataURL = null;
  }

  setup({ videoTag, canvasTag, model, scoreThreshold, sizeThreshold }) {
    /**
     * Model
     */
    let _model = null;
    if ( typeof model === 'string' && model in models ) {
      _model = models[ model ];
    } else if ( typeof model === 'object' && this._isClmTrackrModel( model ) ) {
      _model = model;
    }

    if ( !_model ) {
      throw new Error('Specified model is invalid!');
    }

    this.tracker.init( _model );

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

  start() {
    if ( ! this.videoTag ) {
      throw new Error( 'Please setup before start' );
    }
    this.tracker.start( this.videoTag );
  }

  stop() {
    this.tracker.stop();
    clearInterval( this.intervalTimer );
  }

  isDetected() {
    return this._checkDetectedByScore() && this._checkDetectedBySize();
  }

  getFaceInfo( points ) {
    const _points = points || this._getPoints();
    const size = this._calculateFaceSize( points );
    const position = this._calculateFacePosition( points );
    return { position, size };
  }

  getVertexesForCapture() {
    const points = this._getPoints();

    const { position, size } = this.getFaceInfo( points );
    const { min, max } = this._getVertexes( points );

    /** 髪比率 **/
    min.y = min.y > size.y * 0.6 ? min.y - size.y * 0.6 : 0;
    size.y = min.y > 0 ? size.y * 1.6 : max.y;

    min.x = position.x - size.y / 2;
    size.x = size.y;

    min.x *= 1.5; min.y *= 1.5;
    size.x *= 1.8; size.y *= 1.8;

    return { point: { ...min }, size: { ...size } };
  }

  _checkDetectedByScore() {
    return this.tracker.getScore() > this.scoreThreshold;
  }

  _checkDetectedBySize() {
    const points = this._getPoints();
    const size = this._calculateFaceSize( points );
    return size.x > this.sizeThreshold.x && size.y > this.sizeThreshold.y;
  }

  _getPoints() {
    const position = this.tracker.getCurrentPosition();
    if ( ! position ) return null;
    const [ xs, ys ] = this._transpose( position );
    return { xs, ys };
  }

  _calculateFacePosition( points ) {
    const { xs, ys } = points;
    return this._getPercentage({ x: this._getCenter( xs ), y: this._getCenter( ys ) });
  }

  _calculateFaceSize( points ) {
    const size = this._calculateSize( points );
    return {
      x: size.x / this.videoTag.width * 100,
      y: size.y / this.videoTag.height * 100,
    };
  }

  _calculateSize( points ) {
    const { xs, ys } = points;
    return {
      x: Math.max( ...xs ) - Math.min( ...xs ),
      y: Math.max( ...ys ) - Math.min( ...ys ),
    };
  }

  _transpose( targ ) {
    return [ targ.map( x => x[0] ), targ.map( x => x[1] ) ]
  }

  _getCenter( targ ) {
    return ( Math.min( ...targ ) + Math.max( ...targ ) ) / 2;
  }

  _getPercentage( targ ) {
    return {
      x: 100 - targ.x / this.videoTag.width * 100,
      y: targ.y / this.videoTag.height * 100
    };
  }

  _getVertexes({ xs, ys }) {
    return {
      min: { x: Math.min( ...xs ), y: Math.min( ...ys ) },
      max: { x: Math.max( ...xs ), y: Math.max( ...ys ) },
    };
  }

  _isClmTrackrModel( model ) {
    // 簡易チェック
    return model.hasOwnProperty( 'scoring' )
        && model.hasOwnProperty( 'path' )
        && model.hasOwnProperty( 'patchModel' )
        && model.hasOwnProperty( 'shapeModel' )
        && model.hasOwnProperty( 'hints' );
  }
}
