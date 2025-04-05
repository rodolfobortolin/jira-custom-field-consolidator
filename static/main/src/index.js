import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

// Usando a versão mínima que definitivamente não terá problemas de CSP
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
