/**
 * Extracts and decodes a Bencoded list.
 * @param {string} bencodedValue - The Bencoded string to decode.
 * @param {function} decodeBencode - The function to decode Bencoded values.
 * @returns {Array} - The decoded list.
 */
const extractBencodedValue = (() => {
    /**
     * Retrieves a Bencoded item from the remaining list based on the item type.
     * @param {string} remainingList - The remaining Bencoded list.
     * @param {string} itemType - The type of the Bencoded item ('string', 'integer', 'list').
     * @returns {Object|string} - An object containing the Bencoded item and its length, or 'Invalid' if invalid.
     */
    function getListItem(remainingList, itemType) {
        if (itemType === 'string') {
            const stringLength = parseInt(remainingList[0]);
            if (isNaN(stringLength)) {
                throw new Error("The given list is not a bencoded list.");
            }
            return { item: remainingList.slice(0, 2 + stringLength), length: 2 + stringLength };
        } else if (itemType === 'integer') {
            const endOfInteger = remainingList.indexOf('e');
            if (endOfInteger === -1) {
                throw new Error("The given list is not a bencoded list.");
            }
            return { item: remainingList.slice(0, endOfInteger + 1), length: endOfInteger + 1 };
        } else if (itemType === 'list') {
            const parsedList = [];
            let currentIndex = 1; // Start at index 1 to skip the 'l' character

            while (currentIndex < remainingList.length && remainingList[currentIndex] !== 'e') {
                let listItem;

                if (!isNaN(remainingList[currentIndex])) {
                    listItem = getListItem(remainingList.slice(currentIndex), 'string');
                } else if (remainingList[currentIndex] === 'i') {
                    listItem = getListItem(remainingList.slice(currentIndex), 'integer');
                } else if (remainingList[currentIndex] === 'l') {
                    listItem = getListItem(remainingList.slice(currentIndex), 'list');
                }

                parsedList.push(listItem.item);
                currentIndex += listItem.length;
            }

            if (currentIndex >= remainingList.length || remainingList[currentIndex] !== 'e') {
                throw new Error("The given list is not a bencoded list."); // Missing 'e' at the end of the list
            }

            return { item: parsedList, length: currentIndex + 1 }; // +1 to include the 'e' character
        }
    }

    /**
     * Parses Bencoded lists and returns an array of decoded items.
     * @param {string} bencodedValue - The Bencoded string to parse.
     * @returns {Array|string} - An array of decoded items or 'Invalid' if invalid.
     */
    function parseLists(bencodedValue) {
        const parsedList = [];
        let i = 0;

        while (i < bencodedValue.length) {
            let listItem;

            if (!isNaN(bencodedValue[i])) {
                listItem = getListItem(bencodedValue.slice(i), 'string');
            } else if (bencodedValue[i] === 'i') {
                listItem = getListItem(bencodedValue.slice(i), 'integer');
            } else if (bencodedValue[i] === 'l') {
                listItem = getListItem(bencodedValue.slice(i), 'list');
            }

            if (listItem === 'Invalid') {
                return 'Invalid';
            }

            parsedList.push(listItem.item);
            i += listItem.length;
        }

        return parsedList;
    }

    /**
     * Decodes a Bencoded list recursively, applying the provided decodeBencode function.
     * @param {*} value - The value to decode.
     * @param {function} decodeBencode - The function to decode Bencoded values.
     * @returns {*} - The decoded value.
     */
    function decodeList(value, decodeBencode) {
        if (Array.isArray(value)) {
            return value.map(item => decodeList(item, decodeBencode));
        } else {
            return decodeBencode(value);
        }
    }

    /**
     * Main function for decoding a Bencoded list.
     * @param {string} bencodedValue - The Bencoded string to decode.
     * @param {function} decodeBencode - The function to decode Bencoded values.
     * @returns {Array} - The decoded list.
     */
    return (bencodedValue, decodeBencode) => {
        const listItems = parseLists(bencodedValue.slice(1, -1));
        return listItems.map(value => decodeList(value, decodeBencode));
    };

})();

module.exports = extractBencodedValue;
