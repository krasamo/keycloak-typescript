import { ISubject } from './ISubject';

export interface IObserver {
  update(subject: ISubject, args: string[]): void;
}
