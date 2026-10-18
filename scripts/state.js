import { loadRecords, saveRecords, saveSettings, loadSettings } from "./storage.js";

export const state = {
    records: loadRecords(),
    settings: loadSettings()
};

export function saveState() {
    return saveRecords(state.records);
}
export function saveAppSettings() {
    return saveSettings(state.settings);
}

export function findRecord(id) {
    for(const record of state.records){
        if (record.id === id) return record;
    }
    return null;
}

export function makeId() {
    return "rec_" + Date.now();
}
export function timestamp() {
    return new Date().toISOString();
}