import { test as base } from "@playwright/test";
import { RequestHandler } from "./request-handler";
import { APILogger } from "./logger";
import { setCustomExpectLogger } from "./customExpect";
import { config } from "../utils/apitest.config";
import { createToken } from "../helpers/createToken";

export type TestOptions = {
  api: RequestHandler;
  config: typeof config;
};

export type WorkerFixture = {
  authToken: string;
};

export const test = base.extend<TestOptions, WorkerFixture>({
  authToken: [
    async ({}, use) => {
      const authtoken = await createToken(
        config.userEmail,
        config.userPassword,
      );
      await use(authtoken);
    },
    { scope: "worker" },
  ],

  api: async ({ request, authToken }, use) => {
    const baseUrl = "https://conduit-api.bondaracademy.com/api";
    const logger = new APILogger();
    setCustomExpectLogger(logger);

    const requestHandler = new RequestHandler(request, config.apiUrl, logger, authToken);
    await use(requestHandler);
  },
  config: async ({}, use) => {
    await use(config);
  },
});
