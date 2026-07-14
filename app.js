/* ─────────────────────────────────────────────
   말씀의 씨앗 — 앱 로직
   ───────────────────────────────────────────── */

// ══════════ 저장소 ══════════
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

const LEVEL_LABELS = ["🌰 씨앗", "🌱 새싹", "🌿 자람", "🌳 열매"];

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
function themeById(id) {
  return THEMES.find((t) => t.id === id);
}

// ══════════ 탭 전환 ══════════
const tabs = document.querySelectorAll(".tab");
function switchView(name) {
  tabs.forEach((t) => t.classList.toggle("active", t.dataset.view === name));
  document.querySelectorAll(".view").forEach((v) => {
    v.classList.toggle("active", v.id === `view-${name}`);
  });
}
tabs.forEach((t) => t.addEventListener("click", () => switchView(t.dataset.view)));

// ══════════ 오늘의 말씀 ══════════
function todayVerse() {
  const now = new Date();
  const dayIndex = Math.floor(
    (now - new Date(now.getFullYear(), 0, 0)) / 86400000
  );
  return VERSES[dayIndex % VERSES.length];
}

function renderToday() {
  const v = todayVerse();
  document.getElementById("today-text").textContent = `“${v.text}”`;
  document.getElementById("today-ref").textContent = `${v.ref} (개역한글)`;
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
      <div class="p-count">${done} / ${verses.length} 구절 열매 맺음</div>
      <div class="progress-bar"><div style="width:${pct}%;background:${theme.color}"></div></div>
    `;
    grid.appendChild(cell);
  });
}

// ══════════ 말씀 카드 (탐색) ══════════
let activeTheme = "all";

function renderThemeChips() {
  const wrap = document.getElementById("theme-chips");
  wrap.innerHTML = "";
  const all = document.createElement("button");
  all.className = "chip" + (activeTheme === "all" ? " active" : "");
  all.textContent = "전체";
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

// ══════════ 말씀 상세 모달 ══════════
let detailVerseId = null;

function openVerseDetail(verseId) {
  detailVerseId = verseId;
  const v = verseById(verseId);
  document.getElementById("verse-detail-text").textContent = `“${v.text}”`;
  document.getElementById("verse-detail-ref").textContent = `${v.ref} (개역한글)`;
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

// ══════════ 모달 공통 ══════════
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

// ══════════ 암송 훈련 ══════════
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
    opt.textContent = `${v.ref} — ${v.text.slice(0, 22)}…`;
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

// ── 카드 뒤집기 ──
function renderFlashcard(root, verseId) {
  const v = verseById(verseId);
  root.innerHTML = `
    <div class="flashcard" id="flashcard">
      <div class="flashcard-inner">
        <div class="flash-face front">
          <div class="flash-ref">${v.ref}</div>
          <div class="flash-hint">마음속으로 말씀을 암송해 보고, 카드를 눌러 확인하세요</div>
        </div>
        <div class="flash-face back">
          <div class="flash-text">“${v.text}”</div>
        </div>
      </div>
    </div>
    <div class="flash-actions">
      <button class="btn" id="fc-again">🔁 다시 볼게요</button>
      <button class="btn primary" id="fc-good">✅ 잘 외웠어요</button>
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
    setTimeout(() => alert(`${LEVEL_LABELS[getLevel(verseId)]} 단계가 되었습니다!`), 300);
  };
}

// ── 빈칸 채우기 ──
function renderBlanks(root, verseId) {
  const v = verseById(verseId);
  root.innerHTML = `
    <div class="blank-stage">
      <div class="blank-level-row">
        <button class="btn" data-ratio="0.3">1단계 (30%)</button>
        <button class="btn" data-ratio="0.6">2단계 (60%)</button>
        <button class="btn" data-ratio="1">3단계 (전체)</button>
      </div>
      <div class="blank-verse" id="blank-verse"></div>
      <div class="blank-ref">${v.ref}</div>
      <div class="flash-actions">
        <button class="btn primary" id="blank-done">✅ 다 외웠어요</button>
      </div>
      <p class="hint" style="margin-top:12px">빈칸을 누르면 그 단어가 보입니다. 보지 않고 암송해 보세요!</p>
    </div>
  `;

  function build(ratio) {
    const words = v.text.split(" ");
    const container = document.getElementById("blank-verse");
    container.innerHTML = "";
    // 어절 인덱스를 섞어 ratio 비율만큼 가리기
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
    alert(`${LEVEL_LABELS[getLevel(verseId)]} 단계가 되었습니다!`);
  };
  build(0.3);
}

