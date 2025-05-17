import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environment/environment';
import { Like, LikePostResponse, LikeResponse } from '@models/Like.models';
import { Observable, timeout } from 'rxjs';
import { TokenService } from './token.service';
import { timeoutDuration } from '@utils/globals';

@Injectable({
  providedIn: 'root'
})
export class LikeService {
  apiUrl = environment.API_URL;

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
  ) { }

  likePost(post_id: number): Observable<LikePostResponse> {
    const csrfToken = this.tokenService.getToken('csrftoken');
    const headers = new HttpHeaders({
      'X-CSRFToken': csrfToken || '',
      'Content-Type': 'application/json',
    });
    return this.http.post<LikePostResponse>(`${this.apiUrl}/api/like/post/${post_id}/`, {}, { headers, withCredentials: true })
      .pipe(
        timeout(timeoutDuration)
      );
  }

  unlikePost(post_id: number): Observable<LikePostResponse> {
    const csrfToken = this.tokenService.getToken('csrftoken');
    const headers = new HttpHeaders({
      'X-CSRFToken': csrfToken || '',
      'Content-Type': 'application/json',
    });
    return this.http.delete<LikePostResponse>(`${this.apiUrl}/api/like/post/${post_id}/`, { headers, withCredentials: true })
      .pipe(
        timeout(timeoutDuration)
      );
  }

  getLikes(post_id?: number, page?: number): Observable<LikeResponse> {
    const url = new URL(`${this.apiUrl}/api/like/list/`);
    if (post_id !== undefined) {
      url.searchParams.append('blog_id', post_id.toString());
    }

    if (page !== undefined) {
      url.searchParams.append('page', page.toString());
    }

    return this.http.get<LikeResponse>(url.toString(), { withCredentials: true })
      .pipe(
        timeout(timeoutDuration)
      );
  }

  userLikedPost(post_id: number): Observable<Like> {
    const csrfToken = this.tokenService.getToken('csrftoken');
    const headers = new HttpHeaders({
      'X-CSRFToken': csrfToken || '',
      'Content-Type': 'application/json',
    });

    return this.http.get<Like>(`${this.apiUrl}/api/like/post/${post_id}/`, { withCredentials: true })
      .pipe(
        timeout(timeoutDuration)
      );
  }
}
