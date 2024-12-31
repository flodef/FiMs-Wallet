import { DownOutlined } from '@ant-design/icons';
import { Collapse, type CollapseProps } from 'antd';
import { useEffect, useState } from 'react';

interface CollapsiblePanelProps {
  items: CollapseProps['items'];
  isExpanded?: boolean;
}

export const CollapsiblePanel = ({ items, isExpanded = true }: CollapsiblePanelProps) => {
  const [activeKey, setActiveKey] = useState<Array<string | number> | string | number | undefined>();

  useEffect(() => {
    setActiveKey(isExpanded ? [0] : undefined);
  }, [isExpanded]);

  return (
    <Collapse
      items={items}
      activeKey={activeKey}
      expandIcon={({ isActive }) => (
        <div>
          <DownOutlined style={{ color: 'var(--text)' }} className="text-lg items-center" rotate={isActive ? 180 : 0} />
        </div>
      )}
      style={{ backgroundColor: 'var(--background)', color: 'var(--text)' }}
      bordered={false}
      expandIconPosition="end"
      onChange={setActiveKey}
    />
  );
};
