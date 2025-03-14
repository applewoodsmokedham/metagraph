"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeVarInt = decodeVarInt;
exports.readTagValues = readTagValues;
exports.skipTagValues = skipTagValues;
exports.decipherRunestone = decipherRunestone;
exports.decodeOpReturn = decodeOpReturn;
const seekbuffer_1 = require("../utils/seekbuffer");
// The protocol field tag is 0x7fff (32767 in decimal)
const PROTOCOL_TAG = BigInt(0x7fff);
const DIESEL_MINT_TAG = BigInt(0x5d);
const ALKANES_PROTOCOL_ID = BigInt(1); // Protocol ID for Alkanes
/**
 * Decode a VarInt from the buffer
 * @param seekBuffer Buffer to read from
 * @returns The decoded bigint value or null if reading failed
 */
function decodeVarInt(seekBuffer) {
    const startPos = seekBuffer.position;
    try {
        let result = BigInt(0);
        let shift = 0;
        let byte;
        do {
            // Check if we've reached the end of the buffer
            byte = seekBuffer.readByte();
            if (byte === undefined) {
                seekBuffer.position = startPos;
                return null;
            }
            result |= BigInt(byte & 0x7f) << BigInt(shift);
            shift += 7;
            // Safeguard against malicious input
            if (shift > 128) {
                seekBuffer.position = startPos;
                return null;
            }
        } while (byte & 0x80);
        return result;
    }
    catch (e) {
        seekBuffer.position = startPos;
        return null;
    }
}
/**
 * Read protocol values (u128) associated with a tag
 * @param seekBuffer Buffer to read from
 * @returns Array of decoded values as bigints
 */
function readTagValues(seekBuffer) {
    const values = [];
    while (!seekBuffer.isEOF()) {
        const peekPos = seekBuffer.position;
        // Try to read the next value
        const value = decodeVarInt(seekBuffer);
        // If we couldn't read a value, we've hit a new tag or the end
        if (value === null) {
            seekBuffer.position = peekPos;
            break;
        }
        values.push(value);
        // Check if the next byte looks like it could be a tag
        const nextByte = seekBuffer.peekByte();
        if (nextByte !== undefined && nextByte < 0x10 && values.length > 0) {
            // If the next byte is small (likely a tag) and we've read at least one value,
            // stop reading values for this tag
            break;
        }
    }
    return values;
}
/**
 * Skip past values for a tag we're not interested in
 * @param seekBuffer Buffer to read from
 */
function skipTagValues(seekBuffer) {
    readTagValues(seekBuffer); // Read and discard the values
}
/**
 * Decipher a runestone from buffer data
 * @param buffer Buffer containing the runestone data
 * @returns Parsed runestone data with focus on protocol field and protostones
 */
function decipherRunestone(buffer) {
    // Skip the "RW" marker (first 2 bytes) if present
    let data = buffer;
    let prefix = '';
    if (buffer.length >= 2 && buffer[0] === 0x52 && buffer[1] === 0x57) {
        data = buffer.slice(2);
        prefix = 'RW';
    }
    // Create a result object
    const result = {
        prefix,
        protocolField: null,
        protostones: []
    };
    try {
        // Create a seek buffer to help with parsing
        const seekBuffer = new seekbuffer_1.SeekBuffer(data);
        // Process all tags and values in the runestone
        while (!seekBuffer.isEOF()) {
            // Get the tag (as VarInt)
            const tag = decodeVarInt(seekBuffer);
            if (tag === null)
                break;
            // Convert tag to a string representation for easier comparison
            const tagHex = `0x${tag.toString(16)}`;
            // Check if this is the protocol tag (0x7fff)
            if (tag === PROTOCOL_TAG) {
                // Read all the protocol values
                const protocolValues = readTagValues(seekBuffer);
                result.protocolField = {
                    tag: tagHex,
                    values: protocolValues.map(v => v.toString())
                };
                // Special case for protocol ID 1 (Alkanes)
                if (protocolValues.includes(BigInt(1))) {
                    result.protocolName = 'Alkanes';
                }
            }
            // Check if this is a Diesel mint tag (0x5d)
            else if (tag === DIESEL_MINT_TAG) {
                // Read all the values for this tag
                const values = readTagValues(seekBuffer);
                // Add the protostone data
                if (values.length > 0) {
                    result.protostones.push({
                        tag: tagHex,
                        values: values.map(v => v.toString())
                    });
                }
                // Set the protocol name to Diesel since we found a Diesel mint tag
                result.protocolName = 'Diesel';
            }
            else {
                // This is a protostone field
                // Read all the values for this tag
                const values = readTagValues(seekBuffer);
                if (values.length > 0) {
                    result.protostones.push({
                        tag: tagHex,
                        values: values.map(v => v.toString())
                    });
                }
            }
        }
        return result;
    }
    catch (error) {
        console.error('Error deciphering runestone:', error);
        return {
            error: 'Failed to decipher runestone',
            hex: buffer.toString('hex')
        };
    }
}
/**
 * Decode OP_RETURN data to extract runestone information
 * @param opReturnHex Hex string from OP_RETURN output
 * @returns Decoded runestone data if detected, otherwise null
 */
