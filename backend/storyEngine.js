const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Loaded by dotenv in server.js
});

class StoryEngine {
    constructor(character) { // storyTemplates is no longer needed here
        this.character = character;
        this.pronouns = this._getPronouns(character.gender);
    }

    _getPronouns(gender) {
        // Your existing _getPronouns logic is fine
        if (gender === 'boy') {
            return { subject: 'he', object: 'him', possessive: 'his', reflexive: 'himself', Subject: 'He', Possessive: 'His' };
        } else if (gender === 'girl') {
            return { subject: 'she', object: 'her', possessive: 'her', reflexive: 'herself', Subject: 'She', Possessive: 'Her' };
        } else {
            return { subject: 'they', object: 'them', possessive: 'their', reflexive: 'themself', Subject: 'They', Possessive: 'Their' };
        }
    }

    _getThemeDescription(theme) {
        const themeDescriptions = {
            'fantasy': 'Set in a magical kingdom with castles, dragons, wizards, and enchanted forests. Include elements like magic spells, royal quests, and mythical creatures.',
            'space': 'Set in outer space with planets, spaceships, alien friends, and cosmic adventures. Include elements like zero gravity, star systems, and intergalactic travel.',
            'forest': 'Set in a mysterious woodland with talking animals, hidden pathways, and nature magic. Include elements like ancient trees, forest creatures, and natural wonders.',
            'ocean': 'Set underwater in the ocean with colorful coral reefs, sea creatures, and underwater cities. Include elements like submarines, mermaids, and ocean treasures.',
            'timetravel': 'Set across different time periods with time machines, historical figures, and temporal paradoxes. Include elements like dinosaur ages, future cities, and time portals.',
            'vehicles': 'Set in a world where vehicles are alive and can talk. Include friendly cars, trucks, construction vehicles, trains, and airplanes having adventures on roads, construction sites, and airports.',
            'dinosaurs': 'Set in prehistoric times or a land where dinosaurs still exist. Include friendly dinosaurs like T-Rex, Triceratops, and Pterodactyls as characters in jungle and volcanic landscapes.',
            'pirates': 'Set on the high seas with pirate ships, treasure maps, and island adventures. Include elements like parrots, treasure chests, and friendly sea battles.',
            'superhero': 'Set in a modern city where the character has special powers. Include elements like saving people, fighting (gentle) villains, and using superpowers for good.',
            'magic_school': 'Set in a school where students learn magic. Include elements like spell classes, magical creatures as pets, flying broomsticks, and enchanted classrooms.',
            'safari': 'Set in the African savanna with lions, elephants, giraffes, and zebras. Include elements like safari vehicles, watering holes, and animal migrations.',
            'candyland': 'Set in a world made entirely of candy and sweets. Include chocolate rivers, gummy bear citizens, candy cane forests, and ice cream mountains.',
            'robots': 'Set in a futuristic world or factory with friendly robots. Include elements like robot assembly, circuits, gears, and helpful robot companions.',
            'fairytale': 'Set in classic storybook lands with familiar fairytale elements. Include elements like enchanted cottages, magical beans, fairy godmothers, and talking mirrors.',
            'arctic': 'Set in the Arctic or Antarctic with snow, ice, and polar animals. Include elements like igloos, Northern Lights, penguins, polar bears, and ice fishing.'
        };

        return themeDescriptions[theme] || `Set in a world themed around ${theme}. Be creative and include appropriate elements for this theme.`;
    }

    // No longer using _personalizeText as AI will handle personalization based on the prompt.
    // The AI prompt will contain all personalization details.

