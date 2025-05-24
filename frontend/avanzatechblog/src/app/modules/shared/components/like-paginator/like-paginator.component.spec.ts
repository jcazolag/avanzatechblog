import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LikePaginatorComponent } from './like-paginator.component';
import { signal } from '@angular/core';
import { LikeResponse } from '@models/Like.models';

describe('LikePaginatorComponent', () => {
  let component: LikePaginatorComponent;
  let fixture: ComponentFixture<LikePaginatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LikePaginatorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LikePaginatorComponent);
    component = fixture.componentInstance;

    component.likes = signal<LikeResponse | null>(null);
    component.currentPage = 1;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
