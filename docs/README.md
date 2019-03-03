<div align="center">
  <img src="https://github.com/deltaproject/Delta/raw/master/img/icons/icon.jpg" alt="Logo" width="140" height="140">
  <h1>Delta</h1>
  <p>📚 Een moderne versie van Magister, gemaakt voor leerlingen.</p>
  <a href="https://github.com/deltaproject/Delta/blob/master/LICENSE">
    <img src="https://img.shields.io/github/license/deltaproject/Delta.svg?style=flat-square" alt="Licentie"></img>
  </a>
  <a href="https://github.com/deltaproject/Delta/issues">
    <img src="https://img.shields.io/github/issues/deltaproject/Delta.svg?style=flat-square" alt="Issues"></img>
  </a>
  <a href="https://github.com/deltaproject/Delta/pulls">
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square" alt="Pull Requests"></img>
  </a>
  <a href="https://www.codefactor.io/repository/github/deltaproject/delta">
    <img src="https://www.codefactor.io/repository/github/deltaproject/delta/badge" alt="CodeFactor"></img>
  </a>
  <a href="https://standardjs.com">
    <img src="https://img.shields.io/badge/code_style-standard-brightgreen.svg", alt="JavaScript Style Guide">
  </a>
  <br><br>
</div>

# Installatie
Je kunt de laatste versie van Delta installeren door naar [deltaproject.github.io](https://deltaproject.github.io) te gaan, naar de sectie Downloads te scrollen en vervolgens op de download te klikken die geschikt is voor jouw besturingssysteem.

Voor een overzicht van alle (bèta)versies/releases van Delta kun je terecht op de pagina [Releases](https://github.com/deltaproject/Delta/releases).

# Voor ontwikkelaars
1. Clone deze repository naar je lokale schijf met `git clone https://github.com/deltaproject/Delta`
2. Open je Terminal-emulator en navigeer naar de locatie waar je de repository hebt gecloned
3. Typ `yarn install` om alle dependencies te installeren (of `npm i`).
4. Start Delta met `yarn run dev` (of `npm run dev`).

# Voor scholen en docenten
Er is een Enterprise-versie gepland voor Delta die geschikt is voor docenten op het voortgezet onderwijs. Deze zal voorlopig nog niet tot ontwikkeling worden gebracht. Scholen kunnen overigens wel nu al gebruik maken van de **gastmodus voor scholen**, dit is een speciale modus voor Delta die geschikt is voor schoolcomputers/openbare computers voor leerlingen om in een veilige omgeving in te kunnen loggen bij Delta zonder dat hun inloggegevens worden opgeslagen.

De gastmodus kan worden aangezet door een bestand `school.json` aan te maken in de app data folder van Delta (`%APPDATA%\Delta\` op Windows en `~/Library/Application Support/Delta/` op OS X). Het bestand dient de volgende inhoud te hebben:
```json
{ "schoolname": "Naam van de school" }
```

U kunt dit bestand beveiligen door de schrijftoegang in te nemen. Delta heeft alleen leestoegang nodig om de gastmodus te activeren. U kunt bevestigen dat de gastmodus is geactiveerd als er bij het inlogscherm een melding verschijnt dat de gastmodus is ingeschakeld.

# Een bijdrage leveren
Zie [Een bijdrage leveren](https://github.com/deltaproject/Delta/blob/master/docs/CONTRIBUTING.md) voor details over het maken voor Pull Requests enzovoorts.

# Roadmap
Je kunt [hier de Roadmap bekijken](https://github.com/deltaproject/Delta/projects/1) van Delta. Hierin staan de mogelijk verwachte functies die je binnenkort zult tegenkomen in Delta. Wil jij bijdragen aan een van deze nieuwe functies? Zie **Een bijdrage leveren** voor details.

# Bijdragers
Met dank aan [Julian van Doorn (@Argetan)](https://github.com/Argetan) voor het verder uitbreiden en steunen van Delta.

# Credits
Met speciale dank aan [Lieuwe Rooijakkers (@lieuwex)](https://github.com/lieuwex) voor het maken van [MagisterJS](https://github.com/simplyGits/MagisterJS), die Delta mogelijk maakte.

# Licentie
Delta is gelicentieerd onder een [Mozilla Public License 2.0](https://github.com/deltaproject/Delta/blob/master/LICENSE) licentie.
