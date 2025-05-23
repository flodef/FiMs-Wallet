import { IconEye, IconEyeOff } from '@tabler/icons-react';
import { Icon } from '@tremor/react';
import { twMerge } from 'tailwind-merge';
import { usePrivacy } from '../contexts/privacyProvider';

export function toPrivacy(
  amount: number,
  hasPrivacy: boolean,
  currencyType: CurrencyType = 'standard',
  currency?: string,
): string {
  const convert = {
    short: (a: number) => a.toShortCurrency(1, currency),
    standard: (a: number) => a.toLocaleCurrency(undefined, undefined, currency),
    strict: (a: number) => a.toLocaleCurrency(2, 2, currency),
    none: (a: number) => a.toString(),
  }[currencyType];

  return convert(amount)
    .replace(hasPrivacy ? '-' : '', '')
    .replace(hasPrivacy ? /[0-9.,;-\s]/g : /^$/, '*');
}

export type CurrencyType = 'short' | 'standard' | 'strict' | 'none';
export type PrivacyType = 'blur' | 'star';
export function Privacy({
  className,
  amount,
  currencyType,
  type = 'blur',
  hideZero = false,
  currency,
}: {
  className?: string;
  amount: Readonly<number | undefined>;
  currencyType?: CurrencyType;
  type?: PrivacyType;
  hideZero?: boolean;
  currency?: string;
}) {
  const { hasPrivacy } = usePrivacy();

  return (
    amount !== undefined &&
    (!hideZero || amount !== 0) && (
      <div className={twMerge(className, 'whitespace-nowrap', hasPrivacy && type === 'blur' ? 'blur' : 'blur-none')}>
        {toPrivacy(amount, hasPrivacy && type === 'star', currencyType, currency)}
      </div>
    )
  );
}

export function PrivacyButton() {
  const { hasPrivacy, setHasPrivacy } = usePrivacy();

  return (
    <Icon
      className="ml-4 p-0 cursor-pointer self-center"
      icon={hasPrivacy ? IconEye : IconEyeOff}
      size="xl"
      color="gray"
      onClick={e => {
        e.stopPropagation();
        setHasPrivacy(!hasPrivacy);
      }}
    />
  );
}
