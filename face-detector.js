import EventEmitter from 'eventemitter3';
import FaceDetectorClmtrackr from './face-detector-clmtrackr';
// import FaceDetectorTrackingjs from './face-detector-trackingjs';
import clmtrackr from 'clmtrackr';

const supportedTrackers = {
  clmtrackr: FaceDetectorClmtrackr,
  // trackingjs: FaceDetectorTrackingjs
};

export default class FaceDetector extends EventEmitter {
  constructor({ tracker }) {
    super();

    this.tracker = this._createTracker( tracker );
    if ( ! tracker ) {
      throw new Error( 'Invalid tracker!' );
    }

    this.detectedStatus = false;
    this.ctx= null;
    this.stream = null;
    this.dataURL = null;
  }

  setup({ videoTag, canvasTag, freq, scoreThreshold, sizeThreshold }) {
    this.freq = freq || 1000;
    this.scoreThreshold = scoreThreshold || 0.5;
    this.sizeThreshold = sizeThreshold || { x: 10, y: 10 };

    /**
     * Video Tag
     */
    if ( !videoTag ) {
      throw new Error('Invalid video tag!');
    }
    this.videoTag = videoTag;

    /**
     * Canvas Tag
     */
    if ( !canvasTag ) {
      throw new Error('Invalid canvas tag!');
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
        this.videoTag.onloadedmetadata = () => {
          this.videoTag.width = this.videoTag.videoWidth;
          this.videoTag.height = this.videoTag.videoHeight;
        };
      },
      err => { console.log( err ) }
    );

    // TODO: 指定方法考える
    this.tracker.setup({
      videoTag: this.videoTag,
      canvasTag: this.canvasTag,
      model: clmtrackr.models.pca20Svm,
      initialScale: 4,
      stepSize: 2,
      edgesDensity: 0.1,
      scoreThreshold: this.scoreThreshold,
      sizeThreshold: this.sizeThreshold,
    });
  }

  _createTracker( tracker ) {
    if ( typeof tracker === 'string' && tracker in supportedTrackers ) {
      return new supportedTrackers[ tracker ]();
    } else if ( typeof tracker === 'object' ) {
      return tracker;
    }
    return null;
  }

  start() {
    this.tracker.start();
    this.intervalTimer = setInterval( () => {
      const newDetectedStatus = this.tracker.isDetected();

      if ( newDetectedStatus ) {
        const { position, size } = this.tracker.getFaceInfo();
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
    this.tracker.stop();
    clearInterval( this.intervalTimer );
  }

  capture() {
    if ( this.stream ) {
      const { point, size } = this.tracker.getVertexesForCapture();

      let cw = this.canvasTag.width;
      let ch = this.canvasTag.height;

      if ( size.x / size.y > cw / ch ) {
        ch = size.y / size.x * cw;
      } else {
        cw = size.x / size.y * ch;
      }

      this.ctx.drawImage( this.videoTag, point.x, point.y, size.x, size.y, 0, 0, cw, ch );
      this.dataURL = this.canvasTag.toDataURL('image/png');
    }
  }
}
