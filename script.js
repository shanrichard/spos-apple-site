const revealItems = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  },
  { threshold: 0.18 }
);

revealItems.forEach((item) => revealObserver.observe(item));

const canvas = document.getElementById("ambientCanvas");
const ctx = canvas.getContext("2d");
const points = [];
let width = 0;
let height = 0;
let animationId = 0;

function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function seedPoints() {
  points.length = 0;
  const count = Math.max(34, Math.floor(width / 38));
  for (let index = 0; index < count; index += 1) {
    points.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      r: 1 + Math.random() * 1.4,
    });
  }
}

function drawAmbient() {
  ctx.clearRect(0, 0, width, height);
  const isDark = window.scrollY < 980 || window.scrollY > 3600;
  ctx.strokeStyle = isDark ? "rgba(22, 200, 230, 0.14)" : "rgba(47, 125, 255, 0.08)";
  ctx.fillStyle = isDark ? "rgba(255, 255, 255, 0.28)" : "rgba(0, 0, 0, 0.16)";

  for (let i = 0; i < points.length; i += 1) {
    const point = points[i];
    point.x += point.vx;
    point.y += point.vy;

    if (point.x < -20) point.x = width + 20;
    if (point.x > width + 20) point.x = -20;
    if (point.y < -20) point.y = height + 20;
    if (point.y > height + 20) point.y = -20;

    ctx.beginPath();
    ctx.arc(point.x, point.y, point.r, 0, Math.PI * 2);
    ctx.fill();

    for (let j = i + 1; j < points.length; j += 1) {
      const other = points[j];
      const dx = point.x - other.x;
      const dy = point.y - other.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 120) {
        ctx.globalAlpha = 1 - distance / 120;
        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
        ctx.lineTo(other.x, other.y);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }
  }

  animationId = requestAnimationFrame(drawAmbient);
}

function refreshCanvas() {
  cancelAnimationFrame(animationId);
  resizeCanvas();
  seedPoints();
  drawAmbient();
}

refreshCanvas();
window.addEventListener("resize", refreshCanvas);

const pages = Array.from(document.querySelectorAll(".site-page"));
const pageLinks = Array.from(document.querySelectorAll("[data-page-link]"));
const pageNames = new Set(pages.map((page) => page.dataset.page));

function setActivePage(pageName, shouldScroll = true, targetSelector = "") {
  const nextPage = pageNames.has(pageName) ? pageName : "signalplusos";

  pages.forEach((page) => {
    page.classList.toggle("is-active", page.dataset.page === nextPage);
  });

  pageLinks.forEach((link) => {
    link.classList.toggle("active", link.dataset.pageLink === nextPage);
  });

  const activePage = document.querySelector(`.site-page[data-page="${nextPage}"]`);
  activePage?.querySelectorAll(".reveal").forEach((item) => {
    item.classList.add("is-visible");
  });

  if (targetSelector) {
    requestAnimationFrame(() => {
      const target = document.querySelector(targetSelector);
      if (target && target.closest(".site-page.is-active")) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  } else if (shouldScroll) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function readPageFromHash() {
  return window.location.hash.replace("#", "");
}

setActivePage(readPageFromHash(), false);

window.addEventListener("hashchange", () => {
  const hashValue = readPageFromHash();
  if (pageNames.has(hashValue)) {
    setActivePage(hashValue);
  }
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const hashValue = link.getAttribute("href").replace("#", "");

    if (pageNames.has(hashValue)) {
      event.preventDefault();
      const targetSelector = link.dataset.targetSection || "";
      if (targetSelector) {
        history.pushState(null, "", `#${hashValue}`);
        setActivePage(hashValue, true, targetSelector);
        return;
      }
      if (window.location.hash === `#${hashValue}`) {
        setActivePage(hashValue);
      } else {
        window.location.hash = hashValue;
      }
      return;
    }

    const target = document.querySelector(link.getAttribute("href"));
    if (!target || !target.closest(".site-page.is-active")) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

const dataFamilyStrips = Array.from(document.querySelectorAll(".data-family-strip"));

dataFamilyStrips.forEach((strip) => {
  const fieldRow = strip.querySelector("p");
  if (fieldRow && !fieldRow.dataset.chipsReady) {
    const fields = fieldRow.textContent
      .split("·")
      .map((field) => field.trim())
      .filter(Boolean);
    fieldRow.replaceChildren(
      ...fields.map((field) => {
        const chip = document.createElement("span");
        chip.textContent = field;
        return chip;
      })
    );
    fieldRow.dataset.chipsReady = "true";
  }
});

document.documentElement.lang = "zh-CN";
document.body.dataset.language = "zh";

const metaDescription = document.querySelector("meta[name=\"description\"]");
document.title = "SignalPlusOS.ai - AI Agent 时代的云端计算生态";
if (metaDescription) {
  metaDescription.setAttribute(
    "content",
    "SignalPlusOS.ai 是 AI Agent 时代的云端计算生态：云端设备、SignalPlusOS、开发工具、系统接口、SignalDB 与 App 市场，在同一个可信环境里同时出现。"
  );
}

document.querySelector(".language-switch")?.setAttribute("hidden", "");
try {
  localStorage.setItem("signalplusos-language", "zh");
} catch {
  // Local file previews can block storage in some environments.
}
