import User from "./User";

export enum Language {
  FR = 'FR',
  EN = 'EN',
  AR = 'AR',
}

export const default_preference = {
  language: Language.EN,
  notifications: true,
  darkMode: false,
  cigarette: 1,
  discussion: 1,
  music: 1,
  pets: 1,
  luggage: 1
} as any


export default interface Preference {
  user?: User;
  language: Language;
  notifications: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  /* preferences indexes 
  * index [0] okay 
  * index [1] maybe
  * index [3] not okay 
  */

  darkMode: boolean;
  cigarette: Number;
  discussion: Number;
  music: Number;
  pets: Number;
  luggage: Number;
}