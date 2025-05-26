import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LikeButtonComponent } from './like-button.component';
import { LoadingAnimationComponent } from '../loading-animation/loading-animation.component';
import { signal } from '@angular/core';
import { RequestStatus } from '@models/request-status.models';
import { By } from '@angular/platform-browser';

describe('LikeButtonComponent', () => {
  let component: LikeButtonComponent;
  let fixture: ComponentFixture<LikeButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LikeButtonComponent, LoadingAnimationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LikeButtonComponent);
    component = fixture.componentInstance;

    component.liked = false;
    component.status = signal<RequestStatus>('init');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit "like" event when likePost() is called', () => {
    spyOn(component.like, 'emit');
    component.likePost();
    expect(component.like.emit).toHaveBeenCalled();
  });

  it('should emit "like" event when the button is clicked', () => {
    spyOn(component.like, 'emit');
    const button = fixture.debugElement.query(By.css('button'));
    button.triggerEventHandler('click', null);
    expect(component.like.emit).toHaveBeenCalled();
  });

  it('should disable the button when status is "loading"', () => {
    component.status = signal('loading');
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('button'));
    expect(button.nativeElement.disabled).toBeTrue();
  });

  it('should apply the "text-rose-500" class when liked is true', () => {
    component.liked = true;
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('button'));
    expect(button.nativeElement.classList).toContain('text-rose-500');
  });
});
