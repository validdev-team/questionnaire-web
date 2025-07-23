module.exports = {
    buildAnswers: function (userContext, events, done) {
        const questions = userContext.vars.questionsData;
        const answers = {};

        for (const question of questions) {
            if (question.choices && Array.isArray(question.choices)) {
                const totalChoices = question.choices.length;

                // Random number between 1 and totalChoices
                const numToSelect = Math.floor(Math.random() * totalChoices) + 1;

                const selectedIndexes = new Set();
                while (selectedIndexes.size < numToSelect) {
                    const randomIndex = Math.floor(Math.random() * totalChoices);
                    selectedIndexes.add(randomIndex);
                }

                answers[question.id] = Array.from(selectedIndexes);
            }
        }

        userContext.vars.answers = answers;
        userContext.vars.timestamp = new Date().toISOString();
        return done();
    }
};