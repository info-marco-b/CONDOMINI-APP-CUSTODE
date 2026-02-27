Crea lo scaffolding standar per React
scarica shadcn con style Mira, Thema Blue, Base color Gray


Facciamo una app responsive
sviluppiamo solo la parte frontend detached

Iniziamo a settare le configurazioni base
gli endpoint dei servizi saranno su altro server

Fai all'accesso una pagina di login che chiama endpoint

/api/login
method: 'POST',
headers: {'Content-Type': 'application/json',},
body: JSON.stringify(loginData),

passando
username:
password:


tutte le risposte dei servizi avranno questa struttura
{
    success:
    message:
    data:
}

salva in una sessione temporanea i dati in risposta se esito ok

se success è true
atterra su una pagina con 5 pulsanti
- Entra in servizio
- Registra un Pacco
- Consegna un pacco
- Servizio Chiavi
- Registro
- Segnalazioni

SVILUPPIAMO PAGINA REGISTRA UN PACCO
Crea una pagina che avvia la scansione
Inserisci due pulsanti per scegliere il tipo di scansione
- scansiona QR Code (funzione scanQRCode)
- scansiona Codice a barre (funzione scanStandardBarcode)

Inserisci un'area dove si vede il risultato della scansione


Ecco i passaggi logici dettagliati:

---

### 1. Inizializzazione della Fotocamera

Prima di chiamare le funzioni di scansione, devi ottenere lo streaming video. Senza un flusso attivo, l'API non ha "pixel" da analizzare.

* **Cosa fare:** Usa `navigator.mediaDevices.getUserMedia`.
* **Destinazione:** Collega lo stream all'attributo `srcObject` di un elemento `<video>` 

---

### 2. Verifica della Compatibilità

Prima di tentare qualsiasi scansione, assicurati che il browser dell'utente supporti l'API nativa per evitare crash.

* **Funzione da chiamare:** `isSupported()`
* **Logica:** Se restituisce `false`, apri una modale con alert

---

### 3. Avvio del Ciclo di Scansione (Loop)

* **Tecnica consigliata:** Usa `requestAnimationFrame` all'interno di un `useEffect`. È più efficiente di `setInterval` perché si sincronizza con il refresh del monitor.
* **Funzione da chiamare:** `scanQRCode(videoRef.current)` o `scanStandardBarcode(videoRef.current)`.

---

### 4. Gestione della Risposta (Lo Schema Richiesto)

Ogni volta che il ciclo di scansione riceve un risultato, devi processare l'oggetto `ScanResult`.

* **Logica di controllo:**
1. Verifica `result.success === true`.
2. Se vero, accedi a `result.data` (che sarà un array di codici).
3. Estrai `rawValue` dal primo elemento dell'array.
4. **Importante:** Interrompi il loop di scansione una volta trovato un risultato valido per evitare letture multiple dello stesso codice.





---

### Tabella Riassuntiva Funzioni

| Fase | Funzione da usare | Scopo |
| --- | --- | --- |
| **Controllo** | `isSupported()` | Verifica se il browser può usare l'API. |
| **Scansione QR** | `scanQRCode(source)` | Filtra solo per QR code (più veloce). |
| **Scansione Barcode** | `scanStandardBarcode(source)` | Filtra per formati EAN/UPC/Code128. |
| **Scansione Totale** | `scanAll(source)` | Cerca qualsiasi formato supportato simultaneamente. |


TEST CON NGROK
aggiungere "harmotomic-kimberlee-nondisrupting.ngrok-free.dev" a `server.allowedHosts` in vite.config.js.


MODIFICHE PAGINA REGISTRA UN PACCO

Revisione layout della pagina
Fai la dimensione dei tasti come quelli della homepage
devono essere 3
gli attuali 
- scansiona QR Code (funzione scanQRCode)
- scansiona Codice a barre (funzione scanStandardBarcode)

aggiungi il tasto Acquisisci nome

Sotto i tasti rimane la zona dei risultati deve avere uno spazio per ogni tipo di scansione
ogni spazio dei risultati deve avere un tasto icona "Cestino" per svuotare il campo
Per ultimo il tasto Salva.

Quando si accendono le scansioni l'immagine della telecamera prende tutto lo schermo a parte una zona bassa con informazione e tasti

Per QRcode e barcode l'istruzione è "Inquadra il codice" e sotto un tasto "Annulla" che chiude la schermata. Il funzionamento di questi due tasti rimane lo stesso

Per il tasto Acquisisci l'istruzione è "Scatta quando a fuoco" sotto un tasto "Scatta" e uno "Annulla". Il funzionamento per il tasto acquisisci deve scattare una foto ed utilizzare processOcrFromPhoto del file TesseractOCRService.ts


MODIFICA DELLA FUNZIONALITA del tasto il tasto Acquisisci nome
Non utilizzare processOcrFromPhoto
I dati della foto vanno mantenuti in memoria
Nella zona dei risultati di Acquisisci nome ma messa una preview dello scatto
Per la preview della foto imposta delle dimensioni perchè entri nello spazio dedicato senza ridurre la risoluzione


