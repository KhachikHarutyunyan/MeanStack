import { BlogModel } from './../models/blog.model';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class BlogService {

  options;
  domain = this.authServices.domain;
  dataItems;

  constructor(
    private http: HttpClient,
    private authServices: AuthService
  ) { }

  createAuthenticationHeaders() {
    this.authServices.loadToken();
    this.options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'authorization': this.authServices.authToken
      })
    };
  }

  newBlog(blog) {
    this.createAuthenticationHeaders();
    return this.http.post(this.domain + 'blogs/newBlog', blog, this.options);
  }
  getAllBlogs() {
    this.createAuthenticationHeaders();
    return this.http.get(this.domain + 'blogs/allBlogs', this.options);
  }

  getSingleBlog(id) {
    this.createAuthenticationHeaders();
    return this.http.get(this.domain + 'blogs/singleBlog/' + id, this.options);
  }

  editBlog(blog) {
    this.createAuthenticationHeaders();
    return this.http.put(this.domain + 'blogs/updateBlog/', blog, this.options);
  }

  deleteBlog(id) {
    this.createAuthenticationHeaders();
    return this.http.delete(this.domain + 'blogs/deleteBlog/' + id, this.options);
  }

  likeBlog(id) {
    const blogData = { id: id };
    return this.http.put(this.domain + 'blogs/likeBlog/', blogData, this.options);
  }

  dislikeBlog(id) {
    const blogData = { id: id };
    return this.http.put(this.domain + 'blogs/dislikeBlog/', blogData, this.options);
  }

  postComment(id, comment) {
    this.createAuthenticationHeaders();
    const blogData = {
      id: id,
      comment: comment
    };

    return this.http.post(this.domain + 'blogs/comment', blogData, this.options);
  }

}
