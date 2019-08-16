import { TestBed } from '@angular/core/testing';

import { SearchPanelService } from './search-panel.service';

describe('SearchPanelService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SearchPanelService = TestBed.get(SearchPanelService);
    expect(service).toBeTruthy();
  });
});
