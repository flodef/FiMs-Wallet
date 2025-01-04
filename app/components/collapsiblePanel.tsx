import { CaretRightOutlined, DownOutlined } from '@ant-design/icons';
import { Collapse } from 'antd';
import { ReactNode, useEffect, useState } from 'react';

interface CollapsiblePanelProps {
  label: ReactNode;
  children: ReactNode;
  isExpanded?: boolean;
  hasCardStyle?: boolean;
}

export const CollapsiblePanel = ({
  label,
  children,
  isExpanded = true,
  hasCardStyle = true,
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
      className={hasCardStyle ? 'ant-card' : 'ant-cardless'}
      bordered={false}
      expandIconPosition="end"
      onChange={setActiveKey}
    />
  );
};