function decodeOpReturn(opReturnHex) {
    if (!opReturnHex || typeof opReturnHex !== 'string') {
        return null;
    }
    try {
        // Remove OP_RETURN prefix if present (0x6a in hex)
        let hex = opReturnHex;
        if (hex.startsWith('6a')) {
            // Skip the OP_RETURN opcode (0x6a)
            hex = hex.slice(2);
            // Now we need to parse Bitcoin script opcodes to get the actual data
            let currentPos = 0;
            // Collect all data pushed to the stack
            const pushedData = [];
            while (currentPos < hex.length) {
                const opcode = parseInt(hex.slice(currentPos, currentPos + 2), 16);
                currentPos += 2;
                // Handle different push opcodes
                if (opcode >= 0x01 && opcode <= 0x4b) {
                    // Direct push of N bytes (where N is the opcode value)
                    const dataLen = opcode;
                    const data = hex.slice(currentPos, currentPos + dataLen * 2);
                    pushedData.push(Buffer.from(data, 'hex'));
                    currentPos += dataLen * 2;
                }
                // OP_PUSHDATA1
                else if (opcode === 0x4c) {
                    const dataLen = parseInt(hex.slice(currentPos, currentPos + 2), 16);
                    currentPos += 2;
                    const data = hex.slice(currentPos, currentPos + dataLen * 2);
                    pushedData.push(Buffer.from(data, 'hex'));
                    currentPos += dataLen * 2;
                }
                // OP_PUSHDATA2
                else if (opcode === 0x4d) {
                    const dataLen = parseInt(hex.slice(currentPos, currentPos + 4), 16);
                    currentPos += 4;
                    const data = hex.slice(currentPos, currentPos + dataLen * 2);
                    pushedData.push(Buffer.from(data, 'hex'));
                    currentPos += dataLen * 2;
                }
                // OP_PUSHNUM opcodes (0x51 to 0x60 for numbers 1-16)
                else if (opcode >= 0x51 && opcode <= 0x60) {
                    // These just push small integers 1-16, not relevant for our data
                    pushedData.push(Buffer.from([opcode - 0x50]));
                }
                // Skip other opcodes that don't push data
                else {
                    // Could be a specific opcode like OP_PUSHNUM_13 (0x5d)
                    if (opcode >= 0x5a && opcode <= 0x60) { // OP_PUSHNUM_10 through OP_PUSHNUM_16
                        // These push numbers 10-16 to the stack
                        continue;
                    }
                }
            }
            // Now try to decode each pushed data item
            for (const data of pushedData) {
                if (data.length < 2)
                    continue;
                // Check for Alkanes protocol marker
                // Look for protocol tag 0x7fff in little-endian format (ff 7f)
                if (data.length >= 2 && data[0] === 0xff && data[1] === 0x7f) {
                    // This is likely an Alkanes protocol message
                    // Create a seekBuffer starting after the protocol tag
                    const seekBuffer = new seekbuffer_1.SeekBuffer(data.slice(2));
                    // Read the protocol values
                    const protocolValues = readTagValues(seekBuffer);
                    // For the specific Alkanes pattern, any message with the protocol tag 0x7fff
                    // and with a format like the example transaction should be interpreted as Alkanes
                    // The protocol ID might be encoded in the values or in the tag format
                    return {
                        type: 'protostone',
                        data: {
                            prefix: '',
                            protocolField: {
                                tag: '0x7fff',
                                values: protocolValues.map(v => v.toString())
                            },
                            protocolName: 'Alkanes', // Assume any 0x7fff protocol tag in OP_RETURN is an Alkanes transaction
                            protostones: []
                        }
                    };
                }
                // Fallback: try to decode as a regular runestone/protostone
                try {
                    const result = decipherRunestone(data);
                    // If it has a protocol field or protostones, consider it valid
                    if (result.protocolField || result.protostones.length > 0) {
                        return {
                            type: 'protostone',
                            data: result
                        };
                    }
                }
                catch (e) {
                    // Not a valid protostone, continue to next data item
                }
            }
            // If we got here, try to use the last piece of pushed data for a simple ASCII representation
            if (pushedData.length > 0) {
                const lastData = pushedData[pushedData.length - 1];
                return {
                    type: 'op_return',
                    data: {
                        hex: lastData.toString('hex'),
                        ascii: lastData.toString('ascii').replace(/[^\x20-\x7E]/g, '.') // Show only printable ASCII
                    }
                };
            }
        }
        // Fallback to the original approach for other formats
        const buffer = Buffer.from(hex, 'hex');
        // Check for Runestone (starts with "RW" which is 0x5257 in hex)
        if (buffer.length >= 2 && buffer[0] === 0x52 && buffer[1] === 0x57) {
            return {
                type: 'runestone',
                data: decipherRunestone(buffer)
            };
        }
        // Try to decode as protostone even without RW prefix
        if (buffer.length > 4) {
            try {
                const result = decipherRunestone(buffer);
                // If it has a protocol field or protostones, consider it valid
                if (result.protocolField || result.protostones.length > 0) {
                    return {
                        type: 'protostone',
                        data: result
                    };
                }
            }
            catch (e) {
                // Not a valid protostone, continue
            }
        }
    }
    catch (error) {
        console.error('Error parsing OP_RETURN data:', error);
    }
    // Last resort: Just return the hex data for any OP_RETURN
    const buffer = Buffer.from(opReturnHex, 'hex');
    return {
        type: 'op_return',
        data: {
            hex: buffer.toString('hex'),
            ascii: buffer.toString('ascii').replace(/[^\x20-\x7E]/g, '.') // Show only printable ASCII
        }
    };
}
//# sourceMappingURL=runestone-decoder.js.map