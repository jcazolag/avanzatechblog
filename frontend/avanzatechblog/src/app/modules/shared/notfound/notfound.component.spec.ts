import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotfoundComponent } from './notfound.component';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';

describe('NotfoundComponent', () => {
  let component: NotfoundComponent;
  let fixture: ComponentFixture<NotfoundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotfoundComponent, RouterTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotfoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display error code 401', () => {
    const errorCode = fixture.debugElement.query(By.css('h1')).nativeElement
      .textContent;
    expect(errorCode.trim()).toBe('404');
  });

  it('should display "Somethings missing." message', () => {
    const message = fixture.debugElement.query(By.css('p.text-3xl'))
      .nativeElement.textContent;
    expect(message.trim()).toBe("Something's missing.");
  });

  it('should contain a link back to homepage', () => {
    const link = fixture.debugElement.query(By.css('a[routerLink="/"]'));
    expect(link).toBeTruthy();
    expect(link.nativeElement.textContent).toContain('Back to Homepage');
  });
});
