const User = require('../models/user');
const Blog = require('../models/blog');
const jwt = require('jsonwebtoken');
const config = require('../config/database');

module.exports = (router) => {

    router.post('/newBlog', (req, res) => {
        if (!req.body.title) {
            res.json({ success: false, message: 'Blog title is required.' });
        } else {
            if (!req.body.body) {
                res.json({ success: false, message: 'Blog title is required.' });
            } else {
                if (!req.body.createdBy) {
                    res.json({ success: false, message: 'Blog creater is required.' });
                } else {
                    const blog = new Blog({
                        title: req.body.title,
                        body: req.body.body,
                        createdBy: req.body.createdBy
                    });
                    blog.save((err) => {
                        if (err) {
                            if (err.errors) {
                                if (err.errors.title) {
                                    res.json({ success: false, message: err.errors.title.message });
                                } else {
                                    if (err.errors.body) {
                                        res.json({ success: false, message: err.errors.body.message });
                                    } else {
                                        res.json({ success: false, message: err.errmsg });
                                    }
                                }
                            } else {
                                res.json({ success: false, message: err});
                            }                            
                        } else {
                            res.json({ success: true, message: 'Blog saved'});
                        }
                    })
                }
            }
        }
    });

    router.get('/allBlogs', (req, res) => {
      Blog.find({}, (err, blogs) => {
        if (err) {
          res.json({ success: false, message: err });
        } else {
          if (!blogs) {
            res.json({ success: false, message: 'No blogs found' });
          } else {
            res.json({ success: true, blogs: blogs });
          }
        }
      }).sort({ '_id': -1 });
    });

  router.get('/singleBlog/:id', (req, res) => {
    // Check if id is present in parameters
    if (!req.params.id) {
      res.json({ success: false, message: 'No blog ID was provided.' }); // Return error message
    } else {
      // Check if the blog id is found in database
      Blog.findOne({ _id: req.params.id }, (err, blog) => {
        // Check if the id is a valid ID
        if (err) {
          res.json({ success: false, message: 'Not a valid blog id' }); // Return error message
        } else {
          // Check if blog was found by id
          if (!blog) {
            res.json({ success: false, message: 'Blog not found.' }); // Return error message
          } else {
            // Find the current user that is logged in
            User.findOne({ _id: req.decoded.userId }, (err, user) => {
              // Check if error was found
              if (err) {
                res.json({ success: false, message: err }); // Return error
              } else {
                // Check if username was found in database
                if (!user) {
                  res.json({ success: false, message: 'Unable to authenticate user' }); // Return error message
                } else {
                  // Check if the user who requested single blog is the one who created it
                  if (user.username !== blog.createdBy) {
                    res.json({ success: false, message: 'You are not authorized to eidt this blog.' }); // Return authentication reror
                  } else {
                    res.json({ success: true, blog: blog }); // Return success
                  }
                }
              }
            });
          }
        }
      });
    }
  });

  router.put('/updateBlog', (req, res) => {
    // Check if id was provided
    if (!req.body._id) {
      res.json({ success: false, message: 'No blog id provided' }); // Return error message
    } else {
      // Check if id exists in database
      Blog.findOne({ _id: req.body._id }, (err, blog) => {
        // Check if id is a valid ID
        if (err) {
          res.json({ success: false, message: 'Not a valid blog id' }); // Return error message
        } else {
          // Check if id was found in the database
          if (!blog) {
            res.json({ success: false, message: 'Blog id was not found.' }); // Return error message
          } else {
            // Check who user is that is requesting blog update
            User.findOne({ _id: req.decoded.userId }, (err, user) => {
              // Check if error was found
              if (err) {
                res.json({ success: false, message: err }); // Return error message
              } else {
                // Check if user was found in the database
                if (!user) {
                  res.json({ success: false, message: 'Unable to authenticate user.' }); // Return error message
                } else {
                  // Check if user logged in the the one requesting to update blog post
                  if (user.username !== blog.createdBy) {
                    res.json({ success: false, message: 'You are not authorized to edit this blog post.' }); // Return error message
                  } else {
                    blog.title = req.body.title; // Save latest blog title
                    blog.body = req.body.body; // Save latest body
                    blog.save((err) => {
                      if (err) {
                        if (err.errors) {
                          res.json({ success: false, message: 'Please ensure form is filled out properly' });
                        } else {
                          res.json({ success: false, message: err }); // Return error message
                        }
                      } else {
                        res.json({ success: true, message: 'Blog Updated!' }); // Return success message
                      }
                    });
                  }
                }
              }
            });
          }
        }
      });
    }
  });

  router.delete('/deleteBlog/:id', (req, res) => {
    if (!req.params.id) {
      res.json({ success: false, message: 'No id provided' });
    } else {
      Blog.findOne({ _id: req.params.id }, (err, blog) => {
        if (err) {
          res.json({ success: false, message: 'Invalid id' });
        } else {
          if (!blog) {
            res.json({ success: false, message: 'Blog was not found' });
          } else {
            User.findOne({ _id: req.decoded.userId }, (err, user) => {
              if (err) {
                res.json({ success: false, message: err });
              } else {
                if (!user) {
                  res.json({ success: false, message: 'Unable to authenticate user' });
                } else {
                  if (user.username !== blog.createdBy) {
                    res.json({ success: false, message: 'You are not authorized to delete this blog post' });
                  } else {
                    blog.remove((err) => {
                      if (err) {
                        res.json({ success: false, message: err });
                      } else {
                        res.json({ success: true, message: 'Blog deleted!' });
                      }
                    })
                  }
                }
              }
            });
          }
        }
      });
    }
  });

  router.put('/likeBlog', (req, res) => {
    if (!req.body.id) {
      res.json({ success: false, message: 'No id was provided' });
    } else {
      Blog.findOne({ _id: req.body.id }, (err, blog) => {
        if (err) {
          res.json({ success: false, message: 'Invalid blog id' });
        } else {
          if (!blog) {
            res.json({ success: false, message: 'That blog was not found' });
          } else {
            User.findOne({ _id: req.decoded.userId }, (err, user) => {
              if (err) {
                res.json({ success: false, message: 'Something went wrong' });
              } else {
                if (!user) {
                  res.json({ success: false, message: 'Could not authenticate user' });
                } else {
                  if (user.username === blog.createdBy) {
                    res.json({ success: false, message: 'Cannot like your own post' });
                  } else {
                    if (blog.likedBy.includes(user.username)) {
                      res.json({ success: false, message: 'You already liked this post' });
                    } else {
                      if (blog.dislikedBy.includes(user.username)) {
                        blog.dislikes--;
                        const arrayIndex = blog.dislikedBy.indexOf(user.username);
                        blog.dislikedBy.splice(arrayIndex, 1);
                        blog.likes++;
                        blog.likedBy.push(user.username);
                        blog.save((err) => {
                          if (err) {
                            res.json({ success: false, message: 'Something went wrong' });
                          } else {
                            res.json({ success: true, message: 'Blog liked' });
                          }
                        });
                      } else {
                        blog.likes++;
                        blog.likedBy.push(user.username);
                        blog.save((err) => {
                          if (err) {
                            res.json({ success: false, message: 'Something went wrong' });
                          } else {
                            res.json({ success: true, message: 'Blog liked' });
                          }
                        });
                      }
                    }
                  }
                }
              }
            });
          }
        }
      });
    }
  });

  router.put('/dislikeBlog', (req, res) => {
    if (!req.body.id) {
      res.json({ success: false, message: 'No id was provided' });
    } else {
      Blog.findOne({ _id: req.body.id }, (err, blog) => {
        if (err) {
          res.json({ success: false, message: 'Invalid blog id' });
        } else {
          if (!blog) {
            res.json({ success: false, message: 'That blog was not found' });
          } else {
            User.findOne({ _id: req.decoded.userId }, (err, user) => {
              if (err) {
                res.json({ success: false, message: 'Something went wrong' });
              } else {
                if (!user) {
                  res.json({ success: false, message: 'Could not authenticate user' });
                } else {
                  if (user.username === blog.createdBy) {
                    res.json({ success: false, message: 'Cannot dislike your own post' });
                  } else {
                    if (blog.dislikedBy.includes(user.username)) {
                      res.json({ success: false, message: 'You already disliked this post' });
                    } else {
                      if (blog.likedBy.includes(user.username)) {
                        blog.likes--;
                        const arrayIndex = blog.likedBy.indexOf(user.username);
                        blog.likedBy.splice(arrayIndex, 1);
                        blog.dislikes++;
                        blog.dislikedBy.push(user.username);
                        blog.save((err) => {
                          if (err) {
                            res.json({ success: false, message: 'Something went wrong' });
                          } else {
                            res.json({ success: true, message: 'Blog liked' });
                          }
                        });
                      } else {
                        blog.dislikes++;
                        blog.dislikedBy.push(user.username);
                        blog.save((err) => {
                          if (err) {
                            res.json({ success: false, message: 'Something went wrong' });
                          } else {
                            res.json({ success: true, message: 'Blog disliked' });
                          }
                        });
                      }
                    }
                  }
                }
              }
            });
          }
        }
      });
    }
  });

  router.post('/comment', (req, res) => {
    if (!req.body.comment) {
      res.json({ success: false, message: 'No comment provided' });
    } else {
      if (!req.body.id) {
        res.json({ success: false, message: 'No id was provided' });
      } else {
        Blog.findOne({ _id: req.body.id }, (err, blog) => {
          if (err) {
            res.json({ success: false, message: 'Invalid blog id' });
          } else {
            if (!blog) {
              res.json({ success: false, message: 'Blog not found' });
            } else {
              User.findOne({ _id: req.decoded.userId }, (err, user) => {
                if (err) {
                  res.json({ success: false, message: 'Something went wrong' });
                } else {
                  if (!user) {
                    res.json({ success: false, message: 'User not found' });
                  } else {
                    blog.comments.push({
                      comment: req.body.comment,
                      commentator: user.username
                    });
                    blog.save((err) => {
                      if (err) {
                        res.json({ success: false, message: 'Something went wrong' });
                      } else {
                        res.json({ success: true, message: 'Comment saved' });
                      }
                    });
                  }
                }
              })
            }
          }
        });
      }
    }
  })

    return router;
};