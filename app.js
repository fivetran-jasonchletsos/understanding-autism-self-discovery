// AQ-10 (adult). "agree" items score 1 when answered Definitely/Slightly agree;
// "disagree" items score 1 when answered Slightly/Definitely disagree. Score of 6 or more suggests further assessment.
const AQ = [
  { t: "I often notice small sounds when others do not.", s: "agree" },
  { t: "I usually concentrate more on the whole picture, rather than the small details.", s: "disagree" },
  { t: "I find it easy to do more than one thing at once.", s: "disagree" },
  { t: "If there is an interruption, I can switch back to what I was doing very quickly.", s: "disagree" },
  { t: "I find it easy to ‘read between the lines’ when someone is talking to me.", s: "disagree" },
  { t: "I know how to tell if someone listening to me is getting bored.", s: "disagree" },
  { t: "When I’m reading a story, I find it difficult to work out the characters’ intentions.", s: "agree" },
  { t: "I like to collect information about categories of things (e.g. types of car, bird, train, plant).", s: "agree" },
  { t: "I find it easy to work out what someone is thinking or feeling just by looking at their face.", s: "disagree" },
  { t: "I find it difficult to work out people’s intentions.", s: "agree" }
];
const OPTS = ["Definitely agree", "Slightly agree", "Slightly disagree", "Definitely disagree"];

const SIGNS = [
  ["Social communication", "Finding small talk tiring, missing hints or sarcasm, saying exactly what you mean, or needing time to work out what someone meant."],
  ["Sensory differences", "Lights, sounds, textures, tags in clothes, or smells that feel too strong, or being unusually calm with things others find intense."],
  ["Routines and change", "Strong comfort in routines, and real distress when plans change suddenly, even small ones."],
  ["Deep interests", "Absorbing, long-lasting interests that you can talk about for hours, or collecting and organizing information about a topic."],
  ["Energy and recovery", "Needing a lot of alone time after socializing, or burning out after long stretches of holding it together."],
  ["Emotions and meltdowns", "Feeling things very intensely, shutting down or melting down when overloaded, then feeling embarrassed afterwards."],
  ["Scripting and rehearsing", "Planning conversations in advance, copying how others talk and act, and replaying interactions afterwards."],
  ["Details and patterns", "Noticing details and patterns others miss, strong sense of fairness, and honesty that can be mistaken for bluntness."]
];

const PROMPTS = [
  "Things from childhood I remember (friendships, school, play, sensory things, how I felt different)",
  "Social situations that are hard for me, and what I do to cope",
  "Sensory things that bother me or that I love",
  "Routines I rely on, and what happens when they change",
  "My deep interests and what they give me",
  "Times I have masked or felt exhausted from holding it together",
  "Other things my clinician should know (sleep, anxiety, mood, health, family history)",
  "My questions for the appointment"
];

// screener
const form = document.getElementById("aq");
form.innerHTML = AQ.map((q, i) => `
  <fieldset class="q"><legend><span class="n">${i + 1}.</span>${q.t}</legend>
    <div class="choices">${OPTS.map((o, j) => `<label><input type="radio" name="q${i}" value="${j}"><span>${o}</span></label>`).join("")}</div>
  </fieldset>`).join("");

const result = document.getElementById("result");
document.getElementById("scoreBtn").addEventListener("click", () => {
  let score = 0, missing = 0;
  AQ.forEach((q, i) => {
    const c = form.querySelector(`input[name=q${i}]:checked`);
    if (!c) { missing++; return; }
    const v = +c.value;
    if ((q.s === "agree" && v <= 1) || (q.s === "disagree" && v >= 2)) score++;
  });
  result.hidden = false;
  if (missing) {
    result.innerHTML = `<p>Please answer all ten statements first. You have ${missing} left.</p>`;
    return;
  }
  const high = score >= 6;
  result.innerHTML = `<p class="score">${score} out of 10</p>
    <h3>${high ? "A fuller assessment may be worth it" : "Below the usual screening threshold"}</h3>
    <p>${high
      ? "A score of 6 or more is the level at which clinicians usually suggest a fuller assessment. That is a reason to talk to your doctor, not a diagnosis. Many people find it helpful to use the notes section below to prepare."
      : "A score under 6 is below the usual threshold for suggesting further assessment. This screener is short and can miss people who mask or who experience autism differently. If the traits in the section above still sound like you, it is completely reasonable to ask a professional anyway."}</p>
    <p class="small">The AQ-10 is a quick screen, not a diagnostic test. Only a qualified clinician can say whether you are autistic.</p>`;
  result.scrollIntoView({ behavior: "smooth", block: "nearest" });
});
document.getElementById("resetBtn").addEventListener("click", () => {
  form.reset(); result.hidden = true; result.innerHTML = "";
});

// signs
document.getElementById("signCards").innerHTML = SIGNS.map(s => `<div class="card"><h3>${s[0]}</h3><p>${s[1]}</p></div>`).join("");

// notes, saved locally only
const KEY = "autism-guide-notes-v1";
let saved = {};
try { saved = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { saved = {}; }
const notes = document.getElementById("notes");
notes.innerHTML = PROMPTS.map((p, i) => `<div class="note"><label for="n${i}">${p}</label><textarea id="n${i}" data-i="${i}"></textarea></div>`).join("");
notes.querySelectorAll("textarea").forEach(t => {
  t.value = saved[t.dataset.i] || "";
  t.addEventListener("input", () => {
    saved[t.dataset.i] = t.value;
    try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch (e) {}
  });
});
const msg = document.getElementById("noteMsg");
document.getElementById("printBtn").addEventListener("click", () => window.print());
document.getElementById("copyBtn").addEventListener("click", async () => {
  const text = PROMPTS.map((p, i) => p + "\n" + (saved[i] || "") + "\n").join("\n");
  try { await navigator.clipboard.writeText(text); msg.textContent = "Copied."; }
  catch (e) { msg.textContent = "Could not copy automatically. Try the print option instead."; }
});
document.getElementById("clearBtn").addEventListener("click", () => {
  if (!confirm("Erase all of your notes on this device? This cannot be undone.")) return;
  saved = {};
  try { localStorage.removeItem(KEY); } catch (e) {}
  notes.querySelectorAll("textarea").forEach(t => t.value = "");
  msg.textContent = "Notes erased.";
});
