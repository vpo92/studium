# Studium Parisiense — Documentation Technique

> **Studium Parisiense** est une application web de base de données prosopographique dédiée aux membres des écoles et de l'Université de Paris entre le XIIe et le XVIe siècle. Projet du programme de recherche européen *Signs and States* dirigé par Jean-Philippe Genet (ERC).

---

## 1. Architecture générale

L'application suit une architecture **trois tiers** :

```mermaid
graph TB
    subgraph "Couche Présentation"
        Admin["Interface Admin PHP<br/>(port 8000/80)"]
    end

    subgraph "Couche API"
        API["API REST Node.js/Express<br/>(port 3000)"]
    end

    subgraph "Couche Données"
        MongoDB[("MongoDB<br/>(port 27017)")]
    end

    subgraph "Batch (CLI)"
        Batch["CLI Node.js<br/>Import / Re-index / Backup"]
    end

    Admin -->|"cURL / JWT"| API
    Admin -->|"Appels HTTP"| API
    API -->|"Mongoose"| MongoDB
    Batch -->|"HTTP / MongoDB Driver"| API
    Batch -->|"Connexion directe"| MongoDB
    Batch -->|"Lecture"| RawData["Fichiers texte<br/>format JPG structuré"]

    style Admin fill:#e1f5fe
    style API fill:#fff3e0
    style MongoDB fill:#e8f5e9
    style Batch fill:#fce4ec
    style RawData fill:#f3e5f5
```

---

## 2. Stack technologique

```mermaid
graph LR
    subgraph "Frontend Admin"
        PHP["PHP 7+"]
        BS["Bootstrap 4"]
        JQ["jQuery"]
        VUE["Vue.js 2"]
        DT["DataTables"]
        LF["Leaflet"]
    end

    subgraph "API"
        NODE["Node.js 8+"]
        EXP["Express 4"]
        MONGOOSE["Mongoose 5"]
        PASS["Passport JWT"]
        WINSTON["Winston"]
    end

    subgraph "Batch"
        NODE2["Node.js 12+"]
        BABEL["Babel"]
        MONGODRIVER["MongoDB Driver"]
        CHALK["Chalk"]
    end

    subgraph "Base de données"
        MDB["MongoDB 3+"]
    end

    subgraph "CI / Tooling"
        TRAVIS["Travis CI"]
        SONAR["SonarCloud"]
        DOCKER["Docker"]
        JEST["Jest / Enzyme"]
        FLOW["Flow"]
    end

    PHP --> NODE
    NODE --> MDB
    NODE2 --> MDB
```

---

## 3. Structure du projet

```
studium/
├── api/                  # API REST (Node.js/Express)
│   ├── config/           # Configuration (env, JWT, MongoDB)
│   ├── docker/           # Dockerfile et docker-compose
│   ├── docs/             # Documentation Swagger (HTML + OpenAPI)
│   ├── resources/json/   # Fichiers GeoJSON (données cartographiques)
│   ├── src/
│   │   ├── models/       # Modèles Mongoose (User)
│   │   ├── routes/       # Définition des routes Express
│   │   ├── services/     # Logique métier
│   │   └── utils/        # Utilitaire (DB, Logger, Export)
│   ├── tests/
│   └── types/            # Types Flow
│
├── admin/                # Interface d'administration (PHP)
│   ├── src/              # Services PHP (FicheService, UserService...)
│   ├── pages/            # Pages HTML/PHP
│   │   ├── common/       # Header, Footer, Login
│   │   └── view/         # Composants de vue
│   ├── resources/        # CSS, JS, icônes
│   └── mock/             # Réponses mock API pour développement
│
├── batchs/               # Traitements par lots (Node.js CLI)
│   ├── src/
│   │   ├── rawFilesParser/    # Parseur de fichiers texte JPG
│   │   │   └── util/          # Parseurs spécialisés (dates, noms, lieux...)
│   │   ├── fileImporter/      # Import de fichiers JSON
│   │   ├── placesextractor/   # Extraction de lieux
│   │   └── msextractor/       # Extraction de manuscrits
│   ├── tests/
│   │   └── data/              # Données de test
│   └── cmd                     # Binaire CLI
│
├── scripts/              # Scripts MongoDB (export CSV, dédoublonnage)
├── docker-compose.yml    # Orchestration complète
├── .travis.yml           # CI Travis
└── sonar-project.properties
```

