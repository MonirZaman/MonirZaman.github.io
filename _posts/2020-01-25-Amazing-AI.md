<script type="text/javascript" async
  src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/MathJax.js?config=TeX-MML-AM_CHTML">
</script>

## [Meta-Learning Representations for Continual Learning](https://arxiv.org/pdf/1905.12588.pdf)

``
Javed, Khurram, and Martha White. "Meta-learning representations for continual learning." Advances in Neural Information Processing Systems. 2019.
``

Authors propose to address catastrophic forgetting when learning multiple tasks. Tasks interfere with each other.
When such forgetting appear
1. Correlated inputs  
2. Dense input  
3. Global and greedy update

They propose to create task representation, called RLN. They propose a 
separate prediction model, called PLN. These two steps in combination constitute a learning model that is able to generalize over multiple tasks. RLN is fixed once representation is learned. Only PLN network is updated when continual learning starts.
![network](/images/rln-pln.png)

The authors train these two networks with the objective of reducing interference among tasks. They select a set of correlated samples and a set of random samples. Networks trained on the correlated samples should provide similar performance on the random subset of samples. Loss function measures the performance degrade on the random samples. 
![meta-learning-update](/images/meta-learning-update.png)

The image above shows one update in the meta learning. RLN is initialized with $$\theta_{1}$$ and PLN with $$W_{1}$$. Through gradient descend, PLN is updated k times where k is the number of samples. Then a random subset of samples are drawn and loss is calculated on the random subsets based on the network's prediction. Gradient descend is calculated on the initial parameters $$\theta_{1}$$ and $$W_{1}$$ which are then updated. Similar meta learning steps are repeated many times.

## [META-LEARNING ACQUISITION FUNCTIONS FOR TRANSFER LEARNING IN BAYESIAN OPTIMIZATION](https://arxiv.org/pdf/1904.02642.pdf)  
The authors address how to transfer learning from one meta-learning to the next meta-learning. If the meta-learning search can be biased in the right direction, it has the potential to save time. Authors have studied Bayesian optimization as the meta learning algorithm. Their proposal include:  
* Train a neural network on the dataset that consists of previous meta-learning outcomes
* Use Reinforcement learning to facilitate training of the neural network to approximate gradient of the black-box optimization function
* Use the neural network as the acquisition function to identify the next potential point to evaluate
![Meta-BO](/images/metaBO.png)

To review:  
* [Learning search spaces for Bayesian optimization:
Another view of hyperparameter transfer learning](https://papers.nips.cc/paper/9438-learning-search-spaces-for-bayesian-optimization-another-view-of-hyperparameter-transfer-learning.pdf)
  * [Video](https://www.youtube.com/watch?v=4G1dLuW8-kM)
  * [Related work in ICLR 2020](https://arxiv.org/pdf/1904.02642.pdf)

