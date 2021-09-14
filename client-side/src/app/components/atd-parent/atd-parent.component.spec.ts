import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AtdParentComponent } from './atd-parent.component';

describe('AtdParentComponent', () => {
  let component: AtdParentComponent;
  let fixture: ComponentFixture<AtdParentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AtdParentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AtdParentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
