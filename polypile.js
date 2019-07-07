let size = 50;
let canvasWidth, canvasHeight;
let tileDropdown, gridCheckbox, starsCheckbox;

Array.prototype.last = function() {
    return this[this.length - 1];
};

function draw() {
}

function setup() {
    canvasWidth = windowWidth;
    canvasHeight = windowHeight;
    createCanvas(canvasWidth, canvasHeight);
    background(240);
    noLoop();

    let container = createDiv();
    container.addClass('controls-container');
    let controls = createDiv();
    controls.addClass('controls');
    controls.parent(container);

    tileDropdown = createSelect();
    tileDropdown.parent(controls);
    tileDropdown.addClass('pattern-selector');
    tileDropdown.changed(updateControls);
    for (let [value, tileType] of tileRegistry) {
        tileDropdown.option(tileType.description(), value);
    }
    tileDropdown.selected(1);

    gridCheckbox = createCheckbox('Show grid (G)', false);
    gridCheckbox.parent(controls);
    gridCheckbox.addClass('checkbox');
    gridCheckbox.changed(updateControls);

    starsCheckbox = createCheckbox('Show stars (S)', true);
    starsCheckbox.parent(controls);
    starsCheckbox.addClass('checkbox');
    starsCheckbox.changed(updateControls);

    update();
}

function keyPressed() {
    if (keyCode === 'G'.charCodeAt(0)) {
        gridCheckbox.checked(!gridCheckbox.checked());
        updateControls();
    }
    if (keyCode === 'S'.charCodeAt(0)) {
        starsCheckbox.checked(!starsCheckbox.checked());
        updateControls();
    }
}

function mouseMoved() {
    update();
}

function mouseDragged() {
    update();
}

function updateControls() {
    update();
}

function update() {
    let newTile = tileRegistry.get(tileDropdown.value());
    if (!newTile) {
        return;
    }
    drawPattern(newTile);
}

function drawPattern(tileType) {
    background(240);
    stroke(color(0, 144, 0));
    noFill();
    let initialPoint = new Point(-size, -size);
    let x = initialPoint.x;
    let y = initialPoint.y;
    let xOffset = 0;
    let tile;

    while (y <= canvasHeight) {
        x = initialPoint.x + xOffset;
        while (x <= canvasWidth) {
            tile = new tileType(new Point(x, y));
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
        if (gridCheckbox.checked()) {
            drawShape(shape);
        }
        if (starsCheckbox.checked()) {
            const angle = interpolateAngle(shape, tile.shallowAngle, tile.deepAngle);
            drawStar(shape, angle);
        }
    }
}

function drawShape(shape) {
    stroke(color(0, 144, 0));
    beginShape();
    for (p of shape.points) {
        vertex(p.x, p.y);
    }
    endShape(CLOSE);
}

function interpolateAngle(shape, shallowAngle, deepAngle) {
    const mouseLoc = new Point(mouseX, mouseY);
    const proximity = shape.centerPoint.distanceTo(mouseLoc);
    if (proximity <= 200) {
        return deepAngle;
    } else if (proximity >= 400) {
        return shallowAngle;
    } else {
        const proportion = (proximity - 200) / 200;
        return deepAngle - proportion * (deepAngle - shallowAngle);
    }
}

function drawStar(shape, angle) {
    stroke(color(0, 15, 85));
    for (let i = 0; i < shape.sides.length; i++) {
        // The assumption that adjacent sides' rays intersect only holds for
        // convex polygons. Fortunately, all regular polygons are convex.
        let currSide = shape.sides[i];
        let currMidpoint = currSide.midpoint();
        let currAngle = currSide.normalAngle() + TAU/2 - angle;
        let currRayDirection = new Point(
            currMidpoint.x + Math.cos(currAngle) * size,
            currMidpoint.y + Math.sin(currAngle) * size);
        let prevSide = i === 0 ? shape.sides.last() : shape.sides[i - 1];
        let prevMidpoint = prevSide.midpoint();
        let prevAngle = prevSide.normalAngle() + angle;
        let prevRayDirection = new Point(
            prevMidpoint.x + Math.cos(prevAngle) * size,
            prevMidpoint.y + Math.sin(prevAngle) * size);
        let intersection = intersect(
            currMidpoint, currRayDirection, prevMidpoint, prevRayDirection);
        if (intersection) {
            line(currMidpoint.x, currMidpoint.y, intersection.x, intersection.y);
            line(prevMidpoint.x, prevMidpoint.y, intersection.x, intersection.y);
        } else {
            line(currMidpoint.x, currMidpoint.y, prevMidpoint.x, prevMidpoint.y);
        }
    }
}

// Finds the intersection of two lines described by the points (p1, p2) and (p3, p4).
// Returns null if the lines are parallel.
// Algorithm from http://paulbourke.net/geometry/pointlineplane/
function intersect(p1, p2, p3, p4) {
    let denominator = ((p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y));
    if (Math.abs(denominator) <= 0.01) {
        // Lines are parallel
        return null;
    }
    let ua = ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) / denominator;
    let x = p1.x + ua * (p2.x - p1.x);
    let y = p1.y + ua * (p2.y - p1.y);

    return new Point(x, y);
}

