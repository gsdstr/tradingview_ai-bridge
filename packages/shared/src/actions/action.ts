import type { StandardSchemaV1 } from '@standard-schema/spec';

export interface Action<
  InputSchema extends StandardSchemaV1 | undefined = undefined,
  OutputSchema extends StandardSchemaV1 | undefined = undefined,
> {
  name: string;
  shortDescription: string;
  description: string;
  inputSchema?: InputSchema;
  outputSchema?: OutputSchema;
  action: (
    ...args: InputSchema extends StandardSchemaV1
      ? [input: StandardSchemaV1.InferOutput<InputSchema>]
      : []
  ) => Promise<
    OutputSchema extends StandardSchemaV1
      ? StandardSchemaV1.InferInput<OutputSchema>
      : void
  >;
}
