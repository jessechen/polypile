const TAU = 2 * Math.PI;

let canvasWidth, canvasHeight;

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
    let x0 = -25;
    let deltaX = 0;
    let x = x0;
    let y = -25;
    let tile = null;
    while (y <= canvasHeight) {
        x = x0 + deltaX;
        while (x <= canvasWidth) {
            tile = new OctoTile(new Point(x, y));
            drawTile(tile);
            x += tile.dx;
        }
        y += tile.dy;
        deltaX += tile.xOffset;
        if (deltaX >= tile.dx) {
            deltaX -= tile.dx;
        }
    }
}

function drawTile(tile) {
    for (shape of tile.shapes) {
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

class HexTile {
    constructor(initialPoint) {
        this.shapes = [];
        this.shapes.push(new Shape(initialPoint, 6, 50));
        this.shapes.push(new Shape(this.shapes[0].points[2], 6, 50));
        this.shapes.push(new Shape(this.shapes[0].points[4], 6, 50));

        this.dx = this.shapes[1].points[1].x - this.shapes[0].points[5].x;
        this.dy = this.shapes[2].points[2].y - this.shapes[0].points[0].y;

        this.xOffset = this.shapes[2].points[2].x - this.shapes[0].points[0].x;
    }
}

class OctoTile {
    constructor(initialPoint) {
        this.shapes = [];
        this.shapes.push(new Shape(initialPoint, 8, 50));
        this.shapes.push(new Shape(this.shapes[0].points[2], 4, 50));

        this.dx = this.shapes[1].points[1].x - this.shapes[0].points[7].x;
        this.dy = this.shapes[0].points[3].y - this.shapes[0].points[0].y;

        this.xOffset = this.shapes[0].points[3].x - this.shapes[0].points[0].x;
    }
}
