import { DownOutlined } from '@ant-design/icons';
import { Collapse, type CollapseProps } from 'antd';

interface CollapsiblePanelProps {
  items: CollapseProps['items'];
  isExpanded?: boolean;
}

export const CollapsiblePanel = ({ items, isExpanded = true }: CollapsiblePanelProps) => {
  return (
    <Collapse
      items={items}
      defaultActiveKey={isExpanded ? [0] : undefined}
      expandIcon={({ isActive }) => (
        <div>
          <DownOutlined style={{ color: 'var(--text)' }} className="text-lg items-center" rotate={isActive ? 180 : 0} />
        </div>
      )}
      style={{ backgroundColor: 'var(--background)', color: 'var(--text)' }}
      bordered={false}
      expandIconPosition="end"
    />
  );
};
