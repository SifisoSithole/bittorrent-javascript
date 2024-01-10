const extractBencodedValue = (() => {
    function extractKey(bencodedValue){
        const stringLength = parseInt(bencodedValue[0]);
        if (isNaN(stringLength)) {
            throw new Error("The dictionary key must be a Bencoded string");
        }

        return { key: bencodedValue.slice(0, 2 + stringLength), length: 2 + stringLength };
    }

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
            const parsedList = [];
            let currentIndex = 1; // Start at index 1 to skip the 'l' character

            while (currentIndex < bencodedValue.length && bencodedValue[currentIndex] !== 'e') {
                let valueItem;

                if (!isNaN(bencodedValue[currentIndex])) {
                    valueItem = extractValue(bencodedValue.slice(currentIndex), 'string', decodeBencode);
                } else if (bencodedValue[currentIndex] === 'i') {
                    valueItem = extractValue(bencodedValue.slice(currentIndex), 'integer', decodeBencode);
                } else if (bencodedValue[currentIndex] === 'l') {
                    valueItem = extractValue(bencodedValue.slice(currentIndex), 'list', decodeBencode);
                } 

                parsedList.push(valueItem.value);
                currentIndex += valueItem.length;
            }

            if (currentIndex >= bencodedValue.length || bencodedValue[currentIndex] !== 'e') {
                throw new Error("The given list is not a bencoded list."); // Missing 'e' at the end of the list
            }

            return { value: parsedList, length: currentIndex + 1 }; // +1 to include the 'e' character
        } else if (itemType === 'dictionary'){
            let decodedDictionary = parseDictionary(bencodedValue, decodeBencode);
            decodedDictionary.length;
            return decodedDictionary;
        }
    }

    function decodeList(value, decodeBencode) {
        if (Array.isArray(value)) {
            return value.map(item => decodeList(item, decodeBencode));
        } else {
            return decodeBencode(value);
        }
    }

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
                value = valueItem.value.map(value => decodeList(value, decodeBencode));;
            } else if (bencodedValue[i] === 'd') {
                valueItem = extractValue(bencodedValue.slice(i), 'dictionary', decodeBencode);
                value = valueItem.value;
            }
            i += valueItem.length;
            decodedDictionary.value[key] = value;
            decodedDictionary.length = i;
            if (bencodedValue.slice(i)[0] === 'e'){
                decodedDictionary.length += 1;
                return decodedDictionary;
            }
        }

        return decodedDictionary;
    };

    return (bencodedValue, decodeBencode) => {
        return parseDictionary(bencodedValue, decodeBencode).value;
    };

})();

module.exports = extractBencodedValue;