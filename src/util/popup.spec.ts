import {TestBed, ComponentFixture, inject} from '@angular/core/testing';
import {createGenericTestComponent} from '../test/common';

import {By} from '@angular/platform-browser';
import {
  Component,
  ViewChild,
  ChangeDetectionStrategy,
  TemplateRef,
  Input,
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
import {NgbPopupConfig} from './popup-config';
import {listenToTriggers} from '../util/triggers';

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

  beforeEach(
      () => TestBed.configureTestingModule(
          {declarations: [TestComponent, TestOnPushComponent], imports: [NgbPopupTestModule]}));

  function getWindow(element) { return element.querySelector('ngb-popup-test-window'); }

  describe('basic functionality', () => {

    it('should open and close a popup - default settings and content as string', () => {
      const fixture = createTestComponent(`<div ngbPopupTestAnchor="Great tip!">test</div>`);
      const directive = fixture.debugElement.query(By.directive(NgbPopupTestAnchor));
      const defaultConfig = new NgbPopupConfig();

      directive.triggerEventHandler('mouseenter', {});
      fixture.detectChanges();
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

    it('should open and close a popup - default settings and content from a template', () => {
      const fixture = createTestComponent(`<template #t>Hello, {{name}}!</template><div [ngbPopupTestAnchor]="t"></div>`);
      const directive = fixture.debugElement.query(By.directive(NgbPopupTestAnchor));

      directive.triggerEventHandler('mouseenter', {});
      fixture.detectChanges();
      const windowEl = getWindow(fixture.nativeElement);

      expect(windowEl).toHaveCssClass('popup');
      expect(windowEl).toHaveCssClass('popup-top');
      expect(windowEl.textContent.trim()).toBe('Hello, World!');
      expect(windowEl.getAttribute('role')).toBe('tooltip');
      expect(windowEl.parentNode).toBe(fixture.nativeElement);

      directive.triggerEventHandler('mouseleave', {});
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).toBeNull();
    });

    it('should open and close a popup - default settings, content from a template and context supplied', () => {
      const fixture = createTestComponent(`<template #t let-name="name">Hello, {{name}}!</template><div [ngbPopupTestAnchor]="t"></div>`);
      const directive = fixture.debugElement.query(By.directive(NgbPopupTestAnchor));

      directive.context.popup.open({name: 'John'});
      fixture.detectChanges();
      const windowEl = getWindow(fixture.nativeElement);

      expect(windowEl).toHaveCssClass('popup');
      expect(windowEl).toHaveCssClass('popup-top');
      expect(windowEl.textContent.trim()).toBe('Hello, John!');
      expect(windowEl.getAttribute('role')).toBe('tooltip');
      expect(windowEl.parentNode).toBe(fixture.nativeElement);

      directive.triggerEventHandler('mouseleave', {});
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).toBeNull();
    });

/*
    it('should properly destroy TemplateRef content', () => {
      const fixture = createTestComponent(`
          <template #t><destroyable-cmpt></destroyable-cmpt></template>
          <div [ngbPopupTestAnchor]="t"></div>`);
      const directive = fixture.debugElement.query(By.directive(NgbPopupTestAnchor));
      const spyService = fixture.debugElement.injector.get(SpyService);

      directive.triggerEventHandler('click', {});
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).not.toBeNull();
      expect(spyService.called).toBeFalsy();

      directive.triggerEventHandler('click', {});
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).toBeNull();
      expect(spyService.called).toBeTruthy();
    });
*/

    it('should not open a popup if content is falsy', () => {
      const fixture = createTestComponent(`<div [ngbPopupTestAnchor]="notExisting"></div>`);
      const directive = fixture.debugElement.query(By.directive(NgbPopupTestAnchor));

      directive.triggerEventHandler('mouseenter', {});
      fixture.detectChanges();
      const windowEl = getWindow(fixture.nativeElement);

      expect(windowEl).toBeNull();
    });

    it('should close the popup if content becomes falsy', () => {
      const fixture = createTestComponent(`<div [ngbPopupTestAnchor]="name"></div>`);
      const directive = fixture.debugElement.query(By.directive(NgbPopupTestAnchor));

      directive.triggerEventHandler('mouseenter', {});
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).not.toBeNull();

      fixture.componentInstance.name = null;
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).toBeNull();
    });

    it('should allow re-opening previously closed popups', () => {
      const fixture = createTestComponent(`<div ngbPopupTestAnchor="Great tip!"></div>`);
      const directive = fixture.debugElement.query(By.directive(NgbPopupTestAnchor));

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

    it('should not leave dangling popups in the DOM', () => {
      const fixture = createTestComponent(`<template [ngIf]="show"><div ngbPopupTestAnchor="Great tip!"></div></template>`);
      const directive = fixture.debugElement.query(By.directive(NgbPopupTestAnchor));

      directive.triggerEventHandler('mouseenter', {});
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).not.toBeNull();

      fixture.componentInstance.show = false;
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).toBeNull();
    });

    it('should properly cleanup popups with manual triggers', () => {
      const fixture = createTestComponent(`
            <template [ngIf]="show">
              <div ngbPopupTestAnchor="Great tip!" triggers="manual" #t="ngbPopupTestAnchor" (mouseenter)="t.open()"></div>
            </template>`);
      const directive = fixture.debugElement.query(By.directive(NgbPopupTestAnchor));

      directive.triggerEventHandler('mouseenter', {});
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).not.toBeNull();

      fixture.componentInstance.show = false;
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).toBeNull();
    });
  });

  describe('positioning', () => {

    it('should use requested position', () => {
      const fixture = createTestComponent(`<div ngbPopupTestAnchor="Great tip!" placement="left"></div>`);
      const directive = fixture.debugElement.query(By.directive(NgbPopupTestAnchor));

      directive.triggerEventHandler('mouseenter', {});
      fixture.detectChanges();
      const windowEl = getWindow(fixture.nativeElement);

      expect(windowEl).toHaveCssClass('popup');
      expect(windowEl).toHaveCssClass('popup-left');
      expect(windowEl.textContent.trim()).toBe('Great tip!');
    });

    it('should properly position popups when a component is using the OnPush strategy', () => {
      const fixture = createOnPushTestComponent(`<div ngbPopupTestAnchor="Great tip!" placement="left"></div>`);
      const directive = fixture.debugElement.query(By.directive(NgbPopupTestAnchor));

      directive.triggerEventHandler('mouseenter', {});
      fixture.detectChanges();
      const windowEl = getWindow(fixture.nativeElement);

      expect(windowEl).toHaveCssClass('popup');
      expect(windowEl).toHaveCssClass('popup-left');
      expect(windowEl.textContent.trim()).toBe('Great tip!');
    });
  });

  describe('triggers', () => {

    it('should support toggle triggers', () => {
      const fixture = createTestComponent(`<div ngbPopupTestAnchor="Great tip!" triggers="click"></div>`);
      const directive = fixture.debugElement.query(By.directive(NgbPopupTestAnchor));

      directive.triggerEventHandler('click', {});
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).not.toBeNull();

      directive.triggerEventHandler('click', {});
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).toBeNull();
    });

    it('should non-default toggle triggers', () => {
      const fixture = createTestComponent(`<div ngbPopupTestAnchor="Great tip!" triggers="mouseenter:click"></div>`);
      const directive = fixture.debugElement.query(By.directive(NgbPopupTestAnchor));

      directive.triggerEventHandler('mouseenter', {});
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).not.toBeNull();

      directive.triggerEventHandler('click', {});
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).toBeNull();
    });

    it('should support multiple triggers', () => {
      const fixture =
          createTestComponent(`<div ngbPopupTestAnchor="Great tip!" triggers="mouseenter:mouseleave click"></div>`);
      const directive = fixture.debugElement.query(By.directive(NgbPopupTestAnchor));

      directive.triggerEventHandler('mouseenter', {});
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).not.toBeNull();

      directive.triggerEventHandler('click', {});
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).toBeNull();
    });

    it('should not use default for manual triggers', () => {
      const fixture = createTestComponent(`<div ngbPopupTestAnchor="Great tip!" triggers="manual"></div>`);
      const directive = fixture.debugElement.query(By.directive(NgbPopupTestAnchor));

      directive.triggerEventHandler('mouseenter', {});
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).toBeNull();
    });

    it('should allow toggling for manual triggers', () => {
      const fixture = createTestComponent(`
                <div ngbPopupTestAnchor="Great tip!" triggers="manual" #t="ngbPopupTestAnchor"></div>
                <button (click)="t.toggle()">T</button>`);
      const button = fixture.nativeElement.querySelector('button');

      button.click();
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).not.toBeNull();

      button.click();
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).toBeNull();
    });

    it('should allow open / close for manual triggers', () => {
      const fixture = createTestComponent(`
                <div ngbPopupTestAnchor="Great tip!" triggers="manual" #t="ngbPopupTestAnchor"></div>
                <button (click)="t.open()">O</button>
                <button (click)="t.close()">C</button>`);

      const buttons = fixture.nativeElement.querySelectorAll('button');

      buttons[0].click();  // open
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).not.toBeNull();

      buttons[1].click();  // close
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).toBeNull();
    });

    it('should not throw when open called for manual triggers and open popup', () => {
      const fixture = createTestComponent(`
                <div ngbPopupTestAnchor="Great tip!" triggers="manual" #t="ngbPopupTestAnchor"></div>
                <button (click)="t.open()">O</button>`);
      const button = fixture.nativeElement.querySelector('button');

      button.click();  // open
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).not.toBeNull();

      button.click();  // open
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).not.toBeNull();
    });

    it('should not throw when closed called for manual triggers and closed popup', () => {
      const fixture = createTestComponent(`
                <div ngbPopupTestAnchor="Great tip!" triggers="manual" #t="ngbPopupTestAnchor"></div>
                <button (click)="t.close()">C</button>`);

      const button = fixture.nativeElement.querySelector('button');

      button.click();  // close
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).toBeNull();
    });
  });


  describe('container', () => {

    it('should be appended to the element matching the selector passed to "container"', () => {
      const selector = 'body';
      const fixture = createTestComponent(`<div ngbPopupTestAnchor="Great tip!" container="` + selector + `"></div>`);
      const directive = fixture.debugElement.query(By.directive(NgbPopupTestAnchor));

      directive.triggerEventHandler('mouseenter', {});
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).toBeNull();
      expect(getWindow(document.querySelector(selector))).not.toBeNull();
    });

    it('should properly destroy popups when the "container" option is used', () => {
      const selector = 'body';
      const fixture =
          createTestComponent(`<div *ngIf="show" ngbPopupTestAnchor="Great tip!" container="` + selector + `"></div>`);
      const directive = fixture.debugElement.query(By.directive(NgbPopupTestAnchor));

      directive.triggerEventHandler('mouseenter', {});
      fixture.detectChanges();

      expect(getWindow(document.querySelector(selector))).not.toBeNull();
      fixture.componentRef.instance.show = false;
      fixture.detectChanges();
      expect(getWindow(document.querySelector(selector))).toBeNull();
    });
  });

  describe('visibility', () => {
    it('should emit events when showing and hiding popup', () => {
      const fixture = createTestComponent(
          `<div ngbPopupTestAnchor="Great tip!" triggers="click" (shown)="shown()" (hidden)="hidden()"></div>`);
      const directive = fixture.debugElement.query(By.directive(NgbPopupTestAnchor));

      let shownSpy = spyOn(fixture.componentInstance, 'shown');
      let hiddenSpy = spyOn(fixture.componentInstance, 'hidden');

      directive.triggerEventHandler('click', {});
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).not.toBeNull();
      expect(shownSpy).toHaveBeenCalled();

      directive.triggerEventHandler('click', {});
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).toBeNull();
      expect(hiddenSpy).toHaveBeenCalled();
    });

    it('should not emit close event when already closed', () => {
      const fixture = createTestComponent(
          `<div ngbPopupTestAnchor="Great tip!" triggers="manual" (shown)="shown()" (hidden)="hidden()"></div>`);

      let shownSpy = spyOn(fixture.componentInstance, 'shown');
      let hiddenSpy = spyOn(fixture.componentInstance, 'hidden');

      fixture.componentInstance.popup.open();
      fixture.detectChanges();

      fixture.componentInstance.popup.open();
      fixture.detectChanges();

      expect(getWindow(fixture.nativeElement)).not.toBeNull();
      expect(shownSpy).toHaveBeenCalled();
      expect(shownSpy.calls.count()).toEqual(1);
      expect(hiddenSpy).not.toHaveBeenCalled();
    });

    it('should not emit open event when already opened', () => {
      const fixture = createTestComponent(
          `<div ngbPopupTestAnchor="Great tip!" triggers="manual" (shown)="shown()" (hidden)="hidden()"></div>`);

      let shownSpy = spyOn(fixture.componentInstance, 'shown');
      let hiddenSpy = spyOn(fixture.componentInstance, 'hidden');

      fixture.componentInstance.popup.close();
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).toBeNull();
      expect(shownSpy).not.toHaveBeenCalled();
      expect(hiddenSpy).not.toHaveBeenCalled();
    });

    it('should report correct visibility', () => {
      const fixture = createTestComponent(`<div ngbPopupTestAnchor="Great tip!" triggers="manual"></div>`);
      fixture.detectChanges();

      expect(fixture.componentInstance.popup.isOpen()).toBeFalsy();

      fixture.componentInstance.popup.open();
      fixture.detectChanges();
      expect(fixture.componentInstance.popup.isOpen()).toBeTruthy();

      fixture.componentInstance.popup.close();
      fixture.detectChanges();
      expect(fixture.componentInstance.popup.isOpen()).toBeFalsy();
    });
  });
});

