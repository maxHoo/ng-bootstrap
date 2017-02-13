import {TestBed, ComponentFixture, inject} from '@angular/core/testing';
import {createGenericTestComponent} from '../test/common';

import {By} from '@angular/platform-browser';
import {Component, ViewChild, ChangeDetectionStrategy, Injectable, OnDestroy} from '@angular/core';

import {NgbPopoverModule} from './popover.module';
import {NgbPopoverWindow, NgbPopover} from './popover';
import {NgbPopoverConfig} from './popover-config';

@Injectable()
class SpyService {
  called = false;
}

const createTestComponent = (html: string) =>
    createGenericTestComponent(html, TestComponent) as ComponentFixture<TestComponent>;

const createOnPushTestComponent =
    (html: string) => <ComponentFixture<TestOnPushComponent>>createGenericTestComponent(html, TestOnPushComponent);

describe('ngb-popover-window', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({declarations: [TestComponent], imports: [NgbPopoverModule.forRoot()]});
  });

  it('should render popover on top by default', () => {
    const fixture = TestBed.createComponent(NgbPopoverWindow);
    fixture.componentInstance.title = 'Test title';
    fixture.detectChanges();

    expect(fixture.nativeElement).toHaveCssClass('popover');
    expect(fixture.nativeElement).toHaveCssClass('popover-top');
    expect(fixture.nativeElement.getAttribute('role')).toBe('tooltip');
    expect(fixture.nativeElement.querySelector('.popover-title').textContent).toBe('Test title');
  });

  it('should position popovers as requested', () => {
    const fixture = TestBed.createComponent(NgbPopoverWindow);
    fixture.componentInstance.placement = 'left';
    fixture.detectChanges();
    expect(fixture.nativeElement).toHaveCssClass('popover-left');
  });
});

describe('ngb-popover', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestComponent, TestOnPushComponent, DestroyableCmpt],
      imports: [NgbPopoverModule.forRoot()],
      providers: [SpyService]
    });
  });

  function getWindow(element) { return element.querySelector('ngb-popover-window'); }

  describe('basic functionality', () => {

    it('should display title', () => {
      const fixture = createTestComponent(`<div ngbPopover="Great tip!" popoverTitle="Title"></div>`);
      const directive = fixture.debugElement.query(By.directive(NgbPopover));

      directive.triggerEventHandler('click', {});
      fixture.detectChanges();
      const windowEl = getWindow(fixture.nativeElement);

      expect(windowEl.textContent.trim()).toBe('TitleGreat tip!');
      expect(windowEl.parentNode).toBe(fixture.nativeElement);

      directive.triggerEventHandler('click', {});
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).toBeNull();
    });

  });


  describe('container', () => {

    it('should be appended to the element matching the selector passed to "container"', () => {
      const selector = 'body';
      const fixture = createTestComponent(`<div ngbPopover="Great tip!" container="` + selector + `"></div>`);
      const directive = fixture.debugElement.query(By.directive(NgbPopover));

      directive.triggerEventHandler('click', {});
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).toBeNull();
      expect(getWindow(window.document.querySelector(selector))).not.toBeNull();
    });

    it('should properly destroy popovers when the "container" option is used', () => {
      const selector = 'body';
      const fixture =
          createTestComponent(`<div *ngIf="show" ngbPopover="Great tip!" container="` + selector + `"></div>`);
      const directive = fixture.debugElement.query(By.directive(NgbPopover));

      directive.triggerEventHandler('click', {});
      fixture.detectChanges();

      expect(getWindow(document.querySelector(selector))).not.toBeNull();
      fixture.componentRef.instance.show = false;
      fixture.detectChanges();
      expect(getWindow(document.querySelector(selector))).toBeNull();
    });

  });

  describe('Custom config', () => {
    let config: NgbPopoverConfig;

    beforeEach(() => {
      TestBed.configureTestingModule({imports: [NgbPopoverModule.forRoot()]});
      TestBed.overrideComponent(TestComponent, {set: {template: `<div ngbPopover="Great tip!"></div>`}});
    });

    beforeEach(inject([NgbPopoverConfig], (c: NgbPopoverConfig) => {
      config = c;
      config.placement = 'bottom';
      config.triggers = 'hover';
      config.container = 'body';
    }));

    it('should initialize inputs with provided config', () => {
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      const popover = fixture.componentInstance.popover;

      expect(popover.placement).toBe(config.placement);
      expect(popover.triggers).toBe(config.triggers);
      expect(popover.container).toBe(config.container);
    });
  });

  describe('Custom config as provider', () => {
    let config = new NgbPopoverConfig();
    config.placement = 'bottom';
    config.triggers = 'hover';

    beforeEach(() => {
      TestBed.configureTestingModule(
          {imports: [NgbPopoverModule.forRoot()], providers: [{provide: NgbPopoverConfig, useValue: config}]});
    });

    it('should initialize inputs with provided config as provider', () => {
      const fixture = createTestComponent(`<div ngbPopover="Great tip!"></div>`);
      const popover = fixture.componentInstance.popover;

      expect(popover.placement).toBe(config.placement);
      expect(popover.triggers).toBe(config.triggers);
    });
  });
});

@Component({selector: 'test-cmpt', template: ``})
export class TestComponent {
  name = 'World';
  show = true;
  title: string;
  placement: string;

  @ViewChild(NgbPopover) popover: NgbPopover;

  shown() {}
  hidden() {}
}

@Component({selector: 'test-onpush-cmpt', changeDetection: ChangeDetectionStrategy.OnPush, template: ``})
export class TestOnPushComponent {
}

@Component({selector: 'destroyable-cmpt', template: 'Some content'})
export class DestroyableCmpt implements OnDestroy {
  constructor(private _spyService: SpyService) {}

  ngOnDestroy(): void { this._spyService.called = true; }
}
