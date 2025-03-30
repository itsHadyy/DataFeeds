import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ShopDashboard from './components/ShopDashboard';
import InternalFieldsMapping from './components/InternalFieldsMapping';
import ChannelsPage from './components/ChannelsPage';
import ChannelMappingPage from './components/ChannelMappingPage';
import SettingsPanel from './components/SettingsPanel';
import { GlobalUIProvider } from './contexts/GlobalUI';

function App() {
  return (
    <GlobalUIProvider>
      <Router>
        <div className="app-container">
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />

          {/* Global Settings Panel - rendered once at app level */}
          <SettingsPanel />

          <Routes>
            {/* Main dashboard showing all shops */}
            <Route path="/" element={<ShopDashboard />} />

            {/* Internal fields mapping for a specific shop */}
            <Route path="/shops/:shopId/mapping" element={<InternalFieldsMapping />} />

            {/* Channels selection page */}
            <Route path="/channels" element={<ChannelsPage />} />

            {/* Channel-specific mapping */}
            <Route path="/channel-mapping/:channelId" element={<ChannelMappingPage />} />
          </Routes>
        </div>
      </Router>
    </GlobalUIProvider>
  );
}

export default App;