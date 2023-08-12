Inference is the process of using machine learning model to predict the outcome of a given input record. 
Inference typically requires low latency to ensure a smooth customer experience. This post will outline 
a few options for optimizing inference operation. 

ONNX is designed to allow framework interoperability and hardware optimization accessibility 
among other things. ONNX provides a common set of operators called opset that allows developers 
to move between various frameworks easily. A shared model file format provides separation between development and deployment stages, which means ML models can be deployed on a wide scale of hardware devices irrespective of the framework that was used to train the model.

[Example](https://github.com/microsoft/onnxruntime-training-examples/blob/master/QnA-finetune/inference.py) of a transformer model being converted into ONNX format:
```python

    model = AutoModelForQuestionAnswering.from_pretrained("distilbert-base-uncased")
    model.load_state_dict(torch.load("pytorch_model.bin", map_location=torch.device(device)))
    model.eval()

    # if using onnnxruntime, convert to onnx format
    # ORT Python API Documentation: https://onnxruntime.ai/docs/api/python/api_summary.html
    if args.ort:
        if not os.path.exists("model.onnx"):
            torch.onnx.export(model, \
                            (input_ids, attention_mask), \
                            "model.onnx", \
                            input_names=["input_ids", "attention_mask"], \
                            output_names=["start_logits", "end_logits"]) 

        sess = onnxruntime.InferenceSession("model.onnx", providers=["CUDAExecutionProvider", "CPUExecutionProvider"])
        ort_input = {
                "input_ids": np.ascontiguousarray(input_ids.numpy()),
                "attention_mask" : np.ascontiguousarray(attention_mask.numpy()),
            }

    input_ids = input_ids.to(device)
    attention_mask = attention_mask.to(device)
    model.to(device)

```

Given the input is a question, here is how the model is used for conversation inference

```python

    if args.ort:
        # NOTE: this copies data from CPU to GPU
        # since our data is small, we are still faster than baseline pytorch
        # refer to ORT Python API Documentation for information on io_binding to explicitly move data to GPU ahead of time
        output = sess.run(None, ort_input)
    else:
        output = model(input_ids, attention_mask=attention_mask)
```
