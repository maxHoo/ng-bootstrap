import {TestBed, ComponentFixture, inject} from '@angular/core/testing';
import {createGenericTestComponent} from '../test/common';

import {By} from '@angular/platform-browser';
import {Component, ViewChild, ChangeDetectionStrategy, TemplateRef, Input,
  Directive,
  Renderer,
  Injector,
  ElementRef,
  ViewContainerRef,
  ComponentFactoryResolver,
  NgZone,
  NgModule
} from '@angular/core';

import {NgbPopupAnchor, NgbPopup} from './popup';

const createTestComponent =
    (html: string) => <ComponentFixture<TestComponent>>createGenericTestComponent(html, TestComponent);

const createOnPushTestComponent =
    (html: string) => <ComponentFixture<TestOnPushComponent>>createGenericTestComponent(html, TestOnPushComponent);


describe('ngb-popup-test-window', () => {
  beforeEach(() => TestBed.configureTestingModule({imports: [NgbPopupTestModule]}));

  it('should render popup on top by default', () => {
    const fixture = TestBed.createComponent(NgbPopupTestWindow);
    fixture.detectChanges();

    expect(fixture.nativeElement).toHaveCssClass('popup');
    expect(fixture.nativeElement).toHaveCssClass('popup-top');
    expect(fixture.nativeElement.getAttribute('role')).toBe('tooltip');
  });

  it('should position popup as requested', () => {
    const fixture = TestBed.createComponent(NgbPopupTestWindow);
    fixture.componentInstance.placement = 'left';
    fixture.detectChanges();
    expect(fixture.nativeElement).toHaveCssClass('popup-left');
  });
});

describe('ngb-popup', () => {

  beforeEach(() => TestBed.configureTestingModule({imports: [NgbPopupTestModule]}));

  function getWindow(element) { return element.querySelector('ngb-popup-test-window'); }

  describe('basic functionality', () => {

    it('should open and close a popup - default settings and content as string', () => {
      const fixture = createTestComponent(`<div ngbPopupTestAnchor="Great tip!">test</div>`);
      const directive = fixture.debugElement.query(By.directive(NgbPopupTestAnchor));

      directive.triggerEventHandler('mouseenter', {});
      fixture.detectChanges();

      // TODO investigate why this doesnt work v
      const windowEl = getWindow(fixture.nativeElement);

      expect(windowEl).toHaveCssClass('popup');
      expect(windowEl).toHaveCssClass('popup-top');
      expect(windowEl.textContent.trim()).toBe('Great tip!');
      expect(windowEl.getAttribute('role')).toBe('tooltip');
      expect(windowEl.parentNode).toBe(fixture.nativeElement);

      directive.triggerEventHandler('mouseleave', {});
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).toBeNull();
    });
    /*

    it('should open and close a tooltip - default settings and content from a template', () => {
      const fixture = createTestComponent(`<template #t>Hello, {{name}}!</template><div [ngbTooltip]="t"></div>`);
      const directive = fixture.debugElement.query(By.directive(NgbTooltip));

      directive.triggerEventHandler('mouseenter', {});
      fixture.detectChanges();
      const windowEl = getWindow(fixture.nativeElement);

      expect(windowEl).toHaveCssClass('tooltip');
      expect(windowEl).toHaveCssClass('tooltip-top');
      expect(windowEl.textContent.trim()).toBe('Hello, World!');
      expect(windowEl.getAttribute('role')).toBe('tooltip');
      expect(windowEl.parentNode).toBe(fixture.nativeElement);

      directive.triggerEventHandler('mouseleave', {});
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).toBeNull();
    });

    it('should open and close a tooltip - default settings, content from a template and context supplied', () => {
      const fixture = createTestComponent(`<template #t let-name="name">Hello, {{name}}!</template><div [ngbTooltip]="t"></div>`);
      const directive = fixture.debugElement.query(By.directive(NgbTooltip));

      directive.context.tooltip.open({name: 'John'});
      fixture.detectChanges();
      const windowEl = getWindow(fixture.nativeElement);

      expect(windowEl).toHaveCssClass('tooltip');
      expect(windowEl).toHaveCssClass('tooltip-top');
      expect(windowEl.textContent.trim()).toBe('Hello, John!');
      expect(windowEl.getAttribute('role')).toBe('tooltip');
      expect(windowEl.parentNode).toBe(fixture.nativeElement);

      directive.triggerEventHandler('mouseleave', {});
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).toBeNull();
    });

    it('should not open a tooltip if content is falsy', () => {
      const fixture = createTestComponent(`<div [ngbTooltip]="notExisting"></div>`);
      const directive = fixture.debugElement.query(By.directive(NgbTooltip));

      directive.triggerEventHandler('mouseenter', {});
      fixture.detectChanges();
      const windowEl = getWindow(fixture.nativeElement);

      expect(windowEl).toBeNull();
    });

    it('should close the tooltip tooltip if content becomes falsy', () => {
      const fixture = createTestComponent(`<div [ngbTooltip]="name"></div>`);
      const directive = fixture.debugElement.query(By.directive(NgbTooltip));

      directive.triggerEventHandler('mouseenter', {});
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).not.toBeNull();

      fixture.componentInstance.name = null;
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).toBeNull();
    });

    it('should allow re-opening previously closed tooltips', () => {
      const fixture = createTestComponent(`<div ngbTooltip="Great tip!"></div>`);
      const directive = fixture.debugElement.query(By.directive(NgbTooltip));

      directive.triggerEventHandler('mouseenter', {});
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).not.toBeNull();

      directive.triggerEventHandler('mouseleave', {});
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).toBeNull();

      directive.triggerEventHandler('mouseenter', {});
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).not.toBeNull();
    });

    it('should not leave dangling tooltips in the DOM', () => {
      const fixture = createTestComponent(`<template [ngIf]="show"><div ngbTooltip="Great tip!"></div></template>`);
      const directive = fixture.debugElement.query(By.directive(NgbTooltip));

      directive.triggerEventHandler('mouseenter', {});
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).not.toBeNull();

      fixture.componentInstance.show = false;
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).toBeNull();
    });

    it('should properly cleanup tooltips with manual triggers', () => {
      const fixture = createTestComponent(`
            <template [ngIf]="show">
              <div ngbTooltip="Great tip!" triggers="manual" #t="ngbTooltip" (mouseenter)="t.open()"></div>
            </template>`);
      const directive = fixture.debugElement.query(By.directive(NgbTooltip));

      directive.triggerEventHandler('mouseenter', {});
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).not.toBeNull();

      fixture.componentInstance.show = false;
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).toBeNull();
    });
    */
  });
});

