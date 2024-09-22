declare module 'skulpt' {
    export function configure(config: any): void;
    export function importMainWithBody(filename: string, run: boolean, body: string): void;
    // Add any other functions you plan to use
  }
  