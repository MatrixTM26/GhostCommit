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

const Color = {
    Reset: "\x1b[0m",
    Bold: "\x1b[1m",
    Dim: "\x1b[2m",
    Red: "\x1b[31m",
    Green: "\x1b[32m",
    Yellow: "\x1b[33m",
    Cyan: "\x1b[36m",
    White: "\x1b[37m",
    Magenta: "\x1b[35m"
};

const Paint = (Clr, Text) => `${Clr}${Text}${Color.Reset}`;

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

const Pad = Number_ => String(Number_).padStart(2, "0");

const FormatDate = DateObject =>
    `${DateObject.getFullYear()}-${Pad(DateObject.getMonth() + 1)}-${Pad(DateObject.getDate())}` +
    `T${Pad(DateObject.getHours())}:${Pad(DateObject.getMinutes())}:${Pad(DateObject.getSeconds())}+07:00`;

const GenerateRandomDate = (StartDate, EndDate) => {
    const RandomTime = StartDate.getTime() + Math.floor(Math.random() * (EndDate.getTime() - StartDate.getTime()));
    return FormatDate(new Date(RandomTime));
};

const GenerateRandomTimeOnDate = TargetDate => {
    const Start = new Date(TargetDate);
    Start.setHours(0, 0, 0, 0);
    const End = new Date(TargetDate);
    End.setHours(23, 59, 59, 999);
    return FormatDate(new Date(Start.getTime() + Math.floor(Math.random() * (End.getTime() - Start.getTime()))));
};

const ParseSpecificDate = Input => {
    const Pattern = /^(\d{4})-(\d{2})-(\d{2})$/;
    const Match = Input.match(Pattern);
    if (!Match) return null;

    const Year = parseInt(Match[1], 10);
    const Month = parseInt(Match[2], 10);
    const Day = parseInt(Match[3], 10);

    if (Month < 1 || Month > 12) return null;
    if (Day < 1 || Day > 31) return null;

    const Parsed = new Date(Year, Month - 1, Day);
    if (
        Parsed.getFullYear() !== Year ||
        Parsed.getMonth() !== Month - 1 ||
        Parsed.getDate() !== Day
    ) return null;

    const Now = new Date();
    Now.setHours(23, 59, 59, 999);
    if (Parsed > Now) return null;

    return Parsed;
};

const ProgressBar = (Current, Total, Width = 40) => {
    const Percentage = Current / Total;
    const Filled = Math.round(Percentage * Width);
    const Bar = Paint(Color.Cyan, "█".repeat(Filled)) + Paint(Color.Dim, "▒".repeat(Width - Filled));
    const PercentLabel = Paint(Color.Yellow, (Percentage * 100).toFixed(1).padStart(5) + "%");
    const Counter = Paint(Color.Dim, `(${Current}/${Total})`);
    process.stdout.write(`\r  [${Bar}] ${PercentLabel} ${Counter}`);
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
        } catch (Error_) {
            if (Attempt === Config.RetryAttempts) {
                process.stderr.write(
                    `\n  ${Paint(Color.Red, "FAIL")} commit #${Index + 1} after ${Config.RetryAttempts}x: ${Error_.message}\n`
                );
                throw Error_;
            }
        }
    }
};

