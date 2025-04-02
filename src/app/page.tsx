'use client';

import React from 'react';
import StreamPlayer from './Components/StreamPlayer';

const HomePage: React.FC = () => {
  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', fontFamily: 'Arial, sans-serif' }}>
      <h1>Projet Twitchy – Client Récepteur</h1>
      <StreamPlayer />
    </div>
  );
};

export default HomePage;
