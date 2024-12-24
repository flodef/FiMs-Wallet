'use client';

import { IconX } from '@tabler/icons-react';
import { Card, Flex } from 'antd';
import { twMerge } from 'tailwind-merge';
import { usePopup } from '../hooks/usePopup';
import { isMobileDevice } from '../utils/mobile';

export default function Popup() {
  const { closePopup, isPopupOpen, popupContent, hasTextInput } = usePopup();
  return (
    <div
      className={twMerge(
        'absolute inset-0 h-full w-full grid',
        isPopupOpen ? 'visible opacity-100' : 'invisible opacity-0',
        'transition-all',
      )}
    >
      <div
        className={twMerge(
          'absolute inset-0 z-20 bg-gray-900',
          isPopupOpen ? 'opacity-50' : 'opacity-0',
          'transition-opacity',
        )}
      ></div>
      <div
        id="popup" // id is mandatory for the screenshot to work
        className={twMerge(
          'absolute z-30 max-h-[90%] w-[80%] max-w-[500px] overflow-y-auto overflow-x-hidden',
          'justify-self-center h-fit rounded-2xl pointer-events-auto',
          isMobileDevice() && hasTextInput ? ' mt-[15%]' : 'self-center',
          isPopupOpen ? 'opacity-100 blur-none' : 'opacity-0 blur-sm',
          'transition-all',
        )}
      >
        <Card style={{ border: 1, borderColor: 'white' }} className="border border-white">
          <Flex className="w-full self-baseline justify-end">
            <IconX
              className="block h-8 w-8 font-bold focus:border-0 focus:ring-0 focus:outline-0 cursor-pointer text-theme-content-emphasis dark:text-dark-theme-content-emphasis"
              aria-hidden="true"
              onClick={closePopup}
            />
          </Flex>
          <Flex justify="space-between" vertical>
            {popupContent}
          </Flex>
        </Card>
      </div>
    </div>
  );
}
