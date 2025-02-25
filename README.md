# MusicApp

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://img.shields.io/badge/build-passing-brightgreen.svg)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/SirFuryy/MusicApp/pulls)

MusicApp è una webapp open-source per la simulazione di un SMM, ovvero un social media for music, in cui gli utenti possono creare le proprie playlist e condividerle con gli altri.  
Questo progetto è stato sviluppata per l'esame del corso di Tecnologie Web e Mobile del corso di laurea Triennale in Informatica dell'Università di Milano - Statale

## Caratteristiche Principali del progetto

* **Gestione Playlist:** Creazione, modifica e gestione di playlist personalizzate.
* **Ricerca Avanzata:** Ricerca rapida di brani, album e artisti utilizzando il dataset della [Web API di Spotify for developer](https://developer.spotify.com/documentation/web-api).
* **Social Media:** Possibilità di conoscere altri utenti, aggiungere amici e condividere le playlist con loro.
* **API Rest di supporto:** L'applicazione web fa capo ad un server con molteplici chiamate API accessibili a tutti.
* **Sviluppo a 360 gradi:** Il progetto si compone dello sviluppo dell'intrfaccia, del FrontEnd, del BackEnd e del database non relazionale di base.

## Architettura

MusicApp è sviluppata seguendo un'architettura pulita e modulare, basata sui principi REST.

## Tecnologie Utilizzate

* **Javasript:** Linguaggio di programmazione principale per il FrontEnd.
* **Node js:** Libreria di javasript usata per il BackEnd.
* **HTML + Bootstrap:** Framework per il desing della webapp.
* **MongoDB:** Database non relazionale per la gestione degli utenti e delle playlist.

## Installazione

1.  Clona il repository: `git clone https://github.com/SirFuryy/MusicApp.git`
2.  Scegli un punto da cui far partire il server e da cui accedere alle web api.
3.  Modifica il file index di node inserendo la porta da utilizzare e lancia il comando per avviare il server node
4.  Apri la webapp alla pagina principale ed accedi a tutti i servizi

## Licenza

MusicApp è rilasciato sotto la licenza GPL v3.0. Vedi il file [GNU GPL v3.0.](LICENSE) per maggiori dettagli.
