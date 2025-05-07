-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_StudySession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "deckId" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" DATETIME,
    "correct" INTEGER NOT NULL DEFAULT 0,
    "incorrect" INTEGER NOT NULL DEFAULT 0,
    "studyMode" TEXT NOT NULL,
    CONSTRAINT "StudySession_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "Deck" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_StudySession" ("correct", "deckId", "endedAt", "id", "incorrect", "startedAt", "studyMode") SELECT "correct", "deckId", "endedAt", "id", "incorrect", "startedAt", "studyMode" FROM "StudySession";
DROP TABLE "StudySession";
ALTER TABLE "new_StudySession" RENAME TO "StudySession";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
