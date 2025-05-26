import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentComponent } from './comment.component';
import { Comment } from '@models/Comment.models';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';

describe('CommentComponent', () => {
  let component: CommentComponent;
  let fixture: ComponentFixture<CommentComponent>;

  const mockComment: Comment = {
    id: 1,
    user: 42,
    user_name: 'John Doe',
    blog: 1,
    blog_title: 'title',
    content: 'This is a test comment.',
    timestamp: new Date().toISOString(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommentComponent, CommonModule],
    }).compileComponents();

    fixture = TestBed.createComponent(CommentComponent);
    component = fixture.componentInstance;
    component.comment = mockComment;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it("should display the commenter's name", () => {
    const nameElement = fixture.debugElement.query(
      By.css('[name="user_name"]')
    ).nativeElement;
    expect(nameElement).toBeTruthy();
    expect(nameElement.textContent).toContain(mockComment.user_name);
    expect(nameElement.getAttribute('title')).toBe(mockComment.user_name);
  });

  it('should display the comment content', () => {
    const contentElement = fixture.debugElement.query(
      By.css('[name="content"]')
    ).nativeElement;
    expect(contentElement).toBeTruthy();
    expect(contentElement.textContent).toContain(mockComment.content);
  });

  it('should display the formatted timestamp', () => {
    const timestampElement = fixture.debugElement.query(
      By.css('[name="date"]')
    ).nativeElement;
    expect(timestampElement.textContent).toContain(new Date(mockComment.timestamp).toLocaleTimeString());
  });

});
