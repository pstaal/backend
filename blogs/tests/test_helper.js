const Blog = require("../models/blog");
const User = require("../models/user");

const initialBlogs = [
  {
    title: "Blog 1",
    author: "Peter Staal",
    url: "http://www.google.com",
    likes: 4,
  },
  {
    title: "Blog 2",
    author: "Peter Staal",
    url: "http://www.google.com",
    likes: 12,
  },
];

const nonExistingId = async () => {
  const blog = new Blog({
    title: "Fake",
    author: "Peter Staal",
    url: "http://www.google.com",
    likes: 1,
  });
  await blog.save();
  await blog.deleteOne();

  return blog._id.toString();
};

const blogsInDb = async () => {
  const blogs = await Blog.find({});
  return blogs.map((blog) => blog.toJSON());
};

const usersInDb = async () => {
  const users = await User.find({});
  return users.map((u) => u.toJSON());
};

module.exports = {
  initialBlogs,
  nonExistingId,
  blogsInDb,
  usersInDb,
};
