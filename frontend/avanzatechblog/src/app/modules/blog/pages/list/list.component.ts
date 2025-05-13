import { Component, effect, inject, Injector, Input, signal, SimpleChanges, WritableSignal } from '@angular/core';
import { Blog } from '@models/Blog.model';
import { PostComponent } from '@modules/blog/components/post/post.component';
import { BlogService } from '@services/blog.service';
import { RouterLinkWithHref } from '@angular/router';
import { UserService } from '@services/user.service';
import { User } from '@models/User.model';
import { NotfoundComponent } from '@modules/blog/components/notfound/notfound.component';
import { timer, Subscription, switchMap } from 'rxjs';

@Component({
  selector: 'app-list',
  imports: [PostComponent, RouterLinkWithHref, NotfoundComponent],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css'
})
export default class ListComponent {
  blogService = inject(BlogService);
  Blog: WritableSignal<Blog | null> = this.blogService.Blog;
  user: WritableSignal<User | undefined> = inject(UserService).user;
  @Input() Page?: number;
  hasError: WritableSignal<boolean> = signal(false);

  injector = inject(Injector);

  constructor(
  ) { }

  ngOnInit() {
    this.getBlog();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.getBlog();
  }

  getBlog() {
    this.blogService.getBlog(this.Page).subscribe({
      next: (response) =>{
        this.hasError.set(false);
      },
      error: (err) => {
        this.hasError.set(true);
      }
    });
  }
}
