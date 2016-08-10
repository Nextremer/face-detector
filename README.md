face-detector
====

## Description
**face-detector** is javascript library for detecting face in video, using [clmtrackr](https://github.com/auduno/clmtrackr).

## Requirement
* [clmtrackr](https://github.com/Nextremer/clmtrackr)
* [EventEmitter3](https://github.com/primus/eventemitter3)

## Install
`npm install -S Nextremer/face-detector`

## Usage
### First, put following tags in your HTML code.
  - <video /> tag to put video from web camera.
  - <canvas /> tag to put capture image.

### Setup
```
// Initialize
const detector = new FaceDetector({
  model: models.pca20Svm, // model data
  freq: 1000, // check frequency
  scoreThreshold: 0.5, // score threshold to judge for face detected
  sizeThreshold: { x: 100, y: 100 } // size threshold to judge for face detected
});
detector.setup(
  document.getElementById('input-video'), /* Video element */
  document.getElementById('input-canvas') /* Canvas element */
);

// Handlers
detector.on('ready', () => {
  // face-detector is ready
});
detector.on('detected', ({ position, size }) => {
  // face detected
  //   position: detected face's center position ( percentage based on top-left of video tag )
  //   position: detected face's size ( pixels )
});
detector.on('interim report', ({ position, size }) => {
  //   position: detected face's center position ( percentage based on top-left of video tag )
  //   position: detected face's size ( pixels )
});
detector.on('lost', () => {
  // face lost
});

// Start
detector.start();
```

## Licence

[MIT](https://github.com/tcnksm/tool/blob/master/LICENCE)

