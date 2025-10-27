import { IconCopy } from '@tabler/icons-react';
import { Tooltip } from 'antd';
import { MessageInstance } from 'antd/es/message/interface';
import { twMerge } from 'tailwind-merge';
import { useIsMobile } from '../utils/mobile';
import { Dataset } from '../utils/types';

const t: Dataset = {
  copy: 'Copie',
  copiedToClipboard: 'copié(e) dans le presse-papiers',
};

interface CopyButtonProps {
  content: string | number | undefined;
  label: string;
  messageApi: MessageInstance;
  className?: string;
  onCopy?: () => void;
}

export const CopyButton = ({ content, label, messageApi, className, onCopy }: CopyButtonProps) => {
  const isMobile = useIsMobile();

  const handleClick = (e: React.MouseEvent) => {
    if (!content) return;

    e.preventDefault();

    navigator.clipboard.writeText(content.toString());
    messageApi.open({
      type: 'success',
      content: `${label} ${t.copiedToClipboard}`,
    });

    onCopy?.();
  };

  const icon = (
    <IconCopy
      className={twMerge(
        'h-5 w-5 ml-2 cursor-pointer',
        'text-theme-content-emphasis dark:text-dark-theme-content-emphasis',
        'hover:text-theme-content dark:hover:text-dark-theme-content',
        className,
      )}
      onClick={handleClick}
    />
  );

  return !!content && (isMobile ? icon : <Tooltip title={t.copy}>{icon}</Tooltip>);
};
