import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteButtonComponent } from './delete-button.component';
import { signal, WritableSignal } from '@angular/core';
import { RequestStatus } from '@models/request-status.models';
import { AlertComponent } from '../alert/alert.component';
import { By } from '@angular/platform-browser';

describe('DeleteButtonComponent', () => {
  let component: DeleteButtonComponent;
  let fixture: ComponentFixture<DeleteButtonComponent>;
  let statusSignal: WritableSignal<RequestStatus>;
  let messageSignal: WritableSignal<string[]>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteButtonComponent, AlertComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteButtonComponent);
    component = fixture.componentInstance;
    statusSignal = signal<RequestStatus>('init');
    messageSignal = signal<string[]>([]);
    component.title = 'Confirm';
    component.status = statusSignal;
    component.message = messageSignal;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle alert visibility when clicking the delete button', () => {
    const deleteButton = fixture.debugElement.query(By.css('button'));
    deleteButton.triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(component.alert).toBeTrue();
  });

  it('should emit "action" event when doAction() is called', () => {
    spyOn(component.action, 'emit');
    component.doAction();
    expect(component.action.emit).toHaveBeenCalled();
  });

  it('should toggle "alert" state when toggleAlert() is called', () => {
    spyOn(component, 'toggleAlert').and.callThrough();
    component.toggleAlert();
    expect(component.toggleAlert).toHaveBeenCalled();
    expect(component.alert).toBeTrue();
  });

  it('should pass correct inputs to the child AlertComponent', () => {
    component.alert = true;
    fixture.detectChanges();

    const alertComponent = fixture.debugElement.query(By.css('app-alert'));
    expect(alertComponent).toBeTruthy();

    const alertInstance = alertComponent.componentInstance;
    expect(alertInstance.title).toBe(component.title);
    expect(alertInstance.status).toBe(component.status);
    expect(alertInstance.message).toBe(component.message);
    expect(alertInstance.alert).toBeTrue();
  });

  it('should reflect updated status and message signals', () => {
    statusSignal.set('failed');
    messageSignal.set(['Failed to delete item']);
    fixture.detectChanges();

    expect(component.status()).toBe('failed');
    expect(component.message()).toEqual(['Failed to delete item']);
  });
});
