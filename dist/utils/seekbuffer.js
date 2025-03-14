"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeekBuffer = void 0;
/**
 * Custom class to help with parsing binary data
 * Provides a cursor-like interface for reading through a buffer
 */
class SeekBuffer {
    constructor(buffer) {
        this.buffer = new Uint8Array(buffer);
        this.position = 0;
    }
    /**
     * Read a single byte from the current position
     * @returns The byte at the current position, or undefined if at end of buffer
     */
    readByte() {
        if (this.position >= this.buffer.length) {
            return undefined;
        }
        return this.buffer[this.position++];
    }
    /**
     * Peek at the next byte without advancing the position
     * @returns The next byte, or undefined if at end of buffer
     */
    peekByte() {
        if (this.position >= this.buffer.length) {
            return undefined;
        }
        return this.buffer[this.position];
    }
    /**
     * Check if we've reached the end of the buffer
     */
    isEOF() {
        return this.position >= this.buffer.length;
    }
    /**
     * Reset the position to the start of the buffer
     */
    reset() {
        this.position = 0;
    }
}
exports.SeekBuffer = SeekBuffer;
//# sourceMappingURL=seekbuffer.js.map