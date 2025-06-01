async function countCurrentStaff('https://robtisdell.github.io/robtisdell.git.io/scripts/staff.json', IsActive, true) {
    try {
        const response = await fetch('https://robtisdell.github.io/robtisdell.git.io/scripts/staff.json');
        const jsonData = await response.json();

        if (!Array.isArray(jsonData)) {
            return 0;
        }

        const staffCount = jsonData.filter(obj =>
            obj.hasOwnProperty(IsActive) && obj[IsActive] === true
        );

        return countStaff.length;

    } catch (error) {
        console.error("Error:", error);
        return -1;
    }
}


