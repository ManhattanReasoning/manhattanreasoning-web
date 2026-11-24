/* Home page: live board rack and status line, the build pipeline reveal, the
   terminal replay, and the sidebar's current-section marker.

   Board data comes from the public GET /fpga route (no sign-in). Only the
   board id and its state are used; nothing about who holds a board is shown.
   If the API can't be reached, the rack says so and draws nothing: no
   numbers are ever made up. */
(function () {
  "use strict";

  const API = "https://api.manhattanreasoning.com";
  const REFRESH_MS = 30000;
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- board states, in the words a visitor would use ---- */
  const STATES = {
    idle: { cls: "is-free", word: "Free" },
    reserved: { cls: "is-busy", word: "In use" },
    running: { cls: "is-busy", word: "In use" },
    programming: { cls: "is-flashing", word: "Flashing" },
  };
  const describe = (state) => STATES[state] || { cls: "is-off", word: "Unavailable" };

  const grid = document.querySelector("[data-rack-grid]");
  const summary = document.querySelector("[data-rack-summary]");
  const stamp = document.querySelector("[data-rack-time]");
  const status = document.querySelector("[data-live-status]");
  const statusText = document.querySelector("[data-live-status-text]");

  let boards = null;            // last good board list, for the terminal
  const onBoards = [];

  function renderRack(list) {
    if (!grid) return;
    grid.innerHTML = "";
    list.forEach((b) => {
      const d = describe(b.state);
      const li = document.createElement("li");
      li.className = `board ${d.cls}`;
      li.innerHTML =
        `<span class="led ${d.cls}" aria-hidden="true"></span>` +
        `<span class="chip" aria-hidden="true"></span>` +
        `<span class="board-id">fpga${Number(b.fpga_id)}</span>` +
        `<span class="board-state">${d.word}</span>`;
      grid.appendChild(li);
    });
    const free = list.filter((b) => b.state === "idle").length;
    summary.innerHTML =
      `${free} of ${list.length} boards free right now` +
      ` <span class="muted">(live)</span>`;
    const t = new Date();
    stamp.textContent = `Updated ${t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    if (status) {
      status.hidden = false;
      status.classList.remove("is-down");
      statusText.textContent = `${free} of ${list.length} boards free`;
    }
  }

  function renderUnavailable() {
    if (grid && !boards) grid.innerHTML = "";
    if (summary && !boards) summary.textContent = "Live board status is unavailable right now.";
    if (stamp && !boards) stamp.textContent = "";
    if (status) status.hidden = true;
  }

  async function refresh() {
    try {
      const res = await fetch(`${API}/fpga`, { credentials: "omit", cache: "no-store" });
      if (!res.ok) throw new Error(String(res.status));
      const list = await res.json();
      if (!Array.isArray(list)) throw new Error("unexpected shape");
      list.sort((a, b) => a.fpga_id - b.fpga_id);
      boards = list.map((b) => ({ fpga_id: b.fpga_id, state: String(b.state) }));
      renderRack(boards);
      onBoards.splice(0).forEach((fn) => fn(boards));
    } catch {
      renderUnavailable();
    }
  }

  if (grid || status) {
    refresh();
    // refresh only while the tab is visible
    setInterval(() => { if (!document.hidden) refresh(); }, REFRESH_MS);
    document.addEventListener("visibilitychange", () => { if (!document.hidden) refresh(); });
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

    function script(list) {
      const free = list && list.find((b) => b.state === "idle");
      const fpga = free ? `fpga${free.fpga_id}` : "fpga0";
      const lines = [
        { cmd: "pip install manhattan-reasoning-gym" },
        { cmd: "mrg login" },
        { cmd: "mrg run client_sdk.py" },
        { out: '<span class="term-dim">[mrg] queued...</span>' },
        { out: '<span class="term-dim">[mrg] building bitstream...</span>' },
        { out: `<span class="term-dim">[mrg] flashing ${fpga}...</span>` },
        { cmd: "mrg status" },
      ];
      if (list && list.length) {
        lines.push({ out: '<span class="term-head">  ID  STATE</span>' });
        list.forEach((b) => {
          lines.push({ out: `  ${String(b.fpga_id).padStart(2)}  ${esc(b.state)}` });
        });
        lines.push({ out: '<span class="term-dim">  (owner and timing columns trimmed)</span>' });
      }
      return lines;
    }

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

    // wait until the terminal is in view, and for the board list if it's coming
    new IntersectionObserver((entries, obs) => {
      if (!entries[0].isIntersecting) return;
      obs.disconnect();
      if (boards) play(script(boards));
      else {
        let started = false;
        const go = (list) => { if (!started) { started = true; play(script(list)); } };
        onBoards.push(go);
        setTimeout(() => go(boards), 1500);   // API slow or down: play without the table
      }
    }, { threshold: 0.4 }).observe(term);
    term.innerHTML = finalHtml(script(null));
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
