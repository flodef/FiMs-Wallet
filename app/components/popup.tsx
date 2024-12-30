'use client';

import { Modal } from 'antd';
import { usePopup } from '../hooks/usePopup';

export default function Popup() {
  const { closePopup, isPopupOpen, popupContent } = usePopup();

  return (
    <Modal open={isPopupOpen} onCancel={closePopup} footer={null}>
      {popupContent}
    </Modal>
  );
}
