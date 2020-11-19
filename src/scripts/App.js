import Sample1png from '../../static/images/sample-01.png';

export default class App {

    constructor() {
        this.width = 1024;
        this.height = 768;
        this.hiddenCanvas;
        this.binW = 16;
    }

    init() {
        this.createHiddenCanvas();
        this.loadImgOnHidden();
        this.pixelateCanvas();

    }

    createHiddenCanvas() {
        this.hiddenCanvas = document.createElement('canvas');
        this.hiddenCanvas.width = this.width;
        this.hiddenCanvas.height = this.height;
        document.body.appendChild(this.hiddenCanvas);
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
