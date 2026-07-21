import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  Type,
  computed,
  effect,
  input,
  model,
  signal,
} from '@angular/core';
import { NgComponentOutlet, NgTemplateOutlet } from '@angular/common';

export type SliderPosition = 'right' | 'left' | 'top' | 'bottom';
export type SliderSize = 'sm' | 'md' | 'lg' | 'full';

const AXIS_SIZE_CLASSES: Record<SliderPosition, Record<SliderSize, string>> = {
  right: { sm: 'w-80', md: 'w-[28rem]', lg: 'w-[36rem]', full: 'w-full' },
  left: { sm: 'w-80', md: 'w-[28rem]', lg: 'w-[36rem]', full: 'w-full' },
  top: { sm: 'h-64', md: 'h-96', lg: 'h-[32rem]', full: 'h-full' },
  bottom: { sm: 'h-64', md: 'h-96', lg: 'h-[32rem]', full: 'h-full' },
};

const POSITION_LAYOUT: Record<SliderPosition, string> = {
  right: 'inset-y-0 right-0 h-full',
  left: 'inset-y-0 left-0 h-full',
  top: 'inset-x-0 top-0 w-full',
  bottom: 'inset-x-0 bottom-0 w-full',
};

const HIDDEN_TRANSFORM: Record<SliderPosition, string> = {
  right: 'translate-x-full',
  left: '-translate-x-full',
  top: '-translate-y-full',
  bottom: 'translate-y-full',
};

/**
 * Reusable slide-over drawer. Content can be projected (`<ng-content>`),
 * supplied as a `TemplateRef` (`bodyTemplate`), or mounted dynamically via
 * `NgComponentOutlet` (`bodyComponent` + `bodyComponentInputs`).
 */
@Component({
  selector: 'app-dynamic-slider',
  standalone: true,
  imports: [NgComponentOutlet, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'onEscapeKey()',
  },
  template: `
    @if (mounted()) {
      <div
        class="fixed inset-0 z-50"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="title()"
        [class.pointer-events-none]="!isOpen()"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-slate-900/50 transition-opacity duration-300"
          [class.opacity-100]="isOpen()"
          [class.opacity-0]="!isOpen()"
          (click)="onBackdropClick()"
        ></div>

        <!-- Panel -->
        <div
          class="absolute flex flex-col bg-white shadow-2xl transition-transform duration-300 ease-out dark:bg-slate-800"
          [class]="panelClasses()"
        >
          <header class="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-700">
            <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">{{ title() }}</h2>
            <button
              type="button"
              class="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700"
              (click)="close()"
              aria-label="Close panel"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fill-rule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </header>

          <div class="flex-1 overflow-y-auto p-5">
            @if (bodyComponent(); as cmp) {
              <ng-container *ngComponentOutlet="cmp; inputs: bodyComponentInputs()" />
            } @else if (bodyTemplate(); as tpl) {
              <ng-container *ngTemplateOutlet="tpl" />
            } @else {
              <ng-content />
            }
          </div>
        </div>
      </div>
    }
  `,
})
export class DynamicSliderComponent {
  readonly isOpen = model<boolean>(false);

  readonly position = input<SliderPosition>('right');
  readonly size = input<SliderSize>('md');
  readonly title = input<string>('');
  readonly closeOnBackdropClick = input<boolean>(true);
  readonly closeOnEscape = input<boolean>(true);

  readonly bodyTemplate = input<TemplateRef<unknown> | null>(null);
  readonly bodyComponent = input<Type<unknown> | null>(null);
  readonly bodyComponentInputs = input<Record<string, unknown>>({});

  /** Stays true after first open so CSS transitions can animate the close too. */
  private readonly hasOpenedOnce = signal(false);
  readonly mounted = computed(() => this.hasOpenedOnce() || this.isOpen());

  constructor() {
    // Bound via [(isOpen)] as well as open()/close(), so watch the signal directly
    // rather than relying on the imperative methods being called.
    effect(() => {
      if (this.isOpen()) this.hasOpenedOnce.set(true);
    });
  }

  readonly panelClasses = computed(() => {
    const pos = this.position();
    const sizeClass = AXIS_SIZE_CLASSES[pos][this.size()];
    const layout = POSITION_LAYOUT[pos];
    const transform = this.isOpen() ? 'translate-x-0 translate-y-0' : HIDDEN_TRANSFORM[pos];
    return `${layout} ${sizeClass} ${transform}`;
  });

  open(): void {
    this.hasOpenedOnce.set(true);
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }

  toggle(): void {
    this.isOpen() ? this.close() : this.open();
  }

  protected onBackdropClick(): void {
    if (this.closeOnBackdropClick()) this.close();
  }

  protected onEscapeKey(): void {
    if (this.closeOnEscape() && this.isOpen()) this.close();
  }
}
