import { Circ } from "gsap";

export default class Circle {
    static updateAll() {
        let removeIdx = [];
        for (let i = 0; i < Circle.circles.length; i++) {
            const c = Circle.circles[i];
            let deleted = c.update();
            if (deleted) {
                Circle.circles.splice(i, 1);
                i--;
            }
        }
    }

    static rScale(r) {
        const domain = [0, 255];
        const range = Circle.rRange;
        return range[0] + (range[1] - range[0]) * (r - domain[0]) / (domain[1] - domain[0]);
    }

    static dynamicRScale(r, domain) {
        const range = [10, 30];
        return range[0] + (range[1] - range[0]) * (r - domain[0]) / (domain[1] - domain[0]);
    }

    static initBigCircle() {
        const r = 36;
        Circle.bigCircle = new Circle(r * 2, Circle.containerH - r * 2, 0, r);
        Circle.bigCircle.init();
        Circle.bigCircle.ySpeed = 0;
        Circle.bigCircle.xSpeed = 1;
    }

    static updateBigCircle(r, direct) {
        const domain = [150, 255];
        const range = [26, 66];
        const targetR = range[0] + (range[1] - range[0]) * (r - domain[0]) / (domain[1] - domain[0]);
        Circle.bigCircle.circle.setAttributeNS(null, 'r', targetR);
        Circle.bigCircle.xSpeed *= direct;
        const testX = Circle.bigCircle.x + Circle.bigCircle.xSpeed;
        if (testX > 60 && testX < 939) {
            Circle.bigCircle.x += Circle.bigCircle.xSpeed;
        }
        Circle.bigCircle.circle.setAttributeNS(null, 'cx', Circle.bigCircle.x);
    }

    constructor(x, y, z, r, color = '#666') {
        this.x = x;
        this.y = y;
        this.z = z;
        this.r = r;
        this.life = 300;
        this.clock = 0;
        this.xSpeed = Math.random();
        this.ySpeed = Math.random();
        this.opacity = 0.5;
        this.circle;
        this.color = color;
        this.start = { x: x, y: y };
        this.destination = { x: 0, y: 0 };
        this.ctrl = { x: 0, y: 0 };
    }

    init(pushing, addBlur = false) {
        this.destination = { x: Math.random() * Circle.containerW, y: Math.random() * Circle.containerH / 2 };
        this.ctrl = { x: this.destination.x, y: this.y };
        this.circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        this.circle.setAttributeNS(null, 'cx', this.x);
        this.circle.setAttributeNS(null, 'cy', this.y);
        this.circle.setAttributeNS(null, 'r', this.r);
        this.circle.setAttributeNS(null, 'fill', this.color);
        const tmpRangeStep = (Circle.rRange[1] - Circle.rRange[0]) / 10;
        if (addBlur) {
            this.circle.setAttributeNS(null, 'filter', 'url(#blur2)');
        }
        this.circle.setAttributeNS(null, 'stroke-width', 1);
        // this.circle.setAttributeNS(null, 'fill', '#666');
        this.circle.setAttributeNS(null, 'opacity', this.opacity);
        document.getElementById('circleContainer').appendChild(this.circle);
        if (pushing) {
            Circle.circles.push(this);
        }
        console.log(Circle.circles.length);
    }

    update() {
        this.opacity -= (0.5 / this.life);
        this.circle.setAttributeNS(null, 'opacity', this.opacity);

        const t = this.clock / this.life;
        const currentX = (1 - t) * (1 - t) * this.start.x + 2 * t * (1 - t) * this.ctrl.x + t * t * this.destination.x;
        const currentY = (1 - t) * (1 - t) * this.start.y + 2 * t * (1 - t) * this.ctrl.y + t * t * this.destination.y;
        this.x = currentX;
        this.y = currentY;
        this.circle.setAttributeNS(null, 'cx', this.x);
        this.circle.setAttributeNS(null, 'cy', this.y);

        this.clock++;

        if (this.clock >= this.life) {
            const circleContainer = document.getElementById('circleContainer');
            if (circleContainer.contains(this.circle)) {
                circleContainer.removeChild(this.circle);
                return true;
            }
        }
        return false;
    }

}

Circle.circles = [];
Circle.bigCircle;
Circle.BigCircleIdx = 0;
Circle.rRange = [1, 16];
Circle.containerW = 1024;
Circle.containerH = 768;