// ── 통째로 쓰기 ──
function renderTyping(root, verseId) {
  const v = verseById(verseId);
  root.innerHTML = `
    <div class="typing-stage">
      <div class="typing-target">
        <strong>${v.ref}</strong> 말씀을 기억나는 대로 입력해 보세요.
        <label style="display:block;margin-top:8px;font-size:0.85rem;color:var(--ink-soft)">
          <input type="checkbox" id="typing-peek"> 본문 살짝 보기
        </label>
        <div id="typing-peek-text" class="hidden" style="margin-top:8px;color:var(--ink-soft)">“${v.text}”</div>
      </div>
      <textarea class="textarea" id="typing-input" rows="4" placeholder="말씀을 입력하세요..."></textarea>
      <button class="btn primary" id="typing-check">채점하기</button>
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
      `<div><span class="accuracy-badge">정확도 ${result.accuracy}%</span></div>`;
    if (result.accuracy >= 90) {
      bumpLevel(verseId, 1);
      box.innerHTML += `<p class="hint" style="margin-top:8px">🎉 훌륭해요! ${LEVEL_LABELS[getLevel(verseId)]} 단계가 되었습니다.</p>`;
    } else if (result.accuracy < 60) {
      box.innerHTML += `<p class="hint" style="margin-top:8px">조금 더 연습해 볼까요? 빈칸 채우기부터 시작해 보세요.</p>`;
    }
  };
}

function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// 어절 단위 비교 채점
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
  return w.replace(/[.,!?'"“”‘’]/g, "");
}

// ══════════ 기도문 생성 (Claude API) ══════════
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
    ? `“${v.text}” — ${v.ref}`
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
    setStatus("prayer-status", "먼저 설정(⚙️)에서 Anthropic API 키를 입력해 주세요.", "error");
    openSettings();
    return;
  }
  const v = verseById(prayerVerseSelect.value);
  const theme = themeById(v.theme);
  const topic = document.getElementById("prayer-topic").value.trim();
  const btn = document.getElementById("btn-generate-prayer");

  btn.disabled = true;
  setStatus("prayer-status", "기도문을 준비하고 있습니다...");
  document.getElementById("prayer-result").classList.add("hidden");

  const system = [
    "당신은 한국 교회의 성도들이 성경 말씀을 붙잡고 기도하도록 돕는 경건한 기도 동역자입니다.",
    "주어진 성경 요절(개역한글판)에 담긴 하나님의 속성과 약속을 깊이 묵상한 기도문을 한국어로 작성하세요.",
    "규칙:",
    "- 말씀의 구절이나 표현을 기도문 안에 자연스럽게 인용하여, 암송에도 도움이 되게 하세요.",
    "- 찬양(하나님의 속성 높임) → 말씀 묵상과 감사 → 간구 → 결단의 흐름으로 작성하세요.",
    "- 분량은 250~400자 내외, 문단은 2~4개로 나누세요.",
    "- 마지막은 '예수님의 이름으로 기도합니다. 아멘.'으로 맺으세요.",
    "- 따뜻하고 진실한 어조로, 과장되거나 상투적인 표현은 피하세요.",
    "- 기도문 본문만 출력하고 다른 설명은 붙이지 마세요.",
  ].join("\n");

  const userMsg = [
    `주제: ${theme.name} — ${theme.description}`,
    `요절: ${v.ref}`,
    `본문: "${v.text}"`,
    topic ? `함께 기도할 제목: ${topic}` : "",
    "",
    "이 말씀으로 기도문을 작성해 주세요.",
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
          ? "API 키가 올바르지 않습니다. 설정에서 다시 확인해 주세요."
          : `API 오류: ${msg}`
      );
    }

    const data = await res.json();
    if (data.stop_reason === "refusal") {
      throw new Error("요청이 처리되지 않았습니다. 다시 시도해 주세요.");
    }
    const text = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();
    if (!text) throw new Error("기도문이 생성되지 않았습니다. 다시 시도해 주세요.");

    document.getElementById("prayer-text").textContent = text;
    document.getElementById("prayer-result").classList.remove("hidden");
    setStatus("prayer-status", "");
  } catch (e) {
    const isNetwork = e instanceof TypeError;
    setStatus(
      "prayer-status",
      isNetwork
        ? "네트워크 오류가 발생했습니다. 인터넷 연결을 확인해 주세요."
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
    setStatus("prayer-status", "기도문이 복사되었습니다.", "ok");
  } catch {
    setStatus("prayer-status", "복사에 실패했습니다. 직접 선택하여 복사해 주세요.", "error");
  }
};

// ══════════ 말씀 카드 이미지 생성 (Higgsfield) ══════════
const HF_BASE = "https://platform.higgsfield.ai";

async function generateVerseImage(verseId) {
  if (!settings.hfKey || !settings.hfSecret) {
    setStatus("image-status", "먼저 설정(⚙️)에서 Higgsfield API 키와 시크릿을 입력해 주세요.", "error");
    return;
  }
  const v = verseById(verseId);
  const theme = themeById(v.theme);
  const btn = document.getElementById("btn-detail-image");
  btn.disabled = true;

  // 주제별 이미지 분위기
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
    setStatus("image-status", "이미지 생성을 요청하고 있습니다...");
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
          ? "Higgsfield API 키/시크릿이 올바르지 않습니다."
          : `Higgsfield API 오류 (HTTP ${res.status}) ${errText.slice(0, 120)}`
      );
    }
    const jobSet = await res.json();
    const jobSetId = jobSet.id;
    if (!jobSetId) throw new Error("작업 ID를 받지 못했습니다.");

    // 폴링 (3초 간격, 최대 3분)
    const deadline = Date.now() + 180000;
    let imageUrl = null;
    while (Date.now() < deadline) {
      setStatus("image-status", "이미지를 그리는 중입니다... (최대 1~2분 소요)");
      await new Promise((r) => setTimeout(r, 3000));
      const poll = await fetch(`${HF_BASE}/v1/job-sets/${jobSetId}`, { headers });
      if (!poll.ok) continue;
      const data = await poll.json();
      const jobs = data.jobs || [];
      if (jobs.some((j) => j.status === "failed" || j.status === "canceled")) {
        throw new Error("이미지 생성에 실패했습니다. 다시 시도해 주세요.");
      }
      if (jobs.some((j) => j.status === "nsfw")) {
        throw new Error("이미지가 콘텐츠 정책에 의해 거부되었습니다.");
      }
      const done = jobs.find((j) => j.status === "completed" && j.results);
      if (done) {
        imageUrl = done.results.raw?.url || done.results.min?.url || null;
        break;
      }
    }
    if (!imageUrl) throw new Error("시간 내에 이미지가 완성되지 않았습니다. 잠시 후 다시 시도해 주세요.");

    const wrap = document.getElementById("verse-detail-image");
    wrap.innerHTML = "";
    const img = document.createElement("img");
    img.src = imageUrl;
    img.alt = `${v.ref} 말씀 카드 배경`;
    wrap.appendChild(img);
    const link = document.createElement("a");
    link.href = imageUrl;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = "원본 이미지 열기 ↗";
    link.className = "hint small";
    link.style.display = "inline-block";
    link.style.marginTop = "6px";
    wrap.appendChild(link);
    setStatus("image-status", "이미지가 완성되었습니다. (결과 링크는 1시간 후 만료됩니다)", "ok");
  } catch (e) {
    const isNetwork = e instanceof TypeError;
    setStatus(
      "image-status",
      isNetwork
        ? "Higgsfield API에 연결하지 못했습니다.\n브라우저 보안 정책(CORS)으로 직접 호출이 차단되었을 수 있습니다. README의 안내를 참고해 주세요."
        : e.message,
      "error"
    );
  } finally {
    btn.disabled = false;
  }
}

// ══════════ 설정 ══════════
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
  setStatus("settings-status", "저장되었습니다.", "ok");
  setTimeout(() => closeModal("settings-modal"), 700);
};

// ══════════ 초기화 ══════════
renderToday();
renderProgress();
renderThemeChips();
renderVerseList();
renderPrayerPreview();
