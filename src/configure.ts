import express, { Router } from "express";
import { COUNT_OPTIONS, configToPathSegment, DEFAULT_COUNT } from "./config";
import { login } from "./stremioApi";

export function createConfigureRouter(): Router {
  const router = express.Router();

  router.get("/configure", (_req, res) => {
    res.send(renderForm());
  });

  router.post("/configure", express.urlencoded({ extended: false }), async (req, res) => {
    const email = String(req.body.email ?? "").trim();
    const password = String(req.body.password ?? "");
    const count = Number(req.body.count);

    if (!email || !password) {
      res.status(400).send(renderForm("Email et mot de passe requis."));
      return;
    }

    try {
      const authKey = await login(email, password);
      const segment = configToPathSegment({
        authKey,
        count: COUNT_OPTIONS.includes(count) ? count : DEFAULT_COUNT,
      });
      const path = `${segment}/manifest.json`;
      res.send(renderInstalled(`stremio://${req.get("host")}/${path}`, `${req.protocol}://${req.get("host")}/${path}`));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Connexion impossible.";
      res.status(401).send(renderForm(message));
    }
  });

  return router;
}

function page(body: string): string {
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Random Library</title>
<style>
body { font-family: system-ui, sans-serif; max-width: 520px; margin: 40px auto; padding: 0 16px; background: #1b1b1f; color: #eee; }
label { display: block; }
input, select { width: 100%; padding: 10px; margin: 6px 0 14px; box-sizing: border-box; font-size: 16px; }
button, .button { display: inline-block; padding: 10px 16px; background: #7b5bf5; color: #fff; border: 0; border-radius: 6px; font-size: 16px; text-decoration: none; cursor: pointer; }
.error { color: #ff8a8a; }
code { display: block; word-break: break-all; background: #2a2a30; padding: 8px; border-radius: 6px; }
</style>
</head>
<body>
${body}
</body>
</html>`;
}

function renderForm(error?: string): string {
  const options = COUNT_OPTIONS.map(
    (count) => `<option value="${count}"${count === DEFAULT_COUNT ? " selected" : ""}>${count}</option>`,
  ).join("");

  return page(`<h1>Random Library</h1>
<p>Connecte-toi avec ton compte Stremio pour générer le lien d'installation. Le mot de passe n'est pas conservé.</p>
${error ? `<p class="error">${escapeHtml(error)}</p>` : ""}
<form method="post" action="/configure">
<label>Email<input type="email" name="email" required></label>
<label>Mot de passe<input type="password" name="password" required></label>
<label>Nombre d'éléments tirés<select name="count">${options}</select></label>
<button type="submit">Générer le lien</button>
</form>`);
}

function renderInstalled(stremioUrl: string, httpUrl: string): string {
  return page(`<h1>Addon prêt</h1>
<p><a class="button" href="${escapeHtml(stremioUrl)}">Installer dans Stremio</a></p>
<p>Ou colle ce lien dans Stremio (Addons, ajouter une source) :</p>
<code>${escapeHtml(httpUrl)}</code>
<p><a href="/configure">Retour</a></p>`);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
