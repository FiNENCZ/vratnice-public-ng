import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PovoleniVjezduVozidlaComponent } from './povoleni-vjezdu-vozidla.component';

describe('PovoleniVjezduVozidlaComponent', () => {
  let component: PovoleniVjezduVozidlaComponent;
  let fixture: ComponentFixture<PovoleniVjezduVozidlaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PovoleniVjezduVozidlaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PovoleniVjezduVozidlaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
