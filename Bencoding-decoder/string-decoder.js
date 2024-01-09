/**
 * Extracts the value part of a B-encoded string.
 * B-encoded strings have the format "length:value", where length is the length
 * of the value in bytes.
 *
 * @param {string} bencodedValue - The B-encoded string to extract the value from.
 * @returns {string} - The extracted value.
 * @throws {Error} - Throws an error if the input is not a valid B-encoded string.
 */
const extractBencodedValue = (bencodedValue) => {
    // Find the index of the first colon in the B-encoded string
    const firstColonIndex = bencodedValue.indexOf(":");
    
    // Check if a colon was found
    if (firstColonIndex === -1) {
        throw new Error("Invalid encoded string value. Missing colon.");
    }

    // Extract the value part of the B-encoded string
    const extractedValue = bencodedValue.substr(firstColonIndex + 1);

    return extractedValue;
};

// Export the function for external use
module.exports = extractBencodedValue;
