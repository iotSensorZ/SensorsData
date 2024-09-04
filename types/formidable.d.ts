declare module 'formidable' {
    export class IncomingForm {
      constructor(opts?: any);
      parse(req: any, callback?: (err: any, fields: any, files: any) => void): void;
    }
  
    export interface Fields {
      [key: string]: any;
    }
  
    export interface Files {
      [key: string]: any;
    }
  }
  