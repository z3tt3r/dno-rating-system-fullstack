import React from 'react';
import type { RiskResponseDto } from '../types/dtos';

interface RiskHistoryTableProps {
  risks: RiskResponseDto[];
}

const RiskHistoryTable: React.FC<RiskHistoryTableProps> = ({ risks }) => {

  const formatCurrencyEnglish = (amount: number) => {
    if (typeof amount !== 'number' || isNaN(amount)) {
      return 'N/A';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'CZK',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatNumberEnglish = (num: number): string => {
    if (typeof num !== 'number' || isNaN(num)) {
      return 'N/A';
    }
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">Risk Calculation History</h5>
      </div>
      <div className="card-body">
        {risks.length === 0 ? (
          <div className="text-center text-muted py-4">
            No risk calculations yet
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Activity</th>
                  <th>Turnover</th> 
                  <th>Limit</th>    
                  <th>Performance</th>
                  <th>Net Premium</th>
                </tr>
              </thead>
              <tbody>
                {risks.map((risk) => (
                  <tr key={risk.id}>
                    <td>
                      <div>
                        <strong>{risk.clientName}</strong>
                        <br />
                        <small className="text-muted">Client ID: {risk.clientId}</small>
                      </div>
                    </td>
                    <td>{risk.activity}</td>
                    <td>
                      {formatNumberEnglish(risk.turnoverInThousands)}K CZK
                    </td>
                    <td>
                      {formatNumberEnglish(risk.limitInMillions)}M CZK
                    </td>
                    <td>
                      <span className={`badge ${
                        risk.financialPerformance === 'ABOVE_AVERAGE' ? 'bg-success' :
                        risk.financialPerformance === 'AVERAGE' ? 'bg-info' :
                        risk.financialPerformance === 'BELOW_AVERAGE' ? 'bg-danger' : 'bg-secondary'
                      }`}>
                        {risk.financialPerformance}
                      </span>
                    </td>
                    <td>
                      <strong className="text-success">
                        {formatCurrencyEnglish(risk.nettoPremium)}
                      </strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiskHistoryTable;