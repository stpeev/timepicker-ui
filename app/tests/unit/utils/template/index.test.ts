import { getModalTemplate } from '../../../../src/utils/template';
import { mergeOptions } from '../../../../src/utils/options/defaults';
import { PluginRegistry } from '../../../../src/core/PluginRegistry';
import { RangePlugin } from '../../../../src/plugins/range';
import { WheelPlugin } from '../../../../src/plugins/wheel';
import type { TimepickerOptions } from '../../../../src/types/options';

function render(options: TimepickerOptions): HTMLDivElement {
  const merged = mergeOptions(options);
  const container = document.createElement('div');
  container.innerHTML = getModalTemplate(merged, 'tmpl-instance');
  return container;
}

describe('getModalTemplate accessibility semantics', () => {
  describe('structural visibility options', () => {
    it('hides the header without removing clock state inputs and gives the dialog a direct accessible name', () => {
      const dom = render({ ui: { hideHeader: true }, labels: { time: 'Choose intake time' } });
      const dialog = dom.querySelector('.tp-ui-modal') as HTMLElement;
      const heading = dom.querySelector('.tp-ui-select-time') as HTMLElement;
      const header = dom.querySelector('.tp-ui-header') as HTMLElement;

      expect(heading.hidden).toBe(true);
      expect(header.hidden).toBe(true);
      expect(header.querySelector('input[name="hour"]')).not.toBeNull();
      expect(header.querySelector('input[name="minutes"]')).not.toBeNull();
      expect(dialog.getAttribute('aria-label')).toBe('Choose intake time');
      expect(dialog.hasAttribute('aria-labelledby')).toBe(false);
    });

    it('omits the footer and all footer actions', () => {
      const dom = render({ ui: { hideFooter: true, clearButton: true } });

      expect(dom.querySelector('.tp-ui-footer')).toBeNull();
      expect(dom.querySelector('.tp-ui-ok-btn')).toBeNull();
      expect(dom.querySelector('.tp-ui-cancel-btn')).toBeNull();
      expect(dom.querySelector('.tp-ui-clear-btn')).toBeNull();
    });

    it('shows an accessible dismiss button independently of the footer', () => {
      const dom = render({
        ui: { hideFooter: true, showDismissButton: true },
        labels: { cancel: 'Dismiss time picker' },
      });
      const dismissButton = dom.querySelector('.tp-ui-dismiss-btn') as HTMLButtonElement;

      expect(dismissButton).toHaveAttribute('type', 'button');
      expect(dismissButton).toHaveAttribute('aria-label', 'Dismiss time picker');
      expect(dismissButton).toHaveStyle({
        position: 'absolute',
        top: 'var(--tp-spacing-md)',
        right: 'var(--tp-spacing-md)',
      });
      expect(dismissButton.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    });

    it('marks a headerless, footerless clock picker so its surface can hug the clock', () => {
      const dom = render({ ui: { hideHeader: true, hideFooter: true } });

      expect(dom.querySelector('.tp-ui-wrapper')).toHaveClass('tp-ui-wrapper--clock-only');
    });

    it('renders the header and footer by default', () => {
      const dom = render({ labels: { time: 'Choose time' } });
      const dialog = dom.querySelector('.tp-ui-modal') as HTMLElement;

      expect(dom.querySelector('.tp-ui-select-time')).not.toBeNull();
      expect(dom.querySelector('.tp-ui-header')).not.toBeNull();
      expect(dom.querySelector('.tp-ui-footer')).not.toBeNull();
      expect(dialog.getAttribute('aria-labelledby')).toBe('tp-ui-label-tmpl-instance');
      expect(dialog.hasAttribute('aria-label')).toBe(false);
    });

    it('keeps the compact-wheel hideFooter alias and accessible dialog name', () => {
      PluginRegistry.register(WheelPlugin);
      const dom = render({
        ui: { mode: 'compact-wheel' },
        wheel: { hideFooter: true },
        labels: { time: 'Choose wheel time' },
      });
      const dialog = dom.querySelector('.tp-ui-modal') as HTMLElement;

      expect(dom.querySelector('.tp-ui-header')).toBeNull();
      expect(dom.querySelector('.tp-ui-footer')).toBeNull();
      expect(dialog.getAttribute('aria-label')).toBe('Choose wheel time');
      expect(dialog.hasAttribute('aria-labelledby')).toBe(false);
    });
  });

  describe('hour spinbutton - 12h mode', () => {
    it('carries spinbutton range and initial value attributes', () => {
      const dom = render({ clock: { type: '12h' } });
      const hour = dom.querySelector('input[name="hour"]') as HTMLInputElement;

      expect(hour.getAttribute('role')).toBe('spinbutton');
      expect(hour.getAttribute('aria-valuemin')).toBe('1');
      expect(hour.getAttribute('aria-valuemax')).toBe('12');
      expect(hour.getAttribute('aria-valuenow')).toBe('12');
    });
  });

  describe('hour spinbutton - 24h mode', () => {
    it('carries spinbutton range and initial value attributes', () => {
      const dom = render({ clock: { type: '24h' } });
      const hour = dom.querySelector('input[name="hour"]') as HTMLInputElement;

      expect(hour.getAttribute('aria-valuemin')).toBe('0');
      expect(hour.getAttribute('aria-valuemax')).toBe('23');
      expect(hour.getAttribute('aria-valuenow')).toBe('0');
    });
  });

  describe('minute spinbutton', () => {
    it('carries 0-59 spinbutton range and initial value', () => {
      const dom = render({ clock: { type: '12h' } });
      const minutes = dom.querySelector('input[name="minutes"]') as HTMLInputElement;

      expect(minutes.getAttribute('role')).toBe('spinbutton');
      expect(minutes.getAttribute('aria-valuemin')).toBe('0');
      expect(minutes.getAttribute('aria-valuemax')).toBe('59');
      expect(minutes.getAttribute('aria-valuenow')).toBe('0');
    });
  });

  describe('aria-pressed presence', () => {
    it('does NOT set aria-pressed on OK, Cancel, or Clear buttons', () => {
      const dom = render({ clock: { type: '12h' }, ui: { clearButton: true } });

      const ok = dom.querySelector('.tp-ui-ok-btn') as HTMLElement;
      const cancel = dom.querySelector('.tp-ui-cancel-btn') as HTMLElement;
      const clear = dom.querySelector('.tp-ui-clear-btn') as HTMLElement;

      expect(ok.hasAttribute('aria-pressed')).toBe(false);
      expect(cancel.hasAttribute('aria-pressed')).toBe(false);
      expect(clear).not.toBeNull();
      expect(clear.hasAttribute('aria-pressed')).toBe(false);
    });

    it('keeps aria-pressed on AM and PM buttons', () => {
      const dom = render({ clock: { type: '12h' } });

      const am = dom.querySelector('.tp-ui-am') as HTMLElement;
      const pm = dom.querySelector('.tp-ui-pm') as HTMLElement;

      expect(am.getAttribute('aria-pressed')).toBe('false');
      expect(pm.getAttribute('aria-pressed')).toBe('false');
    });

    it('keeps aria-pressed on the view-switch toggle', () => {
      const dom = render({ clock: { type: '12h' }, ui: { enableSwitchIcon: true } });

      const toggle = dom.querySelector('.tp-ui-keyboard-icon-wrapper') as HTMLElement;
      expect(toggle).not.toBeNull();
      expect(toggle.getAttribute('aria-pressed')).toBe('false');
    });
  });

  describe('custom labels flow into rendered ARIA', () => {
    it('uses custom hour/minute/clock/period labels in aria-labels', () => {
      const dom = render({
        clock: { type: '12h' },
        labels: {
          hourLabel: 'Godzina',
          minuteLabel: 'Minuta',
          clockLabel: 'Tarcza zegara',
          periodLabel: 'Pora dnia',
        },
      });

      const hour = dom.querySelector('input[name="hour"]') as HTMLInputElement;
      const minutes = dom.querySelector('input[name="minutes"]') as HTMLInputElement;
      const clockFace = dom.querySelector('.tp-ui-clock-face') as HTMLElement;
      const periodGroup = dom.querySelector('.tp-ui-wrapper-type-time') as HTMLElement;

      expect(hour.getAttribute('aria-label')).toBe('Godzina');
      expect(minutes.getAttribute('aria-label')).toBe('Minuta');
      expect(clockFace.getAttribute('aria-label')).toBe('Tarcza zegara');
      expect(periodGroup.getAttribute('aria-label')).toBe('Pora dnia');
    });

    it('uses custom timeLabel on the time-input group and custom time on the select-time heading', () => {
      const dom = render({
        clock: { type: '12h' },
        labels: { time: 'Wybierz czas', timeLabel: 'Grupa czasu' },
      });

      const timeGroup = dom.querySelector('.tp-ui-wrapper-time') as HTMLElement;
      const heading = dom.querySelector('.tp-ui-select-time') as HTMLElement;

      expect(timeGroup.getAttribute('aria-label')).toBe('Grupa czasu');
      expect(heading.textContent).toBe('Wybierz czas');
    });

    it('keeps the visible heading (labels.time) and the group aria-label (labels.timeLabel) independent', () => {
      const dom = render({
        clock: { type: '12h' },
        labels: { time: 'Naglowek', timeLabel: 'Etykieta grupy' },
      });

      const timeGroup = dom.querySelector('.tp-ui-wrapper-time') as HTMLElement;
      const heading = dom.querySelector('.tp-ui-select-time') as HTMLElement;

      expect(heading.textContent).toBe('Naglowek');
      expect(timeGroup.getAttribute('aria-label')).toBe('Etykieta grupy');
      expect(timeGroup.getAttribute('aria-label')).not.toBe(heading.textContent);
    });

    it('uses custom switch/toggle labels on the view-switch controls', () => {
      const dom = render({
        clock: { type: '12h' },
        ui: { enableSwitchIcon: true },
        labels: {
          switchToKeyboardLabel: 'Przelacz na klawiature',
          toggleLabel: 'Przelacz widok',
        },
      });

      const toggle = dom.querySelector('.tp-ui-keyboard-icon-wrapper') as HTMLElement;
      const keyboardIcon = dom.querySelector('.tp-ui-keyboard-icon') as HTMLElement;

      expect(toggle.getAttribute('aria-label')).toBe('Przelacz widok');
      expect(keyboardIcon.getAttribute('aria-label')).toBe('Przelacz na klawiature');
    });

    it('uses custom rangeSelectionLabel on the range tablist when range is enabled', () => {
      PluginRegistry.register(RangePlugin);

      const dom = render({
        clock: { type: '12h' },
        range: { enabled: true },
        labels: { rangeSelectionLabel: 'Wybor zakresu' },
      });

      const tablist = dom.querySelector('.tp-ui-range-header') as HTMLElement;

      expect(tablist).not.toBeNull();
      expect(tablist.getAttribute('role')).toBe('tablist');
      expect(tablist.getAttribute('aria-label')).toBe('Wybor zakresu');
    });

    it('renders aria-valuetext on the hour and minute spinbuttons', () => {
      const dom = render({ clock: { type: '24h' } });

      const hour = dom.querySelector('input[name="hour"]') as HTMLInputElement;
      const minutes = dom.querySelector('input[name="minutes"]') as HTMLInputElement;

      expect(hour.hasAttribute('aria-valuetext')).toBe(true);
      expect(hour.getAttribute('aria-valuetext')).toBe('0');
      expect(minutes.hasAttribute('aria-valuetext')).toBe(true);
      expect(minutes.getAttribute('aria-valuetext')).toBe('00');
    });
  });

  describe('clock face semantics', () => {
    it('marks the tips wrapper aria-hidden and the clock face as group', () => {
      const dom = render({ clock: { type: '12h' } });

      const clockFace = dom.querySelector('.tp-ui-clock-face') as HTMLElement;
      const tipsWrapper = dom.querySelector('.tp-ui-tips-wrapper') as HTMLElement;

      expect(clockFace.getAttribute('role')).toBe('group');
      expect(tipsWrapper.getAttribute('aria-hidden')).toBe('true');
      expect(tipsWrapper.getAttribute('role')).toBeNull();
    });
  });
});
