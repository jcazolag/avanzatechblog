import { ComponentFixture, TestBed } from '@angular/core/testing';

import ServerErrorPageComponent from './server-error-page.component';
import { By } from '@angular/platform-browser';
import { ServerErrorComponent } from '@modules/shared/server-error/server-error.component';

describe('ServerErrorPageComponent', () => {
  let component: ServerErrorPageComponent;
  let fixture: ComponentFixture<ServerErrorPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServerErrorPageComponent, ServerErrorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServerErrorPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render <app-server-error />', () => {
    const notfound = fixture.debugElement.query(By.css('app-server-error'));
    expect(notfound).toBeTruthy();
  });
});
