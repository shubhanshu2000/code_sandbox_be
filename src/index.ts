const fastify = require("fastify")({ logger: true });
const fs = require("fs");
const path = require("path");
const cors = require("@fastify/cors");

fastify.register(cors, {
  origin: true,
});

// Function to recursively get the file structure
const getFileStructure: any = (dir: string) => {
  const result = [];
  const items = fs.readdirSync(dir);
  for (let item of items) {
    const fullPath = path.join(dir, item);
    const stats = fs.statSync(fullPath);
    if (stats.isDirectory()) {
      result.push({
        name: item,
        type: "folder",
        children: getFileStructure(fullPath),
      });
    } else {
      const content = fs.readFileSync(fullPath, "utf-8");
      let lang = path.extname(item).split(".")[1];
      lang = lang === "js" ? "javascript" : lang === "ts" ? "typescript" : lang;
      result.push({ name: item, type: "file", content, lang });
    }
  }
  return result;
};

fastify.get("/file-structure", async (request: Request, reply: Response) => {
  const directoryPath = path.join(__dirname, "../sandbox_code"); // Adjust your directory path
  const fileStructure = getFileStructure(directoryPath);

  return fileStructure;
});

fastify.post("/update-file", async (request: any, reply: any) => {
  const { filePath, content } = request.body;
  console.log(filePath, content);
  const fullPath = path.join(__dirname, "../sandbox_code", filePath);

  try {
    fs.writeFileSync(fullPath, content, "utf-8");
    reply.send({ success: true });
  } catch (error: any) {
    reply.status(500).send({ success: false, error: error.message });
  }
});

const start = async () => {
  try {
    await fastify.listen(3333);
    fastify.log.info(`server listening on ${fastify.server.address().port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
