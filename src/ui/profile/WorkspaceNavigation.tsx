const items = [
  { label: 'Overview', heading: 'Career profile' },
  { label: 'Personal', heading: 'Basic information' },
  { label: 'Experience', heading: 'Experience' },
  { label: 'Education', heading: 'Education' },
  { label: 'Skills', heading: 'Skills' },
  { label: 'Documents', targetId: 'cv-import' },
  { label: 'Preferences', heading: 'Job preferences' },
  { label: 'Variants', heading: 'Application variants' },
  { label: 'Sensitive', heading: 'Sensitive data vault' },
  { label: 'Corrections', targetId: 'corrections' },
  { label: 'Backup', targetId: 'backup-recovery' },
] as const;

function scrollToHeading(text: string): void {
  const headings = Array.from(document.querySelectorAll<HTMLElement>('h1, h2, h3'));
  const heading = headings.find((candidate) => candidate.textContent?.trim() === text);
  (heading?.closest('.profile-section') ?? heading)?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
}

export function WorkspaceNavigation() {
  return (
    <div className="workspace-nav-wrap" aria-label="Career workspace navigation">
      <nav className="workspace-nav">
        {items.map((item) => (
          <button
            className="fillio-nav-link"
            type="button"
            key={item.label}
            onClick={() => {
              if ('targetId' in item) {
                document.getElementById(item.targetId)?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start',
                });
              } else {
                scrollToHeading(item.heading);
              }
            }}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
