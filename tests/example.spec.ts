import { test, expect } from "@playwright/test";




let authtoken: string;
test.beforeAll("get auth token", async ({ request }) => {
  const tokenResponse = await request.post(
    "https://conduit-api.bondaracademy.com/api/users/login",
    {
      data: {
        user: { email: "", password: "" },
      },
    },
  );
  const tokenResponseJson = await tokenResponse.json();
  authtoken = "Token " + tokenResponseJson.user.token;
}); 


test.beforeAll("get auth token", async ({ request }) => {
  const tokenResponse = await request.post(
    "https://conduit-api.bondaracademy.com/api/users/login",
    {
      data: {
        "user": { "email": "", "password": "" },
      },
    },
  );
  const tokenResponseJson = await tokenResponse.json();
  authtoken = "Token " + tokenResponseJson.user.token;
});

test("get test tags", async ({ request }) => {
  const tagsResponse = await request.get(
    "https://conduit-api.bondaracademy.com/api/tags",
  );
  const tagsResponseJSON = await tagsResponse.json();

  expect(tagsResponse.status()).toEqual(200);
  expect(tagsResponseJSON.tags[0]).toEqual("Test");
  expect(tagsResponseJSON.tags.length).toBeLessThanOrEqual(10);
});

// I need you to create a test which just creates an article.
// test("Create new article", async ({ request }) => {
//   const articleResponse = await request.post(
//     "https://conduit-api.bondaracademy.com/api/articles",
//     {
//       data: {
//         article: {
//           title: "New title for commenting",
//           description: "comment",
//           body: "comment",
//           tagList: [],
//         },
//       },
//       headers: {
//         Authorization: authtoken,
//       },
//     },
//   );
//   const articleResponseJSON = await articleResponse.json();
//   const slugID = articleResponseJSON.article.slug;

//   expect(articleResponse.status()).toEqual(201);
//   expect(articleResponseJSON.article.title).toEqual("New title for commenting");
// });

test("get test articles", async ({ request }) => {
  const articlesResponse = await request.get(
    "https://conduit-api.bondaracademy.com/api/articles",
  );
  const articleResponseJSON = await articlesResponse.json();

  expect(articlesResponse.status()).toEqual(200);
  expect(articleResponseJSON.articles.length).toEqual(10);
  expect(articleResponseJSON.articlesCount).toEqual(10);

  // console.log(articleResponseJSON)
});

test("Create and delete an article", async ({ request }) => {
  const newArticleresponse = await request.post(
    "https://conduit-api.bondaracademy.com/api/articles",
    {
      data: {
        article: {
          title: "Title to delete",
          description: "auto 1",
          body: "auto 1",
          tagList: [],
        },
      },
      headers: {
        Authorization: authtoken,
      },
    },
  );
  const newArticleresponseJson = await newArticleresponse.json();
  console.log(newArticleresponseJson);
  expect(newArticleresponse.status()).toEqual(201);
  expect(newArticleresponseJson.article.title).toEqual("Title to delete");

  const slug = newArticleresponseJson.article.slug;

  const articlesResponse = await request.get(
    "https://conduit-api.bondaracademy.com/api/articles",
    {
      headers: {
        Authorization: authtoken,
      },
    },
  );
  const articleResponseJSON = await articlesResponse.json();

  expect(articlesResponse.status()).toEqual(200);
  expect(articleResponseJSON.articles[0].title).toEqual("Title to delete");

  const deleteArticleResponse = await request.delete(
    `https://conduit-api.bondaracademy.com/api/articles/${slug}`,
    {
      headers: {
        Authorization: authtoken,
      },
    },
  );
  expect(deleteArticleResponse.status()).toEqual(204);
});

test("Create, update and delete an article", async ({ request }) => {
  // Create an article

  const newArticleresponse = await request.post(
    "https://conduit-api.bondaracademy.com/api/articles/",
    {
      data: {
        article: {
          title: "Title to update",
          description: "auto 1",
          body: "auto 1",
          tagList: [],
        },
      },
      headers: {
        Authorization: authtoken,
      },
    },
  );
  const newArticleresponseJson = await newArticleresponse.json();

  expect(newArticleresponse.status()).toEqual(201);
  expect(newArticleresponseJson.article.title).toEqual("Title to update");

  const slug = newArticleresponseJson.article.slug;

  // Update an article
  const updateArticleResponse = await request.put(
    `https://conduit-api.bondaracademy.com/api/articles/${slug}`,
    {
      data: {
        article: {
          title: "Title is updated",
          description: "auto 1",
          body: "auto 1",
          tagList: [],
        },
      },
      headers: {
        Authorization: authtoken,
      },
    },
  );
  const updateArticleResponseJson = await updateArticleResponse.json();

  expect(updateArticleResponse.status()).toEqual(200);
  expect(updateArticleResponseJson.article.title).toEqual("Title is updated");
  console.log(`The new title is ${updateArticleResponseJson.article.title}`);

  const updatedSlug = updateArticleResponseJson.article.slug;

  const deleteArticleResponse = await request.delete(
    `https://conduit-api.bondaracademy.com/api/articles/${updatedSlug}`,
    {
      headers: {
        Authorization: authtoken,
      },
    },
  );
  expect(deleteArticleResponse.status()).toEqual(204);
});

// test("Create new article", async ({ request }) => {
//   const articleResponse = await request.post(
//     "https://conduit-api.bondaracademy.com/api/articles",
//     {
//       data: {
//         article: {
//           title: "New title for commenting",
//           description: "comment",
//           body: "comment",
//           tagList: [],
//         },
//       },
//       headers: {
//         Authorization: authtoken,
//       },
//     },
//   );
//   const articleResponseJSON = await articleResponse.json();
//   const slugID = articleResponseJSON.article.slug;

//   expect(articleResponse.status()).toEqual(201);
//   expect(articleResponseJSON.article.title).toEqual("New title for commenting");

//   const newCommentResponse = await request.post(
//     `https://conduit-api.bondaracademy.com/api/articles/${slugID}/comments`,
//     {
//       data: { comment: { body: "Here is comment" } },
//       headers: {
//         Authorization: authtoken,
//       },
//     },
//   );
//   const newCommentResponseJSON = await newCommentResponse.json();

//   expect(newCommentResponse.status()).toEqual(200);
//   expect(newCommentResponseJSON.comment.body).toEqual("Here is comment");
// });
