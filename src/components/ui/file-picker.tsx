import { useRef, type ReactNode } from 'react';

import { Button } from './button';

type FilePickerProps = {
  label: ReactNode;
  accept?: string;
  disabled?: boolean;
  onFile: (file: File) => void | Promise<void>;
  className?: string;
  inputLabel?: string;
};

export function FilePicker({
  label,
  accept,
  disabled = false,
  onFile,
  className,
  inputLabel = 'Choose file',
}: FilePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <input
        ref={inputRef}
        className="absolute h-px w-px overflow-hidden whitespace-nowrap border-0 p-0"
        style={{ clip: 'rect(0, 0, 0, 0)', margin: -1 }}
        type="file"
        accept={accept}
        aria-label={inputLabel}
        disabled={disabled}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file !== undefined) void onFile(file);
          event.target.value = '';
        }}
      />
      <Button
        className={className}
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
      >
        {label}
      </Button>
    </>
  );
}
