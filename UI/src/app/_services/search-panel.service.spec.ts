import { TestBed } from '@angular/core/testing';

import { SearchPanelService } from './search-panel.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('SearchPanelService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    })
  );

  it('should be created', () => {
    const service: SearchPanelService = TestBed.get(SearchPanelService);
    expect(service).toBeTruthy();
  });
});
