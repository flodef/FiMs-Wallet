import { Button, Divider, Flex, Title } from '@tremor/react';
import { useIsMobile } from '../utils/mobile';
import { Dataset } from '../utils/types';

const t: Dataset = {
  close: 'Fermer',
};

export type VersionNote = {
  version: string;
  notes: string[];
};

export default function VersionNotes({ versionNotes, onClose }: { versionNotes: VersionNote[]; onClose: () => void }) {
  const isMobile = useIsMobile(450); // sm for tailwindcss breakpoints
  const isTablet = useIsMobile(640); // md for tailwindcss breakpoints

  return (
    <Flex flexDirection="col">
      {versionNotes.map((versionNote, index) => (
        <div key={index}>
          <Divider>
            <Title>{versionNote.version}</Title>
          </Divider>
          <ul
            className="w-64 sm:w-96 md:w-[450px]"
            style={{ listStyleType: 'disc', width: isMobile ? '250px' : isTablet ? '350px' : '450px' }}
          >
            {versionNote.notes.map((note, noteIndex) => (
              <li className="text-left" key={noteIndex}>
                {note}
              </li>
            ))}
          </ul>
        </div>
      ))}
      <Button className="flex font-bold mt-6" style={{ borderRadius: 24 }} onClick={onClose}>
        {t.close}
      </Button>
    </Flex>
  );
}
