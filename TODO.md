##### v0.16.0 
- [x] Calcolo ETA: sostituita la vecchia secante a due punti (solo prima e ultima lettura) con una regressione robusta e pesata nel tempo:
  - `TheilSen.js`, `ETASolver.js`, `BootstrapEstimator.js`, `RegressionAnalyzer.js` (`src/services/calculations/`) + `useETAPredictions.js` (`src/hooks/`) + `regressionConfig.js` (`src/constants/`)
  - Regressione separata per x(t) e y(t) per piano, t = giorni reali dalla prima lettura; stimatore Theil-Sen pesato (nessuna lettura scartata), peso decrescente in base alla deviazione di ortogonalità di `AngleAnalyzer`
  - ETA per soglia via intersezione quadratica retta/circonferenza; stato "già raggiunto" sempre dall'ultima lettura osservata, mai dalla retta stimata; intervallo di confidenza via bootstrap (500 repliche, percentili 5°-95°, + quota di repliche che raggiungono la soglia)
  - **Aggiunta emersa in fase di test** (non nel design originale): un tetto all'orizzonte di estrapolazione (`MAX_EXTRAPOLATION_MULTIPLE`, 10× lo span osservato) — senza tetto, uno slope quasi-zero ma non nullo produceva ETA proiettate a secoli/millenni (visto live su Piano 2). Oltre il tetto → "non raggiunto sul trend attuale" invece di una data assurda
  - **Secondo bug emerso in fase di test**: Pianterreno mostrava anch'esso 0.0000 mm/week nonostante uno spostamento netto reale di 0.407mm. Causa: letture identiche ripetute su molte date consecutive (13 letture ma solo 3 valori distinti — plausibile con precisione di lettura di 0.25mm e movimento lento) generavano decine di coppie "slope zero" ridondanti (stesso valore statico contato C(k,2) volte) che affogavano il segnale reale nella mediana pesata di Theil-Sen. Fix: `dedupeConsecutiveReadings.js` (`src/utils/`) collassa le run di letture consecutive identiche (stesso x e y) prima del fit, tenendo la più recente della run. Applicato in `useETAPredictions`. **Piano 1 e Piano 2 restano correttamente a 0.0000 mm/week dopo il fix** — non è lo stesso bug: Piano 1 è genuinamente piatto (prima lettura = ultima lettura), Piano 2 oscilla molto (2.7mm di percorso totale contro 0.28mm di spostamento netto) senza una direzione consistente, quindi un trend robusto vicino a zero è l'esito onesto, non un difetto
  - Limite noto, non risolto da questo design: un errore nella primissima lettura di un piano diventa un offset costante indistinguibile in tutte le letture normalizzate successive (l'origine della normalizzazione non è un dato privo di errore)
- [x] Attività vs. tendenza direzionale: un piano molto "attivo" (es. Piano 2, oscillante, 2.7mm di percorso totale contro 0.28mm di spostamento netto) mostrava "not reached" ovunque nel pannello ETA pur essendo segnalato come "Most Active" — non un bug, ma le due metriche rispondono a domande diverse (attività cumulativa vs. progresso netto direzionale) e la vecchia UI non lo chiariva. Soluzione adottata: **non** una seconda ETA sull'attività, ma un indicatore visivo relativo:
  - `ActivityHeatMeter.js` (`src/components/common/`) — barra di attività relativa (Weekly Rate Total Path, scalata sul massimo tra i piani correnti), **non** una proiezione; niente soglie assolute non giustificate da letteratura
  - Selettore di metodo ETA: registry pluggable `src/services/calculations/estimators/` (`TheilSenEstimator.js`, `SecantEstimator.js`, `index.js`) — stessa interfaccia (`compute`, `describe`, `methodology`, `label`), aggiungibile con altri metodi in futuro. `SecantEstimator` reimplementa fedelmente il vecchio metodo a due punti (verificato: riproduce esattamente i numeri pre-v0.16.0) come baseline di confronto, non come raccomandazione
  - Selettore "ETA Method" nella sezione Movement Summary; governa Trend Rate, pannello ETA per piano e Top 5 Soonest ETAs; l'Activity Heat Meter resta indipendente dal metodo selezionato
  - ETA per soglia mostra di nuovo "(X from first reading)" oltre al tempo rimanente da oggi (richiesto esplicitamente — coerenza con la UI precedente)
  - Test unitari: `TheilSen.test.js`, `ETASolver.test.js`, `dedupeConsecutiveReadings.test.js`, `SecantEstimator.test.js` (25 test totali)
- [ ] **URGENTE**: Timeline view — visualizzare i punti con spaziatura proporzionale agli intervalli temporali reali (non equispaziati) — causa: Recharts usa asse X categoriale su `date` (stringa), quindi i punti sono equispaziati per indice, non per tempo reale (`TimelineView.js`). Non ancora affrontato.
- [ ] Revisione del linguaggio: coerenza generale e glossario
- [ ] CI/CD automatically replace v.number in README and add entry in CHANGELOG and TODO

##### v0.15.0 
- [x] Estrarre sezioni Footer e Interpretation Notes dal main component in componenti dedicate
- [x] CI/CD script di aggiornamento automatico della versione ("npm version [patch|minor|major]")


##### v0.14.0 
- [x] Refactoring SOLID del codice

##### v0.13.2 
- [x] Logo (icona webapp e logo)

##### v0.13.1 
- [x] Uso più consistente delle etichette (absolute → raw; raw data → data o dataset)

##### v0.13.0 
- [x] Refactoring del codice (ridondanza funzioni, variabili di configurazione globali, ...)

##### v0.12.0 
- [x] Fattorizzare il calcolo delle coordinate dalle singole view
- [x] Aggiungere tooltip info on single reading view
- [x] Aggiungere tooltip info on raw ("movement patterns") and normalised ("normalized movements") datapoints

##### v0.11.1 
- [x] FINIRE PROOF-READING della seconda metà del file del METODO

##### v0.11.0 
- [x] Review documentation and footer (readme, method, license)

##### v0.9.0 
- [x] Sommario complessivo: 1) Crepa più attiva 2) Crepa più ampia 3) Ordine di arrivo delle prossime 5 soglie (secondo media aritmetica)
- [x] CI/CD: consistenza del set delle immagini dei rilievi
- [x] CI/CD: standard checks (lint, dependencies, ...)
- [x] CI/CD: auto-deploy on main branch pass

