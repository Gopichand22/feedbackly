// Feedbackly widget — this is the file your CUSTOMERS paste into their website.
// Usage on any site:
//   <script src="https://YOURDOMAIN/widget.js" data-project="their-project-id"></script>
(function () {
  var script = document.currentScript;
  var project = (script && script.getAttribute("data-project")) || "demo";
  // The widget talks back to wherever it was served from.
  var API = (script && script.src ? script.src.replace(/\/widget\.js.*$/, "") : "");

  var css =
    "#fbly-btn{position:fixed;right:20px;bottom:20px;z-index:99999;background:#4f46e5;color:#fff;border:none;border-radius:999px;padding:12px 18px;font:600 14px system-ui,sans-serif;cursor:pointer;box-shadow:0 6px 20px rgba(79,70,229,.4)}" +
    "#fbly-box{position:fixed;right:20px;bottom:74px;z-index:99999;width:300px;background:#fff;border-radius:14px;box-shadow:0 12px 40px rgba(0,0,0,.18);padding:16px;font:14px system-ui,sans-serif;display:none}" +
    "#fbly-box h4{margin:0 0 10px;font-size:15px;color:#111}" +
    "#fbly-box textarea{width:100%;box-sizing:border-box;height:90px;border:1px solid #ddd;border-radius:8px;padding:8px;font:14px system-ui,sans-serif;resize:none}" +
    "#fbly-box button{margin-top:10px;width:100%;background:#4f46e5;color:#fff;border:none;border-radius:8px;padding:10px;font:600 14px system-ui;cursor:pointer}" +
    "#fbly-ok{color:#16a34a;font-weight:600;text-align:center;padding:10px 0}";

  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  var btn = document.createElement("button");
  btn.id = "fbly-btn";
  btn.textContent = "💬 Feedback";

  var box = document.createElement("div");
  box.id = "fbly-box";
  box.innerHTML =
    '<h4>Send us feedback</h4>' +
    '<textarea id="fbly-msg" placeholder="What do you like? What is broken?"></textarea>' +
    '<button id="fbly-send">Send</button>';

  document.body.appendChild(btn);
  document.body.appendChild(box);

  btn.onclick = function () {
    box.style.display = box.style.display === "block" ? "none" : "block";
  };

  box.querySelector("#fbly-send").onclick = function () {
    var msg = box.querySelector("#fbly-msg").value;
    if (!msg.trim()) return;
    fetch(API + "/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project: project, message: msg, pageUrl: location.href }),
    })
      .then(function () {
        box.innerHTML = '<div id="fbly-ok">✅ Thank you! Feedback sent.</div>';
        setTimeout(function () {
          box.style.display = "none";
        }, 1500);
      })
      .catch(function () {
        alert("Could not send feedback. Try again.");
      });
  };
})();
