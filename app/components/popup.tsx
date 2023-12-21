'use client';

import { XMarkIcon } from '@heroicons/react/24/outline';
import { Card, Flex } from '@tremor/react';
import { usePopup } from '../hooks/usePopup';
import { isMobileDevice } from '../utils/mobile';

export default function Popup() {
  const { closePopup, isPopupOpen, popupContent, hasTextInput } = usePopup();

  return (
    <div className={'absolute inset-0 h-full w-full overflow-hidden grid ' + (isPopupOpen ? 'block' : 'hidden')}>
      <div
        data-open={isPopupOpen}
        className={'absolute inset-0 z-20 opacity-50 bg-gray-900 data-[open=false]:hidden'}
      ></div>
      <div
        id="popup" // id is mandatory for the screenshot to work
        data-open={isPopupOpen}
        className={
          'absolute z-30 w-[90%] max-h-[90%] max-w-[400px] overflow-y-auto overflow-x-hidden ' +
          'justify-self-center h-fit rounded-2xl blur-none data-[open=false]:hidden pointer-events-auto ' +
          (isMobileDevice() && hasTextInput ? ' mt-[15%]' : 'self-center')
        }
      >
        <Card>
          <Flex flexDirection="row" justifyContent="between">
            {popupContent}
            <Flex className="w-8 self-baseline">
              <XMarkIcon
                className="block h-8 w-8 font-bold focus:border-0 focus:ring-0 focus:outline-0 cursor-pointer"
                aria-hidden="true"
                onClick={closePopup}
              />
            </Flex>
          </Flex>
        </Card>
      </div>
    </div>
  );
}
