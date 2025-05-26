import { RouterTestingModule } from '@angular/router/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import NotFoundComponent from './not-found.component';
import { NotfoundComponent } from '@modules/shared/notfound/notfound.component';
import { By } from '@angular/platform-browser';

describe('NotFoundComponent', () => {
  let component: NotFoundComponent;
  let fixture: ComponentFixture<NotFoundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotFoundComponent, NotfoundComponent, RouterTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotFoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render <app-notfound/>', () => {
    const notfound = fixture.debugElement.query(By.css('app-notfound'));
    expect(notfound).toBeTruthy();
  });
});
