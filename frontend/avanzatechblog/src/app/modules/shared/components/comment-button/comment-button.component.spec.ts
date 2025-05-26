import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { CommentButtonComponent } from './comment-button.component';

describe('CommentButtonComponent', () => {
  let component: CommentButtonComponent;
  let fixture: ComponentFixture<CommentButtonComponent>;
  let router: Router;
  let navigateSpy: jasmine.Spy;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommentButtonComponent, RouterTestingModule],
    }).compileComponents();

    router = TestBed.inject(Router);
    navigateSpy = spyOn(router, 'navigate');
    fixture = TestBed.createComponent(CommentButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to the input route when clic', () => {
    const rutaDestino = ['/comments', 42];
    component.targetPage = rutaDestino;
    fixture.detectChanges();

    const boton = fixture.nativeElement.querySelector('button');
    boton.click();

    expect(navigateSpy).toHaveBeenCalledWith(rutaDestino);
  });

  it('should not navigate if targetPage is not defined', () => {
    component.targetPage = undefined!;
    fixture.detectChanges();

    const boton = fixture.nativeElement.querySelector('button');
    boton.click();

    expect(navigateSpy).not.toHaveBeenCalled();
  });
});
