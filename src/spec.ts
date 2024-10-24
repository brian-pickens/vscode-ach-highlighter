import * as spec from './nacha-spec.json' assert { type: "json" };

// Reform the spec to be able to index into the correct record via TypeCode
const indexedSpec = Object.entries(spec).reduce((acc: any, [key, value]) => {
    acc[value.TypeCode] = {
      Id: key,
      ...value // spread operator to keep other properties (Description, Fields, etc.)
    };
    return acc as SpecRecord;
  }, {});

export interface SpecRecord {
    Id: string;
    TypeCode: string;
    Description: string;
    Fields: SpecField[];
}

export interface SpecField {
    Id: string;
    StartPosition: number;
    EndPosition: number;
    Description: string;
}

export class Record implements SpecRecord {
    Id: string;
    TypeCode: string;
    Description: string;
    Fields: SpecField[] = [];
    Line: string;

    constructor(line: string){
        this.Line = line;
        this.TypeCode = line.substring(0,1);
        this.Id = indexedSpec[this.TypeCode].Id;
        this.Description = indexedSpec[this.TypeCode].Description;
        // for (const key in indexedSpec[this.TypeCode].Fields) {
        //     this.Fields.push(new Field) {

        //     }
        // }
    }
}