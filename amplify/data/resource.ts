import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  BedrockResponse: a.customType({
    body: a.string(),
    error: a.string(),
  }),

  knowledgeBase: a
    .query()
    .arguments({ input: a.string() })
    .handler(
      a.handler.custom({
        dataSource: "KnowledgeBaseDataSource",
        entry: "./resolvers/kbResolver.js",
      }),
    )
    .returns(a.string())
    .authorization((allow) => allow.authenticated()),

  askBedrock: a
    .query()
    .arguments({ ingredients: a.string().array() })
    .returns(a.ref("BedrockResponse"))
    .authorization((allow) => [allow.authenticated()])
    .handler(
      a.handler.custom({ entry: "./bedrock.js", dataSource: "bedrockDS" })
    ),

  // askKnowledgeBase2: a
  //   .query()
  //   .arguments({ doryquestion: a.string().array() })
  //   .returns(a.ref("BedrockResponse"))
  //   .authorization((allow) => [allow.authenticated()])
  //   .handler(
  //     a.handler.custom({
  //       entry: "./bedrock.js",
  //       dataSource: "KnowledgeBaseDataSource",
  //     })
  //   ),
  //
  askKnowledgeBase: a
    .conversation({
      aiModel: a.ai.model("Claude 3.5 Sonnet"),
      systemPrompt: `You are a helpful assistant.`,
      tools: [
        a.ai.dataTool({
          name: 'searchDocumentation',
          description: 'Performs a similarity search over the documentation for ...',
          query: a.ref('knowledgeBase'),
        }),
      ],
    })
    .authorization((allow) => allow.owner()),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