@Component({
  selector: 'ngb-popup-test-window',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {'[class]': 'type + " show " + type + "-" + placement', 'role': 'tooltip'},
  template: `<ng-content></ng-content>`
})
export class NgbPopupTestWindow extends NgbPopup {
  constructor() {
    super();
  }
}

@Directive({
  selector: '[ngbPopupTestAnchor]',
  exportAs: 'ngbPopupTestAnchor'})
export class NgbPopupTestAnchor extends NgbPopupAnchor<NgbPopupTestWindow> {
  @Input('ngbPopupTestAnchor') content: string | TemplateRef<any>;

  constructor(
    protected renderer: Renderer,
    protected injector: Injector,
    protected elementRef: ElementRef,
    protected viewContainerRef: ViewContainerRef,
    protected resolver: ComponentFactoryResolver,
    protected ngZone: NgZone) {
    super(
      NgbPopupTestWindow,
      renderer,
      injector,
      elementRef,
      viewContainerRef,
      resolver,
      ngZone);
  }
}

@Component({selector: 'test-cmpt', template: ``})
export class TestComponent {
  name = 'World';
  show = true;

  @ViewChild(NgbPopupTestAnchor) popupTestAnchor: NgbPopupTestAnchor;
}

@Component({selector: 'test-onpush-cmpt', changeDetection: ChangeDetectionStrategy.OnPush, template: ``})
export class TestOnPushComponent {
}


@NgModule({
  exports: [NgbPopupTestAnchor, NgbPopupTestWindow],
  declarations: [TestComponent, TestOnPushComponent, NgbPopupTestAnchor, NgbPopupTestWindow],
  entryComponents: [NgbPopupTestWindow],
})
class NgbPopupTestModule {
}
