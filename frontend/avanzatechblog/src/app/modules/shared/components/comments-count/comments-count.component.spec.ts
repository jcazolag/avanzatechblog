import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentsCountComponent } from './comments-count.component';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

describe('CommentsCountComponent', () => {
  let component: CommentsCountComponent;
  let fixture: ComponentFixture<CommentsCountComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommentsCountComponent, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(CommentsCountComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    //fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('Should show the number of comments', () => {
    component.commentsCount = 5;
    fixture.detectChanges();

    const spanElement: HTMLElement =
      fixture.nativeElement.querySelector('span');
    expect(spanElement.textContent).toContain('5');
  });

  it('should navigate to the defined link when clic', () => {
    const navigateSpy = spyOn(router, 'navigate');
    component.link = ['/ruta', 123];
    fixture.detectChanges();

    const buttonElement: HTMLElement =
      fixture.nativeElement.querySelector('button');
    buttonElement.click();

    expect(navigateSpy).toHaveBeenCalledWith(['/ruta', 123]);
  });

  it('should not navigate when the link is not defined', () => {
    const navigateSpy = spyOn(router, 'navigate');
    fixture.detectChanges();

    const buttonElement: HTMLElement =
      fixture.nativeElement.querySelector('button');
    buttonElement.click();

    expect(navigateSpy).not.toHaveBeenCalled();
  });
});