---

## 4. Composant API (Node.js / Express)

### 4.1 Routage

```mermaid
graph TB
    REQ["Requête HTTP"] --> ROUTER["Router Principal<br/>routes.js"]
    ROUTER --> PROSO["/prosopography"]
    ROUTER --> AUTH["/auth"]
    ROUTER --> USER["/user"]
    ROUTER --> DRAFT["/draft"]
    ROUTER --> MANUS["/manuscrit"]
    ROUTER --> MONGO["/mongo"]
    ROUTER --> ADMIN["/admin"]
    ROUTER --> DOCS["/docs"]
    ROUTER --> DATA["/data/:file"]

    subgraph "Prosopography Routes"
        PROSO -->|"GET /"| findAll
        PROSO -->|"POST /"| create
        PROSO -->|"GET /search/:text"| textSearch
        PROSO -->|"POST /search/advanced"| advancedSearch
        PROSO -->|"GET /index/:letter"| indexSearch
        PROSO -->|"GET /all-ids"| getAllIds
        PROSO -->|"GET /:reference"| findByRef
        PROSO -->|"DELETE /:reference"| remove
        PROSO -->|"POST /parse-text"| convertFromText
        PROSO -->|"POST /initGraph"| initGraph
    end

    subgraph "Auth Routes"
        AUTH -->|"POST /login"| login
    end
```

### 4.2 Services

```mermaid
classDiagram
    class ProsopographyService {
        +findAll(pagination)
        +findByReference(reference)
        +textSearch(searchText, pagination)
        +indexSearch(letter)
        +search(searchRequest, pagination)
        +create(prosopography)
        +update(prosopography)
        +remove(reference)
        +convertFromText(text)
        +convertSearchRequestToMongoRequest(request)
        +initGraph()
        +backupAll()
        +initReferenceSeq()
        +updateGeoMS(prosopography)
    }

    class AuthService {
        +setup()
        +authenticate(username, password)
        +isAuthenticated()
        +hasRole(role)
    }

    class DraftService {
        +findAll()
        +findByReference(reference)
        +create(reference, raw)
        +update(reference, raw)
        +publish(reference)
        +remove(reference)
    }

    class UserService {
        +create(username, email, password, role)
        +findAll()
        +findById(userId)
        +remove(userId)
    }

    class ManuscritService {
        +findByNum(num)
        +create(manuscrit)
        +importList(list)
    }

    class MongoService {
        +executeQuery(query)
    }

    ProsopographyService --> DB
    DraftService --> DB
    UserService --> DB
    ManuscritService --> DB
    MongoService --> DB
```

---

## 5. Composant Admin (PHP)

### 5.1 Contrôleur frontal

```mermaid
flowchart TD
    REQ["Requête HTTP"] --> FC["index.php<br/>Front Controller"]
    FC --> AUTH{Authentifié ?}
    AUTH -->|Non| LOGIN["common/login.php"]
    AUTH -->|Oui| ACTION{Action}

    ACTION -->|"index"| INDEX["pages/index.php<br/>Index alphabétique A-Z"]
    ACTION -->|"view"| VIEW["pages/view.php<br/>Détail fiche"]
    ACTION -->|"search"| SEARCH["pages/recherche.php<br/>Résultats recherche"]
    ACTION -->|"edit"| EDIT["pages/edit.php<br/>Éditeur fiche"]
    ACTION -->|"delete"| DELETE["pages/delete.php<br/>Confirmation suppression"]
    ACTION -->|"draft"| DRAFT["pages/draft.php<br/>Gestion brouillons"]
    ACTION -->|"create"| CREATE["pages/edit.php<br/>Création fiche"]
    ACTION -->|"recherche-avancee"| AV["pages/recherche-avancee.php"]
    ACTION -->|"recherche-mongo"| MONGO["pages/recherche-mongo.php"]
    ACTION -->|"dump"| DUMP["pages/dump.php"]
    ACTION -->|"supervision"| SUP["pages/supervision.php"]

    VIEW --> VIEWPROPS["view/view_properties.php<br/>Rendu propriétés"]
```

### 5.2 Services PHP

