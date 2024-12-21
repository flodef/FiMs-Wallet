import { IconArrowDown, IconArrowUp } from '@tabler/icons-react';
import { Button, Divider, Flex, Metric } from '@tremor/react';
import { marked } from 'marked';
import { useState } from 'react';
import { useIsMobile } from '../utils/mobile';
import { Dataset } from '../utils/types';
import { Title } from './typography';

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
  const isMobile = useIsMobile(450); // sm for tailwindcss breakpoints
  const isTablet = useIsMobile(640); // md for tailwindcss breakpoints

  const [showMore, setShowMore] = useState(false);

  return (
    <Flex flexDirection="col">
      <Metric>{t.news}</Metric>
      {versionNotes.map((versionNote, index) => (
        <div className={index === 0 || showMore ? 'visible' : 'hidden'} key={index}>
          <Divider>
            <Title>{versionNote.version}</Title>
          </Divider>
          <ul
            className="w-64 sm:w-96 md:w-[450px]"
            style={{ listStyleType: 'disc', width: isMobile ? '250px' : isTablet ? '350px' : '450px' }}
          >
            {versionNote.notes.map((note, noteIndex) => (
              <li className="text-left" key={noteIndex}>
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
