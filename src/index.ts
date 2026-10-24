import express from "express";
import { getRouter } from "stremio-addon-sdk";
import { createAddonInterface } from "./addon";
import { createConfigureRouter } from "./configure";

const PORT = Number(process.env.PORT ?? 7000);

const app = express();
app.set("trust proxy", 1);

app.get("/", (_req, res) => {
  res.redirect("/configure");
});
app.use(createConfigureRouter());
app.use(getRouter(createAddonInterface()));

app.listen(PORT, () => {
  console.log(`Random Library: http://localhost:${PORT}/configure`);
});
