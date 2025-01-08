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
}

export const CollapsiblePanel = ({
  label,
  children,
  isExpanded = true,
  hasCardStyle = true,
  className,
}: CollapsiblePanelProps) => {
  const [activeKey, setActiveKey] = useState<Array<string | number> | string | number | undefined>();

  useEffect(() => {
    setActiveKey(isExpanded ? [0] : undefined);
  }, [isExpanded]);

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
      expandIconPosition="end"
      onChange={setActiveKey}
    />
  );
};
