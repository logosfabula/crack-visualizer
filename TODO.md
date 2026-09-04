##### v0.16.0 
- [x] Calcolo ETA: sostituita la vecchia secante a due punti (solo prima e ultima lettura) con una regressione robusta e pesata nel tempo:
  - `TheilSen.js`, `ETASolver.js`, `BootstrapEstimator.js`, `RegressionAnalyzer.js` (`src/services/calculations/`) + `useETAPredictions.js` (`src/hooks/`) + `regressionConfig.js` (`src/constants/`)
  - Regressione separata per x(t) e y(t) per piano, t = giorni reali dalla prima lettura; stimatore Theil-Sen pesato (nessuna lettura scartata), peso decrescente in base alla deviazione di ortogonalità di `AngleAnalyzer`
  - ETA per soglia via intersezione quadratica retta/circonferenza; stato "già raggiunto" sempre dall'ultima lettura osservata, mai dalla retta stimata; intervallo di confidenza via bootstrap (500 repliche, percentili 5°-95°, + quota di repliche che raggiungono la soglia)
  - **Aggiunta emersa in fase di test** (non nel design originale): un tetto all'orizzonte di estrapolazione (`MAX_EXTRAPOLATION_MULTIPLE`, 10× lo span osservato) — senza tetto, uno slope quasi-zero ma non nullo produceva ETA proiettate a secoli/millenni (visto live su Piano 2). Oltre il tetto → "non raggiunto sul trend attuale" invece di una data assurda
  - **Secondo bug emerso in fase di test**: Pianterreno mostrava anch'esso 0.0000 mm/week nonostante uno spostamento netto reale di 0.407mm. Causa: letture identiche ripetute su molte date consecutive (13 letture ma solo 3 valori distinti — plausibile con precisione di lettura di 0.25mm e movimento lento) generavano decine di coppie "slope zero" ridondanti (stesso valore statico contato C(k,2) volte) che affogavano il segnale reale nella mediana pesata di Theil-Sen. Fix: `dedupeConsecutiveReadings.js` (`src/utils/`) collassa le run di letture consecutive identiche (stesso x e y) prima del fit, tenendo la più recente della run. Applicato in `useETAPredictions`. **Piano 1 e Piano 2 restano correttamente a 0.0000 mm/week dopo il fix** — non è lo stesso bug: Piano 1 è genuinamente piatto (prima lettura = ultima lettura), Piano 2 oscilla molto (2.7mm di percorso totale contro 0.28mm di spostamento netto) senza una direzione consistente, quindi un trend robusto vicino a zero è l'esito onesto, non un difetto
    - **Verificato numericamente** (non solo per arrotondamento di stampa): per Piano 2, `bx == 0.0` è un valore Python letterale, non un numero minuscolo troncato in visualizzazione. Causa: 8 delle 45 coppie pesate hanno slope esattamente zero perché la lettura a 0.25mm di precisione produce lo stesso valore x su date diverse (es. t=269 e t=610 leggono entrambi esattamente 0.25); quelle coppie pesano solo il 17.8% del peso totale, ma l'oscillazione di Piano 2 è abbastanza simmetrica sopra/sotto quei valori ripetuti che il punto di mediana pesata (50% del peso cumulato) cade comunque esattamente su una di esse. Con `A = bx²+by² = 0` esatto, `ETASolver` restituisce "non raggiunto" dal primo ramo (nessun drift), prima ancora di valutare il discriminante
  - Limite noto, non risolto da questo design: un errore nella primissima lettura di un piano diventa un offset costante indistinguibile in tutte le letture normalizzate successive (l'origine della normalizzazione non è un dato privo di errore)
- [x] Attività vs. tendenza direzionale: un piano molto "attivo" (es. Piano 2, oscillante, 2.7mm di percorso totale contro 0.28mm di spostamento netto) mostrava "not reached" ovunque nel pannello ETA pur essendo segnalato come "Most Active" — non un bug, ma le due metriche rispondono a domande diverse (attività cumulativa vs. progresso netto direzionale) e la vecchia UI non lo chiariva. Soluzione adottata: **non** una seconda ETA sull'attività, ma un indicatore visivo relativo:
  - `ActivityHeatMeter.js` (`src/components/common/`) — barra di attività relativa (Weekly Rate Total Path, scalata sul massimo tra i piani correnti), **non** una proiezione; niente soglie assolute non giustificate da letteratura
  - Selettore di metodo ETA: registry pluggable `src/services/calculations/estimators/` (`TheilSenEstimator.js`, `SecantEstimator.js`, `index.js`) — stessa interfaccia (`compute`, `describe`, `methodology`, `label`), aggiungibile con altri metodi in futuro. `SecantEstimator` reimplementa fedelmente il vecchio metodo a due punti (verificato: riproduce esattamente i numeri pre-v0.16.0) come baseline di confronto, non come raccomandazione
  - Selettore "ETA Method" nella sezione Movement Summary; governa Trend Rate, pannello ETA per piano e Top 5 Soonest ETAs; l'Activity Heat Meter resta indipendente dal metodo selezionato
  - ETA per soglia mostra di nuovo "(X from first reading)" oltre al tempo rimanente da oggi (richiesto esplicitamente — coerenza con la UI precedente)
  - Test unitari: `TheilSen.test.js`, `ETASolver.test.js`, `dedupeConsecutiveReadings.test.js`, `SecantEstimator.test.js` (25 test totali)
- [x] Timeline view: aggiunto uno switch ("Space readings proportionally to time") per passare dalla spaziatura equidistante (asse categoriale, comportamento originale, resta il default) a una spaziatura proporzionale ai giorni reali (asse numerico su timestamp, con `domain={['dataMin','dataMax']}` e tick formattati come date) — `TimelineView.js`. **Bug trovato in fase di test**: con spaziatura proporzionale il tooltip mostrava il timestamp grezzo invece della data, perché `Tooltip`'s `labelFormatter` non viene applicato automaticamente quando si usa un `content` personalizzato — Recharts lo passa come prop e tocca al componente custom invocarlo. Fix in `CustomTooltip.js` (accetta e applica `labelFormatter` se presente)
- [x] "Overall Movement Direction" nella Movement Summary usava ancora la logica pre-v0.16.0 (solo ultima lettura vs. prima, letture intermedie ignorate) invece del metodo ETA selezionato — su Piano 2 mostrava "→ Expanding & ↓ Sinking" anche quando il pannello ETA sopra diceva "not reached" per ogni soglia (Theil-Sen), apparendo contraddittorio: erano due calcoli scollegati, non un'inconsistenza nei dati. Fix: `direction: {x, y}` aggiunto al ritorno di entrambi gli estimator (`TheilSenEstimator`: slope della retta stimata; `SecantEstimator`: vettore prima→ultima lettura, invariato) e propagato da `useETAPredictions`; l'etichetta e la frase ("Based on the fitted trend" / "Based on the net change from first to last reading") ora riflettono il metodo selezionato e cambiano dinamicamente con lo switch
  - **Bug trovato in fase di test**: la soglia `Math.abs(dir) > 0.01` ereditata dalla vecchia logica tagliava fuori la frase descrittiva per Theil-Sen, perché `direction` lì è un rate (mm/giorno, es. 0.0006) non uno spostamento assoluto in mm — soglia tarata sulla scala sbagliata, la frase risultava troncata ("...normalized data shows." senza seguito) anche quando l'intestazione sopra mostrava correttamente una direzione. Fix: check a zero esatto (`dirX !== 0`) invece di soglia in mm, coerente con la logica già usata per l'intestazione
  - Test: `TheilSenEstimator.test.js` (nuovo), `SecantEstimator.test.js` (aggiornato) — 28 test totali
- [x] Analisi separata delle componenti orizzontale/verticale per l'ETA (richiesta esplicita: capire se la causa di sprofondamento (verticale) sia più forte della spinta verso l'esterno del muro (orizzontale)):
  - Selettore "Displacement Component" (Combined 2D / Horizontal only / Vertical only) accanto a "ETA Method" nella Movement Summary; governa Trend Rate, pannello ETA per piano e Top 5 Soonest ETAs — entrambi gli assi erano già fittati indipendentemente da `RegressionAnalyzer`, quindi bastava un solver 1D dedicato invece di duplicare la macchina quadratica 2D: `LinearThresholdSolver.js` (`src/services/calculations/`), usato da entrambi gli estimator quando `component !== 'combined'` e da `BootstrapEstimator` (nuovo parametro opzionale `axis`)
  - Riga "Horizontal vs. Vertical Rate" **sempre visibile** (indipendente dal selettore di componente) con i due rate firmati mm/settimana e un'indicazione testuale di quale componente sia attualmente il driver più forte — per rispondere direttamente alla domanda originale senza dover cambiare selettore
  - Rappresentazione grafica aggiunta su richiesta esplicita, in due punti: `RateComparisonBar.js` (`src/components/common/`) — barra divergente per piano, orizzontale/verticale a confronto rispetto allo zero, sostituisce il testo nella card del singolo piano; `ComponentRateChart.js` (idem, grafico a barre raggruppate Recharts) — confronto fra tutti i piani in un unico grafico nella Structural Analysis Summary, per il confronto cross-piano che la vista per-piano non dà
  - `ETA_COMPONENTS` / `DEFAULT_ETA_COMPONENT` (`regressionConfig.js`); `TheilSenEstimator`/`SecantEstimator.compute()` accettano ora `component` e ritornano anche `componentRates` (rate firmati per asse, indipendenti dal componente richiesto); `useETAPredictions` ricalcola tutti e tre i componenti per ogni piano/metodo (`estimates[metodo].components[componente]`), con "già raggiunto" specifico per componente (`|x|`, `|y|`, o `hypot(x,y)` a seconda del caso)
  - Verificato in browser: con letture puramente orizzontali (y costante), il crossing 2D combinato e quello orizzontale coincidono esattamente, come atteso matematicamente
  - Test: `LinearThresholdSolver.test.js` (nuovo, 5 test), `TheilSenEstimator.test.js` + `SecantEstimator.test.js` (aggiornati con test sul parametro `component` e su `componentRates`) — 37 test totali
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
- [ ] Valutare l'aggiunta di un datapoint sintetico al 2017-01-01 per Pianterreno (P0), con lo stesso valore della sua prima lettura reale, per rappresentare nel fit il ricordo di famiglia che la crepa esisteva già allora (memoria: `p0-crack-predates-2017`). Semanticamente è comunque una lettura, per quanto approssimata. **Punto aperto, non risolto**: verificato numericamente che un simile punto, dato pieno peso in Theil-Sen, riduce lo slope stimato a ~18% del valore attuale (ETA proiettate ~5.5× più lontane) — le coppie che lo coinvolgono hanno Δt enorme (~7 anni) e trascinano la mediana pesata verso il basso più di quanto l'informazione reale giustifichi. Da riconsiderare con un meccanismo che rifletta la bassa confidenza del punto (peso esplicito ridotto, o un framework bayesiano con incertezza) invece di un punto a peso pieno, prima di implementare

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
- [x] METODO.md: documentare il nuovo metodo di calcolo dell'ETA (regressione Theil-Sen pesata per ortogonalità + intervallo di confidenza bootstrap, v0.16.0)

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
