async function getNumberOfObjectsInJsonFile(filePath) {
    try {
        const response = await fetch(filePath);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const jsonData = await response.json(); // Parses the JSON into a JS object/array

        // Check if jsonData is an array or an object
        if (Array.isArray(jsonData)) {
            // If it's an array, the number of "objects" is simply its length
            console.log(`The JSON file contains an array with ${jsonData.length} elements.`);
            return jsonData.length;
        } else if (typeof jsonData === 'object' && jsonData !== null) {
            // If it's an object, the number of "objects" could refer to its top-level keys
            // or if it's an object where each value is considered an "object"
            const numberOfKeys = Object.keys(jsonData).length;
            console.log(`The JSON file contains an object with ${numberOfKeys} top-level keys.`);
            return numberOfKeys;
        } else {
            console.log("The JSON file does not contain an array or an object at the top level.");
            return 0;
        }

    } catch (error) {
        console.error("Error reading or parsing JSON file:", error);
        return -1; // Indicate an error
    }
}