import fs from "fs/promises";
import path from "path";
import Ajv from "ajv";
import { createSchema } from "genson-js";
import addFormats from "ajv-formats"


const SCHEMA_BASE_PATH = "./response-schemas";
const ajv = new Ajv({ allErrors: true });
addFormats(ajv)



export async function validateSchema(
  dirName: string,
  fileName: string,
  responseBody: object,
  createSchemaFlag: boolean = false,
) {
  const schemaPath = path.join(
    SCHEMA_BASE_PATH,
    dirName,
    `${fileName}_schema.json`,
  );

  if (createSchemaFlag) await generateNewSchema(responseBody, schemaPath)

  const schema = await loadSchema(schemaPath);
  const validate = ajv.compile(schema);

  const valid = validate(responseBody);
  if (!valid) {
    throw new Error(
      `Schema validation ${fileName}_schema.json failed\n` +
        `${JSON.stringify(validate.errors, null, 4)}\n\n` +
        `Actual response body: \n` +
        `${JSON.stringify(responseBody, null, 4)}`,
    );
  }
}

async function loadSchema(schemaPath: string) {
  try {
    const schemaContent = await fs.readFile(schemaPath, "utf-8");
    return JSON.parse(schemaContent);
  } catch (error: any) {
    throw new Error(`Failed to read the schema file: ${error.message}`);
  }
}


async function generateNewSchema(responseBody:object, schemaPath: string) {
    try {
      let generatedSchema = createSchema(responseBody);

      // Add date-time format to createdAt and updatedAt fields
      generatedSchema = addDateTimeFormat(generatedSchema);

      await fs.mkdir(path.dirname(schemaPath), { recursive: true });
      await fs.writeFile(schemaPath, JSON.stringify(generatedSchema, null, 4))
    } catch (error: any) {
        throw new Error(`Failed to create schema file: ${error.message}`)
    }
}

function addDateTimeFormat(schema: any): any {
  if (typeof schema !== 'object' || schema === null) {
    return schema;
  }

  // Add date-time format to createdAt and updatedAt fields
  if (schema.properties) {
    if (schema.properties.createdAt && schema.properties.createdAt.type === 'string') {
      schema.properties.createdAt.format = 'date-time';
    }
    if (schema.properties.updatedAt && schema.properties.updatedAt.type === 'string') {
      schema.properties.updatedAt.format = 'date-time';
    }
    
    // Recursively process nested properties
    for (const key in schema.properties) {
      schema.properties[key] = addDateTimeFormat(schema.properties[key]);
    }
  }

  // Handle items (for arrays of objects)
  if (schema.items) {
    schema.items = addDateTimeFormat(schema.items);
  }

  return schema;
}
