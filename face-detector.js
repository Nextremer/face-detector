import EventEmitter from 'eventemitter3';
import { tracker, models } from 'clmtrackr';

export default class FaceDetector extends EventEmitter {
  constructor({ model, freq, scoreThreshold, sizeThreshold }) {
    super();
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

    this.tracker = new tracker();
    this.tracker.init( _model );

    this.freq = freq || 1000;
    this.scoreThreshold = scoreThreshold || 0.5;
    this.sizeThreshold = sizeThreshold || { x: 30, y: 30 };
    this.detectedStatus = false;
    this.videoTag = null;
  }

  setup( videoTag ) {
    /**
     * Video Tag
     */
    if ( !videoTag ) {
      throw new Error('Specified video tag is invalid!');
    }
    this.videoTag = videoTag;

    /**
     * Media
     */
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    navigator.getUserMedia(
      { video: true, audio: true },
      stream => {
        this.videoTag.src = URL.createObjectURL( stream );
        this.emit( 'ready' );
      },
      err => { console.log( err ) }
    );
  }

  start() {
    if ( ! this.videoTag ) {
      throw new Error( 'Please setup before start' );
    }
    this.tracker.start( this.videoTag );
    this.intervalTimer = setInterval( () => {
      let size, position, newDetectedStatus, score = this.tracker.getScore();
      if ( this._detectedByScore( score ) ) {
        size = this._calculateFaceSize();
        position = this._calculateFacePosition();
        newDetectedStatus = this._detectedBySize( size );
      } else {
        newDetectedStatus = false;
      }


      if ( newDetectedStatus ) {
        if ( ! this.detectedStatus ) {
          this.emit( 'detected', { position, size });
        } else {
          this.emit( 'interim report', { position, size });
        }
      } else if ( this.detectedStatus ) {
        this.emit( 'lost');
      }
      this.detectedStatus = newDetectedStatus;
    }, this.freq );
  }

  stop() {
    if ( ! this.videoTag ) {
      throw new Error( 'Please setup before stop' );
    }
    this.tracker.stop();
    clearInterval( this.intervalTimer );
  }

  detected( score, size ) {
    if ( ! this.videoTag ) {
      throw new Error( 'Please setup' );
    }
    return this._detectedByScore( score ) && this._detectedBySize( size );
  }

  getFaceInfo() {
    if ( ! this.videoTag ) {
      throw new Error( 'Please setup' );
    }
    const size = this._calculateFaceSize();
    const position = this._calculateFacePosition();
    return { position, size };
  }

  getSize() {
    if ( ! this.videoTag ) {
      throw new Error( 'Please setup' );
    }
    return _calculateFaceSize();
  }

  getPosition() {
    if ( ! this.videoTag ) {
      throw new Error( 'Please setup' );
    }
    return _calculateFacePosition();
  }

  _detectedByScore( score ) {
    return score > this.scoreThreshold;
  }

  _detectedBySize( size ) {
    return size.x > this.sizeThreshold.x && size.y > this.sizeThreshold.y;
  }

  _getCurrentPosition() {
    const position = this.tracker.getCurrentPosition();
    if ( ! position ) return null;
    const [ x, y ] = this._transpose( position );
    return { x, y };
  }

  _calculateFacePosition() {
    const { x, y } = this._getCurrentPosition();
    return this._getPercentage({ x: this._getCenter( x ), y: this._getCenter( y ) });
  }

  _calculateFaceSize() {
    const { x, y } = this._getCurrentPosition();
    return {
      x: Math.max( ...x ) - Math.min( ...x ),
      y: Math.max( ...y ) - Math.min( ...y ),
    };
  }

  _transpose( targ ) {
    return Object.keys( targ[0] ).map( c => {
      return targ.map( r => {
        return r[c];
      });
    });
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

  _isClmTrackrModel( model ) {
    // 簡易チェック
    return model.hasOwnProperty( 'scoring' )
        && model.hasOwnProperty( 'path' )
        && model.hasOwnProperty( 'patchModel' )
        && model.hasOwnProperty( 'shapeModel' )
        && model.hasOwnProperty( 'hints' );
  }
}
