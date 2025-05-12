import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environment/environment';
import { NewPost, Post, PostResponse } from '@models/Post.model';
import { Observable } from 'rxjs';
import { TokenService } from './token.service';
import { BlogService } from './blog.service';
import { Generic } from '@models/generic.model';

@Injectable({
  providedIn: 'root'
})
export class PostsService {
  apiUrl: string = environment.API_URL;

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
    private blogService: BlogService
  ) { }

  createPost(post: NewPost): Observable<PostResponse> {
    const csrfToken = this.tokenService.getToken('csrftoken');
    const headers = new HttpHeaders({
      'X-CSRFToken': csrfToken || '',
      'Content-Type': 'application/json',
    });
    return this.http.post<PostResponse>(`${this.apiUrl}/api/blog/post/`, post, { headers, withCredentials: true });
  }

  getPost(post_id: number) {
    const csrfToken = this.tokenService.getToken('csrftoken');
    const headers = new HttpHeaders({
      'X-CSRFToken': csrfToken || '',
      'Content-Type': 'application/json',
    });
    return this.http.get<Post>(`${this.apiUrl}/api/blog/post/${post_id}`, { headers, withCredentials: true });
  }

  deletePost(blog_id: number) {
    const csrfToken = this.tokenService.getToken('csrftoken');
    const headers = new HttpHeaders({
      'X-CSRFToken': csrfToken || '',
      'Content-Type': 'application/json',
    });
    this.http.delete<Generic>(`${this.apiUrl}/api/blog/post/${blog_id}/`, { headers, withCredentials: true })
    .subscribe({
      next: (response) => {
        this.blogService.getBlog();
      },
      error: (err) =>{
        console.log(err)
      }
    });
  }
}
