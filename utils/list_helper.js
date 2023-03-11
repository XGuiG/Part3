var _ = require("lodash");

const dummy = (blogs) => {
  return 1;
};

const totallikes = (blogs) => {
  return blogs.length === 0
    ? 0
    : blogs.reduce((sum, blog) => blog.likes + sum, 0);
};

const favoriteBlog = (blogs) => {
  const like = blogs.map((blog) => blog.likes);
  const MaxIndex = (array) => {
    var max = array[0];
    var maxindex = 0;
    for (var i = 0; i < array.length; i++) {
      if (max < array[i]) {
        max = array[i];
        maxindex = i;
      }
    }
    return maxindex;
  };

  return blogs[MaxIndex(like)];
};

const mostBlogs = (blogs) => {
  // const author = blogs.map((blog) => blog.author);
  // let num = 1;
  // let max = 1;
  // let mostAuthor = null;

  // for (let i = 0; i < author.length; i++) {
  //   if (author[i] === author[i + 1]) {
  //     num = num + 1;
  //     if (max < num) {
  //       max = num;
  //       mostAuthor = author[i];
  //     }
  //   } else {
  //     num = 1;
  //   }
  // }

  // let dict={
  //   "bigjun":0
  // }
  // for (let blog of blogs){
  //   if (!dict.hasOwnProperty(blog.author)){
  //     dict[blog.author]=0
  //   }
  //   dict[blog.author]+=1
  // }
  let dict = _.countBy(blogs, (blog) => blog.author);
  let max = 0;
  let mostAuthor = "";
  for (let author in dict) {
    if (dict[author] > max) {
      mostAuthor = author;
      max = dict[author];
    }
  }

  const mostBlog = {
    author: mostAuthor,
    blogs: max,
  };
  return mostBlog;
};

const mostLikes = (blogs) => {
  let dict = {
    bigjun: 0,
  };
  for (let blog of blogs) {
    if (!dict.hasOwnProperty(blog.author)) {
      dict[blog.author] = 0;
    }
    dict[blog.author] += blog.likes;
  }

  let mostlikes = 0;
  let mostAuthor = "";
  for (let author in dict) {
    if (dict[author] > mostlikes) {
      mostAuthor = author;
      mostlikes = dict[author];
    }
  }

  // const sortByLikes = _.sortBy(blogs, ['author', 'likes'], ['desc', 'desc'])

  // let like = sortByLikes[0].likes
  // let mostlike = 0
  // let mostAuthor = null
  // for (let i = 0; i < sortByLikes.length-1; i++){
  //   if (sortByLikes[i].author === sortByLikes[i+1].author){
  //     like = like + sortByLikes[i+1].likes

  //   } else {
  //     if ( mostlike < like) {
  //       mostlike = like
  //       mostAuthor = sortByLikes[i].author
  //     }
  //     like=sortByLikes[i+1].likes
  //   }
  // }
  // if ( mostlike < like) {
  //   mostlike = like
  //   mostAuthor = sortByLikes[sortByLikes.length-1].author
  // }
  const mostLike = {
    author: mostAuthor,
    likes: mostlikes,
  };
  return mostLike;
};

module.exports = { dummy, totallikes, favoriteBlog, mostBlogs, mostLikes };
