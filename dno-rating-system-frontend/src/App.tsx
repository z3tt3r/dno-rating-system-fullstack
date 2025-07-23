// src/App.tsx
import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'; // Your custom CSS

// Import components
import RiskCalculatorForm from './components/RiskCalculatorForm';
import RiskHistoryTable from './components/RiskHistoryTable';
import ClientsTable from './components/ClientTable';

// Import types
import type { RiskRequestDto, RiskResponseDto, Client } from './types/dtos';

// Import API services
import { fetchRiskHistory, fetchClients, calculateRisk } from './services/apiService';

// Main App Component
const DOInsuranceRatingSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'calculate' | 'history' | 'clients'>('calculate');
  const [riskHistory, setRiskHistory] = useState<RiskResponseDto[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);

  // Load risk history and clients on initial component mount
  useEffect(() => {
    const loadData = async () => {
        setLoading(true);
        try {
            await fetchRiskHistoryData();
            await fetchClientsData();
        } catch (error) {
            console.error("Failed to load initial data:", error);
            // You could show a user-friendly error message here
        } finally {
            setLoading(false);
        }
    };
    loadData();
  }, []);

  const fetchRiskHistoryData = async () => {
    try {
      const data = await fetchRiskHistory();
      setRiskHistory(data);
    } catch (error) {
      console.error('Error fetching risk history:', error);
    }
  };

  const fetchClientsData = async () => {
    try {
      const data = await fetchClients();
      setClients(data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const handleCalculateRisk = async (riskRequest: RiskRequestDto): Promise<RiskResponseDto | null> => {
    setLoading(true);
    try {
      const result = await calculateRisk(riskRequest);
      await fetchRiskHistoryData();
      await fetchClientsData();
      return result;
    } catch (error: any) {
      console.error('Error calculating risk:', error);
      throw error; // Re-throw the error for RiskCalculatorForm to handle
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <h1 className="mb-4">D&O Insurance Rating System</h1>

          {/* Navigation Tabs */}
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'calculate' ? 'active' : ''}`}
                onClick={() => setActiveTab('calculate')}
              >
                Calculate Premium
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'history' ? 'active' : ''}`}
                onClick={() => setActiveTab('history')}
              >
                Risk History ({riskHistory.length})
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'clients' ? 'active' : ''}`}
                onClick={() => setActiveTab('clients')}
              >
                Clients ({clients.length})
              </button>
            </li>
          </ul>

          {/* Tab Content - WRAP WITH THE NEW CLASS */}
          <div className="main-content-area"> {/* Add this class here */}
            {activeTab === 'calculate' && (
              <RiskCalculatorForm onCalculate={handleCalculateRisk} loading={loading} />
            )}
            {activeTab === 'history' && (
              <RiskHistoryTable risks={riskHistory} />
            )}
            {activeTab === 'clients' && (
              <ClientsTable clients={clients} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DOInsuranceRatingSystem;