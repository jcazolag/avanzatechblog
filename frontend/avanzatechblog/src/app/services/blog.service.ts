import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, signal, WritableSignal } from '@angular/core';
import { environment } from '@environment/environment';
import { Blog } from '@models/Blog.model';
import { Observable } from 'rxjs';
import { TokenService } from './token.service';
import { Generic } from '@models/generic.model';

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  apiUrl = environment.API_URL;
  Blog: WritableSignal<Blog | null> = signal<Blog | null>(null);

  constructor(
    private http: HttpClient,
    private tokenService: TokenService
  ) { }

  getBlog(page?: number){
    const url = new URL(`${this.apiUrl}/api/blog/list/`);
    if(page){
      url.searchParams.set('page', page.toString());
    }
    return this.http.get<Blog>(url.toString(), {
      withCredentials: true
    });
  }

  deleteBlog(blog_id: number): Observable<Generic>{
    const csrfToken = this.tokenService.getToken('csrftoken');
    const headers = new HttpHeaders({
      'X-CSRFToken': csrfToken || '',
      'Content-Type': 'application/json',
    });
    return this.http.delete<Generic>(`${this.apiUrl}/api/blog/post/${blog_id}/`, {headers, withCredentials: true});
  }
}
