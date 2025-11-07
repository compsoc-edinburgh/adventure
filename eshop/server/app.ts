import { createRequestHandler } from "@react-router/express";
import express from "express";
import { runMigrations } from "../src/sqlite.server";
import "react-router";

declare module "react-router" {
  // eslint-disable-next-line no-unused-vars
  interface AppLoadContext {
    VALUE_FROM_EXPRESS: string;
  }
}

export const app = express();

runMigrations();

app.use(
  createRequestHandler({
    // eslint-disable-next-line import/no-unresolved
    build: () => import("virtual:react-router/server-build"),
    getLoadContext() {
      return {
        VALUE_FROM_EXPRESS: "Hello from Express",
      };
    },
  }),
);
