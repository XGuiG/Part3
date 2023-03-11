const mongoose = require("mongoose");
const supertest = require("supertest");
const helper = require("./test_helper");
const app = require("../app");

const api = supertest(app);

const Blog = require("../models/blog");
const bcrypt = require("bcrypt");
const User = require("../models/user");

beforeEach(async () => {
  await Blog.deleteMany({});
  //使用Promise.all()等待所有承诺的解析，以幷行方式执行收到的承诺
  //const blogObjects = helper.initialBlogs.map((blog) => new Blog(blog));
  //const promiseArray = blogObjects.map((blog) => blog.save());
  //await Promise.all(promiseArray);

  //初始化数据库
  //let blogObject = new Blog(helper.initialBlogs[0]);
  //await blogObject.save();

  //blogObject = new Blog(helper.initialBlogs[1]);
  //await blogObject.save();
  for (let blog of helper.initialBlogs) {
    let blogObject = new Blog(blog);
    await blogObject.save();
  }
}, 100000);

describe("when there is initially some blogs saved", () => {
  test("blogs are returned as json", async () => {
    await api
      .get("/api/blogs")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  }, 100000);

  test("all blogs are returned", async () => {
    const response = await api.get("/api/blogs");

    expect(response.body).toHaveLength(helper.initialBlogs.length);
  }, 100000);

  test("whether the unique identifier attribute is named id", async () => {
    const response = await api.get("/api/blogs");
    const id = response.body.map((r) => r.id);

    expect(id).toBeDefined();
  }, 100000);
});

describe("addition if a new blog", () => {
  test("a valid blog can be added", async () => {
    const blogsAtStart = await helper.blogsInDB();
    const newBlog = {
      _id: "5a422aa71b54a676234d17f8",
      title: "Go To Statement Considered Harmful",
      author: "Edsger W. Dijkstra",
      url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
      likes: 5,
      __v: 0,
    };

    await api
      .post("/api/blogs")
      .set('Authorization','Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InJvb3QiLCJpZCI6IjY0MGMzNTA3MTY3MmQyNzViODk0MWU3NSIsImlhdCI6MTY3ODUzNjIxNn0.LW3OskLB_gE6kqcmXsKul8rZBB5s4DVjXV2aiEShFRo')
      .send(newBlog)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const blogsAtEnd = await helper.blogsInDB();
    expect(blogsAtEnd).toHaveLength(blogsAtStart.length + 1);

    const contents = blogsAtEnd.map((b) => b.title);
    expect(contents).toContain("Go To Statement Considered Harmful");
  }, 100000);

  test('fails with status 401 if without authorization', async () => {
    const blogsAtStart = await helper.blogsInDB();
    const newBlog = {
      _id: "5a422aa71b54a676234d17f8",
      title: "Go To Statement Considered Harmful",
      author: "Edsger W. Dijkstra",
      url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
      likes: 5,
      __v: 0,
    };

    await api
      .post("/api/blogs")
      .set('Authorization','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InJvb3QiLCJpZCI6IjY0MGMzNTA3MTY3MmQyNzViODk0MWU3NSIsImlhdCI6MTY3ODUzNjIxNn0.LW3OskLB_gE6kqcmXsKul8rZBB5s4DVjXV2aiEShFRm')
      .send(newBlog)
      .expect(401)
      .expect("Content-Type", /application\/json/);

    const blogsAtEnd = await helper.blogsInDB();
    expect(blogsAtEnd).toHaveLength(blogsAtStart.length);
  })

  test("blog without likes default 0", async () => {
    const newBlog = {
      _id: "5a422aa71b54a676234d17f8",
      title: "Go To Statement Considered Harmful",
      author: "Edsger W. Dijkstra",
      url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
      // likes: 5,
      __v: 0,
    };

    await api.post("/api/blogs").send(newBlog).expect(201);

    const response = await api.get("/api/blogs");
    expect(response.body[2].likes).toBe(0);
  }, 100000);

  test("blogs without title or url is not added", async () => {
    const nonTitleBlog = {
      _id: "5a422aa71b54a676234d17f8",
      author: "Edsger W. Dijkstra",
      url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
      likes: 5,
      __v: 0,
    };
    const nonUrlBlog = {
      _id: "5a422aa71b54a676234d17f8",
      title: "Go To Statement Considered Harmful",
      author: "Edsger W. Dijkstra",
      likes: 5,
      __v: 0,
    };

    await api.post("/api/blogs").send(nonTitleBlog).expect(400);
    await api.post("/api/blogs").send(nonUrlBlog).expect(400);

    const blogsAtEnd = await helper.blogsInDB();
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);
  }, 100000);
});

