package cz.michalmusil.dnoratingsystem.service;

import cz.michalmusil.dnoratingsystem.model.Risk;
import cz.michalmusil.dnoratingsystem.model.Client;
import cz.michalmusil.dnoratingsystem.repository.RiskRepository;
import cz.michalmusil.dnoratingsystem.repository.ClientRepository;
import cz.michalmusil.dnoratingsystem.model.FinancialPerformance;
import cz.michalmusil.dnoratingsystem.dto.RiskRequestDto;
import cz.michalmusil.dnoratingsystem.dto.RiskResponseDto;
import cz.michalmusil.dnoratingsystem.dto.ClientRequestDto;
import cz.michalmusil.dnoratingsystem.model.ActivityType;
import java.time.LocalDateTime;

import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Optional;

@Service
public class RatingService {

    private final RiskRepository riskRepository;
    private final ClientRepository clientRepository;

    public RatingService(RiskRepository riskRepository, ClientRepository clientRepository) {
        this.riskRepository = riskRepository;
        this.clientRepository = clientRepository;
    }

    // --- Konfigurační konstanty pro rater ---
    private static final BigDecimal MAX_LIMIT_AMOUNT = new BigDecimal("50000000"); // 50 milionů Kč
    private static final BigDecimal TURNOVER_CAP = new BigDecimal("1000000000"); // 1 miliarda Kč

    // Koeficienty pro obrat
    private static final BigDecimal TURNOVER_THRESHOLD_100M = new BigDecimal("100000000"); // 100 milionů
    private static final BigDecimal TURNOVER_THRESHOLD_500M = new BigDecimal("500000000"); // 500 milionů
    private static final BigDecimal TURNOVER_THRESHOLD_750M = new BigDecimal("750000000"); // 750 milionů

    // Koeficienty pro obrat - TYTO HODNOTY PŘEDSTAVUJÍ KČ NA MILION LIMITU pro dané pásmo obratu
    private static final BigDecimal COEFFICIENT_UP_TO_100M = new BigDecimal("1000");
    private static final BigDecimal COEFFICIENT_100M_TO_500M = new BigDecimal("1100");
    private static final BigDecimal COEFFICIENT_500M_TO_750M = new BigDecimal("1200");
    private static final BigDecimal COEFFICIENT_ABOVE_750M = new BigDecimal("1400");

    // Slevové koeficienty pro pásma limitů
    private static final BigDecimal DISCOUNT_10_20M = new BigDecimal("0.045");
    private static final BigDecimal DISCOUNT_20_30M = new BigDecimal("0.04");
    private static final BigDecimal DISCOUNT_30_40M = new BigDecimal("0.03");
    private static final BigDecimal DISCOUNT_40_50M = new BigDecimal("0.025");

