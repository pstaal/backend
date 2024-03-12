const _ = require("lodash");

const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  return blogs.reduce((acc, val) => {
    return acc + val.likes;
  }, 0);
};

const favoriteBlog = (blogs) => {
  let blog = blogs.reduce(
    (acc, val) => {
      if (val.likes > acc.likes) {
        acc = val;
      }

      return acc;
    },
    { likes: -1 }
  );

  if (blog.likes === -1) {
    return null;
  }

  let { title, author, likes } = blog;
  return { title, author, likes };
};

const mostBlogs = (blogs) => {
  let result = _.last(
    _.sortBy(
      _.map(_.countBy(blogs, "author"), (val, key) => ({
        author: key,
        blogs: val,
      })),
      ["blogs"]
    )
  );

  return result !== undefined ? result : null;
};

const mostLikes = (blogs) => {
  let groups = _.groupBy(blogs, "author");
  let object = _.map(groups, (val, key) => {
    likes = val.reduce((acc, val) => acc + val.likes, 0);
    return { author: key, likes };
  });
  return _.last(_.sortBy(object, ["likes"]));
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
};
