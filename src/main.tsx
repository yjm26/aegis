import React from 'react';
import ReactDOM from 'react-dom/client';
import Landing from './Landing';
import './style.css';  // we'll create this or alias

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Landing />
  </React.StrictMode>
);
