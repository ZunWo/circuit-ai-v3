// Real model runtime smoke test, separate from production and accuracy evaluation.
import * as tmImage from "@teachablemachine/image";
import "@tensorflow/tfjs";

export async function probeModel(baseUrl) {
  const model = await tmImage.load(
    `${baseUrl}model.json`,
    `${baseUrl}metadata.json`,
  );
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 224;
    canvas.height = 224;
    const context = canvas.getContext("2d");
    context.fillStyle = "#808080";
    context.fillRect(0, 0, 224, 224);
    const image = new Image();
    image.src = canvas.toDataURL("image/png");
    await image.decode();
    const predictions = await model.predict(image);
    return {
      labels: model.getClassLabels(),
      outputs: model.getTotalClasses(),
      probabilities: predictions,
      probabilitySum: predictions.reduce(
        (sum, prediction) => sum + prediction.probability,
        0,
      ),
      fixture:
        "uniform gray image; runtime connectivity only, NOT an electronics accuracy test",
    };
  } finally {
    // TM 0.8.5 has an exported-model dispose bug; dispose its loaded network.
    model.model?.dispose?.();
  }
}
