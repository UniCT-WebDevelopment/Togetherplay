
# TogetherPLAY

TogetherPLAY è una soluzione completa per la riproduzione, la condivisione e l'interazione con i tuoi amici riguardo i video di YouTube. Con questo applicativo potrai creare il tuo profilo personale, guardare i tuoi video preferiti su YouTube, condividere i contenuti con i tuoi amici e creare delle liste amici per tenerli sempre a portata di mano.

La sua interfaccia intuitiva ti permette di creare un account in pochi semplici passi e iniziare subito a godere dei tuoi video preferiti. Grazie alla funzione di riproduzione video, potrai guardare i tuoi video preferiti in qualsiasi momento e luogo.

La funzione di condivisione ti permette di invitare i tuoi amici a guardare i tuoi video preferiti insieme a te e di creare delle playlist personalizzate da condividere con loro. Inoltre, grazie alla chat integrata, potrai interagire con i tuoi amici in tempo reale e discutere dei tuoi video preferiti.

Ma non finisce qui: grazie alla funzione di sincronizzazione video, potrai guardare i tuoi video preferiti insieme ai tuoi amici in tempo reale, rendendo la tua esperienza di visione ancora più coinvolgente e divertente.

In sintesi, questo applicativo web è la soluzione ideale per tutti coloro che amano guardare i video di YouTube e condividere questa passione con i propri amici. Crea subito il tuo account e inizia a godere di questa fantastica esperienza di visione e interazione.
## Frontend
Il lato frontend del sito è stato realizzato tramite i seguenti componenti:
- **HTML** per lo scheletro della pagina statica e importazioni varie
- **CSS** per la gestione degli stili, delle animazioni e delle media query
- **Bootstrap** per la gestione di alcuni elementi stilistici
- **JavaScript** per la gestione di funzioni ed algoritmi, per la manipolazione del DOM e per alcune responsabilità relative allo scrolling
- **JQuery** per una facilitata gestione delle chiamate asincrone AJAX al server (GET e POST) 



## Backend
- **NodeJS** per supportare express e per usufruire di componenti aggiuntive (elencate sotto)
- **ExpressJS** per la gestione dell'applicazione, delle chiamate AJAX (GET e POST) e del routing
- **MySQL** per conservare i dati relativi ai giochi, agli utenti e agli annunci
- **Socket** per inviare e ricevere dati tra client e server
- **Youtube API** per ricevere informazioni riguardo i video di youtube
## Prequisiti:
- **XAMPP** 
- **NodeJS**  per avviare il programma.
- **package manager** (**npm**)

Avviare  `XAMPP` client e i moduli `Apache` e `MySQL`.

## Installation

**Inizializzare il server tramite nmp**


Copiare questa repo nel tuo computer. Aprire un terminale a dirigersi verso la root della repo. Dopodichè esegui il comando  `npm install`.

Quando tutti i moduli saranno istallati digitare `npm start`.  Esso eseguira un web-server all'indirizzo  `localhost:3001`.

Una volta eseguito il server esso sarà raggiungibile tramite l'indirizzo `localhost:3001` sul tuo browser WEB.
Il server creearà automaticamente la struttura del database sul server MySQL.





## References
- YoutubeAPI https://developers.google.com/youtube/v3