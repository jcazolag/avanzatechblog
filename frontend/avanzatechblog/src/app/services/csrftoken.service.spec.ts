import { TestBed } from '@angular/core/testing';

import { CsrftokenService } from './csrftoken.service';

describe('CsrftokenService', () => {
  let service: CsrftokenService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CsrftokenService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
