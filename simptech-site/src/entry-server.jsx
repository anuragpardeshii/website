import { renderToString } from "react-dom/server";
import App, { routes, getRoute } from "./App";
export { routes, getRoute };
export function render(path) {
  return renderToString(<App path={path} />);
}
