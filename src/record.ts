/* eslint-disable @typescript-eslint/naming-convention */
import * as _records from './spec/record-spec.json';
import * as _entries from './spec/entry-spec.json';
import * as _addenda from './spec/addenda-spec.json';

const entries: any = _entries;
const addenda: any = _addenda;

// Reform the spec to be able to index into the correct record via TypeCode
const recordsByTypeCode = Object.entries(_records).reduce((acc: any, [key, value]) => {
    acc[value.TypeCode] = {
        Id: key,
        ...value // spread operator to keep other properties (Description, Fields, etc.)
    };
    return acc;
}, {});

export interface Record {
    Id: string;
    Name: string;
    TypeCode: string;
    Description: string;
    Fields: Field[];
    Line: string;
    getField(position: number): SpecField | null;
}

export interface Field {
    Id: string;
    Name: string;
    StartPosition: number;
    EndPosition: number;
    Description: string;
    Value: string;
    Parent: Record;
}

class FileControlPaddingField implements Field {
    Id: string;
    Name: string;
    StartPosition: number;
    EndPosition: number;
    Description: string;
    Value: string;
    Parent: Record;
    constructor(parent: Record, line: string) {
        this.Parent = parent;
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
    Parent: Record;
    constructor(parent: Record, id: string, spec: any) {
        this.Parent = parent;
        this.Id = id;
        this.Name = spec.Name;
        this.StartPosition = spec.StartPosition - 1;
        this.EndPosition = spec.EndPosition;
        this.Description = spec.Description;
        this.Value = parent.Line.substring(this.StartPosition, this.EndPosition);
    }
}

class SpecRecord implements Record {
    Id: string = "";
    Name: string = "";
    TypeCode: string = "";
    Description: string = "";
    Fields: Field[] = [];
    Line: string = "";

    public getField(position: number): SpecField | null {
        for (const field of this.Fields) {
            if (position >= field.StartPosition && position <= field.EndPosition) {
                return field;
            }
        }
        return null;
    }
}

export function GetRecord(line: string, secCode?: string): Record{
    const record = new SpecRecord();
    record.Line = line;
    record.TypeCode = line.substring(0, 1);
    record.Id = recordsByTypeCode[record.TypeCode].Id;
    record.Name = recordsByTypeCode[record.TypeCode].Name;
    record.Description = recordsByTypeCode[record.TypeCode].Description;

    switch (record.TypeCode) {
        case "6":            
            if (secCode === undefined || secCode === "") {
                throw new Error("An SEC code is required to create an entry record.");
            }
            for (const key in entries[secCode].Fields) {
                let field = new SpecField(record, key, entries[secCode].Fields[key]);
                record.Fields.push(field);
            }
            break;
        case "7":
            const addendaTypeCode = line.substring(1,3);
            for (const key in addenda[addendaTypeCode].Fields) {
                let field = new SpecField(record, key, addenda[addendaTypeCode].Fields[key]);
                record.Fields.push(field);
            }
            break;
        default:
            if (line.startsWith('99999')) {
                record.Fields.push(new FileControlPaddingField(record, line));
            }
            for (const key in recordsByTypeCode[record.TypeCode].Fields) {
                let field = new SpecField(record, key, recordsByTypeCode[record.TypeCode].Fields[key]);
                record.Fields.push(field);
            }
            break;
    }

    return record;
}