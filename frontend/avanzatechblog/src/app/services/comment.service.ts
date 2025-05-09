import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environment/environment';
import { CommentResponse } from '@models/Comment.models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  apiUrl: string = environment.API_URL;

  constructor(
    private http: HttpClient
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
}
