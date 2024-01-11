/**
 * Extracts a Bencoded value from the provided string.
 * @param {string} bencodedValue - The Bencoded string to extract the value from.
 * @param {function} decodeBencode - A function to decode Bencoded strings.
 * @returns {Object} - The decoded Bencoded value.
 */
const extractBencodedValue = (() => {
    /**
     * Extracts a Bencoded dictionary key and its length from the provided string.
     * @param {string} bencodedValue - The Bencoded string containing the dictionary key.
     * @returns {Object} - An object with the extracted key and its length.
     * @throws {Error} - Throws an error if the dictionary key is not a Bencoded string.
     */
    function extractKey(bencodedValue) {
        const stringLength = parseInt(bencodedValue[0]);
        if (isNaN(stringLength)) {
            throw new Error("The dictionary key must be a Bencoded string");
        }

        return { key: bencodedValue.slice(0, 2 + stringLength), length: 2 + stringLength };
    }

    /**
     * Extracts a Bencoded value of the specified type from the provided string.
     * @param {string} bencodedValue - The Bencoded string to extract the value from.
     * @param {string} itemType - The type of Bencoded value to extract ('string', 'integer', 'list', 'dictionary').
     * @param {function} decodeBencode - A function to decode Bencoded strings.
     * @returns {Object} - An object with the extracted value and its length.
     * @throws {Error} - Throws an error if the input is not a Bencoded list or if the end of the integer is not found.
     */
    function extractValue(bencodedValue, itemType, decodeBencode){
        if (itemType === 'string') {
            const stringLength = parseInt(bencodedValue[0]);
            if (isNaN(stringLength)) {
                throw new Error("The given list is not a bencoded list.");
            }
            return { value: bencodedValue.slice(0, 2 + stringLength), length: 2 + stringLength };
        } else if (itemType === 'integer') {
            const endOfInteger = bencodedValue.indexOf('e');
            if (endOfInteger === -1) {
                throw new Error("The given list is not a bencoded list.");
            }
            return { value: bencodedValue.slice(0, endOfInteger + 1), length: endOfInteger + 1 };
        } else if (itemType === 'list') {
            let bencodedList = 'l';
            let i = 1; // Start at index 1 to skip the 'l' character

            while (i < bencodedValue.length && bencodedValue[i] !== 'e') {
                let item;
                if (!isNaN(bencodedValue[i])) {
                    item = extractValue(bencodedValue.slice(i), 'string', decodeBencode);
                } else if (bencodedValue[i] === 'i') {
                    item = extractValue(bencodedValue.slice(i), 'integer', decodeBencode);
                } else if (bencodedValue[i] === 'l') {
                    item = extractValue(bencodedValue.slice(i), 'list', decodeBencode);
                } else if (bencodedValue[i] === 'd') {
                    item = extractValue(bencodedValue.slice(i), 'dictionary', decodeBencode);
                }
                bencodedList += item.value;
                i += item.length
            }
            bencodedList += 'e';

            return { value: bencodedList, length: i + 1 }; // +1 to include the 'e' character
        } else if (itemType === 'dictionary'){
            let decodedDictionary = parseDictionary(bencodedValue, decodeBencode);
            decodedDictionary.length;
            return decodedDictionary;
        }
    }

    /**
     * Parses a Bencoded dictionary from the provided string.
     * @param {string} bencodedValue - The Bencoded string to parse the dictionary from.
     * @param {function} decodeBencode - A function to decode Bencoded strings.
     * @returns {Object} - An object representing the parsed Bencoded dictionary.
     */
    function parseDictionary(bencodedValue, decodeBencode) {
        const decodedDictionary = { 'value': {}, 'length': 0};
        let i = 1; // Start at index 1 to skip the 'd' character

        while (i < bencodedValue.length - 1) { // -1 to exclude the 'e' character
            let keyItem = extractKey(bencodedValue.slice(i));
            let key = decodeBencode(keyItem.key);
            i += keyItem.length;
            let valueItem;
            let value;
            if (!isNaN(bencodedValue[i])) {
                valueItem = extractValue(bencodedValue.slice(i), 'string', decodeBencode);
                value = decodeBencode(valueItem.value);
            } else if (bencodedValue[i] === 'i') {
                valueItem = extractValue(bencodedValue.slice(i), 'integer', decodeBencode);
                value = decodeBencode(valueItem.value);
            } else if (bencodedValue[i] === 'l') {
                valueItem = extractValue(bencodedValue.slice(i), 'list', decodeBencode);
                value = decodeBencode(valueItem.value);
            } else if (bencodedValue[i] === 'd') {
                valueItem = extractValue(bencodedValue.slice(i), 'dictionary', decodeBencode);
                value = valueItem.value;
            }
            i += valueItem.length;
            decodedDictionary.value[key] = value;
            decodedDictionary.length = i;
        }

        return decodedDictionary;
    };

    /**
     * Main function to extract a Bencoded value from the provided string.
     * @param {string} bencodedValue - The Bencoded string to extract the value from.
     * @param {function} decodeBencode - A function to decode Bencoded strings.
     * @returns {Object} - The decoded Bencoded value.
     */
    return (bencodedValue, decodeBencode) => {
        return parseDictionary(bencodedValue, decodeBencode).value;
    };

})();

module.exports = extractBencodedValue;