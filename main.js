(function () {
  const API_URL = "https://api.imgflip.com/get_memes";
  const TIMEOUT_MS = 8000;

  const form = document.querySelector("#picker");
  const input = document.querySelector("#number");
  const randomBtn = document.querySelector("#random");
  const prevBtn = document.querySelector("#prev");
  const nextBtn = document.querySelector("#next");
  const message = document.querySelector("#message");
  const retryRow = document.querySelector("#retry-row");
  const retryBtn = document.querySelector("#retry");
  const result = document.querySelector("#result");
  const img = document.querySelector("#meme-img");
  const fallback = document.querySelector("#frame-fallback");
  const rank = document.querySelector("#rank");
  const nameEl = document.querySelector("#meme-name");
  const controls = [form.querySelector('[type="submit"]'), randomBtn, prevBtn, nextBtn, input];

  let memes = null; // loaded once, then reused for every lookup

  function setMessage(text, kind) {
    message.textContent = text;
    if (kind) message.dataset.kind = kind;
    else delete message.dataset.kind;
  }

  function setBusy(busy) {
    controls.forEach((el) => (el.disabled = busy));
  }

  // Only keep entries we can safely render: a name and an https image URL.
  function cleanMemes(payload) {
    const list = payload && payload.success && payload.data && payload.data.memes;
    if (!Array.isArray(list)) throw new Error("Unexpected response from the meme service.");
    const valid = list.filter((m) => {
      try {
        return typeof m.name === "string" && new URL(m.url).protocol === "https:";
      } catch (_) {
        return false;
      }
    });
    if (valid.length === 0) throw new Error("The meme service returned no memes.");
    return valid;
  }

  async function loadMemes() {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(API_URL, { signal: controller.signal });
      if (!res.ok) throw new Error(`The meme service answered with status ${res.status}.`);
      return cleanMemes(await res.json());
    } catch (err) {
      if (err.name === "AbortError") throw new Error("The meme service took too long to answer.");
      if (err instanceof SyntaxError) throw new Error("Unexpected response from the meme service.");
      if (err instanceof TypeError) throw new Error("Could not reach the meme service. Check your connection.");
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }

  async function init(fromRetry) {
    retryRow.hidden = true;
    setBusy(true);
    setMessage("Loading the meme list...");
    try {
      memes = await loadMemes();
      input.max = String(memes.length);
      setBusy(false);
      setMessage(`Type a number from 1 to ${memes.length}.`);
      show(Number(input.value) || 1);
    } catch (err) {
      setMessage(`${err.message} No memes to show right now.`, "error");
      retryRow.hidden = false;
      if (fromRetry === true) retryBtn.focus();
    }
  }

  function parseNumber(raw) {
    const text = String(raw).trim();
    if (text === "") return { error: "Please enter a number." };
    const n = Number(text);
    if (!Number.isInteger(n)) return { error: "Please enter a whole number, for example 42." };
    if (n < 1 || n > memes.length) return { error: `The number must be between 1 and ${memes.length}.` };
    return { n };
  }

  function show(n) {
    const meme = memes[n - 1];
    input.value = String(n);
    input.removeAttribute("aria-invalid");

    fallback.hidden = true;
    img.hidden = false;
    img.alt = meme.name;
    img.onerror = () => {
      img.hidden = true;
      fallback.hidden = false;
    };
    img.src = meme.url;

    rank.textContent = `#${n}`;
    nameEl.textContent = meme.name;
    result.hidden = false;
    setMessage(`Showing meme ${n} of ${memes.length}: ${meme.name}.`);
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!memes) return;
    const parsed = parseNumber(input.value);
    if (parsed.error) {
      input.setAttribute("aria-invalid", "true");
      setMessage(parsed.error, "error");
      input.focus();
      return;
    }
    show(parsed.n);
  });

  function step(delta) {
    const parsed = parseNumber(input.value);
    const base = parsed.n || 1;
    show(((base - 1 + delta + memes.length) % memes.length) + 1);
  }

  prevBtn.addEventListener("click", () => step(-1));
  nextBtn.addEventListener("click", () => step(1));
  randomBtn.addEventListener("click", () => show(1 + Math.floor(Math.random() * memes.length)));
  retryBtn.addEventListener("click", () => init(true));

  init();
})();
