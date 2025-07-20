module.exports = {
    generateAnswers
};

function generateAnswers(requestParams, context, ee, next) {
    // Retrieve the list of questions from context variables
    const questions = context.vars.questions;

    // Initialize an object to hold the generated answers
    const answers = {};

    // Check if questions exist and are in array format
    if (questions && Array.isArray(questions)) {
        // Loop through each question
        questions.forEach(question => {
            // Ensure the question has a 'choices' array
            if (question.choices && Array.isArray(question.choices)) {
                // Generate a random number between 1 and 3 (inclusive) for how many choices to select
                const numChoices = Math.floor(Math.random() * 3) + 1;
                const selectedChoices = [];

                // Randomly select unique choices
                for (let i = 0; i < numChoices; i++) {
                    const randomChoice = Math.floor(Math.random() * question.choices.length);

                    // Only add the choice if it hasn't already been selected
                    if (!selectedChoices.includes(randomChoice)) {
                        selectedChoices.push(randomChoice);
                    }
                }

                // Store selected choice indexes for the question using its ID
                answers[question.id] = selectedChoices;
            }
        });
    }

    // Store the generated answers in context for future use
    context.vars.answers = answers;

    // Store a timestamp of when the answers were generated
    context.vars.timestamp = new Date().toISOString();

    // Proceed to the next function in the pipeline
    return next();
}
