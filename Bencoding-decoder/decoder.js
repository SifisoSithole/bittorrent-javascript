const stringDecoder = require('./string-decoder.js');
const integerDecoder = require('./integer-decoder.js');

/**
 * Decodes B-encoded values.
 * Supports decoding of strings, integers, lists, and dictionaries.
 */
function DecodeBencode() {
    /**
     * Decodes a B-encoded value.
     * Determines the type of the value and performs decoding accordingly.
     *
     * @param {string} bencodedValue - The B-encoded value to decode.
     * @returns {*} - The decoded value (string, number, array, or object).
     * @throws {Error} - Throws an error if the input type is not supported.
     */
    this.decode = (bencodedValue) => {
        // Check if the first character is a number (indicating a string)
        if (!isNaN(bencodedValue[0])) {
            // If it's a string, use the stringDecoder module
            return stringDecoder(bencodedValue);
        } else if (bencodedValue[0] == 'i') {
            return integerDecoder(bencodedValue);
        } else {
            // Throw an error for unsupported types (for now)
            throw new Error("Only decoding of strings, integers, lists, and dictionaries is supported.");
        }
    };
}

// Export an instance of the DecodeBencode class for external use
module.exports = new DecodeBencode();
