import { IconChartDonut3, IconGauge } from '@tabler/icons-react';
import { Flex, Segmented } from 'antd';
import { BaseType } from 'antd/es/typography/Base';
import { useMemo, useState } from 'react';
import { AvailableChartColorsKeys } from '../utils/chart';
import { useIsMobile } from '../utils/mobile';
import { Data, Dataset } from '../utils/types';
import { DonutChart } from './donutChart';
import { Gauge } from './gauge';

const t: Dataset = {
  veryHigh: 'Très fort',
  high: 'Fort',
  low: 'Faible',
  veryLow: 'Très faible',
  medium: 'Moyen',
  volatility: 'Volatilité',
  risk: 'Risque',
  price: 'Prix',
  loading: 'Chargement...',
};

enum GraphType {
  Distribution = 'Distribution',
  Risk = 'Risk',
}

export const getRisk = (ratio: number): { label: string; type: BaseType } => {
  if (ratio >= 0.8) return { label: t.veryHigh, type: 'danger' };
  if (ratio >= 0.6) return { label: t.high, type: 'danger' };
  if (ratio >= 0.4) return { label: t.medium, type: 'warning' };
  if (ratio >= 0.2) return { label: t.low, type: 'success' };
  return { label: t.veryLow, type: 'success' };
};

interface TokenGraphData extends Data {
  volatility: number;
}

interface TokenGraphsProps {
  selectedIndex: number | undefined;
  setSelectedIndex: (index?: number) => void;
  currentToken?: TokenGraphData;
  data: Data[];
  total: number;
  tokens: TokenGraphData[];
  tokenColors?: AvailableChartColorsKeys[];
}

export function TokenGraphs({
  selectedIndex,
  setSelectedIndex,
  currentToken,
  data,
  total,
  tokens,
  tokenColors,
}: TokenGraphsProps) {
  const isMobile = useIsMobile();
  const [graphType, setGraphType] = useState(GraphType.Distribution);

  const overallVolatility = useMemo(() => {
    if (!tokens.length) return -1;

    const totalValue = total;
    if (totalValue === 0) return -1;

    return data.reduce((weightedVolatility, data) => {
      const weight = data.value / totalValue;
      return weightedVolatility + (tokens.find(t => t.label === data.label)?.volatility ?? 0) * weight;
    }, 0);
  }, [tokens, data, total]);

  return tokens.length === 0 ? (
    <Flex className="h-40" justify="center" align="center">
      {t.loading}
    </Flex>
  ) : (
    <Flex>
      {isMobile && (
        <Segmented
          className="h-fit"
          vertical
          defaultValue={graphType}
          options={[
            { value: GraphType.Distribution, icon: <IconChartDonut3 /> },
            { value: GraphType.Risk, icon: <IconGauge /> },
          ]}
          onChange={setGraphType}
        />
      )}
      {graphType === GraphType.Risk || !isMobile ? (
        <Gauge
          value={selectedIndex !== undefined && !!currentToken ? currentToken.volatility : overallVolatility}
          title={`${t.volatility} : ${(selectedIndex !== undefined && !!currentToken
            ? currentToken.volatility
            : overallVolatility
          ).toRatio(0)}`}
          subtitle={`${t.risk} : ${
            getRisk(selectedIndex !== undefined && !!currentToken ? currentToken.volatility : overallVolatility).label
          }`}
        />
      ) : null}
      {graphType === GraphType.Distribution || !isMobile ? (
        <DonutChart
          className="mx-auto"
          data={data}
          category="label"
          value="value"
          colors={tokenColors}
          variant="donut"
          label={t.price + ' : ' + currentToken?.value.toLocaleCurrency()}
          showLabel={selectedIndex !== undefined && !!currentToken}
          showTooltip={false}
          selectedIndex={selectedIndex}
          onSelectedIndexChange={setSelectedIndex}
          valueFormatter={(number: number) => `${number.toLocaleCurrency()}`}
        />
      ) : null}
    </Flex>
  );
}
