# 🎵 MusicApp  

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://img.shields.io/badge/build-passing-brightgreen.svg)  
[![License](https://img.shields.io/badge/license-GPL%20v3.0-blue.svg)](LICENSE)  

**MusicApp** è una web app open-source che simula un **Social Media per la Musica (SMM)**, permettendo agli utenti di creare e condividere playlist personalizzate.  

Questo progetto è stato sviluppato come parte dell’esame del corso di **Tecnologie Web e Mobile** presso il **Corso di Laurea Triennale in Informatica dell'Università degli Studi di Milano - Statale**.  

---

## ✨ Funzionalità  

- 🎼 **Gestione Playlist** – Creazione, modifica e gestione di playlist personalizzate.  
- 🔍 **Ricerca Avanzata** – Trova brani, album e artisti tramite le [Web API di Spotify for Developers](https://developer.spotify.com/documentation/web-api).  
- 🌍 **Social Media Musicale** – Connettiti con altri utenti, aggiungi amici e condividi le tue playlist.  
- 🔗 **API REST** – L'app è supportata da un backend con API REST accessibili pubblicamente.  
- 🏗️ **Architettura Completa** – Sviluppo full-stack con **Frontend, Backend e Database**.  

---

## 🏗️ Architettura  

MusicApp è progettata seguendo un'**architettura modulare** e basata sui principi REST.  
Si compone di tre principali livelli:  

1. **Frontend** – UI interattiva per la gestione delle playlist e l'interazione sociale.  
2. **Backend** – Server Node.js per la gestione delle richieste, autenticazione e API REST.  
3. **Database** – **MongoDB**, database NoSQL per la gestione di utenti e playlist.  

---

## 🔧 Tecnologie Utilizzate  

| Componente  | Tecnologia |
|-------------|-----------|
| 🌐 **Frontend** | JavaScript, HTML, Bootstrap |
| ⚙️ **Backend** | Node.js (Express.js) |
| 🗄️ **Database** | MongoDB (NoSQL) |
| 🔗 **API** | API sviluppate da me, Spotify Web API |

---

## 🚀 Installazione  

### 1️⃣ Clona il repository  
```sh
git clone https://github.com/SirFuryy/MusicApp.git
cd MusicApp
```
### 2️⃣ Configura il server
Scegli la porta su cui eseguire il server
Modifica il file index.js per impostare la porta
### 3️⃣ Avvia il server
```sh
node index.js
```
### 4️⃣ Accedi all'app
Apri il browser e visita la pagina principale della web app per iniziare a usare MusicApp.

---

📜 Licenza
MusicApp è distribuita sotto licenza GPL v3.0.
Consulta i dettagli qui: LICENSE.