```mermaid
classDiagram
    class FicheService {
        +searchByIndex(letter)
        +searchByReference(reference)
        +searchByKeyWord(keyword, page, rows)
        +saveFicheFromText(reference, raw)
        +removeFicheByReference(reference)
        +getDraftByReference(reference)
        +getDrafts()
    }

    class UserService {
        +authenticate(username, password)
        +getToken()
    }

    class ManuscritService {
        +getManuscrit(num)
    }

    class Utils {
        +callAPI(method, url, data)
        +getFieldFromForm(name)
        +isAuthenticated()
    }

    FicheService --> Utils
    UserService --> Utils
    ManuscritService --> Utils
    Utils -->|"cURL"| API["API REST Node.js"]
```

---

## 6. Composant Batch (Node.js CLI)

### 6.1 Commandes disponibles

```mermaid
flowchart LR
    CLI["studium <commande>"] --> AUTHCMD["auth<br/>Authentification JWT"]
    CLI --> IMPORT["import-file<br/>Import fichier JPG"]
    CLI --> REINDEX["re-index<br/>Re-indexation"]
    CLI --> REINDEXM["re-index-manus<br/>Re-index manuscrits"]
    CLI --> BACKUP["backup<br/>Sauvegarde BDD"]
    CLI --> INDEXDB["update-db-index<br/>Index MongoDB"]
    CLI --> IMPORTM["import-manuscrit<br/>Import manuscrits"]
    CLI --> CREATEADMIN["create-admin<br/>Création admin"]
    CLI --> VERSION["version<br/>Version"]
    CLI --> HELP["help<br/>Aide"]

    IMPORT --> PARSER["simpleParser.js<br/>Analyse ligne par ligne"]
    PARSER --> SAVE["RestService.saveRecord()"]
    SAVE --> API
```

### 6.2 Parseur de fichiers texte (format JPG)

Le parseur lit les fichiers texte structurés avec des **codes de ligne** spécifiques :

```mermaid
stateDiagram-v2
    [*] --> NEW_PROSO: Ligne <1a>
    NEW_PROSO --> DATA: Ligne <code>
    DATA --> DATA: Même code
    DATA --> NEW_OPUS: Ligne <Na>
    NEW_OPUS --> OPUS_DATA: Ligne <<code>>
    OPUS_DATA --> OPUS_DATA: Même code
    OPUS_DATA --> NEW_VERSION: Ligne <<<k>>> 
    NEW_VERSION --> VERSION_DATA: Ligne <<<code>>>
    VERSION_DATA --> VERSION_DATA: Même code
    OPUS_DATA --> DATA: Nouveau code data
    NEW_OPUS --> DATA: Nouveau code data
    DATA --> NEW_PROSO: Nouveau <1a>
    NEW_PROSO --> [*]: Fin fichier

    note right of NEW_PROSO
        Codes principaux:
        <1a> = Nouvelle fiche
        <r>  = Référence
        <Na> = Nouvel opus
        <<code>> = Données opus
        <<<k>>> = Nouvelle version
        <code>/ = Commentaire
    end note
```

### 6.3 Structure des données extraites

```mermaid
graph TB
    PROSO["Prosopography"] --> IDENTITY["identity"]
    PROSO --> ORIGIN["origin"]
    PROSO --> CURRICULUM["curriculum"]
    PROSO --> TEXTUAL["textualProduction"]
    PROSO --> EXTRAS["extras"]
    PROSO --> RAW["raw[]"]

    IDENTITY --> NAME["name[{value, meta}]"]
    IDENTITY --> GENDER["gender[{value}]"]
    IDENTITY --> STATUS["status[{value}]"]
    IDENTITY --> DATES["datesOfActivity[{value, meta.dates}]"]
    IDENTITY --> NAMESVAR["nameVariant[{value}]"]

    ORIGIN --> BIRTH["birthPlace[{value, meta.places}]"]
    ORIGIN --> DIOCESE["diocese[{value}]"]

    CURRICULUM --> GRADES["grades[{value, meta}]"]
    CURRICULUM --> INSTIT["institution[{value, meta}]"]

    TEXTUAL --> THEME["theme[]"]
    THEME --> OPUS["opus[]"]
    OPUS --> VERSIONS["versions[]"]
    OPUS --> MANUSCRITS["manuscrits[{value, meta}]"]

    EXTRAS --> ACTIVITY["activityMediane"]
    EXTRAS --> EXTRA["... autres métadonnées"]
```

