import SignalManager from "./SignalManager";
import { DateType } from "./types";
import EventEmitter from "events";

export const getRandomInt = (min: number, max: number) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
};

export const getBaseDir = () => {
  if (process.env.BRANCH_LISTENER_MAIN_DIR) {
    return `${process.env.BRANCH_LISTENER_MAIN_DIR}/`;
  } else if (process.cwd().endsWith("/branch-listener")) {
    return `${process.cwd()}/`;
  }
  throw new Error(
    "Unrecognized branch listener root path! Please, reinstall the program!"
  );
};

export const getDateType = (date: Date): DateType => {
  const custom_date = {
    year: date.getFullYear(),
    month: date.getMonth(),
    day: date.getDate(),
    hour: date.getHours(),
    minutes: date.getMinutes(),
  };

  return custom_date;
};

export const parseDate = (date: DateType) => {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  let minutes: string;
  if (String(date.minutes).length < 2) minutes = `0${date.minutes}`;
  else minutes = String(date.minutes);

  return `${date.hour}:${minutes} - ${date.day} ${monthNames[date.month]}, ${
    date.year
  }`;
};

export const isArrayHasAnyEmptyObject = (array: object[]) => {
  if (!array || array.length === 0) return true;

  for (const obj of array) {
    if (typeof obj !== "object") throw new Error("The element is not object!");

    return Object.keys(obj).length === 0;
  }

  return false;
};

export const signalManager = new SignalManager();

export const Events = new EventEmitter();

export const isArraysEqual = (a: unknown[], b: unknown[]) => {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
};

export const msToSec = (ms: number) => ms / 1000;
