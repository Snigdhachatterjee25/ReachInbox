export interface Sender {
  id: string;
  email: string;
  name: string | null;
  active: boolean;
}

export interface CreateSenderInput {
  email: string;
  name?: string;
}
