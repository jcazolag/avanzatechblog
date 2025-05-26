import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingAnimationComponent } from './loading-animation.component';
import { By } from '@angular/platform-browser';

describe('LoadingAnimationComponent', () => {
  let component: LoadingAnimationComponent;
  let fixture: ComponentFixture<LoadingAnimationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingAnimationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LoadingAnimationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should use default border color when none is provided', () => {
    const spinnerDiv = fixture.debugElement.query(By.css('.animate-spin'));
    expect(spinnerDiv.nativeElement.className).toContain('border-gray-700');
  });

  it('should apply custom border color', () => {
    component.border_color = 'rose-500';
    fixture.detectChanges();

    const spinnerDiv = fixture.debugElement.query(By.css('.animate-spin'));
    expect(spinnerDiv.nativeElement.className).toContain('border-rose-500');
  });

  it('should display screen-reader-only text', () => {
    const srText = fixture.debugElement.query(By.css('.sr-only'));
    expect(srText.nativeElement.textContent.trim()).toBe('Loading...');
  });
});
