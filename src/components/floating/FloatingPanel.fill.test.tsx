import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';

import { FloatingPanel } from './FloatingPanel';

it('reports verified partial fill outcomes to the user', () => {
  render(
    <FloatingPanel
      summary={{ ready: 2, needsReview: 0, sensitive: 0, unknown: 0, total: 2 }}
      onFill={() => [
        { fieldFingerprint: 'first', status: 'filled' },
        { fieldFingerprint: 'second', status: 'unsupported' },
      ]}
    />,
  );

  fireEvent.click(screen.getByRole('button', { name: 'Open Job Flow' }));
  fireEvent.click(screen.getByRole('button', { name: 'Fill 2 ready fields' }));

  expect(screen.getByRole('status').textContent).toBe(
    '1 of 2 fields filled. 1 need manual input.',
  );
});
