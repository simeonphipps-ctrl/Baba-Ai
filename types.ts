export type Sender = 'user' | 'ai';

export interface Message {
  id: string;
  text: string;
  sender: Sender;
}

export type Persona = 'pidgin' | 'yoruba';
