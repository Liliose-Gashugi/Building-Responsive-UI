export const patterns = {
    title: /^\S(?:.*\S)?$/,
    duration: /^(0|[1-9]\d*)(\.\d{1,2})?$/,
    date: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
    tag: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/,
    repeatedWord: /\b(\w+)\s+\1\b/i
};
export function cleanTitle(text) {
    return text.trim().replace(/\s{2,}/g, " ");
}

export function isRealDate(text) {
    if(!patterns.date.test(text)) return false;
    const [year, month, day] = text.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.getMonth() + 1 === month && date.getDate() === day;
}

export function validateRecord(record) {
    const errors = {};
    const title = String(record.title ?? "");
    const duration = String(record.duration ?? "");
    const tag = String(record.tag ?? "");

    if (!patterns.title.test(title)) {
        errors.title = "Use a title without spaces at the start or end.";
        
    }
    else if (patterns.repeatedWord.test(title)) {
        errors.title = "Remove repeated words, such as 'study study'."
        
    }
    if (!isRealDate(String(record.dueDate ?? ""))) errors.dueDate = "Enter a real date in YYYY-MM-DD format.";
    if (!patterns.duration.test(duration)) errors.duration = "Use minutes of zero or more, with up to two decimals.";
    if(!patterns.tag.test(tag)) errors.tag = "Use letters, spaces, or hyphens only.";
    return errors;
}

export function isValidRecord (record) {
    if (!record || typeof record !== "object") return false; 
    if (typeof record.id !== "string" || !record.id.startsWith("rec_")) return false;
    if (typeof record.notes !== "string") return false;
    if (typeof record.duration !== "number" || !Number.isFinite(record.duration) || record.duration < 0) return false;
    if(Number.isNaN(Date.parse(record.createdAt)) || Number.isNaN(Date.parse(record.updatedAt))) return false;
    return Object.keys(validateRecord(record)).length === 0; 
}

export function isValidRecords(list) {
    if(!Array.isArray(list)) return false;
    const ids = list.map(record => record && record.id);
    return list.every(isValidRecord) && new Set(ids).size === list.length;
}

    
