/* START: THIS SECTION CODE IS CANNOT BE CHANGED, YOU ONLY READ IT */
export interface FieldSchemaType {
  fieldName?: string;
  type:
    | "string"
    | "number"
    | "boolean"
    | "object"
    | "array"
    | "color"
    | "url"
    | "enum"
    | "datetime"
    | "file"
    | "files";
  required?: boolean;
  label?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  options?: string[];
  fields?: FieldSchemaType[];
  item?: FieldSchemaType;
}
/* END: THIS SECTION CODE IS CANNOT BE CHANGED, YOU ONLY READ IT */

export type ConfigurableSchemas = {
  formSchema: FieldSchemaType[];
};



export const configurableSchemas: ConfigurableSchemas = {
  formSchema: [
    {
      fieldName: "appName",
      type: "string",
      required: true,
      label: "App Name",
    },
    {
      fieldName: "logoUrl",
      type: "url",
      required: true,
      label: "Logo URL",
    },
    {
      fieldName: "brandColor",
      type: "object",
      required: true,
      label: "Brand Color",
      fields: [
        {
          fieldName: "primary",
          type: "color",
          required: true,
          label: "Primary",
        },
        {
          fieldName: "secondary",
          type: "color",
          required: true,
          label: "Secondary",
        },
        {
          fieldName: "accent",
          type: "color",
          required: true,
          label: "Accent",
        },
      ],
    },
    {
      fieldName: "tagline",
      type: "string",
      required: false,
      label: "Tagline",
      maxLength: 120,
    },
    {
      fieldName: "heroEyebrow",
      type: "string",
      required: false,
      label: "Hero Eyebrow",
      maxLength: 60,
    },
    {
      fieldName: "heroHeadline",
      type: "string",
      required: false,
      label: "Hero Headline",
      maxLength: 120,
    },
    {
      fieldName: "heroSubcopy",
      type: "string",
      required: false,
      label: "Hero Subcopy",
      maxLength: 280,
    },
    {
      fieldName: "uploadCtaLabel",
      type: "string",
      required: false,
      label: "Upload Button Label",
      maxLength: 60,
    },
    {
      fieldName: "enhanceCtaLabel",
      type: "string",
      required: false,
      label: "Enhance Button Label",
      maxLength: 60,
    },
    {
      fieldName: "downloadCtaLabel",
      type: "string",
      required: false,
      label: "Download Button Label",
      maxLength: 60,
    },
    {
      fieldName: "upscaleFactor",
      type: "number",
      required: false,
      label: "Upscale Factor (x)",
      min: 2,
      max: 8,
    },
    {
      fieldName: "targetGrade",
      type: "string",
      required: false,
      label: "Cinematic Target Grade",
      maxLength: 60,
    },
    {
      fieldName: "footerNote",
      type: "string",
      required: false,
      label: "Footer Note",
      maxLength: 160,
    },
    {
      fieldName: "steps",
      type: "array",
      required: false,
      label: "Pipeline Steps",
      item: {
        type: "object",
        fields: [
          { fieldName: "title", type: "string", required: true, label: "Title" },
          { fieldName: "description", type: "string", required: true, label: "Description" },
        ],
      },
    },
  ],
};