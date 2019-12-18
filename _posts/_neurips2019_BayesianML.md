# Trends
  * Representation and hierarchy
  * Gibbs sampling, Runge kutta
  * Reinforcement learning
  * Bayesian ML and approaximating GP
  * Local changes and Graph model
  * Wasserstein distance

# [Exact GP for a million data points](https://arxiv.org/pdf/1903.08114.pdf)

* Propose to use exact GP instead of approaximation
* Distribute computation by reducing training to an element-wise product between matrix and vector
* Speed up inference by caching covariance calculation of training points

# [Parameter elimination in particle Gibbs sampling](https://arxiv.org/pdf/1910.14145.pdf)
[code](https://github.com/uu-sml/birch-vector-borne-disease/tree/76288c12761293aeca9e8b452b0c678914848dae)
* Proposes particle Gibbs Sampling for inference
* Apply Gibbs sampling for Dengue outbreak prediction
* Model consists of parameters and states. It alternates inference between parameters and states
* Particle Gibbs with Ancestor Sampling (PGAS) selects an ancestor trajectory denoting 
* PGAS uses sequence Markov Chain for updating state
* Derive an analytical expression for estimating joint distribution of observation(y_t) and states (x_t) marginalizing on the previous states and observations (x_0:t-1, y_1:t-1)
* When marginalizing out the parameters, the resulting marginal particle Gibbs (mPG) sampler updates the state trajectory using marginalized cconditional sequential Markov Chain (mcSMC) and with the addition of conditioning on the reference trajectory surviving the resampling step. . In cSMC one particle trajectory, the reference trajectory x_0:T, will always survive the resampling step.
* Each ancestor trajectory in mPGAS is assigned a weight where w_t is the weight of the trajectory x_0:t-1
* Ancestors are sampled based on their weights
* Update parameters and Summation of statistics
* Algorithm 2 is the final algorithm
* Goal of the algorithm is reduce autocorrelation about hidden states

## Extension
* When not much is known about the parameters of a model, authors propose to use a diffuse prior to reflect the uncertainty.


# [Practical two step look ahead in Bayesian optimization](http://papers.nips.cc/paper/9174-practical-two-step-lookahead-bayesian-optimization.pdf)


# RL
# [From Complexity to Simplicity: Adaptive ES-Active Subspaces for Blackbox Optimization](http://papers.nips.cc/paper/9218-from-complexity-to-simplicity-adaptive-es-active-subspaces-for-blackbox-optimization.pdf)
* It leverages techniques from the emerging theory of active subspaces in a novel ES blackbox optimization context . 
* ASEBO learns the dynamically changing intrinsic dimensionality of the gradient space and adapts to the hardness of different stages of the optimization without external supervision.
* 

# Additional papers
* [On Exact Computation with an Infinitely Wide Neural Net](https://arxiv.org/pdf/1904.11955.pdf)
* [Weight Agnostic Neural Networks](https://arxiv.org/abs/1906.04358)
* [Kernel Instrumental Variable Regression (Causality)](https://arxiv.org/abs/1906.00232)

# Paper summary
* [Robinly's playlist](https://www.youtube.com/watch?v=FfrLrAudfEQ&list=PLM_Os_a1Hki8vaGeUdU997lDLELcfga9k)
