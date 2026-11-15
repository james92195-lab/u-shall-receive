/* U Shall Receive — demo quote app (no backend, no real payments) */
(function () {
  "use strict";

  const STORAGE_KEY = "usrDemoState";
  const PLAN_BASELINES = { minimum: 300, full: 600 };
  const YOUNG_UNDER_21 = 90;
  const YOUNG_21_24 = 50;
  const SENIOR_65 = 30;
  const ACCIDENT_FEE = 80;
  const TICKET_FEE = 35;
  const NEW_CAR_FULL_FEE = 25;
  const TERRITORY_FEE = 25;
  const TERRITORY_STATES = new Set(["CA", "NY", "FL", "MI", "NJ", "TX", "LA"]);

  const STATES = [
    ["AL", "Alabama"], ["AK", "Alaska"], ["AZ", "Arizona"], ["AR", "Arkansas"],
    ["CA", "California"], ["CO", "Colorado"], ["CT", "Connecticut"], ["DE", "Delaware"],
    ["DC", "District of Columbia"], ["FL", "Florida"], ["GA", "Georgia"], ["HI", "Hawaii"],
    ["ID", "Idaho"], ["IL", "Illinois"], ["IN", "Indiana"], ["IA", "Iowa"],
    ["KS", "Kansas"], ["KY", "Kentucky"], ["LA", "Louisiana"], ["ME", "Maine"],
    ["MD", "Maryland"], ["MA", "Massachusetts"], ["MI", "Michigan"], ["MN", "Minnesota"],
    ["MS", "Mississippi"], ["MO", "Missouri"], ["MT", "Montana"], ["NE", "Nebraska"],
    ["NV", "Nevada"], ["NH", "New Hampshire"], ["NJ", "New Jersey"], ["NM", "New Mexico"],
    ["NY", "New York"], ["NC", "North Carolina"], ["ND", "North Dakota"], ["OH", "Ohio"],
    ["OK", "Oklahoma"], ["OR", "Oregon"], ["PA", "Pennsylvania"], ["RI", "Rhode Island"],
    ["SC", "South Carolina"], ["SD", "South Dakota"], ["TN", "Tennessee"], ["TX", "Texas"],
    ["UT", "Utah"], ["VT", "Vermont"], ["VA", "Virginia"], ["WA", "Washington"],
    ["WV", "West Virginia"], ["WI", "Wisconsin"], ["WY", "Wyoming"]
  ];

  const VEHICLES = {
    Acura: ["ILX", "Integra", "MDX", "RDX", "TLX"],
    Audi: ["A4", "A6", "Q5", "Q7", "Q8"],
    BMW: ["3 Series", "5 Series", "X3", "X5", "X7"],
    Buick: ["Enclave", "Encore", "Envision"],
    Cadillac: ["CT5", "Escalade", "XT5", "XT6"],
    Chevrolet: ["Equinox", "Malibu", "Silverado", "Tahoe", "Traverse"],
    Chrysler: ["300", "Pacifica"],
    Dodge: ["Charger", "Durango", "Hornet"],
    Ford: ["Bronco", "Escape", "Explorer", "F-150", "Mustang"],
    GMC: ["Acadia", "Sierra", "Terrain", "Yukon"],
    Honda: ["Accord", "Civic", "CR-V", "Odyssey", "Pilot"],
    Hyundai: ["Elantra", "Palisade", "Santa Fe", "Sonata", "Tucson"],
    Jeep: ["Cherokee", "Grand Cherokee", "Wrangler"],
    Kia: ["Forte", "K5", "Sorento", "Sportage", "Telluride"],
    Lexus: ["ES", "NX", "RX", "GX"],
    Mazda: ["CX-5", "CX-50", "CX-90", "Mazda3"],
    "Mercedes-Benz": ["C-Class", "E-Class", "GLC", "GLE"],
    Nissan: ["Altima", "Frontier", "Murano", "Rogue", "Sentra"],
    Ram: ["1500", "2500"],
    Subaru: ["Ascent", "Crosstrek", "Forester", "Outback"],
    Tesla: ["Model 3", "Model Y", "Model S", "Model X"],
    Toyota: ["Camry", "Corolla", "Highlander", "Prius", "RAV4", "Tacoma"],
    Volkswagen: ["Atlas", "Jetta", "Tiguan"],
    Volvo: ["S60", "XC40", "XC60", "XC90"]
  };

  const PREVIEW_DRIVER = {
    firstName: "Alex",
    lastName: "Rivera",
    age: "29",
    zip: "48201",
    state: "MI",
    year: "2022",
    make: "Toyota",
    model: "RAV4",
    accidents: "0",
    tickets: "1",
    coverage: "full"
  };

  const views = {
    landing: document.getElementById("view-landing"),
    quote: document.getElementById("view-quote"),
    result: document.getElementById("view-result"),
    checkout: document.getElementById("view-checkout"),
    confirm: document.getElementById("view-confirm")
  };

  const form = document.getElementById("quote-form");
  const btnNext = document.getElementById("btn-next");
  const btnBack = document.getElementById("btn-back");
  const menuToggle = document.getElementById("menu-toggle");
  const siteNav = document.getElementById("site-nav");

  let currentView = "landing";
  let currentStep = 1;
  let state = loadState() || defaultState();

  function defaultState() {
    return {
      firstName: "",
      lastName: "",
      age: "",
      zip: "",
      state: "",
      year: "",
      make: "",
      model: "",
      accidents: "0",
      tickets: "0",
      coverage: "minimum",
      quote: null,
      policyNumber: null,
      purchasedAt: null
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return Object.assign(defaultState(), JSON.parse(raw));
    } catch (err) {
      return null;
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      /* ignore quota / private mode */
    }
  }

  function money(n) {
    return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  }

  function isFullCoverage(value) {
    return value === "full";
  }

  function planBaseline(coverage) {
    return isFullCoverage(coverage) ? PLAN_BASELINES.full : PLAN_BASELINES.minimum;
  }

  function planLabel(coverage, opts) {
    const short = isFullCoverage(coverage) ? "Full Coverage" : "PL/PD";
    if (opts && opts.long && !isFullCoverage(coverage)) {
      return "PL/PD – liability-only (sample)";
    }
    if (opts && opts.card) {
      return isFullCoverage(coverage)
        ? "Full Coverage (sample) — not valid insurance"
        : "PL/PD – liability-only (sample) — not valid insurance";
    }
    return short + " (sample)";
  }

  function stateName(code) {
    const found = STATES.find(([c]) => c === code);
    return found ? found[1] : code;
  }

  function populateSelects() {
    const stateEl = document.getElementById("state");
    STATES.forEach(([code, name]) => {
      const opt = document.createElement("option");
      opt.value = code;
      opt.textContent = name;
      stateEl.appendChild(opt);
    });

    const yearEl = document.getElementById("year");
    const thisYear = 2027; /* 2026–27 model year available at demo time */
    yearEl.appendChild(new Option("Select year", ""));
    for (let y = thisYear; y >= 1995; y--) {
      yearEl.appendChild(new Option(String(y), String(y)));
    }

    const makeEl = document.getElementById("make");
    Object.keys(VEHICLES).forEach((make) => {
      makeEl.appendChild(new Option(make, make));
    });
  }

  function refreshModels(selected) {
    const make = document.getElementById("make").value;
    const modelEl = document.getElementById("model");
    modelEl.innerHTML = "";
    if (!make || !VEHICLES[make]) {
      modelEl.appendChild(new Option("Select make first", ""));
      modelEl.disabled = true;
      return;
    }
    modelEl.disabled = false;
    modelEl.appendChild(new Option("Select model", ""));
    VEHICLES[make].forEach((m) => modelEl.appendChild(new Option(m, m)));
    if (selected && VEHICLES[make].includes(selected)) modelEl.value = selected;
  }

  function fillFormFromState() {
    const fields = ["firstName", "lastName", "age", "zip", "state", "year", "make", "accidents", "tickets"];
    fields.forEach((name) => {
      const el = form.elements[name];
      if (el && state[name] != null) el.value = state[name];
    });
    refreshModels(state.model);
    if (state.model) form.elements.model.value = state.model;
    const coverage = state.coverage === "full" ? "full" : "minimum";
    const radio = form.querySelector(`input[name="coverage"][value="${coverage}"]`);
    if (radio) radio.checked = true;
    syncCoverageCards();
  }

  function readFormIntoState() {
    const data = new FormData(form);
    ["firstName", "lastName", "age", "zip", "state", "year", "make", "model", "accidents", "tickets", "coverage"].forEach((key) => {
      if (data.has(key)) state[key] = String(data.get(key)).trim();
    });
    saveState();
  }

  function showError(name, message) {
    const input = form.elements[name];
    const err = form.querySelector(`[data-error-for="${name}"]`);
    if (input) input.classList.add("invalid");
    if (err) {
      err.hidden = false;
      err.textContent = message;
    }
  }

  function clearErrors(scope) {
    const root = scope || form;
    root.querySelectorAll(".invalid").forEach((el) => el.classList.remove("invalid"));
    root.querySelectorAll(".field-error").forEach((el) => {
      el.hidden = true;
      el.textContent = "";
    });
  }

  function validateStep(step) {
    clearErrors();
    let ok = true;
    const value = (name) => (form.elements[name].value || "").trim();

    if (step === 1) {
      if (!value("firstName")) { showError("firstName", "Enter a first name."); ok = false; }
      if (!value("lastName")) { showError("lastName", "Enter a last name."); ok = false; }
      const age = Number(value("age"));
      if (!value("age") || Number.isNaN(age)) { showError("age", "Enter your age."); ok = false; }
      else if (age < 16 || age > 99) { showError("age", "Age must be between 16 and 99."); ok = false; }
      if (!/^\d{5}$/.test(value("zip"))) { showError("zip", "Enter a 5-digit U.S. ZIP code."); ok = false; }
      if (!value("state")) { showError("state", "Select a state."); ok = false; }
    }
    if (step === 2) {
      if (!value("year")) { showError("year", "Select the vehicle year."); ok = false; }
      if (!value("make")) { showError("make", "Select a make."); ok = false; }
      if (!value("model")) { showError("model", "Select a model."); ok = false; }
    }
    return ok;
  }

  function computeQuote(data) {
    const age = Number(data.age);
    const accidents = Number(data.accidents) || 0;
    const tickets = Number(data.tickets) || 0;
    const year = Number(data.year);
    const coverage = isFullCoverage(data.coverage) ? "full" : "minimum";
    const baseline = planBaseline(coverage);
    const lines = [
      {
        label: isFullCoverage(coverage)
          ? "Full Coverage baseline (6 months)"
          : "PL/PD baseline (6 months)",
        note: isFullCoverage(coverage)
          ? "Sample Full Coverage starting point used in this demo"
          : "Sample PL/PD (property liability / property damage, liability-only) starting point",
        amount: baseline
      }
    ];

    if (age < 21) {
      lines.push({
        label: "Young driver adjustment (under 21)",
        note: "Illustrative surcharge only",
        amount: YOUNG_UNDER_21
      });
    } else if (age <= 24) {
      lines.push({
        label: "Young driver adjustment (ages 21–24)",
        note: "Illustrative surcharge only",
        amount: YOUNG_21_24
      });
    } else if (age >= 65) {
      lines.push({
        label: "Driver age 65+ adjustment",
        note: "Illustrative surcharge only",
        amount: SENIOR_65
      });
    }

    if (TERRITORY_STATES.has(data.state)) {
      lines.push({
        label: `Territory factor (${data.state})`,
        note: "A small illustrative add-on for a few higher-cost sample states",
        amount: TERRITORY_FEE
      });
    }

    if (accidents > 0) {
      lines.push({
        label: `At-fault accidents (${accidents} × ${money(ACCIDENT_FEE)})`,
        note: "Illustrative history surcharge — last 3 years, demo only",
        amount: accidents * ACCIDENT_FEE
      });
    }

    if (tickets > 0) {
      lines.push({
        label: `Moving violations (${tickets} × ${money(TICKET_FEE)})`,
        note: "Illustrative history surcharge — last 3 years, demo only",
        amount: tickets * TICKET_FEE
      });
    }

    if (isFullCoverage(coverage) && year >= 2023) {
      lines.push({
        label: "Newer vehicle factor (model year 2023+)",
        note: "Illustrative add-on applied only with Full Coverage",
        amount: NEW_CAR_FULL_FEE
      });
    }

    const total = lines.reduce((sum, line) => sum + line.amount, 0);
    return {
      lines,
      total,
      monthly: Math.round(total / 6),
      coverage,
      computedAt: new Date().toISOString()
    };
  }

  function coverageItems(quote, data) {
    if (quote.coverage === "full") {
      return [
        ["Plan", "Full Coverage (sample)"],
        ["Bodily injury liability", "$100,000 / $300,000 (sample)"],
        ["Property damage liability", "$100,000 (sample)"],
        ["Uninsured / underinsured motorist", "Included (sample)"],
        ["Collision", "$500 deductible (sample)"],
        ["Comprehensive", "$500 deductible (sample)"],
        ["Vehicle", `${data.year} ${data.make} ${data.model}`],
        ["Term", "6 months (sample)"],
        ["State", `${stateName(data.state)} (${data.zip})`]
      ];
    }
    return [
      ["Plan", "PL/PD – liability-only (sample)"],
      ["Property liability / property damage", "State-minimum sample limits"],
      ["Uninsured motorist", "Not included in this option"],
      ["Collision", "Not included"],
      ["Comprehensive", "Not included"],
      ["Vehicle", `${data.year} ${data.make} ${data.model}`],
      ["Term", "6 months (sample)"],
      ["State", `${stateName(data.state)} (${data.zip})`]
    ];
  }

  function renderResult() {
    const quote = state.quote;
    if (!quote) return;
    document.getElementById("quote-total").textContent = money(quote.total);
    document.getElementById("quote-monthly").textContent =
      `About ${money(quote.monthly)} / month if spread evenly`;

    const name = `${state.firstName} ${state.lastName}`.trim();
    document.getElementById("quote-summary-line").innerHTML =
      `<strong>${escapeHtml(name)}</strong>, age ${escapeHtml(String(state.age))} · ` +
      `${escapeHtml(state.year)} ${escapeHtml(state.make)} ${escapeHtml(state.model)} · ` +
      `${escapeHtml(stateName(state.state))} ${escapeHtml(state.zip)} · ` +
      planLabel(quote.coverage, { long: true });

    const tbody = document.querySelector("#quote-breakdown tbody");
    const tfoot = document.querySelector("#quote-breakdown tfoot");
    tbody.innerHTML = quote.lines.map((line) => {
      const sign = line.amount >= 0 && line !== quote.lines[0] ? "+" : "";
      return `<tr>
        <td>${escapeHtml(line.label)}<span class="label-note">${escapeHtml(line.note)}</span></td>
        <td>${sign}${money(line.amount)}</td>
      </tr>`;
    }).join("");
    tfoot.innerHTML = `<tr><td>Sample six-month total</td><td>${money(quote.total)}</td></tr>`;

    const list = document.getElementById("coverage-summary");
    list.innerHTML = coverageItems(quote, state).map(([k, v]) =>
      `<li><span>${escapeHtml(k)}</span><span>${escapeHtml(v)}</span></li>`
    ).join("");
  }

  function renderOrderSummary() {
    const box = document.getElementById("order-summary");
    if (!state.quote) return;
    const cover = planLabel(state.quote.coverage, { long: true });
    box.innerHTML = `
      <h2 class="subhead tight">Order summary</h2>
      <div class="line"><span>Driver</span><span>${escapeHtml(state.firstName)} ${escapeHtml(state.lastName)}</span></div>
      <div class="line"><span>Vehicle</span><span>${escapeHtml(state.year)} ${escapeHtml(state.make)} ${escapeHtml(state.model)}</span></div>
      <div class="line"><span>Coverage</span><span>${escapeHtml(cover)}</span></div>
      <div class="line"><span>Term</span><span>6 months</span></div>
      <div class="line total"><span>Sample premium due</span><span>${money(state.quote.total)}</span></div>
      <p class="fine-print">No charge will be made. This checkout cannot process a real payment or bind a policy.</p>
    `;
  }

  function formatDate(date) {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "America/Detroit"
    });
  }

  function makePolicyNumber() {
    const n = Math.floor(100000 + Math.random() * 900000);
    return `USR-2026-${n}`;
  }

  function policyDates() {
    const start = state.purchasedAt ? new Date(state.purchasedAt) : new Date();
    const end = new Date(start);
    end.setMonth(end.getMonth() + 6);
    return { start, end };
  }

  function renderConfirmation() {
    if (!state.policyNumber) return;
    const { start, end } = policyDates();
    document.getElementById("policy-number").textContent = state.policyNumber;
    document.getElementById("card-insured").textContent = `${state.firstName} ${state.lastName}`;
    document.getElementById("card-policy").textContent = state.policyNumber;
    document.getElementById("card-effective").textContent = formatDate(start);
    document.getElementById("card-expires").textContent = formatDate(end);
    document.getElementById("card-vehicle").textContent = `${state.year} ${state.make} ${state.model}`;
    document.getElementById("card-coverage").textContent =
      planLabel(state.quote && state.quote.coverage, { card: true });
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function setHash(view) {
    const hash = view === "landing" ? "#/" : `#/${view}`;
    if (location.hash !== hash) history.replaceState(null, "", hash);
  }

  function showView(view, options) {
    const opts = options || {};
    if (!views[view]) view = "landing";

    if ((view === "result" || view === "checkout") && !state.quote) {
      view = "quote";
    }
    if (view === "confirm" && !state.policyNumber) {
      view = state.quote ? "checkout" : "quote";
    }

    currentView = view;
    Object.entries(views).forEach(([name, el]) => {
      const active = name === view;
      el.classList.toggle("is-active", active);
      if (active) el.removeAttribute("hidden");
      else el.setAttribute("hidden", "");
    });

    if (view === "quote") {
      currentStep = opts.step || currentStep || 1;
      showStep(currentStep);
      fillFormFromState();
    }
    if (view === "result") renderResult();
    if (view === "checkout") renderOrderSummary();
    if (view === "confirm") renderConfirmation();

    setHash(view);
    closeMenu();
    if (!opts.silentScroll) window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function showStep(step) {
    currentStep = step;
    form.querySelectorAll(".step-panel").forEach((panel) => {
      const n = Number(panel.getAttribute("data-step"));
      const active = n === step;
      panel.classList.toggle("is-active", active);
      if (active) panel.removeAttribute("hidden");
      else panel.setAttribute("hidden", "");
    });
    document.querySelectorAll("#quote-progress li").forEach((li) => {
      const n = Number(li.getAttribute("data-step-indicator"));
      li.classList.toggle("is-current", n === step);
      li.classList.toggle("is-done", n < step);
    });
    btnBack.hidden = step === 1;
    btnNext.textContent = step === 4 ? "See sample quote" : "Continue";
  }

  function syncCoverageCards() {
    form.querySelectorAll(".coverage-card").forEach((card) => {
      const input = card.querySelector("input");
      card.classList.toggle("is-selected", input && input.checked);
    });
  }

  function closeMenu() {
    siteNav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open menu");
  }

  function handleNav(view, scrollId) {
    if (view === "landing") {
      showView("landing");
      if (scrollId) {
        const target = document.getElementById(scrollId);
        if (target) setTimeout(() => target.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
      }
      return;
    }
    showView(view);
  }

  function downloadIdCard() {
    const card = document.getElementById("id-card");
    if (!card || !state.policyNumber) return;

    const width = 1040;
    const height = 640;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    const { start, end } = policyDates();

    const grad = ctx.createLinearGradient(0, 0, width * 0.2, height);
    grad.addColorStop(0, "#4A242C");
    grad.addColorStop(0.55, "#3A1C24");
    grad.addColorStop(1, "#2A3A2C");
    ctx.fillStyle = grad;
    roundRect(ctx, 0, 0, width, height, 28);
    ctx.fill();

    ctx.fillStyle = "#c45c26";
    ctx.fillRect(0, 0, width, 58);
    ctx.fillStyle = "#ffffff";
    ctx.font = "700 22px 'DM Sans', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("DEMO — NOT VALID PROOF OF INSURANCE", width / 2, 38);

    ctx.textAlign = "left";
    ctx.fillStyle = "#ffffff";
    ctx.font = "600 36px 'Fraunces', serif";
    ctx.fillText("U Shall Receive", 48, 120);
    ctx.fillStyle = "#c9c3b8";
    ctx.font = "500 22px 'DM Sans', sans-serif";
    ctx.fillText("Insurance Identification Card", 48, 154);

    ctx.strokeStyle = "#C4A35A";
    ctx.lineWidth = 2;
    ctx.strokeRect(width - 168, 84, 120, 36);
    ctx.fillStyle = "#e8d7a8";
    ctx.font = "800 16px 'DM Sans', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("SAMPLE", width - 108, 108);

    const fields = [
      ["INSURED", `${state.firstName} ${state.lastName}`, 48, 220],
      ["POLICY NUMBER", state.policyNumber, 540, 220],
      ["EFFECTIVE", formatDate(start), 48, 310],
      ["EXPIRES", formatDate(end), 540, 310],
      ["VEHICLE", `${state.year} ${state.make} ${state.model}`, 48, 400],
      ["COVERAGE", document.getElementById("card-coverage").textContent, 48, 490]
    ];

    fields.forEach(([label, value, x, y]) => {
      ctx.textAlign = "left";
      ctx.fillStyle = "#b7b1a6";
      ctx.font = "700 14px 'DM Sans', sans-serif";
      ctx.fillText(label, x, y);
      ctx.fillStyle = "#ffffff";
      ctx.font = "600 24px 'DM Sans', sans-serif";
      wrapText(ctx, value, x, y + 32, 920, 30);
    });

    ctx.fillStyle = "#b7b1a6";
    ctx.font = "400 14px 'DM Sans', sans-serif";
    ctx.textAlign = "left";
    wrapText(
      ctx,
      "This card is a design mockup generated by a product prototype. It is not issued by an insurer and must not be presented as proof of insurance.",
      48,
      580,
      940,
      20
    );

    const link = document.createElement("a");
    link.download = `${state.policyNumber}-demo-id-card.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = String(text).split(" ");
    let line = "";
    let yy = y;
    words.forEach((word) => {
      const test = line ? line + " " + word : word;
      if (ctx.measureText(test).width > maxWidth) {
        ctx.fillText(line, x, yy);
        line = word;
        yy += lineHeight;
      } else {
        line = test;
      }
    });
    if (line) ctx.fillText(line, x, yy);
  }

  function applyPreview(kind) {
    const map = {
      quote: "full",
      result: "full",
      full: "full",
      plpd: "minimum",
      minimum: "minimum"
    };
    if (!map[kind]) return false;
    state = Object.assign(defaultState(), PREVIEW_DRIVER, { coverage: map[kind] });
    state.quote = computeQuote(state);
    saveState();
    showView("result", { silentScroll: true });
    return true;
  }

  function routeFromUrl() {
    const params = new URLSearchParams(location.search);
    const preview = params.get("preview");
    if (preview && applyPreview(preview)) return;

    const hash = (location.hash || "#/").replace(/^#\/?/, "");
    const view = hash || "landing";
    if (views[view]) showView(view, { silentScroll: true });
    else showView("landing", { silentScroll: true });
  }

  /* Events */
  document.addEventListener("click", (event) => {
    const navBtn = event.target.closest("[data-nav]");
    if (navBtn) {
      event.preventDefault();
      const view = navBtn.getAttribute("data-nav");
      const scroll = navBtn.getAttribute("data-scroll");
      if (navBtn.hasAttribute("data-quote-edit")) {
        showView("quote", { step: 1 });
        return;
      }
      const coverage = navBtn.getAttribute("data-coverage");
      if (coverage === "full" || coverage === "minimum") {
        state.coverage = coverage;
        state.quote = null;
        state.policyNumber = null;
        state.purchasedAt = null;
        saveState();
      }
      handleNav(view, scroll);
    }

    const scrollLink = event.target.closest("[data-scroll]:not([data-nav])");
    if (scrollLink) {
      const id = scrollLink.getAttribute("data-scroll");
      const target = document.getElementById(id);
      if (target) {
        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        closeMenu();
      }
    }
  });

  menuToggle.addEventListener("click", () => {
    const open = siteNav.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });

  document.getElementById("make").addEventListener("change", () => {
    refreshModels();
    state.make = form.elements.make.value;
    state.model = "";
    saveState();
  });

  form.addEventListener("change", (event) => {
    if (event.target.name === "coverage") syncCoverageCards();
    readFormIntoState();
  });

  form.addEventListener("input", () => {
    /* persist as the user types so refresh does not lose a step */
    readFormIntoState();
  });

  btnNext.addEventListener("click", () => {
    if (!validateStep(currentStep)) return;
    readFormIntoState();
    if (currentStep < 4) {
      showStep(currentStep + 1);
      return;
    }
    state.quote = computeQuote(state);
    state.policyNumber = null;
    state.purchasedAt = null;
    saveState();
    showView("result");
  });

  btnBack.addEventListener("click", () => {
    readFormIntoState();
    if (currentStep > 1) showStep(currentStep - 1);
  });

  document.getElementById("btn-simulate-pay").addEventListener("click", () => {
    if (!state.quote) {
      showView("quote");
      return;
    }
    const btn = document.getElementById("btn-simulate-pay");
    btn.disabled = true;
    btn.textContent = "Simulating…";
    setTimeout(() => {
      state.policyNumber = makePolicyNumber();
      state.purchasedAt = new Date().toISOString();
      saveState();
      btn.disabled = false;
      btn.textContent = "Simulate payment";
      showView("confirm");
    }, 700);
  });

  document.getElementById("btn-print-card").addEventListener("click", () => {
    window.print();
  });

  document.getElementById("btn-download-card").addEventListener("click", downloadIdCard);

  document.getElementById("btn-reset").addEventListener("click", () => {
    state = defaultState();
    saveState();
    currentStep = 1;
    form.reset();
    refreshModels();
    syncCoverageCards();
    showView("quote", { step: 1 });
  });

  window.addEventListener("hashchange", routeFromUrl);

  populateSelects();
  fillFormFromState();
  routeFromUrl();
})();
