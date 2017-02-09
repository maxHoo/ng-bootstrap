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

import { NgbPopup, PopupService, NgbPopupAnchor } from '../util/popup';
import {listenToTriggers} from '../util/triggers';
import {NgbTooltipConfig} from './tooltip-config';
import {positionElements} from '../util/positioning';



@Component({
  selector: 'ngb-tooltip-window',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {'[class]': 'type + " show " + type + "-" + placement', 'role': 'tooltip'},
  template: `<div class="tooltip-inner"><ng-content></ng-content></div>`
})
export class NgbTooltipWindow extends NgbPopup {
  constructor() {
    super('tooltip');
  }
}

/**
 * A lightweight, extensible directive for fancy tooltip creation.
 */
@Directive({
  selector: '[ngbTooltip]',
  exportAs: 'ngbTooltip'})
export class NgbTooltip extends NgbPopupAnchor<NgbTooltipWindow> implements OnInit, OnDestroy {
  @Input('ngbTooltip') content: string | TemplateRef<any>;

  private _unregisterListenersFn;

  constructor(
    protected config: NgbTooltipConfig,
    protected renderer: Renderer,
    protected injector: Injector,
    protected elementRef: ElementRef,
    protected viewContainerRef: ViewContainerRef,
    protected resolver: ComponentFactoryResolver,
    protected ngZone: NgZone) {
    super(
      NgbTooltipWindow,
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
