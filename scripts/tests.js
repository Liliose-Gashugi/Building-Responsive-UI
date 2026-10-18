import { validateRecord, isValidRecords } from "./validators.js";
import { compileRegex, matchesRecord, highlightText } from "./search.js";

const results = [];

function test(name, check){
    let pass = false;
    try {
        pass = check() === true;
    } catch (error) {
        pass = false;
    }
    results.push({ name, pass})
}

const valid = {id: "rec_1", title: "Read notes", dueDate: "2026-10-14", duration: 30, tag: "Study Time", notes: "", createdAt: "2026-10-01T08:00:00.000Z", updatedAt: "2026-10-01T08:00:00.000Z" };
const copy = changes => ({ ...valid, ...changes});

test("Accepts a valid record", () => Object.keys(validateRecord(valid)).length === 0);
test("Rejects leading spaces in the title", () => Boolean(validateRecord(copy({ title: " Read notes"})).title));
test("Rejects repeated words using a back-reference", () => Boolean(validateRecord(copy({ title: "study study"})).title));
test("Rejects a date that does not exist", () => Boolean(validateRecord(copy({ dueDate: "2026-02-30"})).dueDate));
test("Rejects a negative duration", () => Boolean(validateRecord(copy({ duration: "-2"})).duration));
test("Rejects punctuation in the tag", () => Boolean(validateRecord(copy({ tag: "Study!"})).tag));
test("Compiles a valid regex pattern", () => compileRegex("study") instanceof RegExp);
test("Handles an invalid regex safely", () => compileRegex("[") === false);
test("Finds a time token with regex", () => matchesRecord(copy({ notes: "Library at 09:30." }), compileRegex("\\b\\d{2}:\\d{2}\\b")));
test("Highlights matches without breaking HTML", () => {
    const output = highlightText("<notes>", "notes");
    return output.includes("<mark>notes</mark>") && !output.includes("<notes>");
});
test("Rejects duplicate IDs on import", () => isValidRecords([valid, copy({ title: "Another title" })]) === false);
test("Accepts a clean list of records", () => isValidRecords([valid, copy({ id: "rec_2"} )]) === true);

document.getElementById("test-results").innerHTML = results
    .map(item => `<div class="test-result ${item.pass ? "pass" : "fail"}">${item.pass ? "PASS" : "FAIL"} — ${item.name}</div>`)
    .join("");
document.getElementById("test-summary").textContent = results.filter(item => item.pass).length + " of " + results.length + " tests passed.";

