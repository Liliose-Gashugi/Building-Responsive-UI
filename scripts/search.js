export function compileRegex(text, caseSensitive=false){
    if (!text) return null;
    try {
        return new RegExp(text, caseSensitive ? "g" : "gi");    
    }   catch (error) {
        return false;
    }
        
}

export function matchesRecord(record, regex) {
    if (regex === null) return true;
    if (regex === false) return false;
    const text = [record.title, record.tag, record.dueDate, record.notes, record.duration].join(" ");
    regex.lastIndex = 0;
    return regex.test(text);
    
}

export function escapeHtml(value) {
    return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
    
}

export function highlightText(text, pattern, caseSensitive=false) {
    const value = String(text);
    const regex = compileRegex(pattern, caseSensitive);
    if (!regex) return escapeHtml(value);
    let output = "";
    let last = 0;
    let match = regex.exec(value);
    while (match && match[0] !== "") {
        output += escapeHtml(value.slice(last, match.index)) + "<mark>" + escapeHtml(match[0]) + "<mark>";
        last = match.index + match[0].length;
        match = regex.exec(value);
        
    } 
    return output + escapeHtml(value.slice(last));
    
}
