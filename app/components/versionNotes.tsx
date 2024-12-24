import { IconArrowDown, IconArrowUp } from '@tabler/icons-react';
import { Button } from '@tremor/react';
import { Divider, Flex } from 'antd';
import { marked } from 'marked';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { Dataset } from '../utils/types';
import { Metric, Title } from './typography';

const t: Dataset = {
  close: 'Fermer',
  news: 'Nouveautés',
  showMore: 'Voir plus',
  showLess: 'Voir moins',
};

export type VersionNote = {
  version: string;
  notes: string[];
};

export default function VersionNotes({ versionNotes, onClose }: { versionNotes: VersionNote[]; onClose: () => void }) {
  const [showMore, setShowMore] = useState(false);

  return (
    <Flex
      vertical
      justify="center"
      align="center"
      className="text-theme-content-emphasis dark:text-dark-theme-content-emphasis"
    >
      <Metric>{t.news}</Metric>
      {versionNotes.map((versionNote, index) => (
        <Flex
          vertical
          className={twMerge('w-full')}
          style={{ display: index === 0 || showMore ? 'flex' : 'none' }}
          key={index}
        >
          <Divider style={{ marginBottom: 0 }}>
            <Title>{versionNote.version}</Title>
          </Divider>
          <ul className="disc-list">
            {versionNote.notes.map((note, noteIndex) => (
              <li key={noteIndex}>
                <span dangerouslySetInnerHTML={{ __html: marked.parse(note) }}></span>
              </li>
            ))}
          </ul>
        </Flex>
      ))}
      <Flex className="gap-6 mt-6" justify="center" align="center">
        <Button className="font-bold" style={{ borderRadius: 24 }} onClick={onClose}>
          {t.close}
        </Button>
        <Button
          icon={showMore ? IconArrowUp : IconArrowDown}
          iconPosition="right"
          variant="light"
          onClick={() => setShowMore(!showMore)}
        >
          {showMore ? t.showLess : t.showMore}
        </Button>
      </Flex>
    </Flex>
  );
}
