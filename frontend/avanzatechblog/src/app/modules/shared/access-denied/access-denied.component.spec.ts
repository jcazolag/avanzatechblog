import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessDeniedComponent } from './access-denied.component';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';

describe('AccessDeniedComponent', () => {
  let component: AccessDeniedComponent;
  let fixture: ComponentFixture<AccessDeniedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccessDeniedComponent, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(AccessDeniedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display error code 401', () => {
    const errorCode = fixture.debugElement.query(By.css('h1')).nativeElement
      .textContent;
    expect(errorCode.trim()).toBe('401');
  });

  it('should display "Access denied" message', () => {
    const message = fixture.debugElement.query(By.css('p.text-3xl'))
      .nativeElement.textContent;
    expect(message.trim()).toBe('Access denied');
  });

  it('should contain a link back to homepage', () => {
    const link = fixture.debugElement.query(By.css('a[routerLink="/"]'));
    expect(link).toBeTruthy();
    expect(link.nativeElement.textContent).toContain('Back to Homepage');
  });
});
