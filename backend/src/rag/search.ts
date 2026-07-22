import { ChromaClient } from "chromadb";
import { embeddings } from './embeddings.js'

const client = new ChromaClient({
    host: "chromadb",
    port: 8000
})

export const searchDocs = async (query: string): Promise<string> => {
    const collection = await client.getCollection({ name: "support_docs" })

    // now making the embeddings of user query
    const queryEmbedding = await embeddings.embedQuery(query)

    // now finding the similar embeddings in chromadb
    const results = await collection.query({
        queryEmbeddings: [queryEmbedding],
        nResults: 2
    })

    const docs = results.documents[0] as string[]
    return docs.join("\n\n")
}