# IndexNow — Guida al processo

## Cos'è IndexNow

IndexNow è un protocollo che permette di notificare i motori di ricerca (Bing, Yandex, ecc.)
quando una URL viene aggiunta, aggiornata o rimossa, senza aspettare il crawl organico.

---

## File di autenticazione (key file)

Il sito usa la chiave: `497ea3cabc6140a29e1c0fee4652d901`

### Dove deve stare

**Il file chiave deve essere nella cartella `public/`**, non nella root del progetto.

```
public/
└── 497ea3cabc6140a29e1c0fee4652d901.txt   ← file corretto
```

Il contenuto del file è solo la chiave stessa:
```
497ea3cabc6140a29e1c0fee4652d901
```

Il file viene servito in produzione all'URL:
```
https://www.calcolare-codice-fiscale.it/497ea3cabc6140a29e1c0fee4652d901.txt
```

> **Attenzione:** se il file viene messo nella root del progetto anziché in `public/`,
> non sarà accessibile in produzione e IndexNow risponderà con 403 (key not valid).

---

## Script di invio

Lo script `submit-indexnow.sh` nella root del progetto è in `.gitignore` (non viene committato).

Per eseguirlo:
```bash
bash submit-indexnow.sh
```

Lo script fa una POST a `https://api.indexnow.org/IndexNow` con tutte le URL del sito
e stampa il codice di risposta HTTP con la relativa spiegazione.

### URL inviate

- `https://www.calcolare-codice-fiscale.it/`
- `https://www.calcolare-codice-fiscale.it/codice-fiscale-inverso/`
- `https://www.calcolare-codice-fiscale.it/codice-fiscale-stranieri/`
- `https://www.calcolare-codice-fiscale.it/come-si-calcola-codice-fiscale/`
- `https://www.calcolare-codice-fiscale.it/omocodia-codice-fiscale/`
- `https://www.calcolare-codice-fiscale.it/tabelle-codice-fiscale/`
- `https://www.calcolare-codice-fiscale.it/verifica-codice-fiscale/`

---

## Codici di risposta

| Codice | Significato |
|--------|-------------|
| 200    | URL submitted successfully |
| 202    | Accepted — accettate per l'elaborazione |
| 400    | Bad request — formato non valido |
| 403    | Key not valid — il file .txt non è raggiungibile in produzione |
| 422    | URL non appartengono all'host dichiarato |
| 429    | Too Many Requests |

---

## Quando fare la submit

- Dopo ogni deploy con nuove pagine o contenuti aggiornati significativi.
- Il protocollo non ha un limite rigido documentato, ma è buona norma non inviare
  più di una volta al giorno le stesse URL.

---

## Aggiungere nuove pagine allo script

Se vengono aggiunte nuove pagine in `src/pages/`, aggiungere la relativa URL
nell'array `urlList` dentro `submit-indexnow.sh`.
