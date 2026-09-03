type MutationWatcherOptions = {
  delayMs?: number;
};

const FORM_SELECTOR =
  'input, textarea, select, label, form, fieldset, [role="combobox"], [role="listbox"], [role="option"], [role="checkbox"], [role="radio"], [role="radiogroup"], [aria-haspopup="listbox"]';

function isJobFlowElement(element: Element): boolean {
  return (
    element.matches('jobflow-form-assistant') ||
    element.closest('jobflow-form-assistant') !== null
  );
}

function containsRelevantElement(node: Node): boolean {
  if (!(node instanceof Element) || isJobFlowElement(node)) return false;
  return (
    node.matches(FORM_SELECTOR) || node.querySelector(FORM_SELECTOR) !== null
  );
}

function isRelevantMutation(mutation: MutationRecord): boolean {
  if (mutation.type === 'attributes') {
    return (
      mutation.target instanceof Element && !isJobFlowElement(mutation.target)
    );
  }

  return [...mutation.addedNodes, ...mutation.removedNodes].some(
    containsRelevantElement,
  );
}

export function observeRelevantFormMutations(
  root: Node,
  onChange: () => void,
  options: MutationWatcherOptions = {},
): { disconnect(): void } {
  const delayMs = options.delayMs ?? 200;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const observer = new MutationObserver((mutations) => {
    if (!mutations.some(isRelevantMutation)) return;
    if (timer !== undefined) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = undefined;
      onChange();
    }, delayMs);
  });

  observer.observe(root, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: [
      'id',
      'name',
      'type',
      'role',
      'for',
      'aria-label',
      'aria-labelledby',
      'aria-controls',
      'aria-expanded',
      'aria-checked',
      'aria-selected',
      'aria-activedescendant',
      'aria-haspopup',
      'placeholder',
      'action',
      'method',
    ],
  });

  return {
    disconnect() {
      observer.disconnect();
      if (timer !== undefined) clearTimeout(timer);
    },
  };
}
