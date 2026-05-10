// GHOST COMMIT
// AUTHOR : MatrixTM26
// GITHUB : https://github.com/MatrixTM26

import { writeFileSync } from "fs";
import { spawnSync } from "child_process";
import { createInterface } from "readline";
import path from "path";
import { fileURLToPath } from "url";

const Dirname = path.dirname(fileURLToPath(import.meta.url));

const Config = {
    TotalCommits: 1000,
    DataFile: "./data.json",
    RetryAttempts: 3,
    PushAfterAll: process.env.CI !== "true"
};

const C = {
    Reset: "\x1b[0m",
    Bold: "\x1b[1m",
    Dim: "\x1b[2m",
    Red: "\x1b[31m",
    Green: "\x1b[32m",
    Yellow: "\x1b[33m",
    Cyan: "\x1b[36m",
    White: "\x1b[37m"
};

const Paint = (Color, Text) => `${Color}${Text}${C.Reset}`;

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

const Pad = N => String(N).padStart(2, "0");

const FormatDate = Date =>
    `${Date.getFullYear()}-${Pad(Date.getMonth() + 1)}-${Pad(Date.getDate())}` +
    `T${Pad(Date.getHours())}:${Pad(Date.getMinutes())}:${Pad(Date.getSeconds())}+07:00`;

const GenerateRandomDate = (StartDate, EndDate) => {
    const Result = new Date(
        StartDate.getTime() +
            Math.floor(
                Math.random() * (EndDate.getTime() - StartDate.getTime())
            )
    );
    return FormatDate(Result);
};

const ProgressBar = (Current, Total, Width = 40) => {
    const Pct = Current / Total;
    const Filled = Math.round(Pct * Width);
    const Bar =
        Paint(C.Cyan, "█".repeat(Filled)) +
        Paint(C.Dim, "▒".repeat(Width - Filled));
    const Percent = Paint(C.Yellow, (Pct * 100).toFixed(1).padStart(5) + "%");
    const Counter = Paint(C.Dim, `(${Current}/${Total})`);
    process.stdout.write(`\r  [${Bar}] ${Percent} ${Counter}`);
};

const MakeCommit = (Index, DateGenerator) => {
    const CommitDate = DateGenerator();
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
};

const MakeCommitWithRetry = (Index, DateGenerator) => {
    for (let Attempt = 1; Attempt <= Config.RetryAttempts; Attempt++) {
        try {
            MakeCommit(Index, DateGenerator);
            return;
        } catch (Err) {
            if (Attempt === Config.RetryAttempts) {
                process.stderr.write(
                    `\n  ${Paint(C.Red, `FAIL`)} commit #${Index + 1} after ${Config.RetryAttempts}x: ${Err.message}\n`
                );
                throw Err;
            }
        }
    }
};

const RunCommits = (DateGenerator, Total) => {
    try {
        Git(["rev-parse", "--is-inside-work-tree"]);
    } catch {
        process.stderr.write(
            `  ${Paint(C.Red, "Not a git repository.")} Run 'git init' first.\n`
        );
        process.exit(1);
    }

    let SuccessCount = 0;
    let FailCount = 0;
    const StartTime = Date.now();

    process.stdout.write("\n");

    for (let I = 0; I < Total; I++) {
        try {
            MakeCommitWithRetry(I, DateGenerator);
            SuccessCount++;
        } catch {
            FailCount++;
        }
        ProgressBar(I + 1, Total);
    }

    process.stdout.write("\n\n");

    if (Config.PushAfterAll) {
        process.stdout.write(`  ${Paint(C.Cyan, "Pushing...")}\n`);
        try {
            Git(["push"]);
            process.stdout.write(`  ${Paint(C.Green, "Push OK")}\n\n`);
        } catch (Err) {
            process.stderr.write(
                `  ${Paint(C.Red, "Push failed:")} ${Err.message}\n`
            );
            process.stderr.write(
                `  Run ${Paint(C.Yellow, "'git push'")} manually.\n\n`
            );
        }
    }

    const Elapsed = ((Date.now() - StartTime) / 1000).toFixed(1);
    const Divider = Paint(C.Dim, "─".repeat(40));

    process.stdout.write(`${Divider}\n`);
    process.stdout.write(
        `  ${Paint(C.White, "Success")} : ${Paint(C.Green, String(SuccessCount))} commits\n`
    );
    if (FailCount > 0)
        process.stdout.write(
            `  ${Paint(C.White, "Failed")}  : ${Paint(C.Red, String(FailCount))} commits\n`
        );
    process.stdout.write(
        `  ${Paint(C.White, "Time")}    : ${Paint(C.Yellow, Elapsed + "s")}\n`
    );
    process.stdout.write(
        `  ${Paint(C.White, "Speed")}   : ${Paint(C.Cyan, (SuccessCount / Elapsed).toFixed(1) + " commit/s")}\n`
    );
    process.stdout.write(`${Divider}\n\n`);
};