class Shape {
    constructor(initialPoint, numSides, initialAngle = 0) {
        this.initialPoint = initialPoint;
        this.leftmostPoint = initialPoint;
        this.rightmostPoint = initialPoint;
        this.points = [this.initialPoint];
        this.sides = [];

        let angle = initialAngle;
        for (let i = 1; i < numSides; i++) {
            let p = this.points.last();
            let dx = Math.cos(angle) * size;
            let dy = Math.sin(angle) * size;
            let newPoint = new Point(p.x + dx, p.y + dy);
            this.sides.push(new Side(this.points.last(), newPoint));
            this.points.push(newPoint);
            angle += TAU / numSides;

            if (newPoint.x <= this.leftmostPoint.x) {
               this.leftmostPoint = newPoint;
            }
            if (newPoint.x >= this.rightmostPoint.x) {
               this.rightmostPoint = newPoint;
            }
        }

        this.sides.push(new Side(this.points.last(), this.points[0]));
        this.boundingWidth = this.rightmostPoint.x - this.leftmostPoint.x;
        this.centerPoint = this.calculateCenter();
    }

    calculateCenter() {
        let x = 0;
        let y = 0;

        for (let p of this.points) {
            x += p.x;
            y += p.y;
        }
        return new Point(x / this.points.length, y / this.points.length);
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

    distanceTo(other) {
        return Math.sqrt(Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2));
    }
}

class Side {
    constructor(p1, p2) {
        this.p1 = p1;
        this.p2 = p2;
    }

    midpoint() {
        return new Point((this.p1.x + this.p2.x) / 2, (this.p1.y + this.p2.y) / 2);
    }

    length() {
        return this.p2.distanceTo(p1);
    }

    // Finds the angle normal to the side, pointing into the shape.
    normalAngle() {
        let result = Math.atan((this.p2.y - this.p1.y) / (this.p2.x - this.p1.x));
        if (this.p2.x - this.p1.x < 0) {
            result += TAU / 2;
        }
        return result;
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
        this.shallowAngle = 2/16 * TAU;
        this.deepAngle = 3/16 * TAU;
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
        this.shallowAngle = 4/24 * TAU;
        this.deepAngle = 5/24 * TAU;
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
        this.shallowAngle = 4/24 * TAU;
        this.deepAngle = 5/24 * TAU;
    }
}

class HexTile {
    static description() { return '6,4,3,4,3,4' };
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
        this.shallowAngle = 4/24 * TAU;
        this.deepAngle = 5/24 * TAU;
    }
}

class DodecaTriTile {
    static description() { return '12,4,3,3,3,3' };
    constructor(initialPoint) {
        this.shapes = [];
        this.shapes.push(new Shape(initialPoint, 12, TAU/24));
        this.shapes.push(new Shape(this.shapes[0].points[3], 4, -TAU/8));
        this.shapes.push(new Shape(this.shapes[1].points[0], 3, TAU/8));
        this.shapes.push(new Shape(this.shapes[1].points[1], 3, -5*TAU/8));
        this.shapes.push(new Shape(this.shapes[1].points[2], 3, 5*TAU/8));
        this.shapes.push(new Shape(this.shapes[1].points[3], 3, -TAU/8));

        this.tileOffset =
            this.shapes[0].boundingWidth +
            this.shapes[1].boundingWidth;
        this.rowOffset = this.shapes[2].rightmostPoint.minus(initialPoint);
        this.shallowAngle = 4/24 * TAU;
        this.deepAngle = 5/24 * TAU;
    }
}

const tileRegistry = new Map([
    ['1', OctoTile],
    ['2', DodecaTile],
    ['3', DodecaHexTile],
    ['4', HexTile],
    ['5', DodecaTriTile]
]);