const RunCommits = (DateGenerator, Total) => {
    try {
        Git(["rev-parse", "--is-inside-work-tree"]);
    } catch {
        process.stderr.write(
            `  ${Paint(Color.Red, "Not a git repository.")} Run 'git init' first.\n`
        );
        process.exit(1);
    }

    let SuccessCount = 0;
    let FailCount = 0;
    const StartTime = Date.now();

    process.stdout.write("\n");

    for (let Index = 0; Index < Total; Index++) {
        try {
            MakeCommitWithRetry(Index, DateGenerator);
            SuccessCount++;
        } catch {
            FailCount++;
        }
        ProgressBar(Index + 1, Total);
    }

    process.stdout.write("\n\n");

    if (Config.PushAfterAll) {
        process.stdout.write(`  ${Paint(Color.Cyan, "Pushing...")}\n`);
        try {
            Git(["push"]);
            process.stdout.write(`  ${Paint(Color.Green, "Push OK")}\n\n`);
        } catch (Error_) {
            process.stderr.write(`  ${Paint(Color.Red, "Push failed:")} ${Error_.message}\n`);
            process.stderr.write(`  Run ${Paint(Color.Yellow, "'git push'")} manually.\n\n`);
        }
    }

    const Elapsed = ((Date.now() - StartTime) / 1000).toFixed(1);
    const Divider = Paint(Color.Dim, "─".repeat(40));

    process.stdout.write(`${Divider}\n`);
    process.stdout.write(`  ${Paint(Color.White, "Success")} : ${Paint(Color.Green, String(SuccessCount))} commits\n`);
    if (FailCount > 0) {
        process.stdout.write(`  ${Paint(Color.White, "Failed")}  : ${Paint(Color.Red, String(FailCount))} commits\n`);
    }
    process.stdout.write(`  ${Paint(Color.White, "Time")}    : ${Paint(Color.Yellow, Elapsed + "s")}\n`);
    process.stdout.write(`  ${Paint(Color.White, "Speed")}   : ${Paint(Color.Cyan, (SuccessCount / Elapsed).toFixed(1) + " commit/s")}\n`);
    process.stdout.write(`${Divider}\n\n`);
};

const AskQuestion = (ReadlineInterface, Question) =>
    new Promise(Resolve => {
        ReadlineInterface.question(Question, Answer => Resolve(Answer.trim()));
    });

const AskPositiveInt = async (ReadlineInterface, Question, Fallback) => {
    const RawInput = await AskQuestion(ReadlineInterface, Question);
    const Parsed = parseInt(RawInput, 10);
    return !isNaN(Parsed) && Parsed > 0 ? Parsed : Fallback;
};

const AskDateInput = async (ReadlineInterface, Question) => {
    while (true) {
        const RawInput = await AskQuestion(ReadlineInterface, Question);
        const Parsed = ParseSpecificDate(RawInput);
        if (Parsed) return Parsed;
        process.stdout.write(
            `  ${Paint(Color.Red, "Invalid date.")} Use format YYYY-MM-DD and must not be in the future.\n`
        );
    }
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
    Banner.forEach(Line => process.stdout.write(Paint(Color.Cyan, Line) + "\n"));
    process.stdout.write(`\n  ${Paint(Color.Dim, "Author   :  @MatrixTM26")}`);
    process.stdout.write(`\n  ${Paint(Color.Dim, "Version  :  3.0")}\n\n`);
};

const PrintMenu = () => {
    process.stdout.write(`  ${Paint(Color.Yellow, "1")} ${Paint(Color.Dim, "─")} Commit by Years\n`);
    process.stdout.write(`  ${Paint(Color.Yellow, "2")} ${Paint(Color.Dim, "─")} Commit by Month\n`);
    process.stdout.write(`  ${Paint(Color.Yellow, "3")} ${Paint(Color.Dim, "─")} Commit by Week\n`);
    process.stdout.write(`  ${Paint(Color.Yellow, "4")} ${Paint(Color.Dim, "─")} Commit by Day\n`);
    process.stdout.write(`  ${Paint(Color.Yellow, "5")} ${Paint(Color.Dim, "─")} Commit on Specific Date\n`);
    process.stdout.write(`  ${Paint(Color.Red, "0")} ${Paint(Color.Dim, "─")} Exit\n\n`);
};

const ReadlineInterface = createInterface({ input: process.stdin, output: process.stdout });

const PromptInput = `  ${Paint(Color.Dim, "::")} ${Paint(Color.Cyan, "Option")} ${Paint(Color.Yellow, ">")} `;
const PromptCount = Label => `  ${Paint(Color.Dim, "~")}${Paint(Color.Cyan, `[${Label}]`)} ${Paint(Color.Yellow, ">")} `;