---

## 7. Flux d'authentification

```mermaid
sequenceDiagram
    participant User as Utilisateur
    participant PHP as Admin PHP
    participant API as API Node.js
    participant DB as MongoDB

    User->>PHP: Saisie login/mot de passe
    PHP->>API: POST /auth/login {pseudo, password}
    API->>DB: findOne({email})
    DB-->>API: User document
    API->>API: Vérification password + salt
    API->>API: Génération JWT {role, exp}
    API-->>PHP: Token JWT
    PHP->>PHP: Stockage en session
    PHP-->>User: Redirection page d'accueil

    Note over PHP,API: Requêtes suivantes
    User->>PHP: Action (search, view, edit...)
    PHP->>API: Requête + Header Authorization: Bearer <JWT>
    API->>API: Vérification JWT (Passport)
    API->>DB: Opération CRUD
    DB-->>API: Résultat
    API-->>PHP: JSON Response
    PHP-->>User: Page HTML
```

---

## 8. Flux de données : import de fichier

```mermaid
sequenceDiagram
    participant User as Opérateur
    participant CLI as Batch CLI
    participant Parser as SimpleParser
    participant API as API REST
    participant DB as MongoDB

    User->>CLI: studium import-file --file=data.txt
    CLI->>CLI: Authentification (JWT)
    CLI->>Parser: processFile(data.txt)

    loop Chaque ligne
        Parser->>Parser: detectTypeOfLine()
        alt NEW_PROSO (<1a>)
            Parser->>Parser: endProso() => sauvegarde
            Parser->>Parser: startProso()
        else DATA (<code>)
            Parser->>Parser: buildDataLine()
            Parser->>Parser: getMeta() => dates, noms, lieux...
        else NEW_OPUS (<Na>)
            Parser->>Parser: endOpus() / startOpus()
        else NEW_VERSION (<<<k>>>)
            Parser->>Parser: endVersion() / startVersion()
        end
    end

    Parser->>Parser: endProso() (dernière fiche)
    Parser->>API: saveRecord(prosopography)
    API->>DB: insert() prosopography
    Parser->>API: createIndex()
    API->>DB: createIndex({ "$**": "text" })
    CLI-->>User: Import terminé (N fiches)
```

---

## 9. Modèle de données MongoDB

### Collections

```mermaid
erDiagram
    prosopography {
        string reference PK
        object identity
        object origin
        object curriculum
        object textualProduction
        object extras
        array raw
    }

    draft {
        string reference PK
        array raw
        date createdAt
        date updatedAt
    }

    users {
        string name
        string email PK
        string password
        string salt
        string role
    }

    manus {
        string Num PK
        string REFERENCES_SOURCES
        string Ville
        string Bibliotheque
        string Cote
        string Datation
    }

    logs {
        string level
        string message
        date timestamp
    }

    prosopography_seq {
        int seq
    }
```

### Structure d'une fiche prosopographique (exemple simplifié)

```json
{
  "reference": "50001",
  "identity": {
    "name": [{ "value": "Johannes de Gerson", "meta": { "names": [...] } }],
    "gender": [{ "value": "M" }],
    "status": [{ "value": "Magister" }],
    "datesOfActivity": [{ "value": "1390-1420", "meta": { "dates": [...] } }]
  },
  "origin": {
    "birthPlace": [{ "value": "Gerson", "meta": { "places": [...] } }],
    "diocese": [{ "value": "Reims" }]
  },
  "curriculum": {
    "grades": [{ "value": "Doctor en Theologie" }],
    "institution": [{ "value": "Université de Paris" }]
  },
  "textualProduction": [{
    "theme": "Theologie",
    "opus": [{
      "title": [{ "value": "De consolatione theologiae" }],
      "manuscrits": [{ "value": "Paris, BnF, lat. 1234" }],
      "versions": [...]
    }]
  }],
  "extras": {
    "activityMediane": 1400
  },
  "raw": ["<1a>...", ...]
}
```

---

## 10. Déploiement

### 10.1 Docker Compose