const AskQuestion = (Rl, Question) =>
    new Promise(Resolve => {
        Rl.question(Question, Answer => Resolve(Answer.trim()));
    });

const AskPositiveInt = async (Rl, Question, Fallback) => {
    const Raw = await AskQuestion(Rl, Question);
    const Parsed = parseInt(Raw, 10);
    return !isNaN(Parsed) && Parsed > 0 ? Parsed : Fallback;
};

const Banner = [
    `      ________  ___ ___ ________    ____________________    `,
    `     /  _____/ /   |   \\\\_____  \\  /   _____/\\__    ___/    `,
    `    /   \\  ___/    ~    \\/   |   \\ \\_____  \\   |    |       `,
    `    \\    \\_\\  \\    Y    /    |    \\/        \\  |    |       `,
    `     \\______  /\\___|_  /\\_______  /_______  /  |____|       `,
    `            \\/       \\/         \\/        \\/                `,
    `                          COMMIT                            `
];

const PrintHeader = () => {
    process.stdout.write("\n");
    Banner.forEach(Line => process.stdout.write(Paint(C.Cyan, Line) + "\n"));
    process.stdout.write(`\n  ${Paint(C.Dim, "Author   :  @MatrixTM26")}`);
    process.stdout.write(`\n  ${Paint(C.Dim, "Version  :  2.0")}\n\n`);
};

const PrintMenu = () => {
    process.stdout.write(`  ${Paint(C.Yellow, "1")} - Commit by Years\n`);
    process.stdout.write(`  ${Paint(C.Yellow, "2")} - Commit by Month\n`);
    process.stdout.write(`  ${Paint(C.Red, "0")} - Exit\n\n`);
};

const Rl = createInterface({ input: process.stdin, output: process.stdout });

const Prompt = async () => {
    PrintMenu();

    const Choice = await AskQuestion(
        Rl,
        `  ${Paint(C.Dim, "::")} ${Paint(C.Cyan, "Option")} ${Paint(C.Yellow, ">")} `
    );

    if (Choice === "1") {
        const Years = await AskPositiveInt(
            Rl,
            `  ${Paint(C.Dim, "~")}${Paint(C.Cyan, "[Years Count]")} ${Paint(C.Yellow, ">")} `,
            1
        );
        const Total = await AskPositiveInt(
            Rl,
            `  ${Paint(C.Dim, "~")}${Paint(C.Cyan, "[Commit Count]")} ${Paint(C.Yellow, ">")} `,
            Config.TotalCommits
        );
        process.stdout.write(
            `\n  ${Paint(C.Green, "Mode:")} Commit by Years ${Paint(C.Dim, `(${Years}y, ${Total} commits)`)}\n`
        );
        const Now = new Date();
        const Past = new Date(Now);
        Past.setFullYear(Past.getFullYear() - Years);
        RunCommits(() => GenerateRandomDate(Past, Now), Total);
    } else if (Choice === "2") {
        const Months = await AskPositiveInt(
            Rl,
            `  ${Paint(C.Dim, "~")}${Paint(C.Cyan, "[Month Count]")} ${Paint(C.Yellow, ">")} `,
            1
        );
        const Total = await AskPositiveInt(
            Rl,
            `  ${Paint(C.Dim, "~")}${Paint(C.Cyan, "[Commit Count]")} ${Paint(C.Yellow, ">")} `,
            Config.TotalCommits
        );
        process.stdout.write(
            `\n  ${Paint(C.Green, "Mode:")} Commit by Month ${Paint(C.Dim, `(${Months}mo, ${Total} commits)`)}\n`
        );
        const Now = new Date();
        const Past = new Date(Now);
        Past.setMonth(Past.getMonth() - Months);
        RunCommits(() => GenerateRandomDate(Past, Now), Total);
    } else if (Choice === "0") {
        process.stdout.write(
            `\n  ${Paint(C.Yellow, "Bye, Have a nice day!")}\n\n`
        );
        Rl.close();
        process.exit(0);
    } else {
        process.stdout.write(
            `  ${Paint(C.Red, "Invalid option.")} Try again.\n\n`
        );
    }

    Prompt();
};

PrintHeader();
Prompt();
