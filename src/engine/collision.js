/**
 * @fileoverview Collision detection system for basic geometric shapes.
 * Supports point, circle, and rectangle collision detection.
 * 
 * @module engine/collision
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

/**
 * Checks if a point is inside a circle
 * @param {Point} point - The point to check
 * @param {Circle} circle - The circle to check against
 * @returns {boolean} True if collision detected
 * @throws {TypeError} If invalid parameters are provided
 */
export function pointCircleCollision(point, circle) {
    if (!point?.x || !point?.y || !circle?.x || !circle?.y || !circle?.radius) {
        throw new TypeError('Invalid parameters for point-circle collision check');
    }

    const dx = point.x - circle.x;
    const dy = point.y - circle.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    return distance <= circle.radius;
}

/**
 * Checks if a point is inside a rectangle
 * @param {Point} point - The point to check
 * @param {Rectangle} rect - The rectangle to check against
 * @returns {boolean} True if collision detected
 * @throws {TypeError} If invalid parameters are provided
 */
export function pointRectCollision(point, rect) {
    if (!point?.x || !point?.y || !rect?.x || !rect?.y || !rect?.width || !rect?.height) {
        throw new TypeError('Invalid parameters for point-rectangle collision check');
    }

    return point.x >= rect.x &&
           point.x <= rect.x + rect.width &&
           point.y >= rect.y &&
           point.y <= rect.y + rect.height;
}

/**
 * Checks if two circles are colliding
 * @param {Circle} circle1 - First circle
 * @param {Circle} circle2 - Second circle
 * @returns {boolean} True if collision detected
 * @throws {TypeError} If invalid parameters are provided
 */
export function circleCircleCollision(circle1, circle2) {
    if (!circle1?.x || !circle1?.y || !circle1?.radius ||
        !circle2?.x || !circle2?.y || !circle2?.radius) {
        throw new TypeError('Invalid parameters for circle-circle collision check');
    }

    const dx = circle1.x - circle2.x;
    const dy = circle1.y - circle2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    return distance <= (circle1.radius + circle2.radius);
}

/**
 * Checks if two rectangles are colliding
 * @param {Rectangle} rect1 - First rectangle
 * @param {Rectangle} rect2 - Second rectangle
 * @returns {boolean} True if collision detected
 * @throws {TypeError} If invalid parameters are provided
 */
export function rectRectCollision(rect1, rect2) {
    if (!rect1?.x || !rect1?.y || !rect1?.width || !rect1?.height ||
        !rect2?.x || !rect2?.y || !rect2?.width || !rect2?.height) {
        throw new TypeError('Invalid parameters for rectangle-rectangle collision check');
    }

    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

/**
 * Checks if a circle and rectangle are colliding
 * @param {Circle} circle - The circle
 * @param {Rectangle} rect - The rectangle
 * @returns {boolean} True if collision detected
 * @throws {TypeError} If invalid parameters are provided
 */
export function circleRectCollision(circle, rect) {
    if (!circle?.x || !circle?.y || !circle?.radius ||
        !rect?.x || !rect?.y || !rect?.width || !rect?.height) {
        throw new TypeError('Invalid parameters for circle-rectangle collision check');
    }

    // Find closest point on rectangle to circle center
    const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
    const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));

    // Calculate distance between closest point and circle center
    const dx = closestX - circle.x;
    const dy = closestY - circle.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    return distance <= circle.radius;
}

/**
 * Utility function to create a bounding circle for a rectangle
 * @param {Rectangle} rect - The rectangle
 * @returns {Circle} The bounding circle
 * @throws {TypeError} If invalid rectangle is provided
 */
export function createBoundingCircle(rect) {
    if (!rect?.x || !rect?.y || !rect?.width || !rect?.height) {
        throw new TypeError('Invalid rectangle parameters for creating bounding circle');
    }

    return {
        x: rect.x + rect.width / 2,
        y: rect.y + rect.height / 2,
        radius: Math.sqrt((rect.width * rect.width + rect.height * rect.height)) / 2
    };
}