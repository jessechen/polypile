let size = 50;
let canvasWidth, canvasHeight;

function setup() {
    canvasWidth = windowWidth;
    canvasHeight = windowHeight;
    createCanvas(canvasWidth, canvasHeight);
    background(240);
    noLoop();
    const controls = createDiv();
    controls.addClass('controls');
    const dropdown = createSelect();
    dropdown.parent(controls);
    dropdown.addClass('pattern-selector');
    for (let [value, tileType] of tileRegistry) {
        dropdown.option(tileType.description(), value);
    }
}

function draw() {
    stroke(color(0, 15, 85));
    noFill();
    let initialPoint = new Point(-size, -size);
    let x = initialPoint.x;
    let y = initialPoint.y;
    let xOffset = 0;
    let tile;

    while (y <= canvasHeight) {
        x = initialPoint.x + xOffset;
        while (x <= canvasWidth) {
            tile = new HexTile(new Point(x, y));
            drawTile(tile);
            x += tile.tileOffset;
        }
        xOffset += tile.rowOffset.x;
        y += tile.rowOffset.y;
        while (xOffset >= tile.tileOffset) {
            xOffset -= tile.tileOffset;
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
    constructor(initialPoint, sides, initialAngle = 0) {
        this.sides = sides;
        this.initialPoint = initialPoint;
        this.leftmostPoint = initialPoint;
        this.rightmostPoint = initialPoint;
        this.points = [this.initialPoint];

        let angle = initialAngle;
        for (let i = 1; i < this.sides; i++) {
            let p = this.points[this.points.length - 1];
            let dx = Math.cos(angle) * size;
            let dy = Math.sin(angle) * size;
            let newPoint = new Point(p.x + dx, p.y + dy);
            this.points.push(newPoint);
            angle += TAU / this.sides;

            if (newPoint.x <= this.leftmostPoint.x) {
               this.leftmostPoint = newPoint;
            }
            if (newPoint.x >= this.rightmostPoint.x) {
               this.rightmostPoint = newPoint;
            }
        }

        let xs = this.points.map(p => p.x);
        this.boundingWidth = Math.max(...xs) - Math.min(...xs);
    }
}

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    minus(other) {
        return new Point(this.x - other.x, this.y - other.y);
    }
}

class OctoTile {
    static description() { return '8,4' };
    constructor(initialPoint) {
        this.shapes = [];
        this.shapes.push(new Shape(initialPoint, 8));
        this.shapes.push(new Shape(this.shapes[0].points[2], 4));

        this.tileOffset = this.shapes[0].boundingWidth + this.shapes[1].boundingWidth;
        this.rowOffset = this.shapes[1].leftmostPoint.minus(initialPoint);
    }
}

class DodecaTile {
    static description() { return '12,3,3' };
    constructor(initialPoint) {
        this.shapes = [];
        this.shapes.push(new Shape(initialPoint, 12));
        this.shapes.push(new Shape(this.shapes[0].points[2], 3));
        this.shapes.push(new Shape(this.shapes[0].points[4], 3, TAU/6));

        this.tileOffset = this.shapes[0].boundingWidth;
        this.rowOffset = this.shapes[2].leftmostPoint.minus(initialPoint);
    }
}

class DodecaHexTile {
    static description() { return '12,4,6,4,6,4' };
    constructor(initialPoint) {
        this.shapes = [];
        this.shapes.push(new Shape(initialPoint, 12));
        this.shapes.push(new Shape(this.shapes[0].points[0], 4, -TAU/4));
        this.shapes.push(new Shape(this.shapes[0].points[1], 6, -TAU/4));
        this.shapes.push(new Shape(this.shapes[0].points[2], 4, -TAU/12));
        this.shapes.push(new Shape(this.shapes[0].points[3], 6, -TAU/12));
        this.shapes.push(new Shape(this.shapes[0].points[4], 4, TAU/12));

        this.tileOffset =
            this.shapes[0].boundingWidth +
            this.shapes[1].boundingWidth +
            this.shapes[2].boundingWidth +
            this.shapes[4].boundingWidth;
        this.rowOffset = this.shapes[4].rightmostPoint.minus(initialPoint);
    }
}

class HexTile {
    static description() { return '12,4,3,4,3,4' };
    constructor(initialPoint) {
        this.shapes = [];
        this.shapes.push(new Shape(initialPoint, 6));
        this.shapes.push(new Shape(this.shapes[0].points[0], 4, -TAU/4));
        this.shapes.push(new Shape(this.shapes[0].points[1], 3, -TAU/4));
        this.shapes.push(new Shape(this.shapes[0].points[1], 4, -TAU/12));
        this.shapes.push(new Shape(this.shapes[0].points[2], 3, -TAU/12));
        this.shapes.push(new Shape(this.shapes[0].points[2], 4, TAU/12));

        this.tileOffset =
            this.shapes[0].boundingWidth +
            this.shapes[1].boundingWidth +
            this.shapes[2].boundingWidth +
            this.shapes[4].boundingWidth;
        this.rowOffset = this.shapes[4].rightmostPoint.minus(initialPoint);
    }
}

const tileRegistry = new Map([
    [1, OctoTile],
    [2, DodecaTile],
    [3, DodecaHexTile],
    [4, HexTile]
]);
