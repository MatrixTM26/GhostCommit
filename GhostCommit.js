// GhostCommit
// AUTHOR : XTM26
// GITHUB : https://github.com/XTM26

import jsonfile from "jsonfile";
import moment from "moment";
import simpleGit from "simple-git";
import random from "random";

const FilePath = "./Data.json";
const Git = simpleGit();

// base Datetime (years ago)
let BaseDate = moment().subtract(2, "year");

// helper delay
const Sleep = ms => new Promise(r => setTimeout(r, ms));

const CreateCommits = async n => {
    if (n <= 0) {
        await Git.push();
        return;
    }

    // going up to 1–3 days
    const Steps = random.int(1, 1);
    BaseDate = BaseDate.add(Steps, "days");

    const Datetime = BaseDate.format();

    console.log(Datetime);

    const Data = { Datetime };

    await jsonfile.writeFile(FilePath, Data);

    await Git.add([FilePath]);
    await Git.commit(Datetime, { "--date": Datetime });

    // a small delay to avoid process kill (9)
    await Sleep(300);

    await CreateCommits(n - 1);
};

// Run the commit
CreateCommits(500);
