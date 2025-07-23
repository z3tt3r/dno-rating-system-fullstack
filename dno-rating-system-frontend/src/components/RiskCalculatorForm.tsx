// src/components/RiskCalculatorForm.tsx

import React, { useState } from 'react';
import type { RiskRequestDto, RiskResponseDto } from '../types/dtos';
// Důležité: Upraveno na 'ActivityData' s velkým 'A', aby odpovídalo názvu souboru, pokud je tak pojmenován na disku
import { predefinedActivityNames } from '../data/ActivityData'; 

interface RiskCalculatorFormProps {
  onCalculate: (risk: RiskRequestDto) => Promise<RiskResponseDto | null>;
  loading: boolean;
}

const RiskCalculatorForm: React.FC<RiskCalculatorFormProps> = ({ onCalculate, loading }) => {
  const [formData, setFormData] = useState<RiskRequestDto>({
    client: {
      name: '',
      street: '',
      houseNumber: '',
      orientationNumber: '', // Necháme prázdný string, backend @Size bez @NotBlank to akceptuje
      city: '',
      postcode: '',
      state: 'Czech Republic',
      ico: '',
    },
    activity: '', // Výchozí hodnota pro výběrové pole
    turnoverInThousands: 0,
    limitInMillions: 0,
    financialPerformance: 'AVERAGE',
    brokerCommissionPercentage: 15,
  });

  const [result, setResult] = useState<RiskResponseDto | null>(null);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);

    // Klientská validace, zda je aktivita vybrána
    if (!formData.activity) { 
        setError('Please select a business activity.');
        return;
    }

    // Důležitá poznámka k orientationNumber:
    // Pokud má být prázdný string poslán jako null na backend (protože tam není @NotBlank),
    // je potřeba provést tuto konverzi před odesláním:
    const clientDataToSend = { ...formData.client };
    if (clientDataToSend.orientationNumber === '') {
      // Pokud je pole prázdné, nastavíme ho na null, aby to odpovídalo nullable v DB a DTO
      clientDataToSend.orientationNumber = null as any; // Cast na any, protože string | null je jiný typ
    }

    const fullFormData = {
        ...formData,
        client: clientDataToSend
    }

    // Klientská validace před odesláním na backend
    if (fullFormData.limitInMillions * 1_000_000 > 50_000_000) {
        setError('Limit amount cannot exceed 50,000,000 CZK (50 million)');
        return;
    }

    const fullLimitAmount = fullFormData.limitInMillions * 1_000_000;
    const fullTurnoverAmount = fullFormData.turnoverInThousands * 1_000;

    if (fullLimitAmount > fullTurnoverAmount) {
      setError('Limit amount cannot be greater than turnover');
      return;
    }

    try {
      const response = await onCalculate(fullFormData); // Použijeme upravená data
      if (response) {
        setResult(response);
      }
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred during calculation.');
    }
  };

  const formatCurrency = (amount: number) => {
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
    <div className="row">
      <div className="col-lg-8">
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">Risk Premium Calculator</h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              {/* Client Information */}
              <div className="mb-4">
                <h6 className="text-primary">Client Information</h6>
                <hr />
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Company Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.client.name}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        client: { ...prev.client, name: e.target.value }
                      }))}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">IČO *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.client.ico}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        client: { ...prev.client, ico: e.target.value }
                      }))}
                      required
                      pattern="[0-9]{8}"
                      title="IČO must be 8 digits"
                    />
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Street *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.client.street}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        client: { ...prev.client, street: e.target.value }
                      }))}
                      required
                    />
                  </div>
                  {/* Změny pro House No. a Orientation No. */}
                  <div className="col-md-2 mb-3">
                    {/* Přidána třída nowrap-label k labelu */}
                    <label className="form-label nowrap-label">House No. *</label>
                    <input
                      type="text"
                      // Přidána třída nowrap-input k inputu
                      className="form-control nowrap-input"
                      value={formData.client.houseNumber}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        client: { ...prev.client, houseNumber: e.target.value }
                      }))}
                      required
                    />
                  </div>
                  <div className="col-md-2 mb-3">
                    {/* Přidána třída nowrap-label k labelu */}
                    <label className="form-label nowrap-label">Orientation No.</label>
                    <input
                      type="text"
                      // Přidána třída nowrap-input k inputu
                      className="form-control nowrap-input"
                      value={formData.client.orientationNumber || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        client: { ...prev.client, orientationNumber: e.target.value }
                      }))}
                    />
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">City *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.client.city}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        client: { ...prev.client, city: e.target.value }
                      }))}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Postcode *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.client.postcode}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        client: { ...prev.client, postcode: e.target.value }
                      }))}
                      required
                      pattern="[0-9]{5}"
                      title="Postcode must be 5 digits"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">State *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.client.state}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        client: { ...prev.client, state: e.target.value }
                      }))}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Risk Information */}
              <div className="mb-4">
                <h6 className="text-primary">Risk Information</h6>
                <hr />
                <div className="row">
                  <div className="col-md-12 mb-3">
                    <label className="form-label">Business Activity *</label>
                    {/* ZDE JE ZMĚNA: z input na select */}
                    <select
                      className="form-select"
                      value={formData.activity}
                      onChange={(e) => setFormData(prev => ({ ...prev, activity: e.target.value }))}
                      required 
                    >
                      <option value="">Select a business activity</option> {/* Prázdná volba pro výchozí stav */}
                      {predefinedActivityNames.map((activityName) => (
                        <option key={activityName} value={activityName}>
                          {activityName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Annual Turnover (CZK in Thousands) *</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.turnoverInThousands === 0 ? '' : formData.turnoverInThousands}
                      onChange={(e) => setFormData(prev => ({ ...prev, turnoverInThousands: parseFloat(e.target.value) || 0 }))}
                      required
                      min="0"
                      max="1000000"
                      step="1000"
                    />
                    <small className="form-text text-muted">Maximum: 1,000,000,000 CZK (input in thousands)</small>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Limit Amount (CZK in Millions) *</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.limitInMillions === 0 ? '' : formData.limitInMillions}
                      onChange={(e) => setFormData(prev => ({ ...prev, limitInMillions: parseFloat(e.target.value) || 0 }))}
                      required
                      min="0"
                      max="50"
                      step="0.1"
                    />
                    <small className="form-text text-muted">Maximum: 50,000,000 CZK (input in millions)</small>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Financial Performance *</label>
                    <select
                      className="form-select"
                      value={formData.financialPerformance}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        financialPerformance: e.target.value as 'BELOW_AVERAGE' | 'AVERAGE' | 'ABOVE_AVERAGE'
                      }))}
                      required
                    >
                      <option value="ABOVE_AVERAGE">Above Average</option>
                      <option value="AVERAGE">Average</option>
                      <option value="BELOW_AVERAGE">Below Average</option>
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Broker Commission (%)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.brokerCommissionPercentage === 0 ? '' : formData.brokerCommissionPercentage}
                      onChange={(e) => setFormData(prev => ({ ...prev, brokerCommissionPercentage: parseFloat(e.target.value) || 0 }))}
                      min="0"
                      max="50"
                      step="0.1"
                    />
                     <small className="form-text text-muted">Value will be divided by 100 before sending (e.g. 15 becomes 0.15)</small>
                  </div>
                </div>
              </div>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Calculating...
                  </>
                ) : (
                  'Calculate Premium'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="col-lg-4">
        {result && (
          <div className="card">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0">Calculation Result</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <h3 className="text-success">{formatCurrency(result.nettoPremium)}</h3>
                <small className="text-muted">Net Premium</small>
              </div>

              <hr />

              <div className="row text-sm">
                <div className="col-6">
                  <strong>Turnover:</strong>
                </div>
                <div className="col-6 text-end">
                  {formatNumberEnglish(result.turnoverInThousands)} K CZK
                </div>
                <div className="col-6">
                  <strong>Limit:</strong>
                </div>
                <div className="col-6 text-end">
                  {formatNumberEnglish(result.limitInMillions)} M CZK
                </div>
                <div className="col-6">
                  <strong>Performance:</strong>
                </div>
                <div className="col-6 text-end">
                  {result.financialPerformance}
                </div>
                <div className="col-6">
                  <strong>Commission:</strong>
                </div>
                <div className="col-6 text-end">
                  {result.brokerCommissionPercentage}%
                </div>
                {/* Zobrazení AKTIVITY ve výsledku */}
                <div className="col-6">
                  <strong>Activity:</strong>
                </div>
                <div className="col-6 text-end">
                  {result.activity}
                </div>
              </div>

              <hr />

              <div className="mb-2">
                <strong>Client:</strong> {result.clientName}
              </div>
              <div className="text-muted small">
                Client ID: {result.clientId}
              </div>
            </div>
          </div>
        )}

        {/* Rate Information Card */}
        <div className="card mt-3">
          <div className="card-header">
            <h6 className="mb-0">Rate Information</h6>
          </div>
          <div className="card-body small">
            <div className="mb-2">
              <strong>Turnover Brackets:</strong>
            </div>
            <ul className="list-unstyled mb-2">
              <li>≤ 100M CZK: 0.01%</li>
              <li>100M - 500M CZK: 0.005%</li>
              <li>500M - 750M CZK: 0.002%</li>
              <li>&gt; 750M CZK: 0.001%</li>
            </ul>
            <div className="mb-2">
              <strong>Limits:</strong>
            </div>
            <ul className="list-unstyled">
              <li>Max limit: 50M CZK</li>
              <li>Max turnover: 1B CZK</li>
              <li>Limit ≤ Turnover</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskCalculatorForm;