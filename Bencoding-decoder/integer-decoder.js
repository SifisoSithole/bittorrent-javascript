/**
 * Function to decode a bencoded integer from a given string.
 *
 * @param {string} bencodedValue - The string containing the bencoded integer.
 * @returns {number} - The decoded integer value.
 * @throws {Error} - Throws an error if the input string is not a valid bencoded integer.
 */
const extractBencodedValue = () => {
    /**
     * Checks if the given string is composed of digits.
     *
     * @param {string} str - The string to check.
     * @returns {boolean} - Returns true if the string consists of digits, false otherwise.
     */
    function isStringOfDigits(str) {
        return /^-?\d+$/.test(str);
    }

    /**
     * Decodes the bencoded integer from the given string.
     *
     * @throws {Error} - Throws an error if the input string is not a valid bencoded integer.
     * @returns {number} - The decoded integer value.
     */
    return (bencodedValue) => {
        const endOfInteger = bencodedValue.indexOf('e');

        // Check if 'e' (end marker) is present in the string
        if (endOfInteger === -1) {
            throw new Error("The given string is not a bencoded integer.");
        }

        // Extract the integer part from the bencoded string
        const integerValue = bencodedValue.slice(1, endOfInteger);

        // Check if the extracted part is a valid string of digits
        if (!isStringOfDigits(integerValue)) {
            throw new Error("The given string is not a bencoded integer.");
        }

        // Parse and return the integer value
        return parseInt(integerValue);
    };
};

module.exports = extractBencodedValue();