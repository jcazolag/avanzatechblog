import { Component, inject, Input, signal, SimpleChanges, WritableSignal } from '@angular/core';
import { Blog } from '@models/Blog.model';
import { PostComponent } from '@modules/blog/components/post/post.component';
import { BlogService } from '@services/blog.service';
import { Router, RouterLinkWithHref } from '@angular/router';
import { UserService } from '@services/user.service';
import { User } from '@models/User.model';

@Component({
  selector: 'app-list',
  imports: [PostComponent, RouterLinkWithHref],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css'
})
export default class ListComponent {
  blogService = inject(BlogService);
  Blog: WritableSignal<Blog | null> = this.blogService.Blog;
  user: WritableSignal<User | undefined> = inject(UserService).user;
  @Input() Page?: number;
  hasError: WritableSignal<boolean> = signal(false);

  constructor(
  ) { }

  ngOnInit() {
    this.getBlog();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.getBlog();
  }

  private getBlog() {
    this.blogService.getBlog(this.Page);
  }

}
