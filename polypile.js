const TAU = 2 * Math.PI;

let canvasWidth, canvasHeight;
let tile = [];

function setup() {
    canvasWidth = windowWidth;
    canvasHeight = windowHeight;
    createCanvas(canvasWidth, canvasHeight);
    background(240);
    noLoop();
}

function draw() {
    stroke(color(0, 15, 85));
    noFill();
    for (shape of tile) {
        beginShape();
        for (p of shape.points) {
            vertex(p.x, p.y);
        }
        endShape(CLOSE);
    }
}

class Shape {
    constructor(initialPoint, sides, sideLength) {
        this.sides = sides;
        this.sideLength = sideLength;
        this.points = [initialPoint];

        let angle = 0;
        for (let i = 0; i < this.sides; i++) {
            let p = this.points[this.points.length - 1];
            let dx = Math.cos(angle) * this.sideLength;
            let dy = Math.sin(angle) * this.sideLength;
            this.points.push(new Point(p.x + dx, p.y + dy));
            angle += TAU / this.sides;
        }
    }
}

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

tile = [];
tile.push(new Shape(new Point(25, 25), 6, 50));
tile.push(new Shape(tile[0].points[2], 6, 50));
tile.push(new Shape(tile[0].points[4], 6, 50));
