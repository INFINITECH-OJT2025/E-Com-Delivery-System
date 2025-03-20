'use client';

import React, { useEffect, useState } from 'react';
import { homeService } from '@/services/homeService';

const PendingOrder = () => {
  const [orderInfo, setOrderInfo] = useState<string>('Checking your pending orders...');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await homeService.getPendingOrder();

        if (response.success && response.data && response.data.status) {
          setOrderInfo(`Your current order status: ${response.data.status}`);
        } else if (!response.success && response.message === 'Unauthorized') {
          setOrderInfo('Please log in to view your orders.');
        } else if (!response.success && response.message === 'No active orders found') {
          setOrderInfo('You have no active orders at the moment.'); // ✅ No longer treated as an error
        } else {
          setOrderInfo('No pending orders available.');
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        setOrderInfo('Unable to check your orders at this time.');
      }
    };

    fetchOrder();
  }, []);

  return (
    <div className="bg-yellow-100 text-yellow-800 p-2 rounded">
      {orderInfo}
    </div>
  );
};

export default PendingOrder;
