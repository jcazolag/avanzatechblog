import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { PostFormComponent } from '../post-form/post-form.component';

import { DetailContentComponent } from './detail-content.component';
import { signal } from '@angular/core';
import { Post } from '@models/Post.model';
import { PostsService } from '@services/posts.service';

describe('DetailContentComponent', () => {
  let component: DetailContentComponent;
  let fixture: ComponentFixture<DetailContentComponent>;
  let postService: PostsService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailContentComponent, CommonModule, PostFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailContentComponent);
    component = fixture.componentInstance;

    component.post = signal<Post | null>(null);
    component.edit = signal<boolean>(false);

    postService = TestBed.inject(PostsService);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
