import { atom } from "recoil";

type NotificationModalState = boolean;
const defaultState = false;

export const notificationModalStateAtom = atom<NotificationModalState>({
  key: "notificationModalKey",
  default: defaultState,
});
