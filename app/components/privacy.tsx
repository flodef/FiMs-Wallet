import { IconEye, IconEyeOff } from '@tabler/icons-react';
import { Icon } from '@tremor/react';
import { usePrivacy } from '../contexts/privacyProvider';

export function toPrivacy(amount: number | undefined, hasPrivacy: boolean, isShort?: boolean): string {
  const convert = isShort ? (a: number) => a.toShortCurrency() : (a: number) => a.toLocaleCurrency();
  return convert(amount ?? 0)
    .replace(hasPrivacy ? '-' : '', '')
    .replace(hasPrivacy ? /[0-9.,;-\s]/g : /^$/, '*');
}

export type PrivacyType = 'blur' | 'star';
export function Privacy({
  amount,
  isShort,
  type = 'blur',
}: {
  amount: Readonly<number | undefined>;
  isShort?: Readonly<boolean>;
  type?: PrivacyType;
}) {
  const { hasPrivacy } = usePrivacy();

  return (
    <div className={hasPrivacy && type === 'blur' ? 'blur' : 'blur-none'}>
      {toPrivacy(amount, hasPrivacy && type === 'star', isShort)}
    </div>
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
