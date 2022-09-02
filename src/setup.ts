import { Quiz } from "./util/Quiz";

const quiz = new Quiz();

const narroving = async () => {
    const finish = () => {
        quiz.closePrompt();
        return Promise.resolve(1);
    }

    const definedCVSQuiz = {
        "github": quiz.github.bind(quiz),
        "bitbucket": quiz.bitbucket.bind(quiz),
        "gitlab": quiz.gitlab.bind(quiz),
    };

    const user_specified_cvs = await quiz.prompt(
        "Choose Control Version System(github/bitbucket/gitlab): ",
        (output: string | undefined) => {
            if (
                !output ||
                !Object.keys(definedCVSQuiz).includes(output!.toLocaleLowerCase())
            ) throw new Error("Uknown control version system. Try again.");
        }
    ) as keyof typeof definedCVSQuiz;

    await definedCVSQuiz[user_specified_cvs](true);

    await quiz.server(true, finish);
}

narroving()
    .then(() => console.log("branch-listener setup has been finished successfully."));
