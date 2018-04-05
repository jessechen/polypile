const TAU = 2 * Math.PI;

let canvasWidth, canvasHeight;
let shapes = [];

function setup() {
    canvasWidth = windowWidth;
    canvasHeight = windowHeight;
    createCanvas(canvasWidth, canvasHeight);
    background(240);
    noLoop();
}

function draw() {
    stroke(color(0,15,85));
    noFill();
    for (shape of shapes) {
        beginShape();
        for (p of shape.points) {
            vertex(p.x, p.y);
        }
        endShape(CLOSE);
    }
}

class Shape {
    constructor(x0, y0, sides, sideLength) {
        this.x0 = x0;
        this.y0 = y0;
        this.sides = sides;
        this.sideLength = sideLength;
        this.points = [new Point(this.x0, this.y0)];

        let angle = 0;
        for (let i = 0; i < this.sides; i++) {
            angle += TAU / this.sides;
            let p = this.points[this.points.length - 1];
            let dx = Math.cos(angle) * this.sideLength;
            let dy = Math.sin(angle) * this.sideLength;
            this.points.push(new Point(p.x + dx, p.y + dy));
        }
    }
}

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

shapes = [
    new Shape(100, 100, 6, 50)
];
