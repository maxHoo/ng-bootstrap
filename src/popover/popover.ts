import {
  Component,
  Directive,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  Injector,
  Renderer,
  ComponentRef,
  ElementRef,
  TemplateRef,
  ViewContainerRef,
  ComponentFactoryResolver,
  NgZone
} from '@angular/core';

import {listenToTriggers} from '../util/triggers';
import {positionElements} from '../util/positioning';
import { NgbPopup, NgbPopupAnchor } from '../util/popup';
import {NgbPopoverConfig} from './popover-config';

@Component({
  selector: 'ngb-popover-window',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {'[class]': 'type + " show " + type + "-" + placement', 'role': 'tooltip'},
  template: `
    <h3 class="popover-title">{{title}}</h3><div class="popover-content"><ng-content></ng-content></div>
    `
})
export class NgbPopoverWindow extends NgbPopup {
  constructor() {
    super('popover');
  }
  @Input() title: string;
}

/**
 * A lightweight, extensible directive for fancy popover creation.
 */
@Directive({selector: '[ngbPopover]', exportAs: 'ngbPopover'})
export class NgbPopover extends NgbPopupAnchor<NgbPopoverWindow> {
  /**
   * Content to be displayed as popover.
   */
  @Input('ngbPopover') content: string | TemplateRef<any>;
  /**
   * Title of a popover.
   */
  @Input() popoverTitle: string;

  private _unregisterListenersFn;

  constructor(
    protected config: NgbPopoverConfig,
    protected renderer: Renderer,
    protected injector: Injector,
    protected elementRef: ElementRef,
    protected viewContainerRef: ViewContainerRef,
    protected resolver: ComponentFactoryResolver,
    protected ngZone: NgZone) {
    super(
      NgbPopoverWindow,
      renderer,
      injector,
      elementRef,
      viewContainerRef,
      resolver,
      ngZone);

    this.placement = config.placement;
    this.triggers = config.triggers;
    this.container = config.container;
  }

  /**
   * Opens an element’s popover. This is considered a “manual” triggering of the popover.
   * The context is an optional value to be injected into the popover template when it is created.
   */
  open(context?: any) {
    super.open(context);
    this._popupRef.instance.title = this.popoverTitle;
  }

  ngOnInit() {
    this._unregisterListenersFn = listenToTriggers(
        this._renderer, this._elementRef.nativeElement, this.triggers, this.open.bind(this), this.close.bind(this),
        this.toggle.bind(this));
  }

  ngOnDestroy() {
    this._unregisterListenersFn();
    super.ngOnDestroy();
  }
}
