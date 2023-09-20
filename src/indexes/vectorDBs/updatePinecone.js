// 1. Import required modules
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Pinecone } from '@pinecone-database/pinecone';
const client = new Pinecone({ 
  apiKey: "9617f755-9b13-47ee-8837-76c8f61f3c48",
  // process.env.PINECONE_API_KEY,
  environment: "us-west1-gcp-free" 
})

// 2. Export updatePinecone function
export const updatePinecone = async (client, indexName, docs) => {
  console.log("Retrieving Pinecone index...");
// 3. Retrieve Pinecone index
  const index = client.Index(indexName);
// 4. Log the retrieved index name
  console.log(`Pinecone index retrieved: ${indexName}`);
// 5. Process each document in the docs array
  for (const doc of docs) {
    console.log(`Processing document: ${doc.metadata.source}`);
    const txtPath = doc.metadata.source;
    const text = doc.pageContent;
// 6. Create RecursiveCharacterTextSplitter instance
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
    });
    console.log("Splitting text into chunks...");
// 7. Split text into chunks (documents)
    const chunks = await textSplitter.createDocuments([text]);
    console.log(`Text split into ${chunks.length} chunks`);
    console.log(
      `Calling OpenAI's Embedding endpoint documents with ${chunks.length} text chunks ...`
    );
// 8. Create OpenAI embeddings for documents
    const embeddingsArrays = await new OpenAIEmbeddings().embedDocuments(
      chunks.map((chunk) => chunk.pageContent.replace(/\n/g, " "))
    );
    console.log("Finished embedding documents");
    console.log(
      `Creating ${chunks.length} vectors array with id, values, and metadata...`
    );
// 9. Create and upsert vectors in batches of 100
    const batchSize = 100;
    let batch = [];
    
    for (let idx = 0; idx < chunks.length; idx++) {
      const chunk = chunks[idx];
      const vector = {
        id: `${txtPath}_${idx}`,
        values: embeddingsArrays[idx],
        metadata: {
          ...chunk.metadata,
          loc: JSON.stringify(chunk.metadata.loc),
          pageContent: chunk.pageContent,
          txtPath: txtPath,
        },
      };
      batch.push(vector);

      // if (batch.length > 0) {
      //   await index.upsert(batch
      //   );
      // } else {
      //   console.log('No vectors to upsert.');
      // }
      
      // // Empty the batch
      // batch = [];
      
      // When batch is full or it's the last item, upsert the vectors
      if (batch.length === batchSize || idx === chunks.length - 1) 
      {
        
        await index.upsert(
             batch
        );
        // Empty the batch 
        batch = [];
      }
      
// {
  
//   let insertBatches = [];
//       let pineconeResult = await index.upsert({
//         upsertRequest: { //added line
//           vectors: batch
//        } // added line
       
//   });
  
//   insertBatches.push(pineconeResult);
// }
    }
// 10. Log the number of vectors updated
    console.log(`Pinecone index updated with ${chunks.length} vectors`);
  }
};