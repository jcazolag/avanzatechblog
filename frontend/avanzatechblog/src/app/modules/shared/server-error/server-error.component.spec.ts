import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServerErrorComponent } from './server-error.component';
import { By } from '@angular/platform-browser';

describe('ServerErrorComponent', () => {
  let component: ServerErrorComponent;
  let fixture: ComponentFixture<ServerErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServerErrorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ServerErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display error code 500', () => {
    const errorCode = fixture.debugElement.query(By.css('h1')).nativeElement
      .textContent;
    expect(errorCode.trim()).toBe('500');
  });

  it('should display "Somethings missing." message', () => {
    const message = fixture.debugElement.query(By.css('p.text-3xl'))
      .nativeElement.textContent;
    expect(message.trim()).toBe("Internal Server Error");
  });

});
