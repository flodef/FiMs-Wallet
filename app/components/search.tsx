import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import { TextInput } from '@tremor/react';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Dataset } from '../utils/types';

const t: Dataset = {
  searchByName: 'Rechercher par nom...',
};

export default function Search({ disabled, defaultValue }: { disabled?: boolean; defaultValue: string }) {
  const { replace } = useRouter();
  const pathname = usePathname();

  const [value, setValue] = useState(defaultValue);

  const handleSearch = useCallback(
    (term: string) => {
      setValue(term);

      const params = new URLSearchParams(window.location.search);
      if (term) {
        params.set('q', term);
      } else {
        params.delete('q');
      }

      replace(`${pathname}?${params.toString()}`);
    },
    [pathname, replace]
  );

  const inputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, []);

  return (
    <div className="relative mt-5 max-w-md">
      <label htmlFor="search" className="sr-only">
        {t.searchByName}
      </label>
      <TextInput
        autoFocus
        ref={inputRef}
        icon={MagnifyingGlassIcon}
        type="text"
        name="search"
        id="search"
        disabled={disabled}
        placeholder={t.searchByName}
        spellCheck={false}
        autoComplete="off"
        value={value}
        onChange={(e) => handleSearch(e.target.value)}
      />
    </div>
  );
}
