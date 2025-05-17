import { HttpClient } from '@angular/common/http';
import { Injectable, signal, WritableSignal } from '@angular/core';
import { environment } from '@environment/environment';
import { Blog } from '@models/Blog.model';
import { Observable, tap, timeout } from 'rxjs';
import { timeoutDuration } from '@utils/globals';

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  apiUrl = environment.API_URL;
  Blog: WritableSignal<Blog | null> = signal<Blog | null>(null);

  constructor(
    private http: HttpClient,
  ) { }

  getBlog(page?: number): Observable<Blog>{
    const url = new URL(`${this.apiUrl}/api/blog/list/`);
    if(page){
      url.searchParams.set('page', page.toString());
    }
    return this.http.get<Blog>(url.toString(), {
      withCredentials: true
    }).pipe(
      timeout(timeoutDuration),
      tap( response => {
        this.Blog.set(response);
      })
    );
  }

}
