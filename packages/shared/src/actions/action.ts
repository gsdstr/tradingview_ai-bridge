export interface Action {
  name: string;
  description: string;
  action: () => Promise<void>;
}
