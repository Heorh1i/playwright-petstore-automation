import { test } from "../utils/fixtures";
import { expect } from "../utils/customExpect";
import { APILogger } from "../utils/logger";
import { createToken } from "../helpers/createToken";
import { validateSchema } from "../utils/schemaValidator";
import articleRequestPayload from "../request-objects/POST-article.json";
import { faker } from "@faker-js/faker";
import { getNewRandomArticle } from "../utils/data-generator";


test("Get Articles", async ({ api }) => {
  const response = await api

    .path("/articles")
    .params({ limit: 12, offset: 0 })
    .getRequest(200);
  await expect(response).shouldMatchSchema("articles", "GET_articles");
// expect(response.articles.length).shouldBeLessThanOrEqual(10);
//   expect(response.articlesCount).shouldEqual(10);
});

test("Get tags", async ({ api }) => {
  const response = await api.path("/tags").getRequest(200);
  await expect(response).shouldMatchSchema("tags", "GET_tags");
  expect(response.tags[0]).toEqual("Test");
  expect(response.tags.length).toBeLessThanOrEqual(10);
});

test("Create and delete article", async ({ api }) => {
  // articleRequestPayload.article.title = "Create and delete article"
  const articleRequest = getNewRandomArticle();
  const createArticleResponse = await api
    .path("/articles")
    .body(articleRequest)
    .postRequest(201);

  await expect(createArticleResponse).shouldMatchSchema(
    "articles",
    "POST_articles"
  );

  expect(createArticleResponse.article.title).shouldEqual(
    articleRequest.article.title,
  );
  const slug = createArticleResponse.article.slug;

  const articlesResponse = await api
    .path("/articles")
    .params({ limit: 10, offset: 0 })
    .getRequest(200);

  expect(articlesResponse.articles[0].title).shouldEqual(articleRequest.article.title);

  await expect(articlesResponse).shouldMatchSchema("articles", "GET_articles");

  const deleteArticleResponse = await api
    .path(`/articles/${slug}`)
    .deleteRequest(204);

  const articlesResponseTwo = await api
    .path("/articles")
    .params({ limit: 10, offset: 0 })
    .getRequest(200);
  await expect(articlesResponseTwo).shouldMatchSchema("articles", "GET_articles");

  expect(articlesResponseTwo.articles[0].title).not.toEqual(articleRequest.article.title);

});

test("Create, update and delete article", async ({ api }) => {
  const articleTitle = faker.lorem.sentence(10);
  const articleRequest = JSON.parse(JSON.stringify(articleRequestPayload));
  articleRequest.article.title = articleTitle;

  const createArticleResponse = await api
    .path("/articles")
    .body(articleRequest)
    .postRequest(201);

  expect(createArticleResponse.article.title).shouldEqual(articleTitle);

  await expect(createArticleResponse).shouldMatchSchema("articles", "POST_articles");

  const articletitleTwo = faker.lorem.sentence(10);
  articleRequest.article.title = articletitleTwo;
  const slug = createArticleResponse.article.slug;

  const updateArticleResponse = await api
    .path(`/articles/${slug}`)
    .body(articleRequest)
    .putRequest(200);

  expect(updateArticleResponse.article.title).shouldEqual(articletitleTwo);
  await expect(updateArticleResponse).shouldMatchSchema("articles", "PUT_articles");

  const updatedSlug = updateArticleResponse.article.slug;

  const deleteArticleResponse = await api
    .path(`/articles/${updatedSlug}`)
    .deleteRequest(204);

  const articlesResponseTwo = await api
    .path("/articles")
    .params({ limit: 10, offset: 0 })
    .getRequest(200);
  await expect(articlesResponseTwo).shouldMatchSchema("articles", "GET_articles");

  expect(articlesResponseTwo.articles[0].title).not.toEqual(articletitleTwo);
});