##### v0.8.0 
- [x] Aggiunte previsione di arrivo per soglie di distaccamento notevoli (1mm, 2mm, e 5mm) per piano
- [x] SINGLE READING VIEW: distinguere il calcolo geometrico tra coordinate centrali e rappresentazione della croce nel riquadro ridotto (20x10 → 3x3)
- [x] Aggiunta dei marker di proiezione dei punti up, right, down, left sui bordi del riquadro visibile (3x3)
- [x] Sezione dataset: aggiunta controllo per il download in vari formati
- [x] Sezione dataset: non solo raw reading ma anche normalized data e ortogonalità della croce

##### v0.7.0 
- [x] Single reading view: controllo per il download dell'immagine del rilievo
- [x] Sezione dataset: controllo per il download del set di immagini completo

##### v0.6.0 
- [x] Miglioramento lettura sinottica tra raw reading e normalized reading
- [x] Proofreading delle legende e uso consistente del color-coding project-wide


### Backlog

#### Alta Priorità

- [ ] Aggiungere autenticazione utente per progetti di monitoraggio privati
- [ ] Implementare persistenza dei dati (salvare i rilievi su database)
- [ ] Migliorare la responsività mobile per l'uso sul campo
- [ ] Creare funzionalità di generazione report PDF
- [ ] Aggiungere notifiche email per avvisi di soglia
- [ ] Unit testing infrastructure + core tests
- [ ] Integration tests + error handling
- [ ] Performance optimization + accessibility
- [ ] Validare gli input dei reading (evitare propagazione silenziosa di `NaN` da valori malformati in `IntersectionCalculator`/`AngleAnalyzer`, che può corrompere silenziosamente la normalizzazione di un intero piano se colpisce la prima lettura)

