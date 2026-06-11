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

const pageMeta = {
  zh: {
    title: "SignalPlusOS.ai - 交易 Agent 时代的云端计算生态",
    description:
      "SignalPlusOS.ai 是交易 Agent 时代的云端计算生态：Compute Unit、SignalPlusOS Kernel、AI-built Apps、Marketplace 与机构级数据执行基础设施。",
  },
  en: {
    title: "SignalPlusOS.ai - The cloud computing ecosystem for trading agents",
    description:
      "SignalPlusOS.ai brings together Compute Unit, SignalPlusOS Kernel, AI-built Apps, Marketplace, and institutional-grade data and execution infrastructure for the age of trading agents.",
  },
};

const englishCopy = {
  "设备": "Devices",
  "操作系统": "Operating System",
  "开发工具": "Developer Tools",
  "App 市场": "App Marketplace",
  "申请 Alpha": "Apply for Alpha",
  "交易 Agent 时代的云端计算生态。": "A cloud computing ecosystem for the age of trading agents.",
  "云端交易电脑、SignalPlusOS Kernel、AI-built Apps、Marketplace、数据与执行基础设施，在同一个可信环境里同时出现。":
    "Cloud trading computers, SignalPlusOS Kernel, AI-built Apps, Marketplace, and data and execution infrastructure. All in one trusted environment.",
  "浏览生态": "Explore the ecosystem",
  "开始配置": "Start configuring",
  "产品宇宙": "Product Universe",
  "全系生态，细细看。": "A closer look at the whole ecosystem.",
  "SignalPlusOS.ai 不是单个产品，而是一套围绕交易 Agent 运行起来的产品家族。":
    "SignalPlusOS.ai is not a single product. It is a family of products built around trading agents.",
  "SignalPlusOS.ai 由开发设备、运行设备、操作系统、数据底座、模型能力和 App 市场组成。":
    "SignalPlusOS.ai brings together development devices, runtime devices, an operating system, a data foundation, model capabilities, and an app marketplace.",
  "云端开发室。调研、构建、测试和打包交易 App。":
    "A cloud development room for researching, building, testing, and packaging trading apps.",
  "你的云端交易电脑，靠近市场，全天运行。":
    "Your cloud trading computer. Close to markets. Always on.",
  "云端运行设备。24/7 运行已安装的交易 App。":
    "A cloud runtime device for running installed trading apps 24/7.",
  "统一管理数据、执行、权限、密钥、风控和审计。":
    "Data, execution, permissions, keys, risk, and audit. Managed as one system.",
  "交易操作系统内核。统一管理权限、密钥、执行和风控。":
    "The trading operating-system kernel. Permissions, keys, execution, and risk controls, managed together.",
  "把自然语言交易工作流变成完整金融 App。":
    "Turn natural-language trading workflows into complete financial apps.",
  "让每台 CU 独立调用 OpenAI、Claude、Gemini 等 LLM API。":
    "Let every CU call OpenAI, Claude, Gemini, and other LLM APIs independently.",
  "接入金融数据，并写成可回放的交易时间线。":
    "Connect financial data and write it into a replayable trading timeline.",
  "策略、终端、风控、PMS、EMS、新闻与链上监控。":
    "Strategies, terminals, risk, PMS, EMS, news, and on-chain monitoring.",
  "发现、安装、Fork、发布，并让贡献回流。":
    "Discover, install, fork, publish, and let value flow back to contributors.",
  "发现、安装、Fork、发布和收益回流。":
    "Discover, install, fork, publish, and let value flow back.",
  "机构级数据、执行连接、QuantLab 与底层服务。":
    "Institutional-grade data, execution connectivity, QuantLab, and core services.",
  "让 AI 大胆创造，别让真实交易承担试错。":
    "Let AI create freely. Keep real trading protected.",
  "DevPod 是云端开发空间，适合联网、调试、安装 Coding Agents 和 skills；Compute Unit 是生产运行环境，负责密钥、权限、交易执行、风控和审计。App 在 DevPod 里开发和测试，准备好后再安装到 CU 中安全运行。创造可以自由，真实交易必须安全。":
    "DevPod is a cloud development space for networking, debugging, Coding Agents, and skills. Compute Unit is the production runtime for keys, permissions, execution, risk controls, and audit. Build and test in DevPod. Install to CU when the app is ready. Creation can be open. Real trading must stay protected.",
  "看看哪台 CU 适合你的交易 Agent。": "Find the CU that fits your trading agent.",
  "这不是 SaaS 套餐。它是一台云端交易设备，承载你的 AI-built Apps、数据连接、执行参数和审计状态。":
    "This is not a SaaS plan. It is a cloud trading device for your AI-built Apps, data connections, execution parameters, and audit state.",
  "个人策略与轻量监控。": "Personal strategies and lightweight monitoring.",
  "区域": "Region",
  "运行": "Apps",
  "数据": "Data",
  "跨市场 Agent 与组合工具。": "Cross-market agents and portfolio tools.",
  "网络": "Network",
  "高频数据、复杂风控与多账户。": "High-frequency data, advanced risk, and multi-account workflows.",
  "算力": "Compute",
  "存储": "Storage",
  "机构团队、白标与专用运行环境。": "Institutional teams, white-label use, and dedicated runtime environments.",
  "隔离": "Isolation",
  "执行": "Execution",
  "支持": "Support",
  "云端交易算力": "Cloud Trading Compute",
  "全员疾速派。为 24/7 Agent 而生。": "Built for speed. Made for 24/7 agents.",
  "交易 Agent 需要稳定、持续、贴近市场的算力。普通手机、电脑、本地脚本和通用云服务器，都不是为这种工作负载设计的。":
    "Trading agents need compute that is stable, persistent, and close to the market. Phones, laptops, local scripts, and generic cloud servers were not designed for this workload.",
  "下一代交易设备，不在手里，在云端。":
    "The next trading device is not in your hand. It is in the cloud.",
  "手机、电脑、眼镜，都只是进入 Compute Unit 的方式。真正运行的是云端，真正保持一致的是 SignalPlusOS：无论你从哪里打开，连接的都是同一个安全运行环境。":
    "Phone, computer, glasses. They are all ways into Compute Unit. The real runtime is in the cloud, and SignalPlusOS keeps it consistent wherever you open it.",
  "手机入口": "Phone portal",
  "电脑入口": "Computer portal",
  "眼镜入口": "Glasses portal",
  "App 的生命在云端，所有屏幕只是入口。换设备，不换环境；关掉屏幕，运行不停。":
    "The app lives in the cloud. Every screen is just a way in. Change devices without changing environments. Turn off the screen and the runtime keeps going.",
  "设备之上，是交易操作系统。": "Above the device, a trading operating system.",
  "App 可以自由创造，但数据、执行、权限、密钥、风控、状态和审计，都由 SignalPlusOS 授权与管理。":
    "Apps can be freely created. Data, execution, permissions, keys, risk, state, and audit are authorized and managed by SignalPlusOS.",
  "让每台 CU，都能调用超多 LLM API": "Give every CU access to many LLM APIs.",
  "SignalPlusOS.ai 把 OpenAI、Claude、Gemini 主流模型接入为系统能力。开发者创建 App 时，可以调用不同模型能力；用户安装 App 后，也可以在自己的 CU 中选择模型运行。模型调用不会集中压在开发者身上，而是随着每个用户、每个 App、每个运行事件，在各自 CU 中独立计量。":
    "SignalPlusOS.ai brings OpenAI, Claude, Gemini, and other leading models into the system layer. Developers can call different model capabilities when building apps. Users can choose models inside their own CU after installation. Model usage is not concentrated on the developer; it is metered independently by user, app, and runtime event.",
  "主流 LLM API，系统级接入": "Leading LLM APIs, integrated at the system level.",
  "OpenAI、Claude、Gemini 等模型能力，被接入 SignalPlusOS 的系统层。开发者创建 App 时，不需要逐家开通模型平台、管理 API Key 或适配不同接口。":
    "OpenAI, Claude, Gemini, and more are built into the SignalPlusOS system layer. Developers do not need to open every model platform, manage API keys, or adapt each interface.",
  "同一个 App，多种模型跑法": "One app. Many ways to run models.",
  "同一个 App 安装到不同用户的 CU 后，可以调用不同模型运行。开发者不用为每个模型维护不同版本，用户也不用被开发者预设的模型绑定。":
    "The same app can call different models on different users' CUs. Developers do not maintain separate versions for each model, and users are not locked to the model a developer chose.",
  "每台 CU，独立调用与计量": "Every CU calls and meters independently.",
  "App 运行时的模型调用，不会集中消耗开发者的 API Key。每个用户的 CU 都有自己的模型运行环境，调用、计量和成本归属各自独立。":
    "Model calls made at runtime do not drain the developer's API key. Each user's CU has its own model runtime, with independent calls, metering, and cost ownership.",
  "把整个金融世界，接成 App 可以调用的系统接口。":
    "Turn the financial world into system interfaces apps can call.",
  "SignalPlusOS Runtime 通过 API Gateway 接入多资产行情、衍生品、期权、预测市场、DeFi、宏观经济、上市公司披露、能源、链上 TVL、LLM 推理与资讯等 typed data surface。App 不需要自己联网，也不需要逐个接数据源；它只需要向 SignalPlusOS 请求标准化、权限化、可审计的数据能力。":
    "SignalPlusOS Runtime connects multi-asset markets, derivatives, options, prediction markets, DeFi, macroeconomics, public-company filings, energy, on-chain TVL, LLM reasoning, and news into a typed data surface through API Gateway. Apps do not connect to the internet or integrate data source by source. They ask SignalPlusOS for standardized, permissioned, auditable data capabilities.",
  "数据不再散落在外部 API 里": "Data no longer lives scattered across external APIs.",
  "行情、账户、订单、期权、DeFi、宏观、披露、链上和资讯数据，都被 API Gateway 接成统一的系统能力。App 不需要自己联网去找数据源。":
    "Market data, accounts, orders, options, DeFi, macro, filings, on-chain data, and news are connected through API Gateway as unified system capabilities. Apps do not go online to find data sources themselves.",
  "每种数据，都有类型和边界": "Every kind of data has a type and a boundary.",
  "ticker、order book、option chain、funding rate、positions、TVL、XBRL、macro series、LLM responses 等能力，都以 typed interface 暴露给 App，并受权限和风控约束。":
    "ticker, order book, option chain, funding rate, positions, TVL, XBRL, macro series, LLM responses, and more are exposed to apps as typed interfaces, governed by permissions and risk controls.",
  "开发者只关心要什么数据": "Developers ask for what they need.",
  "App 只需要向 SignalPlusOS 请求数据和能力，不需要处理不同市场、不同协议、不同格式、不同实时流的接入细节。交易相关基建由操作系统统一完成。":
    "Apps ask SignalPlusOS for data and capabilities. They do not handle the integration details of different markets, protocols, formats, or realtime streams. Trading infrastructure is handled by the operating system.",
  "央行统计 · policy rates · balance sheets · IMF / OECD / World Bank series · country metadata":
    "central bank statistics · policy rates · balance sheets · IMF / OECD / World Bank series · country metadata",
  "央行统计": "central bank statistics",
  "API Gateway 把金融世界接进来，SignalDB 把它们写成交易时间线。":
    "API Gateway brings the financial world in. SignalDB writes it into a trading timeline.",
  "每台 CU，都有自己的交易记忆。": "Every CU has its own trading memory.",
  "SignalDB 是 SignalPlusOS 内置的金融时序数据库，专门为交易运行环境设计。行情、订单、成交、仓位、风险状态、Agent 决策和 App 事件，都可以按时间被写入、查询和回放。交易不是一张静态表，而是一条不断变化的时间线；SignalDB 让每个 App 都能站在这条时间线上工作。":
    "SignalDB is the financial time-series database built into SignalPlusOS, designed for trading runtime environments. Market data, orders, fills, positions, risk states, agent decisions, and app events can be written, queried, and replayed over time. Trading is not a static table. It is a living timeline. SignalDB lets every app work on that timeline.",
  "为交易时间线而生": "Built for trading timelines.",
  "交易数据天然是时序数据：ticker、order book、K 线、funding、Greeks、订单、成交、仓位和风险状态，都在时间中连续变化。SignalDB 为这些金融时间线而设计。":
    "Trading data is naturally time-series data. Ticker, order book, candles, funding, Greeks, orders, fills, positions, and risk states all change continuously over time. SignalDB is designed for these financial timelines.",
  "App 不只看现在，也能回看过去": "Apps can see now, and look back.",
  "App 可以查询历史行情、回放订单与成交、追踪风险状态变化，也可以把 Agent 的判断和运行事件写入同一条时间线，形成可分析、可解释、可复盘的运行记录。":
    "Apps can query historical markets, replay orders and fills, trace risk state changes, and write agent decisions and runtime events into the same timeline, creating records that can be analyzed, explained, and reviewed.",
  "回测、复盘共用同一层数据": "Backtesting and review share the same data layer.",
  "策略测试需要历史数据，风险解释需要状态变化。SignalDB 把这些时间序列沉到 SignalPlusOS 底层，让 App 不用各自重建数据仓库。":
    "Strategy testing needs historical data. Risk explanation needs state changes. SignalDB places these time series at the foundation of SignalPlusOS, so apps do not rebuild their own data warehouses.",
  "AI 生成 App 不是壁垒。真正的壁垒在底层。":
    "AI-generated apps are not the moat. The foundation is.",
  "Gateway、机构级数据、执行连接、QuantLab、风控、审计和贴近交易所的算力，是交易 Agent 无法自己补齐的基础设施。":
    "Gateway, institutional-grade data, execution connectivity, QuantLab, risk controls, audit, and market-adjacent compute are infrastructure trading agents cannot create for themselves.",
  "安全不是功能，是系统级设计。": "Security is not a feature. It is a system design.",
  "不是凭空出现的 AI 概念，而是多年交易基础设施演进后的下一步。":
    "Not an AI concept from nowhere. The next step in years of trading infrastructure.",
  "一间为交易 App 准备好的云端开发室。":
    "A cloud development room made for trading apps.",
  "DevPod 是 SignalPlusOS.ai 为交易 App 准备的云端开发空间。Codex、Claude Code、SignalPlusOS 自有 Coding Agent、开发 skills、联网测试、Gateway 数据、权限规则、风控边界和 Marketplace 打包上下文，都在这里准备好。你在 DevPod 里调研、构建、测试和打包，完成后再安装到 CU 中安全运行。":
    "DevPod is the cloud development space SignalPlusOS.ai prepares for trading apps. Codex, Claude Code, the SignalPlusOS Coding Agent, development skills, network testing, Gateway data, permission rules, risk boundaries, and Marketplace packaging context are all ready here. Research, build, test, and package in DevPod. Then install to CU to run safely.",
  "把交易想法，交给适配过的 Coding Agents。":
    "Give trading ideas to Coding Agents built for the job.",
  "SignalPlusOS.ai 支持 Codex、Claude Code，也提供面向交易场景调校的自有 Coding Agent。它们运行在 DevPod 这个云端开发空间里，不只是写代码，而是理解 SignalPlusOS 的数据、执行、权限、风控和 CU 部署方式，把一个模糊的交易想法拆解成可运行、可安装、可发布的完整 App。":
    "SignalPlusOS.ai supports Codex and Claude Code, and provides its own Coding Agent tuned for trading scenarios. Running inside DevPod, they do more than write code. They understand SignalPlusOS data, execution, permissions, risk controls, and CU deployment, turning a rough trading idea into a complete app that can run, install, and publish.",
  "先做需求调研，再开始开发": "Research the need before building.",
  "SignalPlusOS 自有 Coding Agent 可以先帮你拆解需求：这个 App 要解决什么问题、需要哪些数据、适合什么界面、有哪些风控边界、需要哪些权限，以及最终如何部署到 CU。":
    "The SignalPlusOS Coding Agent can first break down the need: what the app should solve, what data it needs, what interface fits, what risk boundaries apply, what permissions are required, and how it will deploy to CU.",
  "Codex、Claude Code，接入 SignalPlusOS 开发环境":
    "Codex and Claude Code, connected to the SignalPlusOS development environment.",
  "SignalPlusOS.ai 支持 Codex 和 Claude Code，并为它们提供适配过的交易开发上下文：Gateway 数据、执行接口、权限规则、审计要求、CU 部署配置和 Marketplace 打包方式。":
    "SignalPlusOS.ai supports Codex and Claude Code, giving them trading-aware development context: Gateway data, execution interfaces, permission rules, audit requirements, CU deployment config, and Marketplace packaging.",
  "生成的不是代码片段，是完整 App": "Not a code snippet. A complete app.",
  "Coding Agent 输出的不只是策略逻辑，还包括界面、参数配置、数据连接、执行路径、风控规则、审计链路和部署文件。App 可以直接安装到用户的 Compute Unit 中运行。":
    "A Coding Agent outputs more than strategy logic. It includes interface, parameters, data connections, execution paths, risk rules, audit flow, and deployment files. The app can be installed directly into a user's Compute Unit.",
  "一句话到 App": "From one sentence to an app.",
  "一个自然语言动作，触发完整产品生成。":
    "One natural-language action can start a complete product build.",
  "做一个 BTC 资金费率套利策略，两腿任一失败就回滚。":
    "Build a BTC funding-rate arbitrage strategy. Roll back if either leg fails.",
  "正在生成界面、策略逻辑、风控参数、执行连接和审计链路。":
    "Generating interface, strategy logic, risk parameters, execution connection, and audit flow.",
  "App 让生态活起来。": "Apps bring the ecosystem to life.",
  "策略只是开始。数据终端、风控、期权分析、事件对冲、组合管理，都可以成为 App。":
    "Strategies are just the beginning. Data terminals, risk tools, options analytics, event hedging, and portfolio management can all become apps.",
  "好 App 会流动，也会回报创造者。":
    "Great apps move through the ecosystem, and reward their creators.",
  "发现、安装、Fork、发布。收益沿贡献链回流，而运行始终发生在用户自己的 Compute Unit。":
    "Discover, install, fork, and publish. Value flows back through the contribution chain, while execution always happens in the user's own Compute Unit.",
  "安装不是下载。是部署到你的 CU。": "Installation is not a download. It is deployment to your CU.",
  "App 可以流通，但权限、风险、版本和审计边界必须先被系统确认。":
    "Apps can circulate. Permissions, risk, version, and audit boundaries must be confirmed by the system first.",
  "开始构建你的云端交易系统。": "Start building your cloud trading system.",
  "选择 Compute Unit，申请 Alpha，创建、安装或发布你的第一个 SignalPlusOS App。":
    "Choose a Compute Unit, apply for Alpha, and create, install, or publish your first SignalPlusOS app.",
  "选择 CU Ultra": "Choose CU Ultra",
  "我是交易者": "I am a trader",
  "我是量化 / 开发者": "I am a quant / developer",
  "我是创作者": "I am a creator",
  "我代表机构": "I represent an institution",
};

