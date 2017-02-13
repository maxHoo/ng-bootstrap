import {
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  ComponentFactory,
  ComponentFactoryResolver,
  Directive,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  Output,
  OnInit,
  OnDestroy,
  Renderer,
  TemplateRef,
  ViewContainerRef,
  ViewRef,
  NgZone
} from '@angular/core';

import {positionElements} from '../util/positioning';
import {listenToTriggers} from '../util/triggers';

export class PopupService<T> {
  private _windowFactory: ComponentFactory<T>;
  private _windowRef: ComponentRef<T>;
  private _contentRef: ContentRef;

  constructor(
      type: any, private _injector: Injector, private _viewContainerRef: ViewContainerRef, private _renderer: Renderer,
      componentFactoryResolver: ComponentFactoryResolver) {
    this._windowFactory = componentFactoryResolver.resolveComponentFactory<T>(type);
  }

  open(content?: string | TemplateRef<any>, context?: any): ComponentRef<T> {
    if (!this._windowRef) {
      this._contentRef = this._getContentRef(content, context);
      this._windowRef =
          this._viewContainerRef.createComponent(this._windowFactory, 0, this._injector, this._contentRef.nodes);
    }

    return this._windowRef;
  }

  close() {
    if (this._windowRef) {
      this._viewContainerRef.remove(this._viewContainerRef.indexOf(this._windowRef.hostView));
      this._windowRef = null;

      if (this._contentRef.viewRef) {
        this._viewContainerRef.remove(this._viewContainerRef.indexOf(this._contentRef.viewRef));
        this._contentRef = null;
      }
    }
  }

  private _getContentRef(content: string | TemplateRef<any>, context?: any): ContentRef {
    if (!content) {
      return new ContentRef([]);
    } else if (content instanceof TemplateRef) {
      const viewRef = this._viewContainerRef.createEmbeddedView(<TemplateRef<T>>content, context);
      return new ContentRef([viewRef.rootNodes], viewRef);
    } else {
      return new ContentRef([[this._renderer.createText(null, `${content}`)]]);
    }
  }
}

export class ContentRef {
  constructor(public nodes: any[], public viewRef?: ViewRef, public componentRef?: ComponentRef<any>) {}
}


@Component({
  selector: 'ngb-popup-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {'[class]': 'type + " show " + type + "-" + placement', 'role': 'tooltip'},
})
export abstract class NgbPopup {
  protected type: string = 'popup';
  @Input() placement: 'top' | 'bottom' | 'left' | 'right' = 'top';
  constructor(type: string = 'popup') {
    this.type = type;
  }
}

@Directive({
  selector: '[ngbPopup]',
  exportAs: 'ngbPopup',
})
export abstract class NgbPopupAnchor<T extends NgbPopup> implements OnInit, OnDestroy {
  /**
   * Placement of a popover. Accepts: "top", "bottom", "left", "right"
   */
  placement: 'top' | 'bottom' | 'left' | 'right' = 'top';

  /**
   * Specifies events that should trigger. Supports a space separated list of event names.
   */
  triggers: string = 'hover';

  /**
   * A selector specifying the element the popover should be appended to.
   * Currently only supports "body".
   */
  container: string;

  /**
   * Emits an event when the popover is shown
   */
  shown = new EventEmitter();

  /**
   * Emits an event when the popover is hidden
   */
  hidden = new EventEmitter();

  /**
   * Content to be displayed as tooltip.
   */
  protected _content: string | TemplateRef<any>;

  protected _contentRef: ContentRef;

  /**
   * Reference to the popup window.
   */
  protected _popupRef: ComponentRef<T>;
  private _popupComponentFactory: ComponentFactory<T>;
  private _zoneSubscription: any;

  /**
   * Hold the methods to dynamically unregister the listeners
  */
  protected _unregisterListenersFn;

  constructor(
    protected _type: any,
    protected _renderer: Renderer,
    protected _injector: Injector,
    protected _elementRef: ElementRef,
    protected _viewContainerRef: ViewContainerRef,
    protected _resolver: ComponentFactoryResolver,
    protected ngZone: NgZone) {
    // get the factory needed to create the component
    this._popupComponentFactory = _resolver.resolveComponentFactory<T>(this._type);
    //let popupComponentFactory = this._resolver.resolveComponentFactory(type);

    this._zoneSubscription = ngZone.onStable.subscribe(() => {
      if (this._popupRef) {
        positionElements(
          this._elementRef.nativeElement,
          this._popupRef.location.nativeElement,
          this.placement,
          this.container === 'body');
      }
    });
  }

  /**
   * Content to be displayed as tooltip. If falsy, the tooltip won't open.
   */
  @Input('ngbPopup')
  set content(value: string | TemplateRef<any>) {
    this._content = value;
    if (!value && this._popupRef) {
      this.close();
    }
  }

  get content() { return this._content; }

  /**
   * Opens an element’s popup. This is considered a “manual” triggering of the popup.
   * The context is an optional value to be injected into the popup template when it is created.
   */
  open(context?: any) {
    if (!this._popupRef && !!this._content) {
      //this._popupRef = this._popupService.open(this.content, context);

      this._contentRef = this._getContentRef(this._content, context);
      this._popupRef = this._viewContainerRef.createComponent(
        this._popupComponentFactory,
        0,
        this._injector,
        this._contentRef.nodes);

      // actually create the component
      // this._popupRef = this._viewContainerRef.createComponent(popupComponentFactory);


      this._popupRef.instance.placement = this.placement;

      if (this.container === 'body') {
        window.document.querySelector(this.container).appendChild(this._popupRef.location.nativeElement);
      }

      // we need to manually invoke change detection since events registered via
      // Renderer::listen() - to be determined if this is a bug in the Angular itself
      this._popupRef.changeDetectorRef.markForCheck();
      this.shown.emit();
    }
  }

  /**
   * Closes an element’s tooltip. This is considered a “manual” triggering of the tooltip.
   */
  close(): void {
    if (!!this._popupRef) {

      this._viewContainerRef.remove(this._viewContainerRef.indexOf(this._popupRef.hostView));
      this._popupRef = null;

      if (this._contentRef.viewRef) {
        this._viewContainerRef.remove(this._viewContainerRef.indexOf(this._contentRef.viewRef));
        this._contentRef = null;
      }

      this.hidden.emit();
    }
  }

  /**
   * Toggles an element’s tooltip. This is considered a “manual” triggering of the tooltip.
   */
  toggle(): void {
    if (this._popupRef) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Returns whether or not the tooltip is currently being shown
   */
  isOpen(): boolean { return this._popupRef != null; }

  ngOnInit() {
    this._unregisterListenersFn = listenToTriggers(
      this._renderer, this._elementRef.nativeElement, this.triggers, this.open.bind(this), this.close.bind(this),
      this.toggle.bind(this));
  }

  ngOnDestroy() {
    this._unregisterListenersFn();
    this.close();
    this._zoneSubscription.unsubscribe();
  }

  private _getContentRef(content: string | TemplateRef<any>, context?: any): ContentRef {
    if (!content) {
      return new ContentRef([]);
    } else if (content instanceof TemplateRef) {
      const viewRef = this._viewContainerRef.createEmbeddedView(<TemplateRef<T>>content, context);
      return new ContentRef([viewRef.rootNodes], viewRef);
    } else {
      return new ContentRef([[this._renderer.createText(null, `${content}`)]]);
    }
  }
}
