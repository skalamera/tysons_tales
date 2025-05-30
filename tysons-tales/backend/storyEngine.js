// skalamera/tysons_tales/tysons_tales-main/tysons-tales/backend/storyEngine.js
// Remove or comment out Gemini-specific imports if no longer used for text
// const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
const OpenAI = require('openai'); // Already imported for DALL-E

// Ensure API keys are loaded (typically in server.js via dotenv)
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Safety settings for Gemini are not applicable here, OpenAI has its own moderation

class StoryEngine {
    constructor(character) {
        this.character = character;
        this.pronouns = this._getPronouns(character.gender);
    }

    _getPronouns(gender) {
        // ... (your existing _getPronouns logic remains the same)
        if (gender === 'boy') {
            return { subject: 'he', object: 'him', possessive: 'his', reflexive: 'himself', Subject: 'He', Possessive: 'His' };
        } else if (gender === 'girl') {
            return { subject: 'she', object: 'her', possessive: 'her', reflexive: 'herself', Subject: 'She', Possessive: 'Her' };
        } else {
            return { subject: 'they', object: 'them', possessive: 'their', reflexive: 'themself', Subject: 'They', Possessive: 'Their' };
        }
    }

    // This prompt construction is now geared towards OpenAI's chat completion
    _constructOpenAIPromptMessages(theme, previousContext = "") {
        const systemMessage = `You are a storyteller creating a personalized, interactive 'choose your own adventure' story for a child.
The main character is ${this.character.name}, a ${this.character.gender} who is a ${this.character.role}.
${this.character.name}'s personality traits are: ${this.character.personalities.join(', ')}.
${this.character.favorite_color ? `${this.character.name}'s favorite color is ${this.character.favorite_color}.` : ''}
${this.character.favorite_animal ? `${this.character.name}'s favorite animal is ${this.character.favorite_animal}. This animal could be a friend or guide.` : ''}
The story theme is: ${theme}.
The story should be engaging, positive, and age-appropriate for a young child (around 4-8 years old).
Use simple language. Incorporate ${this.character.name}'s name, role, and personality into the narrative. Use correct pronouns: ${this.pronouns.subject}/${this.pronouns.object}/${this.pronouns.possessive}.
Your response MUST be a valid JSON object with the following keys: "story_text", "choices" (an array of objects with "text" and "next_prompt_context"), and "illustration_prompt" (a detailed prompt for DALL-E for a children's book style illustration).`;

        const userMessage = `${previousContext}

Please provide the next part of the story for ${this.character.name}.
Include 2 to 3 choices for the user.
And provide a detailed visual prompt for DALL-E for this scene, in a vibrant, friendly children's book style.
Return your entire response as a single JSON object.`;

        return [
            { role: "system", content: systemMessage },
            { role: "user", content: userMessage }
        ];
    }

    async _generateStorySegmentWithOpenAI(theme, previousContext = "") {
        const messages = this._constructOpenAIPromptMessages(theme, previousContext);
        console.log("Sending prompt to OpenAI:", JSON.stringify(messages, null, 2));

        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo-1106", // Or "gpt-4-turbo-preview", "gpt-4" etc.
                // gpt-3.5-turbo-1106 is good for forcing JSON output.
                messages: messages,
                response_format: { type: "json_object" }, // For models that support JSON mode
            });

            const content = completion.choices[0].message.content;
            console.log("Received from OpenAI:", content);
            if (content) {
                return JSON.parse(content);
            } else {
                throw new Error("OpenAI returned empty content.");
            }
        } catch (error) {
            console.error("Error generating story segment with OpenAI:", error.response ? error.response.data : error.message);
            // Fallback structure
            return {
                story_text: `Once upon a time, ${this.character.name} the ${this.character.role} wanted an adventure, but the storyteller was napping! Try again?`,
                choices: [{ text: "Wake up the storyteller (try again)", next_prompt_context: "Let's restart this part of the story." }],
                illustration_prompt: `A whimsical drawing of ${this.character.name} looking sleepy, children's book style.`
            };
        }
    }

    async _generateImageWithDalle(promptForDalle) {
        // ... (your existing _generateImageWithDalle logic remains the same)
        console.log("Attempting to generate image with DALL-E using prompt:", promptForDalle);
        try {
            const response = await openai.images.generate({
                model: "dall-e-3",
                prompt: promptForDalle,
                n: 1,
                size: "1024x1024",
                quality: "standard",
                response_format: "url",
            });
            if (response.data && response.data[0] && response.data[0].url) {
                console.log("DALL-E image URL:", response.data[0].url);
                return response.data[0].url;
            } else {
                throw new Error("DALL-E response did not contain an image URL.");
            }
        } catch (error) {
            console.error("Error generating image with DALL-E:", error.response ? error.response.data : error.message);
            return `https://via.placeholder.com/512x512/FF0000/FFFFFF?text=DALL-E+Error`;
        }
    }

    async getInitialStoryNode(theme) {
        const initialOpenAIPromptContext = `The story is just beginning for ${this.character.name}. Set the scene for their adventure in the world of ${theme}.`;
        const openAIResponse = await this._generateStorySegmentWithOpenAI(theme, initialOpenAIPromptContext);

        const imageUrl = await this._generateImageWithDalle(openAIResponse.illustration_prompt);

        return {
            story_text: openAIResponse.story_text,
            illustration_prompt: openAIResponse.illustration_prompt,
            illustration_url: imageUrl,
            choices: openAIResponse.choices.map(choice => ({
                text: choice.text,
                next_node_id: choice.next_prompt_context // This context will be used for the next OpenAI call
            })),
            current_node_id: theme + "_start_openai_dalle"
        };
    }

    async getNextStoryNode(theme, choiceContext) {
        const openAIResponse = await this._generateStorySegmentWithOpenAI(theme, `Previously, ${this.character.name} decided to: "${choiceContext}". Now, continue the story.`);

        const imageUrl = await this._generateImageWithDalle(openAIResponse.illustration_prompt);

        return {
            story_text: openAIResponse.story_text,
            illustration_prompt: openAIResponse.illustration_prompt,
            illustration_url: imageUrl,
            choices: openAIResponse.choices.map(choice => ({
                text: choice.text,
                next_node_id: choice.next_prompt_context
            })),
            current_node_id: theme + "_continue_openai_dalle"
        };
    }
}

module.exports = StoryEngine;