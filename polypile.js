const TAU = 2 * Math.PI;

let size = 50;
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
    constructor(initialPoint, sides, initialAngle=0) {
        this.sides = sides;
        this.points = [initialPoint];

        let angle = initialAngle;
        for (let i = 0; i < this.sides; i++) {
            let p = this.points[this.points.length - 1];
            let dx = Math.cos(angle) * size;
            let dy = Math.sin(angle) * size;
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
        this.shapes.push(new Shape(initialPoint, 6));
        this.shapes.push(new Shape(this.shapes[0].points[2], 6));
        this.shapes.push(new Shape(this.shapes[0].points[4], 6));

        this.dx = this.shapes[1].points[1].x - this.shapes[0].points[5].x;
        this.dy = this.shapes[2].points[2].y - this.shapes[0].points[0].y;

        this.xOffset = this.shapes[2].points[2].x - this.shapes[0].points[0].x;
    }
}

class OctoTile {
    constructor(initialPoint) {
        this.shapes = [];
        this.shapes.push(new Shape(initialPoint, 8));
        this.shapes.push(new Shape(this.shapes[0].points[2], 4));

        this.dx = this.shapes[1].points[1].x - this.shapes[0].points[7].x;
        this.dy = this.shapes[0].points[3].y - this.shapes[0].points[0].y;

        this.xOffset = this.shapes[0].points[3].x - this.shapes[0].points[0].x;
    }
}

class DodecaTile {
    constructor(initialPoint) {
        this.shapes = [];
        this.shapes.push(new Shape(initialPoint, 12));
        this.shapes.push(new Shape(this.shapes[0].points[2], 3));
        this.shapes.push(new Shape(this.shapes[0].points[2], 3));

        this.dx = this.shapes[1].points[1].x - this.shapes[0].points[7].x;
        this.dy = this.shapes[0].points[3].y - this.shapes[0].points[0].y;

        this.xOffset = this.shapes[0].points[3].x - this.shapes[0].points[0].x;
    }
}
