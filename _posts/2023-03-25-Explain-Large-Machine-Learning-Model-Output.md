In this post I will explain Integrated Gradient, a popular technique to explain black box type machine learning model. 

Integrated Gradients is an axiomatic model interpretability algorithm that assigns an importance score to each input feature by approximating the integral of gradients of the model’s output with respect to the inputs along the path (straight line) from given baselines / references to inputs1. It computes the gradient of the model’s prediction output to its input features and requires no modification to the original deep neural network. It can be applied to any differentiable model like image, text, or structured data.

In other words, Integrated Gradients is a way to make a classification model interpretable. A baseline is defined which has no effect on the classification result. Then, in a few steps, interpolations are given to the model and the gradient is used to determine what influence the individual inputs have on the result.

The way it works is that it calculates gradients for a given output with respect to all the intermediate steps leading up to the input. It also creates interpolation of the baseline input to the input of interest and perform gradient calculation for all these intermediate inputs. Integration of gradients provides an importance of the input and whether it impacts the given output. Importance can also be calculated for a given layer of the model. 

Here’s a sample Python code for illustration purpose that explains the output of a Hugging Face transformer-based model with integrated gradients:

```python
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from captum.attr import IntegratedGradients
import torch

tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")
model = AutoModelForSequenceClassification.from_pretrained("bert-base-uncased")

ig = IntegratedGradients(model)

input_text = "This is a positive sentence."
input_ids = torch.tensor(tokenizer.encode(input_text)).unsqueeze(0)

baseline_ids = torch.zeros_like(input_ids)

attr = ig.attribute(inputs=input_ids,
                    baselines=baseline_ids)

print(attr)
```

In this example, we first import the necessary modules and create an instance of the IntegratedGradients class. We then load a pre-trained BERT based sequence classification model and tokenizer using the Hugging Face AutoTokenizer and AutoModelForSequenceClassification classes.

Next, input text is defined and converted to input IDs using the tokenizer. Baseline IDs are also defined as a tensor of zeros with the same shape as our input IDs.

Then, attribute() method of our IntegratedGradients instance is called with input and baseline IDs. The output of this method is an attribution tensor that represents the importance of each token in the input text for the output of the model.
