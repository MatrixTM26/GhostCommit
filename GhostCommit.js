import { writeFile } from "fs/promises";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import { fileURLToPath } from "url";

const ExecAsync = promisify(exec);
const Dirname = path.dirname(fileURLToPath(import.meta.url));

const Config = {
    TotalCommits: 500,
    DataFile: "./Logs.json",
    YearOffset: 1,
    MaxWeekSpread: 52,
    MaxDaySpread: 6,
    DelayBetweenCommits: 50,
    RetryAttempts: 3,
    RetryDelay: 500,
    BatchSize: 10,
    PushAfterAll: true,
    Verbose: false
};

const Sleep = Ms => new Promise(Resolve => setTimeout(Resolve, Ms));

const RandomInt = (Min, Max) =>
    Math.floor(Math.random() * (Max - Min + 1)) + Min;

const FormatDate = Date =>
    Date.toISOString().replace("T", " ").slice(0, 19) + " +0700";

const GenerateDate = () => {
    const Base = new Date();
    Base.setFullYear(Base.getFullYear() - Config.YearOffset);
    Base.setDate(
        Base.getDate() +
            1 +
            RandomInt(0, Config.MaxWeekSpread) * 7 +
            RandomInt(0, Config.MaxDaySpread)
    );
    return FormatDate(Base);
};

const ProgressBar = (Current, Total, Width = 40) => {
    const Pct = Current / Total;
    const Filled = Math.round(Pct * Width);
    const Bar = "█".repeat(Filled) + "░".repeat(Width - Filled);
    const Percent = (Pct * 100).toFixed(1).padStart(5);
    process.stdout.write(`\r  [${Bar}] ${Percent}% (${Current}/${Total})`);
};

const RunGit = async Args => {
    const { stdout } = await ExecAsync(`git ${Args}`, {
        cwd: Dirname,
        maxBuffer: 1024 * 1024 * 10
    });
    return stdout.trim();
};

const MakeCommit = async Index => {
    const Date = GenerateDate();
    await writeFile(
        path.resolve(Dirname, Config.DataFile),
        JSON.stringify({ Date, Index }, null, 2),
        "utf8"
    );
    await RunGit(`add "${Config.DataFile}"`);
    await RunGit(
        `commit --allow-empty-message -m "${Date}" --date="${Date}" --no-verify`
    );
    if (Config.Verbose) console.log(`\n  ✔ commit #${Index + 1} → ${Date}`);
};

const MakeCommitWithRetry = async Index => {
    for (let Attempt = 1; Attempt <= Config.RetryAttempts; Attempt++) {
        try {
            await MakeCommit(Index);
            return;
        } catch (Err) {
            if (Attempt === Config.RetryAttempts) {
                console.error(
                    `\n  ✘ Commit #${Index + 1} gagal setelah ${Config.RetryAttempts}x: ${Err.message}`
                );
                throw Err;
            }
            if (Config.Verbose)
                console.warn(
                    `\n  ⚠ Commit #${Index + 1} retry ${Attempt}/${Config.RetryAttempts}`
                );
            await Sleep(Config.RetryDelay * Attempt);
        }
    }
};

const Run = async () => {
    console.log("\n🚀 Auto Commit - Advanced Mode");
    console.log(`   Total commits : ${Config.TotalCommits}`);
    console.log(`   Batch size    : ${Config.BatchSize}`);
    console.log(`   Delay         : ${Config.DelayBetweenCommits}ms/commit`);
    console.log(
        `   Push strategy : ${Config.PushAfterAll ? "sekali di akhir" : "per batch"}\n`
    );

    try {
        await RunGit("rev-parse --is-inside-work-tree");
    } catch {
        console.error("  ✘ Bukan git repository! Jalankan 'git init' dulu.");
        process.exit(1);
    }

    let SuccessCount = 0;
    let FailCount = 0;
    const StartTime = Date.now();

    for (let I = 0; I < Config.TotalCommits; I++) {
        try {
            await MakeCommitWithRetry(I);
            SuccessCount++;

            if (!Config.PushAfterAll && (I + 1) % Config.BatchSize === 0) {
                await RunGit("push");
                if (Config.Verbose)
                    console.log(
                        `\n  📤 Pushed batch ${Math.ceil((I + 1) / Config.BatchSize)}`
                    );
            }
        } catch {
            FailCount++;
        }

        ProgressBar(I + 1, Config.TotalCommits);
        if (I < Config.TotalCommits - 1)
            await Sleep(Config.DelayBetweenCommits);
    }

    console.log("\n\n  📤 Pushing ke remote...");
    try {
        await RunGit("push");
        console.log("  ✔ Push berhasil!\n");
    } catch (Err) {
        console.error(`  ✘ Push gagal: ${Err.message}`);
        console.log("  💡 Coba jalankan 'git push' manual.\n");
    }

    const Elapsed = ((Date.now() - StartTime) / 1000).toFixed(1);
    console.log("─".repeat(50));
    console.log(`  ✅ Sukses  : ${SuccessCount} commit`);
    if (FailCount > 0) console.log(`  ❌ Gagal   : ${FailCount} commit`);
    console.log(`  ⏱ Durasi  : ${Elapsed}s`);
    console.log(
        `  ⚡ Speed   : ${(SuccessCount / Elapsed).toFixed(1)} commit/s`
    );
    console.log("─".repeat(50) + "\n");
};

Run().catch(Err => {
    console.error("\n💥 Fatal error:", Err.message);
    process.exit(1);
});
