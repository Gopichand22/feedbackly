// Feedbackly — a tiny "feedback widget" SaaS prototype.
// Zero dependencies: uses only Node.js built-in modules so it runs anywhere.
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "data.json");

// ---- Tiny JSON "database" (a file). Fine for a prototype. ----
function loadData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch {
    return { feedback: [] };
  }
}
function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// ---- Helpers ----
function send(res, status, body, headers = {}) {
  res.writeHead(status, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    ...headers,
  });
  res.end(body);
}
function sendFile(res, file, type) {
  fs.readFile(path.join(__dirname, file), (err, data) => {
    if (err) return send(res, 404, "Not found");
    send(res, 200, data, { "Content-Type": type });
  });
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const route = url.pathname;

  // CORS preflight (the widget runs on other websites)
  if (req.method === "OPTIONS") return send(res, 204, "");

  // 1) Save a piece of feedback (called by the widget)
  if (route === "/api/feedback" && req.method === "POST") {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      try {
        const { project, message, pageUrl } = JSON.parse(body || "{}");
        if (!message || !message.trim())
          return send(res, 400, JSON.stringify({ error: "Message required" }), {
            "Content-Type": "application/json",
          });
        const data = loadData();
        data.feedback.push({
          id: Date.now().toString(36) + Math.floor(Math.random() * 1000),
          project: (project || "demo").trim(),
          message: message.trim().slice(0, 1000),
          pageUrl: pageUrl || "",
          createdAt: new Date().toISOString(),
        });
        saveData(data);
        send(res, 200, JSON.stringify({ ok: true }), {
          "Content-Type": "application/json",
        });
      } catch {
        send(res, 400, JSON.stringify({ error: "Bad request" }), {
          "Content-Type": "application/json",
        });
      }
    });
    return;
  }

  // 2) Read feedback for one project (called by the dashboard)
  if (route === "/api/feedback" && req.method === "GET") {
    const project = url.searchParams.get("project") || "demo";
    const data = loadData();
    const items = data.feedback
      .filter((f) => f.project === project)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return send(res, 200, JSON.stringify(items), {
      "Content-Type": "application/json",
    });
  }

  // 3) The embeddable widget script
  if (route === "/widget.js") return sendFile(res, "widget.js", "application/javascript");

  // 4) Pages
  if (route === "/") return sendFile(res, "landing.html", "text/html");
  if (route === "/dashboard") return sendFile(res, "dashboard.html", "text/html");
  if (route === "/demo") return sendFile(res, "demo.html", "text/html");

  send(res, 404, "Not found");
});

server.listen(PORT, () => {
  console.log(`\n  Feedbackly running:`);
  console.log(`  Landing   : http://localhost:${PORT}/`);
  console.log(`  Dashboard : http://localhost:${PORT}/dashboard`);
  console.log(`  Demo site : http://localhost:${PORT}/demo\n`);
});