    _constructOpenAIPromptMessages(theme, previousContext = "") {
        // Using more detailed information from the character object passed to constructor
        const characterDetails = `The main character is ${this.character.name || 'Hero'}, a ${this.character.gender || 'child'} who is ${this.character.age} years old. Their role in this story is a ${this.character.role || 'brave adventurer'}.
        ${this.character.name}'s personality traits are: ${(this.character.personalities && this.character.personalities.length > 0) ? this.character.personalities.join(', ') : 'curious and kind'}.
        ${this.character.favorite_color ? `${this.character.name}'s favorite color is ${this.character.favorite_color}. Try to weave this color into the story or illustration if appropriate.` : ''}
        ${this.character.favorite_animal ? `${this.character.name}'s favorite animal is ${this.character.favorite_animal}. This animal could make an appearance as a friend, guide, or creature encountered.` : ''}`;

        // NEVER show the character in illustrations
        const illustrationStyle = "Children's book illustration in a modern, animated style with clean lines and vibrant colors. The art should be whimsical and engaging, suitable for young readers.";

        // Age-appropriate content guidelines
        const ageGuidelines = this._getAgeAppropriateGuidelines();

        const themeDescription = this._getThemeDescription(theme);

        const systemMessage = `You are a creative and engaging storyteller for children.
        ${characterDetails}
        ${ageGuidelines}
        The story theme is: ${theme}.
        
        IMPORTANT THEME GUIDANCE: ${themeDescription}
        
        The story should be positive, magical, and age-appropriate, written in simple, easy-to-understand language.
        Incorporate ${this.character.name}'s characteristics naturally into the narrative. Use correct pronouns based on their gender (${this.pronouns.subject}/${this.pronouns.object}/${this.pronouns.possessive}).
        
        CRITICAL: The story MUST be set in the ${theme} world as described above. Do NOT default to generic forest or fantasy settings unless that is the specific theme.
        
        Your response MUST be a single, valid JSON object. Do not include any text outside of this JSON object.
        The JSON object must have the following keys:
        1.  "title": A creative, engaging title for this story (5-8 words). Should be exciting and capture the essence of the adventure. Do not include the character's name in the title.
        2.  "story_text": A string containing the next paragraph of the story (2-4 sentences).
        3.  "choices": An array of 2 or 3 choice objects. Each choice object must have:
            a.  "text": A string for the choice presented to the user (e.g., "Explore the sparkling cave").
            b.  "next_prompt_context": A brief string describing the essence of this choice, which will be used to inform the next part of the story if this choice is selected (e.g., "chose to explore the cave").
        4.  "illustration_prompt": A detailed, descriptive prompt (around 30-60 words) for DALL-E to generate a vibrant, friendly, and safe children's book style illustration for the current story scene. 
        
        CRITICAL RULE FOR ILLUSTRATIONS: You MUST NOT include ${this.character.name} or any reference to the main character in the illustration prompt. Do NOT mention their face, body, expressions, or any part of them. Focus ONLY on the environment, setting, objects, creatures, and atmosphere. For example, instead of "Show the excitement on ${this.character.name}'s face", write "Show the magical glowing crystal floating in the air with swirling energy around it". ${illustrationStyle}`;

        const userMessageContent = previousContext ?
            `Continue the story based on the previous choice: "${previousContext}". What happens next?` :
            `Start the adventure for ${this.character.name}! Set the scene.`;

        return [
            { role: "system", content: systemMessage },
            { role: "user", content: userMessageContent }
        ];
    }

    _getAgeAppropriateGuidelines() {
        const age = this.character.age;
        if (age <= 4) {
            return `This story is for very young children (ages 3-4). Keep the following in mind:
            - Use very simple vocabulary and short sentences
            - Focus on basic concepts like colors, shapes, and simple emotions
            - Include lots of repetition and familiar patterns
            - Keep the story very gentle and reassuring
            - Avoid any scary or complex situations
            - Use simple, clear choices that are easy to understand`;
        } else if (age <= 7) {
            return `This story is for young children (ages 5-7). Keep the following in mind:
            - Use simple but varied vocabulary
            - Include basic problem-solving elements
            - Focus on friendship, kindness, and simple moral lessons
            - Keep the story light and fun
            - Include some gentle challenges that can be easily overcome
            - Use clear choices that help develop decision-making skills`;
        } else if (age <= 10) {
            return `This story is for older children (ages 8-10). Keep the following in mind:
            - Use more complex vocabulary and sentence structures
            - Include more sophisticated problem-solving
            - Focus on character development and personal growth
            - Can include mild challenges and conflicts
            - Include some educational elements and interesting facts
            - Use choices that encourage critical thinking`;
        } else {
            return `This story is for pre-teens (ages 11+). Keep the following in mind:
            - Use more sophisticated language and concepts
            - Include complex problem-solving and character development
            - Focus on personal growth and meaningful challenges
            - Can include more nuanced moral situations
            - Include educational elements and interesting facts
            - Use choices that encourage deeper thinking and personal values`;
        }
    }

    _getCharacterAppearance() {
        // Define consistent appearance based on role and gender
        const baseAppearance = `${this.character.gender === 'boy' ? 'young Caucasian boy' : this.character.gender === 'girl' ? 'young Caucasian girl' : 'young Caucasian child'} named ${this.character.name} with fair skin, light hair, and bright eyes`;

        // Add role-specific appearance details
        let roleAppearance = '';
        switch (this.character.role.toLowerCase()) {
            case 'knight':
                roleAppearance = `wearing a ${this.character.favorite_color || 'silver'} armor with a matching cape`;
                break;
            case 'astronaut':
                roleAppearance = `in a ${this.character.favorite_color || 'white'} space suit with a matching helmet`;
                break;
            case 'detective':
                roleAppearance = `wearing a ${this.character.favorite_color || 'brown'} trench coat and a matching hat`;
                break;
            case 'wizard':
                roleAppearance = `wearing a ${this.character.favorite_color || 'blue'} wizard robe with stars and moons`;
                break;
            case 'pirate':
                roleAppearance = `wearing a ${this.character.favorite_color || 'black'} pirate hat and a matching eye patch`;
                break;
            default:
                roleAppearance = `wearing a ${this.character.favorite_color || 'colorful'} outfit`;
        }

        // Add personality-based expression
        const personalityExpression = this.character.personalities?.includes('brave') ? 'with a confident smile' :
            this.character.personalities?.includes('shy') ? 'with a gentle smile' :
                this.character.personalities?.includes('curious') ? 'with an excited expression' :
                    'with a friendly smile';

        return `${baseAppearance}, ${roleAppearance}, ${personalityExpression}`;
    }

    async _generateStorySegmentWithOpenAI(theme, previousContext = "") {
        const messages = this._constructOpenAIPromptMessages(theme, previousContext);
        console.log("Sending prompt to OpenAI:", JSON.stringify(messages, null, 2));

        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-4o-mini", // Updated to use GPT-4o-mini
                messages: messages,
                response_format: { type: "json_object" },
                temperature: 0.7, // Adjust for creativity
            });

            const content = completion.choices[0].message.content;
            console.log("Received from OpenAI:", content);
            if (content) {
                return JSON.parse(content); // Expecting a JSON string
            } else {
                throw new Error("OpenAI returned empty content.");
            }
        } catch (error) {
            console.error("Error generating story segment with OpenAI:", error.response ? error.response.data : error.message);
            return { // Fallback in case of error
                title: "The Magical Storybook",
                story_text: `Oh dear! ${this.character.name} the ${this.character.role} opened the storybook, but the pages were blank! Maybe try starting a new adventure?`,
                choices: [{ text: "Start a new adventure", next_prompt_context: "User wants to start a new adventure after an error." }],
                illustration_prompt: `A blank, open storybook with magical sparkles around it, waiting for an adventure to begin. Whimsical children's art style.`
            };
        }
    }

    async _generateImageWithDalle(promptForDalle) {
        // Filter out any character references that might have slipped through
        const characterName = this.character.name;
        const filteredPrompt = promptForDalle
            .replace(new RegExp(`\\b${characterName}\\b`, 'gi'), '')
            .replace(/\b(the main character|our hero|the protagonist)\b/gi, '')
            .replace(/\b(his|her|their) (face|expression|eyes|smile)\b/gi, '')
            .replace(/\s+/g, ' ')
            .trim();

        console.log("Original DALL-E prompt:", promptForDalle);
        console.log("Filtered DALL-E prompt:", filteredPrompt);

        try {
            const response = await openai.images.generate({
                model: "dall-e-3",
                prompt: filteredPrompt + " Children's book illustration style.", // Ensure we always have the style
                n: 1,
                size: "1024x1024", // DALL-E 3 preferred size
                quality: "standard", // or "hd"
                response_format: "url",
            });
            if (response.data && response.data[0] && response.data[0].url) {
                console.log("DALL-E image URL:", response.data[0].url);
                return response.data[0].url;
            } else {
                throw new Error("DALL-E response did not contain an image URL or data.");
            }
        } catch (error) {
            console.error("Error generating image with DALL-E:", error.response ? error.response.data : error.message);
            // Fallback placeholder image URL
            return `https://via.placeholder.com/512x512/FF0000/FFFFFF?text=Image+Gen+Error`;
        }
    }

    async getInitialStoryNode(theme) {
        // No previous context for the initial node
        const openAIResponse = await this._generateStorySegmentWithOpenAI(theme);

        if (!openAIResponse || !openAIResponse.illustration_prompt) {
            console.error("Failed to get valid response from OpenAI for initial node.");
            // Handle this error appropriately, perhaps return a default error node
            return {
                title: "The Magical Storybook",
                story_text: "Oops! The storyteller seems to be on a break. Please try again later.",
                choices: [],
                illustration_prompt: "A friendly 'try again later' sign in a storybook style.",
                illustration_url: "https://via.placeholder.com/512x512/CCCCCC/000000?text=Error+Starting+Story",
                current_node_id: theme + "_error_start"
            };
        }
        const imageUrl = await this._generateImageWithDalle(openAIResponse.illustration_prompt);

        return {
            title: openAIResponse.title || "A Magical Adventure",
            story_text: openAIResponse.story_text,
            illustration_prompt: openAIResponse.illustration_prompt, // Return for debugging or other uses
            illustration_url: imageUrl,
            choices: openAIResponse.choices.map(choice => ({
                text: choice.text,
                next_node_id: choice.next_prompt_context // This is crucial for the next step
            })),
            current_node_id: theme + "_start_openai" // Conceptual ID
        };
    }

    async getNextStoryNode(theme, choiceContext, stepCount = 1, stepCap = 7) {
        // If the cap is reached, end the story
        if (stepCount >= stepCap) {
            // Generate a final ending node
            return {
                story_text: `What an amazing adventure! ${this.character.name} learned so much and made wonderful memories. The story comes to a happy end, but new adventures await!`,
                illustration_prompt: `A magical storybook closing with sparkles and a rainbow, symbolizing the end of a wonderful journey. Children's book illustration style.`,
                illustration_url: 'https://via.placeholder.com/512x512/CCCCCC/000000?text=The+End',
                choices: [],
                current_node_id: theme + '_ending'
            };
        }
        // choiceContext is the "next_prompt_context" from the user's selected choice
        const openAIResponse = await this._generateStorySegmentWithOpenAI(theme, choiceContext);
        if (!openAIResponse || !openAIResponse.illustration_prompt) {
            console.error("Failed to get valid response from OpenAI for next node.");
            // Handle this error appropriately
            return {
                story_text: "Oh no! The story path seems to have gotten lost in the woods. Please try a different choice or start over.",
                choices: [],
                illustration_prompt: "A 'path lost' sign in a whimsical forest. Children's book style.",
                illustration_url: "https://via.placeholder.com/512x512/CCCCCC/000000?text=Error+Continuing+Story",
                current_node_id: theme + "_error_continue"
            };
        }
        const imageUrl = await this._generateImageWithDalle(openAIResponse.illustration_prompt);

        return {
            story_text: openAIResponse.story_text,
            illustration_prompt: openAIResponse.illustration_prompt,
            illustration_url: imageUrl,
            choices: openAIResponse.choices.map(choice => ({
                text: choice.text,
                next_node_id: choice.next_prompt_context
            })),
            current_node_id: theme + "_continue_openai" // Conceptual ID
        };
    }

    // _getPlaceholderImage method is no longer needed if DALL-E is primary.
    // Can be kept as an ultimate fallback if _generateImageWithDalle also fails internally.
}

module.exports = StoryEngine;
