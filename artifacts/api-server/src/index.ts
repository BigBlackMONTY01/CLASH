import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"] ?? "8080";
const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const isRender = !!process.env["RENDER"];
const env = isRender ? "Render" : process.env["NODE_ENV"] === "production" ? "production" : "development";

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  if (isRender) {
    logger.info({ port }, "Running on Render");
  } else {
    logger.info({ port }, "Running in development");
  }

  logger.info({ port, env }, "Server listening");
});
