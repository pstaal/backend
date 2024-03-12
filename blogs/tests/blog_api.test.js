const { test, after, beforeEach } = require("node:test");
const assert = require("node:assert");
const mongoose = require("mongoose");
const helper = require("./test_helper");
const supertest = require("supertest");
const app = require("../app");

const api = supertest(app);

const Blog = require("../models/blog");

beforeEach(async () => {
  await Blog.deleteMany({});

  const blogObjects = helper.initialBlogs.map((blog) => new Blog(blog));
  const promiseArray = blogObjects.map((blog) => blog.save());
  await Promise.all(promiseArray);
});

test("blogs are returned as json", async () => {
  await api
    .get("/api/blogs")
    .expect(200)
    .expect("Content-Type", /application\/json/);
});

test("all blogs are returned", async () => {
  const response = await api.get("/api/blogs");

  assert.strictEqual(response.body.length, helper.initialBlogs.length);
});

test("the returned blogs contain unique identifier 'id'", async () => {
  const response = await api.get("/api/blogs");

  assert(response.body.every((item) => item.hasOwnProperty("id")));
});

test("a new blog can be added", async () => {
  const newBlog = {
    title: "Nieuwe blog",
    author: "Peter Staal",
    url: "http://www.google.com",
    likes: 14,
  };

  await api
    .post("/api/blogs")
    .send(newBlog)
    .expect(201)
    .expect("Content-Type", /application\/json/);

  const blogsAtEnd = await helper.blogsInDb();
  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1);

  const contents = blogsAtEnd.map((b) => b.title);
  assert(contents.includes("Nieuwe blog"));
});

test("the likes propery defaults to 0 when omitted in post request", async () => {
  const likesBlog = {
    title: "Likes test",
    author: "Peter Staal",
    url: "http://www.google.com",
  };

  let savedBlog = await api.post("/api/blogs").send(likesBlog);
  assert.strictEqual(savedBlog.body.likes, 0);
});

test("when title propery is omitted we get 400 status", async () => {
  const withoutTitleBlog = {
    author: "Peter Staal",
    url: "http://www.google.com",
  };

  await api.post("/api/blogs").send(withoutTitleBlog).expect(400);
});

test("when url propery is omitted we get 400 status", async () => {
  const withoutUrlBlog = {
    title: "No url",
    author: "Peter Staal",
  };

  await api.post("/api/blogs").send(withoutUrlBlog).expect(400);
});

after(async () => {
  await mongoose.connection.close();
});
