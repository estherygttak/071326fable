/* ─────────────────────────────────────────────
   Seed of the Word — app logic
   ───────────────────────────────────────────── */

// ══════════ Storage ══════════
const STORE_KEYS = {
  settings: "seed.settings",
  progress: "seed.progress",
};

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

let settings = loadJSON(STORE_KEYS.settings, {
  anthropicKey: "",
  hfKey: "",
  hfSecret: "",
});
// progress[verseId] = { level: 0~3, reviews: n, lastReviewed: iso }
let progress = loadJSON(STORE_KEYS.progress, {});

const LEVEL_LABELS = ["🌰 Seed", "🌱 Sprout", "🌿 Growing", "🌳 Fruit"];

function getLevel(verseId) {
  return progress[verseId]?.level ?? 0;
}
function bumpLevel(verseId, delta) {
  const cur = progress[verseId] || { level: 0, reviews: 0 };
  cur.level = Math.max(0, Math.min(3, (cur.level || 0) + delta));
  cur.reviews = (cur.reviews || 0) + 1;
  cur.lastReviewed = new Date().toISOString();
  progress[verseId] = cur;
  saveJSON(STORE_KEYS.progress, progress);
  renderProgress();
}

function verseById(id) {
  return VERSES.find((v) => v.id === id);
}
// Wrap in curly quotes unless the text already opens with a quotation mark
function quoted(text) {
  return /^[“"']/.test(text) ? text : `“${text}”`;
}
function themeById(id) {
  return THEMES.find((t) => t.id === id);
}

// ══════════ Tab navigation ══════════
const tabs = document.querySelectorAll(".tab");
function switchView(name) {
  tabs.forEach((t) => t.classList.toggle("active", t.dataset.view === name));
  document.querySelectorAll(".view").forEach((v) => {
    v.classList.toggle("active", v.id === `view-${name}`);
  });
}
tabs.forEach((t) => t.addEventListener("click", () => switchView(t.dataset.view)));

// ══════════ Today's verse ══════════
function todayVerse() {
  const now = new Date();
  const dayIndex = Math.floor(
    (now - new Date(now.getFullYear(), 0, 0)) / 86400000
  );
  return VERSES[dayIndex % VERSES.length];
}

function renderToday() {
  const v = todayVerse();
  document.getElementById("today-text").textContent = quoted(v.text);
  document.getElementById("today-ref").textContent = `${v.ref} (${BIBLE_VERSION})`;
  document.getElementById("btn-today-memorize").onclick = () => {
    openMemorize(v.id);
  };
  document.getElementById("btn-today-prayer").onclick = () => {
    openPrayer(v.id);
  };
}

function renderProgress() {
  const grid = document.getElementById("progress-grid");
  grid.innerHTML = "";
  THEMES.forEach((theme) => {
    const verses = VERSES.filter((v) => v.theme === theme.id);
    const done = verses.filter((v) => getLevel(v.id) >= 3).length;
    const pct = verses.length ? Math.round((done / verses.length) * 100) : 0;
    const cell = document.createElement("div");
    cell.className = "progress-cell";
    cell.innerHTML = `
      <div class="p-name">${theme.emoji} ${theme.name}</div>
      <div class="p-count">${done} / ${verses.length} verses bearing fruit</div>
      <div class="progress-bar"><div style="width:${pct}%;background:${theme.color}"></div></div>
    `;
    grid.appendChild(cell);
  });
}

// ══════════ Verse cards (browse) ══════════
let activeTheme = "all";

function renderThemeChips() {
  const wrap = document.getElementById("theme-chips");
  wrap.innerHTML = "";
  const all = document.createElement("button");
  all.className = "chip" + (activeTheme === "all" ? " active" : "");
  all.textContent = "All";
  all.onclick = () => { activeTheme = "all"; renderThemeChips(); renderVerseList(); };
  wrap.appendChild(all);
  THEMES.forEach((t) => {
    const chip = document.createElement("button");
    chip.className = "chip" + (activeTheme === t.id ? " active" : "");
    chip.textContent = `${t.emoji} ${t.name}`;
    chip.onclick = () => { activeTheme = t.id; renderThemeChips(); renderVerseList(); };
    wrap.appendChild(chip);
  });
}

function renderVerseList() {
  const list = document.getElementById("verse-list");
  list.innerHTML = "";
  VERSES.filter((v) => activeTheme === "all" || v.theme === activeTheme).forEach(
    (v) => {
      const theme = themeById(v.theme);
      const card = document.createElement("div");
      card.className = "verse-card";
      card.style.borderLeftColor = theme.color;
      card.innerHTML = `
        <div class="v-text">${v.text}</div>
        <div class="v-meta">
          <span class="v-ref">${v.ref}</span>
          <span class="v-level">${LEVEL_LABELS[getLevel(v.id)]}</span>
        </div>
      `;
      card.onclick = () => openVerseDetail(v.id);
      list.appendChild(card);
    }
  );
}

// ══════════ Verse detail modal ══════════
let detailVerseId = null;

function openVerseDetail(verseId) {
  detailVerseId = verseId;
  const v = verseById(verseId);
  document.getElementById("verse-detail-text").textContent = quoted(v.text);
  document.getElementById("verse-detail-ref").textContent = `${v.ref} (${BIBLE_VERSION})`;
  document.getElementById("verse-detail-image").innerHTML = "";
  setStatus("image-status", "");
  document.getElementById("verse-modal").classList.remove("hidden");
}

document.getElementById("btn-detail-memorize").onclick = () => {
  closeModal("verse-modal");
  openMemorize(detailVerseId);
};
document.getElementById("btn-detail-prayer").onclick = () => {
  closeModal("verse-modal");
  openPrayer(detailVerseId);
};
document.getElementById("btn-detail-image").onclick = () => {
  generateVerseImage(detailVerseId);
};

// ══════════ Modal helpers ══════════
function closeModal(id) {
  document.getElementById(id).classList.add("hidden");
}
document.querySelectorAll(".modal-close").forEach((btn) => {
  btn.onclick = () => closeModal(btn.dataset.close);
});
document.querySelectorAll(".modal-backdrop").forEach((bd) => {
  bd.addEventListener("click", (e) => {
    if (e.target === bd) bd.classList.add("hidden");
  });
});

function setStatus(id, msg, kind) {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.className = "status-line" + (kind ? ` ${kind}` : "");
}

// ══════════ Memorize ══════════
const memoThemeSelect = document.getElementById("memo-theme-select");
const memoVerseSelect = document.getElementById("memo-verse-select");

function fillThemeSelect(selectEl) {
  selectEl.innerHTML = "";
  THEMES.forEach((t) => {
    const opt = document.createElement("option");
    opt.value = t.id;
    opt.textContent = `${t.emoji} ${t.name}`;
    selectEl.appendChild(opt);
  });
}

function fillVerseSelect(selectEl, themeId) {
  selectEl.innerHTML = "";
  VERSES.filter((v) => v.theme === themeId).forEach((v) => {
    const opt = document.createElement("option");
    opt.value = v.id;
    opt.textContent = `${v.ref} — ${v.text.slice(0, 40)}…`;
    selectEl.appendChild(opt);
  });
}

fillThemeSelect(memoThemeSelect);
fillVerseSelect(memoVerseSelect, memoThemeSelect.value);
memoThemeSelect.onchange = () =>
  fillVerseSelect(memoVerseSelect, memoThemeSelect.value);

document.querySelectorAll(".mode-buttons .btn").forEach((btn) => {
  btn.onclick = () => startMemorize(memoVerseSelect.value, btn.dataset.mode);
});

document.getElementById("btn-memo-back").onclick = () => {
  document.getElementById("memorize-stage").classList.add("hidden");
  document.getElementById("memorize-setup").classList.remove("hidden");
};

function openMemorize(verseId) {
  const v = verseById(verseId);
  switchView("memorize");
  memoThemeSelect.value = v.theme;
  fillVerseSelect(memoVerseSelect, v.theme);
  memoVerseSelect.value = verseId;
  document.getElementById("memorize-stage").classList.add("hidden");
  document.getElementById("memorize-setup").classList.remove("hidden");
}

function startMemorize(verseId, mode) {
  document.getElementById("memorize-setup").classList.add("hidden");
  document.getElementById("memorize-stage").classList.remove("hidden");
  const content = document.getElementById("memo-content");
  content.innerHTML = "";
  if (mode === "flashcard") renderFlashcard(content, verseId);
  else if (mode === "blanks") renderBlanks(content, verseId);
  else renderTyping(content, verseId);
}

// ── Flashcard ──
function renderFlashcard(root, verseId) {
  const v = verseById(verseId);
  root.innerHTML = `
    <div class="flashcard" id="flashcard">
      <div class="flashcard-inner">
        <div class="flash-face front">
          <div class="flash-ref">${v.ref}</div>
          <div class="flash-hint">Recite the verse from memory, then tap the card to check</div>
        </div>
        <div class="flash-face back">
          <div class="flash-text">${quoted(v.text)}</div>
        </div>
      </div>
    </div>
    <div class="flash-actions">
      <button class="btn" id="fc-again">🔁 Needs more practice</button>
      <button class="btn primary" id="fc-good">✅ I got it!</button>
    </div>
  `;
  const card = document.getElementById("flashcard");
  card.onclick = () => card.classList.toggle("flipped");
  document.getElementById("fc-again").onclick = () => {
    bumpLevel(verseId, -1);
    card.classList.remove("flipped");
  };
  document.getElementById("fc-good").onclick = () => {
    bumpLevel(verseId, 1);
    card.classList.remove("flipped");
    setTimeout(() => alert(`You've reached the ${LEVEL_LABELS[getLevel(verseId)]} stage!`), 300);
  };
}

// ── Fill in the blanks ──
function renderBlanks(root, verseId) {
  const v = verseById(verseId);
  root.innerHTML = `
    <div class="blank-stage">
      <div class="blank-level-row">
        <button class="btn" data-ratio="0.3">Level 1 (30%)</button>
        <button class="btn" data-ratio="0.6">Level 2 (60%)</button>
        <button class="btn" data-ratio="1">Level 3 (all)</button>
      </div>
      <div class="blank-verse" id="blank-verse"></div>
      <div class="blank-ref">${v.ref}</div>
      <div class="flash-actions">
        <button class="btn primary" id="blank-done">✅ I've got it memorized</button>
      </div>
      <p class="hint" style="margin-top:12px">Tap a blank to reveal the word. Try reciting without peeking!</p>
    </div>
  `;

  function build(ratio) {
    const words = v.text.split(" ");
    const container = document.getElementById("blank-verse");
    container.innerHTML = "";
    // Shuffle word indexes and hide the requested share of them
    const idxs = words.map((_, i) => i);
    for (let i = idxs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [idxs[i], idxs[j]] = [idxs[j], idxs[i]];
    }
    const hideCount = Math.max(1, Math.round(words.length * ratio));
    const hidden = new Set(idxs.slice(0, hideCount));
    words.forEach((word, i) => {
      if (hidden.has(i)) {
        const span = document.createElement("span");
        span.className = "blank-word";
        span.textContent = word;
        span.onclick = () => span.classList.toggle("revealed");
        container.appendChild(span);
      } else {
        container.appendChild(document.createTextNode(word));
      }
      container.appendChild(document.createTextNode(" "));
    });
  }

  root.querySelectorAll("[data-ratio]").forEach((btn) => {
    btn.onclick = () => build(parseFloat(btn.dataset.ratio));
  });
  document.getElementById("blank-done").onclick = () => {
    bumpLevel(verseId, 1);
    alert(`You've reached the ${LEVEL_LABELS[getLevel(verseId)]} stage!`);
  };
  build(0.3);
}

// ── Type it out ──
function renderTyping(root, verseId) {
  const v = verseById(verseId);
  root.innerHTML = `
    <div class="typing-stage">
      <div class="typing-target">
        Type <strong>${v.ref}</strong> from memory.
        <label style="display:block;margin-top:8px;font-size:0.85rem;color:var(--ink-soft)">
          <input type="checkbox" id="typing-peek"> Peek at the verse
        </label>
        <div id="typing-peek-text" class="hidden" style="margin-top:8px;color:var(--ink-soft)">${quoted(v.text)}</div>
      </div>
      <textarea class="textarea" id="typing-input" rows="4" placeholder="Type the verse here..."></textarea>
      <button class="btn primary" id="typing-check">Check my answer</button>
      <div class="typing-result" id="typing-result"></div>
    </div>
  `;
  document.getElementById("typing-peek").onchange = (e) => {
    document
      .getElementById("typing-peek-text")
      .classList.toggle("hidden", !e.target.checked);
  };
  document.getElementById("typing-check").onclick = () => {
    const input = document.getElementById("typing-input").value.trim();
    const result = gradeTyping(v.text, input);
    const box = document.getElementById("typing-result");
    box.innerHTML =
      result.html +
      `<div><span class="accuracy-badge">Accuracy ${result.accuracy}%</span></div>`;
    if (result.accuracy >= 90) {
      bumpLevel(verseId, 1);
      box.innerHTML += `<p class="hint" style="margin-top:8px">🎉 Wonderful! You've reached the ${LEVEL_LABELS[getLevel(verseId)]} stage.</p>`;
    } else if (result.accuracy < 60) {
      box.innerHTML += `<p class="hint" style="margin-top:8px">Keep practicing — try starting with Fill in the Blanks.</p>`;
    }
  };
}

function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Word-by-word grading (case- and punctuation-insensitive)
function gradeTyping(target, input) {
  const tWords = target.split(/\s+/);
  const iWords = input ? input.split(/\s+/) : [];
  let correct = 0;
  const parts = tWords.map((tw, i) => {
    const iw = iWords[i] || "";
    const ok = normalize(iw) === normalize(tw);
    if (ok) correct++;
    return `<span class="${ok ? "ok" : "miss"}">${escapeHtml(tw)}</span>`;
  });
  const accuracy = Math.round((correct / tWords.length) * 100);
  return { html: `<p>${parts.join(" ")}</p>`, accuracy };
}
function normalize(w) {
  return w.toLowerCase().replace(/[.,!?;:'"“”‘’()—–-]/g, "");
}

// ══════════ Prayer writing (Claude API) ══════════
const prayerThemeSelect = document.getElementById("prayer-theme-select");
const prayerVerseSelect = document.getElementById("prayer-verse-select");

fillThemeSelect(prayerThemeSelect);
fillVerseSelect(prayerVerseSelect, prayerThemeSelect.value);
prayerThemeSelect.onchange = () => {
  fillVerseSelect(prayerVerseSelect, prayerThemeSelect.value);
  renderPrayerPreview();
};
prayerVerseSelect.onchange = renderPrayerPreview;

function renderPrayerPreview() {
  const v = verseById(prayerVerseSelect.value);
  document.getElementById("prayer-verse-preview").textContent = v
    ? `${quoted(v.text)} — ${v.ref}`
    : "";
}

function openPrayer(verseId) {
  const v = verseById(verseId);
  switchView("prayer");
  prayerThemeSelect.value = v.theme;
  fillVerseSelect(prayerVerseSelect, v.theme);
  prayerVerseSelect.value = verseId;
  renderPrayerPreview();
}

document.getElementById("btn-generate-prayer").onclick = generatePrayer;

async function generatePrayer() {
  const key = settings.anthropicKey;
  if (!key) {
    setStatus("prayer-status", "Please enter your Anthropic API key in Settings (⚙️) first.", "error");
    openSettings();
    return;
  }
  const v = verseById(prayerVerseSelect.value);
  const theme = themeById(v.theme);
  const topic = document.getElementById("prayer-topic").value.trim();
  const btn = document.getElementById("btn-generate-prayer");

  btn.disabled = true;
  setStatus("prayer-status", "Preparing your prayer...");
  document.getElementById("prayer-result").classList.add("hidden");

  const system = [
    "You are a devoted prayer companion helping believers pray Scripture back to God.",
    "Write a prayer in English that deeply meditates on the character of God and the promises found in the given Bible verse (NIV).",
    "Rules:",
    "- Weave phrases from the verse naturally into the prayer, so it also helps with memorization.",
    "- Follow this flow: adoration (exalting God's character) → meditating on the verse with thanksgiving → petition → commitment.",
    "- Keep it around 150-220 words, in 2-4 short paragraphs.",
    "- Close with: \"In Jesus' name I pray, Amen.\"",
    "- Use a warm, sincere tone. Avoid clichés and exaggeration.",
    "- Output only the prayer itself, with no extra commentary.",
  ].join("\n");

  const userMsg = [
    `Theme: ${theme.name} — ${theme.description}`,
    `Verse: ${v.ref}`,
    `Text: "${v.text}"`,
    topic ? `Also praying for: ${topic}` : "",
    "",
    "Please write a prayer based on this verse.",
  ].filter(Boolean).join("\n");

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: "claude-opus-4-8",
        max_tokens: 2048,
        system: system,
        messages: [{ role: "user", content: userMsg }],
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      const msg = err?.error?.message || `HTTP ${res.status}`;
      throw new Error(
        res.status === 401
          ? "Your API key appears to be invalid. Please check it in Settings."
          : `API error: ${msg}`
      );
    }

    const data = await res.json();
    if (data.stop_reason === "refusal") {
      throw new Error("The request could not be completed. Please try again.");
    }
    const text = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();
    if (!text) throw new Error("No prayer was generated. Please try again.");

    document.getElementById("prayer-text").textContent = text;
    document.getElementById("prayer-result").classList.remove("hidden");
    setStatus("prayer-status", "");
  } catch (e) {
    const isNetwork = e instanceof TypeError;
    setStatus(
      "prayer-status",
      isNetwork
        ? "A network error occurred. Please check your internet connection."
        : e.message,
      "error"
    );
  } finally {
    btn.disabled = false;
  }
}

document.getElementById("btn-copy-prayer").onclick = async () => {
  const text = document.getElementById("prayer-text").textContent;
  try {
    await navigator.clipboard.writeText(text);
    setStatus("prayer-status", "Prayer copied to clipboard.", "ok");
  } catch {
    setStatus("prayer-status", "Copy failed. Please select and copy the text manually.", "error");
  }
};

// ══════════ Verse card image (Higgsfield) ══════════
const HF_BASE = "https://platform.higgsfield.ai";

async function generateVerseImage(verseId) {
  if (!settings.hfKey || !settings.hfSecret) {
    setStatus("image-status", "Please enter your Higgsfield API key and secret in Settings (⚙️) first.", "error");
    return;
  }
  const v = verseById(verseId);
  const theme = themeById(v.theme);
  const btn = document.getElementById("btn-detail-image");
  btn.disabled = true;

  // Per-theme visual mood
  const moods = {
    gospel: "a rugged wooden cross on a hill at golden sunrise, rays of warm light breaking through clouds, hopeful and reverent",
    immanuel: "a peaceful shepherd's meadow with soft morning mist, gentle stream, warm sunlight through trees, serene and comforting",
    prayer: "warm candlelight in a quiet prayer room, open ancient book, soft window light at dawn, intimate and still",
    mission: "a glowing globe of the earth seen from a mountain summit at sunrise, paths of light reaching every continent, vast and inspiring",
  };
  const prompt = `Beautiful serene Christian devotional background art: ${moods[theme.id]}. Soft painterly style, warm gentle colors, no text, no people's faces, suitable as a Bible verse card background.`;

  const headers = {
    "Content-Type": "application/json",
    "hf-api-key": settings.hfKey,
    "hf-secret": settings.hfSecret,
  };

  try {
    setStatus("image-status", "Requesting image generation...");
    const res = await fetch(`${HF_BASE}/v1/text2image/soul`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        params: {
          prompt,
          width_and_height: "1536x1536",
          quality: "1080p",
          batch_size: 1,
        },
      }),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(
        res.status === 401 || res.status === 403
          ? "Your Higgsfield API key/secret appears to be invalid."
          : `Higgsfield API error (HTTP ${res.status}) ${errText.slice(0, 120)}`
      );
    }
    const jobSet = await res.json();
    const jobSetId = jobSet.id;
    if (!jobSetId) throw new Error("No job ID was returned.");

    // Poll every 3 s, up to 3 min
    const deadline = Date.now() + 180000;
    let imageUrl = null;
    while (Date.now() < deadline) {
      setStatus("image-status", "Painting your image... (this can take 1-2 minutes)");
      await new Promise((r) => setTimeout(r, 3000));
      const poll = await fetch(`${HF_BASE}/v1/job-sets/${jobSetId}`, { headers });
      if (!poll.ok) continue;
      const data = await poll.json();
      const jobs = data.jobs || [];
      if (jobs.some((j) => j.status === "failed" || j.status === "canceled")) {
        throw new Error("Image generation failed. Please try again.");
      }
      if (jobs.some((j) => j.status === "nsfw")) {
        throw new Error("The image was rejected by the content policy.");
      }
      const done = jobs.find((j) => j.status === "completed" && j.results);
      if (done) {
        imageUrl = done.results.raw?.url || done.results.min?.url || null;
        break;
      }
    }
    if (!imageUrl) throw new Error("The image didn't finish in time. Please try again in a moment.");

    const wrap = document.getElementById("verse-detail-image");
    wrap.innerHTML = "";
    const img = document.createElement("img");
    img.src = imageUrl;
    img.alt = `Background image for ${v.ref}`;
    wrap.appendChild(img);
    const link = document.createElement("a");
    link.href = imageUrl;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = "Open full image ↗";
    link.className = "hint small";
    link.style.display = "inline-block";
    link.style.marginTop = "6px";
    wrap.appendChild(link);
    setStatus("image-status", "Your image is ready! (The link expires in about 1 hour.)", "ok");
  } catch (e) {
    const isNetwork = e instanceof TypeError;
    setStatus(
      "image-status",
      isNetwork
        ? "Could not reach the Higgsfield API.\nYour browser's security policy (CORS) may be blocking direct calls — see the README for a workaround."
        : e.message,
      "error"
    );
  } finally {
    btn.disabled = false;
  }
}

// ══════════ Settings ══════════
function openSettings() {
  document.getElementById("input-anthropic-key").value = settings.anthropicKey || "";
  document.getElementById("input-hf-key").value = settings.hfKey || "";
  document.getElementById("input-hf-secret").value = settings.hfSecret || "";
  setStatus("settings-status", "");
  document.getElementById("settings-modal").classList.remove("hidden");
}
document.getElementById("btn-settings").onclick = openSettings;

document.getElementById("btn-save-settings").onclick = () => {
  settings = {
    anthropicKey: document.getElementById("input-anthropic-key").value.trim(),
    hfKey: document.getElementById("input-hf-key").value.trim(),
    hfSecret: document.getElementById("input-hf-secret").value.trim(),
  };
  saveJSON(STORE_KEYS.settings, settings);
  setStatus("settings-status", "Saved.", "ok");
  setTimeout(() => closeModal("settings-modal"), 700);
};

// ══════════ Init ══════════
renderToday();
renderProgress();
renderThemeChips();
renderVerseList();
renderPrayerPreview();
