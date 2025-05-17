import { Component, effect, inject, Injector, Input, signal, SimpleChanges, WritableSignal } from '@angular/core';
import { Blog } from '@models/Blog.model';
import { PostComponent } from '@modules/blog/components/post/post.component';
import { BlogService } from '@services/blog.service';
import { RouterLinkWithHref } from '@angular/router';
import { UserService } from '@services/user.service';
import { User } from '@models/User.model';
import { NotfoundComponent } from '@modules/shared/notfound/notfound.component';
import { PageStatus } from '@models/request-status.models';
import { ServerErrorComponent } from '@modules/shared/server-error/server-error.component';
import { LoadingScreenComponent } from '@modules/shared/loading-screen/loading-screen.component';
//import { timer, Subscription, switchMap } from 'rxjs';

@Component({
  selector: 'app-list',
  imports: [PostComponent, RouterLinkWithHref, NotfoundComponent, ServerErrorComponent, LoadingScreenComponent],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css'
})
export default class ListComponent {
  blogService = inject(BlogService);
  Blog: WritableSignal<Blog | null> = this.blogService.Blog;
  user: WritableSignal<User | undefined> = inject(UserService).user;
  @Input() Page?: number;
  status: WritableSignal<PageStatus> = signal<PageStatus>('loading')

  injector = inject(Injector);

  constructor(
  ) { }

  ngOnInit() {
    //this.getBlog();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.getBlog();
  }

  getBlog() {
    this.blogService.getBlog(this.Page).subscribe({
      next: (response) =>{
        this.status.set('success');
      },
      error: (err) => {
        if (err.status === 404) {
          this.status.set('404');
        }else{
          this.status.set('500')
        }
      }
    });
  }
}
