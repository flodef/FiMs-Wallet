import { IconChevronsRight } from '@tabler/icons-react';
import { Flex } from 'antd';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { Token } from '../hooks/useData';
import { FIMS } from '../utils/constants';
import { Data, Dataset } from '../utils/types';
import { Privacy } from './privacy';
import { TokenDetails } from './tokenDetails';
import { Metric } from './typography';

const t: Dataset = {
  tokenLogo: 'Logo du token',
  transfered: 'Investi',
  withdrawn: 'Retiré',
  gains: 'Gains',
  loss: 'Pertes',
};

interface TokenListItemProps {
  asset: Token;
  hasLoaded: boolean;
}

export function TokenListLoading() {
  return (
    <div className="flex w-full animate-pulse py-4">
      <div className="bg-theme-border rounded-full w-[50px] h-[50px] hidden 2xs:flex items-center mx-0 xs:mx-2 md:mx-4"></div>
      <div className="flex flex-col px-2 md:px-4 flex-1 min-w-0">
        <div className="bg-theme-border rounded-md w-24 xs:w-36 md:w-44 h-7 mb-1" />
        <div className="bg-theme-border rounded-md w-12 h-5 mb-1" />
      </div>
      <div className="hidden sm:flex flex-col w-32">
        <div className="bg-theme-border rounded-md w-32 h-5 mb-1" />
        <div className="bg-theme-border rounded-md w-32 h-5 mb-1" />
      </div>
      <div className="flex flex-col mx-0 md:mx-2 items-end w-32 md:flex-1">
        <div className="bg-theme-border rounded-md w-24 h-5 mb-1" />
        <div className="bg-theme-border rounded-md w-16 h-7 mb-1" />
      </div>
      <div className="bg-theme-border rounded-md hidden xs:flex self-center mx-0 xs:mx-2 md:mx-4 justify-center w-8 h-8"></div>
    </div>
  );
}

export function TokenListItem({ asset, hasLoaded }: TokenListItemProps) {
  const [hasError, setHasError] = useState(false);
  const [fallbackImage, setFallbackImage] = useState<string | null>(null);

  const fetchTokenMetadata = useCallback(async (address: string) => {
    try {
      const response = await fetch(`https://lite-api.jup.ag/tokens/v1/token/${address}`);
      if (!response.ok) throw new Error('Failed to fetch token metadata');
      return await response.json();
    } catch (error) {
      console.error('Error fetching token metadata:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    if ((hasError || !asset.image) && asset.address) {
      const fetchImage = async () => {
        try {
          const metadata = await fetchTokenMetadata(asset.address);
          if (metadata?.logoURI) {
            setFallbackImage(metadata.logoURI);
            setHasError(false);
          }
        } catch (error) {
          console.error('Failed to fetch token metadata:', error);
        }
      };
      fetchImage();
    }
  }, [hasError, asset.address, asset.image, fetchTokenMetadata]);

  return (
    <div className="flex w-full">
      <div className="rounded-full w-[50px] h-[50px] hidden 2xs:flex items-center justify-center mx-0 xs:mx-2 md:mx-4 bg-theme-muted">
        {hasError || !asset.image || fallbackImage ? (
          fallbackImage ? (
            <Image
              src={fallbackImage}
              alt={t.tokenLogo}
              width={50}
              height={50}
              className="rounded-full"
              onError={() => setHasError(true)}
            />
          ) : (
            <Metric>?</Metric>
          )
        ) : (
          <Image
            src={asset.image}
            alt={t.tokenLogo}
            width={50}
            height={50}
            className="rounded-full"
            onError={() => setHasError(true)}
          />
        )}
      </div>
      <div className="flex flex-col px-2 md:px-4 flex-1 min-w-0">
        <div className="text-xl truncate">{asset.label}</div>
        <div>{asset.value ? asset.value.toLocaleCurrency() : ''}</div>
      </div>
      {asset.label.includes(FIMS) ? (
        hasLoaded ? (
          <div className={twMerge('hidden sm:flex flex-col w-32', asset.movement ? 'opacity-100' : 'opacity-0')}>
            <Flex>
              {asset.movement >= 0 ? t.transfered : t.withdrawn}&nbsp;:&nbsp;
              <Privacy className="font-bold" amount={asset.movement} />
            </Flex>
            <Flex>
              {asset.profit >= 0 ? t.gains : t.loss}&nbsp;:&nbsp;
              <Privacy
                className={twMerge('font-bold', asset.profit >= 0 ? 'text-ok' : 'text-error')}
                amount={asset.profit}
              />
            </Flex>
          </div>
        ) : (
          <div className="hidden sm:flex flex-col w-32 animate-pulse">
            <div className="bg-theme-border rounded-md w-32 h-5 mb-1" />
            <div className="bg-theme-border rounded-md w-32 h-5 mb-1" />
          </div>
        )
      ) : null}
      <div className="flex flex-col mx-0 md:mx-2 items-end w-32 md:flex-1">
        <Flex className="gap-1 justify-end">
          <Privacy amount={asset.balance.toDecimalPlace(asset.balance.getPrecision(), 'down')} currencyType="none" />
          {asset.symbol}
        </Flex>
        <Privacy className="font-bold text-lg text-right" amount={asset.total} />
      </div>
    </div>
  );
}

interface TokenDetailsButtonProps {
  className?: string;
  index: number;
  selectedIndex?: number;
  hasLoaded: boolean;
  isTokenDetailsOpen: boolean;
  tokenDetails: Data[];
  total: number;
  onSelectedIndexChange: (index: number | undefined) => void;
  onTokenDetailsOpenChange: (isOpen: boolean) => void;
}

export function TokenDetailsButton({
  className,
  index,
  selectedIndex,
  hasLoaded,
  isTokenDetailsOpen,
  tokenDetails,
  total,
  onSelectedIndexChange,
  onTokenDetailsOpenChange,
}: TokenDetailsButtonProps) {
  return (
    <div className="flex items-center self-center mx-0 xs:mx-2 md:mx-4 w-[50px] h-full justify-center">
      <IconChevronsRight
        className={twMerge(
          className,
          'h-8 w-8 text-theme-content-strong dark:text-dark-theme-content-strong',
          'transition-all duration-500 group-hover:animate-pulse',
        )}
        onClick={e => {
          e.stopPropagation();
          onSelectedIndexChange(index);
          onTokenDetailsOpenChange(true);
        }}
      />
      {hasLoaded ? (
        <TokenDetails
          isOpen={isTokenDetailsOpen}
          onClose={() => onTokenDetailsOpenChange(false)}
          data={tokenDetails}
          total={total}
          selectedIndex={selectedIndex}
          onSelectedIndexChange={onSelectedIndexChange}
        />
      ) : null}
    </div>
  );
}
