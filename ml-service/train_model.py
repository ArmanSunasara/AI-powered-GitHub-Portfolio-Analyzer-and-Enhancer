import tensorflow as tf
from transformers import BertTokenizerFast, TFBertForSequenceClassification
import json

# =========================
# CONFIG
# =========================
MODEL_NAME = "bert-base-uncased"
MAX_LEN = 512
BATCH_SIZE = 8
EPOCHS = 3

# =========================
# LOAD & CLEAN DATA
# =========================
with open("readme_dataset.json") as f:
    raw_data = json.load(f)

# ✅ Clean dataset (VERY IMPORTANT)
data = [
    d for d in raw_data
    if isinstance(d, dict)
    and "readme_text" in d
    and "labels" in d
    and "full_name" in d
]

print(f"Loaded {len(data)} clean samples")

# =========================
# TOKENIZER
# =========================
tokenizer = BertTokenizerFast.from_pretrained(MODEL_NAME)

# =========================
# ENCODING FUNCTION
# =========================
def encode(example):
    encoding = tokenizer(
        example["readme_text"],
        max_length=MAX_LEN,
        padding="max_length",
        truncation=True,
    )

    labels = list(example["labels"].values())

    return {
        "input_ids": encoding["input_ids"],
        "attention_mask": encoding["attention_mask"],
    }, labels

# =========================
# BUILD DATASET
# =========================
input_ids = []
attention_masks = []
labels_list = []

for item in data:
    x, y = encode(item)
    input_ids.append(x["input_ids"])
    attention_masks.append(x["attention_mask"])
    labels_list.append(y)

dataset = tf.data.Dataset.from_tensor_slices((
    {
        "input_ids": input_ids,
        "attention_mask": attention_masks,
    },
    labels_list
))

dataset = dataset.shuffle(1000).batch(BATCH_SIZE).prefetch(tf.data.AUTOTUNE)

# =========================
# MODEL
# =========================
model = TFBertForSequenceClassification.from_pretrained(
    MODEL_NAME,
    num_labels=8,
    problem_type="multi_label_classification"
)

# =========================
# COMPILE
# =========================
loss = tf.keras.losses.BinaryCrossentropy(from_logits=True)

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=2e-5),
    loss=loss,
    metrics=["accuracy"]
)

# =========================
# GPU CHECK (optional)
# =========================
print("Num GPUs Available:", len(tf.config.list_physical_devices('GPU')))

# =========================
# TRAIN
# =========================
model.fit(dataset, epochs=EPOCHS)

# =========================
# SAVE MODEL
# =========================
model.save_pretrained("./readme_bert_model_tf")
tokenizer.save_pretrained("./readme_bert_model_tf")

print("✅ Model saved successfully!")