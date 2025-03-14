"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processTransaction = processTransaction;
exports.processBlock = processBlock;
exports.processBlocks = processBlocks;
exports.generateRunestoneSummary = generateRunestoneSummary;
const runestone_decoder_1 = require("./runestone-decoder");
/**
 * Process a transaction to find and decode OP_RETURN outputs containing runestones
 * @param tx Transaction data
 * @returns Decoded runestone data if found
 */
function processTransaction(tx) {
    if (!tx || !tx.vout)
        return null;
    for (const output of tx.vout) {
        if (!output.scriptPubKey || !output.scriptPubKey.hex)
            continue;
        // Check if this is an OP_RETURN output
        if (output.scriptPubKey.type === 'nulldata' || output.scriptPubKey.hex.startsWith('6a')) {
            const decoded = (0, runestone_decoder_1.decodeOpReturn)(output.scriptPubKey.hex);
            // Create a result object with the transaction and output info
            const result = {
                txid: tx.txid,
                vout: output.n,
                hex: output.scriptPubKey.hex,
                asm: output.scriptPubKey.asm,
            };
            // Get ASCII representation of hex for better readability
            try {
                const hex = output.scriptPubKey.hex.substring(4); // Remove OP_RETURN prefix (6a + length)
                const buffer = Buffer.from(hex, 'hex');
                const ascii = buffer.toString('ascii').replace(/[^\x20-\x7E]/g, '.'); // Replace non-printable chars
                result.ascii = ascii;
            }
            catch (e) {
                result.ascii = 'Cannot decode';
            }
            // If valid protocol data was decoded, add it to the result
            if (decoded) {
                return {
                    ...result,
                    ...decoded
                };
            }
            // Even if no Diesel protocol was detected, return the OP_RETURN data
            // This ensures we capture all potential protocol messages
            return result;
        }
    }
    return null;
}
/**
 * Process a block to find all transactions with runestones
 * @param blockData The block data
 * @returns Array of decoded runestones with metadata
 */
function processBlock(blockData) {
    if (!blockData || !blockData.tx)
        return [];
    const results = [];
    for (const tx of blockData.tx) {
        const processed = processTransaction(tx);
        if (processed) {
            results.push({
                ...processed,
                blockHeight: blockData.height,
                blockHash: blockData.hash,
                blockTime: blockData.time,
                mediantime: blockData.mediantime
            });
        }
    }
    return results;
}
/**
 * Process multiple blocks to find all runestones
 * @param blocks Array of block data
 * @returns Array of decoded runestones with metadata
 */
function processBlocks(blocks) {
    const results = [];
    for (const block of blocks) {
        const blockResults = processBlock(block);
        results.push(...blockResults);
    }
    return results;
}
/**
 * Generate summary statistics for runestones in blocks
 * @param runestones Array of decoded runestones
 * @returns Summary statistics
 */
function generateRunestoneSummary(runestones) {
    if (!runestones.length) {
        return {
            count: 0,
            protocolCounts: {},
            blockHeights: []
        };
    }
    const protocolCounts = {};
    const blockHeights = new Set();
    for (const runestone of runestones) {
        blockHeights.add(runestone.blockHeight);
        const protocolName = runestone.data.protocolName || 'unknown';
        protocolCounts[protocolName] = (protocolCounts[protocolName] || 0) + 1;
    }
    return {
        count: runestones.length,
        protocolCounts,
        blockHeights: Array.from(blockHeights).sort((a, b) => b - a) // Sort descending
    };
}
//# sourceMappingURL=block-processor.js.map