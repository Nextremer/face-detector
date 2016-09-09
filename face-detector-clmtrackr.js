import { tracker, models } from 'clmtrackr';

export default class FaceDetectorClmtrackr {
  constructor() {
    this.tracker = new tracker();

    this.scoreThreshold = null;
    this.sizeThreshold = null;
    this.videoTag = null;
    this.canvasTag = null;
  }

  setup({ videoTag, canvasTag, model, scoreThreshold, sizeThreshold }) {
    this.videoTag = videoTag;
    this.canvasTag = canvasTag;

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
  }

  isDetected() {
    return this._checkDetectedByScore() && this._checkDetectedBySize();
  }

  _checkDetectedByScore() {
    return this.tracker.getScore() > this.scoreThreshold;
  }

  _checkDetectedBySize() {
    const points = this._getPoints();
    if ( !points ) return false;
    const size = this._calculateSizePercentage( points );
    return size.x > this.sizeThreshold.x && size.y > this.sizeThreshold.y;
  }

  getFaceInfo( points ) {
    const _points = points || this._getPoints();
    if ( ! _points ) return null;
    const size = this._calculateSizePercentage( _points );
    const position = this._calculatePositionPercentage( _points );
    return { position, size };
  }

  getVertexesForCapture() {
    const points = this._getPoints();

    if ( ! points ) return null;

    const position = this._calculatePosition( points );
    const size = this._calculateSize( points );
    const { min, max } = this._getVertexes( points );

    /** 髪比率 **/
    min.y = min.y > size.y * 0.6 ? min.y - size.y * 0.6 : 0;
    size.y = min.y > 0 ? size.y * 1.6 : max.y;

    /** 正方形に変換 **/
    min.x = position.x - size.y / 2;
    size.x = size.y;

    return { point: { ...min }, size: { ...size } };
  }

  _getPoints() {
    const position = this.tracker.getCurrentPosition();
    if ( ! position ) return null;
    const [ xs, ys ] = this._transpose( position );
    return { xs, ys };
  }

  _calculatePositionPercentage( points ) {
    return this._getPercentage( this._calculatePosition( points ) );
  }

  _calculatePosition ( points ) {
    const { xs, ys } = points;
    return { x: this._getCenter( xs ), y: this._getCenter( ys ) };
  }

  _calculateSizePercentage( points ) {
    const size = this._calculateSize( points );
    return {
      x: size.x / this.videoTag.videoWidth * 100,
      y: size.y / this.videoTag.videoHeight * 100,
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
      x: 100 - targ.x / this.videoTag.videoWidth * 100,
      y: targ.y / this.videoTag.videoHeight * 100
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
