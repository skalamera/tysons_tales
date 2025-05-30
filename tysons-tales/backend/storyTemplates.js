const storyTemplates = {
    // Fantasy Kingdom Theme
    'fantasy_start': {
        text_template: "{character_name} the {character_role} stood at the edge of the Whispering Woods. {He_She_They} felt very {personality_trait}. A narrow path led into the shadows, while a bright meadow stretched to the right.",
        illustration_prompt_template: "Children's book illustration of {character_name} as a {gender} {character_role}, looking {personality_trait}, at the entrance of a mystical forest called Whispering Woods with a sunny meadow to the side.",
        choices: [
            {
                choice_text: "Enter the mysterious Whispering Woods",
                next_node_id: "fantasy_woods_path"
            },
            {
                choice_text: "Explore the bright meadow",
                next_node_id: "fantasy_meadow"
            }
        ]
    },

    'fantasy_woods_path': {
        text_template: "As {character_name} walked deeper into the woods, the trees seemed to whisper secrets. Suddenly, {he_she_they} spotted a glowing {favorite_color} butterfly fluttering ahead. It seemed to be leading somewhere special.",
        illustration_prompt_template: "Children's book illustration of {character_name} the {character_role} following a magical glowing {favorite_color} butterfly through a mystical forest.",
        choices: [
            {
                choice_text: "Follow the magical butterfly",
                next_node_id: "fantasy_butterfly_follow"
            },
            {
                choice_text: "Look for another path",
                next_node_id: "fantasy_woods_fork"
            }
        ]
    },

    'fantasy_meadow': {
        text_template: "The meadow was filled with colorful flowers dancing in the breeze. {character_name} noticed a friendly {favorite_animal} approaching. The {favorite_animal} seemed to want to show {him_her_them} something!",
        illustration_prompt_template: "Children's book illustration of {character_name} the {character_role} meeting a friendly {favorite_animal} in a beautiful flower-filled meadow.",
        choices: [
            {
                choice_text: "Follow the {favorite_animal}",
                next_node_id: "fantasy_animal_guide"
            },
            {
                choice_text: "Pick some flowers first",
                next_node_id: "fantasy_flower_picking"
            }
        ]
    },

    'fantasy_butterfly_follow': {
        text_template: "The {favorite_color} butterfly led {character_name} to a hidden grove where a wise old owl sat on a branch. 'Welcome, young {character_role},' hooted the owl. 'I've been waiting for someone {personality_trait} like you. Will you help me solve a mystery?'",
        illustration_prompt_template: "Children's book illustration of {character_name} meeting a wise owl in a magical grove with a glowing {favorite_color} butterfly nearby.",
        choices: [
            {
                choice_text: "Help the owl with the mystery",
                next_node_id: "fantasy_owl_quest"
            },
            {
                choice_text: "Ask the owl about the forest first",
                next_node_id: "fantasy_owl_wisdom"
            }
        ]
    },

    'fantasy_woods_fork': {
        text_template: "{character_name} found {himself_herself_themself} at a fork in the path. To the left, {he_she_they} heard the sound of rushing water. To the right, {he_she_they} saw ancient stone steps leading up a hill.",
        illustration_prompt_template: "Children's book illustration of {character_name} the {character_role} at a fork in a forest path, with a river to the left and stone steps to the right.",
        choices: [
            {
                choice_text: "Go towards the water sounds",
                next_node_id: "fantasy_river"
            },
            {
                choice_text: "Climb the ancient steps",
                next_node_id: "fantasy_temple"
            }
        ]
    },

    'fantasy_animal_guide': {
        text_template: "The {favorite_animal} led {character_name} to a sparkling pond where other animals had gathered. They were all looking at something in the water - it was a magical crown that glowed with a soft light!",
        illustration_prompt_template: "Children's book illustration of {character_name} and a {favorite_animal} discovering a magical glowing crown in a pond surrounded by forest animals.",
        choices: [
            {
                choice_text: "Try to retrieve the crown",
                next_node_id: "fantasy_crown_quest"
            },
            {
                choice_text: "Ask the animals about the crown",
                next_node_id: "fantasy_animal_council"
            }
        ]
    },

    // Space Adventure Theme
    'space_start': {
        text_template: "{character_name} the {character_role} stood in the command center of the StarShip Explorer. Through the window, {he_she_they} could see two planets - one covered in {favorite_color} clouds, and another that sparkled like a diamond.",
        illustration_prompt_template: "Children's book illustration of {character_name} as a {gender} {character_role} in a futuristic spaceship command center, looking at planets through a window.",
        choices: [
            {
                choice_text: "Visit the {favorite_color} cloud planet",
                next_node_id: "space_cloud_planet"
            },
            {
                choice_text: "Explore the sparkling planet",
                next_node_id: "space_crystal_planet"
            }
        ]
    },

    'space_cloud_planet': {
        text_template: "As the spaceship descended through the {favorite_color} clouds, {character_name} discovered the planet was home to floating cities! The inhabitants looked like friendly {favorite_animal}s with wings.",
        illustration_prompt_template: "Children's book illustration of {character_name} the space {character_role} meeting winged {favorite_animal}-like aliens in a floating city surrounded by {favorite_color} clouds.",
        choices: [
            {
                choice_text: "Visit the floating city",
                next_node_id: "space_floating_city"
            },
            {
                choice_text: "Explore the cloud formations",
                next_node_id: "space_cloud_exploration"
            }
        ]
    },

    'space_crystal_planet': {
        text_template: "The sparkling planet was covered in beautiful crystals that sang when the wind blew. {character_name} felt {personality_trait} as {he_she_they} discovered the crystals could record and play back messages!",
        illustration_prompt_template: "Children's book illustration of {character_name} the {character_role} on a planet covered with singing crystals that sparkle in different colors.",
        choices: [
            {
                choice_text: "Record a message in the crystals",
                next_node_id: "space_crystal_message"
            },
            {
                choice_text: "Listen to the crystal songs",
                next_node_id: "space_crystal_music"
            }
        ]
    },

    // Forest Mystery Theme
    'forest_start': {
        text_template: "{character_name} the {character_role} received a mysterious map that led to the Enchanted Forest. The map showed two entrances - one marked with a {favorite_color} star, and another with a picture of a {favorite_animal}.",
        illustration_prompt_template: "Children's book illustration of {character_name} the {character_role} holding a magical map at the entrance to an enchanted forest.",
        choices: [
            {
                choice_text: "Take the {favorite_color} star entrance",
                next_node_id: "forest_star_path"
            },
            {
                choice_text: "Take the {favorite_animal} entrance",
                next_node_id: "forest_animal_path"
            }
        ]
    },

    'forest_star_path': {
        text_template: "Following the {favorite_color} star markers, {character_name} discovered a village of tiny fairy houses built into the trees. The fairies were having a celebration and invited {him_her_them} to join!",
        illustration_prompt_template: "Children's book illustration of {character_name} discovering a magical fairy village in the trees with {favorite_color} star decorations.",
        choices: [
            {
                choice_text: "Join the fairy celebration",
                next_node_id: "forest_fairy_party"
            },
            {
                choice_text: "Ask about the map's secret",
                next_node_id: "forest_fairy_wisdom"
            }
        ]
    },

    'forest_animal_path': {
        text_template: "The path led to a clearing where {character_name} found a gathering of forest animals, including a wise {favorite_animal}. They were discussing something important about a hidden treasure in the forest.",
        illustration_prompt_template: "Children's book illustration of {character_name} meeting forest animals including a wise {favorite_animal} in a moonlit clearing.",
        choices: [
            {
                choice_text: "Offer to help find the treasure",
                next_node_id: "forest_treasure_quest"
            },
            {
                choice_text: "Learn more about the forest",
                next_node_id: "forest_animal_stories"
            }
        ]
    },

    // Ocean Adventure Theme
    'ocean_start': {
        text_template: "{character_name} the {character_role} put on a magical diving suit that let {him_her_them} breathe underwater. Below the waves, {he_she_they} saw a coral reef glowing with {favorite_color} light and a mysterious underwater cave.",
        illustration_prompt_template: "Children's book illustration of {character_name} the {character_role} in a magical diving suit underwater, seeing a {favorite_color} glowing coral reef and a cave.",
        choices: [
            {
                choice_text: "Explore the glowing coral reef",
                next_node_id: "ocean_coral_reef"
            },
            {
                choice_text: "Investigate the underwater cave",
                next_node_id: "ocean_cave"
            }
        ]
    },

    'ocean_coral_reef': {
        text_template: "The coral reef was home to colorful fish and a friendly sea turtle. The turtle introduced itself as Shelly and said, 'I've been waiting for a {personality_trait} {character_role} like you! We need help saving our reef.'",
        illustration_prompt_template: "Children's book illustration of {character_name} meeting Shelly the sea turtle at a vibrant {favorite_color} coral reef with colorful fish.",
        choices: [
            {
                choice_text: "Help Shelly save the reef",
                next_node_id: "ocean_reef_rescue"
            },
            {
                choice_text: "Ask Shelly about the ocean",
                next_node_id: "ocean_turtle_wisdom"
            }
        ]
    },

    'ocean_cave': {
        text_template: "Inside the cave, {character_name} discovered ancient drawings on the walls and a chest guarded by a playful octopus. The octopus changed colors, mimicking {character_name}'s {favorite_color} diving suit!",
        illustration_prompt_template: "Children's book illustration of {character_name} in an underwater cave with ancient drawings, meeting a color-changing octopus guarding a treasure chest.",
        choices: [
            {
                choice_text: "Play a game with the octopus",
                next_node_id: "ocean_octopus_game"
            },
            {
                choice_text: "Study the ancient drawings",
                next_node_id: "ocean_cave_mystery"
            }
        ]
    },

    // Time Travel Theme
    'timetravel_start': {
        text_template: "{character_name} the {character_role} discovered a magical clock that could travel through time! The clock showed two special times - one leading to the age of dinosaurs, another to a future city in the clouds.",
        illustration_prompt_template: "Children's book illustration of {character_name} the {character_role} with a magical glowing time-travel clock showing different eras.",
        choices: [
            {
                choice_text: "Travel to the age of dinosaurs",
                next_node_id: "timetravel_dinosaurs"
            },
            {
                choice_text: "Visit the future cloud city",
                next_node_id: "timetravel_future"
            }
        ]
    },

    'timetravel_dinosaurs': {
        text_template: "With a flash of {favorite_color} light, {character_name} arrived in a prehistoric jungle. A baby dinosaur that looked like a {favorite_animal} with scales approached {him_her_them} curiously. It seemed friendly!",
        illustration_prompt_template: "Children's book illustration of {character_name} the {character_role} meeting a friendly baby dinosaur in a prehistoric jungle.",
        choices: [
            {
                choice_text: "Make friends with the baby dinosaur",
                next_node_id: "timetravel_dino_friend"
            },
            {
                choice_text: "Explore the prehistoric world",
                next_node_id: "timetravel_dino_explore"
            }
        ]
    },

    'timetravel_future': {
        text_template: "The future was amazing! {character_name} found {himself_herself_themself} in a city floating in the clouds where robots and humans lived together. A friendly robot painted in {favorite_color} offered to be {his_her_their} guide.",
        illustration_prompt_template: "Children's book illustration of {character_name} in a futuristic cloud city with flying vehicles and a friendly {favorite_color} robot guide.",
        choices: [
            {
                choice_text: "Tour the city with the robot",
                next_node_id: "timetravel_future_tour"
            },
            {
                choice_text: "Visit the future school",
                next_node_id: "timetravel_future_school"
            }
        ]
    },

    // Additional Fantasy nodes
    'fantasy_flower_picking': {
        text_template: "{character_name} gathered beautiful flowers of every color. Suddenly, the flowers began to glow and formed a magical path leading to a hidden garden where a fairy queen was waiting!",
        illustration_prompt_template: "Children's book illustration of {character_name} with glowing flowers forming a path to a magical garden with a fairy queen.",
        choices: [
            {
                choice_text: "Follow the flower path to meet the fairy queen",
                next_node_id: "fantasy_fairy_queen"
            },
            {
                choice_text: "Keep some glowing flowers as a gift",
                next_node_id: "fantasy_flower_gift"
            }
        ]
    },

    'fantasy_river': {
        text_template: "{character_name} found a crystal-clear river with a beautiful bridge made of rainbow stones. A friendly river spirit appeared and offered to grant one wish to anyone {personality_trait} enough to help the forest.",
        illustration_prompt_template: "Children's book illustration of {character_name} at a river with a rainbow bridge and a glowing river spirit.",
        choices: [
            {
                choice_text: "Make a wish to help the forest",
                next_node_id: "fantasy_forest_wish"
            },
            {
                choice_text: "Ask the spirit about the forest's secret",
                next_node_id: "fantasy_spirit_wisdom"
            }
        ]
    },

    'fantasy_temple': {
        text_template: "At the top of the ancient steps, {character_name} discovered a magnificent temple covered in {favorite_color} crystals. Inside, a wise dragon was guarding ancient books of magic!",
        illustration_prompt_template: "Children's book illustration of {character_name} in an ancient temple with {favorite_color} crystals and a wise dragon with books.",
        choices: [
            {
                choice_text: "Learn magic from the dragon",
                next_node_id: "fantasy_dragon_magic"
            },
            {
                choice_text: "Ask about the temple's history",
                next_node_id: "fantasy_temple_story"
            }
        ]
    },

    // Space nodes continuation
    'space_floating_city': {
        text_template: "The floating city was amazing! The {favorite_animal}-like aliens welcomed {character_name} with a parade. They showed {him_her_them} their gravity-defying playground where children could fly!",
        illustration_prompt_template: "Children's book illustration of {character_name} in a floating alien city with {favorite_animal}-like aliens and flying children.",
        choices: [
            {
                choice_text: "Try flying in the playground",
                next_node_id: "space_flying_fun"
            },
            {
                choice_text: "Learn about alien technology",
                next_node_id: "space_alien_tech"
            }
        ]
    },

    'space_crystal_message': {
        text_template: "{character_name} recorded a special message in the singing crystals: 'Hello from {character_name} the {character_role}! I'm having an amazing adventure!' The crystals glowed {favorite_color} and sent the message across the universe!",
        illustration_prompt_template: "Children's book illustration of {character_name} speaking into glowing {favorite_color} singing crystals that send messages across space.",
        choices: [
            {
                choice_text: "Wait for a response",
                next_node_id: "space_crystal_response"
            },
            {
                choice_text: "Explore more of the crystal planet",
                next_node_id: "space_crystal_caves"
            }
        ]
    },

    // Forest continuation
    'forest_fairy_party': {
        text_template: "The fairy celebration was magical! {character_name} danced with fireflies, ate stardust cookies, and played music with the fairies. As a thank you for being so {personality_trait}, the fairy queen gave {him_her_them} a magical gift!",
        illustration_prompt_template: "Children's book illustration of {character_name} at a magical fairy party with dancing, music, and a fairy queen giving a gift.",
        choices: [
            {
                choice_text: "Accept the magical gift graciously",
                next_node_id: "forest_fairy_gift"
            },
            {
                choice_text: "Share a special talent with the fairies",
                next_node_id: "forest_talent_show"
            }
        ]
    },

    'forest_treasure_quest': {
        text_template: "The forest animals explained that the treasure wasn't gold or jewels, but something even more special - the Heart of the Forest, which keeps all nature in balance. {character_name} the {personality_trait} {character_role} was just the hero they needed!",
        illustration_prompt_template: "Children's book illustration of {character_name} with forest animals discussing the magical Heart of the Forest treasure.",
        choices: [
            // Add valid choices here, for now leaving empty
        ]
    }
};

module.exports = storyTemplates; 