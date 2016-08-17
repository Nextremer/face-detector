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
    this.sizeThreshold = sizeThreshold || { x: 10, y: 10 };
    this.detectedStatus = false;
    this.videoTag = null;
    this.canvasTag = null;
    this.ctx= null;
    this.stream = null;
    this.dataURL = null;
  }

  setup( videoTag, canvasTag ) {
    /**
     * Video Tag
     */
    if ( !videoTag ) {
      throw new Error('Specified video tag is invalid!');
    }
    this.videoTag = videoTag;

    /**
     * Canvas Tag
     */
    if ( !canvasTag ) {
      throw new Error('Specified canvas tag is invalid!');
    }
    this.canvasTag = canvasTag;
    this.ctx = this.canvasTag.getContext( '2d' );

    /**
     * Media
     */
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    navigator.getUserMedia(
      { video: true, audio: true },
      stream => {
        this.videoTag.src = URL.createObjectURL( stream );
        this.emit( 'ready' );
        this.stream = stream;
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
        this.capture();
        if ( ! this.detectedStatus ) {
          this.emit( 'detected', { position, size, dataURL: this.dataURL });
        } else {
          this.emit( 'interim report', { position, size, dataURL: this.dataURL });
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

  capture() {
    if ( this.stream ) {
      const { x, y } = this._getCurrentPosition();

      const min = { x: Math.min( ...x ), y: Math.min( ...y ) };
      const max = { x: Math.max( ...x ), y: Math.max( ...y ) };
      const size = this._calculateSize();
      const pos = { x: this._getCenter( x ), y: this._getCenter( y ) };

      /** 髪比率 **/
      min.y = min.y > size.y * 0.6 ? min.y - size.y * 0.6 : 0;
      size.y = min.y > 0 ? size.y * 1.6 : max.y;

      min.x = pos.x - size.y / 2;
      size.x = size.y;

      min.x *= 1.5; min.y *= 1.5;
      size.x *= 1.8; size.y *= 1.8;

      let cw = this.canvasTag.width;
      let ch = this.canvasTag.height;

      if ( size.x / size.y > cw / ch ) {
        ch = size.y / size.x * cw;
      } else {
        cw = size.x / size.y * ch;
      }

      this.canvasTag.width = cw;
      this.canvasTag.height = ch;

      this.ctx.drawImage( this.videoTag, min.x, min.y, size.x, size.y, 0, 0, cw, ch );
      this.dataURL = this.canvasTag.toDataURL('image/png');
    }
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
    const size = this._calculateSize();
    return {
      x: size.x / this.videoTag.width * 100,
      y: size.y / this.videoTag.height * 100,
    };
  }

  _calculateSize() {
    const { x, y } = this._getCurrentPosition();
    return {
      x: Math.max( ...x ) - Math.min( ...x ),
      y: Math.max( ...y ) - Math.min( ...y ),
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

  _isClmTrackrModel( model ) {
    // 簡易チェック
    return model.hasOwnProperty( 'scoring' )
        && model.hasOwnProperty( 'path' )
        && model.hasOwnProperty( 'patchModel' )
        && model.hasOwnProperty( 'shapeModel' )
        && model.hasOwnProperty( 'hints' );
  }
}
