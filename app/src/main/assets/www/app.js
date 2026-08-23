/* The GKS Hymn Book — client logic (vanilla JS, no dependencies) */
(function () {
  "use strict";

  var body      = document.body;
  var barTitle  = document.getElementById("barTitle");
  var backBtn   = document.getElementById("backBtn");
  var menuBtn   = document.getElementById("menuBtn");
  var store     = document.getElementById("store");
  var readerBody= document.getElementById("readerBody");
  var listEl    = document.getElementById("hymnList");
  var searchEl  = document.getElementById("search");
  var noResults = document.getElementById("noResults");
  var sheet     = document.getElementById("sheet");

  // Ordered list of hymn section ids (as they appear in the store)
  var sections = Array.prototype.map.call(
    store.querySelectorAll("section.hymn"),
    function (s) { return s.id; }               // e.g. "s_TSP1"
  );

  // ---- tiny persistence (safe if storage is unavailable) ----
  function load(k, d) { try { var v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } }
  function save(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  // ---- view switching ----
  var views = ["home", "preface", "list", "reader"];
  function show(view) {
    views.forEach(function (v) {
      document.getElementById(v).classList.toggle("active", v === view);
    });
    body.setAttribute("data-view", view);
    window.scrollTo(0, 0);
  }

  function openHome()    { barTitle.textContent = "The GKS Hymn Book"; show("home"); }
  function openPreface() { barTitle.textContent = "Preface"; show("preface"); }
  function openList()    { barTitle.textContent = "Hymns"; show("list"); }

  var currentIndex = -1;
  function openReaderById(sid) {
    var idx = sections.indexOf(sid);
    if (idx === -1) return;
    currentIndex = idx;
    var src = document.getElementById(sid);
    readerBody.innerHTML = src.innerHTML;
    barTitle.textContent = src.getAttribute("data-title") || "Hymn";
    document.getElementById("prevBtn").disabled = (idx === 0);
    document.getElementById("nextBtn").disabled = (idx === sections.length - 1);
    save("last", sid);
    show("reader");
  }
  function step(delta) {
    var n = currentIndex + delta;
    if (n >= 0 && n < sections.length) openReaderById(sections[n]);
  }

  // ---- list interactions ----
  listEl.addEventListener("click", function (e) {
    var row = e.target.closest(".row");
    if (row) openReaderById("s_" + row.getAttribute("data-target"));
  });

  // ---- search (number- or title-aware) ----
  var rows = Array.prototype.slice.call(listEl.querySelectorAll(".row"));
  var groups = Array.prototype.slice.call(listEl.querySelectorAll(".grp"));
  function runSearch() {
    var q = searchEl.value.trim().toLowerCase();
    var shown = 0;
    rows.forEach(function (r) {
      var hit = q === "" || r.getAttribute("data-search").indexOf(q) !== -1;
      r.style.display = hit ? "" : "none";
      if (hit) shown++;
    });
    // hide section headers while actively searching
    groups.forEach(function (g) { g.style.display = q ? "none" : ""; });
    noResults.hidden = shown !== 0;
  }
  searchEl.addEventListener("input", runSearch);

  // ---- settings: font size + theme ----
  var fs = parseInt(load("fs", "100"), 10);
  function applyFont() {
    document.documentElement.style.setProperty("--fs", (fs / 100) + "rem");
    document.getElementById("fVal").textContent = fs + "%";
    save("fs", String(fs));
  }
  document.getElementById("fPlus").onclick  = function () { fs = Math.min(160, fs + 10); applyFont(); };
  document.getElementById("fMinus").onclick = function () { fs = Math.max(80,  fs - 10); applyFont(); };

  var themeToggle = document.getElementById("themeToggle");
  function applyTheme(dark) {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    themeToggle.checked = dark;
    save("theme", dark ? "dark" : "light");
  }
  themeToggle.onchange = function () { applyTheme(themeToggle.checked); };

  function openSheet(o) { sheet.hidden = !o; }
  menuBtn.onclick = function () { openSheet(true); };
  document.getElementById("closeSheet").onclick = function () { openSheet(false); };
  sheet.addEventListener("click", function (e) { if (e.target === sheet) openSheet(false); });

  // ---- generic [data-go] buttons + pager + back ----
  document.addEventListener("click", function (e) {
    var g = e.target.closest("[data-go]");
    if (!g) return;
    var t = g.getAttribute("data-go");
    if (t === "list") openList();
    else if (t === "preface") openPreface();
    else if (t === "home") openHome();
  });
  document.getElementById("prevBtn").onclick = function () { step(-1); };
  document.getElementById("nextBtn").onclick = function () { step(1); };
  document.getElementById("idxBtn").onclick  = openList;

  backBtn.onclick = function () {
    var v = body.getAttribute("data-view");
    if (v === "reader") openList();
    else openHome();
  };

  // Hardware / gesture back button (Android) is wired from native via onBack()
  window.onBack = function () {
    if (!sheet.hidden) { openSheet(false); return true; }
    var v = body.getAttribute("data-view");
    if (v === "reader") { openList(); return true; }
    if (v === "list" || v === "preface") { openHome(); return true; }
    return false; // let the app exit
  };

  // ---- init ----
  applyFont();
  applyTheme(load("theme", "light") === "dark");
  openHome();
})();
