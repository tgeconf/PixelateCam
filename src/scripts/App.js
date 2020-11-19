import Sample1png from '../../static/images/sample-01.png';
import Circle from './circle';
import { Circ } from 'gsap';

export default class App {

    constructor() {
        this.width = 1024;
        this.height = 768;
        this.hiddenCanvas;
        this.targetCanvas;
        this.binW = 32;
    }

    init() {
        this.targetCanvas = document.getElementById('canvasContainer');
        this.createHiddenCanvas();
        this.loadCameraOnHidden();
        // this.testCircles();
        // window.requestAnimationFrame(Circle.updateAll);
        // this.loadImgOnHidden();
        // this.pixelateCanvas();
        var file = document.getElementById("thefile");
        var audio = document.getElementById("audio");

        file.onchange = function () {
            var files = this.files;
            audio.src = URL.createObjectURL(files[0]);
            audio.load();
            audio.play();
            var context = new AudioContext();
            var src = context.createMediaElementSource(audio);
            var analyser = context.createAnalyser();

            // var canvas = document.getElementById("canvas");
            // canvas.width = window.innerWidth;
            // canvas.height = window.innerHeight;
            // var ctx = canvas.getContext("2d");

            src.connect(analyser);
            analyser.connect(context.destination);

            analyser.fftSize = 256;

            var bufferLength = analyser.frequencyBinCount;
            console.log(bufferLength);

            var dataArray = new Uint8Array(bufferLength);

            var barWidth = (1024 / bufferLength) * 2.5;
            // var barHeight;
            // var x = 0;

            Circle.initBigCircle();

            let timeGap = Math.random() * 60 + 100;
            let count = 0;

            function renderFrame() {
                requestAnimationFrame(renderFrame);

                analyser.getByteFrequencyData(dataArray);

                // ctx.fillStyle = "#000";
                // ctx.fillRect(0, 0, WIDTH, HEIGHT);
                let maxV = 0, maxIdx = 0;
                for (let i = 0; i < bufferLength; i++) {
                    if (dataArray[i] > maxV && i > 6) {
                        maxV = dataArray[i];
                        maxIdx = i;
                    }
                }
                let direct = 1;
                if (maxIdx < Circle.BigCircleIdx) {
                    direct = -1;
                }
                Circle.BigCircleIdx = maxIdx;

                Circle.updateBigCircle(maxV, direct);

                // for (var i = 0; i < bufferLength; i += 2) {
                //     // barHeight = dataArray[i];

                //     // var r = barHeight + (25 * (i / bufferLength));
                //     // var g = 250 * (i / bufferLength);
                //     // var b = 50;

                //     let x = Math.random() * barWidth + barWidth * i;
                //     let y = 1024 - (Math.random() * 10 - 5 + dataArray[i]) * 3;
                //     let r = Circle.rScale(dataArray[i]);
                //     let c = new Circle(x, y, 6, r);
                //     // c.init();

                //     // ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
                //     // ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);

                //     // x += barWidth + 1;
                // }
                Circle.updateAll();
                count++;

                if (count > timeGap) {
                    timeGap = Math.random() * 60 + 100;
                    count = 0;

                    // console.log('poping');
                    dataArray = dataArray.sort().reverse();

                    for (let i = 0; i < bufferLength && i < 5; i++) {
                        let r = Circle.dynamicRScale(dataArray[i], [dataArray[5], dataArray[0]]);
                        // console.log('adding', r);
                        let c = new Circle(Circle.bigCircle.x, Circle.bigCircle.y, 6, r);
                        c.init(true);
                    }
                }
            }

            audio.play();
            renderFrame();
        };
    }

    testCircles() {
        for (let i = 0; i < 100; i++) {
            let x = Math.random() * 800;
            let y = Math.random() * 600;
            let c = new Circle(x, y, 6, 6);
            c.init();
        }
    }

    createHiddenCanvas() {
        this.hiddenCanvas = document.createElement('canvas');
        this.hiddenCanvas.width = this.width;
        this.hiddenCanvas.height = this.height;
        document.body.appendChild(this.hiddenCanvas);
    }

