/* eslint-disable @typescript-eslint/no-explicit-any */
class PatientLoad {
  sources: Record<string, any> = {};

  private readonly _sources = new Map<string, any>();

  private readonly _awaiting = new Map<string, (s: any) => void>();

  setSource<T>(id: string, source: T) {
    this.sources[id] = source;

    this._checkAwaiting(id);
  }

  getSource<T>(id: string, getter: (s: T) => void) {
    const source = this._sources.get(id);

    if (source) {
      getter(source);
    } else {
      this._awaiting.set(id, getter);
    }
  }

  private _checkAwaiting(id: string) {
    const getter = this._awaiting.get(id);

    if (getter) {
      const source = this.sources.get(id);
      getter(source);
      this._awaiting.delete(id);
    }
  }
}

const patientLoad = new PatientLoad();

export { patientLoad };
