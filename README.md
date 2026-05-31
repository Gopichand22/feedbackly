# Feedbackly (prototype)

A tiny "feedback button" widget you can embed on any website, plus a dashboard
to read the feedback. Zero dependencies — pure Node.js.

## Run locally
```
node server.js
```
Then open:
- Dashboard: http://localhost:3000/  (set PORT to change, e.g. `PORT=4500 node server.js`)
- Demo site: http://localhost:3000/demo

## How a customer uses it
They paste ONE line into their website:
```html
<script src="https://YOUR-DOMAIN/widget.js" data-project="their-id"></script>
```

## Files
- `server.js`     — the web server + API (saves/reads feedback)
- `widget.js`     — the embeddable button customers paste into their site
- `dashboard.html`— where the owner reads feedback (auto-refreshes)
- `demo.html`     — a fake customer site to test the widget
- `data.json`     — the feedback store (created automatically)

## Deploy free (Render.com)
1. Push this folder to a GitHub repo.
2. On render.com: New > Web Service > connect the repo.
3. Build command: (leave empty)   Start command: `node server.js`
4. Render gives you a public URL. Done.

> Note: this prototype stores feedback in a file. On hosts with temporary disks
> (like Render free tier) data resets on redeploy. For production, swap `data.json`
> for a real database (Postgres via Supabase/Neon).
