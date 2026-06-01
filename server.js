// Feedbackly — a feedback-widget SaaS prototype.
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
function json(res, status, obj) {
  send(res, status, JSON.stringify(obj), { "Content-Type": "application/json" });
}
function sendFile(res, file, type) {
  fs.readFile(path.join(__dirname, file), (err, data) => {
    if (err) return send(res, 404, "Not found");
    send(res, 200, data, { "Content-Type": type });
  });
}
function readBody(req) {
  return new Promise((resolve) => {
    let b = "";
    req.on("data", (c) => (b += c));
    req.on("end", () => {
      try {
        resolve(JSON.parse(b || "{}"));
      } catch {
        resolve({});
      }
    });
  });
}
const TYPES = ["idea", "bug", "praise", "other"];
function csvEscape(s) {
  s = String(s == null ? "" : s);
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const route = url.pathname;

  if (req.method === "OPTIONS") return send(res, 204, "");

  // 1) Create feedback (from the widget)
  if (route === "/api/feedback" && req.method === "POST") {
    const body = await readBody(req);
    const message = (body.message || "").trim();
    if (!message) return json(res, 400, { error: "Message required" });
    const data = loadData();
    const item = {
      id: Date.now().toString(36) + Math.floor(Math.random() * 1000),
      project: (body.project || "demo").trim(),
      type: TYPES.includes(body.type) ? body.type : "other",
      mood: Number(body.mood) >= 1 && Number(body.mood) <= 5 ? Number(body.mood) : null,
      email: (body.email || "").trim().slice(0, 200),
      message: message.slice(0, 1000),
      pageUrl: body.pageUrl || "",
      status: "new", // new | planned | done
      votes: 0,
      createdAt: new Date().toISOString(),
    };
    data.feedback.push(item);
    saveData(data);
    return json(res, 200, { ok: true, item });
  }

  // 2) List feedback for a project (dashboard)
  if (route === "/api/feedback" && req.method === "GET") {
    const project = url.searchParams.get("project") || "demo";
    const data = loadData();
    const items = data.feedback
      .filter((f) => f.project === project)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return json(res, 200, items);
  }

  // 3) Export feedback as CSV
  if (route === "/api/export" && req.method === "GET") {
    const project = url.searchParams.get("project") || "demo";
    const data = loadData();
    const items = data.feedback.filter((f) => f.project === project);
    const head = "date,type,mood,status,votes,email,message,pageUrl\n";
    const rows = items
      .map((f) =>
        [f.createdAt, f.type, f.mood || "", f.status, f.votes, f.email, f.message, f.pageUrl]
          .map(csvEscape)
          .join(",")
      )
      .join("\n");
    return send(res, 200, head + rows, {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${project}-feedback.csv"`,
    });
  }

  // 4) Update a feedback item: vote or change status
  if (route === "/api/update" && req.method === "POST") {
    const body = await readBody(req);
    const data = loadData();
    const item = data.feedback.find((f) => f.id === body.id);
    if (!item) return json(res, 404, { error: "Not found" });
    if (body.action === "vote") item.votes = (item.votes || 0) + 1;
    if (body.action === "status" && ["new", "planned", "done"].includes(body.status))
      item.status = body.status;
    saveData(data);
    return json(res, 200, { ok: true, item });
  }

  // 5) Delete a feedback item
  if (route === "/api/delete" && req.method === "POST") {
    const body = await readBody(req);
    const data = loadData();
    const before = data.feedback.length;
    data.feedback = data.feedback.filter((f) => f.id !== body.id);
    saveData(data);
    return json(res, 200, { ok: before !== data.feedback.length });
  }

  // 6) The embeddable widget script
  if (route === "/widget.js") return sendFile(res, "widget.js", "application/javascript");

  // 7) Pages
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
