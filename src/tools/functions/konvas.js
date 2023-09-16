import { queryPineconeVectorStoreAndQueryLLM } from "../../indexes/vectorDBs/queryPineconeAndQueryGPT.js";
import { Pinecone } from '@pinecone-database/pinecone';
const client = new Pinecone({ 
    apiKey: '9617f755-9b13-47ee-8837-76c8f61f3c48',
    environment: 'us-west1-gcp-free'
})

const indexName = "sky-index";

export const getProductsDetails = async (question) => {
  const queryResponse = await queryPineconeVectorStoreAndQueryLLM(client, indexName, question);
  return queryResponse;    
};