# Trade Republic Exporter API Data Extractor

> _Work in progress / Travail en cours_

**Inspiré par** : [Misterbural/TradeRepublic-History-Exporter-For-PortfolioPerformance](https://github.com/Misterbural/TradeRepublic-History-Exporter-For-PortfolioPerformance)

---

## 🇫🇷 Présentation

Cet outil vous permet de **vous connecter à votre compte Trade Republic** et de **récupérer automatiquement vos données de transactions** (achats, ventes, dépôts, retraits, dividendes, etc.).

L’interface web, basée sur **Node.js** et **Express.js**, affiche tous vos mouvements dans un tableau dynamique :
- **Filtres avancés** : filtrez vos opérations par type, date, titre, etc.
- **Sidebar de filtres** accessible depuis la navigation.
- **Synthèse des mouvements** : visualisez en un coup d’œil vos achats, ventes, dépôts, bénéfices…
- **Export CSV** compatible avec Portfolio Performance.
- **Interface responsive** avec Bootstrap 5.

Le projet est développé **selon les principes de la Clean Architecture** :  
le code est organisé par couches (domaine, application, infrastructure, interfaces), séparant strictement la logique métier, les cas d’usage et l’accès aux données.

_Ce projet est encore en développement. Les fonctionnalités et l’interface sont amenées à évoluer._

---

## 🇬🇧 Overview

This tool lets you **connect to your Trade Republic account** and **automatically retrieve your transaction history** (buys, sells, deposits, withdrawals, dividends, etc.).

The web UI, built with **Node.js** and **Express.js**, displays all your activity in a dynamic table:
- **Advanced filters**: filter your operations by type, date, security, etc.
- **Filter sidebar** accessible from the navbar.
- **Summary statistics**: see at a glance your buys, sells, deposits, profits…
- **CSV export** compatible with Portfolio Performance.
- **Responsive interface** with Bootstrap 5.

The project is developed **following Clean Architecture principles**:  
code is organized in layers (domain, application, infrastructure, interfaces), with a strict separation between business logic, use cases and data access.

_This project is a work in progress. Features and UI are evolving._

**Inspired by** : [Misterbural/TradeRepublic-History-Exporter-For-PortfolioPerformance](https://github.com/Misterbural/TradeRepublic-History-Exporter-For-PortfolioPerformance)

---


## 🚀 Running the Project

node server.js