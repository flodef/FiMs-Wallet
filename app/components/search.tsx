import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import { TextInput } from '@tremor/react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { dataset } from '../utils/types';

const t: dataset = {
  searchByName: 'Rechercher par nom...',
};

export default function Search({ disabled, defaultValue }: { disabled?: boolean; defaultValue: string }) {
  const { replace } = useRouter();
  const pathname = usePathname();

  function handleSearch(term: string) {
    const params = new URLSearchParams(window.location.search);
    if (term) {
      params.set('q', term);
    } else {
      params.delete('q');
    }

    replace(`${pathname}?${params.toString()}`);
  }

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
        value={defaultValue}
        onChange={(e) => handleSearch(e.target.value)}
      />
    </div>
  );
}