const HandleYears = async () => {
    const Years = await AskPositiveInt(ReadlineInterface, PromptCount("Years Count"), 1);
    const Total = await AskPositiveInt(ReadlineInterface, PromptCount("Commit Count"), Config.TotalCommits);
    process.stdout.write(`\n  ${Paint(Color.Green, "Mode:")} Commit by Years ${Paint(Color.Dim, `(${Years}y, ${Total} commits)`)}\n`);
    const Now = new Date();
    const Past = new Date(Now);
    Past.setFullYear(Past.getFullYear() - Years);
    RunCommits(() => GenerateRandomDate(Past, Now), Total);
};

const HandleMonth = async () => {
    const Months = await AskPositiveInt(ReadlineInterface, PromptCount("Month Count"), 1);
    const Total = await AskPositiveInt(ReadlineInterface, PromptCount("Commit Count"), Config.TotalCommits);
    process.stdout.write(`\n  ${Paint(Color.Green, "Mode:")} Commit by Month ${Paint(Color.Dim, `(${Months}mo, ${Total} commits)`)}\n`);
    const Now = new Date();
    const Past = new Date(Now);
    Past.setMonth(Past.getMonth() - Months);
    RunCommits(() => GenerateRandomDate(Past, Now), Total);
};

const HandleWeek = async () => {
    const Weeks = await AskPositiveInt(ReadlineInterface, PromptCount("Week Count"), 1);
    const Total = await AskPositiveInt(ReadlineInterface, PromptCount("Commit Count"), Config.TotalCommits);
    process.stdout.write(`\n  ${Paint(Color.Green, "Mode:")} Commit by Week ${Paint(Color.Dim, `(${Weeks}wk, ${Total} commits)`)}\n`);
    const Now = new Date();
    const Past = new Date(Now);
    Past.setDate(Past.getDate() - Weeks * 7);
    RunCommits(() => GenerateRandomDate(Past, Now), Total);
};

const HandleDay = async () => {
    const Days = await AskPositiveInt(ReadlineInterface, PromptCount("Day Count"), 1);
    const Total = await AskPositiveInt(ReadlineInterface, PromptCount("Commit Count"), Config.TotalCommits);
    process.stdout.write(`\n  ${Paint(Color.Green, "Mode:")} Commit by Day ${Paint(Color.Dim, `(${Days}d, ${Total} commits)`)}\n`);
    const Now = new Date();
    const Past = new Date(Now);
    Past.setDate(Past.getDate() - Days);
    RunCommits(() => GenerateRandomDate(Past, Now), Total);
};

const HandleSpecificDate = async () => {
    const TargetDate = await AskDateInput(
        ReadlineInterface,
        `  ${Paint(Color.Dim, "~")}${Paint(Color.Cyan, "[Date YYYY-MM-DD]")} ${Paint(Color.Yellow, ">")} `
    );
    const Total = await AskPositiveInt(ReadlineInterface, PromptCount("Commit Count"), Config.TotalCommits);
    const DateLabel = `${TargetDate.getFullYear()}-${Pad(TargetDate.getMonth() + 1)}-${Pad(TargetDate.getDate())}`;
    process.stdout.write(`\n  ${Paint(Color.Green, "Mode:")} Specific Date ${Paint(Color.Dim, `(${DateLabel}, ${Total} commits)`)}\n`);
    RunCommits(() => GenerateRandomTimeOnDate(TargetDate), Total);
};

const MenuHandlers = {
    "1": HandleYears,
    "2": HandleMonth,
    "3": HandleWeek,
    "4": HandleDay,
    "5": HandleSpecificDate
};

const Prompt = async () => {
    PrintMenu();

    const Choice = await AskQuestion(ReadlineInterface, PromptInput);

    if (Choice === "0") {
        process.stdout.write(`\n  ${Paint(Color.Yellow, "Bye, Have a nice day!")}\n\n`);
        ReadlineInterface.close();
        process.exit(0);
    }

    const Handler = MenuHandlers[Choice];

    if (Handler) {
        await Handler();
    } else {
        process.stdout.write(`  ${Paint(Color.Red, "Invalid option.")} Try again.\n\n`);
    }

    Prompt();
};

PrintHeader();
Prompt();
