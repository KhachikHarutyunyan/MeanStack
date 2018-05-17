import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { BlogService } from '../../services/blog.service';
import { subscribeOn } from 'rxjs/operators';

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.css']
})
export class BlogComponent implements OnInit {

  form;

  messageClass;
  message;
  newPost = false;
  loadingBlogs = false;
  processing;
  username;
  userData = [];
  blogMessage = [];
  blogPosts = [];
  newComment = [];
  commentForm;
  enabledComments = [];

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private blogService: BlogService
  ) {
    this.createNewBlogForm();
    this.createCommentForm();
   }

   createNewBlogForm() {
    this.form = this.formBuilder.group({
      // Title field
      title: ['', Validators.compose([
        Validators.required,
        Validators.maxLength(50),
        Validators.minLength(5),
        this.alphaNumericValidation
      ])],
      // Body field
      body: ['', Validators.compose([
        Validators.required,
        Validators.maxLength(500),
        Validators.minLength(5)
      ])]
    });
  }

  // Create form for posting comments
  createCommentForm() {
    this.commentForm = this.formBuilder.group({
      comment: ['', Validators.compose([
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(200)
      ])]
    });
  }

  // Enable the comment form
  enableCommentForm() {
    this.commentForm.get('comment').enable(); // Enable comment field
  }

  // Disable the comment form
  disableCommentForm() {
    this.commentForm.get('comment').disable(); // Disable comment field
  }

  // Enable new blog form
  enableFormNewBlogForm() {
    this.form.get('title').enable(); // Enable title field
    this.form.get('body').enable(); // Enable body field
  }

  // Disable new blog form
  disableFormNewBlogForm() {
    this.form.get('title').disable(); // Disable title field
    this.form.get('body').disable(); // Disable body field
  }

  // Validation for title
  alphaNumericValidation(controls) {
    const regExp = new RegExp(/^[a-zA-Z0-9 ]+$/); // Regular expression to perform test
    // Check if test returns false or true
    if (regExp.test(controls.value)) {
      return null; // Return valid
    } else {
      return { 'alphaNumericValidation': true }; // Return error in validation
    }
  }

  // Function to display new blog form
  newBlogForm() {
    this.newPost = true; // Show new blog form
  }

  // Reload blogs on current page
  reloadBlogs() {
    this.loadingBlogs = true; // Used to lock button
    this.getAllBlogs(); // Add any new blogs to the page
    setTimeout(() => {
      this.loadingBlogs = false; // Release button lock after four seconds
    }, 4000);
  }

  // Function to post a new comment on blog post
  draftComment(id) {
    this.commentForm.reset(); // Reset the comment form each time users starts a new comment
    this.newComment = []; // Clear array so only one post can be commented on at a time
    this.newComment.push(id); // Add the post that is being commented on to the array
  }

  // Function to cancel new post transaction
  cancelSubmission(id) {
    const index = this.newComment.indexOf(id); // Check the index of the blog post in the array
    this.newComment.splice(index, 1); // Remove the id from the array to cancel post submission
    this.commentForm.reset(); // Reset  the form after cancellation
    this.enableCommentForm(); // Enable the form after cancellation
    this.processing = false; // Enable any buttons that were locked
  }

  // Function to submit a new blog post
  onBlogSubmit() {
    this.processing = true; // Disable submit button
    this.disableFormNewBlogForm(); // Lock form
    // Create blog object from form fields
    const blog = {
      title: this.form.get('title').value, // Title field
      body: this.form.get('body').value, // Body field
      createdBy: this.username // CreatedBy field
    };

    // Function to save blog into database
    this.blogService.newBlog(blog).subscribe(data => {
      // Check if blog was saved to database or not
      if (!data['success']) {
        this.messageClass = 'alert alert-danger'; // Return error class
        this.message = data['message']; // Return error message
        this.processing = false; // Enable submit button
        this.enableFormNewBlogForm(); // Enable form
      } else {
        this.messageClass = 'alert alert-success'; // Return success class
        this.message = data['message']; // Return success message
        this.getAllBlogs();
        // Clear form data after two seconds
        setTimeout(() => {
          this.newPost = false; // Hide form
          this.processing = false; // Enable submit button
          this.message = false; // Erase error/success message
          this.form.reset(); // Reset all form fields
          this.enableFormNewBlogForm(); // Enable the form fields
        }, 2000);
      }
    });
  }

  // Function to go back to previous page
  goBack() {
    window.location.reload(); // Clear all variable states
  }

  // Function to get all blogs from the database
  getAllBlogs() {
    this.blogService.getAllBlogs().subscribe(data => {
      this.blogPosts = data['blogs'];
    });
  }

  // Function to like a blog post
  likeBlog(id) {
    this.blogService.likeBlog(id).subscribe(data => {
      this.getAllBlogs(); // Refresh blogs after like
    });
  }

  // Function to disliked a blog post
  dislikeBlog(id) {
    this.blogService.dislikeBlog(id).subscribe(data => {
      this.getAllBlogs(); // Refresh blogs after dislike
    });
  }

  // Function to post a new comment
  postComment(id) {
    this.disableCommentForm(); // Disable form while saving comment to database
    this.processing = true; // Lock buttons while saving comment to database
    const comment = this.commentForm.get('comment').value; // Get the comment value to pass to service function
    // Function to save the comment to the database
    this.blogService.postComment(id, comment).subscribe(data => {
      this.getAllBlogs(); // Refresh all blogs to reflect the new comment
      const index = this.newComment.indexOf(id); // Get the index of the blog id to remove from array
      this.newComment.splice(index, 1); // Remove id from the array
      this.enableCommentForm(); // Re-enable the form
      this.commentForm.reset(); // Reset the comment form
      this.processing = false; // Unlock buttons on comment form
      if (this.enabledComments.indexOf(id) < 0) { this.expand(id); } // Expand comments for user on comment submission
    });
  }

  // Expand the list of comments
  expand(id) {
    this.enabledComments.push(id); // Add the current blog post id to array
  }

  // Collapse the list of comments
  collapse(id) {
    const index = this.enabledComments.indexOf(id); // Get position of id in array
    this.enabledComments.splice(index, 1); // Remove id from array
  }

  ngOnInit() {
    // Get profile username on page load
    this.authService.getProfile().subscribe(profile => {
      this.username = profile['user'].username;
    });

    this.getAllBlogs();
  }



