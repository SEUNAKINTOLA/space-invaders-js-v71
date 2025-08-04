/**
 * @fileoverview Menu State Management Module
 * Handles the game's menu state logic and transitions
 * 
 * @module states/menuState
 * @requires events
 */

// -----------------------------------------------------------------------------
// Constants and Configuration
// -----------------------------------------------------------------------------

const MENU_STATES = {
    MAIN: 'main',
    OPTIONS: 'options',
    CREDITS: 'credits',
    PAUSE: 'pause'
};

const MENU_EVENTS = {
    ENTER: 'enter',
    EXIT: 'exit',
    TRANSITION: 'transition'
};

// -----------------------------------------------------------------------------
// MenuState Class
// -----------------------------------------------------------------------------

/**
 * @class MenuState
 * @description Manages menu state and transitions in the game
 */
class MenuState {
    /**
     * @constructor
     * @param {Object} options - Configuration options for the menu state
     */
    constructor(options = {}) {
        this.currentState = MENU_STATES.MAIN;
        this.previousState = null;
        this.isActive = false;
        this.options = {
            enableTransitionEffects: true,
            transitionDuration: 300,
            ...options
        };

        // State-specific handlers
        this.stateHandlers = new Map();
        this.initializeStateHandlers();

        // Event callbacks
        this.callbacks = {
            onEnter: null,
            onExit: null,
            onTransition: null
        };
    }

    /**
     * Initialize state-specific handlers for each menu state
     * @private
     */
    initializeStateHandlers() {
        this.stateHandlers.set(MENU_STATES.MAIN, {
            enter: () => this.handleMainMenuEnter(),
            exit: () => this.handleMainMenuExit()
        });

        this.stateHandlers.set(MENU_STATES.OPTIONS, {
            enter: () => this.handleOptionsEnter(),
            exit: () => this.handleOptionsExit()
        });

        // Add other state handlers as needed
    }

    /**
     * Transitions to a new menu state
     * @param {string} newState - The state to transition to
     * @returns {Promise<boolean>} Success status of the transition
     * @throws {Error} If invalid state is provided
     */
    async transitionTo(newState) {
        try {
            if (!MENU_STATES[newState]) {
                throw new Error(`Invalid menu state: ${newState}`);
            }

            const oldState = this.currentState;
            
            // Exit current state
            await this.exitCurrentState();

            // Update state tracking
            this.previousState = this.currentState;
            this.currentState = newState;

            // Enter new state
            await this.enterNewState();

            // Trigger transition callback if defined
            if (this.callbacks.onTransition) {
                this.callbacks.onTransition(oldState, newState);
            }

            return true;
        } catch (error) {
            console.error('Error during state transition:', error);
            return false;
        }
    }

    /**
     * Registers callback functions for state changes
     * @param {string} event - Event type
     * @param {Function} callback - Callback function
     */
    on(event, callback) {
        if (!MENU_EVENTS[event]) {
            throw new Error(`Invalid event type: ${event}`);
        }
        this.callbacks[`on${event.charAt(0).toUpperCase()}${event.slice(1)}`] = callback;
    }

    /**
     * Exits the current state
     * @private
     * @returns {Promise<void>}
     */
    async exitCurrentState() {
        const handler = this.stateHandlers.get(this.currentState);
        if (handler?.exit) {
            await handler.exit();
        }
        
        if (this.callbacks.onExit) {
            this.callbacks.onExit(this.currentState);
        }
    }

    /**
     * Enters the new state
     * @private
     * @returns {Promise<void>}
     */
    async enterNewState() {
        const handler = this.stateHandlers.get(this.currentState);
        if (handler?.enter) {
            await handler.enter();
        }
        
        if (this.callbacks.onEnter) {
            this.callbacks.onEnter(this.currentState);
        }
    }

    // State-specific handlers
    handleMainMenuEnter() {
        // Implementation for main menu entry
    }

    handleMainMenuExit() {
        // Implementation for main menu exit
    }

    handleOptionsEnter() {
        // Implementation for options menu entry
    }

    handleOptionsExit() {
        // Implementation for options menu exit
    }

    /**
     * Returns the current menu state
     * @returns {string} Current state
     */
    getCurrentState() {
        return this.currentState;
    }

    /**
     * Returns the previous menu state
     * @returns {string|null} Previous state
     */
    getPreviousState() {
        return this.previousState;
    }
}

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

export {
    MenuState,
    MENU_STATES,
    MENU_EVENTS
};