#### Media Priorità

- [ ] Supporto multilingua (toggle Italiano/Inglese)
- [ ] Tema dark mode
- [ ] Aggiungere toggle unità di misura (mm/pollici)
- [ ] Implementare importazione dati da CSV/Excel
- [ ] Aggiungere vista di confronto tra più periodi temporali

#### Bassa Priorità

- [ ] Aggiungere scorciatoie da tastiera per la navigazione
- [ ] Implementare undo/redo per l'inserimento dati
- [ ] Aggiungere vista ottimizzata per la stampa
- [ ] Creare tutorial/flusso di onboarding per nuovi utenti
- [ ] Miglioramenti per l'accessibilità (etichette ARIA, supporto screen reader)
- [ ] Perfezionare i bordi della griglia nelle varie view (poco visibili a destra e in basso)

#### Debito Tecnico

- [ ] Ottimizzare le performance di rendering SVG per dataset grandi
- [ ] Aggiungere test unitari completi (coperti finora solo `TheilSen`/`ETASolver`; `RegressionAnalyzer`, `BootstrapEstimator`, `useETAPredictions` e tutto il resto dell'app restano senza test)
- [x] Sostituire il placeholder di test in `App.test.js` (verificava testo "learn react" ereditato dal boilerplate CRA, mai esistito in questa app) con un'asserzione reale sull'heading del dashboard — richiedeva anche installare `@testing-library/jest-dom`/`@testing-library/react` (mancanti da `package.json` nonostante `setupTests.js` li richiedesse: `npm test` falliva ancora prima di eseguire un solo test) e un mock di `ResizeObserver` in `setupTests.js` (richiesto da Recharts, assente in jsdom)
- [ ] Migliorare gestione errori e feedback utente
- [ ] Aggiungere stati di caricamento per operazioni asincrone
- [ ] Calcolare le metriche di distanza/rate *descrittive* (Direct Displacement, Total Path Distance in `CrackMovementVisualizer.js`) sui dati normalizzati invece che raw — oggi coincidono numericamente perché shift e flip sono isometrie, ma restano un'equivalenza implicita e fragile. (Il nuovo Trend Rate/ETA regressivo usa già i dati normalizzati.)
- [x] Rimosso il codice morto dell'accumulatore `grandTotalDistance` commentato in `CrackMovementVisualizer.js`
- [ ] Fattorizzare il parsing dei reading (`[up,right,down,left]` + confini fisici) duplicato in `IntersectionCalculator`, `AngleAnalyzer` e `SingleReadingView`

#### Documentazione

- [ ] Creare video tutorial per l'utilizzo
- [ ] Aggiungere documentazione API se viene aggiunto un backend
- [ ] Creare linee guida per contribuire (CONTRIBUTING.md)
- [ ] Aggiungere guida alla risoluzione dei problemi
- [ ] Documentare il processo di deployment
- [ ] METODO.md: chiarire che `toSVGX`/`toSVGY` nell'esempio di conversione mm→pixel operano in realtà sul `DISPLAY_RANGE` zoomato (±1.5mm), non sui confini fisici del crack-meter (±20/±10mm) — la Single Reading View estrapola le linee della croce fino al bordo del riquadro ±1.5mm, cosa non descritta nel METODO
- [ ] METODO.md: documentare il nuovo metodo di calcolo dell'ETA (regressione Theil-Sen pesata per ortogonalità + intervallo di confidenza bootstrap, v0.16.0) — il METODO descrive ancora implicitamente il vecchio approccio a secante, mai stato esplicito nemmeno su quello

#### 1.0.0 milestone's should-haves:

- Comprehensive unit tests (>80% coverage)
- Integration tests for key workflows
- Error boundaries and graceful degradation
- Production-ready build optimization
- Documentation (API docs, architecture diagrams)
- Accessibility compliance
- Performance benchmarks met
- Security audit passed
- Browser compatibility tested
