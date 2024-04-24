import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { Icon } from '@tremor/react';
import { usePrivacy } from '../contexts/privacyProvider';

export function toPrivacy(amount: number | undefined, hasPrivacy: boolean, isShort?: boolean): string {
  const convert = isShort ? (a: number) => a.toShortCurrency() : (a: number) => a.toLocaleCurrency();
  return convert(amount ?? 0)
    .replace('-', '')
    .replace(hasPrivacy ? /[0-9.,;-\s]/g : /^$/, '*');
}

export function Privacy({ amount, isShort }: { amount: Readonly<number | undefined>; isShort?: Readonly<boolean> }) {
  const { hasPrivacy } = usePrivacy();

  return <>{toPrivacy(amount, hasPrivacy, isShort)}</>;
}

export function PrivacyButton() {
  const { hasPrivacy, setHasPrivacy } = usePrivacy();

  return (
    <Icon
      className="ml-2 cursor-pointer"
      icon={hasPrivacy ? EyeIcon : EyeSlashIcon}
      size="lg"
      color="gray"
      onClick={e => {
        e.stopPropagation();
        setHasPrivacy(!hasPrivacy);
      }}
    />
  );
}
