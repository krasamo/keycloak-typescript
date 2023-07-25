// Interfaces
import { IObserver } from './IObserver';

export abstract class ISubject {
  protected observers: IObserver[] = [];

  public attach(observer: IObserver): void {
    this.observers.push(observer);
  }
  public detach(observer: IObserver): void {
    if (this.observers.includes(observer)) {
      const observerIndex = this.observers.indexOf(observer, 0);

      if (observerIndex >= 0) this.observers.splice(observerIndex, 1);
    }
  }

  protected abstract notify(): void;
}
