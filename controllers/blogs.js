const blogsRouter = require("express").Router();
const Blog = require("../models/blog");
const middleware = require("../utils/middleware");

blogsRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({}).populate("user", { username: 1, name: 1 });
  response.json(blogs);
});

blogsRouter.post("/", middleware.userExtractor, async (request, response) => {
  const body = request.body;
  const user = request.user;

  const blog = new Blog({
    url: body.url,
    title: body.title,
    author: body.author,
    user: user._id,
    likes: body.likes ? body.likes : 0,
  });

  let savedBlog = await blog.save();
  user.blogs = user.blogs.concat(savedBlog._id);
  await user.save();
  savedBlog = await Blog.findById(savedBlog._id).populate("user", { username: 1, name: 1 })
  console.log(savedBlog)
  response.status(201).json(savedBlog);
});

blogsRouter.delete("/:id", middleware.userExtractor, async (request, response) => {
  const blogid = request.params.id;
  console.log(blogid)
  const blog = await Blog.findById(blogid);

  if (!blog) {
    return response.status(204).end()
  }

  const userid = request.user.id;

  if (!(blog.user.toString() === userid.toString())) {
    return response.status(401).json({
      error: "a blog can be deleted only by the user who added the blog",
    });
  }

  await Blog.findByIdAndRemove(blogid);
  response.status(204).end();
});

blogsRouter.put("/:id", middleware.userExtractor, async (request, response) => {
  // const { title, author, url, likes } = request.body;

  // const existingId = await Blog.findById(request.params.id);
  // if (!existingId) {
  //   return response.status(404).end();
  // }

  const updatedBlog = await Blog.findByIdAndUpdate(
    request.params.id,
    {$inc: {likes: 1}},
    { new: true, runValidators: true, context: "query" }
  );
  response.json(updatedBlog);
});

module.exports = blogsRouter;
