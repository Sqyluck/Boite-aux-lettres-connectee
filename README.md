# Boite-aux-lettres-connectee

Projet réalisé par Judith Caroff, Jeanne Leclercq, Luc Fermaut, Pierre Hourdé, Jean-Baptiste Lavoine et Victorien Renault.
Introduction
    Étudiants en 3ème année à l’ISEN-Lille, nous avons eu l’idée de développer une boîte aux lettres connectée à Constellation. 
En réalisant ce projet, nous voulions proposer une solution de boîte aux lettres connectée à un prix raisonnable et une interface fluide pour améliorer l’expérience utilisateur. Pour cela, nous avons acheté des composants peu coûteux à placer sur notre boîte aux lettres, et développé une application Ionic.
 
    Présentation

Notre boîte aux lettres est connectée à Constellation par le biais d’un ESP8266, vous pouvez le connecter facilement à votre Constellation en suivant cette documentation sur le site Constellation. 
Nous détectons la présence de courriers à l’aide de capteurs à ultrasons. 
Avec un lecteur de cartes NFC, nous contrôlons l’accès à notre boîte aux lettres. Celui-ci nous permet de savoir qui a ouvert la boîte aux lettres et donc d’envoyer les bonnes informations à notre Constellation. Le lecteur NFC nous permet également de vérifier qu’une carte ou qu’un badge NFC a les autorisations nécessaires afin de commander l’ouverture via le servo-moteur.
L’application nous permet d’offrir une interface utilisateur ergonomique. En la connectant à Constellation, l’utilisateur a accès à toutes les informations nécessaires très facilement. 
