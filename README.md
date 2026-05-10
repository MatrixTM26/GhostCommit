<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:0f0f0f,100:1a1a2e&height=200&section=header&text=GhostCommit&fontSize=60&fontColor=ffffff&fontAlignY=38&desc=Backfill%20your%20GitHub%20contribution%20graph%20silently&descAlignY=58&descSize=16&descColor=aaaaaa" width="100%" />
</div>

<div align="center">

  <img src="https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Platform-Linux%20%7C%20macOS%20%7C%20Windows-1a1a2e?style=for-the-badge&logo=linux&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Author-MatrixTM26-ff6b6b?style=for-the-badge&logo=github&logoColor=white" />
  <a href="https://github.com/MatrixTM26/GhostCommit/stargazers">
    <img src="https://img.shields.io/github/stars/MatrixTM26/GhostCommit?style=for-the-badge&logo=apachespark&logoColor=white&color=f5a623" />
  </a>

</div>

<br />

> GhostCommit fills your GitHub contribution graph with backdated commits, randomly distributed across the past years. Built to be minimal, stable, and safe to run for hundreds of commits at once without crashing.

---

## Preview

```

      ________  ___ ___ ________    ____________________
     /  _____/ /   |   \\_____  \  /   _____/\__    ___/
    /   \  ___/    ~    \/   |   \ \_____  \   |    |
    \    \_\  \    Y    /    |    \/        \  |    |
     \______  /\___|_  /\_______  /_______  /  |____|
            \/       \/         \/        \/
                          COMMIT

  Author   :  @MatrixTM26
  Version  :  2.0

  1 - Commit by Years
  2 - Commit by Month
  0 - Exit

  :: Option > 1
  ~[Years Count] > 2
  ~[Commit Count] > 1000

  Mode: Commit by Years (2y, 1000 commits)

  [██▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒]   4.8% (48/1000)
```

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
npm i simple-git moment jsonfile random
```

Open `package.json` and change:

```json
"type": "commonjs"
```

to:

```json
"type": "module"
```

---

## Usage

```bash
node GhostCommit.js
```

That is all. GhostCommit will generate commits, display a live progress bar, and push everything once it finishes.

---

## Configuration

Open `GhostCommit.js` and edit the `Config` object at the top of the file:

```js
const Config = {
    TotalCommits: 100,
    DataFile: "./data.json",
    RetryAttempts: 3,
    PushAfterAll: true,
    Verbose: false
};
```

| Key             | Default       | Description                             |
| --------------- | ------------- | --------------------------------------- |
| `TotalCommits`  | `100`         | Total number of commits to generate     |
| `DataFile`      | `./data.json` | File that gets modified on each commit  |
| `RetryAttempts` | `3`           | How many times to retry a failed commit |
| `PushAfterAll`  | `true`        | Push all commits at the end in one go   |
| `Verbose`       | `false`       | Print each commit date as it runs       |

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

<div align="left">

## ◈ Support Me

<p align="left">
    If this project helps, you can support me here:
</p>

<a href="https://ko-fi.com/matriMatrixTM26" target="_blank">
  <img src="https://ko-fi.com/img/githubbutton_sm.svg" height="20" alt="Support me on Ko-fi" />
</a>

<a href="https://trakteer.id/matriMatrixTM26">
  <img src="https://img.shields.io/badge/Support-Trakteer-orange" height="20" alt="Support me on Trakteer"/>
</a>

</div>

---

<div align="center">
  <img src="https://img.shields.io/badge/Made%20by-MatrixTM26-ff6b6b?style=for-the-badge&logo=github&logoColor=white" />
  <br /><br />
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:1a1a2e,100:0f0f0f&height=100&section=footer" width="100%" />
</div>
