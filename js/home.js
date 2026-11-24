/* Home page: the board lifecycle, the build pipeline reveal, the terminal
   replay, and the sidebar's current-section marker.

   This page makes no API calls (the beta form in main.js is the only one).
   Nothing here states or implies how many boards there are. */
(function () {
  "use strict";

  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- one board, stepping through its lifecycle while in view ---- */
  const life = document.querySelector("[data-lifecycle]");
  if (life) {
    const fig = life.querySelector(".board-figure");
    const steps = Array.from(life.querySelectorAll(".life-steps li"));
    let i = 0, timer = null;
    const show = (n) => {
      steps.forEach((li, k) => li.classList.toggle("current", k === n));
      fig.className = "board-figure " + steps[n].dataset.state;
    };
    show(0);
    if (!reduceMotion) {
      new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !timer) {
          timer = setInterval(() => { i = (i + 1) % steps.length; show(i); }, 1800);
        } else if (!entries[0].isIntersecting && timer) {
          clearInterval(timer); timer = null;
        }
      }, { threshold: 0.3 }).observe(life);
    }
  }

  /* ---- build pipeline: light the wire once, when it comes into view ---- */
  const pipeline = document.querySelector("[data-pipeline]");
  if (pipeline) {
    if (reduceMotion) {
      pipeline.classList.add("lit");
    } else {
      new IntersectionObserver((entries, obs) => {
        if (entries[0].isIntersecting) { obs.disconnect(); pipeline.classList.add("lit"); }
      }, { threshold: 0.6 }).observe(pipeline);
    }
  }

  /* ---- terminal: a real mrg session, typed once ---- */
  const term = document.getElementById("term-body");
  if (term) {
    const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
    const prompt = '<span class="term-dim">$</span> ';

    const lines = [
      { cmd: "pip install manhattan-reasoning-gym" },
      { cmd: "mrg login" },
      { cmd: "mrg run client_sdk.py" },
      { out: '<span class="term-dim">[mrg] queued...</span>' },
      { out: '<span class="term-dim">[mrg] building bitstream...</span>' },
      { out: '<span class="term-dim">[mrg] flashing the board...</span>' },
    ];

    function finalHtml(lines) {
      return lines
        .map((l) => (l.cmd ? prompt + esc(l.cmd) : l.out))
        .concat([prompt + '<span class="term-cursor"></span>'])
        .join("\n");
    }

    function play(lines) {
      if (reduceMotion) { term.innerHTML = finalHtml(lines); return; }
      const done = [];
      let i = 0, typed = 0;
      const timer = setInterval(() => {
        const line = lines[i];
        if (!line) {
          clearInterval(timer);
          term.innerHTML = finalHtml(lines);
          return;
        }
        if (line.cmd) {
          typed = Math.min(line.cmd.length, typed + 2);
          const partial = prompt + esc(line.cmd.slice(0, typed)) + '<span class="term-cursor"></span>';
          term.innerHTML = done.concat([partial]).join("\n");
          if (typed === line.cmd.length) { done.push(prompt + esc(line.cmd)); i++; typed = 0; }
        } else {
          done.push(line.out);
          term.innerHTML = done.join("\n");
          i++;
        }
      }, 55);
    }

    // type it once, when the terminal comes into view
    term.innerHTML = finalHtml(lines);
    new IntersectionObserver((entries, obs) => {
      if (!entries[0].isIntersecting) return;
      obs.disconnect();
      play(lines);
    }, { threshold: 0.4 }).observe(term);
  }

  /* ---- sidebar: mark the section in view ---- */
  const pageLinks = Array.from(document.querySelectorAll(".nav-page a"));
  const targets = pageLinks
    .map((a) => ({ a, el: document.querySelector(a.getAttribute("href")) }))
    .filter((t) => t.el);
  if (targets.length) {
    const mark = () => {
      const line = window.innerHeight * 0.35;
      let current = null;
      targets.forEach((t) => { if (t.el.getBoundingClientRect().top <= line) current = t; });
      targets.forEach((t) => {
        const on = t === current && current.el.getBoundingClientRect().bottom > line;
        t.a.classList.toggle("current", on);
        if (on) t.a.setAttribute("aria-current", "location");
        else t.a.removeAttribute("aria-current");
      });
    };
    window.addEventListener("scroll", mark, { passive: true });
    mark();
  }
})();
