import { test } from '../utils/fixtures';
import { expect } from '../utils/customExpect';
import { faker } from '@faker-js/faker';
import articleRequestPayload from '../request-objects/POST-article.json';

test('HAR Flow - Article Creation with Comments', async ({ api }) => {

  // Step 3: Create new article
  const articleTitle = faker.lorem.sentence(5);
  const articleDescription = faker.lorem.sentence(10);
  const articleBody = faker.lorem.paragraphs(2);
  
  const articleRequest = structuredClone(articleRequestPayload);
  articleRequest.article.title = articleTitle;
  articleRequest.article.description = articleDescription;
  articleRequest.article.body = articleBody;

  const createArticleResponse = await api
    .path('/articles')
    .body(articleRequest)
    .postRequest(201);
  await expect(createArticleResponse).shouldMatchSchema(
    'articles',
    'POST_articles'
  );
  expect(createArticleResponse.article.title).shouldEqual(articleTitle);
  expect(createArticleResponse.article.description).shouldEqual(articleDescription);
  
  const articleSlug = createArticleResponse.article.slug;
  expect(articleSlug).toBeDefined();

  // Step 4: Get the created article by slug
  const getArticleResponse = await api
    .path(`/articles/${articleSlug}`)
    .getRequest(200);
  await expect(getArticleResponse).shouldMatchSchema(
    'articles',
    'GET_articles'
  );
  expect(getArticleResponse.article.slug).shouldEqual(articleSlug);
  expect(getArticleResponse.article.title).shouldEqual(articleTitle);

  // Step 5: Get comments for the article
  const getCommentsResponse = await api
    .path(`/articles/${articleSlug}/comments`)
    .getRequest(200);
  await expect(getCommentsResponse).shouldMatchSchema(
    'articles',
    'GET_articles_comments',
  );
  expect(getCommentsResponse.comments).toBeDefined();

  // Step 6: Create a comment on the article
  const commentBody = faker.lorem.sentence(15);
  const commentRequest = {
    comment: {
      body: commentBody,
    },
  };

  const createCommentResponse = await api
    .path(`/articles/${articleSlug}/comments`)
    .body(commentRequest)
    .postRequest(200);
  await expect(createCommentResponse).shouldMatchSchema(
    'articles',
    'POST_articles_comments'
  );
  expect(createCommentResponse.comment.body).shouldEqual(commentBody);
  
  const commentId = createCommentResponse.comment.id;
  expect(commentId).toBeDefined();

  // Step 7: Verify the new comment appears in the comments list
  const updatedCommentsResponse = await api
    .path(`/articles/${articleSlug}/comments`)
    .getRequest(200);
  await expect(updatedCommentsResponse).shouldMatchSchema(
    'articles',
    'GET_articles_comments'
  );
  const commentExists = updatedCommentsResponse.comments.some(
    (c: any) => c.id === commentId && c.body === commentBody,
  );
  expect(commentExists).toBe(true);

  // Step 8: Get comments again to confirm the created comment persists
  const finalCommentsResponse = await api
    .path(`/articles/${articleSlug}/comments`)
    .getRequest(200);
  await expect(finalCommentsResponse).shouldMatchSchema(
    'articles',
    'GET_articles_comments'
  );
  expect(finalCommentsResponse.comments.length).toBeGreaterThan(0);
  const createdComment = finalCommentsResponse.comments.find(
    (c: any) => c.id === commentId,
  );
  expect(createdComment).toBeDefined();
  expect(createdComment.body).shouldEqual(commentBody);
});
