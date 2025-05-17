import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environment/environment';
import { NewPost, Post, PostResponse } from '@models/Post.model';
import { Observable, tap, timeout } from 'rxjs';
import { TokenService } from './token.service';
import { Generic } from '@models/generic.model';
import { timeoutDuration } from '@utils/globals';

@Injectable({
  providedIn: 'root'
})
export class PostsService {
  apiUrl: string = environment.API_URL;

  constructor(
    private http: HttpClient,
    private tokenService: TokenService
  ) { }

  createPost(post: NewPost): Observable<PostResponse> {
    const csrfToken = this.tokenService.getToken('csrftoken');
    const headers = new HttpHeaders({
      'X-CSRFToken': csrfToken || '',
      'Content-Type': 'application/json',
    });
    return this.http.post<PostResponse>(`${this.apiUrl}/api/blog/post/`, post, { headers, withCredentials: true })
      .pipe(
        timeout(timeoutDuration)
      );
  }

  getPost(post_id: number): Observable<Post> {
    const csrfToken = this.tokenService.getToken('csrftoken');
    const headers = new HttpHeaders({
      'X-CSRFToken': csrfToken || '',
      'Content-Type': 'application/json',
    });
    return this.http.get<Post>(`${this.apiUrl}/api/blog/post/${post_id}/`, { headers, withCredentials: true })
      .pipe(
        timeout(timeoutDuration)
      );
  }

  deletePost(blog_id: number): Observable<Generic> {
    const csrfToken = this.tokenService.getToken('csrftoken');
    const headers = new HttpHeaders({
      'X-CSRFToken': csrfToken || '',
      'Content-Type': 'application/json',
    });
    return this.http.delete<Generic>(`${this.apiUrl}/api/blog/post/${blog_id}/`, { headers, withCredentials: true })
      .pipe(
        timeout(timeoutDuration)
      );
  }

  editPost(post_id: number, post: NewPost): Observable<Post>{
    const csrfToken = this.tokenService.getToken('csrftoken');
    const headers = new HttpHeaders({
      'X-CSRFToken': csrfToken || '',
      'Content-Type': 'application/json',
    });
    return this.http.put<Post>(`${this.apiUrl}/api/blog/post/${post_id}/`, post, { headers, withCredentials: true })
      .pipe(
        timeout(timeoutDuration)
      );
  }
}
