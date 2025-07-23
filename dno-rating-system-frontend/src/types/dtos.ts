// src/types/dtos.ts

// Toto je DTO, které posíláme na backend pro klienta
export interface ClientRequestDto {
  name: string;
  street: string;
  houseNumber: string;
  orientationNumber?: string; // Volitelné pole
  city: string;
  postcode: string;
  state: string;
  ico: string;
}

// Toto je DTO, které posíláme na backend pro výpočet rizika
export interface RiskRequestDto {
  client: ClientRequestDto; // Zanořené DTO pro klienta
  activity: string;
  turnoverInThousands: number; // NOVÝ NÁZEV POLE (dle backendu)
  limitInMillions: number;     // NOVÝ NÁZEV POLE (dle backendu)
  financialPerformance: 'BELOW_AVERAGE' | 'AVERAGE' | 'ABOVE_AVERAGE'; // Upraveno dle vašich backend enumů
  brokerCommissionPercentage: number; // NOVÝ NÁZEV POLE (dle backendu)
}

// Toto je DTO, které přijímáme z backendu jako odpověď na výpočet rizika
// Mělo by odrážet váš Java RiskResponseDto
export interface RiskResponseDto {
  id: number;
  activity: string;
  // Změněno, aby odpovídalo backendu:
  turnoverInThousands: number; // Backend posílá toto!
  limitInMillions: number;     // Backend posílá toto!
  financialPerformance: string; // Backend posílá enum jako string
  brokerCommissionPercentage: number; // Dříve bylo brokerCommission
  nettoPremium: number;
  clientId: number;
  clientIco: string; // Přidáno, pokud ho používáš jinde nebo ho backend posílá
  clientName: string;
}

// Toto je interface pro zobrazení existujících klientů z GET /api/risks/clients
// Mělo by odpovídat vaší Java Client entitě
export interface Client {
  id: number;
  name: string;
  street: string;
  houseNumber: string;
  orientationNumber?: string;
  city: string;
  postcode: string;
  state: string;
  ico: string;
}