<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:0f0f0f,100:1a1a2e&height=200&section=header&text=GhostCommit&fontSize=60&fontColor=ffffff&fontAlignY=38&desc=Backfill%20your%20GitHub%20contribution%20graph%20silently&descAlignY=58&descSize=16&descColor=aaaaaa" width="100%" />
</div>

<div align="center">

  <img src="https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Platform-Linux%20%7C%20macOS%20%7C%20Windows-1a1a2e?style=for-the-badge&logo=linux&logoColor=white" />
  <img src="https://img.shields.io/badge/License-AGPL--V3-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Version-3.0-00d4aa?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Author-MatrixTM26-ff6b6b?style=for-the-badge&logo=github&logoColor=white" />
  <a href="https://github.com/MatrixTM26/GhostCommit/stargazers">
    <img src="https://img.shields.io/github/stars/MatrixTM26/GhostCommit?style=for-the-badge&logo=apachespark&logoColor=white&color=f5a623" />
  </a>

</div>

<br />

> GhostCommit fills your GitHub contribution graph with backdated commits, randomly distributed across any time range you choose — years, months, weeks, days, or a single specific date. Built to be minimal, stable, and safe to run for hundreds of commits at once without crashing.

---

## Preview

```
      ________  ___ ___ ________    ____________________
     /  _____/ /   |   \_____  \  /   _____/\__    ___/
    /   \  ___/    ~    \/   |   \ \_____  \   |    |
    \    \_\  \    Y    /    |    \/        \  |    |
     \______  /\___|_  /\_______  /_______  /  |____|
            \/       \/         \/        \/
                          COMMIT

  Author   :  @MatrixTM26
  Version  :  3.0

  1 ─ Commit by Years
  2 ─ Commit by Month
  3 ─ Commit by Week
  4 ─ Commit by Day
  5 ─ Commit on Specific Date
  0 ─ Exit

  :: Option > 5
  ~[Date YYYY-MM-DD] > 2024-03-15
  ~[Commit Count] > 200

  Mode: Specific Date (2024-03-15, 200 commits)

  [████████▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒]  20.0% (40/200)
```

---

## Modes

| Option | Mode | Input | Description |
| ------ | ---- | ----- | ----------- |
| `1` | **Commit by Years** | Years count | Spreads commits randomly across the last N years |
| `2` | **Commit by Month** | Month count | Spreads commits randomly across the last N months |
| `3` | **Commit by Week** | Week count | Spreads commits randomly across the last N weeks |
| `4` | **Commit by Day** | Day count | Spreads commits randomly across the last N days |
| `5` | **Specific Date** | `YYYY-MM-DD` | Spreads commits across the full 24 hours of a single date |

> **Specific Date** validates the input automatically — invalid formats, non-existent dates (e.g. Feb 30), and future dates are all rejected with a re-prompt until a valid date is entered.

---

## Requirements

<table>
  <tr>
    <td><img src="https://img.shields.io/badge/Git-F05032?style=flat-square&logo=git&logoColor=white" /></td>
    <td>Git installed and configured with user name and email</td>
  </tr>
  <tr>
    <td><img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white" /></td>
    <td>Node.js version 18 or higher</td>
  </tr>
  <tr>
    <td><img src="https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white" /></td>
    <td>A remote repository with push access</td>
  </tr>
</table>

---

## Installation

```bash
git clone https://github.com/MatrixTM26/GhostCommit.git
cd GhostCommit
npm init -y
```

Open `package.json` and set:

```json
"type": "module"
```

---

## Usage

```bash
node GhostCommit.js
```

GhostCommit will prompt you to choose a mode, enter the range or date, and the number of commits. It then generates all commits with backdated timestamps, displays a live progress bar, and pushes everything once it finishes.

---

## Configuration

Open `GhostCommit.js` and edit the `Config` object at the top of the file:

```js
const Config = {
    TotalCommits: 1000,
    DataFile: "./data.json",
    RetryAttempts: 3,
    PushAfterAll: true
};
```

| Key | Default | Description |
| --- | ------- | ----------- |
| `TotalCommits` | `1000` | Default commit count shown as fallback when input is empty |
| `DataFile` | `./data.json` | File that gets modified and staged on each commit |
| `RetryAttempts` | `3` | How many times to retry a failed commit before skipping |
| `PushAfterAll` | `true` | Push all commits to remote at the end in one go |

---

## Project Structure

```
GhostCommit/
├── GhostCommit.js   — main script
├── data.json        — auto-generated, committed each run
├── package.json
└── README.md
```

---

## Changelog

### v3.0
- Added **Commit by Week** mode
- Added **Commit by Day** mode
- Added **Commit on Specific Date** mode with full input validation
- Refactored menu dispatch to handler map — no more if-else chains
- Each mode isolated into its own handler function

### v2.0
- Added **Commit by Month** mode
- Live progress bar with percentage and counter
- Retry mechanism per commit
- Auto push after all commits finish

---

<p align="center">
    &copy;
    Copyright 2023-2026
    <a href="https://github.com/matrixtm26">@MatrixTM26</a>
    &nbsp;&middot;&nbsp;
    All rights reserved.
    <br>
    Licensed under
    &nbsp;
    <a href="./LICENSE">AGPL-V3</a>
</p>