const originalTextNodes = new WeakMap();
const languageButtons = Array.from(document.querySelectorAll("[data-language-option]"));
const metaDescription = document.querySelector('meta[name="description"]');

function preserveSpacing(source, replacement) {
  const leading = source.match(/^\s*/)?.[0] || "";
  const trailing = source.match(/\s*$/)?.[0] || "";
  return `${leading}${replacement}${trailing}`;
}

function applyLanguage(language) {
  const nextLanguage = language === "en" ? "en" : "zh";
  document.documentElement.lang = nextLanguage === "en" ? "en" : "zh-CN";
  document.body.dataset.language = nextLanguage;
  document.title = pageMeta[nextLanguage].title;
  if (metaDescription) {
    metaDescription.setAttribute("content", pageMeta[nextLanguage].description);
  }

  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        const parentElement = node.parentElement;
        if (!parentElement || parentElement.closest("script, style")) {
          return NodeFilter.FILTER_REJECT;
        }
        if (!node.nodeValue.trim()) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    }
  );

  const textNodes = [];
  while (walker.nextNode()) {
    textNodes.push(walker.currentNode);
  }

  textNodes.forEach((node) => {
    if (!originalTextNodes.has(node)) {
      originalTextNodes.set(node, node.nodeValue);
    }
    const source = originalTextNodes.get(node);
    const sourceText = source.trim();
    const translated = englishCopy[sourceText];
    node.nodeValue =
      nextLanguage === "en" && translated ? preserveSpacing(source, translated) : source;
  });

  languageButtons.forEach((button) => {
    const isActive = button.dataset.languageOption === nextLanguage;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  try {
    localStorage.setItem("signalplusos-language", nextLanguage);
  } catch {
    // Local file previews can block storage in some environments.
  }
}

languageButtons.forEach((button) => {
  button.addEventListener("click", () => {
    applyLanguage(button.dataset.languageOption);
  });
});

let savedLanguage = "zh";
try {
  savedLanguage = localStorage.getItem("signalplusos-language") || "zh";
} catch {
  savedLanguage = "zh";
}
applyLanguage(savedLanguage);
