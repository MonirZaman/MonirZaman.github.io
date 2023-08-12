Inference is the process of using machine learning model to predict the outcome of a given input record. 
Inference typically requires low latency to ensure a smooth customer experience. This post will outline 
a few options for optimizing inference operation. 

ONNX is designed to allow framework interoperability and hardware optimization accessibility 
among other things. ONNX provides a common set of operators called opset that allows developers 
to move between various frameworks easily. A shared model file format provides separation between development and deployment stages, which means ML models can be deployed on a wide scale of hardware devices irrespective of the framework that was used to train the model.

Example of a transformer model being converted into ONNX format:
```python
    model = AutoModelForQuestionAnswering.from_pretrained("distilbert-base-uncased")
    model.load_state_dict(torch.load("pytorch_model.bin", map_location=torch.device(device)))
    model.eval()

    if args.ort:
        from onnxruntime.training import ORTModule
        model = ORTModule(model)

```

Given the input is a question, here is how the model is used for conversation inference

```python
        encoding = tokenizer(question, context, return_tensors="pt")
        input_ids, attention_mask = encoding["input_ids"], encoding["attention_mask"]

        input_ids = input_ids.to(device)
        attention_mask = attention_mask.to(device)
        model.to(device)

        # run inference
        start = time.time()
        output = model(input_ids, attention_mask=attention_mask)
        end = time.time()

        # postprocess test data
        if args.ort:
            # ORT returns raw tensors
            max_start_logits = output[0][0].argmax()
            max_end_logits = output[1][0].argmax()
        else:
            # pytorch returns a dictionary of tensors
            max_start_logits = output.start_logits[0].argmax()
            max_end_logits = output.end_logits[0].argmax()
        ans_tokens = input_ids[0][max_start_logits: max_end_logits + 1]
        answer_tokens = tokenizer.convert_ids_to_tokens(ans_tokens, skip_special_tokens=True)
        answer_tokens_to_string = tokenizer.convert_tokens_to_string(answer_tokens)
```
