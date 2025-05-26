import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LikePaginatorComponent } from './like-paginator.component';
import { ElementRef, signal } from '@angular/core';
import { LikeResponse } from '@models/Like.models';
import { By } from '@angular/platform-browser';

describe('LikePaginatorComponent', () => {
  let component: LikePaginatorComponent;
  let fixture: ComponentFixture<LikePaginatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LikePaginatorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LikePaginatorComponent);
    component = fixture.componentInstance;

    component.currentPage = 1;
    component.likes = signal({
      total_count: 3,
      current_page: 1,
      total_pages: 2,
      previous_page: null,
      next_page: 'nextpage',
      results: [
        {
          id: 1,
          user: 1,
          blog: 1,
          user_name: 'user1@email.com',
          created_at: new Date().toISOString(),
        },
        {
          id: 2,
          user: 2,
          blog: 1,
          user_name: 'user2@email.com',
          created_at: new Date().toISOString(),
        },
        {
          id: 3,
          user: 3,
          blog: 1,
          user_name: 'user3@email.com',
          created_at: new Date().toISOString(),
        },
      ],
    });

    component.message = signal([]);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit getLikesEmmitter with current page on getLikes()', () => {
    spyOn(component.getLikesEmmitter, 'emit');
    component.getLikes();
    expect(component.getLikesEmmitter.emit).toHaveBeenCalledWith(
      component.currentPage
    );
  });

  it('should open the popover when togglePopover is called', () => {
    const event = new MouseEvent('click');
    component.togglePopover(event);
    expect(component.popoverOpen).toBeTrue();
  });

  it('should close the popover when clicking outside the popover element', () => {
    const popoverElement = document.createElement('div');
    component.popoverRef = { nativeElement: popoverElement } as ElementRef;
    component.popoverOpen = true;

    // simulate document click outside popover
    const event = new MouseEvent('click');
    spyOn(popoverElement, 'contains').and.returnValue(false);

    component.onDocumentClick(event);
    expect(component.popoverOpen).toBeFalse();
  });

  it('should render total count in the trigger area', () => {
    const span = fixture.debugElement.query(By.css('span'));
    expect(span.nativeElement.textContent).toContain('3');
  });

  it('should emit correct page on previous page button click', () => {
    component.popoverOpen = true;
    fixture.detectChanges();
    spyOn(component.getLikesEmmitter, 'emit');
    const nextButton = fixture.debugElement.query(By.css('button[name="previous"]'));
    expect(nextButton).toBeTruthy();
    nextButton?.nativeElement.click();
    expect(component.getLikesEmmitter.emit).toHaveBeenCalledWith(
      component.currentPage - 1
    );
  });

  it('should emit correct page on next page button click', () => {
    component.popoverOpen = true;
    fixture.detectChanges();
    spyOn(component.getLikesEmmitter, 'emit');
    const nextButton = fixture.debugElement.query(By.css('button[name="next"]'));
    expect(nextButton).toBeTruthy();
    nextButton?.nativeElement.click();
    expect(component.getLikesEmmitter.emit).toHaveBeenCalledWith(
      component.currentPage + 1
    );
  });

  it('should display message items if message list is not empty', () => {
    component.message = signal(['Something went wrong']);
    component.popoverOpen = true;
    fixture.detectChanges();

    const messageElement = fixture.debugElement.query(By.css('p[name="errorMsg"'));
    expect(messageElement).toBeTruthy();
    expect(messageElement.nativeElement.textContent).toContain(
      'Something went wrong'
    );
  });
});