```mermaid
graph TB
    subgraph "Docker Compose"
        API["studium_api<br/>node:8.1<br/>port 3000"]
        ADMIN["studium_admin<br/>php:7.3-apache<br/>port 3002"]
        MONGO["mongodb<br/>mongo:latest<br/>port 27017"]
    end

    subgraph "Réseau"
        PUBLIC["public (traefik)"]
        DEFAULT["default"]
    end

    API --> DEFAULT
    API --> PUBLIC
    ADMIN --> DEFAULT
    ADMIN --> PUBLIC
    MONGO --> DEFAULT

    API -->|"dépend"| MONGO
```

### 10.2 Installation manuelle

```bash
# 1. Installer MongoDB 3+
# 2. Batch - Installer les dépendances et créer l'admin
cd batchs && npm i && npm start -- create-admin

# 3. API - Installer et démarrer
cd api && npm i && npm start
# => API disponible sur http://localhost:3000

# 4. Admin - Démarrer le serveur PHP
cd admin && bin/start.sh
# => Interface disponible sur http://localhost:8000
```

---

## 11. Tests et CI

```mermaid
flowchart LR
    GIT["git push"] --> TRAVIS["Travis CI"]
    TRAVIS --> TEST["Jest + Enzyme"]
    TRAVIS --> SONAR["SonarCloud analysis"]
    TEST --> API_T["Tests API"]
    TEST --> BATCH_T["Tests Batch"]
    BATCH_T --> PARSE["Parser tests"]
    BATCH_T --> DATE_T["Date parser"]
    BATCH_T --> NAME_T["Name parser"]
    BATCH_T --> PLACE_T["Place parser"]
    BATCH_T --> TITLE_T["Title parser"]
    BATCH_T --> INST_T["Institution parser"]
    BATCH_T --> COTE_T["Cote parser"]
    BATCH_T --> MS_T["Manuscrit parser"]
    BATCH_T --> EXTRA_T["Extradata parser"]
```

---

## 12. API REST — Résumé des endpoints

| Groupe | Méthode | Route | Description |
|--------|---------|-------|-------------|
| **Prosopography** | `GET` | `/prosopography` | Liste toutes les fiches |
| | `POST` | `/prosopography` | Crée une fiche |
| | `GET` | `/prosopography/:reference` | Récupère une fiche |
| | `DELETE` | `/prosopography/:reference` | Supprime une fiche |
| | `GET` | `/prosopography/search/:text` | Recherche textuelle |
| | `POST` | `/prosopography/search/advanced` | Recherche avancée |
| | `GET` | `/prosopography/index/:letter` | Index alphabétique |
| | `GET` | `/prosopography/all-ids` | Tous les IDs |
| | `POST` | `/prosopography/parse-text` | Parse un texte brut |
| | `POST` | `/prosopography/initGraph` | Agrégation graphe |
| | `POST` | `/prosopography/seq/init` | Init séquence |
| | `GET` | `/prosopography/seq/current` | Séquence courante |
| **Auth** | `POST` | `/auth/login` | Authentification |
| **User** | `POST` | `/user` | Crée un utilisateur |
| | `GET` | `/user` | Liste les utilisateurs |
| | `GET` | `/user/me` | Profil courant |
| | `POST` | `/user/init-pwd/:userId` | Reset mot de passe |
| | `DELETE` | `/user/:userId` | Supprime un utilisateur |
| **Draft** | `GET` | `/draft` | Liste les brouillons |
| | `GET` | `/draft/:reference` | Récupère un brouillon |
| | `POST` | `/draft/:reference` | Crée/met à jour |
| | `DELETE` | `/draft/:reference` | Supprime un brouillon |
| | `POST` | `/draft/from-text` | Met à jour depuis texte |
| | `POST` | `/draft/create-from-text` | Crée depuis texte |
| | `POST` | `/draft/publish/:reference` | Publie un brouillon |
| **Manuscrit** | `GET` | `/manuscrit/:num` | Récupère un manuscrit |
| | `POST` | `/manuscrit` | Crée un manuscrit |
| | `POST` | `/manuscrit/list` | Importe une liste |
| **Mongo** | `POST` | `/mongo/executeQuery` | Requête MongoDB directe |
| **Admin** | `POST` | `/admin/*` | Re-index, backup, etc. |
| **Docs** | `GET` | `/docs` | Documentation Swagger |
| **Data** | `GET` | `/data/:file` | Fichiers GeoJSON |

---

## 13. Licence

Studium est publié sous licence **Open Source (MIT)**.

---
*Documentation générée à partir de l'analyse du code source — Juin 2026*
