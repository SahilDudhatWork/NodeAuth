const { Schema, model } = require("mongoose");

const collectionSchema = new Schema(
  {
    slug: {
      type: String,
    },
    title: {
      type: String,
    },
    subTitle: {
      type: String,
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = model("cms", collectionSchema);
