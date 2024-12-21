import { IconArrowDown, IconArrowUp } from '@tabler/icons-react';
import { Button, Divider, Flex } from '@tremor/react';
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
    <Flex flexDirection="col" className="text-theme-content-emphasis dark:text-dark-theme-content-emphasis">
      <Metric>{t.news}</Metric>
      {versionNotes.map((versionNote, index) => (
        <div className={twMerge('w-full', index === 0 || showMore ? 'visible' : 'hidden')} key={index}>
          <Divider>
            <Title>{versionNote.version}</Title>
          </Divider>
          <ul style={{ listStyleType: 'disc' }}>
            {versionNote.notes.map((note, noteIndex) => (
              <li key={noteIndex}>
                <span dangerouslySetInnerHTML={{ __html: marked.parse(note) }}></span>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <Flex className="gap-6 mt-6" justifyContent="center" alignItems="center">
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
