'use client';

import { useEffect } from 'react';

const OpenAdminChat = () => {
  useEffect(() => {
    window.open('/message', '_blank');
  }, []);

  return (
    <div>
      Redirecting to admin chat...
    </div>
  );
};

export default OpenAdminChat;
