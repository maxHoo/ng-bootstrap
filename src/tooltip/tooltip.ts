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
import {NgbTooltipConfig} from './tooltip-config';

@Component({
  selector: 'ngb-tooltip-window',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {'[class]': 'type + " show " + type + "-" + placement', 'role': 'tooltip'},
  template: `<div class="tooltip-inner"><ng-content></ng-content></div>`
})
export class NgbTooltipWindow extends NgbPopup  {
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
export class NgbTooltip extends NgbPopupAnchor<NgbTooltipWindow> {
  @Input('ngbTooltip') content: string | TemplateRef<any>;

  constructor(
    config: NgbTooltipConfig,
    renderer: Renderer,
    injector: Injector,
    elementRef: ElementRef,
    viewContainerRef: ViewContainerRef,
    resolver: ComponentFactoryResolver,
    ngZone: NgZone) {
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
}
