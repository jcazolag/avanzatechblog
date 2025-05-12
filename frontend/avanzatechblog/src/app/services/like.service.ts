import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environment/environment';
import { LikePostResponse, LikeResponse } from '@models/Like.models';
import { Observable } from 'rxjs';
import { TokenService } from './token.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class LikeService {
  apiUrl = environment.API_URL;

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
    private userService: UserService
  ) { }

  likePost(post_id: number): Observable<LikePostResponse>{
    const csrfToken = this.tokenService.getToken('csrftoken');
    const headers = new HttpHeaders({
      'X-CSRFToken': csrfToken || '',
      'Content-Type': 'application/json',
    });
    return this.http.post<LikePostResponse>(`${this.apiUrl}/api/like/post/${post_id.toString()}/like/`, {}, {headers, withCredentials: true});
  }

  unlikePost(post_id: number): Observable<LikePostResponse>{
    const csrfToken = this.tokenService.getToken('csrftoken');
    const headers = new HttpHeaders({
      'X-CSRFToken': csrfToken || '',
      'Content-Type': 'application/json',
    });
    return this.http.delete<LikePostResponse>(`${this.apiUrl}/api/like/post/${post_id}/unlike/`, {headers, withCredentials: true});
  }

  getLikes(post_id?: number, page?: number): Observable<LikeResponse>{
    const url = new URL(`${this.apiUrl}/api/like/list/`);
    if (post_id !== undefined) {
      url.searchParams.append('blog_id', post_id.toString());
    }

    if (page !== undefined) {
      url.searchParams.append('page', page.toString());
    }

    return this.http.get<LikeResponse>(url.toString(), { withCredentials: true});
  }

  userLikedPost(post_id: number, user_id: number): Observable<LikeResponse>{
    const url = new URL(`${this.apiUrl}/api/like/list/`);
    url.searchParams.append('blog_id', post_id.toString());
    url.searchParams.append('user_id', user_id.toString())

    return this.http.get<LikeResponse>(url.toString(), {withCredentials: true})

  }
}
