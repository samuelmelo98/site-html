import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchGenericComponent } from './search-generic.component';

describe('SearchGenericComponent', () => {
  let component: SearchGenericComponent;
  let fixture: ComponentFixture<SearchGenericComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchGenericComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchGenericComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