@Component({
  selector: 'ngb-popup-test-window',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {'[class]': 'type + " show " + type + "-" + placement', 'role': 'tooltip'},
  template: `<ng-content></ng-content>`
})
class NgbPopupTestWindow extends NgbPopup {
  constructor() { super(); }
}

@Directive({
  selector: '[ngbPopupTestAnchor]',
  exportAs: 'ngbPopupTestAnchor',
  inputs: ['placement', 'triggers', 'containter'],
  outputs: ['shown', 'hidden']
})
class NgbPopupTestAnchor extends NgbPopupAnchor<NgbPopupTestWindow> {
  @Input('ngbPopupTestAnchor') content: string | TemplateRef<any>;

  constructor(
      protected renderer: Renderer, protected injector: Injector, protected elementRef: ElementRef,
      protected viewContainerRef: ViewContainerRef, protected resolver: ComponentFactoryResolver,
      protected ngZone: NgZone) {
    super(NgbPopupTestWindow, renderer, injector, elementRef, viewContainerRef, resolver, ngZone);
  }
}

@NgModule({
  declarations: [NgbPopupTestAnchor, NgbPopupTestWindow],
  exports: [NgbPopupTestAnchor, NgbPopupTestWindow],
  entryComponents: [NgbPopupTestWindow],
})
class NgbPopupTestModule {
}

@Component({selector: 'test-cmpt', template: ``})
export class TestComponent {
  name = 'World';
  show = true;

  @ViewChild(NgbPopupTestAnchor) popup: NgbPopupTestAnchor;

  shown() {}
  hidden() {}
}

@Component({selector: 'test-onpush-cmpt', changeDetection: ChangeDetectionStrategy.OnPush, template: ``})
export class TestOnPushComponent {
}
