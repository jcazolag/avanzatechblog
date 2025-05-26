import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { CommentFormComponent } from './comment-form.component';
import { LoadingAnimationComponent } from '@modules/shared/components/loading-animation/loading-animation.component';
import { CommentService } from '@services/comment.service';
import { User } from '@models/User.model';
import { UserService } from '@services/user.service';
import { of, throwError } from 'rxjs';
import { Comment } from '@models/Comment.models';

describe('CommentFormComponent', () => {
  let component: CommentFormComponent;
  let fixture: ComponentFixture<CommentFormComponent>;
  let formBuilder: FormBuilder;
  let commentServiceSpy: jasmine.SpyObj<CommentService>;

  let mockUser: User = {
    id: 1,
    email: 'user@user.com',
    team: 1,
  };

  let mockComment: Comment = {
    id: 123,
    user: mockUser.id, 
    user_name: mockUser.email,
    blog: 123,
    content: 'content',
    blog_title: 'title',
    timestamp: new Date().toISOString(),
  }

  beforeEach(async () => {
    const commentSpy = jasmine.createSpyObj('CommentService', ['commentPost']);

    await TestBed.configureTestingModule({
      imports: [
        CommentFormComponent,
        ReactiveFormsModule,
        LoadingAnimationComponent,
      ],
      providers: [
        { provide: CommentService, useValue: commentSpy },
        { provide: UserService, useValue: { user: undefined } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CommentFormComponent);
    component = fixture.componentInstance;

    formBuilder = TestBed.inject(FormBuilder);
    commentServiceSpy = TestBed.inject(
      CommentService
    ) as jasmine.SpyObj<CommentService>;

    component.post_id = 123;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should mark the form invalid if content is empty', () => {
    component.form.get('content')?.setValue('');
    expect(component.form.invalid).toBeTrue();
  });

  it('should call commentPost and emit event on success', fakeAsync(() => {
    const commentSpy = spyOn(component.getComments, 'emit');
    commentServiceSpy.commentPost.and.returnValue(of(mockComment));

    component.form.get('content')?.setValue('Hello!');
    component.commentPost();
    tick(); // simulate async

    expect(component.status).toBe('init');
    expect(commentSpy).toHaveBeenCalled();
    expect(component.message()).toEqual([]);
  }));

  it('should handle internal server error gracefully', fakeAsync(() => {
    const error = { status: 0 };
    commentServiceSpy.commentPost.and.returnValue(throwError(() => error));

    component.form.get('content')?.setValue('Hello!');
    component.commentPost();
    tick();

    expect(component.status).toBe('failed');
    expect(component.message()).toContain(
      'Internal Server Error. Cannot connect to server.'
    );
  }));

  it('should show backend validation errors', fakeAsync(() => {
    const error = {
      status: 400,
      error: {
        content: 'Comment is too short',
      },
    };
    commentServiceSpy.commentPost.and.returnValue(throwError(() => error));

    component.form.get('content')?.setValue('a');
    component.commentPost();
    tick();

    expect(component.status).toBe('failed');
    expect(component.message()).toContain('Comment is too short');
  }));

  it('should reset form and hide Cancel button on cancel()', () => {
    component.form.get('content')?.setValue('Hello');
    component.contentFocused = true;

    component.cancel();

    expect(component.form.get('content')?.value).toBe('');
    expect(component.form.get('content')?.touched).toBeFalse();
    expect(component.contentFocused).toBeFalse();
  });

  it('should update contentFocused to true on textarea focus', () => {
    component.onFocus();
    expect(component.contentFocused).toBeTrue();
  });

  it('should not submit form if invalid and mark all as touched', () => {
    component.form.get('content')?.setValue('');
    component.commentPost();

    expect(component.form.touched).toBeTrue();
    expect(component.status).toBe('init');
  });
});