describe("deletion of a blog", () => {
  test("succeeds with status code 204 if id is valid", async () => {
    const blogsAtStart = await helper.blogsInDB();
    const blogToDelete = blogsAtStart[0];

    await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204);

    const blogsAtEnd = await helper.blogsInDB();
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1);

    const contents = blogsAtEnd.map((b) => b.title);
    expect(contents).not.toContain(blogToDelete.title);
  }, 100000);
});

describe("updatation of a blog", () => {
  test("succeeds with status code 200 if id is valid", async () => {
    const blogToUpdate = {
      _id: "5a422aa71b54a676234d17f8",
      title: "Canonical string reduction",
      author: "Edsger W. Dijkstra",
      url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
      likes: 12,
      __v: 0,
    };

    await api
      .put(`/api/blogs/${blogToUpdate._id}`)
      .send(blogToUpdate)
      .expect(200);

    const blogsAtEnd = await helper.blogsInDB();
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);
    const contents = blogsAtEnd.map((b) => b.title);
    expect(contents).toContain(blogToUpdate.title);
  });
});

describe("when there is initially one user in db", () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash("secret", 10);
    const user = new User({ username: "root", passwordHash });

    await user.save();
  });

  test("creation succeeds with a fresh username", async () => {
    const userAtStart = await helper.usersInDB();

    const newUser = {
      username: "bigjun",
      name: "small gui",
      password: "1234",
    };

    await api
      .post("/api/users")
      .send(newUser)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const userAtEnd = await helper.usersInDB();
    expect(userAtEnd).toHaveLength(userAtStart.length + 1);

    const contents = userAtEnd.map((u) => u.username);
    expect(contents).toContain(newUser.username);
  });

  test("creation fails with proper statuscode and message if username already taken", async () => {
    const userAtStart = await helper.usersInDB();

    const newUser = {
      username: "root",
      name: "Supertest",
      password: "salainen",
    };

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    expect(result.body.error).toContain("username must be unique");

    const userAtEnd = await helper.usersInDB();
    expect(userAtEnd).toHaveLength(userAtStart.length);
  });

  test('creation fails with proper statuscode and message if username or password is invalid', async () => {
    const userAtStart = await helper.usersInDB();

    const noUsernameUser = {
      username: "",
      name: "Supertest",
      password: "salainen",
    };

    const noPasswordUser = {
      username: "big jun",
      name: "Supertest",
      password: "",
    };

    const shorterUsernameUser = {
      username: "ro",
      name: "Supertest",
      password: "salainen",
    }

    const noUsernameresult = await api
      .post("/api/users")
      .send(noUsernameUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    expect(noUsernameresult.body.error).toContain("User validation failed: username: Path `username` is required.");

    const noPasswordresult = await api
      .post("/api/users")
      .send(noPasswordUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    expect(noPasswordresult.body.error).toContain("User validation failed: password is shorter than the minimum allowed length (3).");

    const shorterUsernameresult = await api
      .post("/api/users")
      .send(shorterUsernameUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    expect(shorterUsernameresult.body.error).toContain("User validation failed: username: Path `username` (`ro`) is shorter than the minimum allowed length (3).");

    const userAtEnd = await helper.usersInDB();
    expect(userAtEnd).toHaveLength(userAtStart.length);
  })
});

afterAll(async () => {
  await mongoose.connection.close();
});
