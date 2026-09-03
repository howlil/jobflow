export type ControlKind =
  | 'input'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'file';

export type FieldOption = {
  value: string;
  label: string;
};

export type ExperienceRecordField =
  | 'company'
  | 'title'
  | 'employmentType'
  | 'location'
  | 'startDate'
  | 'endDate'
  | 'current'
  | 'description';

export type EducationRecordField =
  | 'institution'
  | 'degree'
  | 'fieldOfStudy'
  | 'location'
  | 'startDate'
  | 'endDate'
  | 'gpa'
  | 'maxGpa'
  | 'description';

export type StructuredRecordContext =
  | {
      kind: 'experience';
      recordIndex: number;
      field: ExperienceRecordField;
    }
  | {
      kind: 'education';
      recordIndex: number;
      field: EducationRecordField;
    };

export type FieldContext = {
  controlKind: ControlKind;
  inputType: string;
  label: string;
  name: string;
  id: string;
  placeholder: string;
  ariaLabel: string;
  options: FieldOption[];
  sectionText: string;
  origin: string;
  formFingerprint: string;
  fieldFingerprint: string;
  structuredRecord?: StructuredRecordContext;
};