import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostFormComponent } from './post-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NewPost, Post } from '@models/Post.model';
import { User } from '@models/User.model';
import { CommonModule } from '@angular/common';
import { NgxEditorComponent, NgxEditorMenuComponent } from 'ngx-editor';
import { signal } from '@angular/core';
import { RequestStatus } from '@models/request-status.models';
import { By } from '@angular/platform-browser';

describe('PostFormComponent', () => {
  let component: PostFormComponent;
  let fixture: ComponentFixture<PostFormComponent>;

  let mockUser: User = {
    id: 1,
    email: 'user@user.com',
    team: 1,
  };

  let mockPost: Post = {
    id: 1,
    author: mockUser.id,
    author_name: mockUser.email,
    author_team: mockUser.team,
    author_team_title: 'default',
    title: 'title',
    content: 'content',
    excerpt: 'content',
    timestamp: new Date().toISOString(),
    author_access: 'Read & Write',
    team_access: 'Read & Write',
    authenticated_access: 'Read Only',
    public_access: 'Read Only',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        PostFormComponent,
        ReactiveFormsModule,
        CommonModule,
        FormsModule,
        NgxEditorComponent,
        NgxEditorMenuComponent,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PostFormComponent);
    component = fixture.componentInstance;
    component.status = signal<RequestStatus>('init');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values', () => {
    const form = component.form;
    expect(form.get('title')?.value).toBe('');
    expect(form.get('content')?.value).toBe('');
    expect(form.get('author_access')?.value).toBe('Read & Write');
    expect(form.get('team_access')?.value).toBe('Read & Write');
    expect(form.get('authenticated_access')?.value).toBe('Read Only');
    expect(form.get('public_access')?.value).toBe('Read Only');
  });

  it('should emit action with form data when form is valid', () => {
    spyOn(component.action, 'emit');

    component.form.setValue({
      title: 'Sample Title',
      content: 'Sample Content',
      author_access: 'Read & Write',
      team_access: 'Read & Write',
      authenticated_access: 'Read Only',
      public_access: 'Read Only',
    });

    component.doAction();

    expect(component.action.emit).toHaveBeenCalledWith({
      title: 'Sample Title',
      content: '<p>Sample Content</p>', //innerHTML
      author_access: 'Read & Write',
      team_access: 'Read & Write',
      authenticated_access: 'Read Only',
      public_access: 'Read Only',
    });
  });

  it('should mark form as touched when form is invalid', () => {
    spyOn(component.form, 'markAllAsTouched');

    component.form.get('title')?.setValue('');
    component.doAction();

    expect(component.form.markAllAsTouched).toHaveBeenCalled();
  });

  it('should emit cancel event', () => {
    spyOn(component.cancelAction, 'emit');
    component.cancel();
    expect(component.cancelAction.emit).toHaveBeenCalled();
  });

  it('should update form when post input is set', () => {
    component.post = mockPost;
    fixture.detectChanges();
    component.setForm();

    expect(component.form.get('title')?.value).toBe(mockPost.title);
    expect(component.form.get('content')?.value).toBe(
      `<p>${mockPost.content}</p>`
    ); //innerHTML
    expect(component.form.get('author_access')?.value).toBe(
      mockPost.author_access
    );
    expect(component.form.get('team_access')?.value).toBe(mockPost.team_access);
    expect(component.form.get('authenticated_access')?.value).toBe(
      mockPost.authenticated_access
    );
    expect(component.form.get('public_access')?.value).toBe(
      mockPost.public_access
    );
  });

  it('should restrict access when author_access is Read Only', () => {
    component.form.get('team_access')?.setValue('Read & Write');
    component.form.get('authenticated_access')?.setValue('Read & Write');
    component.form.get('public_access')?.setValue('Read & Write');

    component.form.get('author_access')?.setValue('Read Only');

    expect(component.form.get('team_access')?.value).toBe('Read Only');
    expect(component.form.get('authenticated_access')?.value).toBe('Read Only');
    expect(component.form.get('public_access')?.value).toBe('Read Only');
  });

  it('should cascade None when team_access is None', () => {
    component.form.get('team_access')?.setValue('None');
    expect(component.form.get('authenticated_access')?.value).toBe('None');
    expect(component.form.get('public_access')?.value).toBe('None');
  });

  it('should set public_access to None when authenticated_access is None', () => {
    component.form.get('authenticated_access')?.setValue('None');
    expect(component.form.get('public_access')?.value).toBe('None');
  });

  describe('template', () => {

    beforeEach(async () => {
      component.title = 'New Post';
      component.buttonText = 'Publish';
      fixture.detectChanges();
    })

    it('should render the title in an h1', () => {
      const h1: HTMLElement = fixture.nativeElement.querySelector('h1');
      expect(h1).toBeTruthy();
      expect(h1.textContent).toContain('New Post');
    });

    it('should show "This field is mandatory" for required title when touched and empty', () => {
      const control = component.form.get('title');
      control?.setValue('');
      control?.markAsTouched();
      fixture.detectChanges();

      const errorMsg = fixture.debugElement.query(By.css('p[name="warning"]')).nativeElement;
      expect(errorMsg).toBeTruthy();
      expect(errorMsg.textContent).toContain('This field is mandatory');
    });

    it('should show max length error for title when too long', () => {
      const control = component.form.get('title');
      control?.setValue('a'.repeat(60));
      control?.markAsTouched();
      fixture.detectChanges();

      const errorMsg = fixture.debugElement.query(By.css('p[name="warning"]')).nativeElement;
      expect(errorMsg).toBeTruthy();
      expect(errorMsg.textContent).toContain(
        'should be less or equal than 50 characters'
      );
    });

    it('should show content required error when touched and empty', () => {
      const control = component.form.get('content');
      control?.setValue('');
      control?.markAsTouched();
      fixture.detectChanges();

      const errorMsg = fixture.debugElement.query(By.css('p[name="warning"]')).nativeElement;
      expect(errorMsg).toBeTruthy();
      expect(errorMsg.textContent).toContain('This field is mandatory');
    });

    it('should disable submit button and show spinner when status is "loading"', () => {
      component.status = signal<RequestStatus>('loading');
      fixture.detectChanges();

      const submitBtn: HTMLButtonElement = fixture.nativeElement.querySelector(
        'button[type="submit"]'
      );
      expect(submitBtn.disabled).toBeTrue();

      const spinner = submitBtn.querySelector('.animate-spin');
      expect(spinner).toBeTruthy();
    });

    it('should show "Retry" on submit button when status is "failed"', () => {
      component.status = signal<RequestStatus>('failed');
      fixture.detectChanges();

      const submitBtn: HTMLButtonElement = fixture.nativeElement.querySelector(
        'button[type="submit"]'
      );
      expect(submitBtn.textContent).toContain('Retry');
    });

    it('should call doAction() when form is submitted', () => {
      spyOn(component, 'doAction');
      const form: HTMLFormElement =
        fixture.nativeElement.querySelector('#postForm');
      form.dispatchEvent(new Event('submit'));
      expect(component.doAction).toHaveBeenCalled();
    });

    it('should call cancel() when cancel button is clicked', () => {
      spyOn(component, 'cancel');
      const cancelBtn = fixture.debugElement.query(By.css('button[name="cancel"]')).nativeElement;
      cancelBtn.click();
      expect(component.cancel).toHaveBeenCalled();
    });
  });
});
