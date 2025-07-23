import type { RiskRequestDto, RiskResponseDto, Client } from '../types/dtos';

const API_BASE_URL = 'http://localhost:8080/api';

export const fetchRiskHistory = async (): Promise<RiskResponseDto[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/risks`);
    if (!response.ok) {
      throw new Error(`Failed to fetch risk history: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching risk history:', error);
    throw error;
  }
};

export const fetchClients = async (): Promise<Client[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/risks/clients`);
    if (!response.ok) {
      throw new Error(`Failed to fetch clients: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching clients:', error);
    throw error;
  }
};

export const calculateRisk = async (riskRequest: RiskRequestDto): Promise<RiskResponseDto> => {
  try {
    const requestBody = {
        ...riskRequest,
        brokerCommissionPercentage: riskRequest.brokerCommissionPercentage / 100
    };

    const response = await fetch(`${API_BASE_URL}/risks/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        const errorText = await response.text();
        // Pokusíme se parsovat jako JSON, pokud ne, vrátíme čistý text
        try {
            const errorJson = JSON.parse(errorText);
            // Pokud backend vrací pole chyb, můžeme je zřetězit pro lepší zobrazení
            if (errorJson.errors && Array.isArray(errorJson.errors)) {
                const messages = errorJson.errors.map((err: any) => err.defaultMessage).join('; ');
                throw new Error(`Validation Error: ${messages}`);
            }
            throw new Error(errorJson.message || `API Error: ${response.status} ${response.statusText}`);
        } catch (e) {
            // Pokud to není JSON, vrátíme čistý text
            throw new Error(errorText || `API Error: ${response.status} ${response.statusText}`);
        }
    }

    return await response.json();
  } catch (error) {
    console.error('Error calculating risk:', error);
    throw error; // Přehodíme chybu dál pro zobrazení v komponentě
  }
};