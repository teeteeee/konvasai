// 1. Import required modules
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OpenAI } from "langchain/llms/openai";
import { loadQAStuffChain } from "langchain/chains";
import { Document } from "langchain/document";
import { BufferMemory } from "langchain/memory";



export const queryPineconeVectorStoreAndQueryLLM = async (client, indexName, question) => {
  try {
    console.log("Querying Pinecone vector store...");

    const index = client.Index(indexName);

    console.log('Question:', question);

    const queryEmbedding = await (new OpenAIEmbeddings()).embedQuery(question);

    console.log('Query embedding:', queryEmbedding);

    const queryResponse = await index.query({
      topK: 10,
      vector: queryEmbedding,
      includeMetadata: true,
      includeValues: true,
    });

    console.log(`Found ${queryResponse.matches.length} matches...`);
    console.log(`Asking question: ${question}...`);

    if (queryResponse.matches.length) {
      const llm = new OpenAI({ openAIApiKey: process.env.OPENAI_API_KEY,
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
    
      // ... rest of the code ...
    } else {
      console.log("Since there are no matches, GPT-3 will not be queried.");
    }
  } catch (error) {
    console.error('An error occurred:', error);
    throw error;  // Re-throw the error for handling at a higher level if needed
  }
};

