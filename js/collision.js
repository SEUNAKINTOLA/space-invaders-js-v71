/**
 * @fileoverview Collision detection system for game entities
 * Handles collision detection between projectiles, enemies, and player
 * using Axis-Aligned Bounding Box (AABB) collision detection.
 * 
 * @module collision
 */

/**
 * @typedef {Object} BoundingBox
 * @property {number} x - X coordinate
 * @property {number} y - Y coordinate
 * @property {number} width - Width of the bounding box
 * @property {number} height - Height of the bounding box
 */

/**
 * @typedef {Object} GameObject
 * @property {number} x - X coordinate
 * @property {number} y - Y coordinate
 * @property {number} width - Width of the object
 * @property {number} height - Height of the object
 */

/**
 * Checks for collision between two objects using AABB collision detection
 * @param {GameObject} obj1 - First game object
 * @param {GameObject} obj2 - Second game object
 * @returns {boolean} True if objects are colliding, false otherwise
 * @throws {TypeError} If invalid parameters are provided
 */
export function checkCollision(obj1, obj2) {
    try {
        validateGameObject(obj1);
        validateGameObject(obj2);

        return (obj1.x < obj2.x + obj2.width &&
                obj1.x + obj1.width > obj2.x &&
                obj1.y < obj2.y + obj2.height &&
                obj1.y + obj1.height > obj2.y);
    } catch (error) {
        console.error('Collision detection error:', error);
        throw error;
    }
}

/**
 * Checks if a point is inside a rectangle
 * @param {number} x - Point X coordinate
 * @param {number} y - Point Y coordinate
 * @param {BoundingBox} rect - Rectangle to check against
 * @returns {boolean} True if point is inside rectangle, false otherwise
 * @throws {TypeError} If invalid parameters are provided
 */
export function pointInRect(x, y, rect) {
    try {
        validatePoint(x, y);
        validateBoundingBox(rect);

        return (x >= rect.x &&
                x <= rect.x + rect.width &&
                y >= rect.y &&
                y <= rect.y + rect.height);
    } catch (error) {
        console.error('Point in rect detection error:', error);
        throw error;
    }
}

/**
 * Checks for collisions between multiple objects
 * @param {GameObject[]} objects - Array of game objects to check
 * @returns {Array<[GameObject, GameObject]>} Array of colliding object pairs
 * @throws {TypeError} If invalid parameters are provided
 */
export function detectCollisions(objects) {
    try {
        if (!Array.isArray(objects)) {
            throw new TypeError('Objects parameter must be an array');
        }

        const collisions = [];
        
        // Check each object against every other object
        for (let i = 0; i < objects.length; i++) {
            for (let j = i + 1; j < objects.length; j++) {
                if (checkCollision(objects[i], objects[j])) {
                    collisions.push([objects[i], objects[j]]);
                }
            }
        }

        return collisions;
    } catch (error) {
        console.error('Multiple collision detection error:', error);
        throw error;
    }
}

/**
 * Validates game object parameters
 * @private
 * @param {GameObject} obj - Game object to validate
 * @throws {TypeError} If object is invalid
 */
function validateGameObject(obj) {
    if (!obj || typeof obj !== 'object') {
        throw new TypeError('Invalid game object');
    }

    if (typeof obj.x !== 'number' || typeof obj.y !== 'number' ||
        typeof obj.width !== 'number' || typeof obj.height !== 'number') {
        throw new TypeError('Game object must have numeric x, y, width, and height properties');
    }

    if (obj.width < 0 || obj.height < 0) {
        throw new TypeError('Game object dimensions cannot be negative');
    }
}

/**
 * Validates point coordinates
 * @private
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @throws {TypeError} If coordinates are invalid
 */
function validatePoint(x, y) {
    if (typeof x !== 'number' || typeof y !== 'number') {
        throw new TypeError('Coordinates must be numbers');
    }
}

/**
 * Validates bounding box parameters
 * @private
 * @param {BoundingBox} rect - Bounding box to validate
 * @throws {TypeError} If bounding box is invalid
 */
function validateBoundingBox(rect) {
    if (!rect || typeof rect !== 'object') {
        throw new TypeError('Invalid bounding box');
    }

    if (typeof rect.x !== 'number' || typeof rect.y !== 'number' ||
        typeof rect.width !== 'number' || typeof rect.height !== 'number') {
        throw new TypeError('Bounding box must have numeric x, y, width, and height properties');
    }

    if (rect.width < 0 || rect.height < 0) {
        throw new TypeError('Bounding box dimensions cannot be negative');
    }
}