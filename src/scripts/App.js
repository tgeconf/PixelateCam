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
            const colors = ['#412089', '#182a80', '#09308d', '#15479c', '#1165ab', '#2085b3', '#13b4a4', '#2faa38', '#3ab035', '#78bc27', '#afd029', '#f2e928', '#f5b61b', '#ef8317', '#ee6d19', '#e94e18', '#e72019', '#e30f26'];
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
                    const thr = 160;
                    for (let i = 0; i < bufferLength; i++) {
                        if (dataArray[i] >= thr) {
                            let r = Circle.dynamicRScale(dataArray[i], [thr, dataArray[0]]);
                            // console.log('adding', r, colors[i], i);
                            let c = new Circle(Circle.bigCircle.x, Circle.bigCircle.y, 6, r, colors[i]);
                            c.init(true, i !== 0);
                        }
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
        this.hiddenCanvas.style.display = 'none';
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

        function rgbToHsl(rgb) {
            let [r, g, b] = rgb;
            r /= 255, g /= 255, b /= 255;
            let max = Math.max(r, g, b), min = Math.min(r, g, b);
            let h, s, l = (max + min) / 2;

            if (max == min) {
                h = s = 0; // achromatic
            } else {
                let d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    case b: h = (r - g) / d + 4; break;
                }
                h /= 6;
            }
            return [h, s, l];
        }
        function hslToRgb(hsl) {
            const h = hsl[0];
            const s = hsl[1];
            const l = hsl[2];
            var r, g, b;

            if (s == 0) {
                r = g = b = l; // achromatic
            } else {
                var hue2rgb = function hue2rgb(p, q, t) {
                    if (t < 0) t += 1;
                    if (t > 1) t -= 1;
                    if (t < 1 / 6) return p + (q - p) * 6 * t;
                    if (t < 1 / 2) return q;
                    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                    return p;
                }

                var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                var p = 2 * l - q;
                r = hue2rgb(p, q, h + 1 / 3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1 / 3);
            }

            return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
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
                // targetCtx.globalAlpha = 0.01;
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
                        let targetR = colorRecord.r / count;
                        let targetG = colorRecord.g / count;
                        let targetB = colorRecord.b / count;
                        // if (Math.abs(targetR - targetG) < 10 && Math.abs(targetR - targetB) < 10 && targetR > thr) {
                        //     const diff = targetR - thr;
                        //     targetR -= diff;
                        //     targetG -= diff;
                        //     targetB -= diff;
                        // }
                        const [h, s, l] = rgbToHsl([targetR, targetG, targetB]);
                        l = l * 0.3;
                        [targetR, targetG, targetB] = hslToRgb([h, s, l]);
                        let gray = (0.2126 * targetR + 0.7152 * targetG + 0.0722 * targetB);
                        let grayRange = [20, 80];
                        gray = (gray / 255) * (grayRange[1] - grayRange[0]) + grayRange[0];
                        targetCtx.fillStyle = 'rgba(' + targetR + ',' + targetG + ',' + targetB + ', 0.7)';
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