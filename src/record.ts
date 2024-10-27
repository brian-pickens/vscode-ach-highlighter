import * as spec from './nacha-spec.json';

// Reform the spec to be able to index into the correct record via TypeCode
const indexedSpec = Object.entries(spec).reduce((acc: any, [key, value]) => {
    acc[value.TypeCode] = {
      Id: key,
      ...value // spread operator to keep other properties (Description, Fields, etc.)
    };
    return acc;
  }, {});

interface Field {
    Id: string;
    Name: string;
    StartPosition: number;
    EndPosition: number;
    Description: string;
    Value: string;
}

class FileControlPaddingField implements Field {
    Id: string;
    Name: string;
    StartPosition: number;
    EndPosition: number;
    Description: string;
    Value: string;
    constructor(line: string){
        this.Id = "FileControlPadding";
        this.Name = "File Control Padding";
        this.StartPosition = 0;
        this.EndPosition = 94;
        this.Description = "Special 9 line ensures total number of lines are divisible by 10.";
        this.Value = line;
    }
}

class SpecField implements Field {
    Id: string;
    Name: string;
    StartPosition: number;
    EndPosition: number;
    Description: string;
    Value: string;
    constructor(parent: Record, fieldId: string){
        this.Id = fieldId;
        this.Name = indexedSpec[parent.TypeCode].Fields[fieldId].Name;
        this.StartPosition = indexedSpec[parent.TypeCode].Fields[fieldId].StartPosition-1;
        this.EndPosition =indexedSpec[parent.TypeCode].Fields[fieldId].EndPosition;
        this.Description = indexedSpec[parent.TypeCode].Fields[fieldId].Description;
        this.Value = parent.Line.substring(this.StartPosition, this.EndPosition);
    }
}

export class Record {
    Id: string;
    Name: string;
    TypeCode: string;
    Description: string;
    Fields: Field[] = [];
    Line: string;

    constructor(line: string){
        this.Line = line;
        this.TypeCode = line.substring(0,1);
        this.Name = indexedSpec[this.TypeCode].Name;
        this.Id = indexedSpec[this.TypeCode].Id;
        this.Description = indexedSpec[this.TypeCode].Description;

        if (line.startsWith('99999')) {
            this.Fields.push(new FileControlPaddingField(line));
        }

        for (const key in indexedSpec[this.TypeCode].Fields) {
            let field = new SpecField(this, key);
            this.Fields.push(field);
        }
    }

    public getField(position: number): SpecField|null {
        for (const field of this.Fields) {
            if (position >= field.StartPosition && position <= field.EndPosition) {
                return field;
            }
        }
        return null;
    }
}