/*
  ngOnInit() {
    this.authService.getProfile().subscribe(profile => {
      this.userData.push(profile);
      this.username = this.userData[0]['user']['username'];
    });
    this.getAllBlogs();
  }

  createCommentForm() {
    this.commentForm = this.formBuilder.group({
      comment: ['', Validators.compose([
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(200)
      ])]
    });
  }

  getAllBlogs() {
    this.blogService.getAllBlogs().subscribe(data => {
      this.blogPosts = data['blogs'];
    });
  }

  createNewBlogForm() {
    this.form = this.formBuilder.group({
      title: ['', Validators.compose([
        Validators.required,
        Validators.maxLength(50),
        Validators.minLength(5),
        this.alphaNumericValidation
      ])],
      body: ['', Validators.compose([
        Validators.required,
        Validators.maxLength(500),
        Validators.minLength(5)
      ])]
    });
  }

  enableNewBlogForms() {
    this.form.get('title').enable();
    this.form.get('body').enable();
  }

  enableCommentForm() {
    this.commentForm.get('comment').enable();
  }

  disableCommentForm() {
    this.commentForm.get('comment').disable();
  }

  disabledNewBlogForms() {
    this.form.get('title').disable();
    this.form.get('body').disable();
  }

  alphaNumericValidation(controls) {
    const regExp = new RegExp(/^[a-zA-Z0-9 ]+$/);
    if (regExp.test(controls.value)) {
      return null;
    } else {
      return {
        'alphaNumericValidation': true
      };
    }
  }

  newBlogForm() {
    this.newPost = true;
  }

  reloadBlogs() {
    this.loadingBlogs = true;
    this.getAllBlogs();
    setTimeout(() => {
      this.loadingBlogs = false;
    }, 4000);
  }

  draftComment(id) {
    this.newComment = [];
    this.newComment.push(id);
    this.commentForm.reset();
  }

  cancelSubmission(id) {
    const index = this.newComment.indexOf(id);
    this.newComment.splice(index, 1);
    this.commentForm.reset();
    this.enableCommentForm();
    this.processing = false;
  }

  onBlogSubmit() {
    this.processing = true;
    this.disabledNewBlogForms();
    const blog = {
      title: this.form.get('title').value,
      body: this.form.get('body').value,
      createdBy: this.username
    };
    this.blogService.newBlog(blog).subscribe(data => {
      this.blogMessage.push(data);
      if (!this.blogMessage[0].success) {
        this.messageClass = 'alert alert-danger';
        this.message = this.blogMessage[0].message;
        this.processing = false;
        this.enableNewBlogForms();
      } else {
        this.messageClass = 'alert alert-success';
        this.message = this.blogMessage[0].message;
        this.getAllBlogs();
        setTimeout(() => {
          this.newPost = false;
          this.processing = false;
          this.message = false;
          this.form.reset();
          this.enableNewBlogForms();
        }, 2000);
      }
    });
  }

  goBack() {
    window.location.reload();
  }

  likeBlog(id) {
    this.blogService.likeBlog(id).subscribe(data => {
      this.getAllBlogs();
    });
  }

  dislikeBlog(id) {
    this.blogService.dislikeBlog(id).subscribe(data => {
      this.getAllBlogs();
    });
  }

  postComment(id) {
    this.disableCommentForm();
    this.processing = true;
    const comment = this.commentForm.get('comment').value;
    this.blogService.postComment(id, comment).subscribe(data => {
      this.getAllBlogs();
      const index = this.newComment.indexOf(id);
      this.newComment.splice(index, 1);
      this.enableCommentForm();
      this.commentForm = false;
      this.processing = false;
      if (this.enabledComments.indexOf(id) < 0) {
        this.expand(id);
      }
    });
  }

  expand(id) {
    this.enabledComments.push(id);
  }

  collapse(id) {
    const index = this.enabledComments.indexOf(id);
    this.enabledComments.splice(index, 1);
  }
*/
}
