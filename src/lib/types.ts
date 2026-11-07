export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export type Chat = {
  id: number;
  title: string;
  group: string;
};

export type Model = {
  id: string;
  name: string;
  detail: string;
};
