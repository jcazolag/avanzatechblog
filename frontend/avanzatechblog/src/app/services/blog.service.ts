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
    this.http.get<Blog>(url.toString(), {
      withCredentials: true
    }).subscribe({
      next: (response) =>{
        this.Blog.set(response)
      },
      error: (err) => {
        console.log(err)
      }
    });
  }

}
