import { createParser as parserTeste } from "./generate-dom2.js";
import { measure, runAfterFramePaint } from "./measure.js";
let openFirstChunks;

const image = new Image();
image.src = "../../../tae.gif";

document.addEventListener("DOMContentLoaded", function () {
  let inputFile = document.getElementById("arquivo");
  let initialBlock = document.getElementById("index");

  inputFile.addEventListener("click", (e) => initialBlock.remove());

  inputFile.addEventListener("change", function (e) {
    openFirstChunks = measure("paint first chunks", { willAlert: false });
    /** @type {File} */
    let file = e.target.files[0];

    document.getElementById("filename").innerText = file.name;

    (async () => {
      const fileContentStream = file.stream();
      await streamToText(fileContentStream);
    })();
  });

  const streamToText = async (blob) => {
    const readableStream = await blob.getReader({ mode: "byob" });
    const createParserBeta = parserTeste();
    while (true) {
      console.log("começou nova chunk");
      const { done, value } = await readableStream.read(new Uint8Array(1000));
      const text = new TextDecoder().decode(value);

      createParserBeta(text, done);
      // console.log(text.substring(text.length - 6));
      if (done) break;
    }
    runAfterFramePaint(async () => {
      openFirstChunks.finish();
    });
  };
});
