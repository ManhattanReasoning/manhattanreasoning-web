/* Research page: section rail, reading progress, figure zoom.
   js/main.js already handles the nav collapse, the mobile menu and the
   copy buttons; nothing here duplicates it. */
(function () {
  "use strict";

  /* ---- reading progress: how far through the article you are ---- */
  const bar = document.getElementById("progress");
  const article = document.querySelector(".prose");
  if (bar && article) {
    const update = () => {
      const start = article.offsetTop;
      const span = article.offsetHeight - window.innerHeight;
      const done = span > 0 ? (window.scrollY - start) / span : 0;
      bar.style.width = Math.min(100, Math.max(0, done * 100)) + "%";
    };
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  /* ---- rail: mark the section you are reading ---- */
  const links = Array.from(document.querySelectorAll(".rail a"));
  const targets = links
    .map((a) => ({ a, el: document.querySelector(a.getAttribute("href")) }))
    .filter((t) => t.el);

  if (targets.length) {
    const mark = () => {
      // the section whose top is highest above the reading line wins
      const line = window.scrollY + window.innerHeight * 0.28;
      let active = targets[0];
      targets.forEach((t) => {
        if (t.el.offsetTop <= line) active = t;
      });
      links.forEach((a) => a.classList.toggle("current", a === active.a));
    };
    window.addEventListener("scroll", mark, { passive: true });
    window.addEventListener("resize", mark);
    mark();
  }

  /* ---- figure zoom: these charts are dense enough to need a closer look ---- */
  const box = document.getElementById("lightbox");
  const boxImg = document.getElementById("lightbox-img");
  if (box && boxImg) {
    let lastFocus = null;

    const open = (img) => {
      lastFocus = document.activeElement;
      boxImg.src = img.getAttribute("src");
      boxImg.alt = img.getAttribute("alt") || "";
      box.classList.add("open");
      document.body.style.overflow = "hidden";
      box.querySelector(".lightbox-close").focus();
    };

    const close = () => {
      box.classList.remove("open");
      boxImg.src = "";
      document.body.style.overflow = "";
      if (lastFocus) lastFocus.focus();
    };

    document.querySelectorAll(".plate.zoomable .plate-body").forEach((body) => {
      const img = body.querySelector("img");
      if (!img) return;
      body.addEventListener("click", () => open(img));
      body.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open(img);
        }
      });
    });

    box.querySelector(".lightbox-close").addEventListener("click", close);
    box.addEventListener("click", (e) => {
      if (e.target === box || e.target === boxImg) close();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && box.classList.contains("open")) close();
    });
  }
})();
