const RECORDS_KEY = "campusPlan.records";
const SETTINGS_KEY = "campusPlan.settings";


export function loadRecords() {
    try {
        const saved = JSON.parse(localStorage.getItem(RECORDS_KEY));
        return Array.isArray(saved) ? saved : [];
    } catch (error) {
        return [];
    }
}

export function saveRecords(records) {
    try {
        localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
        return true; 
    } catch (error) {
        return false;
    }
    
}

export function loadSettings() {
    try {
        const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY));
        if (saved && Number.isInteger(saved.target) && saved.target >= 0) return saved;
        return { target: 600}; 
    } catch (error) {
        return { target: 600}
    }
}

 export function saveSettings(settings) {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        return true;
    } catch (error) {
        return false;
    }
    
 }