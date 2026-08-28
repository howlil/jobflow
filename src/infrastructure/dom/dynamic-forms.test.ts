import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createFieldSetFingerprint } from '../../domain/forms/field-set-fingerprint';
import { extractFieldContexts } from './extract-field-contexts';
import { observeRelevantFormMutations } from './observe-form-mutations';

beforeEach(() => {
  document.body.innerHTML = '';
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

async function flushMutations(delay = 200) {
  await Promise.resolve();
  await vi.advanceTimersByTimeAsync(delay);
}

describe('dynamic form support', () => {
  it('keeps form identity stable when controls are added or removed', () => {
    document.body.innerHTML = `
      <form id="application" action="/apply" method="post">
        <label for="email">Email</label>
        <input id="email" name="email" type="email" />
      </form>
    `;

    const first = extractFieldContexts(document, 'https://jobs.example.test');
    const form = document.querySelector('form')!;
    form.insertAdjacentHTML(
      'beforeend',
      '<label for="phone">Phone</label><input id="phone" name="phone" />',
    );
    const second = extractFieldContexts(document, 'https://jobs.example.test');
    document.querySelector('#phone')?.remove();
    document.querySelector('label[for="phone"]')?.remove();
    const third = extractFieldContexts(document, 'https://jobs.example.test');

    expect(first[0]?.formFingerprint).toBe(second[0]?.formFingerprint);
    expect(first[0]?.formFingerprint).toBe(third[0]?.formFingerprint);
  });

  it('creates an order-insensitive fingerprint for the current semantic field set', () => {
    document.body.innerHTML = `
      <form id="application">
        <label for="email">Email</label><input id="email" name="email" />
        <label for="city">City</label><input id="city" name="city" />
      </form>
    `;
    const fields = extractFieldContexts(document, 'https://jobs.example.test');

    expect(createFieldSetFingerprint(fields)).toBe(
      createFieldSetFingerprint([...fields].reverse()),
    );
    expect(createFieldSetFingerprint(fields.slice(0, 1))).not.toBe(
      createFieldSetFingerprint(fields),
    );
  });

  it('debounces relevant form mutations and ignores unrelated text or Job Flow UI', async () => {
    document.body.innerHTML =
      '<form id="application"></form><p id="copy">Hello</p>';
    const onChange = vi.fn();
    const watcher = observeRelevantFormMutations(document.body, onChange, {
      delayMs: 200,
    });

    document.querySelector('#copy')!.textContent = 'Updated copy';
    const jobflow = document.createElement('jobflow-form-assistant');
    jobflow.innerHTML = '<input name="internal" />';
    document.body.append(jobflow);
    await flushMutations();
    expect(onChange).not.toHaveBeenCalled();

    const form = document.querySelector('form')!;
    form.insertAdjacentHTML('beforeend', '<input name="email" />');
    form.insertAdjacentHTML('beforeend', '<input name="phone" />');
    await flushMutations(199);
    expect(onChange).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(onChange).toHaveBeenCalledTimes(1);

    watcher.disconnect();
  });

  it('stops observing after disconnect', async () => {
    document.body.innerHTML = '<form id="application"></form>';
    const onChange = vi.fn();
    const watcher = observeRelevantFormMutations(document.body, onChange, {
      delayMs: 50,
    });
    watcher.disconnect();

    document.querySelector('form')!.innerHTML = '<input name="email" />';
    await flushMutations(50);
    expect(onChange).not.toHaveBeenCalled();
  });
});
