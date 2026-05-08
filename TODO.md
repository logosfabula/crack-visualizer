##### v0.16.0 
- [ ] **URGENTE**: Ponderazione temporale dei reading
  - Timeline view: visualizzare i punti con spaziatura proporzionale agli intervalli temporali reali (non equispaziati)
  - Calcolo ETA: pesare il rate medio in base agli intervalli temporali tra reading consecutivi (reading più ravvicinati nel tempo hanno peso minore di reading distanziati)
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
- [ ] Aggiungere test unitari completi
- [ ] Migliorare gestione errori e feedback utente
- [ ] Aggiungere stati di caricamento per operazioni asincrone

#### Documentazione

- [ ] Creare video tutorial per l'utilizzo
- [ ] Aggiungere documentazione API se viene aggiunto un backend
- [ ] Creare linee guida per contribuire (CONTRIBUTING.md)
- [ ] Aggiungere guida alla risoluzione dei problemi
- [ ] Documentare il processo di deployment

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
