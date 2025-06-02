const staffSource = 'https://robtisdell.github.io/robtisdell.git.io/scripts/staff.json';
const attributeName = 'IsActive';
const attributeValue = true;


async function countCurrentStaff(staffSource, attributeName, attributeValue) {
    try {
        const response = await fetch(staffSource);
        const jsonData = await response.json();

        if (!Array.isArray(jsonData)) {
            return 0;
        }

        const staffCount = jsonData.filter(obj =>
            obj.hasOwnProperty(attributeName) && obj[attributeName] === attributeValue
        );

        return staffCount.length;

    } catch (error) {
        console.error("Error:", error);
        return -1;
    }
}


