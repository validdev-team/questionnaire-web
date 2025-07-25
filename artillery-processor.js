module.exports = {
  generatePayload: function (userContext, events, done) {
    const questions = userContext.vars.questionsData;
    const answers = {};

    for (const question of questions) {
      const totalChoices = question.choices?.length || 0;
      if (totalChoices === 0) continue;

      const numToSelect = Math.floor(Math.random() * totalChoices) + 1;

      const selectedIndexes = new Set();
      while (selectedIndexes.size < numToSelect) {
        const randomIndex = Math.floor(Math.random() * totalChoices);
        selectedIndexes.add(randomIndex);
      }

      answers[question.id] = Array.from(selectedIndexes);
    }

    userContext.vars.payload = {
      answers,
      timestamp: new Date().toISOString()
    };

    return done();
  }
};