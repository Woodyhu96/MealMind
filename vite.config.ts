import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { generateOnlineDinnerDishesFromOpenAi } from "./src/utils/openAiDinnerApi.ts";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react(),
      {
        name: "mealmind-online-dinner-api",
        configureServer(server) {
          server.middlewares.use("/api/online-dinner", async (req, res) => {
            if (req.method !== "POST") {
              res.statusCode = 405;
              res.end("Method not allowed");
              return;
            }

            try {
              const body = await readRequestBody(req);
              const apiKey = env.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
              const model = env.OPENAI_MODEL || process.env.OPENAI_MODEL || "gpt-4o-mini";

              if (!apiKey) {
                res.statusCode = 503;
                res.end("Missing OPENAI_API_KEY in local .env");
                return;
              }

              const dishes = await generateOnlineDinnerDishesFromOpenAi(JSON.parse(body), apiKey, model);
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify(dishes));
            } catch (error) {
              res.statusCode = 500;
              res.end(error instanceof Error ? error.message : "Online dinner generation failed");
            }
          });
        },
      },
    ],
    // For GitHub Pages project sites, update this to "/your-repository-name/".
    // For a user or organization site, keep it as "/".
    base: "/MealMind/",
  };
});

function readRequestBody(req: { on: (event: string, callback: (chunk?: Buffer) => void) => void }) {
  return new Promise<string>((resolve, reject) => {
    const chunks: Buffer[] = [];

    req.on("data", (chunk?: Buffer) => {
      if (chunk) {
        chunks.push(chunk);
      }
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", () => reject(new Error("Failed to read request body")));
  });
}
