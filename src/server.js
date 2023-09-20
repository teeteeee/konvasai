import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
// import axios from 'axios';
import { Pinecone } from '@pinecone-database/pinecone';
import { initializeAgentExecutorWithOptions } from 'langchain/agents';
import { PromptTemplate } from "langchain/prompts";
import { BufferMemory } from "langchain/memory";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { JSONLoader, JSONLinesLoader, } from "langchain/document_loaders/fs/json";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { CSVLoader } from "langchain/document_loaders/fs/csv";
import { createPineconeIndex } from './indexes/vectorDBs/createPineconeIndex.js';
import { updatePinecone } from './indexes/vectorDBs/updatePinecone.js';
import { queryPineconeVectorStoreAndQueryLLM } from './indexes/vectorDBs/queryPineconeAndQueryGPT.js';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { RequestsGetTool } from 'langchain/tools';
import { buyerInfo } from './templates/index.js';
import { 
    getProductInfo,
    // konvasQATool
 } from './tools/index.js';


import { OpenAI } from 'langchain/llms/openai';
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { RetrievalQAChain } from 'langchain/chains';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { loadPrompt } from 'langchain/prompts/load';
import { HumanMessage, SystemMessage } from 'langchain/schema';
import { DynamicTool } from 'langchain/tools';
import { VectorDBQAChain } from 'langchain/chains';
import { ConversationChain } from "langchain/chains";
import * as fs from 'fs';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url'; // This is used to convert import.meta.url to a file path
import { ChainTool } from 'langchain/tools';

dotenv.config();

const app = express();

// Allow requests from 'https://postnicu.com'
app.use(cors({
  origin: 'https://konvas.app'
}));

// ... rest of your server setup

app.use(express.json());



// ... rest of your server setup

app.use(cors({ origin: 'https://konvas.app' }));
  
// app.use(cors({ origin: 'https://konvas.app' }));

const PORT = process.env.PORT || 800;


const model = new ChatOpenAI({
    openAIApiKey: "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",
    temperature: 0,
  });
const memory = new BufferMemory();
const tools = [
    getProductInfo,
    // konvasQATool,
  ];

const promptTemplate = new PromptTemplate({
template: buyerInfo,
inputVariables: ['userPrompt'],
});

const client = new Pinecone({ 
    apiKey: "9617f755-9b13-47ee-8837-76c8f61f3c48",
    // process.env.PINECONE_API_KEY,
    environment: process.env.PINECONE_ENVIRONMENT
})

const pineconeIndex = client.Index(process.env.PINECONE_INDEX);
const API_KEY = process.env.EXTERNAL_API_KEY;

const vectorDimension = 1536;


app.post('/chat', async (req, res) => {
    const { question } = req.body;
    
    const formattedPromptValue = await promptTemplate.format({
      userPrompt: question,
    });
    
    try {
      // loaded agent
      const executor = await initializeAgentExecutorWithOptions(tools, model, {
        agentType: 'chat-conversational-react-description',
        maxIterations: 3,
      });
    
      const result = await executor.call({
        input: formattedPromptValue.toString(),
      });
    //  console.log('tool result', result);
  
      const data = {
        room: 'konvasai room',
        author: 'Konvas AI',
        question: result.output,
        isTyped: true,
        time: `${new Date(Date.now()).getHours()}:${new Date(
          Date.now()
        ).getMinutes()}`,
      };
  
      return res.status(200).json({ data });
    } catch (error) {
      console.log('error', error);
    }
  });


  app.get('/:folderName', async (req, res) => {
    const folderName = req.params.folderName;
  
    // Determine indexName based on folderName
    const indexName = folderName + "-index";
  console.log("indexName", indexName);
     
const vectorDimension = 1536;
  const loader = new DirectoryLoader(`./documents/${folderName}`,
  {
    ".json": (path) => new JSONLoader(path, "/texts"),
    ".jsonl": (path) => new JSONLinesLoader(path, "/html"),
    ".txt": (path) => new TextLoader(path),
    ".csv": (path) => new CSVLoader(path, "text"),
  }
  );
  const docs = await loader.load();
  try {
    await createPineconeIndex(client, indexName, vectorDimension);
    await updatePinecone(client, indexName, docs);
  
    res.send(`Created and updated Pinecone index for ${folderName}: ${indexName}`);
  
   
  } catch (error) {
    // Folder doesn't exist, create a new Pinecone index
   console.log('error creating and update pinecone', error);
    res.send(`Error creating and updating Pinecone index for ${folderName}: ${indexName}`);
  }
  
  });
  

app.get('/hello', (req, res) => {
  res.send('Hello, World!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
