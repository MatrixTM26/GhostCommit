<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:0f0f0f,100:1a1a2e&height=200&section=header&text=GhostCommit&fontSize=60&fontColor=ffffff&fontAlignY=38&desc=Backfill%20your%20GitHub%20contribution%20graph%20silently&descAlignY=58&descSize=16&descColor=aaaaaa" width="100%" />
</div>

<div align="center">

  <img src="https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Platform-Linux%20%7C%20macOS%20%7C%20Windows-1a1a2e?style=for-the-badge&logo=linux&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Author-XTM26-ff6b6b?style=for-the-badge&logo=github&logoColor=white" />
<img src="https://img.shields.io/github/stars/XTM26/HellcatAPI?style=flat-square&color=yellow">

</div>

<br />

> GhostCommit fills your GitHub contribution graph with backdated commits, randomly distributed across the past year. Built to be minimal, stable, and safe to run for hundreds of commits without crashing.

---

## Preview

```
+ GhostCommit: Auto Commit Tool +
  + AUTHOR : XTM26
  + GITHUB : XTM26
    Total  : 100
    Push   : after all

  [########################################]  100.0% (100/100)

  ----------------------------------------
  Success : 100 commits
  Time    : 12.4s
  Speed   : 8.1 commit/s
  ----------------------------------------
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
git clone https://github.com/XTM26/GhostCommit.git
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
node script.js
```

That is all. GhostCommit will generate commits, display a live progress bar, and push everything once it finishes.

---

## Configuration

Open `script.js` and edit the `Config` object at the top of the file:

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

<div align="center">
  <img src="https://img.shields.io/badge/Made%20by-XTM26-ff6b6b?style=for-the-badge&logo=github&logoColor=white" />
  <br /><br />
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:1a1a2e,100:0f0f0f&height=100&section=footer" width="100%" />
</div>
