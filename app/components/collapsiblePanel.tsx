import { CaretRightOutlined, DownOutlined } from '@ant-design/icons';
import { Collapse } from 'antd';
import { ReactNode, useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

interface CollapsiblePanelProps {
  label: ReactNode;
  children: ReactNode;
  isExpanded?: boolean;
  hasCardStyle?: boolean;
  className?: string;
  onExpandedChange?: (isExpanded: boolean) => void;
}

export const CollapsiblePanel = ({
  label,
  children,
  isExpanded = true,
  hasCardStyle = true,
  className,
  onExpandedChange,
}: CollapsiblePanelProps) => {
  const [activeKey, setActiveKey] = useState<Array<string | number> | string | number | undefined>();

  useEffect(() => {
    setActiveKey(isExpanded ? [0] : undefined);
  }, [isExpanded]);

  const handleChange = (key: Array<string | number> | string | number | undefined) => {
    setActiveKey(key);
    onExpandedChange?.(Array.isArray(key) ? key.length > 0 : key !== undefined);
  };

  return (
    <Collapse
      items={[{ label, children }]}
      activeKey={activeKey}
      expandIcon={({ isActive }) => (
        <div>
          {hasCardStyle ? (
            <DownOutlined
              style={{ color: 'var(--text)' }}
              className="text-lg items-center"
              rotate={isActive ? 180 : 0}
            />
          ) : (
            <CaretRightOutlined
              style={{ color: 'var(--text)' }}
              className="text-lg items-center"
              rotate={isActive ? 90 : 0}
            />
          )}
        </div>
      )}
      className={twMerge(hasCardStyle ? 'ant-card' : 'ant-cardless', className)}
      bordered={false}
      expandIconPlacement="end"
      destroyOnHidden
      onChange={handleChange}
    />
  );
};
