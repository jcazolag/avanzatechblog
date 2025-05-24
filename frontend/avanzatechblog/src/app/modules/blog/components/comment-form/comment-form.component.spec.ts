import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { CommentFormComponent } from './comment-form.component';
import { LoadingAnimationComponent } from '@modules/shared/components/loading-animation/loading-animation.component';
import { CommentService } from '@services/comment.service';

describe('CommentFormComponent', () => {
  let component: CommentFormComponent;
  let fixture: ComponentFixture<CommentFormComponent>;
  let formBuilder: FormBuilder;
  let commentService: CommentService;
  

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommentFormComponent, ReactiveFormsModule, LoadingAnimationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommentFormComponent);
    component = fixture.componentInstance;

    formBuilder = TestBed.inject(FormBuilder);
    commentService = TestBed.inject(CommentService);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
