import { atom } from "recoil";

type NotificationState = {
  notificationPanelOpen: boolean;
  allNotificationsRead: boolean;
  loading: boolean;
};
const defaultState: NotificationState = {
  allNotificationsRead: false,
  notificationPanelOpen: false,
  loading: true,
};

export const notificationStateAtom = atom<NotificationState>({
  key: "notificationModalKey",
  default: defaultState,
});
