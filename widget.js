// Feedbackly widget — paste this into ANY website:
//   <script src="https://YOUR-DOMAIN/widget.js" data-project="their-project-id"></script>
//
// Uses the Shadow DOM so the host site's CSS cannot leak in (and ours can't leak out).
(function () {
  var script = document.currentScript;
  var project = (script && script.getAttribute("data-project")) || "demo";
  var API = (script && script.src ? script.src.replace(/\/widget\.js.*$/, "") : "");

  var host = document.createElement("div");
  host.id = "feedbackly-root";
  document.body.appendChild(host);
  var root = host.attachShadow({ mode: "open" });

  var css =
    ":host{all:initial}" +
    "*{box-sizing:border-box;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif}" +
    ".btn{position:fixed;right:22px;bottom:22px;z-index:2147483647;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;border-radius:999px;padding:13px 20px;font-size:14px;font-weight:600;cursor:pointer;box-shadow:0 8px 30px rgba(99,102,241,.5);display:flex;align-items:center;gap:8px;transition:transform .2s}" +
    ".btn:hover{transform:translateY(-2px) scale(1.03)}" +
    ".box{position:fixed;right:22px;bottom:80px;z-index:2147483647;width:320px;background:rgba(255,255,255,.85);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);color:#0f172a;border-radius:20px;box-shadow:0 20px 60px rgba(15,23,42,.25);padding:20px;display:none;border:1px solid rgba(255,255,255,.6);animation:pop .25s ease}" +
    "@keyframes pop{from{opacity:0;transform:translateY(10px) scale(.96)}to{opacity:1;transform:none}}" +
    ".box h4{margin:0 0 4px;font-size:16px;font-weight:700}" +
    ".box .hint{margin:0 0 14px;font-size:12px;color:#64748b}" +
    ".types{display:flex;gap:6px;margin-bottom:12px}" +
    ".type{flex:1;border:1px solid #e2e8f0;background:#fff;border-radius:10px;padding:7px 0;font-size:12px;font-weight:600;cursor:pointer;color:#475569;transition:.15s;display:flex;flex-direction:column;align-items:center;gap:2px}" +
    ".type.active{border-color:#6366f1;background:#eef2ff;color:#4338ca}" +
    ".type .emo{font-size:16px}" +
    ".box textarea{width:100%;height:84px;border:1px solid #e2e8f0;border-radius:12px;padding:10px;font-size:14px;color:#0f172a;background:#fff;resize:none;outline:none}" +
    ".box textarea:focus{border-color:#6366f1;box-shadow:0 0 0 3px rgba(99,102,241,.15)}" +
    ".box input{width:100%;margin-top:8px;border:1px solid #e2e8f0;border-radius:12px;padding:10px;font-size:13px;color:#0f172a;background:#fff;outline:none}" +
    ".box input:focus{border-color:#6366f1;box-shadow:0 0 0 3px rgba(99,102,241,.15)}" +
    ".mood{display:flex;justify-content:space-between;margin:12px 2px 4px}" +
    ".mood span{font-size:24px;cursor:pointer;filter:grayscale(1) opacity(.5);transition:.15s}" +
    ".mood span:hover,.mood span.on{filter:none;transform:scale(1.2)}" +
    ".send{margin-top:14px;width:100%;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;border-radius:12px;padding:11px;font-size:14px;font-weight:700;cursor:pointer;transition:.15s}" +
    ".send:hover{opacity:.92}" +
    ".ok{text-align:center;padding:24px 0}.ok .big{font-size:40px}.ok .t{font-weight:700;margin-top:8px}" +
    ".brand{text-align:center;margin-top:12px;font-size:11px;color:#94a3b8}";

  var style = document.createElement("style");
  style.textContent = css;
  root.appendChild(style);

  var btn = document.createElement("button");
  btn.className = "btn";
  btn.innerHTML = "<span>💬</span> Feedback";

  var box = document.createElement("div");
  box.className = "box";
  box.innerHTML =
    '<h4>Share your thoughts</h4>' +
    '<p class="hint">We read every message. ✨</p>' +
    '<div class="types">' +
    '<div class="type active" data-type="idea"><span class="emo">💡</span>Idea</div>' +
    '<div class="type" data-type="bug"><span class="emo">🐞</span>Bug</div>' +
    '<div class="type" data-type="praise"><span class="emo">❤️</span>Love</div>' +
    '<div class="type" data-type="other"><span class="emo">💬</span>Other</div>' +
    '</div>' +
    '<textarea class="msg" placeholder="What is on your mind?"></textarea>' +
    '<input class="email" type="email" placeholder="Email (optional, to follow up)" />' +
    '<div class="mood">' +
    '<span data-m="1">😡</span><span data-m="2">🙁</span><span data-m="3">😐</span><span data-m="4">🙂</span><span data-m="5">😍</span>' +
    '</div>' +
    '<button class="send">Send feedback</button>' +
    '<div class="brand">Powered by Feedbackly</div>';

  root.appendChild(btn);
  root.appendChild(box);

  var chosenType = "idea";
  var chosenMood = null;

  btn.onclick = function () {
    box.style.display = box.style.display === "block" ? "none" : "block";
  };

  root.querySelectorAll(".type").forEach(function (t) {
    t.onclick = function () {
      root.querySelectorAll(".type").forEach((x) => x.classList.remove("active"));
      t.classList.add("active");
      chosenType = t.getAttribute("data-type");
    };
  });

  root.querySelectorAll(".mood span").forEach(function (m) {
    m.onclick = function () {
      chosenMood = Number(m.getAttribute("data-m"));
      root.querySelectorAll(".mood span").forEach((x) => x.classList.remove("on"));
      m.classList.add("on");
    };
  });

  box.querySelector(".send").onclick = function () {
    var msg = box.querySelector(".msg").value;
    var email = box.querySelector(".email").value;
    if (!msg.trim()) return;
    fetch(API + "/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project: project,
        type: chosenType,
        mood: chosenMood,
        email: email,
        message: msg,
        pageUrl: location.href,
      }),
    })
      .then(function () {
        box.innerHTML =
          '<div class="ok"><div class="big">🎉</div><div class="t">Thank you!</div>' +
          '<div class="hint" style="margin-top:6px">Your feedback was sent.</div></div>';
        setTimeout(function () {
          box.style.display = "none";
        }, 1800);
      })
      .catch(function () {
        alert("Could not send feedback. Try again.");
      });
  };
})();
