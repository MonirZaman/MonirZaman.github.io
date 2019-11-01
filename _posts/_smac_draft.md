# Tutorial: Sequential model-based optimization for general algorithm configuration (SMAC)

```
Hutter, Frank, Holger H. Hoos, and Kevin Leyton-Brown. "Sequential model-based optimization for general algorithm configuration." International conference on learning and intelligent optimization. Springer, Berlin, Heidelberg, 2011.
```

Hyperparameter optimization can be defined as as follows: given an algorithm A (the target algorithm), a set (or distribution) of problem instances I and a cost metric c, find Hyperparameter settings of A that minimize c on I.  
It has following three steps  
[1]. It starts by running the target algorithm with some initial parameter configurations.   
[2]. Fitting a surrogate model / response surface model using the existing data.  
[3]. Selecting a list of promising configurations.  
[4]. Running the target algorithm on (some of) the selected configurations until a given time bound is reached. 

A core part of the SMAC algorithm is the intensify of a configuration. A summary of the intensify operations are given below:  
* Takes a set of promising configurations and incumbent configurations that were chosen before
* For each promising configuration, perform the following steps
 * Few random instances (few of the many multi-task learning problems) are randomly selected and incumbent configuration are run against these instances to increase confidence on the incumbent. Incumbent is the parameter configurations that were previously chosen
 
 * A new sets of problem instances are taken where the incumbent ran but promising config did not run. when we compare the empirical cost statistics of two parameter configurations across multiple instances, the variance in this comparison is lower if we use the same N instances to compute both estimates.
 * Run the promising configuration on the sampled problem instances for the target algorithm
 * When promising configurations ran as many rounds as the incumbent and still as good as the incumbent, then it becomes the incumbent.


* Applies Random Forest as acquisition function with runtime as objective 
* Use computation graph feature such as mean, number of nodes, etc as features
* Use Sample size, number of configurations 
* Apply all these features through RF model and predict runtime

* Calculate Expected improvement over all the past configurations
* Take top 10 configurations
* Perform a local search of these 10 configuration
  * Change one categorical hyperparameter
  * Scale numerical hyperparameter so that they are [0, 1]
  * Change value of numerical hyperparameter to 4 neighbors
  * Predict EI for each of these hyperparameter configurations without evaluating the model 
    and using acquisition function
  
# Multifidelity Bayesian optimization

* to read: Practical Multi-fidelity Bayesian Optimization for Hyperparameter Tuning
* A tutorial on Bayesian optimization
* These approaches commonly uses a knowledge gradients. They take a step along the direction of the gradient and obtain a point. Then the optimization performs simulation using the point to get an expected improvement over next candidate points and choose the point the maximum expected improvement.
* Algorithm steps:  
 * Compute gradient descent for a given number of steps
  * Take a step along the gradient. 
 * Take the final X
 * Estimate knowledge gradient on X using simulation by the following steps:
   * Repeat for J iterations and average knowledge gradients
   * Sample an observation
   * Calculate improvement by observing the sample (u_{n+1}-u_{n})
    * (An equivalent function is mixture of weights calculation)
   * Average all J improvements and return knowledge gradient
   
 * Repeat the above steps of finding knowledge gradient for a given number of starts.
 * Return X with the maximum knowledge gradient
 
 # [BOHB: Robust and Efficient Hyperparameter Optimization at Scale](https://arxiv.org/pdf/1807.01774.pdf)
 
 * We follow HB’s way of choosing the budgets and continue
to use SH
 * In early stages, it uses Hyperband to find configurations with a small budget to that are very soon promising configurations
 * It also uses uses the Bayesian optimizer predictive power to propose potential good configurations close to the found best configs
 * A single multidimensional KDE is used
 * A minimum number of data point is required n = num of hyperparameters + 1
 * BOHB always uses the model for the largest budget for which enough observations are
available.
 * we also sample a constant fraction ρ of the configurations uniformly
at random (line 1).  
 * We start with the first SH run that sequential HB would perform
(the most aggressive one, starting from the lowest budget)
 *  observations and the resulting models are shared across all SH runs.  
 
