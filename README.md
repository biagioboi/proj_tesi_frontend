# Progetto di Tesi di Laurea Triennale in Informatica (L-31)
__Biagio Boi<br>
mat. 0512105125<br>
Prof C.Gravino - Prof.ssa G.Vitiello__

## ICT e Industria 4.0
_Progettazione e sviluppo di un sistema software per il monitoraggio in tempo reale di macchine industriali_

In questo Progetto sarà gestita l'interfaccia grafica per la visualizzazione dei dati presenti nel database e opportunamente rielaborati per il calcolo degli indicatori OEE.<br>
Tale progetto è il completamento del <a href="https://github.com/b14s199/proj_tesi_backend">Progetto di Backend</a>.

### SiteMap
* index.html (Sloy by slot OEE)
    * machine_oee_details.html
        * chart_time_production.html
* daily_oee.html (Daily OEE)
    * machine_daily_oee_details.html
        * daily_chart_time_production.html
* search_period_oee.html (Search by period OEE)
    * machine_by_period_oee_details.html
* index_planning.html (Planning / Simultaion)

Per ogni file HTML vi è il relativo controller JavaScript.


__TODO__:
- [x] Rimodulazione delle pagine e dell'interfaccia (04/04/2020)
- [x] Creazione di una soluzione Object-Oriented per un corretto passaggio di parametri tra pagine
- [x] Gestione delle sessioni per il passaggio dei parametri
- [x] Integrazione con il backend attraverso <a href='https://firebase.google.com'>Firebase</a>
- [ ] Integrazione con <a href="https://pusher.com/">Pusher</a> per l'aggiornamento in real-time dei dati
- [ ] Revisione finale ed evenutali modifiche grafiche
