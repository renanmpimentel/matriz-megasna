import { generateGames } from "./generator-core.js";

self.onmessage = ({ data }) => {
  try {
    self.postMessage({ type: "result", result: generateGames(data) });
  } catch {
    self.postMessage({ type: "error" });
  }
};