SALVATAGGIO RISULTATI
Il tasto Salva chiama l'endpoint /api/registra-pacco e riceve l'esito in questo formato
{
    "success": true,
    "message": "Registrazione pacco completata con successo.",
    "data": {
        "qrcode": null,
        "barcode": "800012345",
        "foto_riferimento": "2026-02-21-11-45-img.png",
        "timestamp": "2026-02-21-11-45"
    }
}
Fai una pagina che mostra i risultati ed un pulsante "Ok" che riporta alla home






CONFERMA DESTINATARIO E INVIO MAIL
nella pagina RegistraPaccoPage.tsx se arriva la foto
nel campo dedicato deve mettere l'immagine mantenendo la dimensione del campo attuale



aggiungi un campo nei risultati che è il nome del destinatario che nella response è "nome_destinatario"
aggiungi un altro campo "Conferma destinatario" che contenga una select autocomplete obbligatoria
i valori della autocomplete vengono caricati chiamando in get servizio /api/autoC/abitanti e passando nel parametro txt la porzione di testo che l'utente sta scrivendo
il servizio va chiamato dopo aver scritto i primi 3 caratteri e poi aggiornato ad ogni carattere successivo

Modifiche al compo conferma destinatario
le response arrivano con questa struttura

{
    "success": true,
    "data": [
        {
            "id_abitante": 1,
            "value": "Marco Bellandi"
        },
        {
            "id_abitante": 19,
            "value": "Marco Celesti"
        }
    ],
    "message": "ok"
}

il campo dove l'utente sta scrivendo deve mantenerer il focus altrimenti non si riesce più a scrivere

modifica al tasto finale OK, va rinominato "Invia avviso"
si può usare solo se il destinatario è stato scelto e non è vuoto e se almeno uno degli altri campi è compilato

L'invio dell'avviso chiama in post /api/avviso-pacco mandando tutti i dati

alla risposta si apre una modale base di alert
all'ok sulla modale di alert se success era true si torna in home
altrimenti si resta sulla schermata

Modifica tasto invio
i dati inviati devono essere almeno uno tra qrcode, barcode, foto_riferimento

obbligatori
  id_abitante
  conferma_destinatario
  timestamp

  questo un esempio compilato completamente
    {
  qrcode: 'aaa',
  barcode: '10030310260027227',
  foto_riferimento: '/api/REGISTRAZIONE-PACCHI/2026-02-21-12-20-44-img.png',
  id_abitante: 1,
  conferma_destinatario: 'Marco Bellandi',
  timestamp: '2026-02-21-20-23'
}



PAGINA CONSEGNA PACCO
collega il tasto consegna pacco ad una nuova pagina
Nella pagina inserisci partendo dall'alto
- campo autocomplete a scelta singola non obbligatorio
    Il campo si chiama "Destinatario" ed il suo valore inviato se compilato è conferma_destinatario
    i valori della autocomplete vengono caricati chiamando in get servizio /api/autoC/avvisi_posta
    il servizio va chiamato dopo aver scritto i primi 3 caratteri e poi aggiornato ad ogni carattere successivo
- un input in cui si può editare una data non obbligaroria in formato gg/mm/aaaa
    il placeholder dell'input "Data gg/mm/aaaa"
    il valore dell'input è mail_day
    cliccando la data si può inserire digitando oppure scegliendo dal calendario che si apre sotto
    se si sceglie la data sul calendario si compila l'input con la data va formattata come gg/mm/
    il calendario si apre sulla data odierna
- un buttonGroup con due bottoni non obbligatorio
    i testi dei bottoni sono "Da ritirare" e "Ritirato"
    Il valore che inviano è ritiro_conferma
    Se uno dei bottoni del buttonGroup è acceso, cliccandoci lo spengo
    Se accendo "Da Ritirare" spengo "Ritirato"
    Se accendo "Ritirato" spengo "Da Ritirare"
    Il valore di ritiro_conferma è "SI" se è acceso "Ritirato"
    Il valore di ritiro_conferma è "NO" se è acceso "Da Ritirare"
    Il valore di ritiro_conferma non viene inviato se sono spenti tutti e due
- un bottone Cerca che chiama in get servizio compilando la queryString con i parametri inseriti
    http://192.168.1.208:3000/api/ricerca/avvisi_posta?conferma_destinatario=Mar&ritiro_conferma=&mail_day=


Visualizzazione dei risultati
Per ogni risultato ricevuto genera una card contenente questi Dati

tag più importante della card il valore di conferma_destinatario
Consegna rivevuta: valore di timestamp
Codici pacco
    QR: valore di qrcode
    Bar Code: barcode

un paragrafo con
"Avviso inviato a  (valore di email) il giorno (mail_day) alle ore (mail_ora)"

Ritiro Confermato: valore di ritiro_conferma
Conferma Consegna: valore di consegnato_da



Un testo bold in rosso "Deve essere confermato il ritiro con la mail inviata a (email) prima di consegnare il pacco" se ritiro_conferma=NO

Un testo bold in verde "La consegna può essere effettuata" se ritiro_conferma=SI


Un bottone con scritto "Conferma Consegna"
attivo se consegnato_da = "", altrimenti disabilitato

cliccando"Conferma Consegna" si apre una modale per confermare l'operazione con testo

"Confermi di voler consegnare anche se <bold>non è stata validata<bold> la ricevuta" se ritiro_conferma=NO

"La ricevuta è stata validata. Confermi consegna?" se ritiro_conferma=NO

la modale se confermato e non annullato chiama '/api/ritito-pacco' inviando _id in post








