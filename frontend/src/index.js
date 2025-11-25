import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Tìm thẻ div có id="root" trong file public/index.html
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render App vào thẻ root đó
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);