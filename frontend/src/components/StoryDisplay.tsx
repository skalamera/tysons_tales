import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Character, StoryNode } from '../types';
import { getUserId } from '../utils/userUtils';
import { getApiUrl } from '../utils/api';

interface StoryDisplayProps {
    character: Character;
    theme: string;
}

interface TriviaQuestion {
    question: string;
    options: string[];
    correctAnswer: number;
    funFact: string;
    emoji: string;
}

const StoryDisplay: React.FC<StoryDisplayProps> = ({ character, theme }) => {
    const navigate = useNavigate();
    const [currentNode, setCurrentNode] = useState<StoryNode | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [storyProgressId, setStoryProgressId] = useState<string>('');
    const [isPlaying, setIsPlaying] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('Creating your adventure...');
    const [storyTitle, setStoryTitle] = useState<string>('');
    const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
    const hasStartedRef = useRef(false);
    const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);
    const messageIndexRef = useRef(0);
    const [autoPlayEnabled, setAutoPlayEnabled] = useState(() => {
        // Get auto-play preference from localStorage, default to true
        const saved = localStorage.getItem('autoPlayAudio');
        return saved === null ? true : saved === 'true';
    });
    const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [selectedVoice, setSelectedVoice] = useState<string>(() => {
        // Get saved voice preference from localStorage
        return localStorage.getItem('selectedVoice') || '';
    });
    const [showVoiceSelector, setShowVoiceSelector] = useState(false);
    const voicesLoadedRef = useRef(false);

    // Trivia state
    const [currentTrivia, setCurrentTrivia] = useState<TriviaQuestion | null>(null);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showAnswer, setShowAnswer] = useState(false);
    const [triviaScore, setTriviaScore] = useState(0);
    const [showTrivia, setShowTrivia] = useState(false);
    const [storyReady, setStoryReady] = useState(false);

    // Kid-friendly trivia questions organized by age groups
    const triviaQuestionsByAge = {
        // Ages 3-5: Very simple concepts
        young: [
            {
                question: "What color is a banana?",
                options: ["Red", "Blue", "Yellow", "Green"],
                correctAnswer: 2,
                funFact: "Bananas start green and turn yellow when they're ready to eat!",
                emoji: "🍌"
            },
            {
                question: "How many fingers do you have on one hand?",
                options: ["3", "4", "5", "6"],
                correctAnswer: 2,
                funFact: "You can use your fingers to count to 10!",
                emoji: "✋"
            },
            {
                question: "What sound does a cat make?",
                options: ["Woof", "Meow", "Moo", "Quack"],
                correctAnswer: 1,
                funFact: "Cats purr when they're happy!",
                emoji: "🐱"
            },
            {
                question: "What shape is a ball?",
                options: ["Square", "Triangle", "Circle", "Star"],
                correctAnswer: 2,
                funFact: "Balls are round so they can roll!",
                emoji: "⚽"
            },
            {
                question: "What color is the grass?",
                options: ["Red", "Green", "Blue", "Yellow"],
                correctAnswer: 1,
                funFact: "Grass needs water and sunshine to stay green!",
                emoji: "🌱"
            },
            {
                question: "Where do birds live?",
                options: ["In water", "In nests", "Underground", "In caves"],
                correctAnswer: 1,
                funFact: "Birds build their nests high up to keep their babies safe!",
                emoji: "🐦"
            },
            {
                question: "What do we use to see?",
                options: ["Ears", "Nose", "Eyes", "Mouth"],
                correctAnswer: 2,
                funFact: "We blink to keep our eyes clean and wet!",
                emoji: "👀"
            },
            {
                question: "How many wheels does a car have?",
                options: ["2", "3", "4", "5"],
                correctAnswer: 2,
                funFact: "Cars have 4 wheels to help them drive smoothly!",
                emoji: "🚗"
            },
            {
                question: "What animal says 'moo'?",
                options: ["Dog", "Cow", "Pig", "Horse"],
                correctAnswer: 1,
                funFact: "Cows give us milk to drink!",
                emoji: "🐄"
            },
            {
                question: "What color is the sun?",
                options: ["Blue", "Red", "Yellow", "Purple"],
                correctAnswer: 2,
                funFact: "The sun gives us light and keeps us warm!",
                emoji: "☀️"
            },
            {
                question: "What do we wear on our feet?",
                options: ["Hat", "Gloves", "Shoes", "Scarf"],
                correctAnswer: 2,
                funFact: "Shoes protect our feet when we walk!",
                emoji: "👟"
            },
            {
                question: "How many eyes do you have?",
                options: ["1", "2", "3", "4"],
                correctAnswer: 1,
                funFact: "Your two eyes work together to help you see!",
                emoji: "👁️"
            },
            {
                question: "What animal hops?",
                options: ["Fish", "Snake", "Rabbit", "Bird"],
                correctAnswer: 2,
                funFact: "Rabbits can hop very fast and have long ears!",
                emoji: "🐰"
            },
            {
                question: "What do we drink when we're thirsty?",
                options: ["Rocks", "Water", "Sand", "Air"],
                correctAnswer: 1,
                funFact: "Water is very important for our bodies!",
                emoji: "💧"
            },
            {
                question: "What shape is a pizza?",
                options: ["Square", "Triangle", "Circle", "Heart"],
                correctAnswer: 2,
                funFact: "Pizza is usually round and cut into triangle slices!",
                emoji: "🍕"
            },
            {
                question: "What animal barks?",
                options: ["Cat", "Dog", "Bird", "Fish"],
                correctAnswer: 1,
                funFact: "Dogs bark to talk to us and other dogs!",
                emoji: "🐕"
            },
            {
                question: "What do we use to eat soup?",
                options: ["Fork", "Knife", "Spoon", "Hands"],
                correctAnswer: 2,
                funFact: "Spoons help us eat liquids like soup!",
                emoji: "🥄"
            },
            {
                question: "What grows on trees?",
                options: ["Rocks", "Leaves", "Cars", "Shoes"],
                correctAnswer: 1,
                funFact: "Trees have many leaves that change colors in fall!",
                emoji: "🌳"
            },
            {
                question: "What do we sleep in at night?",
                options: ["Car", "Bed", "Chair", "Table"],
                correctAnswer: 1,
                funFact: "A cozy bed helps us get good sleep!",
                emoji: "🛏️"
            },
            {
                question: "What color is a strawberry?",
                options: ["Blue", "Yellow", "Red", "Purple"],
                correctAnswer: 2,
                funFact: "Strawberries are sweet and yummy!",
                emoji: "🍓"
            }
        ],
        // Ages 6-8: Basic knowledge
        middle: [
            {
                question: "How many legs does a spider have?",
                options: ["4", "6", "8", "10"],
                correctAnswer: 2,
                funFact: "Spiders use their 8 legs to walk and feel vibrations in their webs!",
                emoji: "🕷️"
            },
            {
                question: "What do bees make?",
                options: ["Milk", "Honey", "Bread", "Cheese"],
                correctAnswer: 1,
                funFact: "Bees visit about 2 million flowers to make just one pound of honey!",
                emoji: "🐝"
            },
            {
                question: "Which animal is the tallest?",
                options: ["Elephant", "Lion", "Giraffe", "Bear"],
                correctAnswer: 2,
                funFact: "Giraffes can grow up to 18 feet tall - that's as tall as a two-story house!",
                emoji: "🦒"
            },
            {
                question: "What shape has three sides?",
                options: ["Circle", "Square", "Triangle", "Rectangle"],
                correctAnswer: 2,
                funFact: "Triangles are super strong shapes - that's why they're used in bridges!",
                emoji: "🔺"
            },
            {
                question: "How many days are in a week?",
                options: ["5", "6", "7", "8"],
                correctAnswer: 2,
                funFact: "The names of weekdays come from ancient gods and celestial bodies!",
                emoji: "📅"
            },
            {
                question: "What is frozen water called?",
                options: ["Steam", "Ice", "Snow", "Rain"],
                correctAnswer: 1,
                funFact: "Ice is less dense than water, which is why ice cubes float!",
                emoji: "🧊"
            },
            {
                question: "What do caterpillars turn into?",
                options: ["Bees", "Butterflies", "Birds", "Beetles"],
                correctAnswer: 1,
                funFact: "A caterpillar wraps itself in a chrysalis and completely transforms its body!",
                emoji: "🦋"
            },
            {
                question: "Which of these can fly?",
                options: ["Penguin", "Ostrich", "Eagle", "Chicken"],
                correctAnswer: 2,
                funFact: "Eagles can see four times better than humans!",
                emoji: "🦅"
            },
            {
                question: "How many months are in a year?",
                options: ["10", "11", "12", "13"],
                correctAnswer: 2,
                funFact: "Each month has between 28 and 31 days!",
                emoji: "📆"
            },
            {
                question: "What do we call a baby dog?",
                options: ["Kitten", "Puppy", "Calf", "Chick"],
                correctAnswer: 1,
                funFact: "Puppies are born with their eyes closed!",
                emoji: "🐶"
            },
            {
                question: "Which planet is closest to the Sun?",
                options: ["Earth", "Mars", "Mercury", "Venus"],
                correctAnswer: 2,
                funFact: "Mercury is so close to the Sun that it's very hot during the day!",
                emoji: "☀️"
            },
            {
                question: "What makes things fall to the ground?",
                options: ["Wind", "Gravity", "Magnets", "Water"],
                correctAnswer: 1,
                funFact: "Gravity is what keeps us on Earth and not floating away!",
                emoji: "🌍"
            },
            {
                question: "How many cents are in a dollar?",
                options: ["50", "75", "100", "125"],
                correctAnswer: 2,
                funFact: "100 pennies equal one dollar!",
                emoji: "💵"
            },
            {
                question: "What do pandas eat?",
                options: ["Fish", "Meat", "Bamboo", "Fruits"],
                correctAnswer: 2,
                funFact: "Pandas spend 14 hours a day eating bamboo!",
                emoji: "🐼"
            },
            {
                question: "Which ocean animal has 8 arms?",
                options: ["Starfish", "Octopus", "Jellyfish", "Crab"],
                correctAnswer: 1,
                funFact: "Octopuses can change color to hide from predators!",
                emoji: "🐙"
            },
            {
                question: "What season comes after summer?",
                options: ["Winter", "Spring", "Fall", "Summer again"],
                correctAnswer: 2,
                funFact: "In fall, leaves change color and fall from trees!",
                emoji: "🍂"
            },
            {
                question: "How many hours are in a day?",
                options: ["12", "20", "24", "30"],
                correctAnswer: 2,
                funFact: "The Earth takes 24 hours to spin around once!",
                emoji: "🕐"
            },
            {
                question: "What do we call a group of fish?",
                options: ["Herd", "Flock", "School", "Pack"],
                correctAnswer: 2,
                funFact: "Fish swim in schools to stay safe from predators!",
                emoji: "🐠"
            },
            {
                question: "Which bird can't fly but can swim?",
                options: ["Robin", "Penguin", "Eagle", "Parrot"],
                correctAnswer: 1,
                funFact: "Penguins use their wings like flippers to swim!",
                emoji: "🐧"
            },
            {
                question: "What is the opposite of hot?",
                options: ["Warm", "Cool", "Cold", "Wet"],
                correctAnswer: 2,
                funFact: "Temperature tells us how hot or cold something is!",
                emoji: "🌡️"
            },
            {
                question: "How many sides does a square have?",
                options: ["3", "4", "5", "6"],
                correctAnswer: 1,
                funFact: "All four sides of a square are exactly the same length!",
                emoji: "⬜"
            },
            {
                question: "What vitamin do we get from the sun?",
                options: ["Vitamin A", "Vitamin C", "Vitamin D", "Vitamin E"],
                correctAnswer: 2,
                funFact: "Our skin makes Vitamin D when we're in the sunshine!",
                emoji: "☀️"
            },
            {
                question: "Which animal can change its color?",
                options: ["Elephant", "Chameleon", "Lion", "Bear"],
                correctAnswer: 1,
                funFact: "Chameleons change color to show their mood and temperature!",
                emoji: "🦎"
            },
            {
                question: "What do we call water falling from the sky?",
                options: ["Snow", "Hail", "Rain", "Fog"],
                correctAnswer: 2,
                funFact: "Rain helps plants grow and fills our rivers!",
                emoji: "🌧️"
            },
            {
                question: "How many wings does a butterfly have?",
                options: ["2", "4", "6", "8"],
                correctAnswer: 1,
                funFact: "Butterfly wings have tiny scales that create their beautiful colors!",
                emoji: "🦋"
            }
        ],
        // Ages 9-12: More complex concepts
        older: [
            {
                question: "How many colors are in a rainbow?",
                options: ["5", "6", "7", "8"],
                correctAnswer: 2,
                funFact: "The colors are: Red, Orange, Yellow, Green, Blue, Indigo, and Violet!",
                emoji: "🌈"
            },
            {
                question: "What is the largest ocean animal?",
                options: ["Shark", "Dolphin", "Blue Whale", "Octopus"],
                correctAnswer: 2,
                funFact: "Blue whales can be as long as three school buses lined up!",
                emoji: "🐋"
            },
            {
                question: "What do plants need to grow?",
                options: ["Only water", "Only sunlight", "Water and sunlight", "Only soil"],
                correctAnswer: 2,
                funFact: "Plants use sunlight to make their own food through photosynthesis!",
                emoji: "🌱"
            },
            {
                question: "Which planet do we live on?",
                options: ["Mars", "Earth", "Jupiter", "Venus"],
                correctAnswer: 1,
                funFact: "Earth is the only planet we know of that has life on it!",
                emoji: "🌍"
            },
            {
                question: "What do we use to see things far away?",
                options: ["Microscope", "Telescope", "Stethoscope", "Periscope"],
                correctAnswer: 1,
                funFact: "The biggest telescopes can see galaxies billions of light-years away!",
                emoji: "🔭"
            },
            {
                question: "How many seasons are there in a year?",
                options: ["2", "3", "4", "5"],
                correctAnswer: 2,
                funFact: "Some places near the equator only have two seasons: wet and dry!",
                emoji: "🍂"
            },
            {
                question: "What shape is a stop sign?",
                options: ["Circle", "Square", "Triangle", "Octagon"],
                correctAnswer: 3,
                funFact: "Stop signs have 8 sides and are the same in almost every country!",
                emoji: "🛑"
            },
            {
                question: "What is the speed of light?",
                options: ["186,000 miles/second", "186 miles/second", "1,860 miles/second", "18,600 miles/second"],
                correctAnswer: 0,
                funFact: "Light travels so fast it could go around Earth 7.5 times in one second!",
                emoji: "💡"
            },
            {
                question: "How many bones are in the human body?",
                options: ["106", "206", "306", "406"],
                correctAnswer: 1,
                funFact: "Babies are born with about 300 bones, but many fuse together as they grow!",
                emoji: "🦴"
            },
            {
                question: "What gas do plants produce?",
                options: ["Carbon dioxide", "Nitrogen", "Oxygen", "Hydrogen"],
                correctAnswer: 2,
                funFact: "One large tree can produce enough oxygen for two people for a whole year!",
                emoji: "🌳"
            },
            {
                question: "What is the largest planet in our solar system?",
                options: ["Saturn", "Jupiter", "Neptune", "Earth"],
                correctAnswer: 1,
                funFact: "Jupiter is so big that all other planets could fit inside it!",
                emoji: "🪐"
            },
            {
                question: "How many continents are there?",
                options: ["5", "6", "7", "8"],
                correctAnswer: 2,
                funFact: "The continents are: Asia, Africa, North America, South America, Antarctica, Europe, and Australia!",
                emoji: "🗺️"
            },
            {
                question: "What is the hardest natural substance on Earth?",
                options: ["Gold", "Iron", "Diamond", "Rock"],
                correctAnswer: 2,
                funFact: "Diamonds are formed deep underground under extreme pressure!",
                emoji: "💎"
            },
            {
                question: "How long does Earth take to orbit the Sun?",
                options: ["1 day", "1 month", "1 year", "10 years"],
                correctAnswer: 2,
                funFact: "That's why we have 365 days in a year (366 in leap years)!",
                emoji: "🌍"
            },
            {
                question: "What percentage of Earth is covered by water?",
                options: ["50%", "60%", "70%", "80%"],
                correctAnswer: 2,
                funFact: "Most of Earth's water is in the oceans!",
                emoji: "🌊"
            },
            {
                question: "Which organ pumps blood through your body?",
                options: ["Brain", "Lungs", "Heart", "Stomach"],
                correctAnswer: 2,
                funFact: "Your heart beats about 100,000 times every day!",
                emoji: "❤️"
            },
            {
                question: "What is the smallest unit of matter?",
                options: ["Cell", "Molecule", "Atom", "Particle"],
                correctAnswer: 2,
                funFact: "Atoms are so small that millions could fit on the tip of a pin!",
                emoji: "⚛️"
            },
            {
                question: "How many teeth do adult humans typically have?",
                options: ["28", "30", "32", "34"],
                correctAnswer: 2,
                funFact: "This includes 4 wisdom teeth that some people have removed!",
                emoji: "🦷"
            },
            {
                question: "What causes tides in the ocean?",
                options: ["Wind", "The Moon", "Fish", "Boats"],
                correctAnswer: 1,
                funFact: "The Moon's gravity pulls on Earth's oceans, creating high and low tides!",
                emoji: "🌙"
            },
            {
                question: "What is the capital of the United States?",
                options: ["New York", "Los Angeles", "Washington D.C.", "Chicago"],
                correctAnswer: 2,
                funFact: "D.C. stands for District of Columbia!",
                emoji: "🏛️"
            },
            {
                question: "How many minutes are in an hour?",
                options: ["30", "45", "60", "90"],
                correctAnswer: 2,
                funFact: "That's why clock faces have 60 marks around them!",
                emoji: "⏰"
            },
            {
                question: "What do we call animals that eat only plants?",
                options: ["Carnivores", "Herbivores", "Omnivores", "Predators"],
                correctAnswer: 1,
                funFact: "Cows, horses, and rabbits are all herbivores!",
                emoji: "🌿"
            },
            {
                question: "Which metal is liquid at room temperature?",
                options: ["Gold", "Silver", "Mercury", "Iron"],
                correctAnswer: 2,
                funFact: "Mercury is used in old thermometers because it expands when heated!",
                emoji: "🌡️"
            },
            {
                question: "What is the longest river in the world?",
                options: ["Amazon", "Nile", "Mississippi", "Yangtze"],
                correctAnswer: 1,
                funFact: "The Nile River is over 4,000 miles long!",
                emoji: "🏞️"
            },
            {
                question: "How many chambers does the human heart have?",
                options: ["2", "3", "4", "5"],
                correctAnswer: 2,
                funFact: "The four chambers work together to pump blood throughout your body!",
                emoji: "❤️"
            },
            {
                question: "What force keeps planets in orbit around the Sun?",
                options: ["Magnetism", "Electricity", "Gravity", "Wind"],
                correctAnswer: 2,
                funFact: "The Sun's gravity is so strong it keeps all planets in our solar system orbiting around it!",
                emoji: "☀️"
            },
            {
                question: "What is the largest desert in the world?",
                options: ["Sahara", "Antarctica", "Arabian", "Gobi"],
                correctAnswer: 1,
                funFact: "Antarctica is a cold desert because it gets very little precipitation!",
                emoji: "🏔️"
            },
            {
                question: "How many strings does a standard guitar have?",
                options: ["4", "5", "6", "7"],
                correctAnswer: 2,
                funFact: "Each string makes a different note when played!",
                emoji: "🎸"
            },
            {
                question: "What is the smallest country in the world?",
                options: ["Monaco", "Vatican City", "San Marino", "Liechtenstein"],
                correctAnswer: 1,
                funFact: "Vatican City is only about 0.17 square miles!",
                emoji: "🏰"
            },
            {
                question: "Which planet is known as the Red Planet?",
                options: ["Venus", "Mars", "Jupiter", "Mercury"],
                correctAnswer: 1,
                funFact: "Mars looks red because of iron oxide (rust) on its surface!",
                emoji: "🔴"
            }
        ]
    };

    // Define loading messages for different contexts
    const startStoryMessages = [
        'Creating your adventure...',
        'Imagining magical worlds...',
        'Writing your story...',
        'Painting beautiful scenes...',
        'Adding finishing touches...',
        'Almost ready...'
    ];

    const continueStoryMessages = [
        'Writing the next chapter...',
        'Creating magical illustrations...',
        'Weaving your choices into the tale...',
        'Painting new scenes...',
        'Preparing your adventure...',
        'Almost there...'
    ];

    // Function to cycle through loading messages
    const startLoadingMessages = (messages: string[]) => {
        messageIndexRef.current = 0;
        setLoadingMessage(messages[0]);

        // Clear any existing timer
        if (loadingTimerRef.current) {
            clearInterval(loadingTimerRef.current);
        }

        // Set up new timer to cycle through messages
        loadingTimerRef.current = setInterval(() => {
            messageIndexRef.current = (messageIndexRef.current + 1) % messages.length;
            setLoadingMessage(messages[messageIndexRef.current]);
        }, 2000); // Change message every 2 seconds
    };

    // Clean up timer when component unmounts or loading completes
    const stopLoadingMessages = () => {
        if (loadingTimerRef.current) {
            clearInterval(loadingTimerRef.current);
            loadingTimerRef.current = null;
        }
    };

    // Load available voices
    useEffect(() => {
        const loadVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) {
                setAvailableVoices(voices);
                voicesLoadedRef.current = true;

                // If no voice is selected, try to find a good default
                if (!selectedVoice) {
                    const preferredVoice = voices.find(voice =>
                        voice.name === 'Google US English' ||
                        voice.name.includes('Google US English')
                    );
                    if (preferredVoice) {
                        setSelectedVoice(preferredVoice.name);
                        localStorage.setItem('selectedVoice', preferredVoice.name);
                    } else {
                        // Fallback to other voices if Google US English not available
                        const fallbackVoice = voices.find(voice =>
                            voice.name.includes('Female') ||
                            voice.name.includes('Samantha') ||
                            voice.name.includes('Victoria') ||
                            voice.name.includes('Google US English Female')
                        );
                        if (fallbackVoice) {
                            setSelectedVoice(fallbackVoice.name);
                            localStorage.setItem('selectedVoice', fallbackVoice.name);
                        }
                    }
                }
            }
        };

        // Load voices immediately
        loadVoices();

        // Also load voices when they become available
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }

        // Clean up
        return () => {
            if (window.speechSynthesis.onvoiceschanged !== undefined) {
                window.speechSynthesis.onvoiceschanged = null;
            }
        };
    }, [selectedVoice]);

    useEffect(() => {
        // Prevent double initialization in StrictMode
        if (!hasStartedRef.current) {
            hasStartedRef.current = true;
            startStory();
        }

        return () => {
            // Clean up speech synthesis on unmount
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
            // Clean up loading timer
            stopLoadingMessages();
        };
    }, []);

    useEffect(() => {
        if (currentNode && currentNode.story_text && autoPlayEnabled && !loading && !showTrivia) {
            // Add a small delay to ensure voices are loaded and component is fully rendered
            const timeoutId = setTimeout(() => {
                speakText(currentNode.story_text);
            }, 500);

            return () => clearTimeout(timeoutId);
        }
    }, [currentNode?.current_node_id, loading, showTrivia]); // Also depend on loading state and showTrivia

    // Debug effect to log loading state changes
    useEffect(() => {
        console.log('Loading state changed:', loading, 'Loading message:', loadingMessage);
    }, [loading, loadingMessage]);

    // Function to start trivia during loading
    const startTrivia = () => {
        const ageAppropriateQuestions = getAgeAppropriateQuestions();
        const randomQuestion = ageAppropriateQuestions[Math.floor(Math.random() * ageAppropriateQuestions.length)];
        setCurrentTrivia(randomQuestion);
        setSelectedAnswer(null);
        setShowAnswer(false);
        setShowTrivia(true);
    };

    // Function to complete trivia and proceed to story
    const completeTrivia = () => {
        setShowTrivia(false);
        // If story is ready, it will now be displayed
        // Start reading the story if auto-play is enabled
        if (currentNode && currentNode.story_text && autoPlayEnabled && !loading) {
            setTimeout(() => {
                speakText(currentNode.story_text);
            }, 500);
        }
    };

    // Update the startStory function to include trivia
    const startStory = async () => {
        console.log('startStory: Setting loading to true');
        setLoading(true);
        setError('');
        setStoryReady(false);
        startLoadingMessages(startStoryMessages);
        startTrivia(); // Start trivia when loading begins

        try {
            const response = await axios.post(getApiUrl('/api/story/start'), {
                character,
                theme
            });

            setStoryProgressId(response.data.story_progress_id);
            // Set the story title from the first response
            if (response.data.title) {
                setStoryTitle(response.data.title);
            }
            setCurrentNode({
                title: response.data.title,
                story_text: response.data.story_text,
                illustration_url: response.data.illustration_url,
                illustration_prompt: response.data.illustration_prompt,
                choices: response.data.choices,
                current_node_id: response.data.current_node_id
            });
            console.log('startStory: Success! Setting loading to false');
            stopLoadingMessages();  // Stop the message cycling
            setLoading(false);  // Hide loading screen
            setStoryReady(true); // Story is ready but trivia might still be showing
        } catch (err) {
            console.error('startStory: Error occurred', err);
            stopLoadingMessages();  // Stop the message cycling
            setError('Failed to start the story');
            setLoading(false);  // Hide loading screen
            setShowTrivia(false); // Hide trivia on error
        }
    };

    const handleChoice = async (nextNodeId: string) => {
        try {
            setLoading(true);
            setError('');
            setStoryReady(false);
            startLoadingMessages(continueStoryMessages);
            startTrivia(); // Start trivia when loading begins
            const response = await axios.post(getApiUrl('/api/story/choice'), {
                character,
                theme,
                next_node_id: nextNodeId,
                story_progress_id: storyProgressId
            });

            setCurrentNode({
                story_text: response.data.story_text,
                illustration_url: response.data.illustration_url,
                illustration_prompt: response.data.illustration_prompt,
                choices: response.data.choices,
                current_node_id: response.data.current_node_id
            });
            console.log('makeChoice: Success! Setting loading to false');
            stopLoadingMessages();  // Stop the message cycling
            setLoading(false);  // Hide loading screen
            setStoryReady(true); // Story is ready but trivia might still be showing
        } catch (err) {
            console.error('makeChoice: Error occurred', err);
            stopLoadingMessages();  // Stop the message cycling
            setError('Failed to continue the story');
            setLoading(false);  // Hide loading screen
            setShowTrivia(false); // Hide trivia on error
        }
    };

    // Handle trivia answer selection
    const handleTriviaAnswer = (answerIndex: number) => {
        setSelectedAnswer(answerIndex);
        setShowAnswer(true);

        if (answerIndex === currentTrivia?.correctAnswer) {
            setTriviaScore(triviaScore + 1);
        }

        // Show continue button after a delay
        setTimeout(() => {
            // Button will appear in UI
        }, 1000);
    };

    const speakText = (text: string) => {
        if ('speechSynthesis' in window) {
            // Cancel any ongoing speech
            window.speechSynthesis.cancel();

            // Wait for voices to be loaded if they aren't yet
            const trySpeak = () => {
                const voices = window.speechSynthesis.getVoices();
                if (voices.length === 0) {
                    // If voices aren't loaded yet, try again in 100ms
                    setTimeout(trySpeak, 100);
                    return;
                }

                // Split text into sentences (handling common punctuation)
                const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

                // Create an array of utterances
                const utterances = sentences.map(sentence => {
                    const utterance = new SpeechSynthesisUtterance(sentence.trim());
                    utterance.lang = 'en-US';
                    utterance.rate = 0.9; // Slightly slower for children
                    utterance.pitch = 1.1; // Slightly higher pitch

                    // Use the selected voice if available
                    if (selectedVoice) {
                        const voice = voices.find(v => v.name === selectedVoice);
                        if (voice) {
                            utterance.voice = voice;
                        }
                    } else {
                        // Fallback to finding a child-friendly voice
                        const preferredVoice = voices.find(voice =>
                            voice.name === 'Google US English' ||
                            voice.name.includes('Google US English')
                        );

                        if (preferredVoice) {
                            utterance.voice = preferredVoice;
                        } else {
                            // Fallback to other voices if Google US English not available
                            const fallbackVoice = voices.find(voice =>
                                voice.name.includes('Female') ||
                                voice.name.includes('Samantha') ||
                                voice.name.includes('Victoria') ||
                                voice.name.includes('Google US English Female')
                            );

                            if (fallbackVoice) {
                                utterance.voice = fallbackVoice;
                            }
                        }
                    }

                    return utterance;
                });

                // Set up event handlers for the first utterance
                utterances[0].onstart = () => setIsPlaying(true);
                utterances[utterances.length - 1].onend = () => setIsPlaying(false);
                utterances[utterances.length - 1].onerror = () => setIsPlaying(false);

                // Queue all utterances
                utterances.forEach(utterance => {
                    window.speechSynthesis.speak(utterance);
                });

                speechSynthesisRef.current = utterances[0];
            };

            trySpeak();
        }
    };

    const togglePlayPause = () => {
        if (!window.speechSynthesis) return;

        if (isPlaying) {
            window.speechSynthesis.pause();
            setIsPlaying(false);
        } else if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
            setIsPlaying(true);
        } else if (currentNode) {
            speakText(currentNode.story_text);
        }
    };

    const stopSpeaking = () => {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
            setIsPlaying(false);
        }
    };

    const replay = () => {
        if (currentNode) {
            speakText(currentNode.story_text);
        }
    };

    const handleVoiceChange = (voiceName: string) => {
        setSelectedVoice(voiceName);
        localStorage.setItem('selectedVoice', voiceName);
        setShowVoiceSelector(false);

        // Play a sample with the new voice
        const sampleText = "Hello! I'll be reading your story.";
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(sampleText);
        const voice = availableVoices.find(v => v.name === voiceName);
        if (voice) {
            utterance.voice = voice;
            utterance.rate = 0.9;
            utterance.pitch = 1.1;
            window.speechSynthesis.speak(utterance);
        }
    };

    // Function to get age-appropriate questions
    const getAgeAppropriateQuestions = () => {
        const age = character.age;
        if (age <= 5) {
            return triviaQuestionsByAge.young;
        } else if (age <= 8) {
            return triviaQuestionsByAge.middle;
        } else {
            return triviaQuestionsByAge.older;
        }
    };

    return (
        <>
            <div className="page-header">
                <h1>{storyTitle || `${character.name}'s Adventure`}</h1>
                <p>An interactive story just for you!</p>
            </div>

            <div className="container">
                {(loading || showTrivia) ? (
                    <div className="loading-container" style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <div className="loading-content" style={{ maxWidth: '600px', margin: '0 auto' }}>
                            {/* Only show spinner and loading message if still loading */}
                            {loading && (
                                <>
                                    <div className="spinner" style={{ width: '40px', height: '40px', margin: '0 auto 20px' }}></div>
                                    <h3 style={{ color: '#ffffff', marginBottom: '30px', fontSize: '20px' }}>{loadingMessage}</h3>
                                </>
                            )}

                            {/* Trivia Game */}
                            {currentTrivia && showTrivia && (
                                <div style={{
                                    background: 'rgba(255, 255, 255, 0.95)',
                                    borderRadius: '20px',
                                    padding: '30px',
                                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                                    marginBottom: '20px'
                                }}>
                                    <h4 style={{
                                        color: '#667eea',
                                        marginBottom: '20px',
                                        fontSize: '24px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '10px'
                                    }}>
                                        <span style={{ fontSize: '30px' }}>{currentTrivia.emoji}</span>
                                        Quick Quiz!
                                    </h4>

                                    <p style={{
                                        fontSize: '18px',
                                        color: '#333',
                                        marginBottom: '25px',
                                        fontWeight: '500'
                                    }}>
                                        {currentTrivia.question}
                                    </p>

                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(2, 1fr)',
                                        gap: '10px',
                                        marginBottom: '20px'
                                    }}>
                                        {currentTrivia.options.map((option, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleTriviaAnswer(index)}
                                                disabled={showAnswer}
                                                style={{
                                                    padding: '15px',
                                                    borderRadius: '12px',
                                                    border: showAnswer
                                                        ? (index === currentTrivia.correctAnswer
                                                            ? '3px solid #4ade80'
                                                            : (index === selectedAnswer
                                                                ? '3px solid #f87171'
                                                                : '2px solid #ddd'))
                                                        : (index === selectedAnswer
                                                            ? '3px solid #667eea'
                                                            : '2px solid #ddd'),
                                                    background: showAnswer
                                                        ? (index === currentTrivia.correctAnswer
                                                            ? '#d1fae5'
                                                            : (index === selectedAnswer && index !== currentTrivia.correctAnswer
                                                                ? '#fee2e2'
                                                                : 'white'))
                                                        : (index === selectedAnswer
                                                            ? '#e0e7ff'
                                                            : 'white'),
                                                    cursor: showAnswer ? 'default' : 'pointer',
                                                    fontSize: '16px',
                                                    fontWeight: '500',
                                                    color: '#333',
                                                    transition: 'all 0.3s',
                                                    transform: selectedAnswer === index ? 'scale(1.05)' : 'scale(1)'
                                                }}
                                                onMouseOver={(e) => {
                                                    if (!showAnswer && selectedAnswer !== index) {
                                                        e.currentTarget.style.background = '#f3f4f6';
                                                    }
                                                }}
                                                onMouseOut={(e) => {
                                                    if (!showAnswer && selectedAnswer !== index) {
                                                        e.currentTarget.style.background = 'white';
                                                    }
                                                }}
                                            >
                                                {option}
                                                {showAnswer && index === currentTrivia.correctAnswer && (
                                                    <span style={{ marginLeft: '8px' }}>✓</span>
                                                )}
                                                {showAnswer && index === selectedAnswer && index !== currentTrivia.correctAnswer && (
                                                    <span style={{ marginLeft: '8px' }}>✗</span>
                                                )}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Fun Fact */}
                                    {showAnswer && (
                                        <div style={{
                                            background: '#f3f4ff',
                                            borderRadius: '12px',
                                            padding: '15px',
                                            marginTop: '20px',
                                            animation: 'fadeIn 0.5s ease-in'
                                        }}>
                                            <p style={{
                                                color: '#667eea',
                                                fontWeight: 'bold',
                                                marginBottom: '5px',
                                                fontSize: '16px'
                                            }}>
                                                🌟 Fun Fact!
                                            </p>
                                            <p style={{ color: '#555', fontSize: '14px', margin: 0 }}>
                                                {currentTrivia.funFact}
                                            </p>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div style={{
                                        display: 'flex',
                                        gap: '10px',
                                        justifyContent: 'center',
                                        marginTop: '25px'
                                    }}>
                                        {!showAnswer && (
                                            <button
                                                className="btn btn-secondary"
                                                onClick={completeTrivia}
                                                style={{
                                                    padding: '10px 20px',
                                                    fontSize: '14px'
                                                }}
                                            >
                                                Skip Question
                                            </button>
                                        )}
                                        {showAnswer && (
                                            <button
                                                className="btn"
                                                onClick={completeTrivia}
                                                style={{
                                                    padding: '10px 30px',
                                                    fontSize: '16px',
                                                    animation: 'fadeIn 0.5s ease-in'
                                                }}
                                            >
                                                Continue to Story ➜
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Loading bar - only show if still loading */}
                            {loading && (
                                <div className="loading-progress" style={{
                                    width: '100%',
                                    height: '6px',
                                    backgroundColor: '#e0e0e0',
                                    borderRadius: '3px',
                                    overflow: 'hidden',
                                    marginTop: '20px'
                                }}>
                                    <div className="loading-bar" style={{
                                        width: '100%',
                                        height: '100%',
                                        backgroundColor: '#667eea',
                                        animation: 'loadingAnimation 2s ease-in-out infinite'
                                    }}></div>
                                </div>
                            )}

                            <style>{`
                                @keyframes loadingAnimation {
                                    0% { transform: translateX(-100%); }
                                    100% { transform: translateX(100%); }
                                }
                                @keyframes fadeIn {
                                    from { opacity: 0; transform: translateY(-10px); }
                                    to { opacity: 1; transform: translateY(0); }
                                }
                            `}</style>
                        </div>
                    </div>
                ) : error ? (
                    <div className="card" style={{ textAlign: 'center' }}>
                        <p className="error-message">{error}</p>
                        <button className="btn" onClick={startStory}>Try Again</button>
                    </div>
                ) : currentNode ? (
                    <div className="story-container">
                        {/* Leave Story Button - Centered */}
                        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                            <button
                                className="btn btn-secondary"
                                onClick={() => navigate('/')}
                                style={{ fontSize: '16px', padding: '8px 16px' }}
                            >
                                Leave Story
                            </button>
                        </div>

                        {/* Story Illustration */}
                        {currentNode.illustration_url && (
                            <img
                                src={currentNode.illustration_url}
                                alt="Story scene"
                                className="story-illustration"
                            />
                        )}

                        {/* Story Text */}
                        <div className="story-text">
                            <p>{currentNode.story_text}</p>
                        </div>

                        {/* Audio Controls */}
                        <div className="audio-controls">
                            <button
                                className="audio-btn"
                                onClick={togglePlayPause}
                                title={isPlaying ? "Pause" : "Play"}
                            >
                                {isPlaying ? '⏸️' : '▶️'}
                            </button>
                            <button
                                className="audio-btn"
                                onClick={stopSpeaking}
                                title="Stop"
                            >
                                ⏹️
                            </button>
                            <button
                                className="audio-btn"
                                onClick={replay}
                                title="Replay"
                            >
                                🔄
                            </button>
                            <button
                                className="audio-btn"
                                onClick={() => setShowVoiceSelector(!showVoiceSelector)}
                                title="Choose Voice"
                            >
                                🎤
                            </button>
                        </div>

                        {/* Voice Selector */}
                        {showVoiceSelector && (
                            <div style={{
                                background: 'white',
                                borderRadius: '15px',
                                padding: '20px',
                                marginTop: '20px',
                                boxShadow: '0 5px 20px rgba(0, 0, 0, 0.1)',
                                maxHeight: '300px',
                                overflowY: 'auto'
                            }}>
                                <h4 style={{ marginBottom: '15px', color: '#333' }}>Choose a Voice</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {availableVoices
                                        .filter(voice => voice.lang.startsWith('en'))
                                        .map((voice, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleVoiceChange(voice.name)}
                                                style={{
                                                    padding: '10px 15px',
                                                    borderRadius: '10px',
                                                    border: selectedVoice === voice.name ? '2px solid #667eea' : '1px solid #ddd',
                                                    background: selectedVoice === voice.name ? '#f3f4ff' : 'white',
                                                    cursor: 'pointer',
                                                    textAlign: 'left',
                                                    transition: 'all 0.2s',
                                                    fontSize: '14px'
                                                }}
                                                onMouseOver={(e) => {
                                                    e.currentTarget.style.background = selectedVoice === voice.name ? '#f3f4ff' : '#f8f9fa';
                                                }}
                                                onMouseOut={(e) => {
                                                    e.currentTarget.style.background = selectedVoice === voice.name ? '#f3f4ff' : 'white';
                                                }}
                                            >
                                                <div style={{ fontWeight: '500', color: '#333' }}>{voice.name}</div>
                                                <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                                                    {voice.lang} {voice.localService ? '(Device)' : '(Online)'}
                                                </div>
                                            </button>
                                        ))}
                                </div>
                            </div>
                        )}

                        {/* Story Choices */}
                        {currentNode.choices.length > 0 && (
                            <div style={{ marginTop: '30px' }}>
                                <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>
                                    What should {character.name} do next?
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    {currentNode.choices.map((choice, index) => (
                                        <button
                                            key={index}
                                            className="btn btn-choice"
                                            onClick={() => handleChoice(choice.next_node_id)}
                                            disabled={loading}
                                        >
                                            {choice.text}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* End of story options */}
                        {currentNode.choices.length === 0 && (
                            <div style={{ textAlign: 'center', marginTop: '40px' }}>
                                <h2 style={{ color: '#667eea', marginBottom: '20px' }}>The End!</h2>
                                <p style={{ marginBottom: '30px', fontSize: '18px' }}>
                                    What a wonderful adventure!
                                </p>
                                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                                    <button
                                        className="btn"
                                        onClick={() => navigate('/theme')}
                                    >
                                        New Adventure
                                    </button>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => navigate('/')}
                                    >
                                        Home
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : null}
            </div>
        </>
    );
};

export default StoryDisplay; 