// 1. Import required modules
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OpenAI } from "langchain/llms/openai";
import { loadQAStuffChain } from "langchain/chains";
import { Document } from "langchain/document";
import { BufferMemory } from "langchain/memory";

// 2. Export the queryPineconeVectorStoreAndQueryLLM function
export const queryPineconeVectorStoreAndQueryLLM = async (
  client,
  indexName,
  question
) => {
// 3. Start query process
// const question = "please can you list all the products for me";
  console.log("Querying Pinecone vector store...");
// 4. Retrieve the Pinecone index
  const index = client.Index(indexName);
// 5. Create query embedding
  const queryEmbedding = await new OpenAIEmbeddings().embedQuery(question );
// 6. Query Pinecone index and return top 10 matches
  let queryResponse = await index.query({
      topK: 10,
      vector: queryEmbedding,
      includeMetadata: true,
      includeValues: true,
  });
  // 7. Log the number of matches 
console.log(`Found ${queryResponse.matches.length} matches...`);
// 8. Log the question  being asked
  console.log(`Asking question : ${question }...`);

  if (queryResponse.matches.length) {
// 9. Create an OpenAI instance and load the QAStuffChain
    const llm = new OpenAI({ openAIApiKey: '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',
  temperature: 0,});
    const memory = new BufferMemory();
    const chain = loadQAStuffChain(llm);
// 10. Extract and concatenate page content from matched documents
    const concatenatedPageContent = queryResponse.matches
      .map((match) => match.metadata.pageContent)
      .join(" ");
// 11. Execute the chain with input documents and query 
    const result = await chain.call({
      input_documents: [new Document({ pageContent: concatenatedPageContent })],
      question : question ,
      memory: memory,
    });
// 12. Log the answer
    console.log(`Answer: ${result.text}`);
    return result.text; // Return the GPT-3 answer text
  } else {
// 13. Log that there are no matches, so GPT-3 will not be queried
    console.log("Since there are no matches, GPT-3 will not be queried.");
  }
};


// 7. Log the number of matches 
// console.log(`Found ${queryResponse.matches.length} matches...`);
// // 8. Log the question  being asked
//   console.log(`Asking question : ${question }...`);



//   if (queryResponse.matches.length) {
// // 9. Create an OpenAI instance and load the QAStuffChain
//     const llm = new OpenAI({ openAIApiKey: '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',
  // temperature: 0,});
//     const memory = new BufferMemory();
//     const chain = loadQAStuffChain(llm);
// // 10. Extract and concatenate page content from matched documents
//     const concatenatedPageContent = queryResponse.matches
//       .map((match) => match.metadata.pageContent)
//       .join(" ");
// // 11. Execute the chain with input documents and query 
//     const result = await chain.call({
//       input_documents: [new Document({ pageContent: concatenatedPageContent })],
//       question : question ,
//       memory: memory,
//     });
// // 12. Log the answer
//     console.log(`Answer: ${result.text}`);
//     return result.text; // Return the GPT-3 answer text
//   } else {
// // 13. Log that there are no matches, so GPT-3 will not be queried
//     console.log("Since there are no matches, GPT-3 will not be queried.");