    @Transactional
    public RiskResponseDto calculateNettoPremium(RiskRequestDto requestDto) {

        // Konverze vstupních dat na BigDecimal a plné hodnoty
        BigDecimal limitAmount = requestDto.getLimitInMillions().multiply(new BigDecimal("1000000"));
        BigDecimal turnover = requestDto.getTurnoverInThousands().multiply(new BigDecimal("1000"));
        BigDecimal brokerCommissionPercentage = new BigDecimal(String.valueOf(requestDto.getBrokerCommissionPercentage()));

        // Logika pro práci s klientem
        ClientRequestDto clientDto = requestDto.getClient();
        Client clientEntity;
        Optional<Client> existingClient = clientRepository.findByIco(clientDto.getIco());

        if (existingClient.isPresent()) {
            clientEntity = existingClient.get();
            clientEntity.setName(clientDto.getName());
            clientEntity.setStreet(clientDto.getStreet());
            clientEntity.setHouseNumber(clientDto.getHouseNumber());
            clientEntity.setOrientationNumber(clientDto.getOrientationNumber());
            clientEntity.setCity(clientDto.getCity());
            clientEntity.setPostcode(clientDto.getPostcode());
            clientEntity.setState(clientDto.getState());
            clientRepository.save(clientEntity);
        } else {
            clientEntity = new Client();
            clientEntity.setName(clientDto.getName());
            clientEntity.setStreet(clientDto.getStreet());
            clientEntity.setHouseNumber(clientDto.getHouseNumber());
            clientEntity.setOrientationNumber(clientDto.getOrientationNumber());
            clientEntity.setCity(clientDto.getCity());
            clientEntity.setPostcode(clientDto.getPostcode());
            clientEntity.setState(clientDto.getState());
            clientEntity.setIco(clientDto.getIco());
            clientEntity = clientRepository.save(clientEntity);
        }

        // 1. Validace maximálního limitu
        if (limitAmount.compareTo(MAX_LIMIT_AMOUNT) > 0) {
            throw new IllegalArgumentException("Limit amount (" + limitAmount + " CZK) cannot exceed " + MAX_LIMIT_AMOUNT + " CZK.");
        }

        // 2. Aplikace obratového capu
        BigDecimal effectiveTurnover = turnover.min(TURNOVER_CAP);

        // 3. Validace: LIMIT NESMÍ BÝT VĚTŠÍ NEŽ OBRAT
        if (limitAmount.compareTo(effectiveTurnover) > 0) {
            throw new IllegalArgumentException("Limit amount (" + limitAmount + " CZK) cannot be greater than effective turnover (" + effectiveTurnover + " CZK).");
        }

        // 4. Určení základní sazby za milion pro první pásmo (0-10M) na základě obratového koeficientu
        BigDecimal turnoverCoefficient;
        if (effectiveTurnover.compareTo(TURNOVER_THRESHOLD_100M) <= 0) {
            turnoverCoefficient = COEFFICIENT_UP_TO_100M;
        } else if (effectiveTurnover.compareTo(TURNOVER_THRESHOLD_500M) <= 0) {
            turnoverCoefficient = COEFFICIENT_100M_TO_500M;
        } else if (effectiveTurnover.compareTo(TURNOVER_THRESHOLD_750M) <= 0) {
            turnoverCoefficient = COEFFICIENT_500M_TO_750M;
        } else {
            turnoverCoefficient = COEFFICIENT_ABOVE_750M;
        }

        // DŮLEŽITÁ ZMĚNA: baseRatePerMillion je nyní přímo hodnota koeficientu,
        // protože koeficienty už představují Kč na milion limitu.
        BigDecimal baseRatePerMillion = turnoverCoefficient;

        // 5. Výpočet celkové prémie na základě limitu a pásmových slev (ILF model)
        BigDecimal totalLimitPremium = BigDecimal.ZERO;
        BigDecimal currentRatePerMillion = baseRatePerMillion;

        // Iterujeme po milionech limitu a aplikujeme slevy
        // limitAmount.divide(new BigDecimal("1000000"), RoundingMode.HALF_UP).intValue() získá počet celých milionů
        for (int i = 1; i <= limitAmount.divide(new BigDecimal("1000000"), RoundingMode.HALF_UP).intValue(); i++) {
            if (i == 11) { // Od 11. milionu (tj. pro limit nad 10M do 20M)
                currentRatePerMillion = baseRatePerMillion.multiply(BigDecimal.ONE.subtract(DISCOUNT_10_20M));
            } else if (i == 21) { // Od 21. milionu (tj. pro limit nad 20M do 30M)
                currentRatePerMillion = baseRatePerMillion
                        .multiply(BigDecimal.ONE.subtract(DISCOUNT_10_20M))
                        .multiply(BigDecimal.ONE.subtract(DISCOUNT_20_30M));
            } else if (i == 31) { // Od 31. milionu (tj. pro limit nad 30M do 40M)
                currentRatePerMillion = baseRatePerMillion
                        .multiply(BigDecimal.ONE.subtract(DISCOUNT_10_20M))
                        .multiply(BigDecimal.ONE.subtract(DISCOUNT_20_30M))
                        .multiply(BigDecimal.ONE.subtract(DISCOUNT_30_40M));
            } else if (i == 41) { // Od 41. milionu (tj. pro limit nad 40M do 50M)
                currentRatePerMillion = baseRatePerMillion
                        .multiply(BigDecimal.ONE.subtract(DISCOUNT_10_20M))
                        .multiply(BigDecimal.ONE.subtract(DISCOUNT_20_30M))
                        .multiply(BigDecimal.ONE.subtract(DISCOUNT_30_40M))
                        .multiply(BigDecimal.ONE.subtract(DISCOUNT_40_50M));
            }
            totalLimitPremium = totalLimitPremium.add(currentRatePerMillion);
        }

        // 6. Aplikace faktoru finanční výkonnosti
        BigDecimal financialPerformanceFactor;
        switch (requestDto.getFinancialPerformance()) {
            case BELOW_AVERAGE: financialPerformanceFactor = new BigDecimal("1.2"); break;
            case ABOVE_AVERAGE: financialPerformanceFactor = new BigDecimal("0.8"); break;
            case AVERAGE: default: financialPerformanceFactor = BigDecimal.ONE; break;
        }
        totalLimitPremium = totalLimitPremium.multiply(financialPerformanceFactor);

        // *** ZDE SE POUŽIJE ACTIVITY INDEX Z ENUMU ***
        // 7. Aplikace indexu aktivity
        ActivityType activityType = ActivityType.fromDescription(requestDto.getActivity()); // Získání ActivityType
        BigDecimal activityIndex = BigDecimal.valueOf(activityType.getIndex()); // Získání indexu jako BigDecimal
        totalLimitPremium = totalLimitPremium.multiply(activityIndex);

        // 8. Netto Premium (Technical Price)
        // Je to totalLimitPremium po všech faktorech (limit, obrat, finanční výkonnost, aktivita),
        // ale BEZ jakékoliho zohlednění provize brokera.
        BigDecimal nettoPremium = totalLimitPremium.setScale(2, RoundingMode.HALF_UP);

        // 9. Výpočet provize brokera (jen pro informaci, není součástí nettoPremium)
        // brokerCommissionPercentage je provize v procentech (např. 5.0 pro 5%)
        BigDecimal brokerCommissionAmount = nettoPremium.multiply(brokerCommissionPercentage.divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP));
        brokerCommissionAmount = brokerCommissionAmount.setScale(2, RoundingMode.HALF_UP);


