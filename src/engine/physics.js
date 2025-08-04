/**
 * @fileoverview Physics engine module providing basic collision detection between shapes.
 * Supports point, circle, and rectangle collision detection with efficient algorithms.
 * 
 * @module engine/physics
 * @version 1.0.0
 */

/**
 * @typedef {Object} Point
 * @property {number} x - X coordinate
 * @property {number} y - Y coordinate
 */

/**
 * @typedef {Object} Circle
 * @property {number} x - Center X coordinate
 * @property {number} y - Center Y coordinate
 * @property {number} radius - Circle radius
 */

/**
 * @typedef {Object} Rectangle
 * @property {number} x - Top-left X coordinate
 * @property {number} y - Top-left Y coordinate
 * @property {number} width - Rectangle width
 * @property {number} height - Rectangle height
 */

// Small value for floating point comparisons
const EPSILON = 0.000001;

/**
 * Checks if two points are colliding (essentially the same position)
 * @param {Point} point1 - First point
 * @param {Point} point2 - Second point
 * @returns {boolean} True if points are colliding
 * @throws {TypeError} If invalid parameters are provided
 */
export function pointToPointCollision(point1, point2) {
    if (!isValidPoint(point1) || !isValidPoint(point2)) {
        throw new TypeError('Invalid point parameters');
    }

    return Math.abs(point1.x - point2.x) < EPSILON && 
           Math.abs(point1.y - point2.y) < EPSILON;
}

/**
 * Checks if a point is inside a circle
 * @param {Point} point - Point to check
 * @param {Circle} circle - Circle to check against
 * @returns {boolean} True if point is inside circle
 * @throws {TypeError} If invalid parameters are provided
 */
export function pointToCircleCollision(point, circle) {
    if (!isValidPoint(point) || !isValidCircle(circle)) {
        throw new TypeError('Invalid parameters for point-circle collision');
    }

    const distanceSquared = Math.pow(point.x - circle.x, 2) + 
                           Math.pow(point.y - circle.y, 2);
    return distanceSquared <= Math.pow(circle.radius, 2);
}

/**
 * Checks if a point is inside a rectangle
 * @param {Point} point - Point to check
 * @param {Rectangle} rectangle - Rectangle to check against
 * @returns {boolean} True if point is inside rectangle
 * @throws {TypeError} If invalid parameters are provided
 */
export function pointToRectCollision(point, rectangle) {
    if (!isValidPoint(point) || !isValidRectangle(rectangle)) {
        throw new TypeError('Invalid parameters for point-rectangle collision');
    }

    return point.x >= rectangle.x && 
           point.x <= rectangle.x + rectangle.width &&
           point.y >= rectangle.y && 
           point.y <= rectangle.y + rectangle.height;
}

/**
 * Checks if two circles are colliding
 * @param {Circle} circle1 - First circle
 * @param {Circle} circle2 - Second circle
 * @returns {boolean} True if circles are colliding
 * @throws {TypeError} If invalid parameters are provided
 */
export function circleToCircleCollision(circle1, circle2) {
    if (!isValidCircle(circle1) || !isValidCircle(circle2)) {
        throw new TypeError('Invalid parameters for circle-circle collision');
    }

    const distanceSquared = Math.pow(circle1.x - circle2.x, 2) + 
                           Math.pow(circle1.y - circle2.y, 2);
    const radiusSum = circle1.radius + circle2.radius;
    return distanceSquared <= Math.pow(radiusSum, 2);
}

/**
 * Checks if two rectangles are colliding
 * @param {Rectangle} rect1 - First rectangle
 * @param {Rectangle} rect2 - Second rectangle
 * @returns {boolean} True if rectangles are colliding
 * @throws {TypeError} If invalid parameters are provided
 */
export function rectToRectCollision(rect1, rect2) {
    if (!isValidRectangle(rect1) || !isValidRectangle(rect2)) {
        throw new TypeError('Invalid parameters for rectangle-rectangle collision');
    }

    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Validation helper functions
function isValidPoint(point) {
    return point && 
           typeof point.x === 'number' && 
           typeof point.y === 'number' &&
           !isNaN(point.x) && 
           !isNaN(point.y);
}

function isValidCircle(circle) {
    return circle && 
           typeof circle.x === 'number' && 
           typeof circle.y === 'number' &&
           typeof circle.radius === 'number' &&
           !isNaN(circle.x) && 
           !isNaN(circle.y) &&
           !isNaN(circle.radius) &&
           circle.radius > 0;
}

function isValidRectangle(rect) {
    return rect && 
           typeof rect.x === 'number' && 
           typeof rect.y === 'number' &&
           typeof rect.width === 'number' &&
           typeof rect.height === 'number' &&
           !isNaN(rect.x) && 
           !isNaN(rect.y) &&
           !isNaN(rect.width) &&
           !isNaN(rect.height) &&
           rect.width > 0 &&
           rect.height > 0;
}