const Comment = require("../models/comment");
const Blog = require("../models/blog");
const router = require("express").Router();

router.post("/:id", async (request, response) => {
  const blog = await Blog.findById(request.params.id);
  if (!blog) {
    return response.status(404).json({ error: "could not find this blog" });
  }

  const newComment = {
    title: request.body.title,
    blog: request.params.id,
  };

  const comment = new Comment(newComment);

  blog.comments = blog.comments.concat(comment.id);

  await blog.save();

  const savedComment = await comment.save();

  response.status(201).json(savedComment);
});

module.exports = router;
