import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environment/environment';
import { NewPost, PostResponse } from '@models/Post.model';
import { Observable } from 'rxjs';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class PostsService {
  apiUrl: string = environment.API_URL;

  constructor(
    private http: HttpClient,
    private tokenService: TokenService
  ) { }

  createPost(post: NewPost): Observable<PostResponse>{
    const csrfToken = this.tokenService.getToken('csrftoken');
    const headers = new HttpHeaders({
      'X-CSRFToken': csrfToken || '',
      'Content-Type': 'application/json',
    });
    return this.http.post<PostResponse>(`${this.apiUrl}/api/blog/post/`, post, {headers, withCredentials: true});
  }
}
