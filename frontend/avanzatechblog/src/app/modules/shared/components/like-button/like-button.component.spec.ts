import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LikeButtonComponent } from './like-button.component';
import { LoadingAnimationComponent } from '../loading-animation/loading-animation.component';
import { signal } from '@angular/core';
import { RequestStatus } from '@models/request-status.models';

describe('LikeButtonComponent', () => {
  let component: LikeButtonComponent;
  let fixture: ComponentFixture<LikeButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LikeButtonComponent, LoadingAnimationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LikeButtonComponent);
    component = fixture.componentInstance;

    component.liked = false;
    component.status = signal<RequestStatus>('init');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
