import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditButtonComponent } from './edit-button.component';
import { By } from '@angular/platform-browser';

describe('EditButtonComponent', () => {
  let component: EditButtonComponent;
  let fixture: ComponentFixture<EditButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EditButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit "action" event when doAction() is called', () => {
    spyOn(component.action, 'emit');
    component.doAction();
    expect(component.action.emit).toHaveBeenCalled();
  });

  it('should emit "action" event when the button is clicked', () => {
    spyOn(component.action, 'emit');
    const button = fixture.debugElement.query(By.css('button'));
    button.triggerEventHandler('click', null);
    expect(component.action.emit).toHaveBeenCalled();
  });
});
