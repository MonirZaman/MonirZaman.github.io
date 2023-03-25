In this post I will explain Integrated Gradient, a popular technique to explain black box type machine learning model. 

Integrated Gradients is an axiomatic model interpretability algorithm that assigns an importance score to each input feature by approximating the integral of gradients of the model’s output with respect to the inputs along the path (straight line) from given baselines / references to inputs1. It computes the gradient of the model’s prediction output to its input features and requires no modification to the original deep neural network. It can be applied to any differentiable model like image, text, or structured data2.

In other words, Integrated Gradients is a way to make a classification model interpretable. A baseline is defined which has no effect on the classification result. Then, in a few steps, interpolations are given to the model and the gradient is used to determine what influence the individual inputs have on the result
