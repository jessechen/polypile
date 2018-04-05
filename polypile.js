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
    noStroke();
    for (shape of shapes) {
        fill(color(0,128,0));
        beginShape();
        for (p of shape.points) {
            vertex(p.x, p.y);
        }
        endShape(CLOSE);
    }
}

class Shape {
    constructor(sides, sideLength) {
        this.sides = sides;
        this.sideLength = sideLength;
        this.points = [
            new Point(10, 10),
            new Point(10, 20),
            new Point(20, 20),
            new Point(20, 10)
        ];
    }
}

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

shapes = [
    new Shape(8, 10)
];
