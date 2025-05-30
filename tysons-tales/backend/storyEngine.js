class StoryEngine {
    constructor(storyTemplates, character) {
        this.storyTemplates = storyTemplates;
        this.character = character;
        this.pronouns = this._getPronouns(character.gender);
    }

    _getPronouns(gender) {
        if (gender === 'boy') {
            return {
                subject: 'he',
                object: 'him',
                possessive: 'his',
                reflexive: 'himself',
                Subject: 'He',
                Possessive: 'His'
            };
        } else if (gender === 'girl') {
            return {
                subject: 'she',
                object: 'her',
                possessive: 'her',
                reflexive: 'herself',
                Subject: 'She',
                Possessive: 'Her'
            };
        } else {
            return {
                subject: 'they',
                object: 'them',
                possessive: 'their',
                reflexive: 'themself',
                Subject: 'They',
                Possessive: 'Their'
            };
        }
    }

    _personalizeText(textTemplate) {
        let text = textTemplate;

        // Character details
        text = text.replace(/{character_name}/g, this.character.name || 'Hero');
        text = text.replace(/{character_role}/g, this.character.role || 'adventurer');

        // Pronouns
        text = text.replace(/{he_she_they}/g, this.pronouns.subject);
        text = text.replace(/{He_She_They}/g, this.pronouns.Subject);
        text = text.replace(/{him_her_them}/g, this.pronouns.object);
        text = text.replace(/{his_her_their}/g, this.pronouns.possessive);
        text = text.replace(/{His_Her_Their}/g, this.pronouns.Possessive);
        text = text.replace(/{himself_herself_themself}/g, this.pronouns.reflexive);

        // Personality traits
        if (this.character.personalities && this.character.personalities.length > 0) {
            const randomPersonality = this.character.personalities[
                Math.floor(Math.random() * this.character.personalities.length)
            ];
            text = text.replace(/{personality_trait}/g, randomPersonality);
        } else {
            text = text.replace(/{personality_trait}/g, 'brave');
        }

        // Favorites
        text = text.replace(/{favorite_color}/g, this.character.favorite_color || 'blue');
        text = text.replace(/{favorite_animal}/g, this.character.favorite_animal || 'dog');

        return text;
    }

    getStoryNode(nodeId) {
        const nodeData = this.storyTemplates[nodeId];
        if (!nodeData) {
            return null;
        }

        const personalizedText = this._personalizeText(nodeData.text_template);
        const illustrationPrompt = this._personalizeText(nodeData.illustration_prompt_template);

        // Process choices
        const availableChoices = [];
        for (const choice of nodeData.choices || []) {
            // Check conditions if any
            if (choice.conditions) {
                let conditionsMet = true;

                // Check personality conditions
                if (choice.conditions.personality) {
                    const hasPersonality = this.character.personalities?.includes(choice.conditions.personality);
                    if (!hasPersonality) {
                        conditionsMet = false;
                    }
                }

                // Check role conditions
                if (choice.conditions.role && this.character.role !== choice.conditions.role) {
                    conditionsMet = false;
                }

                if (!conditionsMet) {
                    continue;
                }
            }

            availableChoices.push({
                text: this._personalizeText(choice.choice_text),
                next_node_id: choice.next_node_id
            });
        }

        return {
            story_text: personalizedText,
            illustration_prompt: illustrationPrompt,
            illustration_url: nodeData.illustration_url || this._getPlaceholderImage(nodeId),
            choices: availableChoices,
            current_node_id: nodeId
        };
    }

    getInitialStoryNode(theme) {
        const startNodeId = `${theme}_start`;
        if (!this.storyTemplates[startNodeId]) {
            return null;
        }
        return this.getStoryNode(startNodeId);
    }

    _getPlaceholderImage(nodeId) {
        // Return theme-appropriate placeholder images
        if (nodeId.includes('fantasy')) {
            return 'https://via.placeholder.com/512x512/9b59b6/ffffff?text=Fantasy+Scene';
        } else if (nodeId.includes('space')) {
            return 'https://via.placeholder.com/512x512/2c3e50/ffffff?text=Space+Adventure';
        } else if (nodeId.includes('forest')) {
            return 'https://via.placeholder.com/512x512/27ae60/ffffff?text=Forest+Mystery';
        } else if (nodeId.includes('ocean')) {
            return 'https://via.placeholder.com/512x512/3498db/ffffff?text=Ocean+World';
        } else if (nodeId.includes('timetravel')) {
            return 'https://via.placeholder.com/512x512/e74c3c/ffffff?text=Time+Travel';
        }
        return 'https://via.placeholder.com/512x512/95a5a6/ffffff?text=Story+Scene';
    }
}

module.exports = StoryEngine; 