        // 11. Vytvoření a uložení Risk entity
        Risk riskEntity = new Risk();
        riskEntity.setClient(clientEntity);
        riskEntity.setActivity(requestDto.getActivity()); // Uložíme string description
        riskEntity.setTurnover(turnover);
        riskEntity.setLimitAmount(limitAmount);
        riskEntity.setFinancialPerformance(requestDto.getFinancialPerformance());
        riskEntity.setBrokerCommissionPercentage(brokerCommissionPercentage); // Ukládáme procento provize do DB
        riskEntity.setNettoPremium(nettoPremium); // Ukládáme technical price / netto premium do DB
        riskEntity.setCalculationDate(LocalDateTime.now());

        riskRepository.save(riskEntity);

        // 12. Vrácení RiskResponseDto
        RiskResponseDto responseDto = new RiskResponseDto();
        responseDto.setId(riskEntity.getId());
        responseDto.setActivity(riskEntity.getActivity()); // Vracíme string description
        responseDto.setTurnoverInThousands(
                turnover.divide(new BigDecimal("1000"), 2, RoundingMode.HALF_UP)
        );
        responseDto.setLimitInMillions(
                limitAmount.divide(new BigDecimal("1000000"), 2, RoundingMode.HALF_UP)
        );
        responseDto.setFinancialPerformance(requestDto.getFinancialPerformance());
        responseDto.setBrokerCommissionPercentage(brokerCommissionPercentage); // Vracíme procento provize
        responseDto.setNettoPremium(nettoPremium); // Vracíme technical price / netto premium

        if (requestDto.getClient() != null) {
            responseDto.setClientId(clientEntity.getId());
            responseDto.setClientIco(clientEntity.getIco());
            responseDto.setClientName(clientEntity.getName());
        }
        responseDto.setCalculationDate(riskEntity.getCalculationDate());

        return responseDto;
    }
}