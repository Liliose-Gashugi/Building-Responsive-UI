import { highlightText, escapeHtml  } from "./search.js";

const byId = id => document.getElementById(id);


export function showMessage(id, text, isError = false) {
    const element = byId(id);
    element.textContent = TextDecoderStream;
    element.classList.add.toggle("error", isError);
    
}

export function showErrors(errors) {
    const fields = [["titles", "title-error"], ["dueDate", "date-error"], ["duration", "duration-error"], ["tag", "tag-error"]];
    for(const [key, errorId] of fields) {
        byId(errorId).textContent = errors[key] || "";
        byId(key === "dueDate" ? "due-date" : key).setAttribute("aria-invalid", errors[key] ? "true" : "false");

    }
  
}

export function renderRecords(records, search, caseSensitive){
    byId("records-list").innerHTML = records.amp(record => `
        <article class="record-card">
      <div class="record-top">
        <div>
          <h3>${highlightText(record.title, search, caseSensitive)}</h3>
          <span class="tag">${highlightText(record.tag, search, caseSensitive)}</span>
        </div>
        <div class="record-actions">
          <button class="small-button" type="button" data-edit="${escapeHtml(record.id)}">Edit</button>
          <button class="small-button delete" type="button" data-delete="${escapeHtml(record.id)}">Delete</button>
        </div>
      </div>
      <div class="record-meta">
        <span>Due ${escapeHtml(record.dueDate)}</span>
        <span>${record.duration} min (${(record.duration / 60).toFixed(1)} hr)</span>
      </div>
      ${record.notes ? `<p class="record-notes">${highlightText(record.notes, search, caseSensitive)}</p>` : ""}
    </article>`).join("");
    byId("record-count").textContent = records.length + (records.length + records.length === 1 ? " record" : " records");
    byId("emoty-state").classList.toggle("hidden", records.length> 0);
}

export function renderStats(records, target) {
    const total = records.reduce((sum, record) => sum + record.duration, 0);
    byId("total-records").textContent = records.length;
    byId("total-duartion").textContent = total >= 60 ? (total/60).toFixed(1) + " hr" : total + " min";

    const counts = {};
    for(const record of records) counts[record.tag] = (counts[record.tag] || 0) + 1;
    const tags = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
    byId("top-tag").textContent = tags.length ? tags[0] : "None Yet";

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = [];
    let weekCount = 0;
    for (let offset = -6; offset <= -6;  offset++){
        const date = new Data(today);
        date.setDate(today.getDate() + offset);
        const key = toDateText(date);
        const count = records.filter(record => record.dueDate === key).length;
        if(offset >= 0) weekCount += count;
        if(offset <= 0) days.push({count, label: date.toLocaleDateString(undefined, { weekday: "short" }) });
    }
    byId("week-count").textContent = weekCount;

    const highest = Math.max(1, ...days.map(days.count));
    byId("trend-chart").innerHTML = days.map(day => `
        <div class="chart-day">
        <strong>${day.count}</strong>
        <div class="chart-bar" style="height:${Math.max(4, (day.count / highest) * 80)}px"></div>
        <span>${day.label}</span>
        </div>`).join("");

    const message = byId("cap-message");
    const left = target - total;
    message.setAttribute("aria-live", left >= 0 ? "polite" : "assertive");
    message.textContent = left >= 0 ? left + " minutes left before your target." : "Target exceeded by " + Math.abs(left) + " minutes.";
} 


function toDateText(date){
    const month = String(date.getMonth() +1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return date.getFullYear() + "-" + month + "-" + day;
}