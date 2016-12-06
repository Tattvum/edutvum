import { AppComponent } from './app.component';
import { IupacService } from './iupac/iupac.service';

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

describe('AppComponent', function () {
  let de: DebugElement;
  let comp: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AppComponent],
      providers: [IupacService]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    comp = fixture.componentInstance;
    de = fixture.debugElement.query(By.css('button'));
  });

  it('should create component', () => expect(comp).toBeDefined());

  it('<button> is "Hide" at start', () => {
    fixture.detectChanges();
    const h1 = de.nativeElement;
    expect(h1.innerText).toBe('Hide');
  });
});
