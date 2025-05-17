import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LikePaginatorComponent } from './like-paginator.component';

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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
