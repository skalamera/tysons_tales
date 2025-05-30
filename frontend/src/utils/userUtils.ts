// Utility functions for managing user identification
import * as uuid from 'uuid';

const USER_ID_KEY = 'tysons_tales_user_id';

export const getUserId = (): string => {
    // Check if user ID exists in localStorage
    const existingUserId = localStorage.getItem(USER_ID_KEY);

    if (existingUserId) {
        return existingUserId;
    }

    // Generate a new one if it doesn't exist
    const newUserId = uuid.v4();
    localStorage.setItem(USER_ID_KEY, newUserId);
    console.log('Generated new user ID:', newUserId);

    return newUserId;
};

export const clearUserId = (): void => {
    // This function can be used if we ever want to "log out" or reset the user
    localStorage.removeItem(USER_ID_KEY);
}; 