import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertComponent } from './alert.component';
import { LoadingAnimationComponent } from '../loading-animation/loading-animation.component';
import { By } from '@angular/platform-browser';
import { signal } from '@angular/core';

describe('AlertComponent', () => {
  let component: AlertComponent;
  let fixture: ComponentFixture<AlertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertComponent, LoadingAnimationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('Should show title', () => {
    component.title = 'Mock title';
    component.alert = true;
    fixture.detectChanges();

    const titleElement = fixture.debugElement.query(By.css('h3'));
    expect(titleElement.nativeElement.textContent).toContain('Mock title');
  });

  it('Should show error message', () => {
    component.message = signal(['Error 1', 'Error 2']);
    component.alert = true;
    fixture.detectChanges();

    const messages = fixture.debugElement.queryAll(By.css('p.text-red-500'));
    expect(messages.length).toBe(2);
    expect(messages[0].nativeElement.textContent).toContain('Error 1');
    expect(messages[1].nativeElement.textContent).toContain('Error 2');
  });

  it('should show button with custom text', () => {
    component.button_text = 'Confirm';
    component.status = signal('init');
    component.alert = true;
    fixture.detectChanges();

    const actionButton = fixture.debugElement.query(
      By.css('button.text-white')
    );
    expect(actionButton.nativeElement.textContent).toContain('Confirm');
  });

  it('should emit toggle event when closing alert', () => {
    spyOn(component.toggle, 'emit');
    component.alert = true;
    fixture.detectChanges();

    const closeButton = fixture.debugElement.query(By.css('button.absolute'));
    closeButton.triggerEventHandler('click', null);
    expect(component.toggle.emit).toHaveBeenCalled();
  });

  it('should emit action event when clicking on action butoon', () => {
    spyOn(component.action, 'emit');
    component.status = signal('init');
    component.alert = true;
    fixture.detectChanges();

    const actionButton = fixture.debugElement.query(
      By.css('button.text-white')
    );
    actionButton.triggerEventHandler('click', null);
    expect(component.action.emit).toHaveBeenCalled();
  });

  it('should show loading animation when status is "loading"', () => {
    component.status = signal('loading');
    component.alert = true;
    fixture.detectChanges();

    const loadingAnimation = fixture.debugElement.query(
      By.css('app-loading-animation')
    );
    expect(loadingAnimation).toBeTruthy();
  });

  it('should show "Retry" when status is "failed"', () => {
    component.status = signal('failed');
    component.alert = true;
    fixture.detectChanges();

    const actionButton = fixture.debugElement.query(
      By.css('button.text-white')
    );
    expect(actionButton.nativeElement.textContent).toContain('Retry');
  });

  it('should apply hidden class when alert is false', () => {
    component.alert = false;
    fixture.detectChanges();

    const modal = fixture.debugElement.query(By.css('#popup-modal'));
    expect(modal.nativeElement.classList).toContain('hidden');
  });
});
