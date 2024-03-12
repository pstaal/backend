const blogRouter = require("express").Router();
const Blog = require("../models/blog");

blogRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({});
  response.json(blogs);
});

blogRouter.post("/", async (request, response) => {
  let body = request.body;
  if (!body.url || !body.title) {
    return response.status(400).end();
  }
  const blog = new Blog(body);

  const savedBlog = await blog.save();
  response.status(201).json(savedBlog);
});

module.exports = blogRouter;
