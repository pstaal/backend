const { test, after, beforeEach } = require("node:test");
const assert = require("node:assert");
const mongoose = require("mongoose");
const helper = require("./test_helper");
const supertest = require("supertest");
const app = require("../app");
const bcrypt = require("bcrypt");

const api = supertest(app);

const Blog = require("../models/blog");
const User = require("../models/user");

beforeEach(async () => {
  await Blog.deleteMany({});

  const blogObjects = helper.initialBlogs.map((blog) => new Blog(blog));
  const promiseArray = blogObjects.map((blog) => blog.save());
  await Promise.all(promiseArray);

  await User.deleteMany({});

  const passwordHash = await bcrypt.hash("sekret", 10);
  const user = new User({ username: "root", name: "root", passwordHash });

  await user.save();
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

test("a blog can be deleted", async () => {
  const blogsAtStart = await helper.blogsInDb();
  const blogToDelete = blogsAtStart[0];

  await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204);

  const blogsAtEnd = await helper.blogsInDb();

  const contents = blogsAtEnd.map((r) => r.id);
  assert(!contents.includes(blogToDelete.id));

  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1);
});

test("the number of likes of a blog can be updated", async () => {
  const blogsAtStart = await helper.blogsInDb();
  const blogToUpdate = blogsAtStart[0];
  let id = blogToUpdate.id;

  await api.put(`/api/blogs/${id}`).send({ likes: 100 }).expect(200);

  const blogsAtEnd = await helper.blogsInDb();
  const changedBlog = blogsAtEnd.find((blog) => blog.id === id);

  assert.strictEqual(changedBlog.likes, 100);
});

test("we can successfully retrieve users", async () => {
  const response = await api.get("/api/users").expect(200);

  assert.strictEqual(response.body[0].name, "root");
});

test("we cannot create a user when the password is too short", async () => {
  const user = {
    username: "tester",
    name: "tester",
    password: "ee",
  };

  await api.post("/api/users").send(user).expect(400);
});

test("we cannot create a user when the username already exists", async () => {
  const user = {
    username: "root",
    name: "tester",
    password: "testers",
  };

  await api.post("/api/users").send(user).expect(400);
});

test("we cannot create a user when the username is omitted", async () => {
  const user = {
    name: "tester",
    password: "testers",
  };

  await api.post("/api/users").send(user).expect(400);
});

test("we can create a user", async () => {
  const user = {
    name: "tester",
    username: "tester",
    password: "testers",
  };

  const response = await api.post("/api/users").send(user);
  assert.strictEqual(response.body.name, "tester");
});

after(async () => {
  await mongoose.connection.close();
});
