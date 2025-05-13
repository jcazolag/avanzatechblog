import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environment/environment';
import { Comment, CommentResponse } from '@models/Comment.models';
import { Observable } from 'rxjs';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  apiUrl: string = environment.API_URL;

  constructor(
    private http: HttpClient,
    private tokenService: TokenService
  ) { }

  getComments(blog_id?: number, page?: number): Observable<CommentResponse>{
    const url = new URL(`${this.apiUrl}/api/comment/list/`);
        if (blog_id !== undefined) {
          url.searchParams.append('blog_id', blog_id.toString());
        }
      
        if (page !== undefined) {
          url.searchParams.append('page', page.toString());
        }
    
        return this.http.get<CommentResponse>(url.toString(), { withCredentials: true});
  }

  commentPost(post_id: number, content: string): Observable<Comment> {
    const csrfToken = this.tokenService.getToken('csrftoken');
    const headers = new HttpHeaders({
      'X-CSRFToken': csrfToken || '',
      'Content-Type': 'application/json',
    });
    return this.http.post<Comment>(`${this.apiUrl}/api/comment/post/${post_id}/`, content, {headers, withCredentials: true});
  }
}
