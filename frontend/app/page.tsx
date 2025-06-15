'use client'
import { useServiceWorker } from './service-worker-register';
import { useState, useEffect } from 'react'
import { subscribeUser, unsubscribeUser, sendNotification } from './actions'
import InstallPrompt from '../components/InstallPrompt';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
 
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
 
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
export default function Home() {
    <InstallPrompt />

    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
          <h1 className="text-4xl font-bold text-primary">Welcome to E-Com Delivery</h1>
          <p className="text-lg text-text mt-2">Order food from your favorite restaurants.</p>
          <a href="/login" className="mt-4 px-6 py-2 bg-secondary text-text rounded">
              Get Started
          </a>
      </div>
  );
}
