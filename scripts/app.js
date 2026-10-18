import { state, saveState, saveAppSettings, findRecord, makeId, timestamp } from "./state.js";
import { cleanTitle, validateRecord, isValidRecords } from "./validators.js";
import { compileRegex, matchesRecord } from "./search.js";
import { renderRecords, renderStats, showErrors, showMessage } from "./ui.js";

const byId = id => document.getElementById(id);
let searchText = "";
let caseSensitive = false;

function readForm() {
  return {
    title: cleanTitle(byId("title").value),
    dueDate: byId("due-date").value,
    duration: byId("duration").value,
    tag: byId("tag").value.trim(),
    notes: byId("notes").value.trim()
  };
}

function sortRecords(a, b) {
  const sort = byId("sort-by").value;
  if (sort === "date-asc") return a.dueDate.localeCompare(b.dueDate);
  if (sort === "date-desc") return b.dueDate.localeCompare(a.dueDate);
  if (sort === "title-asc") return a.title.localeCompare(b.title);
  if (sort === "title-desc") return b.title.localeCompare(a.title);
  if (sort === "duration-asc") return a.duration - b.duration;
  return b.duration - a.duration;
}

function refresh() {
  const regex = compileRegex(searchText, caseSensitive);
  const visible = [...state.records].sort(sortRecords).filter(record => matchesRecord(record, regex));
  renderRecords(visible, searchText, caseSensitive);
  renderStats(state.records, state.settings.target);
  if (regex === false) {
    showMessage("search-message", "Invalid regular expression. Check your brackets.", true);
  } else if (searchText) {
    showMessage("search-message", visible.length + " matching record(s).");
  } else {
    showMessage("search-message", "Search accepts regular expressions.");
  }
}

function resetForm() {
  byId("record-form").reset();
  byId("record-id").value = "";
  byId("form-heading").textContent = "Add a plan";
  byId("save-button").textContent = "Add to planner";
  byId("cancel-edit").classList.add("hidden");
  showErrors({});
}

function startEdit(id) {
  const record = findRecord(id);
  if (!record) return;
  byId("record-id").value = record.id;
  byId("title").value = record.title;
  byId("due-date").value = record.dueDate;
  byId("duration").value = record.duration;
  byId("tag").value = record.tag;
  byId("notes").value = record.notes;
  byId("form-heading").textContent = "Edit your plan";
  byId("save-button").textContent = "Save changes";
  byId("cancel-edit").classList.remove("hidden");
  showMessage("form-message", "Editing the selected plan.");
  byId("title").focus();
}

for (const id of ["title", "due-date", "duration", "tag"]) {
  byId(id).addEventListener("input", () => showErrors(validateRecord(readForm())));
}

byId("record-form").addEventListener("submit", event => {
  event.preventDefault();
  const values = readForm();
  const errors = validateRecord(values);
  showErrors(errors);
  if (Object.keys(errors).length > 0) {
    showMessage("form-message", "Please correct the highlighted fields.", true);
    return;
  }
  const existing = findRecord(byId("record-id").value);
  if (existing) {
    Object.assign(existing, values, { duration: Number(values.duration), updatedAt: timestamp() });
    showMessage("form-message", "Plan updated.");
  } else {
    state.records.push({ id: makeId(), ...values, duration: Number(values.duration), createdAt: timestamp(), updatedAt: timestamp() });
    showMessage("form-message", "Plan added to your planner.");
  }
  if (!saveState()) showMessage("form-message", "Saved for this session only. Browser storage is full.", true);
  resetForm();
  refresh();
});

byId("records-list").addEventListener("click", event => {
  const button = event.target.closest("button");
  if (!button) return;
  if (button.dataset.edit) startEdit(button.dataset.edit);
  if (button.dataset.delete) {
    const record = findRecord(button.dataset.delete);
    if (record && confirm('Delete "' + record.title + '"? This cannot be undone.')) {
      state.records = state.records.filter(item => item.id !== record.id);
      saveState();
      refresh();
      showMessage("form-message", "Plan deleted.");
    }
  }
});

byId("cancel-edit").addEventListener("click", resetForm);
byId("sort-by").addEventListener("change", refresh);

byId("search").addEventListener("input", event => {
  searchText = event.target.value;
  refresh();
});

byId("case-sensitive").addEventListener("change", event => {
  caseSensitive = event.target.checked;
  refresh();
});

byId("target-form").addEventListener("submit", event => {
  event.preventDefault();
  const value = Number(byId("time-target").value);
  if (!Number.isInteger(value) || value < 0) {
    showMessage("data-message", "The target must be a whole number of zero or more.", true);
    return;
  }
  state.settings.target = value;
  saveAppSettings();
  renderStats(state.records, value);
  showMessage("data-message", "Time target saved.");
});

byId("minutes-convert").addEventListener("input", event => {
  const minutes = Number(event.target.value);
  byId("conversion-result").textContent = minutes >= 0
    ? minutes + " minutes = " + (minutes / 60).toFixed(2) + " hours"
    : "Enter a number of minutes.";
});

byId("export-button").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(state.records, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "campus-plan-backup.json";
  link.click();
  URL.revokeObjectURL(link.href);
  showMessage("data-message", "JSON backup exported.");
});

byId("import-file").addEventListener("change", async event => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const imported = JSON.parse(await file.text());
    if (!isValidRecords(imported)) {
      showMessage("data-message", "That file is not valid or it has duplicate IDs.", true);
    } else if (confirm("Import " + imported.length + " records? This replaces your current plans.")) {
      state.records = imported;
      saveState();
      refresh();
      showMessage("data-message", "Records imported successfully.");
    }
  } catch (error) {
    showMessage("data-message", "Could not read this JSON file.", true);
  }
  event.target.value = "";
});

byId("reset-button").addEventListener("click", async () => {
  if (!confirm("Restore the starter records? Your current records will be replaced.")) return;
  const starter = await loadSeed();
  if (!starter.length) {
    showMessage("data-message", "Could not load seed.json. Run the project from a local server.", true);
    return;
  }
  state.records = starter;
  saveState();
  refresh();
  showMessage("data-message", "Starter records restored.");
});

async function loadSeed() {
  try {
    const response = await fetch("seed.json");
    const data = await response.json();
    return isValidRecords(data) ? data : [];
  } catch (error) {
    return [];
  }
}

async function start() {
  if (!state.records.length) {
    state.records = await loadSeed();
    saveState();
  }
  byId("time-target").value = state.settings.target;
  refresh();
}

start();
