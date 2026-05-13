import { createRoot } from "react-dom/client";
import { Switch, Route } from "wouter";
import { Analytics } from "@vercel/analytics/react";
import { Landing } from "./Landing";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <>
    <Switch>
      <Route path="/"     component={Landing} />
      <Route path="/play" component={App} />
      <Route>{() => { window.location.replace("/"); return null; }}</Route>
    </Switch>
    <Analytics />
  </>
);
