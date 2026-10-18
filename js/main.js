/* nav collapse, section reveals, live terminal, beta form */
(function () {
  const isHomeRoute = /(^\/$|\/index\.html$)/.test(window.location.pathname);
  const hasExplicitHash = window.location.hash.length > 0;
  if (isHomeRoute && !hasExplicitHash) {
    const { pathname, search } = window.location;
    window.history.replaceState(null, "", `${pathname}${search}#top`);
    window.scrollTo(0, 0);
  }

  // screenshot/test mode: no animations, no viewport-relative sizing
  if (new URLSearchParams(location.search).has("nofx")) {
    document.documentElement.classList.add("nofx");
  }
  /* ---- nav: border + logo -> turnstile collapse ---- */
  const nav = document.querySelector(".nav");
  const navLinks = document.querySelector(".nav-links");
  const navToggle = document.querySelector(".nav-toggle");
  const forceScrolled = new URLSearchParams(location.search).has("scrolled");
  // .nav.scrolled drives both the nav border and the CSS logo collapse
  const onScroll = () =>
    nav.classList.toggle("scrolled", window.scrollY > 90 || forceScrolled);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (nav && navLinks && navToggle) {
    const closeNav = () => {
      navLinks.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    };

    navToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeNav);
    });

    document.addEventListener("click", (event) => {
      if (!nav.contains(event.target)) closeNav();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeNav();
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 960) closeNav();
    });
  }

  /* ---- headline: keep it on ONE line by fitting the font-size to the copy width ---- */
  (function headline() {
    const copy = document.querySelector(".hero-copy");
    const h1 = document.querySelector(".hero h1");
    if (!copy || !h1) return;
    const MAX_PX = 60, MIN_PX = 24, MOBILE_W = 520;

    function fit() {
      if (copy.clientWidth < MOBILE_W) {           // mobile: let it wrap
        h1.style.whiteSpace = "";
        h1.style.fontSize = "";
        return;
      }
      h1.style.whiteSpace = "nowrap";
      h1.style.fontSize = "100px";                 // measure at a known size
      const oneLine = h1.scrollWidth;
      let size = Math.min(MAX_PX, (100 * copy.clientWidth) / oneLine);
      if (size < MIN_PX) {                         // too tight -> allow wrap
        h1.style.whiteSpace = "normal";
        h1.style.fontSize = "";
        return;
      }
      h1.style.fontSize = size + "px";
    }

    fit();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    let rt = null;
    window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(fit, 120); });
  })();

  /* ---- reveal on scroll: fade in only once the element is meaningfully into
         view (rootMargin pulls the trigger up from the bottom edge), then stop
         observing so it stays revealed ---- */
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    }),
    { threshold: 0, rootMargin: "0px 0px -22% 0px" }
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  /* ---- copy buttons on code cards ---- */
  document.querySelectorAll(".copy-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const pre = btn.closest(".code-card") && btn.closest(".code-card").querySelector("pre");
      if (!pre || !navigator.clipboard) return;
      navigator.clipboard.writeText(pre.innerText.trim()).then(() => {
        btn.textContent = "Copied";
        btn.classList.add("copied");
        setTimeout(() => { btn.textContent = "Copy"; btn.classList.remove("copied"); }, 1400);
      });
    });
  });

  /* ---- terminal: replay of a real `mrg run` session ---- */
  const term = document.getElementById("term-body");
  if (term && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const SPINNER = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
    const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
    let t = 0, frame = 0, phase = 0, typed = 0, timer = null;
    const cmd = "mrg run examples/sat_solver/client_sdk.py";

    function render() {
      const lines = [];
      lines.push(
        `<span class="term-dim">$</span> ${esc(cmd.slice(0, typed))}` +
        (phase === 0 ? '<span class="term-cursor"></span>' : "")
      );
      if (phase >= 1) lines.push(`<span class="term-dim">[mrg] picked idle fpga1</span>`);
      if (phase >= 2) {
        const mm = String(Math.floor(t / 60)).padStart(2, "0");
        const ss = String(t % 60).padStart(2, "0");
        lines.push(
          `<span class="term-run">${SPINNER[frame % SPINNER.length]} running</span>` +
          ` <span class="term-dim">·</span> sat_solver <span class="term-dim">·</span>` +
          ` warming up the flip-flops… <span class="term-dim">${mm}:${ss}</span>`
        );
      }
      if (phase >= 3) {
        lines.push(`<span class="term-ok">✓ done</span> <span class="term-dim">·</span> read: 0x2a`);
        lines.push(`<span class="term-dim">$</span> <span class="term-cursor"></span>`);
      }
      term.innerHTML = lines.join("\n");
    }

    function start() {
      timer = setInterval(() => {
        if (phase === 0) {
          typed = Math.min(cmd.length, typed + 2);
          if (typed === cmd.length) phase = 1;
        } else if (phase === 1) {
          phase = 2;
        } else if (phase === 2) {
          frame++;
          if (frame % 10 === 0) t++;
          if (t >= 9) phase = 3;
        } else {
          // hold the finished state, then replay
          if (++frame % 90 === 0) { t = 0; frame = 0; typed = 0; phase = 0; }
        }
        render();
      }, 80);
    }

    new IntersectionObserver((entries, obs) => {
      if (entries[0].isIntersecting) { obs.disconnect(); start(); }
    }, { threshold: 0.4 }).observe(term);
    render();
  } else if (term) {
    term.innerHTML =
      '<span class="term-dim">$</span> mrg run examples/sat_solver/client_sdk.py\n' +
      '<span class="term-dim">[mrg] picked idle fpga1</span>\n' +
      '<span class="term-run">⠋ running</span> <span class="term-dim">·</span> sat_solver ' +
      '<span class="term-dim">·</span> warming up the flip-flops… <span class="term-dim">05:52</span>';
  }

  /* ---- beta form ---- */
  const form = document.getElementById("beta-form");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const status = form.querySelector(".form-status");
      const submitBtn = form.querySelector('button[type="submit"]');
      const action =
        form.getAttribute("action") ||
        "https://api.manhattanreasoning.com/api/beta/apply";

      const formData = new FormData(form);
      const payload = {
        github_username: (formData.get("github_username") || "").trim(),
        email: (formData.get("email") || "").trim(),
        full_name: (formData.get("full_name") || "").trim() || null,
        affiliation: (formData.get("affiliation") || "").trim() || null,
        intended_use: (formData.get("intended_use") || "").trim() || null,
      };

      if (!payload.github_username) {
        status.textContent = "Please provide your GitHub username.";
        status.className = "form-status err";
        return;
      }

      status.textContent = "Submitting…";
      status.className = "form-status";
      if (submitBtn) submitBtn.disabled = true;

      try {
        const res = await fetch(action, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        });

        const data = await res.json().catch(() => ({}));

        if (res.ok) {
          form.reset();
          status.textContent =
            data.message ||
            "Application received! We'll review your application shortly.";
          status.className = "form-status ok";
        } else {
          const errMsg =
            data.detail?.message ||
            data.message ||
            "Failed to submit application. Please check your details.";
          status.textContent = errMsg;
          status.className = "form-status err";
        }
      } catch {
        status.textContent =
          "Unable to connect to server — email hello@manhattanreasoning.com instead.";
        status.className = "form-status err";
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }
})();
