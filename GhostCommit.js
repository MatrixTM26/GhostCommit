// GHOST COMMIT
// AUTHOR : XTM26
// GITHUB : XTM26

import { writeFileSync } from "fs";
import { spawnSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const Dirname = path.dirname(fileURLToPath(import.meta.url));

const Config = {
    TotalCommits: 500,
    DataFile: "./data.json",
    RetryAttempts: 3,
    PushAfterAll: process.env.CI !== "true",
    Verbose: false
};

const Git = Args => {
    const Result = spawnSync("git", Args, {
        cwd: Dirname,
        encoding: "utf8",
        maxBuffer: 1024 * 1024 * 10
    });
    if (Result.status !== 0) {
        throw new Error(Result.stderr || Result.stdout || "git command failed");
    }
    return Result.stdout.trim();
};

const GenerateRandomPastDate = () => {
    const Now = new Date();
    const OneYearAgo = new Date(Now);
    OneYearAgo.setFullYear(OneYearAgo.getFullYear() - 2);

    const Result = new Date(
        OneYearAgo.getTime() +
            Math.floor(Math.random() * (Now.getTime() - OneYearAgo.getTime()))
    );

    const Pad = N => String(N).padStart(2, "0");
    return (
        `${Result.getFullYear()}-${Pad(Result.getMonth() + 1)}-${Pad(Result.getDate())}` +
        `T${Pad(Result.getHours())}:${Pad(Result.getMinutes())}:${Pad(Result.getSeconds())}+07:00`
    );
};

const ProgressBar = (Current, Total, Width = 40) => {
    const Pct = Current / Total;
    const Filled = Math.round(Pct * Width);
    const Bar = "#".repeat(Filled) + "-".repeat(Width - Filled);
    const Percent = (Pct * 100).toFixed(1).padStart(5);
    process.stdout.write(`\r  [${Bar}] ${Percent}% (${Current}/${Total})`);
};

const MakeCommit = Index => {
    const CommitDate = GenerateRandomPastDate();
    writeFileSync(
        path.resolve(Dirname, Config.DataFile),
        JSON.stringify({ CommitDate, Index }, null, 2),
        "utf8"
    );
    Git(["add", Config.DataFile]);
    Git([
        "commit",
        "--allow-empty-message",
        "-m",
        CommitDate,
        `--date=${CommitDate}`,
        "--no-verify"
    ]);
    if (Config.Verbose)
        process.stdout.write(`\n  OK commit #${Index + 1} -> ${CommitDate}\n`);
};

const MakeCommitWithRetry = Index => {
    for (let Attempt = 1; Attempt <= Config.RetryAttempts; Attempt++) {
        try {
            MakeCommit(Index);
            return;
        } catch (Err) {
            if (Attempt === Config.RetryAttempts) {
                process.stderr.write(
                    `\n  FAIL commit #${Index + 1} after ${Config.RetryAttempts}x: ${Err.message}\n`
                );
                throw Err;
            }
        }
    }
};

const Run = () => {
    process.stdout.write(`\nGhostCommit - Auto Commit Tool\n`);
    process.stdout.write(`\nAUTHOR     :    XTM26\n`);
    process.stdout.write(`\nGITHUB     :    XTM26\n`);
    process.stdout.write(`      Total  :    ${Config.TotalCommits}\n`);
    process.stdout.write(
        `      Push   :    ${Config.PushAfterAll ? "after all" : "CI handles"}\n\n`
    );

    try {
        Git(["rev-parse", "--is-inside-work-tree"]);
    } catch {
        process.stderr.write("  Not a git repository. Run 'git init' first.\n");
        process.exit(1);
    }

    let SuccessCount = 0;
    let FailCount = 0;
    const StartTime = Date.now();

    for (let I = 0; I < Config.TotalCommits; I++) {
        try {
            MakeCommitWithRetry(I);
            SuccessCount++;
        } catch {
            FailCount++;
        }
        ProgressBar(I + 1, Config.TotalCommits);
    }

    process.stdout.write("\n\n");

    if (Config.PushAfterAll) {
        process.stdout.write("  Pushing...\n");
        try {
            Git(["push"]);
            process.stdout.write("  Push OK\n\n");
        } catch (Err) {
            process.stderr.write(`  Push failed: ${Err.message}\n`);
            process.stderr.write("  Run 'git push' manually.\n\n");
        }
    }

    const Elapsed = ((Date.now() - StartTime) / 1000).toFixed(1);
    process.stdout.write(`${"─".repeat(40)}\n`);
    process.stdout.write(`  Success : ${SuccessCount} commits\n`);
    if (FailCount > 0)
        process.stdout.write(`  Failed  : ${FailCount} commits\n`);
    process.stdout.write(`  Time    : ${Elapsed}s\n`);
    process.stdout.write(
        `  Speed   : ${(SuccessCount / Elapsed).toFixed(1)} commit/s\n`
    );
    process.stdout.write(`${"─".repeat(40)}\n\n`);
};

Run();
