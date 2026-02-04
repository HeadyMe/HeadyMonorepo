// HEADY_BRAND:BEGIN
// HEADY SYSTEMS :: SACRED GEOMETRY
// FILE: apps/manager/frontend/src/main.tsx
// LAYER: root
// 
//         _   _  _____    _  __   __
//        | | | || ____|  / \ \  / /
//        | |_| ||  _|   / _ \ \ V / 
//        |  _  || |___ / ___ \ | |  
//        |_| |_||_____/_/   \_\|_|  
// 
//    Sacred Geometry :: Organic Systems :: Breathing Interfaces
// HEADY_BRAND:END

import React from 'react';
import ReactDOM from 'react-dom/client';
import SplitPane from './components/SplitPane';
import './index.css';

const App = () => (
  <SplitPane left={<div>Task Queue</div>} right={<div>Context Dashboard</div>} />
);

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
