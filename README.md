# HanziFive - Chinese Flashcards App

A modern web application for learning Chinese characters using flashcards. This app allows you to create, organize, and study Chinese characters with their pinyin pronunciation and English meaning.

![HanziFive App](/public/hanzifive.gif)

## Features

- Create flashcards with Chinese characters, pinyin, and English meaning
- Add tags to flashcards for organization
- Create custom decks of flashcards
- Rename decks to keep your collection organized
- Add cards to decks manually or by tag
- Study decks in different modes:
  - Normal: Character → Pinyin & Meaning
  - Reverse: Pinyin & Meaning → Character
  - Meaning Only: Meaning → Character & Pinyin
- Track study progress and performance

## Screenshots

### Flashcards Management
![Flashcards Page](/public/fkashcards.png)

### Deck Management
![Deck Management](/public/deck.png)

### Study Mode
![Study Mode](/public/studying.png)
![Study Results](/public/studying_two.png)

## Getting Started

### Prerequisites

- Node.js 16+ (latest LTS version recommended)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/evangelosmesklis/hanzifive.git
cd hanzifive
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up the database:
```bash
npx prisma generate
npx prisma migrate dev
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open your browser and navigate to `http://localhost:3000`

## Creating a Distributable Package

To create a distributable package that users can download and run without installing Node.js:

1. Install the required packaging dependencies:
```bash
npm install --save-dev fs-extra archiver
```

2. Build and package the application:
```bash
npm run package
```

3. The distributable ZIP file will be created in the root directory: `HanziFive-v1.0.0.zip`

4. Users can download, unzip, and run the application using:
   - Windows: Double-click `HanziFive.bat`
   - macOS/Linux: Double-click `HanziFive.sh` or run it from the terminal

## How to Use

### Creating Flashcards

1. Go to the Flashcards page
2. Fill in the form with:
   - Chinese character(s)
   - Pinyin pronunciation
   - English meaning
   - Tags (optional, comma-separated)
3. Click "Add Flashcard"

### Creating Decks

1. Go to the Decks page
2. Enter a name and optional description for your deck
3. Click "Create Deck"

### Managing Decks

1. On the Decks page, click "Manage" on any deck
2. From here you can:
   - Add cards by tag
   - Add individual cards
   - Remove cards from the deck

### Studying

1. On the Decks page, click "Study" on any deck
2. Choose your study mode:
   - Normal: See character, guess meaning and pronunciation
   - Reverse: See meaning and pronunciation, guess character
   - Meaning Only: See meaning, guess character and pronunciation
3. Flip each card and mark whether you got it right or wrong
4. View your results at the end of the session

## Technologies Used

- Next.js 14
- React
- TypeScript
- Tailwind CSS
- Prisma
- SQLite

## Database Structure

- Flashcards: Chinese characters with pinyin and meaning
- Tags: Categories for flashcards
- Decks: Collections of flashcards for studying
- StudySessions: Records of study sessions

## License

This project is licensed under the MIT License - see the LICENSE file for details.
