import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";
import { assertServerConfiguration } from "@/lib/db";

const handler = toNextJsHandler(auth);

function checkConfiguration() {
  assertServerConfiguration();
}

export const GET = (request: Request) => {
  checkConfiguration();
  return handler.GET(request);
};

export const POST = (request: Request) => {
  checkConfiguration();
  return handler.POST(request);
};