    loadCameraOnHidden() {
        const that = this;
        const video = document.getElementById('video');
        const canvas = this.hiddenCanvas;
        // var canvas = document.getElementById('canvasVideo');
        const hiddenCtx = canvas.getContext('2d');
        const targetCtx = this.targetCanvas.getContext('2d');
        if (navigator.mediaDevices.getUserMedia) {
            var successCallback = function (stream) {
                video.srcObject = stream;
            };
            var errorCallback = function (error) {
                console.log(error);
            };
            navigator.mediaDevices.getUserMedia({
                audio: false,
                video: { facingMode: 'environment' }
            }).then(successCallback, errorCallback);
            requestAnimationFrame(renderFrame);
        }

        function calculateSize(srcSize, dstSize) {
            var srcRatio = srcSize.width / srcSize.height;
            var dstRatio = dstSize.width / dstSize.height;
            if (dstRatio > srcRatio) {
                return {
                    width: dstSize.height * srcRatio,
                    height: dstSize.height
                };
            } else {
                return {
                    width: dstSize.width,
                    height: dstSize.width / srcRatio
                };
            }
        }

        function renderFrame() {
            requestAnimationFrame(renderFrame);
            if (video.readyState === video.HAVE_ENOUGH_DATA) {
                var videoSize = { width: video.videoWidth, height: video.videoHeight };
                var canvasSize = { width: canvas.width, height: canvas.height };
                var renderSize = calculateSize(videoSize, canvasSize);
                var xOffset = (canvasSize.width - renderSize.width) / 2;
                hiddenCtx.drawImage(video, xOffset, 0, renderSize.width, renderSize.height);
                const imgData = hiddenCtx.getImageData(0, 0, renderSize.width, renderSize.height);
                const binSize = that.binW * that.binW * 4;

                targetCtx.fillStyle = '#000';
                targetCtx.fillRect(0, 0, that.width, that.height);
                console.log(that.width, that.height);
                const binRows = Math.ceil(that.height / that.binW);
                const binCols = Math.ceil(that.width / that.binW);
                let maxIdx = 0;
                for (let i = 0; i < binRows; i++) {
                    for (let j = 0; j < binCols; j++) {
                        let colorRecord = { r: 0, g: 0, b: 0, a: 0 };
                        let count = 0;
                        for (let m = 0; m < that.binW && (i * that.binW + m < that.height); m++) {
                            for (let n = 0; n < that.binW && (j * that.binW + n < that.width); n++) {
                                count++;
                                const idx = (i * that.binW + m) * that.width + (j * that.binW + n);
                                colorRecord.r += imgData.data[4 * idx];
                                colorRecord.g += imgData.data[4 * idx + 1];
                                colorRecord.b += imgData.data[4 * idx + 2];
                                colorRecord.a += imgData.data[4 * idx + 3];
                                if (4 * idx + 3 > maxIdx) {
                                    maxIdx = 4 * idx + 3;
                                }
                            }
                        }

                        targetCtx.beginPath();
                        targetCtx.arc(j * that.binW + that.binW / 2, i * that.binW + that.binW / 2, that.binW / 2, 0, 2 * Math.PI, false);
                        targetCtx.fillStyle = 'rgb(' + (colorRecord.r / count) + ',' + (colorRecord.g / count) + ',' + (colorRecord.b / count) + ')';
                        targetCtx.fill();
                        targetCtx.closePath();
                    }
                }
                console.log(imgData.data.length, maxIdx);
            }
        }
    }

    loadImgOnHidden() {
        const ctx = this.hiddenCanvas.getContext('2d');
        const img = new Image;
        img.onload = () => {
            const w = img.width;
            const h = img.height;
            const ratio = w / h;
            const canvasRatio = this.width / this.height;
            let offsetX = 0, offsetY = 0, targetW = 0, targetH = 0;
            if (ratio > canvasRatio) {
                targetH = this.height;
                targetW = this.height * ratio;
                let diffW = (targetW - this.width) / 2;
                offsetX = -diffW;
            } else {
                targetW = this.width;
                targetH = targetW / ratio;
                let diffH = (targetH - this.height) / 2;
                offsetY = -diffH;
            }
            ctx.drawImage(img, offsetX, offsetY, targetW, targetH);
        }
        img.src = Sample1png;
    }

    pixelateCanvas() {
        const canvas = document.getElementById('canvsaContainer');
        const hiddenCtx = this.hiddenCanvas.getContext('2d');
        const imageData = hiddenCtx.getImageData(0, 0, this.width, this.height);
    }
}