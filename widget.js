// Feedbackly widget — paste this into ANY website:
//   <script src="https://YOUR-DOMAIN/widget.js" data-project="their-project-id"></script>
//
// Uses the Shadow DOM so the host site's CSS cannot leak in (and ours can't leak out).
// This keeps the widget looking identical on every site, light or dark theme.
(function () {
  var script = document.currentScript;
  var project = (script && script.getAttribute("data-project")) || "demo";
  // Talk back to wherever this script was served from.
  var API = (script && script.src ? script.src.replace(/\/widget\.js.*$/, "") : "");

  // 1) A host element + a sealed shadow root (this is the isolation).
  var host = document.createElement("div");
  host.id = "feedbackly-root";
  document.body.appendChild(host);
  var root = host.attachShadow({ mode: "open" });

  // 2) All styles live INSIDE the shadow root. ":host" resets inherited
  //    properties (color, font) so the page theme can't bleed in.
  var css =
    ":host{all:initial}" +
    "*{box-sizing:border-box;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif}" +
    ".btn{position:fixed;right:20px;bottom:20px;z-index:2147483647;background:#4f46e5;color:#fff;border:none;border-radius:999px;padding:12px 18px;font-size:14px;font-weight:600;cursor:pointer;box-shadow:0 6px 20px rgba(79,70,229,.4)}" +
    ".box{position:fixed;right:20px;bottom:74px;z-index:2147483647;width:300px;background:#ffffff;color:#111111;border-radius:14px;box-shadow:0 12px 40px rgba(0,0,0,.18);padding:16px;display:none}" +
    ".box h4{margin:0 0 10px;font-size:15px;color:#111111;font-weight:600}" +
    ".box textarea{width:100%;height:90px;border:1px solid #dddddd;border-radius:8px;padding:8px;font-size:14px;color:#111111;background:#ffffff;resize:none;outline:none}" +
    ".box textarea::placeholder{color:#9aa0a6}" +
    ".box .send{margin-top:10px;width:100%;background:#4f46e5;color:#fff;border:none;border-radius:8px;padding:10px;font-size:14px;font-weight:600;cursor:pointer}" +
    ".ok{color:#16a34a;font-weight:600;text-align:center;padding:10px 0}";

  var style = document.createElement("style");
  style.textContent = css;
  root.appendChild(style);

  // 3) Build the UI inside the shadow root.
  var btn = document.createElement("button");
  btn.className = "btn";
  btn.textContent = "💬 Feedback";

  var box = document.createElement("div");
  box.className = "box";
  box.innerHTML =
    '<h4>Send us feedback</h4>' +
    '<textarea class="msg" placeholder="What do you like? What is broken?"></textarea>' +
    '<button class="send">Send</button>';

  root.appendChild(btn);
  root.appendChild(box);

  btn.onclick = function () {
    box.style.display = box.style.display === "block" ? "none" : "block";
  };

  box.querySelector(".send").onclick = function () {
    var msg = box.querySelector(".msg").value;
    if (!msg.trim()) return;
    fetch(API + "/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project: project, message: msg, pageUrl: location.href }),
    })
      .then(function () {
        box.innerHTML = '<div class="ok">✅ Thank you! Feedback sent.</div>';
        setTimeout(function () {
          box.style.display = "none";
        }, 1500);
      })
      .catch(function () {
        alert("Could not send feedback. Try again.");
      });
  };
})();
