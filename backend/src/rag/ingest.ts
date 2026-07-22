import { ChromaClient } from 'chromadb'
import { embeddings } from './embeddings.js'
import fs from 'fs'
import path from 'path'

const client = new ChromaClient({
    host: "chromadb",
    port: 8000
})


// this is occurs only one time to store the embeddings of docs in vector db
export const ingestDocs = async () => {

    const collections = await client.listCollections()

    if (collections.some((c: any) => c.name === "support_docs")) {
        console.log("already ingested, skipping...");
        return
    }

    // if not
    const collection = await client.getOrCreateCollection({
        name: "support_docs"
    })

    const docsPath = path.join(process.cwd(), "docs")
    const files = fs.readdirSync(docsPath)

    for (const file of files) {
        const content = fs.readFileSync(path.join(docsPath, file), "utf-8")

        // hugging face api call to generate embeddings - array of numbers
        const embedding = await embeddings.embedQuery(content)

        await collection.add({
            ids: [file],
            documents: [content],
            embeddings: [embedding],
            metadatas: [{ filename: file }]
        })

        console.log(`ingested:${file}`);

    }
    console.log('all docs ingested');
}